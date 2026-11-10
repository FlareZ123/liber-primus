"use strict";

/**
 * Source-specified LP2 punctuation-clock challenge on an authentic solve.
 *
 * The original JPEG 73 / physical LP2 page 56 has a 13-dot mark after its
 * five-rune heading and a 10-dot mark before its hexadecimal digest. Its
 * historical phi(prime)-shift plaintext is independently known, making this
 * page a genuine positive control for detecting whether large dot marks
 * consume or reset a prime-key clock. No unsolved rune is used to fit any mode.
 *
 * Run Node.js 22: node sims/lp2_punctuation_solved_clock_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {decryptTotient} = require("./solved_cipher_regression.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources",
  "liber-primus", "lp2-corpus.json"), "utf8"));
const marksSource = JSON.parse(fs.readFileSync(path.join(ROOT, "resources",
  "liber-primus", "lp2-ink-annotations.json"), "utf8"));
const page56 = corpus.pages.find(p => p.page === 56);
const marks = marksSource.pages.find(p => p.page === 56).large_punctuation;
const cipher = page56.indices;

/**
 * Independent historically established wording. GP writes V as U and K as C.
 * The SHA-512 hex digest between the two clauses is not part of this rune
 * string. Exact word text also appears in solved_cipher_regression.cjs.
 */
const words = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";

/** @param {string} input @returns {number[]} */
function gpEncode(input) {
  const tokens = corpus.translit.map((glyph,i) => ({glyph,i}))
    .sort((a,b) => b.glyph.length-a.glyph.length);
  const out = [];
  for (const word of input.split(" ")) {
    for (let j=0;j<word.length;) {
      const found = tokens.find(t => word.startsWith(t.glyph,j));
      assert.ok(found, "unencodable GP substring " + word.slice(j));
      out.push(found.i);
      j += found.glyph.length;
    }
  }
  return out;
}

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for (let c=2;out.length<n;c++) {
    let prime = true;
    for (let d=2;d*d<=c;d++) if (c%d===0) {
      prime = false;
      break;
    }
    if (prime) out.push(c);
  }
  return out;
}

const MODES = ["pass","advance","reset"];

/**
 * Consume original p56 runes at physical indices 0..84; internal large dot
 * marks occur BEFORE rune i at i=5 and i=45. A literal F at rune i=56 is the
 * one historically known interrupter: copied unchanged, zero prime steps.
 * @param {"pass"|"advance"|"reset"} mark13Mode
 * @param {"pass"|"advance"|"reset"} mark10Mode
 * @param {number[]} primes
 * @returns {number[]}
 */
function decode(mark13Mode,mark10Mode,primes) {
  const markers = new Map([[5,mark13Mode],[45,mark10Mode]]);
  let counter=0;
  return cipher.map((c,i) => {
    const mode = markers.get(i);
    if (mode === "advance") counter++;
    if (mode === "reset") counter=0;
    if (i === 56) return c;
    return ((c-(primes[counter++]-1))%29+29)%29;
  });
}

/**
 * Bijective forward check for each hypothesis. A wrong punctuation clock
 * must still reproduce the input when used to reencrypt its own decoding.
 * @param {number[]} plain
 * @param {"pass"|"advance"|"reset"} mark13Mode
 * @param {"pass"|"advance"|"reset"} mark10Mode
 * @param {number[]} primes
 */
function reencrypt(plain,mark13Mode,mark10Mode,primes) {
  const markers = new Map([[5,mark13Mode],[45,mark10Mode]]);
  let counter=0;
  return plain.map((p,i) => {
    const mode = markers.get(i);
    if (mode === "advance") counter++;
    if (mode === "reset") counter=0;
    if (i === 56) return p;
    return (p+primes[counter++]-1)%29;
  });
}

/** @param {number[]} output @param {number[]} expected */
function matchRanges(output,expected) {
  return [[0,5],[5,45],[45,85]].map(([a,b]) =>
    output.slice(a,b).filter((v,j) => v === expected[a+j]).length);
}

function main() {
  assert.deepEqual(marks,[[5,13,"red"],[45,10,"red"],[85,13,"red"]]);
  assert.equal(cipher.length,85);
  assert.equal(cipher[56],0);
  const expected = gpEncode(words);
  assert.equal(expected.length,85);

  // Independent established implementation must recover the exact wording.
  assert.deepEqual(decryptTotient(cipher,new Set([56])),expected);
  const primes = firstPrimes(300);
  const output = [];
  for (const mark13Mode of MODES) for (const mark10Mode of MODES) {
    const decoded=decode(mark13Mode,mark10Mode,primes);
    assert.deepEqual(reencrypt(decoded,mark13Mode,mark10Mode,primes),cipher);
    const hits=matchRanges(decoded,expected);
    output.push({mark13After5:mark13Mode,mark10After45:mark10Mode,
      exactRuneMatches:hits.reduce((a,b) => a+b,0),
      matchesInSourceIntervals:hits});
  }
  assert.deepEqual(output.map(o => o.exactRuneMatches),
    [85,46,48,6,6,8,6,6,8]);
  const full=output.filter(o => o.exactRuneMatches === cipher.length);
  assert.deepEqual(full.map(o => [o.mark13After5,o.mark10After45]),
    [["pass","pass"]]);

  console.log(JSON.stringify({source:"LP2 physical p56 / original JPEG 73",
    independentPlaintextRunes:85,largeDotMarkers:marks,
    authenticLiteralFPosition:56,hypothesisCount:output.length,
    decodedAllOriginalRunes:full.length===1,
    note:"The historically solved phi(prime) stream does not reset or consume " +
      "a prime at either internal large-dot mark. Unsolved-page ciphers may " +
      "use other clocks.",models:output},null,2));
}
if (require.main===module) main();
module.exports = {main,decode,reencrypt,matchRanges};
