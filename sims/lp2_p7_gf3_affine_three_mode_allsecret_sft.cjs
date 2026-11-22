"use strict";

/**
 * Exact all-secret test for the original p7 GF(3) five-red-word register
 * as a three-mode GP29 ciphertext-predecessor quasigroup clock.
 *
 * For each previous ciphertext glyph s and register trit m:
 *    C_j = Q[m][s][P_j]
 * Q is any secret permutation of all 29 glyphs. First runes of printed
 * words are completely unconstrained. Mode m is a fixed affine-linear
 * readout of the p7 source GF(3) state, with arbitrary global phase.
 *
 * Both the primitive 242-state orbit and its two valid complete
 * 243-state de Bruijn zero splices are tested exhaustively over phases.
 * No unknown plaintext or author-specified cipher is inferred.
 *
 * SFT: node sims/lp2_p7_gf3_affine_three_mode_allsecret_sft.cjs
 * Windows 11 / Node.js 22 / CommonJS / read-only / no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const source = read("resources/lp2-transcription.txt");
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);

/** Derive all five taps from the original p7 red 2|4|3|2|3 words. */
const p7 = gp.pages.find(p => p.page === 7);
const redSpan = ink.pages.find(p => p.page === 7).red_spans[0];
assert.deepEqual([redSpan.start, redSpan.length], [194, 14]);
const red = p7.indices.slice(redSpan.start, redSpan.start + redSpan.length);
assert.equal(red.map(x => gp.runes[x]).join(""), redSpan.runes);
const redWordLengths = [2, 4, 3, 2, 3];
let redPosition = 0;
const products = redWordLengths.map(n => {
  const word = red.slice(redPosition, redPosition + n);
  redPosition += n;
  return word.reduce((a, b) => a * b % 29, 1);
});
assert.equal(redPosition, 14);
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const taps = products.map(x => x % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

/** Full primitive 242-cycle, with exactly one source-selected initial state. */
const states = [];
let state = taps.slice();
const visited = new Set();
for (let i = 0; i < 242; i++) {
  const signature = state.join(",");
  assert(!visited.has(signature), "GF3 orbit repeated early");
  visited.add(signature);
  states.push(state.slice());
  const feedback = state.reduce((sum, x, j) => sum + taps[j] * x, 0) % 3;
  state = [...state.slice(1), feedback];
}
assert.deepEqual(state, taps, "primitive 242-state orbit");
assert.equal(visited.size, 242);
assert(!visited.has("0,0,0,0,0"));
const trits = states.map(s => s[0]);

/**
 * Complete B(3,5) symbols from the primitive m-sequence. The only two
 * four-zero runs choose the two source-valid zero insertions. Both yield
 * 243 different cyclic five-trit windows and an 81/81/81 trit inventory.
 *
 * The two cycles differ by a phase shift plus the permutation m -> 2m:
 * that relabels the fully secret Q tables, so one exhaustive phase census
 * covers both under this exact three-mode architecture.
 */
const fourZeroRuns = [];
for (let i = 0; i < 242; i++)
  if ([0, 1, 2, 3].every(k => trits[(i + k) % 242] === 0))
    fourZeroRuns.push(i);
assert.deepEqual(fourZeroRuns, [83, 204]);
const completeDeBruijn = fourZeroRuns.map(start => {
  const insertion = start + 4;
  const sequence = trits.slice(0, insertion).concat(
    [0], trits.slice(insertion));
  assert.equal(sequence.length, 243);
  assert.deepEqual([0, 1, 2].map(v =>
    sequence.filter(x => x === v).length), [81, 81, 81]);
  const windows = new Set();
  for (let i = 0; i < sequence.length; i++) {
    let stateNumber = 0;
    for (let j = 0; j < 5; j++)
      stateNumber = stateNumber * 3 + sequence[(i + j) % 243];
    windows.add(stateNumber);
  }
  assert.equal(windows.size, 243);
  return sequence;
});
assert.deepEqual(completeDeBruijn[1],
  completeDeBruijn[0].map((_, i) =>
    (2 * completeDeBruijn[0][(i + 122) % 243]) % 3));


/**
 * All 242 nonzero GF3-linear state-output functionals give the
 * 242 rotations of this same m-sequence. Affine constants 0,1,2
 * merely relabel the three arbitrary secret permutation tables.
 */
const signatureToPhase = new Map();
for (let phase = 0; phase < 242; phase++) {
  const signature = trits.map((_, i) => trits[(i + phase) % 242]).join("");
  assert(!signatureToPhase.has(signature));
  signatureToPhase.set(signature, phase);
}
const observedPhases = new Set();
for (let coefficientNumber = 1; coefficientNumber < 243; coefficientNumber++) {
  let n = coefficientNumber;
  const coefficients = Array.from({length: 5}, () => {
    const digit = n % 3;
    n = Math.floor(n / 3);
    return digit;
  });
  const signature = states.map(s =>
    s.reduce((sum, x, j) => sum + x * coefficients[j], 0) % 3).join("");
  const phase = signatureToPhase.get(signature);
  assert.notEqual(phase, undefined, "linear form outside phase family");
  observedPhases.add(phase);
}
assert.equal(observedPhases.size, 242, "all affine GP3 outputs covered");

const glyphToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const runePattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const joined = source.split("%").slice(0, 55).join("")
  .replace(/\/\n/g, "").replace(/[\n\r%]/g, "");
const words = (joined.match(runePattern) || [])
  .map(w => Array.from(w, r => glyphToIndex.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original, "canonical printed-word identity");

/** Map each unchanged source rune to its printed page and section clocks. */
const pageOffset = [];
const sectionOffset = [];
for (const p of pages)
  for (let i = 0; i < p.indices.length; i++) pageOffset.push(i);
const sectionLengths = source.split("%").slice(0, 55).join("%")
  .split("$").map(s => (s.match(
    new RegExp("[" + gp.runes.join("") + "]", "gu")) || []).length)
  .filter(Boolean);
assert.deepEqual(sectionLengths, [729, 1145, 1738, 1894,
  1021, 1433, 1680, 3316]);
for (const length of sectionLengths)
  for (let i = 0; i < length; i++) sectionOffset.push(i);
assert.equal(pageOffset.length, original.length);
assert.equal(sectionOffset.length, original.length);
const pageAt = [];
for (const p of pages)
  for (let i = 0; i < p.indices.length; i++) pageAt.push(p.page);

/** Original words span physical page boundaries without adding symbols. */
const sites = [];
let offset = 0;
for (const w of words) {
  for (let j = 1; j < w.length; j++)
    sites.push({
      book: offset + j,
      page: pageOffset[offset + j],
      section: sectionOffset[offset + j],
      word: j,
      physicalPage: pageAt[offset + j],
      predecessor: w[j - 1],
      observed: w[j]
    });
  offset += w.length;
}
assert.equal(offset, 12956);
assert.equal(sites.length, 10060);

/** Exact maximum recovered one-rune occupancy over ALL secret row bijections. */
function bound(sitesToCount, clock, phase, cycle = trits) {
  const rows = new Uint16Array(3 * 29 * 29);
  for (const site of sitesToCount) {
    const mode = cycle[(site[clock] + phase) % cycle.length];
    rows[(mode * 29 + site.predecessor) * 29 + site.observed]++;
  }
  let topOne = 0;
  for (let row = 0; row < 3 * 29; row++) {
    let largest = 0;
    for (let output = 0; output < 29; output++)
      largest = Math.max(largest, rows[row * 29 + output]);
    topOne += largest;
  }
  return topOne;
}
function phaseEnvelope(sitesToCount, clock, cycle = trits) {
  let minimum = Infinity;
  let maximum = -Infinity;
  let maximizingPhase = -1;
  for (let phase = 0; phase < cycle.length; phase++) {
    const n = bound(sitesToCount, clock, phase, cycle);
    minimum = Math.min(minimum, n);
    if (n > maximum) {
      maximum = n;
      maximizingPhase = phase;
    }
  }
  return {sites: sitesToCount.length, minimum, maximum,
    maximizingPhase, maximumProportion: maximum / sitesToCount.length};
}
const whole = {};
for (const clock of ["book", "page", "section", "word"])
  whole[clock] = phaseEnvelope(sites, clock);
const afterP7 = sites.filter(site => site.physicalPage >= 8);
const afterP8 = sites.filter(site => site.physicalPage >= 9);
const receiver = {};
for (const clock of ["book", "page", "word"])
  receiver[clock] = phaseEnvelope(afterP8, clock);
assert.deepEqual(Object.fromEntries(Object.entries(whole)
  .map(([k, v]) => [k, [v.minimum, v.maximum]])), {
  book: [724, 775],
  page: [729, 784],
  section: [722, 775],
  word: [660, 756]
});
assert.deepEqual(Object.fromEntries(Object.entries(receiver)
  .map(([k, v]) => [k, [v.minimum, v.maximum]])), {
  book: [642, 688],
  page: [641, 686],
  word: [577, 676]
});
assert.equal(afterP7.length, 8599);
assert.equal(afterP8.length, 8395);
assert(whole.page.maximum < 1135,
  "all full-book source-native GP29 Latin/English controls exceed this");
assert(receiver.book.maximum / receiver.book.sites < 0.083);

/** Source-complete 243-clock capacity, both zero splices by exact equivalence. */
const whole243 = {};
const receiver243 = {};
for (const clock of ["book", "page", "section", "word"])
  whole243[clock] = phaseEnvelope(sites, clock, completeDeBruijn[0]);
for (const clock of ["book", "page", "word"])
  receiver243[clock] = phaseEnvelope(afterP8, clock, completeDeBruijn[0]);
assert.deepEqual(Object.fromEntries(Object.entries(whole243)
  .map(([k, v]) => [k, [v.minimum, v.maximum]])), {
  book: [720, 781],
  page: [722, 782],
  section: [728, 772],
  word: [660, 756]
});
assert.deepEqual(Object.fromEntries(Object.entries(receiver243)
  .map(([k, v]) => [k, [v.minimum, v.maximum]])), {
  book: [635, 691],
  page: [638, 689],
  word: [577, 676]
});


/**
 * Real GP word-length-matched source controls. Encoding uses the repo's
 * solved-LP1/p57 calibrated NG/ING and IA/IO orthography. For Latin,
 * the GP words were independently encoded and pinned in resources/control.
 * We sample complete words matching all 2,896 original printed lengths;
 * the same sampled word fills each original position, including p9+.
 */
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const latinDigits = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split("\n").map(s => s.trim()).filter(s => s && !s.startsWith("#"))
  .map(s => [...s].map(ch => latinDigits.indexOf(ch)));
assert(latinWords.every(w => w.length && w.every(x => x >= 0)));
function englishWords(file) {
  return (read(file).match(/[A-Za-z]+/g) || [])
    .map(word => encodeSourceNativeGP(word)).filter(w => w.length);
}
const languageSources = [
  ["Gibran", englishWords("resources/control/gibran_prophet_58585.txt")],
  ["Shakespeare", englishWords("resources/control/shakespeare_first300k.txt")],
  ["Latin", latinWords]
];
const originalWordOffsets = [];
let wordOffset = 0;
for (const w of words) {
  originalWordOffsets.push(wordOffset);
  wordOffset += w.length;
}
assert.equal(wordOffset, 12956);
function matchedLanguageControl(sourceWords) {
  const byLength = Array.from({length: 29}, () => []);
  for (const word of sourceWords) if (word.length < 29)
    byLength[word.length].push(word);
  for (const originalWord of words)
    assert(byLength[originalWord.length].length > 0,
      "control needs each authentic printed word length");
  let minimumFull = Infinity;
  let maximumFull = 0;
  let minimumP9 = Infinity;
  let maximumP9 = 0;
  for (let draw = 0; draw < 60; draw++) {
    let seed = (0x4c500201 + draw * 2166136261) >>> 0;
    const randomSource = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return seed >>> 0;
    };
    const full = new Uint32Array(29);
    const p9 = new Uint32Array(29);
    let fullCount = 0;
    let p9Count = 0;
    for (let i = 0; i < words.length; i++) {
      const pool = byLength[words[i].length];
      const native = pool[randomSource() % pool.length];
      for (let j = 1; j < native.length; j++) {
        full[native[j]]++;
        fullCount++;
        if (pageAt[originalWordOffsets[i] + j] >= 9) {
          p9[native[j]]++;
          p9Count++;
        }
      }
    }
    assert.equal(fullCount, 10060);
    assert.equal(p9Count, 8395);
    const topFull = Math.max(...full);
    const topP9 = Math.max(...p9);
    minimumFull = Math.min(minimumFull, topFull);
    maximumFull = Math.max(maximumFull, topFull);
    minimumP9 = Math.min(minimumP9, topP9);
    maximumP9 = Math.max(maximumP9, topP9);
  }
  return {sourceWords: sourceWords.length, draws: 60, minimumFull,
    maximumFull, minimumP9, maximumP9};
}
const controls = Object.fromEntries(languageSources.map(([name, language]) =>
  [name, matchedLanguageControl(language)]));
assert.deepEqual(Object.fromEntries(Object.entries(controls).map(
  ([name, c]) => [name, [c.sourceWords, c.minimumFull, c.minimumP9]])), {
  Gibran: [15733, 1419, 1186],
  Shakespeare: [55407, 1434, 1193],
  Latin: [39835, 1181, 974]
});
for (const control of Object.values(controls)) {
  assert(whole.page.maximum < control.minimumFull);
  assert(whole243.page.maximum < control.minimumFull);
  assert(Math.max(...Object.values(receiver).map(x => x.maximum)) <
    control.minimumP9);
  assert(Math.max(...Object.values(receiver243).map(x => x.maximum)) <
    control.minimumP9);
}

/** Positive: encrypt, invert, and reencrypt real solved p57 GP runes. */
let seed = 0x33012307;
const random = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
};
const secret = Array.from({length: 3}, () =>
  Array.from({length: 29}, () => {
    const row = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    return row;
  }));
