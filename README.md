# lumen — scroll narrative study

**Live page:** https://batuaribakir.github.io/lumen-scroll-study/

A design and motion study: a from-scratch rebuild of the scroll-driven narrative of
[revertai.com.br](https://revertai.com.br/) (an Awwwards nominee, August 2026), made to learn
how its layout, timing and particle field work.

It is **not affiliated with Revert**. Only the behaviour was studied and rebuilt; everything on
the page is new:

- the copy, the fictional "lumen" brand, the team, partners and chart numbers are placeholders;
- the code (HTML, CSS, JavaScript) was written for this study from measurements, not copied;
- the icons are original, and the background music is an original loop synthesised by
  `tools/make-track.py` (no samples, recordings or existing melodies);
- the typeface is [Jost](https://github.com/indestructible-type/Jost) (SIL Open Font License 1.1),
  loaded from Google Fonts.

## What is inside

| path | role |
|---|---|
| `index.html`, `styles.css` | page shell and every style, landscape then portrait |
| `src/main.js` | the single animation-frame loop: eased scroll progress → DOM timeline → canvas |
| `src/timeline.js` | every text beat and label as a function of scroll progress |
| `src/field/` | the Canvas2D particle field: ambient dust, chart, perspective road and climb, fall, circuit |
| `src/content.js` | all words and data (edit this to change the page) |
| `assets/audio/` | the generated music loop and its metadata |
| `tools/make-track.py` | the music generator (`pip install numpy lameenc`) |

No build step and no dependencies. To run it locally, serve this folder, for example
`python3 -m http.server 8000`, then open http://localhost:8000/.

## Notes

- Music starts on the first click or key press (browsers block autoplay); the round button top
  right toggles it.
- `prefers-reduced-motion` is honoured: no easing, no drift, no looping animations.
- The page is marked `noindex`.
