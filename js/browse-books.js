// Load books data from JSON file
let allBooks = [];
let displayBooks = [];
let currentPage = 1;
const booksPerPage = 24;

// Add immediate console log to test if script loads
console.log('browse-books.js loaded successfully');

// Supabase will be loaded dynamically to support file:// protocol
document.addEventListener('DOMContentLoaded', () => {
    const waitForSupabase = () => {
        if (window.supabaseClient) {
            initializeBrowseBooks();
        } else {
            setTimeout(waitForSupabase, 100);
        }
    };
    waitForSupabase();
});

function initializeBrowseBooks() {
    const supabase = window.supabaseClient;

    // Initialize Books Data
    console.log('DOM loaded, starting book data loading...');
    console.log('booksData available:', typeof booksData !== 'undefined' ? (booksData ? booksData.length : 'null') : 'undefined');
    console.log('Current location:', window.location.href);
    console.log('Supabase client:', typeof supabase !== 'undefined' ? 'available' : 'not available');
    
    // Show loading state immediately
    const grid = document.getElementById('booksGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-spinner">📚 Loading 2000+ books...</div>';
    }
    
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
        loadBooksData();
    }, 100);
    
    // Fallback timeout - if nothing loads after 3 seconds, show embedded books
    setTimeout(() => {
        if (allBooks.length === 0) {
            console.warn('Timeout reached, loading embedded books as fallback');
            loadEmbeddedBooks();
        }
    }, 3000);
}

// Load books data
async function loadBooksData() {
    console.log('loadBooksData called');
    
    // Update loading message
    const grid = document.getElementById('booksGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-spinner">📚 Loading books from database...</div>';
    }
    
    // First priority: Check if booksData global variable is available
    if (typeof booksData !== 'undefined' && Array.isArray(booksData) && booksData.length > 0) {
        console.log('✅ Found booksData global variable with', booksData.length, 'books');
        
        try {
            // Process in chunks to avoid blocking the UI
            allBooks = [...booksData]; // Create a copy
            displayBooks = [...allBooks];
            
            console.log('📚 Books loaded successfully, showing first page...');
            
            // Update page info immediately
            updatePageInfo();
            
            // Show first page with a small delay to ensure UI updates
            setTimeout(() => {
                showPage(1);
            }, 50);
            return;
        } catch (error) {
            console.error('❌ Error processing booksData:', error);
            // Fall through to other methods
        }
    }
    
    // Second priority: Try Supabase
    try {
        if (supabase && supabase.supabaseUrl && 
            supabase.supabaseUrl !== "YOUR_SUPABASE_PROJECT_URL") {
            console.log('🔄 Fetching books from Supabase...');
            
            // Supabase query
            const { data: books, error } = await supabase
                .from('books')
                .select('*');

            if (error) throw error;

            if (books && books.length > 0) {
                allBooks = books.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    category: book.category,
                    condition: book.condition,
                    stock: book.stock || 'In Stock',
                    gradient: book.gradient || 'sapiens', // fallback gradient
                    isbn: book.isbn,
                    cover: book.cover || `https://via.placeholder.com/400x600?text=${encodeURIComponent(book.title)}`, // Use uploaded image or fallback
                    publisher: book.publisher,
                    format: book.format,
                    language: book.language,
                    description: book.description
                }));
                console.log('✅ Loaded ' + allBooks.length + ' books from Supabase');
                displayBooks = [...allBooks];
                updatePageInfo();
                showPage(1);
                return;
            }
        } else {
            console.log('⚠️ Supabase not configured, trying fallback data...');
        }
    } catch (error) {
        console.warn('⚠️ Supabase error, trying fallback data:', error);
    }
    
    // Third priority: Try to load local JSON files
    console.log('🔄 Trying to load from local JSON files...');
    const jsonPaths = ['../books-database.json', './books-database.json', 'books-database.json'];
    
    for (const path of jsonPaths) {
        try {
            console.log('🔄 Trying to fetch:', path);
            const response = await fetch(path);
            if (response.ok) {
                const data = await response.json();
                if (data.books && data.books.length > 0) {
                    allBooks = data.books;
                    console.log('✅ Loaded ' + allBooks.length + ' books from JSON file:', path);
                    displayBooks = [...allBooks];
                    updatePageInfo();
                    showPage(1);
                    return;
                }
            }
        } catch (error) {
            console.log('❌ Failed to load from', path, ':', error.message);
        }
    }
    
    // Last resort: Use embedded books
    console.log('⚠️ All loading methods failed, using embedded books as last resort...');
    loadEmbeddedBooks();
}

