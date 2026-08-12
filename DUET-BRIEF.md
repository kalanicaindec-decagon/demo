# Duet Brief — Browser Action Flows + AOP Scaffolding

Hand this to Duet as context. Part 1 describes what the browser agent navigates and
types, in order, for each tool. Part 2 is the AOP that calls them.

No code here on purpose — this is the specification Duet turns into a tool and an AOP.

Deployed base URL: `https://kalanicaindec-decagon.github.io/demo`

---

# Part 1 — Browser action flows

## Tool A — `lookup_payor_coverage_and_claims`

**What it does.** Signs into the Meridian Advantage provider portal with a service
account, looks a member up by Medicare Beneficiary Identifier, and reads back current
coverage, benefit accumulators, and claim history. Optionally opens a single claim for
denial detail.

**Why it's a browser action.** The payor exposes no API. Until now an advocate has done
this by hand, mid-call, which is why the workflow lives on the phone.

**Parameters.**

| Parameter | Required | Notes |
|---|---|---|
| `mbi` | yes | 11 characters. Case and separators are normalized by the page, so `1eg4-te5-mk73` works as well as `1EG4TE5MK73` |
| `claim_number` | no | If supplied, the flow also opens that claim's detail page |
| `member_last_name` | no | Search field, not validated |
| `member_dob` | no | Search field, not validated |

**Steps.**

1. Navigate to `/portal/`.
2. Type the service account username into the Username field.
3. Type the service account password into the Password field.
4. Click **Sign In**. The portal lands on the member search screen.
5. Type `mbi` into the Medicare Beneficiary Identifier field. Optionally fill member
   last name and date of birth.
6. Click **Search Member**. The portal lands on the member record.
7. Wait for the member record container to signal it has finished rendering. Do not
   wait on a timer.
8. Read the eligibility values listed below off the **Eligibility & Benefits** panel.
9. Take a screenshot.
10. Click the **Claims** tab. The claim history table is already in the DOM but the
    panel is hidden until the tab is clicked, so click it before screenshotting.
11. Read every claim row: claim number, date of service, provider, service, billed
    amount, plan paid, member responsibility, status.
12. Take a screenshot.
13. If `claim_number` was supplied, click that claim's link (or navigate to the claim
    detail URL directly), wait for the claim record to signal ready, read the claim
    detail values below, and take a screenshot.

**Shortcut worth taking.** The member record and claim detail pages are both
deep-linkable by query parameter. Steps 1 through 6 can collapse into a single
navigation to the member URL with the MBI as a parameter. Record the full click-through
for the video, then let the tool jump straight there — one navigation can't fail on a
mistyped character.

**Values to return from the member record.**

Coverage status · plan name · plan/contract ID · effective date · termination date ·
network type · Medicare Part A status · Part B status · Part D status · primary care
provider name, group and phone · deductible met and total · out-of-pocket met and total
· member cost share by service · services requiring prior authorization.

**Values to return from each claim row.**

Claim number · date of service · rendering provider · facility · service description ·
billed amount · plan paid · member responsibility · status (PAID, DENIED, or
PROCESSING).

**Values to return from claim detail.**

Everything above plus procedure code · date processed · payment reference ·
adjudication note. On denied claims only: reason code, reason text, member liability,
and appeal deadline. Guard for those three being absent — they don't exist on paid or
processing claims.

**Return coverage and claims as separate signals**, not one blob. The AOP usually needs
one or the other, and a combined payload forces it to re-parse.

**Failure handling.**

| Situation | What the page does | What the tool should return |
|---|---|---|
| Blank MBI | Inline error on the search page | Fail with "no identifier supplied" |
| Unknown MBI | Inline error naming the normalized MBI | Fail with "member not found", echo the normalized value |
| Unknown claim number | Inline error on the search page | Fail with "claim not found" |
| Deep link with unknown MBI | Member page renders an empty state with a link back to search | Fail with "member not found" |
| Blank credentials | Inline error on login | Fail with "sign-in incomplete" |

