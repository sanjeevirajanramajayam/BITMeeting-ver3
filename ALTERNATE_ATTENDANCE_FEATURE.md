# Alternate Attendance Request Feature

## Overview
This feature allows meeting members who cannot attend a meeting to nominate an alternate person to attend in their place. The process involves three stages:
1. **User Request**: Original member selects an alternate and provides a reason
2. **Alternate Acceptance**: Nominated person accepts or declines the request
3. **Admin Approval**: Meeting creator gives final approval

## Database Schema

### Table: `meeting_alternate_requests`

Run the migration script located at:
```
backend/database/alternate_requests_schema.sql
```

To apply the schema:
```bash
mysql -u your_username -p your_database < backend/database/alternate_requests_schema.sql
```

**Table Structure:**
- `id` - Primary key
- `meeting_id` - Foreign key to meeting table
- `requesting_user_id` - User who cannot attend
- `alternate_user_id` - User nominated as alternate
- `reason` - Reason for requesting alternate
- `status` - Enum: 'pending', 'alternate_accepted', 'alternate_rejected', 'admin_approved', 'admin_rejected'
- `request_date` - When request was created
- `alternate_response_date` - When alternate responded
- `admin_response_date` - When admin responded
- `admin_remarks` - Admin's comments

## Backend API Endpoints

### 1. Create Alternate Request
**POST** `/api/meetings/alternate-request/create`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "meetingId": 123,
  "alternateUserId": 456,
  "reason": "I have a conflicting appointment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alternate request created successfully",
  "requestId": 789
}
```

### 2. Respond to Alternate Request (by nominated person)
**POST** `/api/meetings/alternate-request/respond`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "requestId": 789,
  "response": "accept"  // or "reject"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alternate request accepted successfully"
}
```

### 3. Get My Alternate Requests
**GET** `/api/meetings/alternate-request/my-requests?status=pending`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "meeting_id": 123,
      "meeting_title": "Board of Studies Meeting",
      "meeting_date": "2025-11-15T10:00:00Z",
      "requesting_user_name": "John Doe",
      "requesting_user_email": "john@example.com",
      "reason": "I have a conflicting appointment",
      "status": "pending"
    }
  ]
}
```

### 4. Get Alternate Requests for Admin Approval
**GET** `/api/meetings/alternate-request/admin/:meetingId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "requesting_user_name": "John Doe",
      "requesting_user_role": "Chairman",
      "alternate_user_name": "Jane Smith",
      "alternate_user_email": "jane@example.com",
      "reason": "I have a conflicting appointment",
      "status": "alternate_accepted"
    }
  ]
}
```

### 5. Admin Approve/Reject Alternate
**POST** `/api/meetings/alternate-request/admin-approve`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "requestId": 789,
  "decision": "approve",  // or "reject"
  "adminRemarks": "Approved. Jane will attend as Chairman."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alternate request approved successfully"
}
```

## Frontend Components

### 1. MeetingRejection Component
**Location:** `src/components/MeetingRejection.jsx`

**Usage in Joinmeet.jsx:**
```jsx
<MeetingRejection
  onClose={handleCloseRejectCard}
  meetingId={meetingData.id}
  token={localStorage.getItem('token')}
  meetingMembers={meetingData.members}
/>
```

**Features:**
- Radio buttons to choose between simple rejection or alternate request
- Autocomplete dropdown to select alternate from meeting members
- Filters out current user from alternate selection
- Provides informational alerts about the approval workflow

### 2. AlternateRequestNotification Component
**Location:** `src/components/AlternateRequestNotification.jsx`

**Usage:**
```jsx
import AlternateRequestNotification from '../components/AlternateRequestNotification';

// In your dashboard or notifications area
<AlternateRequestNotification />
```

**Features:**
- Displays all pending alternate requests for the logged-in user
- Shows meeting details, requester information, and reason
- Accept/Decline buttons with loading states
- Automatically refreshes after response

### 3. AlternateApprovalAdmin Component
**Location:** `src/components/AlternateApprovalAdmin.jsx`

**Usage:**
```jsx
import AlternateApprovalAdmin from '../components/AlternateApprovalAdmin';

// In meeting admin panel
<AlternateApprovalAdmin meetingId={meetingData.id} />
```

**Features:**
- Shows all alternate requests that have been accepted by the alternate
- Displays original member info and proposed alternate
- Approve/Reject buttons with confirmation dialog
- Optional admin remarks field
- Automatically adds approved alternate to meeting members

## Workflow Diagram

