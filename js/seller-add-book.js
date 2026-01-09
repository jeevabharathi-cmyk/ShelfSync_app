// seller-add-book.js
// Securely adds books for logged-in sellers using Supabase RLS

document.addEventListener("DOMContentLoaded", async () => {
  // Wait until Supabase loads
  while (!window.supabaseClient) {
    await new Promise(r => setTimeout(r, 100));
  }

  const supabase = window.supabaseClient;
  const form = document.getElementById("addBookForm");

  if (!form) {
    console.error("❌ addBookForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // Get active session (THIS is what RLS trusts)
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const user = session.user; // trusted auth.uid()

      // Read form fields
      const title = form.querySelector('[name="title"]')?.value.trim();
      const author = form.querySelector('[name="author"]')?.value.trim();

      if (!title || !author) {
        alert("Title and Author are required.");
        return;
      }

      // Insert book (RLS validates seller_id === auth.uid())
      const { error } = await supabase
        .from("books")
        .insert({
          title,
          author,
          seller_id: user.id
        });

      if (error) {
        console.error("❌ Supabase insert error:", error);
        alert("Failed to add book: " + error.message);
        return;
      }

      alert("✅ Book published successfully!");
      form.reset();

    } catch (err) {
      console.error("❌ Unexpected error:", err);
      alert("Something went wrong. Try again.");
    }
  });
});
