/**
 * Monkhood 1-on-1 Qualifier Funnel & Application Flow
 * Host: Mr. Deepanshu Bagde
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App Configuration in background
  if (window.APP_CONFIG && window.APP_CONFIG.init) {
    window.APP_CONFIG.init().catch(err => console.warn('Config init:', err));
  }

  // View Elements
  const viewGateway = document.getElementById('view-gateway');
  const viewNonMember = document.getElementById('view-non-member');
  const viewMemberForm = document.getElementById('view-member-form');
  const navProgressText = document.getElementById('nav-progress-text');
  const formProgressWrap = document.getElementById('form-progress-wrap');
  const formProgressBar = document.getElementById('form-progress-bar');
  const navBrand = document.getElementById('nav-brand');

  // Gateway Step 1 Elements
  const btnGatewayYes = document.getElementById('btn-gateway-yes');
  const btnGatewayNo = document.getElementById('btn-gateway-no');
  const gatewayNextWrap = document.getElementById('gateway-next-wrap');
  const btnGatewayNext = document.getElementById('btn-gateway-next');

  // Non-Member Step 2 Elements
  const btnBackToGateway = document.getElementById('btn-back-to-gateway');

  // Form Step 3 Elements
  const form = document.getElementById('qualifier-form');
  const btnSubmitForm = document.getElementById('btn-submit-form');

  // Modals & Settings
  const modalSettings = document.getElementById('modal-settings');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const cfgRazorpayUrl = document.getElementById('cfg-razorpay-url');
  const cfgWebhookUrl = document.getElementById('cfg-webhook-url');

  const modalAdmin = document.getElementById('modal-admin');
  const btnOpenAdmin = document.getElementById('btn-open-admin');
  const btnCloseAdmin = document.getElementById('btn-close-admin');
  const adminSubmissionsList = document.getElementById('admin-submissions-list');

  // Current State
  let currentStep = 'gateway'; // 'gateway' | 'non-member' | 'member-form'
  let memberSelection = null; // 'yes' | 'no'

  // View Switcher Function - Explicitly handles display & classes
  function switchView(target) {
    currentStep = target;

    // First hide all views completely
    if (viewGateway) {
      viewGateway.classList.remove('active');
      viewGateway.style.display = 'none';
    }
    if (viewNonMember) {
      viewNonMember.classList.remove('active');
      viewNonMember.style.display = 'none';
    }
    if (viewMemberForm) {
      viewMemberForm.classList.remove('active');
      viewMemberForm.style.display = 'none';
    }

    if (target === 'gateway') {
      if (viewGateway) {
        viewGateway.classList.add('active');
        viewGateway.style.display = 'flex';
      }
      if (navProgressText) navProgressText.style.display = 'none';
      if (formProgressWrap) formProgressWrap.style.display = 'none';
    } else if (target === 'non-member') {
      if (viewNonMember) {
        viewNonMember.classList.add('active');
        viewNonMember.style.display = 'flex';
      }
      if (navProgressText) navProgressText.style.display = 'none';
      if (formProgressWrap) formProgressWrap.style.display = 'none';
    } else if (target === 'member-form') {
      if (viewMemberForm) {
        viewMemberForm.classList.add('active');
        viewMemberForm.style.display = 'block';
      }
      if (navProgressText) navProgressText.style.display = 'inline-block';
      if (formProgressWrap) formProgressWrap.style.display = 'block';
      updateProgress();
    }

    window.scrollTo(0, 0);
  }

  // ==============================================================
  // Step 1: Gateway Screen Logic
  // ==============================================================
  if (btnGatewayYes) {
    btnGatewayYes.addEventListener('click', () => {
      memberSelection = 'yes';
      btnGatewayYes.classList.add('selected');
      if (btnGatewayNo) btnGatewayNo.classList.remove('selected');
      // Direct instant transition to one-page questionnaire (ultra-responsive tap)
      setTimeout(() => {
        switchView('member-form');
      }, 40);
    });
  }

  if (btnGatewayNo) {
    btnGatewayNo.addEventListener('click', () => {
      memberSelection = 'no';
      btnGatewayNo.classList.add('selected');
      if (btnGatewayYes) btnGatewayYes.classList.remove('selected');
      // Direct instant transition to Non-Member Flow
      setTimeout(() => {
        switchView('non-member');
      }, 40);
    });
  }

  if (btnGatewayNext) {
    btnGatewayNext.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      switchView('member-form');
    });
  }

  // Step 2: Non-Member Return Action
  if (btnBackToGateway) {
    btnBackToGateway.addEventListener('click', () => {
      memberSelection = null;
      if (btnGatewayYes) btnGatewayYes.classList.remove('selected');
      if (btnGatewayNo) btnGatewayNo.classList.remove('selected');
      switchView('gateway');
    });
  }

  if (navBrand) {
    navBrand.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep !== 'gateway') {
        if (confirm('Return to the welcome screen? Any unsaved form answers will be reset.')) {
          form.reset();
          document.querySelectorAll('.question-card').forEach(c => c.classList.remove('has-error'));
          document.querySelectorAll('.radio-tile').forEach(t => t.classList.remove('selected'));
          switchView('gateway');
        }
      }
    });
  }

  // ==============================================================
  // Step 3: Form Progress & Interaction Logic
  // ==============================================================
  const questionCards = Array.from(document.querySelectorAll('.question-card'));

  function updateProgress() {
    try {
      let answered = 0;
      const total = 13;

      const getVal = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? el.value.trim() : '';
      };

      const getChecked = (name) => {
        if (!form) return null;
        return form.querySelector(`input[name="${name}"]:checked`);
      };

      if (getVal('q1-fullName')) answered++;
      if (getVal('q2-email')) answered++;
      if (getVal('q3-phone')) answered++;
      if (getChecked('gender')) answered++;
      if (getVal('q5-location')) answered++;
      if (getChecked('currentJourney')) answered++;
      if (getChecked('breakthroughArea')) answered++;
      if (getChecked('untappedPotential')) answered++;
      if (getChecked('readyForDirection')) answered++;
      if (getChecked('committedToRoadmap')) answered++;
      if (getChecked('investEnergy')) answered++;
      if (getVal('q12-whyDeepanshu')) answered++;
      if (getVal('q13-breakthroughVision')) answered++;

      const pct = Math.round((answered / total) * 100);
      if (formProgressBar) formProgressBar.style.width = `${pct}%`;
      if (navProgressText) navProgressText.textContent = `${answered} of ${total} answered`;
    } catch (err) {
      console.warn('Progress calculation:', err);
    }
  }

  // Radio tile active style sync
  document.querySelectorAll('.radio-tile input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const name = radio.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.radio-tile').classList.toggle('selected', r.checked);
      });
      // Clear error on card
      const card = radio.closest('.question-card');
      if (card) card.classList.remove('has-error');
      updateProgress();
    });
  });

  // Inputs change / input listener
  form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(input => {
    input.addEventListener('input', () => {
      const card = input.closest('.question-card');
      if (card && input.value.trim().length > 0) {
        card.classList.remove('has-error');
      }
      updateProgress();
    });
  });

  // ==============================================================
  // Step 4: Form Validation & Submission Pipeline
  // ==============================================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error styles
    questionCards.forEach(c => c.classList.remove('has-error'));

    let firstInvalidCard = null;

    function markInvalid(cardId) {
      const card = document.getElementById(cardId);
      if (card) {
        card.classList.add('has-error');
        if (!firstInvalidCard) firstInvalidCard = card;
      }
    }

    const fullName = document.getElementById('q1-fullName').value.trim();
    if (!fullName) markInvalid('q-card-1');

    const email = document.getElementById('q2-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) markInvalid('q-card-2');

    const phone = document.getElementById('q3-phone').value.trim();
    if (!phone || phone.length < 7) markInvalid('q-card-3');

    const genderElem = form.querySelector('input[name="gender"]:checked');
    if (!genderElem) markInvalid('q-card-4');

    const location = document.getElementById('q5-location').value.trim();
    if (!location) markInvalid('q-card-5');

    const currentJourneyElem = form.querySelector('input[name="currentJourney"]:checked');
    if (!currentJourneyElem) markInvalid('q-card-6');

    const breakthroughAreaElem = form.querySelector('input[name="breakthroughArea"]:checked');
    if (!breakthroughAreaElem) markInvalid('q-card-7');

    const untappedPotentialElem = form.querySelector('input[name="untappedPotential"]:checked');
    if (!untappedPotentialElem) markInvalid('q-card-8');

    const readyForDirectionElem = form.querySelector('input[name="readyForDirection"]:checked');
    if (!readyForDirectionElem) markInvalid('q-card-9');

    const committedToRoadmapElem = form.querySelector('input[name="committedToRoadmap"]:checked');
    if (!committedToRoadmapElem) markInvalid('q-card-10');

    const investEnergyElem = form.querySelector('input[name="investEnergy"]:checked');
    if (!investEnergyElem) markInvalid('q-card-11');

    const whyDeepanshu = document.getElementById('q12-whyDeepanshu').value.trim();
    if (!whyDeepanshu) markInvalid('q-card-12');

    const breakthroughVision = document.getElementById('q13-breakthroughVision').value.trim();
    if (!breakthroughVision) markInvalid('q-card-13');

    if (firstInvalidCard) {
      firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = firstInvalidCard.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
      return;
    }

    // Prepare Payload
    const payload = {
      fullName,
      email,
      phone,
      gender: genderElem ? genderElem.value : '',
      location,
      currentJourney: currentJourneyElem ? currentJourneyElem.value : '',
      breakthroughArea: breakthroughAreaElem ? breakthroughAreaElem.value : '',
      untappedPotential: untappedPotentialElem ? untappedPotentialElem.value : '',
      readyForDirection: readyForDirectionElem ? readyForDirectionElem.value : '',
      committedToRoadmap: committedToRoadmapElem ? committedToRoadmapElem.value : '',
      investEnergy: investEnergyElem ? investEnergyElem.value : '',
      whyDeepanshu,
      breakthroughVision,
      isMember: true,
      googleSheetWebhookUrl: window.APP_CONFIG.GOOGLE_SHEET_WEBHOOK_URL
    };

    // UI Feedback - instant response
    btnSubmitForm.disabled = true;
    const btnTextElem = btnSubmitForm.querySelector('.btn-text');
    if (btnTextElem) btnTextElem.textContent = 'Redirecting...';

    const razorpayRedirectUrl = window.APP_CONFIG.RAZORPAY_CHECKOUT_URL || 'https://rzp.io/rzp/one-to-one-with-db';
    const payloadStr = JSON.stringify(payload);

    // 1. Fire-and-forget submission to Local Backend with keepalive (guaranteed transmission during immediate navigation)
    try {
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadStr,
        keepalive: true
      }).catch(err => console.warn('Local submit dispatch error:', err));
    } catch (err) {
      console.warn('Local submit fetch error:', err);
    }

    // 2. Fire-and-forget direct submission to Google Sheets if configured
    if (window.APP_CONFIG.GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        fetch(window.APP_CONFIG.GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: payloadStr,
          keepalive: true
        }).catch(err => console.warn('Google Sheet dispatch error:', err));
      } catch (err) {
        console.warn('Google Sheet fetch error:', err);
      }
    }

    // 3. Instant direct redirection: NO POP-UP, pure click-and-redirect
    window.location.href = razorpayRedirectUrl;
  });

  // ==============================================================
  // Settings Modal Handlers
  // ==============================================================
  function openSettings() {
    cfgRazorpayUrl.value = window.APP_CONFIG.RAZORPAY_CHECKOUT_URL || '';
    cfgWebhookUrl.value = window.APP_CONFIG.GOOGLE_SHEET_WEBHOOK_URL || '';
    modalSettings.classList.add('active');
  }

  function closeSettings() {
    modalSettings.classList.remove('active');
  }

  if (btnOpenSettings) btnOpenSettings.addEventListener('click', openSettings);
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
  if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeSettings);

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', async () => {
      const rzpVal = cfgRazorpayUrl.value.trim() || 'https://rzp.io/l/monkhood-session';
      const webhookVal = cfgWebhookUrl.value.trim();
      await window.APP_CONFIG.save(rzpVal, webhookVal);
      closeSettings();
      alert('Settings saved successfully!');
    });
  }

  // ==============================================================
  // Admin Submissions Viewer Handlers
  // ==============================================================
  async function loadAdminSubmissions() {
    if (!adminSubmissionsList) return;
    adminSubmissionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">Loading submissions...</p>';
    try {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const list = await res.json();

      if (!list || list.length === 0) {
        adminSubmissionsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem 0;">No submissions recorded yet.</p>';
        return;
      }

      adminSubmissionsList.innerHTML = list.map((item, idx) => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
            <strong style="font-size: 1.05rem; color: var(--text-primary);">${item.fullName || 'Anonymous'}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            ✉️ ${item.email || '-'} &nbsp;|&nbsp; 📞 ${item.phone || '-'} &nbsp;|&nbsp; 📍 ${item.location || '-'}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.5rem;">
            <div><strong>Journey:</strong> ${item.currentJourney || '-'}</div>
            <div><strong>Breakthrough Area:</strong> ${item.breakthroughArea || '-'}</div>
            <div><strong>Why Deepanshu:</strong> ${item.whyDeepanshu || '-'}</div>
            <div><strong>Vision &amp; Problem:</strong> ${item.breakthroughVision || '-'}</div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      adminSubmissionsList.innerHTML = `<p style="color: var(--error); text-align: center;">Error loading submissions: ${e.message}</p>`;
    }
  }

  function openAdmin() {
    if (modalAdmin) {
      modalAdmin.classList.add('active');
      loadAdminSubmissions();
    }
  }

  if (btnOpenAdmin) btnOpenAdmin.addEventListener('click', openAdmin);
  if (btnCloseAdmin) {
    btnCloseAdmin.addEventListener('click', () => {
      if (modalAdmin) modalAdmin.classList.remove('active');
    });
  }

  // Developer / Admin global helpers (hidden from participants)
  window.openSettings = openSettings;
  window.openAdmin = openAdmin;

  // Admin secret shortcut: Ctrl+Shift+S (Settings) or Ctrl+Shift+A (Submissions)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      openSettings();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      openAdmin();
    }
  });

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalSettings.classList.remove('active');
      modalAdmin.classList.remove('active');
    }
  });

  [modalSettings, modalAdmin].forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
});
