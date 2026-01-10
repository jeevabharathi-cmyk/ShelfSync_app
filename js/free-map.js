/**
 * FREE Map Integration for ShelfSync using Leaflet.js & OpenStreetMap
 * NO API KEY REQUIRED!
 */

let map, marker;
let isMapLoaded = false;

// Initialize the map when the modal is opened
function initializeMap() {
    if (isMapLoaded && map) {
        // Map already loaded, just refresh it
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return;
    }

    try {
        // Default location: India center
        const defaultLat = 20.5937;
        const defaultLng = 78.9629;

        // Create the map
        map = L.map('map').setView([defaultLat, defaultLng], 5);

        // Add OpenStreetMap tiles (FREE!)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Add a draggable marker
        marker = L.marker([defaultLat, defaultLng], {
            draggable: true,
            title: 'Drag me to set your delivery location'
        }).addTo(map);

        // Add popup to marker
        marker.bindPopup('Drag me to your location!').openPopup();

        // Handle marker drag end
        marker.on('dragend', function (e) {
            const position = marker.getLatLng();
            console.log('New location:', position);
            reverseGeocode(position.lat, position.lng);
        });

        isMapLoaded = true;
        console.log('Map initialized successfully!');

        // Fix map display issues
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

    } catch (error) {
        console.error('Error initializing map:', error);
        showMapError('Failed to initialize map: ' + error.message);
    }
}

// Get user's current location
function useCurrentLocation() {
    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;

    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser');
        return;
    }

    // Show loading state
    btn.innerHTML = '<span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span> <span style="margin-left: 8px;">Locating...</span>';
    btn.disabled = true;

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        // Success callback
        function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log('Location found:', lat, lng);

            // Initialize map if not already done
            if (!isMapLoaded) {
                initializeMap();
            }

            // Update map and marker
            if (map && marker) {
                map.setView([lat, lng], 15);
                marker.setLatLng([lat, lng]);
                marker.bindPopup('Your current location').openPopup();
            }

            // Get address from coordinates
            reverseGeocode(lat, lng);

            // Restore button
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            showToast('Location found successfully!');
        },
        // Error callback
        function (error) {
            console.error('Geolocation error:', error);
            let errorMessage = 'Could not get your location. ';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'Unknown error occurred.';
            }

            showToast(errorMessage);
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        },
        options
    );
}

// Reverse geocode using Nominatim (OpenStreetMap's FREE geocoding service)
function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    fetch(url, {
        headers: {
            'User-Agent': 'ShelfSync/1.0'  // Required by Nominatim
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Geocoding result:', data);

            if (data && data.address) {
                const addr = data.address;

                // Extract address components
                const city = addr.city || addr.town || addr.village || addr.county || '';
                const postcode = addr.postcode || '';
                const road = addr.road || '';
                const houseNumber = addr.house_number || '';
                const suburb = addr.suburb || '';

                // Build address line
                let addressLine = '';
                if (houseNumber) addressLine += houseNumber + ', ';
                if (road) addressLine += road;
                if (suburb && !addressLine.includes(suburb)) addressLine += ', ' + suburb;

                // Update form fields
                const cityField = document.getElementById('newAddrCity');
                const zipField = document.getElementById('newAddrZip');
                const lineField = document.getElementById('newAddrLine');

                if (cityField) cityField.value = city;
                if (zipField) zipField.value = postcode;
                if (lineField) lineField.value = addressLine || data.display_name.split(',')[0];

                showToast('Address fields updated!');
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            showToast('Could not fetch address details');
        });
}

// Show error message in map container
function showMapError(message) {
    const mapDiv = document.getElementById('map');
    if (mapDiv) {
        mapDiv.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#c53030; text-align:center; padding:20px; background:#fff5f5; border:1px solid #feb2b2; border-radius:8px;">
                <svg style="width:24px;height:24px;margin-bottom:8px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <strong>Map Error</strong>
                <span style="font-size:0.8rem; margin-top:5px;">${message}</span>
            </div>
        `;
    }
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('✅ FREE Map module loaded successfully! No API key needed.');
