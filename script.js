// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    const adminUsername = "admin";
    const adminPassword = "Admin123!";

    // Δημιουργία του Admin αν δεν υπάρχει ήδη στο Firestore
    const adminDocRef = doc(db, "admins", "admin");
    getDocs(adminDocRef).then(docSnapshot => {
        if (!docSnapshot.exists()) {
            // Δημιουργία admin στο Firestore
            addDoc(collection(db, "admins"), { username: adminUsername, password: adminPassword })
                .then(() => {
                    console.log("Admin δημιουργήθηκε!");
                })
                .catch(error => console.error("Σφάλμα κατά τη δημιουργία του Admin: ", error));
        }
    });

    // Διαχείριση Σύνδεσης
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            // Έλεγχος για τη σύνδεση του admin από Firestore
            getDocs(adminDocRef).then(snapshot => {
                const adminData = snapshot.docs.map(doc => doc.data())[0];
                if (username === adminData.username && password === adminData.password) {
                    // Admin σύνδεση
                    signInWithEmailAndPassword(auth, username, password)
                        .then(() => {
                            window.location.href = "admin.html";
                        })
                        .catch(error => {
                            alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
                        });
                } else {
                    // Σύνδεση με Firebase Authentication
                    signInWithEmailAndPassword(auth, username, password)
                        .then((userCredential) => {
                            const user = userCredential.user;
                            window.location.href = "instructions.html";
                        })
                        .catch((error) => {
                            alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
                        });
                }
            });
        });
    }

    // Διαχείριση Εγγραφής
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let valid = true;
            const inputs = registerForm.querySelectorAll("input, select");
            const errorMessages = registerForm.querySelectorAll(".error");

            // Καθαρισμός προηγούμενων μηνυμάτων
            errorMessages.forEach(msg => msg.remove());

            // Έλεγχος για κενά πεδία
            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    valid = false;
                    showError(input, "Αυτό το πεδίο είναι υποχρεωτικό.");
                }
            });

            // Έλεγχος ισχυρότητας κωδικού πρόσβασης
            const passwordField = registerForm.querySelector("input[type='password']");
            if (passwordField && !validatePassword(passwordField.value)) {
                valid = false;
                showError(passwordField, "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα ειδικό σύμβολο.");
            }

            if (!valid) {
                return;
            }

            // Δημιουργία του χρήστη
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

                // Προσθήκη του πεδίου "status" με τιμή "Σε αναμονή"
                status: "Σε αναμονή"  // Νέο σημείο: Ορίζουμε την αρχική κατάσταση ως "Pending"
            };

            // Δημιουργία χρήστη με Firebase Authentication
            createUserWithEmailAndPassword(auth, user.email, user.password)
                .then((userCredential) => {
                    const userAuth = userCredential.user;

                    // Αποθήκευση του χρήστη στη βάση δεδομένων Firestore
                    addDoc(collection(db, "users"), user)
                        .then(() => {
                            alert("Η εγγραφή σας καταχωρήθηκε! Περιμένετε έγκριση από τον διαχειριστή.");
                            registerForm.reset();  // Καθαρίζουμε τη φόρμα
                        })
                        .catch((error) => {
                            console.error("Σφάλμα κατά την αποθήκευση του χρήστη: ", error);
                        });
                })
                .catch((error) => {
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

    // Φόρτωμα χρηστών στο Admin Panel (Firebase Firestore)
    function loadUsers() {
        getDocs(collection(db, "users")).then((querySnapshot) => {
            const userListContainer = document.getElementById("users");
            userListContainer.innerHTML = "";  // Καθαρίζουμε τα προηγούμενα δεδομένα

            if (querySnapshot.empty) {
                userListContainer.innerHTML = "<tr><td colspan='4'>Δεν υπάρχουν χρήστες προς έγκριση.</td></tr>";
            }

            querySnapshot.forEach((doc, index) => {
                const user = doc.data();
                const isDisabled = user.status === "approved" || user.status === "rejected";
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.status || "Σε αναμονή"}</td>
                    <td>
                        <button class="approve" id="approve-${index}" onclick="approveUser('${doc.id}')" ${isDisabled ? "disabled" : ""}>Έγκριση</button>
                        <button class="reject" id="reject-${index}" onclick="rejectUser('${doc.id}')" ${isDisabled ? "disabled" : ""}>Απόρριψη</button>
                    </td>
                `;
                userListContainer.appendChild(row);
            });
        });
    }

    loadUsers();

    // Έγκριση χρήστη
    function approveUser(userId) {
        updateDoc(doc(db, "users", userId), { status: "approved" })
            .then(() => {
                alert("Ο χρήστης εγκρίθηκε!");
                loadUsers();
            }).catch((error) => {
                console.error("Σφάλμα κατά την έγκριση χρήστη: ", error);
            });
    }

    // Απόρριψη χρήστη
    function rejectUser(userId) {
        updateDoc(doc(db, "users", userId), { status: "rejected" })
            .then(() => {
                alert("Ο χρήστης απορρίφθηκε!");
                loadUsers();
            }).catch((error) => {
                console.error("Σφάλμα κατά την απόρριψη χρήστη: ", error);
            });
    }

    window.approveUser = approveUser;
    window.rejectUser = rejectUser;
});
