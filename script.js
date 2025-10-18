import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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
const db = getFirestore(app);

// تسجيل مستخدم جديد
export async function registerUser(username, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      rank: "user",
      createdAt: new Date()
    });
    alert("تم إنشاء الحساب بنجاح!");
  } catch (error) {
    alert("خطأ: " + error.message);
  }
}

// تسجيل الدخول
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("تم تسجيل الدخول بنجاح!");
    window.location.href = "chat.html";
  } catch (error) {
    alert("خطأ: " + error.message);
  }
}

// تسجيل الخروج
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "login.html";
}
