"use strict";

/**
 * All-secret ciphertext-predecessor quasigroup capacity theorem on LP2.
 *
 * Tested family, independently for every permitted scope g and preceding
 * ciphertext rune s:
 *     C[w,j] = Q[g][C[w,j-1]][P[w,j]]   (j>=1)
 * where Q[g][s] is any unknown permutation of GP29.
 *
 * No secret table, alphabet order or key is assumed or fitted.
 * Observed transition count n[g,s,t] fixes the multiset of possible plaintext
 * counts in every row up to a permutation. Therefore, for any k, the number
 * of positions occupied by the k most frequent decoded plaintext symbols is
 * at most sum_(g,s) of the k largest n[g,s,t] counts.
 *
 * The theorem applies only to the 10,060 positions WITHIN the 2,896 actual
 * printed words; first symbols are unconstrained. It also applies if each
 * of eight original $ sections, or each physical page, has a fresh secret Q.
 * It does not apply to evolving / per-word / hidden-state schedules,
 * resegmentation, or non-bijective extra-bit encodings.
 *
 * Repro: node sims/lp2_cipherprev_quasigroup_majorization_original_sft.cjs
 * Windows 11 / Node22 CommonJS. Read-only and deterministic.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pageSource = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pageSource.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const runeRE = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const source = read("resources/liber-primus/lp2-transcription.txt");
const joined = source.split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const words = (joined.match(runeRE) || [])
  .map(w => Array.from(w, r => glyph.get(r)));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
const sectionLengths = source.split("%").slice(0, 55).join("%")
  .split("$").map(s => (s.match(new RegExp("[" + gp.runes.join("") + "]", "gu")) || []).length)
  .filter(Boolean);
assert.deepEqual(sectionLengths, [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
const pageAt = [];
for (const p of pageSource)
  for (let i = 0; i < p.indices.length; i++) pageAt.push(p.page);
const sectionAt = [];
for (const [g, n] of sectionLengths.entries())
  for (let i = 0; i < n; i++) sectionAt.push(g);
assert.equal(pageAt.length, original.length);
assert.equal(sectionAt.length, original.length);
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const redAt = new Uint8Array(original.length);
let inkOffset = 0;
for (const page of pageSource) {
  const marked = ink.pages.find(p => p.page === page.page);
  if (marked) assert.equal(marked.rune_count, page.indices.length);
  for (const span of marked?.red_spans || []) {
    assert(span.start >= 0 && span.start + span.length <= page.indices.length);
    const literallyRed = page.indices.slice(span.start, span.start + span.length)
      .map(i => gp.runes[i]).join("");
    assert.equal(literallyRed, span.runes, "physical colored original rune identity");
    for (let i = 0; i < span.length; i++) {
      assert.equal(redAt[inkOffset + span.start + i], 0,
        "no overlapping original red spans");
      redAt[inkOffset + span.start + i] = 1;
    }
  }
  inkOffset += page.indices.length;
}
assert.equal(inkOffset, original.length);
assert.equal(redAt.reduce((sum, v) => sum + v, 0), 213);
let crossedInkInsideWord = 0;
let colorOffset = 0;
for (const word of words) {
  for (let j = 1; j < word.length; j++)
    if (redAt[colorOffset + j] !== redAt[colorOffset + j - 1])
      crossedInkInsideWord++;
  colorOffset += word.length;
}
assert.equal(crossedInkInsideWord, 0,
  "red/black typography boundaries must coincide with original word boundaries");
const TOP = [1, 2, 3, 5, 8, 10];
const scopes = ["global", "section", "page", "position", "sectionParity",
  "color", "sectionColor", "positionColor"];
const groupAt = (scope, offset, wordPosition) =>
  scope === "global" ? 0 :
  scope === "section" ? sectionAt[offset] :
  scope === "page" ? pageAt[offset] :
  scope === "sectionParity" ? sectionAt[offset] * 2 + (wordPosition % 2) :
  scope === "color" ? redAt[offset] :
  scope === "sectionColor" ? sectionAt[offset] * 2 + redAt[offset] :
  scope === "positionColor" ? wordPosition * 2 + redAt[offset] : wordPosition;

/**
 * Exact envelope of ANY secret row bijections under a given reset scope.
 * @param {number[][]} ciphertext
 * @param {"global"|"section"|"page"|"position"|"sectionParity"|"color"|"sectionColor"|"positionColor"} scope
 */