// Fallback embedded books data
function loadEmbeddedBooks() {
    console.log('📚 Using embedded fallback books');
    allBooks = [
        { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 5437.33, "category": "FICTION", "condition": "USED", "stock": "Limited Stock", "gradient": "sapiens", "isbn": "9780743273565", "cover": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
        { "title": "1984", "author": "George Orwell", "price": 1840.94, "category": "FICTION", "condition": "NEW", "stock": "Limited Stock", "gradient": "orwell", "isbn": "9780451524935", "cover": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
        { "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 4853.84, "category": "FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "orwell", "isbn": "9780061120084", "cover": "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg" },
        { "title": "Pride and Prejudice", "author": "Jane Austen", "price": 1974.57, "category": "FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9780141439518", "cover": "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg" },
        { "title": "The Catcher in the Rye", "author": "J.D. Salinger", "price": 1753.79, "category": "FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9780316769174", "cover": "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg" },
        { "title": "The Hobbit", "author": "J.R.R. Tolkien", "price": 2426.09, "category": "FICTION", "condition": "USED", "stock": "Low Stock", "gradient": "gatsby", "isbn": "9780547928227", "cover": "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg" },
        { "title": "The Alchemist", "author": "Paulo Coelho", "price": 5957.74, "category": "FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9780062315007", "cover": "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg" },
        { "title": "Animal Farm", "author": "George Orwell", "price": 5229, "category": "FICTION", "condition": "USED", "stock": "In Stock", "gradient": "orwell", "isbn": "9780451526342", "cover": "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg" },
        { "title": "Atomic Habits", "author": "James Clear", "price": 1919.79, "category": "BUSINESS", "condition": "USED", "stock": "In Stock", "gradient": "alchemist", "isbn": "9780735211292", "cover": "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
        { "title": "The Lean Startup", "author": "Eric Ries", "price": 6818.45, "category": "BUSINESS", "condition": "NEW", "stock": "Limited Stock", "gradient": "gatsby", "isbn": "9780307887894", "cover": "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg" },
        { "title": "Clean Code", "author": "Robert C. Martin", "price": 4806.53, "category": "SCIENCE & TECH", "condition": "LIKE NEW", "stock": "Low Stock", "gradient": "sapiens", "isbn": "9780132350884", "cover": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg" },
        { "title": "Sapiens", "author": "Yuval Noah Harari", "price": 828.34, "category": "HISTORY", "condition": "NEW", "stock": "Low Stock", "gradient": "orwell", "isbn": "9780062316097", "cover": "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" },
        { "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "price": 4565, "category": "NON-FICTION", "condition": "LIKE NEW", "stock": "Low Stock", "gradient": "orwell", "isbn": "9780374533557", "cover": "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg" },
        { "title": "The Power of Now", "author": "Eckhart Tolle", "price": 6838.37, "category": "NON-FICTION", "condition": "NEW", "stock": "In Stock", "gradient": "gatsby", "isbn": "9781577314806", "cover": "https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg" },
        { "title": "Educated", "author": "Tara Westover", "price": 1521.39, "category": "NON-FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "patterns", "isbn": "9780399590504", "cover": "https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg" },
        { "title": "Becoming", "author": "Michelle Obama", "price": 5810, "category": "NON-FICTION", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9781524763138", "cover": "https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg" },
        { "title": "Zero to One", "author": "Peter Thiel", "price": 1323.85, "category": "BUSINESS", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "alchemist", "isbn": "9780804139298", "cover": "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg" },
        { "title": "The 7 Habits of Highly Effective People", "author": "Stephen Covey", "price": 2679.24, "category": "BUSINESS", "condition": "LIKE NEW", "stock": "Limited Stock", "gradient": "sapiens", "isbn": "9781982137274", "cover": "https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg" },
        { "title": "Deep Work", "author": "Cal Newport", "price": 1973.74, "category": "BUSINESS", "condition": "LIKE NEW", "stock": "Limited Stock", "gradient": "alchemist", "isbn": "9781455586691", "cover": "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg" },
        { "title": "Good to Great", "author": "Jim Collins", "price": 1762.09, "category": "BUSINESS", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9780066620992", "cover": "https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg" },
        { "title": "A Brief History of Time", "author": "Stephen Hawking", "price": 1826, "category": "SCIENCE & TECH", "condition": "LIKE NEW", "stock": "In Stock", "gradient": "code", "isbn": "9780553380163", "cover": "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg" },
        { "title": "The Selfish Gene", "author": "Richard Dawkins", "price": 1688.22, "category": "SCIENCE & TECH", "condition": "USED", "stock": "Limited Stock", "gradient": "patterns", "isbn": "9780198788607", "cover": "https://covers.openlibrary.org/b/isbn/9780198788607-L.jpg" },
        { "title": "Cosmos", "author": "Carl Sagan", "price": 5429.86, "category": "SCIENCE & TECH", "condition": "NEW", "stock": "Low Stock", "gradient": "alchemist", "isbn": "9780345539434", "cover": "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg" },
        { "title": "The Art of War", "author": "Sun Tzu", "price": 7006.03, "category": "HISTORY", "condition": "NEW", "stock": "Limited Stock", "gradient": "orwell", "isbn": "9781599869773", "cover": "https://covers.openlibrary.org/b/isbn/9781599869773-L.jpg" }
    ];
    displayBooks = [...allBooks];
    console.log('✅ Embedded books loaded:', allBooks.length, 'books');
    updatePageInfo();
    showPage(1);
}

function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) {
        console.error('Books grid element not found');
        return;
    }
    
    if (!books || books.length === 0) {
        grid.innerHTML = '<div class="loading-spinner">No books found matching your criteria</div>';
        return;
    }

    console.log('Rendering', books.length, 'books');
    
    // Show loading state while rendering
    grid.innerHTML = '<div class="loading-spinner">📚 Rendering books...</div>';
    
    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
        const html = books.map(book => {
            const stockClass = book.stock.toLowerCase().replace(' ', '-');
            const isLiked = localStorage.getItem(`liked_${book.isbn}`) === 'true';

            return `
            <div class="card premium">
                <div class="book-cover-container">
                    <button class="like-btn ${isLiked ? 'active' : ''}" onclick="toggleLike(this, '${book.isbn}')">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <img class="book-cover" 
                         src="${book.cover}" 
                         alt="${book.title}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-cover ${book.gradient}" style="display: none;">
                        <div class="book-cover-placeholder">${book.title}</div>
                    </div>
                    <div class="book-cover-overlay">
                        <button class="quick-view-btn" onclick="openQuickView('${book.isbn}')">Quick View</button>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title" title="${book.title}">${book.title}</h3>
                    <p class="card-subtitle">by ${book.author}</p>
                    <div class="book-meta">
                        <span class="book-tag tag-category">${book.category}</span>
                        <span class="book-tag tag-condition">${book.condition}</span>
                    </div>
                    <div class="book-stock ${stockClass}">
                        <span class="stock-dot"></span>
                        ${book.stock}
                    </div>
                    <div class="card-footer">
                        <div class="price-container">
                            <div class="book-price">₹${book.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                        </div>
                        <div class="card-actions">
                            <button class="btn-cart-img" onclick="addToCart('${book.title.replace(/'/g, "\\'")}', ${book.price})" title="Add to Cart">
                                <img src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png" alt="Cart">
                            </button>
                            <button class="btn-buy" onclick="buyNow('${book.title.replace(/'/g, "\\'")}', ${book.price})">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');

        grid.innerHTML = html;
        console.log('Books rendered successfully');
    });
}

window.toggleLike = (btn, isbn) => {
    const isActive = btn.classList.toggle('active');
    localStorage.setItem(`liked_${isbn}`, isActive);

    // Optional: Add a small animation effect
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 200);
};

function showPage(page) {
    console.log('showPage called with page:', page, 'displayBooks length:', displayBooks.length);
    
    currentPage = page;
    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const pageBooks = displayBooks.slice(startIndex, endIndex);

    console.log('Showing books from index', startIndex, 'to', endIndex, '- total:', pageBooks.length);
    
    renderBooks(pageBooks);
    updatePageInfo();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePageInfo() {
    const totalPages = Math.ceil(displayBooks.length / booksPerPage);
    const startIndex = displayBooks.length === 0 ? 0 : (currentPage - 1) * booksPerPage + 1;
    const endIndex = Math.min(currentPage * booksPerPage, displayBooks.length);

    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.textContent = `Showing ${startIndex}-${endIndex} of ${displayBooks.length} books`;
    }
}

function updatePagination() {
    const totalPages = Math.ceil(displayBooks.length / booksPerPage);
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn ${currentPage === 1 ? 'btn-disabled' : 'btn-outline'}`;
    prevBtn.textContent = 'Previous';
    prevBtn.onclick = () => currentPage > 1 && showPage(currentPage - 1);
    container.appendChild(prevBtn);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn ${currentPage === i ? 'btn-primary' : 'btn-outline'}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => showPage(i);
            container.appendChild(pageBtn);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 10px';
            container.appendChild(dots);
        }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn ${currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}`;
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => currentPage < totalPages && showPage(currentPage + 1);
    container.appendChild(nextBtn);
}

// Make functions global for inline onclick handlers
window.openQuickView = (isbn) => {
    const book = allBooks.find(b => b.isbn === isbn);
    if (!book) return;

    const modal = document.getElementById('quickViewModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="quick-view-container">
            <div class="quick-view-image">
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/400x600?text=${book.title}'">
            </div>
            <div class="quick-view-details">
                <h2 class="modal-title">${book.title}</h2>
                <p class="modal-author">by ${book.author}</p>
                <div class="modal-meta">
                    <span class="book-tag tag-category">${book.category}</span>
                    <span class="book-tag tag-condition">${book.condition}</span>
                </div>
                <div class="modal-price">₹${book.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <p class="modal-description">
                    Experience the magic of "${book.title}" by ${book.author}. This ${book.condition.toLowerCase()} copy in the ${book.category} category is a must-have for any book lover.
                </p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="addToCart('${book.title.replace(/'/g, "\\'")}', ${book.price})">Add to Cart</button>
                    <button class="btn btn-outline" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
};

window.closeModal = () => {
    document.getElementById('quickViewModal').style.display = 'none';
};

window.addToCart = (title, price) => {
    const book = allBooks.find(b => b.title === title) || { title, price };
    window.CartManager.addToCart(book);

    const notification = document.getElementById('quickCartNotification');
    const message = document.getElementById('quickCartMessage');
    message.textContent = `"${title}" has been added to your cart.`;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 5000);
};

window.buyNow = (title, price) => {
    const book = allBooks.find(b => b.title === title) || { title, price };
    window.CartManager.addToCart(book);
    window.location.href = 'cart.html';
};

window.hideNotification = () => {
    document.getElementById('quickCartNotification').classList.remove('show');
};

window.goToCart = () => {
    window.location.href = 'cart.html';
};

window.handleSearch = (query) => {
    const q = query.toLowerCase();
    displayBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.includes(q)
    );
    showPage(1);
};

window.handleSort = () => {
    const sortBy = document.getElementById('sortSelect').value;
    if (sortBy === 'price-low') {
        displayBooks.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        displayBooks.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title') {
        displayBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else {
        // Popularity - default order
        displayBooks = [...allBooks];
    }
    showPage(1);
};

window.applyFilters = () => {
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    const selectedConditions = Array.from(document.querySelectorAll('.condition-filter:checked')).map(cb => cb.value);
    const priceRange = document.querySelector('.price-filter:checked').value;

    displayBooks = allBooks.filter(book => {
        const catMatch = selectedCategories.length === 0 || selectedCategories.includes(book.category);
        const condMatch = selectedConditions.length === 0 || selectedConditions.includes(book.condition);

        let priceMatch = true;
        const priceINR = book.price;
        if (priceRange === 'under-800') priceMatch = priceINR < 800;
        else if (priceRange === '800-2000') priceMatch = priceINR >= 800 && priceINR <= 2000;
        else if (priceRange === '2000-4000') priceMatch = priceINR > 2000 && priceINR <= 4000;
        else if (priceRange === 'over-4000') priceMatch = priceINR > 4000;

        return catMatch && condMatch && priceMatch;
    });

    showPage(1);
};

window.resetFilters = () => {
    document.querySelectorAll('.category-filter, .condition-filter').forEach(cb => cb.checked = false);
    document.querySelector('.price-filter[value="all"]').checked = true;
    displayBooks = [...allBooks];
    showPage(1);
};

