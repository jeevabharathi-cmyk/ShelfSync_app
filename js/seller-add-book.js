// seller-add-book.js
// Securely adds books for logged-in sellers using Supabase RLS (GitHub Pages compatible)

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
      // Get active session
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const user = session.user;
      const accessToken = session.access_token; // THIS is what RLS needs

      // Read form values
      const title = form.querySelector('[name="title"]')?.value.trim();
      const author = form.querySelector('[name="author"]')?.value.trim();

      if (!title || !author) {
        alert("Title and Author are required.");
        return;
      }

      // Insert book WITH JWT header so Postgres can see auth.uid()
      const { error } = await supabase
        .from("books")
        .insert({
          title,
          author,
          seller_id: user.id
        })
        .select()
        .single()
        .throwOnError()
        .withHeaders({
          Authorization: `Bearer ${accessToken}`
        });

      if (error) {
        console.error("❌ Insert failed:", error);
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
