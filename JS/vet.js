let DB = {
  pets: [
    { id: 'p1', ownerId: 'c1', name: 'Bella', species: 'Dog', breed: 'Golden Retriever', age: '2' },
    { id: 'p2', ownerId: 'c1', name: 'Luna', species: 'Cat', breed: 'Persian', age: '1' },
    { id: 'p3', ownerId: 'c2', name: 'Max', species: 'Dog', breed: 'Shih Tzu', age: '4' }
  ],
  clients: [
    { id: 'c1', name: 'Justine Salido' },
    { id: 'c2', name: 'Maria Cruz' }
  ],
  appointments: [
    { id: 'a1', petId: 'p1', service: 'General Checkup', vetId: 'v1', date: '2026-10-26', time: '10:00', status: 'confirmed' },
    { id: 'a3', petId: 'p3', service: 'Follow-up', vetId: 'v1', date: '2026-10-28', time: '14:00', status: 'pending' }
  ],
  medical_records: [
    { id: 'm1', petId: 'p1', diagnosis: 'Healthy', treatment: 'None', date: '2026-10-01' }
  ]
};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nm = (t, id) => esc(DB[t].find(r => r.id === id)?.name || '—');
const opts = t => DB[t].map(r => [r.id, r.name]);

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
              <span class="avatar" style="background:#16a34a;">DR</span><span>Dr. Reyes</span><span class="caret"></span>
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
    
    const myAppts = DB.appointments.filter(a => a.vetId === 'v1' && a.status === 'confirmed');
    const totalPatients = [...new Set(DB.medical_records.map(m => m.petId))].length;

    $('#content').innerHTML = `
      <div class="stats">
        <div class="card stat"><b>${myAppts.length}</b><span>Today's Consultations</span></div>
        <div class="card stat"><b>${totalPatients}</b><span>Total Patients Treated</span></div>
      </div>
      
      <div class="card">
        <h2>My Schedule Today</h2>
        ${myAppts.length ? myAppts.map(a => `
          <div class="item">
            <div>
              <b>${nm('pets', a.petId)}</b> (Owner: ${nm('clients', DB.pets.find(p=>p.id===a.petId)?.ownerId)})<br>
              <small>${a.date} • ${a.time} • ${esc(a.service)}</small>
            </div>
            <button class="btn" onclick="window.location.href='vet-consultation.html'">Start Consult</button>
          </div>
        `).join('') : '<p class="empty">No confirmed appointments for today.</p>'}
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
              <strong style="color: #0b3d6e;">Justine Salido</strong><br>
              <small style="color: #6b7f94;">Owner of Bella</small>
            </div>
            <div style="padding: 15px; border: 1px solid #d8e6f3; border-radius: 10px; cursor: pointer;">
              <strong style="color: #0b3d6e;">Maria Cruz</strong><br>
              <small style="color: #6b7f94;">Owner of Max</small>
            </div>
          </div>
        </div>

        <div class="card" style="flex: 1; display: flex; flex-direction: column; padding: 20px;">
          <div style="border-bottom: 1px solid #d8e6f3; padding-bottom: 15px; margin-bottom: 15px;">
            <h2 style="margin: 0; color: #0b3d6e;">Justine Salido</h2>
            <small style="color: #6b7f94;">Pet: Bella (Golden Retriever)</small>
          </div>

          <div id="chatBox" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;">
            <div style="align-self: flex-start; background: #eaf3ff; padding: 12px 16px; border-radius: 12px; max-width: 70%;">
              <p style="margin: 0; color: #0b3d6e;">Hi Doc, my dog has been less active today. Is this normal?</p>
              <small style="color: #6b7f94; font-size: 10px; margin-top: 5px; display: block;">9:00 AM</small>
            </div>
            <div style="align-self: flex-end; background: #0a7cff; color: white; padding: 12px 16px; border-radius: 12px; max-width: 70%;">
              <p style="margin: 0;">Hello Justine. How long has Bella been inactive? Is she eating well?</p>
              <small style="color: #d8e6f3; font-size: 10px; margin-top: 5px; display: block; text-align: right;">9:02 AM</small>
            </div>
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
    initVetRecords('Medical Records', 'Manage patient history and prescriptions.', 'Record', 'medical_records', 
      [
        { label: 'Patient (Pet)', key: 'petId', render: (r) => nm('pets', r.petId) }, 
        { label: 'Diagnosis', key: 'diagnosis' }, 
        { label: 'Treatment/Notes', key: 'treatment' },
        { label: 'Date', key: 'date' }
      ],
      [
        { key: 'petId', label: 'Select Patient', options: () => opts('pets') },
        { key: 'diagnosis', label: 'Diagnosis' },
        { key: 'treatment', label: 'Prescription / Treatment' },
        { key: 'date', label: 'Date', type: 'date' }
      ]
    );
  }
});

let redrawCurrentTable = null;

function initVetRecords(title, sub, single, table, cols, fields) {
  layout(title, title, sub);
  
  $('#content').innerHTML = `
    <div class="actions"><button class="btn" id="addBtn">+ Add ${single}</button></div>
    <div class="card">
      <input class="search" id="searchInput" placeholder="Search records...">
      <table>
        <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}<th>Actions</th></tr></thead>
        <tbody id="tableBody"></tbody>
      </table>
      <p class="empty" id="emptyMsg" hidden>No records found.</p>
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
          <button class="btn-o" onclick="triggerVetEdit('${table}', '${row.id}', ${JSON.stringify(fields).replace(/"/g, '&quot;')}, '${single}')">Update</button>
        </td>
      </tr>
    `).join('');
    empty.hidden = filteredData.length > 0;
  };

  redrawCurrentTable(); 
  
  $('#searchInput').addEventListener('input', (e) => redrawCurrentTable(e.target.value));
  
  $('#addBtn').addEventListener('click', () => {
    openVetModal(table, null, fields, single);
  });
}

function openVetModal(table, record, fields, single) {
  const isEdit = record !== null;
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  modal.innerHTML = `<form class="card"><h2>${isEdit ? 'Update' : 'Add'} ${single}</h2>
    ${fields.map(f => {
      const val = isEdit ? record[f.key] : '';
      if (f.options) {
        return `<div class="f"><label>${f.label}</label><select name="${f.key}" required>
          ${f.options().map(([v, t]) => `<option value="${v}" ${v === val ? 'selected' : ''}>${t}</option>`).join('')}
        </select></div>`;
      }
      return `<div class="f"><label>${f.label}</label><input name="${f.key}" type="${f.type || 'text'}" value="${esc(val)}" required></div>`;
    }).join('')}
    <div class="row"><button type="button" class="btn-o" onclick="this.closest('.modal').remove()">Cancel</button><button class="btn">Save</button></div>
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
    if(redrawCurrentTable) redrawCurrentTable(); 
  };
}

window.triggerVetEdit = function(table, id, fields, single) {
  const record = DB[table].find(r => r.id === id);
  openVetModal(table, record, fields, single); 
}