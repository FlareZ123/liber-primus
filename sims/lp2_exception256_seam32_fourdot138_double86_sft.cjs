'use strict';

/**
 * Original LP2 32-seam / 138 four-dot / 86 duplicate-event exact-count gate.
 * Read-only SFT for Node.js 22 on Windows 11 or other platforms.
 * Input is the repository's unmodified original-derived canonical data.
 * The original-image punctuation morphology was adjudicated separately.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
/** @param {string} p */
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
}
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const punctuation = readJson('resources/liber-primus/lp2-punctuation-identity.json');
const grid = readJson('resources/liber-primus/base60-grid.json');
const transcription = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const alphabet = new Set(corpus.runes);
const ciphertext = corpus.pages.filter((p) => p.page >= 0 && p.page <= 55).flatMap((p) => p.indices);
assert.equal(ciphertext.length, 12956);
assert.equal(grid.byte_rows.length, 32);
for (const row of grid.byte_rows) assert.equal(row.length, 8);

/**
 * The 32 cross-page words are detected without choosing a cipher.
 * A printed '-' or '.' or structural boundary ends a word. Slash/newline
 * and '%' physical page break do not end a word by themselves.
 * @returns {{offset:number,fragmentLength:number}[]}
 */
function pageSeams() {
  /** @type {{offset:number,fragmentLength:number}[]} */
  const seams = [];
  let runeCount = 0;
  for (let i = 0; i < transcription.length; i += 1) {
    const c = transcription[i];
    if (alphabet.has(c)) runeCount += 1;
    if (c !== '%' || runeCount > ciphertext.length) continue;
    let before = '';
    for (let j = i - 1; j >= 0 && !alphabet.has(transcription[j]); j -= 1) before += transcription[j];
    let after = '';
    for (let j = i + 1; j < transcription.length && !alphabet.has(transcription[j]); j += 1) after += transcription[j];
    if (/[-.$&§]/u.test(before + after)) continue;
    let fragmentLength = 0;
    for (let j = i + 1; j < transcription.length; j += 1) {
      const next = transcription[j];
      if (alphabet.has(next)) fragmentLength += 1;
      else if ('-.$&§'.includes(next)) break;
    }
    seams.push({ offset: runeCount, fragmentLength });
  }
  return seams;
}

const seams = pageSeams();
assert.equal(seams.length, 32);
const expectedFragments = [5,2,2,2,6,2,5,1,2,5,1,2,3,2,1,2,4,1,2,2,3,1,2,2,1,7,3,4,1,1,5,1];
assert.deepEqual(seams.map((e) => e.fragmentLength), expectedFragments);
const selectedColumns = seams.map((e) => e.fragmentLength - 1);
const keyBytes = Buffer.from(grid.byte_rows.map((row, i) => row[selectedColumns[i]]));
assert.equal(keyBytes.toString('hex'), '61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671');
const remaining = Buffer.from(grid.byte_rows.flatMap((row, i) => row.filter((value, j) => j !== selectedColumns[i])));
assert.equal(remaining.length, 224);
assert.equal(crypto.createHash('sha256').update(remaining).digest('hex'), 'd6a93da932df4ffcf862269e0c32b8b88c376c512f481222b0e69e9a42002837');

// Strict original-image four-dot morphology: reject the four invented p15
// numeric-row periods and the original-image exceptions (ambiguous/absent/
// comma-form). This excludes the other 31 large chapter marks by type.
const audit = punctuation.source_audit;
const excluded = new Set([
  ...audit.audited_scope.excluded_editorial_stop_indices,
  ...audit.morphology.stop_four_dot_diamonds.count === 138
    ? audit.physical_placements.exceptions.map((e) => e.event_index)
    : [],
]);
assert.equal(excluded.size, 7);
const stops = punctuation.events
  .filter((e) => e.symbol === '⁘' && !excluded.has(e.index))
  .map((e) => ({ offset: e.rune_offset, kind: 'stop', type: 0 }));
assert.equal(stops.length, 138);
const repetitions = [];
for (let i = 1; i < ciphertext.length; i += 1) {
  if (ciphertext[i] === ciphertext[i - 1]) repetitions.push({ offset: i, kind: 'repeat', type: 1 });
}
assert.equal(repetitions.length, 86);
const events = [...stops, ...repetitions].sort((a, b) => a.offset - b.offset || a.type - b.type);
assert.equal(events.length, 224);
assert.equal(events.length + seams.length, 256);

let parityAgree = 0;
const lookup = new Map();
/** @type {number[]} */
const lookupConflicts = [];
for (let i = 0; i < events.length; i += 1) {
  const b = remaining[i];
  const type = events[i].type;
  if ((b & 1) === type) parityAgree += 1;
  if (lookup.has(b) && lookup.get(b) !== type) lookupConflicts.push(i);
  else lookup.set(b, type);
}
assert.equal(parityAgree, 115);
assert.equal(lookupConflicts.length, 42);
assert.equal(new Set(remaining).size, 147);

// Positive control: the identical event string is perfectly recoverable by
// a genuine two-type lookup/parity sender using byte 0 for stop and 1 for repeat.
const planted = Buffer.from(events.map((e) => e.type));
assert.equal(planted.reduce((n, x, i) => n + ((x & 1) === events[i].type ? 1 : 0), 0), 224);
assert.equal(new Set(planted).size, 2);

// A chronological, seam-local seven-events-per-row consumer would require
// seven events in each inter-seam interval. Test this without reordering.
const cut = [0, ...seams.map((e) => e.offset), ciphertext.length];
const countBetween = cut.slice(1).map((end, i) =>
  events.filter((e) => e.offset >= cut[i] && e.offset < end).length
);
assert.deepEqual(countBetween, [
  3,6,5,6,2,2,9,5,27,8,8,3,5,8,5,10,11,13,5,13,15,5,4,8,6,5,3,6,8,1,4,4,1
]);
assert.equal(countBetween.reduce((n, x) => n + x, 0), 224);
const odds = [...remaining].filter((b) => b & 1).length;
const expectedParityAgreements = ((224 - odds) * 138 + odds * 86) / 224;

console.log('Original GP runes:', ciphertext.length);
console.log('Original source event counts:', {
  fourDotDiamond: stops.length, adjacentRuneEqualities: repetitions.length,
  carriedWords: seams.length, combined: events.length + seams.length
});
console.log('Seam-selected key:', keyBytes.toString('hex'));
console.log('Remaining table SHA256:', crypto.createHash('sha256').update(remaining).digest('hex'));
console.log('224 original events / 224 remaining table bytes:', {
  observedParityAgreements: parityAgree,
  expectedParityAgreementsUnderShuffledAlignment: expectedParityAgreements,
  stationaryByteToEventTypeContradictions: lookupConflicts.length,
  uniqueRemainingBytes: new Set(remaining).size
});
console.log('Events per successive seam-delimited interval:', countBetween.join(','));
console.log('PASS: exact count is real; direct parity, any stationary byte lookup, and seven-per-row local receivers fail.');
