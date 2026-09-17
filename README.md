# Monkhood 1-on-1 Session Multi-Step Qualifier Funnel

A minimalist, high-converting conditional web application and qualifier form designed for **Mr. Deepanshu Bagde** and the **Monkhood Community**.

---

## Key Features

1. **Step 1: The Gateway Screen**:
   - Clean, centered welcome screen asking:
     > *"Welcome! To help us tailor this session to your journey, are you already a part of the Monkhood community?"*
   - Interactive options:
     - **Button A**: `"Yes, I am a Monkhood member"` — reveals the Next button to advance into the Member Qualifier Form.
     - **Button B**: `"No, I am not a Monkhood member"` — immediately routes to the Non-Member Flow.

2. **Step 2: The Non-Member Flow**:
   - Displays the exact polite exclusion and invitation message:
     > *"You are currently not eligible for this 1-on-1 session. Thank you so very much for considering us! If you want to become a Monkhood community member and unlock these features, click the link below to join us."*
   - Direct Call-to-Action button pointing directly to: `https://join.monkhoodclub.com`

3. **Step 3: The Member Flow (One-Page Qualifier Form)**:
   - Header image formatted to Google Forms standard dimensions **1600 x 400 pixels (4:1 ratio)**.
   - Clean single-page vertical scrolling layout with live progress tracking (`X of 13 answered`).
   - All 13 questions with responsive inputs, styled radio tiles, and instant inline validation:
     1. Full Name (Short Text)
     2. Email Address (Email format validation)
     3. Phone Number (Phone format validation)
     4. Gender (Male / Female / Prefer not to say)
     5. Location (City/Country)
     6. Current Journey (6 curated paths)
     7. Life Area for Massive Breakthrough (4 core growth pillars)
     8. Deep Sense of Untapped Potential
     9. Exhausted & Ready for Personalized Direction
     10. Fully Committed to Roadmap
     11. Ready to Invest Energy in a Safe Space
     12. Reason for Seeking 1-on-1 with Mr. Deepanshu Bagde
     13. Problem Solved & Desired Breakthrough Feeling (Paragraph Text)

4. **Step 4: Submission, Razorpay Redirection & Google Sheets Integration**:
   - Prominent **"Apply & Secure My Slot"** button with loading feedback.
   - Dual-pipeline recording:
     - **Google Sheets Webhook**: Automatically logs submissions into rows in your connected Google Sheet.
     - **Local Persistent Storage**: All responses are backed up locally in `data/submissions.json`.
   - **Razorpay Redirection**: Displays a smooth confirmation modal and automatically redirects the user to complete their reservation.
   - **Submissions & Settings Manager**: In-app interface to export submissions to CSV and update Razorpay / Google Sheets Webhook URLs.

---

## Quick Start

### 1. Start the Application
Run:
```bash
npm start
```
or
```bash
node server.js
```
The application will be live at: **`http://localhost:3000`**

### 2. Connect Your Google Sheet (2 Minutes)
See [`google-sheets-integration/SETUP_GUIDE.md`](./google-sheets-integration/SETUP_GUIDE.md) for full instructions:
1. Open a Google Sheet and go to **Extensions > Apps Script**.
2. Paste the contents of `google-sheets-integration/Code.gs`.
3. Deploy as a Web App (Access: **Anyone**).
4. Paste the Web App URL into the app's **Settings (⚙️)** modal.

---

## File Structure

```
monkhood-session-funnel/
├── public/
│   ├── index.html              # Core application view & semantic markup
│   ├── css/
│   │   └── styles.css          # Minimalist typography & design system
│   ├── js/
│   │   ├── app.js              # State machine, validations, submission & redirects
│   │   └── config.js           # Client configuration (Razorpay URL & Webhook URL)
│   └── assets/
│       └── header-banner.svg   # 1600x400 (4:1) Google Forms-spec header banner
├── google-sheets-integration/
│   ├── Code.gs                 # Google Apps Script ready to paste into Google Sheets
│   └── SETUP_GUIDE.md          # Step-by-step 2-minute setup guide
├── data/
│   ├── submissions.json        # Persistent local database of submitted responses
│   └── config.json             # Runtime configuration
├── server.js                   # Zero-dependency Node.js HTTP server + REST API
├── package.json
└── README.md
```
