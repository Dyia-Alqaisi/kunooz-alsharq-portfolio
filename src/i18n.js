// Arabic is the source text in index.html; English mirrors it.
const en = {
  brand: 'Kunooz Al-Sharq',
  'nav.story': 'Story',
  'nav.collections': 'Collections',
  'nav.craft': 'Craft',
  'nav.visit': 'Visit',
  'hero.eyebrow': 'Amman · Marka Al-Shamaliya',
  'hero.title': 'Kunooz Al-Sharq Jewellery',
  'hero.sub': 'Gold crafted to last — a brilliance that carries the heritage of the East',
  'hero.scroll': 'Scroll',
  marquee: 'Gold ◆ Diamonds ◆ Bridal Sets ◆ Rings ◆ Bracelets ◆ Necklaces ◆',
  'story.eyebrow': 'Our Story',
  'story.title': 'Every piece a treasure, every treasure a story',
  'story.p1': 'In the heart of Marka Al-Shamaliya, we choose our gold with care and present it in designs that join Eastern heritage with modern elegance.',
  'story.p2': 'From the engagement ring to the set of a lifetime, we are with you for your most precious moments.',
  'col.eyebrow': 'Collections',
  'col.title': 'A selection of our treasures',
  'col.rings': 'Rings',
  'col.rings.t': 'Engagement rings, wedding bands and finely detailed pieces',
  'col.sets': 'Sets',
  'col.sets.t': 'Bridal and occasion sets worthy of your moment',
  'col.bracelets': 'Bracelets',
  'col.bracelets.t': 'Bracelets and bangles in Eastern and modern patterns',
  'col.necklaces': 'Necklaces',
  'col.necklaces.t': 'Chains, necklaces and pendants for every day and every evening',
  placeholder: 'Real product photo coming soon',
  'craft.eyebrow': 'Craft',
  'craft.title': 'Precision in every detail',
  'craft.1': 'Carefully selected gold',
  'craft.1.t': 'Pieces chosen across different karats to suit every taste.',
  'craft.2': 'Eastern & modern design',
  'craft.2.t': 'From heritage engraving to clean contemporary lines.',
  'craft.3': 'Personal service',
  'craft.3.t': 'We help you choose the right piece for every occasion.',
  'bridal.eyebrow': 'The moment of a lifetime',
  'bridal.title': 'A ring where the promise begins',
  'visit.eyebrow': 'Visit Us',
  'visit.title': 'We look forward to welcoming you',
  'visit.addr': 'Marka Al-Shamaliya, Amman – Jordan<br />After Al-Najmeh traffic lights, next to Fida Pharmacy',
  'visit.showroom': 'Showroom',
  'visit.mobile': 'Mobile',
  'visit.wa': 'Chat on WhatsApp',
  'visit.map': 'View on map',
  footer: '© Kunooz Al-Sharq Jewellery — Amman, Jordan',
};

const ar = {}; // filled from the DOM on first run

export function initI18n(onChange) {
  const nodes = [...document.querySelectorAll('[data-i18n]')];
  nodes.forEach((n) => { ar[n.dataset.i18n] ??= n.innerHTML; });

  const btn = document.getElementById('lang-toggle');
  let lang = 'ar';
  try { lang = localStorage.getItem('kunooz-lang') || 'ar'; } catch {}

  const apply = (next) => {
    lang = next;
    const dict = lang === 'en' ? en : ar;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    nodes.forEach((n) => { if (dict[n.dataset.i18n]) n.innerHTML = dict[n.dataset.i18n]; });
    btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
    document.title = lang === 'ar'
      ? 'مجوهرات كنوز الشرق | Kunooz Al-Sharq Jewellery'
      : 'Kunooz Al-Sharq Jewellery | مجوهرات كنوز الشرق';
    try { localStorage.setItem('kunooz-lang', lang); } catch {}
    onChange?.(lang);
  };

  btn.addEventListener('click', () => apply(lang === 'ar' ? 'en' : 'ar'));
  apply(lang);
  return () => lang;
}
