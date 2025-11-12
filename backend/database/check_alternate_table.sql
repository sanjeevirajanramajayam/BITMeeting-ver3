-- Quick diagnostic for alternate requests table

-- 1. Check if table exists
SHOW TABLES LIKE 'meeting_alternate_requests';

-- 2. Show table structure
DESCRIBE meeting_alternate_requests;

-- 3. Count total requests
SELECT COUNT(*) as total_requests FROM meeting_alternate_requests;

-- 4. Show all requests with details
SELECT 
    ar.id,
    ar.meeting_id,
    ar.requesting_user_id,
    ar.alternate_user_id,
    ar.status,
    ar.request_date,
    m.meeting_name as meeting_title,
    req.name as requester_name,
    alt.name as alternate_name
FROM meeting_alternate_requests ar
LEFT JOIN meeting m ON ar.meeting_id = m.id
LEFT JOIN users req ON ar.requesting_user_id = req.id
LEFT JOIN users alt ON ar.alternate_user_id = alt.id
ORDER BY ar.request_date DESC;

-- 5. Show pending requests only
SELECT 
    ar.id,
    ar.status,
    ar.alternate_user_id,
    alt.name as alternate_name,
    alt.email as alternate_email
FROM meeting_alternate_requests ar
LEFT JOIN users alt ON ar.alternate_user_id = alt.id
WHERE ar.status = 'pending';