function envelope(ciphertext, scope) {
  assert(scopes.includes(scope));
  assert.equal(ciphertext.length, words.length);
  const rows = new Map();
  let offset = 0;
  let sites = 0;
  let equal = 0;
  for (const w of ciphertext) {
    for (let j = 1; j < w.length; j++) {
      const g = groupAt(scope, offset + j, j);
      const s = w[j - 1];
      const key = g * 29 + s;
      if (!rows.has(key)) rows.set(key, new Uint32Array(29));
      rows.get(key)[w[j]]++;
      sites++;
      if (w[j] === s) equal++;
    }
    offset += w.length;
  }
  assert.equal(offset, original.length);
  assert.equal(sites, 10060);
  const capacities = Object.fromEntries(TOP.map(k => [k, 0]));
  const groups = new Set();
  for (const [key, histogram] of rows.entries()) {
    groups.add(Math.floor(key / 29));
    const sorted = Array.from(histogram).sort((a, b) => b - a);
    for (const k of TOP)
      capacities[k] += sorted.slice(0, k).reduce((a, b) => a + b, 0);
  }
  return { scope, sites, equal, groups: groups.size, rows: rows.size, capacities,
    pct: Object.fromEntries(TOP.map(k => [k, 100 * capacities[k] / sites])) };
}

