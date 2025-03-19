// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOBcZaGNGLIT-xv_YA-41bY8m62nU_Udg",
    authDomain: "tqoct-thesis.firebaseapp.com",
    projectId: "tqoct-thesis",
    storageBucket: "tqoct-thesis.firebasestorage.app",
    messagingSenderId: "1080065673931",
    appId: "1:1080065673931:web:8081fd4fb4e8ad4e03a94e",
    measurementId: "G-L6YZ1ZSPQM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    // Δημιουργία Admin
    const adminUsername = "admin";
    const adminPassword = "Admin123!";
    if (!localStorage.getItem("adminCreated")) {
        localStorage.setItem("adminUsername", adminUsername);
        localStorage.setItem("adminPassword", adminPassword);
        localStorage.setItem("adminCreated", "true");
    }

    // Διαχείριση Σύνδεσης
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(u => u.username === username);

            let blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
            if (blockedUsers.includes(username)) {     
                alert("Ο διαχειριστής απέρριψε την πρόσβασή σας.");
                return;
            }

            if (username === adminUsername && password === adminPassword) {
                localStorage.setItem("currentUser", username);
                window.location.href = "admin.html";
            } else if (user && user.password === password) {
                localStorage.setItem("currentUser", username);
                window.location.href = "instructions.html";
            } else {
                alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
            }
        });
    }

    // Διαχείριση Εγγραφής
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            let valid = true;

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (isUsernameTaken(username)) {
                valid = false;
                showError(document.getElementById('username'), "Το όνομα χρήστη υπάρχει ήδη.");
            }

            if (!validateEmail(email)) {
                valid = false;
                showError(document.getElementById('email'), "Εισάγετε έγκυρο email.");
            }

            if (!validatePassword(password)) {
                valid = false;
                showError(document.getElementById('password'), "Ο κωδικός δεν είναι ισχυρός.");
            }

            if (!valid) return;

            const user = {
                username,
                email,
                password,
                status: "Σε αναμονή"
            };

            // Αποθήκευση στο localStorage
            const users = JSON.parse(localStorage.getItem("users")) || [];
            users.push(user);
            localStorage.setItem("users", JSON.stringify(users));

            // Αποθήκευση στο Firestore
            try {
                await db.collection("Users").doc(username).set(user);
                alert("Η εγγραφή καταχωρήθηκε! Περιμένετε έγκριση.");
                registerForm.reset();
            } catch (error) {
                console.error("Σφάλμα κατά την αποθήκευση στο Firestore: ", error);
            }
        });
    }

    // Συνάρτηση για φόρτωση χρηστών από Firestore
    async function loadUsers() {
        const userListContainer = document.getElementById("users");
        userListContainer.innerHTML = "";

        try {
            const querySnapshot = await db.collection("Users").get();
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.status || "Σε αναμονή"}</td>
                    <td>
                        <button onclick="approveUser('${doc.id}')" ${user.status === "approved" ? "disabled" : ""}>Έγκριση</button>
                        <button onclick="rejectUser('${doc.id}')" ${user.status === "rejected" ? "disabled" : ""}>Απόρριψη</button>
                    </td>
                `;
                userListContainer.appendChild(row);
            });
        } catch (error) {
            console.error("Σφάλμα φόρτωσης χρηστών:", error);
        }
    }

    // Συνάρτηση έγκρισης χρήστη
    async function approveUser(userId) {
        await db.collection("Users").doc(userId).update({ status: "approved" });
        alert("Ο χρήστης εγκρίθηκε!");
        loadUsers();
    }

    // Συνάρτηση απόρριψης χρήστη
    async function rejectUser(userId) {
        await db.collection("Users").doc(userId).update({ status: "rejected" });
        alert("Ο χρήστης απορρίφθηκε!");
        loadUsers();
    }

    // Συνάρτηση για αποθήκευση αποτελεσμάτων στο Firestore και localStorage
    async function saveScores(userId, score1, score2, score3) {
        const totalScore = score1 + score2 + score3;
        const result = { userId, scores: [score1, score2, score3], totalScore };

        const results = JSON.parse(localStorage.getItem("results")) || [];
        results.push(result);
        localStorage.setItem("results", JSON.stringify(results));

        try {
            await db.collection("Scores").add(result);
            console.log("Αποτελέσματα αποθηκεύτηκαν στο Firestore!");
        } catch (error) {
            console.error("Σφάλμα αποθήκευσης:", error);
        }
    }

    window.approveUser = approveUser;
    window.rejectUser = rejectUser;
    loadUsers();
});
