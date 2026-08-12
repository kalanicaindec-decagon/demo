# Demo Data

Everything you'll type — or the browser action will type — while recording.
Keep this open on a second screen.

Nothing here is real. Fictional payor, fictional members, 555-range phone numbers,
`example.com` email addresses, and MBIs that follow the real CMS format without
belonging to anyone.

---

## Credentials

Only the payor portal has a login — the Solace flow starts at the intake form with no
sign-in. Not printed on the page. The form accepts **any non-empty pair** and only
rejects blank fields, so a fumbled keystroke can't cost you a take; the values below
just keep the recording consistent.

| Surface | User | Password |
|---|---|---|
| Meridian Advantage portal — `/portal/` | `solace_svc` | `Advocate2026!` |

---

## The primary take — Dolores Whitfield

Every field in order, both journeys. This is the happy path: active coverage, one
paid claim, one denied claim worth talking about.

### Payor portal — what the browser action drives

| # | Screen | Field | Value |
|---|---|---|---|
| 1 | `/portal/` | Username | `solace_svc` |
| | | Password | `Advocate2026!` |
| 2 | `/portal/search/` | Medicare Beneficiary Identifier | `1EG4TE5MK73` |
| | | Member last name *(optional)* | `Whitfield` |
| | | Date of birth *(optional)* | `03/14/1952` |
| | | Date of service *(optional)* | leave blank — defaults to today |
| 3 | `/portal/member/` | — | click **Claims** tab to reach claim history |
| 4 | `/portal/claim/` | — | click `CLM-2026-091203` for the denied MRI |

Shortcut for the tool: `/portal/member/?mbi=1EG4TE5MK73` and
`/portal/claim/?id=CLM-2026-091203` are both deep-linkable. Record the clicks for
the Loom, then parameterize the URL.

### Solace eligibility check

Starts at the intake form. No sign-in.

| # | Screen | Field | Value |
|---|---|---|---|
| 1 | `/solace/` | Who do you need help for? | **Myself** |
| | | First Name | `Dolores` |
| | | Last Name | `Whitfield` |
| | | Email | `dolores.whitfield@example.com` |
| | | Date of Birth | `03/14/1952` |
| 2 | `/solace/medicare/` | Do you have Medicare? | **Yes** |
| 3 | `/solace/location/` | State | **California** |
| 4 | `/solace/checking/` | — | advances on its own after 1.6s |
| 5 | `/solace/advantage/` | Medicare Advantage plan? | **Yes** — she's on Meridian Advantage Choice PPO |
| 6 | `/solace/confirm/` | First / Last / DOB | prefilled from step 1 — just confirm |
| 7 | `/solace/mbi/` | Medicare Beneficiary Identifier | `1EG4TE5MK73` |
| 8 | `/solace/covered/` | — | coverage confirmed |

Answer **Yes** at step 5. Your original screenshots said No, but that was before
there was real plan data behind it — Dolores is on a Medicare Advantage PPO, and
answering No contradicts what the portal returns two screens later.

---

## Member records

### Dolores Whitfield — primary

| Field | Value |
|---|---|
| Name | Dolores Whitfield |
| Date of birth | 03/14/1952 (age 74) |
| Sex | F |
| Email | dolores.whitfield@example.com |
| Phone | (510) 555-0148 |
| Address | 1418 Larkspur Ave, Apt 3B, Oakland, CA 94610 |
| MBI | `1EG4TE5MK73` — displays as `1EG4-TE5-MK73` |
| Coverage status | **ACTIVE** |
| Plan | Meridian Advantage Choice (PPO) |
| Plan / contract ID | H5432-004 |
| Effective date | 01/01/2026 |
| Termination date | — |
| Network | In-network and out-of-network benefits |
| Medicare Part A | Active — 03/01/2017 |
| Medicare Part B | Active — 03/01/2017 |
| Part D | Included — S5432-021 |
| PCP | Reyes, Marisol MD — Bayview Primary Care Group, (510) 555-0192 |
| Deductible | $340.00 of $500.00 met |
| Out-of-pocket max | $1,180.00 of $4,900.00 met |

Cost share:

| Service | Member responsibility | Notes |
|---|---|---|
| Primary care visit | $0 copay | No referral required |
| Specialist visit | $35 copay | No referral required |
| Urgent care | $50 copay | Waived if admitted within 24 hrs |
| Emergency room | $120 copay | Waived if admitted |
| Inpatient hospital | $295 / day | Days 1–5, then $0 |
| Advanced imaging (MRI/CT/PET) | 20% coinsurance | Prior authorization required |
| Lab & diagnostics | $0 copay | In-network only |

Prior authorization required for: advanced imaging (MRI, CT, PET), DME over $500,
out-of-network specialty care, non-emergent inpatient admission.

### Arthur Beaumont — everything clean

