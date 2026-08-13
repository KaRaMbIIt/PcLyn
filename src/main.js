// src/main.js
import './style.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init({ duration: 700, once: true, offset: 80 });

// --- Menú móvil ---
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

function closeMobileMenu() {
  mobileMenu.classList.add('hidden');
  menuBtn.setAttribute('aria-expanded', 'false');
}

function toggleMobileMenu() {
  const isHidden = mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  menuBtn.setAttribute('aria-expanded', String(isHidden));
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('click', (e) => {
  const clickedInsideMenu = mobileMenu.contains(e.target);
  const clickedButton = menuBtn.contains(e.target);
  if (!clickedInsideMenu && !clickedButton && !mobileMenu.classList.contains('hidden')) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// --- Link activo según sección visible ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('text-primary-600', isActive);
    link.classList.toggle('font-semibold', isActive);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  }
);

sections.forEach((section) => observer.observe(section));

// --- Tarjetas de servicio expandibles ---
const serviceCards = document.querySelectorAll('.service-card');
const supportsHover = window.matchMedia('(hover: hover)').matches;
let pinnedCard = null;

function expandCard(card) {
  const details = card.querySelector('.service-details');
  details.style.maxHeight = details.scrollHeight + 'px';
  card.setAttribute('aria-expanded', 'true');
}

function collapseCard(card) {
  const details = card.querySelector('.service-details');
  details.style.maxHeight = '0px';
  card.setAttribute('aria-expanded', 'false');
}

serviceCards.forEach((card) => {
  if (supportsHover) {
    card.addEventListener('mouseenter', () => {
      if (pinnedCard !== card) expandCard(card);
    });
    card.addEventListener('mouseleave', () => {
      if (pinnedCard !== card) collapseCard(card);
    });
  }

  card.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pinnedCard === card) {
      pinnedCard = null;
      collapseCard(card);
    } else {
      if (pinnedCard) collapseCard(pinnedCard);
      pinnedCard = card;
      expandCard(card);
    }
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

document.addEventListener('click', (e) => {
  if (pinnedCard && !pinnedCard.contains(e.target)) {
    collapseCard(pinnedCard);
    pinnedCard = null;
  }
});

// --- Copiar correo al portapapeles ---
const copyBtn = document.getElementById('copy-email-btn');
const copyFeedback = document.getElementById('copy-feedback');
const emailToCopy = 'mario.schiaffino@pclyn.cl';

async function copyEmail() {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(emailToCopy);
      showCopyFeedback();
      return;
    } catch (err) {
      console.error('Clipboard API falló, probando alternativa');
    }
  }

  const tempInput = document.createElement('textarea');
  tempInput.value = emailToCopy;
  tempInput.style.position = 'fixed';
  tempInput.style.opacity = '0';
  document.body.appendChild(tempInput);
  tempInput.focus();
  tempInput.select();
  try {
    document.execCommand('copy');
    showCopyFeedback();
  } catch (err) {
    console.error('No se pudo copiar el correo');
  }
  document.body.removeChild(tempInput);
}

function showCopyFeedback() {
  copyFeedback.classList.remove('hidden');
  setTimeout(() => copyFeedback.classList.add('hidden'), 2000);
}

copyBtn.addEventListener('click', copyEmail);

// --- Blobs rebotando en toda la página, estilo "logo DVD" ---
function initBgBlobs() {
  const container = document.getElementById('bg-blobs');
  const blobs = Array.from(container.querySelectorAll('.blob'));
  if (!blobs.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = blobs.map((el, i) => ({
    el,
    size: el.offsetWidth,
    x: Math.random() * (window.innerWidth - el.offsetWidth),
    y: Math.random() * (window.innerHeight - el.offsetHeight),
    vx: (0.002 + Math.random() * 0.8) * (i % 2 === 0 ? 1 : -1),
    vy: (0.002 + Math.random() * 0.8) * (i % 2 === 0 ? -1 : 1),
  }));

  state.forEach((b) => {
    b.el.style.left = b.x + 'px';
    b.el.style.top = b.y + 'px';
  });

  if (reduceMotion) return;

  function tick() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    state.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x <= 0) { b.x = 0; b.vx *= -1; }
      if (b.x + b.size >= width) { b.x = width - b.size; b.vx *= -1; }
      if (b.y <= 0) { b.y = 0; b.vy *= -1; }
      if (b.y + b.size >= height) { b.y = height - b.size; b.vy *= -1; }

      b.el.style.left = b.x + 'px';
      b.el.style.top = b.y + 'px';
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  window.addEventListener('resize', () => {
    state.forEach((b) => {
      b.x = Math.min(b.x, window.innerWidth - b.size);
      b.y = Math.min(b.y, window.innerHeight - b.size);
    });
  });
}

window.addEventListener('load', initBgBlobs);