import { db } from './firebase-config.js';
import { collection, getDocs } from "firebase/firestore";

// Load books data from JSON file
let allBooks = [];
let displayBooks = [];
let currentPage = 1;
const booksPerPage = 50;
const USD_TO_INR = 83; // Conversion rate

// Initialize Books Data
document.addEventListener('DOMContentLoaded', loadBooksData);

// Load books data
async function loadBooksData() {
    const grid = document.getElementById('booksGrid');
    try {
        console.log('Fetching books from Firestore...');
        // Modular SDK: collection(db, "path")
        const booksCollection = collection(db, 'books');
        const snapshot = await getDocs(booksCollection);

        if (snapshot.empty) {
            console.log('Firestore collection is empty, falling back to local data');
            await loadLocalData();
        } else {
            allBooks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Loaded ' + allBooks.length + ' books from Firestore');
            displayBooks = [...allBooks];
            showPage(1);
        }
    } catch (error) {
        console.error('Error loading books from Firestore:', error);
        await loadLocalData();
    }
}

async function loadLocalData() {
    try {
        // Check if booksData is available from books-data.js
        if (typeof window.booksData !== 'undefined') {
            allBooks = window.booksData;
            console.log('Loaded ' + allBooks.length + ' books from JS file');
            displayBooks = [...allBooks];
            showPage(1);
        } else {
            const response = await fetch('../books-database.json');
            const data = await response.json();
            allBooks = data.books;
            console.log('Loaded ' + allBooks.length + ' books from JSON file');
            displayBooks = [...allBooks];
            showPage(1);
        }
    } catch (error) {
        console.error('Error loading local data:', error);
        loadEmbeddedBooks();
    }
}

// Fallback embedded books data
function loadEmbeddedBooks() {
    console.log('Using embedded fallback books');
    allBooks = [
        { "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "price": 65.51, "category": "Fiction", "condition": "Used", "stock": "Limited Stock", "gradient": "sapiens", "isbn": "9780743273565", "cover": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg" },
        { "title": "1984", "author": "George Orwell", "price": 22.18, "category": "Fiction", "condition": "New", "stock": "Limited Stock", "gradient": "orwell", "isbn": "9780451524935", "cover": "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg" },
        { "title": "To Kill a Mockingbird", "author": "Harper Lee", "price": 58.48, "category": "Fiction", "condition": "Like New", "stock": "In Stock", "gradient": "orwell", "isbn": "9780061120084", "cover": "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg" },
        { "title": "Pride and Prejudice", "author": "Jane Austen", "price": 23.79, "category": "Fiction", "condition": "Like New", "stock": "In Stock", "gradient": "code", "isbn": "9780141439518", "cover": "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg" },
        { "title": "The Catcher in the Rye", "author": "J.D. Salinger", "price": 21.13, "category": "Fiction", "condition": "Like New", "stock": "In Stock", "gradient": "code", "isbn": "9780316769174", "cover": "https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg" },
        { "title": "The Hobbit", "author": "J.R.R. Tolkien", "price": 29.23, "category": "Fiction", "condition": "Used", "stock": "Low Stock", "gradient": "gatsby", "isbn": "9780547928227", "cover": "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg" },
        { "title": "The Alchemist", "author": "Paulo Coelho", "price": 71.78, "category": "Fiction", "condition": "Like New", "stock": "In Stock", "gradient": "code", "isbn": "9780062315007", "cover": "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg" },
        { "title": "Animal Farm", "author": "George Orwell", "price": 63.0, "category": "Fiction", "condition": "Used", "stock": "In Stock", "gradient": "orwell", "isbn": "9780451526342", "cover": "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg" },
        { "title": "Brave New World", "author": "Aldous Huxley", "price": 79.61, "category": "Fiction", "condition": "Used", "stock": "Limited Stock", "gradient": "orwell", "isbn": "9780060850524", "cover": "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg" },
        { "title": "The Handmaid's Tale", "author": "Margaret Atwood", "price": 44.52, "category": "Fiction", "condition": "Like New", "stock": "In Stock", "gradient": "gatsby", "isbn": "9780385490818", "cover": "https://covers.openlibrary.org/b/isbn/9780385490818-L.jpg" }
    ];
    displayBooks = [...allBooks];
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
        return `
        <div class="card">
            <div class="book-cover-container">
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
                    <div class="book-price">₹${(book.price * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    <div class="card-actions">
                        <button class="btn btn-outline btn-sm" onclick="addToCart('${book.title.replace(/'/g, "\\'")}', ${book.price})">
                            <span style="font-size: 1.1rem;">🛒</span>
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="buyNow('${book.title.replace(/'/g, "\\'")}', ${book.price})">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');

    grid.innerHTML = html;
}

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
                <div class="modal-price">₹${(book.price * USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
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
    const notification = document.getElementById('quickCartNotification');
    const message = document.getElementById('quickCartMessage');
    message.textContent = `"${title}" has been added to your cart.`;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 5000);
};

window.buyNow = (title, price) => {
    alert(`Redirecting to checkout for: ${title}`);
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
        const priceINR = book.price * USD_TO_INR;
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
