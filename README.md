# Yakthung · Limbu Heritage

An interactive single-page site celebrating the history, faith, and living culture
of the **Limbu (Yakthung)** people of the eastern Himalaya — the Mundhum, the Kirat
Hang, Limbuwan, Yuma Sammang, the Phedangma, dance and drum, archery, the Tongba,
and the Sirijunga script.

It is a **self-contained static website** — plain HTML, CSS, and JavaScript with no
build step, no framework, and no runtime dependencies. Open `index.html` in any modern
browser and it runs.

## Run it locally

Just open the file:

```
# double-click index.html, or:
start index.html        # Windows
```

Or serve it (recommended, so fonts/relative paths behave exactly like production):

```
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Any static host works — GitHub Pages, Netlify, Vercel, Cloudflare Pages. There is
nothing to build; point the host at the repo root and it serves `index.html`.

## Project layout

```
.
├── index.html          # the site (structure + content)
├── assets/
│   ├── styles.css      # global styles, keyframes, responsive + reduced-motion rules
│   └── main.js         # all interactions (scroll reveal, timeline, map, drum, glossary)
├── images/             # drop real photos here — see images/README.md
├── tools/              # build-nepal-map.py — regenerates the real SVG map of Nepal
└── design-source/      # original Claude Design canvas export, kept for reference
    ├── Limbu Heritage.dc.html
    ├── support.js          # Claude Design runtime (not used by the site)
    ├── image-slot.js       # Claude Design runtime (not used by the site)
    └── uploads/            # reference maps that were pasted into the canvas
```

## Features

- **Eleven chapters** with a fixed side navigation that tracks your position.
- **Scroll-reveal** animations, parallax depth, hero dust, and a scroll-progress bar.
- **The 29 Hang** — an interactive timeline of the Kirat kings (hover, tap, or arrow-key).
- **Limbuwan map** — an SVG of Nepal's nine eastern districts you can hover/tap to explore.
- **Glossary** — dashed terms reveal a definition on hover, tap, or keyboard focus.
- **Chyabhrung drum** — a Web Audio drum pattern you can toggle on.
- **Accessible & considerate** — keyboard support throughout, ARIA labels, and full
  `prefers-reduced-motion` handling (animations and parallax switch off automatically).

## Images

The four photo areas (hero, Yuma, dance, Tongba) currently show tasteful styled
placeholders. To drop in real photographs, see [`images/README.md`](images/README.md).

## Credits

Content drawn from Kirat & Limbu scholarship, oral tradition, and the Mundhum.
Made for education and community pride. Fonts: Marcellus, Hanken Grotesk, Space Mono,
and Noto Sans Limbu (Google Fonts). The map of Nepal is built from the
[Acesmndr/nepal-geojson](https://github.com/Acesmndr/nepal-geojson) district-boundary
dataset — see `tools/build-nepal-map.py`.
