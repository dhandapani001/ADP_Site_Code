/**
 * ADP Tech Computers - Kanchipuram - Admin Portal Logic
 * Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram
 * Contact: 7806888984
 * Supports Night Mode & Lite Mode.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAdmin();
});

let currentTab = 'queries';
let inquiriesData = [];
let appointmentsData = [];

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Night Mode 🌙' : 'Lite Mode ☀️'}`, 'info');
    });
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

async function initAdmin() {
  setupTabs();
  setupFiltersAndSearch();
  await refreshDashboard();

  setInterval(refreshDashboard, 30000);
}

function setupTabs() {
  const tabQueries = document.getElementById('tabQueries');
  const tabAppointments = document.getElementById('tabAppointments');
  const viewQueries = document.getElementById('viewQueries');
  const viewAppointments = document.getElementById('viewAppointments');

  tabQueries.addEventListener('click', () => {
    currentTab = 'queries';
    tabQueries.classList.add('bg-sky-500', 'text-white');
    tabQueries.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-400');
    tabAppointments.classList.remove('bg-sky-500', 'text-white');
    tabAppointments.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-400');

    viewQueries.classList.remove('hidden');
    viewAppointments.classList.add('hidden');
  });

  tabAppointments.addEventListener('click', () => {
    currentTab = 'appointments';
    tabAppointments.classList.add('bg-sky-500', 'text-white');
    tabAppointments.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-400');
    tabQueries.classList.remove('bg-sky-500', 'text-white');
    tabQueries.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-400');

    viewAppointments.classList.remove('hidden');
    viewQueries.classList.add('hidden');
  });
}

function setupFiltersAndSearch() {
  const queryStatusFilter = document.getElementById('queryStatusFilter');
  const querySearch = document.getElementById('querySearch');
  const apptStatusFilter = document.getElementById('apptStatusFilter');
  const apptSearch = document.getElementById('apptSearch');

  if (queryStatusFilter) {
    queryStatusFilter.addEventListener('change', () => loadInquiries());
  }
  if (querySearch) {
    querySearch.addEventListener('input', debounce(() => loadInquiries(), 300));
  }

  if (apptStatusFilter) {
    apptStatusFilter.addEventListener('change', () => loadAppointments());
  }
  if (apptSearch) {
    apptSearch.addEventListener('input', debounce(() => loadAppointments(), 300));
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.querySelector('i').classList.add('fa-spin');
      await refreshDashboard();
      setTimeout(() => refreshBtn.querySelector('i').classList.remove('fa-spin'), 600);
    });
  }
}

async function refreshDashboard() {
  await loadStats();
  await loadInquiries();
  await loadAppointments();
}

async function loadStats() {
  try {
    const res = await API.getStats();
    if (res.success && res.data) {
      const d = res.data;
      document.getElementById('statTotalInquiries').textContent = d.total_inquiries;
      document.getElementById('statPendingInquiries').textContent = d.pending_inquiries;
      document.getElementById('statTotalAppointments').textContent = d.total_appointments;
      document.getElementById('statUpcomingAppointments').textContent = d.upcoming_appointments;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadInquiries() {
  const status = document.getElementById('queryStatusFilter')?.value || 'All';
  const search = document.getElementById('querySearch')?.value.trim() || '';

  try {
    const res = await API.getInquiries(status, search);
    if (res.success && res.data) {
      inquiriesData = res.data;
      renderInquiriesTable(res.data);
    }
  } catch (err) {
    console.error('Error loading inquiries:', err);
  }
}

function renderInquiriesTable(inquiries) {
  const tbody = document.getElementById('inquiriesTableBody');
  if (!tbody) return;

  if (inquiries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400">
          <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-500 block"></i>
          No customer inquiries found matching filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inquiries.map(inq => {
    let badgeClass = 'badge-new';
    if (inq.status === 'In Review') badgeClass = 'badge-review';
    if (inq.status === 'Contacted') badgeClass = 'badge-contacted';
    if (inq.status === 'Resolved') badgeClass = 'badge-resolved';

    let urgencyColor = 'text-slate-500';
    if (inq.urgency && inq.urgency.includes('Critical')) urgencyColor = 'text-red-500 font-bold';
    else if (inq.urgency && inq.urgency.includes('High')) urgencyColor = 'text-amber-500 font-semibold';

    return `
      <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        <td class="py-3 px-4 font-mono text-xs text-sky-600 dark:text-sky-400 font-semibold">
          ${inq.ticket_id}
        </td>
        <td class="py-3 px-4">
          <div class="text-xs font-semibold text-slate-900 dark:text-white">${escapeHtml(inq.name)}</div>
          <div class="text-[11px] text-slate-500">${escapeHtml(inq.company || 'Kanchipuram')} &bull; ${escapeHtml(inq.email)}</div>
          <div class="text-[11px] text-slate-500 font-mono font-semibold">${escapeHtml(inq.phone || 'No phone')}</div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
          <div class="font-medium text-sky-600 dark:text-sky-400">${escapeHtml(inq.service_category)}</div>
          <div class="text-[11px] text-slate-500 truncate max-w-[200px]">${escapeHtml(inq.subject || '')}</div>
        </td>
        <td class="py-3 px-4 text-xs ${urgencyColor}">
          ${escapeHtml(inq.urgency || 'Standard')}
        </td>
        <td class="py-3 px-4">
          <span class="badge-status ${badgeClass}">${inq.status}</span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
          ${inq.created_at}
        </td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button 
            onclick="viewInquiryDetail('${inq.ticket_id}')"
            class="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 transition-colors">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <select 
            onchange="changeInquiryStatus('${inq.ticket_id}', this.value)"
            class="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded px-2 py-1 outline-none">
            <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New</option>
            <option value="In Review" ${inq.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Contacted" ${inq.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Resolved" ${inq.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadAppointments() {
  const status = document.getElementById('apptStatusFilter')?.value || 'All';
  const search = document.getElementById('apptSearch')?.value.trim() || '';

  try {
    const res = await API.getAppointments(status, search);
    if (res.success && res.data) {
      appointmentsData = res.data;
      renderAppointmentsTable(res.data);
    }
  } catch (err) {
    console.error('Error loading appointments:', err);
  }
}

function renderAppointmentsTable(appointments) {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  if (appointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400">
          <i class="fa-solid fa-calendar-xmark text-3xl mb-2 text-slate-500 block"></i>
          No appointments found matching filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = appointments.map(appt => {
    let badgeClass = 'badge-confirmed';
    if (appt.status === 'Pending') badgeClass = 'badge-pending';
    if (appt.status === 'Completed') badgeClass = 'badge-resolved';
    if (appt.status === 'Cancelled') badgeClass = 'badge-cancelled';

    return `
      <tr class="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
        <td class="py-3 px-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          ${appt.booking_ref}
        </td>
        <td class="py-3 px-4">
          <div class="text-xs font-semibold text-slate-900 dark:text-white">${escapeHtml(appt.name)}</div>
          <div class="text-[11px] text-slate-500">${escapeHtml(appt.company || 'Kanchipuram')} &bull; ${escapeHtml(appt.email)}</div>
          <div class="text-[11px] text-slate-500 font-mono font-semibold">${escapeHtml(appt.phone)}</div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-700 dark:text-slate-300">
          <div class="font-medium text-sky-600 dark:text-sky-300">${escapeHtml(appt.service)}</div>
          <div class="text-[11px] text-slate-500"><i class="fa-solid fa-location-dot mr-1 text-sky-500"></i> ${escapeHtml(appt.meeting_type)}</div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-800 dark:text-slate-200">
          <div class="font-bold"><i class="fa-regular fa-calendar mr-1.5 text-sky-500"></i>${appt.appointment_date}</div>
          <div class="text-slate-500 text-[11px]"><i class="fa-regular fa-clock mr-1"></i>${appt.time_slot}</div>
        </td>
        <td class="py-3 px-4">
          <span class="badge-status ${badgeClass}">${appt.status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
          <button 
            onclick="viewApptDetail('${appt.booking_ref}')"
            class="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 transition-colors">
            <i class="fa-solid fa-file-lines"></i> Notes
          </button>
          <select 
            onchange="changeAppointmentStatus('${appt.booking_ref}', this.value)"
            class="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded px-2 py-1 outline-none">
            <option value="Confirmed" ${appt.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Completed" ${appt.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Pending" ${appt.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Cancelled" ${appt.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

async function changeInquiryStatus(ticketId, newStatus) {
  try {
    const res = await API.updateInquiryStatus(ticketId, newStatus);
    if (res.success) {
      showToast(`Ticket ${ticketId} updated to ${newStatus}`, 'success');
      await refreshDashboard();
    } else {
      showToast(res.error || 'Failed to update ticket', 'error');
    }
  } catch (err) {
    showToast('Failed to update inquiry status', 'error');
  }
}

async function changeAppointmentStatus(bookingRef, newStatus) {
  try {
    const res = await API.updateAppointmentStatus(bookingRef, newStatus);
    if (res.success) {
      showToast(`Appointment ${bookingRef} updated to ${newStatus}`, 'success');
      await refreshDashboard();
    } else {
      showToast(res.error || 'Failed to update appointment', 'error');
    }
  } catch (err) {
    showToast('Failed to update appointment status', 'error');
  }
}

function viewInquiryDetail(ticketId) {
  const inq = inquiriesData.find(i => i.ticket_id === ticketId);
  if (!inq) return;

  const modal = document.getElementById('detailModal');
  const modalTitle = document.getElementById('detailModalTitle');
  const modalBody = document.getElementById('detailModalBody');

  modalTitle.textContent = `ADP Tech Ticket: ${inq.ticket_id}`;
  modalBody.innerHTML = `
    <div class="space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <span class="block text-[11px] text-slate-500">Customer Name</span>
          <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(inq.name)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Area / Landmark</span>
          <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(inq.company || 'Kanchipuram')}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Email</span>
          <span class="font-mono text-sky-600 dark:text-sky-400">${escapeHtml(inq.email)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Phone</span>
          <span class="font-bold text-slate-900 dark:text-white font-mono">${escapeHtml(inq.phone || 'None')}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Service Category</span>
          <span class="text-sky-600 dark:text-sky-300 font-bold">${escapeHtml(inq.service_category)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Urgency</span>
          <span class="font-bold text-amber-600 dark:text-amber-400">${escapeHtml(inq.urgency || 'Standard')}</span>
        </div>
      </div>

      <div>
        <span class="block text-[11px] text-slate-500 mb-1">Subject</span>
        <div class="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-800">
          ${escapeHtml(inq.subject || 'No Subject')}
        </div>
      </div>

      <div>
        <span class="block text-[11px] text-slate-500 mb-1">Customer Problem Description</span>
        <div class="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
          ${escapeHtml(inq.message)}
        </div>
      </div>

      <div class="flex items-center justify-between text-slate-500 pt-2">
        <span>Logged: ${inq.created_at}</span>
        <span>Status: <strong class="text-sky-600 dark:text-sky-400">${inq.status}</strong></span>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function viewApptDetail(bookingRef) {
  const appt = appointmentsData.find(a => a.booking_ref === bookingRef);
  if (!appt) return;

  const modal = document.getElementById('detailModal');
  const modalTitle = document.getElementById('detailModalTitle');
  const modalBody = document.getElementById('detailModalBody');

  modalTitle.textContent = `ADP Tech Appointment: ${appt.booking_ref}`;
  modalBody.innerHTML = `
    <div class="space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <span class="block text-[11px] text-slate-500">Customer Name</span>
          <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(appt.name)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Address / Location</span>
          <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(appt.company || 'Kanchipuram')}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Email</span>
          <span class="font-mono text-sky-600 dark:text-sky-400">${escapeHtml(appt.email)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Phone</span>
          <span class="font-bold text-slate-900 dark:text-white font-mono">${escapeHtml(appt.phone)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Selected Service</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-bold">${escapeHtml(appt.service)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Service Mode</span>
          <span class="text-slate-900 dark:text-white">${escapeHtml(appt.meeting_type)}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Scheduled Date</span>
          <span class="font-bold text-slate-900 dark:text-white">${appt.appointment_date}</span>
        </div>
        <div>
          <span class="block text-[11px] text-slate-500">Time Slot</span>
          <span class="font-bold text-sky-600 dark:text-sky-400">${appt.time_slot}</span>
        </div>
      </div>

      <div>
        <span class="block text-[11px] text-slate-500 mb-1">Hardware Symptoms &amp; Notes</span>
        <div class="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
          ${escapeHtml(appt.notes || 'No preliminary notes provided.')}
        </div>
      </div>

      <div class="flex items-center justify-between text-slate-500 pt-2">
        <span>Booked: ${appt.created_at}</span>
        <span>Status: <strong class="text-emerald-600 dark:text-emerald-400">${appt.status}</strong></span>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeDetailModal() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.remove('active');
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.viewInquiryDetail = viewInquiryDetail;
window.changeInquiryStatus = changeInquiryStatus;
window.viewApptDetail = viewApptDetail;
window.changeAppointmentStatus = changeAppointmentStatus;
window.closeDetailModal = closeDetailModal;
