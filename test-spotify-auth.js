/**
 * Test script for Spotify Authentication
 * 
 * This script tests the Spotify authentication flow by:
 * 1. Fetching the Spotify login URL
 * 2. Printing it to the console
 * 
 * To test:
 * 1. Run this script with: node test-spotify-auth.js
 * 2. Copy the output URL and open it in a browser
 * 3. Complete the Spotify login flow
 * 4. You should be redirected back to the app
 */

import axios from 'axios';

async function testSpotifyAuth() {
  try {
    console.log('Testing Spotify authentication flow...');
    
    // 1. Fetch the login URL
    const response = await axios.get('http://localhost:5000/api/auth/spotify/login', { 
      maxRedirects: 0,
      validateStatus: status => status === 302 // We expect a redirect
    });
    
    if (response.status === 302 && response.headers.location) {
      console.log('\nSpotify login URL (copy and open in browser):');
      console.log(response.headers.location);
      console.log('\nAfter logging in, you should be redirected back to the app.');
    } else {
      console.error('Unexpected response:', response.status, response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      // This is expected - axios throws on redirects when maxRedirects is 0
      console.log('\nSpotify login URL (copy and open in browser):');
      console.log(error.response.headers.location);
      console.log('\nAfter logging in, you should be redirected back to the app.');
    } else {
      console.error('Error testing Spotify auth:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
}

testSpotifyAuth().catch(console.error);