const inverse = secret.map(mode => mode.map(row => {
  const result = new Array(29);
  for (let i = 0; i < 29; i++) result[row[i]] = i;
  assert.deepEqual(result.slice().sort((a, b) => a - b),
    Array.from({length: 29}, (_, i) => i));
  return result;
}));
const known = gp.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);
let pointer = 0;
const synthetic = words.map(w => w.map(() => known[pointer++ % 95]));
assert.equal(pointer, 12956);
const fixedPhase = 137;
function cryptWord(w, offset, decoding, cycle = trits) {
  const result = [w[0]];
  for (let j = 1; j < w.length; j++) {
    const mode = cycle[(offset + j + fixedPhase) % cycle.length];
    const predecessorCipher = decoding ? w[j - 1] : result[j - 1];
    const value = decoding ? inverse[mode][predecessorCipher][w[j]]
      : secret[mode][predecessorCipher][w[j]];
    result.push(value);
  }
  return result;
}
let globalOffset = 0;
const encrypted = synthetic.map(w => {
  const result = cryptWord(w, globalOffset, false);
  globalOffset += w.length;
  return result;
});
globalOffset = 0;
const recovered = encrypted.map(w => {
  const result = cryptWord(w, globalOffset, true);
  globalOffset += w.length;
  return result;
});
assert.deepEqual(recovered, synthetic);
globalOffset = 0;
assert.deepEqual(recovered.map(w => {
  const result = cryptWord(w, globalOffset, false);
  globalOffset += w.length;
  return result;
}), encrypted);
const syntheticTop1 = Math.max(...Array.from({length: 29}, (_, rune) =>
  synthetic.reduce((sum, w) =>
    sum + w.slice(1).filter(v => v === rune).length, 0)));
