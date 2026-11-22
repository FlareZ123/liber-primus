'use strict';

/**
 * Exact original-cipher necessary-condition gate for the historical LP2 p56
 * phi(prime) GP29 cipher with transparent plaintext F. Search the first
 * 5,000 possible prime starting indices at each source-visible chapter.
 * No language model or unknown plaintext guesses enter the reachability test.
 * Run with: node sims/lp2_p56_phi_ftransparent_5000start_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const groups = [
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]
];
const totalStarts = 5000;
const expectedZeroStart = [235,22,30,10,0,95,58,38,105];
const expectedMax = [674,498,524,559,553,642,594,648,308];
const expectedSurvivors = [[],[],[],[],[],[],[],[],
  [167,168,3047,4121,4365,4366]];

/** @param {number} count @returns {number[]} */
function primeTotients(count) {
  const limit = 180000;
  const composite = new Uint8Array(limit);
  const out = [];
  for (let p = 2; p < limit && out.length < count; p += 1) {
    if (composite[p]) continue;
    out.push((p - 1) % 29);
    if (p * p < limit) {
      for (let k = p * p; k < limit; k += p) composite[k] = 1;
    }
  }
  assert.equal(out.length, count, 'Prime sieve bound');
  return out;
}
const key = primeTotients(9000);
const mod29 = n => ((n % 29) + 29) % 29;

/**
 * Exact reachability across every transparent-F decision.
 * All possible paths with the same consumed-prime count have identical
 * future viability, so the DP safely merges them.
 * @param {number[]} cipher Native unchanged GP29 indices
 * @param {number} start Key index before its first rune
 * @returns {number} Number of original runes with a viable path
 */
function furthest(cipher, start) {
  /** @type {number[]} */
  let states = [0];
  for (let i = 0; i < cipher.length; i += 1) {
    const c = cipher[i];
    const seen = new Uint8Array(i + 2);
    const next = [];
    for (const used of states) {
      if (c === 0 && !seen[used]) {
        next.push(used);
        seen[used] = 1;
      }
      // Consuming plaintext F is forbidden by the real p56 encoder.
      if (mod29(c - key[start + used]) !== 0 && !seen[used + 1]) {
        next.push(used + 1);
        seen[used + 1] = 1;
      }
    }
    if (!next.length) return i;
    states = next;
  }
  return cipher.length;
}

/** @param {string} word Solved p56 spelling @returns {number[]} */
function gpWord(word) {
  const tokens = source.translit.map((s,i) => ({s,i}))
    .sort((a,b) => b.s.length - a.s.length);
  const s = word.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out = [];
  for (let i=0;i<s.length;) {
    const match = tokens.find(t => s.startsWith(t.s,i));
    assert.ok(match, 'Unencodable solved p56 word');
    out.push(match.i);
    i += match.s.length;
  }
  return out;
}

/** @param {number[]} plain @param {number} start @returns {number[]} */
function encrypt(plain,start) {
  let used = 0;
  return plain.map(p => p === 0 ? 0 : mod29(p + key[start + used++]));
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const hist = new Array(29).fill(0);
  for (const c of a) hist[c] += 1;
  return hist.reduce((n,x) => n+x*(x-1),0) / (a.length*(a.length-1));
}

/**
 * For the six surviving p54–55 offsets, enumerate every one of its
 * source-visible ciphertext-F skip masks (2^6) and retain only legal paths.
 * @param {number[]} cipher
 * @param {number} start
 * @returns {{mask:number, consumed:number, ioc:number, opening:string}[]}
 */
function allPlaintexts(cipher,start) {
  const fPositions = cipher.flatMap((c,i) => c === 0 ? [i] : []);
  assert.equal(fPositions.length, 6);
  const out = [];
  for (let mask = 0; mask < (1 << fPositions.length); mask += 1) {
    let used = 0, j = 0, valid = true;
    const plain = [];
    for (const c of cipher) {
      if (c === 0 && ((mask >>> j) & 1)) {
        plain.push(0);
      } else {
        const p = mod29(c - key[start + used++]);
        if (p === 0) { valid = false; break; }
        plain.push(p);
      }
      if (c === 0) j += 1;
    }
    if (valid) {
      assert.deepEqual(encrypt(plain,start), cipher);
      out.push({
        mask, consumed:used, ioc:ioc(plain),
        opening:plain.slice(0,32).map(x=>source.translit[x]).join(' ')
      });
    }
  }
  return out;
}

const p56 = source.pages[56].indices;
const p56Known = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ').flatMap(gpWord);
assert.equal(p56Known.length,85);
assert.deepEqual(encrypt(p56Known,0),p56);
assert.equal(furthest(p56,0),85);
assert.equal(furthest(encrypt(p56Known,167),167),85);

const result = groups.map(([from,to],g) => {
  const cipher = source.pages.filter(p => p.page>=from && p.page<=to)
    .flatMap(p => p.indices);
  let max = 0;
  const survived = [];
  for (let start = 0; start < totalStarts; start += 1) {
    const reached = furthest(cipher,start);
    if (reached > max) max = reached;
    if (reached === cipher.length) survived.push(start);
  }
  assert.equal(furthest(cipher,0),expectedZeroStart[g]);
  assert.equal(max,expectedMax[g]);
  assert.deepEqual(survived,expectedSurvivors[g]);
  return {
    pages:'p'+from+'–'+to, originalRunes:cipher.length,
    firstImpossibleAtStartZero:expectedZeroStart[g],
    furthestAnyStart:max, viablePrimeStarts:survived,
    originalCandidatePaths:g===8
      ? survived.flatMap(s=>allPlaintexts(cipher,s).map(p=>({start:s,...p})))
      : []
  };
});
assert.equal(result.reduce((n,r)=>n+r.originalRunes,0),12956);
assert.equal(result[8].originalCandidatePaths.length,8);
assert.ok(result[8].originalCandidatePaths.every(x=>x.ioc<0.04));

console.log(JSON.stringify({
  source:'resources/liber-primus/lp2-corpus.json',
  originalP56ExactPositive:'85/85, original plaintext-F bypass, start prime2',
  secondaryPositive:'85/85 at shifted prime start 167',
  searchedPrimeStartIndices:'0..4999 inclusive',
  sourceRunes:12956, chapters:result,
  decision:'Eight original unknown chapters have no legal F-transparent p56-phi decoding for any of 5000 prime starts. Final p54–55 has eight legal 308-rune decodes across six starts, all GP IoC below 0.04, without authentic native text. No unknown-page key or plaintext recovered.'
},null,2));
