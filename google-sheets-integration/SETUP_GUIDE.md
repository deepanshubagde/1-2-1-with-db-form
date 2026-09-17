# Google Sheets Integration Guide: Monkhood 1-on-1 Qualifier

Follow these simple steps to connect your form directly to your Google Sheet:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the sheet: **`Monkhood 1-on-1 Qualifier Responses`**.

### Step 2: Open Google Apps Script
1. In the top menu, click **Extensions** > **Apps Script**.
2. Erase any default code in the editor (`myFunction() { ... }`).
3. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor.
4. Click the **Save** icon (diskette icon) or press `Ctrl + S` / `Cmd + S`.

### Step 3: Deploy as a Web App
1. At the top right, click **Deploy** > **New deployment**.
2. Beside "Select type", click the gear icon ⚙️ and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `Monkhood 1-on-1 Form Webhook`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: allows the form to submit responses securely without requiring visitor login)*
4. Click **Deploy**.
5. Google will ask you to **Authorize access**:
   - Select your Google account.
   - If you see "Google hasn't verified this app", click **Advanced** > **Go to Monkhood Form (unsafe)**.
   - Click **Allow**.
6. Copy the generated **Web app URL** (it looks like `https://script.google.com/macros/s/.../exec`).

### Step 4: Configure the Web App URL in your Funnel
You have two easy ways to plug in your URL:
- **Option A (In the UI)**: Open the web application, click the subtle ⚙️ **Settings** button in the bottom corner, paste your URL into the **Google Sheet Webhook URL** field, and click **Save Settings**.
- **Option B (In Code/Config)**: Open `public/js/config.js` and set `GOOGLE_SHEET_WEBHOOK_URL: "https://script.google.com/macros/s/.../exec"`.

That's it! Every submission will now automatically write a formatted row with all 13 question answers, timestamp, and unique submission ID into your Google Sheet.
