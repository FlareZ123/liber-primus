"use strict";

/**
 * LP2 p50 table driven two-word boundary rotation on all 12,956 original runes.
 * Read-only SFT for Windows 11, Node.js 22. Original source files are unchanged.
 *
 * Each adjacent original pair of complete printed words (a,b) is one reversible
 * composition of its S=a+b GP runes. A source p50 byte k is interpreted as a
 * direction in the cyclic group Z/(S-1): a' = 1+((a-1 ± k) mod (S-1)),
 * b' = S-a'. No word can be empty; no rune is inserted, removed, or moved.
 * Separator identities remain attached to their original ordinal positions,
 * and line wraps/page seams remain separately preserved source metadata.
 *
 * This is a hypothesis about applying the signed 2016 words/numbers hint.
 * Nothing in Cicada explicitly prescribes this particular LP2 receiver.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(new Set(bytes).size, 161);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

/**
 * Parse all physical pages 0..55, retaining the genuine printed '-' and '.'
 * as ordinal separator identities. The six numbered heading dashes are not
 * word separators; line breaks/page turns are never fabricated word ends.
 * @returns {{runes:number[],lengths:number[],marks:string[]}}
 */
function originalWords() {
  const parts = transcript.split("%");
  assert.equal(parts.length, 57);
  const runes = [], lengths = [], marks = [];
  let word = 0;
  for (let page = 0; page <= 55; page++) {
    if (page === 50) continue;
    const raw = parts[page < 50 ? page : page - 1].replace(/[1-7]-/g, "");
    for (const glyph of raw) {
      if (runeIndex.has(glyph)) {
        runes.push(runeIndex.get(glyph));
        word++;
      } else if ((glyph === "-" || glyph === ".") && word > 0) {
        lengths.push(word);
        marks.push(glyph);
        word = 0;
      }
    }
  }
  assert.equal(word, 0);
  assert.equal(runes.length, 12956);
  assert.equal(lengths.length, 2896);
  assert.equal(marks.length, 2896);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
  assert.deepEqual(runes, corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
  return {runes, lengths, marks};
}

/**
 * @param {number[]} lengths
 * @param {number[]} key Full 256-byte table.
 * @param {1|-1} direction
 * @returns {number[]}
 */
function rotatePairs(lengths, key, direction) {
  const output = lengths.slice();
  for (let i = 0; i + 1 < lengths.length; i += 2) {
    const sum = lengths[i] + lengths[i + 1];
    const modulus = sum - 1;
    const residue = ((lengths[i] - 1 + direction * key[(i / 2) % 256]) % modulus + modulus) % modulus;
    output[i] = residue + 1;
    output[i + 1] = sum - output[i];
  }
  return output;
}

/** @param {number[]} lengths @param {number[]} runes @param {string[]} marks */
function tape(lengths, runes, marks) {
  let offset = 0, source = "";
  for (let i = 0; i < lengths.length; i++) {
    for (let j = 0; j < lengths[i]; j++) source += corpus.runes[runes[offset + j]];
    offset += lengths[i];
    source += marks[i];
  }
  assert.equal(offset, runes.length);
  return source;
}

/** @param {number[]} lengths */
function stats(lengths) {
  const singles = lengths.filter(x => x === 1).length;
  const twos = lengths.filter(x => x === 2).length;
  const short = singles + twos;
  let shortPairs = 0;
  for (let i = 1; i < lengths.length; i++)
    if (lengths[i] <= 2 && lengths[i - 1] <= 2) shortPairs++;
  return {
    words: lengths.length,
    ones: singles,
    twos,
    short,
    shortPairs,
    shortPairRatio: shortPairs / (short * (short - 1) / lengths.length),
    max: Math.max(...lengths)
  };
}

const dictionary = corpus.translit.slice().sort((a, b) => b.length - a.length);
/** @param {string} word @returns {number} */
function nativeGPLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let count = 0;
  for (let i = 0; i < s.length;) {
    const n = s.startsWith("ING", i) ? 3
      : s.startsWith("IO", i) ? 2
      : (dictionary.find(tok => s.startsWith(tok, i)) || "").length;
    assert(n > 0, "unencodable English word " + word);
    i += n;
    count++;
  }
  return count;
}

/** @param {string} source @returns {number[]} */
function nativeLengths(source) {
  return (source.match(/[A-Za-z]+/g) || []).map(nativeGPLength);
}

/** @param {number[]} a @returns {number} */
const bin = a => Math.min(11, a - 1);
const gibran = nativeLengths(read("resources/control/gibran_prophet_58585.txt"));
const shakespeare = nativeLengths(read("resources/control/shakespeare_first300k.txt"));
assert.deepEqual([gibran.length, shakespeare.length], [15733, 55407]);
const K = 12;
const pair = Array.from({length: K}, () => Array(K).fill(0));
const lhs = Array(K).fill(0), rhs = Array(K).fill(0);
let total = 0;
for (const [sample, end] of [[gibran, 8500], [shakespeare, 40000]]) {
  for (let i = 1; i < end; i++) {
    const a = bin(sample[i - 1]), b = bin(sample[i]);
    pair[a][b]++;
    lhs[a]++;
    rhs[b]++;
    total++;
  }
}
const likelihood = pair.map((row, a) => row.map((count, b) =>
  Math.log((count + 2) / (lhs[a] + 2 * K))
    - Math.log((rhs[b] + 2) / (total + 2 * K))));

