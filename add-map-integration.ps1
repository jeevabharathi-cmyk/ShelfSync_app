# PowerShell Script to Add FREE Map Integration to cart.html
# Run this script from the ShelfSync-app directory

Write-Host "🗺️ Adding FREE Map Integration to cart.html..." -ForegroundColor Cyan
Write-Host ""

$cartFile = "pages\cart.html"

# Check if file exists
if (-not (Test-Path $cartFile)) {
    Write-Host "❌ Error: cart.html not found!" -ForegroundColor Red
    exit 1
}

# Read the file
$content = Get-Content $cartFile -Raw

# Backup the original file
$backupFile = "pages\cart.html.backup"
Copy-Item $cartFile $backupFile -Force
Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green

# CHANGE 1: Add Leaflet libraries
Write-Host "📦 Adding Leaflet.js libraries..." -ForegroundColor Yellow

$oldText1 = '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="../js/cart-manager.js"></script>'

$newText1 = '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Leaflet.js for FREE OpenStreetMap (No API key needed!) -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script src="../js/free-map.js"></script>
    
    <script src="../js/cart-manager.js"></script>'

$content = $content.Replace($oldText1, $newText1)

# CHANGE 2: Remove Google Maps API Key field
Write-Host "🗑️  Removing Google Maps API key field..." -ForegroundColor Yellow

$oldText2 = '                <div class="form-group">
                    <label style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; display: block;">Google Maps
                        API Key</label>
                    <input type="text" class="api-key-input" id="gmapsApiKey"
                        placeholder="Enter your Google Maps API key (optional)">
                    <small style="color: var(--ss-text-light); font-size: 0.8rem;">Get your free API key from <a
                            href="https://console.cloud.google.com/google/maps-apikey" target="_blank"
                            style="color: var(--ss-primary);">Google Cloud Console</a></small>
                </div>

                '

$newText2 = '                '

$content = $content.Replace($oldText2, $newText2)

# CHANGE 3: Update openAddAddressMode function
Write-Host "🔧 Updating openAddAddressMode function..." -ForegroundColor Yellow

$oldText3 = '        function openAddAddressMode() {
            document.getElementById(''addressList'').style.display = ''none'';
            document.getElementById(''addAddressForm'').style.display = ''block'';

            // Load map if not already loaded
            if (!isMapLoaded) {
                setTimeout(() => loadGoogleMaps(), 100);
            } else if (map) {
                // Trigger resize to fix display issues
                setTimeout(() => {
                    google.maps.event.trigger(map, ''resize'');
                    map.setCenter(marker.getPosition());
                }, 100);
            }
        }'

$newText3 = '        function openAddAddressMode() {
            document.getElementById(''addressList'').style.display = ''none'';
            document.getElementById(''addAddressForm'').style.display = ''block'';

            // Initialize FREE OpenStreetMap (no API key needed!)
            setTimeout(() => initializeMap(), 100);
        }'

$content = $content.Replace($oldText3, $newText3)

# Save the modified file
Set-Content $cartFile -Value $content -NoNewline

Write-Host ""
Write-Host "✅ SUCCESS! Map integration added to cart.html" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Changes made:" -ForegroundColor Cyan
Write-Host "  1. ✅ Added Leaflet.js libraries" -ForegroundColor White
Write-Host "  2. ✅ Removed Google Maps API key field" -ForegroundColor White
Write-Host "  3. ✅ Updated openAddAddressMode function" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run a local server: python -m http.server 8000" -ForegroundColor White
Write-Host "  2. Open: http://localhost:8000/pages/cart.html" -ForegroundColor White
Write-Host "  3. Click 'Change' → '+ Add New Address'" -ForegroundColor White
Write-Host "  4. The FREE map will load automatically!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Backup saved at: $backupFile" -ForegroundColor Yellow
Write-Host "   (You can restore it if needed)" -ForegroundColor Yellow
Write-Host ""
