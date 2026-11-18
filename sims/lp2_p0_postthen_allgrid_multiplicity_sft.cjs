"use strict";

/**
 * SFT: all-grid multiplicity audit for the post-THEN edge/totient candidate.
 *
 * The tested Block18/Block19 transforms are copied semantically from
 * lp2_p0_postthen_edge_totient_sft.cjs. This file does not alter the original
 * 27x27 source grid or fit any new transform to plaintext.
 *
 * Run:
 *   node sims/lp2_p0_postthen_allgrid_multiplicity_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = corpus.pages.filter(page => page.page <= 2)
  .flatMap(page => page.indices);
assert.equal(grid.length, 729);

const T = corpus.translit;
const mod29 = x => (x % 29 + 29) % 29;
const inBounds = q => q[0] >= 1 && q[0] <= 27 && q[1] >= 1 && q[1] <= 27;
const axes = [[1, 0], [0, 1], [1, 1], [1, -1]];

function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let value = n, remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    while (remaining % p === 0) remaining /= p;
    value -= value / p;
  }
  if (remaining > 1) value -= value / remaining;
  return value;
}

function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let remaining = n, sign = 1;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p !== 0) continue;
    remaining /= p;
    sign = -sign;
    if (remaining % p === 0) return 0;
    while (remaining % p === 0) remaining /= p;
  }
  return remaining > 1 ? -sign : sign;
}

function phiIterate(n, count) {
  for (let i = 0; i < count; i++) n = phi(n);
  return n;
}

function deriveKey(raw) {
  const derived = [raw[0], phi(raw[1]), raw[2]];
  const rotation = mod29(derived.reduce((sum, value) =>
    sum + mu(phi(value)), 0)) % 3;
  return derived.slice(rotation).concat(derived.slice(0, rotation));
}

function decrypt(cells, key, at) {
  return cells.map((q, i) => mod29(at(q) - key[i % 3]));
}

const frames = [
  ["I", (r, c) => [r, c]],
  ["R90", (r, c) => [c, 28 - r]],
  ["R180", (r, c) => [28 - r, 28 - c]],
  ["R270", (r, c) => [28 - c, r]],
  ["M", (r, c) => [r, 28 - c]],
  ["MR90", (r, c) => [28 - c, 28 - r]],
  ["MR180", (r, c) => [28 - r, c]],
  ["MR270", (r, c) => [c, r]],
];

function makeAt(transform) {
  return q => {
    const z = transform(q[0], q[1]);
    return grid[(z[0] - 1) * 27 + z[1] - 1];
  };
}

/**
 * Freeze the existing Block18 family. The prior state is expressed in a
 * local frame where the ciphertext exits through the right edge.
 */
function block18(at, priorCenter, endpoint) {
  const candidates = [];
  for (let outerDepth = 1; outerDepth <= 5; outerDepth++) {
    for (let innerDepth = 1; innerDepth <= 5; innerDepth++) {
      const outerScale = phiIterate(priorCenter[1], outerDepth);
      const innerScale = phiIterate(at(priorCenter), innerDepth);
      if (outerScale % 2 || innerScale % 2 || innerScale < 2) continue;

      for (const shape of ["rowHalf_colFull", "rowFull_colHalf"]) {
        for (const rowSign of [-1, 1]) {
          for (const colSign of [-1, 1]) {
            const center = shape === "rowHalf_colFull"
              ? [endpoint[0] + rowSign * outerScale / 2,
                endpoint[1] + colSign * outerScale]
              : [endpoint[0] + rowSign * outerScale,
                endpoint[1] + colSign * outerScale / 2];
            const start = shape === "rowHalf_colFull"
              ? [endpoint[0] + rowSign * innerScale / 2,
                endpoint[1] + colSign * innerScale]
              : [endpoint[0] + rowSign * innerScale,
                endpoint[1] + colSign * innerScale / 2];
            if (!inBounds(center) || !inBounds(start)) continue;

            const radius = innerScale / 2;
            for (const axis of axes) {
              const p1 = [center[0] - axis[0] * radius,
                center[1] - axis[1] * radius];
              const p2 = [center[0] + axis[0] * radius,
                center[1] + axis[1] * radius];
              if (!inBounds(p1) || !inBounds(p2)) continue;
              const raw = [at(p1), at(center), at(p2)];
              candidates.push({
                outerDepth, innerDepth, outerScale, innerScale, shape,
                rowSign, colSign, center, start, radius, axis, raw,
                equalOuter: raw[0] === raw[2] && raw[1] !== 0,
              });
            }
          }
        }
      }
    }
  }

  const mirrors = candidates.filter(x => x.equalOuter);
  if (mirrors.length !== 1) return {candidates, mirrors};

  const selected = mirrors[0];
  const cells = [];
  let q = selected.start.slice();
  const length = phi(selected.innerScale);
  for (let i = 0; i < length; i++) {
    if (!inBounds(q)) return {candidates, mirrors, selected, executable: false};
    cells.push(q.slice());
    q = [q[0] + selected.rowSign, q[1] + selected.colSign];
  }
  const key = deriveKey(selected.raw);
  const plain = decrypt(cells, key, at);
  return {candidates, mirrors, selected, executable: true, cells, key, plain};
}

