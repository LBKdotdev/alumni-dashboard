# COMP Alumni Engagement System — Phase 1 Architecture
## Foundation (Days 1–30)

---

## North Star

*"Empowering our community to discover and share their talents, fostering meaningful engagement."*

Every technical decision in this architecture serves that standard. If a component doesn't eventually create meaningful engagement — alumni who feel seen, who connect back, who carry the mission forward — it doesn't belong in Phase 1.

---

## What Phase 1 Delivers

By day 30, Lisa's team should be able to:

1. Ask a plain-language question like "show me all cardiology alumni in Oregon who graduated after 2010" — and get an answer
2. See a real dashboard with real COMP data (not the sample prototype)
3. Know exactly how many alumni are reachable, how many are lost, and where the gaps are
4. Have a working consent architecture — opt-in, opt-out, data provenance — from day one
5. Run one small outreach pilot to a single class year to validate the engagement approach

Phase 1 is not the whole system. It's the foundation that earns Phase 2.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ALUMNI ENGAGEMENT SYSTEM                  │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Data Layer  │──▶│  Engine Layer │──▶│  Interface Layer │  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
│        │                   │                    │            │
│   Where the data      How it works         What Lisa's      │
│   lives & how it      (matching,           team sees and     │
│   stays clean         scoring,             interacts with    │
│                       outreach triggers)                     │
└─────────────────────────────────────────────────────────────┘
```

Three layers. Each one buildable independently. Each one testable before moving on.

---

## Layer 1: Data

### 1.1 Alumni Record Schema

The core unit is the **Alumni Profile** — one record per graduate, enriched over time from multiple sources. Every field tracks where it came from (data provenance) and when it was last updated.

```
Alumni Profile
├── Identity (from university records)
│   ├── full_name
│   ├── class_year
│   ├── campus (Pomona | Lebanon)
│   ├── degree (DO)
│   ├── student_id_hash (for internal matching — not stored raw)
│   └── directory_info_consent (per WesternU FERPA definition)
│
├── Professional (from NPPES + state boards)
│   ├── npi_number
│   ├── specialty
│   ├── practice_name
│   ├── practice_address (city, state, zip)
│   ├── license_status (active | inactive | unknown)
│   ├── credentials[]
│   └── last_verified_date
│
├── Contact (from voluntary opt-in + directory info)
│   ├── email (self-reported or directory)
│   ├── phone (self-reported)
│   ├── preferred_contact_method
│   ├── contact_source (directory | self_reported | inferred)
│   └── opt_out (boolean — overrides everything)
│
├── Engagement (system-generated)
│   ├── engagement_score (calculated — see 2.2)
│   ├── last_touchpoint_date
│   ├── touchpoint_history[]
│   │   ├── type (email_open | event_attend | mentor_session | gift | survey_response)
│   │   ├── date
│   │   └── detail
│   ├── engagement_tier (highly_engaged | engaged | warm | inactive | lost_contact)
│   └── tier_change_date
│
├── Mentorship (from matching engine + voluntary)
│   ├── mentor_available (boolean)
│   ├── mentor_specialties[]
│   ├── mentor_preferences (in_person | virtual | either)
│   ├── matched_students[]
│   └── mentorship_hours_logged
│
├── Giving (from advancement office)
│   ├── donor_status (active | lapsed | never)
│   ├── giving_history[]
│   │   ├── date
│   │   ├── amount
│   │   └── fund
│   ├── lifetime_giving
│   └── cultivation_stage (identified | cultivating | solicitation_ready | active | major_prospect)
│
├── Research (from PubMed — public)
│   ├── publications[]
│   │   ├── title
│   │   ├── journal
│   │   ├── date
│   │   └── pmid
│   └── research_active (boolean)
│
└── Meta
    ├── record_created_date
    ├── last_updated_date
    ├── data_sources[] (tracks provenance for every enrichment)
    │   ├── source_name (nppes | state_board | self_reported | advancement | pubmed)
    │   ├── date_added
    │   └── confidence (high | medium | low)
    └── consent
        ├── opt_in_date
        ├── opt_out_date
        ├── consent_method (portal | email | manual)
        └── data_visibility (full | limited | opted_out)
