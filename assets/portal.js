/* Meridian Advantage portal behaviour.

   Design notes for browser-action reliability:
   - Every interactive element carries a stable id AND data-testid.
   - Every value the agent needs to read back carries data-extract="<key>".
   - Rendering is synchronous on DOMContentLoaded; when a page finishes
     painting its record it sets data-ready="true" on the container, so a
     browser action can wait on a single deterministic condition.
   - No animations gate content. Nothing here races. */

/* Root-relative so the same code works at /portal/, /portal/search/, etc.
   Overridden automatically when the site is served from a subpath. */
const PORTAL_BASE = (function () {
  const marker = '/portal/';
  const path = window.location.pathname;
  const idx = path.indexOf(marker);
  return idx === -1 ? '/portal/' : path.slice(0, idx + marker.length);
})();

function markReady(el) {
  if (el) el.setAttribute('data-ready', 'true');
}

/* ---------- session clock in the masthead ---------- */

function startSessionClock() {
  const el = document.getElementById('session-timer');
  if (!el) return;
  let remaining = 15 * 60;
  const tick = function () {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    el.textContent = m + ':' + String(s).padStart(2, '0');
    if (remaining > 0) remaining -= 1;
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- login ---------- */

function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const error = document.getElementById('login-error');

    /* Accept any non-empty credentials. Gating a live demo on an exact
       password match is a needless way to lose a take. */
    if (!user || !pass) {
      error.textContent = 'Username and password are both required.';
      error.hidden = false;
      return;
    }
    window.location.href = PORTAL_BASE + 'search/';
  });
}

/* ---------- member search ---------- */

function initSearch() {
  const form = document.getElementById('member-search-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const raw = document.getElementById('mbi').value;
      const error = document.getElementById('search-error');
      const normalized = normalizeMbi(raw);

      if (!normalized) {
        error.textContent = 'Enter a Medicare Beneficiary Identifier to search.';
        error.hidden = false;
        return;
      }
      if (!findMember(normalized)) {
        error.textContent =
          'No member found for MBI ' + normalized + '. Verify the identifier and try again.';
        error.hidden = false;
        return;
      }
      window.location.href = PORTAL_BASE + 'member/?mbi=' + encodeURIComponent(normalized);
    });
  }

  const claimForm = document.getElementById('claim-search-form');
  if (claimForm) {
    claimForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const id = document.getElementById('claim-number').value.trim();
      const error = document.getElementById('claim-search-error');

      if (!findClaim(id)) {
        error.textContent = 'No claim found for ' + (id || 'that number') + '.';
        error.hidden = false;
        return;
      }
      window.location.href = PORTAL_BASE + 'claim/?id=' + encodeURIComponent(id.toUpperCase());
    });
  }
}

/* ---------- member record ---------- */

