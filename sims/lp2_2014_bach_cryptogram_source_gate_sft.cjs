'use strict';

/**
 * Original 2014 participant Bach note-list B-A-C-H cryptogram gate.
 * Run: node sims/lp2_2014_bach_cryptogram_source_gate_sft.cjs
 *
 * Checks literal German note names, all constant transpositions, and
 * all retrograde four-note windows within each independently authored part.
 * This is a source-side selector test, not an LP2 decryption.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'external', 'cicada2014-bach-pastebin-3T089HUW.txt'),
  'utf8',
);
const lines = source.split(/\r?\n/).filter(s => /^(Flute\s+\d+|Harpsic):/i.test(s.trim()));
assert.equal(lines.length, 3, 'Original period source must list three voices');
const voices = lines.map(s => s.slice(s.indexOf(':') + 1).trim().split(/\s+/));
assert.deepEqual(voices, [
  ['G', 'G', 'F#', 'A', 'G', 'F#', 'E'],
  ['D', 'C', 'E', 'D', 'C', 'B', 'A', 'A'],
  ['B', 'C', 'A', 'D', 'C'],
]);
const pitch = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, 'F#': 6, G: 7, A: 9, B: 11, Bb: 10 };
const canonical = ['Bb', 'A', 'C', 'B'];
const signature = [11, 3, 11]; // Semitone steps of B-flat -> A -> C -> B-natural modulo 12.

function occurrences(values, pattern) {
  let matches = 0;
  for (let i = 0; i + pattern.length <= values.length; i++) {
    if (pattern.every((p, j) => values[i + j] === p)) matches++;
  }
  return matches;
}

function transposedMotifs(noteNames) {
  const p = noteNames.map(n => {
    assert(Object.hasOwn(pitch, n), 'Unknown source note: ' + n);
    return pitch[n];
  });
  const forward = [];
  for (let i = 0; i + 3 < p.length; i++) {
    const intervals = [0, 1, 2].map(k => (p[i + k + 1] - p[i + k] + 12) % 12);
    if (intervals.every((step, k) => step === signature[k])) forward.push(i);
  }
  return forward;
}

assert.deepEqual(transposedMotifs(canonical), [0], 'Canonical BACH positive');
assert.deepEqual(transposedMotifs(['D', 'C#', 'E', 'D#']), [0], 'Transposed BACH positive');
assert.deepEqual(transposedMotifs([...canonical].reverse()), [], 'Retrograde is a different direction');

let count = 0;
for (const [index, voice] of voices.entries()) {
  const literal = occurrences(voice, canonical);
  const transposed = transposedMotifs(voice);
  const retrograde = transposedMotifs([...voice].reverse());
  assert.equal(literal, 0);
  assert.deepEqual(transposed, []);
  assert.deepEqual(retrograde, []);
  count += voice.length;
  console.log(JSON.stringify({
    source_voice: index + 1,
    note_count: voice.length,
    four_note_windows: voice.length - 3,
    literal_BACH: literal,
    transposed_BACH: transposed.length,
    retrograde_transposed_BACH: retrograde.length,
  }));
}
assert.equal(count, 20);

// The preserved 2014 monospaced note alignment supplies a separate,
// fully predetermined time-order reading: left to right by text column,
// breaking simultaneous-event ties in printed top-to-bottom staff order.
const timed = lines.flatMap((s, voice) => {
  const score = s.slice(s.indexOf(':') + 1);
  return Array.from(score.matchAll(/\S+/g), m => ({
    voice, column: m.index, note: m[0],
  }));
});
timed.sort((a, b) => a.column - b.column || a.voice - b.voice);
assert.equal(timed.length, 20);
assert.equal(new Set(timed.map(e => e.column)).size, 13);
const timeOrdered = timed.map(e => e.note);
assert.deepEqual(transposedMotifs(timeOrdered), [], 'Source-aligned timeline BACH');
assert.deepEqual(transposedMotifs([...timeOrdered].reverse()), [], 'Source-aligned retrograde BACH');
console.log(JSON.stringify({
  source_order: 'printed-onset-column / upper-to-lower-staff',
  source_events: timed.length,
  unique_onset_columns: 13,
  adjacent_windows: timed.length - 3,
  transposed_BACH: transposedMotifs(timeOrdered).length,
  retrograde_transposed_BACH: transposedMotifs([...timeOrdered].reverse()).length,
}));
assert.equal(voices.flat().filter(n => n === 'Bb').length, 0);
console.log('PASS: original 20 notes across three voices; zero literal, transposed or retrograde BACH motifs. No LP2 key or plaintext.');