/** Plaintext character rank frequencies at precisely the interior sites. */
function languageRank(wordsNative) {
  const n = new Uint32Array(29);
  let sites = 0;
  for (const w of wordsNative) {
    for (let i = 1; i < w.length; i++) { n[w[i]]++; sites++; }
  }
  const sorted = Array.from(n).sort((a, b) => b - a);
  return {sites, E: n[18], top1: sorted[0], top5: sorted.slice(0, 5)
    .reduce((a, b) => a + b, 0)};
}
function rng(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function nativePools(relativePath) {
  const pools = new Map();
  const sourceText = relativePath.includes("latin-vulgate") ?
    read(relativePath).split("\n").filter(x => !x.trimStart().startsWith("#")).join(" ") :
    read(relativePath);
  for (const word of sourceText.match(/[A-Za-z]+/g) || []) {
    const nums = encodeSourceNativeGP(word);
    if (!pools.has(nums.length)) pools.set(nums.length, []);
    pools.get(nums.length).push(nums);
  }
  for (const w of words)
    assert(pools.has(w.length), "missing source-native GP word length " + w.length);
  return pools;
}
function drawNative(pools, random) {
  return words.map(w => {
    const options = pools.get(w.length);
    return options[Math.floor(random() * options.length)];
  });
}

/**
 * Planted reversible stateful substitutions, one independent unknown
 * permutation for each previous-ciphertext rune and every reset scope.
 * Every Q[g][s] additionally maps plain F to repeated output s, giving
 * a particularly anti-doublet-friendly positive.
 */
function plant(nativeWords, scope, random) {
  const stateTables = new Map();
  const tableFor = (g, previous) => {
    const key = g * 29 + previous;
    if (!stateTables.has(key)) {
      const others = shuffle(Array.from({length: 29}, (_, i) => i)
        .filter(i => i !== previous), random);
      stateTables.set(key, [previous, ...others]);
    }
    return stateTables.get(key);
  };
  const encoded = [];
  const decoded = [];
  let offset = 0;
  for (const w of nativeWords) {
    const c = [(w[0] + 7) % 29], recovered = [w[0]];
    for (let i = 1; i < w.length; i++) {
      const table = tableFor(groupAt(scope, offset + i, i), c[i - 1]);
      c.push(table[w[i]]);
      recovered.push(table.indexOf(c[i]));
    }
    encoded.push(c);
    decoded.push(recovered);
    offset += w.length;
  }
  assert.deepEqual(decoded, nativeWords, "exact inverse of full planted original-size source");
  const bound = envelope(encoded, scope);
  const plain = languageRank(decoded);
  assert(plain.top1 <= bound.capacities[1] && plain.top5 <= bound.capacities[5]);
  return {recovered: decoded.flat().length, tables: stateTables.size,
    ciphertextEqual: bound.equal, rankCaps: [bound.capacities[1], bound.capacities[5]],
    actualNativeRank: [plain.top1, plain.top5]};
}
/**
 * A stronger all-secret hidden-mode theorem: if, for each previous cipher
 * rune s, the same plaintext glyph can have only m possible output glyphs,
 * then each n[s,*] ciphertext row can cover at most its m most frequent
 * successors for that one plaintext glyph. The mode choice may vary on
 * EVERY rune, depend on the plaintext, or come from an unknown keystream.
 * The original B2=1086 is therefore an upper bound on any plaintext's
 * MOST COMMON glyph for ANY two-mode stationary predecessor-state family.
 *
 * Reversible positive with arbitrary secret tables and per-token hidden
 * modes, proving that full original-size source-native text can be
 * exactly encoded and recovered by a valid two- or three-mode instance.
 *
 * @param {number[][]} nativeWords
 * @param {number} modeCount
 * @param {() => number} random
 */
function plantUnknownModes(nativeWords, modeCount, random) {
  assert([2, 3].includes(modeCount));
  const tables = Array.from({length: modeCount}, () =>
    Array.from({length: 29}, () =>
      shuffle(Array.from({length: 29}, (_, i) => i), random)));
  const cipher = [];
  const recovered = [];
  let sites = 0;
  for (const w of nativeWords) {
    const c = [(w[0] + 7) % 29], p = [w[0]];
    for (let j = 1; j < w.length; j++) {
      const mode = Math.floor(random() * modeCount);
      const row = tables[mode][c[j-1]];
      c.push(row[w[j]]);
      p.push(row.indexOf(c[j]));
      sites++;
    }
    cipher.push(c);
    recovered.push(p);
  }
  assert.deepEqual(recovered, nativeWords);
  const bound = envelope(cipher, "global");
  const rank = languageRank(recovered);
  assert(rank.top1 <= bound.capacities[modeCount],
    "hidden-mode m-alphabet per-rune rank impossibility");
  return {modeCount, plaintextRecovered:recovered.flat().length,
    sites, sourceTop1:rank.top1, sourceB_m:bound.capacities[modeCount]};
}
const originalCaps = Object.fromEntries(scopes.map(scope =>
  [scope, envelope(words, scope)]));
assert.deepEqual(originalCaps.global.capacities,
  {"1":578,"2":1086,"3":1582,"5":2510,"8":3798,"10":4602});
assert.deepEqual(originalCaps.section.capacities,
  {"1":1031,"2":1881,"3":2613,"5":3912,"8":5520,"10":6421});
assert.deepEqual(originalCaps.page.capacities,
  {"1":2401,"2":4140,"3":5633,"5":8019,"8":9749,"10":10012});
assert.equal(originalCaps.position.capacities[1], 1058);
assert.equal(originalCaps.position.capacities[5], 3974);
assert.equal(originalCaps.sectionParity.capacities[1], 1354);
assert.equal(originalCaps.sectionParity.capacities[5], 4842);
assert.equal(originalCaps.color.capacities[1], 614);
assert.equal(originalCaps.color.capacities[5], 2610);
assert.equal(originalCaps.sectionColor.capacities[1], 1134);
assert.equal(originalCaps.sectionColor.capacities[5], 4024);
assert.equal(originalCaps.positionColor.capacities[1], 1160);
assert.equal(originalCaps.positionColor.capacities[5], 4089);
assert.equal(originalCaps.global.equal, 63);

const corpusPaths = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/latin-vulgate-latin26-wholewords.txt"
];
const controls = [];
for (const [sourceIndex, sourcePath] of corpusPaths.entries()) {
  const pools = nativePools(sourcePath);
  const random = rng(0x33015552 + sourceIndex);
  let minTop1 = Infinity, maxTop1 = -Infinity,
    minTop5 = Infinity, maxTop5 = -Infinity, minE = Infinity;
  let plantControls = null;
  let switchedModeControls = null;
  for (let trial = 0; trial < 60; trial++) {
    const nativeWords = drawNative(pools, random);
    const st = languageRank(nativeWords);
    assert.equal(st.sites, 10060);
    minTop1 = Math.min(minTop1, st.top1);
    maxTop1 = Math.max(maxTop1, st.top1);
    minTop5 = Math.min(minTop5, st.top5);
    maxTop5 = Math.max(maxTop5, st.top5);
    minE = Math.min(minE, st.E);
    if (trial === 0) {
      plantControls = Object.fromEntries(scopes.map((scope, scopeIndex) =>
        [scope, plant(nativeWords, scope, scopeIndex < 5
          ? random : rng(0x33018801 + 100 * sourceIndex + scopeIndex))]));
      switchedModeControls = [2, 3].map(m =>
        plantUnknownModes(nativeWords, m, random));
    }
  }
  assert(minTop1 > originalCaps.global.capacities[2],
    "even freely switching between any TWO secret nonlinear tables is insufficient");
  assert(minTop1 > originalCaps.section.capacities[1]);
  assert(minTop5 > originalCaps.section.capacities[5]);
  assert(minTop5 > originalCaps.color.capacities[5]);
  assert(minTop5 > originalCaps.sectionColor.capacities[5]);
  assert(minTop5 > originalCaps.positionColor.capacities[5]);
  assert(minTop1 > originalCaps.position.capacities[1]);
  // English controls fail even with separate even/odd tables per section.
  // Latin is addressed by the tighter per-word-position and section gates.
  if (sourceIndex < 2)
    assert(minTop1 > originalCaps.sectionParity.capacities[1]);
  assert(minTop5 > originalCaps.position.capacities[5]);
  controls.push({sourcePath, trials:60,
    top1Range:[minTop1, maxTop1], top5Range:[minTop5, maxTop5],
    EMinimum:minE, positivePlant:plantControls,
    positiveArbitrarilySwitchedModes:switchedModeControls});
}
/**
 * Independent corrected Old English Beowulf GP29 register. The source has
 * max word length 13; only 3 of 2,896 original words have 14 GP glyphs.
 * We omit those 3 unrepresented words and compare the COUNT from the
 * 10,021 genuinely source-matched interior GP positions directly against
 * the ALL-10,060-original upper bounds. Completing missing three plaintext
 * words cannot decrease the count of their five most frequent GP glyphs.
 */
