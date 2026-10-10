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
