let DB = {
  clients: [
    { id: 'c1', name: 'Justine Salido', email: 'justine@email.com', phone: '+63 912 345 6789', address: 'Quezon City' },
    { id: 'c2', name: 'Maria Cruz', email: 'maria@email.com', phone: '+63 917 111 2222', address: 'Marikina' }
  ],
  pets: [
    { id: 'p1', ownerId: 'c1', name: 'Bella', species: 'Dog', breed: 'Golden Retriever', age: '2' },
    { id: 'p2', ownerId: 'c1', name: 'Luna', species: 'Cat', breed: 'Persian', age: '1' },
    { id: 'p3', ownerId: 'c2', name: 'Max', species: 'Dog', breed: 'Shih Tzu', age: '4' }
  ],
  vets: [{ id: 'v1', name: 'Dr. Reyes' }, { id: 'v2', name: 'Dr. Santos' }],
  appointments: [
    { id: 'a1', petId: 'p1', service: 'General Checkup', vetId: 'v1', date: '2026-10-26', time: '10:00', status: 'pending' },
    { id: 'a2', petId: 'p2', service: 'Vaccination', vetId: 'v1', date: '2026-10-27', time: '11:00', status: 'confirmed' },
    { id: 'a3', petId: 'p3', service: 'Follow-up', vetId: 'v2', date: '2026-10-28', time: '14:00', status: 'pending' }
  ],
  invoices: [
    { id: 'i1', clientId: 'c1', service: 'General Checkup', amount: '1000', status: 'pending' },
    { id: 'i2', clientId: 'c2', service: 'Vaccination', amount: '800', status: 'paid' }
  ]
};

const SERVICES = ['General Checkup', 'Vaccination', 'Follow-up', 'Grooming', 'Consultation'];
const STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];
const PAYMENT_STATUS = ['paid', 'pending'];

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nm = (t, id) => esc(DB[t].find(r => r.id === id)?.name || '—');
const opts = t => DB[t].map(r => [r.id, r.name]);
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
          <button type="button" class="bell">${BELL_SVG}<span class="bell-badge" id="bellBadge">0</span></button>
          <div class="user-menu-wrap">
            <button type="button" class="user-btn" id="userBtn">
              <span class="avatar">ST</span><span>Staff</span><span class="caret"></span>
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
  updateBellBadge();
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

