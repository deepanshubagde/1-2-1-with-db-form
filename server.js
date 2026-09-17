const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial config if not present
const DEFAULT_CONFIG = {
  razorpayCheckoutUrl: 'https://rzp.io/l/monkhood-session',
  googleSheetWebhookUrl: 'https://script.google.com/macros/s/AKfycbyPQZn1F_j6ryZ0MD3qVPb--J-CMRpOSL7sJ7CZzldICQmLKc7ZKEO4aT8jUY5jI-d7/exec'
};

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading config:', e);
  }
  return { ...DEFAULT_CONFIG };
}

function writeConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing config:', e);
  }
}

function readSubmissions() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.error('Error reading submissions:', e);
  }
  return [];
}

function saveSubmission(submission) {
  const list = readSubmissions();
  list.unshift(submission); // newest first
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  return list;
}

// Forward to Google Apps Script if URL provided
function forwardToGoogleSheet(webhookUrl, payload) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return;

  function doRequest(targetUrl) {
    const parsed = url.parse(targetUrl);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      // Follow Google Apps Script 302 redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `${parsed.protocol}//${parsed.hostname}${redirectUrl}`;
        }
        // Follow redirect using GET
        https.get(redirectUrl, () => {
          console.log('Successfully forwarded to Google Apps Script redirect');
        }).on('error', (err) => {
          console.error('Error on Apps Script redirect:', err.message);
        });
        return;
      }
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        console.log('Google Apps Script response:', res.statusCode, body.substring(0, 100));
      });
    });

    req.on('error', (err) => {
      console.error('Failed to forward to Google Sheets:', err.message);
    });

    req.write(postData);
    req.end();
  }

  doRequest(webhookUrl);
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/config' && req.method === 'GET') {
    const config = readConfig();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
    return;
  }

  if (pathname === '/api/config' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newConfig = JSON.parse(body);
        const current = readConfig();
        const merged = { ...current, ...newConfig };
        writeConfig(merged);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config: merged }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (pathname === '/api/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const id = 'SUB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        const record = {
          id,
          timestamp,
          ...payload
        };

        saveSubmission(record);

        // Check if webhook is configured
        const config = readConfig();
        const webhookUrl = payload.googleSheetWebhookUrl || config.googleSheetWebhookUrl;
        if (webhookUrl) {
          forwardToGoogleSheet(webhookUrl, record);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          id,
          message: 'Submission recorded successfully',
          razorpayUrl: config.razorpayCheckoutUrl || 'https://rzp.io/l/monkhood-session'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process submission', details: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/submissions' && req.method === 'GET') {
    const list = readSubmissions();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  if (pathname === '/api/export-csv' && req.method === 'GET') {
    const list = readSubmissions();
    const headers = [
      'Submission ID',
      'Timestamp',
      'Full Name',
      'Email Address',
      'Phone Number',
      'Gender',
      'Location',
      'Current Journey',
      'Breakthrough Life Area',
      'Deep Sense of Untapped Potential',
      'Exhausted & Ready for Direction',
      'Committed to Roadmap',
      'Ready to Invest Energy',
      'Why Mr. Deepanshu Bagde',
      'Breakthrough & Relief Vision'
    ];

    function escapeCsv(val) {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const rows = list.map(item => [
      escapeCsv(item.id),
      escapeCsv(item.timestamp),
      escapeCsv(item.fullName),
      escapeCsv(item.email),
      escapeCsv(item.phone),
      escapeCsv(item.gender),
      escapeCsv(item.location),
      escapeCsv(item.currentJourney),
      escapeCsv(item.breakthroughArea),
      escapeCsv(item.untappedPotential),
      escapeCsv(item.readyForDirection),
      escapeCsv(item.committedToRoadmap),
      escapeCsv(item.investEnergy),
      escapeCsv(item.whyDeepanshu),
      escapeCsv(item.breakthroughVision)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=UTF-8',
      'Content-Disposition': 'attachment; filename="monkhood-submissions.csv"'
    });
    res.end(csvContent);
    return;
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, 'public', safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for client routing or 404
      const fallbackPath = path.join(__dirname, 'public', 'index.html');
      fs.readFile(fallbackPath, (fallbackErr, content) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
}

const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Monkhood Qualifier Funnel running at http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  handleRequest,
  readConfig,
  writeConfig,
  readSubmissions,
  saveSubmission
};

