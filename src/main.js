// src/main.js
import './style.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init({ duration: 700, once: true, offset: 80 });

// --- Panel de cotización (cajón lateral) ---
function initQuotePanel() {
  const tab = document.getElementById('quote-tab');
  const panel = document.getElementById('quote-panel');
  const overlay = document.getElementById('quote-overlay');
  const closeBtn = document.getElementById('quote-close');
  const form = document.getElementById('quote-form');
  const submitBtn = document.getElementById('quote-submit');
  const status = document.getElementById('quote-status');
  
  tab.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  document.getElementById('quote-close-bottom').addEventListener('click', closePanel);

  function openPanel() {
    panel.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    tab.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    panel.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
    tab.setAttribute('aria-expanded', 'false');
  }

  tab.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  let lastSubmitTime = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-spam extra: evita reenvíos inmediatos repetidos (doble click, bots rápidos)
    const now = Date.now();
    if (now - lastSubmitTime < 15000) {
      showStatus('Espera unos segundos antes de volver a enviar.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        lastSubmitTime = now;
        showStatus('¡Solicitud enviada! Te contactaremos pronto.', 'success');
        form.reset();
        setTimeout(closePanel, 2000);
      } else {
        showStatus('Hubo un problema al enviar. Intenta de nuevo.', 'error');
      }
    } catch (err) {
      showStatus('Error de conexión. Revisa tu internet e intenta de nuevo.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar solicitud';
    }
  });

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = `text-sm mt-3 ${type === 'success' ? 'text-primary-600' : 'text-red-500'}`;
    status.classList.remove('hidden');
  }
}

window.addEventListener('load', initQuotePanel);


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

// --- Fondo de cableado con luz tipo fibra óptica ---
function directionOf(a, b) {
  return a[0] === b[0] ? 'v' : 'h';
}

function offsetWaypoints(W, k) {
  const n = W.length;
  const segDir = [];
  for (let i = 0; i < n - 1; i++) segDir.push(directionOf(W[i], W[i + 1]));
  const result = [];
  for (let i = 0; i < n; i++) {
    let offX = 0, offY = 0;
    const before = i > 0 ? segDir[i - 1] : null;
    const after = i < n - 1 ? segDir[i] : null;
    if (before === 'v' || after === 'v') offX = k;
    if (before === 'h' || after === 'h') offY = k;
    result.push([W[i][0] + offX, W[i][1] + offY]);
  }
  return result;
}

function pathFromWaypoints(W) {
  let d = `M${W[0][0]},${W[0][1]}`;
  for (let i = 1; i < W.length; i++) d += ` L${W[i][0]},${W[i][1]}`;
  return d;
}

function initCableBackground() {
  const container = document.getElementById('bg-wires');
  const svg = document.getElementById('wires-svg');
  if (!container || !svg) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ns = 'http://www.w3.org/2000/svg';

  // El fondo se ajusta al alto real de la página (varía según contenido y pantalla)
  function updateHeight() {
    container.style.height = document.documentElement.scrollHeight + 'px';
  }
  updateHeight();
  window.addEventListener('resize', updateHeight);

  const bundles = [
    {
      color: '#11A09A', light: '#a8f0e8',
      xs: [60, 60, 900, 900, 150, 150, 1050, 1050, 300, 300],
      ys: [0, 350, 350, 800, 800, 1250, 1250, 1700, 1700, 3000],
      speed: [7, 9, 6, 10],
    },
    {
      color: '#0F70B7', light: '#bfe0ff',
      xs: [1140, 1140, 200, 200, 1000, 1000, 100, 100, 900, 900],
      ys: [0, 480, 480, 950, 950, 1450, 1450, 1950, 1950, 3000],
      speed: [8, 6, 10, 7],
    },
    {
      color: '#F29200', light: '#ffe3ad',
      xs: [500, 500, 1150, 1150, 50, 50, 950, 950, 200, 200],
      ys: [0, 250, 250, 700, 700, 1150, 1150, 1650, 1650, 3000],
      speed: [6, 9, 7, 11],
    },
  ];

  const laneOffsets = [-30, -10, 10, 30];

  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.setAttribute('id', 'glow');
  filter.setAttribute('x', '-200%');
  filter.setAttribute('y', '-200%');
  filter.setAttribute('width', '500%');
  filter.setAttribute('height', '500%');
  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '4');
  blur.setAttribute('result', 'blur');
  filter.appendChild(blur);
  defs.appendChild(filter);
  svg.appendChild(defs);

  let pathCounter = 0;

  bundles.forEach((bundle) => {
    const centerline = bundle.xs.map((x, idx) => [x, bundle.ys[idx]]);

    laneOffsets.forEach((k, i) => {
      const waypoints = offsetWaypoints(centerline, k);
      const d = pathFromWaypoints(waypoints);
      const pathId = `p${pathCounter++}`;

      const base = document.createElementNS(ns, 'path');
      base.setAttribute('id', pathId);
      base.setAttribute('d', d);
      base.setAttribute('fill', 'none');
      base.setAttribute('stroke', bundle.color);
      base.setAttribute('stroke-width', '1.5');
      base.setAttribute('stroke-linecap', 'round');
      base.setAttribute('stroke-linejoin', 'round');
      base.setAttribute('opacity', '0.35');
      svg.appendChild(base);

      if (reduceMotion) return; // solo líneas quietas, sin luz viajando

      const glowDot = document.createElementNS(ns, 'circle');
      glowDot.setAttribute('r', '7');
      glowDot.setAttribute('fill', bundle.light);
      glowDot.setAttribute('filter', 'url(#glow)');
      glowDot.setAttribute('opacity', '0.8');
      const glowMotion = document.createElementNS(ns, 'animateMotion');
      glowMotion.setAttribute('dur', `${bundle.speed[i]}s`);
      glowMotion.setAttribute('repeatCount', 'indefinite');
      glowMotion.setAttribute('begin', `-${i * 1.5}s`);
      const glowMpath = document.createElementNS(ns, 'mpath');
      glowMpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
      glowMotion.appendChild(glowMpath);
      glowDot.appendChild(glowMotion);
      svg.appendChild(glowDot);

      const coreDot = document.createElementNS(ns, 'circle');
      coreDot.setAttribute('r', '2.5');
      coreDot.setAttribute('fill', '#ffffff');
      const coreMotion = document.createElementNS(ns, 'animateMotion');
      coreMotion.setAttribute('dur', `${bundle.speed[i]}s`);
      coreMotion.setAttribute('repeatCount', 'indefinite');
      coreMotion.setAttribute('begin', `-${i * 1.5}s`);
      const coreMpath = document.createElementNS(ns, 'mpath');
      coreMpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
      coreMotion.appendChild(coreMpath);
      coreDot.appendChild(coreMotion);
      svg.appendChild(coreDot);
    });
  });
}

window.addEventListener('load', initCableBackground);