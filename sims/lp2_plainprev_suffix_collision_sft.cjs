"use strict";

/**
 * Original-source key-independent suffix-collision obstruction for a
 * GP29 encoder whose current output depends on the current plaintext
 * and at most m previous plaintext runes. Windows 11 / Node.js 22 SFT.
 *
 * Reads repo source files only. No network, external packages or key fitting.
 * Invoke with: node sims/lp2_plainprev_suffix_collision_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIds = new Map(gp.runes.map((s, i) => [s, i]));
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const chapterEnds = [2, 7, 14, 22, 26, 32, 39, 53, 55];

/** Source-native GP spelling, including original solved ING and IO forms. */
function encode(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (text.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find(x => text.startsWith(x.s, i));
      assert(token, "unrecognized GP spelling: " + word);
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}

const sourceCalibration = [
  ["FOLLOWING", "ᚠᚩᛚᛚᚩᚹᛝ"],
  ["THINGS", "ᚦᛝᛋ"],
  ["STRONG", "ᛋᛏᚱᚩᛝ"],
  ["FUNCTION", "ᚠᚢᚾᚳᛏᛡᚾ"],
  ["CONSUMPTION", "ᚳᚩᚾᛋᚢᛗᛈᛏᛡᚾ"],
  ["BEHAVIORS", "ᛒᛖᚻᚪᚢᛡᚱᛋ"],
  ["GREAT", "ᚷᚱᛠᛏ"],
  ["QUESTION", "ᚳᚹᛖᛋᛏᛡᚾ"]
];
for (const [latin, runes] of sourceCalibration) {
  assert.equal(encode(latin).map(i => gp.runes[i]).join(""), runes);
}

const original = parseSharedCorpus();
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
const originalRows = original.words.map(w => ({
  startPage: w.startPage,
  endPage: w.endPage,
  seq: [...w.runes].map(x => {
    assert(runeIds.has(x), "unknown original GP glyph");
    return runeIds.get(x);
  })
}));
assert.equal(originalRows.reduce((n, w) => n + w.seq.length, 0), 12956);

/** Return a key for the public original chapter/page reset policy. */
function groupId(w, scope) {
  if (scope === "global") return 0;
  const physical = physicalLP2Page(w.startPage);
  if (scope === "page") return physical;
  const chapter = chapterEnds.findIndex(end => physical <= end);
  assert(chapter >= 0);
  return chapter;
}

/**
 * Count unordered equal-suffix word pairs, keeping each reset group distinct.
 * Only words with the entire necessary plain suffix in one physical page
 * are used in the chapter/page-scoped bound.
 */
function collisionPairs(rows, suffixLength, scope) {
  const hist = new Map();
  for (const w of rows) {
    assert(w.seq.length >= suffixLength);
    const key = groupId(w, scope) + ":" + w.seq.slice(-suffixLength).join(",");
    hist.set(key, (hist.get(key) || 0) + 1);
  }
  let count = 0;
  for (const n of hist.values()) count += n * (n - 1) / 2;
  return count;
}

/** Filter original positions whose entire word is printed on one page. */
const completeOnly = rows =>
  rows.filter(w => w.startPage === w.endPage);

/** Deterministic xorshift32 used only for unkeyed source-control sampling. */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

const sources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => {
  const pool = new Map();
  for (const word of (read(file).toUpperCase().match(/[A-Z]+/g) || [])) {
    const seq = encode(word);
    if (seq.length < 3) continue;
    const row = pool.get(seq.length) || [];
    row.push(seq);
    pool.set(seq.length, row);
  }
  return {name, file, pool};
});

/**
 * Select intact naturally occurring GP words without replacing any corpus
 * occurrence until the length stratum has been exhausted. Every selected
 * word has the exact printed GP rune length of the original slot it fills.
 * A single Shakespeare length-14 source token may be reused for 3 slots.
 */
function sampleNative(slots, source, rng) {
  const available = new Map();
  const needed = new Map();
  for (const slot of slots) {
    const len = slot.seq.length;
    needed.set(len, (needed.get(len) || 0) + 1);
  }
  for (const [len, row] of source.pool) {
    if (!needed.has(len)) continue;
    assert(row.length > 0, source.name + " missing GP length " + len);
    const shuffled = row.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    available.set(len, shuffled);
  }
  const cursor = new Map();
  return slots.map(slot => {
    const len = slot.seq.length;
    const index = cursor.get(len) || 0;
    cursor.set(len, index + 1);
    const choices = available.get(len);
    return {startPage: slot.startPage, endPage: slot.endPage,
      seq: choices[index % choices.length]};
  });
}

