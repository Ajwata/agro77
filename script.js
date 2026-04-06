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

const productLayouts = document.querySelectorAll('.product-layout');
const imageGroups = [];

productLayouts.forEach((layout) => {
  const images = Array.from(layout.querySelectorAll('img'));
  if (!images.length) {
    return;
  }

  const groupIndex = imageGroups.push(images) - 1;
  images.forEach((img, index) => {
    img.classList.add('zoomable-image');
    img.dataset.groupIndex = String(groupIndex);
    img.dataset.imageIndex = String(index);
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.setAttribute('aria-label', 'Відкрити фото на весь екран');
  });
});

if (imageGroups.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Закрити">x</button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Попереднє фото">&#10094;</button>
    <div class="lightbox-stage">
      <img class="lightbox-image" alt="Фото товару" />
    </div>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Наступне фото">&#10095;</button>
    <div class="lightbox-toolbar">
      <button class="lightbox-zoom" type="button" data-zoom="out" aria-label="Зменшити">-</button>
      <span class="lightbox-counter">1 / 1</span>
      <button class="lightbox-zoom" type="button" data-zoom="in" aria-label="Збільшити">+</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const zoomButtons = lightbox.querySelectorAll('.lightbox-zoom');

  const lightboxState = {
    groupIndex: 0,
    imageIndex: 0,
    scale: 1
  };

  const clampScale = (scale) => Math.min(3, Math.max(1, scale));

  const renderLightbox = () => {
    const group = imageGroups[lightboxState.groupIndex] || [];
    const image = group[lightboxState.imageIndex];
    if (!image) {
      return;
    }

    const source = image.currentSrc || image.src;
    lightboxImage.src = source;
    lightboxImage.style.transform = `scale(${lightboxState.scale})`;
    lightboxCounter.textContent = `${lightboxState.imageIndex + 1} / ${group.length}`;
  };

  const openLightbox = (groupIndex, imageIndex) => {
    lightboxState.groupIndex = groupIndex;
    lightboxState.imageIndex = imageIndex;
    lightboxState.scale = 1;
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    renderLightbox();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    lightboxState.scale = 1;
  };

  const slideLightbox = (direction) => {
    const group = imageGroups[lightboxState.groupIndex] || [];
    if (!group.length) {
      return;
    }
    lightboxState.imageIndex = (lightboxState.imageIndex + direction + group.length) % group.length;
    lightboxState.scale = 1;
    renderLightbox();
  };

  const zoomLightbox = (delta) => {
    lightboxState.scale = clampScale(lightboxState.scale + delta);
    lightboxImage.style.transform = `scale(${lightboxState.scale})`;
  };

  document.querySelectorAll('.zoomable-image').forEach((img) => {
    const openFromImage = () => {
      const groupIndex = Number(img.dataset.groupIndex);
      const imageIndex = Number(img.dataset.imageIndex);
      openLightbox(groupIndex, imageIndex);
    };

    img.addEventListener('click', openFromImage);
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFromImage();
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => slideLightbox(-1));
  nextBtn.addEventListener('click', () => slideLightbox(1));

  zoomButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      zoomLightbox(btn.dataset.zoom === 'in' ? 0.25 : -0.25);
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) {
      closeLightbox();
    }
  });

  lightboxImage.addEventListener('dblclick', () => {
    lightboxState.scale = lightboxState.scale > 1 ? 1 : 2;
    lightboxImage.style.transform = `scale(${lightboxState.scale})`;
  });

  lightbox.addEventListener(
    'wheel',
    (event) => {
      if (!lightbox.classList.contains('is-open')) {
        return;
      }
      event.preventDefault();
      zoomLightbox(event.deltaY < 0 ? 0.2 : -0.2);
    },
    { passive: false }
  );

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeLightbox();
    }
    if (event.key === 'ArrowLeft') {
      slideLightbox(-1);
    }
    if (event.key === 'ArrowRight') {
      slideLightbox(1);
    }
    if (event.key === '+' || event.key === '=') {
      zoomLightbox(0.2);
    }
    if (event.key === '-' || event.key === '_') {
      zoomLightbox(-0.2);
    }
    if (event.key === '0') {
      lightboxState.scale = 1;
      lightboxImage.style.transform = 'scale(1)';
    }
  });
}
