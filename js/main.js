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
    /* Close menu when a link is tapped */
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

  /* ── Netlify Form success message ── */
  /* Netlify redirects to ?success=true after submission */
  if (window.location.search.includes('success=true')) {
    const msg = document.querySelector('.form-success');
    if (msg) {
      msg.style.display = 'block';
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    /* Clean the URL so refresh doesn't re-show the message */
    history.replaceState(null, '', window.location.pathname);
  }

  /* ── T-shirt quantity stepper ── */
  document.querySelectorAll('.qty-stepper').forEach(wrap => {
    const minus  = wrap.querySelector('[data-action="minus"]');
    const plus   = wrap.querySelector('[data-action="plus"]');
    const input  = wrap.querySelector('input[type="number"]');
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

});
