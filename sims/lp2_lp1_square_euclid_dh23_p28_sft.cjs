'use strict';

/**
 * Cross-release original-source candidate, not an authenticated decryptor:
 * the 2014 LP1 solved 5x5 magic-square row sums (1033 and 3301) generate
 * the complete small DH23 example through a fixed Euclidean field reading,
 * and those values address original LP2 p28 DH and H-shell geometry.
 *
 * The choice to interpret Euclid q0/q1/r1/q2 and final non-unit remainder
 * as e/g/p/A/K was made retrospectively. Source coincidence does not select
 * a cryptographic decoder. Run under Node22 on Windows:
 * node sims/lp2_lp1_square_euclid_dh23_p28_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp1-plaintext-reference.txt'), 'utf8');
const transcription = fs.readFileSync(path.join(root, 'resources',
  'transcriptions', 'lp2-image-corrected.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));

/**
 * Read the visible five-row numeric square of a solved LP1 source page.
 * These are original first-release numerical rows, not guessed key inputs.
 * @param {number} page
 * @returns {number[][]}
 */
function square(page) {
  const prefix = '### ' + page + '\n';
  const start = source.indexOf(prefix);
  assert(start >= 0, 'missing solved page ' + page);
  const next = source.indexOf('### ', start + prefix.length);
  const section = source.slice(start, next < 0 ? undefined : next);
  const rows = section.split(/\r?\n/).map(line => line.trim().split(/\s+/))
    .filter(fields => fields.length === 5 && fields.every(x => /^\d+$/.test(x)))
    .map(fields => fields.map(Number));
  assert.equal(rows.length, 5, 'exact 5x5 numeric source on LP1 p' + page);
  return rows;
}

/** @param {number} n */
function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {{dividend:number,divisor:number,quotient:number,remainder:number}[]}
 */
function euclid(a, b) {
  assert(a > b && b > 0);
  const rows = [];
  while (b) {
    const q = Math.floor(a / b);
    const r = a - q * b;
    rows.push({dividend:a, divisor:b, quotient:q, remainder:r});
    a = b;
    b = r;
  }
  return rows;
}

/** @param {number} a @param {number} p */
function inverse(a, p) {
  assert.equal(gcd(a, p), 1);
  for (let b = 1; b < p; b++) if (a * b % p === 1) return b;
  throw new Error('no inverse');
}

/** @param {number} base @param {number} exp @param {number} modulus */
function power(base, exp, modulus) {
  assert(Number.isInteger(exp) && exp >= 0);
  let r = 1, v = base % modulus, n = exp;
  while (n) {
    if (n % 2) r = (r * v) % modulus;
    v = (v * v) % modulus;
    n = Math.floor(n / 2);
  }
  return r;
}

/**
 * Fixed exploratory field-selection rule, reconstructed after p28 was known:
 * q0→e, q1→g, r1→p, q2→A, final non-unit remainder→K.
 * @param {number} larger
 * @param {number} smaller
 */
function candidate(larger, smaller) {
  const steps = euclid(larger, smaller);
  if (steps.length < 4) return null;
  const [e, g, p, A] = [steps[0].quotient,
    steps[1].quotient, steps[1].remainder, steps[2].quotient];
  const nonunit = steps.map(x => x.remainder).filter(x => x >= 2);
  if (!nonunit.length || e < 2 || g < 2 || p <= g ||
    !isPrime(p) || gcd(e,p-1) !== 1) return null;
  const K = nonunit.at(-1);
  const a = e * K;
  const b = inverse(e, p - 1);
  const B = power(g,b,p);
  const first = steps[2].remainder === p - g;
  const second = power(g,a,p) === A;
  const third = power(A,b,p) === K;
  return {e,g,p,A,K,a,b,B,
    remainder:steps[2].remainder,
    conditions:[first,second,third],
    successful:first&&second&&third,
    steps};
}

/** @param {number} number */
function reverseDigits(number) {
  return Number(String(number).split('').reverse().join(''));
}

/** @param {string} text */
function fragments(text) {
  const out = [];
  const current = [];
  for (const rune of text) {
    const index = corpus.runes.indexOf(rune);
    if (index >= 0) current.push(index);
    else if (rune === '-' || rune === '.') {
      if (current.length) out.push(current.splice(0));
    }
  }
  if (current.length) out.push(current);
  return out;
}

