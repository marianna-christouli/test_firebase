// Import the necessary functions from Firebase SDK
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
const auth = getAuth(app);  // Firebase Authentication
const db = getFirestore(app); // Firestore Database

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    const adminUsername = "admin";  // Το όνομα χρήστη για τον admin
    const adminPassword = "Admin123!"; // Ο κωδικός πρόσβασης για τον admin

    // Συνάρτηση για τη σύνδεση
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            // Ελέγχουμε αν τα στοιχεία ανήκουν στον admin
            const adminDocRef = doc(db, "users", "admin");
            getDoc(adminDocRef).then(docSnapshot => {
                if (docSnapshot.exists()) {
                    const adminData = docSnapshot.data();

                    // Αν τα στοιχεία του χρήστη είναι ίδια με του admin, ανακατευθύνουμε στο admin panel
                    if (username === adminData.username && password === adminData.password) {
                        // Συνδεόμαστε ως admin και ανακατευθύνουμε στο admin panel
                        window.location.href = "admin.html";
                    } else {
                        // Αν ο χρήστης δεν είναι admin, προσπαθούμε να συνδεθούμε μέσω Firebase Authentication
                        signInWithEmailAndPassword(auth, username + "@domain.com", password)
                            .then((userCredential) => {
                                const user = userCredential.user;
                                window.location.href = "instructions.html";
                            })
                            .catch((error) => {
                                alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
                            });
                    }
                } else {
                    alert("Δεν υπάρχει καταχωρημένος admin.");
                }
            }).catch(error => {
                console.error("Σφάλμα κατά την ανάκτηση του admin: ", error);
                alert("Σφάλμα κατά την ανάκτηση του admin.");
            });
        });
    }

    // Συνάρτηση για την εγγραφή νέου χρήστη
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            let valid = true;
            const inputs = registerForm.querySelectorAll("input, select");
            const errorMessages = registerForm.querySelectorAll(".error");

            // Καθαρισμός των προηγούμενων μηνυμάτων
            errorMessages.forEach(msg => msg.remove());

            // Έλεγχος για κενά πεδία
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    valid = false;
                    showError(input, "Αυτό το πεδίο είναι υποχρεωτικό.");
                }
            });

            // Έλεγχος ισχυρού κωδικού πρόσβασης
            const passwordField = registerForm.querySelector("input[type='password']");
            if (passwordField && !validatePassword(passwordField.value)) {
                valid = false;
                showError(passwordField, "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα ειδικό σύμβολο.");
            }

            if (!valid) {
                return;
            }

            // Δημιουργία χρήστη στο Firestore
            const user = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
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
                status: "Σε αναμονή"  // Κατάσταση χρήστη ως "Σε αναμονή"
            };

            // Δημιουργία χρήστη με Firebase Authentication
            createUserWithEmailAndPassword(auth, user.email, user.password)
                .then((userCredential) => {
                    const userAuth = userCredential.user;

                    // Αποθήκευση του χρήστη στη βάση δεδομένων Firestore
                    addDoc(collection(db, "users"), user)
                        .then(() => {
                            alert("Η εγγραφή σας καταχωρήθηκε! Περιμένετε έγκριση από τον διαχειριστή.");
                            registerForm.reset();
                        })
                        .catch((error) => {
                            console.error("Σφάλμα κατά την αποθήκευση του χρήστη: ", error);
                            alert("Σφάλμα κατά την αποθήκευση του χρήστη στο Firestore.");
                        });
                })
                .catch((error) => {
                    console.error("Σφάλμα κατά τη δημιουργία χρήστη: ", error);
                    alert(error.message);
                });
        });
    }

    // Συνάρτηση για εμφάνιση σφαλμάτων
    function showError(element, message) {
        const error = document.createElement("div");
        error.className = "error";
        error.style.color = "red";
        error.style.fontSize = "14px";
        error.style.marginTop = "5px";
        error.innerText = message;
        element.parentNode.appendChild(error);
    }

    // Συνάρτηση για έλεγχο ισχυρού κωδικού πρόσβασης
    function validatePassword(password) {
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return re.test(password);
    }

    // Διαχείριση Αποσύνδεσης
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Σφάλμα κατά την αποσύνδεση: ", error);
            });
        });
    }
});
