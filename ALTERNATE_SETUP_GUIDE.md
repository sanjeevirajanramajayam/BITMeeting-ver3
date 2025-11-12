# Quick Setup Guide - Alternate Attendance Feature

## 🚀 Quick Start (5 minutes)

### Step 1: Apply Database Schema
Open your MySQL client or terminal and run:

```bash
cd backend/database
mysql -u your_username -p your_database_name < alternate_requests_schema.sql
```

Or manually run in MySQL Workbench:
```sql
-- Copy and paste the content of alternate_requests_schema.sql
```

### Step 2: Verify Backend Routes
No action needed! The backend routes and controllers are already added to:
- ✅ `backend/controllers/meetingController.js`
- ✅ `backend/routes/meetingRoutes.js`

### Step 3: Test the Feature

#### For Regular Users (Requesting Alternate):
1. Navigate to a meeting in your dashboard
2. Click the "Reject" button
3. Select "Request Alternate - Suggest someone to attend in my place"
4. Choose a person from the dropdown
5. Provide a reason and submit

#### For Alternate Users (Responding):
1. Add the `AlternateRequestNotification` component to your Dashboard:

```jsx
// In src/pages/Dashboard.jsx
import AlternateRequestNotification from '../components/AlternateRequestNotification';

// Add in your dashboard layout
<AlternateRequestNotification />
```

2. You'll see pending requests and can Accept/Decline them

#### For Admins (Approving Alternates):
1. Add the `AlternateApprovalAdmin` component to your meeting admin view:

```jsx
// In your meeting preview/admin component
import AlternateApprovalAdmin from '../components/AlternateApprovalAdmin';

// Add conditionally for admins
{isAdmin && <AlternateApprovalAdmin meetingId={meetingId} />}
```

2. You'll see pending approvals after alternates accept

## 📁 Files Created/Modified

### New Files:
- ✅ `backend/database/alternate_requests_schema.sql` - Database schema
- ✅ `src/components/AlternateRequestNotification.jsx` - For alternate users
- ✅ `src/components/AlternateApprovalAdmin.jsx` - For admin approval
- ✅ `ALTERNATE_ATTENDANCE_FEATURE.md` - Complete documentation

### Modified Files:
- ✅ `backend/controllers/meetingController.js` - Added 5 new functions
- ✅ `backend/routes/meetingRoutes.js` - Added 5 new routes
- ✅ `src/components/MeetingRejection.jsx` - Added alternate selection
- ✅ `src/pages/Joinmeet.jsx` - Passed meetingMembers prop

## 🧪 Quick Test

### Test Flow:
```
User A (Admin) creates meeting with User B and User C
    ↓
User B opens meeting → Rejects → Selects alternate (User C)
    ↓
User C sees notification → Accepts
    ↓
User A sees pending approval → Approves
    ↓
User C is now in the meeting!
```

### API Test with cURL:
```bash
# 1. Create alternate request
curl -X POST http://localhost:5000/api/meetings/alternate-request/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meetingId": 1, "alternateUserId": 2, "reason": "Test"}'

# 2. Get pending requests
curl -X GET http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Respond to request
curl -X POST http://localhost:5000/api/meetings/alternate-request/respond \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1, "response": "accept"}'

# 4. Admin approve
curl -X POST http://localhost:5000/api/meetings/alternate-request/admin-approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": 1, "decision": "approve", "adminRemarks": "Approved"}'
```

## ⚠️ Common Issues

### Issue: "Table doesn't exist"
**Solution:** Run the SQL migration script

### Issue: "Cannot find module AlternateRequestNotification"
**Solution:** The component files are created, just import them properly

### Issue: "User not authorized"
**Solution:** Make sure JWT token is valid and user is logged in

### Issue: Alternate not showing in dropdown
**Solution:** Make sure the user is a member of the meeting

## 📊 Database Verification

Check if table was created:
```sql
SHOW TABLES LIKE 'meeting_alternate_requests';

-- View structure
DESCRIBE meeting_alternate_requests;

-- Check data
SELECT * FROM meeting_alternate_requests;
```

## 🎯 Success Checklist

- [ ] Database table created successfully
- [ ] Backend server starts without errors
- [ ] Can create alternate request from rejection modal
- [ ] Alternate user sees notification
- [ ] Alternate can accept/reject request
- [ ] Admin sees pending approvals
- [ ] Admin can approve/reject
- [ ] Approved alternate is added to meeting members

## 🔗 Related Documentation

- Full documentation: `ALTERNATE_ATTENDANCE_FEATURE.md`
- API endpoints: See "Backend API Endpoints" section in main doc
- Workflow diagram: See "Workflow Diagram" in main doc

## 💡 Next Steps

1. **Integrate into Dashboard:** Add `AlternateRequestNotification` component
2. **Add Admin Panel:** Add `AlternateApprovalAdmin` to meeting views
3. **Test Thoroughly:** Follow the test scenarios
4. **Customize UI:** Adjust styling to match your theme
5. **Add Notifications:** Consider adding email/push notifications

## 🆘 Need Help?

- Check the full documentation: `ALTERNATE_ATTENDANCE_FEATURE.md`
- Review the API endpoints and responses
- Test with the provided cURL commands
- Verify database schema is correctly applied

---

**Setup Time:** ~5 minutes  
**Difficulty:** Easy  
**Requirements:** MySQL, Node.js, React
