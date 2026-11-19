#!/usr/bin/env node
"use strict";

// Bounded source-selected test for a common p0 AND/THEIR key scheduler.
// Inputs are the repository's canonical transcription, GP0 corpus, p50 grid,
// and authenticated 2016 signed cleartext. The p28 DH tuple is sourced from
// im-results/lp2-p28-dh-line6-source-reconstruction.md.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");

const MOD = 29;
const mod = (n) => ((n % MOD) + MOD) % MOD;
const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const H = (x, y) => [mod(x - y), mod(x + y)];
const decrypt = (cipher, key, sign) => cipher.map((v, i) => mod(v + sign * key[i]));
const forward = (plain, key, sign) => plain.map((v, i) => mod(v - sign * key[i]));
const translit = (values) => values.map((v) => corpus.translit[v]).join("");

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const page0Text = transcription.split(/\n%\s*\n/, 1)[0];
const page0Words = [];
let current = [];
let currentStart = 0;
let runePosition = 0;
for (const ch of page0Text) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (current.length === 0) currentStart = runePosition;
    current.push(value);
    runePosition += 1;
  } else if (current.length) {
    page0Words.push({ start: currentStart, length: current.length, values: current.slice() });
    current = [];
  }
}
if (current.length) page0Words.push({ start: currentStart, length: current.length, values: current.slice() });
assert.equal(runePosition, corpus.pages[0].runic_count);
assert.equal(runePosition, 262);
const byStart = new Map(page0Words.map((w) => [w.start, w]));
const wordAt = (start) => {
  const word = byStart.get(start);
  assert.ok(word, "no p0 word starts at " + start);
  return word;
};

const gpTokens = corpus.translit
  .map((text, value) => ({ text, value }))
  .sort((a, b) => b.text.length - a.text.length);
function gp0(word) {
  let offset = 0;
  let sum = 0;
  const upper = word.toUpperCase();
  while (offset < upper.length) {
    const token = gpTokens.find((entry) => upper.startsWith(entry.text, offset));
    assert.ok(token, "unmapped GP token in " + word + " at " + offset);
    sum += token.value;
    offset += token.text.length;
  }
  return sum;
}
function gpValues(word) {
  const values = [];
  let offset = 0;
  const upper = word.toUpperCase();
  while (offset < upper.length) {
    const token = gpTokens.find((entry) => upper.startsWith(entry.text, offset));
    assert.ok(token, "unmapped GP token in " + word + " at " + offset);
    values.push(token.value);
    offset += token.text.length;
  }
  return values;
}

const sourceBody = signed
  .split("-----BEGIN PGP SIGNED MESSAGE-----")[1]
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^\s*Hash:\s*SHA1\s*/i, "");
const sourceWords = (sourceBody.match(/[A-Za-z0-9]+/g) || []).map((w) => w.toUpperCase());
const hasSequence = (sequence) => {
  const needle = sequence.split(" ");
  return sourceWords.some((_, i) => needle.every((w, j) => sourceWords[i + j] === w));
};
assert.ok(hasSequence("ROAD AND THEIR NUMBERS"));
assert.ok(hasSequence("SEEK AND YOU WILL BE FOUND"));

const alphabet = grid.alphabet;
const p50 = grid.pages.flatMap((page) => page.tokens);
assert.equal(p50.length, 256);
const digit60 = (ch) => {
  const i = alphabet.indexOf(ch);
  assert.ok(i >= 0, "bad base-60 digit " + ch);
  return i;
};
const base60 = (token) => digit60(token[0]) * 60 + digit60(token[1]);
const base59 = (token) => digit60(token[0]) * 59 + digit60(token[1]);

// Freeze the additional receiver from source-only inputs before dereferencing
// its p0 rune values: AND -> GP0 56 -> original p50 cell 4E -> p0 offset 254.
const selector = {
  sourceWord: "AND",
  gp0: gp0("AND"),
  token: p50[gp0("AND")],
  p0Start: base60(p50[gp0("AND")]),
  expectedTarget: gpValues("AND"),
};
assert.equal(selector.gp0, 56);
assert.equal(selector.token, "4E");
assert.equal(selector.p0Start, 254);
assert.equal(selector.expectedTarget.length, 3);
const holdoutStart = selector.p0Start;
const holdoutTarget = selector.expectedTarget;

// Independent NUMBERS selector: its two live radix readings address the
// adjacent AND/THEIR starts; no p0 receiver values were used to obtain them.
const numbersIndex = gp0("NUMBERS");
const theirIndex = gp0("THEIR");
assert.equal(numbersIndex, 83);
assert.equal(p50[numbersIndex], "3D");
assert.equal(base59(p50[numbersIndex]) - 1, 189);
assert.equal(base60(p50[numbersIndex]) - 1, 192);
assert.equal(p50[theirIndex], "3H");
assert.equal(digit60(p50[theirIndex][1]), 17);
assert.equal(wordAt(189).length, 3);
assert.equal(wordAt(192).length, 4);
assert.deepEqual(gpValues("AND"), [24, 9, 23]);
assert.deepEqual(gpValues("THEIR"), [2, 18, 10, 4]);

// p28 source-derived DH state.
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3 };
const pool = [state.g, state.a, state.b, state.A, state.B, state.K, state.e];
const hPE = H(state.p, state.e);
assert.deepEqual(hPE, [20, 26]);

// The already proposed ROAD/NUMBERS local keys.
const andKey = [state.g, hPE[1], state.b];                 // [5,26,15]
const theirKey = [H(state.p, state.a)[0], state.p, mod(state.K * state.g), state.g];
// [17,23,10,5]
assert.deepEqual(andKey, [5, 26, 15]);
assert.deepEqual(theirKey, [17, 23, 10, 5]);

