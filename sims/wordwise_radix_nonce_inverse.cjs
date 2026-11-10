"use strict";
/**
 * Exact key-independent constraint and reversible mixed-radix inverse for a
 * *hypothetical* one-ciphertext-rune-per-word overhead channel.
 *
 * Every original length-L ciphertext word without an equal adjacent glyph
 * is interpreted as a 29-ary first digit followed by L-1 predecessor-
 * excluding 28-ary digits, with an arbitrary fixed first-glyph permutation
 * and arbitrary fixed 28-permutation for each predecessor glyph.
 *
 * The mixed-radix integer is split into:
 *   V = nonce * 29^(L-1) + P,
 * where P is exactly L-1 native GP plaintext digits. Both parts can be
 * recovered, so every eligible source word is exactly re-encipherable.
 * That tautological reconstruction is NOT a decipherment.
 *
 * A much stronger original-source invariant holds for the 447 clean
 * two-rune words. If their one-rune plaintext must belong to ANY TWO
 * fixed GP symbols, at most 118/447 original words can satisfy the
 * proposed channel, for ALL possible secret first alphabet permutations
 * and independently arbitrary predecessor output permutations.
 *
 * The model cannot handle original ciphertext words with repeated adjacent
 * runes without an additional recoverable escape channel.
 * Node.js CommonJS. Run: node sims/wordwise_radix_nonce_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const words = parseSharedCorpus().words.map(w => [...w.runes].map(c => {
  const v = byRune.get(c);
  assert.notEqual(v, undefined);
  return v;
}));
assert.equal(words.length, 2896);
assert.equal(words.flat().length, 12956);
assert.deepEqual(words.flat(), gp.pages.filter(p =>
  p.status === "unsolved" && p.indices.length).flatMap(p => p.indices));

const M = 29;
const clean = word => word.every((x, j) => j === 0 || x !== word[j-1]);

/**
 * @param {number[]} order 29 glyph indices in first-digit order.
 * @returns {{digitToGlyph:number[],glyphToDigit:number[]}}
 */
function initialAlphabet(order) {
  assert.equal(order.length, M);
  assert.equal(new Set(order).size, M);
  const glyphToDigit = Array(M);
  order.forEach((x, i) => glyphToDigit[x] = i);
  return {digitToGlyph: order, glyphToDigit};
}

/**
 * @param {number[][]} rows Secret ordered outgoing glyphs per predecessor.
 */
function checkRows(rows) {
  assert.equal(rows.length, M);
  for (let a=0; a<M; a++) {
    assert.equal(rows[a].length, M-1);
    assert.equal(new Set(rows[a]).size, M-1);
    assert.ok(!rows[a].includes(a));
  }
}

/**
 * Exactly decode one clean ciphertext word.
 * @param {number[]} cipher length >=2.
 * @param {ReturnType<typeof initialAlphabet>} alphabet
 * @param {number[][]} rows
 */
function decode(cipher, alphabet, rows) {
  assert.ok(cipher.length >= 2 && clean(cipher));
  let value = BigInt(alphabet.glyphToDigit[cipher[0]]);
  for (let j=1; j<cipher.length; j++) {
    const rank = rows[cipher[j-1]].indexOf(cipher[j]);
    assert.ok(rank >= 0);
    value = value*28n + BigInt(rank);
  }
  const width = cipher.length-1;
  const limit = 29n ** BigInt(width);
  const salt = value/limit;
  let remain = value%limit;
  const plain = Array(width);
  for (let i=width-1; i>=0; i--) {
    plain[i] = Number(remain%29n);
    remain/=29n;
  }
  assert.equal(remain, 0n);
  return {plain, salt, value};
}

/**
 * Exactly re-encipher the plaintext/salt pair, when representable.
 * @param {number[]} plain GP digit sequence.
 * @param {bigint} salt Nonnegative integer packet nonce.
 * @param {ReturnType<typeof initialAlphabet>} alphabet
 * @param {number[][]} rows
 */
function encode(plain, salt, alphabet, rows) {
  assert.ok(plain.length >= 1 && plain.every(x => x >= 0 && x < M));
  assert.ok(salt >= 0n);
  const width = plain.length;
  let value = salt*(29n ** BigInt(width));
  for (const p of plain) value = value*1n; // explicit BigInt accumulator
  let message = 0n;
  for (const p of plain) message=message*29n+BigInt(p);
  value+=message;
  assert.ok(value < 29n*(28n**BigInt(width)),
    "packet exceeds the representable mixed-radix capacity");
  const digits = Array(width+1);
  for (let i=width; i>=1; i--) {
    digits[i] = Number(value%28n);
    value/=28n;
  }
  assert.ok(value >= 0n && value < 29n);
  digits[0] = Number(value);
  const cipher=[alphabet.digitToGlyph[digits[0]]];
  for (let i=1; i<digits.length; i++)
    cipher.push(rows[cipher[i-1]][digits[i]]);
  assert.ok(clean(cipher));
  return cipher;
}

/**
 * Count original two-rune nonrepeat words by first and second glyph.
 * @param {number[][]} source
 * @returns {number[][]}
 */
function transitions(source) {
  const counts = Array.from({length:M}, () => Array(M).fill(0));
  for (const w of source) if (w.length===2 && clean(w))
    counts[w[0]][w[1]]++;
  return counts;
}

