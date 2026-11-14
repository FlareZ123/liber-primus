"use strict";

/**
 * Original LP2 p57 95-rune key / original repeated-rune event clock.
 *
 * Independent source selectors: nine original-image visual chapters,
 * 86 same-rune ciphertext transitions, and the 95 GP runes of solved p57.
 * Together, the chapters plus doublets define 95 source-determined runs.
 *
 * One online and fully reversible cipher rule:
 *   C_i = (P_i + K[event]) mod 29
 *   advance event after an output repeat, and once at a chapter start.
 * K is, without fitted phase, p57 GP rune ordinals or phi(GP prime weights).
 *
 * This model is a narrow conditional original-input rejection. A separate
 * exact pair-collision invariant covers all 95 independent hidden alphabets.
 *
 * Run from repository root under Node 22:
 *   node sims/lp2_p57_95packet_eventclock_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const page = n => corpus.pages.find(p => p.page === n).indices;
const chapterRanges = [[0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]];
const chapterCipher = chapterRanges.map(([start, end]) =>
  corpus.pages.filter(p => p.page >= start && p.page <= end)
    .flatMap(p => p.indices));
const sourceKey = page(57);
const mod29 = n => (n % 29 + 29) % 29;
assert.deepEqual(chapterCipher.map(c => c.length),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(chapterCipher.reduce((n, c) => n + c.length, 0), 12956);
assert.equal(sourceKey.length, 95);

const repeatCounts = chapterCipher.map(c =>
  c.slice(1).filter((v, i) => v === c[i]).length);
assert.deepEqual(repeatCounts, [4,6,9,10,11,13,12,18,3]);
assert.equal(repeatCounts.reduce((a, b) => a + b, 0), 86);
assert.equal(repeatCounts.length +
  repeatCounts.reduce((a, b) => a + b, 0), sourceKey.length);

/**
 * @param {number[][]} cipher - chapter-separated GP29 symbols
 * @param {number[]} key - source key in GP29 shift residues
 * @returns {{plain:number[][], keyIndices:number[][], totalUsed:number}}
 */
function decrypt(cipher, key) {
  const plain = [], keyIndices = [];
  let index = -1;
  for (const chapter of cipher) {
    index++;
    let previous = -1;
    const dest = [], marks = [];
    for (const c of chapter) {
      assert(index >= 0 && index < key.length);
      dest.push(mod29(c - key[index]));
      marks.push(index);
      if (c === previous) index++;
      previous = c;
    }
    plain.push(dest);
    keyIndices.push(marks);
  }
  return {plain, keyIndices, totalUsed: index + 1};
}

/**
 * @param {number[][]} plain
 * @param {number[]} key
 * @returns {number[][]}
 */
function encrypt(plain, key) {
  const ciphertext = [];
  let index = -1;
  for (const chapter of plain) {
    index++;
    const out = [];
    let previous = -1;
    for (const p of chapter) {
      assert(index >= 0 && index < key.length);
      const c = mod29(p + key[index]);
      out.push(c);
      if (c === previous) index++;
      previous = c;
    }
    ciphertext.push(out);
  }
  return ciphertext;
}

/** @param {number[]} values */
function stats(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  const ioc = hist.reduce((s, x) => s + x * (x - 1), 0) /
    (values.length * (values.length - 1));
  return {runes: values.length, ioc, eCount: hist[18],
    first50: values.slice(0, 50).map(x => corpus.translit[x]).join(".")};
}

const keyOptions = {
  gpOrdinal: sourceKey,
  primeTotient: sourceKey.map(x => mod29(corpus.prime[x] - 1))
};
const results = {};
for (const [name, key] of Object.entries(keyOptions)) {
  const decoded = decrypt(chapterCipher, key);
  assert.equal(decoded.totalUsed, 95);
  assert.deepEqual(encrypt(decoded.plain, key), chapterCipher);
  const flat = decoded.plain.flat();
  const measured = stats(flat);
  results[name] = measured;
}

// Positive source-native encoding control on every real clear p57 glyph.
// The key pointer can advance fewer times than on the original; that is
// a feature of an online self-synchronizing output-event clock.
const known = page(57);
const planted = encrypt([known], sourceKey);
assert.deepEqual(decrypt(planted, sourceKey).plain, [known]);

