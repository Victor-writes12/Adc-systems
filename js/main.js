/* =========================================================
   ADC SYSTEMS — main.js
   Preloader, navigation, scroll reveal, counters, tabs, form
   Vanilla JS, no dependencies.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initHeaderScroll();
  initMobileNav();
  initDropdowns();
  initScrollReveal();
  initCounters();
  initTabs();
  initFAQ();
  initGallery();
  initContactForm();
  initCookieConsent();
  initYear();
});

/* ---------- Preloader ----------
   Responsive: works regardless of viewport, hides once the
   window has finished loading (or after a safety timeout so
   the site never gets stuck behind it). */
function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;

  const hide = () => pre.classList.add('hidden');

  // Hide as soon as the page is fully loaded (images/fonts included)
  if (document.readyState === 'complete') {
    setTimeout(hide, 300);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 300));
  }

  // Safety net: never let the preloader block the site for more than 2.5s
  setTimeout(hide, 2500);
}

/* ---------- Header: shrink/shadow on scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav when a plain link (non-dropdown) is tapped
  nav.querySelectorAll('a:not(.nav-link)').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Dropdown menus (hover on desktop, tap on mobile) ---------- */
function initDropdowns() {
  const items = document.querySelectorAll('.nav-item.has-dropdown');
  items.forEach(item => {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        const wasOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      }
    });
  });

  // Close mobile dropdowns if window is resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) items.forEach(i => i.classList.remove('open'));
  });
}

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
}

/* ---------- Tabs (Services page) ---------- */
function initTabs() {
  const nav = document.querySelector('.tabs-nav');
  if (!nav) return;
  const buttons = nav.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
      history.replaceState(null, '', `#${target}`);
    });
  });

  // Deep link support: /services.html#solar
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const match = nav.querySelector(`[data-tab="${hash}"]`);
    if (match) match.click();
  }
}

/* ---------- Simple FAQ accordion (used on services/contact) ---------- */
function initFAQ() {
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqs.forEach(f => f.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Project gallery: filter + graceful missing-photo fallback + lightbox ----------
   Each gallery item points at a file under assets/images/projects/. Until that
   file exists, the <img> fails to load and we swap in a "photo coming soon"
   placeholder automatically — no HTML editing needed once real photos are added,
   just drop a file in with the matching name (see README). */
function initGallery() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;
  const items = grid.querySelectorAll('.gallery-item');

  // Missing-photo fallback
  items.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    img.addEventListener('error', () => item.classList.add('no-photo'));
    if (img.complete && img.naturalWidth === 0) item.classList.add('no-photo');
  });

  // Filters
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      items.forEach(item => {
        const match = filter === 'all' || item.getAttribute('data-category') === filter;
        item.classList.toggle('hide', !match);
      });
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const lbTitle = lightbox.querySelector('.lightbox-caption h4');
  const lbDesc = lightbox.querySelector('.lightbox-caption p');
  const lbClose = lightbox.querySelector('.lightbox-close');

  const openLightbox = (item) => {
    if (item.classList.contains('no-photo')) return; // nothing to enlarge yet
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = item.getAttribute('data-title') || '';
    lbDesc.textContent = item.getAttribute('data-desc') || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  items.forEach(item => item.addEventListener('click', () => openLightbox(item)));
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

/* ---------- Contact form (front-end validation + demo submit) ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) valid = false;
    });

    if (!valid) {
      status.textContent = 'Please fill in all required fields before sending.';
      status.className = 'form-status show';
      return;
    }

    // Demo behaviour — wire this up to a backend or form service (e.g. Formspree) in production.
    status.textContent = 'Thank you — your message has been received. Our team will respond within 24 hours.';
    status.className = 'form-status show ok';
    form.reset();
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  document.querySelectorAll('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------- Cookie consent ---------- */
function initCookieConsent() {
  const storageKey = 'adcCookieConsent';
  const stored = localStorage.getItem(storageKey);
  document.documentElement.setAttribute('data-cookie-consent', stored || 'unknown');
  if (stored) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-copy">
      <p class="cookie-banner-title">We respect your privacy.</p>
      <p>ADC Systems uses essential cookies and local storage to keep this site secure, fast and easy to use. Accept cookies for the best experience, or reject non-essential cookies while still using the site.</p>
    </div>
    <div class="cookie-banner-actions">
      <a href="privacy-policy.html" class="cookie-banner-link">Privacy Policy</a>
      <div class="cookie-banner-buttons">
        <button type="button" class="btn btn-outline" id="rejectCookies">Reject non-essential cookies</button>
        <button type="button" class="btn btn-primary" id="acceptCookies">Accept cookies</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);
  banner.querySelector('#acceptCookies').addEventListener('click', () => {
    setCookieConsent(storageKey, 'accepted');
    banner.remove();
  });
  banner.querySelector('#rejectCookies').addEventListener('click', () => {
    setCookieConsent(storageKey, 'rejected');
    banner.remove();
  });
}

function setCookieConsent(key, value) {
  localStorage.setItem(key, value);
  document.documentElement.setAttribute('data-cookie-consent', value);
}
