# The Alumni Chief of Staff
## AI Assistant Design — COMP Alumni Engagement Project

---

## What This Is

A full-agent AI assistant whose only job is the COMP Alumni Engagement project. Not a chatbot. Not a search bar. A chief of staff that knows everything about the project — Lisa's vision, the architecture, every alumni record, every outreach thread — and can actually do work.

Two modes, one brain:

- **Builder Mode** (now) — Scotty's daily driver. Helps build the system, generate documents, research questions, prototype workflows, prepare for meetings with Lisa.
- **Operator Mode** (handoff) — Lisa's team uses it to run the program day-to-day. Draft outreach, match mentors, pull reports, answer questions about the alumni network.

The transition happens naturally. As the system matures, the assistant's knowledge deepens. By the time it's handed off, it doesn't need onboarding — it already knows everything.

---

## The North Star

*"Empowering our community to discover and share their talents, fostering meaningful engagement."*

Every action the assistant takes gets filtered through this standard. If it's drafting an outreach email, the question isn't "is this grammatically correct?" — it's "would this make an alumnus feel seen?" If it's surfacing a mentorship match, the question isn't "do the specialties align?" — it's "does this create meaningful engagement between a graduate and a student?"

The North Star isn't just context. It's the decision-making framework.

---

## What It Knows (Knowledge Base)

### Tier 1: Permanent Memory (Never Forgets)

These are baked into the assistant's identity. It doesn't need to look them up.

| Knowledge Area | What It Contains |
|---------------|-----------------|
| **Lisa's Vision** | Her full quote, her priorities, her definition of meaningful engagement (updated after every conversation with her) |
| **Project Architecture** | The Phase 1 architecture doc — schema, enrichment pipeline, engagement scoring, signal-based outreach, consent framework |
| **Meeting Prep & Discovery** | Everything from the meeting prep v2 and discovery questions — her language, her world, her pain points |
| **Compliance Rules** | FERPA boundaries, data tier structure, consent architecture, opt-out requirements. The assistant never recommends an action that violates these. |
| **Two-Campus Context** | Pomona vs. Lebanon differences — demographics, engagement profiles, strategy differences |
| **Words & Tone** | Lisa's vocabulary, the "Words to Avoid" list, the communication style that resonates in her world. No jargon. No vendor-speak. No "AI-powered." |
| **Scotty's Identity** | Who Scotty is, how he writes, his background, his values. The assistant writes in his voice when drafting for him, and in the Dean's office voice when drafting for Lisa's team. |

### Tier 2: Working Memory (Updated Continuously)

These evolve as the project progresses.

| Knowledge Area | Source | Update Frequency |
|---------------|--------|-----------------|
| **Alumni Database** | The live alumni records — every profile, every engagement score, every touchpoint | Real-time (as data changes) |
| **Meeting Notes** | Transcripts and recaps from every conversation with Lisa, her team, compliance, IT | After each meeting |
| **Outreach History** | Every email sent, every response received, every follow-up action | Ongoing |
| **Mentorship Matches** | Active pairings, pending requests, specialty gaps | Ongoing |
| **Engagement Trends** | Score movements, tier changes, re-engagement results | Weekly roll-up |
| **Decision Log** | Every significant decision made on the project — what was decided, why, and by whom | As decisions happen |

### Tier 3: Reference (Looks Up When Needed)

| Knowledge Area | Source |
|---------------|--------|
| **NPPES / NPI Data** | Federal API — queried on demand for alumni lookups |
| **State Medical Board Records** | CA & OR boards — verification queries |
| **PubMed / Google Scholar** | Research publications by alumni |
| **COCA Accreditation Standards** | What's required for reporting |
| **Peer Institution Benchmarks** | Alumni engagement rates, donor participation, mentorship ratios at comparable DO programs |

---

## What It Can Do (Capabilities)

### Alumni Data & Intelligence

| Action | What Happens | Example |
|--------|-------------|---------|
| **Search alumni** | Natural language query against the alumni database | "Show me all cardiology alumni in Oregon who graduated after 2010" |
| **Profile lookup** | Pull a complete alumni profile with engagement history | "Tell me about Dr. Sarah Chen" |
| **Enrichment check** | Run an NPI lookup for a specific alumnus or class year | "Can you find current practice info for the Class of 2019?" |
| **Engagement report** | Generate a snapshot of engagement health — overall, by campus, by tier | "How's Lebanon doing this month?" |
| **Gap analysis** | Identify where engagement is dropping or where mentors are needed | "Which specialties have the biggest mentor gap right now?" |

