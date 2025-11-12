# Fix Duplicate Members Issue

## Problem
Users appearing multiple times in the member list (e.g., "Test" appearing twice in Role 1).

## Root Cause
- The `meeting_members` table lacks a UNIQUE constraint on `(meeting_id, user_id, role)`
- Backend code was inserting duplicate entries without checking if member already exists
- In alternate approval, the same member was being inserted twice (duplicate code)

## Solution Applied

### 1. Backend Code Fixed ✅
- Updated all INSERT statements to use `ON DUPLICATE KEY UPDATE`
- Removed duplicate INSERT in alternate approval function
- Files changed:
  - `backend/controllers/meetingController.js`
  - `src/components/MeetingRejection.jsx`

### 2. Database Migration Required

**Run this SQL script in your MySQL database:**

```sql
-- Fix Duplicate Members Migration
-- File: backend/database/fix_duplicate_members.sql

-- Step 1: Check existing duplicates
SELECT meeting_id, user_id, role, COUNT(*) as count
FROM meeting_members
GROUP BY meeting_id, user_id, role
HAVING count > 1;

-- Step 2: Remove duplicates (keep only first occurrence)
DELETE mm1 FROM meeting_members mm1
INNER JOIN meeting_members mm2 
WHERE 
    mm1.id > mm2.id AND
    mm1.meeting_id = mm2.meeting_id AND
    mm1.user_id = mm2.user_id AND
    mm1.role = mm2.role;

-- Step 3: Add unique constraint
ALTER TABLE meeting_members
ADD UNIQUE KEY unique_member_role (meeting_id, user_id, role);

-- Step 4: Verify (should return 0 rows)
SELECT meeting_id, user_id, role, COUNT(*) as count
FROM meeting_members
GROUP BY meeting_id, user_id, role
HAVING count > 1;
```

## How to Apply the Fix

### Option 1: Using MySQL Workbench or phpMyAdmin
1. Open your database tool
2. Select your database
3. Copy and paste the SQL from `backend/database/fix_duplicate_members.sql`
4. Execute the script

### Option 2: Using MySQL Command Line
```bash
cd backend/database
mysql -u your_username -p your_database_name < fix_duplicate_members.sql
```

### Option 3: Manual execution
```bash
mysql -u root -p
USE your_database_name;

-- Then paste each SQL statement one by one
```

## Verification

After running the migration:

1. **Check for duplicates:**
```sql
SELECT meeting_id, user_id, role, COUNT(*) as count
FROM meeting_members
GROUP BY meeting_id, user_id, role
HAVING count > 1;
```
Should return 0 rows.

2. **Test adding a member:**
- Try to manually insert a duplicate:
```sql
INSERT INTO meeting_members (meeting_id, user_id, role) VALUES (1, 2, 'Role 1');
INSERT INTO meeting_members (meeting_id, user_id, role) VALUES (1, 2, 'Role 1');
-- Second insert should be ignored or update existing record
```

3. **In the application:**
- Create a new meeting
- Add "Test" user to Role 1
- Try to add "Test" again to Role 1
- "Test" should appear only once

## What Changed

### Before:
- Same user could be added multiple times to same meeting with same role
- No database constraint to prevent duplicates
- Backend inserted without checking existing members

### After:
- ✅ Unique constraint prevents database-level duplicates
- ✅ `ON DUPLICATE KEY UPDATE` in backend prevents duplicate inserts
- ✅ Frontend deduplication for display (already applied)
- ✅ Removed duplicate INSERT code in alternate approval

## Impact
- ✅ Existing duplicates will be cleaned up by migration
- ✅ Future duplicate inserts will be prevented
- ✅ Members will appear only once per role
- ✅ No impact on existing functionality

## Rollback (if needed)
```sql
-- Remove the unique constraint if needed
ALTER TABLE meeting_members
DROP INDEX unique_member_role;
```

## Notes
- The migration is **safe** - it only removes exact duplicates
- It keeps the first occurrence of each duplicate (lowest ID)
- The unique constraint is on (meeting_id, user_id, role), so:
  - Same user CAN be in different roles (e.g., "Test" in Role 1 and Role 2) ✅
  - Same user CANNOT be in the same role twice ❌
