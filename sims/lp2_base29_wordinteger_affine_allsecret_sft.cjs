"use strict";
/**
 * All-secret full-word GP29 integer affine cipher obstruction.
 *
 * Each original complete printed word has length L and BASE29 integer N.
 * Even if every L has its own UNKNOWN a_L and b_L (gcd(a_L,29)=1),
 * a fixed-width modular affine operation
 *    C = (a_L P + b_L) mod 29^L
 * leaves the word's final GP rune an affine-permuted symbol modulo29.
 * It therefore PRESERVES every per-length terminal-rune frequency count,
 * including the sum of the four largest counts. The union over L yields
 * a complete key-independent bound on plaintext word-final statistics.
 *
 * Node.js 22 CommonJS Windows 11 SFT; read-only; no packages.
 *   node sims/lp2_base29_wordinteger_affine_allsecret_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Map(corpus.runes.map((rune, i) => [rune, i]));
const text = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
const original = text.words.map(word => [...word.runes].map(rune => {
  const n = alphabet.get(rune);
  assert.notEqual(n, undefined);
  return n;
}));
assert.equal(original.length, 2896);
assert.equal(text.runeCount, 12956);
assert.equal(text.crossPageWords, 32);
assert.deepEqual(original.flat(),
  corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices));

/** @param {number[]} a @returns {bigint} */
function wordNumber(a) {
  return a.reduce((n, digit) => n * 29n + BigInt(digit), 0n);
}

/** @param {bigint} n @param {number} length @returns {number[]} */
function wordDigits(n, length) {
  const mod = 29n ** BigInt(length);
  n = ((n % mod) + mod) % mod;
  const result = Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    result[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return result;
}

/**
 * @param {number[][]} words
 * @returns {{top4AllLengthUpper:number, perLength:Array<{length:number,words:number,top4:number}>}}
 */
function finalRuneAllSecretBound(words) {
  const grouped = new Map();
  for (const word of words) {
    const arr = grouped.get(word.length) || [];
    arr.push(word.at(-1));
    grouped.set(word.length, arr);
  }
  const perLength = [...grouped].sort((a, b) => a[0] - b[0])
    .map(([length, symbols]) => {
      const hist = Array(29).fill(0);
      for (const symbol of symbols) hist[symbol]++;
      return {
        length, words: symbols.length,
        top4: hist.sort((a, b) => b - a).slice(0, 4)
          .reduce((s, n) => s + n, 0)
      };
    });
  return {
    top4AllLengthUpper: perLength.reduce((s, row) => s + row.top4, 0),
    perLength
  };
}

/** @param {number[][]} words */
function observedTop4Last(words) {
  const hist = Array(29).fill(0);
  for (const word of words) hist[word.at(-1)]++;
  return hist.sort((a, b) => b - a).slice(0, 4)
    .reduce((s, n) => s + n, 0);
}

const source = finalRuneAllSecretBound(original);
assert.equal(source.top4AllLengthUpper, 609);
assert.deepEqual(source.perLength.map(row => row.top4),
  [20, 82, 130, 104, 71, 51, 50, 38, 19, 17, 12, 8, 4, 3]);
assert.deepEqual(source.perLength.map(row => row.words),
  [83, 448, 720, 513, 317, 256, 216, 156, 78, 52, 32, 18, 4, 3]);

// Source-native plaintext construction, sharing the exact source letter ->
// GP rune spelling with older GP-native positive-control SFTs.
const tokenizer = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} originalWord @returns {number[]} */
function nativeGPWord(originalWord) {
  const word = originalWord.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {result.push(21); i += 3;}
    else if (word.startsWith("IO", i)) {result.push(27); i += 2;}
    else {
      const hit = tokenizer.find(entry => word.startsWith(entry.token, i));
      assert.ok(hit, "unmapped GP source word: " + word);
      result.push(hit.index);
      i += hit.token.length;
    }
  }
  return result;
}

