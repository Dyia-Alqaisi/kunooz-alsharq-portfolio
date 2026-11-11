import { defineConfig } from 'vite';

// base = repo name so the build works on GitHub Pages (/kunooz-alsharq-portfolio/)
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/kunooz-alsharq-portfolio/' : '/',
});
