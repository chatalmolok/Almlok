// إعداد Firebase
const firebaseConfig = {
  apiKey: "ضع المفتاح هنا",
    authDomain: "ضع رابط المشروع هنا",
      projectId: "ضع معرف المشروع هنا",
        storageBucket: "ضع اسم التخزين هنا",
          messagingSenderId: "ضع الرقم هنا",
            appId: "ضع App ID هنا"
            };

            firebase.initializeApp(firebaseConfig);
            const auth = firebase.auth();
            const db = firebase.firestore();

            // عرض النماذج
            function showRegister() {
              document.getElementById('login-form').style.display = 'none';
                document.getElementById('register-form').style.display = 'block';
                }
                function showLogin() {
                  document.getElementById('login-form').style.display = 'block';
                    document.getElementById('register-form').style.display = 'none';
                    }

                    // تسجيل مستخدم جديد
                    function registerUser() {
                      const email = document.getElementById('register-email').value;
                        const password = document.getElementById('register-password').value;
                          const username = document.getElementById('register-username').value;

                            if (!email || !password || !username) {
                                alert("يرجى ملء جميع الحقول");
                                    return;
                                      }

                                        auth.createUserWithEmailAndPassword(email, password)
                                            .then((userCredential) => {
                                                  const user = userCredential.user;
                                                        return db.collection("users").doc(user.uid).set({
                                                                username: username,
                                                                        email: email,
                                                                                rank: "مستخدم عادي"
                                                                                      });
                                                                                          })
                                                                                              .then(() => {
                                                                                                    alert("تم إنشاء الحساب بنجاح!");
                                                                                                          showLogin();
                                                                                                              })
                                                                                                                  .catch((error) => alert(error.message));
                                                                                                                  }

                                                                                                                  // تسجيل الدخول
                                                                                                                  function loginUser() {
                                                                                                                    const email = document.getElementById('login-email').value;
                                                                                                                      const password = document.getElementById('login-password').value;

                                                                                                                        auth.signInWithEmailAndPassword(email, password)
                                                                                                                            .then((userCredential) => {
                                                                                                                                  const user = userCredential.user;
                                                                                                                                        db.collection("users").doc(user.uid).get().then((doc) => {
                                                                                                                                                document.getElementById('login-form').style.display = 'none';
                                                                                                                                                        document.getElementById('register-form').style.display = 'none';
                                                                                                                                                                document.getElementById('profile').style.display = 'block';
                                                                                                                                                                        document.getElementById('user-name').textContent = doc.data().username;
                                                                                                                                                                                document.getElementById('user-email').textContent = doc.data().email;
                                                                                                                                                                                      });
                                                                                                                                                                                          })
                                                                                                                                                                                              .catch((error) => alert("خطأ: " + error.message));
                                                                                                                                                                                              }

                                                                                                                                                                                              // تسجيل الخروج
                                                                                                                                                                                              function logoutUser() {
                                                                                                                                                                                                auth.signOut().then(() => {
                                                                                                                                                                                                    document.getElementById('profile').style.display = 'none';
                                                                                                                                                                                                        document.getElementById('login-form').style.display = 'block';
                                                                                                                                                                                                          });
                                                                                                                                                                                                          }