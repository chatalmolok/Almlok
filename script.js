// script.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

/* ======= ضع هنا إعدادات المشروع (مأخوذة من chat.html) ======= */
const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};
/* ============================================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const page = document.body.dataset.page || "";

function el(id) { return document.getElementById(id); }

/* --------------------- صفحة التسجيل --------------------- */
async function handleSignup() {
  const usernameI = el('register-username');
  const emailI = el('register-email');
  const passI = el('register-password');
  const btn = el('register-btn');

  btn.addEventListener('click', async () => {
    const username = usernameI.value.trim();
    const email = emailI.value.trim();
    const password = passI.value;

    if (!username || !email || !password) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      // حفظ بيانات المستخدم في مجموعة users
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        rank: "مستخدم عادي",
        createdAt: serverTimestamp()
      });

      alert("تم إنشاء الحساب بنجاح!");
      window.location.href = "login.html";
    } catch (err) {
      alert("حدث خطأ: " + err.message);
    }
  });
}

/* --------------------- صفحة تسجيل الدخول --------------------- */
function handleLogin() {
  const emailI = el('login-email');
  const passI = el('login-password');
  const btn = el('login-btn');

  btn.addEventListener('click', async () => {
    const email = emailI.value.trim();
    const password = passI.value;
    if (!email || !password) { alert("أدخل البريد وكلمة المرور"); return; }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // عند الدخول بنجاح توجه إلى الدردشة
      window.location.href = "chat.html";
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  });
}

/* --------------------- صفحة إعادة التعيين --------------------- */
function handleReset() {
  const emailI = el('reset-email');
  const btn = el('reset-btn');

  btn.addEventListener('click', async () => {
    const email = emailI.value.trim();
    if (!email) { alert("أدخل بريدك"); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("تم إرسال رابط إعادة التعيين إلى بريدك ✅");
      window.location.href = "login.html";
    } catch (err) {
      alert("حدث خطأ: " + err.message);
    }
  });
}

/* --------------------- صفحة الدردشة --------------------- */
async function handleChat() {
  const messagesDiv = el('messages');
  const input = el('messageInput');
  const sendBtn = el('sendBtn');
  const logoutBtn = el('logout-btn');
  const userDisplay = el('user-display');

  // تحقق من حالة الدخول
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // جلب اسم المستخدم من المجموعة users
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : { username: user.email };
    userDisplay.textContent = userData.username || user.email;

    // تحميل الرسائل (الترتيب تصاعدي حسب timestamp)
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
      messagesDiv.innerHTML = "";
      snapshot.forEach((d) => {
        const data = d.data();
        const elMsg = document.createElement('div');
        elMsg.className = 'message';
        // عرض المرسل و النص
        const name = data.username || 'مجهول';
        const txt = data.text || '';
        elMsg.innerHTML = `<strong>${escapeHtml(name)}:</strong> ${escapeHtml(txt)}`;
        messagesDiv.appendChild(elMsg);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // إرسال رسالة
    sendBtn.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      try {
        await addDoc(collection(db, "messages"), {
          uid: user.uid,
          username: userData.username || user.email,
          text,
          timestamp: serverTimestamp()
        });
        input.value = "";
      } catch (err) {
        alert("خطأ بالإرسال: " + err.message);
      }
    });

    // خروج
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  });
}

/* -------------- مساعدة: حماية XSS بسيطة عند عرض نصوص المستخدم -------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ----------------- تشغيل حسب الصفحة ----------------- */
if (page === 'signup') handleSignup();
else if (page === 'login') handleLogin();
else if (page === 'reset') handleReset();
else if (page === 'chat') handleChat();
/* index صفحة لا تحتاج js إضافي لكن الملف محمّل لكي نجعل نفس الـ script يعمل في كل صفحة */