// Verify the 84-member AND family on the original NUMBERS-selected receiver.
const andReceiver = wordAt(189).values;
const andFamilyHits = [];
for (const x of pool) {
  for (const y of pool) {
    if (x === y) continue;
    for (const middle of hPE) {
      const key = [x, middle, y];
      if (equal(decrypt(andReceiver, key, -1), gpValues("AND"))) {
        andFamilyHits.push(key);
      }
    }
  }
}
assert.equal(andFamilyHits.length, 1);
assert.deepEqual(andFamilyHits[0], andKey);
assert.deepEqual(decrypt(andReceiver, andKey, -1), gpValues("AND"));
assert.deepEqual(forward(gpValues("AND"), andKey, -1), andReceiver);

// Verify the 98-member THEIR family and its PATHS discriminator.
const theirReceiver = wordAt(192).values;
const theirFamilyHits = [];
for (const x of pool) {
  for (const y of pool) {
    for (const coordinate of H(state.p, x)) {
      const key = [coordinate, state.p, mod(state.K * y), y];
      if (equal(decrypt(theirReceiver, key, -1), gpValues("THEIR"))) {
        theirFamilyHits.push({ x, y, key });
      }
    }
  }
}
assert.equal(theirFamilyHits.length, 1);
assert.deepEqual(theirFamilyHits[0].key, theirKey);
assert.deepEqual(decrypt(theirReceiver, theirKey, -1), gpValues("THEIR"));
assert.deepEqual(forward(gpValues("THEIR"), theirKey, -1), theirReceiver);

const pathsPlain = gpValues("PATHS");
const pathsKey = theirReceiver.map((v, i) => mod(v - pathsPlain[i]));
assert.deepEqual(pathsKey, [6, 17, 18, 23]);
assert.deepEqual(decrypt(theirReceiver, pathsKey, -1), pathsPlain);
assert.deepEqual(forward(pathsPlain, pathsKey, -1), theirReceiver);
// The fixed THEIR family requires key[1] = p = 23; the PATHS residual has 17.
assert.notEqual(pathsKey[1], state.p);

// Now open the frozen independent p0 receiver at 254.
const holdout = wordAt(holdoutStart);
assert.equal(holdout.length, 3);
const commonKeyMinus = decrypt(holdout.values, andKey, -1);
const commonKeyPlus = decrypt(holdout.values, andKey, +1);
assert.ok(!equal(commonKeyMinus, holdoutTarget));
assert.ok(!equal(commonKeyPlus, holdoutTarget));

// The same 84-member [x,H(p,e)[j],y] family, with either sign, has no hit.
const holdoutAndFamilyHits = [];
for (const x of pool) {
  for (const y of pool) {
    if (x === y) continue;
    for (const middle of hPE) {
      const key = [x, middle, y];
      for (const sign of [-1, +1]) {
        if (equal(decrypt(holdout.values, key, sign), holdoutTarget)) {
          holdoutAndFamilyHits.push({ key, sign });
        }
      }
    }
  }
}
assert.equal(holdoutAndFamilyHits.length, 0);

// The distinct READ OUT tail family [x,x,y] has one hit, with the opposite sign.
const readoutTailHits = [];
for (const x of pool) {
  for (const y of pool) {
    const key = [x, x, y];
    for (const sign of [-1, +1]) {
      if (equal(decrypt(holdout.values, key, sign), holdoutTarget)) {
        readoutTailHits.push({ key, sign });
      }
    }
  }
}
assert.equal(readoutTailHits.length, 1);
assert.deepEqual(readoutTailHits[0], { key: [5, 5, 2], sign: +1 });
assert.deepEqual(decrypt(holdout.values, [5, 5, 2], +1), holdoutTarget);
assert.deepEqual(forward(holdoutTarget, [5, 5, 2], +1), holdout.values);

const result = {
  source_selectors: {
    numbers: { gp0: numbersIndex, token: p50[numbersIndex], starts: [189, 192] },
    their: { gp0: theirIndex, token: p50[theirIndex], keyFirstCoordinate: 17 },
    and: selector,
    authenticated_sequences: ["ROAD AND THEIR NUMBERS", "SEEK AND YOU WILL BE FOUND"],
  },
  receivers: {
    and_numbers: { start: 189, cipher: andReceiver, length: 3 },
    their_numbers: { start: 192, cipher: theirReceiver, length: 4 },
    and_second_occurrence: { start: holdout.start, cipher: holdout.values, length: holdout.length },
  },
  state,
  keys: {
    and_road_numbers_subtract: andKey,
    their_target_aware_subtract: theirKey,
    paths_alternative_subtract: pathsKey,
    and_readout_tail_add: [5, 5, 2],
  },
  family_tests: {
    and_84_member_family_on_numbers_receiver: andFamilyHits,
    their_98_member_family_on_numbers_receiver: theirFamilyHits,
    and_84_member_family_on_second_and_receiver_both_signs: holdoutAndFamilyHits,
    readout_tail_98_signed_candidates_on_second_and_receiver: readoutTailHits,
  },
  frozen_holdout: {
    target: translit(holdoutTarget),
    road_numbers_key_minus: translit(commonKeyMinus),
    road_numbers_key_plus: translit(commonKeyPlus),
    actual_local_inverse: translit(decrypt(holdout.values, [5, 5, 2], +1)),
    forward_reconstruction: forward(holdoutTarget, [5, 5, 2], +1),
  },
};
console.log(JSON.stringify(result, null, 2));