function renderMember() {
  const root = document.getElementById('member-record');
  if (!root) return;

  const member = findMember(getParam('mbi'));

  if (!member) {
    root.innerHTML =
      '<div class="card"><div class="empty-state">No member record found for that identifier. ' +
      '<a href="' + PORTAL_BASE + 'search/">Return to search</a>.</div></div>';
    markReady(root);
    return;
  }

  const cov = member.coverage;
  const active = cov.status === 'ACTIVE';
  const fullName = member.lastName + ', ' + member.firstName;
  document.title = fullName + ' — Member Record | Meridian Advantage';

  const head =
    '<div class="member-head">' +
      '<div>' +
        '<h1 class="member-name" data-extract="member.name">' + fullName + '</h1>' +
        '<div class="member-meta">' +
          '<span>MBI <strong class="mbi-display" data-extract="member.mbi">' + formatMbi(member.mbi) + '</strong></span>' +
          '<span>DOB <strong data-extract="member.dob">' + member.dob + '</strong></span>' +
          '<span>Age <strong>' + member.age + '</strong></span>' +
          '<span>Sex <strong>' + member.gender + '</strong></span>' +
          '<span>Phone <strong>' + member.phone + '</strong></span>' +
        '</div>' +
        '<div class="member-meta" style="margin-top:6px">' +
          '<span>' + member.address + ', ' + member.cityStateZip + '</span>' +
        '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<span class="pill ' + (active ? 'pill-ok' : 'pill-bad') + '" ' +
          'id="coverage-status" data-testid="coverage-status" data-extract="coverage.status">' +
          cov.status +
        '</span>' +
        '<div style="margin-top:8px;font-size:12px;color:#5c6b7a">' +
          'Plan <strong data-extract="coverage.planId">' + cov.planId + '</strong>' +
        '</div>' +
      '</div>' +
    '</div>';

  const tabs =
    '<div class="tabs" role="tablist">' +
      '<button class="tab" id="tab-eligibility" data-testid="tab-eligibility" role="tab" ' +
        'aria-selected="true" aria-controls="panel-eligibility">Eligibility &amp; Benefits</button>' +
      '<button class="tab" id="tab-claims" data-testid="tab-claims" role="tab" ' +
        'aria-selected="false" aria-controls="panel-claims">Claims (' + member.claims.length + ')</button>' +
    '</div>';

  /* --- eligibility panel --- */

  const costRows = cov.status === 'TERMINATED'
    ? '<tr><td colspan="3" style="color:#5c6b7a">No active cost shares. Coverage terminated ' + cov.termDate + '.</td></tr>'
    : member.costShares.map(function (row) {
        return '<tr><td>' + row[0] + '</td><td><strong>' + row[1] + '</strong></td><td>' + row[2] + '</td></tr>';
      }).join('');

  const acc = member.accumulators;
  const dedPct = acc.deductibleTotal ? Math.min(100, (acc.deductibleMet / acc.deductibleTotal) * 100) : 100;
  const oopPct = acc.oopTotal ? Math.min(100, (acc.oopMet / acc.oopTotal) * 100) : 0;

  const paRows = member.priorAuth.map(function (p) { return '<li>' + p + '</li>'; }).join('');

  const eligibility =
    '<div class="tabpanel" id="panel-eligibility" role="tabpanel" aria-labelledby="tab-eligibility">' +
      '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="card-head">Coverage Detail</div>' +
          '<div class="card-body">' +
            '<dl class="dl">' +
              '<dt>Coverage status</dt><dd data-extract="coverage.statusText">' + cov.status + '</dd>' +
              '<dt>Plan name</dt><dd data-extract="coverage.planName">' + cov.planName + '</dd>' +
              '<dt>Plan / contract ID</dt><dd>' + cov.planId + '</dd>' +
              '<dt>Effective date</dt><dd data-extract="coverage.effectiveDate">' + cov.effectiveDate + '</dd>' +
              '<dt>Termination date</dt><dd data-extract="coverage.termDate">' + cov.termDate + '</dd>' +
              '<dt>Network</dt><dd>' + cov.network + '</dd>' +
              '<dt>Medicare Part A</dt><dd>' + cov.partA + '</dd>' +
              '<dt>Medicare Part B</dt><dd>' + cov.partB + '</dd>' +
              '<dt>Part D (drug)</dt><dd>' + cov.partD + '</dd>' +
              (cov.termReason ? '<dt>Termination reason</dt><dd>' + cov.termReason + '</dd>' : '') +
            '</dl>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="card">' +
            '<div class="card-head">Primary Care Provider</div>' +
            '<div class="card-body">' +
              '<dl class="dl">' +
                '<dt>Provider</dt><dd data-extract="coverage.pcp">' + cov.pcpName + '</dd>' +
                '<dt>Group</dt><dd>' + cov.pcpGroup + '</dd>' +
                '<dt>Phone</dt><dd>' + cov.pcpPhone + '</dd>' +
              '</dl>' +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head">Accumulators — Plan Year 2026</div>' +
            '<div class="card-body">' +
              '<div class="accum">' +
                '<div class="accum-label"><span>Deductible met</span>' +
                  '<strong data-extract="accum.deductible">' + money(acc.deductibleMet) + ' of ' + money(acc.deductibleTotal) + '</strong></div>' +
                '<div class="meter"><div class="meter-fill" style="width:' + dedPct + '%"></div></div>' +
              '</div>' +
              '<div class="accum">' +
                '<div class="accum-label"><span>Out-of-pocket maximum</span>' +
                  '<strong data-extract="accum.oop">' + money(acc.oopMet) + ' of ' + money(acc.oopTotal) + '</strong></div>' +
                '<div class="meter"><div class="meter-fill" style="width:' + oopPct + '%"></div></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head">Member Cost Share</div>' +
        '<div class="card-body" style="padding:0">' +
          '<table class="data"><thead><tr><th>Service</th><th>Member responsibility</th><th>Notes</th></tr></thead>' +
          '<tbody>' + costRows + '</tbody></table>' +
        '</div>' +
      '</div>' +
      (member.priorAuth.length
        ? '<div class="card"><div class="card-head">Services Requiring Prior Authorization</div>' +
          '<div class="card-body"><ul class="bullets">' + paRows + '</ul></div></div>'
        : '') +
    '</div>';

  /* --- claims panel --- */

  const claimRows = member.claims.map(function (c) {
    const pillClass =
      c.status === 'PAID' ? 'pill-ok' : c.status === 'DENIED' ? 'pill-bad' : 'pill-warn';
    return (
      '<tr data-claim-id="' + c.id + '">' +
        '<td><a class="claim-link" href="' + PORTAL_BASE + 'claim/?id=' + c.id + '" ' +
          'data-testid="claim-link-' + c.id + '">' + c.id + '</a></td>' +
        '<td>' + c.dos + '</td>' +
        '<td>' + c.provider + '<div style="color:#5c6b7a;font-size:11.5px">' + c.facility + '</div></td>' +
        '<td>' + c.service + '</td>' +
        '<td class="num">' + money(c.billed) + '</td>' +
        '<td class="num">' + money(c.planPaid) + '</td>' +
        '<td class="num">' + money(c.patientResp) + '</td>' +
        '<td><span class="pill ' + pillClass + '" data-extract="claim.' + c.id + '.status">' + c.status + '</span></td>' +
      '</tr>'
    );
  }).join('');

  const claims =
    '<div class="tabpanel" id="panel-claims" role="tabpanel" aria-labelledby="tab-claims" hidden>' +
      '<div class="card">' +
        '<div class="card-head">' +
          '<span>Claim History — Last 24 Months</span>' +
          '<span style="text-transform:none;letter-spacing:0;font-weight:400;color:#7b8896">' +
            member.claims.length + ' claim' + (member.claims.length === 1 ? '' : 's') + '</span>' +
        '</div>' +
        '<div class="card-body" style="padding:0">' +
          '<table class="data" id="claims-table" data-testid="claims-table">' +
            '<thead><tr>' +
              '<th>Claim number</th><th>Date of service</th><th>Provider</th><th>Service</th>' +
              '<th style="text-align:right">Billed</th><th style="text-align:right">Plan paid</th>' +
              '<th style="text-align:right">Member resp.</th><th>Status</th>' +
            '</tr></thead>' +
            '<tbody>' + claimRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';

  root.innerHTML = head + tabs + eligibility + claims;
  wireTabs();
  markReady(root);
}

