const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuBtn && nav) {
  const productNav = document.querySelector('.product-nav');
  if (productNav) {
    const extraLinks = productNav.querySelectorAll('a');
    extraLinks.forEach((link) => {
      const clone = link.cloneNode(true);
      clone.classList.add('nav-mobile-only');
      nav.appendChild(clone);
    });
  }

  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    menuBtn.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuBtn.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealItems.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((el) => observer.observe(el));
}
