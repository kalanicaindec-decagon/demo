/* Solace eligibility wizard behaviour.

   Wizard answers are held in sessionStorage so each step renders from real
   state, but every step is also reachable by direct URL and the final result
   page accepts ?mbi= so a browser action can deep-link straight to it. */

const SOLACE_BASE = (function () {
  const marker = '/solace/';
  const path = window.location.pathname;
  const idx = path.indexOf(marker);
  return idx === -1 ? '/solace/' : path.slice(0, idx + marker.length);
})();

const STORE_KEY = 'solace.intake';

function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}');
  } catch (err) {
    return {};
  }
}

function writeState(patch) {
  const next = Object.assign(readState(), patch);
  sessionStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}

function goTo(step, query) {
  window.location.href = SOLACE_BASE + step + (query || '');
}

/* ---------- single-select option cards ---------- */

function initOptions() {
  const group = document.getElementById('option-group');
  if (!group) return;

  const buttons = Array.prototype.slice.call(group.querySelectorAll('.option'));
  const key = group.getAttribute('data-key');
  const error = document.getElementById('step-error');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      buttons.forEach(function (other) {
        other.setAttribute('aria-pressed', String(other === button));
      });
      if (error) error.hidden = true;
      writeState({ [key]: button.getAttribute('data-value') });
    });
  });

  /* Restore a prior answer if the step is revisited. */
  const saved = readState()[key];
  if (saved) {
    const match = buttons.find(function (b) { return b.getAttribute('data-value') === saved; });
    if (match) match.setAttribute('aria-pressed', 'true');
  }
}

/* Steps with option cards need an answer before advancing. The continue button
   stays enabled either way — a disabled control is a dead end if a browser
   action's click on the option ever misses, whereas a visible message is
   something the agent can see and recover from. */
function optionStepIsAnswered() {
  const group = document.getElementById('option-group');
  if (!group) return true;

  const chosen = group.querySelector('.option[aria-pressed="true"]');
  if (chosen) return true;

  const error = document.getElementById('step-error');
  if (error) error.hidden = false;
  return false;
}

/* ---------- generic step form ---------- */

function initStepForm() {
  const form = document.getElementById('step-form');
  if (!form) return;

  const next = form.getAttribute('data-next');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!optionStepIsAnswered()) return;

    /* Persist every named field on the step. */
    const patch = {};
    Array.prototype.slice.call(form.querySelectorAll('[name]')).forEach(function (input) {
      if (input.type === 'radio') {
        if (input.checked) patch[input.name] = input.value;
      } else {
        patch[input.name] = input.value.trim();
      }
    });
    writeState(patch);

    if (next === 'covered' && patch.mbi) {
      goTo('covered/', '?mbi=' + encodeURIComponent(normalizeMbi(patch.mbi)));
      return;
    }
    goTo(next + '/');
  });
}

/* ---------- prefill the confirmation step ---------- */

function initConfirm() {
  const first = document.getElementById('confirm-first-name');
  if (!first) return;

  const state = readState();
  const last = document.getElementById('confirm-last-name');
  const dob = document.getElementById('confirm-dob');

  if (state.firstName) first.value = state.firstName;
  if (state.lastName && last) last.value = state.lastName;
  if (state.dob && dob) dob.value = state.dob;
}

/* ---------- interstitial ---------- */

function initChecking() {
  const page = document.getElementById('checking-page');
  if (!page) return;

  /* The real flow quotes 45 seconds. 1.6s keeps a live voice demo tolerable
     while still showing the interstitial on camera. */
  const next = page.getAttribute('data-next');
  setTimeout(function () { goTo(next + '/'); }, 1600);
}

/* ---------- result ---------- */

function renderCovered() {
  const root = document.getElementById('covered-result');
  if (!root) return;

  const state = readState();
  const mbiRaw = getParam('mbi') || state.mbi || '';
  const member = findMember(mbiRaw);

  /* Prefer the payor record so the Solace result and the portal agree. */
  const name = member
    ? member.firstName + ' ' + member.lastName
    : ((state.firstName || '') + ' ' + (state.lastName || '')).trim() || 'there';
  const plan = member ? member.coverage.planName : 'Medicare Advantage plan';
  const planId = member ? member.coverage.planId : '—';
  const effective = member ? member.coverage.effectiveDate : '01/01/2026';
  const pcp = member ? member.coverage.pcpName : '—';
  const state_ = state.state || 'California';

  root.innerHTML =
    '<div class="result-hero">' +
      '<div class="covered-badge">✓ Coverage confirmed</div>' +
      '<h1 class="serif">Good news, ' + name.split(' ')[0] + ' — you’re covered.</h1>' +
      '<p>Your Medicare Advantage benefits include working with a Solace advocate at no cost to you.</p>' +
      '<div class="summary-grid">' +
        '<div class="summary-item"><div class="k">Member</div>' +
          '<div class="v" data-extract="solace.member">' + name + '</div></div>' +
        '<div class="summary-item"><div class="k">Medicare Beneficiary Identifier</div>' +
          '<div class="v" data-extract="solace.mbi">' + formatMbi(mbiRaw) + '</div></div>' +
        '<div class="summary-item"><div class="k">Plan</div>' +
          '<div class="v" data-extract="solace.plan">' + plan + '</div></div>' +
        '<div class="summary-item"><div class="k">Plan ID</div>' +
          '<div class="v">' + planId + '</div></div>' +
        '<div class="summary-item"><div class="k">Effective date</div>' +
          '<div class="v" data-extract="solace.effective">' + effective + '</div></div>' +
        '<div class="summary-item"><div class="k">Primary care provider</div>' +
          '<div class="v">' + pcp + '</div></div>' +
        '<div class="summary-item"><div class="k">State</div>' +
          '<div class="v">' + state_ + '</div></div>' +
        '<div class="summary-item"><div class="k">Your cost</div>' +
          '<div class="v" data-extract="solace.cost">$0 — covered by Medicare</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="next-card">' +
      '<h2>Next: meet your advocate</h2>' +
      '<p>We’ll match you with an advocate in ' + state_ +
        ' who knows your plan and can join your appointments.</p>' +
      '<a class="cta" href="#" id="find-advocate" data-testid="find-advocate">Find my advocate</a>' +
    '</div>';

  root.setAttribute('data-ready', 'true');
}

document.addEventListener('DOMContentLoaded', function () {
  initOptions();
  initStepForm();
  initConfirm();
  initChecking();
  renderCovered();
});
