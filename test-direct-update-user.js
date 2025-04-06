/**
 * Test script for directly updating user data for testing purposes
 * 
 * This script allows you to directly update users in the database
 * without going through the normal authentication flow
 * 
 * FOR DEVELOPMENT/TESTING ONLY - NOT FOR PRODUCTION
 */

// Check if we're running in a development environment
if (process.env.NODE_ENV === 'production') {
  console.error('This script is for development environments only');
  process.exit(1);
}

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Update a user with specific details for testing purposes
async function updateUserDirectly(userId, updateData) {
  try {
    console.log(`Updating user ${userId} with data:`, updateData);
    
    const response = await axios.post(
      `${API_URL}/api/auth/direct-update-user`,
      {
        userId,
        updateData
      }
    );
    
    console.log('User updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Example: Update a user's Spotify verification status
async function markUserAsSpotifyVerified(userId) {
  return updateUserDirectly(userId, {
    spotifyVerified: true,
    // Add other Spotify-related fields as needed
    displayName: 'Test User',
    profileImage: 'https://example.com/profile-image.jpg',
  });
}

// Example: Update user's music preferences
async function updateUserMusicPreferences(userId, genres = ['indie', 'electronic', 'hip-hop']) {
  return updateUserDirectly(userId, {
    preferredGenres: genres,
    // Add other music preference fields as needed
  });
}

// Example: Bypass email verification
async function bypassEmailVerification(userId) {
  return updateUserDirectly(userId, {
    emailVerified: true
  });
}

// Example: Complete user profile for testing
async function completeUserProfile(userId) {
  return updateUserDirectly(userId, {
    displayName: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    phone: '+1234567890',
    phoneVerified: true,
    birthday: '2000-01-01',
    spotifyId: 'spotify_mock_id',
    spotifyVerified: true,
    // Add location data for event recommendations
    latitude: 37.7749,
    longitude: -122.4194,
    notificationsEnabled: true
  });
}

// Example usage
async function main() {
  try {
    // Replace 1 with the actual user ID you want to update
    const userId = 1; 
    
    // Choose which update function to run based on your testing needs
    await completeUserProfile(userId);
    
    console.log('Update complete');
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

// Run the main function if this script is executed directly
if (require.main === module) {
  main();
}

// Export the functions for use in other scripts
module.exports = {
  updateUserDirectly,
  markUserAsSpotifyVerified,
  updateUserMusicPreferences,
  bypassEmailVerification,
  completeUserProfile
};