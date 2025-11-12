-- Migration to add unique constraint and remove duplicate meeting members
-- Run this script to prevent duplicate members in meetings

-- Step 1: First, let's see if there are any duplicates
SELECT meeting_id, user_id, role, COUNT(*) as count
FROM meeting_members
GROUP BY meeting_id, user_id, role
HAVING count > 1;

-- Step 2: Remove duplicates, keeping only the first occurrence (lowest id)
DELETE mm1 FROM meeting_members mm1
INNER JOIN meeting_members mm2 
WHERE 
    mm1.id > mm2.id AND
    mm1.meeting_id = mm2.meeting_id AND
    mm1.user_id = mm2.user_id AND
    mm1.role = mm2.role;

-- Step 3: Add unique constraint to prevent future duplicates
ALTER TABLE meeting_members
ADD UNIQUE KEY unique_member_role (meeting_id, user_id, role);

-- Verify: Check if any duplicates remain (should return no rows)
SELECT meeting_id, user_id, role, COUNT(*) as count
FROM meeting_members
GROUP BY meeting_id, user_id, role
HAVING count > 1;