/**
 * Freeze the existing Block19 family and its ciphertext placement rule.
 */
function block19(at, prior) {
  const {selected, cells} = prior;
  const rowShift = phi(selected.center[0]);
  const cipherShift = phi(selected.center[1]);
  const unit = phi(phi(selected.radius));
  const candidates = [];

  for (const rowSign of [-1, 1]) {
    for (const colSign of [-1, 1]) {
      const center = [
        selected.center[0] + rowSign * rowShift,
        selected.center[1] + colSign * unit,
      ];
      if (!inBounds(center)) continue;
      for (const axis of axes) {
        const p1 = [center[0] - axis[0] * unit,
          center[1] - axis[1] * unit];
        const p2 = [center[0] + axis[0] * unit,
          center[1] + axis[1] * unit];
        if (!inBounds(p1) || !inBounds(p2)) continue;
        const raw = [at(p1), at(center), at(p2)];
        candidates.push({
          center, axis, raw,
          equalOuter: raw[0] === raw[2] && raw[1] !== 0,
        });
      }
    }
  }

  const mirrors = candidates.filter(x => x.equalOuter);
  const endpoint = cells.at(-1);
  const starts = [-1, 1]
    .map(colSign => [endpoint[0], endpoint[1] + colSign * cipherShift])
    .filter(inBounds);
  if (mirrors.length !== 1 || starts.length !== 1) {
    return {candidates, mirrors, starts, executable: false};
  }

  const selected19 = mirrors[0];
  const start = starts[0];
  const rowDirection = Math.sign(selected19.center[0] - start[0]);
  if (!rowDirection) {
    return {candidates, mirrors, starts, selected: selected19, executable: false};
  }

  const cells19 = [];
  let q = start.slice();
  for (let i = 0; i < selected.radius; i++) {
    if (!inBounds(q)) {
      return {candidates, mirrors, starts, selected: selected19,
        executable: false};
    }
    cells19.push(q.slice());
    q = [q[0] + rowDirection, q[1]];
  }
  const key = deriveKey(selected19.raw);
  const plain = decrypt(cells19, key, at);
  return {candidates, mirrors, starts, selected: selected19,
    executable: true, cells: cells19, key, plain};
}

const encoded = seq => seq.map(v => String.fromCharCode(v + 65)).join("");
const gpTokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
const tokenIndex = new Map(corpus.translit.map((token, i) => [token, i]));

function nativeWord(word) {
  const value = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let pos = 0; pos < value.length;) {
    const token = gpTokens.find(x => value.startsWith(x, pos));
    if (!token) return null;
    result.push(tokenIndex.get(token));
    pos += token.length;
  }
  return result;
}

/*
 * Reuse the preexisting block39 language control: Shakespeare + Gibran,
 * frequency >= 5, allowing one-rune words only for A and I.
 */
const dictionary = new Map();
for (const word of [
  read("resources/control/shakespeare_first300k.txt"),
  read("resources/control/gibran_prophet_58585.txt"),
].flatMap(text => text.match(/[A-Za-z]+/g) || [])) {
  const runes = nativeWord(word);
  if (!runes) continue;
  const key = encoded(runes);
  const old = dictionary.get(key);
  dictionary.set(key, {
    word: old?.word || word.toUpperCase(),
    freq: (old?.freq || 0) + 1,
    len: runes.length,
  });
}
assert.equal(dictionary.size, 6834);
const lexicon = new Map([...dictionary].filter(([key, item]) =>
  item.freq >= 5 &&
  (item.len >= 2 || key === encoded([24]) || key === encoded([10]))));
assert.equal(lexicon.size, 1465);

function wordFor(seq) {
  return lexicon.get(encoded(seq))?.word || null;
}

function evaluateState(at, priorCenter, endpoint) {
  const b18 = block18(at, priorCenter, endpoint);
  if (b18.mirrors.length !== 1 || !b18.executable) return {b18};
  const b19 = block19(at, b18);
  const w18 = wordFor(b18.plain);
  const w19 = b19.executable ? wordFor(b19.plain) : null;
  return {b18, b19, w18, w19, wordPair: w18 && w19 ? `${w18} ${w19}` : null};
}

/*
 * Broad source-state census.
 *
 * In each D4 frame, preserve the prior state's radius-1 vertical mirror key,
 * outward horizontal three-cell ciphertext direction, and right-edge exit.
 * Enumerate every source-native radius-1 equal-outer key node and every
 * possible outward endpoint row. This deliberately frees the center/end-point
 * displacement, making it an adversarial upper-bound multiplicity census.
 */
