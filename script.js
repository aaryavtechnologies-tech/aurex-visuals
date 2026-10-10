const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  });
});

const updateHeader = () => header.classList.toggle('is-fixed', window.scrollY > 90);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!reducedMotion) {
  document.documentElement.classList.add('motion-ready');

  const revealSelectors = [
    '.section-index',
    '.intro-grid > *',
    '.story-visual',
    '.pillars article',
    '.split-heading > *',
    '.services-art',
    '.service-stack article',
    '.package-art',
    '.price-card',
    '.custom-link',
    '.why-grid > *',
    '.route-meta',
    '.reasons article',
    '.metrics > div',
    '.testimonial-art',
    '.quote-grid blockquote',
    '.contact-grid > *',
    '.contact-lines a',
    '.footer-top > *',
    '.footer-grid > div',
    '.footer-base > *'
  ];

  const revealTargets = [...document.querySelectorAll(revealSelectors.join(','))];
  revealTargets.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      entry.target.addEventListener('transitionend', () => {
        entry.target.classList.add('reveal-complete');
      }, { once: true });
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });

  revealTargets.forEach((element) => revealObserver.observe(element));

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  const parallaxShells = [...document.querySelectorAll(
    '.story-visual picture, .package-art, .why-grid picture, .testimonial-art'
  )];

  parallaxShells.forEach((shell) => {
    const image = shell.querySelector('img');
    if (!image) return;
    shell.classList.add('parallax-shell');
    image.classList.add('parallax-media');
  });

  const visibleParallax = new Set();
  const parallaxObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleParallax.add(entry.target);
      else visibleParallax.delete(entry.target);
    });
  }, { rootMargin: '18% 0px' });

  parallaxShells.forEach((shell) => parallaxObserver.observe(shell));

  let animationFrame = 0;
  const updateScrollEffects = () => {
    animationFrame = 0;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
    progress.style.transform = `scaleX(${progressValue})`;

    visibleParallax.forEach((shell) => {
      const rect = shell.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const movement = Math.max(-12, Math.min(12, centerOffset * -18));
      shell.style.setProperty('--parallax-y', `${movement.toFixed(2)}px`);
    });
  };

  const requestScrollUpdate = () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(updateScrollEffects);
  };

  updateScrollEffects();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
}


/* Smooth AUREX VISUALS cursor-letter trail for background areas only. */
const finePointer = window.matchMedia('(pointer: fine)').matches;

if (!reducedMotion && finePointer) {
  const trailCanvas = document.createElement('canvas');
  trailCanvas.className = 'cursor-letter-canvas';
  trailCanvas.setAttribute('aria-hidden', 'true');
  document.body.append(trailCanvas);

  const trailContext = trailCanvas.getContext('2d', {
    alpha: true,
    desynchronized: true
  });
  const trailLetters = [...'AUREXVISUALS'];
  const ignoredTrailTargets = [
    'a',
    'button',
    'input',
    'textarea',
    'select',
    'label',
    'img',
    'picture',
    'video',
    'canvas:not(.cursor-letter-canvas)',
    'svg',
    'h1',
    'h2',
    'h3',
    'p',
    'span',
    'li',
    'blockquote',
    'strong',
    'b',
    'small',
    '.footer-word',
    '.price',
    '.plan-top',
    '.popular',
    '.section-index',
    '.route-meta',
    '.contact-lines'
  ].join(',');

  const particles = [];
  let letterIndex = 0;
  let anchorX = Number.NaN;
  let anchorY = Number.NaN;
  let trailFrame = 0;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  const resizeTrail = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    trailCanvas.width = Math.round(viewportWidth * pixelRatio);
    trailCanvas.height = Math.round(viewportHeight * pixelRatio);
    trailCanvas.style.width = `${viewportWidth}px`;
    trailCanvas.style.height = `${viewportHeight}px`;
    trailContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const drawTrail = (time) => {
    trailFrame = 0;
    trailContext.clearRect(0, 0, viewportWidth, viewportHeight);
    trailContext.textAlign = 'center';
    trailContext.textBaseline = 'middle';
    trailContext.font = '700 13px Unbounded, Inter, sans-serif';

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      const progress = (time - particle.createdAt) / particle.life;

      if (progress >= 1) {
        particles.splice(index, 1);
        continue;
      }

      const reveal = Math.min(progress / 0.16, 1);
      const fade = progress < 0.48 ? 1 : 1 - ((progress - 0.48) / 0.52);
      const alpha = Math.max(0, reveal * fade * fade);
      const scale = 0.82 + Math.min(progress / 0.22, 1) * 0.18;
      const rise = particle.rise * progress;

      trailContext.save();
      trailContext.translate(particle.x, particle.y - rise);
      trailContext.scale(scale, scale);
      trailContext.globalAlpha = alpha;
      trailContext.fillStyle = '#19e39a';
      trailContext.shadowColor = 'rgba(25,227,154,.72)';
      trailContext.shadowBlur = 9 * (1 - progress);
      trailContext.fillText(particle.letter, 0, 0);
      trailContext.restore();
    }

    if (particles.length) trailFrame = requestAnimationFrame(drawTrail);
  };

  const startTrailFrame = () => {
    if (!trailFrame) trailFrame = requestAnimationFrame(drawTrail);
  };

  const createLetter = (x, y) => {
    const offset = Math.sin(letterIndex * 1.7) * 2.4;

    particles.push({
      letter: trailLetters[letterIndex],
      x: x + offset,
      y: y + Math.cos(letterIndex * 1.3) * 2,
      createdAt: performance.now(),
      life: 920,
      rise: 11 + (letterIndex % 3)
    });

    if (particles.length > 28) particles.shift();
    letterIndex = (letterIndex + 1) % trailLetters.length;
    startTrailFrame();
    return letterIndex === 5 ? 34 : 22;
  };

  const resetTrailAnchor = (x, y) => {
    anchorX = x;
    anchorY = y;
  };

  window.addEventListener('pointermove', (event) => {
    const isExcludedTarget = event.target instanceof Element && event.target.closest(ignoredTrailTargets);
    if (event.pointerType === 'touch' || isExcludedTarget) {
      resetTrailAnchor(event.clientX, event.clientY);
      return;
    }

    if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) {
      resetTrailAnchor(event.clientX, event.clientY);
      return;
    }

    let deltaX = event.clientX - anchorX;
    let deltaY = event.clientY - anchorY;
    let distance = Math.hypot(deltaX, deltaY);
    let spacing = letterIndex === 5 ? 34 : 22;
    let emitted = 0;

    while (distance >= spacing && emitted < 4) {
      const ratio = spacing / distance;
      anchorX += deltaX * ratio;
      anchorY += deltaY * ratio;
      spacing = createLetter(anchorX, anchorY);
      emitted += 1;
      deltaX = event.clientX - anchorX;
      deltaY = event.clientY - anchorY;
      distance = Math.hypot(deltaX, deltaY);
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    anchorX = Number.NaN;
    anchorY = Number.NaN;
  }, { passive: true });

  resizeTrail();
  window.addEventListener('resize', resizeTrail, { passive: true });
}