function wireTabs() {
  const tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (other) {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        const panel = document.getElementById(other.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    });
  });
}

/* ---------- claim detail ---------- */

function renderClaim() {
  const root = document.getElementById('claim-record');
  if (!root) return;

  const hit = findClaim(getParam('id'));

  if (!hit) {
    root.innerHTML =
      '<div class="card"><div class="empty-state">No claim found for that number. ' +
      '<a href="' + PORTAL_BASE + 'search/">Return to search</a>.</div></div>';
    markReady(root);
    return;
  }

  const member = hit.member;
  const c = hit.claim;
  const pillClass = c.status === 'PAID' ? 'pill-ok' : c.status === 'DENIED' ? 'pill-bad' : 'pill-warn';
  document.title = c.id + ' — Claim Detail | Meridian Advantage';

  const lineRows = c.lines.map(function (l) {
    return '<tr><td><code>' + l[0] + '</code></td><td>' + l[1] + '</td>' +
      '<td class="num">' + l[2] + '</td><td class="num">' + l[3] + '</td>' +
      '<td class="num">' + l[4] + '</td><td class="num">' + l[5] + '</td></tr>';
  }).join('');

  const denialBlock = c.status === 'DENIED'
    ? '<div class="card">' +
        '<div class="card-head" style="color:#a52323">Denial Detail</div>' +
        '<div class="card-body">' +
          '<dl class="dl">' +
            '<dt>Reason code</dt><dd data-extract="claim.denialCode">' + c.denialCode + '</dd>' +
            '<dt>Reason</dt><dd style="font-weight:400" data-extract="claim.denialReason">' + c.denialReason + '</dd>' +
            '<dt>Member liability</dt><dd>' + money(c.patientResp) + ' — member is not balance billable</dd>' +
            '<dt>Appeal deadline</dt><dd data-extract="claim.appealDeadline">' + c.appealDeadline + '</dd>' +
          '</dl>' +
        '</div>' +
      '</div>'
    : '';

  root.innerHTML =
    '<div class="member-head">' +
      '<div>' +
        '<h1 class="member-name" data-extract="claim.id">' + c.id + '</h1>' +
        '<div class="member-meta">' +
          '<span>Member <strong>' + member.lastName + ', ' + member.firstName + '</strong></span>' +
          '<span>MBI <strong class="mbi-display">' + formatMbi(member.mbi) + '</strong></span>' +
          '<span>Date of service <strong data-extract="claim.dos">' + c.dos + '</strong></span>' +
        '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<span class="pill ' + pillClass + '" id="claim-status" data-testid="claim-status" ' +
          'data-extract="claim.status">' + c.status + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card">' +
        '<div class="card-head">Claim Summary</div>' +
        '<div class="card-body">' +
          '<dl class="dl">' +
            '<dt>Rendering provider</dt><dd>' + c.provider + '</dd>' +
            '<dt>Facility</dt><dd>' + c.facility + '</dd>' +
            '<dt>Service</dt><dd data-extract="claim.service">' + c.service + '</dd>' +
            '<dt>Procedure code</dt><dd>' + c.cpt + '</dd>' +
            '<dt>Date processed</dt><dd>' + c.processedDate + '</dd>' +
            '<dt>Payment reference</dt><dd>' + c.paymentRef + '</dd>' +
          '</dl>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head">Financial Summary</div>' +
        '<div class="card-body">' +
          '<dl class="dl">' +
            '<dt>Total billed</dt><dd data-extract="claim.billed">' + money(c.billed) + '</dd>' +
            '<dt>Plan allowed</dt><dd data-extract="claim.allowed">' + money(c.allowed) + '</dd>' +
            '<dt>Plan paid</dt><dd data-extract="claim.planPaid">' + money(c.planPaid) + '</dd>' +
            '<dt>Member responsibility</dt><dd data-extract="claim.patientResp">' + money(c.patientResp) + '</dd>' +
          '</dl>' +
        '</div>' +
      '</div>' +
    '</div>' +
    denialBlock +
    '<div class="card">' +
      '<div class="card-head">Service Lines</div>' +
      '<div class="card-body" style="padding:0">' +
        '<table class="data"><thead><tr>' +
          '<th>Code</th><th>Description</th>' +
          '<th style="text-align:right">Billed</th><th style="text-align:right">Allowed</th>' +
          '<th style="text-align:right">Plan paid</th><th style="text-align:right">Member resp.</th>' +
        '</tr></thead><tbody>' + lineRows + '</tbody></table>' +
      '</div>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-head">Adjudication Notes</div>' +
      '<div class="card-body" data-extract="claim.note">' + c.note + '</div>' +
    '</div>' +
    '<div class="btn-row">' +
      '<a class="btn btn-secondary" href="' + PORTAL_BASE + 'member/?mbi=' + member.mbi + '">Back to member record</a>' +
      '<a class="btn btn-secondary" href="' + PORTAL_BASE + 'search/">New search</a>' +
    '</div>';

  markReady(root);
}

document.addEventListener('DOMContentLoaded', function () {
  startSessionClock();
  initLogin();
  initSearch();
  renderMember();
  renderClaim();
});
