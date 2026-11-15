'use strict';

/**
 * Frozen original-source gate: the preserved 2013 prime_echo contains the
 * first 464 primes, from 2 through 3301. There are 16 consecutive LP2
 * floral-border pages (physical p40..55) and 29 GP runes. Test each 29-prime
 * row against its corresponding complete original physical page.
 *
 * The only cipher borrowed is the independently solved p56 GP29
 * phi(prime) additive operation, with exact plaintext-F transparency.
 *
 * Run with Node 22 on Windows: node sims/lp2_2013_primeecho_floral16_pagekey_sft.cjs
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const corpus = require(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'));
const MOD = 29;

/** @param {number} value @returns {number} */
function gp(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number} max @returns {number[]} */
function primesThrough(max) {
  const flags = new Uint8Array(max + 1);
  const primes = [];
  for (let n = 2; n <= max; n++) {
    if (flags[n]) continue;
    primes.push(n);
    for (let multiple = n * n; multiple <= max; multiple += n) flags[multiple] = 1;
  }
  return primes;
}

/**
 * Exact 29-phase nondeterministic inverse of known p56 F-transparent cipher.
 * A ciphertext F may be literal P=F (no clock), or ordinary P!=F that
 * encrypted to C=F (consumes clock). The latter possibility is important:
 * treating all ciphertext F as bypass is an incorrect inverse.
 *
 * @param {readonly number[]} cipher Original source rune indices.
 * @param {readonly number[]} key One original 29-prime row.
 * @returns {{survives:boolean, firstFailure:number, terminalPhases:number[],
 * maxPhaseCount:number}}
 */
function legalStates(cipher, key) {
  let phases = new Set([0]);
  let maxPhaseCount = 1;
  for (let index = 0; index < cipher.length; index++) {
    const next = new Set();
    for (const phase of phases) {
      const shift = gp(key[phase] - 1);
      const plain = gp(cipher[index] - shift);
      if (cipher[index] === 0) {
        // Authentic solved-p56 bypass: plaintext F=0 emits C=0, no advance.
        next.add(phase);
        // Ordinary encrypted P!=F may also emit ciphertext F.
        if (plain !== 0) next.add((phase + 1) % MOD);
      } else if (plain !== 0) {
        // Ordinary nonzero C has no plaintext-F bypass.
        next.add((phase + 1) % MOD);
      }
    }
    if (!next.size) {
      return { survives: false, firstFailure: index,
        terminalPhases: [], maxPhaseCount };
    }
    phases = next;
    maxPhaseCount = Math.max(maxPhaseCount, phases.size);
  }
  return { survives: true, firstFailure: -1,
    terminalPhases: [...phases].sort((a,b)=>a-b), maxPhaseCount };
}

/**
 * Native GP cipher positive using authentic p56 operation and a known,
 * independent 95-symbol p57 clear-runic message.
 * @param {readonly number[]} plain
 * @param {readonly number[]} key
 * @returns {{cipher:number[], phases:number[]}}
 */
function encrypt(plain, key) {
  let phase = 0;
  const cipher = [];
  const phases = [];
  for (const letter of plain) {
    phases.push(phase);
    if (letter === 0) {
      cipher.push(0);
      continue;
    }
    cipher.push(gp(letter + key[phase] - 1));
    phase = (phase + 1) % MOD;
  }
  return { cipher, phases };
}

/** @param {number} n @returns {number[]} */
function original(n) {
  const page = corpus.pages.find(p => p.page === n);
  assert.ok(page, 'original physical page missing: ' + n);
  return page.indices;
}

const primes = primesThrough(3301);
assert.equal(primes.length, 464);
assert.equal(primes[173], 1033);
assert.equal(primes[463], 3301);
assert.equal(primes.slice(0,29).at(-1), 109);
assert.equal(corpus.translit.length, 29);

const firstRow = primes.slice(0,29);
assert.deepEqual(firstRow.slice(0,5), [2,3,5,7,11]);
const realP56KeyFirst = [1,2,4];
const realP56 = original(56), realP56PlainFirst = [24,9,18];
assert.deepEqual(realP56.slice(0,3),
  realP56PlainFirst.map((p,i)=>gp(p+realP56KeyFirst[i])));

const nativeP57 = original(57);
assert.equal(nativeP57.length,95);
const synthetic = encrypt(nativeP57,firstRow);
for (let i=0;i<nativeP57.length;i++){
  const plain = synthetic.cipher[i]===0 && nativeP57[i]===0 ?
    0 : gp(synthetic.cipher[i]-(firstRow[synthetic.phases[i]]-1));
  assert.equal(plain,nativeP57[i], 'planted GP29 rune '+i);
}
assert.equal(legalStates(synthetic.cipher,firstRow).survives,true);

const source = [];
for(let page=40;page<=55;page++){
  const cipher=original(page);
  const ordinal=(page-40)*29;
  const key=primes.slice(ordinal,ordinal+29);
  assert.equal(key.length,29);
  source.push({
    physicalPage:page,
    originalRunes:cipher.length,
    primeRow:page-39,
    primeFirst:key[0],
    primeLast:key[28],
    frozenSourceOrder:legalStates(cipher,key),
  });
}
assert.equal(source.length,16);
assert.equal(source[10].physicalPage,50);
assert.equal(source[10].originalRunes,0);
assert.deepEqual(source.filter(x=>x.originalRunes>0 &&
  x.frozenSourceOrder.survives).map(x=>x.physicalPage),[]);
assert.equal(source.find(x=>x.physicalPage===40).frozenSourceOrder.firstFailure,39);
assert.equal(source.find(x=>x.physicalPage===55).frozenSourceOrder.firstFailure,33);

console.log(JSON.stringify({
  source:'2013 Cicada OS usr_local_bin/prime_echo original prime list; LP2 source rune corpus',
  sourceUpstream:'https://github.com/krisyotam/cicada3301/blob/main/puzzles/2013/cicada-os/usr_local_bin/prime_echo',
  totalPrimes:primes.length,
  markedPrimeBreaks:[{prime:1033, ordinal:174},{prime:3301, ordinal:464}],
  model:'16 consecutive prime rows of 29, physical pages 40..55; phi(prime) mod29, strict p56 plaintext-F bypass',
  rowsFailing:source.filter(x=>x.originalRunes && !x.frozenSourceOrder.survives).length,
  rowsPassing:source.filter(x=>x.originalRunes && x.frozenSourceOrder.survives).length,
  emptyPage:50,
  solvedP56OpeningControl:'ANE / AE J OE, shifts 1/2/4',
  originalP57SyntheticPositive:'95/95 recovered; at least one legal path',
  pages:source,
},null,2));
