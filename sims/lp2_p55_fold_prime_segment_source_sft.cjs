"use strict";

/**
 * Finite source-locked test: the 17-symbol p55 fold key as a segment-indexed
 * starting ordinal for the authentic p56 prime-totient / plaintext-F rule.
 *
 * No language fitting, free phase, or unknown key is used. Each p55 page-local
 * segment receives exactly one key-derived starting ordinal. The two natural
 * key-number readings are GP index and GP prime weight; both key directions
 * and both arithmetic directions are fixed controls.
 *
 * Run: node sims/lp2_p55_fold_prime_segment_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
const mod29 = (n) => ((n % 29) + 29) % 29;

function gpWord(text) {
  const out = [];
  for (let i = 0; i < text.length;) {
    const found = tokens.find(({token}) => text.startsWith(token, i));
    assert.ok(found, "Invalid GP romanization: " + text);
    out.push(found.i);
    i += found.token.length;
  }
  return out;
}

function pageSegments(page) {
  if (page === 50) return [];
  const physicalText = transcription.split("%")[page > 50 ? page - 1 : page];
  return physicalText
    .replaceAll("/", "")
    .replaceAll("\n", "")
    .replaceAll("\r", "")
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean)
    .map((word) => Array.from(word, (r) => runeIndex.get(r)));
}

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

const primeValues = primes(256);
const totients = primeValues.map((p) => p - 1);
const roman = (values) => values.map((i) => corpus.translit[i]).join("");
const p55 = pageSegments(55);
const p55Cipher = corpus.pages.find((p) => p.page === 55).indices;
const expectedLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(p55.length, 17);
assert.deepEqual(p55.map((w) => w.length), expectedLengths);
assert.deepEqual(p55.flat(), p55Cipher);
assert.equal(p55Cipher.length, 76);

const circumferenceKey = gpWord("FIRFUMFERENFE");
const deepWord = gpWord("DEEP");
const compositeKey = circumferenceKey.concat(deepWord);
assert.equal(circumferenceKey.length, 13);
assert.equal(deepWord.length, 4);
assert.equal(compositeKey.length, 17);
assert.equal(circumferenceKey.reduce((s, i) => s + corpus.prime[i], 0), 365);
assert.deepEqual(deepWord, [23,18,18,13]);

// Reconfirm the four-rune DEEP anchor against the untouched solved p56 source.
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
const p56DeepCipher = p56Cipher.slice(12, 16);
const p56Deep = p56DeepCipher.map((c, j) =>
  mod29(c - (primeValues[12 + j] - 1)));
assert.deepEqual(p56Deep, deepWord);
assert.equal(roman(p56DeepCipher), "CTHGW");

// Exact inverse for the historical transparent plaintext-F rule.
// direction=-1 is P=C-phi(prime); direction=+1 is the opposite sign.
// A ciphertext F can be literal plaintext F (no key consumption), or can
// decrypt to a non-F plaintext after consuming a key element.
function invertSegment(cipher, startOrdinal, direction) {
  let states = new Map([[0, 1]]);
  let firstFailure = null;
  for (let offset = 0; offset < cipher.length; offset++) {
    const c = cipher[offset];
    const next = new Map();
    const add = (key, count) => next.set(key, (next.get(key) || 0) + count);
    for (const [consumed, count] of states) {
      if (c === 0) add(consumed, count);
      const plain = mod29(c + direction * totients[startOrdinal + consumed]);
      if (plain !== 0) add(consumed + 1, count);
    }
    states = next;
    if (states.size === 0) {
      firstFailure = offset;
      break;
    }
  }
  return {
    pathCount: [...states.values()].reduce((a, b) => a + b, 0),
    finalConsumed: [...states.keys()].sort((a, b) => a - b),
    firstFailure
  };
}

function invertSegmentOutputs(cipher, startOrdinal, direction) {
  let states = [{consumed: 0, plain: []}];
  for (const c of cipher) {
    const next = [];
    for (const state of states) {
      if (c === 0) next.push({
        consumed: state.consumed,
        plain: state.plain.concat([0])
      });
      const plain = mod29(c + direction * totients[startOrdinal + state.consumed]);
      if (plain !== 0) next.push({
        consumed: state.consumed + 1,
        plain: state.plain.concat([plain])
      });
    }
    states = next;
    if (!states.length) break;
  }
  return states.map((s) => s.plain);
}

function encryptSegment(plain, startOrdinal, inverseDirection) {
  let consumed = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const c = mod29(p - inverseDirection * totients[startOrdinal + consumed]);
    consumed++;
    return c;
  });
}

// Positive control 1: the authentic p56 continuous prime-totient cipher.
// This proves the implemented prime/totient and F-transparent convention.
const p56PlainText =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56Plain = p56PlainText.split(" ").flatMap(gpWord);
assert.equal(p56Plain.length, 85);
function encryptContinuous(plain, startOrdinal) {
  let consumed = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    return mod29(p + totients[startOrdinal + consumed++]);
  });
}
function invertContinuousOutputs(cipher, startOrdinal) {
  let states = [{consumed: 0, plain: []}];
  for (const c of cipher) {
    const next = [];
    for (const state of states) {
      if (c === 0) next.push({
        consumed: state.consumed,
        plain: state.plain.concat([0])
      });
      const p = mod29(c - totients[startOrdinal + state.consumed]);
      if (p !== 0) next.push({
        consumed: state.consumed + 1,
        plain: state.plain.concat([p])
      });
    }
    states = next;
  }
  return states.map((s) => s.plain);
}
assert.deepEqual(encryptContinuous(p56Plain, 0), p56Cipher);
const p56InverseCandidates = invertContinuousOutputs(p56Cipher, 0);
assert.ok(p56InverseCandidates.some((candidate) =>
  candidate.join(",") === p56Plain.join(",")));

// Positive control 2: plant the same 76 clear p57 runes under each exact
// candidate segment schedule, then recover them with the same inverse.
const p57Plain = corpus.pages.find((p) => p.page === 57).indices.slice(0, 76);
assert.equal(p57Plain.length, 76);
const keyOrders = [
  {name: "circumference-then-deep", key: compositeKey},
  {name: "deep-then-circumference", key: compositeKey.slice().reverse()}
];
const mappings = [
  {
    name: "GP rune index as prime ordinal",
    starts: (key) => key.slice()
  },
  {
    name: "GP prime weight as prime ordinal",
    starts: (key) => key.map((i) => corpus.prime[i])
  }
];
const variants = [];
let positivePlants = 0;
for (const mapping of mappings) {
  for (const order of keyOrders) {
    const starts = mapping.starts(order.key);
    for (const direction of [-1, 1]) {
      let cursor = 0;
      const plantedSegments = p55.map((segment, i) => {
        const plain = p57Plain.slice(cursor, cursor + segment.length);
        cursor += segment.length;
        const planted = encryptSegment(plain, starts[i], direction);
        const recovered = invertSegmentOutputs(planted, starts[i], direction);
        assert.ok(recovered.some((candidate) =>
          candidate.join(",") === plain.join(",")));
        return planted;
      });
      assert.equal(cursor, 76);
      positivePlants++;
      const outcomes = plantedSegments.map((cipher, i) =>
        invertSegment(cipher, starts[i], direction));
      assert.ok(outcomes.every((x) => x.pathCount > 0));
      const segments = p55.map((cipher, i) =>
        invertSegment(cipher, starts[i], direction));
      const failed = segments.flatMap((result, i) =>
        result.pathCount === 0 ? [{
          segment: i,
          firstImpossibleRune: result.firstFailure
        }] : []);
      variants.push({
        mapping: mapping.name,
        keyOrder: order.name,
        inverseDirection: direction === -1 ? "C-minus-totient" : "C-plus-totient",
        starts,
        completeOriginalP55: failed.length === 0,
        failedSegments: failed,
        perSegmentPathCounts: segments.map((x) => x.pathCount)
      });
    }
  }
}
assert.equal(positivePlants, 8);
assert.equal(variants.length, 8);
assert.ok(variants.every((v) => !v.completeOriginalP55));
assert.deepEqual(variants.map((v) => v.failedSegments.map((x) => x.segment)), [
  [4,7,11], [2,8,11,14], [4,7], [2,8],
  [7,13], [7,9,11,12], [7], [7,9,11,12,16]
]);

console.log(JSON.stringify({
  evidence: "Finite original-p55 gate for a 17-segment FIRFUMFERENFE+DEEP prime-totient receiver",
  source: {
    originalPage: 55,
    ciphertextRunes: p55Cipher.length,
    pageLocalSegments: p55.length,
    segmentLengths: expectedLengths,
    segmentCiphertext: p55.map(roman)
  },
  candidateKey: {
    text: "FIRFUMFERENFEDEEP",
    gpIndices: compositeKey,
    gpPrimeWeights: compositeKey.map((i) => corpus.prime[i]),
    order: "circumference key followed by authenticated p56 word DEEP",
    sourceStatus: "provisional word-map/fold correspondence, not an authenticated LP2 key"
  },
  authenticP56Control: {
    originalRunes: p56Cipher.length,
    exactForwardReencryption: true,
    knownPlaintextPresentInExactInverse: true,
    plaintextFTransparent: true
  },
  plantedControls: {
    nativeP57Runes: 76,
    segmentScheduleVariants: positivePlants,
    allRecoveredExactly: true
  },
  originalP55Results: variants,
  conclusion: "All eight fixed key-order / numeric-reading / sign combinations have at least one original segment with no legal p56-style inverse. This rejects this finite receiver only; it does not exclude other consumers of the provisional p55 fold material."
}, null, 2));
