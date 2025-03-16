document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    const adminUsername = "admin";
    const adminPassword = "Admin123!";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyCOBcZaGNGLIT-xv_YA-41bY8m62nU_Udg",
        authDomain: "tqoct-thesis.firebaseapp.com",
        databaseURL: "https://tqoct-thesis-default-rtdb.firebaseio.com",
        projectId: "tqoct-thesis",
        storageBucket: "tqoct-thesis.firebasestorage.app",
        messagingSenderId: "1080065673931",
        appId: "1:1080065673931:web:8081fd4fb4e8ad4e03a94e",
        measurementId: "G-L6YZ1ZSPQM"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Δημιουργία του Admin αν δεν υπάρχει ήδη
    if (!localStorage.getItem("adminCreated")) {
        localStorage.setItem("adminUsername", adminUsername);
        localStorage.setItem("adminPassword", adminPassword);
        localStorage.setItem("adminCreated", "true");
        console.log("Admin δημιουργήθηκε!");
    }

    // Διαχείριση Σύνδεσης
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            // Ανάκτηση χρηστών από τη Firebase
            database.ref("users").once("value", snapshot => {
                const users = snapshot.val() || {};
                const user = Object.values(users).find(u => u.username === username);

                let blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
                if (blockedUsers.includes(username)) {
                    alert("Ο διαχειριστής απέρριψε την πρόσβασή σας. Δεν μπορείτε να συνδεθείτε.");
                    return;
                }

                // Έλεγχος για την αναγνώριση του admin
                if (username === adminUsername && password === adminPassword) {
                    localStorage.setItem("currentUser", username);
                    setTimeout(() => {
                        window.location.href = "admin.html";
                    }, 100);
                } else if (user && user.password === password) {
                    localStorage.setItem("currentUser", username);
                    setTimeout(() => {
                        window.location.href = "instructions.html";
                    }, 100);
                } else {
                    alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
                }
            });
        });
    }

    // Διαχείριση Εγγραφής
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            let valid = true;
            const inputs = registerForm.querySelectorAll("input, select");
            const errorMessages = registerForm.querySelectorAll(".error");

            const usernameField = registerForm.querySelector("input[name='username']");
            if (usernameField && isUsernameTaken(usernameField.value.trim())) {
                valid = false;
                showError(usernameField, "Το όνομα χρήστη υπάρχει ήδη. Παρακαλώ επιλέξτε ένα άλλο.");
            }

            errorMessages.forEach(msg => msg.remove());

            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    valid = false;
                    showError(input, "Αυτό το πεδίο είναι υποχρεωτικό.");
                }
            });

            const emailField = registerForm.querySelector("input[type='email']");
            if (emailField && !validateEmail(emailField.value)) {
                valid = false;
                showError(emailField, "Παρακαλώ εισάγετε ένα έγκυρο email.");
            }

            const passwordField = registerForm.querySelector("input[type='password']");
            if (passwordField && !validatePassword(passwordField.value)) {
                valid = false;
                showError(passwordField, "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, ένα κεφαλαίο γράμμα, έναν αριθμό και ένα ειδικό σύμβολο.");
            }

            if (!valid) {
                event.preventDefault();
            } else {
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
                    status: "Σε αναμονή"
                };

                // Αποθήκευση του χρήστη στο Firebase
                const usersRef = database.ref("users");
                usersRef.push(user);

                localStorage.setItem("currentUser", user.username);

                alert("Η εγγραφή σας καταχωρήθηκε! Περιμένετε έγκριση από τον διαχειριστή.");
                registerForm.reset();
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

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }

    function validatePassword(password) {
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return re.test(password);
    }

    function isUsernameTaken(username) {
        return new Promise((resolve, reject) => {
            const usersRef = database.ref("users");
            usersRef.once("value", snapshot => {
                const users = snapshot.val() || {};
                const isTaken = Object.values(users).some(user => user.username === username);
                resolve(isTaken);
            });
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
    registerForm.addEventListener("submit", function (event) {
        let valid = true;
        const inputs = registerForm.querySelectorAll("input, select");
        const errorMessages = registerForm.querySelectorAll(".error");
    
        // Έλεγχος για κενά πεδία και άλλα validations εδώ
    
        if (!valid) {
            event.preventDefault();
        } else {
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
                status: "Σε αναμονή"
            };
    
            // Αποθήκευση του χρήστη στο Firebase Realtime Database
            const usersRef = ref(db, 'users');
            const newUserRef = push(usersRef);
            set(newUserRef, user).then(() => {
                alert("Η εγγραφή σας καταχωρήθηκε! Περιμένετε έγκριση από τον διαχειριστή.");
                registerForm.reset();  // Καθαρίζουμε τη φόρμα
            }).catch(error => {
                console.error("Σφάλμα κατά την αποθήκευση του χρήστη: ", error);
            });
        }
    });    
});
