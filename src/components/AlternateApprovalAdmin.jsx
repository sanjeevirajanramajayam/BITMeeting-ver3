import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function AlternateApprovalAdmin({ meetingId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  useEffect(() => {
    if (meetingId) {
      fetchPendingRequests();
    }
  }, [meetingId]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/meetings/alternate-request/admin/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching alternate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminRemarks('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
    setAdminRemarks('');
    setActionType(null);
  };

  const handleAdminDecision = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setActionLoading(selectedRequest.id);
      const token = localStorage.getItem('token');
      
      const res = await axios.post(
        'http://localhost:5000/api/meetings/alternate-request/admin-approve',
        {
          requestId: selectedRequest.id,
          decision: actionType, // 'approve' or 'reject'
          adminRemarks
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        alert(`Alternate request ${actionType}d successfully!`);
        closeDialog();
        // Refresh the list
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert(error.response?.data?.message || 'Failed to process request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No pending alternate requests for admin approval.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettingsIcon /> Pending Alternate Approvals
      </Typography>

      <Stack spacing={2}>
        {requests.map((request) => (
          <Card key={request.id} sx={{ p: 2, border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Alternate Request
              </Typography>
              <Chip 
                label="Awaiting Admin Approval" 
                color="info" 
                size="small"
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Original Member:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {request.requesting_user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Role: {request.requesting_user_role || 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Proposed Alternate:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {request.alternate_user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.alternate_user_email}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Reason:
              </Typography>
              <Typography variant="body2">
                {request.reason || 'No reason provided'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => openDialog(request, 'reject')}
                disabled={actionLoading === request.id}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => openDialog(request, 'approve')}
                disabled={actionLoading === request.id}
              >
                Approve
              </Button>
            </Box>
          </Card>
        ))}
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Alternate Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 1 }}>
              <Alert severity={actionType === 'approve' ? 'success' : 'warning'} sx={{ mb: 2 }}>
                {actionType === 'approve' 
                  ? `You are about to approve ${selectedRequest.alternate_user_name} as an alternate for ${selectedRequest.requesting_user_name}.`
                  : `You are about to reject this alternate request.`
                }
              </Alert>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Remarks (Optional)"
                placeholder="Add any comments or instructions..."
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdminDecision} 
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AlternateApprovalAdmin;
