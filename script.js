// Central script: Firebase init + helpers for profiles, roles, rooms, moderation
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, onSnapshot, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDJhA1WkFsLZiQz5WZFWPFbdjxLPtG57ss",
  authDomain: "lloo-756f7.firebaseapp.com",
  projectId: "lloo-756f7",
  storageBucket: "lloo-756f7.firebasestorage.app",
  messagingSenderId: "951071688513",
  appId: "1:951071688513:web:46f402720b38f15c5043c0"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Owner email (you) - grant owner privileges automatically
export const OWNER_EMAIL = "gamra.akm@gmail.com"; // <-- استبدل بإيميلك الفعلي

// Helper: create user profile document (after signup)
export async function createProfile(uid, data) {
  const profileRef = doc(db, "profiles", uid);
  await setDoc(profileRef, data, { merge: true });
}

// Helper: check if displayName is unique
export async function isDisplayNameUnique(name) {
  const profiles = collection(db, "profiles");
  const q = query(profiles, where("displayName", "==", name));
  const snap = await getDocs(q);
  return snap.empty;
}

// Helper: get current user's profile
export async function getProfile(uid) {
  const ref = doc(db, "profiles", uid);
  const d = await getDoc(ref);
  return d.exists() ? d.data() : null;
}

// Roles and moderation
export async function promoteUser(targetUid, newRole) {
  const ref = doc(db, "profiles", targetUid);
  await updateDoc(ref, { role: newRole });
}
export async function muteUser(targetUid, minutes) {
  const ref = doc(db, "profiles", targetUid);
  const until = Date.now() + minutes*60*1000;
  await updateDoc(ref, { mutedUntil: until });
}
export async function banUser(targetUid) {
  const ref = doc(db, "profiles", targetUid);
  await updateDoc(ref, { banned: true });
}

// Rooms and messages
export async function createPrivateRoom(u1, u2) {
  // room id created by concatenated sorted uids to be unique
  const ids = [u1, u2].sort();
  const roomId = 'private_' + ids.join("_");
  const roomRef = doc(db, "rooms", roomId);
  const exists = await getDoc(roomRef);
  if (!exists.exists()) {
    await setDoc(roomRef, { type: "private", users: ids, createdAt: serverTimestamp() });
  }
  return roomId;
}

export async function sendMessage(roomId, userEmail, text) {
  const messagesRef = collection(db, "rooms", roomId, "messages");
  await addDoc(messagesRef, { user: userEmail, text, timestamp: serverTimestamp() });
}

// Broadcast (owner/admin)
export async function sendBroadcast(userEmail, text) {
  const bRef = collection(db, "broadcasts");
  await addDoc(bRef, { user: userEmail, text, timestamp: serverTimestamp() });
}

// realtime listeners helpers
export function listenRoomMessages(roomId, callback) {
  const messagesRef = collection(db, "rooms", roomId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    callback(arr);
  });
}

export function listenBroadcasts(callback) {
  const bRef = collection(db, "broadcasts");
  const q = query(bRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    callback(arr);
  });
}

// Utility: format short name
export function shortName(email) {
  return email ? email.split("@")[0] : "";
}

// Expose Firestore serverTimestamp if needed
export { serverTimestamp };