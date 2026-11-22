# My favorite finds: file map

Static shopping site, no build step. Open `index.html`.

| File | What's in it |
|---|---|
| `index.html` | Page structure only (search bar, filter panel, sections, outfit dialog) |
| `styles.css` | All CSS, with section comments |
| `data.js` | `items` (products, one per line) and `sets` (school / y2k looks). Edit this to add products |
| `app.js` | All logic, with `// =====` section headers |
| `images/` | Product, look and background images (referenced from `data.js` / `styles.css`) |

## app.js sections
1. Search, filters, `render()` (the main redraw, called after any state change)
2. School fits / OOTD carousel (`renderFits`, `showFit`)
3. `LOOK_TAGS` + `VOC`: style vocabulary that powers "More like this"
4. Hint chips and hashtags
5. Outfit builder (`SLOTS`, `buildRows`, `buildMenu`, `shuffleMatch`)
6. Color variants (`colorOpts`, `addColors`)
7. Looks, similar items, cards (`card`, `lookCard`, `renderSim`)
8. Menu, buttons, startup (`render()` is called last)

## State
`view` = all | school | y2k | liked | sim. `st` = platform/audience/group/category filters. `favs` = liked items (localStorage `vf_favs`). `bOn` = builder slots switched on.

## External files not included here
`manifest.webmanifest`, `icon-192.png`, `apple-touch-icon.png`, `sw.js` (PWA bits, still referenced).
