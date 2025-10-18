const signupButton = document.getElementById("signup-btn");

signupButton.addEventListener("click", async (e) => {
  e.preventDefault();

  signupButton.disabled = true; // يمنع النقر مرتين
  signupButton.innerText = "جاري الإنشاء...";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("تم إنشاء الحساب بنجاح ✅");
    window.location.href = "login.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("البريد الإلكتروني مستخدم مسبقًا ⚠️");
    } else if (error.code === "auth/invalid-email") {
      alert("البريد الإلكتروني غير صالح ❌");
    } else if (error.code === "auth/weak-password") {
      alert("كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل 🔒");
    } else {
      alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
    }
  } finally {
    signupButton.disabled = false;
    signupButton.innerText = "إنشاء حساب";
  }
});