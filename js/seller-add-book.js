document.addEventListener("DOMContentLoaded", async () => {
  while (!window.supabaseClient) {
    await new Promise(r => setTimeout(r, 100));
  }

  const supabase = window.supabaseClient;
  const form = document.getElementById("addBookForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Not logged in");
      return;
    }

    const user = session.user;

    const title = form.title.value.trim();
    const author = form.author.value.trim();
    const price = parseFloat(form.price.value);
    const stock = parseInt(form.stock.value);
    const description = form.description.value;

    const { error } = await supabase.from("books").insert({
      title,
      author,
      price,
      stock,
      description,
      seller_id: user.id
    });

    if (error) {
      console.error("Insert failed:", error);
      alert(error.message);
      return;
    }

    alert("Book published!");
    form.reset();
  });
});