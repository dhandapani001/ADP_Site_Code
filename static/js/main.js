/**
 * ADP Tech Computers - Kanchipuram - Main Application Logic
 * Address: 33b, Thirumetrali Street, Pillaiyar Palayam, Kanchipuram
 * Contact: 7806888984
 * Supports Night Mode & Lite Mode, 9 Core Simple Services, and Kanchipuram Fair Pricing.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initApp();
});

let loadedProducts = [];
let loadedServices = [];

// --- Theme Management (Night Mode & Lite Mode) ---
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

async function initApp() {
  setupNavigation();
  setupAppointmentModal();
  setupQueryForm();
  setupNewsletter();
  setupLiveTelemetry();
  setupCounters();

  // Load dynamic data from Backend API
  await loadServices();
  await loadProducts('All');
  setupProductTabs();
  
  // Set minimum date for appointment booking (tomorrow)
  const dateInput = document.getElementById('apptDate');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }
}

// --- Navigation & Mobile Menu ---
function setupNavigation() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Active Navbar scroll highlight
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('text-sky-500', 'font-bold');
        } else {
          navLink.classList.remove('text-sky-500', 'font-bold');
        }
      }
    });
  });
}

// --- Dynamic Services Loading (The 9 Core Simple Services) ---
async function loadServices() {
  const container = document.getElementById('servicesContainer');
  if (!container) return;

  try {
    const res = await API.getServices();
    if (res.success && res.data) {
      loadedServices = res.data;
      renderServices(res.data);
      populateServiceDropdowns(res.data);
    }
  } catch (err) {
    console.error('Error loading services:', err);
  }
}

function renderServices(services) {
  const container = document.getElementById('servicesContainer');
  if (!container) return;

  container.innerHTML = services.map(srv => {
    const featureItems = srv.features.split('|').map(f => `
      <li class="flex items-start text-xs text-slate-600 dark:text-slate-300">
        <i class="fa-solid fa-check-circle text-sky-500 mt-0.5 mr-2 flex-shrink-0"></i>
        <span>${f}</span>
      </li>
    `).join('');

    return `
      <div class="glass-card rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 text-xl group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
              <i class="${srv.icon}"></i>
            </div>
            <div class="text-right">
              <span class="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Fair Rate</span>
              <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${srv.price_inr}</span>
            </div>
          </div>

          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-sky-500 transition-colors">
            ${srv.name}
          </h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            ${srv.short_desc}
          </p>

          <div class="border-t border-slate-200 dark:border-slate-800/80 pt-3 mb-5">
            <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Service Process</p>
            <ul class="space-y-1.5">
              ${featureItems}
            </ul>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button 
            onclick="openAppointmentModal('${srv.name.replace(/'/g, "\\'")}')"
            class="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 transition-all">
            <i class="fa-solid fa-calendar-check"></i>
            <span>Book Appointment</span>
          </button>
          <button 
            onclick="prefillQueryService('${srv.name.replace(/'/g, "\\'")}')"
            title="Ask Questions"
            class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2.5 rounded-xl text-xs transition-colors">
            <i class="fa-solid fa-comment-dots"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function populateServiceDropdowns(services) {
  const apptSelect = document.getElementById('apptService');
  const inquirySelect = document.getElementById('inquiryCategory');

  if (apptSelect) {
    apptSelect.innerHTML = services.map(s => `
      <option value="${s.name}">${s.name} (${s.price_inr})</option>
    `).join('') + `<option value="Other Computer Complaint">Other Computer / Network Complaint</option>`;
  }

  if (inquirySelect) {
    inquirySelect.innerHTML = `
      <option value="">Select Service / Hardware Complaint</option>
      ${services.map(s => `<option value="${s.name}">${s.name} (${s.price_inr})</option>`).join('')}
      <option value="Urgent Dead Laptop / Desktop (Emergency)">🚨 Urgent Dead Laptop / PC (Carry-in / Pickup)</option>
      <option value="Component Purchase / Kanchipuram Price">Component Purchase / Upgrade Quote</option>
      <option value="General Technical Question">General Technical Question</option>
    `;
  }
}

// --- Dynamic Products Loading ---
async function loadProducts(category = 'All') {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  try {
    const res = await API.getProducts(category);
    if (res.success && res.data) {
      loadedProducts = res.data;
      renderProducts(res.data);
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

function setupProductTabs() {
  const tabButtons = document.querySelectorAll('.product-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active', 'bg-sky-500', 'text-white');
        b.classList.add('bg-slate-100', 'dark:bg-slate-900/80', 'text-slate-700', 'dark:text-slate-400');
      });
      
      btn.classList.add('active', 'bg-sky-500', 'text-white');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-900/80', 'text-slate-700', 'dark:text-slate-400');

      const category = btn.getAttribute('data-category');
      loadProducts(category);
    });
  });
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400">
        <i class="fa-solid fa-box-open text-4xl mb-3 text-slate-500"></i>
        <p>No components found in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(prod => {
    const specTags = prod.specs.split('|').slice(0, 3).map(s => `
      <span class="inline-flex items-center text-[10px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 px-2 py-0.5 rounded-md">
        <i class="fa-solid fa-check text-sky-500 mr-1 text-[8px]"></i> ${s}
      </span>
    `).join('');

    return `
      <div class="glass-card rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
              ${prod.category}
            </span>
            ${prod.badge ? `
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                ${prod.badge}
              </span>
            ` : ''}
          </div>

          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sky-500 text-lg group-hover:scale-105 transition-all">
              <i class="${prod.image_icon}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors leading-tight">
                ${prod.name}
              </h3>
              <p class="text-[11px] font-mono text-slate-500 mt-0.5">${prod.product_id}</p>
            </div>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
            ${prod.description}
          </p>

          <div class="flex flex-wrap gap-1 mb-5">
            ${specTags}
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span class="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">Fair Price</span>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">${prod.price_display}</span>
          </div>
          <button 
            onclick="prefillQueryProduct('${prod.name.replace(/'/g, "\\'")}', '${prod.product_id}')"
            class="bg-sky-500/15 hover:bg-sky-500 hover:text-white text-sky-600 dark:text-sky-400 border border-sky-500/30 font-semibold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all">
            <span>Enquire Part</span>
            <i class="fa-solid fa-arrow-right text-[9px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// --- Appointment Modal Handling ---
function setupAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  const closeBtn = document.getElementById('closeApptModal');
  const cancelBtn = document.getElementById('cancelApptModal');
  const form = document.getElementById('appointmentForm');

  if (closeBtn) closeBtn.addEventListener('click', closeAppointmentModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAppointmentModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAppointmentModal();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Confirming Booking...`;

      const formData = {
        name: document.getElementById('apptName').value.trim(),
        email: document.getElementById('apptEmail').value.trim(),
        phone: document.getElementById('apptPhone').value.trim(),
        company: document.getElementById('apptCompany').value.trim() || 'Kanchipuram',
        service: document.getElementById('apptService').value,
        appointment_date: document.getElementById('apptDate').value,
        time_slot: document.getElementById('apptTimeSlot').value,
        meeting_type: document.getElementById('apptMeetingType').value,
        notes: document.getElementById('apptNotes').value.trim()
      };

      try {
        const res = await API.bookAppointment(formData);
        if (res.success) {
          showToast(`Appointment Confirmed! Ref: ${res.booking_ref}`, 'success');
          showAppointmentSuccessModal(res.data);
          form.reset();
        } else {
          showToast(res.error || 'Failed to book appointment', 'error');
        }
      } catch (err) {
        showToast('Network error while scheduling appointment', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}

function openAppointmentModal(preselectedService = null) {
  const modal = document.getElementById('appointmentModal');
  if (!modal) return;

  if (preselectedService) {
    const serviceSelect = document.getElementById('apptService');
    if (serviceSelect) {
      for (let i = 0; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].value.includes(preselectedService)) {
          serviceSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  document.getElementById('appointmentFormContainer').classList.remove('hidden');
  document.getElementById('appointmentSuccessContainer').classList.add('hidden');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function showAppointmentSuccessModal(booking) {
  const formBox = document.getElementById('appointmentFormContainer');
  const successBox = document.getElementById('appointmentSuccessContainer');

  formBox.classList.add('hidden');
  successBox.classList.remove('hidden');

  document.getElementById('confirmedRef').textContent = booking.booking_ref;
  document.getElementById('confirmedService').textContent = booking.service;
  document.getElementById('confirmedDate').textContent = `${booking.appointment_date} at ${booking.time_slot}`;
  document.getElementById('confirmedClient').textContent = `${booking.name} (${booking.company || 'Kanchipuram'})`;
  document.getElementById('confirmedMode').textContent = booking.meeting_type;
}

// --- Customer Query Form Handling ---
function setupQueryForm() {
  const form = document.getElementById('customerQueryForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting to ADP Tech Desk...`;

    const formData = {
      name: document.getElementById('queryName').value.trim(),
      email: document.getElementById('queryEmail').value.trim(),
      phone: document.getElementById('queryPhone').value.trim(),
      company: document.getElementById('queryCompany').value.trim() || 'Kanchipuram',
      service_category: document.getElementById('inquiryCategory').value || 'DeskTop Service',
      urgency: document.getElementById('queryUrgency').value,
      subject: document.getElementById('querySubject').value.trim() || 'ADP Tech Service Query',
      message: document.getElementById('queryMessage').value.trim()
    };

    try {
      const res = await API.submitInquiry(formData);
      if (res.success) {
        showToast(`Query logged! Ticket ID: ${res.ticket_id}`, 'success');
        
        const alertBox = document.getElementById('querySuccessAlert');
        if (alertBox) {
          document.getElementById('ticketNumberDisplay').textContent = res.ticket_id;
          alertBox.classList.remove('hidden');
          setTimeout(() => alertBox.scrollIntoView({ behavior: 'smooth' }), 100);
        }
        form.reset();
      } else {
        showToast(res.error || 'Failed to submit inquiry', 'error');
      }
    } catch (err) {
      showToast('Server communication error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function prefillQueryService(serviceName) {
  const contactSection = document.getElementById('contact');
  const categorySelect = document.getElementById('inquiryCategory');
  const subjectInput = document.getElementById('querySubject');

  if (categorySelect) {
    for (let i = 0; i < categorySelect.options.length; i++) {
      if (categorySelect.options[i].value.includes(serviceName)) {
        categorySelect.selectedIndex = i;
        break;
      }
    }
  }
  if (subjectInput) subjectInput.value = `Service Query: ${serviceName}`;

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Form prefilled for "${serviceName}"`, 'info');
  }
}

function prefillQueryProduct(productName, productId) {
  const contactSection = document.getElementById('contact');
  const categorySelect = document.getElementById('inquiryCategory');
  const subjectInput = document.getElementById('querySubject');
  const messageArea = document.getElementById('queryMessage');

  if (categorySelect) categorySelect.value = 'Component Purchase / Kanchipuram Price';
  if (subjectInput) subjectInput.value = `Enquiry: ${productName} (${productId})`;
  if (messageArea && !messageArea.value) {
    messageArea.value = `Hello ADP Tech Computers,\n\nPlease confirm stock availability and installation charge for ${productName} (${productId}) at your Kanchipuram center / doorstep service.\n\nThank you.`;
  }

  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Part enquiry prefilled for "${productName}"`, 'info');
  }
}

// --- Newsletter Subscription ---
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput.value.trim();

    try {
      const res = await API.subscribeNewsletter(email);
      if (res.success) {
        showToast(res.message || 'Subscribed for ADP Tech Computers Service Offers!', 'success');
        emailInput.value = '';
      } else {
        showToast(res.error || 'Subscription failed', 'error');
      }
    } catch (err) {
      showToast('Unable to subscribe at this moment', 'error');
    }
  });
}

// --- Live Telemetry Simulation ---
function setupLiveTelemetry() {
  const ticketsEl = document.getElementById('telemetryTickets');

  if (ticketsEl) {
    let tickets = 8450;
    setInterval(() => {
      tickets += Math.floor(Math.random() * 2);
      ticketsEl.textContent = tickets.toLocaleString() + '+';
    }, 8000);
  }
}

// --- Animated Metric Counters ---
function setupCounters() {
  const counterEls = document.querySelectorAll('.stat-counter');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterEls.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const suffix = counter.getAttribute('data-suffix') || '';
          const prefix = counter.getAttribute('data-prefix') || '';
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const step = target / 40;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            counter.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
          }, 35);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('achievements');
  if (statsSection) observer.observe(statsSection);
}

window.openAppointmentModal = openAppointmentModal;
window.closeAppointmentModal = closeAppointmentModal;
window.prefillQueryService = prefillQueryService;
window.prefillQueryProduct = prefillQueryProduct;
