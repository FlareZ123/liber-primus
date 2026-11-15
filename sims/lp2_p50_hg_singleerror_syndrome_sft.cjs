'use strict';

/**
 * Single-residue-error recovery for the original 256-cell LP2 numeric table.
 *
 * Conditional hypothesis: read printed tokens as conventional base60 bytes
 * and their residues as a descending GF29 polynomial divisible by
 * H(X) = 3+26X+24X^2 (2013 signed BASE29 example)
 * G(X) = 27+5X+15X^2 = 15(X-24)^2 (LP2 p39 red triad).
 *
 * Run on Node.js 22 from the repository root:
 * node sims/lp2_p50_hg_singleerror_syndrome_sft.cjs
 *
 * This is an error-correcting *conditional algebraic code*. No original
 * LP2 ciphertext rune is decrypted. It repairs residues modulo29, not
 * bytes: any byte error divisible by29 is invisible to this check.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const source = require('../resources/liber-primus/lp2-grid-256.json');

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const ALT59 = ALPHABET.replace('f', '');
const mod = (x) => ((x % 29) + 29) % 29;

/** @param {number} a @returns {number} */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(i * a) === 1) return i;
  throw new Error('zero has no inverse in GF29');
}

/**
 * Multiply in GF(29^2) represented by GF29[X]/(X^2+18X+11).
 * @param {number[]} a @param {number[]} b @returns {number[]}
 */
function multiplyH(a, b) {
  return [
    mod(a[0] * b[0] - 11 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] - 18 * a[1] * b[1])
  ];
}

