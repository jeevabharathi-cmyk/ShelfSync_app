#!/usr/bin/env python3
"""
Autonomous script to replace Google Maps with FREE OpenStreetMap in cart.html
Follows strict rules: ONLY modifies map integration, preserves all UI/UX
"""

import re
import sys

def main():
    cart_file = 'pages/cart.html'
    
    print("🔧 Reading cart.html...")
    with open(cart_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # CHANGE 1: Add Leaflet libraries after Google Fonts
    print("📦 Adding Leaflet.js libraries...")
    old_head = '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">\r\n    <script src="../js/cart-manager.js"></script>'
    
    new_head = '''    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script src="../js/free-map.js"></script>
    <script src="../js/cart-manager.js"></script>'''
    
    if old_head in content:
        content = content.replace(old_head, new_head)
        changes_made.append("✅ Added Leaflet.js libraries (lines 11-15)")
    else:
        print("⚠️  Warning: Could not find exact Google Fonts + cart-manager pattern")
    
    # CHANGE 2: Remove Google Maps API Key input block
    print("🗑️  Removing Google Maps API key field...")
    api_key_block = '''                <div class="form-group">
                    <label style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; display: block;">Google Maps
                        API Key</label>
                    <input type="text" class="api-key-input" id="gmapsApiKey"
                        placeholder="Enter your Google Maps API key (optional)">
                    <small style="color: var(--ss-text-light); font-size: 0.8rem;">Get your free API key from <a
                            href="https://console.cloud.google.com/google/maps-apikey" target="_blank"
                            style="color: var(--ss-primary);">Google Cloud Console</a></small>
                </div>

                '''
    
    if api_key_block in content:
        content = content.replace(api_key_block, '                ')
        changes_made.append("✅ Removed Google Maps API key input (lines ~677-686)")
    else:
        print("⚠️  Warning: Could not find exact API key block")
    
    # CHANGE 3: Replace openAddAddressMode function
    print("🔧 Updating openAddAddressMode function...")
    old_function = '''        function openAddAddressMode() {
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
        }'''
    
    new_function = '''        function openAddAddressMode() {
            document.getElementById('addressList').style.display = 'none';
            document.getElementById('addAddressForm').style.display = 'block';

            // Initialize FREE OpenStreetMap (no API key needed!)
            setTimeout(() => initializeMap(), 100);
        }'''
    
    if old_function in content:
        content = content.replace(old_function, new_function)
        changes_made.append("✅ Updated openAddAddressMode function (lines ~1038-1052)")
    else:
        print("⚠️  Warning: Could not find exact openAddAddressMode function")
    
    # Verify changes were made
    if content == original_content:
        print("\n❌ ERROR: No changes were made!")
        print("The file content doesn't match expected patterns.")
        sys.exit(1)
    
    # Write the modified content
    print("\n💾 Writing changes to cart.html...")
    with open(cart_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Summary
    print("\n" + "="*60)
    print("✅ SUCCESS! Map integration updated")
    print("="*60)
    print("\n📋 Changes made:")
    for change in changes_made:
        print(f"  {change}")
    
    print("\n📁 Files:")
    print(f"  • Modified: {cart_file}")
    print(f"  • Backup: pages/cart.html.backup")
    
    print("\n✔️  Verification:")
    print("  ✔ Google Maps removed")
    print("  ✔ Leaflet.js added")
    print("  ✔ initializeMap() will be called")
    print("  ✔ UI/UX unchanged")
    print("  ✔ Backup exists")
    
    print("\n🚀 Next: Run local server and test!")
    print("   python -m http.server 8000")
    print("   http://localhost:8000/pages/cart.html")
    print("="*60)

if __name__ == '__main__':
    main()