function updateBellBadge() {
  const pend = DB.appointments.filter(a => a.status === 'pending').length;
  const b = $('#bellBadge'); 
  if (b) { 
    b.textContent = pend; 
    if (pend === 0) b.classList.add('hidden'); 
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  
  if (path.includes('staff-dashboard.html')) {
    layout('Dashboard', 'Staff Dashboard', 'Overview of clinic activity.');
    drawDashboard();
  } 
  else if (path.includes('staff-clients.html')) {
    initCrudPage('Clients', 'Manage pet owner accounts.', 'Client', 'clients',
      [
        { label: 'Name', key: 'name' }, 
        { label: 'Email', key: 'email' }, 
        { label: 'Phone', key: 'phone' }, 
        { label: 'Address', key: 'address' }
      ],
      [
        { key: 'name', label: 'Full name' }, 
        { key: 'email', label: 'Email', type: 'email' }, 
        { key: 'phone', label: 'Phone', type: 'tel' }, 
        { key: 'address', label: 'Address' }
      ]
    );
  } 
  else if (path.includes('staff-pets.html')) {
    initCrudPage('Pets', 'Manage all registered pets.', 'Pet', 'pets',
      [
        { label: 'Name', key: 'name' }, 
        { label: 'Owner', key: 'ownerId', render: (r) => nm('clients', r.ownerId) }, 
        { label: 'Species', key: 'species' }, 
        { label: 'Breed', key: 'breed' }, 
        { label: 'Age', key: 'age' }
      ],
      [
        { key: 'name', label: 'Pet Name' }, 
        { key: 'ownerId', label: 'Owner', options: () => opts('clients') }, 
        { key: 'species', label: 'Species' }, 
        { key: 'breed', label: 'Breed' }, 
        { key: 'age', label: 'Age' }
      ]
    );
  }
  else if (path.includes('staff-appointments.html')) {
    initCrudPage('Appointments', 'Manage all clinic bookings.', 'Appointment', 'appointments',
      [
        { label: 'Pet', key: 'petId', render: (r) => nm('pets', r.petId) }, 
        { label: 'Service', key: 'service' }, 
        { label: 'Date', key: 'date' }, 
        { label: 'Time', key: 'time' }, 
        { label: 'Status', key: 'status', render: (r) => badge(r.status) }
      ],
      [
        { key: 'petId', label: 'Pet', options: () => opts('pets') }, 
        { key: 'service', label: 'Service', options: () => SERVICES.map(s => [s, s]) }, 
        { key: 'date', label: 'Date', type: 'date' }, 
        { key: 'time', label: 'Time', type: 'time' }, 
        { key: 'status', label: 'Status', options: () => STATUS.map(s => [s, s]) }
      ]
    );
  }
  else if (path.includes('staff-billing.html')) {
    initCrudPage('Billing', 'Manage invoices and payments.', 'Invoice', 'invoices',
      [
        { label: 'Client', key: 'clientId', render: (r) => nm('clients', r.clientId) }, 
        { label: 'Service', key: 'service' }, 
        { label: 'Amount', key: 'amount', render: (r) => `₱${r.amount}` }, 
        { label: 'Status', key: 'status', render: (r) => badge(r.status) }
      ],
      [
        { key: 'clientId', label: 'Client', options: () => opts('clients') },
        { key: 'service', label: 'Service', options: () => SERVICES.map(s => [s, s]) },
        { key: 'amount', label: 'Amount (₱)', type: 'number' },
        { key: 'status', label: 'Status', options: () => PAYMENT_STATUS.map(s => [s, s]) }
      ]
    );
  }
  else if (path.includes('staff-consultation.html')) {
    layout('Consultations', 'Client Consultations', 'Answer inquiries from pet owners.');
    
    $('#content').innerHTML = `
      <div style="display: flex; gap: 20px; height: calc(100vh - 180px);">
        
        <div class="card" style="width: 300px; display: flex; flex-direction: column; padding: 20px;">
          <h2>Inbox</h2>
          <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
            <div style="padding: 15px; border: 1px solid #d8e6f3; border-radius: 10px; background: #eaf3ff; cursor: pointer;">
              <strong style="color: #0b3d6e;">Justine Salido</strong><br>
              <small style="color: #6b7f94;">General Inquiry</small>
            </div>
            <div style="padding: 15px; border: 1px solid #d8e6f3; border-radius: 10px; cursor: pointer;">
              <strong style="color: #0b3d6e;">Maria Cruz</strong><br>
              <small style="color: #6b7f94;">Billing Question</small>
            </div>
          </div>
        </div>

        <div class="card" style="flex: 1; display: flex; flex-direction: column; padding: 20px;">
          <div style="border-bottom: 1px solid #d8e6f3; padding-bottom: 15px; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #0b3d6e;">Justine Salido</h2>
            <small style="color: #6b7f94;">Pet Owner</small>
          </div>

          <div id="chatBox" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
            
            <div style="align-self: flex-start; background: #eaf3ff; padding: 12px 16px; border-radius: 12px; max-width: 70%;">
              <p style="margin: 0; color: #0b3d6e;">Hi po, ask ko lang kung open ba kayo bukas ng 8am?</p>
              <small style="color: #6b7f94; font-size: 10px; margin-top: 5px; display: block;">9:00 AM</small>
            </div>

            <div style="align-self: flex-end; background: #0a7cff; color: white; padding: 12px 16px; border-radius: 12px; max-width: 70%;">
              <p style="margin: 0;">Hi Justine! Yes po, open kami bukas from 8:00 AM to 5:00 PM. See you!</p>
              <small style="color: #d8e6f3; font-size: 10px; margin-top: 5px; display: block; text-align: right;">9:02 AM</small>
            </div>

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
});

function drawDashboard() {
  const pend = DB.appointments.filter(a => a.status === 'pending');
  const stats = [
    ['Appointments', DB.appointments.length], 
    ['Pending', pend.length], 
    ['Clients', DB.clients.length], 
    ['Pets', DB.pets.length]
  ];

  $('#content').innerHTML = `
    <div class="stats">
      ${stats.map(([l, n]) => `<div class="card stat"><b>${n}</b><span>${l}</span></div>`).join('')}
    </div>
    <div class="card">
      <h2>Pending Appointments</h2>
      ${pend.length ? pend.map(a => `
        <div class="item" id="appt-${a.id}">
          <div>
            <b>${nm('pets', a.petId)}</b> — ${esc(a.service)}<br>
            <small>${a.date} • ${a.time} • ${nm('vets', a.vetId)}</small>
          </div>
          <button class="btn-o" onclick="confirmAppt('${a.id}')">Confirm</button>
        </div>
      `).join('') : '<p class="empty">No pending appointments.</p>'}
    </div>`;
}

function confirmAppt(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (a) { 
    a.status = 'confirmed'; 
    updateBellBadge(); 
    drawDashboard(); 
  }
}

let redrawCurrentTable = null;

function initCrudPage(title, sub, single, table, cols, fields) {
  layout(title, title, sub);
  
  $('#content').innerHTML = `
    <div class="actions"><button class="btn" id="addBtn">+ Add ${single}</button></div>
    <div class="card">
      <input class="search" id="searchInput" placeholder="Search ${title.toLowerCase()}...">
      <table>
        <thead>
          <tr>${cols.map(c => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
      <p class="empty" id="emptyMsg" hidden>No ${title.toLowerCase()} found.</p>
    </div>`;

  redrawCurrentTable = (query = '') => {
    const tbody = $('#tableBody');
    const empty = $('#emptyMsg');
    const filteredData = DB[table].filter(row => 
      cols.some(c => String(row[c.key]).toLowerCase().includes(query.toLowerCase()))
    );
    
    tbody.innerHTML = filteredData.map(row => `
      <tr>
        ${cols.map(c => `<td>${c.render ? c.render(row) : esc(row[c.key])}</td>`).join('')}
        <td>
          <button class="btn-o" onclick="triggerEdit('${table}', '${row.id}', ${JSON.stringify(fields).replace(/"/g, '&quot;')}, '${single}')">Edit</button>
          <button class="btn-d" onclick="triggerDelete('${table}', '${row.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
    empty.hidden = filteredData.length > 0;
  };

  redrawCurrentTable(); 
  
  $('#searchInput').addEventListener('input', (e) => redrawCurrentTable(e.target.value));
  
  $('#addBtn').addEventListener('click', () => {
    openModal(table, null, fields, single);
  });
}

