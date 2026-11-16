
import { initContact } from "./contact.js";
import {
    initTools,
    renderHomeTools
} from "./tools.js";

document.addEventListener("DOMContentLoaded", function () {

    // Footer year
    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    // Theme
    const darkToggle = document.getElementById("darkModeToggle");

    const savedTheme = localStorage.getItem("edugm-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }

    if (darkToggle) {
        darkToggle.checked = document.body.classList.contains("dark");

        darkToggle.addEventListener("change", function () {
            setTheme(darkToggle.checked);
        });
    }

    function setTheme(dark) {
        document.body.classList.toggle("dark", dark);

        localStorage.setItem(
            "edugm-theme",
            dark ? "dark" : "light"
        );
    }

    // Contact form
    initContact();

    // Tools
    initTools();

    // Home page popular tools
    renderHomeTools();

    // Offline service worker
    const offlineStatus = document.getElementById("offlineStatus");

    if ("serviceWorker" in navigator &&
        location.protocol !== "file:") {

        navigator.serviceWorker.register("./sw.js")
            .then(function () {
                if (offlineStatus) {
                    offlineStatus.textContent =
                        "Offline app-shell support is registered.";
                }
            })
            .catch(function (error) {
                console.error("Service worker error:", error);

                if (offlineStatus) {
                    offlineStatus.textContent =
                        "Offline support could not be registered.";
                }
            });

    } else if (offlineStatus) {
        offlineStatus.textContent =
            "Service workers require HTTPS or localhost.";
    }

});
