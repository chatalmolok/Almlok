// ✅ استيراد مكتبات Firebase من الإصدار 12.4.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};

// ✅ تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ إنشاء حساب جديد
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // حفظ بيانات المستخدم في Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date().toISOString()
      });

      alert("🎉 تم إنشاء الحساب بنجاح!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("خطأ أثناء إنشاء الحساب:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("⚠️ هذا البريد الإلكتروني مسجل بالفعل!");
      } else {
        alert("حدث خطأ: " + error.message);
      }
    }
  });
}

// ✅ تسجيل الدخول
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ تم تسجيل الدخول بنجاح!");
      window.location.href = "chat.html";
    } catch (error) {
      console.error("خطأ أثناء تسجيل الدخول:", error);
      alert("❌ فشل تسجيل الدخول: " + error.message);
    }
  });
}