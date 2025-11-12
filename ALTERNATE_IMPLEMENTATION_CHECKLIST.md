# ✅ Alternate Attendance Feature - Implementation Checklist

Use this checklist to ensure the feature is properly implemented and tested.

## 📋 Pre-Implementation Checklist

- [ ] Backup your database before applying schema changes
- [ ] Ensure backend server is stopped before making changes
- [ ] Ensure you have MySQL access credentials
- [ ] Node.js and npm are properly installed
- [ ] React app dependencies are up to date

## 🗄️ Database Setup

- [ ] Navigate to `backend/database/` directory
- [ ] Open `alternate_requests_schema.sql` file
- [ ] Connect to your MySQL database
- [ ] Run the schema migration:
  ```bash
  mysql -u your_username -p your_database < alternate_requests_schema.sql
  ```
- [ ] Verify table creation:
  ```sql
  SHOW TABLES LIKE 'meeting_alternate_requests';
  DESCRIBE meeting_alternate_requests;
  ```
- [ ] Confirm all columns are present (id, meeting_id, requesting_user_id, alternate_user_id, reason, status, etc.)
- [ ] Verify foreign key constraints are created
- [ ] Check indexes are created

## 🔧 Backend Verification

- [ ] Open `backend/controllers/meetingController.js`
- [ ] Verify these functions exist:
  - [ ] `createAlternateRequest`
  - [ ] `respondToAlternateRequest`
  - [ ] `getAlternateRequests`
  - [ ] `getAlternateRequestsForAdmin`
  - [ ] `adminApproveAlternate`
- [ ] Open `backend/routes/meetingRoutes.js`
- [ ] Verify these routes are registered:
  - [ ] `POST /alternate-request/create`
  - [ ] `POST /alternate-request/respond`
  - [ ] `GET /alternate-request/my-requests`
  - [ ] `GET /alternate-request/admin/:meetingId`
  - [ ] `POST /alternate-request/admin-approve`
- [ ] Restart backend server:
  ```bash
  cd backend
  npm start
  ```
- [ ] Check console for any startup errors
- [ ] Verify server is running on expected port (usually 5000)

## 🎨 Frontend Files Verification

- [ ] Verify `src/components/MeetingRejection.jsx` has been updated
- [ ] Check for import of `Autocomplete`, `RadioGroup`, `FormControlLabel`, `Radio`
- [ ] Verify rejection type state and alternate selection logic exists
- [ ] Confirm `src/components/AlternateRequestNotification.jsx` exists
- [ ] Confirm `src/components/AlternateApprovalAdmin.jsx` exists
- [ ] Confirm `src/components/AlternateNotificationBadge.jsx` exists
- [ ] Check `src/pages/Joinmeet.jsx` passes `meetingMembers` prop

## 🔌 API Testing

Test each endpoint using cURL or Postman:

### 1. Create Alternate Request
- [ ] Endpoint responds (not 404)
- [ ] Returns success when valid data provided
- [ ] Returns error when unauthorized
- [ ] Returns error when user not in meeting
- [ ] Returns error when alternate user invalid
- [ ] Creates record in database

Test Command:
```bash
curl -X POST http://localhost:5000/api/meetings/alternate-request/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meetingId": 1, "alternateUserId": 2, "reason": "Test reason"}'
```

### 2. Get Alternate Requests
- [ ] Endpoint responds
- [ ] Returns empty array when no requests
- [ ] Returns pending requests correctly
- [ ] Filters by status parameter
- [ ] Includes meeting and user details

Test Command:
```bash
curl -X GET "http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Respond to Request
- [ ] Endpoint responds
- [ ] Accepts "accept" response
- [ ] Accepts "reject" response
- [ ] Updates status correctly
- [ ] Returns error for invalid request ID
- [ ] Returns error if not the alternate user

Test Command:
```bash
curl -X POST http://localhost:5000/api/meetings/alternate-request/respond \
  -H "Authorization: Bearer ALTERNATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1, "response": "accept"}'
```

### 4. Admin Get Requests
- [ ] Endpoint responds
- [ ] Returns only accepted requests
- [ ] Returns error if not meeting creator
- [ ] Includes requester and alternate details
- [ ] Shows role information

Test Command:
```bash
curl -X GET http://localhost:5000/api/meetings/alternate-request/admin/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 5. Admin Approve
- [ ] Endpoint responds
- [ ] Accepts "approve" decision
- [ ] Accepts "reject" decision
- [ ] Updates status correctly
- [ ] Adds alternate to meeting_members (on approve)
- [ ] Returns error if not admin

