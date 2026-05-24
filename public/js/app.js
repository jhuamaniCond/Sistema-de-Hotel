// ============================================================================
// FRONTEND — HOTEL GRAND AZURE
// SPA con sidebar navigation, API REST, toasts y modales
// ============================================================================

const API = '/api';

// ============================================================================
// ICONS (inline SVG helpers)
// ============================================================================
const icons = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  pay:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  logout:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  info:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warn:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

// ============================================================================
// API HELPER
// ============================================================================
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.message || 'Error', details: data.details || [] };
    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { status: 0, message: 'Error de conexión con el servidor', details: [] };
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
function showToast(title, message = '', type = 'info') {
  const container = document.getElementById('toast-container');
  const iconMap = {
    success: icons.check,
    error:   icons.alert,
    warning: icons.warn,
    info:    icons.info,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || icons.info}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>`;

  toast.addEventListener('click', () => removeToast(toast));
  container.appendChild(toast);

  setTimeout(() => removeToast(toast), 4500);
}

function removeToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 280);
}

// ============================================================================
// FORMATTING
// ============================================================================
function fmt(amount) {
  return `S/ ${Number(amount).toFixed(2)}`;
}

function statusBadge(status) {
  const map = {
    disponible:  ['badge-success', 'Disponible'],
    ocupada:     ['badge-danger',  'Ocupada'],
    mantenimiento:['badge-warning','Mantenimiento'],
    confirmada:  ['badge-success', 'Confirmada'],
    pendiente:   ['badge-warning', 'Pendiente'],
    cancelada:   ['badge-danger',  'Cancelada'],
    completada:  ['badge-info',    'Completada'],
    pagada:      ['badge-success', 'Pagada'],
    anulada:     ['badge-danger',  'Anulada'],
  };
  const [cls, label] = map[status] || ['badge-default', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ============================================================================
// NAVIGATION
// ============================================================================
const tabConfig = {
  huespedes:    { title: 'Huéspedes',    sub: 'Gestión y registro de huéspedes',              addLabel: 'Registrar Huésped',   modal: 'modal-guest',        load: loadGuests },
  habitaciones: { title: 'Habitaciones', sub: 'Gestión de habitaciones del hotel',            addLabel: 'Agregar Habitación',  modal: 'modal-room',         load: loadRooms },
  reservaciones:{ title: 'Reservaciones',sub: 'Control de reservas y check-in / check-out',  addLabel: 'Nueva Reservación',   modal: 'modal-reservation',  load: () => { loadReservations(); loadGuestOptions(); loadAvailableRooms(); } },
  facturacion:  { title: 'Facturación',  sub: 'Facturas, pagos y cobros',                    addLabel: 'Generar Factura',     modal: 'modal-billing',      load: () => { loadBillings(); loadReservationOptions(); } },
};

let activeTab = 'huespedes';

function switchTab(tab) {
  if (tab === activeTab) return;
  activeTab = tab;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`nav-${tab}`).classList.add('active');

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
  document.getElementById(`panel-${tab}`).classList.add('active');

  // Update topbar
  const cfg = tabConfig[tab];
  document.getElementById('topbar-title').textContent    = cfg.title;
  document.querySelector('.topbar-subtitle').textContent  = cfg.sub;
  document.getElementById('topbar-add-label').textContent = cfg.addLabel;

  // Load data
  cfg.load();
  updateStats();
}

function openAddModal() {
  openModal(tabConfig[activeTab].modal);
  if (activeTab === 'reservaciones') { loadGuestOptions(); loadAvailableRooms(); }
  if (activeTab === 'facturacion')   { loadReservationOptions(); }
}

// ============================================================================
// STATS
// ============================================================================
async function updateStats() {
  try {
    const [guests, rooms, reservations, billings] = await Promise.all([
      apiRequest('/huespedes'),
      apiRequest('/habitaciones'),
      apiRequest('/reservaciones'),
      apiRequest('/facturacion'),
    ]);

    const gCount = guests.count;
    const rCount = rooms.count;
    const resActive = reservations.data.filter(r => r.estado === 'confirmada').length;
    const billPending = billings.data.filter(b => b.estado === 'pendiente').length;

    document.getElementById('stat-guests').textContent       = gCount;
    document.getElementById('stat-rooms').textContent        = rCount;
    document.getElementById('stat-reservations').textContent = resActive;
    document.getElementById('stat-billings').textContent     = billPending;

    // Badges
    document.getElementById('badge-huespedes').textContent    = gCount;
    document.getElementById('badge-habitaciones').textContent = rCount;
    document.getElementById('badge-reservaciones').textContent = resActive;
    document.getElementById('badge-facturas').textContent     = billPending;
  } catch (_) {}
}

// ============================================================================
// GUESTS
// ============================================================================
async function loadGuests() {
  const tbody = document.getElementById('guests-tbody');
  try {
    const result = await apiRequest('/huespedes');
    if (!result.data.length) {
      tbody.innerHTML = emptyRow(7, 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'Sin huéspedes', 'Registra tu primer huésped');
      return;
    }
    tbody.innerHTML = result.data.map(g => `
      <tr>
        <td><strong>${esc(g.nombre)}</strong></td>
        <td><span style="font-family:monospace;font-size:.82rem;color:var(--text-secondary)">${esc(g.dni)}</span></td>
        <td>${g.edad}</td>
        <td>${esc(g.telefono)}</td>
        <td style="color:var(--text-secondary)">${esc(g.email)}</td>
        <td style="color:var(--text-muted)">${new Date(g.createdAt).toLocaleDateString('es-PE')}</td>
        <td>
          <button class="btn-icon danger" onclick="deleteGuest('${g.id}')" title="Eliminar">${icons.trash}</button>
        </td>
      </tr>`).join('');
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function submitGuest(e) {
  e.preventDefault();
  const f = e.target;
  try {
    const res = await apiRequest('/huespedes', { method: 'POST', body: JSON.stringify({
      nombre: f.nombre.value, dni: f.dni.value,
      edad: parseInt(f.edad.value), telefono: f.telefono.value, email: f.email.value,
    })});
    showToast('Huésped registrado', res.data.nombre, 'success');
    f.reset(); closeModal('modal-guest'); loadGuests(); updateStats();
  } catch (e) { handleApiError(e); }
}

async function deleteGuest(id) {
  if (!confirm('¿Eliminar este huésped?')) return;
  try {
    await apiRequest(`/huespedes/${id}`, { method: 'DELETE' });
    showToast('Huésped eliminado', '', 'success');
    loadGuests(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

// ============================================================================
// ROOMS
// ============================================================================
async function loadRooms() {
  const tbody = document.getElementById('rooms-tbody');
  try {
    const result = await apiRequest('/habitaciones');
    if (!result.data.length) {
      tbody.innerHTML = emptyRow(7, 'M3 3h18v18H3zM3 9h18M9 21V9', 'Sin habitaciones', 'Agrega habitaciones');
      return;
    }
    const typeLabel = { individual: 'Individual', doble: 'Doble', suite: 'Suite' };
    tbody.innerHTML = result.data.map(r => `
      <tr>
        <td><strong style="font-size:.95rem">#${r.number}</strong></td>
        <td>${typeLabel[r.type] || r.type}</td>
        <td>${fmt(r.price)}</td>
        <td>Piso ${r.floor}</td>
        <td>${statusBadge(r.status)}</td>
        <td style="color:var(--text-muted)">${new Date(r.createdAt).toLocaleDateString('es-PE')}</td>
        <td>
          <button class="btn-icon danger" onclick="deleteRoom('${r.id}')" title="Eliminar">${icons.trash}</button>
        </td>
      </tr>`).join('');
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function submitRoom(e) {
  e.preventDefault();
  const f = e.target;
  try {
    const res = await apiRequest('/habitaciones', { method: 'POST', body: JSON.stringify({
      numero: parseInt(f.numero.value), tipo: f.tipo.value,
      precio: parseFloat(f.precio.value), piso: parseInt(f.piso.value),
    })});
    showToast('Habitación agregada', `#${res.data.number} — ${res.data.type}`, 'success');
    f.reset(); closeModal('modal-room'); loadRooms(); updateStats();
  } catch (e) { handleApiError(e); }
}

