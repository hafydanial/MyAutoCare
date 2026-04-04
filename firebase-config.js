// ═══════════════════════════════════════════════════════
// MyAutoCare — Firebase Configuration
// ═══════════════════════════════════════════════════════
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project — name it "myautocare"
// 3. Click "Add app" → Web → Register app
// 4. Copy your firebaseConfig values below
// 5. In Firebase console: Build → Firestore Database → Create (start in test mode)
// 6. Build → Authentication → Get Started → Enable "Email/Password"

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── REPLACE THESE WITH YOUR FIREBASE PROJECT VALUES ───
const firebaseConfig = {
  apiKey:            "AIzaSyAqN0nW66a2lBrjm_8UDafYkOUme1zhvRE",
  authDomain:        "myautocare-77996.firebaseapp.com",
  projectId:         "myautocare-77996",
  storageBucket:     "myautocare-77996.firebasestorage.app",
  messagingSenderId: "750791367549",
  appId:             "1:750791367549:web:4d2d50356216aaca9dca14"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
