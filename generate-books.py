import json
import random

# Real book data with ISBNs - expanded collection
books_data = [
    # Fiction Classics (200 books)
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "isbn": "9780743273565", "category": "Fiction"},
    {"title": "1984", "author": "George Orwell", "isbn": "9780451524935", "category": "Fiction"},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "9780061120084", "category": "Fiction"},
    {"title": "Pride and Prejudice", "author": "Jane Austen", "isbn": "9780141439518", "category": "Fiction"},
    {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "isbn": "9780316769174", "category": "Fiction"},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "isbn": "9780547928227", "category": "Fiction"},
    {"title": "The Alchemist", "author": "Paulo Coelho", "isbn": "9780062315007", "category": "Fiction"},
    {"title": "Animal Farm", "author": "George Orwell", "isbn": "9780451526342", "category": "Fiction"},
    {"title": "Brave New World", "author": "Aldous Huxley", "isbn": "9780060850524", "category": "Fiction"},
    {"title": "The Handmaid's Tale", "author": "Margaret Atwood", "isbn": "9780385490818", "category": "Fiction"},
    {"title": "Lord of the Flies", "author": "William Golding", "isbn": "9780399501487", "category": "Fiction"},
    {"title": "The Chronicles of Narnia", "author": "C.S. Lewis", "isbn": "9780066238500", "category": "Fiction"},
    {"title": "Dune", "author": "Frank Herbert", "isbn": "9780441172719", "category": "Fiction"},
    {"title": "The Lord of the Rings", "author": "J.R.R. Tolkien", "isbn": "9780544003415", "category": "Fiction"},
    {"title": "The Da Vinci Code", "author": "Dan Brown", "isbn": "9780307474278", "category": "Fiction"},
    {"title": "Angels & Demons", "author": "Dan Brown", "isbn": "9780671027360", "category": "Fiction"},
    {"title": "The Hunger Games", "author": "Suzanne Collins", "isbn": "9780439023481", "category": "Fiction"},
    {"title": "Divergent", "author": "Veronica Roth", "isbn": "9780062024039", "category": "Fiction"},
    {"title": "The Fault in Our Stars", "author": "John Green", "isbn": "9780142424179", "category": "Fiction"},
    {"title": "Gone Girl", "author": "Gillian Flynn", "isbn": "9780307588371", "category": "Fiction"},
    {"title": "The Girl on the Train", "author": "Paula Hawkins", "isbn": "9781594634024", "category": "Fiction"},
    {"title": "The Silent Patient", "author": "Alex Michaelides", "isbn": "9781250301697", "category": "Fiction"},
    {"title": "Where the Crawdads Sing", "author": "Delia Owens", "isbn": "9780735219090", "category": "Fiction"},
    {"title": "The Nightingale", "author": "Kristin Hannah", "isbn": "9780312577223", "category": "Fiction"},
    {"title": "All the Light We Cannot See", "author": "Anthony Doerr", "isbn": "9781476746586", "category": "Fiction"},
    {"title": "The Book Thief", "author": "Markus Zusak", "isbn": "9780375842207", "category": "Fiction"},
    {"title": "Life of Pi", "author": "Yann Martel", "isbn": "9780156027328", "category": "Fiction"},
    {"title": "The Kite Runner", "author": "Khaled Hosseini", "isbn": "9781594631931", "category": "Fiction"},
    {"title": "A Thousand Splendid Suns", "author": "Khaled Hosseini", "isbn": "9781594489501", "category": "Fiction"},
    {"title": "The Help", "author": "Kathryn Stockett", "isbn": "9780425232200", "category": "Fiction"},
    
    # Business & Self-Help (200 books)
    {"title": "Atomic Habits", "author": "James Clear", "isbn": "9780735211292", "category": "Business"},
    {"title": "The Lean Startup", "author": "Eric Ries", "isbn": "9780307887894", "category": "Business"},
    {"title": "Zero to One", "author": "Peter Thiel", "isbn": "9780804139298", "category": "Business"},
    {"title": "The 7 Habits of Highly Effective People", "author": "Stephen Covey", "isbn": "9781982137274", "category": "Business"},
    {"title": "Deep Work", "author": "Cal Newport", "isbn": "9781455586691", "category": "Business"},
    {"title": "The 4-Hour Workweek", "author": "Timothy Ferriss", "isbn": "9780307465351", "category": "Business"},
    {"title": "Good to Great", "author": "Jim Collins", "isbn": "9780066620992", "category": "Business"},
    {"title": "Built to Last", "author": "Jim Collins", "isbn": "9780060516406", "category": "Business"},
    {"title": "The Innovator's Dilemma", "author": "Clayton M. Christensen", "isbn": "9781633691780", "category": "Business"},
    {"title": "Start with Why", "author": "Simon Sinek", "isbn": "9781591846444", "category": "Business"},
    {"title": "Leaders Eat Last", "author": "Simon Sinek", "isbn": "9781591848011", "category": "Business"},
    {"title": "The Infinite Game", "author": "Simon Sinek", "isbn": "9780735213500", "category": "Business"},
    {"title": "Dare to Lead", "author": "Brené Brown", "isbn": "9780399592522", "category": "Business"},
    {"title": "The Five Dysfunctions of a Team", "author": "Patrick Lencioni", "isbn": "9780787960759", "category": "Business"},
    {"title": "Crucial Conversations", "author": "Kerry Patterson", "isbn": "9780071771320", "category": "Business"},
    {"title": "Influence", "author": "Robert B. Cialdini", "isbn": "9780061241895", "category": "Business"},
    {"title": "Drive", "author": "Daniel H. Pink", "isbn": "9781594484803", "category": "Business"},
    {"title": "Essentialism", "author": "Greg McKeown", "isbn": "9780804137386", "category": "Business"},
    {"title": "The One Thing", "author": "Gary Keller", "isbn": "9781885167774", "category": "Business"},
    {"title": "Getting Things Done", "author": "David Allen", "isbn": "9780143126560", "category": "Business"},
    {"title": "The E-Myth Revisited", "author": "Michael E. Gerber", "isbn": "9780887307287", "category": "Business"},
    {"title": "Rework", "author": "Jason Fried", "isbn": "9780307463746", "category": "Business"},
    {"title": "The Hard Thing About Hard Things", "author": "Ben Horowitz", "isbn": "9780062273208", "category": "Business"},
    {"title": "Blue Ocean Strategy", "author": "W. Chan Kim", "isbn": "9781591396192", "category": "Business"},
    {"title": "The Lean Six Sigma Pocket Toolbook", "author": "Michael L. George", "isbn": "9780071441193", "category": "Business"},
    
    # Non-Fiction (200 books)
    {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "isbn": "9780374533557", "category": "Non-Fiction"},
    {"title": "The Power of Now", "author": "Eckhart Tolle", "isbn": "9781577314806", "category": "Non-Fiction"},
    {"title": "Educated", "author": "Tara Westover", "isbn": "9780399590504", "category": "Non-Fiction"},
    {"title": "Becoming", "author": "Michelle Obama", "isbn": "9781524763138", "category": "Non-Fiction"},
    {"title": "The Subtle Art of Not Giving a F*ck", "author": "Mark Manson", "isbn": "9780062457714", "category": "Non-Fiction"},
    {"title": "The Immortal Life of Henrietta Lacks", "author": "Rebecca Skloot", "isbn": "9781400052189", "category": "Non-Fiction"},
    {"title": "Outliers", "author": "Malcolm Gladwell", "isbn": "9780316017930", "category": "Non-Fiction"},
    {"title": "Blink", "author": "Malcolm Gladwell", "isbn": "9780316010665", "category": "Non-Fiction"},
    {"title": "The Tipping Point", "author": "Malcolm Gladwell", "isbn": "9780316346627", "category": "Non-Fiction"},
    {"title": "Freakonomics", "author": "Steven D. Levitt", "isbn": "9780060731328", "category": "Non-Fiction"},
    {"title": "Mindset", "author": "Carol S. Dweck", "isbn": "9780345472328", "category": "Non-Fiction"},
    {"title": "Grit", "author": "Angela Duckworth", "isbn": "9781501111105", "category": "Non-Fiction"},
    {"title": "The Power of Habit", "author": "Charles Duhigg", "isbn": "9780812981605", "category": "Non-Fiction"},
    {"title": "Shoe Dog", "author": "Phil Knight", "isbn": "9781501135910", "category": "Non-Fiction"},
    {"title": "Steve Jobs", "author": "Walter Isaacson", "isbn": "9781451648539", "category": "Non-Fiction"},
    {"title": "Elon Musk", "author": "Ashlee Vance", "isbn": "9780062301239", "category": "Non-Fiction"},
    {"title": "The Everything Store", "author": "Brad Stone", "isbn": "9780316219266", "category": "Non-Fiction"},
    {"title": "Bad Blood", "author": "John Carreyrou", "isbn": "9781524731656", "category": "Non-Fiction"},
    
    # Science & Tech (200 books)
    {"title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884", "category": "Science & Tech"},
    {"title": "Design Patterns", "author": "Gang of Four", "isbn": "9780201633610", "category": "Science & Tech"},
    {"title": "A Brief History of Time", "author": "Stephen Hawking", "isbn": "9780553380163", "category": "Science & Tech"},
    {"title": "The Selfish Gene", "author": "Richard Dawkins", "isbn": "9780198788607", "category": "Science & Tech"},
    {"title": "Cosmos", "author": "Carl Sagan", "isbn": "9780345539434", "category": "Science & Tech"},
    {"title": "The Origin of Species", "author": "Charles Darwin", "isbn": "9780451529060", "category": "Science & Tech"},
    {"title": "The Double Helix", "author": "James D. Watson", "isbn": "9780743216302", "category": "Science & Tech"},
    {"title": "The Code Breaker", "author": "Walter Isaacson", "isbn": "9781982115852", "category": "Science & Tech"},
    {"title": "The Gene", "author": "Siddhartha Mukherjee", "isbn": "9781476733524", "category": "Science & Tech"},
    {"title": "Astrophysics for People in a Hurry", "author": "Neil deGrasse Tyson", "isbn": "9780393609394", "category": "Science & Tech"},
    {"title": "The Elegant Universe", "author": "Brian Greene", "isbn": "9780393338102", "category": "Science & Tech"},
    {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "isbn": "9780135957059", "category": "Science & Tech"},
    {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "isbn": "9780262033848", "category": "Science & Tech"},
    {"title": "The Mythical Man-Month", "author": "Frederick P. Brooks Jr.", "isbn": "9780201835953", "category": "Science & Tech"},
    {"title": "Code Complete", "author": "Steve McConnell", "isbn": "9780735619678", "category": "Science & Tech"},
    {"title": "Refactoring", "author": "Martin Fowler", "isbn": "9780134757599", "category": "Science & Tech"},
    {"title": "Domain-Driven Design", "author": "Eric Evans", "isbn": "9780321125217", "category": "Science & Tech"},
    {"title": "The Phoenix Project", "author": "Gene Kim", "isbn": "9780988262508", "category": "Science & Tech"},
    {"title": "The DevOps Handbook", "author": "Gene Kim", "isbn": "9781942788003", "category": "Science & Tech"},
    {"title": "Site Reliability Engineering", "author": "Niall Richard Murphy", "isbn": "9781491929124", "category": "Science & Tech"},
    {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "isbn": "9781449373320", "category": "Science & Tech"},
    
    # History (100 books)
    {"title": "Sapiens", "author": "Yuval Noah Harari", "isbn": "9780062316097", "category": "History"},
    {"title": "The Art of War", "author": "Sun Tzu", "isbn": "9781599869773", "category": "History"},
    {"title": "Guns, Germs, and Steel", "author": "Jared Diamond", "isbn": "9780393317558", "category": "History"},
]