const broad = [];
let orientedMirrorNodes = 0;
for (const [frameName, transform] of frames) {
  const at = makeAt(transform);
  const centers = [];
  for (let row = 2; row <= 26; row++) {
    for (let col = 1; col <= 27; col++) {
      const raw = [at([row - 1, col]), at([row, col]), at([row + 1, col])];
      if (raw[0] === raw[2] && raw[1] !== 0) centers.push([row, col]);
    }
  }
  orientedMirrorNodes += centers.length;
  for (const center of centers) {
    for (let endpointRow = 1; endpointRow <= 27; endpointRow++) {
      broad.push({
        frameName, center, endpoint: [endpointRow, 27],
        ...evaluateState(at, center, [endpointRow, 27]),
      });
    }
  }
}
assert.equal(orientedMirrorNodes, 144);
assert.equal(broad.length, 3888);
assert.equal(broad.filter(x => x.b18.mirrors.length === 1).length, 996);
assert.equal(broad.filter(x => x.b18.executable).length, 990);
assert.equal(broad.filter(x => x.b19?.mirrors.length === 1 &&
  x.b19.starts.length === 1).length, 278);
assert.equal(broad.filter(x => x.b19?.executable).length, 268);

const broadPairs = broad.filter(x => x.wordPair);
assert.equal(broadPairs.length, 1);
assert.equal(broadPairs[0].wordPair, "THE KEY");
assert.equal(broadPairs[0].frameName, "I");
assert.deepEqual(broadPairs[0].center, [26, 22]);
assert.deepEqual(broadPairs[0].endpoint, [25, 27]);

/*
 * Narrow matched control.
 *
 * Rigidly translate/D4-transform the exact pre-THEN geometry: prior radius-1
 * mirror at local [(r,22),(r+1,22),(r+2,22)] and outward ciphertext ending at
 * (r,27). Only translated states whose prior node is source-native
 * equal-outer are eligible.
 */
const matched = [];
for (const [frameName, transform] of frames) {
  const at = makeAt(transform);
  for (let row = 1; row <= 25; row++) {
    const center = [row + 1, 22];
    const priorRaw = [at([row, 22]), at(center), at([row + 2, 22])];
    if (priorRaw[0] !== priorRaw[2] || priorRaw[1] === 0) continue;
    matched.push({
      frameName, row, center, endpoint: [row, 27], priorRaw,
      allEqualPrior: priorRaw[0] === priorRaw[1],
      ...evaluateState(at, center, [row, 27]),
    });
  }
}
assert.equal(frames.length * 25, 200);
assert.equal(matched.length, 4);
assert.equal(matched.filter(x => x.allEqualPrior).length, 2);
assert.equal(matched.filter(x => x.b18.mirrors.length === 1).length, 2);
assert.equal(matched.filter(x => x.b18.executable).length, 2);
assert.equal(matched.filter(x => x.b19?.executable).length, 1);
assert.equal(matched.filter(x => x.wordPair).length, 1);

const then = matched.find(x => x.frameName === "I" && x.row === 25);
assert.ok(then);
assert.deepEqual(then.priorRaw.map(x => T[x]), ["IA", "IA", "IA"]);
assert.deepEqual(then.b18.plain.map(x => T[x]), ["TH", "E"]);
assert.deepEqual(then.b19.plain.map(x => T[x]), ["C", "E", "Y"]);
assert.equal(then.wordPair, "THE KEY");
assert.equal(then.b18.candidates.length, 47);
assert.equal(then.b18.mirrors.length, 1);
assert.equal(then.b19.candidates.length, 8);
assert.equal(then.b19.mirrors.length, 1);

const summary = {
  status: "conditional post-hoc mechanism multiplicity audit",
  fixedVocabularyTypes: lexicon.size,
  broad: {
    orientedPriorMirrorNodes,
    sourceStates: broad.length,
    uniqueBlock18: broad.filter(x => x.b18.mirrors.length === 1).length,
    executableUniqueBlock18: broad.filter(x => x.b18.executable).length,
    uniqueBlock19AfterBlock18: broad.filter(x => x.b19?.mirrors.length === 1 &&
      x.b19.starts.length === 1).length,
    executableTwoStage: broad.filter(x => x.b19?.executable).length,
    frequentWordPairs: broadPairs.map(x => ({
      phrase: x.wordPair, frame: x.frameName, center: x.center,
      endpoint: x.endpoint,
    })),
  },
  matched: {
    rigidPlacements: frames.length * 25,
    eligiblePriorMirrors: matched.length,
    allEqualPriorMirrors: matched.filter(x => x.allEqualPrior).length,
    uniqueBlock18: matched.filter(x => x.b18.mirrors.length === 1).length,
    executableTwoStage: matched.filter(x => x.b19?.executable).length,
    frequentWordPairs: matched.filter(x => x.wordPair).map(x => x.wordPair),
  },
  then: {
    block18Candidates: then.b18.candidates.length,
    block18Mirrors: then.b18.mirrors.length,
    block19Candidates: then.b19.candidates.length,
    block19Mirrors: then.b19.mirrors.length,
    phrase: then.wordPair,
  },
  decision:
    "Local 1-of-N geometry is common in the broad source-state census. " +
    "THE KEY is lexically unique under a fixed preexisting vocabulary, but " +
    "the transform was formulated after that target was known, so the " +
    "lexical hit cannot authenticate the mechanism.",
};
console.log(JSON.stringify(summary, null, 2));
