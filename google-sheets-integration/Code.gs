/**
 * Monkhood 1-on-1 Session Qualifier Form - Google Sheets Webhook
 * Host: Mr. Deepanshu Bagde
 * 
 * Instructions:
 * 1. Create a new Google Sheet (e.g. "Monkhood 1-on-1 Applications").
 * 2. Go to Extensions > Apps Script.
 * 3. Delete existing code and paste this entire file.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Monkhood Qualifier Submissions".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (crucial so form can post without login).
 * 9. Click "Deploy", authorize permissions, and copy the Web App URL!
 * 10. Paste the Web App URL into the web application settings or config.js.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent writes
    lock.waitLock(30000);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data;
    
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    // Headers definition
    var headers = [
      "Timestamp",
      "Submission ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Gender",
      "Location (City/Country)",
      "Current Journey",
      "Breakthrough Life Area",
      "Deep Sense of Untapped Potential",
      "Exhausted & Ready for Direction",
      "Committed to Roadmap",
      "Ready to Invest Energy",
      "Why Mr. Deepanshu Bagde",
      "Breakthrough & Relief Vision",
      "Monkhood Community Member"
    ];
    
    // Initialize headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    var timestamp = new Date();
    var submissionId = data.id || "SUB-" + Utilities.formatDate(timestamp, "GMT+05:30", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
    
    var row = [
      Utilities.formatDate(timestamp, "GMT+05:30", "yyyy-MM-dd HH:mm:ss"),
      submissionId,
      data.fullName || "",
      data.email || "",
      data.phone || "",
      data.gender || "",
      data.location || "",
      data.currentJourney || "",
      data.breakthroughArea || "",
      data.untappedPotential || "",
      data.readyForDirection || "",
      data.committedToRoadmap || "",
      data.investEnergy || "",
      data.whyDeepanshu || "",
      data.breakthroughVision || "",
      data.isMember !== undefined ? (data.isMember ? "Yes" : "No") : "Yes"
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Submission logged successfully into Google Sheets",
        id: submissionId,
        rowNumber: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var count = Math.max(0, sheet.getLastRow() - 1);
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "online",
      service: "Monkhood 1-on-1 Qualifier Webhook",
      totalSubmissions: count,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