function main() {
  const rows1 = square(5), rows2 = square(16);
  const sum1 = rows1[0].reduce((a,b) => a+b,0);
  const sum2 = rows2[0].reduce((a,b) => a+b,0);
  for (const [rows, sum] of [[rows1,sum1],[rows2,sum2]]) {
    assert(rows.every(row => row.reduce((a,b) => a+b,0)===sum));
    for (let i=0;i<5;i++) assert.equal(
      rows.reduce((t,row) => t+row[i],0),sum);
  }
  assert.equal(sum1,1033);
  assert.equal(sum2,3301);
  assert.equal(reverseDigits(sum2),sum1);
  assert(isPrime(sum1) && isPrime(sum2));
  const state = candidate(sum2,sum1);
  assert(state);
  assert.deepEqual(state.steps.map(x => [x.quotient,x.remainder]),[
    [3,202],[5,23],[8,18],[1,5],[3,3],[1,2],[1,1],[2,0]
  ]);
  assert.deepEqual([
    state.e,state.g,state.p,state.A,state.K,
    state.a,state.b,state.B
  ],[3,5,23,8,2,6,15,19]);
  assert(state.successful);
  assert.equal(power(state.B,state.a,state.p),state.K);
  assert.equal(state.steps[3].remainder,state.g);

  // Original LP2 p28 contains a literal 'DH' fragment [23,8], followed by
  // the known source geometry of a 22-rune / 6-fragment line.
  const p28 = transcription.split('%')[28];
  const lines = p28.split('/').filter(line =>
    [...line].some(rune => corpus.runes.includes(rune)));
  const line6 = fragments(lines[5]);
  assert.deepEqual(line6[0],[state.p,state.A]);
  assert.equal(line6[0].map(i=>corpus.translit[i]).join(''),'DH');
  const line7 = fragments(lines[6]);
  assert.equal(line7.length,state.a);
  assert.equal(line7.reduce((n,f)=>n+f.length,0),state.p-1);
  const target = line7[state.e-1];
  assert.equal(target.length,state.g);
  assert.deepEqual(target,[10,18,13,28,8]);
  const H=(x,y)=>[(x-y+29)%29,(x+y)%29];
  const hTarget=H(target[0],target.at(-1));
  assert.deepEqual(hTarget,[state.K,state.p-state.g]);
  assert.equal(hTarget.map(x=>corpus.translit[x]).join(''),'THE');
  const first=fragments(lines[0]);
  const startOutput=first.slice(0,2).flatMap(f =>
    H(f[0],f.at(-1))).map(x=>corpus.translit[x]).join('');
  assert.equal(startOutput,'HERE');

  // Multiple-comparison-aware descriptive comparison: all four-digit prime
  // pairs that are decimal reversals, larger first (102 pairs total). The
  // operator/field tests here were recognized AFTER viewing the real source.
  // Their observed uniqueness must NOT be quoted as a valid p-value.
  const pairResults=[];
  for(let n=1000;n<=9999;n++) {
    const m=reverseDigits(n);
    if(m>=1000&&n>m&&isPrime(n)&&isPrime(m)) {
      const s=candidate(n,m);
      pairResults.push({n,m,eligible:!!s,conditions:s?.conditions,
        successful:s?.successful||false});
    }
  }
  assert.equal(pairResults.length,102);
  const matched=pairResults.filter(x=>x.successful);
  assert.deepEqual(matched.map(x=>[x.n,x.m]),[[3301,1033]]);
  console.log(JSON.stringify({
    classification:'retrospective source-to-DH state hypothesis; local H readout only',
    sourceSquares:{LP1p5:sum1,LP1p16:sum2,decimalReverse:true},
    euclid:state.steps,
    constructedState:{p:state.p,g:state.g,a:state.a,b:state.b,
      A:state.A,B:state.B,K:state.K,e:state.e,checks:state.conditions},
    originalP28:{line6DH:line6[0],line7RuneCount:22,
      line7Fragments:line7.length,selectedFragment:target,
      HOutput:hTarget,startOutput,targetOutput:'THE'},
    descriptiveReversePrimeControl:{
      pairs:pairResults.length,
      eligible:pairResults.filter(x=>x.eligible).length,
      matches:matched.map(x=>[x.n,x.m]),
      warning:'Postselected tests: not a prospective probability or decipherment.'
    },
    decision:'Source-linked small-DH state is reproducible; Euclidean field semantics, H readout, and any general LP2 cipher remain unauthenticated.'
  },null,2));
}
if(require.main===module)main();
module.exports={square,euclid,inverse,power,candidate,fragments};
