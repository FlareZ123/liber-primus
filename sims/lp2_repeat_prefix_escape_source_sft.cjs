'use strict';

/**
 * Frozen 29->28 prefix escape hypothesis: source-motivated signed BASE29
 * cycle + rare repeated original ciphertext pairs + LP p56 literal F.
 * Source/seed affects initial cipher state only. F uses a repeated current
 * glyph as escape prefix followed by the minimal GP successor (+1 mod29).
 * This is lossless for every native GP29 input with no secret side tape.
 * Its original necessary condition is independent of seed and text scorer.
 *
 * To run: node sims/lp2_repeat_prefix_escape_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const mod = v => (v % 29 + 29) % 29;

/** @param {number[]} plain @param {number} seed */
function encode(plain, seed) {
  let previous = seed;
  const out = [];
  for (const p of plain) {
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    if (p === 0) {
      out.push(previous);
      previous = mod(previous + 1);
      out.push(previous);
    } else {
      previous = mod(previous + p);
      out.push(previous);
    }
  }
  return out;
}

/** @param {number[]} cipher @param {number} seed */
function decode(cipher, seed) {
  let previous = seed, i = 0;
  const out = [];
  while (i < cipher.length) {
    const c = cipher[i++];
    if (c !== previous) {
      out.push(mod(c - previous));
      previous = c;
      continue;
    }
    const forcedNext = mod(previous + 1);
    assert.ok(i < cipher.length, 'unfinished repeated-glyph escape prefix');
    assert.equal(cipher[i], forcedNext,
      'the repeated escape must be followed by the +1 terminator');
    i++;
    out.push(0);
    previous = forcedNext;
  }
  return out;
}

const originalPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = originalPages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const events = [], counter = Array(29).fill(0);
let offset = 0;
for (const page of originalPages) {
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] !== page.indices[i-1]) continue;
    const at = offset+i;
    const delta = mod(original[at+1] - original[at]);
    events.push({page:page.page,offset:at,delta});
    counter[delta]++;
  }
  offset += page.indices.length;
}
assert.equal(events.length, 86);
assert.equal(counter[1], 2);
const invalid = events.filter(x => x.delta !== 1);
assert.equal(invalid.length, 84);
assert.equal(events[0].offset, 122);
assert.equal(events[0].delta, 11);

// Full lossless, native p57 clear GP-runic plant; includes native F.
const native = corpus.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);
assert.ok(native.includes(0));
const test = [...native, ...native, ...native];
for (const seed of [0, 3, 13, 28]) {
  const encoded = encode(test, seed);
  const recovered = decode(encoded, seed);
  assert.deepEqual(recovered, test);
  assert.equal(encoded.length, test.length + test.filter(p => p === 0).length);
  assert.deepEqual(encode(recovered, seed), encoded);
}
console.log(JSON.stringify({
  rule:'F=0 -> [previous,previous+1]; other GP index p -> [previous+p] mod29',
  source:{originalRunes:original.length,pages:originalPages.length,
    withinPageRepeatEvents:events.length,validForcedPlusOne:counter[1],
    impossibleEscapes:invalid.length,
    firstFailure:invalid[0],successorDeltaHistogram:counter},
  nativePlantedControl:{plaintextRunes:test.length,
    testedSeeds:[0,3,13,28], exactReencryption:true},
  verdict:'frozen prefix ESC/+1 transducer fails 84/86 required original successors',
  scope:'no separate hidden key, no word reset, original unknown plaintext not recovered'
}, null, 2));
