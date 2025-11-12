import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function AlternateRequestNotification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    console.log('AlternateRequestNotification component mounted!');
    fetchAlternateRequests();
  }, []);

  const fetchAlternateRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('========== ALTERNATE REQUEST FETCH START ==========');
      console.log('1. Token exists:', !!token);
      console.log('2. Token (first 20 chars):', token?.substring(0, 20));
      console.log('3. Making request to:', 'http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending');
      
      const response = await axios.get(
        'http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('4. Response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      console.log('5. Success flag:', response.data.success);
      console.log('6. Data count:', response.data.count);
      console.log('7. Data array:', response.data.data);
      console.log('8. Data array length:', response.data.data?.length);
      
      if (response.data.success) {
        console.log('9. Setting requests state with:', response.data.data);
        setRequests(response.data.data);
      } else {
        console.log('9. No success flag - setting empty array');
        setRequests([]);
      }
      console.log('========== ALTERNATE REQUEST FETCH END ==========');
    } catch (error) {
      console.error('========== ERROR FETCHING ALTERNATE REQUESTS ==========');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('=======================================================');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, response) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem('token');
      
      const res = await axios.post(
        'http://localhost:5000/api/meetings/alternate-request/respond',
        {
          requestId,
          response // 'accept' or 'reject'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        alert(`You have ${response}ed the alternate request successfully!`);
        // Refresh the list
        fetchAlternateRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading alternate requests...</Typography>
      </Box>
    );
  }

  if (!requests || requests.length === 0) {
    return null; // Don't show anything if there are no requests
  }

  return (
    <Box sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon color="primary" /> Alternate Attendance Requests
      </Typography>

      <Stack spacing={2}>
        {requests.map((request) => (
          <Card key={request.id} sx={{ p: 3, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {request.meeting_title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Meeting Date: {request.meeting_date ? format(new Date(request.meeting_date), 'PPP p') : 'N/A'}
                </Typography>
              </Box>
              <Chip 
                label="Pending" 
                color="warning" 
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Requested by:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {request.requesting_user_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {request.requesting_user_email}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Reason:
              </Typography>
              <Typography variant="body1">
                {request.reason || 'No reason provided'}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{request.requesting_user_name}</strong> cannot attend this meeting and has nominated you as an alternate. 
                If you accept, the request will be sent to the admin for final approval.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleResponse(request.id, 'reject')}
                disabled={actionLoading === request.id}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleResponse(request.id, 'accept')}
                disabled={actionLoading === request.id}
              >
                {actionLoading === request.id ? <CircularProgress size={20} /> : 'Accept'}
              </Button>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default AlternateRequestNotification;
