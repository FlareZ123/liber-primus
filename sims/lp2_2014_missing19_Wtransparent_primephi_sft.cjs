'use strict';
/**
 * Source-selected omitted-GP-prime W as a possible transparent rune
 * in the authentic solved-LP2-p56 prime/totient cipher family.
 *
 * Original 2014 Stage11 signed redirect contains prime-width margins
 * 2,3,5,7,11,13,17,23,29,31,37. In GP29 the absent prime19 is W.
 * This is an unauthenticated trailing-whitespace *hypothesis*, not
 * a first-party command: these margins are excluded from PGP hashing.
 *
 * Exact source-only SFT: node sims/lp2_2014_missing19_Wtransparent_primephi_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g,'\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2014-stage11-message.asc');
const part = signed.split('Hash: SHA1\n\n')[1].split('-----BEGIN PGP SIGNATURE-----')[0];
assert(part && part.includes('ky2khlqdf7qdznac.onion'));
const whitespace = [];
for (const line of part.split(/\r?\n/)) {
  if (/^ +$/.test(line)) {
    whitespace.push(line.length);
    continue;
  }
  const lead = line.match(/^ +/);
  const tail = line.match(/ +$/);
  if (lead) whitespace.push(lead[0].length);
  if (tail) whitespace.push(tail[0].length);
}
assert.deepEqual(whitespace, [2,3,5,7,11,13,17,23,29,31,37]);
const expected = [2,3,5,7,11,13,17,19,23,29,31,37];
assert.deepEqual(whitespace, expected.filter(p => p !== 19));
assert.equal(gp.prime.indexOf(19), 7);
assert.equal(gp.translit[7], 'W');

/** @returns {number[]} */
function makePrimes() {
  const primes = [];
  for (let n=2; primes.length < 1000; n++) {
    let prime = true;
    for (const p of primes) {
      if (p*p > n) break;
      if (n%p===0) { prime=false; break; }
    }
    if (prime) primes.push(n);
  }
  return primes;
}
const primes = makePrimes();
assert.deepEqual(primes.slice(0,12), expected);
const shift = primes.map(p => (p-1) % 29);
const shiftWithout19 = primes.filter(p => p !== 19).map(p => (p-1) % 29);
const mod = n => (n % 29 + 29) % 29;

/**
 * Exact positive forward cipher: transparent P=marker emits C=marker
 * without advancing the successive-prime-totient key cursor.
 * @param {number[]} plain
 * @param {number} marker
 * @returns {{cipher:number[], consumed:number}}
 */
function encrypt(plain, marker, schedule=shift) {
  const cipher = [];
  let consumed = 0;
  for (const p of plain) {
    if (p === marker) cipher.push(marker);
    else cipher.push((p + schedule[consumed++]) % 29);
  }
  return {cipher,consumed};
}
/**
 * Exact ALL-legal-history inverse, not a fixed guessed skip mask.
 * At every source position, C=marker MAY be the literal transparent
 * marker; every consumed key MUST decode to a nonmarker plaintext.
 * A plaintext marker is never allowed to consume.
 *
 * @param {number[]} cipher
 * @param {number} marker
 * @returns {{firstFailure:number,reachableCount:number,reachableConsumed:number[],maxStates:number}}
 */
