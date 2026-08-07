# Solace × Meridian Advantage — Browser Actions demo

Mock systems for a Decagon Browser Actions Loom. A patient calls Solace asking about
coverage and a claim; the voice agent invokes a browser action that signs into the
payor's provider portal, looks the member up by Medicare Beneficiary Identifier, and
reads back eligibility and claim status.

Static HTML, CSS and vanilla JS. No build step, no dependencies, no framework.

## Contents

| Path | What it is |
|---|---|
| `index.html` | Internal launcher with seed data. Don't show this on camera. |
| `portal/` | **Meridian Advantage Provider Portal** — the browser action target |
| `solace/` | Replica of the captured Solace journey: chooser → sign in → eligibility wizard → covered |
| `SELECTORS.md` | Every selector, extraction hook, and the sign-in credentials. Paste this with your recorded script. |

Credentials are deliberately **not** shown on any login screen — they're in
`SELECTORS.md`. Both forms accept any non-empty pair, so nothing here is a real secret.

Meridian Advantage is fictional. Nothing here contains real member data.

## Run locally

```bash
python3 -m http.server 4173 --directory solace-browser-demo
```

Then open `http://localhost:4173/portal/`.

## Deploy

The browser action runs server-side, so it needs a publicly reachable URL — localhost
won't work. Every page carries `noindex, nofollow`, so a public URL won't get crawled.

Either target works. Plain static files with directory-based routes, which resolve
identically on both.

**Vercel — no install needed**

```bash
npx vercel --prod
```

Run it from inside this folder. `npx` fetches the CLI on demand, so there's no global
install and no sudo. First run opens a browser to authenticate and asks a few setup
questions; accept the defaults (framework: Other, output directory: `./`).

**GitHub Pages** — push to a repo, then Settings → Pages → deploy from branch, root.
Paths are relative, so serving from `username.github.io/repo-name/` works unchanged.
The repo must be public for Pages on a free account.

Note: if `gh` on this machine is authenticated to a work account via `GH_TOKEN`, that
token overrides `gh auth login`. Run `unset GH_TOKEN` in the shell first, or create the
repo in the browser and add the remote by hand.

## The demo flow

1. Caller reaches the Decagon voice agent and asks whether a visit is covered, or
   what happened with a claim.
2. Agent collects name, date of birth and MBI over the phone. **Read the MBI back for
   confirmation** — it's 11 mixed alphanumeric characters and transcription will vary.
3. Browser action signs into the portal, opens the member record, reads coverage,
   clicks through to claims, and returns structured values plus a screenshot.
4. Agent answers the caller from the returned values.
5. Optional second act: the agent submits the retrieved MBI into the Solace
   eligibility wizard to complete intake.

Credentials: `solace_svc` / `Advocate2026!` — any non-empty pair is accepted, so a
mistyped password can't cost you a take.

Primary member: `1EG4TE5MK73` — Dolores Whitfield, 03/14/1952. Active PPO with one
paid claim, one denied claim (MRI, prior auth absent), one still processing.

## Built for voice

Voice adds constraints a chat demo doesn't have, and a few things here are shaped
around them:

- **MBI input is normalized.** Non-alphanumerics stripped, uppercased. `1eg4-te5-mk73`
  and `1EG4 TE5 MK73` resolve the same as `1EG4TE5MK73`.
- **Interstitials are short.** The real Solace flow quotes 45 seconds; the replica
  uses 1.6s. Hold time is dead air on a phone call.
- **Nothing races.** Record pages set `data-ready="true"` when rendered, so the
  browser action waits on one condition instead of a sleep.
- **No dead ends.** Login accepts any credentials, option steps show a recoverable
  message rather than disabling the continue button, and unknown identifiers produce
  an inline error instead of a blank page.
- **Have the AOP fill the gap.** A browser action takes a few seconds. "Let me pull
  that up — one moment" beats silence.

## Deliberate design choices

The portal is styled as a mid-2010s enterprise healthcare system: dense tables, hard
borders, Tahoma, a session countdown, a notice that batch eligibility transfer isn't
available. The clunkiness is the argument — it's why there's no API and why a human has
been clicking through this by hand.

The Solace wizard is the opposite, and matched to the real product: cream, forest
green, display serif, generous spacing. Fonts are free stand-ins (Playfair Display,
DM Sans) for Solace's licensed faces.

## Changing the data

All members, claims and benefit detail live in `assets/data.js`. Add a member by
adding a key, and both the portal and the Solace result page pick it up — they read the
same source, so they can't disagree on camera. Keep MBIs to the real CMS format:
11 characters, and never S, L, O, I, B or Z.