```

### 1.2 Data Sources — Tiered by Access

| Tier | Source | Access | Automated? | Phase 1? |
|------|--------|--------|-----------|----------|
| 1 | **NPPES / NPI Registry** | Public, FOIA. Free API, updated monthly. | Yes — batch + monthly sync | ✅ Yes |
| 1 | **WesternU graduation records** | Internal. Registrar's office. | Manual initial export → automated sync | ✅ Yes |
| 2 | **CA & OR state medical boards** | Public for individual lookups. | Verification only — not bulk | ✅ Limited |
| 2 | **PubMed / Google Scholar** | Public. | Yes — author name + affiliation match | ✅ Yes |
| 3 | **Doximity** | TOS prohibits scraping. Alumni self-link only. | No — voluntary opt-in | ⏳ Phase 2 |
| 3 | **LinkedIn** | TOS prohibits scraping. Alumni self-link only. | No — voluntary opt-in | ⏳ Phase 2 |
| 3 | **Advancement/donor records** | Internal. Development office. | Manual initial export → automated sync | ✅ Yes |

### 1.3 Data Enrichment Pipeline (Phase 1)

```
Graduation Records (WesternU)
        │
        ▼
  ┌─────────────┐
  │  NPI Matcher │  Cross-reference name + graduation year + specialty
  │  (NPPES API) │  against federal registry
  └──────┬──────┘
         │
         ▼
  Match confidence scoring
  ├── High (exact name + specialty + year range) → auto-link
  ├── Medium (name match, specialty differs) → flag for review
  └── Low (common name, multiple matches) → manual resolution
         │
         ▼
  ┌──────────────┐
  │ State Board   │  Verify license status for high-confidence matches
  │ Verification  │  (CA Medical Board, OR Medical Board)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  PubMed Scan  │  Match alumni names + institutional affiliations
  │  (public API) │  to published research
  └──────┬───────┘
         │
         ▼
  Enriched Alumni Profile
  (practice location, specialty, credentials,
   license status, publications — all with provenance tags)
```

**Expected yield (based on peer institution benchmarks):**
- NPI match rate: 75–85% of graduates with active clinical practice
- Verified locations: ~72% of total alumni
- Enriched profiles (3+ data points beyond graduation record): ~58%

These numbers get validated in Phase 1 against real COMP data. They're estimates, not promises.

---

## Layer 2: Engine

### 2.1 Engagement Scoring

The dashboard prototype uses a 1–10 scale. Here's what that actually means when it's real:

**Engagement Score = weighted composite of observable behaviors**

| Signal | Weight | What It Measures |
|--------|--------|-----------------|
| Email response (reply, not just open) | 15% | They're talking back |
| Event attendance (in-person or virtual) | 20% | They showed up |
| Mentorship participation | 25% | They're sharing their talents |
| Giving (any amount) | 15% | They're investing in the community |
| Survey response | 10% | They care enough to answer |
| Profile self-update (opt-in portal) | 10% | They want to be found |
| Recency multiplier | 1.5x if within 6 months, 1.0x if 6–12 months, 0.5x if 12+ months | Recent engagement counts more |

**Tier mapping:**

| Score | Tier | What It Means |
|-------|------|--------------|
| 8–10 | Highly Engaged | Alumni who are actively connecting, mentoring, or giving. The community Lisa wants to grow. |
| 6–7.9 | Engaged | Regular touchpoints. Responsive. Not deeply involved yet but present. |
| 4–5.9 | Warm | Some signal — opened an email, attended one event. A reason to reach out. |
| 1–3.9 | Inactive | On the books but no interaction in 12+ months. The reconnection opportunity. |
| 0 | Lost Contact | No valid contact information. Need to locate them first. |

Note: mentorship is weighted highest. That's intentional — it's the deepest form of meaningful engagement per Lisa's framing. This weighting is adjustable after Lisa defines her own priorities.

### 2.2 Signal-Based Outreach

The old way is batch-and-blast — send the same email to everyone and hope. Signal-based outreach is different. The system watches for moments — a reason to reach out when the timing is right:

| Trigger | Action | Why It Matters |
|---------|--------|---------------|
| Alumni moves practice (NPI update) | Send "congratulations on the move" note + updated record | They feel seen — the school noticed |
| Alumni earns new credential | Acknowledge it. Invite them to speak or mentor in that specialty. | Validates their growth. Opens a door. |
| Alumni publishes research | Share with department. Invite collaboration. | Shows the school follows their work |
| Student needs mentor in a specialty with gaps | Outreach to alumni in that specialty | Connects a real need to a real person |
| Alumni engagement score drops below 4 | Trigger re-engagement workflow (personal note, not mass email) | Catch them before they go silent |
| Reunion class year approaching | Targeted reunion outreach + giving conversation | Natural touchpoint with built-in nostalgia |
| Alumni responds to any outreach | Immediate follow-up within 48 hours | Momentum matters — don't let it go cold |

### 2.3 Mentorship Matching

```
Student Request                    Alumni Availability
├── Specialty needed               ├── Specialty offered
├── Campus                         ├── Campus affiliation
├── Preferred format               ├── Preferred format
│   (in-person | virtual)          │   (in-person | virtual | either)
└── Location preference            └── Practice location

            │                              │
            └──────────┬───────────────────┘
                       ▼
              ┌────────────────┐
              │  Match Engine   │
              │                │
              │  Score by:     │
              │  - Specialty ✓ │
              │  - Format ✓   │
              │  - Proximity   │
              │  - Availability│
              └───────┬────────┘
                      ▼
              Top 3 matches surfaced
              to coordinator for review
              (human makes final call)
