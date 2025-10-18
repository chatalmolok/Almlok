// ✅ استيراد مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ✅ إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ دالة عامة للتنبيه الذهبي
function showAlert(message, color = "gold", textColor = "black") {
  let alertBox = document.querySelector(".alert");
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.className = "alert";
    alertBox.style.position = "fixed";
    alertBox.style.top = "20px";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translateX(-50%)";
    alertBox.style.background = color;
    alertBox.style.color = textColor;
    alertBox.style.padding = "10px 20px";
    alertBox.style.borderRadius = "10px";
    alertBox.style.fontWeight = "bold";
    alertBox.style.boxShadow = "0 0 10px gold";
    alertBox.style.zIndex = "9999";
    document.body.appendChild(alertBox);
  }
  alertBox.textContent = message;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3000);
}

// ✅ إنشاء حساب جديد
export async function registerUser(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showAlert("تم إنشاء الحساب بنجاح 🎉");
    setTimeout(() => (window.location.href = "login.html"), 2000);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      showAlert("هذا البريد مستخدم مسبقًا", "red", "white");
    } else if (error.code === "auth/weak-password") {
      showAlert("كلمة المرور ضعيفة جدًا", "red", "white");
    } else {
      showAlert("حدث خطأ أثناء التسجيل", "red", "white");
    }
  }
}

// ✅ تسجيل الدخول
export async function loginUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showAlert("تم تسجيل الدخول بنجاح ✅");
    setTimeout(() => (window.location.href = "chat.html"), 1500);
  } catch (error) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
      showAlert("كلمة المرور غير صحيحة ❌", "red", "white");
    } else if (error.code === "auth/user-not-found") {
      showAlert("البريد الإلكتروني غير موجود", "red", "white");
    } else {
      showAlert("حدث خطأ أثناء تسجيل الدخول", "red", "white");
    }
  }
}