import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Divider, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';

/**
 * AlternateNotificationBadge - Shows a badge with count of pending alternate requests
 * Add this to your navigation bar or header
 * 
 * Usage:
 * <AlternateNotificationBadge />
 */
function AlternateNotificationBadge() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchPendingCount();
    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRequests(response.data.data);
        setPendingCount(response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching alternate requests:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    // Navigate to alternate requests page or open modal
    // You can customize this based on your routing
    window.location.href = '/alternate-requests';
    handleClose();
  };

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        sx={{ mr: 2 }}
      >
        <Badge badgeContent={pendingCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Alternate Requests
          </Typography>
        </Box>
        <Divider />

        {pendingCount === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No pending requests
            </Typography>
          </MenuItem>
        ) : (
          <>
            {requests.slice(0, 3).map((request) => (
              <MenuItem key={request.id} onClick={handleViewDetails}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <PersonAddIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {request.meeting_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From: {request.requesting_user_name}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
            {pendingCount > 3 && (
              <MenuItem onClick={handleViewDetails}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  View all {pendingCount} requests →
                </Typography>
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </>
  );
}

export default AlternateNotificationBadge;
