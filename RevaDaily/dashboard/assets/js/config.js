// Edit this file to point the dashboard at your own tools. Nothing here is secret:
// it is served publicly, so never put passwords or API keys in it.
window.REVA_CONFIG = {
  // Where your marginalia project lives. Leave empty until you have the URL.
  MARGINALIA_URL: "https://itsrevati.github.io/Marginalia/",

  // Obsidian: the "Write for 10 minutes" button opens a new note in this vault and folder.
  // The vault name is the folder name Obsidian shows in its vault switcher.
  OBSIDIAN_VAULT: "Digital Garden",
  OBSIDIAN_FOLDER: "Writing/Connection prompts",

  // Google Apps Script web app URL that saves checklist ticks to your Sheet.
  // Leave empty and ticks are saved in this browser only.
  SHEET_WEBAPP_URL: "",

  // Link used next to Substack picks so you can check them yourself.
  PANGRAM_URL: "https://www.pangram.com",

  // The daily checklist. `link` makes the item open something; `anchor` scrolls to a section.
  CHECKLIST: [
    { group: "Brain games", items: [
      { id: "wordle", label: "Wordle", link: "https://www.nytimes.com/games/wordle/index.html" },
      { id: "connections", label: "Connections", link: "https://www.nytimes.com/games/connections" },
      { id: "travle", label: "Travle", link: "https://travle.earth" },
      { id: "midi", label: "Midi", link: "" },
      { id: "mini", label: "Mini", link: "https://www.nytimes.com/crosswords/game/mini" },
      { id: "cryptic", label: "Cryptic crossword", link: "" }
    ]},
    { group: "Reading", items: [
      { id: "deep-dive", label: "Deep dive", anchor: "read-ai" },
      { id: "culture", label: "Culture article", anchor: "read-mind" },
      { id: "paper", label: "Paper skim", anchor: "read-paper" },
      { id: "deep-dive-geo", label: "Deep dive (geopolitics)", anchor: "geo-concept" }
    ]},
    { group: "Writing", items: [
      { id: "write-normal", label: "Writing exercise (marginalia)", action: "marginalia" },
      { id: "write-connection", label: "Writing exercise (connection)", action: "obsidian" }
    ]}
  ]
};
