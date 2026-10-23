document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. Logout, dropdown, bell ---------- */
  function logout() {
    window.location.href = "login.html";
  }

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("menuLogout").addEventListener("click", logout);

  const userBtn = document.getElementById("userBtn");
  const userMenu = document.getElementById("userMenu");

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("open");
  });
  document.addEventListener("click", () => userMenu.classList.remove("open"));

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") e.preventDefault();
    });
  });

  const bellBadge = document.getElementById("bellBadge");
  bellBadge.classList.toggle("hidden", bellBadge.textContent.trim() === "0");

  document.getElementById("bellBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });


  const conversations = [
    {
      id: 1,
      name: "Dr. Reyes",
      role: "Veterinarian",
      unread: 0,
      typing: false,
      replyIndex: 0,
      messages: [
        { from: "them", text: "Good morning! How can I help you today?", time: "9:00 AM" },
        { from: "me", text: "My dog has been less active today.", time: "9:02 AM" }
      ]
    },
    {
      id: 2,
      name: "Dr. Santos",
      role: "Veterinarian",
      unread: 0,
      typing: false,
      replyIndex: 0,
      messages: [
        { from: "them", text: "Hello! Feel free to ask me about your pet's checkup.", time: "8:30 AM" }
      ]
    },
    {
      id: 3,
      name: "Clinic Staff",
      role: "Support",
      unread: 0,
      typing: false,
      replyIndex: 0,
      messages: [
        { from: "them", text: "Hi! Need help with booking or billing? Just send us a message.", time: "8:00 AM" }
      ]
    }
  ];

  const DEMO_REPLIES = {
    Veterinarian: [
      "Thanks for letting me know. Is your pet still eating and drinking normally?",
      "I see. Please keep an eye on them and note any changes in appetite or behavior.",
      "I recommend booking a checkup so we can examine them properly."
    ],
    Support: [
      "Thanks for reaching out! Let me check that for you.",
      "You can book or reschedule an appointment from the My Appointments page.",
      "Is there anything else I can help you with?"
    ]
  };

  /* ---------- 3. Helpers ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function timeNow() {
    return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function getConvo(id) {
    return conversations.find(c => c.id === id);
  }

  /* ---------- 4. Render ---------- */
  const convoList = document.getElementById("convoList");
  const chatName = document.getElementById("chatName");
  const chatStatus = document.getElementById("chatStatus");
  const messagesBox = document.getElementById("messages");
  const chatForm = document.getElementById("chatForm");
  const msgInput = document.getElementById("msgInput");

  let activeId = conversations[0].id;

  function renderConvos() {
    convoList.innerHTML = "";

    conversations.forEach(c => {
      const btn = el("button", "convo" + (c.id === activeId ? " active" : ""));
      btn.type = "button";
      btn.append(el("span", "convo-name", c.name), el("span", "convo-role", c.role));

      if (c.unread > 0) {
        btn.appendChild(el("span", "convo-unread", String(c.unread)));
      }

      btn.addEventListener("click", () => selectConvo(c.id));
      convoList.appendChild(btn);
    });
  }

  function renderChat() {
    const c = getConvo(activeId);

    chatName.textContent = c.name;
    chatStatus.textContent = c.typing ? c.name + " is typing..." : c.role;
    chatStatus.classList.toggle("typing", c.typing);

    messagesBox.innerHTML = "";

    if (c.messages.length === 0) {
      messagesBox.appendChild(el("p", "no-messages", "No messages yet. Say hello!"));
      return;
    }

    c.messages.forEach(m => {
      const bubble = el("div", "msg " + m.from);
      bubble.append(m.text, el("span", "msg-time", m.time));
      messagesBox.appendChild(bubble);
    });

    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function selectConvo(id) {
    activeId = id;
    getConvo(id).unread = 0;
    renderConvos();
    renderChat();
    msgInput.focus();
  }

  /* ---------- 5. Send message ---------- */
  function scheduleDemoReply(c) {
    if (c.typing) return;

    c.typing = true;
    if (c.id === activeId) renderChat();

    setTimeout(() => {
      const replies = DEMO_REPLIES[c.role];
      c.messages.push({
        from: "them",
        text: replies[c.replyIndex % replies.length],
        time: timeNow()
      });
      c.replyIndex++;
      c.typing = false;

      if (c.id !== activeId) c.unread++;

      renderConvos();
      if (c.id === activeId) renderChat();
    }, 1600);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = msgInput.value.trim();
    if (text === "") return;

    const c = getConvo(activeId);
    c.messages.push({ from: "me", text: text, time: timeNow() });

    msgInput.value = "";
    renderChat();
    scheduleDemoReply(c);
  });

  /* ---------- Start ---------- */
  renderConvos();
  renderChat();

});