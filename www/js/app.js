import { initContact } from "./contact.js";
import { initTools, renderHomeTools } from "./tools.js";

function safeStorageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn("EduGM could not save this preference:", error);
    }
}

function initializeEduGM() {
    const year = document.getElementById("currentYear");
    if (year) year.textContent = String(new Date().getFullYear());

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mainNav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    const darkToggle = document.getElementById("darkModeToggle");
    const savedTheme = safeStorageGet("edugm-theme");
    const useDark = savedTheme === "dark";

    document.body.classList.toggle("dark", useDark);

    if (darkToggle) {
        darkToggle.checked = useDark;
        darkToggle.addEventListener("change", () => {
            const dark = darkToggle.checked;
            document.body.classList.toggle("dark", dark);
            safeStorageSet("edugm-theme", dark ? "dark" : "light");
        });
    }

    initContact();
    initTools();
    renderHomeTools();

    const offlineStatus = document.getElementById("offlineStatus");

    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        navigator.serviceWorker.register("./sw.js")
            .then(registration => {
                if (offlineStatus) {
                    offlineStatus.textContent = "Offline support is ready.";
                }

                // Check for a newer app shell without interrupting current work.
                registration.update().catch(() => {});
            })
            .catch(error => {
                console.error("EduGM service worker registration failed:", error);
                if (offlineStatus) {
                    offlineStatus.textContent = "Offline support is unavailable on this connection.";
                }
            });
    } else if (offlineStatus) {
        offlineStatus.textContent = "Offline support requires HTTPS or the installed Android app.";
    }

    const updateNetworkStatus = () => {
        document.documentElement.dataset.connection = navigator.onLine ? "online" : "offline";
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    updateNetworkStatus();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEduGM, { once: true });
} else {
    initializeEduGM();
}
