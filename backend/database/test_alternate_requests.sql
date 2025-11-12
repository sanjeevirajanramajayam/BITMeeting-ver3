-- Test script for alternate requests feature

-- 1. Check if table exists
SHOW TABLES LIKE 'meeting_alternate_requests';

-- 2. Check table structure
DESCRIBE meeting_alternate_requests;

-- 3. Check if there are any records
SELECT COUNT(*) as total_requests FROM meeting_alternate_requests;

-- 4. View all requests
SELECT 
    ar.*,
    m.meeting_name as meeting_title,
    requesting_user.name as requesting_user,
    alternate_user.name as alternate_user
FROM meeting_alternate_requests ar
LEFT JOIN meeting m ON ar.meeting_id = m.id
LEFT JOIN users requesting_user ON ar.requesting_user_id = requesting_user.id
LEFT JOIN users alternate_user ON ar.alternate_user_id = alternate_user.id
ORDER BY ar.request_date DESC;

-- 5. Check pending requests for a specific user (replace USER_ID with actual user ID)
-- SELECT 
--     ar.*,
--     m.meeting_name as meeting_title
-- FROM meeting_alternate_requests ar
-- JOIN meeting m ON ar.meeting_id = m.id
-- WHERE ar.alternate_user_id = USER_ID
-- AND ar.status = 'pending';

-- 6. Verify users table
SELECT id, name, email FROM users LIMIT 5;

-- 7. Verify meetings table
SELECT id, meeting_name, created_by FROM meeting LIMIT 5;
