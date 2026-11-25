// SUPER30 Career Academy

const WHATSAPP = '917435964586';
const POPUP_KEY = 's30-ai-masterclass-popup';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  menu.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--i', Math.min(i, 6.6)));
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', (e) => { if (e.matches) set(false); });
}

// Scroll reveal, once per element
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => observer.observe(el));
}

// Tagline: words light up one at a time as they cross the trigger line
function initTagline() {
  const lines = document.querySelectorAll('.tagline .line');
  if (!lines.length || reducedMotion || !('IntersectionObserver' in window)) {
    return;
  }
  lines.forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      line.append(span, i < words.length - 1 ? ' ' : '');
    });
  });
  const observer = new IntersectionObserver((entries) => {
    entries
      .filter((e) => e.isIntersecting || e.boundingClientRect.top < 0)
      .forEach((e, i) => {
        e.target.style.transitionDelay = `${i * 90}ms`;
        e.target.classList.add('on');
        observer.unobserve(e.target);
      });
  }, { rootMargin: '0px 0px -30% 0px' });
  document.querySelectorAll('.tagline .word').forEach((w) => observer.observe(w));
}

// Course popup, shown on the first visit only
function initPopup() {
  const popup = document.getElementById('coursePopup');
  if (!popup || typeof popup.showModal !== 'function') return;
  let seen = false;
  try { seen = localStorage.getItem(POPUP_KEY) === 'seen'; } catch (e) { /* storage blocked */ }
  popup.addEventListener('click', (e) => {
    if (e.target === popup || e.target.closest('[data-close]')) popup.close();
  });
  if (seen) return;
  setTimeout(() => {
    if (document.body.classList.contains('menu-open')) return;
    popup.showModal();
    try { localStorage.setItem(POPUP_KEY, 'seen'); } catch (e) { /* storage blocked */ }
  }, 800);
}

// Enquiry forms: validate, then hand the message to WhatsApp
function fieldError(input) {
  const value = input.value.trim();
  const label = input.dataset.label || 'This field';
  if (input.required && !value) return `${label} is required.`;
  if (value && input.type === 'tel' && !/^(\+?91[\s]?)?[6-9]\d{4}[\s]?\d{5}$/.test(value)) return 'Enter a 10 digit mobile number.';
  if (value && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter an email address like name@example.com.';
  return '';
}

function showError(input) {
  const message = fieldError(input);
  const field = input.closest('.field');
  let node = field.querySelector('.error');
  if (!node) {
    node = document.createElement('p');
    node.className = 'error';
    node.id = `${input.id}-error`;
    field.append(node);
  }
  node.textContent = message;
  node.hidden = !message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
  if (message) input.setAttribute('aria-describedby', node.id);
  else input.removeAttribute('aria-describedby');
  return !message;
}

function initForms() {
  document.querySelectorAll('form[data-whatsapp]').forEach((form) => {
    const inputs = [...form.querySelectorAll('.field input, .field select, .field textarea')];
    inputs.forEach((input) => input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') showError(input);
    }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = inputs.filter((input) => !showError(input));
      if (invalid.length) { invalid[0].focus(); return; }
      const lines = [form.dataset.whatsapp];
      inputs.forEach((input) => {
        if (input.value.trim()) lines.push(`${input.dataset.label}: ${input.value.trim()}`);
      });
      form.querySelectorAll('.check input:checked').forEach((box) => lines.push(box.value));
      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      const status = form.querySelector('.form-status');
      status.textContent = 'Your message is ready in WhatsApp. Press send there to reach us. ';
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Open WhatsApp again';
      status.append(link);
    });
  });
}

initMenu();
initReveal();
initTagline();
initPopup();
initForms();