function legalStates(cipher, marker, schedule=shift) {
  let reachable = new Set([0]), maxStates = 1;
  for (let i=0;i<cipher.length;i++) {
    const next = new Set();
    for (const used of reachable) {
      if (cipher[i] === marker) next.add(used);
      if (mod(cipher[i] - schedule[used]) !== marker) next.add(used + 1);
    }
    reachable = next;
    maxStates = Math.max(maxStates, next.size);
    if (!next.size) return {
      firstFailure:i,reachableCount:0,reachableConsumed:[],maxStates
    };
  }
  return {firstFailure:null,reachableCount:reachable.size,
    reachableConsumed:[...reachable].sort((a,b)=>a-b),maxStates};
}
// Historic authentic solved-LP2-p56 plaintext, with the printed hash
// excluded: hashes are an interleaved non-GP character field.
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const source56 = reference.split('### 56\n')[1].split('### 57\n')[0];
assert(source56.startsWith('AN END\n'));
const stripped56 = source56.replace(/[a-f0-9]{40,}/g,' ');
const words56 = stripped56.match(/[A-Z]+/g) || [];
const translits = gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function sourceGP(text) {
  const output = [];
  for (const initial of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = initial.replace(/QU/g, 'CW').replace(/V/g,'U')
      .replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for(let i=0;i<word.length;) {
      if(word.startsWith('ING',i)) {output.push(21);i+=3;}
      else if(word.startsWith('IO',i)) {output.push(27);i+=2;}
      else {
        const t=translits.find(t=>word.startsWith(t.s,i));
        assert(t,'unrepresented native word '+word);
        output.push(t.i);
        i+=t.s.length;
      }
    }
  }
  return output;
}
const knownPlain56 = sourceGP(words56.join(' '));
assert.equal(knownPlain56.length,85);
const authentic = encrypt(knownPlain56,0);
assert.equal(authentic.consumed,84);
assert.deepEqual(authentic.cipher,gp.pages[56].indices,
  'original solved p56 positive: exact F-transparent phi-prime encryption');
const nativeFcheck=legalStates(authentic.cipher,0);
assert.equal(nativeFcheck.firstFailure,null);
assert(nativeFcheck.reachableConsumed.includes(84));

// W at GP prime 19 is the exact source-omitted prime, a *different*
// hypothetical transparent marker. No arbitrary phase/key fitting.
const original = [0,19,55,56].map(page=>{
  const C=gp.pages[page].indices;
  const W=legalStates(C,7);
  const F=legalStates(C,0);
  return {page,cipherRunes:C.length,
    W:W,originalF:F,firstCipherRunes:C.slice(0,6).map(i=>gp.translit[i])};
});
assert.deepEqual(original.map(x=>x.W.firstFailure),[5,47,71,5]);
assert.equal(original.find(x=>x.page===56).originalF.firstFailure,null);
assert.equal(original.find(x=>x.page===0).originalF.firstFailure,235);

// Same-method true W-transparent planted positive with source-native text,
// original p0 length, and exact source-coded key; all histories retained.
const plantP=Array.from({length:262},(_,i)=>knownPlain56[i%knownPlain56.length]);
const planted=encrypt(plantP,7);
const decodePlant=legalStates(planted.cipher,7);
assert.equal(decodePlant.firstFailure,null);
assert(decodePlant.reachableConsumed.includes(planted.consumed));
assert.deepEqual(encrypt(plantP,7).cipher,planted.cipher);
// Second, even simpler missing-prime reading: keep the actual p56
// transparent F, delete only prime19 from its otherwise unchanged clock.
const omittedPrime19Direct = [0,19,55,56].map(page => ({
  page, GP:gp.pages[page].indices.length,
  cipherFtransparent:legalStates(gp.pages[page].indices,0,shiftWithout19)
}));
assert.deepEqual(omittedPrime19Direct.map(x=>x.cipherFtransparent.firstFailure),
  [235,82,39,19]);
const omittedPlaintext = plantP.map((v,i)=>v); // same length and native corpus
const omittedCipher = encrypt(omittedPlaintext,0,shiftWithout19);
const omittedPlantCheck = legalStates(omittedCipher.cipher,0,shiftWithout19);
assert.equal(omittedPlantCheck.firstFailure,null);
assert(omittedPlantCheck.reachableConsumed.includes(omittedCipher.consumed));
console.log(JSON.stringify({
  authorArtifact:'2014 original signed Stage11 redirect; literal margins not PGP authenticated',
  primeMargins:whitespace,absentPrime:19,sourceGPsymbol:'W (index7)',
  original,
  omittedPrime19FromPhiClock:{original:omittedPrime19Direct,
    planted262RuneForwardInverse:true},
  positive:{authenticKnownP56Runes:85,authenticPrimeSteps:84,
    authenticFtransparentExact:true,
    plantedWRunes:262,plantedWConsumed:planted.consumed,
    plantedWReachable:true},
  conclusion:'At p0 index5 the original ciphertext M requires plaintext W under prime phi shift12, but C is not W. W-transparent transfer is algebraically impossible with the solved p56 phase-zero phi-prime clock. No unknown plaintext recovered.'
},null,2));
