'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const MOD = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/base60-grid.json'), 'utf8'));
const signed = fs.readFileSync(path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % MOD) + MOD) % MOD;

/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < MOD; i += 1) if (mod(x * i) === 1) return i;
  throw new Error('no inverse');
}

/** @param {[number,number]} x @param {[number,number]} y @param {number} r @param {number} t @returns {[number,number]} */
function mul(x, y, r = 3, t = 8) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + t * b * d), mod(a * d + b * c + r * b * d)];
}

/** @param {number[]} coefficients @param {number} r @param {number} t @returns {[number,number]} */
function evaluate(coefficients, r = 3, t = 8) {
  /** @type {[number,number]} */
  let acc = [0, 0];
  /** @type {[number,number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1], r, t);
  }
  return acc;
}

/** @param {number[]} numerator @param {number[]} denominator @returns {{quotient:number[],remainder:number[]}} */
function divide(numerator, denominator) {
  const a = numerator.map(mod);
  const quotient = Array(a.length - denominator.length + 1).fill(0);
  const leadInv = inv(denominator.at(-1));
  for (let i = a.length - 1; i >= denominator.length - 1; i -= 1) {
    const q = mod(a[i] * leadInv);
    const offset = i - denominator.length + 1;
    quotient[offset] = q;
    for (let j = 0; j < denominator.length; j += 1) a[offset + j] = mod(a[offset + j] - q * denominator[j]);
  }
  return {quotient, remainder:a.slice(0, denominator.length - 1)};
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const record = ink.pages.find((p) => p.page === page);
  assert(record);
  const span = (record.red_spans || []).find((s) => s.start === start && s.length === length);
  assert(span);
  return [...span.runes].map((r) => {
    const v = runeIndex.get(r);
    assert.notEqual(v, undefined);
    return v;
  });
}

const signedBody = signed.split('-----BEGIN PGP SIGNATURE-----')[0];
const words = signedBody.match(/\b[A-Za-z]+\b/g).filter((word) => !['BEGIN','PGP','SIGNED','MESSAGE','Hash','SHA'].includes(word)).map((w) => w.toUpperCase());
assert.equal(words.length, 43);
assert.deepEqual([words[2], words[17], words[18], words[24], words[29], words[30]], ['PATH','THE','MAP','AND','DIRECTION','SEEK']);

const p3 = redSpan(3,119,3);
assert.deepEqual(p3,[13,23,2]);
const p15Second = redSpan(15,9,11);
const p57 = redSpan(57,0,7);
const p57Padded = p57.concat(Array(p15Second.length-p57.length).fill(0));
const difference = p15Second.map((v,i)=>mod(v-p57Padded[i]));
const division = divide(difference,p3);
assert.deepEqual(division.remainder,[0,0]);
assert.deepEqual(division.quotient,[5,5,14,9,10,4,27,17,25]);
const EQ = evaluate(division.quotient);
assert.deepEqual(EQ,[17,24]);

const tokens = grid.rows.flat();
assert.equal(tokens.length,256);
assert.equal(tokens[43],'1D');
const a60 = grid.alphabet;
const a59 = a60.replace('f','');
assert.equal(a60.length,60);
assert.equal(a59.length,59);

/** @param {string} token @param {string} alphabet @param {number} radix @returns {number|null} */
function value(token, alphabet, radix) {
  const hi=alphabet.indexOf(token[0]), lo=alphabet.indexOf(token[1]);
  return hi < 0 || lo < 0 ? null : radix*hi+lo;
}

const v59=value(tokens[43],a59,59),v60=value(tokens[43],a60,60);
assert.equal(v59,72);
assert.equal(v60,73);
const displacement=[v59-43,v60-43];
assert.deepEqual(displacement,[29,30]);
assert.deepEqual(displacement.map(mod),[0,1]);
assert.deepEqual(displacement.map((i)=>words[i]),['DIRECTION','SEEK']);

const basisOne = /** @type {[number,number]} */ ([1,0]);
const basisU = /** @type {[number,number]} */ ([0,1]);
const qTimesOne = mul(EQ,basisOne);
const qTimesU = mul(EQ,basisU);
assert.deepEqual(qTimesOne,[17,24]);
assert.deepEqual(qTimesU,[18,2]);
assert.deepEqual(qTimesOne.map((i)=>words[i]),['THE','AND']);
assert.deepEqual(qTimesU.map((i)=>words[i]),['MAP','PATH']);

const exactBoundaryCells=[];
for(let cell=0;cell<tokens.length;cell+=1){
  const a=value(tokens[cell],a59,59),b=value(tokens[cell],a60,60);
  if(a===null||b===null) continue;
  if(a-cell===29&&b-cell===30) exactBoundaryCells.push({cell,token:tokens[cell],values:[a,b]});
}
assert.deepEqual(exactBoundaryCells,[{cell:43,token:'1D',values:[72,73]}]);

const mapPathMultipliers=[];
for(let x=0;x<MOD;x+=1)for(let y=0;y<MOD;y+=1){
  const output=mul([x,y],basisU);
  if(output[0]===18&&output[1]===2) mapPathMultipliers.push([x,y]);
}
assert.deepEqual(mapPathMultipliers,[EQ]);

const alternate = /** @type {[number,number]} */ ([5,19]);
const alternateUTimes = mul(alternate,basisU,18,12);
assert.deepEqual(alternateUTimes,[25,28]);
assert.deepEqual(alternateUTimes.map((i)=>words[i]),['THEIR','THE']);

const result={
  schema:'lp2-p3-q-cell43-basis-crosslock-v1',
  classification:'post-discovery independent cross-route operator lock; no unknown plaintext',
  p3Q:{evaluation:EQ,one:qTimesOne,oneWords:qTimesOne.map((i)=>words[i]),u:qTimesU,uWords:qTimesU.map((i)=>words[i])},
  cell43:{token:tokens[43],radixValues:[v59,v60],forwardDisplacements:displacement,sourceWords:displacement.map((i)=>words[i]),mod29Vector:displacement.map(mod),fieldElement:'u'},
  finiteControls:{dualRadixCells:tokens.length,exactBoundaryCells,mapPathMultiplierHits:mapPathMultipliers.length,mapPathMultipliers,alternateRelation:{r:18,t:12,evaluatedQ:alternate,uProduct:alternateUTimes,uWords:alternateUTimes.map((i)=>words[i])}},
  interpretation:'The independently selected p50 cell43 yields DIRECTION/SEEK displacements [29,30], which reduce under DIRECTION modulus29 to the field basis u=[0,1]. The already-frozen p3 quotient map sends 1 to THE/AND and this independently selected u to MAP/PATH. Thus the two natural basis images recover the two columns of the Q multiplication matrix without choosing a row-major phrase after the fact.',
  boundary:'This strengthens Q as a source-linked map/path opcode. It does not choose a body receiver, radix, or recover p0-p55 plaintext.'
};
const json=JSON.stringify(result,null,2);
console.log(json);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),json);