/** @param {number[]} lengths @returns {number} */
function grammar(lengths) {
  let score = 0;
  for (let i = 1; i < lengths.length; i++)
    score += likelihood[bin(lengths[i - 1])][bin(lengths[i])];
  return score / (lengths.length - 1);
}

/** @param {number} seed @returns {number[]} */
function shuffledTable(seed) {
  const rows = Array.from({length: 32}, (_, i) => i);
  let state = Math.imul(seed + 1, 0x9e3779b1) >>> 0;
  /** @returns {number} */
  function next() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  for (let i = rows.length - 1; i > 0; i--) {
    const other = next() % (i + 1);
    [rows[i], rows[other]] = [rows[other], rows[i]];
  }
  return rows.flatMap(r => bytes.slice(r * 8, r * 8 + 8));
}

/**
 * Source rune interval, respecting printed words continued across pages:
 * only report complete decoded word objects contained inside the target.
 * @param {number[]} lengths @param {number} low @param {number} high
 */
function region(lengths, low, high) {
  const subset = [];
  let offset = 0, recoveredRunes = 0;
  for (const len of lengths) {
    if (offset >= low && offset + len <= high) {
      subset.push(len);
      recoveredRunes += len;
    }
    offset += len;
  }
  assert(recoveredRunes >= 250);
  return {runes: recoveredRunes, words: subset.length, score: grammar(subset), ...stats(subset)};
}

function main() {
  const original = originalWords();
  const baseline = grammar(original.lengths);
  const decoded = [], candidate = [];
  for (const direction of [1, -1]) {
    const candidateLengths = rotatePairs(original.lengths, bytes, direction);
    const reencoded = rotatePairs(candidateLengths, bytes, /** @type {1|-1} */ (-direction));
    assert.deepEqual(reencoded, original.lengths);
    // Rune identities and exact separator identities travel unchanged.
    assert.equal(tape(reencoded, original.runes, original.marks),
      tape(original.lengths, original.runes, original.marks));
    assert.equal(candidateLengths.reduce((a, b) => a + b, 0), 12956);
    assert.ok(candidateLengths.every(n => n >= 1));
    candidate.push(candidateLengths);
    decoded.push({direction, nativeGrammar: grammar(candidateLengths),
      whole: stats(candidateLengths),
      developmentP16to21: region(candidateLengths, 3762, 5375),
      heldoutP40to53: region(candidateLengths, 9640, 12648)});
  }

  // Actual clear PARABLE p57 is a typed, creator-authentic source-native plant.
  const solved = transcript.slice(transcript.lastIndexOf("%") + 1);
  const p57RuneCount = Array.from(solved).filter(ch => runeIndex.has(ch)).length;
  assert.equal(p57RuneCount, 95);
  const p57Lens = [], p57Marks = [];
  let word = 0;
  for (const ch of solved) {
    if (runeIndex.has(ch)) word++;
    else if ((ch === "-" || ch === ".") && word) {
      p57Lens.push(word); p57Marks.push(ch); word = 0;
    }
  }
  assert.equal(p57Lens.length, 20);
  for (const direction of [1, -1]) {
    const encrypted = rotatePairs(p57Lens, bytes, /** @type {1|-1} */ (-direction));
    assert.deepEqual(rotatePairs(encrypted, bytes, direction), p57Lens);
  }

  // Independent native sources: train only on initial 8500/40000 words.
  const nativeScores = [
    grammar(gibran.slice(9000, 9000 + 2896)),
    grammar(shakespeare.slice(45000, 45000 + 2896))
  ];
  const singletonWindows = [gibran, shakespeare].map(text => {
    const counts = [];
    for (let start = 0; start + 2896 <= text.length; start += 97) {
      counts.push(text.slice(start, start + 2896).filter(x => x === 1).length);
    }
    return [Math.min(...counts), Math.max(...counts)];
  });
  assert.deepEqual(singletonWindows, [[66, 126], [129, 207]]);
  const shuffles = 1000, nulls = [[], []];
  for (let i = 0; i < shuffles; i++) {
    const wrong = shuffledTable(i);
    for (let k = 0; k < 2; k++) {
      nulls[k].push(grammar(rotatePairs(original.lengths, wrong, k === 0 ? 1 : -1)));
    }
  }
  const wrongKey = nulls.map((values, k) => {
    const exceed = values.filter(value => value >= decoded[k].nativeGrammar).length;
    return {direction: decoded[k].direction,
      mean: values.reduce((s, v) => s + v, 0) / values.length,
      exceed, addOneP: (exceed + 1) / (shuffles + 1)};
  });

  assert.equal(original.lengths.length, 2896);
  assert.deepEqual(decoded.map(x => x.whole.ones), [460, 410]);
  assert.deepEqual(wrongKey.map(x => x.exceed), [404, 316]);
  console.log(JSON.stringify({
    source: {runes: original.runes.length, words: original.lengths.length,
      marks: original.marks.length, tableCells: bytes.length,
      nativeGrammar: baseline, ...stats(original.lengths)},
    sourceNative: {p57Runes: p57RuneCount, p57Words: p57Lens.length,
      grammarHeldouts: nativeScores, singletonWindowRanges: singletonWindows},
    candidates: decoded,
    tableRowPermutationNull: wrongKey,
    verdict: "NO PLAINTEXT: reversible gap shifts are not source-specific " +
      "under 1000 original-table-row permutations; decoded singleton " +
      "word excess is incompatible with both tested natural GP donors"
  }, null, 2));
}
main();
