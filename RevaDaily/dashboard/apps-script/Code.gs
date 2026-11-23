// Google Apps Script that saves Reva Daily checklist ticks to a Google Sheet.
// Setup is in README.md ("Connect the habit tracker").
//
// Sheet layout (tab named "Ticks"): date | item | done | at
// One row per item per day. A tick or un-tick updates that row.

const SHEET_NAME = "Ticks";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["date", "item", "done", "at"]);
  }
  return sh;
}

// Save a tick. The dashboard posts JSON as text/plain.
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const date = String(body.date || "");
  const item = String(body.item || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^[a-z0-9-]{1,40}$/.test(item)) {
    return ContentService.createTextOutput("bad request");
  }
  const sh = sheet_();
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === date && rows[i][1] === item) {
      sh.getRange(i + 1, 3, 1, 2).setValues([[!!body.done, body.at || new Date().toISOString()]]);
      return ContentService.createTextOutput("ok");
    }
  }
  sh.appendRow([date, item, !!body.done, body.at || new Date().toISOString()]);
  return ContentService.createTextOutput("ok");
}

// Optional: lets the dashboard load ticks made on another device (?date=YYYY-MM-DD).
function doGet(e) {
  const date = (e.parameter && e.parameter.date) || "";
  const out = {};
  const rows = sheet_().getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === date && rows[i][2] === true) out[rows[i][1]] = true;
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
