// helper script to export logout function (chat.html can import it)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function logoutUser(){
  await signOut(auth);
  window.location.href = 'login.html';
}
