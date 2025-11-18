/**
 * Test Alternate Approval Email
 * Run this to verify alternate approval email notifications work correctly
 * 
 * Usage: node test_alternate_email.js
 */

require('dotenv').config();
const { sendMeetingInvitation } = require('./services/emailService');

// Test meeting details
const testMeetingDetails = {
    meeting_name: 'Weekly Team Meeting - Alternate Test',
    meeting_description: 'Weekly sync-up meeting for project updates and planning.',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3600000), // +1 hour
    venue_name: 'Conference Room B',
    priority: 'High',
    created_by_name: 'Admin Manager',
    meetingId: 123
};

// Test alternate participant - REPLACE WITH YOUR EMAIL
const alternateParticipant = [
    {
        email: process.env.EMAIL_USER || 'your-test-email@gmail.com',
        name: 'Alternate Test User',
        role: 'Participant',
        isAlternate: true,
        originalMember: 'John Doe'
    }
];

console.log('🧪 Testing Alternate Approval Email...\n');
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

console.log('📧 Sending alternate approval email to:', alternateParticipant[0].email);
console.log('👤 Alternate for:', alternateParticipant[0].originalMember);
console.log('⏳ Please wait...\n');

sendMeetingInvitation(testMeetingDetails, alternateParticipant)
    .then(result => {
        console.log('✅ Test completed!\n');
        console.log('Results:');
        console.log(`  Success: ${result.success ? '✅' : '❌'}`);
        console.log(`  Emails sent: ${result.sentCount || 0}`);
        console.log(`  Emails failed: ${result.failedCount || 0}`);
        
        if (result.success && result.sentCount > 0) {
            console.log('\n✨ Alternate approval email sent successfully!');
            console.log('📬 Check your inbox for the email with:');
            console.log('   - "Alternate Approved" in the subject line');
            console.log('   - Green approval banner at the top');
            console.log('   - Information about who you are alternating for');
        } else {
            console.log('\n❌ Email sending failed.');
            console.log('Error:', result.error || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('❌ Test failed with error:\n');
        console.error(error);
        console.log('\nCheck EMAIL_SETUP_GUIDE.md for troubleshooting steps.');
    });
