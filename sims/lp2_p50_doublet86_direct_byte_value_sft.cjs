'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap((page) => page.tokens);

assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

const bytes = tokens.map((token) => {
  const high = grid.alphabet.indexOf(token[0]);
  const low = grid.alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
});

const events = [];
let globalRune = 0;
for (const page of corpus.pages.slice(0, 56)) {
  for (let local = 0; local + 1 < page.indices.length; local += 1) {
    if (page.indices[local] !== page.indices[local + 1]) continue;
    const position = globalRune + local;
    const phase = position & 255;
    events.push({
      page: page.page,
      local,
      position,
      phase,
      cipher: page.indices[local],
      byte: bytes[phase],
    });
  }
  globalRune += page.indices.length;
}

assert.equal(globalRune, 12956);
assert.equal(events.length, 86);
assert.equal(events.filter((event) => event.byte < 60).length, 33);

/*
 * Frozen candidate:
 *   eventPlain = repeatedCipherRune - (aligned p50 byte mod 29) mod 29
 * Event order is untouched manuscript chronology. The p50 clock is the
 * established global phase-zero clock and the minus sign is inherited from
 * the solved-p56 additive convention used by the existing #1514 gate.
 */
const decoded = events.map((event) => mod29(event.cipher - mod29(event.byte)));
const reconstructed = decoded.map((plain, i) => mod29(plain + mod29(events[i].byte)));
assert.deepEqual(reconstructed, events.map((event) => event.cipher));

const clear = corpus.pages[57].indices.slice(0, events.length);
assert.equal(clear.length, events.length);
const plantedCipher = clear.map((plain, i) => mod29(plain + mod29(events[i].byte)));
const plantedRecovered = plantedCipher.map((cipher, i) => mod29(cipher - mod29(events[i].byte)));
assert.deepEqual(plantedRecovered, clear);

const translit = decoded.map((index) => corpus.translit[index]).join('');
const rawTranslit = events.map((event) => corpus.translit[event.cipher]).join('');
const plantTranslit = clear.map((index) => corpus.translit[index]).join('');

console.log(JSON.stringify({
  status: 'PASS',
  source: '86 untouched original within-page adjacent-equal events, chronological order, aligned to canonical p50 base60 bytes at global phase zero',
  operation: 'P_event = C_repeat - (B_phase mod 29) mod 29',
  events: events.length,
  low60Events: events.filter((event) => event.byte < 60).length,
  rawEventIoC: ioc(events.map((event) => event.cipher)),
  decodedIoC: ioc(decoded),
  clearP57ControlIoC: ioc(clear),
  rawEventTranslit: rawTranslit,
  decodedTranslit: translit,
  clearP57ControlTranslit: plantTranslit,
  exactReconstruction: reconstructed.every((value, i) => value === events[i].cipher),
  plantedRecovery: plantedRecovered.every((value, i) => value === clear[i]),
  decision: 'bounded direct event-value receiver only; no reordering, phase/sign/radix scan or second layer',
}, null, 2));
