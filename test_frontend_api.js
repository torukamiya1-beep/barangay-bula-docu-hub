// Test script to verify frontend API connectivity
const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing Frontend API Connectivity...');
    
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:7000/api/test');
      console.log('✅ Backend is running:', healthResponse.status === 200);
    } catch (error) {
      console.log('❌ Backend not accessible:', error.message);
      console.log('💡 Make sure to start the backend server: cd rhai_backend && npm start');
      return;
    }
    
    // Test 2: Test activity logs API without auth
    console.log('\n2️⃣ Testing activity logs API (no auth)...');
    try {
      const noAuthResponse = await axios.get('http://localhost:7000/api/admin/activity-logs');
      console.log('❌ Unexpected: API accessible without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 3: Test with mock auth token
    console.log('\n3️⃣ Testing with mock auth token...');
    
    // Create a mock JWT token for testing (this would normally come from login)
    const jwt = require('jsonwebtoken');
    const mockToken = jwt.sign(
      { 
        id: 32, 
        username: 'admin12345', 
        role: 'admin', 
        type: 'admin' 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    try {
      const authResponse = await axios.get('http://localhost:7000/api/admin/activity-logs', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ API call successful with auth!');
      console.log('📊 Response status:', authResponse.status);
      console.log('📊 Data count:', authResponse.data?.data?.activities?.length || 0);
      
      if (authResponse.data?.data?.activities?.length > 0) {
        console.log('🎯 Sample activity:', authResponse.data.data.activities[0].activity);
      }
      
    } catch (error) {
      console.log('❌ Auth API call failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // Test 4: Test the test endpoint
    console.log('\n4️⃣ Testing activity logs test endpoint...');
    try {
      const testResponse = await axios.get('http://localhost:7000/api/admin/activity-logs/test');
      console.log('✅ Test endpoint response:', testResponse.data);
    } catch (error) {
      console.log('❌ Test endpoint failed:', error.message);
    }
    
    console.log('\n✅ Frontend API connectivity test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Check if JWT_SECRET is available
if (!process.env.JWT_SECRET) {
  console.log('⚠️  JWT_SECRET not found in environment, using default for testing');
  process.env.JWT_SECRET = 'your-secret-key';
}

testFrontendAPI();