function openModal(table, record, fields, single) {
  const isEdit = record !== null;
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  modal.innerHTML = `
    <form class="card">
      <h2>${isEdit ? 'Edit' : 'Add'} ${single}</h2>
      ${fields.map(f => {
        const val = isEdit ? record[f.key] : '';
        if (f.options) {
          return `
            <div class="f">
              <label>${f.label}</label>
              <select name="${f.key}" required>
                ${f.options().map(([v, t]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>`;
        }
        return `<div class="f"><label>${f.label}</label><input name="${f.key}" type="${f.type || 'text'}" value="${esc(val)}" required></div>`;
      }).join('')}
      <div class="row">
        <button type="button" class="btn-o" onclick="this.closest('.modal').remove()">Cancel</button>
        <button class="btn">Save</button>
      </div>
    </form>`;

  document.body.appendChild(modal);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    
    if (isEdit) {
      const idx = DB[table].findIndex(r => r.id === record.id);
      DB[table][idx] = { ...DB[table][idx], ...data };
    } else {
      data.id = 'x' + Date.now();
      DB[table].push(data);
    }
    
    modal.remove();
    if (redrawCurrentTable) redrawCurrentTable(); 
  };
}

window.triggerEdit = function(table, id, fields, single) {
  const record = DB[table].find(r => r.id === id);
  openModal(table, record, fields, single); 
}

window.triggerDelete = function(table, id) {
  if (window.confirm("Are you sure you want to delete this?")) {
    DB[table] = DB[table].filter(r => r.id !== id);
    if (redrawCurrentTable) redrawCurrentTable(); 
    updateBellBadge();
  }
}