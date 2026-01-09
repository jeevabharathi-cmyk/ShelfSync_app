// Seller Add Book JavaScript
// Handles adding new books to the Supabase database

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Supabase client to be available
    while (!window.supabaseClient) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const form = document.getElementById('addBookForm');
    
    if (!form) {
        console.error('Add book form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Get the logged-in user
            const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
            
            if (userError) {
                console.error('Error getting user:', userError);
                alert('Authentication error. Please log in again.');
                return;
            }

            if (!user) {
                console.error('No authenticated user found');
                alert('You must be logged in to add books.');
                return;
            }

            // Get form data
            const formData = new FormData(form);
            const title = formData.get('title')?.trim();
            const author = formData.get('author')?.trim();

            // Validate input
            if (!title || !author) {
                alert('Please fill in both title and author fields.');
                return;
            }

            // Insert book into database
            const { data, error } = await window.supabaseClient
                .from('books')
                .insert({
                    title: title,
                    author: author,
                    seller_id: user.id
                });

            if (error) {
                console.error('Error adding book:', error);
                alert('Error adding book: ' + error.message);
                return;
            }

            // Success
            alert('Book added successfully!');
            form.reset();

        } catch (error) {
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
});