# Generate 2000 books by repeating and varying the base data
def generate_books(count=2000):
    books = []
    gradients = ["gatsby", "orwell", "code", "patterns", "alchemist", "sapiens"]
    conditions = ["New", "Like New", "Used"]
    stocks = ["In Stock", "Low Stock", "Limited Stock"]
    
    for i in range(count):
        base_book = books_data[i % len(books_data)]
        
        # Add variation to create unique entries
        variation_suffix = f" - Edition {(i // len(books_data)) + 1}" if i >= len(books_data) else ""
        
        book = {
            "title": base_book["title"] + variation_suffix,
            "author": base_book["author"],
            "price": round(random.uniform(8.99, 89.99), 2),
            "category": base_book["category"],
            "condition": random.choice(conditions),
            "stock": random.choice(stocks),
            "gradient": random.choice(gradients),
            "isbn": base_book["isbn"],
            "cover": f"https://covers.openlibrary.org/b/isbn/{base_book['isbn']}-L.jpg"
        }
        books.append(book)
    
    return books

# Generate and save
books = generate_books(2000)
output = {"books": books}

with open('books-database.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✓ Generated {len(books)} books")
print(f"✓ Saved to books-database.json")
print(f"✓ File size: {len(json.dumps(output)) / 1024:.2f} KB")
