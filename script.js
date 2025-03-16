// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Σύνδεση admin
const adminUsername = "admin";
const adminPassword = "Admin123!";

const adminDocRef = doc(db, "users", "admin");
getDoc(adminDocRef).then(docSnapshot => {
    if (!docSnapshot.exists()) {
        setDoc(adminDocRef, { username: adminUsername, password: adminPassword })
            .then(() => console.log("Admin δημιουργήθηκε!"))
            .catch(error => console.error("Σφάλμα κατά τη δημιουργία του Admin: ", error));
    }
});

// Διαχείριση Σύνδεσης
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            try {
                const userDocRef = doc(db, "users", username);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    if (username === "admin" && password === userData.password) {
                        window.location.href = "admin.html";
                    } else {
                        const email = `${username}@domain.com`; // Δημιουργούμε ένα email από το username
                        await signInWithEmailAndPassword(auth, email, password);
                        window.location.href = "instructions.html";
                    }
                } else {
                    alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
                }
            } catch (error) {
                console.error("Σφάλμα κατά τη σύνδεση: ", error);
                alert("Σφάλμα κατά τη σύνδεση!");
            }
        });
    }

    // Διαχείριση Εγγραφής
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            let valid = true;
            const inputs = registerForm.querySelectorAll("input, select");
            registerForm.querySelectorAll(".error").forEach(msg => msg.remove());

            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    valid = false;
                    showError(input, "Αυτό το πεδίο είναι υποχρεωτικό.");
                }
            });

            const passwordField = registerForm.querySelector("input[type='password']");
            if (!validatePassword(passwordField.value)) {
                valid = false;
                showError(passwordField, "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα ειδικό σύμβολο.");
            }

            if (!valid) return;

            const user = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                gender: document.getElementById('gender').value,
                age: document.getElementById('age').value,
                education: document.getElementById('education').value,
                experience: document.getElementById('experience').value,
                organizationName: document.getElementById('organizationName').value.trim(),
                organizationType: document.getElementById('organizationType').value,
                location: document.getElementById('location').value,
                role: document.getElementById('role').value,
                usageYears: document.getElementById('usageYears').value,
                serviceName: document.getElementById('serviceName').value.trim(),
                status: "Σε αναμονή"
            };

            try {
                await createUserWithEmailAndPassword(auth, user.email, user.password);
                await setDoc(doc(db, "users", user.username), user);
                alert("Η εγγραφή σας καταχωρήθηκε! Περιμένετε έγκριση από τον διαχειριστή.");
                registerForm.reset();
            } catch (error) {
                console.error("Σφάλμα κατά τη δημιουργία χρήστη: ", error);
                alert(error.message);
            }
        });
    }

    function showError(element, message) {
        const error = document.createElement("div");
        error.className = "error";
        error.style.color = "red";
        error.style.fontSize = "14px";
        error.style.marginTop = "5px";
        error.innerText = message;
        element.parentNode.appendChild(error);
    }

    function validatePassword(password) {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            signOut(auth).then(() => window.location.href = "index.html")
                .catch(error => console.error("Σφάλμα κατά την αποσύνδεση: ", error));
        });
    }
});