/**
 * Fixed-event key-invariant theorem.
 * Each of the 95 source-observed packets owns one unknown 29-symbol
 * permutation. Two symbols inside a packet are equal before encryption
 * exactly when they are equal after encryption. Pair collisions are thus
 * preserved under every possible set of 95 independent secret alphabets.
 *
 * @param {number[][]} chapters
 * @returns {number[][]}
 */
function splitAtOutputDoublets(chapters) {
  const packets = [];
  for (const chapter of chapters) {
    let begin = 0;
    for (let i = 1; i < chapter.length; i++) {
      if (chapter[i] === chapter[i - 1]) {
        packets.push(chapter.slice(begin, i + 1));
        begin = i + 1;
      }
    }
    packets.push(chapter.slice(begin));
  }
  return packets;
}

/** @param {number[][]} packets */
function collisionPairs(packets) {
  let pairs = 0;
  for (const packet of packets) {
    const hist = Array(29).fill(0);
    for (const rune of packet) hist[rune]++;
    pairs += hist.reduce((sum, n) => sum + n * (n - 1) / 2, 0);
  }
  return pairs;
}
const sourcePackets = splitAtOutputDoublets(chapterCipher);
const packetLengths = sourcePackets.map(packet => packet.length);
assert.equal(packetLengths.length, 95);
assert.equal(packetLengths.reduce((a, b) => a + b, 0), 12956);
assert.equal(Math.min(...packetLengths), 6);
assert.equal(Math.max(...packetLengths), 662);
const packetOpportunities = packetLengths.reduce(
  (sum, n) => sum + n * (n - 1) / 2, 0);
const sourcePacketPairs = collisionPairs(sourcePackets);
assert.equal(packetOpportunities, 1653451);
assert.equal(sourcePacketPairs, 56482);

/** @param {number[]} flat */
function fixedSourcePacketScore(flat) {
  let offset = 0;
  const parts = packetLengths.map(length => {
    const part = flat.slice(offset, offset + length);
    offset += length;
    return part;
  });
  assert.equal(offset, flat.length);
  return collisionPairs(parts);
}

// Native GP control encoder copied from the project's established
// previous-ciphertext-feedback entropy positive/reference calibration.
const nativeTokens = corpus.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);
/** @param {string} source */
function encodeNativeGP(source) {
  const result = [];
  const normalized = source.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = nativeTokens.find(t => word.startsWith(t.text, i));
      assert(token, "unmapped GP letter/digraph");
      result.push(token.index);
      i += token.text.length;
    }
  }
  return result;
}

const controlSources = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const controlSummary = controlSources.map(([name, relative]) => {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const native = encodeNativeGP(source);
  const scored = [];
  for (let start = 0; start + 12956 <= native.length; start += 6478) {
    scored.push(fixedSourcePacketScore(native.slice(start, start + 12956)));
  }
  scored.sort((a, b) => a - b);
  assert(scored.length > 0);
  assert(scored[0] > sourcePacketPairs);
  return {name, windows: scored.length, min: scored[0],
    median: scored[Math.floor(scored.length / 2)], max: scored.at(-1)};
});
assert.deepEqual(controlSummary.map(x => x.windows), [32, 8, 49]);
assert.deepEqual(controlSummary.map(x => x.min), [97001, 99357, 100937]);

// Secret-permutation positives on the authentic original chapter clock:
// every event slot has its own fully unrelated 29-symbol bijection,
// constructed without observing the plaintext or ciphertext.
let randomState = 0x3301761;
const rand = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState;
};
function permutation() {
  const table = Array.from({length: 29}, (_, i) => i);
  for (let i = table.length - 1; i > 0; i--) {
    const j = rand() % (i + 1);
    [table[i], table[j]] = [table[j], table[i]];
  }
  return table;
}
const tables = Array.from({length: 95}, permutation);
const inverseTables = tables.map(table => {
  const inverse = Array(29).fill(-1);
  table.forEach((v, i) => { inverse[v] = i; });
  return inverse;
});

/**
 * @param {number[][]} chapters
 * @param {"encrypt"|"decrypt"} operation
 */
