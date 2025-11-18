/**
 * Email Test Script
 * Run this to verify your email configuration is working
 * 
 * Usage: node test_email.js
 */

require('dotenv').config();
const { sendMeetingInvitation } = require('./services/emailService');

// Test meeting details
const testMeetingDetails = {
    meeting_name: 'Test Meeting - Email Configuration',
    meeting_description: 'This is a test email to verify the email notification system is working correctly.',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3600000), // Tomorrow + 1 hour
    venue_name: 'Conference Room A',
    priority: 'High',
    created_by_name: 'System Administrator',
    meetingId: 999
};

// Test participant - REPLACE WITH YOUR EMAIL
const testParticipants = [
    {
        email: process.env.EMAIL_USER || 'your-test-email@gmail.com',
        name: 'Test User',
        role: 'Participant'
    }
];

console.log('🧪 Testing Email Configuration...\n');
console.log('Configuration:');
console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
console.log(`  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
console.log(`  CLIENT_URL: ${process.env.CLIENT_URL || 'Not set'}\n`);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Error: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
    console.log('\nPlease update your .env file with:');
    console.log('  EMAIL_USER=your-email@gmail.com');
    console.log('  EMAIL_PASSWORD=your-app-password\n');
    process.exit(1);
}

console.log('📧 Sending test email to:', testParticipants[0].email);
console.log('⏳ Please wait...\n');

sendMeetingInvitation(testMeetingDetails, testParticipants)
    .then(result => {
        console.log('✅ Test completed!\n');
        console.log('Results:');
        console.log(`  Success: ${result.success ? '✅' : '❌'}`);
        console.log(`  Emails sent: ${result.sentCount || 0}`);
        console.log(`  Emails failed: ${result.failedCount || 0}`);
        
        if (result.success && result.sentCount > 0) {
            console.log('\n✨ Email sent successfully!');
            console.log('📬 Check your inbox (and spam folder) for the test email.');
        } else {
            console.log('\n❌ Email sending failed.');
            console.log('Error:', result.error || 'Unknown error');
            console.log('\nTroubleshooting tips:');
            console.log('  1. Verify EMAIL_USER is a valid Gmail address');
            console.log('  2. Verify EMAIL_PASSWORD is an App Password (16 characters)');
            console.log('  3. Enable 2-Step Verification on your Google Account');
            console.log('  4. Generate new App Password at: https://myaccount.google.com/apppasswords');
        }
    })
    .catch(error => {
        console.error('❌ Test failed with error:\n');
        console.error(error);
        console.log('\nTroubleshooting tips:');
        console.log('  1. Check if nodemailer is installed: npm install');
        console.log('  2. Verify .env file exists and has correct values');
        console.log('  3. Check your internet connection');
        console.log('  4. Review EMAIL_SETUP_GUIDE.md for detailed instructions');
    });
