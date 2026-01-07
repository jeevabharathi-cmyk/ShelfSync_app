// Supabase will be loaded dynamically to support file:// protocol
const supabase = window.supabaseClient;

// Load books data from JSON file
let allBooks = [];
let displayBooks = [];
let currentPage = 1;
const booksPerPage = 50;

// Initialize Books Data
document.addEventListener('DOMContentLoaded', loadBooksData);

// Load books data
async function loadBooksData() {
    const grid = document.getElementById('booksGrid');

    // Try to load Supabase dynamically - replaces Firebase
    try {
        if (window.location.protocol !== 'file:' && supabase && 
            window.SUPABASE_URL && window.SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL") {
            console.log('Fetching books from Supabase...');
            
            // Supabase query - replaces Firestore getDocs
            const { data: books, error } = await supabase
                .from('books')
                .select('*');

            if (error) throw error;

            if (books && books.length > 0) {
                allBooks = books.map(book => ({
                    id: book.id,
                    ...book
                }));
                console.log('Loaded ' + allBooks.length + ' books from Supabase');
                displayBooks = [...allBooks];
                showPage(1);
                return;
            }
        } else {
            console.log('Supabase not configured, falling back to local data...');
        }
    } catch (error) {
        console.warn('Supabase error, falling back to local data:', error);
    }

    // Fallback to local data
    await loadLocalData();
}

async function loadLocalData() {
    try {
        console.log('Loading local data...');
        
        // First try to fetch the JSON file (more reliable)
        try {
            console.log('Attempting to fetch books-database.json...');
            const response = await fetch('../books-database.json');
            if (response.ok) {
                const data = await response.json();
                if (data.books && data.books.length > 0) {
                    allBooks = data.books;
                    console.log('Loaded ' + allBooks.length + ' books from JSON file');
                    displayBooks = [...allBooks];
                    showPage(1);
                    return;
                }
            }
        } catch (jsonError) {
            console.log('JSON fetch failed:', jsonError);
        }
        
        // Fallback to global variable
        if (typeof booksData !== 'undefined' && booksData.length > 0) {
            console.log('Found booksData global variable with', booksData.length, 'books');
            allBooks = booksData;
            console.log('Loaded ' + allBooks.length + ' books from global variable');
            displayBooks = [...allBooks];
            showPage(1);
            return;
        }
        
        // If both fail, throw error to trigger embedded books
        throw new Error('No local data sources available');
        
    } catch (error) {
        console.error('Error loading local data:', error);
        console.log('Falling back to embedded books...');
        loadEmbeddedBooks();
    }
}

// Fallback embedded books data
function loadEmbeddedBooks() {
    console.log('Using embedded fallback books');
    allBooks = [
        { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 5437.33, "category": "FICTION", "condition": "USED", "stock": "Limited Stock", "gradient": "sapiens", "isbn": "9780743273565", "cover": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
        { "title": "1984", "author": "George Orwell", "price": 1840.94, "category": "FICTION", "condition": "NEW", "stock": "Limited Stock", "gradient": "orwell", "isbn": "9780451524935", "cover": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" }
    ];
    displayBooks = [...allBooks];
    console.log('Embedded books loaded:', allBooks.length, 'books');
    showPage(1);
}

function renderBooks(books) {
    const grid = document.getElementById('booksGrid');
    if (!books || books.length === 0) {
        grid.innerHTML = '<div class="loading-spinner">No books found matching your criteria</div>';
        return;
    }

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
}

window.toggleLike = (btn, isbn) => {
    const isActive = btn.classList.toggle('active');
    localStorage.setItem(`liked_${isbn}`, isActive);

    // Optional: Add a small animation effect
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 200);
};

function showPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const pageBooks = displayBooks.slice(startIndex, endIndex);

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

