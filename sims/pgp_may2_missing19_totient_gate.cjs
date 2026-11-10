"use strict";
/**
 * Exact original-LP2 test of the missing-19 whitespace source in the 2014
 * Cicada signed handoff and the authenticated LP2 p56 prime-totient cipher.
 *
 * Node 22, CommonJS. Run from the repository root:
 * node sims/pgp_may2_missing19_totient_gate.cjs
 *
 * This is a conditional no-go for precisely defined cipher semantics, not
 * a recovered key, cryptogram plaintext, or universal prime-based exclusion.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/cicada2014-may2-signed-message.asc");
const KNOWN_P56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";

/**
 * Count printed whitespace fields once each. In a nonblank line, count
 * the leading/trailing run separately. An all-space line contributes once.
 * @param {string} text
 * @returns {number[]}
 */
function whitespaceFields(text) {
  const lines = text.split(/\r?\n/);
  const head = lines.indexOf("Hash: SHA1");
  const tail = lines.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(head >= 0 && tail > head);
  const counts = [];
  for (const line of lines.slice(head + 2, tail)) {
    if (!line.length) continue;
    if (!line.trim().length) { counts.push(line.length); continue; }
    const leading = line.length - line.trimStart().length;
    const trailing = line.length - line.trimEnd().length;
    if (leading) counts.push(leading);
    if (trailing) counts.push(trailing);
  }
  return counts;
}

/**
 * First count primes by actual integer trial division.
 * @param {number} n
 * @returns {number[]}
 */
function firstPrimes(n) {
  const primes = [];
  for (let q = 2; primes.length < n; q++) {
    let prime = true;
    for (const d of primes) {
      if (d * d > q) break;
      if (q % d === 0) { prime = false; break; }
    }
    if (prime) primes.push(q);
  }
  return primes;
}

/**
 * Greedy canonical GP transliteration, with historically documented English
 * normalizations; the known source does not contain ambiguous "ING".
 * @param {string} text
 * @returns {number[]}
 */
function nativeGP(text) {
  const alphabet = corpus.translit.map((label, index) => ({label,index}))
    .sort((a,b) => b.label.length - a.label.length);
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for (let at = 0; at < word.length;) {
      const token = alphabet.find(entry => word.startsWith(entry.label, at));
      assert.ok(token, "Unsupported GP token in " + word + " at " + at);
      result.push(token.index);
      at += token.label.length;
    }
  }
  return result;
}

/**
 * P56-specific rule: a literal plaintext F survives as ciphertext F and
 * uses no prime. Every other plaintext rune consumes the next key symbol.
 * @param {number[]} plain
 * @param {number[]} key
 * @returns {number[]}
 */
function encryptTransparentF(plain, key) {
  const out = [];
  let j = 0;
  for (const p of plain) {
    out.push(p === 0 ? 0 : (p + key[j++]) % 29);
  }
  return out;
}

/**
 * Exact feasibility over all possible literal-F masks. For any C!=0,
 * the decoder must consume a key and emit P=(C-key)%29 != 0; if C==0
 * the extra literal-F branch does not consume a key. The key symbol is
 * fixed and is never adapted to the observed ciphertext.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number[]} [initial]
 * @returns {{feasible:boolean,firstFailure:number,states:number[]}}
 */
function feasible(ciphertext, key, initial = [0]) {
  let states = new Set(initial);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i], next = new Set();
    for (const j of states) {
      if (c === 0) next.add(j);
      if (j < key.length && c !== key[j]) next.add(j + 1);
    }
    if (!next.size) return {feasible:false,firstFailure:i,states:[]};
    states = next;
  }
  return {feasible:true,firstFailure:-1,states:[...states].sort((a,b)=>a-b)};
}

/**
 * Exact minimum number of changed individual key emissions needed for
 * the fixed clock and the literal-F law to be compatible with ciphertext.
 * For each consumed rune with c==key[j], the GP plaintext would be F and
 * must be repaired by changing that emission; any literal F is optional.
 *
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @returns {number}
 */
function minimumEmissionRepairs(ciphertext, key) {
  let states = new Map([[0,0]]);
  for (const c of ciphertext) {
    const next = new Map();
    for (const [j, repairs] of states) {
      if (c === 0 && repairs < (next.get(j) ?? Infinity))
        next.set(j, repairs);
      if (j < key.length) {
        const cost = repairs + Number(c === key[j]);
        if (cost < (next.get(j + 1) ?? Infinity)) next.set(j + 1, cost);
      }
    }
    states = next;
  }
  return Math.min(...states.values());
}

