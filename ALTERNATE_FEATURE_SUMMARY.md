# Alternate Attendance Feature - Implementation Summary

## 🎯 Feature Overview

This feature allows users who cannot attend a meeting to nominate an alternate person to attend on their behalf. The workflow involves:
1. User rejects meeting and selects an alternate
2. Alternate person accepts or declines
3. Admin gives final approval

## 📦 Files Created

### Backend Files
1. **`backend/database/alternate_requests_schema.sql`**
   - Database schema for alternate requests
   - Creates `meeting_alternate_requests` table
   - Includes all necessary foreign keys and indexes

2. **`backend/controllers/meetingController.js`** (Modified)
   - Added 5 new controller functions:
     - `createAlternateRequest()` - Creates new alternate request
     - `respondToAlternateRequest()` - Alternate accepts/rejects
     - `getAlternateRequests()` - Gets requests for a user
     - `getAlternateRequestsForAdmin()` - Gets requests for admin approval
     - `adminApproveAlternate()` - Admin approves/rejects request

3. **`backend/routes/meetingRoutes.js`** (Modified)
   - Added 5 new routes:
     - `POST /api/meetings/alternate-request/create`
     - `POST /api/meetings/alternate-request/respond`
     - `GET /api/meetings/alternate-request/my-requests`
     - `GET /api/meetings/alternate-request/admin/:meetingId`
     - `POST /api/meetings/alternate-request/admin-approve`

### Frontend Files

4. **`src/components/MeetingRejection.jsx`** (Modified)
   - Added radio buttons for rejection type selection
   - Added Autocomplete for selecting alternate member
   - Added logic to fetch meeting members
   - Added API call to create alternate request
   - Added informational alerts

5. **`src/components/AlternateRequestNotification.jsx`** (New)
   - Full-page component showing pending requests
   - Displays meeting details and requester info
   - Accept/Decline buttons with loading states
   - Auto-refreshes after action

6. **`src/components/AlternateApprovalAdmin.jsx`** (New)
   - Admin panel for approving alternate requests
   - Shows requests that alternates have accepted
   - Approve/Reject with confirmation dialog
   - Optional admin remarks field

7. **`src/components/AlternateNotificationBadge.jsx`** (New)
   - Notification badge for navigation bar
   - Shows count of pending requests
   - Dropdown preview of requests
   - Auto-refreshes every 30 seconds

8. **`src/pages/Joinmeet.jsx`** (Modified)
   - Added `meetingMembers` prop to MeetingRejection component

### Documentation Files

9. **`ALTERNATE_ATTENDANCE_FEATURE.md`** (New)
   - Complete feature documentation
   - API endpoint details
   - Workflow diagrams
   - Integration guide
   - Testing checklist
   - Security considerations

10. **`ALTERNATE_SETUP_GUIDE.md`** (New)
    - Quick 5-minute setup guide
    - Step-by-step instructions
    - Test commands
    - Troubleshooting tips
    - Success checklist

## 🔄 Workflow

```
User A (Cannot Attend)
    ↓
Clicks "Reject" → Selects "Request Alternate"
    ↓
Chooses User B from dropdown → Provides reason
    ↓
[Status: pending]
    ↓
User B (Alternate) sees notification
    ↓
User B Accepts → [Status: alternate_accepted]
    ↓
Admin sees pending approval
    ↓
Admin Approves → [Status: admin_approved]
    ↓
User B added to meeting members with same role as User A
```

## 🗄️ Database Schema

```sql
meeting_alternate_requests
├── id (PK)
├── meeting_id (FK → meeting.id)
├── requesting_user_id (FK → users.id)
├── alternate_user_id (FK → users.id)
├── reason (TEXT)
├── status (ENUM)
│   ├── pending
│   ├── alternate_accepted
│   ├── alternate_rejected
│   ├── admin_approved
│   └── admin_rejected
├── request_date
├── alternate_response_date
├── admin_response_date
└── admin_remarks
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/meetings/alternate-request/create` | Create alternate request | User |
| POST | `/api/meetings/alternate-request/respond` | Alternate accepts/rejects | Alternate |
| GET | `/api/meetings/alternate-request/my-requests` | Get pending requests | User |
| GET | `/api/meetings/alternate-request/admin/:meetingId` | Get requests for approval | Admin |
| POST | `/api/meetings/alternate-request/admin-approve` | Admin approves/rejects | Admin |

