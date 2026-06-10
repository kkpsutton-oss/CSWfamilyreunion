/**
 * CSW Family Reunion 2027 — Google Apps Script form backend
 *
 * Receives form submissions (as JSON) from the website and appends
 * them as rows to a Google Sheet, one tab per form.
 *
 * ── SETUP ──────────────────────────────────────────────────────
 * 1. Create a new Google Sheet (this will store all submissions).
 * 2. In the Sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste in this entire file.
 * 4. Click Deploy > New deployment.
 *      - Type: "Web app"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 5. Click Deploy, authorize the script when prompted, and copy the
 *    Web app URL (it ends in /exec).
 * 6. Paste that URL into js/main.js as the value of GOOGLE_SCRIPT_URL.
 *
 * Each form submission creates/uses a sheet tab named after the
 * form (family-info, events-signup, tshirt-orders, contact). A
 * "Timestamp" column is added automatically, and any new fields
 * that appear in future form submissions get their own column.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheetName = data.formName || 'Submissions';
    delete data.formName;
    delete data._savedAt;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Timestamp'].concat(Object.keys(data)));
    }

    // Add columns for any new fields that aren't in the header yet
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    Object.keys(data).forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        sheet.getRange(1, headers.length + 1).setValue(key);
        headers.push(key);
      }
    });

    var row = headers.map(function (header) {
      if (header === 'Timestamp') return new Date();
      var value = data[header];
      if (Array.isArray(value)) return value.join(', ');
      return value !== undefined ? value : '';
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CSW Family Reunion 2027 form handler is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