/**
 * Sharp optimum under all secret first-digit permutations and all 29
 * independent predecessor permutations for the event that the decoded
 * one-rune word belongs to a prechosen set of k distinct GP symbols.
 *
 * Proof: for fixed first mixed-radix digit d, P=(28*d+r) mod29
 * = (r-d) mod29 where r is a unique successor rank 0..27.
 * For k desired plaintext letters there are k allowed ranks, except when
 * d=(28-P) mod29 for one of the k letters, when only k-1 ranks remain.
 * A secret 29-permutation assigns these k "deficient" first-digit values
 * to whichever k observed first-glyph rows lose the fewest counts.
 * Independent arbitrary successor permutations attain the row-wise maxima.
 *
 * @param {number[][]} counts Original two-rune transitions.
 * @param {number} k Size of the predeclared plaintext symbol set.
 */
function exactUpperBound(counts, k) {
  assert.ok(k >= 1 && k <= 28);
  const sorted = counts.map((row, a) => row
    .filter((_, b) => b!==a).sort((x, y) => y-x));
  const raw = sorted.reduce((z, row) => z+
    row.slice(0,k).reduce((a,b)=>a+b,0),0);
  const penalties = sorted.map(row=>row[k-1]).sort((a,b)=>a-b);
  const missing = penalties.slice(0,k).reduce((a,b)=>a+b,0);
  return {targetSymbols:k,rawRowBound:raw,
    firstAlphabetPenalty:missing,exactMax:raw-missing};
}

/** @param {number} initial */
function rng(initial) {
  let state=initial>>>0;
  return () => {
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return state>>>0;
  };
}
/** @param {()=>number} random */
function permutation(random) {
  const seq=Array.from({length:M},(_,i)=>i);
  for(let i=M-1;i>0;i--){
    const j=random()%(i+1);
    [seq[i],seq[j]]=[seq[j],seq[i]];
  }
  return seq;
}

/** Recover a planted native two-symbol message with completely hidden rows. */
function syntheticControl() {
  const random=rng(0x19474719);
  const alphabet=initialAlphabet(permutation(random));
  const rows=Array.from({length:M},(_,a)=>
    permutation(random).filter(v=>v!==a));
  checkRows(rows);
  const letters=[10,24];
  const generated=[];
  for(let i=0;i<447;i++) {
    const p=letters[random()%2],salt=BigInt(random()%28);
    const cipher=encode([p],salt,alphabet,rows);
    const recovered=decode(cipher,alphabet,rows);
    assert.deepEqual(recovered.plain,[p]);
    assert.equal(recovered.salt,salt);
    assert.deepEqual(encode(recovered.plain,recovered.salt,alphabet,rows),cipher);
    generated.push(cipher);
  }
  const bound=exactUpperBound(transitions(generated),2);
  assert.equal(bound.exactMax,generated.length);
  return {sourceNativePlainRunes:generated.length,
    exactPlaintextAndCiphertextRecovered:generated.length,
    exactTwoSymbolCapacity:bound.exactMax};
}

/** @returns {object} */
function run() {
  const alphabet=initialAlphabet(Array.from({length:M},(_,i)=>i));
  const rows=Array.from({length:M},(_,a)=>
    Array.from({length:M},(_,i)=>i).filter(v=>v!==a));
  checkRows(rows);
  const two=words.filter(w=>w.length===2), validTwo=two.filter(clean);
  const good=words.filter(w=>w.length>=2 && clean(w));
  assert.equal(two.length,448);
  assert.equal(validTwo.length,447);
  assert.equal(good.length,2751);
  assert.equal(words.filter(w=>w.length>=2&&!clean(w)).length,62);
  assert.equal(words.filter(w=>w.length===1).length,83);
  let encoded=0,plaintext=0;
  for(const cipher of good) {
    const recovered=decode(cipher,alphabet,rows);
    assert.deepEqual(encode(recovered.plain,recovered.salt,alphabet,rows),
      cipher);
    encoded+=cipher.length;
    plaintext+=recovered.plain.length;
  }
  assert.equal(plaintext,9751);
  const counts=transitions(words);
  const bounds=[1,2,3,4].map(k=>exactUpperBound(counts,k));
  assert.equal(bounds[1].rawRowBound,120);
  assert.equal(bounds[1].exactMax,118);
  const planted=syntheticControl();
  return {
    classification:"original-source exact conditional capacity obstruction; no LP2 plaintext or key",
    model:"one nonrepeat header + predecessor-exclusion mixed radix 29*(28^(L-1)), one native GP rune shorter per printed word, fixed secret first alphabet and fixed arbitrary successor rows",
    source:"canonical original LP2 55 rune-bearing unsolved physical pages",
    original:{words:words.length,runicCount:words.flat().length,
      singletonWords:83,twoRuneWords:two.length,cleanTwoRuneWords:validTwo.length,
      repeatedTwoRuneWords:two.length-validTwo.length,
      wordsWithAnyAdjacentRepeatAndLengthAtLeast2:62,
      cleanWordsExactlyReencoded:good.length,
      ciphertextRunesExactlyReencoded:encoded,
      conditionalCandidatePlainRunes:plaintext,
      bounds},
    positive:planted,
    interpretation:"Any fixed two GP plaintext symbols can cover at most 118/447 clean two-rune original words; source-native English A/I words would require substantially more. All original clean words can be mapped to uniformly-looking invented plaintext by an unconstrained nonce, which is not an authentic decryption.",
    limitations:"Unknown insertions/deletions, changing secret rows, alternate word segmentation, extra marker channels, and ciphertext doublets are not covered."
  };
}
if (require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={initialAlphabet,checkRows,decode,encode,transitions,
  exactUpperBound,syntheticControl,run};