/* ================================
   ShelfSync – Browse Books Engine
   ================================ */

let supabase = null;
let allBooks = [];
let displayBooks = [];
let currentPage = 1;
const booksPerPage = 24;

/* ----------------------------
   Boot
-----------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    waitForSupabase();
});

function waitForSupabase() {
    if (window.supabaseClient) {
        supabase = window.supabaseClient;
        init();
    } else {
        setTimeout(waitForSupabase, 100);
    }
}

/* ----------------------------
   Init
-----------------------------*/
async function init() {
    const grid = document.getElementById("booksGrid");
    grid.innerHTML = `<div class="loading-spinner">📚 Loading books...</div>`;

    const jsonBooks = await loadJSONBooks();
    const sellerBooks = await loadSellerBooks();

    allBooks = [...jsonBooks, ...sellerBooks];
    displayBooks = [...allBooks];

    updatePageInfo();
    showPage(1);
}

/* ----------------------------
   Load JSON (2000 books)
-----------------------------*/
async function loadJSONBooks() {
    try {
        const res = await fetch("../books-database.json");
        const data = await res.json();

        return data.books.map(b => ({
            ...b,
            cover: b.cover || `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg`
        }));
    } catch (e) {
        console.warn("JSON failed, using embedded data");
        return embeddedBooks();
    }
}

/* ----------------------------
   Load Seller Supabase books
-----------------------------*/
async function loadSellerBooks() {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase.from("books").select("*");
        if (error) throw error;

        return data.map(b => ({
            title: b.title,
            author: b.author,
            price: b.price,
            category: b.category,
            condition: b.condition,
            stock: b.stock || "In Stock",
            isbn: b.isbn,
            cover: b.cover || `https://via.placeholder.com/300x420?text=${encodeURIComponent(b.title)}`,
            gradient: "sapiens"
        }));
    } catch (e) {
        console.warn("Supabase failed");
        return [];
    }
}

/* ----------------------------
   Pagination
-----------------------------*/
function showPage(page) {
    currentPage = page;
    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    renderBooks(displayBooks.slice(start, end));
    updatePageInfo();
    updatePagination();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ----------------------------
   Premium UI Renderer
-----------------------------*/
function renderBooks(books) {
    const grid = document.getElementById("booksGrid");

    if (!books.length) {
        grid.innerHTML = "<div>No books found</div>";
        return;
    }

    grid.innerHTML = books.map(book => `
    <div class="card premium">
        <div class="book-cover-container">
            <img class="book-cover" src="${book.cover}">
        </div>

        <div class="card-content">
            <h3>${book.title}</h3>
            <p>by ${book.author}</p>

            <div class="book-meta">
                <span>${book.category}</span>
                <span>${book.condition}</span>
            </div>

            <div class="price">₹${Number(book.price).toLocaleString("en-IN")}</div>

            <button class="btn-buy" onclick="addToCart('${book.title.replace(/'/g,"\\'")}', ${book.price})">
                Add to Cart
            </button>
        </div>
    </div>
    `).join("");
}

/* ----------------------------
   Search, Sort, Filters
-----------------------------*/
window.handleSearch = q => {
    q = q.toLowerCase();
    displayBooks = allBooks.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        String(b.isbn).includes(q)
    );
    showPage(1);
};

window.handleSort = () => {
    const v = document.getElementById("sortSelect").value;
    if (v === "price-low") displayBooks.sort((a,b)=>a.price-b.price);
    if (v === "price-high") displayBooks.sort((a,b)=>b.price-a.price);
    if (v === "title") displayBooks.sort((a,b)=>a.title.localeCompare(b.title));
    showPage(1);
};

/* ----------------------------
   UI helpers
-----------------------------*/
function updatePageInfo() {
    const el = document.getElementById("pageInfo");
    if (el) el.textContent = `Showing ${displayBooks.length} books`;
}

function updatePagination() {
    const el = document.getElementById("paginationContainer");
    el.innerHTML = "";
    const pages = Math.ceil(displayBooks.length / booksPerPage);

    for (let i=1;i<=pages;i++){
        const b=document.createElement("button");
        b.textContent=i;
        b.onclick=()=>showPage(i);
        el.appendChild(b);
    }
}

/* ----------------------------
   Embedded fallback
-----------------------------*/
function embeddedBooks(){
    return [
        { title:"The Alchemist",author:"Paulo Coelho",price:5957,category:"FICTION",condition:"NEW",isbn:"9780062315007",cover:"https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg"},
        { title:"Atomic Habits",author:"James Clear",price:1919,category:"BUSINESS",condition:"NEW",isbn:"9780735211292",cover:"https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"}
    ];
}
