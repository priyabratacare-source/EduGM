
import { firebaseConfig } from "./firebase-config.js";

export function initContact() {
    const form = document.getElementById("contactForm");

    if (!form) return;

    const button = document.getElementById("sendMessageButton");
    const status = document.getElementById("contactStatus");

    function showStatus(message, success) {
        status.textContent = message;
        status.className = "form-status " +
            (success ? "success" : "error");
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const message = document.getElementById("message").value.trim();

        if (name.length < 2) {
            showStatus("Please enter your full name.", false);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showStatus("Please enter a valid email address.", false);
            return;
        }

        if (!subject || message.length < 5) {
            showStatus("Please complete the subject and message.", false);
            return;
        }

        if (!navigator.onLine) {
            showStatus(
                "No internet connection. Your message has not been sent.",
                false
            );
            return;
        }

        button.disabled = true;
        button.textContent = "Sending...";

        try {
            const firebaseApp = await import(
                "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
            );

            const firestore = await import(
                "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"
            );

            const app = firebaseApp.getApps().length
                ? firebaseApp.getApps()[0]
                : firebaseApp.initializeApp(firebaseConfig);

            const db = firestore.getFirestore(app);

            await firestore.addDoc(
                firestore.collection(db, "contactMessages"),
                {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    app: "EduGM UniTools",
                    createdAt: firestore.serverTimestamp()
                }
            );

            showStatus(
                "Your message has been submitted successfully!",
                true
            );

            form.reset();

        } catch (error) {
            console.error("Contact submission error:", error);

            showStatus(
                "Unable to send your message. Please check your internet connection and try again.",
                false
            );

        } finally {
            button.disabled = false;
            button.textContent = "Send Message →";
        }
    });
}
