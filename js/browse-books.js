let allBooks = [];
let displayBooks = [];
let sellerBooks = [];
let fallbackTimer = null;
let currentPage = 1;
const booksPerPage = 24;

console.log("browse-books.js loaded");

document.addEventListener("DOMContentLoaded", () => {
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
    console.log("Supabase:", window.supabaseClient ? "ready" : "missing");

    const grid = document.getElementById("booksGrid");
    if (grid) grid.innerHTML = "📚 Loading books...";

    fallbackTimer = setTimeout(() => {
        if (allBooks.length === 0) {
            console.warn("Fallback activated");
            loadEmbeddedBooks();
        }
    }, 5000);

    loadBooksData();
}

async function loadBooksData() {
    clearTimeout(fallbackTimer);

    const supabase = window.supabaseClient;

    // 1) Load seller books from Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase.from("books").select("*");
            if (!error && data) {
                sellerBooks = data.map(b => ({
                    title: b.title,
                    author: b.author,
                    price: b.price,
                    category: b.category,
                    condition: b.condition,
                    stock: b.stock || "In Stock",
                    isbn: b.isbn,
                    cover: b.cover,
                    gradient: "sapiens"
                }));
                console.log("Seller books:", sellerBooks.length);
            }
        } catch (e) {
            console.warn("Supabase error", e);
        }
    }

    // 2) Load JSON books
    try {
        const res = await fetch("../books-database.json");
        const data = await res.json();

        if (data.books) {
            allBooks = [...data.books, ...sellerBooks];
            displayBooks = [...allBooks];

            console.log("TOTAL BOOKS:", allBooks.length);

            showPage(1);
            return;
        }
    } catch (e) {
        console.warn("JSON load failed", e);
    }

    // 3) Last fallback
    loadEmbeddedBooks();
}

function loadEmbeddedBooks() {
    console.warn("Using embedded books");
    allBooks = [
        { title: "1984", author: "George Orwell", price: 500, category: "FICTION", condition: "NEW", isbn: "1", cover: "" }
    ];
    displayBooks = [...allBooks];
    showPage(1);
}

function showPage(page) {
    currentPage = page;
    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    renderBooks(displayBooks.slice(start, end));
    updatePageInfo();
    updatePagination();
}

function renderBooks(books) {
    const grid = document.getElementById("booksGrid");
    if (!grid) return;

    if (books.length === 0) {
        grid.innerHTML = "No books found";
        return;
    }

    grid.innerHTML = books.map(b => `
        <div class="card">
            <h4>${b.title}</h4>
            <p>${b.author}</p>
            <p>₹${b.price}</p>
        </div>
    `).join("");
}

function updatePageInfo() {
    const el = document.getElementById("pageInfo");
    if (el) el.textContent = `Total books: ${displayBooks.length}`;
}

function updatePagination() {}
