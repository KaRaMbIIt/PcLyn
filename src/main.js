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