function oldEnglishSourceControl() {
  const source = JSON.parse(read("resources/control/beowulf_oe_gp_profile_corrected.json"));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabc";
  const raw = Array.from(source.sourceGpBase29, c => alphabet.indexOf(c));
  assert.equal(raw.length, source.allSourceGpRunes);
  assert.equal(raw.length, 48012);
  assert(raw.every(i => i >= 0 && i < 29));
  const frequency = new Uint32Array(29);
  for (const i of raw) frequency[i]++;
  assert.deepEqual(Array.from(frequency), source.allGpCounts);
  const bins = new Map();
  let offset = 0;
  for (const n of source.allSourceGpWordLengths) {
    const w = raw.slice(offset, offset + n);
    assert.equal(w.length, n);
    if (!bins.has(n)) bins.set(n, []);
    bins.get(n).push(w);
    offset += n;
  }
  assert.equal(offset, raw.length);
  assert.equal(source.allSourceGpWordLengths.length, 10885);
  assert.equal(Math.max(...source.allSourceGpWordLengths), 13);
  const eligible = words.filter(w => w.length <= 13);
  assert.equal(eligible.length, 2893);
  const rngSource = rng(0x44551019);
  let minTop1 = Infinity, maxTop1 = 0, minTop5 = Infinity, maxTop5 = 0;
  for (let trial = 0; trial < 180; trial++) {
    const sampled = eligible.map(w => {
      const options = bins.get(w.length);
      assert(options?.length, "Old English source has no GP word of length " + w.length);
      return options[Math.floor(rngSource() * options.length)];
    });
    const ranks = languageRank(sampled);
    assert.equal(ranks.sites, 10021);
    minTop1 = Math.min(minTop1, ranks.top1);
    maxTop1 = Math.max(maxTop1, ranks.top1);
    minTop5 = Math.min(minTop5, ranks.top5);
    maxTop5 = Math.max(maxTop5, ranks.top5);
  }
  // 10,021 original-matched plaintext sites already require more common
  // source-native runes than the 10,060 original ciphertext sites permit.
  for (const scope of ["global", "section", "position", "color",
      "sectionColor", "positionColor"]) {
    assert(minTop1 > originalCaps[scope].capacities[1]);
    assert(minTop5 > originalCaps[scope].capacities[5]);
  }
  assert(minTop1 > originalCaps.global.capacities[2],
    "Old English also violates arbitrary hidden two-mode state capacity");
  return {corpus:"resources/control/beowulf_oe_gp_profile_corrected.json",
    sourceWords:source.allSourceGpWordLengths.length, sourceRunes:raw.length,
    originalMatchedWords:eligible.length, missingLongSourceWords:3,
    eligibleSites:10021, trials:180,
    top1Range:[minTop1,maxTop1], top5Range:[minTop5,maxTop5],
    fullOriginalTop1Cap:originalCaps.positionColor.capacities[1],
    fullOriginalTop5Cap:originalCaps.positionColor.capacities[5]};
}
const oldEnglish = oldEnglishSourceControl();
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start = lp1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const end = lp1.indexOf("\n$\n%\n", start);
assert(start >= 0 && end > start);
const solvedGP = (lp1.slice(start, end).replace(/\/\n%\n/g, "")
  .replace(/\/\n/g, "").replace(/\n/g, "").match(runeRE) || [])
  .map(w => Array.from(w, r => glyph.get(r)));
assert.equal(solvedGP.length, 181);
const solvedLP1 = languageRank(solvedGP);
assert.equal(solvedLP1.sites, 574);
assert.equal(solvedLP1.E, 98);
const result = {
  status:"PASS all-secret conditional alphabet-capacity theorem; no plaintext recovered",
  original:originalCaps, solvedLP1, controls, oldEnglish
};
console.log(JSON.stringify(result, null, 2));
