const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const badge = s => `<span class="badge ${esc(s).toLowerCase()}">${esc(s)}</span>`;

const NAV = [
  ['Dashboard', 'staff-dashboard.html'], 
  ['Appointments', 'staff-appointments.html'], 
  ['Consultations', 'staff-consultation.html'],
  ['Clients', 'staff-clients.html'], 
  ['Pets', 'staff-pets.html'],
  ['Billing', 'staff-billing.html']
];

const LOGOUT_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>';
const BELL_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';

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
          <button type="button" class="bell">${BELL_SVG}<span class="bell-badge hidden" id="bellBadge">0</span></button>
          <div class="user-menu-wrap">
            <button type="button" class="user-btn" id="userBtn">
              <span class="avatar"></span><span></span><span class="caret"></span>
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
  
  if (path.includes('staff-dashboard.html')) {
    layout('Dashboard', 'Staff Dashboard', 'Overview of clinic activity.');
    drawDashboard();
  } 
  else if (path.includes('staff-clients.html')) {
    initCrudPage('Clients', 'Manage pet owner accounts.', 
      [
        { label: 'Name', key: 'full_name' }, 
        { label: 'Email', key: 'email' }, 
        { label: 'Phone', key: 'phone' }, 
        { label: 'Address', key: 'address' }
      ]
    );
  } 
  else if (path.includes('staff-pets.html')) {
    initCrudPage('Pets', 'Manage all registered pets.', 
      [
        { label: 'Name', key: 'name' }, 
        { label: 'Owner', key: 'owner_name' }, 
        { label: 'Species', key: 'species' }, 
        { label: 'Breed', key: 'breed' }, 
        { label: 'Age', key: 'age' }
      ]
    );
  }
  else if (path.includes('staff-appointments.html')) {
    initCrudPage('Appointments', 'Manage all clinic bookings.', 
      [
        { label: 'Pet', key: 'pet_name' }, 
        { label: 'Service', key: 'service' }, 
        { label: 'Date', key: 'appointment_date' }, 
        { label: 'Time', key: 'appointment_time' }, 
        { label: 'Status', key: 'status', render: (r) => badge(r.status) }
      ]
    );
  }
  else if (path.includes('staff-billing.html')) {
    initCrudPage('Billing', 'Manage invoices and payments.', 
      [
        { label: 'Client', key: 'client_name' }, 
        { label: 'Service', key: 'service' }, 
        { label: 'Amount', key: 'amount', render: (r) => `₱${r.amount}` }, 
        { label: 'Status', key: 'status', render: (r) => badge(r.status) }
      ]
    );
  }
  else if (path.includes('staff-consultation.html')) {
    layout('Consultations', 'Client Consultations', 'Answer inquiries from pet owners.');
    
    // Dito natin ibinalik yung chat design
    $('#content').innerHTML = `
      <div style="display: flex; gap: 20px; height: calc(100vh - 180px);">
        
        <div class="card" style="width: 300px; display: flex; flex-direction: column; padding: 20px;">
          <h2>Inbox</h2>
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
            <input type="text" id="staffChatInput" placeholder="Type your reply..." style="flex: 1; padding: 12px; border: 1px solid #d8e6f3; border-radius: 8px; outline: none;">
            <button class="btn" onclick="sendStaffMessage()">Send</button>
          </div>
        </div>

      </div>
    `;

    window.sendStaffMessage = function() {
      const input = document.getElementById('staffChatInput');
      const msg = input.value.trim();
      if (!msg) return;
      
      const chatBox = document.getElementById('chatBox');
      const emptyMsg = chatBox.querySelector('.empty');
      if (emptyMsg) emptyMsg.remove();

      const newMsg = document.createElement('div');
      newMsg.style.cssText = "align-self: flex-end; background: #0a7cff; color: white; padding: 12px 16px; border-radius: 12px; max-width: 70%;";
      newMsg.innerHTML = `<p style="margin: 0;">${esc(msg)}</p><small style="color: #d8e6f3; font-size: 10px; margin-top: 5px; display: block; text-align: right;">Just now</small>`;
      
      chatBox.appendChild(newMsg);
      input.value = '';
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
});

async function drawDashboard() {
  const fakeStats = [
    ['Appointments', 0], 
    ['Pending', 0], 
    ['Clients', 0], 
    ['Pets', 0]
  ];

  $('#content').innerHTML = `
    <div class="stats">
      ${fakeStats.map(([l, n]) => `<div class="card stat"><b>${n}</b><span>${l}</span></div>`).join('')}
    </div>
    <div class="card">
      <h2>Pending Appointments</h2>
      <p class="empty">No pending appointments.</p>
    </div>`;
}

async function initCrudPage(title, sub, cols) {
  layout(title, title, sub);
  
  $('#content').innerHTML = `
    <div class="card">
      <input class="search" id="searchInput" placeholder="Search ${title.toLowerCase()}...">
      <table>
        <thead>
          <tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
      <p class="empty" id="emptyMsg">No ${title.toLowerCase()} found.</p>
    </div>`;
}