// ========== إعداد Firebase ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, addDoc, 
  collection, query, where, getDocs, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 🔧 إعدادات مشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ========== إنشاء حساب جديد ==========
export async function registerUser(email, password, name, age, bio) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const userRef = doc(db, "profiles", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email,
      displayName: name || email.split("@")[0],
      age: age || "",
      bio: bio || "",
      role: "user",
      createdAt: serverTimestamp()
    });
    alert("تم إنشاء الحساب بنجاح ✅");
    window.location.href = "login.html";
  } catch (err) {
    console.error("خطأ في التسجيل:", err.message);
    alert("حدث خطأ أثناء إنشاء الحساب: " + err.message);
  }
}

// ========== تسجيل الدخول ==========
export async function loginUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "chat.html";
  } catch (err) {
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
      alert("كلمة المرور أو البريد غير صحيح ❌");
    } else if (err.code === "auth/user-not-found") {
      alert("المستخدم غير موجود ❌");
    } else {
      alert("حدث خطأ أثناء تسجيل الدخول ❌");
    }
  }
}

// ========== إعادة تعيين كلمة المرور ==========
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني ✉️");
  } catch (err) {
    alert("حدث خطأ أثناء إرسال الرابط: " + err.message);
  }
}

// ========== تسجيل خروج ==========
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "login.html";
}

// ========== تحميل الملف الشخصي ==========
export async function getProfile(uid) {
  if (!uid) return null;
  try {
    const ref = doc(db, "profiles", uid);
    const d = await getDoc(ref);
    return d.exists() ? d.data() : null;
  } catch (err) {
    console.error("خطأ في تحميل الملف الشخصي:", err);
    return null;
  }
}

// ========== إرسال رسالة ==========
export async function sendMessage(roomId, userEmail, text) {
  try {
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      user: userEmail,
      text,
      time: serverTimestamp()
    });
  } catch (err) {
    console.error("خطأ أثناء إرسال الرسالة:", err);
  }
}

// ========== الاستماع إلى الرسائل ==========
export function listenRoomMessages(roomId, callback) {
  const ref = collection(db, "rooms", roomId, "messages");
  return onSnapshot(ref, (snap) => {
    const arr = snap.docs.map((d) => d.data());
    callback(arr);
  });
}

// ========== إنشاء محادثة خاصة ==========
export async function createPrivateRoom(uid1, uid2) {
  const ids = [uid1, uid2].sort().join("_");
  const ref = doc(db, "rooms", ids);
  const d = await getDoc(ref);
  if (!d.exists()) {
    await setDoc(ref, { private: true, users: [uid1, uid2], createdAt: serverTimestamp() });
  }
  return ids;
}

// ========== بث رسالة عامة ==========
export async function sendBroadcast(sender, text) {
  await addDoc(collection(db, "broadcasts"), {
    sender,
    text,
    time: serverTimestamp()
  });
}

export function listenBroadcasts(callback) {
  const ref = collection(db, "broadcasts");
  return onSnapshot(ref, (snap) => {
    const arr = snap.docs.map((d) => d.data());
    callback(arr);
  });
}

// ========== ترقية مستخدم ==========
export async function promoteUser(uid, newRole) {
  const ref = doc(db, "profiles", uid);
  await updateDoc(ref, { role: newRole });
}

// ========== كتم مستخدم ==========
export async function muteUser(uid, minutes) {
  const ref = doc(db, "profiles", uid);
  const muteUntil = Date.now() + minutes * 60000;
  await updateDoc(ref, { mutedUntil: muteUntil, role: "muted" });
}

// ========== حظر مستخدم ==========
export async function banUser(uid) {
  const ref = doc(db, "profiles", uid);
  await updateDoc(ref, { role: "banned" });
}

// ========== أدوات عامة ==========
export function shortName(email) {
  if (!email) return "مجهول";
  return email.split("@")[0];
}