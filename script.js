let currentQuery = "fiction";
let startIndex = 0;
let isLoading = false;

window.onload = () => {
  setupEventListeners();
  loadSuggestions();
  loadMoreBooks(); // Load initial books
};

function setupEventListeners() {
  const searchBtn = document.getElementById("searchBtn");
  const suggestionTab = document.getElementById("suggestionTab");
  const closeModal = document.getElementById("closeModal");
  const form = document.querySelector("form");

  searchBtn?.addEventListener("click", handleSearch);

  suggestionTab?.addEventListener("click", () => {
    document.getElementById("suggestionModal").classList.remove("hidden");
  });

  closeModal?.addEventListener("click", () => {
    document.getElementById("suggestionModal").classList.add("hidden");
  });

  form?.addEventListener("submit", handleSuggestion);

  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      loadMoreBooks();
    }
  });
}

function handleSearch() {
  const searchInput = document.getElementById("searchBox").value.trim();
  const selectedGenre = document.getElementById("genreSelect")?.value || "";

  currentQuery = `${searchInput} ${selectedGenre}`.trim() || "fiction";
  startIndex = 0;
  document.getElementById("bookList").innerHTML = "";
  loadMoreBooks();
}

async function loadMoreBooks() {
  if (isLoading) return;
  isLoading = true;

  const bookList = document.getElementById("bookList");
  const loader = document.getElementById("loader");
  loader?.classList.remove("hidden");

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(currentQuery)}&startIndex=${startIndex}&maxResults=12`
    );
    const data = await response.json();

    if (startIndex === 0) bookList.innerHTML = "";

    if (data.items?.length) {
      data.items.forEach((item) => {
        const title = item.volumeInfo.title || "No Title";
        const authors = item.volumeInfo.authors?.join(", ") || "Unknown Author";
        const thumbnail = item.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200?text=No+Image";
        const previewLink = item.volumeInfo.previewLink || "#";

        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `
          <img src="${thumbnail}" alt="Book cover" />
          <h3>${title}</h3>
          <p>${authors}</p>
          <a href="${previewLink}" target="_blank">
            <button class="read-btn">📖 Read</button>
          </a>
        `;
        bookList.appendChild(div);
      });

      startIndex += data.items.length;
    } else {
      if (startIndex === 0) bookList.innerHTML = "No books found.";
    }
  } catch (err) {
    console.error("Error loading books:", err);
    if (startIndex === 0) bookList.innerHTML = "Failed to load books.";
  }

  isLoading = false;
  loader?.classList.add("hidden");
}

function handleSuggestion(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const book = document.getElementById("book").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !book || !message) {
    alert("Please fill out all fields.");
    return;
  }

  const suggestion = { name, book, message, time: new Date().toISOString() };

  let suggestions = JSON.parse(localStorage.getItem("userSuggestions")) || [];
  suggestions.push(suggestion);
  localStorage.setItem("userSuggestions", JSON.stringify(suggestions));

  alert("Thank you for your suggestion!");
  document.querySelector("form").reset();
  loadSuggestions();
}

function loadSuggestions() {
  const container = document.getElementById("suggestionList");
  if (!container) return;

  const suggestions = JSON.parse(localStorage.getItem("userSuggestions")) || [];
  container.innerHTML = "";

  suggestions.reverse().forEach((s) => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.innerHTML = `
      <h4>${s.name} recommends: <em>${s.book}</em></h4>
      <p>${s.message}</p>
      <small>${new Date(s.time).toLocaleString()}</small>
    `;
    container.appendChild(div);
  });
}
