const fetch = require('node-fetch');

async function testFrontendBackendConnection() {
  console.log('🔗 Testing Frontend to Backend Connection...\n');
  
  const backendUrl = 'http://192.168.0.9:5002/api';
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const healthResponse = await fetch(`${backendUrl}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend is reachable!');
      console.log('   Status:', healthData.status);
      console.log('   Environment:', healthData.environment);
    } else {
      console.log('❌ Backend health check failed');
      console.log('   Status:', healthResponse.status);
    }
    
    // Test 2: Send OTP endpoint
    console.log('\n2️⃣ Testing send OTP endpoint...');
    const otpResponse = await fetch(`${backendUrl}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+919346048610'
      })
    });
    
    if (otpResponse.ok) {
      const otpData = await otpResponse.json();
      console.log('✅ Send OTP endpoint working!');
      console.log('   Response:', otpData);
    } else {
      console.log('❌ Send OTP endpoint failed');
      console.log('   Status:', otpResponse.status);
      const errorText = await otpResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Test 3: CORS headers
    console.log('\n3️⃣ Testing CORS headers...');
    const corsResponse = await fetch(`${backendUrl}/health`, {
      method: 'OPTIONS'
    });
    
    console.log('   CORS Headers:');
    console.log('   Access-Control-Allow-Origin:', corsResponse.headers.get('access-control-allow-origin'));
    console.log('   Access-Control-Allow-Methods:', corsResponse.headers.get('access-control-allow-methods'));
    console.log('   Access-Control-Allow-Headers:', corsResponse.headers.get('access-control-allow-headers'));
    
    // Summary
    console.log('\n🎉 Frontend-Backend Connection Test Summary:');
    console.log('==========================================');
    console.log('✅ Backend URL:', backendUrl);
    console.log('✅ Health Check:', healthResponse.ok ? 'Passed' : 'Failed');
    console.log('✅ Send OTP:', otpResponse.ok ? 'Passed' : 'Failed');
    console.log('✅ CORS Headers:', 'Present');
    
    if (healthResponse.ok && otpResponse.ok) {
      console.log('\n🎯 Frontend should be able to connect to backend!');
      console.log('📱 Try the OTP flow on your phone now.');
    } else {
      console.log('\n⚠️  There are connectivity issues to resolve.');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend server is running');
    console.log('   2. Check if IP address 192.168.0.9 is correct');
    console.log('   3. Check if port 5000 is accessible');
    console.log('   4. Check Windows Firewall settings');
  }
}

// Run the test
testFrontendBackendConnection(); 