| Field | Value |
|---|---|
| Name | Arthur Beaumont |
| Date of birth | 11/02/1948 (age 77) |
| Sex | M |
| Email | arthur.beaumont@example.com |
| Phone | (510) 555-0273 |
| Address | 922 Sutter Ridge Rd, Berkeley, CA 94708 |
| MBI | `2XW9HK4NP12` |
| Coverage status | **ACTIVE** |
| Plan | Meridian Advantage Value (HMO) — H5432-011 |
| Effective date | 01/01/2024 |
| Network | In-network only |
| Part A / B | Active — 12/01/2013 |
| Part D | Included — S5432-018 |
| PCP | Nakamura, Elise MD — Sutter Ridge Family Medicine, (510) 555-0311 |
| Deductible | $0 plan deductible |
| Out-of-pocket max | $615.00 of $3,800.00 met |

HMO cost share differs: specialist $45 **with referral required**, urgent care $40,
ER $110, inpatient $350/day days 1–4, advanced imaging $275 copay.

### Ruth Callahan — terminated coverage

| Field | Value |
|---|---|
| Name | Ruth Callahan |
| Date of birth | 07/19/1955 (age 71) |
| Sex | F |
| Email | ruth.callahan@example.com |
| Phone | (510) 555-0466 |
| Address | 57 Mariposa Ln, Alameda, CA 94501 |
| MBI | `4TQ6MC8RV30` |
| Coverage status | **TERMINATED** |
| Plan | Meridian Advantage Choice (PPO) — H5432-004 |
| Effective date | 01/01/2023 |
| Termination date | 05/31/2026 |
| Termination reason | Voluntary disenrollment — relocated outside plan service area |
| Part D | Terminated — 05/31/2026 |

Use this one if you want to show the agent handling a "you're not currently
covered" answer instead of the happy path.

---

## Claims

| Claim number | Member | Date of service | Provider | Service | Billed | Allowed | Plan paid | Member resp. | Status |
|---|---|---|---|---|---|---|---|---|---|
| `CLM-2026-084417` | Whitfield | 06/12/2026 | Reyes, Marisol MD | Office Visit — Established Patient (99214) | $285.00 | $142.60 | $142.60 | $0.00 | **PAID** |
| `CLM-2026-091203` | Whitfield | 07/02/2026 | Okonkwo, Daniel MD | MRI Lumbar Spine w/o Contrast (72148) | $1,840.00 | $0.00 | $0.00 | $0.00 | **DENIED** |
| `CLM-2026-093855` | Whitfield | 07/28/2026 | Coastal Regional Labs | Comprehensive Metabolic Panel (80053) | $96.00 | — | — | — | **PROCESSING** |
| `CLM-2026-077140` | Beaumont | 05/19/2026 | Nakamura, Elise MD | Annual Wellness Visit (G0439) | $210.00 | $118.00 | $118.00 | $0.00 | **PAID** |
| `CLM-2026-088902` | Beaumont | 06/25/2026 | Vance, Priya MD | Cardiology Consultation (99244) | $480.00 | $262.00 | $217.00 | $45.00 | **PAID** |
| `CLM-2026-061882` | Callahan | 04/08/2026 | Alvarez, Tomas MD | Office Visit — Established Patient (99213) | $195.00 | $104.00 | $104.00 | $0.00 | **PAID** |

### The denied claim — worth narrating

`CLM-2026-091203` is the one to talk about on camera.

| Field | Value |
|---|---|
| Facility | Bayview Imaging Center |
| Reason code | **CO-197** |
| Reason | Precertification / authorization absent. Advanced imaging requires prior authorization under plan H5432-004. |
| Member liability | $0.00 — member is not balance billable |
| Appeal deadline | 09/30/2026 |
| Adjudication note | Member is not financially responsible. Provider may submit a retrospective authorization request. |
| Date processed | 07/15/2026 |

The story writes itself: a $1,840 MRI was denied for missing prior auth, the member
owes nothing, and there's an appeal window closing 09/30. That's a real answer an
advocate would otherwise have spent a phone call digging out.

### Other claim detail

| Claim | Processed | Payment reference |
|---|---|---|
| `CLM-2026-084417` | 06/24/2026 | EFT-4471902 |
| `CLM-2026-093855` | Received 07/30/2026, 14-business-day window | — |
| `CLM-2026-077140` | 05/30/2026 | EFT-4402118 |
| `CLM-2026-088902` | 07/08/2026 | EFT-4459330 |
| `CLM-2026-061882` | 04/21/2026 | EFT-4318744 |

---

## Notes

**MBI entry is forgiving.** `1EG4TE5MK73`, `1eg4-te5-mk73` and `1EG4 TE5 MK73` all
resolve to the same member — separators are stripped and case is normalized. Worth
knowing if the value ever arrives from a voice transcript.

**Real MBI format.** 11 characters, and never S, L, O, I, B or Z — CMS excludes them
because they're too easy to confuse with 5, 1, 0, 1, 8 and 2. All three MBIs here
follow it, so they read correctly to anyone who knows the format.

**Adding a member.** Everything above lives in `assets/data.js`. Add a key and both
the portal and the Solace result page pick it up — they read the same source, so
they can't contradict each other mid-recording.
