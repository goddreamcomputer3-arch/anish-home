import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCsH70pG6m27vOHacTxu7aw9dJKofg-qzw",
    authDomain: "led-control-5659c.firebaseapp.com",
    databaseURL: "https://led-control-5659c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "led-control-5659c",
    storageBucket: "led-control-5659c.firebasestorage.app",
    messagingSenderId: "682284168842",
    appId: "1:682284168842:web:cd7d3bab8168a4210f1f73"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);
const dbPath = "board1/outputs/digital";

// Update the visual state (moves the switch and changes text)
function updateUI(pin, value) {
    const toggle = document.getElementById("toggle" + pin);
    const status = document.getElementById("status" + pin);
    if (!toggle || !status) return;

    if (value === 1) {
        toggle.checked = true; // Slides switch to ON
        status.innerText = "ON";
        status.style.color = "#10b981"; // Green text
    } else {
        toggle.checked = false; // Slides switch to OFF
        status.innerText = "OFF";
        status.style.color = "#ef4444"; // Red text
    }
}

// Logic for clicking the toggle switches
[2, 21, 22].forEach(pin => {
    const toggle = document.getElementById("toggle" + pin);
    
    toggle.onchange = (e) => {
        // e.target.checked returns true if ON, false if OFF
        const isNowOn = e.target.checked;
        set(ref(db, `${dbPath}/${pin}`), isNowOn ? 1 : 0);
    };

    // Watch for changes in Firebase (if another device turns it on)
    onValue(ref(db, `${dbPath}/${pin}`), (snapshot) => {
        updateUI(pin, snapshot.val());
    });
});

// Authentication logic
document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("emailField").value;
    const pass = document.getElementById("passwordField").value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Login Failed: " + err.message));
};

document.getElementById("logoutBtn").onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    document.getElementById("authBox").style.display = user ? "none" : "block";
    document.getElementById("controlBox").style.display = user ? "grid" : "none";
    const badge = document.getElementById("statusBadge");
    badge.className = user ? "status-badge online" : "status-badge offline";
    badge.innerText = user ? "Online" : "Offline";
});
