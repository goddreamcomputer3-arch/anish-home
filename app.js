  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

// Database Path matching ESP32
const dbPath = "board1/outputs/digital/";

const authBox = document.getElementById("authBox");
const controlBox = document.getElementById("controlBox");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMsg = document.getElementById("authMsg");
const badge = document.getElementById("statusBadge");

// Updated keys to match ESP32 GPIO pins
const gpioButtons = {
  "2": document.getElementById("gpio1Btn"),
  "21": document.getElementById("gpio2Btn"),
  "22": document.getElementById("gpio3Btn")
};

const gpioLabels = {
  "2": document.getElementById("gpio1Status"),
  "21": document.getElementById("gpio2Status"),
  "22": document.getElementById("gpio3Status")
};

loginBtn.onclick = async () => {
  authMsg.textContent = "Logging in...";
  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("emailField").value,
      document.getElementById("passwordField").value
    );
  } catch (e) {
    authMsg.textContent = "Error: " + e.message;
  }
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    controlBox.style.display = "block";
    badge.className = "status-badge online";
    badge.textContent = "Online";
    startListeners();
  } else {
    authBox.style.display = "block";
    controlBox.style.display = "none";
    badge.className = "status-badge offline";
    badge.textContent = "Offline";
  }
});

function startListeners() {
  // Listen for changes from Firebase for each pin
  Object.keys(gpioButtons).forEach((pin) => {
    onValue(ref(db, dbPath + pin), (snapshot) => {
      const value = snapshot.val();
      updateUI(pin, value === 1 || value === true ? 1 : 0);
    });
  });

  // Handle Button Clicks
  Object.entries(gpioButtons).forEach(([pin, btn]) => {
    btn.onclick = () => {
      const isCurrentlyOn = btn.classList.contains("on");
      const newState = isCurrentlyOn ? 0 : 1;
      set(ref(db, dbPath + pin), newState);
    };
  });
}

function updateUI(pin, val) {
  const btn = gpioButtons[pin];
  const lab = gpioLabels[pin];
  if (!btn || !lab) return;

  if (val === 1) {
    btn.classList.add("on");
    lab.textContent = `GPIO ${pin}: ON`;
    lab.style.color = "#9effae";
  } else {
    btn.classList.remove("on");
    lab.textContent = `GPIO ${pin}: OFF`;
    lab.style.color = "#d1d1d1";
  }
}
