# Mira – IGO Agri Estates assistant

Mira is a **static question-and-answer assistant**. Every answer is fixed text written from this website's own pages. She uses no AI service, API, backend, database, cookies, localStorage, analytics or third-party scripts. Visitor messages are never stored or sent anywhere.

## Files

| File | What it does |
|---|---|
| `mira.js` | All behaviour (plain JavaScript in one IIFE). Finds its own folder from its script URL, then loads `mira.css` and `mira-data.js` itself. |
| `mira.css` | All styles. Used only inside Mira's Shadow DOM, so it cannot change the website, and the website's CSS cannot change Mira. |
| `mira-data.js` | All text: settings, messages, link buttons and the questions and answers. |
| `assets/` | Mira's avatar, cut to a circle: 128, 256 and 512 px `.webp`, plus a 1024 px `.png` master. |

Mira's own CSS, data and image URLs end in `?v=1`. When you change a file, raise `VERSION` near the top of `mira.js` (for example to `'2'`) so browsers load the new copy.

## How it is connected to the site

There are only two connection points, and both already exist:

1. `index.html` – one line just before `</body>`:
   `<script src="/mira-assistant/mira.js" defer></script>`
2. `src/App.tsx` – on the home page only, one empty placeholder where the "Meet Mira" card appears (between the Knowledge Hub section and the requirement section):
   `<div id="mira-intro-slot"></div>`

Vite copies everything in `public/` into the build as it is, so `public/mira-assistant/` is served at `/mira-assistant/` both in development and after `npm run build`.

## Editing answers

Open `mira-data.js`:

- **Change an answer:** edit its `a` text. Keep it to 2–4 short sentences, using only facts shown on the website. The `// source:` comment above each answer names the page it comes from.
- **Add a question:** copy one item and give it a new `id`. `links` are keys from the `links` list. `keywords` are words or phrases that match typed questions (matching ignores case and punctuation; longer phrases count for more).
- **Add a link button:** add an entry to `links` with a `label` and an `href` that is a real page of the site.
- **WhatsApp:** `config.whatsappNumber` holds digits with the country code (now `917397789803`). Leave it as `""` to hide every WhatsApp button.
- **Number of questions shown at first:** `config.suggestionsCollapsed` (now 6).

## Removing Mira

1. Delete the `<script src="/mira-assistant/mira.js" defer></script>` line from `index.html`.
2. Delete the `<div id="mira-intro-slot"></div>` line from `src/App.tsx`.
3. Delete the `public/mira-assistant/` folder.

Nothing else on the site depends on Mira.
