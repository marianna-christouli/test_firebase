
// Εισαγωγή των λειτουργιών που χρειάζεστε από το Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, set, update, child } from "firebase/database";  // Χρήση Realtime Database
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOBcZaGNGLIT-xv_YA-41bY8m62nU_Udg",
  authDomain: "tqoct-thesis.firebaseapp.com",
  databaseURL: "https://tqoct-thesis-default-rtdb.firebaseio.com",  // Σύνδεση στο Realtime Database
  projectId: "tqoct-thesis",
  storageBucket: "tqoct-thesis.firebasestorage.app",
  messagingSenderId: "1080065673931",
  appId: "1:1080065673931:web:8081fd4fb4e8ad4e03a94e",
  measurementId: "G-L6YZ1ZSPQM"
};

// Αρχικοποίηση Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);  // Χρησιμοποιούμε το Realtime Database 


// Διαχείριση Σύνδεσης
document.addEventListener("DOMContentLoaded", function () {

    // Σύνδεση Admin
    const adminUsername = "admin";
    const adminPassword = "Admin123!";

    const adminRef = ref(db, 'users/admin');
    get(adminRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(adminRef, { username: adminUsername, password: adminPassword })
                .then(() => console.log("Admin δημιουργήθηκε!"))
                .catch(error => console.error("Σφάλμα κατά τη δημιουργία του Admin: ", error));
        }
    });      

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            try {
                const userRef = ref(db, `users/${username}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();

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
                // Αποθήκευση του χρήστη στο Realtime Database
                await set(ref(db, `users/${user.username}`), user);
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

    // Συνάρτηση για την αποσύνδεση
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            // Αποσύνδεση από Firebase Authentication
            signOut(auth).then(() => {
                // Καθαρισμός των στοιχείων σύνδεσης
                sessionStorage.removeItem("loggedIn");
                localStorage.removeItem("loggedIn");

                // Ανακατεύθυνση στην αρχική σελίδα
                window.location.href = "index.html";
            }).catch(error => {
                console.error("Σφάλμα κατά την αποσύνδεση: ", error);
            });
        });
    }

    // Συνάρτηση για έλεγχο αν το όνομα χρήστη είναι ήδη καταχωρημένο στο Firebase Realtime Database
    function isUsernameTaken(username) {
        const usersRef = ref(db, 'users'); // Αναφορά στους χρήστες στο Realtime Database
        return get(usersRef).then(snapshot => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                return Object.keys(users).some(userId => users[userId].username === username);
            }
            return false;
        });
    }

    // Φόρτωμα χρηστών στο Admin Panel από Firebase Realtime Database
    function loadUsers() {
        const usersRef = ref(db, 'users');
        get(usersRef).then(snapshot => {
            const userListContainer = document.getElementById("users");
            userListContainer.innerHTML = "";  // Καθαρίζουμε τα προηγούμενα δεδομένα

            if (snapshot.exists()) {
                const users = snapshot.val();
                Object.keys(users).forEach((userId, index) => {
                    const user = users[userId];
                    const isDisabled = user.status === "approved" || user.status === "rejected";
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.status || "Σε αναμονή"}</td>
                        <td>
                            <button class="approve" id="approve-${index}" onclick="approveUser('${userId}')" ${isDisabled ? "disabled" : ""}>Έγκριση</button>
                            <button class="reject" id="reject-${index}" onclick="rejectUser('${userId}')" ${isDisabled ? "disabled" : ""}>Απόρριψη</button>
                        </td>
                    `;
                    userListContainer.appendChild(row);
                });
            } else {
                userListContainer.innerHTML = "<tr><td colspan='4'>Δεν υπάρχουν χρήστες προς έγκριση.</td></tr>";
            }
        });
    }

    loadUsers();

    // Έγκριση χρήστη
    function approveUser(userId) {
        const userRef = ref(db, 'users/' + userId);
        update(userRef, { status: "approved" })
            .then(() => {
                alert("Ο χρήστης εγκρίθηκε!");
                loadUsers();
            })
            .catch((error) => {
                console.error("Σφάλμα κατά την έγκριση χρήστη: ", error);
            });
    }

    // Απόρριψη χρήστη
    function rejectUser(userId) {
        const userRef = ref(db, 'users/' + userId);
        update(userRef, { status: "rejected" })
            .then(() => {
                // Αν χρειάζεται να καταχωρήσεις τους απορριμμένους χρήστες σε άλλη θέση
                const blockedUsersRef = ref(db, 'blockedUsers');
                get(blockedUsersRef).then(snapshot => {
                    let blockedUsers = snapshot.exists() ? snapshot.val() : [];
                    blockedUsers.push(userId);
                    set(blockedUsersRef, blockedUsers);
                });
                alert("Ο χρήστης απορρίφθηκε!");
                loadUsers();
            })
            .catch((error) => {
                console.error("Σφάλμα κατά την απόρριψη χρήστη: ", error);
            });
    }

    // Συνάρτηση εξαγωγής σε CSV
    function exportToCSV() {
        const resultsTable = document.getElementById('resultsTable');
        if (!resultsTable) {
            alert("Ο πίνακας αποτελεσμάτων δεν βρέθηκε!");
            return;
        }       

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Προσθήκη των επικεφαλίδων του πίνακα
        csvContent += "ΧΡΗΣΤΗΣ,ΑΝΘΡΩΠΟΚΕΝΤΡΙΚΟΤΗΤΑ,ΚΛΙΝΙΚΗ ΑΠΟΤΕΛΕΣΜΑΤΙΚΟΤΗΤΑ,ΑΣΦΑΛΕΙΑ - ΑΠΟΡΡΗΤΟ,ΣΥΝΟΛΟ\n";
        
        // Προσθήκη των δεδομένων κάθε χρήστη
        const rows = resultsTable.querySelectorAll('tr');
        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            let rowData = [];
            cols.forEach(col => rowData.push(col.innerText));
            csvContent += rowData.join(",") + "\n";
        });

        // Δημιουργία του link για κατέβασμα του CSV
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Συνάρτηση εξαγωγής σε PDF
    function exportToPDF() {
        if (typeof jsPDF === 'undefined') {
            alert("Το jsPDF δεν φορτώθηκε σωστά!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yOffset = 10;

        // Εγγραφή του τίτλου
        doc.text('Αποτελέσματα Χρηστών', 10, yOffset);
        yOffset += 10;

        const table = document.querySelector('#resultsTable');
        if (!table) {
            alert("Δεν βρέθηκε ο πίνακας αποτελεσμάτων!");
            return;
        }

        const rows = table.querySelectorAll('tr');
        if (rows.length === 0) {
            alert("Δεν υπάρχουν δεδομένα στον πίνακα!");
            return;
        }

        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            let rowText = '';
            cols.forEach(col => {
                rowText += col.innerText + " | ";
            });

            doc.text(rowText, 10, yOffset);
            yOffset += 10;

            if (yOffset > 280) {
                doc.addPage();
                yOffset = 10;
            }
        });

        doc.save('results.pdf');
    }
});
