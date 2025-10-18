function sendMessage() {
  const input = document.getElementById("messageInput");
  const chatBox = document.getElementById("chatBox");

  if (input.value.trim() === "") return;

  // رسالة المستخدم
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerText = input.value;
  chatBox.appendChild(userMsg);

  // رد البوت البسيط
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.innerText = "تم استلام رسالتك ✅";
  chatBox.appendChild(botMsg);

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}