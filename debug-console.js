// Debug script to run in browser console
// Copy and paste this into the browser console when on the frontend application

console.log('🔍 Starting notification debug...');

// Check if notification service is available
if (window.__notificationService) {
  console.log('✅ Notification service found');
  
  // Test getting notifications
  window.__notificationService.getNotifications(1, 10)
    .then(response => {
      console.log('📨 Raw API response:', response);
      
      if (response.data && response.data.data) {
        console.log('📊 Notifications data:', response.data.data.notifications);
        console.log('📊 Pagination data:', response.data.data.pagination);
      } else {
        console.log('⚠️ Unexpected response structure');
      }
    })
    .catch(error => {
      console.error('❌ Error getting notifications:', error);
    });
    
  // Test getting unread count
  window.__notificationService.getUnreadCount()
    .then(count => {
      console.log('📊 Unread count:', count);
    })
    .catch(error => {
      console.error('❌ Error getting unread count:', error);
    });
    
} else {
  console.log('❌ Notification service not found');
}

// Check localStorage for tokens
console.log('🔑 Admin token exists:', !!localStorage.getItem('adminToken'));
console.log('🔑 Client token exists:', !!localStorage.getItem('clientToken'));

// Check if we're on admin or client side
console.log('🌐 Current URL:', window.location.href);

// Test direct API call
async function testDirectAPI() {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('clientToken');
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }
  
  try {
    console.log('🌐 Testing direct API call...');
    
    const response = await fetch('http://localhost:7000/api/notifications?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📨 Direct API response:', data);
    
  } catch (error) {
    console.error('❌ Direct API error:', error);
  }
}

// Run the test
testDirectAPI();

console.log('🔍 Debug script completed. Check the logs above for results.');
