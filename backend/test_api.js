// Quick test script to verify alternate requests API
const axios = require('axios');

async function testAlternateRequestsAPI() {
    try {
        console.log('=== Testing Alternate Requests API ===\n');

        // You need to replace this with a valid token from your browser
        const token = 'YOUR_TOKEN_HERE'; // Get this from localStorage in browser console
        
        console.log('1. Testing GET /api/meetings/alternate-request/my-requests');
        console.log('URL: http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending\n');
        
        const response = await axios.get(
            'http://localhost:5000/api/meetings/alternate-request/my-requests?status=pending',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        console.log('\nSuccess:', response.data.success);
        console.log('Count:', response.data.count);
        console.log('Requests:', response.data.data);

    } catch (error) {
        console.error('Error testing API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Instructions
console.log('===================================================');
console.log('HOW TO USE THIS TEST SCRIPT:');
console.log('===================================================');
console.log('1. Open your browser (where you are logged in)');
console.log('2. Press F12 to open Developer Tools');
console.log('3. Go to Console tab');
console.log('4. Type: localStorage.getItem("token")');
console.log('5. Copy the token value (without quotes)');
console.log('6. Paste it in this file where it says YOUR_TOKEN_HERE');
console.log('7. Save the file');
console.log('8. Run: node backend/test_api.js');
console.log('===================================================\n');

// Uncomment the line below after adding your token
// testAlternateRequestsAPI();
