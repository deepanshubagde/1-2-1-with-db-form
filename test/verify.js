const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { handleRequest, readSubmissions } = require('../server.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('\n--- 1. FILE & ASSET INTEGRITY TESTS ---');
const projectDir = path.join(__dirname, '..');
const requiredFiles = [
  'public/index.html',
  'public/css/styles.css',
  'public/js/app.js',
  'public/js/config.js',
  'public/assets/header-counselling.png',
  'public/assets/header-banner.svg',
  'public/assets/monkhood-logo.jpg',
  'public/assets/monkhood-club-banner.jpg',
  'google-sheets-integration/Code.gs',
  'google-sheets-integration/SETUP_GUIDE.md',
  'server.js',
  'README.md'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(projectDir, file);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(exists && size > 0, `${file} exists and is non-empty (${size} bytes)`);
});

console.log('\n--- 2. HEADER BANNER RATIO & CONTENT SPECIFICATION ---');
const bannerImgPath = path.join(projectDir, 'public/assets/header-counselling.png');
assert(fs.existsSync(bannerImgPath) && fs.statSync(bannerImgPath).size > 10000, 'Custom header image header-counselling.png is present');

const htmlContent = fs.readFileSync(path.join(projectDir, 'public/index.html'), 'utf8');
assert(htmlContent.includes('/assets/header-counselling.png'), 'index.html points to custom header image');
assert(htmlContent.includes('One-to-One Counselling with Mr. Deepanshu Bagde'), 'Header alt text and context properly configured');

console.log('\n--- 3. GATEWAY (STEP 1) SPECIFICATION ---');
assert(
  htmlContent.includes('/assets/monkhood-logo.jpg'),
  'Step 1 Monkhood logo image integrated at top center'
);
assert(
  htmlContent.includes('Exclusive to Monkhood Members'),
  'Step 1 Exclusive to Monkhood Members badge is present'
);
assert(
  htmlContent.includes('We are excited to connect with you! To get started, let us know if you are already a part of the Monkhood family.'),
  'Step 1 Gateway text matches exact prompt'
);
assert(
  htmlContent.includes('Yes, I am a Monkhood Member') && htmlContent.includes('No, I am not a Monkhood Member'),
  'Step 1 Buttons A and B match exact text'
);
assert(
  !htmlContent.includes('Next: Complete Qualifier Form'),
  'Step 1 Next button is removed (direct 1-click redirection enabled)'
);

console.log('\n--- 4. NON-MEMBER FLOW (STEP 2) SPECIFICATION ---');
assert(
  htmlContent.includes('These 1-on-1 breakthrough sessions are currently reserved exclusively for Monkhood Community Members. We’d love to welcome you inside! Click below to join the family and unlock your access to personalized mentorship.'),
  'Step 2 Non-member message matches exact prompt'
);
assert(
  htmlContent.includes('monkhood-club-banner.jpg'),
  'Step 2 Monkhood Club banner is integrated'
);
assert(
  htmlContent.includes('Join the Monkhood Community'),
  'Step 2 CTA button matches exact prompt'
);
assert(
  htmlContent.includes('https://join.monkhoodclub.com'),
  'Step 2 Redirect link points exactly to https://join.monkhoodclub.com'
);

console.log('\n--- 5. MEMBER FORM (STEP 3) 13 QUESTIONS SPECIFICATION ---');
const expectedQuestions = [
  'Full Name',
  'Email Address',
  'Phone Number',
  'Gender',
  'Location (City/Country)',
  'Which of the following best describes your current journey?',
  'Which area of your life feels most ready for a massive breakthrough right now?',
  'Do you often feel a deep sense of untapped potential inside you, just waiting for the right guidance to finally unlock it?',
  'Are you feeling exhausted from trying to figure everything out on your own, and finally ready for clear, personalized direction to accelerate your journey?',
  'If you were handed a clear, step-by-step roadmap tailored specifically to your challenges, would you be fully committed to following it?',
  'True transformation happens the moment you decide to take action. Are you ready to step into a safe, non-judgmental space and invest your energy into becoming the best version of yourself?',
  'Out of all the choices and voices out there, what specifically drew you to seek this 1-on-1 conversation with Mr. Deepanshu Bagde?',
  'What is the exact problem you want to solve in this session, and what does your ideal outcome look like?'
];

expectedQuestions.forEach((q, idx) => {
  assert(htmlContent.includes(q), `Question ${idx + 1} present in form markup`);
});

assert(htmlContent.includes('Secure My Slot'), 'Submit CTA matches "Secure My Slot"');

