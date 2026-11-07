# Sai Meghana Annepu: portfolio

My personal site. A 3D version of me stands on a little stage with my skills floating around her as glossy shapes. Tap a shape and her hand reaches out and taps it, then she talks you through every project that uses that skill, in text and (where the browser has a voice) out loud. Further down, pick a skill on the left and the page draws a line to every project where I've used it.

Plain HTML, CSS and JavaScript, hosted on GitHub Pages. The only build step is the 3D hero, and the built file is already committed.

## Run locally

Serve the folder (for example `python -m http.server`) and open `http://localhost:8000`. The 3D hero is an ES module, so opening `index.html` straight from disk won't load it.

## Update

* Projects and skills live at the top of `app.js` (the `SKILLS` and `PROJECTS` arrays). The 3D shapes and the tap panel pick them up automatically.
* What she says in the speech bubble lives at the top of `assets/guide.js` (the `LINES` array).
* My character picture is `assets/me.webp` (a cut out, transparent background). If you replace it, update `ME.aspect` at the top of `src/hero.js` and rebuild.
* Replace `assets/Sai_Meghana_Annepu_Resume.pdf` to update the resume download.

## Rebuild the 3D hero

Only needed after editing `src/hero.js`:

```
cd src
npm install
npm run build
```

This writes `assets/hero.js` (Three.js bundled with esbuild).

## Files

* `index.html`, `styles.css`, `app.js`: the page, styles, projects and skill map
* `assets/hero.js`: the built 3D stage (source in `src/hero.js`)
* `assets/guide.js`: the speech bubble, read aloud and the skill tour panel
* `assets/effects.js`: finishing touches (name reveal, scroll progress, cursor glow, card spotlights)

Everything respects reduced motion, and the page still works without WebGL.