No situation produces a blank page or a dead end, so the tool never needs a recovery
path more complex than reporting which of the above it hit.

---

## Tool B — `run_solace_eligibility_check`

**What it does.** Completes the Solace eligibility wizard end to end and returns the
coverage determination.

**When to use it instead of Tool A.** Tool A answers "what does the payor say." Tool B
answers "is this person eligible to work with a Solace advocate," which is the
enrollment question, not the benefits question. If the caller is not yet a Solace
patient, this is the one that matters.

**Parameters.**

| Parameter | Required | Notes |
|---|---|---|
| `first_name` | yes | As it appears on the insurance card |
| `last_name` | yes | As it appears on the insurance card |
| `email` | yes | |
| `dob` | yes | MM/DD/YYYY |
| `mbi` | yes | Normalized by the page, same as Tool A |
| `state` | no | Defaults to California |
| `for_self` | no | Defaults to true. False selects "Someone Else" — use when an advocate or family member is calling on the patient's behalf |
| `has_medicare` | no | Defaults to yes |
| `has_medicare_advantage` | no | Defaults to yes |

**Steps.**

1. Navigate to `/solace/`.
2. Select **Myself** or **Someone Else** per `for_self`.
3. Type first name, last name, email and date of birth into their fields.
4. Click **Get Started**.
5. On "Do you have Medicare?" click **Yes** (or No per `has_medicare`), then
   **Continue**. The answer must be selected before Continue does anything — the button
   stays enabled and shows a message rather than disabling, so if the selection didn't
   register, click the option again and retry.
6. On "And where are you located?" choose the state, then click **Check My Benefits**.
7. A "Checking your Medicare coverage" interstitial appears and advances on its own
   after about 1.6 seconds. Wait for the navigation, don't click anything.
8. On "Do you have a Medicare Advantage plan?" click **Yes** (or per
   `has_medicare_advantage`), then **Continue**.
9. On "Does everything look right?" the first name, last name and date of birth are
   already prefilled from step 3. Verify them, correct if needed, then click
   **Verify My Coverage**.
10. On "Help us find you." type the MBI into the Medicare Beneficiary Identifier field
    and click **Submit**.
11. The result page loads. Wait for its container to signal ready.
12. Read the values below and take a screenshot.

**Values to return.** Member name · MBI as displayed · plan name · plan ID · effective
date · primary care provider · state · member cost.

**Consistency note.** Answer **yes** to the Medicare Advantage question for any member
who is actually on a Medicare Advantage plan. Answering no contradicts the plan data
the result page returns two screens later, and the inconsistency is visible on camera.

**Deep link.** The result page accepts the MBI as a query parameter, so the whole
wizard can be skipped if the tool only needs the determination and not the walkthrough.

---

## Shared implementation notes

**Wait on the ready signal, never a sleep.** Both record pages and the eligibility
result page set a ready attribute on their container once rendered. That's one
deterministic condition per page. Timers will eventually bite on a slow load.

**Screenshot after the state you want to show.** If the AOP is going to talk about
claim status, screenshot after the Claims tab click, not before — otherwise the image
shows the eligibility panel while the agent talks about claims.

**Every field and button has a stable id and a matching test id.** No hashed class
names, nothing generated. Values worth extracting carry a dedicated attribute. The
full map is in `SELECTORS.md` — pass that alongside this document.

**MBI normalization happens page-side.** The tool does not need to clean the input.
Pass through whatever the AOP captured.

---

# Part 2 — AOP scaffolding

## AOP: Medicare Coverage & Claim Status

**Channel.** Voice, inbound.

**Purpose.** Answer a caller's question about what their Medicare Advantage plan covers,
where their deductible stands, or what happened with a specific claim — without a human
having to log into the payor portal mid-call.

### When this AOP should run

Route here when the caller asks about any of:

- Whether a visit, procedure, or provider is covered
- What their copay, deductible, or out-of-pocket status is
- Who their plan is with, or when coverage started
- The status of a claim, a bill they received, or an explanation of benefits
- Why something was denied, or what they owe

