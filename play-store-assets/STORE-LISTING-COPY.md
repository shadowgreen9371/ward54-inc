# Ward 54 INC — Kolkata · Play Store Listing Copy

Copy-paste these exact values into the Google Play Console when you reach Phase 3b.

---

## Identity

| Field | Value |
|---|---|
| **App name** (30 char max) | `Ward 54 INC — Kolkata` |
| **Default language** | English (United Kingdom) — `en-GB` |
| **App / Game** | App |
| **Free / Paid** | Free |
| **Application ID** | `com.ward54inc.app` *(already baked into the signed AAB)* |

---

## Short description (80 chars max)

```
Ward 54 INC Kolkata — voter list, polling stations, office bearers, agents.
```
*(79 chars ✓)*

---

## Full description (4000 chars max)

```
Ward 54 INC — Kolkata is the official information app for the Indian National Congress unit of Ward No. 54, Kolkata Municipal Corporation.

Built for residents, voters, and party workers of the Ballygunge / Beniapukur / Tangra catchment, the app gives you instant access to:

🪪 VOTER LIST & BOOTH FINDER
• 26,849 voters across 12 polling stations and 38 booths
• Search by voter name or EPIC number — find your booth in seconds
• Each polling station shows: full address, building photo, total voters, gender split, and the list of parts that vote there

📍 POLLING STATIONS
• Live OpenStreetMap view of all 12 stations across the ward
• Tap a marker → address, voter count, parts list
• Designed for Election Day — works offline once you've opened it once

🏛️ OFFICE BEARERS
• 54 Ward Congress Committee — President, Vice-Presidents, General Secretary, and members
• WhatsApp directly from each member's card
• Video Call + Group Chat for committee coordination
• Same roster mirrored for the Polling Agents team

🗣️ POLLING AGENTS
• One booth agent per part — all 38 parts covered
• Roles, duties, contact, and a complaint-log form for Election Day
• Each agent's responsibilities and current status

📣 DIGITAL NOTICE BOARD
• Latest meeting notices and announcements from the ward unit
• Updated by office bearers in real-time

🖼️ INSPIRATIONS
• Curated gallery of leaders, rallies, and Ward 54 moments
• "Service before self — Youth is not a stage of life; it is the spark that lights the ward"

🇮🇳 ABOUT WARD 54 KMC
Ward No. 54 of the Kolkata Municipal Corporation falls under the Beniapukur assembly constituency in West Bengal. The Ward 54 INC unit serves residents through ground-level political work, voter assistance, and community service.

⚙️ PRIVACY-FIRST
This app collects ZERO personal data. No analytics. No tracking. No ads. The voter list shown is the publicly-published electoral roll from the Election Commission of India. Read our full privacy policy at https://kolkata54ward.in/privacy.html

📱 LIGHTWEIGHT
Just 3 MB. Works on any Android 5.1+ phone. Auto-updates content from the official ward website whenever you open it.

Brought to you by Ward 54 INC, Kolkata.
Indian National Congress — for the next generation.
```
*(~2,070 chars — well under 4,000)*

---

## Categorization

| Field | Value |
|---|---|
| Category | **News & Magazines** *(closest fit for ward/civic info)* |
| Tags | `civic`, `kolkata`, `voter list`, `polling booth`, `INC`, `west bengal` |
| Content rating | Everyone *(answer questionnaire honestly — there's no UGC, ads, or violence)* |
| Target audience | Adults 18+ |

---

## Contact details

| Field | Value |
|---|---|
| **Email** | `mdshakil43@gmail.com` |
| **Phone** *(optional but recommended)* | *(your contact number)* |
| **Website** | `https://kolkata54ward.in/` |
| **Privacy policy URL** | `https://kolkata54ward.in/privacy.html` |

---

## Graphic assets (all in `play-store-assets/`)

| Asset | File | Spec | Status |
|---|---|---|---|
| App icon (high-res) | `store-icon-512.png` | 512×512 PNG, 32-bit, sRGB | ✓ |
| Feature graphic | `feature-graphic.png` | 1024×500 PNG/JPG, no alpha | ✓ |
| Phone screenshot 1 | `screen-1-hero.png` | 1080×1920 (Pixel 7) | ✓ |
| Phone screenshot 2 | `screen-2-find-booth.png` | 1080×1920 | ✓ |
| Phone screenshot 3 | `screen-3-stations.png` | 1080×1920 | ✓ |
| Phone screenshot 4 | `screen-4-committee.png` | 1080×1920 | ✓ |

*(Play Store requires 2–8 phone screenshots; we have 4. Optional later: 7" tablet and 10" tablet sets — not required for launch.)*

---

## Data safety form (required as of 2022)

Answer **every** question with these values — the app collects nothing:

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | **N/A — no data collected** |
| Do you provide a way for users to request that their data is deleted? | **N/A — no data collected** |

---

## App content disclosures (also required)

| Question | Answer |
|---|---|
| Target audience | Ages 18+ |
| Contains ads? | **No** |
| In-app purchases? | **No** |
| Government app? | **No** *(party-affiliated, not government — make sure you say No here, otherwise Google requires special verification)* |
| News app? | **No** *(borderline, but choose No to avoid news-specific review)* |
| COVID-19 contact tracing? | **No** |

---

## Release tracks

For first launch, use **Internal testing** track:
1. Add yourself + 5–10 close colleagues to an "Internal testers" group (Gmail addresses)
2. Upload `Ward54INC-v1.0.0.aab`
3. They get a magic install link, can sideload, give feedback
4. After ~2 days of feedback, promote to **Production** with a single button

This way the public Production listing only goes live when you are ready, and you avoid the first-rejection-because-of-typo cycle.

---

## When you're ready for Phase 3b — Play Console upload

Pre-check before paying the $25:

- [ ] `Ward54INC-v1.0.0.aab` exists in `mobile/release/` ✓ (built & signed)
- [ ] `feature-graphic.png` 1024×500 ✓
- [ ] `store-icon-512.png` 512×512 ✓
- [ ] 4 screenshots ✓
- [ ] `privacy.html` deployed at GitHub Pages ✓ *(committing now)*
- [ ] Store listing copy in this file ✓
- [ ] A Gmail account dedicated to the developer console *(create one if you don't want to mix it with your personal Gmail)*
- [ ] A credit/debit card or UPI for the $25 dev fee *(one-time, lifetime)*

When all boxes ticked, say "Phase 3b" and I'll walk you through the Play Console form, field by field.
