# Reva Daily dashboard

A static page (plain HTML, CSS, JavaScript) that shows each morning's edition from a JSON file.
A daily cloud routine writes `data/<date>.json`, copies it to `data/latest.json`, and pushes.
GitHub Pages serves the files, so refreshing the page shows the newest day.

```
index.html              the page
assets/css/dashboard.css  look (cobalt, red, warm off-white; light and dark)
assets/js/config.js     YOUR settings: marginalia URL, Obsidian vault, Sheet URL, checklist
assets/js/app.js        builds the page from the JSON
data/latest.json        today's edition (currently a layout fixture)
data/index.json         list of days, newest first
apps-script/Code.gs     saves checklist ticks to a Google Sheet
routine-prompt.md       the daily routine's instructions (draft)
```

## Preview on your Mac
```
cd dashboard
python3 -m http.server 8000
```
Open http://localhost:8000. (Opening index.html by double-click will not work, because the browser blocks loading the JSON from a file.)

## Put it live (no terminal needed)
Your GitHub username is `itsrevati`, and this Mac has no git sign-in, so the first upload is done in the browser.

1. **Create the repo.** github.com > **+** (top right) > **New repository**. Name `reva-daily`. Set it to **Public** (free GitHub Pages needs public). Tick **Add a README file**. Click **Create repository**.
2. **Upload the files.** In the new repo: **Add file > Upload files**. Open the `dashboard` folder in Finder and drag everything inside it (index.html, assets, config, data, apps-script, README.md, routine-prompt.md) into the browser window. Wait for the list to finish, then **Commit changes**.
3. **Turn on Pages.** Repo **Settings > Pages**. Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)**. Save. After a minute or two the page is live at `https://itsrevati.github.io/reva-daily/`.
4. **Let the daily routine push.** Install the Claude GitHub app on **only** this repo (claude.ai > Settings > Connectors, or the GitHub integration screen; choose "Only select repositories" and pick `reva-daily`).
5. **Tell me the repo is ready.** I attach it to the routine, swap in `routine-prompt.md`, run a test and confirm a commit lands before the 7am run is trusted.

Don't commit anything secret. The repo is public and everything in `assets/js/config.js` is visible to anyone.

## Connect the habit tracker (Google Sheet)
1. Create a Google Sheet called "Reva Daily habits".
2. **Extensions > Apps Script**. Replace the contents with `apps-script/Code.gs`. Save.
3. **Deploy > New deployment > Web app**. Execute as: Me. Who has access: Anyone. Deploy and approve the permissions.
4. Copy the web app URL into `SHEET_WEBAPP_URL` in `assets/js/config.js`.
5. Tick a box on the dashboard. A `Ticks` tab appears with one row per item per day.

"Anyone" access means anyone who finds that URL could write rows to your Sheet. The URL is long and unguessable, and the script rejects malformed data, but treat it as semi-private.

## Connect marginalia and Obsidian
- `MARGINALIA_URL`: paste your marginalia address. The "Writing exercise (marginalia)" item then opens it.
- `OBSIDIAN_VAULT`: the vault's name as shown in Obsidian. `OBSIDIAN_FOLDER` is where connection prompts are saved (default `Writing/Connection prompts`).
- The "Write in Obsidian" button opens `obsidian://new`, which creates a note in that folder with the question, tags, links to the pieces, and a place to write. Obsidian must be installed on that device.
- Tags in the note's frontmatter feed Obsidian's tag pane, backlinks and graph view.

## Editing the checklist
Change the `CHECKLIST` list in `assets/js/config.js`. Midi and Cryptic crossword have no link yet; add the address you use.
