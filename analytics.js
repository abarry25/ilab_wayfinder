// ════════════════════════════════════════════════════════════════
// analytics.js — i-lab Wayfinder · anonymous routing telemetry
//
// Writes to a Google Form, which writes to a Sheet. No third-party
// tracker, no cookies, no consent banner, nothing to install.
//
// WHAT IT SENDS
//   The five quiz answers, the persona they landed on, which
//   recommendation they clicked, and how far through they got.
//
// WHAT IT NEVER SENDS
//   No name, no email, no IP, no free text, no cookie, nothing
//   that persists past the tab. The session id is a random string
//   generated on page load and thrown away when the tab closes —
//   it exists only so you can join one person's rows together in
//   the Sheet. It cannot be traced back to anybody.
//
// SETUP — see ANALYTICS-SETUP.md. Until FORM_ID is filled in this
// file does nothing at all: every call is a no-op, and the quiz
// works exactly as it does now.
// ════════════════════════════════════════════════════════════════

window.WF_ANALYTICS = {
  // Form: "Wayfinder telemetry". Blank FORM_ID out to switch all of this off.
  FORM_ID: '1FAIpQLSeaAAS4rWyufjlD202KHsojV3f-EyAq54SgNgPOzCrwdr_bdg',

  // Entry ids, read off the form's pre-filled link. If you ever rebuild the
  // form these all change — regenerate a pre-filled link and repaste.
  FIELDS: {
    session: 'entry.1174331446',
    event:   'entry.2057048025',
    stage:   'entry.1759396148',
    goal:    'entry.359808740',
    time:    'entry.14638847',
    sector:  'entry.742409',
    format:  'entry.787662099',
    persona: 'entry.953065052',
    detail:  'entry.1211558482',
  },
};

// ── internals ──────────────────────────────────────────────────────
const _wfSession = Math.random().toString(36).slice(2, 10);

function _wfReady() {
  return !!(window.WF_ANALYTICS.FORM_ID && window.WF_ANALYTICS.FIELDS.event);
}

// Fire and forget. `no-cors` means we can't read the response, which is
// fine — nothing here needs one. Any failure is swallowed on purpose:
// telemetry must never be able to break the quiz.
function wfTrack(eventName, payload) {
  try {
    if (!_wfReady()) return;
    const data = Object.assign({ event: eventName, session: _wfSession }, payload || {});
    const body = new FormData();
    Object.keys(window.WF_ANALYTICS.FIELDS).forEach(function (k) {
      const field = window.WF_ANALYTICS.FIELDS[k];
      if (field && data[k] !== undefined && data[k] !== null && data[k] !== '') {
        body.append(field, String(data[k]));
      }
    });
    fetch('https://docs.google.com/forms/d/e/' + window.WF_ANALYTICS.FORM_ID + '/formResponse',
          { method: 'POST', mode: 'no-cors', body: body }).catch(function () {});
  } catch (e) { /* never let telemetry break the page */ }
}

// ── the four things worth knowing ──────────────────────────────────

// How far they got. Fires on every question they reach, so a drop-off
// shows up as rows that stop at q3.
function wfTrackStep(questionId) {
  wfTrack('reached', { detail: questionId });
}

// The routing itself — the row you'll actually pivot on.
function wfTrackResult(answers, persona) {
  wfTrack('result', {
    stage:   answers.q1, goal:   answers.q2, time: answers.q3,
    sector:  answers.q4, format: answers.q5, persona: persona,
  });
}

// What they acted on, which is a different question from what we showed
// them. Only meaningful once the LINKS in ilab-data.js are filled in.
function wfTrackClick(label, persona, answers) {
  wfTrack('click', {
    detail: label, persona: persona,
    stage: answers.q1, goal: answers.q2, sector: answers.q4, format: answers.q5,
  });
}

// A retake usually means the first answer didn't feel right.
function wfTrackRetake(persona) {
  wfTrack('retake', { persona: persona });
}
