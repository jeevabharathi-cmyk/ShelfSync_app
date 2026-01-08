// Simple validation script for books-data.js
const fs = require('fs');

try {
    // Read the books-data.js file
    const content = fs.readFileSync('books-data.js', 'utf8');
    
    console.log('File size:', content.length, 'characters');
    console.log('File ends with:', content.slice(-20));
    
    // Try to evaluate the content
    let booksData;
    eval(content);
    
    if (typeof booksData !== 'undefined') {
        console.log('✓ booksData loaded successfully');
        console.log('✓ Total books:', booksData.length);
        console.log('✓ First book:', booksData[0].title);
        console.log('✓ Last book:', booksData[booksData.length - 1].title);
        
        // Check for any malformed entries
        let errors = 0;
        booksData.forEach((book, index) => {
            if (!book.title || !book.author || !book.price) {
                console.error(`✗ Book at index ${index} is malformed:`, book);
                errors++;
            }
        });
        
        if (errors === 0) {
            console.log('✓ All books are properly formatted');
        } else {
            console.log(`✗ Found ${errors} malformed books`);
        }
        
    } else {
        console.error('✗ booksData not defined after evaluation');
    }
    
} catch (error) {
    console.error('✗ Error validating books-data.js:', error.message);
}