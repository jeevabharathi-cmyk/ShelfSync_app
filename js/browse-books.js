/* ===============================
   ShelfSync Browse Books Engine
   =============================== */

let allBooks = [];
let displayBooks = [];
let sellerBooks = [];
let currentPage = 1;
const booksPerPage = 24;

/* -------------------------------
   Startup
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    console.log("Browse Books Initialized");
    waitForSupabase();
});

function waitForSupabase() {
    if (window.supabaseClient) {
        loadAllBooks();
    } else {
        setTimeout(waitForSupabase, 100);
    }
}

/* -------------------------------
   Master Loader
--------------------------------*/
async function loadAllBooks() {
    showLoader("Loading 2000+ books...");

    const jsonBooks = await loadJsonBooks();
    const seller = await loadSellerBooks();

    // Merge both sources
    allBooks = [...jsonBooks, ...seller];
    displayBooks = [...allBooks];

    console.log("TOTAL BOOKS:", allBooks.length);

    showPage(1);
}

/* -------------------------------
   Load JSON Books
--------------------------------*/
async function loadJsonBooks() {
    try {
        const res = await fetch("../books-database.json");
        const data = await res.json();
        console.log("JSON books:", data.books.length);
        return data.books;
    } catch (e) {
        console.error("JSON load failed", e);
        return [];
    }
}

/* -------------------------------
   Load Seller Books
--------------------------------*/
async function loadSellerBooks() {
    try {
        const supabase = window.supabaseClient;

        const { data, error } = await supabase
            .from("books")
            .select("*");

        if (error) throw error;

        console.log("Seller books:", data.length);

        return data.map(b => ({
            title: b.title,
            author: b.author,
            price: b.price,
            category: b.category,
            condition: b.condition,
            stock: b.stock || "In Stock",
            isbn: b.isbn || Math.random().toString(),
            cover: b.cover || "https://via.placeholder.com/400x600?text=Book",
            gradient: "sapiens"
        }));

    } catch (e) {
        console.warn("Supabase failed, continuing without seller books");
        return [];
    }
}

/* -------------------------------
   UI Rendering
--------------------------------*/
function showLoader(msg) {
    const grid = document.getElementById("booksGrid");
    if (grid) {
        grid.innerHTML = `<div class="loading-spinner">📚 ${msg}</div>`;
    }
}

/* -------------------------------
   Pagination
--------------------------------*/
function showPage(page) {
    currentPage = page;

    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;

    const pageBooks = displayBooks.slice(start, end);

    renderBooks(pageBooks);
    updatePageInfo();
    updatePagination();
}

/* -------------------------------
   Render Cards (OLD UI)
--------------------------------*/
function renderBooks(books) {
    const grid = document.getElementById("booksGrid");

    if (!books.length) {
        grid.innerHTML = "No books found";
        return;
    }

    grid.innerHTML = books.map(book => `
    <div class="card premium">
        <div class="book-cover-container">
            <img class="book-cover" src="${book.cover}">
        </div>
        <div class="card-content">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <div class="price">₹${book.price}</div>
        </div>
    </div>
    `).join("");
}

/* -------------------------------
   Page Info
--------------------------------*/
function updatePageInfo() {
    const el = document.getElementById("pageInfo");
    if (!el) return;

    const start = (currentPage - 1) * booksPerPage + 1;
    const end = Math.min(currentPage * booksPerPage, displayBooks.length);

    el.textContent = `Showing ${start}-${end} of ${displayBooks.length} books`;
}

/* -------------------------------
   Pagination Buttons
--------------------------------*/
function updatePagination() {
    const totalPages = Math.ceil(displayBooks.length / booksPerPage);
    const box = document.getElementById("paginationContainer");
    if (!box) return;

    box.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = i === currentPage ? "btn-primary" : "btn-outline";
        btn.onclick = () => showPage(i);
        box.appendChild(btn);
    }
}

/* -------------------------------
   Search
--------------------------------*/
window.handleSearch = q => {
    q = q.toLowerCase();
    displayBooks = allBooks.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
    showPage(1);
};

/* -------------------------------
   Sorting
--------------------------------*/
window.handleSort = () => {
    const v = document.getElementById("sortSelect").value;

    if (v === "price-low") displayBooks.sort((a,b)=>a.price-b.price);
    else if (v === "price-high") displayBooks.sort((a,b)=>b.price-a.price);
    else displayBooks = [...allBooks];

    showPage(1);
};