### Outreach & Communication

| Action | What Happens | Example |
|--------|-------------|---------|
| **Draft outreach email** | Write a personalized email to an alumnus — in the right voice, with the right context | "Draft a reconnection email to Dr. Park — he moved practices last month" |
| **Batch outreach prep** | Segment alumni and draft personalized messages for a campaign | "Prepare outreach for the Class of 2018 reunion — personalize by specialty" |
| **Follow-up reminders** | Surface alumni who responded but haven't been followed up with | "Who responded to last week's outreach and hasn't heard back?" |
| **Signal alerts** | Notify when an outreach trigger fires — practice move, new credential, publication | "Dr. Williams just published a paper in the Journal of Family Medicine" |

### Mentorship Matching

| Action | What Happens | Example |
|--------|-------------|---------|
| **Find mentors** | Match a student's needs to available alumni mentors | "A 3rd-year student wants a surgery mentor in Southern California" |
| **Identify gaps** | Show where student demand exceeds mentor supply | "Where are we short on mentors?" |
| **Draft mentor invitation** | Write a personalized ask to an alumnus to become a mentor | "Invite Dr. Chen to mentor — she's a cardiologist in Portland, Class of '18" |
| **Track mentorship health** | Report on active matches, session logs, satisfaction | "How are our active mentorship pairings doing?" |

### Reporting & Accreditation

| Action | What Happens | Example |
|--------|-------------|---------|
| **COCA outcomes report** | Generate residency match rates, board pass rates, career trajectory data | "Pull the COCA numbers for this year" |
| **Dashboard refresh** | Update the dashboard with latest data | "Refresh the dashboard — new enrichment data came in" |
| **Board presentation prep** | Generate a summary of alumni engagement for leadership | "Lisa has a board meeting next week — prepare a one-page summary" |
| **Comparison report** | Pomona vs. Lebanon side-by-side on any metric | "Compare donor participation across campuses" |

### Project Management (Builder Mode)

| Action | What Happens | Example |
|--------|-------------|---------|
| **Architecture decisions** | Recommend technical approaches based on the architecture doc | "Should we use PostgreSQL or MongoDB for the alumni schema?" |
| **Meeting prep** | Generate talking points, questions, or agendas for meetings with Lisa | "I'm meeting Lisa Thursday — what should I cover?" |
| **Document generation** | Create proposals, briefs, recaps, architecture updates | "Draft a Phase 1 progress report for Lisa" |
| **Timeline tracking** | Track Phase 1 milestones and flag what's behind | "Where are we on the Phase 1 timeline?" |

---

