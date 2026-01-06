const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'books-database.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data.books = data.books.map(book => {
    return {
        ...book,
        category: book.category ? book.category.toUpperCase() : book.category,
        condition: book.condition ? book.condition.toUpperCase() : book.condition,
        price: parseFloat((book.price * 83).toFixed(2))
    };
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Successfully updated 2000 books with corrected properties.');
