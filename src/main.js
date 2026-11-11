import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createRingScene } from './ring.js';
import { initI18n } from './i18n.js';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ring = createRingScene(document.getElementById('ring-canvas'), { reduceMotion });

// Where the ring sits in each section. x is measured away from the text
// (flipped automatically for RTL/LTR).
const STATES = {
  hero:        { x: 0,    y: 0.42, z: 0,    rx: 0.18, ry: 0,    rz: 0,     s: 0.7 },
  story:       { x: 1.55, y: 0,    z: 0.3,  rx: 0.9,  ry: 0.6,  rz: -0.35, s: 0.95 },
  collections: { x: 2.6,  y: 1.3,  z: -1,   rx: 0.35, ry: 0,    rz: 0.6,   s: 0.42 },
  craft:       { x: 1.45, y: -0.05, z: 0.6, rx: 1.35, ry: 0.2,  rz: 0.2,   s: 0.95 },
  bridal:      { x: 0,    y: 0.4,  z: 0.4,  rx: 0.12, ry: 0,    rz: 0,     s: 0.78 },
  visit:       { x: 1.8,  y: 0,    z: 0,    rx: 0.5,  ry: -0.6, rz: -0.2,  s: 0.8 },
};

// ---------- Language ----------
initI18n((lang) => {
  const side = lang === 'ar' ? -1 : 1;
  gsap.to(ring, { side, duration: 1.2, ease: 'power3.inOut' });
  ScrollTrigger.refresh();
});

document.getElementById('map-link').href =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('صيدلية فداء ماركا الشمالية عمان');

// ---------- Smooth scroll ----------
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView();
  });
});

// ---------- Ring choreography ----------
ScrollTrigger.create({
  start: 0,
  end: 'max',
  onUpdate: (self) => { ring.scroll = self.progress; },
});

const sections = [...document.querySelectorAll('[data-ring]')];
sections.forEach((sec, i) => {
  if (i === 0) return;
  const from = STATES[sections[i - 1].dataset.ring];
  const to = STATES[sec.dataset.ring];
  gsap.fromTo(ring.state, { ...from }, {
    ...to,
    ease: 'power1.inOut',
    immediateRender: false,
    scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 15%', scrub: 1.2 },
  });
});

// ---------- Reveals ----------
gsap.utils.toArray('[data-reveal]').forEach((el) => {
  if (el.closest('.hero')) return;
  gsap.from(el, {
    y: 50, opacity: 0, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' },
  });
});

gsap.from('[data-card]', {
  y: 90, opacity: 0, rotateX: -18, duration: 1.2, ease: 'power3.out', stagger: 0.12,
  scrollTrigger: { trigger: '.cards', start: 'top 85%' },
});

// Bridal headline scales in as the ring takes centre stage
gsap.fromTo('.bridal .h2--xl', { scale: 0.85, letterSpacing: '0.2em' }, {
  scale: 1, letterSpacing: '0em', ease: 'none',
  scrollTrigger: { trigger: '.bridal', start: 'top bottom', end: 'center center', scrub: true },
});

// Cream craft section: darken nav for contrast
ScrollTrigger.create({
  trigger: '.craft', start: 'top 60px', end: 'bottom 60px',
  toggleClass: { targets: '#nav', className: 'nav--light' },
});

// Marquee: constant drift, sped up by scroll velocity
const marquee = gsap.to('#marquee', { xPercent: -33.333, duration: 28, ease: 'none', repeat: -1 });
if (lenis) {
  lenis.on('scroll', ({ velocity }) => {
    gsap.to(marquee, { timeScale: 1 + Math.min(Math.abs(velocity) * 0.25, 6), duration: 0.3, overwrite: true });
  });
}

// Nav background after leaving the top
ScrollTrigger.create({
  start: 40, end: 'max',
  onToggle: (self) => document.getElementById('nav').classList.toggle('nav--solid', self.isActive),
});

// ---------- Intro ----------
const bar = document.getElementById('loader-bar');
const intro = gsap.timeline({ paused: true });
intro
  .to(bar, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
  .to('#loader', { opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => document.getElementById('loader').remove() })
  .fromTo(ring.state, { s: 0, ry: -Math.PI * 2, y: -0.6 }, { s: STATES.hero.s, ry: 0, y: STATES.hero.y, duration: 2.2, ease: 'expo.out' }, '-=0.5')
  .from('.hero [data-reveal]', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.15 }, '-=1.7')
  .from('.nav, .scroll-cue', { opacity: 0, duration: 1 }, '-=1');

Promise.all([document.fonts.ready, ring.ready()]).then(() => {
  ScrollTrigger.refresh();
  if (reduceMotion) {
    intro.progress(1);
  } else {
    intro.play();
  }
});