Test Command:
```bash
curl -X POST http://localhost:5000/api/meetings/alternate-request/admin-approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1, "decision": "approve", "adminRemarks": "Approved"}'
```

## 🖥️ UI Component Testing

### MeetingRejection Component
- [ ] Modal opens when clicking "Reject" button
- [ ] Radio buttons for rejection type are visible
- [ ] Can toggle between simple rejection and alternate request
- [ ] Alternate selection dropdown appears when "Request Alternate" selected
- [ ] Dropdown is populated with meeting members
- [ ] Current user is filtered out from dropdown
- [ ] Can search/filter members in dropdown
- [ ] Reason text field accepts input
- [ ] Info alert is displayed
- [ ] Cancel button closes modal
- [ ] Submit button works
- [ ] Shows success message after submission
- [ ] Loading state works during API call

### AlternateRequestNotification Component
- [ ] Component renders without errors
- [ ] Shows loading spinner initially
- [ ] Shows "No pending requests" when empty
- [ ] Displays request cards when data available
- [ ] Meeting title and date are visible
- [ ] Requester name and email are visible
- [ ] Reason text is displayed
- [ ] Accept button works
- [ ] Decline button works
- [ ] Loading state during button click
- [ ] List refreshes after action
- [ ] Success message shown after action

### AlternateApprovalAdmin Component
- [ ] Component renders for admin users
- [ ] Shows loading spinner initially
- [ ] Shows "No pending" message when empty
- [ ] Displays approval cards when data available
- [ ] Shows original member info
- [ ] Shows proposed alternate info
- [ ] Shows role information
- [ ] Reason is displayed
- [ ] Approve button works
- [ ] Reject button works
- [ ] Confirmation dialog opens
- [ ] Admin remarks field accepts input
- [ ] Confirm button processes request
- [ ] Success message shown after approval
- [ ] List refreshes after action

### AlternateNotificationBadge Component
- [ ] Badge appears in navigation
- [ ] Shows correct count of pending requests
- [ ] Badge updates automatically (polling)
- [ ] Dropdown opens on click
- [ ] Shows preview of requests in dropdown
- [ ] "View all" link works if more than 3
- [ ] Clicking request navigates to details

## 🔄 End-to-End Workflow Test

### Test Scenario 1: Complete Success Flow
- [ ] **Setup:** Create meeting with User A (admin), User B, User C
- [ ] **Step 1:** Login as User B
- [ ] **Step 2:** Open meeting invitation
- [ ] **Step 3:** Click "Reject" button
- [ ] **Step 4:** Select "Request Alternate" option
- [ ] **Step 5:** Select User C from dropdown
- [ ] **Step 6:** Enter reason: "Family emergency"
- [ ] **Step 7:** Submit request
- [ ] **Step 8:** Verify success message
- [ ] **Step 9:** Check database - status should be "pending"
- [ ] **Step 10:** Login as User C
- [ ] **Step 11:** See notification badge with count = 1
- [ ] **Step 12:** Open alternate requests page
- [ ] **Step 13:** See request from User B
- [ ] **Step 14:** Click "Accept"
- [ ] **Step 15:** Verify success message
- [ ] **Step 16:** Check database - status should be "alternate_accepted"
- [ ] **Step 17:** Login as User A (admin)
- [ ] **Step 18:** Open meeting admin panel
- [ ] **Step 19:** See pending alternate approval
- [ ] **Step 20:** Click "Approve"
- [ ] **Step 21:** Add admin remarks: "Approved"
- [ ] **Step 22:** Confirm approval
- [ ] **Step 23:** Verify success message
- [ ] **Step 24:** Check database - status should be "admin_approved"
- [ ] **Step 25:** Verify User C is added to meeting_members table
- [ ] **Step 26:** Verify User C has same role as User B

