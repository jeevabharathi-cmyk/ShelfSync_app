# Google Maps API Setup Guide for ShelfSync

## Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Go to "Credentials" and create an API key
5. (Optional but recommended) Restrict your API key:
   - Set application restrictions (HTTP referrers for web)
   - Set API restrictions (Maps JavaScript API, Geocoding API)

## Step 2: Add Your API Key to ShelfSync

### Option 1: Through the UI (Recommended)
1. Open the cart page (`pages/cart.html`)
2. Click "Change" next to the delivery address
3. Click "+ Add New Address"
4. Enter your Google Maps API key in the "Google Maps API Key" field
5. The key will be saved to localStorage for future use

### Option 3: Directly in the Code
Edit `pages/cart.html` and replace the `getApiKey()` function to return your key:

```javascript
function getApiKey() {
    return 'YOUR_ACTUAL_API_KEY_HERE';
}
```

## Step 3: Test the Integration

1. Make sure you're running the app on a local server (not `file://`)
   - Use Live Server extension in VS Code, or
   - Run `python -m http.server 8000` in the project directory
2. Open the cart page
3. Click "Change" → "+ Add New Address"
4. Click "Use Current Location"
5. Allow location access when prompted
6. The map should load and show your current location

## Features Included

✅ **Live Location Tracking**: Get user's current GPS coordinates
✅ **Interactive Map**: Drag the marker to set delivery location
✅ **Reverse Geocoding**: Automatically fill address fields from coordinates
✅ **Location Sharing**: Save location data with addresses
✅ **API Key Management**: Secure storage in localStorage
✅ **Error Handling**: Clear error messages for common issues

## Troubleshooting

### Map Error: "Please enter a Google Maps API key"
- You need to add your API key (see Step 2)

### Map Error: "Geolocation requires a server"
- You're opening the file directly (`file://` protocol)
- Solution: Run a local web server

### Map Error: "Location access denied"
- You denied browser location permission
- Solution: Click the location icon in the browser address bar and allow location access

### Map shows but location doesn't work
- Check browser console for API errors
- Verify your API key has Geocoding API enabled
- Make sure you're on HTTPS or localhost

## API Key Security

⚠️ **Important**: Never commit your API key to public repositories!

For production:
1. Use environment variables
2. Implement API key restrictions in Google Cloud Console
3. Consider using a backend proxy to hide the key

## Cost Considerations

Google Maps offers $200 free credit per month, which covers:
- ~28,000 map loads
- ~40,000 geocoding requests

For most small to medium applications, this is sufficient to stay within the free tier.
