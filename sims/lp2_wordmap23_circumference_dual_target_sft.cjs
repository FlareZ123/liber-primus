"use strict";

/**
 * Source-selected structural hypothesis: two p0 red heading word sums seed the
 * 156-body-word GP-prime pointer graph. Its shared 23-cycle contains 119
 * whole-word runes or 74 runes after trimming first/last from each word.
 * Prepending the two heading sums as GP29 symbols produces 121 and 76 symbols,
 * exactly the original lengths of physical p32 and p55.
 *
 * Test complete intact original p32 and p55 with the finite historical GP29
 * additive, prime-projected, phi(prime)-projected, and genuine literal-F
 * transparent inverses. No language-optimised key, phases, word edits, or
 * invented reset rule. Source-native positive roundtrips on each key.
 *
 * 1,000,000 seeded page-stratified pointer-map shuffles estimate how often the
 * combined post-discovery conjunction occurs. Its p-value is exploratory.
 *
 * Run: node sims/lp2_wordmap23_circumference_dual_target_sft.cjs
 * @module lp2_wordmap23_circumference_dual_target_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const load = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const source = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const transcript = load("resources/lp2-transcription.txt");
const runeIndex = new Map(source.runes.map((r, i) => [r, i]));
const tokenIndex = new Map(source.translit.map((r, i) => [r, i]));
const parsed = parseLP2Words(transcript, 3);
assert.equal(parsed.runeCount, 729);
assert.equal(parsed.words.length, 158);
const opening = parsed.words.map(word =>
  [...word.runes].map(glyph => runeIndex.get(glyph)));
const body = opening.slice(2);
const bodyWordCount = 156;
const headingSums = opening.slice(0, 2)
  .map(word => word.reduce((sum, rune) => sum + source.prime[rune], 0));
assert.deepEqual(headingSums, [347, 315]);
const sums = body.map(word =>
  word.reduce((sum, rune) => sum + source.prime[rune], 0));
const next = sums.map(sum => sum % bodyWordCount);

/** @param {number} seed */
function orbit(seed) {
  const history = [];
  const seen = new Map();
  let at = seed % bodyWordCount;
  while (!seen.has(at)) {
    seen.set(at, history.length);
    history.push(at);
    at = next[at];
  }
  return {before: history.slice(0, seen.get(at)),
    cycle: history.slice(seen.get(at))};
}
const first = orbit(347);
const second = orbit(315);
assert.deepEqual(first.before.map(i => i + 1), [36, 56, 113]);
assert.equal(first.cycle.length, 23);
assert.equal(second.cycle.length, 23);
assert.ok(first.cycle.includes(second.cycle[0]));
assert.equal(first.cycle.reduce((s, i) => s + body[i].length, 0), 119);
assert.equal(first.cycle.reduce((s, i) => s + Math.max(0, body[i].length - 2), 0), 74);
assert.equal(first.cycle.filter(i => body[i].length === 1).length, 1);
assert.equal(new Set(first.cycle.map(i => sums[i])).has(563), true);
assert.equal(new Set(first.cycle.map(i => sums[i])).has(569), true);

