/**
 * NexaCore IT & Network Solutions - API Client
 * Connects frontend forms and dashboards to Python Flask REST endpoints
 */

const API = {
  baseUrl: window.location.origin,

  async getProducts(category = '') {
    const url = category && category !== 'All' 
      ? `${this.baseUrl}/api/products?category=${encodeURIComponent(category)}`
      : `${this.baseUrl}/api/products`;
    const res = await fetch(url);
    return await res.json();
  },

  async getServices() {
    const res = await fetch(`${this.baseUrl}/api/services`);
    return await res.json();
  },

  async submitInquiry(data) {
    const res = await fetch(`${this.baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getInquiries(status = 'All', search = '') {
    let url = `${this.baseUrl}/api/inquiries?`;
    if (status && status !== 'All') url += `status=${encodeURIComponent(status)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    return await res.json();
  },

  async updateInquiryStatus(id, status) {
    const res = await fetch(`${this.baseUrl}/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async bookAppointment(data) {
    const res = await fetch(`${this.baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async getAppointments(status = 'All', search = '') {
    let url = `${this.baseUrl}/api/appointments?`;
    if (status && status !== 'All') url += `status=${encodeURIComponent(status)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    return await res.json();
  },

  async updateAppointmentStatus(id, status) {
    const res = await fetch(`${this.baseUrl}/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  async getStats() {
    const res = await fetch(`${this.baseUrl}/api/dashboard/stats`);
    return await res.json();
  },

  async subscribeNewsletter(email) {
    const res = await fetch(`${this.baseUrl}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'info') icon = 'fa-circle-info';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