async function deleteRoom(id) {
  if (!confirm('¿Eliminar esta habitación?')) return;
  try {
    await apiRequest(`/habitaciones/${id}`, { method: 'DELETE' });
    showToast('Habitación eliminada', '', 'success');
    loadRooms(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

// ============================================================================
// RESERVATIONS
// ============================================================================
async function loadGuestOptions() {
  try {
    const res = await apiRequest('/huespedes');
    const sel = document.getElementById('res-huesped');
    sel.innerHTML = '<option value="">Seleccionar huésped...</option>' +
      res.data.map(g => `<option value="${g.id}">${esc(g.nombre)} (${g.dni})</option>`).join('');
  } catch (_) {}
}

async function loadAvailableRooms() {
  try {
    const res = await apiRequest('/habitaciones?estado=disponible');
    const sel = document.getElementById('res-habitacion');
    const typeLabel = { individual: 'Individual', doble: 'Doble', suite: 'Suite' };
    sel.innerHTML = '<option value="">Seleccionar habitación...</option>' +
      res.data.map(r => `<option value="${r.id}">#${r.number} — ${typeLabel[r.type]} (${fmt(r.price)}/noche)</option>`).join('');
  } catch (_) {}
}

async function loadReservations() {
  const tbody = document.getElementById('reservations-tbody');
  try {
    const result = await apiRequest('/reservaciones');
    if (!result.data.length) {
      tbody.innerHTML = emptyRow(8, 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18', 'Sin reservaciones', 'Crea una nueva reservación');
      return;
    }
    tbody.innerHTML = result.data.map(r => `
      <tr>
        <td><strong>${esc(r.nombreHuesped)}</strong></td>
        <td>#${r.numeroHabitacion} <span style="color:var(--text-muted);font-size:.75rem">${r.tipoHabitacion}</span></td>
        <td>${r.fechaCheckIn}</td>
        <td>${r.fechaCheckOut}</td>
        <td style="text-align:center">${r.noches}</td>
        <td><strong>${fmt(r.total)}</strong></td>
        <td>${statusBadge(r.estado)}</td>
        <td>
          <div class="btn-group">
            ${r.estado === 'confirmada' ? `
              <button class="btn-icon success" onclick="completeReservation('${r.id}')" title="Check-out">${icons.logout}</button>
              <button class="btn-icon danger"  onclick="cancelReservation('${r.id}')"   title="Cancelar">${icons.x}</button>` : ''}
          </div>
        </td>
      </tr>`).join('');
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function submitReservation(e) {
  e.preventDefault();
  const f = e.target;
  try {
    const res = await apiRequest('/reservaciones', { method: 'POST', body: JSON.stringify({
      huespedId:     f.huespedId.value,
      habitacionId:  f.habitacionId.value,
      fechaCheckIn:  f.fechaCheckIn.value,
      fechaCheckOut: f.fechaCheckOut.value,
      numHuespedes:  parseInt(f.numHuespedes.value),
    })});
    showToast('Reservación confirmada', `${res.data.noches} noche(s) — ${fmt(res.data.total)}`, 'success');
    f.reset(); closeModal('modal-reservation'); loadReservations(); loadAvailableRooms(); updateStats();
  } catch (e) { handleApiError(e); }
}

async function cancelReservation(id) {
  if (!confirm('¿Cancelar esta reservación?')) return;
  try {
    await apiRequest(`/reservaciones/${id}/cancelar`, { method: 'PATCH' });
    showToast('Reservación cancelada', '', 'warning');
    loadReservations(); loadAvailableRooms(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function completeReservation(id) {
  if (!confirm('¿Realizar check-out de esta reservación?')) return;
  try {
    await apiRequest(`/reservaciones/${id}/completar`, { method: 'PATCH' });
    showToast('Check-out realizado', 'Habitación liberada', 'success');
    loadReservations(); loadAvailableRooms(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

// ============================================================================
// BILLING
// ============================================================================
async function loadReservationOptions() {
  try {
    const res = await apiRequest('/reservaciones');
    const sel = document.getElementById('bill-reservacion');
    const valid = res.data.filter(r => r.estado === 'confirmada' || r.estado === 'completada');
    sel.innerHTML = '<option value="">Seleccionar reservación...</option>' +
      valid.map(r => `<option value="${r.id}">${esc(r.nombreHuesped)} — Hab #${r.numeroHabitacion} (${fmt(r.total)})</option>`).join('');
  } catch (_) {}
}

async function loadBillings() {
  const tbody = document.getElementById('billings-tbody');
  try {
    const result = await apiRequest('/facturacion');
    if (!result.data.length) {
      tbody.innerHTML = emptyRow(8, 'M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6', 'Sin facturas', 'Genera una factura desde una reservación');
      return;
    }
    tbody.innerHTML = result.data.map(b => `
      <tr>
        <td><strong>${esc(b.nombreHuesped)}</strong></td>
        <td>#${b.numeroHabitacion}</td>
        <td>${b.noches} noche${b.noches !== 1 ? 's' : ''}</td>
        <td>${fmt(b.baseImponible)}</td>
        <td style="color:var(--text-secondary)">${fmt(b.igv)}</td>
        <td><strong>${fmt(b.totalConIgv)}</strong></td>
        <td>${statusBadge(b.estado)}</td>
        <td>
          <div class="btn-group">
            ${b.estado === 'pendiente' ? `
              <button class="btn-icon success" onclick="payBilling('${b.id}')"    title="Pagar">${icons.pay}</button>
              <button class="btn-icon danger"  onclick="cancelBilling('${b.id}')" title="Anular">${icons.x}</button>` : ''}
          </div>
        </td>
      </tr>`).join('');
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function submitBilling(e) {
  e.preventDefault();
  const f = e.target;
  try {
    const res = await apiRequest('/facturacion', { method: 'POST', body: JSON.stringify({
      reservacionId: f.reservacionId.value,
      metodoPago:    f.metodoPago.value,
      descuento:     f.descuento.value ? parseFloat(f.descuento.value) : 0,
    })});
    showToast('Factura generada', `Total: ${fmt(res.data.totalConIgv)}`, 'success');
    f.reset(); closeModal('modal-billing'); loadBillings(); updateStats();
  } catch (e) { handleApiError(e); }
}

async function payBilling(id) {
  if (!confirm('¿Confirmar pago de esta factura?')) return;
  try {
    const res = await apiRequest(`/facturacion/${id}/pagar`, { method: 'PATCH' });
    showToast('Factura pagada', fmt(res.data.totalConIgv), 'success');
    loadBillings(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

async function cancelBilling(id) {
  if (!confirm('¿Anular esta factura?')) return;
  try {
    await apiRequest(`/facturacion/${id}/anular`, { method: 'PATCH' });
    showToast('Factura anulada', '', 'warning');
    loadBillings(); updateStats();
  } catch (e) { showToast('Error', e.message, 'error'); }
}

// ============================================================================
// MODALS
// ============================================================================
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

// ============================================================================
// HELPERS
// ============================================================================
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function emptyRow(cols, _path, title, subtitle) {
  return `<tr><td colspan="${cols}">
    <div class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      </div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </div>
  </td></tr>`;
}

function handleApiError(err) {
  if (err.details && err.details.length) {
    err.details.forEach(d => showToast(`Error: ${d.field}`, d.message, 'error'));
  } else {
    showToast('Error', err.message, 'error');
  }
}

// ============================================================================
// INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Min date for check-in
  const today = new Date().toISOString().split('T')[0];
  const checkin  = document.getElementById('res-checkin');
  const checkout = document.getElementById('res-checkout');
  if (checkin) {
    checkin.min = today;
    checkin.addEventListener('change', () => {
      if (checkout) {
        checkout.min = checkin.value;
        if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
      }
    });
  }

  // Initial load
  loadGuests();
  updateStats();
});
