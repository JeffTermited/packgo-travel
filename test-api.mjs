/**
 * Test script for tRPC API endpoints
 */

// Use built-in fetch (Node.js 18+)

const API_URL = 'http://localhost:3000/api/trpc';

// Test user ID (admin account)
const TEST_USER_ID = 1;

// Test URL (example tour page)
const TEST_URL = 'https://www.liontravel.com/webpd/webpdsh00.aspx?sKind=1&sProd=24JO217BRC-T';

async function testGenerateFromUrl() {
  console.log('\n=== Testing generateFromUrl ===');
  
  try {
    const response = await fetch(`${API_URL}/tours.generateFromUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: TEST_URL,
      }),
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.result?.data?.jobId) {
      console.log('✅ generateFromUrl test passed');
      return data.result.data.jobId;
    } else {
      console.log('❌ generateFromUrl test failed: No jobId returned');
      return null;
    }
  } catch (error) {
    console.error('❌ generateFromUrl test failed:', error.message);
    return null;
  }
}

async function testGetGenerationStatus(jobId) {
  console.log('\n=== Testing getGenerationStatus ===');
  
  try {
    const response = await fetch(`${API_URL}/tours.getGenerationStatus?input=${encodeURIComponent(JSON.stringify({ jobId }))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.result?.data) {
      console.log('✅ getGenerationStatus test passed');
      return true;
    } else {
      console.log('❌ getGenerationStatus test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ getGenerationStatus test failed:', error.message);
    return false;
  }
}

async function testGetMyGenerationJobs() {
  console.log('\n=== Testing getMyGenerationJobs ===');
  
  try {
    const response = await fetch(`${API_URL}/tours.getMyGenerationJobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.result?.data) {
      console.log('✅ getMyGenerationJobs test passed');
      return true;
    } else {
      console.log('❌ getMyGenerationJobs test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ getMyGenerationJobs test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting API tests...');
  console.log('API URL:', API_URL);
  console.log('Test URL:', TEST_URL);
  
  // Test 1: generateFromUrl
  const jobId = await testGenerateFromUrl();
  
  if (jobId) {
    // Wait a bit for the job to be processed
    console.log('\nWaiting 2 seconds before checking status...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: getGenerationStatus
    await testGetGenerationStatus(jobId);
  }
  
  // Test 3: getMyGenerationJobs
  await testGetMyGenerationJobs();
  
  console.log('\n=== All tests completed ===');
}

runTests().catch(console.error);
