# Kunooz Al-Sharq Jewellery — Portfolio

Cinematic scroll portfolio for **مجوهرات كنوز الشرق** (Kunooz Al-Sharq Jewellery), Marka Al-Shamaliya, Amman, Jordan.

A 3D gold ring, inspired by the shop's logo, sits in the hero and follows the visitor down the page, turning and moving with each section.

## Stack
- [Vite](https://vitejs.dev) — dev server and build
- [Three.js](https://threejs.org) — 3D ring (built in code, physically based gold and diamond)
- [GSAP](https://gsap.com) + ScrollTrigger — scroll-driven motion
- [Lenis](https://lenis.darkroom.engineering) — smooth scrolling
- Arabic (RTL, default) / English (LTR) toggle

## Run locally
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Git workflow
- `main` is always deployable.
- New work goes on a branch from `main`: `feature/<name>`, `fix/<name>`.
- Merge back into `main` with `--no-ff` when done, then push.

```bash
git checkout main && git pull
git checkout -b feature/my-change
# ...commit...
git checkout main && git merge --no-ff feature/my-change && git push
```

## Deploy
Every push to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`
(Repo → Settings → Pages → Source: **GitHub Actions**).

## Assets
Product photography is **placeholder** until real photos are supplied by the shop.
Contact details are taken from the shop's business card.