console.log('\n--- 6. GOOGLE SHEETS SCRIPT (Code.gs) INTEGRITY ---');
const scriptContent = fs.readFileSync(path.join(projectDir, 'google-sheets-integration/Code.gs'), 'utf8');
assert(scriptContent.includes('function doPost(e)'), 'Code.gs contains doPost(e) handler');
assert(scriptContent.includes('function doGet(e)'), 'Code.gs contains doGet(e) status handler');
assert(scriptContent.includes('LockService.getScriptLock()'), 'Code.gs uses ScriptLock for concurrency safety');
assert(scriptContent.includes('Timestamp') && scriptContent.includes('Full Name'), 'Code.gs defines header structure');

console.log('\n--- 7. SERVER REQUEST & API LOGIC TESTS ---');

// Mock request / response helper
function mockReqRes(method, urlStr, bodyData) {
  const req = new EventEmitter();
  req.method = method;
  req.url = urlStr;
  req.headers = {
    'content-type': 'application/json'
  };

  let statusCode = 200;
  let headers = {};
  let body = '';

  const res = {
    writeHead(code, h) {
      statusCode = code;
      headers = { ...headers, ...h };
    },
    setHeader(key, val) {
      headers[key.toLowerCase()] = val;
    },
    end(data) {
      if (data) body += data;
      this.emit('finish');
    },
    on(event, cb) {
      if (event === 'finish') this.finishCb = cb;
    },
    emit(event) {
      if (event === 'finish' && this.finishCb) this.finishCb();
    },
    getResponse() {
      return { statusCode, headers, body };
    }
  };

  return {
    run: () => new Promise(resolve => {
      res.on('finish', () => resolve(res.getResponse()));
      handleRequest(req, res);
      if (bodyData) {
        req.emit('data', Buffer.from(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData)));
      }
      req.emit('end');
    })
  };
}

async function runServerTests() {
  // Test GET /
  const getIndex = await mockReqRes('GET', '/').run();
  assert(getIndex.statusCode === 200, `GET / returned 200 (Got ${getIndex.statusCode})`);
  assert(getIndex.body.includes('Monkhood'), 'GET / response body contains "Monkhood"');

  // Test GET /api/config
  const getConfig = await mockReqRes('GET', '/api/config').run();
  assert(getConfig.statusCode === 200, `GET /api/config returned 200`);
  const cfgJson = JSON.parse(getConfig.body);
  assert(Boolean(cfgJson.razorpayCheckoutUrl), 'Config has razorpayCheckoutUrl configured');

  // Test POST /api/submit
  const sampleSubmission = {
    fullName: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+919876543210',
    gender: 'Male',
    location: 'Bangalore, India',
    currentJourney: 'Business / Entrepreneur',
    breakthroughArea: 'Career, Business, or Financial Growth',
    untappedPotential: 'Yes, I know I am meant for so much more',
    readyForDirection: 'Yes, I am ready to stop guessing and start moving faster',
    committedToRoadmap: 'Absolutely. I am completely ready for a positive change',
    investEnergy: 'Yes, I am choosing to prioritize my growth',
    whyDeepanshu: 'Deep clarity and authentic monkhood philosophy resonates with me.',
    breakthroughVision: 'Scaling my business with complete mental calmness and zero burn-out.'
  };

  const postSubmit = await mockReqRes('POST', '/api/submit', sampleSubmission).run();
  assert(postSubmit.statusCode === 200, `POST /api/submit returned 200`);
  const submitRes = JSON.parse(postSubmit.body);
  assert(submitRes.success === true, 'POST /api/submit response indicates success');
  assert(submitRes.id.startsWith('SUB-'), `Submission ID created: ${submitRes.id}`);

  // Test GET /api/submissions
  const getSubmissions = await mockReqRes('GET', '/api/submissions').run();
  assert(getSubmissions.statusCode === 200, 'GET /api/submissions returned 200');
  const subs = JSON.parse(getSubmissions.body);
  const found = subs.find(s => s.email === 'aarav.patel@example.com');
  assert(Boolean(found), 'Verified newly created submission exists in submissions store');
  assert(found && found.fullName === 'Aarav Patel', 'Submission fields mapped accurately');

  // Test GET /api/export-csv
  const getCsv = await mockReqRes('GET', '/api/export-csv').run();
  assert(getCsv.statusCode === 200, 'GET /api/export-csv returned 200');
  assert(getCsv.body.includes('Full Name') && getCsv.body.includes('Aarav Patel'), 'CSV export includes headers and submission record');

  console.log(`\n-----------------------------------------`);
  console.log(`TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed.`);
  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log(`All verifications passed with 100% success! 🚀\n`);
  }
}

runServerTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