const plantedSites = [];
globalOffset = 0;
for (const w of encrypted) {
  for (let j = 1; j < w.length; j++)
    plantedSites.push({book: globalOffset + j,
      predecessor: w[j - 1], observed: w[j]});
  globalOffset += w.length;
}
const plantedBound = bound(plantedSites, "book", fixedPhase);
assert(plantedBound >= syntheticTop1, "positive plaintext fits all-secret bound");

/** Independent zero-spliced full-manuscript, GP-native positive. */
globalOffset = 0;
const encrypted243 = synthetic.map(w => {
  const result = cryptWord(w, globalOffset, false, completeDeBruijn[0]);
  globalOffset += w.length;
  return result;
});
globalOffset = 0;
const recovered243 = encrypted243.map(w => {
  const result = cryptWord(w, globalOffset, true, completeDeBruijn[0]);
  globalOffset += w.length;
  return result;
});
assert.deepEqual(recovered243, synthetic);
globalOffset = 0;
assert.deepEqual(recovered243.map(w => {
  const result = cryptWord(w, globalOffset, false, completeDeBruijn[0]);
  globalOffset += w.length;
  return result;
}), encrypted243);
const planted243Sites = [];
globalOffset = 0;
for (const w of encrypted243) {
  for (let j = 1; j < w.length; j++)
    planted243Sites.push({book: globalOffset + j,
      predecessor: w[j - 1], observed: w[j]});
  globalOffset += w.length;
}
const planted243Bound = bound(planted243Sites, "book",
  fixedPhase, completeDeBruijn[0]);
