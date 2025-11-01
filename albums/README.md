# Top4AlbumsUI

Small, self-contained web UI to add your Top 4 albums (title + artist) and save them to your browser profile.

Files
- `index.html` — main UI
- `styles.css` — simple styling
- `app.js` — logic (saves to `localStorage` key `top4Albums`)

How to use
1. Open `index.html` in your browser (double-click or right-click -> Open with).
2. Fill in up to 4 albums (title and artist).
3. Click "Save Profile" to persist to your browser's local storage.
4. Use "Export JSON" to download a JSON file or "Import" to load one.

Notes
- Data is stored only locally in your browser. If you want server-side persistence we can add a backend or integrate this into an existing project.