/** @param {number[]} base @param {number} power @param {(a:number[],b:number[])=>number[]} mul @param {number[]} one */
function powerInField(base, power, mul, one) {
  let result = one, next = base, exponent = power;
  while (exponent > 0) {
    if (exponent % 2) result = mul(result, next);
    next = mul(next, next);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

/**
 * Compute P(24), P'(24), P mod H from descending coefficients.
 * H normalized to X^2+18X+11; G has a double root 24.
 * @param {number[]} bytes @returns {{value:number,derivative:number,h:number[]}}
 */
function syndrome(bytes) {
  let value = 0, derivative = 0, h = [0, 0];
  for (const byte of bytes) {
    derivative = mod(24 * derivative + value);
    value = mod(24 * value + byte);
    h = multiplyH(h, [0, 1]);
    h[0] = mod(h[0] + byte);
  }
  return { value, derivative, h };
}

/**
 * If exactly one polynomial coefficient changed by a nonzero GF29 value,
 * return its original zero-based cell and the corruption residue.
 * @param {number[]} bytes
 * @returns {{index:number,delta:number,exponent:number}|null}
 */
function locateOneResidueError(bytes) {
  const s = syndrome(bytes);
  if (s.value === 0) return null;
  const exponentMod29 = mod(24 * s.derivative * inverse(s.value));
  const candidates = [];
  for (let exponent = exponentMod29; exponent < bytes.length; exponent += 29) {
    const p24 = powerInField([24], exponent, (a, b) => [mod(a[0] * b[0])], [1])[0];
    const delta = mod(s.value * inverse(p24));
    const atH = multiplyH([delta, 0],
      powerInField([0, 1], exponent, multiplyH, [1, 0]));
    if (atH[0] === s.h[0] && atH[1] === s.h[1])
      candidates.push({ index: bytes.length - 1 - exponent, delta, exponent });
  }
  return candidates.length === 1 ? candidates[0] : null;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function parseToken(token, alphabet) {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0);
  return alphabet.length * a + b;
}

/** Ascending GF29 polynomial multiplication. @param {number[]} a @param {number[]} b */
function multiplyPolynomial(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++) out[i + j] = mod(out[i + j] + a[i] * b[j]);
  return out;
}

/**
 * The p15 signed matrix supplies P(8)=27 and P(17)=15, two extra
 * conditional parity checks. Return all six error syndromes.
 * @param {number[]} v @returns {number[]}
 */
function syndromeSix(v) {
  const s = syndrome(v);
  const evaluation = (x) => v.reduce((a,b) => mod(a * x + b),0);
  return [s.value,s.derivative,...s.h,mod(evaluation(8)-27),mod(evaluation(17)-15)];
}
/** @param {number[]} a @returns {number} */
const sixKey = a => a.reduce((v,x) => v * 29 + x,0);
/** @param {number[]} a @param {number[]} b @returns {number[]} */
const sixDiff = (a,b) => a.map((v,i) => mod(v-b[i]));

/** Complete six-syndrome dictionary of single-error terms. */
function singleErrorIndex() {
  const map=new Map(), all=[];
  let h=[1,0],p=1,d=0,q=1,r=1;
  for(let e=0;e<256;e++) {
    const basis=[p,d,h[0],h[1],q,r];
    for(let delta=1;delta<29;delta++) {
      const values=basis.map(v=>mod(v*delta));
      const key=sixKey(values);
      assert(!map.has(key));
      const item={e,delta,values};
      map.set(key,item);all.push(item);
    }
    d=mod(24*d+p);p=mod(24*p);
    q=mod(8*q);r=mod(17*r);h=multiplyH(h,[0,1]);
  }
  return {map,all};
}
/**
 * Enumerate all solutions rather than assuming a six-check code
 * can uniquely correct every two-error pattern.
 * @param {number[]} target
 * @param {{map:Map<number,{e:number,delta:number,values:number[]}>,all:Array<{e:number,delta:number,values:number[]}>}} idx
 */
function recoverTwo(target,idx) {
  const found=new Map();
  for(const first of idx.all) {
    const second=idx.map.get(sixKey(sixDiff(target,first.values)));
    if(!second||first.e===second.e)continue;
    const both=[first,second].sort((a,b)=>a.e-b.e);
    const signature=both.map(x=>x.e+':'+x.delta).join('/');
    found.set(signature,both.map(x=>({index:255-x.e,delta:x.delta})));
  }
  return [...found.values()];
}

const tokens = source.pages.flatMap((page) => page.tokens);
const bytes = source.bytes;
assert.equal(tokens.length, 256);
assert.equal(bytes.length, 256);
assert.deepEqual(tokens.map((s) => parseToken(s, ALPHABET)), bytes);
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

assert.deepEqual(multiplyPolynomial([3, 26, 24], [27, 5, 15]),
  [23, 21, 11, 17, 12]);
assert.deepEqual(syndrome(bytes), { value: 0, derivative: 0, h: [0, 0] });

// The extension-field X has order 840, implying that a two-term
// multiple of both H and (X-24)^2 needs exponent difference divisible
// by both 30 and 29, hence by 870. Our polynomial span is only 256.
let root = [1, 0], rootOrder = 0;
for (let n = 1; n <= 840; n++) {
  root = multiplyH(root, [0, 1]);
  if (root[0] === 1 && root[1] === 0) { rootOrder = n; break; }
}
assert.equal(rootOrder, 840);

let recovered = 0;
for (let index = 0; index < 256; index++) {
  for (let delta = 1; delta < 29; delta++) {
    const mutated = bytes.slice();
    mutated[index] = mod(mutated[index] + delta);
    const answer = locateOneResidueError(mutated);
    assert.deepEqual(answer, { index, delta, exponent: 255 - index });
    assert.equal(mod(mutated[index] - answer.delta), mod(bytes[index]));
    recovered++;
  }
}
assert.equal(recovered, 7168);

// An isolated transcription error attested in a 2014 participant file:
// an old value 194 in printed cell170, original image-corrected byte254.
// Actual old transcription has other errors, so it is not one-error input.
const isolated2014 = bytes.slice();
assert.equal(isolated2014[170], 254);
isolated2014[170] = 194;
assert.deepEqual(locateOneResidueError(isolated2014),
  { index: 170, delta: mod(194 - 254), exponent: 85 });

// A second 2014 discrepancy is 47 versus 18, differing by exactly29;
// this GF29 code cannot see it even as an isolated error.
const invisible = bytes.slice();
assert.equal(invisible[165], 18);
invisible[165] = 47;
assert.deepEqual(syndrome(invisible), syndrome(bytes));
assert.equal(locateOneResidueError(invisible), null);

// The two extra p15 eigenvalue targets define six original syndromes.
assert.deepEqual(syndromeSix(bytes),[0,0,0,0,0,0]);
const one=singleErrorIndex();
assert.equal(one.all.length,7168);
const pair2014=bytes.slice();
assert.equal(pair2014[170],254);assert.equal(pair2014[172],148);
pair2014[170]=194;pair2014[172]=174;
const historicPairSolutions=recoverTwo(syndromeSix(pair2014),one);
assert.deepEqual(historicPairSolutions,
  [[{index:172,delta:26},{index:170,delta:27}]]);

// Deterministic original-shaped double-corruption controls.
// Double errors can be ambiguous, so measure rather than conceal that.
let randomState=3301;
function random32() {
 randomState^=randomState<<13;randomState^=randomState>>>17;
 randomState^=randomState<<5;return randomState>>>0;
}
let doubleUnique=0,doubleAmbiguous=0;
for(let t=0;t<128;t++) {
 const i=random32()%256;let j=random32()%255;if(j>=i)j++;
 const a=1+random32()%28,b=1+random32()%28;
 const changed=bytes.slice();changed[i]=mod(changed[i]+a);
 changed[j]=mod(changed[j]+b);
 const solutions=recoverTwo(syndromeSix(changed),one);
 assert(solutions.some(pair=>
   pair.some(x=>x.index===i&&x.delta===a)&&
   pair.some(x=>x.index===j&&x.delta===b)));
 if(solutions.length===1)doubleUnique++;else doubleAmbiguous++;
}
assert.equal(doubleUnique,122);assert.equal(doubleAmbiguous,6);

const alt59Bytes = tokens.map((s) => parseToken(s, ALT59));
const alt59Syndrome = syndrome(alt59Bytes);
assert.notDeepEqual(alt59Syndrome, syndrome(bytes));
assert.equal(locateOneResidueError(alt59Bytes), null);
console.log(JSON.stringify({
  status: 'PASS', checkedOriginalTokens: tokens.length,
  code: 'H × G over GF29, four parity conditions',
  singleResidueCorrections: recovered, rootOrder,
  historicalTwoErrorSolutions: historicPairSolutions,
  sampledTwoErrors: { unique: doubleUnique, ambiguous: doubleAmbiguous, total: 128 },
  base60Syndrome: syndrome(bytes), alt59Syndrome,
  alt59RepairableByOneResidueChange: false,
  period2014IsolatedError: { index: 170, fromByte: 194, toByte: 254,
    recoveredDeltaModulo29: mod(194 - 254) },
  undetectableModulo29Example: { index: 165, fromByte: 47, toByte: 18 },
  unknownPagePlaintextRecovered: 0
}, null, 2));
