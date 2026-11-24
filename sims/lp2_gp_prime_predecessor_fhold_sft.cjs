'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const solved = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'
));
const transcription = fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8'
);
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;
const primes = corpus.prime;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(corpus.runes.length, 29);
assert.equal(primes.length, 29);

function runicIndices(text) {
  const glyphs = text.match(/\p{Script=Runic}/gu) || [];
  const values = glyphs.map((glyph) => runeIndex.get(glyph));
  assert.ok(values.every((value) => value !== undefined), 'unknown GP rune');
  return values;
}

const transcriptionPages = transcription.split(/\s*%\s*/);
assert.equal(transcriptionPages.length, 57);
const p54 = corpus.pages.find((page) => page.page === 54).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.deepEqual(runicIndices(transcriptionPages[53]), p54);
assert.deepEqual(runicIndices(transcriptionPages[54]), p55);
assert.deepEqual(p54.map((r) => corpus.translit[r]).slice(-1), ['Y']);
assert.deepEqual(p55.map((r) => corpus.translit[r]).slice(0, 1), ['NG']);

const native = solved.sections.map((section) => ({
  name: section.name,
  plain: runicIndices(section.source_text)
}));
assert.deepEqual(native.map((s) => [s.name, s.plain.length]), [
  ['0_warning', 184],
  ['0_welcome', 515],
  ['0_wisdom', 157],
  ['0_koan_1', 780],
  ['0_loss_of_divinity', 755],
  ['jpg107-167', 319],
  ['jpg229', 89],
  ['p56_an_end', 85],
  ['p57_parable', 95]
]);

function trainLanguageModel(excludedSection) {
  const unigram = Array(29).fill(0);
  const bigram = Array(29 * 29).fill(0);
  const trigram = Array(29 ** 3).fill(0);
  const bigramTotals = Array(29).fill(0);
  const trigramTotals = Array(29 * 29).fill(0);
  let total = 0;

  for (const section of native) {
    if (section.name === excludedSection) continue;
    const p = section.plain;
    for (let i = 0; i < p.length; i++) {
      unigram[p[i]]++;
      total++;
      if (i >= 1) {
        bigram[p[i - 1] * 29 + p[i]]++;
        bigramTotals[p[i - 1]]++;
      }
      if (i >= 2) {
        const prefix = p[i - 2] * 29 + p[i - 1];
        trigram[prefix * 29 + p[i]]++;
        trigramTotals[prefix]++;
      }
    }
  }

  const alpha = 0.15;
  const p1 = unigram.map((n) => (n + alpha) / (total + 29 * alpha));
  const p2 = Array(29 * 29);
  const p3 = Array(29 ** 3);
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      p2[a * 29 + b] =
        (bigram[a * 29 + b] + 4 * p1[b]) / (bigramTotals[a] + 4);
    }
  }
  for (let ab = 0; ab < 29 * 29; ab++) {
    for (let c = 0; c < 29; c++) {
      p3[ab * 29 + c] =
        (trigram[ab * 29 + c] + 5 * p2[(ab % 29) * 29 + c]) /
        (trigramTotals[ab] + 5);
    }
  }
  return {
    uni: p1.map(Math.log),
    bi: p2.map(Math.log),
    tri: p3.map(Math.log)
  };
}

const logAdd = (a, b) => {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  const hi = Math.max(a, b);
  return hi + Math.log1p(Math.exp(-Math.abs(a - b)));
};

function symbolScore(lm, older, newer, p) {
  if (newer < 0) return lm.uni[p];
  if (older < 0) return lm.bi[newer * 29 + p];
  return lm.tri[(older * 29 + newer) * 29 + p];
}

function stepScored(map, cipher, lm) {
  const next = new Map();
  function add(source, keyState, older, newer, p, weight) {
    const id = keyState * 900 + (older + 1) * 30 + (newer + 1);
    const z = source.z + weight;
    const best = source.best + weight;
    const found = next.get(id);
    if (!found) {
      next.set(id, {
        keyState, older, newer, z, best,
        node: { prev: source.node, p }
      });
    } else {
      found.z = logAdd(found.z, z);
      if (best > found.best) {
        found.best = best;
        found.node = { prev: source.node, p };
      }
    }
  }

  for (const state of map.values()) {
    if (cipher === 0) {
      add(
        state, state.keyState, state.newer, 0, 0,
        symbolScore(lm, state.older, state.newer, 0)
      );
    }
    const p = mod(cipher - primes[state.keyState] + 1);
    if (p !== 0) {
      add(
        state, p, state.newer, p, p,
        symbolScore(lm, state.older, state.newer, p)
      );
    }
  }
  return next;
}

