// ── APPLICATIONS ────────────────────────────────────────────────────
// The one application opportunity worth putting in front of this founder,
// shown as a banner directly under the persona card.
//
// WHY THIS EXISTS
//   Before this, SIFF and HiPo only appeared if someone happened to pick
//   "milestones and accountability" or "getting in front of capital" on Q2.
//   A social impact founder who picked "learning by doing" never heard about
//   SIFF at all — the biggest thing available to them, invisible.
//
// WHAT IT PROMISES
//   "You may be eligible" — never "you are eligible". All the quiz knows is
//   what someone told us about their stage and sector. HiPo is gated on real
//   evidence; SIFF expects real traction. Sending a founder into a rejection
//   we could have predicted costs more trust than the banner earns.
//
// ROUNDS ROLL
//   HiPo runs three rounds. The banner shows whichever is NEXT, and hides
//   itself once the last one passes.

// The calendar in this file carries no year — dates are "Sep 15" strings.
// BUMP THIS when you regenerate ilab-data.js for a new academic year, or
// every application banner will silently stop rendering.
const WF_DATA_YEAR = 2026;

// persona → which program to surface. Community First gets nothing on
// purpose: every application here needs at least an idea, and Community
// First is by definition someone who told us they don't have one yet.
// Their Q2 "funding" answer already carries the honest Ingenuity caveat.
const APPLICATIONS = {
  impact:    "siff",
  validator: "hipo",
  builder:   "hipo",
  propeller: "pic",
  explorer:  "ingenuity",
  community: null,
};

// `bar` is the real eligibility bar, in the founder's language.
// LEAVE IT null RATHER THAN GUESSING — a null renders a neutral "check the
// criteria" line, which is honest. Invented criteria are not.
const PROGRAMS = {
  hipo: {
    name:    "HiPo",
    full:    "High Potential Venture Incubation",
    linkKey: "HIPO_APPLICATION",
    rounds:  ["hipo_application_round", "hipo_application_round_2", "hipo_application_round_3"],
    pitch:   "A self-paced, stage-gated incubator. You are not competing for a cohort seat — you enter at the stage your evidence supports and advance when it is ready.",
    bar:     "Four stages: Problem Validation, Solution Validation, Early Traction, Scale Readiness. You apply to the stage you can show evidence for, and you move up as that evidence builds — not on a clock.",
  },
  siff: {
    name:    "Social Impact Fellowship",
    full:    "Social Impact Fellowship (SIFF)",
    linkKey: "SIFF_APPLICATION",
    rounds:  ["social_impact_fellowship_app"],
    pitch:   "The i-lab's dedicated track for mission-driven ventures — the most substantial support available to a social impact founder this semester.",
    // TODO(lexi): fill in SIFF's actual eligibility bar. Previously discussed
    // as expecting traction — 300+ users, or partnerships, or funding, or IP —
    // but that is not written down anywhere in the source data, so it is not
    // going in front of founders until you confirm it.
    bar:     null,
  },
  ingenuity: {
    name:    "Ingenuity Award",
    full:    "Ingenuity Award",
    linkKey: "INGENUITY_APPLICATION",
    rounds:  ["ingenuity_award_application"],
    pitch:   "Up to $2,500 in non-dilutive funding — you keep all your equity — plus recognition, for Harvard students working on early-stage ideas.",
    bar:     "No fully formed startup and no revenue required. You do need an idea you are actively working on, aimed at a real-world problem.",
  },
  pic: {
    name:    "PIC",
    full:    "President's Innovation Challenge",
    linkKey: "PIC_APPLICATION",
    rounds:  ["pic_application_2027_round"],
    pitch:   "The i-lab's flagship venture competition, for teams with real proof points behind them.",
    // TODO(lexi): fill in PIC's eligibility bar — and tell me whether it is
    // open application or invitation-only. If it's invite-only this persona
    // should point at HiPo instead.
    bar:     null,
  },
};

// ── resolver ────────────────────────────────────────────────────────
const _WF_MON = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
                  Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

// "Sep 15" → Date. Returns null on anything it can't parse, so a hand-edited
// date like "TBC" or "Sept 15" hides the banner instead of rendering Invalid Date.
function _wfParseDate(s, year) {
  if (!s) return null;
  const m = String(s).trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!m || !(m[1] in _WF_MON)) return null;
  return new Date(year, _WF_MON[m[1]], parseInt(m[2], 10));
}

// getApplication(persona) → null, or everything the banner needs.
// Returns null when: the persona has no program, every round has passed, or
// the dates won't parse. Null means render nothing — never a broken banner.
function getApplication(persona) {
  const key = APPLICATIONS[persona];
  if (!key) return null;
  const prog = PROGRAMS[key];
  if (!prog) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = prog.rounds
    .map(function (id) {
      return EVENTS.filter(function (e) { return e.id === id; })[0];
    })
    .filter(function (e) { return e && e.active; })
    .map(function (e) { return { ev: e, when: _wfParseDate(e.date, WF_DATA_YEAR) }; })
    .filter(function (r) { return r.when && r.when >= today; })
    .sort(function (a, b) { return a.when - b.when; });

  if (!upcoming.length) return null;

  const url = LINKS[prog.linkKey];

  return {
    program: prog,
    next:    upcoming[0].ev,
    // Later rounds, as date strings — lets the banner say "or Oct 12, or Nov 9",
    // which takes the pressure off a founder who isn't ready for the first one.
    later:   upcoming.slice(1).map(function (r) { return r.ev.date; }),
    // null when the LINKS value is still "#". The banner renders without a
    // dead button rather than sending someone to a page that doesn't load.
    url:     (url && url !== '#') ? url : null,
    daysOut: Math.round((upcoming[0].when - today) / 86400000),
  };
}
