// بسيط: تحكم بالعرض بين الشاشات + نقاط ربط Firebase لاحقًا
(() => {
  const views = {
      login: document.getElementById('view-login'),
          signup: document.getElementById('view-signup'),
              forgot: document.getElementById('view-forgot'),
                  chat: document.getElementById('view-chat')
                    };

                      function show(view){
                          Object.values(views).forEach(v => v.classList.remove('active'));
                              views[view].classList.add('active');
                                }

                                  // التنقل
                                    document.getElementById('to-signup').onclick = () => show('signup');
                                      document.getElementById('to-login').onclick = () => show('login');
                                        document.getElementById('to-forgot').onclick = () => show('forgot');
                                          document.getElementById('back-login').onclick = () => show('login');

                                            // نماذج
                                              document.getElementById('form-login').onsubmit = (e) => {
                                                  e.preventDefault();
                                                      const username = document.getElementById('login-username').value.trim();
                                                          const password = document.getElementById('login-password').value;
                                                              const remember = document.getElementById('remember').checked;

                                                                  // TODO: اربط هنا مع Firebase Auth لتسجيل الدخول باسم المستخدم
                                                                      // مثال: signInWithCustom(username,password) ... ثم:
                                                                          fakeLogin(username, password, remember);
                                                                            };

                                                                              document.getElementById('form-signup').onsubmit = (e) => {
                                                                                  e.preventDefault();
                                                                                      const email = document.getElementById('signup-email').value.trim();
                                                                                          const username = document.getElementById('signup-username').value.trim();
                                                                                              const p1 = document.getElementById('signup-password').value;
                                                                                                  const p2 = document.getElementById('signup-password2').value;
                                                                                                      if(p1 !== p2){ alert('كلمة المرور وتأكيدها غير متطابقتين'); return; }
                                                                                                          // TODO: هنا تنشئ مستخدم Firebase Auth باستخدام الإيميل + تحفظ اسم المستخدم في قاعدة البيانات مع التحقق من عدم التكرار
                                                                                                              fakeSignup(email, username);
                                                                                                                };

                                                                                                                  document.getElementById('form-forgot').onsubmit = (e) => {
                                                                                                                      e.preventDefault();
                                                                                                                          const email = document.getElementById('forgot-email').value.trim();
                                                                                                                              // TODO: call Firebase sendPasswordResetEmail(email)
                                                                                                                                  alert('تم طلب رابط إعادة التعيين (تجريبي)');
                                                                                                                                    };

                                                                                                                                      // ملف الشخصي حفظ
                                                                                                                                        document.getElementById('save-profile').onclick = () => {
                                                                                                                                            const name = document.getElementById('profile-name').value.trim();
                                                                                                                                                const age = document.getElementById('profile-age').value;
                                                                                                                                                    const bio = document.getElementById('profile-bio').value.trim();
                                                                                                                                                        // TODO: حفظ الملف في قاعدة بيانات المستخدمين (Firestore)
                                                                                                                                                            console.log('حفظ الملف', {name, age, bio});
                                                                                                                                                                alert('تم حفظ الملف (تجريبي)');
                                                                                                                                                                  };

                                                                                                                                                                    // إرسال رسالة (تجريبي)
                                                                                                                                                                      document.getElementById('send-msg').onclick = () => {
                                                                                                                                                                          const txt = document.getElementById('message-input').value.trim();
                                                                                                                                                                              if(!txt) return;
                                                                                                                                                                                  // TODO: ارفع الرسالة لقاعدة البيانات وبيِّنها في chat-box
                                                                                                                                                                                      const box = document.getElementById('chat-box');
                                                                                                                                                                                          const p = document.createElement('p'); p.textContent = 'أنت: ' + txt;
                                                                                                                                                                                              box.appendChild(p);
                                                                                                                                                                                                  document.getElementById('message-input').value = '';
                                                                                                                                                                                                      box.scrollTop = box.scrollHeight;
                                                                                                                                                                                                        };

                                                                                                                                                                                                          // تسجيل خروج تجريبي
                                                                                                                                                                                                            document.getElementById('logout').onclick = () => {
                                                                                                                                                                                                                // TODO: Firebase signOut
                                                                                                                                                                                                                    show('login');
                                                                                                                                                                                                                        alert('تم تسجيل الخروج (تجريبي)');
                                                                                                                                                                                                                          };

                                                                                                                                                                                                                            // منطقة مالك - تمكن عرض أزرار المالك بعد التحقق
                                                                                                                                                                                                                              function setOwnerMode(isOwner){
                                                                                                                                                                                                                                  document.getElementById('admin-area').style.display = isOwner ? 'block' : 'none';
                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                      // ----- أمثلة تجريبية (بدون Firebase) -----
                                                                                                                                                                                                                                        function fakeLogin(u,p,remember){
                                                                                                                                                                                                                                            // محاكاة: إذا كان اسم المستخدم "admin" اعتبره مالك
                                                                                                                                                                                                                                                show('chat');
                                                                                                                                                                                                                                                    document.getElementById('welcome-title').textContent = `أهلًا ${u || 'مستخدم'}`;
                                                                                                                                                                                                                                                        setOwnerMode(u === 'admin');
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                            function fakeSignup(email, username){
                                                                                                                                                                                                                                                                alert('تم إنشاء الحساب (تجريبي). الآن سيتم العودة لتسجيل الدخول.');
                                                                                                                                                                                                                                                                    show('login');
                                                                                                                                                                                                                                                                        document.getElementById('login-username').value = username;
                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                            // ----- نقطة بدء للربط مع Firebase -----
                                                                                                                                                                                                                                                                              // لاحقًا: ضع هنا تهيئة Firebase SDK مثل:
                                                                                                                                                                                                                                                                                // const firebaseConfig = { apiKey: "...", authDomain: "...", ... };
                                                                                                                                                                                                                                                                                  // firebase.initializeApp(firebaseConfig);
                                                                                                                                                                                                                                                                                    // ثم استبدل TODO أعلاه باستدعاءات Firebase Auth + Firestore.

                                                                                                                                                                                                                                                                                    })();