/** @param {string} reference @returns {number[][]} */
function matchedNativeWords(reference) {
  const grouped = new Map();
  for (const word of reference.toUpperCase().match(/[A-Z]+/g) || []) {
    const runes = nativeGPWord(word);
    const target = grouped.get(runes.length) || [];
    target.push(runes);
    grouped.set(runes.length, target);
  }
  const native = original.map((word, i) => {
    const candidates = grouped.get(word.length);
    assert.ok(candidates && candidates.length, "missing source word width");
    return candidates[i % candidates.length];
  });
  assert.deepEqual(native.map(word => word.length),
    original.map(word => word.length));
  return native;
}

/**
 * A planted complete affine cipher with multiplier 2, genuinely carrying
 * across BASE29 digits. Since all 29^L moduli are odd,
 * inverse(2) = (29^L+1)/2 without a library or guessed key.
 *
 * @param {number[][]} native
 * @param {string} name
 */
function verifyNativePlant(native, name) {
  const encrypted = native.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const offset = (3301n ** BigInt(L) + 1033n * BigInt(L)) % modulus;
    return wordDigits(2n * wordNumber(word) + offset, L);
  });
  const recovered = encrypted.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const offset = (3301n ** BigInt(L) + 1033n * BigInt(L)) % modulus;
    const inv2 = (modulus + 1n) / 2n;
    assert.equal(2n * inv2 % modulus, 1n);
    return wordDigits(inv2 * (wordNumber(word) - offset), L);
  });
  assert.deepEqual(recovered, native);

  const before = finalRuneAllSecretBound(native);
  const after = finalRuneAllSecretBound(encrypted);
  assert.deepEqual(after.perLength.map(row => row.top4),
    before.perLength.map(row => row.top4));
  assert(before.top4AllLengthUpper > source.top4AllLengthUpper);
  const lastFour = observedTop4Last(native);
  assert(lastFour <= before.top4AllLengthUpper);
  assert(lastFour > source.top4AllLengthUpper);
  return {
    source: name, words: native.length,
    nativeFourMostCommonFinalRunes: lastFour,
    nativePerLengthSumTop4: before.top4AllLengthUpper,
    encryptedPerLengthSumTop4: after.top4AllLengthUpper,
    exactPlantRecovery: "2896/2896"
  };
}

