
const tools = [
    { id: 1, name: "PDF Viewer", description: "Open and read PDF documents.", icon: "📕", category: "pdf" },
    { id: 2, name: "PDF Compressor", description: "Reduce PDF file size.", icon: "🗜️", category: "pdf" },
    { id: 3, name: "Image to PDF", description: "Convert images into PDF.", icon: "🖼️", category: "pdf" },
    { id: 4, name: "Merge PDF", description: "Combine multiple PDF files.", icon: "📚", category: "pdf" },
    { id: 5, name: "Split PDF", description: "Separate PDF pages.", icon: "✂️", category: "pdf" },
    { id: 6, name: "PDF to Image", description: "Convert PDF pages into images.", icon: "📄", category: "pdf" },
    { id: 7, name: "Image Compressor", description: "Reduce image file size.", icon: "📸", category: "image" },
    { id: 8, name: "Image Resizer", description: "Change image dimensions.", icon: "📐", category: "image" },
    { id: 9, name: "Image Converter", description: "Convert JPG, PNG and WebP.", icon: "🔄", category: "image" },
    { id: 10, name: "Image Cropper", description: "Crop your photographs.", icon: "✂️", category: "image" },
    { id: 11, name: "Text to PDF", description: "Create PDF from text.", icon: "📝", category: "document" },
    { id: 12, name: "QR Generator", description: "Create QR codes.", icon: "▦", category: "student" }
];

const toolsGrid = document.getElementById("toolsGrid");
const searchInput = document.getElementById("searchInput");
const toolCount = document.getElementById("toolCount");
const emptyState = document.getElementById("emptyState");

let selectedCategory = "all";
let showFavorites = false;

let favorites = JSON.parse(
    localStorage.getItem("edugm-favorites") || "[]"
);

function renderTools() {
    const search = searchInput.value.toLowerCase().trim();

    const filtered = tools.filter(tool => {
        const matchesSearch =
            tool.name.toLowerCase().includes(search) ||
            tool.description.toLowerCase().includes(search);

        const matchesCategory =
            selectedCategory === "all" ||
            tool.category === selectedCategory;

        const matchesFavorite =
            !showFavorites || favorites.includes(tool.id);

        return matchesSearch && matchesCategory && matchesFavorite;
    });

    toolsGrid.innerHTML = "";

    filtered.forEach(tool => {
        const card = document.createElement("div");
        card.className = "tool-card";

        const icon = document.createElement("div");
        icon.className = "tool-icon";
        icon.textContent = tool.icon;

        const favoriteButton = document.createElement("button");
        favoriteButton.className = "favorite" +
            (favorites.includes(tool.id) ? " saved" : "");
        favoriteButton.textContent =
            favorites.includes(tool.id) ? "★" : "☆";
        favoriteButton.setAttribute("aria-label", "Save " + tool.name);

        favoriteButton.addEventListener("click", event => {
            event.stopPropagation();
            toggleFavorite(tool.id);
        });

        const title = document.createElement("h3");
        title.textContent = tool.name;

        const description = document.createElement("p");
        description.textContent = tool.description;

        card.append(favoriteButton, icon, title, description);

        card.addEventListener("click", () => {
            openTool(tool);
        });

        toolsGrid.appendChild(card);
    });

    toolCount.textContent = filtered.length + " tools";
    emptyState.hidden = filtered.length !== 0;
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem(
        "edugm-favorites",
        JSON.stringify(favorites)
    );

    renderTools();
}

function openTool(tool) {
    alert(
        tool.name +
        "\n\nThis tool will be implemented in the next development stage."
    );
}

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        selectedCategory = button.dataset.category;
        showFavorites = false;
        renderTools();
    });
});

searchInput.addEventListener("input", renderTools);

document.getElementById("themeButton").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "edugm-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

document.getElementById("favoritesButton").addEventListener("click", () => {
    showFavorites = true;
    selectedCategory = "all";

    document.querySelectorAll(".category").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.category === "all"
        );
    });

    renderTools();
});

document.getElementById("allToolsButton").addEventListener("click", () => {
    showFavorites = false;
    selectedCategory = "all";
    searchInput.value = "";

    document.querySelectorAll(".category").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.category === "all"
        );
    });

    renderTools();
});

document.getElementById("aboutButton").addEventListener("click", () => {
    alert(
        "EduGM UniTools\n\n" +
        "Your Everyday Digital Toolkit\n" +
        "Developed by CodeBihin."
    );
});

if (localStorage.getItem("edugm-theme") === "dark") {
    document.body.classList.add("dark");
}

renderTools();