/** @param {string} word */
function encodeGP(word) {
  const normalized = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const pair = tokenIndex.get(normalized.slice(i, i + 2));
    if (pair !== undefined) {out.push(pair); i += 2;}
    else {
      const symbol = tokenIndex.get(normalized[i]);
      if (symbol !== undefined) out.push(symbol);
      i++;
    }
  }
  return out;
}
const english = (load("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g) || []).flatMap(encodeGP);
assert.ok(english.length > 30121);
const matrix = Array.from({length: 29}, () => new Float64Array(29).fill(.2));
for (let i = 1; i < 30000; i++) matrix[english[i - 1]][english[i]]++;
const logBigram = matrix.map(row => {
  const total = row.reduce((a, b) => a + b);
  return Array.from(row, n => Math.log(n / total));
});
/** @param {number[]} word */
function score(word) {
  let log = 0;
  const hist = new Uint16Array(29);
  for (let i = 0; i < word.length; i++) {
    hist[word[i]]++;
    if (i) log += logBigram[word[i - 1]][word[i]];
  }
  const ioc = hist.reduce((n, h) => n + h * (h - 1), 0)
    / (word.length * (word.length - 1));
  return {logBigramPerPair: + (log / (word.length - 1)).toFixed(6),
    ioc: +ioc.toFixed(6)};
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {-1|1} inverseSign
 * @param {boolean} transparentF
 */
function decodeAll(ciphertext, key, inverseSign, transparentF) {
  let states = [{consumed: 0, plain: []}];
  for (const glyph of ciphertext) {
    const nextStates = [];
    for (const state of states) {
      if (state.consumed >= key.length) continue;
      const candidate = (glyph + inverseSign * key[state.consumed] + 29) % 29;
      if (!transparentF || candidate !== 0)
        nextStates.push({consumed: state.consumed + 1,
          plain: [...state.plain, candidate]});
      if (transparentF && glyph === 0)
        nextStates.push({consumed: state.consumed,
          plain: [...state.plain, 0]});
    }
    states = nextStates;
    if (!states.length) break;
  }
  return states.filter(item => item.plain.length === ciphertext.length);
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} inverseSign
 * @param {boolean} transparentF
 */
function encrypt(plain, key, inverseSign, transparentF) {
  let consumed = 0;
  return plain.map(value => {
    if (transparentF && value === 0) return 0;
    const cipher = (value - inverseSign * key[consumed] + 29) % 29;
    consumed++;
    return cipher;
  });
}

/** @param {number} x */
function randomGenerator(x) {
  let seed = x >>> 0;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
}
function lengthConjunctionNull(draws) {
  const grouped = [0, 1, 2].map(page =>
    parsed.words.slice(2).map((w, i) => w.startPage === page ? i : -1)
      .filter(i => i >= 0));
  assert.deepEqual(grouped.map(group => group.length), [57, 62, 37]);
  const random = randomGenerator(0x33011747);
  const shuffled = Array.from({length: body.length}, (_, i) => i);
  const stamped = new Int32Array(body.length);
  const startIndex = new Int32Array(body.length);
  const counts = {seedA23: 0, bothHeadings23: 0,
    axis563569: 0, lengths119and74: 0, all: 0};
  for (let trial = 1; trial <= draws; trial++) {
    for (const group of grouped) {
      for (let j = group.length - 1; j > 0; j--) {
        const k = random() % (j + 1);
        const a = group[j], b = group[k];
        [shuffled[a], shuffled[b]] = [shuffled[b], shuffled[a]];
      }
    }
    const chain = [];
    let at = headingSums[0] % 156;
    while (stamped[at] !== trial) {
      stamped[at] = trial;
      startIndex[at] = chain.length;
      chain.push(at);
      at = sums[shuffled[at]] % 156;
    }
    const cycle = chain.slice(startIndex[at]);
    if (cycle.length !== 23) continue;
    counts.seedA23++;
    const cycleSet = new Set(cycle);
    const visited = new Set();
    at = headingSums[1] % 156;
    while (!cycleSet.has(at) && !visited.has(at)) {
      visited.add(at);
      at = sums[shuffled[at]] % 156;
    }
    if (!cycleSet.has(at)) continue;
    counts.bothHeadings23++;
    let total = 0, singleton = 0, has563 = false, has569 = false;
    for (const cell of cycle) {
      const originalIndex = shuffled[cell];
      const v = sums[originalIndex];
      total += body[originalIndex].length;
      singleton += Number(body[originalIndex].length === 1);
      has563 ||= v === 563;
      has569 ||= v === 569;
    }
    const dims = has563 && has569;
    const lengths = total === 119 && singleton === 1;
    if (dims) counts.axis563569++;
    if (lengths) counts.lengths119and74++;
    if (dims && lengths) counts.all++;
  }
  return {draws, originalMatched: true, counts,
    familywiseCalibrated: false, note: "post-discovery exact conjunction"};
}


/**
 * Exact all-secret p32 -> p55 same-text target when the cycle word lengths
 * prescribe which 45 "circumference" runes to discard from p32.
 *
 * A fixed (possibly non-injective) substitution must map each retained p32
 * source rune to one and the same p55 target rune everywhere. The best any
 * unknown 29-entry map can do is the sum of 29 row maxima.
 *
 * @param {number[]} a @param {number[]} b
 */
function anyFixedMapMax(a, b) {
  assert.equal(a.length, b.length);
  const hist = Array.from({length: 29}, () => new Uint8Array(29));
  for (let i = 0; i < a.length; i++) hist[a[i]][b[i]]++;
  return hist.reduce((n, row) => n + Math.max(...row), 0);
}
function treePairMaskGate() {
  const page32 = source.pages.find(p => p.page === 32).indices;
  const page55 = source.pages.find(p => p.page === 55).indices;
  const trials = [];
  for (const [entry, route] of [["first", first.cycle],
    ["second", second.cycle]]) {
    for (const headerAtStart of [true, false]) {
      const selected = [];
      let cursor = headerAtStart ? 2 : 0;
      if (headerAtStart) selected.push(0, 1);
      for (const cell of route) {
        const length = body[cell].length;
        for (let j = 1; j < length - 1; j++)
          selected.push(cursor + j);
        cursor += length;
      }
      if (!headerAtStart) selected.push(119, 120);
      assert.equal(selected.length, 76);
      for (const reverse32 of [false, true]) {
        for (const reverse55 of [false, true]) {
          const source32 = reverse32 ? page32.toReversed() : page32;
          const source55 = reverse55 ? page55.toReversed() : page55;
          const projected = selected.map(i => source32[i]);
          trials.push({entry, headerAtStart, reverse32, reverse55,
            agreement: projected.filter((value, i) => value === source55[i]).length,
            maximumAnySecretStaticMap: anyFixedMapMax(projected, source55)});
        }
      }
    }
  }
  assert.equal(trials.length, 16);
  const max = Math.max(...trials.map(t => t.maximumAnySecretStaticMap));
  assert.equal(max, 33);
  const plant = page55.map(v => (7 * v + 13) % 29);
  assert.equal(anyFixedMapMax(page55, plant), 76);
  return {tested: trials.length, bestPossibleAgreement: max,
    necessaryChanges: 76 - max, plantedRecovered: true,
    bestCases: trials.filter(t => t.maximumAnySecretStaticMap === max),
    note: "any one fixed substitution alphabet, original GP word boundaries, exact source-derived trim mask"};
}

const targets = [
  {page: 32, source: source.pages.find(item => item.page === 32).indices,
    keyKind: "full", length: 121},
  {page: 55, source: source.pages.find(item => item.page === 55).indices,
    keyKind: "interior", length: 76},
];
const results = [];
for (const [heading, route, redPrefix] of [
  ["first", first.cycle, [347 % 29, 315 % 29]],
  ["second", second.cycle, [315 % 29, 347 % 29]]]) {
  for (const target of targets) {
    assert.equal(target.source.length, target.length);
    const candidates = route.flatMap(i => target.keyKind === "full"
      ? body[i] : body[i].slice(1, -1));
    const keyRunes = redPrefix.concat(candidates);
    assert.equal(keyRunes.length, target.length);
    for (const mapping of ["GP-index", "GP-prime-mod29", "GP-totient-mod29"]) {
      const key = keyRunes.map(v => mapping === "GP-index" ? v
        : mapping === "GP-prime-mod29" ? source.prime[v] % 29
        : (source.prime[v] - 1) % 29);
      for (const inverseSign of [-1, 1]) {
        for (const transparentF of [false, true]) {
          const positivePlain = english.slice(30000, 30000 + target.length);
          const planted = encrypt(positivePlain, key, inverseSign, transparentF);
          assert.ok(decodeAll(planted, key, inverseSign, transparentF)
            .some(x => x.plain.every((symbol, i) => symbol === positivePlain[i])));
          const decoded = decodeAll(target.source, key, inverseSign, transparentF);
          for (const state of decoded)
            assert.deepEqual(encrypt(state.plain, key, inverseSign, transparentF),
              target.source);
          const ranked = decoded.map(state => ({
            ...score(state.plain), consumed: state.consumed,
            transliteration: state.plain.map(i => source.translit[i]).join(" ")}))
            .sort((a, b) => b.logBigramPerPair - a.logBigramPerPair);
          results.push({page: target.page, heading, mapping, inverseSign,
            transparentF, legalCount: decoded.length, best: ranked[0] || null,
            plantedRecovered: true});
        }
      }
    }
  }
}
assert.equal(results.length, 48);
const survivors = results.filter(row => row.legalCount);
assert.equal(survivors.length, 27);
const best = survivors.slice().sort((a, b) =>
  b.best.logBigramPerPair - a.best.logBigramPerPair);
assert.ok(best.every(row => row.best.ioc < .04));
assert.ok(best.every(row => row.best.logBigramPerPair < -4.4));
const known = source.pages.find(page => page.page === 57).indices;
assert.equal(known.length, 95);
console.log(JSON.stringify({
  source: {openingRunes: 729, openingWords: 158,
    bodyWords: 156, redHeadingSums: headingSums, cycle: first.cycle.map(i => i + 1),
    fullCycleRunes: 119, interiorCycleRunes: 74,
    firstPage: 32, firstTargetRunes: 121,
    secondPage: 55, secondTargetRunes: 76},
  historicalPositiveControl: {page: 57, score: score(known)},
  languageHeldout: score(english.slice(30000, 30121)),
  finiteTests: {total: results.length, legal: survivors.length,
    noLegal: results.length - survivors.length, best: best.slice(0, 8)
      .map(x => ({...x, best: {...x.best,
        transliteration: x.best.transliteration.slice(0, 180)}}))},
  sourceMaskAllSecret: treePairMaskGate(),
  conjunctionNull: lengthConjunctionNull(1000000),
  decision: "No coherent GP-native original prose. Exact-length cycle is exploratory; no author-selected use of the two red sums or additive consumer.",
}, null, 2));