/** One full original plus all three source-native control scopes. */
function evaluate(memory, trials = 64) {
  const needed = memory + 2;
  const slots = originalRows.filter(w => w.seq.length >= needed);
  const completed = completeOnly(slots);
  const originalCounts = {
    global: collisionPairs(slots, 2, "global"),
    chapter: collisionPairs(completed, 2, "chapter"),
    page: collisionPairs(completed, 2, "page")
  };
  const observedChecks = {
    1: [3479, 458, 52],
    2: [1686, 204, 24],
    3: [809, 83, 6],
    4: [389, 35, 2]
  };
  assert.deepEqual(Object.values(originalCounts), observedChecks[memory]);
  const controls = [];
  let witness = null;
  for (let s = 0; s < sources.length; s++) {
    const rng = random(0x330120 + memory * 1000 + s);
    const values = [];
    for (let trial = 0; trial < trials; trial++) {
      const sample = sampleNative(slots, sources[s], rng);
      if (memory === 3 && s === 1 && trial === 0) witness = sample;
      const complete = completeOnly(sample);
      values.push({
        global: collisionPairs(sample, needed, "global"),
        chapter: collisionPairs(complete, needed, "chapter"),
        page: collisionPairs(complete, needed, "page")
      });
    }
    const minima = {};
    const belowOrEqualOriginal = {};
    for (const scope of ["global", "chapter", "page"]) {
      minima[scope] = Math.min(...values.map(v => v[scope]));
      belowOrEqualOriginal[scope] =
        values.filter(v => v[scope] <= originalCounts[scope]).length;
      if (memory <= 3 && scope !== "global") {
        assert.equal(belowOrEqualOriginal[scope], 0,
          "unexcluded source scope: " + sources[s].name + "/" + scope);
      }
      if (memory <= 2 && scope === "global") {
        assert.equal(belowOrEqualOriginal[scope], 0,
          "unexcluded global source " + sources[s].name);
      }
    }
    controls.push({source: sources[s].name, trials, minima, belowOrEqualOriginal});
  }
  return {
    memory, neededPlainSuffix: needed,
    wordSlots: slots.length, pageContainedSlots: completed.length,
    originalCounts, controls, witness
  };
}

/**
 * Positive control: a fully secret row-permutation for every m-rune
 * predecessor context and every chosen source reset scope. Word initials
 * are unconstrained and independently encrypted. Known-key inverse
 * recovers every native plaintext letter and the exact bound must hold.
 */
function plantedPositive(nativeRows, memory, scope, seed) {
  const rng = random(seed);
  const table = new Map();
  const index = (w, values, j) =>
    groupId(w, scope) + ":" + values.slice(j - memory, j).join(",");
  const getRow = key => {
    let entry = table.get(key);
    if (entry) return entry;
    const out = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rng() % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    const inv = Array(29);
    out.forEach((v, i) => { inv[v] = i; });
    entry = {out, inv};
    table.set(key, entry);
    return entry;
  };
  const selected = scope === "global" ? nativeRows : completeOnly(nativeRows);
  const encoded = [];
  let n = 0;
  for (const w of selected) {
    const c = [];
    for (let j = 0; j < w.seq.length; j++) {
      c.push(j < memory ? rng() % 29 :
        getRow(index(w, w.seq, j)).out[w.seq[j]]);
    }
    const recovered = w.seq.slice(0, memory);
    for (let j = memory; j < c.length; j++) {
      const key = index(w, recovered, j);
      recovered.push(getRow(key).inv[c[j]]);
    }
    assert.deepEqual(recovered, w.seq);
    encoded.push({...w, seq: c});
    n += c.length;
  }
  const lhs = collisionPairs(selected, memory + 2, scope);
  const rhs = collisionPairs(encoded, 2, scope);
  assert(rhs >= lhs, "same-suffix necessary inequality");
  return {scope, memory, words: selected.length,
    runes: n, secretRows: table.size,
    plainSuffixPairs: lhs, cipherSuffixPairs: rhs,
    fullyRecovered: true};
}

const reports = [1, 2, 3, 4].map(m => evaluate(m));
assert.deepEqual(reports.map(x => x.wordSlots), [2365, 1645, 1132, 815]);
assert.deepEqual(reports.map(x => x.pageContainedSlots), [2333, 1617, 1108, 797]);
const witness = reports[2].witness;
assert(witness && witness.length === 1132);
const positives = [];
for (const memory of [1, 2, 3]) {
  // The held-out Gibran source has exactly the original word lengths.
  const native = witness.filter(w => w.seq.length >= memory + 2);
  for (const [i, scope] of ["global", "chapter", "page"].entries()) {
    positives.push(plantedPositive(native, memory, scope,
      0x33015300 + memory * 101 + i));
  }
}
assert.equal(positives.length, 9);

// m=4 is deliberately retained as an empirical boundary: page-private
// sources do sometimes fit, so broad claims beyond three-rune memory fail.
const emersonM4 = reports[3].controls[2];
assert(emersonM4.belowOrEqualOriginal.page > 0);
assert(emersonM4.belowOrEqualOriginal.chapter > 0);

console.log(JSON.stringify({
  status: "Original-source bounded negative; no unknown plaintext/key",
  model: "C[i] = Q[scope, P[i-m] ... P[i-1]][P[i]]",
  originalRrunes: original.runeCount,
  originalWords: original.words.length,
  originalCrossPageWords: original.crossPageWords,
  calibratedSourceNativeExamples: sourceCalibration.length,
  results: reports.map(({witness, ...rest}) => rest),
  nativeEncryptedPositive: positives,
  limit: "English-register finite controls; no source proof of cipher",
  memoryFourCounterexample: emersonM4
}, null, 2));