### Test Scenario 2: Alternate Rejects
- [ ] **Setup:** Create meeting with User A (admin), User B, User D
- [ ] **Step 1:** User B requests User D as alternate
- [ ] **Step 2:** User D sees notification
- [ ] **Step 3:** User D clicks "Decline"
- [ ] **Step 4:** Verify success message
- [ ] **Step 5:** Check database - status should be "alternate_rejected"
- [ ] **Step 6:** Admin should NOT see this in pending approvals
- [ ] **Step 7:** User D should NOT be added to meeting

### Test Scenario 3: Admin Rejects
- [ ] **Setup:** Create meeting with User A (admin), User B, User E
- [ ] **Step 1:** User B requests User E as alternate
- [ ] **Step 2:** User E accepts
- [ ] **Step 3:** Admin sees pending approval
- [ ] **Step 4:** Admin clicks "Reject"
- [ ] **Step 5:** Admin adds remarks: "Not qualified"
- [ ] **Step 6:** Admin confirms rejection
- [ ] **Step 7:** Verify success message
- [ ] **Step 8:** Check database - status should be "admin_rejected"
- [ ] **Step 9:** User E should NOT be added to meeting

## 🔒 Security Testing

- [ ] Cannot create request without authentication
- [ ] Cannot create request for other users
- [ ] Cannot respond to request meant for someone else
- [ ] Cannot view admin panel without being meeting creator
- [ ] Cannot approve/reject without being admin
- [ ] SQL injection attempts are prevented
- [ ] Invalid status transitions are blocked
- [ ] XSS attempts in text fields are sanitized

## 🐛 Error Handling Testing

- [ ] Missing required fields show appropriate error
- [ ] Invalid meeting ID shows error
- [ ] Invalid user ID shows error
- [ ] Duplicate requests are prevented
- [ ] Network errors are handled gracefully
- [ ] Backend errors show user-friendly messages
- [ ] Loading states prevent double submissions

## 📱 UI/UX Testing

- [ ] All text is readable and properly formatted
- [ ] Buttons have appropriate colors
- [ ] Loading spinners are visible
- [ ] Success messages are clear
- [ ] Error messages are helpful
- [ ] Modal dialogs close properly
- [ ] No UI elements overflow
- [ ] Responsive design works on different screen sizes
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader friendly

## 📊 Database Verification

After running tests, verify database state:

```sql
-- Check all requests
SELECT * FROM meeting_alternate_requests;

-- Check status distribution
SELECT status, COUNT(*) FROM meeting_alternate_requests GROUP BY status;

-- Check pending admin approvals
SELECT * FROM meeting_alternate_requests WHERE status = 'alternate_accepted';

-- Verify alternates were added to meetings
SELECT mm.*, u.name, u.email 
FROM meeting_members mm 
JOIN users u ON mm.user_id = u.id 
WHERE mm.meeting_id = YOUR_TEST_MEETING_ID;
```

- [ ] Records are created correctly
- [ ] Status updates are working
- [ ] Foreign keys are enforced
- [ ] Timestamps are recorded
- [ ] Meeting members are added on approval

## 📝 Documentation Review

- [ ] Read `ALTERNATE_FEATURE_SUMMARY.md`
- [ ] Read `ALTERNATE_SETUP_GUIDE.md`
- [ ] Read `ALTERNATE_ATTENDANCE_FEATURE.md`
- [ ] Read `ALTERNATE_VISUAL_GUIDE.md`
- [ ] Understand the complete workflow
- [ ] Know how to troubleshoot common issues

## 🚀 Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] No compilation warnings
- [ ] Database migration documented
- [ ] Environment variables updated (if needed)
- [ ] Backup strategy in place
- [ ] Rollback plan prepared
- [ ] Team trained on new feature
- [ ] User documentation created
- [ ] Support team notified

## ✅ Sign-Off

- [ ] Database Administrator: _________________ Date: _______
- [ ] Backend Developer: _________________ Date: _______
- [ ] Frontend Developer: _________________ Date: _______
- [ ] QA Tester: _________________ Date: _______
- [ ] Project Manager: _________________ Date: _______

## 📞 Support Contacts

If you encounter issues:
1. Check the troubleshooting section in `ALTERNATE_SETUP_GUIDE.md`
2. Review console logs (browser and server)
3. Verify database state with provided SQL queries
4. Check network requests in browser DevTools
5. Contact development team

---

**Checklist Version:** 1.0  
**Last Updated:** November 2025  
**Total Items:** 150+  
**Estimated Time:** 2-3 hours for complete verification
