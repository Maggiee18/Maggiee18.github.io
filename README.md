# Sai Meghana Annepu: portfolio

My personal site, in a dark cinematic style: a spotlight switches on, and an illustrated me stands in it. Tap a skill and she walks you through every project where I used it, in a speech bubble and (where the browser has a voice) out loud.

Plain HTML, CSS and JavaScript with no build step. Hosted on GitHub Pages.

## Run locally

Open `index.html` in a browser, or serve the folder with `python -m http.server` and open `http://localhost:8000`.

## Update

* Skills and projects live in `data.js` (the `SKILLS` and `PROJECTS` arrays). The skill chips, the spoken tour and the work list all read from there.
* What she says in the speech bubble is the `LINES` array near the top of the speech bubble part of `main.js`.
* My character picture is `assets/me.webp` (a cut out with a transparent background).
* Replace `assets/Sai_Meghana_Annepu_Resume.pdf` to update the resume download.

## Files

* `index.html`: the page
* `styles.css`: all styles, including the intro sequence and animations
* `data.js`: skills and projects
* `main.js`: the speech bubble and skill tour, the work list and filters, and the effects (spotlight dust, parallax, reveals, cursor, nav)

Everything respects reduced motion.