Do **not** route here for: clinical questions, appointment scheduling, or requests to
change plan enrollment.

### Variables to collect

| Variable | How it's obtained |
|---|---|
| `inquiry_type` | Inferred from the opening ask: eligibility, claim status, or both |
| `caller_first_name` | Asked |
| `caller_last_name` | Asked |
| `caller_dob` | Asked |
| `mbi` | See the MBI capture step below |
| `calling_for_self` | Asked, or inferred if the caller volunteers it |
| `claim_reference` | Only if the caller names a claim number or a date of service |

### Steps

**1. Acknowledge and classify.** Restate the ask in one line so the caller knows they
were heard, and note whether this is an eligibility question, a claim question, or both.

**2. Verify identity.** Collect full name and date of birth. Read the date of birth
back.

**3. Capture the MBI.** Say that rather than reading out an 11-character Medicare ID,
you'll text them and they can reply with it. Wait for the caller to confirm they've
sent it.

> For the recording this beat is stubbed — the AOP supplies a constant MBI once the
> caller confirms. Keep `mbi` a real tool parameter and hardcode the value in the AOP
> step, not inside the tool. That way the tool stays genuine and reusable, and only the
> capture step is standing in for the SMS channel.

**4. Confirm the last four characters out loud.** "Got it — ends in MK73, is that
right?" This is a real verification beat, it costs nothing, and it covers the seam
where the text handoff would be.

**5. Set expectation before the tool call.** Say something like "let me pull that up,
one moment." A browser action takes a few seconds, and silence on a phone call reads as
a dropped connection.

**6. Call the tool.** `lookup_payor_coverage_and_claims` with the MBI. Include
`claim_reference` if the caller named one.

**7. Branch on coverage status.**

| Status | What to say |
|---|---|
| Active | Confirm they're covered, name the plan in plain language, then answer the specific question asked |
| Terminated | State plainly that coverage ended, give the termination date and the reason on file, and offer to connect them with an advocate about re-enrollment |
| Member not found | Re-confirm the MBI once. If it still fails, don't speculate — escalate |

**8. If the caller asked about a claim, branch on claim status.**

| Status | What to say |
|---|---|
| Paid | What the provider billed, what the plan paid, and what they owe. Lead with what they owe — that's the actual question |
| Denied | The reason in plain language, that they owe nothing if member responsibility is zero, and the appeal deadline. Offer to connect them with an advocate to file it |
| Processing | That it's still in adjudication and the expected window. Don't estimate an outcome |

**9. Confirm resolution.** Ask whether that answered the question, and whether there's
anything else.

### Response guidance

**Lead with the answer, then the detail.** "You owe nothing on that MRI" before "the
claim was denied under reason code CO-197."

**Translate codes.** Never read a reason code aloud as the explanation. CO-197 means
the imaging needed prior authorization and the provider didn't get it. Say that.

**Don't read identifiers aloud** — plan IDs, contract numbers, payment references —
unless the caller asks for them.

**Never state a determination the tool didn't return.** If the tool came back with
coverage but no claim data, answer the coverage question and say the claim lookup didn't
complete. Don't infer.

**Don't promise payment.** Eligibility is not a guarantee of payment, and the portal
says so on every page. If the caller asks "so it'll definitely be covered," say what the
plan documents say and offer an advocate.

**No clinical advice.** If the question turns to whether they should have a procedure,
hand off.

### Escalation

Transfer to a human advocate when:

- The tool fails twice
- Coverage is terminated and the caller wants to discuss re-enrollment
- The caller wants to file an appeal
- The caller disputes what the portal returned
- The question becomes clinical
- The caller asks for a human

### Implementation caution

If this AOP uses force conditions to drive the branching in steps 7 and 8, keep the
expressions mutually exclusive. Overlapping force expressions resolve
nondeterministically, and force flags need to be cleared once their branch is taken —
otherwise a coverage branch can re-fire during the claim branch and the agent repeats
itself mid-call.
