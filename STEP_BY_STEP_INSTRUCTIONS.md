# 🎯 STEP-BY-STEP MANUAL INSTRUCTIONS
# Follow these exact steps to add FREE map integration

## ✅ STEP 1: Add Leaflet Libraries (Lines 11-12)

1. Open `pages/cart.html` in your text editor
2. Find line 11-12 which looks like this:

```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="../js/cart-manager.js"></script>
```

3. Replace those 2 lines with these 8 lines:

```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Leaflet.js for FREE OpenStreetMap (No API key needed!) -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script src="../js/free-map.js"></script>
    
    <script src="../js/cart-manager.js"></script>
```

4. **Save the file**

---

## ✅ STEP 2: Remove API Key Field (Lines 677-686)

1. In the same file, scroll down to around line 677
2. Find and **DELETE** these 10 lines:

```html
                <div class="form-group">
                    <label style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; display: block;">Google Maps
                        API Key</label>
                    <input type="text" class="api-key-input" id="gmapsApiKey"
                        placeholder="Enter your Google Maps API key (optional)">
                    <small style="color: var(--ss-text-light); font-size: 0.8rem;">Get your free API key from <a
                            href="https://console.cloud.google.com/google/maps-apikey" target="_blank"
                            style="color: var(--ss-primary);">Google Cloud Console</a></small>
                </div>

```

3. **Save the file**

---

## ✅ STEP 3: Update openAddAddressMode Function (Lines 1038-1052)

1. Scroll down to around line 1038
2. Find this function:

```javascript
        function openAddAddressMode() {
            document.getElementById('addressList').style.display = 'none';
            document.getElementById('addAddressForm').style.display = 'block';

            // Load map if not already loaded
            if (!isMapLoaded) {
                setTimeout(() => loadGoogleMaps(), 100);
            } else if (map) {
                // Trigger resize to fix display issues
                setTimeout(() => {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(marker.getPosition());
                }, 100);
            }
        }
```

3. Replace it with this simpler version:

```javascript
        function openAddAddressMode() {
            document.getElementById('addressList').style.display = 'none';
            document.getElementById('addAddressForm').style.display = 'block';

            // Initialize FREE OpenStreetMap (no API key needed!)
            setTimeout(() => initializeMap(), 100);
        }
```

4. **Save the file**

---

## 🎉 DONE! Now Test It

1. Open PowerShell in the ShelfSync-app folder
2. Run: `python -m http.server 8000`
3. Open browser: `http://localhost:8000/pages/cart.html`
4. Click "Change" → "+ Add New Address"
5. **The FREE map should load automatically!**
6. Click "Use Current Location" to test GPS

---

## 📋 Summary of Changes

- ✅ Added 4 new lines (Leaflet libraries)
- ✅ Deleted 10 lines (Google API key field)
- ✅ Simplified 1 function (openAddAddressMode)

**Total: 3 simple edits to make the FREE map work!**

---

## 🆘 Need Help?

If you get stuck:
1. The `js/free-map.js` file is already created and ready
2. All the map logic is in that file
3. You just need to make these 3 edits to cart.html
4. Use Ctrl+F to find the exact text to replace

**The map will work immediately after these 3 edits!** 🚀