```

The system recommends. A human decides. That's the design.

---

## Layer 3: Interface

### 3.1 Dashboard (Evolution of Current Prototype)

The prototype becomes real by connecting to actual data. Phase 1 changes:

| Current (Prototype) | Phase 1 (Real) |
|---------------------|----------------|
| Hardcoded sample data | Live queries against alumni database |
| Static engagement scores | Calculated from real touchpoint history |
| Sample alumni records table | Searchable, filterable real records |
| Mock NPI search | Live NPPES API integration |
| Estimated projections | Baseline metrics from actual data |

**New in Phase 1:**
- **Smart search** — plain-language queries: "cardiology alumni in Oregon, class of 2015 or later"
- **Engagement timeline** — per-alumni view of every touchpoint, scored
- **Data provenance badges** — every data point shows where it came from (federal, self-reported, advancement)

### 3.2 Alumni Self-Service Portal (Lightweight — Phase 1 MVP)

A simple page where alumni can:
- Confirm or update their contact information
- Opt in to mentorship (select specialties, availability, format preference)
- View their profile and see what the school knows (transparency)
- Opt out with one click (required by consent architecture)

Not a full portal. Not a login system. Phase 1 is a one-time-use link sent via email — unique to each alumnus, expires in 30 days. Low friction. High trust.

### 3.3 Coordinator View

Lisa's team needs a daily working view:

- **Today's outreach queue** — triggered actions waiting for a human to send or approve
- **New matches** — mentorship pairings the engine surfaced overnight
- **Engagement movers** — alumni whose score changed significantly (up or down)
- **Data quality flags** — records that need manual review (low-confidence NPI matches, bounced emails)

---

## Consent Architecture

Built from day one. Not bolted on later.

```
┌─────────────────────────────────────────────┐
│              CONSENT FRAMEWORK               │
│                                             │
│  Tier 1: Public Federal Data (NPPES)        │
│  ├── No consent needed — FOIA-released      │
│  ├── Used for: location, specialty, NPI     │
│  └── Alumni can still opt out of system     │
│                                             │
│  Tier 2: Directory Information (FERPA)      │
│  ├── Per WesternU's annual FERPA notice     │
│  ├── Used for: name, degree, dates          │
│  └── Confirm with Registrar what's covered  │
│                                             │
│  Tier 3: Voluntary / Self-Reported          │
│  ├── Explicit opt-in required               │
│  ├── Used for: email, phone, mentorship,    │
│  │   giving preferences, Doximity link      │
│  └── Revocable at any time — one click      │
│                                             │
│  Universal Opt-Out                          │
│  ├── Any alumnus can remove themselves      │
│  ├── One-click mechanism in every outreach  │
│  ├── Removes from all outreach + matching   │
│  └── Retains anonymized record for          │
│       accreditation aggregate reporting only │
└─────────────────────────────────────────────┘
```

**Data provenance tracking:**
Every data point in the system carries a tag:
- `source: nppes` / `state_board` / `self_reported` / `advancement` / `pubmed`
- `date_added`
- `confidence: high | medium | low`

Lisa's compliance team can audit the full trail at any time.

---

## Two Campuses, One System

Pomona and COMP-Northwest aren't just two locations — they're two different alumni communities with different profiles, different needs, and potentially different definitions of what meaningful engagement looks like.

**What we know going in:**
- Pomona is older, larger (1,913 alumni), more urban, stronger historical ties, higher donor participation
- Lebanon is younger, smaller (752 alumni), rural, more geographically spread out
- The dashboard already shows the engagement gap: Pomona 6.4/10 vs. Lebanon 5.8/10

**How the architecture handles it:**

- **Single system, campus-aware views.** One database, one engine, one dashboard — but every query, every report, every outreach workflow can be filtered or split by campus. Lisa's team never has to wonder "is this Pomona or Lebanon?"
- **Campus-specific engagement strategies.** What works for Pomona (in-person regional events in the LA/San Diego corridor) won't work for Lebanon (rural, spread across the Pacific Northwest). The outreach trigger system supports different playbooks per campus — virtual-first for Lebanon, in-person-first for Pomona.
- **Mentorship matching considers campus affinity.** An alumnus from COMP-Northwest may be a better mentor for a current Lebanon student — shared experience, shared geography, shared identity.
- **One dashboard, two stories.** The campus toggle already exists in the prototype. In Phase 1, it becomes real — showing Lisa where engagement is thriving and where it needs attention, campus by campus.

The goal isn't to treat them identically. It's to understand their differences well enough to engage each community in a way that feels meaningful to *them*.

---

## Infrastructure

### Where It Lives

**Recommendation:** University-hosted or university-controlled cloud environment.

- **Database:** PostgreSQL — relational, handles complex queries, well-understood by university IT
- **API layer:** Lightweight REST API (Python/FastAPI or Node/Express) — serves the dashboard and coordinator view
- **Dashboard:** The current HTML prototype evolves into a connected frontend — same design, real data
- **NPPES sync:** Scheduled job (monthly) — pulls bulk download, runs matching algorithm, flags changes
- **Hosting:** University's existing infrastructure or a compliant cloud instance (AWS GovCloud, Azure Government, or whatever their IT team already uses)

No vendor lock-in. No proprietary platform. Everything the university can own, inspect, and maintain.

### Security

- All data encrypted at rest and in transit
- Role-based access (coordinator, admin, read-only, compliance auditor)
- Audit log on every record access and modification
- PII handling per FERPA requirements
- No alumni data leaves the university's controlled environment

---

## Phase 1 Timeline (Days 1–30)

| Week | Focus | Deliverable |
|------|-------|-------------|
| **Week 1** | Data audit + schema design | Inventory of what WesternU has today. Schema finalized. Compliance review initiated. |
| **Week 2** | NPI enrichment pilot | Run matching algorithm against one class year (e.g., Class of 2018). Measure match rate. Validate estimates. |
| **Week 3** | Dashboard MVP + coordinator view | Connect real data to the dashboard. Build the coordinator's daily working view. Smart search functional. |
| **Week 4** | Consent architecture + outreach pilot | Alumni self-service link live. One small outreach pilot (single class year). Measure response. |

### Phase 1 Exit Criteria

Before Phase 2 begins, these must be true:

- [ ] Real COMP data flowing into the dashboard — not sample data
- [ ] NPI match rate validated against at least one full class year
- [ ] Consent architecture reviewed by WesternU compliance
- [ ] At least one outreach pilot completed with measurable response
- [ ] Lisa's team has used the coordinator view for at least one week
- [ ] Lisa's definition of meaningful engagement documented and reflected in engagement scoring weights

That last one matters most. If we don't know what meaningful engagement means to her by day 30, the rest is plumbing.

---

## What Phase 1 Does NOT Include

Being clear about scope prevents scope creep and keeps trust:

- ❌ Full donor pipeline automation (Phase 2)
- ❌ Doximity/LinkedIn voluntary integration (Phase 2)
- ❌ Cross-campus collaboration tools (Phase 3)
- ❌ Automated COCA reporting (Phase 2 — needs compliance sign-off)
- ❌ Mobile app or native experience (Phase 3 if ever)
- ❌ Multi-channel outreach automation — email, SMS, direct mail (Phase 2)

Phase 1 earns Phase 2 by delivering clarity: how big is the alumni network, how reachable are they, and does the engagement approach work?

---

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| WesternU graduation records are messy or incomplete | Week 1 audit catches this early. Build cleaning pipeline before enrichment. |
| NPI match rate is lower than 75% | Common names and alumni who left clinical practice will reduce yield. Budget for manual resolution queue. |
| Compliance team moves slowly | Engage them in Week 1, not Week 4. Frame consent architecture as a feature, not an afterthought. |
| Lisa's definition of meaningful engagement changes what we weight | That's the point. Engagement scoring weights are configurable by design. |
| University IT has constraints we don't know about yet | Discovery question 7b covers this. Know their stack before building. |
| Alumni don't respond to the pilot outreach | Test the message, not just the system. One personal email from Lisa will outperform any automated campaign. |

---

## How This Connects to the Meeting

This architecture document exists to be *reacted to* — not presented as a finished plan. After the meeting with Lisa:

1. Her definition of meaningful engagement adjusts the engagement scoring weights
2. Her priorities determine which parts of Phase 1 get built first
3. Her team's existing tools determine the infrastructure decisions
4. Her compliance team's comfort level determines the consent architecture details

The architecture is the skeleton. The meeting fills in the muscle.

---

*Architecture v1 — March 2026*
*For Scotty — COMP Alumni Engagement System*
*Phase 1 of a phase-gated approach. Each phase earns the next.*
