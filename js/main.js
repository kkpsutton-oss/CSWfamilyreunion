/* CSW Family Reunion 2027 — shared JavaScript */

/* ── Navigation ── */
document.addEventListener('DOMContentLoaded', () => {

  /* Mobile hamburger */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* Highlight active nav link based on current page */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });

  /* ── Countdown Timer ── */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const target = new Date('July 14, 2027 00:00:00').getTime();

    function updateCountdown() {
      const now  = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        countdownEl.innerHTML = '<p class="section-title text-center" style="color:var(--color-primary)">The Reunion is Here! 🎉</p>';
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
      document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
      document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ── Local Storage — save & restore all forms ── */

  const STORAGE_KEY = 'csw_reunion_2027';

  /* Read the master store (an object keyed by form name) */
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  /* Serialize one form into a plain object */
  function serializeForm(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (key === 'bot-field') return;
      if (key in data) {
        /* multi-select / checkboxes → array */
        data[key] = [].concat(data[key], value);
      } else {
        data[key] = value;
      }
    });
    data._savedAt = new Date().toISOString();
    return data;
  }

  /* Restore saved values back into a form's fields */
  function restoreForm(form, saved) {
    if (!saved) return;
    form.querySelectorAll('input, select, textarea').forEach(el => {
      const name = el.name;
      if (!name || name === 'bot-field' || el.type === 'hidden') return;
      const val = saved[name];
      if (val === undefined || val === null) return;

      if (el.type === 'checkbox') {
        const values = [].concat(val);
        el.checked = values.includes(el.value);
      } else if (el.type === 'radio') {
        el.checked = (el.value === val || [].concat(val).includes(el.value));
      } else {
        el.value = val;
      }
    });
  }

  /* Wire up every Netlify form on the page */
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    const formName = form.getAttribute('name');
    if (!formName) return;

    /* Restore previously saved data */
    const store = loadStore();
    if (store[formName]) restoreForm(form, store[formName]);

    /* Save on every submit (before Netlify posts) */
    form.addEventListener('submit', () => {
      const store = loadStore();
      store[formName] = serializeForm(form);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    });
  });

  /* ── Netlify Form success message ── */
  if (window.location.search.includes('success=true')) {
    const msg = document.querySelector('.form-success');
    if (msg) {
      msg.style.display = 'block';
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    history.replaceState(null, '', window.location.pathname);
  }

  /* ── T-shirt quantity stepper ── */
  document.querySelectorAll('.qty-stepper').forEach(wrap => {
    const minus = wrap.querySelector('[data-action="minus"]');
    const plus  = wrap.querySelector('[data-action="plus"]');
    const input = wrap.querySelector('input[type="number"]');
    if (!minus || !plus || !input) return;

    minus.addEventListener('click', () => {
      const val = parseInt(input.value, 10);
      if (val > 1) input.value = val - 1;
    });
    plus.addEventListener('click', () => {
      const val = parseInt(input.value, 10);
      if (val < 20) input.value = val + 1;
    });
  });

  /* ── Data Summary Panel (index.html only) ── */
  const summaryEl = document.getElementById('saved-data-summary');
  if (summaryEl) renderSummary(summaryEl);

});

/* ── Summary renderer (used on Home page) ── */
function renderSummary(container) {
  const STORAGE_KEY = 'csw_reunion_2027';
  let store;
  try { store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { store = {}; }

  const labels = {
    'family-info':   'Family Info',
    'events-signup': 'Events Sign-Up',
    'tshirt-orders': 'T-Shirt Order',
    'contact':       'Contact Message',
  };

  const rows = Object.entries(labels).map(([key, label]) => {
    const saved = store[key];
    if (!saved) {
      return `<tr>
        <td style="font-weight:600;">${label}</td>
        <td><span style="color:var(--color-text-muted);font-size:0.85rem;">Not submitted yet</span></td>
        <td style="font-size:0.8rem;color:var(--color-text-muted);">—</td>
      </tr>`;
    }
    const name = [saved.first_name, saved.last_name].filter(Boolean).join(' ') || '—';
    const when = saved._savedAt
      ? new Date(saved._savedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
      : '—';
    return `<tr>
      <td style="font-weight:600;">${label}</td>
      <td><span style="color:var(--color-success);font-weight:600;">&#10003; Saved</span> &mdash; ${name}</td>
      <td style="font-size:0.8rem;color:var(--color-text-muted);">${when}</td>
    </tr>`;
  });

  const anyData = Object.keys(store).length > 0;

  container.innerHTML = `
    <h2 class="section-title">Your Saved Information</h2>
    <hr class="divider">
    <p class="text-muted mb-2" style="font-size:0.9rem;">
      Your form responses are saved in this browser. They will be pre-filled the next time you visit.
    </p>
    <div class="card">
      <table class="info-table">
        <thead><tr><th>Form</th><th>Status</th><th>Last Saved</th></tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
      ${anyData ? `
      <div style="margin-top:1rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
        <button onclick="exportLocalData()" class="btn btn-outline" style="font-size:0.85rem; padding:0.4rem 1rem;">
          Download My Data (JSON)
        </button>
        <button onclick="clearLocalData()" class="btn btn-outline"
          style="font-size:0.85rem; padding:0.4rem 1rem; color:var(--color-error); border-color:var(--color-error);">
          Clear Saved Data
        </button>
      </div>` : ''}
    </div>
  `;
}

/* Export stored data as a downloadable JSON file */
function exportLocalData() {
  const STORAGE_KEY = 'csw_reunion_2027';
  let store;
  try { store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { store = {}; }

  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'csw-reunion-2027-my-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* Clear all locally stored data */
function clearLocalData() {
  if (!confirm('Clear all your saved form data from this browser? This cannot be undone.')) return;
  localStorage.removeItem('csw_reunion_2027');
  location.reload();
}
