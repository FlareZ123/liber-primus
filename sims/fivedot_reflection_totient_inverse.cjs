"use strict";

/**
 * Source-directed five-dot-reflection / solved-page-56 totient inverse.
 *
 * Tests whether the reflected five-dot art on LP2 pages 7 and 23
 * instructs using the authenticated page-56 prime-totient cipher in
 * reflected physical-line reading order.
 *
 * Exact observed glyph order comes from the project master transcription.
 * All inputs are the checked-in original rune corpus and English controls.
 *
 * Run: node sims/fivedot_reflection_totient_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const master = fs.readFileSync(
  path.join(ROOT, "resources/transcriptions/liber_primus_master.txt"), "utf8").split("%");
const gpRune = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpText = new Map(corpus.translit.map((text, index) => [text, index]));
const modes = ["I", "H", "V", "HV"];

/**
 * Encode ordinary English using the repository's established GP spelling.
 * @param {string} text
 * @returns {number[]}
 */
function toGematria(text) {
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (gpText.has(pair)) {
        result.push(gpText.get(pair));
        i += 2;
      } else {
        if (gpText.has(word[i])) result.push(gpText.get(word[i]));
        i++;
      }
    }
  }
  return result;
}

const shakespeare = toGematria(fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8"));
assert.equal(shakespeare.length, 218800, "Expected frozen English GP reference");
const bigram = new Uint32Array(29 * 29);
const trigram = new Uint32Array(29 * 29 * 29);
for (let i = 2; i < shakespeare.length; i++) {
  const prefix = shakespeare[i - 2] * 29 + shakespeare[i - 1];
  bigram[prefix]++;
  trigram[prefix * 29 + shakespeare[i]]++;
}

/**
 * Frozen add-half smoothed conditional GP trigram score.
 * @param {number[]} values
 * @returns {number}
 */
function score(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i++) {
    const prefix = values[i - 2] * 29 + values[i - 1];
    sum += Math.log((trigram[prefix * 29 + values[i]] + 0.5) /
      (bigram[prefix] + 14.5));
  }
  return sum / (values.length - 2);
}

/**
 * Separate printed lines preserve the actual vertical/horizontal axes.
 * The 75-page master starts LP2 p0 at master section 16; original
 * image 17.jpg is LP2 p0. This is independently checked against JSON.
 * @param {number} physicalPage
 * @returns {number[][]}
 */
function printedLines(physicalPage) {
  const lines = master[physicalPage + 16].split(/\r?\n/)
    .map((line) => [...line].filter((r) => gpRune.has(r)).map((r) => gpRune.get(r)))
    .filter((line) => line.length > 0);
  assert.deepEqual(lines.flat(), corpus.pages[physicalPage].indices,
    "Master/corpus page mismatch at " + physicalPage);
  return lines;
}

/**
 * A 2D reflection of the row layout; reversing a visual line differs
 * from reversing all runes when line widths vary.
 * @param {number[][]} lines
 * @param {"I"|"H"|"V"|"HV"} mode
 * @returns {number[][]}
 */
function reflect(lines, mode) {
  const rows = lines.map((line) => line.slice());
  if (mode.includes("V")) rows.reverse();
  if (mode.includes("H")) return rows.map((row) => row.reverse());
  return rows;
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let value = 2; out.length < count; value++) {
    let prime = true;
    for (let d = 2; d * d <= value; d++) {
      if (value % d === 0) { prime = false; break; }
    }
    if (prime) out.push(value);
  }
  return out;
}

const primes = firstPrimes(600);

/**
 * Only zero glyphs can be literal F interrupters. Literal F outputs F
 * without advancing the prime stream. Other outputs advance the key.
 * @param {number[]} ciphertext
 * @param {"phi"|"prime"} keyMode
 * @param {-1|1} sign
 * @param {number} start
 * @param {number} literalMask Bits over occurrences of output F, in order.
 * @returns {number[]}
 */
function decode(ciphertext, keyMode, sign, start, literalMask) {
  let k = start, seenF = 0;
  const output = [];
  for (const glyph of ciphertext) {
    if (glyph === 0) {
      const literal = (literalMask & (1 << seenF)) !== 0;
      seenF++;
      if (literal) { output.push(0); continue; }
    }
    const shift = keyMode === "phi" ? primes[k++] - 1 : primes[k++];
    output.push(mod29(glyph + sign * shift));
  }
  return output;
}