```
┌─────────────────┐
│  Original User  │
│ (Cannot attend) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Selects Alternate & Submits │
│      (Status: pending)       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Alternate User  │
│  Gets Notified  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌──────┐
│Accept│   │Reject│
└──┬──┘   └──┬───┘
   │         │
   │         ▼
   │    ┌────────────────────┐
   │    │ Status: alternate_ │
   │    │     rejected       │
   │    │   (End of flow)    │
   │    └────────────────────┘
   │
   ▼
┌────────────────────┐
│ Status: alternate_ │
│     accepted       │
└────────┬───────────┘
         │
         ▼
┌─────────────────┐
│ Admin Reviews   │
│   & Decides     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│Approve │ │ Reject  │
└───┬────┘ └────┬────┘
    │           │
    ▼           ▼
┌────────┐ ┌──────────┐
│Status: │ │ Status:  │
│admin_  │ │  admin_  │
│approved│ │ rejected │
│        │ │          │
│Alternate│ │          │
│added to│ │          │
│meeting │ │          │
└────────┘ └──────────┘
```

## Integration Guide

### Step 1: Database Setup
```bash
# Navigate to your project directory
cd backend/database

# Apply the schema
mysql -u root -p bitmeetings < alternate_requests_schema.sql
```

### Step 2: Backend Verification
The backend controllers and routes are already added. Verify they're working:
```bash
# Start your backend server
cd backend
npm start
```

### Step 3: Frontend Integration

#### Add to Dashboard (for alternate notifications)
```jsx
// In src/pages/Dashboard.jsx
import AlternateRequestNotification from '../components/AlternateRequestNotification';

// Add somewhere in your dashboard
<AlternateRequestNotification />
```

#### Add to Meeting Admin View
```jsx
// In your meeting admin/preview component
import AlternateApprovalAdmin from '../components/AlternateApprovalAdmin';

// Add in admin section
{isAdmin && (
  <AlternateApprovalAdmin meetingId={meetingId} />
)}
```

## Testing Checklist

### Test Scenario 1: Complete Workflow
1. ✅ User A creates a meeting with User B as a member
2. ✅ User B opens the meeting and clicks "Reject"
3. ✅ User B selects "Request Alternate" option
4. ✅ User B selects User C from the dropdown
5. ✅ User B provides a reason and submits
6. ✅ Verify User C sees the notification
7. ✅ User C accepts the request
8. ✅ User A (admin) sees the pending approval
9. ✅ User A approves the alternate
10. ✅ Verify User C is added to meeting members

### Test Scenario 2: Rejection at Alternate Stage
1. ✅ User B requests User C as alternate
2. ✅ User C declines the request
3. ✅ Verify request status is 'alternate_rejected'
4. ✅ Verify admin does not see this request

### Test Scenario 3: Rejection at Admin Stage
1. ✅ User B requests User C as alternate
2. ✅ User C accepts
3. ✅ Admin rejects with remarks
4. ✅ Verify status is 'admin_rejected'

## Error Handling

### Common Errors and Solutions

**Error:** "You are not a member of this meeting"
- **Cause:** User trying to request alternate is not in meeting_members
- **Solution:** Verify user is properly added to the meeting

**Error:** "Alternate user not found"
- **Cause:** Invalid alternateUserId provided
- **Solution:** Ensure selected user exists in database

**Error:** "Request not found or not for you"
- **Cause:** Alternate user trying to respond to wrong request
- **Solution:** Verify requestId and that user is the designated alternate

**Error:** "Only meeting creator can approve alternates"
- **Cause:** Non-admin user trying to approve
- **Solution:** Verify req.user.userId matches meeting.created_by

## Security Considerations

1. **Authentication Required:** All endpoints require JWT token
2. **Authorization Checks:**
   - Only meeting members can request alternates
   - Only designated alternate can respond to request
   - Only meeting creator can approve/reject
3. **Data Validation:**
   - MeetingId and userIds are validated
   - Status transitions are controlled
4. **SQL Injection Prevention:** All queries use parameterized statements

## Future Enhancements

1. **Email Notifications:** Send emails when alternate is requested/approved
2. **Push Notifications:** Real-time notifications in the app
3. **Request History:** View all past alternate requests
4. **Bulk Approval:** Approve multiple requests at once
5. **Auto-approval:** Option for admin to enable auto-approval for certain scenarios
6. **Delegate Permissions:** Allow alternate to have same permissions as original member

## Support

For issues or questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0 (November 2025)
- Initial release
- Basic alternate request workflow
- Admin approval system
- UI components for all user roles
