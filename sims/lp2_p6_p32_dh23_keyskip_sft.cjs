#!/usr/bin/env node
'use strict';

// Source-constrained p6 -> p32 bridge and soft collision/key-skip test.
// This is an intermediate-result SFT, not a proposed LP2 decryption.
//
// Inputs are the repository's canonical corpus, original red-ink annotations,
// p50 table, and pinned English positive-control material. The key-skip
// decoder is independently implemented here; compare the existing source gate
// at sims/lp2_2014_onion2_keyskip_beam_sft.cjs and the external MIT reference:
// https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const mod = (n) => ((n % 29) + 29) % 29;
const SUPPRESSION = 0.8129;
const WIDTH = 400;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/lp2-transcription.txt');
const pages = transcription.split('%');
const GP = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function parseFragments(raw) {
  const fragments = [];
  let current = [];
  let start = null;
  let offset = 0;
  const flush = () => {
    if (current.length) {
      fragments.push({
        start,
        end: offset,
        indices: current.slice(),
        text: current.map((value) => GP[value]).join(''),
      });
    }
    current = [];
    start = null;
  };
  for (const char of raw) {
    if (runeIndex.has(char)) {
      if (start === null) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === '/' || /\\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  return fragments;
}

const p6Span = ink.pages.find((p) => p.page === 6).red_spans.find((s) => s.start === 71);
assert.ok(p6Span);
const p6Key = [...p6Span.runes].map((r) => runeIndex.get(r));
assert.equal(p6Key.length, 11);
const p6Page = corpus.pages.find((p) => p.page === 6).indices;
assert.deepEqual(p6Page.slice(71, 82), p6Key);

const p6Words = parseFragments(pages[6]).filter((f) => f.start >= 71 && f.end <= 82);
assert.deepEqual(p6Words.map((f) => f.indices.length), [4, 1, 4, 2]);
const p6WordSums = p6Words.map((f) => f.indices.reduce((a, b) => a + b, 0));
assert.deepEqual(p6WordSums, [71, 19, 65, 26]);

const p32Fragments = parseFragments(pages[32]);
assert.equal(p32Fragments.length, 22);
const fragment7 = p32Fragments[7];
assert.deepEqual(
  { start: fragment7.start, end: fragment7.end, text: fragment7.text },
  { start: 33, end: 44, text: 'HOMEXWDSLFD' }
);
assert.equal(fragment7.indices.length, 11);
const p32Blocks = [
  fragment7.indices.slice(0, 4),
  fragment7.indices.slice(4, 5),
  fragment7.indices.slice(5, 9),
  fragment7.indices.slice(9, 11),
];
const p32BlockSums = p32Blocks.map((block) => block.reduce((a, b) => a + b, 0));
assert.deepEqual(p32BlockSums, [48, 14, 65, 23]);
const blockDifference = p6WordSums.map((value, i) => value - p32BlockSums[i]);
assert.deepEqual(blockDifference, [23, 5, 0, 3]);

// Charge the exact 4|1|4|2 difference against every 11-rune word in p0-p55.
const all11 = [];
for (let page = 0; page <= 55; page += 1) {
  const fragments = parseFragments(pages[page]);
  for (let fragment = 0; fragment < fragments.length; fragment += 1) {
    const item = fragments[fragment];
    if (item.indices.length !== 11) continue;
    const blocks = [
      item.indices.slice(0, 4),
      item.indices.slice(4, 5),
      item.indices.slice(5, 9),
      item.indices.slice(9, 11),
    ];
    const sums = blocks.map((block) => block.reduce((a, b) => a + b, 0));
    const difference = p6WordSums.map((value, i) => value - sums[i]);
    all11.push({ page, fragment, text: item.text, sums, difference });
  }
}
assert.equal(all11.length, 28);
const exactBridge = all11.filter((row) => row.difference.every((x, i) => x === [23, 5, 0, 3][i]));
assert.deepEqual(exactBridge, [{
  page: 32,
  fragment: 7,
  text: 'HOMEXWDSLFD',
  sums: [48, 14, 65, 23],
  difference: [23, 5, 0, 3],
}]);

// The p28 DH23 tuple is a candidate, not an independently authenticated LP2 key.
const inverseCube = fragment7.indices.map((value) => {
  let out = 1;
  for (let i = 0; i < 19; i += 1) out = (out * value) % 29;
  return out;
});
const inverseCubeText = inverseCube.map((value) => GP[value]).join('');
assert.equal(inverseCubeText, 'THEHXITAEMAFAE');
assert.deepEqual(inverseCube.slice(0, 2), [2, 18]); // GP29 TH + E = THE

const p32 = corpus.pages.find((p) => p.page === 32).indices;
assert.equal(p32.length, 121);
const powMod = (x, e) => {
  let out = 1;
  for (let i = 0; i < e; i += 1) out = (out * x) % 29;
  return out;
};
const p32InverseCube = p32.map((value) => powMod(value, 19));
const ioc = (values) => {
  const counts = Array.from({ length: 29 }, (_, symbol) => values.filter((x) => x === symbol).length);
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
};
assert.ok(Math.abs(ioc(p32) - ioc(p32InverseCube)) < 1e-15);

// The ciphertext pair that becomes THE is not rare in the full unknown corpus.
let pairOccurrences = 0;
let pairOpportunities = 0;
for (let page = 0; page <= 55; page += 1) {
  const values = corpus.pages.find((p) => p.page === page).indices;
  pairOpportunities += Math.max(0, values.length - 1);
  for (let i = 0; i + 1 < values.length; i += 1) {
    if (values[i] === 8 && values[i + 1] === 3) pairOccurrences += 1;
  }
}
assert.equal(pairOccurrences, 15);

// The 11-cycle is a dominant p50 functional-graph basin, not a selective
// destination by itself.
function cycleOf(start) {
  const seen = new Map();
  const path = [];
  let state = start;
  while (!seen.has(state)) {
    seen.set(state, path.length);
    path.push(state);
    state = grid.bytes[state];
  }
  const cycle = path.slice(seen.get(state));
  return cycle.sort((a, b) => a - b).join(',');
}
const basin = new Map();
for (let start = 0; start < 256; start += 1) {
  const key = cycleOf(start);
  basin.set(key, (basin.get(key) || 0) + 1);
}
const basins = [...basin.entries()].map(([cycle, count]) => ({
  cycle: cycle.split(',').map(Number),
  count,
})).sort((a, b) => b.count - a.count);
assert.deepEqual(basins.map((x) => x.count), [252, 4]);

function stepsToTarget(start, target) {
  let state = start;
  for (let step = 0; step <= 256; step += 1) {
    if (state === target) return step;
    state = grid.bytes[state];
  }
  return null;
}
const step71 = stepsToTarget(71, 32);
const step65 = stepsToTarget(65, 32);
assert.deepEqual([step71, step65, step71 % 11, step65 % 11], [23, 12, 1, 1]);

// Reproduce the external soft key-skip proposal as a bounded source-key test.
// A skip is allowed only when the rejected key draw would have repeated the
// previous ciphertext rune. The beam searches the exact skip paths; English
// quadgrams are only a ranking instrument, not a language-independent proof.
const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of read('resources/control/dukotah_english_quadgrams.txt').trim().split(/\\r?\\n/u)) {
  const parts = line.trim().split(/\\s+/u);
  if (parts.length < 2) continue;
  const count = Number(parts[1]);
  quadgrams.set(parts[0], Math.log10(count));
  quadgramTotal += count;
}
const logTotal = Math.log10(quadgramTotal);
const floor = Math.log10(0.01) - logTotal;
for (const [gram, value] of quadgrams) quadgrams.set(gram, value - logTotal);

const GP_SORTED = GP.map((text, index) => ({ text, index }))
  .sort((a, b) => b.text.length - a.text.length);
function englishToGP(text) {
  const source = text.toUpperCase();
  const output = [];
  for (let i = 0; i < source.length;) {
    const hit = GP_SORTED.find((item) => source.startsWith(item.text, i));
    if (hit) {
      output.push(hit.index);
      i += hit.text.length;
      continue;
    }
    const alias = { V: 1, K: 5, Z: 15, Q: 5 }[source[i]];
    if (alias !== undefined) output.push(alias);
    i += 1;
  }
  return output;
}

function maxIdenticalRun(key) {
  let run = 1;
  let maximum = 1;
  for (let i = 1; i < 2 * key.length; i += 1) {
    if (key[i % key.length] === key[(i - 1) % key.length]) run += 1;
    else run = 1;
    if (run > maximum) maximum = run;
  }
  return maximum;
}
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function encipherSoft(plain, key, sign, seed = 3301) {
  const random = xorshift32(seed);
  const output = [];
  let keyIndex = 0;
  let previous = null;
  let totalSkips = 0;
  let maximumSkip = 0;
  for (const value of plain) {
    let skipped = 0;
    let cipher;
    while (true) {
      cipher = mod(value - sign * key[keyIndex % key.length]);
      if (previous !== null && cipher === previous && random() < SUPPRESSION) {
        keyIndex += 1;
        skipped += 1;
        continue;
      }
      break;
    }
    output.push(cipher);
    totalSkips += skipped;
    maximumSkip = Math.max(maximumSkip, skipped);
    keyIndex += 1;
    previous = cipher;
  }
  return {
    ciphertext: output,
    totalSkips,
    maximumSkip,
    doublets: output.slice(1).filter((value, i) => value === output[i]).length,
  };
}
function beamDecode(ciphertext, key, sign, maxSkip, width = WIDTH) {
  const keyStream = Array.from(
    { length: ciphertext.length * (maxSkip + 1) + 8 },
    (_, i) => key[i % key.length]
  );
  const firstRune = mod(ciphertext[0] + sign * keyStream[0]);
  const firstText = GP[firstRune];
  let beam = [{
    score: 0,
    keyIndex: 0,
    tail: firstText,
    charCount: firstText.length,
    previousCipher: ciphertext[0],
    path: [firstRune],
  }];
  for (let i = 1; i < ciphertext.length; i += 1) {
    const currentCipher = ciphertext[i];
    const candidates = [];
    for (const state of beam) {
      for (let skipped = 0; skipped <= maxSkip; skipped += 1) {
        const acceptedIndex = state.keyIndex + 1 + skipped;
        if (acceptedIndex >= keyStream.length) break;
        const plain = mod(currentCipher + sign * keyStream[acceptedIndex]);
        let valid = true;
        for (let j = state.keyIndex + 1; j < acceptedIndex; j += 1) {
          if (mod(plain - sign * keyStream[j]) !== state.previousCipher) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;
        let tail = state.tail;
        let charCount = state.charCount;
        let addedScore = 0;
        for (const char of GP[plain]) {
          tail += char;
          charCount += 1;
          if (charCount >= 4) addedScore += quadgrams.get(tail.slice(-4)) ?? floor;
          tail = tail.slice(-3);
        }
        candidates.push({
          score: state.score + addedScore,
          keyIndex: acceptedIndex,
          tail,
          charCount,
          previousCipher: currentCipher,
          path: [...state.path, plain],
        });
      }
    }
    if (candidates.length === 0) return { complete: false, failedAt: i };
    candidates.sort((a, b) => b.score - a.score);
    beam = candidates.slice(0, width);
  }
  const best = beam[0];
  return {
    complete: true,
    score: best.score / Math.max(1, best.charCount - 3),
    skips: best.keyIndex - (ciphertext.length - 1),
    endKeyOffset: best.keyIndex % key.length,
    indices: best.path,
    text: best.path.map((value) => GP[value]).join(''),
  };
}

const positivePlain = englishToGP(read('resources/control/gibran_prophet_58585.txt'))
  .slice(0, p32.length);
assert.equal(positivePlain.length, p32.length);
const maxSkip = maxIdenticalRun(p6Key);
assert.equal(maxSkip, 1);
const keyskipRows = [];
for (const phase of [0, 1]) {
  const key = p6Key.slice(phase).concat(p6Key.slice(0, phase));
  for (const sign of [-1, 1]) {
    const planted = encipherSoft(positivePlain, key, sign, 3301);
    assert.ok(planted.maximumSkip <= maxSkip);
    const control = beamDecode(planted.ciphertext, key, sign, maxSkip);
    const exact = control.complete &&
      control.indices.every((value, i) => value === positivePlain[i]);
    assert.ok(exact, 'soft key-skip positive control did not recover exactly');
    const actual = beamDecode(p32, key, sign, maxSkip);
    assert.ok(actual.complete);
    keyskipRows.push({
      phase,
      sign,
      control: {
        exact,
        skips: planted.totalSkips,
        maximumSkip: planted.maximumSkip,
        doublets: planted.doublets,
        score: control.score,
      },
      actual: {
        score: actual.score,
        skips: actual.skips,
        endKeyOffset: actual.endKeyOffset,
        preview: actual.text.slice(0, 80),
      },
    });
  }
}
const expectedScores = [-7.525913571708293, -7.289863022675748, -7.638420688092999, -7.544568829058773];
assert.deepEqual(
  keyskipRows.map((row) => row.actual.score).map((score) => Number(score.toFixed(12))),
  expectedScores.map((score) => Number(score.toFixed(12)))
);
assert.ok(keyskipRows.every((row) => row.actual.score < -7.2));

console.log(JSON.stringify({
  status: 'PASS',
  p6: {
    start: 71,
    redRunes: p6Key,
    transliteration: p6Key.map((value) => GP[value]).join(''),
    wordLengths: p6Words.map((f) => f.indices.length),
    wordSums: p6WordSums,
  },
  p32: {
    length: p32.length,
    fragment7: fragment7.text,
    fragmentStart: fragment7.start,
    fragmentEndExclusive: fragment7.end,
    partitionSums: p32BlockSums,
    blockDifference: { values: blockDifference, candidateDH23Fields: ['p', 'g', '0', 'e'] },
    exactBridgeCensus: { allElevenRuneWords: all11.length, exactMatches: exactBridge },
    inverseCube19: {
      text: inverseCubeText,
      firstTwoRunePlaintext: 'THE',
      ciphertextPair83Occurrences: pairOccurrences,
      withinPagePairOpportunities: pairOpportunities,
      uniformExpectedPairCount: pairOpportunities / 841,
      fullPageIoC: ioc(p32),
      inverseCubeIoC: ioc(p32InverseCube),
    },
  },
  p50: {
    steps71To32: step71,
    steps65To32: step65,
    phaseResidues: [step71 % 11, step65 % 11],
    cycleBasins: basins,
  },
  softKeyskip: {
    suppression: SUPPRESSION,
    beamWidth: WIDTH,
    keyPeriod: p6Key.length,
    maxSkip: maxSkip,
    positiveControlsExact: keyskipRows.every((row) => row.control.exact),
    rows: keyskipRows,
  },
  interpretation: 'Structural bridge only; no unknown plaintext or authenticated LP2 key recovered.',
}, null, 2));