/**
 * Forward encoder for exact implementation-control round trips.
 * literalPositions are fixed plaintext indices, not unknown key choices.
 * @param {number[]} plaintext
 * @param {"phi"|"prime"} keyMode
 * @param {-1|1} sign
 * @param {number} start
 * @param {Set<number>} literalPositions
 * @returns {number[]}
 */
function encode(plaintext, keyMode, sign, start, literalPositions) {
  let k = start;
  return plaintext.map((glyph, i) => {
    if (literalPositions.has(i)) {
      assert.equal(glyph, 0, "A literal-F position must decode to F");
      return 0;
    }
    const shift = keyMode === "phi" ? primes[k++] - 1 : primes[k++];
    return mod29(glyph - sign * shift);
  });
}

/**
 * @param {number[]} ciphertext
 * @param {number} mask
 * @returns {Set<number>}
 */
function literalPositions(ciphertext, mask) {
  const result = new Set();
  let seen = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    if (ciphertext[i] !== 0) continue;
    if (mask & (1 << seen)) result.add(i);
    seen++;
  }
  return result;
}

/**
 * Score all legitimate masks without selecting key or orientation.
 * @param {number[]} ciphertext
 * @param {"phi"|"prime"} keyMode
 * @param {-1|1} sign
 * @param {number} start
 * @returns {{mask:number,score:number,plaintext:number[]}}
 */
function bestMask(ciphertext, keyMode, sign, start) {
  const countF = ciphertext.filter((v) => v === 0).length;
  assert.ok(countF < 20, "Bit-mask test budget only covers short source pages");
  let best = {mask: 0, score: -Infinity, plaintext: []};
  for (let mask = 0; mask < 2 ** countF; mask++) {
    const plaintext = decode(ciphertext, keyMode, sign, start, mask);
    const value = score(plaintext);
    if (value > best.score) best = {mask, score: value, plaintext};
  }
  return best;
}

/** @param {number[]} values @returns {string} */
function transliterate(values) {
  return values.map((symbol) => corpus.translit[symbol]).join("");
}

/** @param {number[]} values @returns {number} */
function firstLiteralF(values) {
  return values.indexOf(0);
}

/**
 * Arrange a generated reading-order ciphertext into the corresponding
 * source-geometry printed rows, then read it back through the reflection.
 * @param {number[]} reading
 * @param {number[][]} printedShape
 * @param {"I"|"H"|"V"|"HV"} mode
 * @returns {number[]}
 */
function reflectedPrintedRoundtrip(reading, printedShape, mode) {
  const widths = reflect(printedShape, mode).map((row) => row.length);
  const rows = [];
  let off = 0;
  for (const width of widths) {
    rows.push(reading.slice(off, off + width));
    off += width;
  }
  assert.equal(off, reading.length);
  const printed = reflect(rows, mode);
  return reflect(printed, mode).flat();
}

/** Original-image aligned, externally fixed source hypothesis. */
const sourceOrientation = {7: "H", 23: "HV"};
const original = [];
for (const page of [7, 23, 56]) {
  const lines = printedLines(page);
  const rows = [];
  for (const mode of modes) {
    const sequence = reflect(lines, mode).flat();
    assert.equal(sequence.length, corpus.pages[page].indices.length);
    const fixed = bestMask(sequence, "phi", -1, 0);
    const all = [];
    for (const keyMode of ["phi", "prime"]) {
      for (const sign of [-1, 1]) {
        for (let start = 0; start < 29; start++) {
          const choice = bestMask(sequence, keyMode, sign, start);
          all.push({keyMode, sign, start, mask: choice.mask,
            score: choice.score, excerpt: transliterate(choice.plaintext.slice(0, 50))});
        }
      }
    }
    all.sort((a, b) => b.score - a.score);
    rows.push({mode, fixed: {mask: fixed.mask, score: fixed.score,
      excerpt: transliterate(fixed.plaintext.slice(0, 50))},
      bestFullySearched: all[0]});
  }
  original.push({page, fiveDotOrientation: page === 56 ? "H" :
    page === 23 ? "V" : "I", nextToSolvedReading:
      sourceOrientation[page] || "I", rows});
}

