import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// إنشاء حساب جديد
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) return alert("يرجى تعبئة جميع الحقول");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), { username, email, createdAt: new Date() });
      alert("تم إنشاء الحساب بنجاح ✅");
      window.location.href = "login.html";
    } catch (error) {
      alert("حدث خطأ: " + error.message);
    }
  });
}

// تسجيل الدخول
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const loginInput = document.getElementById("loginInput").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!loginInput || !password) return alert("يرجى إدخال البيانات كاملة");

    try {
      let email = loginInput;
      if (!loginInput.includes("@")) {
        const q = query(collection(db, "users"), where("username", "==", loginInput));
        const snap = await getDocs(q);
        if (snap.empty) return alert("اسم المستخدم غير موجود");
        email = snap.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, email, password);
      alert("تم تسجيل الدخول بنجاح ✅");
      window.location.href = "chat.html";
    } catch (error) {
      alert("خطأ: " + error.message);
    }
  });
}

// تسجيل الخروج (اختياري للاستخدام في chat.html)
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "login.html";
}
