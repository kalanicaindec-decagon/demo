# Selector Map

Everything a browser action needs to drive these pages. Paste this alongside your
recorded script when you hand it to Claude — it replaces the "grab the DOM tree with
the inspector" step in the Browser Actions walkthrough.

Every interactive element has **both** an `id` and a `data-testid` with the same value.
Every value worth returning to the AOP carries a `data-extract="<key>"` attribute.

Replace `{BASE}` with your deployed origin (e.g. `https://solace-demo.vercel.app`).

---

## Meridian Advantage Provider Portal — the browser action target

### 1. Sign in — `{BASE}/portal/`

| Element | Selector | Notes |
|---|---|---|
| Username | `#username` | Any non-empty value |
| Password | `#password` | Any non-empty value |
| Sign In | `#login-submit` | Navigates to `/portal/search/` |
| Error banner | `#login-error` | Only if a field is blank |

Demo credentials: `solace_svc` / `Advocate2026!`

### 2. Member search — `{BASE}/portal/search/`

| Element | Selector | Notes |
|---|---|---|
| MBI | `#mbi` | **Parameterize this.** Dashes, spaces and lowercase all accepted |
| Member last name | `#member-last-name` | Optional, not validated |
| Date of birth | `#member-dob` | Optional, not validated |
| Date of service | `#service-date` | Optional, not validated |
| Search Member | `#member-search-submit` | → `/portal/member/?mbi=<normalized>` |
| Search error | `#search-error` | Shown for blank or unknown MBI |
| Claim number | `#claim-number` | Direct claim lookup |
| Search Claim | `#claim-search-submit` | → `/portal/claim/?id=<claim>` |

The MBI input is normalized before lookup: non-alphanumerics stripped, uppercased.
`1eg4-te5-mk73`, `1EG4 TE5 MK73` and `1EG4TE5MK73` all resolve to the same member.
This matters — voice transcription of an 11-character identifier is not consistent.

### 3. Member record — `{BASE}/portal/member/?mbi=1EG4TE5MK73`

Deep-linkable. You can skip search entirely and parameterize the URL instead,
which is the cleaner tool implementation.

**Wait condition:** `[data-testid="member-record"][data-ready="true"]`

| Element | Selector |
|---|---|
| Record container | `#member-record` |
| Coverage status pill | `#coverage-status` |
| Eligibility tab | `#tab-eligibility` |
| Claims tab | `#tab-claims` |
| Eligibility panel | `#panel-eligibility` |
| Claims panel | `#panel-claims` |
| Claims table | `#claims-table` |
| A claim link | `[data-testid="claim-link-CLM-2026-091203"]` |

Extraction hooks — `[data-extract="…"]`:

| Key | Example value |
|---|---|
| `member.name` | Whitfield, Dolores |
| `member.mbi` | 1EG4-TE5-MK73 |
| `member.dob` | 03/14/1952 |
| `coverage.status` | ACTIVE |
| `coverage.planName` | Meridian Advantage Choice (PPO) |
| `coverage.planId` | H5432-004 |
| `coverage.effectiveDate` | 01/01/2026 |
| `coverage.termDate` | — |
| `coverage.pcp` | Reyes, Marisol MD |
| `accum.deductible` | $340.00 of $500.00 |
| `accum.oop` | $1,180.00 of $4,900.00 |
| `claim.CLM-2026-084417.status` | PAID |
| `claim.CLM-2026-091203.status` | DENIED |
| `claim.CLM-2026-093855.status` | PROCESSING |

The claims table is inside a `hidden` panel until `#tab-claims` is clicked. Click the
tab before reading claim rows, or read them out of the DOM directly — `hidden` does not
remove them from the tree.

### 4. Claim detail — `{BASE}/portal/claim/?id=CLM-2026-091203`

**Wait condition:** `[data-testid="claim-record"][data-ready="true"]`