const authentic = corpus.pages[56].indices;
const expected = toGematria("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(expected.length, 85);
assert.deepEqual(decode(authentic, "phi", -1, 0, 8), expected);
assert.equal(bestMask(authentic, "phi", -1, 0).mask, 8);

/**
 * Source-native genuine-language encryption checks on disjoint windows.
 * Tests include full original-cipher reencryption and 2D orientation.
 * @param {number} page
 * @param {"I"|"H"|"V"|"HV"} mode
 * @returns {{samples:number, sourceMin:number,sourceMean:number,sourceMax:number,minimumBestDecoded:number,maximumBestDecoded:number,belowOriginal:number,exactRecoveries:number}}
 */
function positives(page, mode) {
  const shape = printedLines(page);
  const n = corpus.pages[page].indices.length;
  const frozenOriginal = original.find((row) => row.page === page)
    .rows.find((row) => row.mode === mode).fixed.score;
  const scores = [], bestScores = [];
  let exactRecoveries = 0;
  for (let i = 0; i < 120; i++) {
    const plaintext = shakespeare.slice(i * n, (i + 1) * n);
    assert.equal(plaintext.length, n);
    const literal = firstLiteralF(plaintext);
    const reserved = new Set(literal < 0 ? [] : [literal]);
    const ciphertext = encode(plaintext, "phi", -1, 0, reserved);
    const readBack = reflectedPrintedRoundtrip(ciphertext, shape, mode);
    assert.deepEqual(readBack, ciphertext);
    // Derive the true bit mask from ciphertext F occurrence positions.
    const fAt = [];
    ciphertext.forEach((v, j) => {if (v === 0) fAt.push(j);});
    const trueMask = literal < 0 ? 0 : 2 ** fAt.indexOf(literal);
    const recovered = decode(readBack, "phi", -1, 0, trueMask);
    assert.deepEqual(recovered, plaintext);
    assert.deepEqual(encode(recovered, "phi", -1, 0,
      literalPositions(readBack, trueMask)), readBack);
    exactRecoveries++;
    scores.push(score(recovered));
    bestScores.push(bestMask(readBack, "phi", -1, 0).score);
  }
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return {samples: scores.length, sourceMin: Math.min(...scores),
    sourceMean: average, sourceMax: Math.max(...scores),
    minimumBestDecoded: Math.min(...bestScores),
    maximumBestDecoded: Math.max(...bestScores),
    belowOriginal: bestScores.filter((s) => s <= frozenOriginal).length,
    exactRecoveries};
}


/**
 * Alternative interpretation: the reflection changes prime-key traversal
 * across physical glyph positions, while plaintext is read normally.
 * Exact F-mask bits follow the physical-key traversal, not printed order.
 * @param {number} page
 * @param {"I"|"H"|"V"|"HV"} mode
 * @returns {number[]}
 */
function sourceKeyPath(page, mode) {
  let offset = 0;
  const sourceLines = printedLines(page).map((line) => {
    const row = line.map((_, i) => offset + i);
    offset += line.length;
    return row;
  });
  return reflect(sourceLines, mode).flat();
}

/**
 * @param {number[]} cipher
 * @param {number[]} visitOrder
 * @param {number} mask
 * @returns {number[]}
 */
function decodeSpatialKey(cipher, visitOrder, mask) {
  const plaintext = new Array(cipher.length);
  let primeOrdinal = 0, zeroOrdinal = 0;
  for (const position of visitOrder) {
    const glyph = cipher[position];
    if (glyph === 0 && mask & (1 << zeroOrdinal)) {
      plaintext[position] = 0;
      zeroOrdinal++;
      continue;
    }
    if (glyph === 0) zeroOrdinal++;
    plaintext[position] = mod29(glyph - (primes[primeOrdinal++] - 1));
  }
  return plaintext;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} visitOrder
 * @param {Set<number>} literalPositionsOnPaper
 * @returns {number[]}
 */
function encodeSpatialKey(plaintext, visitOrder, literalPositionsOnPaper) {
  const ciphertext = new Array(plaintext.length);
  let primeOrdinal = 0;
  for (const position of visitOrder) {
    const glyph = plaintext[position];
    if (literalPositionsOnPaper.has(position)) {
      assert.equal(glyph, 0);
      ciphertext[position] = 0;
    } else {
      ciphertext[position] = mod29(glyph + primes[primeOrdinal++] - 1);
    }
  }
  return ciphertext;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} visitOrder
 * @returns {{mask:number,score:number,plaintext:number[]}}
 */
function bestSpatialMask(ciphertext, visitOrder) {
  const fCount = ciphertext.filter((v) => v === 0).length;
  assert.ok(fCount < 20);
  let best = {mask: 0, score: -Infinity, plaintext: []};
  for (let mask = 0; mask < 2 ** fCount; mask++) {
    const plaintext = decodeSpatialKey(ciphertext, visitOrder, mask);
    const value = score(plaintext);
    if (value > best.score) best = {mask, score: value, plaintext};
  }
  return best;
}

/** @param {number} page @param {"I"|"H"|"V"|"HV"} mode */
function spatialSourceControls(page, mode) {
  const sourceCipher = corpus.pages[page].indices;
  const visitOrder = sourceKeyPath(page, mode);
  const originalScore = bestSpatialMask(sourceCipher, visitOrder).score;
  let recoveries = 0, lows = 0, minimum = Infinity;
  for (let i = 0; i < 120; i++) {
    const n = sourceCipher.length;
    const plain = shakespeare.slice(i * n, (i + 1) * n);
    assert.equal(plain.length, n);
    const firstF = firstLiteralF(plain);
    const literalPositions = new Set(firstF < 0 ? [] : [firstF]);
    const ciphertext = encodeSpatialKey(plain, visitOrder, literalPositions);
    let trueMask = 0, zeroOrdinal = 0;
    for (const position of visitOrder) {
      if (ciphertext[position] === 0) {
        if (literalPositions.has(position)) trueMask |= (1 << zeroOrdinal);
        zeroOrdinal++;
      }
    }
    const recovered = decodeSpatialKey(ciphertext, visitOrder, trueMask);
    assert.deepEqual(recovered, plain);
    assert.deepEqual(encodeSpatialKey(recovered, visitOrder, literalPositions),
      ciphertext);
    recoveries++;
    const best = bestSpatialMask(ciphertext, visitOrder).score;
    if (best <= originalScore) lows++;
    minimum = Math.min(minimum, best);
  }
  return {recoveries, trials: 120, bestMaskBelowOriginal: lows,
    minimumBestMaskPositiveScore: minimum};
}
const spatialKeyTraversal = [7, 23, 56].map((page) => {
  const direction = page === 7 ? "H" : page === 23 ? "HV" : "I";
  const visitOrder = sourceKeyPath(page, direction);
  const original = bestSpatialMask(corpus.pages[page].indices, visitOrder);
  return {page, direction, mask: original.mask, score: original.score,
    excerpt: transliterate(original.plaintext.slice(0, 50))};
});
assert.equal(spatialKeyTraversal[2].score, score(expected));
assert.equal(spatialKeyTraversal[2].mask, 8);
assert.ok(spatialKeyTraversal[0].score < -4.1);
assert.ok(spatialKeyTraversal[1].score < -4.0);
const spatialControls = {
  page7: spatialSourceControls(7, "H"),
  page23: spatialSourceControls(23, "HV")
};
assert.equal(spatialControls.page7.bestMaskBelowOriginal, 0);
assert.equal(spatialControls.page23.bestMaskBelowOriginal, 0);

const controls = {
  page7: positives(7, "H"),
  page23: positives(23, "HV")
};
const selected7 = original[0].rows.find((row) => row.mode === "H");
const selected23 = original[1].rows.find((row) => row.mode === "HV");
assert.ok(selected7.fixed.score < -4.1);
assert.ok(selected23.fixed.score < -4.0);
assert.equal(controls.page7.belowOriginal, 0);
assert.equal(controls.page23.belowOriginal, 0);

console.log(JSON.stringify({
  claim: "Bounded negative for applying the authentically solved page-56 totient cipher under artwork-inferred reflected source line reading",
  authenticPage56: {runes: 85, score: score(expected), solvedStart: 0,
    solvedSign: -1, literalFMask: 8, exact: true},
  original,
  frozenSourceControls: controls,
  alternateSpatialKeyTraversal: spatialKeyTraversal,
  spatialSourceControls: spatialControls,
  keyBlindRoundtripWarning: "A wrong-key roundtrip is not evidence of a historical key",
  status: "NO UNKNOWN LP2 PLAINTEXT RECOVERED"
}, null, 2));