/** @returns {object} */
function main() {
  const lengths = whitespaceFields(signed);
  assert.deepEqual(lengths, [2,3,5,7,11,13,17,23,29,31,37]);
  const sourceDigest = crypto.createHash("sha256")
    .update(Buffer.from(signed,"utf8")).digest("hex");
  const sourcePrimes = firstPrimes(12);
  assert.deepEqual(sourcePrimes.filter(p => p !== 19), lengths);
  const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
  assert.equal(pages.length,55);
  const original = pages.flatMap(p => p.indices);
  assert.equal(original.length,12956);
  const known = nativeGP(KNOWN_P56);
  const authenticCipher = corpus.pages.find(p => p.page === 56).indices;
  assert.equal(known.length,85);
  const primes = firstPrimes(original.length + 60);
  const nativeKey = primes.map(p => (p - 1) % 29);
  const omittedKey = primes.filter(p => p !== 19).map(p => (p - 1) % 29);
  assert.deepEqual(encryptTransparentF(known,nativeKey),authenticCipher);
  assert.equal(feasible(authenticCipher,nativeKey).feasible,true);
  const plantPlain = Array.from({length:262},(_,i)=>known[i % known.length]);
  for (const key of [nativeKey,omittedKey]) {
    const plantCipher = encryptTransparentF(plantPlain,key);
    assert.equal(feasible(plantCipher,key).feasible,true);
    assert.equal(minimumEmissionRepairs(plantCipher,key),0);
  }
  /** @param {string} label @param {number[]} key */
  function inspect(label,key) {
    const perPage = pages.map(page => ({
      page:page.page,length:page.indices.length,
      feasible:feasible(page.indices,key).feasible,
      minimumEmissionRepairs:minimumEmissionRepairs(page.indices,key)
    }));
    const p0 = feasible(pages[0].indices,key);
    assert.equal(p0.firstFailure,235);
    const continuous = feasible(original,key);
    assert.equal(continuous.firstFailure,235);
    return {
      label,originalRunes:original.length,
      pageZeroFirstContradiction:p0.firstFailure,
      feasiblePageResets:perPage.filter(x=>x.feasible).map(x=>x.page),
      impossiblePageResets:perPage.filter(x=>!x.feasible).length,
      pageZeroMinimumRepairs:perPage[0].minimumEmissionRepairs,
      sumPerPageEmissionRepairs:perPage.reduce((sum,p)=>sum+p.minimumEmissionRepairs,0),
      wholeBookContinuousMinimumRepairs:minimumEmissionRepairs(original,key),
      completePerPageRepairs:perPage.map(x=>[x.page,x.minimumEmissionRepairs])
    };
  }
  const unmodified=inspect("native consecutive primes",nativeKey);
  const missing19=inspect("historical whitespace, prime19 omitted",omittedKey);
  assert.deepEqual(unmodified.feasiblePageResets,[1,49]);
  assert.deepEqual(missing19.feasiblePageResets,[1]);
  assert.equal(unmodified.sumPerPageEmissionRepairs,202);
  assert.equal(missing19.sumPerPageEmissionRepairs,210);
  assert.equal(unmodified.wholeBookContinuousMinimumRepairs,123);
  assert.equal(missing19.wholeBookContinuousMinimumRepairs,123);
  const omissionControl=sourcePrimes.map(omit=>{
    const key=primes.filter(x=>x!==omit).map(x=>(x-1)%29);
    return {omit,page0FirstContradiction:feasible(pages[0].indices,key).firstFailure};
  });
  assert.ok(omissionControl.every(x=>x.page0FirstContradiction===235));
  return {
    classification:"Exact conditional original-input no-go; no unknown LP2 plaintext",
    archivedSourceSHA256:sourceDigest,
    sourceWhitespaceFieldLengths:lengths,
    sourceMissingPrime:19,
    authenticP56Regression:{plaintextRunes:85,
      cipherMatchesExactly:true,literalFCount:known.filter(x=>x===0).length},
    synthetic262RuneControls:2,
    unmodified,missing19,
    singleOmittedPrimeControls:omissionControl,
    caution:"Whitespace need not be authenticated by a PGP cleartext signature; model assumes direct native-GP output and the exact solved-p56 literal-F law."
  };
}
if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports={whitespaceFields,firstPrimes,nativeGP,encryptTransparentF,
  feasible,minimumEmissionRepairs,main};
