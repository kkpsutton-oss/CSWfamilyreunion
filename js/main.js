/* CSW Family Reunion 2027 — shared JavaScript */

/* ──────────────────────────────────────────────────────────────
   Google Apps Script Web App URL
   After deploying the script in apps-script/Code.gs as a web app
   (Deploy > New deployment > Web app, Execute as: Me, Who has
   access: Anyone), paste the resulting /exec URL below.
   ────────────────────────────────────────────────────────────── */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwX9vxIqzkIMM-KJOoWRoQtNVDTLv1F7i_6I8TZNG85UB4fxixd0uLyedv1mqeX6z09/exec';

/* ── Page fade-in ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

/* ── Scroll-reveal (IntersectionObserver) ── */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  /* Targets to fade-in individually */
  const revealSelectors = [
    '.agenda-section h2',
    '.countdown-section h2',
    '.countdown-section > p',
    '.events-showcase-header',
    '.events-showcase-title',
    '.where-info',
    '.map-placeholder',
    '.feature-banner-box',
    '.form-wrap',
    '.highlight-box',
    '.page-hero',
    '.split-hero-text',
  ];

  /* Targets whose direct children stagger in */
  const staggerSelectors = [
    '.agenda-grid',
    '.countdown-wrap',
    '.events-showcase-grid',
    '.photo-grid-3',
    '.quick-nav',
    '.card-grid',
    '.footer-grid',
    '.where-section',
  ];

  document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  document.querySelectorAll(staggerSelectors.join(',')).forEach(el => {
    el.classList.add('reveal-stagger');
    observer.observe(el);
  });

  /* Also reveal individual .card elements not already inside .card-grid */
  document.querySelectorAll('.card').forEach(el => {
    if (!el.closest('.card-grid')) {
      el.classList.add('reveal');
      observer.observe(el);
    }
  });
})();

/* ── Hero parallax ── */
(function initParallax() {
  const photo = document.querySelector('.split-hero-photo');
  if (!photo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        /* Photo moves at 25% scroll speed relative to the page — slower = depth illusion */
        photo.style.transform = `translateY(${y * 0.25}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  /* Reset on resize in case layout reflows */
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) photo.style.transform = '';
  });
})();

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

    /* Animate a number span only when its value actually changes */
    function setWithFlip(id, newText) {
      const el = document.getElementById(id);
      if (!el || el.textContent === newText) return;
      el.textContent = newText;
      el.classList.remove('flip-in');
      void el.offsetWidth; /* reflow to restart the animation */
      el.classList.add('flip-in');
    }

    function updateCountdown() {
      const diff = target - Date.now();

      if (diff <= 0) {
        countdownEl.innerHTML = '<p class="section-title" style="color:var(--color-primary)">The Reunion is Here! 🎉</p>';
        return;
      }

      setWithFlip('cd-days',    String(Math.floor(diff / 86400000)).padStart(2, '0'));
      setWithFlip('cd-hours',   String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'));
      setWithFlip('cd-minutes', String(Math.floor((diff % 3600000)  / 60000)).padStart(2, '0'));
      setWithFlip('cd-seconds', String(Math.floor((diff % 60000)    / 1000)).padStart(2, '0'));
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

  /* Wire up every form that submits to the Google Sheet backend */
  document.querySelectorAll('form.gsheet-form').forEach(form => {
    const formName = form.getAttribute('name');
    if (!formName) return;

    /* Restore previously saved data */
    const store = loadStore();
    if (store[formName]) restoreForm(form, store[formName]);

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      /* Honeypot — if filled, silently treat as success */
      const honeypot = form.querySelector('input[name="bot-field"]');
      if (honeypot && honeypot.value) {
        window.location.href = 'success.html';
        return;
      }

      const data = serializeForm(form);
      data.formName = formName;

      /* Save locally */
      const store = loadStore();
      store[formName] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting…';
      }

      /* Apps Script web apps don't return CORS headers, so the
         response is opaque under no-cors — fire-and-forget, then
         redirect to the thank-you page regardless of outcome. */
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data),
      })
        .catch(() => {})
        .finally(() => {
          window.location.href = 'success.html';
        });
    });
  });

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