function runPrefix(cipher, initialState, lm) {
  let states = new Map([[
    initialState * 900,
    {
      keyState: initialState, older: -1, newer: -1,
      z: 0, best: 0, node: null
    }
  ]]);
  for (const c of cipher) {
    states = stepScored(states, c, lm);
    if (!states.size) break;
  }
  const z = [...states.values()].reduce((sum, state) => logAdd(sum, state.z), -Infinity);
  const best = states.size
    ? Math.max(...[...states.values()].map((state) => state.best))
    : -Infinity;
  return { map: states, z, best, states: states.size };
}

function nodePath(node) {
  const out = [];
  while (node) {
    out.push(node.p);
    node = node.prev;
  }
  return out.reverse();
}

function continueFromPrefix(prefix, suffix, lm) {
  let states = prefix.map;
  for (const c of suffix) {
    states = stepScored(states, c, lm);
    if (!states.size) return { legal: false };
  }
  let best = null;
  for (const state of states.values()) {
    if (!best || state.best > best.best) best = state;
  }
  return {
    legal: true,
    plain: nodePath(best.node),
    score: best.best,
    finalStates: states.size
  };
}

function encipher(plain, initialState) {
  let previous = initialState;
  const cipher = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      continue;
    }
    cipher.push(mod(p + primes[previous] - 1));
    previous = p;
  }
  return cipher;
}

function matches(a, b, start, end) {
  let count = 0;
  for (let i = start; i < end; i++) if (a[i] === b[i]) count++;
  return count;
}

const shiftClasses = new Map();
for (let state = 0; state < 29; state++) {
  const shift = mod(primes[state] - 1);
  if (!shiftClasses.has(shift)) shiftClasses.set(shift, []);
  shiftClasses.get(shift).push(state);
}
assert.equal(shiftClasses.size, 24);

const controlSpecs = [
  ['0_welcome', 11],
  ['0_koan_1', 18],
  ['0_loss_of_divinity', 24],
  ['jpg107-167', 3],
  ['0_warning', 7],
  ['0_wisdom', 22],
  ['jpg229', 26]
];

const controls = [];
for (const [name, initialState] of controlSpecs) {
  const target = native.find((section) => section.name === name);
  assert.ok(target);
  const plain = target.plain;
  const cipher = encipher(plain, initialState);
  const split = Math.floor(plain.length * 0.75);
  const lm = trainLanguageModel(name);
  const ranked = [];

  for (const [shift, members] of shiftClasses) {
    const result = runPrefix(cipher.slice(0, split), members[0], lm);
    ranked.push({
      shift, members, representative: members[0],
      z: result.z, best: result.best, map: result.map
    });
  }
  ranked.sort((a, b) => b.z - a.z);

  const trueShift = mod(primes[initialState] - 1);
  const trueClass = ranked.find((candidate) => candidate.shift === trueShift);
  const wrongClass = ranked.find((candidate) => candidate.shift !== trueShift);
  const top = ranked[0];
  assert.equal(shiftClasses.get(trueShift).length, 1);
  assert.ok(top.z > wrongClass.z);

  const topFull = continueFromPrefix(top, cipher.slice(split), lm);
  const trueFull = continueFromPrefix(trueClass, cipher.slice(split), lm);
  const wrongFull = continueFromPrefix(wrongClass, cipher.slice(split), lm);
  assert.ok(topFull.legal && trueFull.legal && wrongFull.legal);
  assert.deepEqual(encipher(topFull.plain, top.representative), cipher);
  assert.deepEqual(encipher(trueFull.plain, trueClass.representative), cipher);
  assert.deepEqual(encipher(wrongFull.plain, wrongClass.representative), cipher);

  controls.push({
    section: name,
    runes: plain.length,
    fitRunes: split,
    initialState,
    effectiveShift: trueShift,
    trueShiftRank: ranked.findIndex((candidate) => candidate.shift === trueShift) + 1,
    topVsBestWrongNats: +(top.z - wrongClass.z).toFixed(9),
    heldoutMatches: matches(topFull.plain, plain, split, plain.length),
    heldoutRunes: plain.length - split,
    fullMatches: matches(topFull.plain, plain, 0, plain.length),
    bestWrongStateHeldoutMatches: matches(wrongFull.plain, plain, split, plain.length),
    bestWrongStateFullMatches: matches(wrongFull.plain, plain, 0, plain.length)
  });
}

assert.ok(controls.every((control) => control.trueShiftRank === 1));
const exactHeldouts = controls.filter(
  (control) => control.heldoutMatches === control.heldoutRunes
).length;
assert.equal(exactHeldouts, 6);
const welcome = controls.find((control) => control.section === '0_welcome');
assert.equal(welcome.heldoutMatches, 128);
assert.equal(welcome.heldoutRunes, 129);

function exactReachability(cipher, initialState) {
  let states = new Set([initialState]);
  let maxStates = 1;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    const next = new Set();
    for (const previous of states) {
      if (c === 0) next.add(previous);
      const p = mod(c - primes[previous] + 1);
      if (p !== 0) next.add(p);
    }
    if (!next.size) {
      return {
        failure: {
          offset: i,
          cipherIndex: c,
          statesBefore: [...states]
        },
        maxStates
      };
    }
    states = next;
    maxStates = Math.max(maxStates, states.size);
  }
  return { failure: null, maxStates, finalStates: [...states] };
}

