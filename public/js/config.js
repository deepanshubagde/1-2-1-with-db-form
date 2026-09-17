/**
 * Application Configuration
 * Defaults can be overridden in UI via the Settings drawer or stored in localStorage / server
 */
window.APP_CONFIG = {
  // Default Razorpay Checkout URL
  RAZORPAY_CHECKOUT_URL: 'https://rzp.io/rzp/one-to-one-with-db',

  // Google Sheets Webhook URL (from Google Apps Script deployment)
  GOOGLE_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbyPQZn1F_j6ryZ0MD3qVPb--J-CMRpOSL7sJ7CZzldICQmLKc7ZKEO4aT8jUY5jI-d7/exec',

  // Monkhood Join URL for Non-Members
  NON_MEMBER_JOIN_URL: 'https://join.monkhoodclub.com',

  // Helper to load current config from server/localStorage
  async init() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const serverCfg = await res.json();
        if (serverCfg.razorpayCheckoutUrl) {
          this.RAZORPAY_CHECKOUT_URL = serverCfg.razorpayCheckoutUrl;
        }
        if (serverCfg.googleSheetWebhookUrl) {
          this.GOOGLE_SHEET_WEBHOOK_URL = serverCfg.googleSheetWebhookUrl;
        }
      }
    } catch (e) {
      console.warn('Could not sync config with server, using local defaults', e);
    }

    // LocalStorage override if exists
    const localRzp = localStorage.getItem('monkhood_rzp_url');
    if (localRzp) this.RAZORPAY_CHECKOUT_URL = localRzp;

    const localWebhook = localStorage.getItem('monkhood_sheets_webhook');
    if (localWebhook) this.GOOGLE_SHEET_WEBHOOK_URL = localWebhook;
  },

  async save(rzpUrl, webhookUrl) {
    this.RAZORPAY_CHECKOUT_URL = rzpUrl.trim();
    this.GOOGLE_SHEET_WEBHOOK_URL = webhookUrl.trim();

    localStorage.setItem('monkhood_rzp_url', this.RAZORPAY_CHECKOUT_URL);
    localStorage.setItem('monkhood_sheets_webhook', this.GOOGLE_SHEET_WEBHOOK_URL);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayCheckoutUrl: this.RAZORPAY_CHECKOUT_URL,
          googleSheetWebhookUrl: this.GOOGLE_SHEET_WEBHOOK_URL
        })
      });
    } catch (e) {
      console.warn('Could not persist config to server', e);
    }
  }
};
