# Sai Meghana Annepu: portfolio

My personal site, in a dark cinematic style: a spotlight switches on, and an illustrated me stands in it. Tap a skill and she walks you through every project where I used it, in a speech bubble and (where the browser has a voice) out loud.

Also on the site:

* **Expandable projects.** Each project opens into "How I know it works" and "The hardest part".
* **Ask me.** A small assistant in the corner that answers questions about my projects, skills, internship and certifications, using only what's on the page. No AI service or key.
* **Terminal mode.** Press the `>_` button or the backtick key and explore with `help`, `whoami`, `ls projects`, `open crowdguard`, `cat interests.txt`, and a couple of hidden commands.
* **Journey.** A timeline that fills in as you scroll.

Plain HTML, CSS and JavaScript with no build step. Hosted on GitHub Pages.

## Run locally

Open `index.html` in a browser, or serve the folder with `python -m http.server` and open `http://localhost:8000`.

## Update

* **Projects** are written directly in `index.html`, in the "Selected work" list, so search engines and AI tools can read them. Copy an existing `<li class="project">` block to add one. Its `data-skills` attribute decides which skills it belongs to. Add a "The hardest part" paragraph (`p-challenge`) whenever you have a good story.
* **Skills** live in `data.js`.
* **The journey** is the `timeline` list in `index.html`.
* **What she says** in the speech bubble is the `LINES` array in `main.js`.
* My character picture is `assets/me.webp`. Replace `assets/Sai_Meghana_Annepu_Resume.pdf` to update the resume.

## Files

* `index.html`: the page, including every project
* `styles.css`: all styles and animations
* `data.js`: the skill list
* `main.js`: speech bubble, skill tour, project filters and expand, and the effects
* `extras.js`: the Ask me assistant and terminal mode

Everything respects reduced motion.
