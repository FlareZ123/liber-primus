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
  const prefix = '### ' + page;
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


/**
 * Standard continued-fraction convergents of the original magic-square ratio.
 * Every input quotient comes from exact Euclidean division, not table factor
 * selection. p/q is a reduced rational convergent to larger/smaller.
 * @param {ReturnType<euclid>} steps
 * @returns {{quotient:number,numerator:number,denominator:number}[]}
 */
function convergents(steps) {
  let p0 = 0, p1 = 1, q0 = 1, q1 = 0;
  const out = [];
  for (const {quotient:a} of steps) {
    [p0,p1] = [p1,a*p1+p0];
    [q0,q1] = [q1,a*q1+q0];
    out.push({quotient:a,numerator:p1,denominator:q1});
  }
  return out;
}

/** @param {bigint} value @param {bigint} prime */
function valuation(value,prime) {
  let count = 0, n = value;
  while (n % prime === 0n) {count++;n /= prime;}
  return count;
}

/**
 * Cross-artifact checkpoint: exact 256 printed table cells, conventional
 * base60 token decoding to bytes, naturally read big-endian as one 2048-bit
 * integer. Neither byte serialization nor the convergent index is authored.
 * @param {{denominator:number}[]} cf
 */
function tableConvergentControl(cf) {
  const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources',
    'liber-primus', 'lp2-grid-256.json'), 'utf8'));
  const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources',
    'liber-primus', 'lp2-ink-annotations.json'), 'utf8'));
  const bytes = grid.pages.flatMap(page => page.bytes);
  assert.equal(bytes.length,256);
  const redCount = ink.pages.reduce((n,page)=>n+(page.red_spans||[])
    .reduce((m,span)=>m+span.length,0),0);
  assert.equal(redCount,ink.counts.red);
  const c179 = cf[4].denominator, c225 = cf[5].denominator;
  assert.equal(c179,179);
  assert.equal(c225,225);
  assert.equal(redCount,c225);
  const number = bytes.reduce((n,b)=>256n*n+BigInt(b),0n);
  const square = BigInt(c179)**2n;
  assert.equal(valuation(number,BigInt(c179)),2);
  const q = number/square;
  assert.equal(number%square,0n);
  assert.equal(q%BigInt(c179),55n);
  assert.equal(valuation(q,29n),1);
  assert.equal(q/29n%BigInt(c179),113n);
  const next179Digit = q/BigInt(c179)%BigInt(c179);
  assert.equal(next179Digit,96n);
  return {
    convergent179:c179,convergent225:c225,sourceRedRunes:redCount,
    numericTableCells:bytes.length,bitLength:number.toString(2).length,
    base256:{v179:valuation(number,179n),qMod179:Number(q%179n),
      v29OfQuotient:valuation(q,29n),
      after29Mod179:Number(q/29n%179n),
      next179AdicDigit:Number(next179Digit)},
    derivedPrimeOrdinal:30
  };
}

/**
 * The solved first-release text says that primes and the totient function are
 * sacred. Source-local factorization of phi(1033*3301), after measuring four
 * independent manuscript structures, is an additional *postselected* map.
 */
function sourceTotientFactorization() {
  const ink = JSON.parse(fs.readFileSync(path.join(root,'resources',
    'liber-primus','lp2-ink-annotations.json'),'utf8'));
  const grid = JSON.parse(fs.readFileSync(path.join(root,'resources',
    'liber-primus','lp2-grid-256.json'),'utf8'));
  const signed = fs.readFileSync(path.join(root,'resources','historical',
    'cicada2016-4gq25-outguess.asc'),'utf8');
  const message=signed.split('-----BEGIN PGP SIGNATURE-----')[0]
    .split(/\r?\n\r?\n/).slice(1).join('\n\n')
    .replace(/\b[0-9A-F]{8}\b/gi,'');
  const signedWords = message.match(/[A-Za-z]+/g)||[];
  const redCount=ink.pages.reduce((n,p)=>n+(p.red_spans||[])
    .reduce((k,span)=>k+span.length,0),0);
  const gridRows=grid.pages.reduce((n,p)=>n+p.rows,0);
  const squareWidth=Math.sqrt(corpus.pages[32].indices.length);
  assert.equal(squareWidth,11);
  assert.equal(gridRows,32);
  assert.equal(redCount,225);
  assert.equal(signedWords.length,43);
  assert.equal(signedWords[29].toUpperCase(),'DIRECTION');
  const phi=(1033-1)*(3301-1);
  assert.equal(phi,3405600);
  assert.equal(phi,redCount*gridRows*squareWidth*signedWords.length);
  return {phi,sourceCounts:{originalRedRunes:redCount,
    printedP50Rows:gridRows,
    p32RuneSquareRoot:squareWidth,
    signed2016Words:signedWords.length},
    exactProduct:phi===redCount*gridRows*squareWidth*signedWords.length};
}


/** @param {number} ordinal @returns {number} */
function nthPrime(ordinal) {
  assert(Number.isInteger(ordinal)&&ordinal>=1);
  let count=0;
  for (let k=2;;k++) if(isPrime(k)&&++count===ordinal) return k;
}

/** @param {number} n @returns {number} */
function primeOrdinal(n) {
  assert(isPrime(n));
  let ordinal=0;
  for(let x=2;x<=n;x++)if(isPrime(x))ordinal++;
  return ordinal;
}

/**
 * Source-only prime/convergent selection, conceived retrospectively:
 * first STRICTLY INTERNAL convergent whose numerator and denominator
 * are both prime. Project numerator to its one-based prime ordinal;
 * project denominator to the prime at that one-based ordinal.
 * @param {ReturnType<convergents>} cf
 */
function uniqueInternalPrimeConvergent(cf) {
  const hits=cf.map((c,index)=>({index,...c}))
    .slice(1,-1)
    .filter(c=>isPrime(c.numerator)&&isPrime(c.denominator));
  assert.equal(hits.length,1);
  const h=hits[0];
  return {index:h.index,numerator:h.numerator,denominator:h.denominator,
    numeratorPrimeOrdinal:primeOrdinal(h.numerator),
    primeAtDenominatorOrdinal:nthPrime(h.denominator)};
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
  const cf=convergents(state.steps);
  assert.deepEqual(cf.map(x=>[x.quotient,x.numerator,x.denominator]),[
    [3,3,1],[5,16,5],[8,131,41],[1,147,46],
    [3,572,179],[1,719,225],[1,1291,404],[2,3301,1033]
  ]);
  const primePair=uniqueInternalPrimeConvergent(cf);
  assert.deepEqual(primePair,{index:2,numerator:131,denominator:41,
    numeratorPrimeOrdinal:32,primeAtDenominatorOrdinal:179});
  const crossTable=tableConvergentControl(cf);
  assert.equal(primePair.primeAtDenominatorOrdinal,crossTable.convergent179);
  const totientCoordinates=sourceTotientFactorization();

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
    convergents:cf,
    sourceOnlyPrimeConvergentSelector:primePair,
    originalSourceTableCrossing:crossTable,
    totientCrossArtifactCounts:totientCoordinates,
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
module.exports={square,euclid,inverse,power,candidate,fragments,convergents,valuation,tableConvergentControl,sourceTotientFactorization,uniqueInternalPrimeConvergent,nthPrime,primeOrdinal};
