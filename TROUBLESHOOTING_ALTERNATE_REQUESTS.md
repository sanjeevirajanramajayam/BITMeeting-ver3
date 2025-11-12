# Troubleshooting: Alternate Requests Not Showing

## Issue
When a user with an alternate request logs in, they see "nothing" (no notifications or requests).

## Debugging Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and look at the Console tab. You should see:
```
Fetching alternate requests...
Alternate requests response: {...}
Found requests: [...]
```

### 2. Check Backend Logs
In your terminal where the backend is running, you should see:
```
getAlternateRequests called: { userId: X, meetingId: undefined, status: 'pending' }
Executing query: SELECT...
Found requests: X
```

### 3. Verify Database Table Exists
Run this in your MySQL client:
```sql
SHOW TABLES LIKE 'meeting_alternate_requests';
```

If it returns empty, you need to run the schema migration:
```bash
cd backend/database
mysql -u your_username -p your_database < alternate_requests_schema.sql
```

### 4. Check if Requests Exist in Database
```sql
SELECT * FROM meeting_alternate_requests;
```

If empty, no requests have been created yet.

### 5. Check if Request Was Created Successfully
After someone rejects a meeting and selects an alternate, check:
```sql
SELECT 
    ar.*,
    m.title as meeting_title,
    requesting.name as requesting_user,
    alternate.name as alternate_user
FROM meeting_alternate_requests ar
JOIN meeting m ON ar.meeting_id = m.id
JOIN users requesting ON ar.requesting_user_id = requesting.id
JOIN users alternate ON ar.alternate_user_id = alternate.id
ORDER BY ar.request_date DESC
LIMIT 5;
```

### 6. Verify User ID Matching
Check if the logged-in user's ID matches the `alternate_user_id`:
```sql
-- First, get the current user's ID from the token
-- Then check:
SELECT * FROM meeting_alternate_requests 
WHERE alternate_user_id = YOUR_USER_ID 
AND status = 'pending';
```

### 7. Test the API Directly
Use this cURL command (replace YOUR_TOKEN with actual token):
```bash
curl -X GET "http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "count": X
}
```

## Common Issues & Solutions

### Issue 1: Table Doesn't Exist
**Symptom:** Error: `Table 'meeting_alternate_requests' doesn't exist`

**Solution:**
```bash
cd backend/database
mysql -u root -p your_database_name < alternate_requests_schema.sql
```

### Issue 2: No Requests in Database
**Symptom:** Console shows `Found requests: 0` or `requests.length === 0`

**Solution:** 
1. Create a test request by:
   - Login as User A
   - Go to a meeting
   - Click Reject
   - Select "Request Alternate"
   - Choose User B
   - Submit

2. Verify in database:
```sql
SELECT * FROM meeting_alternate_requests;
```

### Issue 3: Wrong User ID
**Symptom:** Requests exist but user doesn't see them

**Solution:** Check if the `alternate_user_id` matches the logged-in user:
```sql
-- Get user from token
-- Check:
SELECT * FROM meeting_alternate_requests 
WHERE alternate_user_id = LOGGED_IN_USER_ID;
```

### Issue 4: Status Mismatch
**Symptom:** Requests exist but with wrong status

**Solution:** Check request status:
```sql
SELECT id, status, alternate_user_id 
FROM meeting_alternate_requests;
```

If status is not 'pending', the request won't show. Valid statuses:
- `pending` - Waiting for alternate's response
- `alternate_accepted` - Alternate accepted, waiting for admin
- `alternate_rejected` - Alternate declined
- `admin_approved` - Admin approved
- `admin_rejected` - Admin rejected

### Issue 5: API Endpoint Not Found
**Symptom:** 404 error in console

**Solution:** 
1. Verify backend route is registered in `backend/routes/meetingRoutes.js`:
```javascript
router.get('/alternate-request/my-requests', verifyToken, getAlternateRequests)
```

2. Restart backend server:
```bash
cd backend
npm start
```

### Issue 6: Authentication Issue
**Symptom:** 401 Unauthorized error

**Solution:**
1. Check if token exists:
```javascript
console.log('Token:', localStorage.getItem('token'));
```

2. If null, user needs to log in again

3. Check if token is valid (not expired)

## Test Workflow

### Complete Test:
1. **User A (Requester):**
   - Login
   - Go to meeting
   - Click "Reject"
   - Select "Request Alternate"
   - Choose User B
   - Enter reason
   - Submit
   - Check console for success message
   - Check database: `SELECT * FROM meeting_alternate_requests;`

2. **User B (Alternate):**
   - Login
   - Go to Dashboard
   - Should see "Alternate Attendance Requests" section
   - If not visible, check browser console
   - If no logs, component isn't rendering
   - Check database: `SELECT * FROM meeting_alternate_requests WHERE alternate_user_id = USER_B_ID;`

3. **Database Verification:**
```sql
SELECT 
    ar.id,
    ar.status,
    m.title as meeting,
    req.name as requester,
    alt.name as alternate
FROM meeting_alternate_requests ar
JOIN meeting m ON ar.meeting_id = m.id
JOIN users req ON ar.requesting_user_id = req.id
JOIN users alt ON ar.alternate_user_id = alt.id;
```

## Quick Diagnostic Checklist

- [ ] Database table `meeting_alternate_requests` exists
- [ ] Backend route is registered
- [ ] Backend server is running without errors
- [ ] Frontend component is imported in Dashboard
- [ ] User is logged in (token exists)
- [ ] Request was created successfully (check database)
- [ ] Request status is 'pending'
- [ ] Logged-in user ID matches `alternate_user_id`
- [ ] Browser console shows API call being made
- [ ] Backend console shows request being processed
- [ ] No CORS errors in browser console
- [ ] No 404/401/500 errors

## Still Not Working?

1. **Clear browser cache and localStorage:**
```javascript
localStorage.clear();
// Then login again
```

2. **Restart backend server:**
```bash
cd backend
npm start
```

3. **Check all console logs** (both frontend and backend)

4. **Use the test SQL script:**
```bash
mysql -u root -p your_database < backend/database/test_alternate_requests.sql
```

5. **Verify with cURL** to isolate frontend vs backend issues

## Contact Support
If issue persists after all checks:
1. Provide console logs (both frontend and backend)
2. Provide database query results
3. Provide cURL response
4. Describe exact steps taken
