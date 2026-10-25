const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const NAV = [
  ['Dashboard', 'vet-dashboard.html'], 
  ['Consultations', 'vet-consultation.html'],
  ['Medical Records', 'vet-records.html']
];

const LOGOUT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>';

function layout(active, title, sub) {
  $('#app').innerHTML = `
  <aside class="sidebar">
    <div class="logo"><span class="logo-icon">✢</span><span>Pet Care Clinic</span></div>
    <nav class="nav">${NAV.map(([n, h]) => `<a href="${h}" class="${n === active ? 'active' : ''}"><span class="dot"></span>${n}</a>`).join('')}</nav>
    <button type="button" class="logout" onclick="window.location.href='login.html'">${LOGOUT_SVG} Logout</button>
  </aside>
  <main class="main">
    <div class="content">
      <header class="topbar">
        <div><h1>${title}</h1><p class="subtitle">${sub}</p></div>
        <div class="user-area">
          <div class="user-menu-wrap">
            <button type="button" class="user-btn" id="userBtn">
              <span class="avatar" style="background:#16a34a;"></span>
              <span></span>
              <span class="caret"></span>
            </button>
            <div class="user-menu" id="userMenu">
              <button type="button" onclick="window.location.href='login.html'">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <div id="content"></div>
    </div>
  </main>`;

  wireTopbar();
}

function wireTopbar() {
  const userBtn = $('#userBtn');
  const userMenu = $('#userMenu');
  
  if (userBtn && userMenu) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && e.target !== userBtn) {
        userMenu.classList.remove('open');
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  
  if (path.includes('vet-dashboard.html')) {
    layout('Dashboard', 'Vet Dashboard', 'Your schedule and patient overview for today.');
    
    $('#content').innerHTML = `
      <div class="stats">
        <div class="card stat"><b>0</b><span>Today's Consultations</span></div>
        <div class="card stat"><b>0</b><span>Total Patients Treated</span></div>
      </div>
      
      <div class="card">
        <h2>My Schedule Today</h2>
        <p class="empty">No confirmed appointments for today.</p>
      </div>
    `;
  } 
  
  else if (path.includes('vet-consultation.html')) {
    layout('Consultations', 'Online Consultation', 'Chat with your patients.');
    
    $('#content').innerHTML = `
      <div style="display: flex; gap: 20px; height: calc(100vh - 180px);">
        <div class="card" style="width: 300px; display: flex; flex-direction: column; padding: 20px;">
          <h2>Conversations</h2>
          <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
            <div style="padding: 15px; border: 1px solid #d8e6f3; border-radius: 10px; background: #eaf3ff; cursor: pointer;">
              <strong style="color: #0b3d6e;">Client</strong><br>
              <small style="color: #6b7f94;">Pet Owner</small>
            </div>
          </div>
        </div>

        <div class="card" style="flex: 1; display: flex; flex-direction: column; padding: 20px;">
          <div style="border-bottom: 1px solid #d8e6f3; padding-bottom: 15px; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #0b3d6e;">Client</h2>
            <small style="color: #6b7f94;">Pet Owner</small>
          </div>

          <div id="chatBox" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
            <p class="empty" style="text-align: center; margin-top: 20px;">No messages yet. Say hello!</p>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <input type="text" id="chatInput" placeholder="Type a message..." style="flex: 1; padding: 12px; border: 1px solid #d8e6f3; border-radius: 8px; outline: none;">
            <button class="btn" onclick="sendVetMessage()">Send</button>
          </div>
        </div>
      </div>
    `;

    window.sendVetMessage = function() {
      const input = document.getElementById('chatInput');
      const msg = input.value.trim();
      if (!msg) return;

      const chatBox = document.getElementById('chatBox');
      const emptyMsg = chatBox.querySelector('.empty');
      if (emptyMsg) emptyMsg.remove();

      const newMsg = document.createElement('div');
      newMsg.style.cssText = "align-self: flex-end; background: #0a7cff; color: white; padding: 12px 16px; border-radius: 12px; max-width: 70%;";
      newMsg.innerHTML = `
        <p style="margin: 0;">${esc(msg)}</p>
        <small style="color: #d8e6f3; font-size: 10px; margin-top: 5px; display: block; text-align: right;">Just now</small>
      `;
      
      chatBox.appendChild(newMsg);
      input.value = '';
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  else if (path.includes('vet-records.html')) {
    // Dito ang fix para wala nang "undefined" at gagana na ang Add Record button
    initVetRecords('Medical Records', 'Manage patient history and prescriptions.');
  }
});

// BUONG LOGIC PARA SA MEDICAL RECORDS MODAL
function initVetRecords(title, sub) {
  layout('Medical Records', title, sub);
  
  $('#content').innerHTML = `
    <div class="actions"><button class="btn" id="addBtn">+ Add Record</button></div>
    <div class="card">
      <p class="empty" id="emptyMsg">No records found.</p>
    </div>`;

  $('#addBtn').addEventListener('click', () => {
    openVetModal();
  });
}

function openVetModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  modal.innerHTML = `
    <form class="card">
      <h2>Add Record</h2>
      <div class="f">
        <label>Patient (Pet)</label>
        <input type="text" placeholder="Pet's name" required>
      </div>
      <div class="f">
        <label>Diagnosis</label>
        <input type="text" placeholder="Diagnosis" required>
      </div>
      <div class="f">
        <label>Treatment/Notes</label>
        <input type="text" placeholder="Prescription / Treatment" required>
      </div>
      <div class="f">
        <label>Date</label>
        <input type="date" required>
      </div>
      <div class="row">
        <button type="button" class="btn-o" onclick="this.closest('.modal').remove()">Cancel</button>
        <button class="btn" onclick="event.preventDefault(); this.closest('.modal').remove();">Save</button>
      </div>
    </form>`;

  document.body.appendChild(modal);
}