const zeroPositions = p54
  .map((value, index) => value === 0 ? index : -1)
  .filter((index) => index >= 0);
assert.deepEqual(zeroPositions, [41, 65, 195]);

const expectedFailureOffsets = [
  46, 13, 75, 8, 75, 26, 13, 3, 5, 26,
  46, 26, 26, 75, 26, 26, 75, 13, 75, 26,
  46, 75, 0, 46, 63, 75, 24, 63, 63
];

const failures = [];
const failureGroups = new Map();
let maxReachableStates = 0;
for (let initialState = 0; initialState < 29; initialState++) {
  const result = exactReachability(p54, initialState);
  assert.ok(result.failure, 'an initial state unexpectedly survives p54');
  assert.equal(result.failure.offset, expectedFailureOffsets[initialState]);
  assert.equal(result.failure.statesBefore.length, 1);
  maxReachableStates = Math.max(maxReachableStates, result.maxStates);

  const failure = result.failure;
  const previousState = failure.statesBefore[0];
  const cipherSymbol = corpus.translit[failure.cipherIndex];
  const groupKey = failure.offset;
  if (!failureGroups.has(groupKey)) {
    failureGroups.set(groupKey, {
      offset: failure.offset,
      ciphertextIndex: failure.cipherIndex,
      ciphertextRune: cipherSymbol,
      previousState,
      previousStatePrime: primes[previousState],
      initialStates: []
    });
  }
  failureGroups.get(groupKey).initialStates.push(initialState);
  failures.push({
    initialState,
    failureOffset: failure.offset,
    ciphertextIndex: failure.cipherIndex,
    previousState
  });
}
assert.equal(failures.length, 29);
assert.equal(maxReachableStates, 2);

let bruteForceCandidates = 0;
let bruteForceValid = 0;
for (let initialState = 0; initialState < 29; initialState++) {
  for (let mask = 0; mask < (1 << zeroPositions.length); mask++) {
    bruteForceCandidates++;
    let previous = initialState;
    let zeroOrdinal = 0;
    let valid = true;
    for (let i = 0; i < p54.length; i++) {
      const c = p54[i];
      let hold = false;
      if (c === 0) {
        hold = (mask & (1 << zeroOrdinal)) !== 0;
        zeroOrdinal++;
      }
      if (hold) continue;
      const p = mod(c - primes[previous] + 1);
      if (p === 0) {
        valid = false;
        break;
      }
      previous = p;
    }
    if (valid) bruteForceValid++;
  }
}
assert.equal(bruteForceCandidates, 232);
assert.equal(bruteForceValid, 0);

const groupedFailures = [...failureGroups.values()]
  .sort((a, b) => a.offset - b.offset)
  .map((group) => ({
    ...group,
    initialStates: group.initialStates.sort((a, b) => a - b)
  }));

console.log(JSON.stringify({
  model: 'C_i = P_i + prime[P_previous_consuming] - 1 (mod 29); literal plaintext F holds without state advance',
  inputs: {
    corpusGitBlob: '054f2a0f780b7d46901acbe3d9bf4f0ac1801165',
    transcriptionGitBlob: '43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7',
    nativeTextGitBlob: '1b064ef6d85819b7d96adaff31a82d1ec551598f'
  },
  controlCalibration: {
    languageModel: 'target-excluded GP29 rune trigram',
    smoothing: { unigram: 0.15, bigramPrior: 4, trigramPrior: 5 },
    fitFraction: 0.75,
    initialStateClasses: shiftClasses.size,
    controls,
    effectiveInitialShiftRecovered: controls.filter((c) => c.trueShiftRank === 1).length,
    exactHeldoutControls: exactHeldouts,
    caveat: 'Wrong initial-shift classes often converge and predict the same suffix; the suffix is not an independent initial-state identifier.'
  },
  original: {
    physicalPages: { p54Runes: p54.length, p55Runes: p55.length },
    p54CiphertextZeroOffsets: zeroPositions,
    initialStatesTested: 29,
    initialStatesWithAnyLegalFullP54Path: 0,
    maximumReachableStateCount: maxReachableStates,
    latestFirstFailureOffset: Math.max(...failures.map((x) => x.failureOffset)),
    allInitialStatesFailByRune: Math.max(...failures.map((x) => x.failureOffset)) + 1,
    firstFailureGroups: groupedFailures,
    independentZeroMaskCandidates: bruteForceCandidates,
    independentZeroMaskValid: bruteForceValid,
    p55PredictionAttempted: false,
    reasonNoP55Prediction: 'No legal p54 prefix state survives.'
  },
  anyUnknownPlaintextRecovered: false
}, null, 2));
