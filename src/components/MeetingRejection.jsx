import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  Stack,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

function MeetingRejection({ onClose, meetingId, token, meetingMembers }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectionType, setRejectionType] = useState('simple'); // 'simple' or 'alternate'
  const [selectedAlternate, setSelectedAlternate] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    // Fetch all users from the system (not just meeting members)
    const fetchAllUsers = async () => {
      try {
        // Decode current user from token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        const currentUserId = decoded.userId;

        // Fetch all users from the users table
        const response = await axios.get(
          'http://localhost:5000/api/templates/users',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Filter out current user and format for autocomplete
        const allUsers = response.data
          .filter(user => user.id !== currentUserId)
          .map(user => ({
            user_id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
            label: `${user.name} ${user.email ? `(${user.email})` : ''} ${user.department ? `- ${user.department}` : ''}`
          }));

        // Remove duplicates based on user_id
        const uniqueUsers = allUsers.filter((user, index, self) =>
          index === self.findIndex((u) => u.user_id === user.user_id)
        );

        setAvailableMembers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback: try to get meeting members if users endpoint fails
        try {
          const response = await axios.get(
            `http://localhost:5000/api/meetings/meeting/${meetingId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          const currentUserId = decoded.userId;

          const allMembers = [];
          if (response.data.members) {
            Object.entries(response.data.members).forEach(([role, members]) => {
              members.forEach(member => {
                if (member.user_id !== currentUserId) {
                  allMembers.push({
                    ...member,
                    role: role,
                    label: `${member.name} (${role})`
                  });
                }
              });
            });
          }
          setAvailableMembers(allMembers);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          alert('Unable to load users. Please try again.');
        }
      }
    };

    if (rejectionType === 'alternate') {
      fetchAllUsers();
    }
  }, [meetingId, token, rejectionType]);

  const handleReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (rejectionType === 'alternate' && !selectedAlternate) {
      alert('Please select an alternate person');
      return;
    }

    try {
      setLoading(true);

      if (rejectionType === 'simple') {
        // Simple rejection
        const res = await fetch('http://localhost:5000/api/meetings/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            meetingId,
            status: 'reject',
            reason
          })
        });

        const data = await res.json();

        if (res.ok) {
          console.log('Rejected successfully:', data);
          alert('Meeting rejected successfully');
          onClose();
        } else {
          console.error('Failed to reject:', data.message);
          alert(data.message);
        }
      } else {
        // Rejection with alternate request
        const res = await axios.post(
          'http://localhost:5000/api/meetings/alternate-request/create',
          {
            meetingId,
            alternateUserId: selectedAlternate.user_id,
            reason
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (res.data.success) {
          alert('Alternate request sent successfully. The selected person will be notified.');
          onClose();
        } else {
          alert(res.data.message);
        }
      }
    } catch (error) {
      console.error('Error rejecting meeting:', error);
      alert("Server error while processing your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 700, width: '100%', mx: 'auto', borderRadius: 2 }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>Meeting Rejection</Typography>
          <IconButton onClick={onClose} sx={{
            color: 'error.main',
            border: '1px solid',
            borderColor: 'error.light',
            borderRadius: '50%',
            p: 0.5
          }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Rejection Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Rejection Type</Typography>
          <RadioGroup
            value={rejectionType}
            onChange={(e) => setRejectionType(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel 
              value="simple" 
              control={<Radio />} 
              label="Simple Rejection - Cannot attend" 
            />
            <FormControlLabel 
              value="alternate" 
              control={<Radio />} 
              label="Request Alternate - Suggest someone to attend in my place" 
            />
          </RadioGroup>
        </Box>

        {/* Alternate Selection (only shown if alternate option selected) */}
        {rejectionType === 'alternate' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Select Alternate Person</Typography>
            <Autocomplete
              options={availableMembers}
              getOptionLabel={(option) => option.label}
              value={selectedAlternate}
              onChange={(event, newValue) => setSelectedAlternate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search for a member..."
                  variant="outlined"
                />
              )}
              sx={{ mb: 2 }}
            />
            {rejectionType === 'alternate' && (
              <Alert severity="info" sx={{ mt: 1 }}>
                The selected person will receive a notification and must accept. 
                After their acceptance, the admin will give final approval.
              </Alert>
            )}
          </Box>
        )}

        {/* Reason Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Reason</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide a reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  px: 2,
                  py: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }
              }}
            />
            <Divider />
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose} sx={{
            px: 3,
            borderColor: 'error.light',
            color: 'error.main',
            '&:hover': {
              borderColor: 'error.main',
              backgroundColor: 'error.lightest'
            }
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            disabled={loading}
            sx={{ px: 3, backgroundColor: 'primary.main' }}
          >
            {loading ? "Saving..." : "Save & Next"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default MeetingRejection;