const nativeControls = [
  verifyNativePlant(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  verifyNativePlant(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(nativeControls.map(x => x.nativeFourMostCommonFinalRunes),
  [1547, 1553]);

// Small-n source-independent proof control: enumerate 29×29 single-digit
// affine keys and assert every nonzero slope permutes all 29 GP symbols.
for (let a = 1; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const vals = Array.from({length:29}, (_, x) => (a*x+b)%29);
    assert.equal(new Set(vals).size,29);
  }
}

/**
 * Genuine NONLINEAR permutation polynomial over Z/(29^L):
 *
 *   y = 2*x + b_L + 29*x^2 (mod 29^L)
 *
 * It is bijective for every L because reducing modulo29 gives 2x+b,
 * and its derivative 2+58x is always nonzero modulo29. Its last-digit
 * histogram is exactly a permutation of the plaintext last digits.
 *
 * Inversion uses the simple 29-adically contractive recurrence
 *   x <- inverse(2) * (y - b - 29*x*x) mod 29^L.
 * Each iteration raises precision by at least one base29 digit, so L
 * iterations recover the exact unique preimage, from any initial x.
 *
 * @param {number[][]} native
 * @param {string} name
 */
function verifyNonlinearPolynomialPlant(native, name) {
  /** @param {number} L */
  const modulus = L => 29n ** BigInt(L);
  /** @param {number} L */
  const offset = L => (3301n + 1033n * BigInt(L)) % modulus(L);
  const encrypted = native.map(word => {
    const x = wordNumber(word);
    return wordDigits(2n*x + offset(word.length) + 29n*x*x, word.length);
  });
  const recovered = encrypted.map(word => {
    const L = word.length;
    const m = modulus(L);
    const inverse2 = (m + 1n) / 2n;
    const y = wordNumber(word);
    let x = 0n;
    for (let i = 0; i < L; i++)
      x = ((inverse2 * (y - offset(L) - 29n*x*x)) % m + m) % m;
    assert.equal((2n*x + offset(L) + 29n*x*x) % m, y);
    return wordDigits(x, L);
  });
  assert.deepEqual(recovered, native);
  const before = finalRuneAllSecretBound(native);
  const after = finalRuneAllSecretBound(encrypted);
  assert.deepEqual(after.perLength.map(row => row.top4),
    before.perLength.map(row => row.top4));
  return {
    source: name, nativeTopFourLast: observedTop4Last(native),
    encryptedTopFourLast: observedTop4Last(encrypted),
    lengthwiseOriginalBound: source.top4AllLengthUpper,
    nativeLengthwiseTopFour: before.top4AllLengthUpper,
    encryptedLengthwiseTopFour: after.top4AllLengthUpper,
    nonlinearWordRoundtrip: "2896/2896"
  };
}

const polynomialControls = [
  verifyNonlinearPolynomialPlant(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  verifyNonlinearPolynomialPlant(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(polynomialControls.map(x => x.nativeTopFourLast),
  [1547, 1553]);
for (const item of polynomialControls)
  assert(item.nativeLengthwiseTopFour > source.top4AllLengthUpper);

// General theorem: ANY polynomial map f_L of a BASE29 integer word is
// compatible with the low base29 digit, meaning x ≡ y mod29 entails
// f_L(x) ≡ f_L(y) mod29. If f_L permutes all 29^L words, its induced
// mod29 map must permute the 29 residue classes. Therefore the same 609
// all-secret upper bound covers every degree, secret coefficient and
// key of EVERY invertible word-length-stationary polynomial f_L.

/**
 * Stronger source-independent allowance: before an invertible arithmetic
 * numeral transformation, each word width may secretly choose ANY single
 * original rune position to serve as its output units digit, even after
 * an arbitrary fixed width-L permutation (L! possibilities).
 *
 * For each L and digit position j, that digit's 29-bin histogram is
 * inescapable under any later compatible/permutation-polynomial inverse.
 * Taking the max top-four concentration across ALL j, independently for
 * every L, covers every single secret per-length coordinate permutation
 * and per-length compatible integer bijection.
 *
 * @param {number[][]} runicWords
 */
function allSecretPositionReorderBound(runicWords) {
  const groups = new Map();
  for (const word of runicWords) {
    const group = groups.get(word.length) || [];
    group.push(word);
    groups.set(word.length, group);
  }
  let upper = 0;
  const perLength = [];
  for (const [length, group] of [...groups].sort((a, b) => a[0] - b[0])) {
    const candidates = Array.from({length}, (_, pos) => {
      const hist = Array(29).fill(0);
      for (const word of group) hist[word[pos]]++;
      const top4 = hist.sort((a, b) => b - a)
        .slice(0, 4).reduce((s, n) => s + n, 0);
      return {position: pos, top4};
    });
    candidates.sort((a, b) => b.top4 - a.top4 ||
      a.position - b.position);
    upper += candidates[0].top4;
    perLength.push({length, words: group.length,
      maximallyFavoredOriginalPosition: candidates[0].position,
      largestFourAtThatPosition: candidates[0].top4,
      evaluatedSourcePositions: length});
  }
  return {upper, perLength};
}

const allReorderedPositions = allSecretPositionReorderBound(original);
assert.equal(allReorderedPositions.upper, 642);
assert.deepEqual(allReorderedPositions.perLength.map(x =>
  x.largestFourAtThatPosition),
  [20, 88, 138, 104, 71, 56, 50, 42, 25, 18, 14, 9, 4, 3]);

/**
 * Positive: full-integer affine GP29 cipher followed by a literal reversal
 * of each output word. This is one valid nontrivial member of the all-
 * hidden per-length position permutation + compatible cipher family.
 *
 * @param {number[][]} native
 * @param {string} name
 */
function verifyReversedAffinePlant(native, name) {
  const encrypted = native.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const b = (3301n + 1033n * BigInt(L)) % modulus;
    return wordDigits(2n * wordNumber(word) + b, L).reverse();
  });
  const decoded = encrypted.map(word => {
    const L = word.length;
    const modulus = 29n ** BigInt(L);
    const b = (3301n + 1033n * BigInt(L)) % modulus;
    const inv2 = (modulus + 1n) / 2n;
    return wordDigits(inv2 * (wordNumber(word.slice().reverse()) - b), L);
  });
  assert.deepEqual(decoded, native);
  const maxReordered = allSecretPositionReorderBound(encrypted);
  const nativeFinal = observedTop4Last(native);
  assert(maxReordered.upper >= nativeFinal,
    "all-secret coordinate bound must admit true reversed-affine source");
  assert(allReorderedPositions.upper < nativeFinal,
    "original all-secret bound must exclude native reference");
  return {
    source: name, nativeFinalFour: nativeFinal,
    encryptedAllPositionUpper: maxReordered.upper,
    originalAllPositionUpper: allReorderedPositions.upper,
    originalWidthsRecovered: "2896/2896"
  };
}
const reorderedNativeControls = [
  verifyReversedAffinePlant(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  verifyReversedAffinePlant(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(reorderedNativeControls.map(x => x.nativeFinalFour),
  [1547, 1553]);

/**
 * Physical chapter geometry is a genuine, independently visible source
 * object. These nine runs are frozen by illustrations, not word statistics.
 * The original rune transcript has 55 nonempty page segments: index>=50
 * corresponds to physical page one greater (numeric-only p50 omitted).
 */
const illustratedChapters = [
  [0,2], [3,7], [8,14], [15,22], [23,26],
  [27,32], [33,39], [40,53], [54,55]
];
const chapterForWord = text.words.map(word => {
  const page = word.startPage >= 50
    ? word.startPage + 1 : word.startPage;
  const chapter = illustratedChapters.findIndex(([a,b]) => a<=page && page<=b);
  assert(chapter >= 0, "missing authored illustrated-chapter assignment");
  return chapter;
});

/**
 * Superset of the original word-integer polynomial family: ALLOW ONE
 * TOTALLY UNKNOWN digit coordinate to serve as the final digit, chosen
 * independently for EACH illustrated chapter × EACH printed word width.
 * Follow with any 29-adically compatible bijection separately per
 * chapter × word width, including unknown degree and polynomial keys.
 *
 * Each category histogram is unchanged by the bijective map mod29,
 * while the chosen original digit position may vary between groups.
 * Bound = sum over all chapter×width groups of max_j(top-four counts
 * among 29 values at source word coordinate j).
 *
 * This does NOT assume a known coordinate permutation or literal order.
 * It overgrants the plaintext top-four labels independently per group.
 *
 * @param {number[][]} runicWords
 * @param {number[]} chapters
 */
function allSecretChapterPositionBound(runicWords, chapters) {
  assert.equal(runicWords.length, chapters.length);
  const groups = new Map();
  for (let i = 0; i < runicWords.length; i++) {
    const word = runicWords[i];
    const id = chapters[i] + ":" + word.length;
    const arr = groups.get(id) || [];
    arr.push(word);
    groups.set(id, arr);
  }
  let upper = 0, terminalUpper = 0;
  const perGroup = [];
  for (const [id, sourceWords] of groups) {
    const columns = Array.from({length: sourceWords[0].length}, (_, j) => {
      const bins = Array(29).fill(0);
      for (const word of sourceWords) bins[word[j]]++;
      const top4 = bins.sort((a,b) => b-a).slice(0,4)
        .reduce((s,n) => s+n,0);
      return {j,top4};
    });
    columns.sort((a,b) => b.top4-a.top4 || a.j-b.j);
    const best = columns[0];
    const final = columns.find(x => x.j === sourceWords[0].length-1);
    upper += best.top4;
    terminalUpper += final.top4;
    perGroup.push({
      group:id, n:sourceWords.length,
      sourceBestPosition:best.j, sourceBestTop4:best.top4,
      originalLastTop4:final.top4
    });
  }
  return {upper,terminalUpper,groups:perGroup.length,perGroup};
}
const nineChapterPositionBound =
  allSecretChapterPositionBound(original,chapterForWord);
assert.equal(nineChapterPositionBound.upper,1145);
assert.equal(nineChapterPositionBound.terminalUpper,1014);
assert.equal(nineChapterPositionBound.groups,110);

/** @param {number[]} word @param {number} left */
function rotateLeft(word,left) {
  return word.slice(left).concat(word.slice(0,left));
}

/**
 * Source-shape positive: source-native original 2,896 GP words encrypted
 * using chapter×length-specific full-integer modular affine keys AND
 * chapter×length-specific secret intra-word cyclic position permutations.
 * The key schedule is deliberately synthetic, not a Cicada claim.
 *
 * @param {number[][]} native
 * @param {string} name
 */
function verifyChapterReorderPlant(native,name) {
  const enc=native.map((word,i)=>{
    const chapter=chapterForWord[i], L=word.length;
    const m=29n**BigInt(L);
    const b=(3301n+1033n*BigInt(L)+BigInt(chapter+1)**3n)%m;
    const shift=(L+chapter*3+1)%L;
    return rotateLeft(wordDigits(2n*wordNumber(word)+b,L),shift);
  });
  const rec=enc.map((word,i)=>{
    const chapter=chapterForWord[i],L=word.length;
    const m=29n**BigInt(L);
    const b=(3301n+1033n*BigInt(L)+BigInt(chapter+1)**3n)%m;
    const shift=(L+chapter*3+1)%L;
    const unscrambled=rotateLeft(word,(L-shift)%L);
    const inv2=(m+1n)/2n;
    return wordDigits(inv2*(wordNumber(unscrambled)-b),L);
  });
  assert.deepEqual(rec,native);
  const afterBound=allSecretChapterPositionBound(enc,chapterForWord);
  const ending=observedTop4Last(native);
  assert(afterBound.upper>=ending);
  assert(nineChapterPositionBound.upper<ending);
  return {
    source:name,
    plaintextFourMostCommonEndings:ending,
    encryptedArbitraryChapterWidthPositionUpper:afterBound.upper,
    originalArbitraryChapterWidthPositionUpper:nineChapterPositionBound.upper,
    allWordsRoundtripped:"2896/2896"
  };
}
const nineChapterNativeControls=[
  verifyChapterReorderPlant(matchedNativeWords(
    read("resources/control/gibran_prophet_58585.txt")), "Gibran"),
  verifyChapterReorderPlant(matchedNativeWords(
    read("resources/control/shakespeare_first300k.txt")), "Shakespeare")
];
assert.deepEqual(nineChapterNativeControls.map(x=>
  x.plaintextFourMostCommonEndings),[1547,1553]);

console.log(JSON.stringify({
  original: {
    completeWords: original.length, sourceRunes: text.runeCount,
    acrossPageWords: text.crossPageWords,
    originalFourMostCommonFinalRunes: observedTop4Last(original),
    maximumFourFinalRuneSymbolsUnderArbitrarySecretAffineKeysByLength:
      source.top4AllLengthUpper,
    perLength: source.perLength
  },
  nativeControls,
  polynomialControls,
  allReorderedPositions,
  reorderedNativeControls,
  nineChapterPositionBound: {upper:nineChapterPositionBound.upper,
    terminalUpper:nineChapterPositionBound.terminalUpper,
    groups:nineChapterPositionBound.groups,
    perGroup:nineChapterPositionBound.perGroup},
  nineChapterNativeControls,
  affineAlphabetBijectionControls: "812/812 (a 1..28, b 0..28)",
  conclusion: "Genuine novel extension over prior fixed word-edge result: ANY independent secret digit coordinate and ANY invertible compatible integer cipher per illustrated chapter x word length obeys top-four native GP-English word-final bound 1145, versus 1547/1553 native controls. Synthetic 2896-word chapter-varying affine/coordinate plants pass. No unknown LP2 plaintext/key recovered."
}, null, 2));
