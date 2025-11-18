const transporter = require('../config/email');
const { format } = require('date-fns');

/**
 * Send meeting invitation email to participants
 * @param {Object} meetingDetails - Meeting information
 * @param {Array} participants - Array of participant objects with email and name
 */
const sendMeetingInvitation = async (meetingDetails, participants) => {
    try {
        const {
            meeting_name,
            meeting_description,
            start_time,
            end_time,
            venue_name,
            priority,
            created_by_name,
            meetingId
        } = meetingDetails;

        // Format date and time
        const meetingDate = format(new Date(start_time), 'MMMM dd, yyyy');
        const startTime = format(new Date(start_time), 'hh:mm a');
        const endTime = format(new Date(end_time), 'hh:mm a');

        // Create email promises for all participants
        const emailPromises = participants.map(participant => {
            const isAlternate = participant.isAlternate || false;
            const subject = isAlternate 
                ? `Alternate Approved - Meeting Invitation: ${meeting_name}`
                : `Meeting Invitation: ${meeting_name}`;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: participant.email,
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 5px;
                                background-color: #f9f9f9;
                            }
                            .header {
                                background-color: #4CAF50;
                                color: white;
                                padding: 15px;
                                text-align: center;
                                border-radius: 5px 5px 0 0;
                            }
                            .content {
                                padding: 20px;
                                background-color: white;
                            }
                            .detail-row {
                                margin: 10px 0;
                                padding: 10px;
                                background-color: #f5f5f5;
                                border-left: 4px solid #4CAF50;
                            }
                            .label {
                                font-weight: bold;
                                color: #555;
                            }
                            .priority-high {
                                color: #d32f2f;
                                font-weight: bold;
                            }
                            .priority-medium {
                                color: #f57c00;
                                font-weight: bold;
                            }
                            .priority-low {
                                color: #388e3c;
                                font-weight: bold;
                            }
                            .footer {
                                margin-top: 20px;
                                padding: 15px;
                                text-align: center;
                                font-size: 12px;
                                color: #777;
                            }
                            .btn {
                                display: inline-block;
                                padding: 10px 20px;
                                margin: 10px 5px;
                                background-color: #4CAF50;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>🗓️ Meeting Invitation${participant.isAlternate ? ' - Alternate Approved' : ''}</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${participant.name},</p>
                                ${participant.isAlternate ? `
                                <div style="background-color: #e8f5e9; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; border-radius: 4px;">
                                    <p style="margin: 0; color: #2e7d32; font-weight: bold;">✅ Your alternate request has been approved!</p>
                                    <p style="margin: 5px 0 0 0; color: #555;">You have been approved as an alternate for <strong>${participant.originalMember}</strong> in this meeting.</p>
                                </div>
                                ` : '<p>You have been invited to attend the following meeting:</p>'}
                                
                                <div class="detail-row">
                                    <span class="label">Meeting:</span> ${meeting_name}
                                </div>
                                
                                ${meeting_description ? `
                                <div class="detail-row">
                                    <span class="label">Description:</span> ${meeting_description}
                                </div>
                                ` : ''}
                                
                                <div class="detail-row">
                                    <span class="label">Date:</span> ${meetingDate}
                                </div>
                                
                                <div class="detail-row">
                                    <span class="label">Time:</span> ${startTime} - ${endTime}
                                </div>
                                
                                ${venue_name ? `
                                <div class="detail-row">
                                    <span class="label">Venue:</span> ${venue_name}
                                </div>
                                ` : ''}
                                
                                <div class="detail-row">
                                    <span class="label">Priority:</span> 
                                    <span class="priority-${priority?.toLowerCase() || 'medium'}">${priority || 'Medium'}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="label">Organized by:</span> ${created_by_name}
                                </div>
                                
                                ${participant.role ? `
                                <div class="detail-row">
                                    <span class="label">Your Role:</span> ${participant.role}
                                </div>
                                ` : ''}
                                
                                <div style="text-align: center; margin-top: 20px;">
                                    <a href="${process.env.CLIENT_URL}/meeting/${meetingId}" class="btn">View Meeting Details</a>
                                </div>
                                
                                <p style="margin-top: 20px;">Please make sure to attend the meeting on time.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated message from BIT Meetings System.</p>
                                <p>Please do not reply to this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return transporter.sendMail(mailOptions);
        });

        // Send all emails
        const results = await Promise.allSettled(emailPromises);
        
        // Check for failures
        const failures = results.filter(result => result.status === 'rejected');
        const successes = results.filter(result => result.status === 'fulfilled');

        console.log(`Emails sent: ${successes.length} successful, ${failures.length} failed`);

        if (failures.length > 0) {
            console.error('Failed to send emails to some participants:', failures);
        }

        return {
            success: true,
            sentCount: successes.length,
            failedCount: failures.length,
            message: `Successfully sent ${successes.length} out of ${results.length} emails`
        };

    } catch (error) {
        console.error('Error sending meeting invitations:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send meeting update notification
 */
const sendMeetingUpdate = async (meetingDetails, participants, updateType = 'updated') => {
    try {
        const {
            meeting_name,
            start_time,
            end_time,
            meetingId
        } = meetingDetails;

        const meetingDate = format(new Date(start_time), 'MMMM dd, yyyy');
        const startTime = format(new Date(start_time), 'hh:mm a');
        const endTime = format(new Date(end_time), 'hh:mm a');

        const emailPromises = participants.map(participant => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: participant.email,
                subject: `Meeting ${updateType === 'cancelled' ? 'Cancelled' : 'Updated'}: ${meeting_name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: ${updateType === 'cancelled' ? '#d32f2f' : '#f57c00'};">
                                Meeting ${updateType === 'cancelled' ? 'Cancelled' : 'Updated'}
                            </h2>
                            <p>Dear ${participant.name},</p>
                            <p>The meeting "${meeting_name}" scheduled for ${meetingDate} at ${startTime} has been ${updateType}.</p>
                            <p><a href="${process.env.CLIENT_URL}/meeting/${meetingId}" style="color: #4CAF50;">View Details</a></p>
                        </div>
                    </body>
                    </html>
                `
            };
            return transporter.sendMail(mailOptions);
        });

        await Promise.allSettled(emailPromises);
        return { success: true };

    } catch (error) {
        console.error('Error sending meeting update:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send meeting reminder
 */
const sendMeetingReminder = async (meetingDetails, participants) => {
    try {
        const {
            meeting_name,
            start_time,
            meetingId
        } = meetingDetails;

        const startTime = format(new Date(start_time), 'hh:mm a');

        const emailPromises = participants.map(participant => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: participant.email,
                subject: `Reminder: ${meeting_name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #4CAF50;">⏰ Meeting Reminder</h2>
                            <p>Dear ${participant.name},</p>
                            <p>This is a reminder that you have a meeting "${meeting_name}" starting at ${startTime}.</p>
                            <p><a href="${process.env.CLIENT_URL}/meeting/${meetingId}" style="color: #4CAF50;">Join Meeting</a></p>
                        </div>
                    </body>
                    </html>
                `
            };
            return transporter.sendMail(mailOptions);
        });

        await Promise.allSettled(emailPromises);
        return { success: true };

    } catch (error) {
        console.error('Error sending meeting reminder:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendMeetingInvitation,
    sendMeetingUpdate,
    sendMeetingReminder
};