assert(planted243Bound >= syntheticTop1);


if (require.main === module)
  console.log(JSON.stringify({
    classification: "exact source-conditional exclusion; no recovered LP2 plaintext",
    originalRuneCount: original.length,
    originalCompleteWords: words.length,
    interiorSites: sites.length,
    sourceRedProducts: products,
    primitivePeriod: states.length,
    nonzeroAffineReadoutsCovered: observedPhases.size * 3,
    sourceRegisterModes: 3,
    originalBookAllSecret: whole,
    originalP9To55AllSecret: receiver,
    zeroSplicedFourZeroRunPositions: fourZeroRuns,
    zeroSplicedDeBruijnAllSecret: whole243,
    zeroSplicedDeBruijnP9To55AllSecret: receiver243,
    nativeGPWordLengthMatchedControls: controls,
    syntheticSolvedP57GP: {
      sourceRunesReused: known.length,
      exactlyRecovered: pointer,
      plantedTopRuneFrequency: syntheticTop1,
      plantedAllSecretEnvelope: plantedBound,
      zeroSplicedExactlyRecovered: recovered243.flat().length,
      plantedZeroSplicedAllSecretEnvelope: planted243Bound
    },
    unexcluded: ["unknown source plaintext register",
      "nonlinear 243-state data/output consumers beyond fixed trit mode",
      "state-derived ciphers with dynamic key material",
      "additional position/word/page-dependent secret row tables"]
  }, null, 2));