## How It Works (Technical Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                 ALUMNI CHIEF OF STAFF                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              SYSTEM PROMPT / IDENTITY             │   │
│  │  North Star · Tone · Compliance Rules · Persona   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              KNOWLEDGE LAYER                      │   │
│  │                                                    │   │
│  │  Permanent Memory    Working Memory    Reference   │   │
│  │  (project docs,      (alumni DB,       (NPI API,   │   │
│  │   architecture,       meeting notes,    PubMed,     │   │
│  │   Lisa's vision)      outreach log)     state DBs)  │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              TOOL LAYER                           │   │
│  │                                                    │   │
│  │  Database      Email         NPI API     Report    │   │
│  │  Queries       Drafting      Lookups     Generator │   │
│  │                                                    │   │
│  │  Mentor        Calendar      Notion      Dashboard │   │
│  │  Matcher       Integration   Updates     Refresh   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              GUARDRAILS                           │   │
│  │                                                    │   │
│  │  FERPA compliance    Opt-out enforcement           │   │
│  │  Data provenance     Human-in-the-loop for         │   │
│  │  Audit logging       outreach & mentorship         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Platform Options

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Claude Project (Anthropic)** | Fast to build. Upload all project docs as knowledge. Use Claude's native capabilities. | No direct tool integrations (DB queries, API calls) without middleware. | Builder Mode — Scotty's daily driver, immediate. |
| **Claude Agent SDK + MCP** | Full tool access. Can query databases, call APIs, send emails. Extensible with MCP connectors. | More engineering to build. Needs hosting. | Operator Mode — the production assistant for Lisa's team. |
| **Hybrid** | Start with a Claude Project for immediate value. Build the Agent SDK version as Phase 1 infrastructure comes online. | Two systems to maintain temporarily. | The realistic path — start fast, evolve into full agent. |

**Recommendation: Hybrid.** Here's why.

You can have a working assistant *today* by creating a Claude Project with all the project documents as context. That's Builder Mode — it knows the architecture, the meeting prep, the discovery questions, Lisa's vision, your voice. It can draft documents, prepare for meetings, think through problems. No engineering required.

Then, as Phase 1 infrastructure comes online (database, API layer, NPI pipeline), you build the Agent SDK version that can actually query data, send emails, and match mentors. That's Operator Mode — the production assistant that Lisa's team eventually uses.

The knowledge base is the same. The tools expand over time.

---

## The Handoff Plan (Scotty → Lisa's Team)

### Phase A: Builder Mode (Now → Day 30)

**User:** Scotty only
**Platform:** Claude Project
**Capabilities:** Document generation, meeting prep, architecture thinking, research
**Knowledge:** All project files uploaded as context

What Scotty uses it for:
- "Prepare me for Thursday's call with Lisa"
- "Draft a Phase 1 progress report"
- "How should we handle the two-campus mentorship gap?"
- "Write a follow-up email to Lisa after today's meeting — in my voice"

### Phase B: Expanded Builder (Day 30 → Day 60)

**User:** Scotty + limited access for Lisa (read-only dashboards, meeting recaps)
**Platform:** Claude Project + early Agent SDK tools
**New capabilities:** Database queries, NPI lookups, basic reporting

What changes:
- Assistant can now query real alumni data
- Lisa starts seeing AI-generated meeting recaps and progress summaries
- Trust builds as Lisa interacts with the outputs

### Phase C: Operator Mode (Day 60 → Day 90)

**User:** Lisa's team (coordinator, advancement staff)
**Platform:** Full Agent SDK with MCP connectors
**New capabilities:** Outreach drafting, mentor matching, engagement alerts, COCA reporting

What changes:
- The coordinator can ask: "Who should I reach out to today?"
- The assistant generates the daily outreach queue
- Mentorship matching is automated (human approves)
- COCA reporting is generated on demand

### Phase D: Full Chief of Staff (Day 90+)

**User:** Everyone on the project
**Platform:** Agent SDK — mature, integrated, trusted
**Full capabilities:** Everything above + proactive alerts, trend analysis, board presentation prep

The assistant becomes indispensable. It holds the institutional memory. When a new team member joins, the assistant onboards them. When Lisa needs a board presentation, the assistant drafts it. When an alumnus goes quiet, the assistant notices.

---

## What Makes This Different

Most AI assistants are search bars with personality. This one is different because:

1. **It has a North Star.** Every action is filtered through "does this create meaningful engagement?" That's not a feature — it's a value system.

2. **It knows the people.** Not just data records. It knows Lisa's priorities shifted after the March meeting. It knows Dr. Chen prefers virtual mentorship. It knows the Lebanon campus needs a different approach than Pomona.

3. **It holds institutional memory.** Three years from now, a new coordinator can ask "what happened with the Class of 2019 outreach?" and get the full story — what was sent, who responded, what worked.

4. **It gets better over time.** Every meeting transcript, every outreach result, every Lisa reaction gets fed back into the knowledge base. The assistant at day 90 is dramatically smarter than the assistant at day 1.

5. **It respects boundaries.** FERPA compliance isn't an afterthought. Opt-outs are enforced. Every action is logged. Every data point has provenance. Lisa's compliance team can audit anything.

---

## What to Build First

**Tomorrow:** Create the Claude Project with all existing documents as context. Write the system prompt. Scotty has a working Builder Mode assistant by end of day.

**This week:** Test it against real project questions. Refine the prompt. Add any missing knowledge.

**After the Lisa meeting:** Upload the meeting transcript. Update the North Star with her actual words. The assistant evolves.

---

*AI Assistant Design v1 — March 2026*
*For Scotty — COMP Alumni Engagement Project*
*"The goal isn't a smarter chatbot. It's a team member who never forgets what matters."*