## 🎨 UI Components

### 1. MeetingRejection Modal
**Where:** Appears when user clicks "Reject" on meeting
**Features:**
- Radio buttons: Simple rejection vs Request alternate
- Autocomplete dropdown for member selection
- Reason text field
- Info alerts about workflow

### 2. AlternateRequestNotification
**Where:** Add to Dashboard or dedicated page
**Features:**
- Card-based list of pending requests
- Meeting and requester details
- Accept/Decline buttons
- Auto-refresh after action

### 3. AlternateApprovalAdmin
**Where:** Meeting admin/preview page
**Features:**
- Shows accepted requests awaiting approval
- Original member vs alternate comparison
- Approve/Reject with confirmation
- Admin remarks field

### 4. AlternateNotificationBadge
**Where:** Navigation bar / Header
**Features:**
- Badge with count
- Dropdown preview
- Quick navigation to full view
- Auto-polling (30s intervals)

## ⚙️ Integration Steps

### 1. Database Setup
```bash
mysql -u root -p database_name < backend/database/alternate_requests_schema.sql
```

### 2. Backend (Already Done ✅)
- Controllers added to `meetingController.js`
- Routes added to `meetingRoutes.js`
- No additional backend work needed

### 3. Frontend Integration

#### Add to Navigation Bar:
```jsx
import AlternateNotificationBadge from './components/AlternateNotificationBadge';

// In your header/navbar
<AlternateNotificationBadge />
```

#### Add to Dashboard:
```jsx
import AlternateRequestNotification from './components/AlternateRequestNotification';

// In Dashboard.jsx
<AlternateRequestNotification />
```

#### Add to Meeting Admin View:
```jsx
import AlternateApprovalAdmin from './components/AlternateApprovalAdmin';

// In meeting preview/admin section
{isAdmin && <AlternateApprovalAdmin meetingId={meetingId} />}
```

## 🧪 Testing

### Manual Test Flow:
1. Create meeting with users A, B, C (A = admin)
2. Login as B → Open meeting → Reject → Select alternate C
3. Login as C → See notification → Accept
4. Login as A → See pending approval → Approve
5. Verify C is now in meeting members

### API Tests:
```bash
# Test each endpoint with cURL (see ALTERNATE_SETUP_GUIDE.md)
```

## 🔐 Security Features

- ✅ JWT authentication on all endpoints
- ✅ Authorization checks (only relevant users can access)
- ✅ Input validation (meetingId, userId, status)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Foreign key constraints
- ✅ Status transition controls

## 📊 Status Values

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `pending` | Awaiting alternate response | System (on create) |
| `alternate_accepted` | Alternate accepted, awaiting admin | Alternate user |
| `alternate_rejected` | Alternate declined | Alternate user |
| `admin_approved` | Admin approved, alternate added | Admin |
| `admin_rejected` | Admin rejected | Admin |

## 🎯 Key Features

✅ Three-stage approval workflow  
✅ Real-time notifications  
✅ Admin remarks capability  
✅ Auto member addition on approval  
✅ Same role assignment to alternate  
✅ Duplicate request prevention  
✅ Clean UI components  
✅ Comprehensive error handling  
✅ Full documentation  

## 📝 Next Steps

1. **Apply Database Schema** - Run the SQL migration
2. **Restart Backend** - Ensure new routes are loaded
3. **Integrate UI Components** - Add to your pages
4. **Test Workflow** - Follow the test scenarios
5. **Customize Styling** - Match your app theme
6. **Add Notifications** - Email/push (future enhancement)

## 🆘 Support

If you encounter issues:
1. Check `ALTERNATE_SETUP_GUIDE.md` for quick fixes
2. Review `ALTERNATE_ATTENDANCE_FEATURE.md` for detailed docs
3. Verify database schema was applied correctly
4. Check browser console for frontend errors
5. Check backend logs for API errors

## 📈 Future Enhancements

- Email notifications
- Push notifications
- Request history view
- Bulk approval
- Auto-approval settings
- Delegate permissions transfer
- Calendar integration
- Mobile app support

---

**Implementation Date:** November 2025  
**Version:** 1.0.0  
**Status:** Complete ✅
