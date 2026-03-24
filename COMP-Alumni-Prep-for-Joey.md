# COMP Alumni Engagement — What We Built and Why

*For Joey — the full picture before Monday*

---

## The Problem

Western University's College of Osteopathic Medicine (COMP) has ~2,665 DO graduates across two campuses — Pomona, CA and Lebanon, OR. Once a student walks off the stage at graduation, the school largely loses visibility. There's a university-wide alumni office that serves 21,000+ graduates across nine colleges, but nothing built specifically for COMP's needs: specialty-specific mentorship matching, accreditation-ready graduate outcomes, or meaningful reconnection at scale.

The Dean, Dr. Lisa Warren (DO '01 — she's a COMP grad herself), has publicly called for "personalized mentorship at scale" and a "continuum" from student to alumnus to mentor to advocate. She founded the career development office that got COMP to 100% residency placement this year. But the pipeline breaks at graduation. Nobody is systematically tracking where graduates end up, what they're doing, or when the right moment exists to reconnect.

## The Insight

The medical profession is the most trackable alumni population in higher education. Every practicing physician has an NPI number maintained by the federal government because billing depends on it. Every researcher shows up in PubMed. Every licensed doctor is in a state board database. The public data trail already exists — nobody at COMP is turning it into something useful.

## What We Built

A prototype dashboard showing what a **relationship engine** looks like in practice.

**Three data streams, one pipeline:**
- NPI Registry — federal physician database, monthly bulk CSV (~8GB), FOIA-released
- PubMed — daily publication index, public API
- Internal signals — engagement thresholds, reunion triggers, mentor gap detection

**Four layers of orchestration:**
- **Detect** — monitor for state changes (practice move, credential update, new publication, engagement drop)
- **Enrich** — cross-reference the signal against student needs, engagement history, campus proximity, mentor gaps
- **Suggest** — draft contextualized outreach, queue for human review
- **Learn** — every response feeds back, the system gets smarter over time

**The dashboard is the coordinator's view.** Signal comes in with full context already attached. Draft outreach is written. Coordinator personalizes one line, reviews, decides. That's the workflow.

## What's Real vs. Sample

The dashboard marks this clearly with badges:

**Verified (real, publicly reported):**
- 316 graduates (209 Pomona / 107 Lebanon), Class of 2025
- 100% placement rate — most competitive match in NRMP history
- Full specialty breakdown (12 categories, exact counts)
- Full geographic distribution (38 states)
- Five-year placement trajectory (97.8% → 100%)
- 58.9% primary care rate — Tier 1 U.S. News ranking

**Sample (representative estimates):**
- Engagement distribution across five tiers
- Mentor supply vs. student demand by specialty
- NPI matchable percentage (~78%)
- Signal feed scenarios (Dr. Park, Dr. Santos, Dr. Tran, Class of 2018)
- Draft outreach emails

Phase 1 replaces sample with real.

## The Signal Feed — Crown Jewel

Four sample signals, each showing detection → context → suggested action:

1. **Practice move** (NPI Registry) — DO '19 moves from Riverside to Portland. System recognizes COMP-NW opportunity, finds three matching students, notes 3-year gap since last touchpoint. Draft ready.
2. **New publication** (PubMed) — DO '16 publishes in Journal of Pediatrics. System flags Dean's specialty area, notes reunion attendance. Guest lecture invitation drafted.
3. **Credential update** (NPI specialty code change) — DO '20 completes EM fellowship. System identifies seven students pursuing EM. Mentor invitation drafted.
4. **Engagement drop** (internal threshold) — 47 Class of 2018 alumni, no touchpoint in 24+ months. Reunion-anchored reconnection campaign drafted with merge fields.

Each signal card has a "Review Draft" button that expands to show the actual outreach email — written in Dr. Warren's voice, sourced from her public statements. Approve, edit, or skip. Human decides every time.

## Architecture (What I Know / What's TBD)

**Known:**
- Data ingestion: Monthly NPPES bulk download, diff against previous snapshot. PubMed API daily. State boards individual lookup.
- Signal detection: Change detection loop — hash comparison on alumni NPI numbers, flag address/specialty code changes.
- Enrichment: Join signals against internal data (student interests, engagement history, campus proximity).
- AI layer: Draft outreach generation and matching recommendations. Orchestration is deterministic. Personalization is where the model earns its keep.
- Coordinator interface: The dashboard. Signals queue up, human reviews, action feeds back.

**TBD (Phase 1 decisions):**
- Database (depends on what WesternU runs — Postgres likely, may need to sit on existing CRM)
- Tech stack alignment with university IT
- CRM integration (unknown — could be Raiser's Edge, Salesforce, or something else)
- Security and hosting requirements

## The Roadmap

Four phases, each earns the next:

1. **Foundation — Detect** (Days 1–30): NPI enrichment for one class year. Working dashboard with real data. Clear picture of who we can find and the gap.
2. **Signal Engine — Enrich** (Days 31–60): Automated monitoring live. Daily coordinator queue. First real outreach recommendations.
3. **Engagement — Suggest** (Days 61–90): Mentorship matching. Outreach templates. Engagement scoring. COCA reporting.
4. **The Loop — Learn** (Days 91+): Every response feeds back. Institutional memory compounds. Full lifecycle.

University owns everything. No vendor lock-in. No subscription.

## What's Next

Monday I'm seeing Rob Warren — Dr. Warren's husband, Associate Provost at WesternU, my friend of 25 years. Casual hang, not a presentation. I'll ask before I show. His answer shapes how I position everything for the meeting with Dr. Warren.

**Live prototype:** [lbkdotdev.github.io/alumni-dashboard](https://lbkdotdev.github.io/alumni-dashboard/)

---

*Appreciate you looking at this, brother. Your feedback already made it better — the logo, the alumni-facing portal idea, the questions you asked. Keep them coming.*
