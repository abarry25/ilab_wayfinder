# i-lab Wayfinder

Routes a Harvard Innovation Labs founder to the programming that actually fits them.
Five answers in, a named persona and a three-step plan out.

No build step, no dependencies, no server. Open `founder_xp_generator.html` in a browser.

---

## The files

| File | What it is |
|---|---|
| `founder_xp_generator.html` | The founder-facing quiz. Start here. |
| `the_bot.html` | Staff Routing Desk. Same routing function, so staff and founders never disagree. |
| `data-editor.html` | Authoring tool. Edit content, export a new `ilab-data.js`. |
| `decision_logic.html` | Documents how routing works. |
| `ilab-data.js` | All content and all logic. **This is the only file most changes touch.** |
| `images/` | Advisor headshots, favicon, mascot. |

---

## How routing works

Five questions. Only three of them decide the persona.

| | feedback | milestones | funding | community |
|---|---|---|---|---|
| **explore** | Explorer | Explorer | Explorer | Community First |
| **test** | Validator | Sprint Builder | Sprint Builder | Community First |
| **propel** | Growth Founder | Growth Founder | Growth Founder | Community First |

Two rules sit on top:

- **Q2 goal = community → Community First, at any stage.** Wanting people, a team, or
  inspiration is a real answer, not a fallback for people who are short on time.
- **Q4 sector = social impact, at test or propel stage → Impact Founder.** Not at explore
  stage: SIFF expects traction, so a pre-idea impact founder starts as an Explorer with
  impact-tagged events and advisors.

**Q3 time never changes the persona.** It shapes the plan — Community First with a few
hours gets one virtual session and one Founder Circle; the same person with ten hours gets
Pizza & Pitch and the full monthly rhythm.

**Q5 format filters hard.** Choose remote and you get virtual steps and virtual events only,
plus an "if you do make it to campus" list that nothing else depends on.

It is a lookup table, not a weighted score. Every cell is a decision you can read off the
page, and nothing is ever settled by an accidental tie. The function lives in `ilab-data.js`
under `calcPersonaFromAnswers` — change it there and both pages follow.

---

## Editing content

Most of the time you want `ilab-data.js`. Its five blocks:

- `LINKS` — registration URLs. All `"#"` until you fill them in.
- `EVENTS` — the calendar. `active:false` hides one without deleting it.
- `EXPERTS` — advisor roster with photos and booking links.
- `OHS` — recurring drop-ins and clinic series, collapsed into one card each.
- `STEPS_DATA` — the three-step plan per persona.
- `PERSONAS` — card copy, colors, and the journey stack.

### STEPS_DATA rows

```js
{ sector:"all", step:1, u:true, fmt:"REMOTE", time:"light",
  link:LINKS.MEET_THE_ILAB, ll:"Register →",
  a:"What they should do", d:"Why, and what to expect." }
```

- `sector` — `all`, `default`, or one of `lifesci` / `deeptech` / `climate` / `socialimpact`.
  Resolution order is exact sector → `default` → `all`.
- `time` — **optional.** `light` / `moderate` / `heavy`. A row without one applies to everyone.
- `fmt` — `REMOTE` / `INPERSON` / `HYBRID`. Remote-preference founders never see an
  `INPERSON` step when a non-in-person row exists for that step.
- `u` — urgent, renders with emphasis.

Always leave at least one row per step with no `time`, so an unexpected value can never
drop a step from someone's plan.

### After editing

Open `founder_xp_generator.html` locally and take the quiz a few times before pushing. If
the page loads but the results are blank, it is almost always a syntax error in
`ilab-data.js` — the browser console points at the line.

---

## Watch out for

**`data-editor.html` is a separate implementation.** It carries its own copy of the export
format and its own seed data. It has been updated to preserve the optional `time` field, but
if you change the shape of a `STEPS_DATA` row again, update the editor's exporter too or it
will silently drop what it does not know about.

**Dates in `EVENTS` are display strings** (`"Oct 14"`), not real dates. Nothing sorts or
filters on them, so a typo is invisible until someone reads the card.

---

## Fall 2026 data

Generated from a ClickUp export. Routes in that file map to the six persona keys as follows:

| Sheet says | Persona key |
|---|---|
| Explorer | `explorer` |
| Validator | `validator` |
| Sprint Builder | `builder` |
| Growth Founder | `propeller` |
| Community First | `community` |
| Impact Founder | `impact` |
| Joiner, New Members, Broad Reach | folded into `community` |

Cohort-gated rows — Climate Circle, LLX, Accelerator, HiPo internals — are excluded. A
founder taking this quiz cannot attend them.

Seven events with a blank `Best For:` but an audience of "All membership" are tagged for all
six personas rather than dropped, including the Community Kick Off. Fill in their `Best For:`
and that inference goes away.
