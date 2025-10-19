// script.js  (module)
// استخدم هذا الملف كـ module (type="module") في صفحاتك.
// يحتوي على: تهيئة Firebase + دوال للتعامل مع Auth, Firestore, Storage
// OWNER_EMAIL تم ضبطه على gamra.akm@gmail.com (مالك المشروع)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

/* ======== 1) اضف هنا إعدادات Firebase (استبدل بالقيم الحقيقية لمشروعك) ======== */
const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};
/* ============================================================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ضع هنا إيميل المالك النهائي — تم وضع الإيميل الذي أعطيتني إياه
const OWNER_EMAIL = "gamra.akm@gmail.com";

/* ----------------- Helpers ----------------- */
function shortName(e) {
  if (!e) return 'مستخدم';
  const name = e.split('@')[0];
  return name.length > 12 ? name.slice(0, 12) + '...' : name;
}

/* ========== Profiles ========== */
// ينشئ / يحدث ملف بروفايل للمستخدم عند التسجيل
async function createProfile(uid, { displayName = null, email = null, role = 'user', bio = '', age = null, avatarUrl = null } = {}) {
  const p = {
    displayName: displayName || shortName(email),
    email: email || null,
    role,
    bio,
    age,
    avatar: avatarUrl || null,
    mutedUntil: null,
    banned: false,
    createdAt: serverTimestamp()
  };
  await setDoc(doc(db, 'profiles', uid), p, { merge: true });
  return p;
}

async function getProfile(uid) {
  if (!uid) return null;
  const d = await getDoc(doc(db, 'profiles', uid));
  return d.exists() ? { uid: d.id, ...d.data() } : null;
}

async function findProfileByEmail(email) {
  const q = query(collection(db, 'profiles'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  let found = null;
  snap.forEach(d => found = { uid: d.id, ...d.data() });
  return found;
}

/* ========== Rooms & Messages ========== */
// غرف عامة معرفه مسبقاً (موازي لواجهة الغرف عندك)
const PUBLIC_ROOMS = [
  { id: 'general', name: 'الدردشة العامة' },
  { id: 'iraq', name: 'روم العراق' },
  { id: 'sa', name: 'روم السعودية' },
  { id: 'eg', name: 'روم مصر' },
  { id: 'sy', name: 'روم سوريا' },
  { id: 'lb', name: 'روم لبنان' },
  { id: 'jo', name: 'روم الاردن' },
  { id: 'kw', name: 'روم الكويت' },
  { id: 'bh', name: 'روم البحرين' },
  { id: 'ae', name: 'روم الامارات' },
  { id: 'om', name: 'روم عمان' },
  { id: 'qa', name: 'روم قطر' },
  { id: 'left', name: 'روم اليمين' },
  { id: 'west', name: 'روم المتغربين' }
];

// إرسال رسالة إلى غرفة (عامّة أو خاصة)
async function sendMessage(roomId, userUid, text) {
  if (!roomId || !userUid || !text) throw new Error('معطيات ناقصة للإرسال');
  const profile = await getProfile(userUid);
  if (!profile) throw new Error('البروفايل غير موجود');

  // تحقق من حالة الحظر أو الكتم
  if (profile.banned) throw new Error('المستخدم محظور');
  if (profile.mutedUntil && profile.mutedUntil.toMillis && profile.mutedUntil.toMillis() > Date.now()) {
    throw new Error('المستخدم مكتوم');
  }

  const payload = {
    text,
    userUid,
    userName: profile.displayName || shortName(profile.email),
    userEmail: profile.email || null,
    createdAt: serverTimestamp()
  };
  await addDoc(collection(db, 'rooms', roomId, 'messages'), payload);
  return true;
}

// استمع للرسائل في غرفة معينة (يرجع unsubscribe function)
function listenRoomMessages(roomId, onUpdate) {
  if (!roomId) return () => {};
  const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, snap => {
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    onUpdate(arr);
  });
  return unsub;
}

/* ========== Private rooms (خاص) ========== */
// استخدم معرف غرفة خاص مبني من uid مرتّبة: private_uidA_uidB
async function createPrivateRoom(uidA, uidB) {
  if (!uidA || !uidB) throw new Error('uids required');
  const ids = [uidA, uidB].sort();
  const roomId = `private_${ids[0]}_${ids[1]}`;
  const ref = doc(db, 'privateRooms', roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: ids,
      createdAt: serverTimestamp(),
      lastMessageAt: null
    });
  }
  return roomId;
}

/* ========== Broadcasts ========== */
async function sendBroadcast(userUid, text) {
  const profile = await getProfile(userUid);
  if (!profile) throw new Error('profile not found');
  if (profile.role !== 'owner' && profile.role !== 'admin') throw new Error('no permission');
  await addDoc(collection(db, 'broadcasts'), {
    text,
    fromUid: userUid,
    fromName: profile.displayName,
    createdAt: serverTimestamp()
  });
}

function listenBroadcasts(onUpdate) {
  const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(50));
  const unsub = onSnapshot(q, snap => {
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    onUpdate(arr);
  });
  return unsub;
}

/* ========== Moderation / Owner actions ========== */
async function promoteUser(targetUid, newRole) {
  const allowedRoles = ['user','vip','advanced','admin','owner'];
  if (!allowedRoles.includes(newRole)) throw new Error('invalid role');
  await updateDoc(doc(db, 'profiles', targetUid), { role: newRole });
}

async function muteUser(targetUid, minutes = 10) {
  const until = new Date(Date.now() + Math.max(1, minutes) * 60000);
  await updateDoc(doc(db, 'profiles', targetUid), { mutedUntil: serverTimestamp() ? until : until });
  // Note: serverTimestamp can't be set to custom date; here we set client time object.
}

async function banUser(targetUid) {
  await updateDoc(doc(db, 'profiles', targetUid), { banned: true });
}

/* ========== Auth helpers for signup/login/reset ======== */
async function signUp(email, password, displayName = null) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const uid = res.user.uid;
  await createProfile(uid, { email, displayName, role: 'user' });
  return res.user;
}

async function signIn(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

async function doSignOut() {
  return signOut(auth);
}

async function doPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

/* ========== Avatar upload ========= */
async function uploadAvatar(uid, file) {
  if (!uid || !file) throw new Error('missing');
  const r = sRef(storage, `avatars/${uid}_${Date.now()}_${file.name}`);
  const snap = await uploadBytes(r, file);
  const url = await getDownloadURL(snap.ref);
  await updateDoc(doc(db, 'profiles', uid), { avatar: url });
  return url;
}

/* ========== Utility: check if current user is owner (based on email) ========== */
function isOwnerByEmail(email) {
  return String(email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/* ================== Exported API ================== */
export {
  auth,
  db,
  storage,
  PUBLIC_ROOMS,
  createProfile,
  getProfile,
  findProfileByEmail,
  createPrivateRoom,
  sendMessage,
  listenRoomMessages,
  listenBroadcasts,
  sendBroadcast,
  promoteUser,
  muteUser,
  banUser,
  signUp,
  signIn,
  doSignOut,
  doPasswordReset,
  uploadAvatar,
  shortName,
  isOwnerByEmail
};