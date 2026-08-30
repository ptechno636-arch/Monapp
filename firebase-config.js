// ============================================================
// CONFIGURATION FIREBASE — projet elikem-atelier
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyByMv6bj5_xsuf0re4gkrm-YbGuhtiXROs",
  authDomain: "elikem-atelier.firebaseapp.com",
  projectId: "elikem-atelier",
  storageBucket: "elikem-atelier.firebasestorage.app",
  messagingSenderId: "555373558030",
  appId: "1:555373558030:web:cbc572732d8d44686abf5f",
  measurementId: "G-9FTQ33L6YH"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
