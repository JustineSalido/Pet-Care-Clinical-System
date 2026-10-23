
const API = {
  get:      '../PHP/get_profile.php',
  update:   '../PHP/update_profile.php',
  password: '../PHP/change_password.php',
  photo:    '../PHP/upload_photo.php',
  logout:   '../PHP/logout.php'
};

const $ = (id) => document.getElementById(id);

/* ---------- helpers ---------- */
function initials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function showErrors(errors = {}) {
  document.querySelectorAll('.err').forEach(e => (e.textContent = ''));
  document.querySelectorAll('.field input').forEach(i => i.classList.remove('invalid'));
  Object.entries(errors).forEach(([id, msg]) => {
    const err = document.querySelector(`.err[data-for="${id}"]`);
    if (err) err.textContent = msg;
    $(id)?.classList.add('invalid');
  });
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { json });
  return json;
}

/* ---------- render ---------- */
function render(user) {
  $('fullName').value = user.full_name || '';
  $('email').value    = user.email || '';
  $('phone').value    = user.phone || '';
  $('address').value  = user.address || '';

  $('sumName').textContent  = user.full_name || '';
  $('sumEmail').textContent = user.email || '';
  $('userName').textContent = user.full_name || '';
  $('userAvatar').textContent = initials(user.full_name);
  $('photoInitials').textContent = initials(user.full_name);

  if (user.photo_url) {
    $('photoImg').src = user.photo_url;
    $('photoImg').hidden = false;
    $('photoInitials').hidden = true;
  }
}

async function loadProfile() {
  try {
    const res = await fetch(API.get, { credentials: 'same-origin' });
    if (res.status === 401) { location.href = 'login.html'; return; }
    const data = await res.json();
    render(data.user);
  } catch (e) {
    setStatus($('profileStatus'), 'Could not load your profile. Refresh the page and try again.', 'bad');
  }
}

/* ---------- validation ---------- */
function validateProfile() {
  const errors = {};
  if (!$('fullName').value.trim()) errors.fullName = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test($('email').value.trim())) errors.email = 'Enter a valid email address.';
  const phone = $('phone').value.trim();
  if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

function validatePassword() {
  const errors = {};
  if (!$('curPass').value) errors.curPass = 'Enter your current password.';
  if ($('newPass').value.length < 8) errors.newPass = 'Use at least 8 characters.';
  if ($('confPass').value !== $('newPass').value) errors.confPass = 'Passwords do not match.';
  return errors;
}

/* ---------- save profile ---------- */
$('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errors = validateProfile();
  showErrors(errors);
  if (Object.keys(errors).length) return;

  $('saveBtn').disabled = true;
  setStatus($('profileStatus'), 'Saving...');
  try {
    const res = await postJSON(API.update, {
      full_name: $('fullName').value.trim(),
      email:     $('email').value.trim(),
      phone:     $('phone').value.trim(),
      address:   $('address').value.trim()
    });
    render(res.user);
    setStatus($('profileStatus'), 'Changes saved.', 'ok');
  } catch (err) {
    showErrors(err.json?.errors);
    setStatus($('profileStatus'), err.message, 'bad');
  } finally {
    $('saveBtn').disabled = false;
  }
});

/* ---------- change password ---------- */
$('passwordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errors = validatePassword();
  showErrors(errors);
  if (Object.keys(errors).length) return;

  $('passBtn').disabled = true;
  setStatus($('passStatus'), 'Updating...');
  try {
    await postJSON(API.password, {
      current_password: $('curPass').value,
      new_password:     $('newPass').value
    });
    e.target.reset();
    setStatus($('passStatus'), 'Password updated.', 'ok');
  } catch (err) {
    showErrors(err.json?.errors);
    setStatus($('passStatus'), err.message, 'bad');
  } finally {
    $('passBtn').disabled = false;
  }
});

/* ---------- photo upload ---------- */
$('photoBtn').addEventListener('click', () => $('photoInput').click());

$('photoInput').addEventListener('change', async () => {
  const file = $('photoInput').files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    setStatus($('profileStatus'), 'Photo is larger than 2 MB. Choose a smaller image.', 'bad');
    return;
  }

  const body = new FormData();
  body.append('photo', file);
  setStatus($('profileStatus'), 'Uploading photo...');
  try {
    const res = await fetch(API.photo, { method: 'POST', body, credentials: 'same-origin' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Upload failed');
    $('photoImg').src = json.photo_url + '?t=' + Date.now();
    $('photoImg').hidden = false;
    $('photoInitials').hidden = true;
    setStatus($('profileStatus'), 'Photo updated.', 'ok');
  } catch (err) {
    setStatus($('profileStatus'), err.message, 'bad');
  }
});

/* ---------- top bar: user menu, bell, logout ---------- */
$('userBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('userMenu').classList.toggle('open');   // match the class your dashboard.css uses
});
document.addEventListener('click', () => $('userMenu').classList.remove('open'));

$('bellBtn').addEventListener('click', () => (location.href = 'notifications.html'));

async function logout() {
  try { await fetch(API.logout, { method: 'POST', credentials: 'same-origin' }); } catch (_) {}
  location.href = 'login.html';
}
$('logoutBtn').addEventListener('click', logout);
$('menuLogout').addEventListener('click', logout);

loadProfile();