| Key | Example value |
|---|---|
| `claim.id` | CLM-2026-091203 |
| `claim.status` | DENIED |
| `claim.dos` | 07/02/2026 |
| `claim.service` | MRI Lumbar Spine w/o Contrast |
| `claim.billed` | $1,840.00 |
| `claim.allowed` | $0.00 |
| `claim.planPaid` | $0.00 |
| `claim.patientResp` | $0.00 |
| `claim.denialCode` | CO-197 |
| `claim.denialReason` | Precertification / authorization absent… |
| `claim.appealDeadline` | 09/30/2026 |
| `claim.note` | Member is not financially responsible… |

`claim.denialCode`, `claim.denialReason` and `claim.appealDeadline` only exist on denied
claims. Guard for their absence.

---

## Solace eligibility wizard — optional second act

| Step | URL | Key selectors |
|---|---|---|
| Intake | `{BASE}/solace/` | `#firstName` `#lastName` `#email` `#dob` `#help-for-myself` `#help-for-someone-else` `#step-continue` |
| Medicare | `{BASE}/solace/medicare/` | `#option-yes` `#option-no` `#step-continue` |
| Location | `{BASE}/solace/location/` | `#state` (select) `#step-continue` |
| Checking | `{BASE}/solace/checking/` | Auto-advances after 1.6s |
| Advantage | `{BASE}/solace/advantage/` | `#option-yes` `#option-no` `#option-not-sure` `#step-continue` |
| Confirm | `{BASE}/solace/confirm/` | `#confirm-first-name` `#confirm-last-name` `#confirm-dob` `#step-continue` |
| MBI | `{BASE}/solace/mbi/` | `#mbi` `#step-continue` |
| Covered | `{BASE}/solace/covered/?mbi=…` | `[data-testid="covered-result"][data-ready="true"]` |

Result-page extraction hooks: `solace.member`, `solace.mbi`, `solace.plan`,
`solace.effective`, `solace.cost`.

Steps with option cards need a selection before Continue works. The button stays
enabled either way and shows `#step-error` if nothing is picked — a disabled control
would be a dead end if a click ever misses, whereas a visible message is recoverable.

The result page reads the same seed data as the portal, so the two systems always
agree on plan, effective date and PCP.

---

## Seed data

| MBI | Member | DOB | Coverage | Claims |
|---|---|---|---|---|
| `1EG4TE5MK73` | Whitfield, Dolores | 03/14/1952 | Active — Choice PPO | 1 paid, 1 denied, 1 processing |
| `2XW9HK4NP12` | Beaumont, Arthur | 11/02/1948 | Active — Value HMO | 2 paid |
| `4TQ6MC8RV30` | Callahan, Ruth | 07/19/1955 | **Terminated** 05/31/2026 | 1 paid |

| Claim | Member | Status |
|---|---|---|
| `CLM-2026-084417` | Whitfield | PAID — $0 member responsibility |
| `CLM-2026-091203` | Whitfield | DENIED — CO-197 prior auth absent |
| `CLM-2026-093855` | Whitfield | PROCESSING |
| `CLM-2026-077140` | Beaumont | PAID — preventive, $0 |
| `CLM-2026-088902` | Beaumont | PAID — $45 specialist copay |
| `CLM-2026-061882` | Callahan | PAID — before termination |

All MBIs follow the real CMS format (11 characters, no S/L/O/I/B/Z), so they look
correct on camera and behave correctly if you add validation later.

---

## Notes for the tool implementation

**Parameterize the URL, not the search form.** `/portal/member/?mbi={mbi}` is one
navigation instead of four interactions, and it can't fail on a mistyped character.
Record the full click-through for the Loom, then let Claude collapse it — that's the
same move as jumping straight to the order ID page in the retail walkthrough.

**Wait on `data-ready`, not on a timer.** Both record pages set
`data-ready="true"` on their container once rendered. One deterministic condition,
no sleeps.

**Take the screenshot after the tab click.** If the AOP is going to talk about claim
status, the screenshot should show the claims table, not the eligibility panel.

**Return coverage and claims as separate signals.** The AOP will usually want to
answer one or the other, and a single blob forces it to re-parse.