function applySecretPacketPermutation(chapters, operation) {
  let event = -1;
  const output = [];
  for (const chapter of chapters) {
    event++;
    let previous = -1;
    const out = [];
    for (const rune of chapter) {
      assert(event >= 0 && event < 95);
      const transformed = operation === "encrypt"
        ? tables[event][rune] : inverseTables[event][rune];
      out.push(transformed);
      const currentCipher = operation === "encrypt" ? transformed : rune;
      if (currentCipher === previous) event++;
      previous = currentCipher;
    }
    output.push(out);
  }
  return output;
}
const arbitraryOriginalPlain = applySecretPacketPermutation(
  chapterCipher, "decrypt");
assert.deepEqual(applySecretPacketPermutation(
  arbitraryOriginalPlain, "encrypt"), chapterCipher);
// The original ciphertext event boundaries must be retained, because
// a new permutation can change equality across an event boundary.
assert.equal(fixedSourcePacketScore(arbitraryOriginalPlain.flat()),
  sourcePacketPairs);
const arbitraryKnownCipher = applySecretPacketPermutation([known], "encrypt");
assert.deepEqual(applySecretPacketPermutation(
  arbitraryKnownCipher, "decrypt"), [known]);

// One finite route past the fixed-alphabet obstruction: use the already
// authenticated p56 consecutive-prime-totient operator, restarting at each
// original output-doublet event. The clear p57 rune in that event slot
// supplies the ordinal of the first prime. No free offset, F bypass,
// synthetic expansion or plaintext-dependent phase is selected.
/** @param {number} count */
function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(n);
  }
  return result;
}
const primeList = firstPrimes(1000);
/**
 * @param {number[][]} chapters
 * @param {"encrypt"|"decrypt"} operation
 * @returns {{chapters:number[][],slots:number}}
 */
function packetPrimeTotient(chapters, operation) {
  let event = -1;
  const output = [];
  for (const chapter of chapters) {
    event++;
    let local = 0;
    let previousCipher = -1;
    const next = [];
    for (const rune of chapter) {
      assert(event >= 0 && event < sourceKey.length);
      const primeIndex = sourceKey[event] + local;
      const shift = mod29(primeList[primeIndex] - 1);
      const converted = operation === "encrypt"
        ? mod29(rune + shift) : mod29(rune - shift);
      next.push(converted);
      const ciphertextRune = operation === "encrypt" ? converted : rune;
      if (ciphertextRune === previousCipher) {
        event++;
        local = 0;
      } else {
        local++;
      }
      previousCipher = ciphertextRune;
    }
    output.push(next);
  }
  return {chapters: output, slots: event + 1};
}
const totientOriginal = packetPrimeTotient(chapterCipher, "decrypt");
assert.equal(totientOriginal.slots, 95);
assert.deepEqual(packetPrimeTotient(
  totientOriginal.chapters, "encrypt").chapters, chapterCipher);
const totientKnownPlant = packetPrimeTotient([known], "encrypt");
assert.deepEqual(packetPrimeTotient(
  totientKnownPlant.chapters, "decrypt").chapters, [known]);
const totientOriginalStats = stats(totientOriginal.chapters.flat());
assert.ok(Math.abs(totientOriginalStats.ioc - 0.034452564503269625) < 1e-12);
assert.equal(totientOriginalStats.eCount, 469);

const summary = {
  finding: "source 95-key coincidence, both frozen direct online consumers nonprose",
  chapterRuneCounts: chapterCipher.map(c => c.length),
  chapterDoublets: repeatCounts,
  chapterPacketCounts: repeatCounts.map(n => n + 1),
  doublets: 86,
  chapterCount: 9,
  p57KnownRuneCount: sourceKey.length,
  sourceP57: stats(sourceKey),
  originalDirectKeyTests: results,
  sourceIndexedPacketPrimeTotient: {
    ...totientOriginalStats,
    originalRoundtrip: true,
    clearP57PositiveRoundtrip: true
  },
  allSecretPacketPermutationInvariant: {
    observedSameSymbolPairs: sourcePacketPairs,
    allWithinPacketPositionPairs: packetOpportunities,
    observedSameSymbolPairRate: sourcePacketPairs / packetOpportunities,
    independentNativeEnglishControlWindows: controlSummary,
    arbitrary95SecretAlphabetOriginalRoundtrip: true,
    genuineP57PlaintextPlantRoundtrip: true
  },
  originalForwardReconstruction: true,
  knownSourcePositiveRunes: known.length,
  positiveControlExact: true,
  missingCausalSelector: "No Cicada instruction maps doublet events to a p57 keystream or selects the conversion"
};
console.log(JSON.stringify(summary, null, 2));
