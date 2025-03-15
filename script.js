// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Εξασφάλιση ότι τα πεδία είναι έτοιμα να ληφθούν όταν φορτώσει η σελίδα
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      // Ελέγχουμε αν τα στοιχεία ανήκουν στον admin
      const adminDocRef = doc(db, "users", "admin");  // Η συλλογή "users" και το έγγραφο admin
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        
        // Ελέγχουμε αν το username και το password αντιστοιχούν στον admin
        if (username === adminData.username && password === adminData.password) {
          // Αν ο χρήστης είναι admin, ανακατευθύνουμε στην σελίδα του admin
          window.location.href = "admin.html";
        } else {
          // Αν δεν είναι admin, προσπαθούμε να κάνουμε login με Firebase Authentication
          try {
            await signInWithEmailAndPassword(auth, username + "@domain.com", password);
            window.location.href = "instructions.html";  // Αν είναι κανονικός χρήστης, μεταβαίνουμε στις οδηγίες
          } catch (error) {
            alert("Λάθος όνομα χρήστη ή κωδικός πρόσβασης!");
          }
        }
      } else {
        alert("Ο admin δεν υπάρχει στη βάση δεδομένων!");
      }
    });
  }
});

// Εγγραφή νέου χρήστη (για κανονικούς χρήστες)
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = {
          username: username,
          email: email,
          password: password,
          status: "Σε αναμονή" // Χρήστης σε αναμονή έγκρισης
        };

        // Αποθήκευση χρήστη στη βάση Firestore
        await addDoc(collection(db, "users"), userDoc);

        alert("Η εγγραφή σας ολοκληρώθηκε με επιτυχία!");
        registerForm.reset(); // Καθαρισμός της φόρμας
      } catch (error) {
        alert("Σφάλμα κατά την εγγραφή: " + error.message);
      }
    });
  }
});

// Διαχείριση Αποσύνδεσης
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";  // Επιστροφή στην αρχική σελίδα μετά την αποσύνδεση
      } catch (error) {
        console.error("Σφάλμα κατά την αποσύνδεση: ", error);
      }
    });
  }
});
