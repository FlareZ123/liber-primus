'use strict';

/** Totalized signed-DH23 Möbius inversion across authentic 238-rune LP2 field blocks (Node 22). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'resources', 'liber-primus');
const table = JSON.parse(fs.readFileSync(path.join(SOURCE, 'base60-grid.json'), 'utf8')).byte_rows.flat();
const corpus = JSON.parse(fs.readFileSync(path.join(SOURCE, 'lp2-corpus.json'), 'utf8'));
const degree = 238;
const mod = a => (a % 29 + 29) % 29;

/** @param {number[]} a @returns {number[]} */
function trim(a) {
  while (a.length && a[a.length - 1] === 0) a.pop();
  return a;
}

/** @param {number} a @returns {number} */
function scalarInv(a) {
  for (let k = 1; k < 29; k++) if (mod(k * a) === 1) return k;
  throw Error('nonunit coefficient');
}

/** @param {number[]} a @param {number[]} b @param {number} [sign] */
function add(a, b, sign = 1) {
  return trim(Array.from({length: Math.max(a.length, b.length)},
    (_, i) => mod((a[i] || 0) + sign * (b[i] || 0))));
}

/** @param {number[]} a @param {number[]} b */
function multiply(a, b) {
  if (!a.length || !b.length) return [];
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) if (a[i])
    for (let j = 0; j < b.length; j++)
      c[i + j] = mod(c[i + j] + a[i] * b[j]);
  return trim(c);
}

/** @param {number[]} a @param {number[]} b @returns {[number[], number[]]} */
function divide(a, b) {
  assert.ok(b.length, 'nonzero divisor');
  const r = trim(a.slice());
  const q = Array(Math.max(0, r.length - b.length + 1)).fill(0);
  const inv = scalarInv(b[b.length - 1]);
  while (r.length >= b.length) {
    const offset = r.length - b.length;
    const coefficient = mod(r[r.length - 1] * inv);
    q[offset] = coefficient;
    for (let j = 0; j < b.length; j++)
      r[offset + j] = mod(r[offset + j] - coefficient * b[j]);
    trim(r);
  }
  return [trim(q), r];
}

// The exact source factorization: degree 254 = 2*1 + 2 + 3 + 9 + 238.
// Polynomial arrays are in *ascending* power order.
assert.equal(table.length, 256);
let quotient = trim(table.slice().reverse().map(b => b % 29));
for (const factor of [
  [5, 1], [5, 1],
  [11, 18, 1],
  [24, 16, 14, 1],
  [11, 15, 0, 9, 1, 5, 10, 20, 12, 1]
]) {
  const [q, remainder] = divide(quotient, factor);
  assert.equal(remainder.length, 0, 'source factor divides original table exactly');
  quotient = q;
}
const R = quotient.map(x => mod(x * scalarInv(quotient[quotient.length - 1])));
assert.equal(R.length, degree + 1);
assert.equal(R[degree], 1);

const reduce = a => divide(a, R)[1];
const fieldMul = (a, b) => reduce(multiply(a, b));

/** @param {number[]} a */
function fieldInverse(a) {
  let [r0, r1, t0, t1] = [R, trim(a.slice()), [], [1]];
  while (r1.length) {
    const [q, r2] = divide(r0, r1);
    [r0, r1] = [r1, r2];
    [t0, t1] = [t1, add(t0, multiply(q, t1), -1)];
  }
  assert.equal(r0.length, 1, 'p36 seed is invertible in source field');
  return reduce(t0.map(x => mod(x * scalarInv(r0[0]))));
}


/** @param {number[]} x @returns {number[]} */
const as238 = x => Array.from({length:degree},(_,i)=>x[i]||0);
/** @param {number[]} x @param {number[]} y @returns {boolean} */
const equals = (x,y) => as238(x).every((v,i)=>v===(y[i]||0));
/** @param {number[]} x @returns {number} */
function ioc(x) {
  const count = Array(29).fill(0);
  for (const v of x) count[v]++;
  return count.reduce((n,c)=>n+c*(c-1),0)/(x.length*(x.length-1));
}
/** @param {number[]} x @returns {number[]} */
function forward(x) {
  const denominator = add(x,[15]);
  if (!denominator.length) return [23];
  return fieldMul(fieldMul([23],x),fieldInverse(denominator));
}
/** @param {number[]} y @returns {number[]} */
function backward(y) {
  const denominator = add([23],y,-1);
  if (!denominator.length) return [14];
  return fieldMul(fieldMul([15],y),fieldInverse(denominator));
}
assert.ok(equals(forward([14]),[23])&&equals(backward([23]),[14]));
assert.ok(equals(forward([0,1]),[19,26]),'p3 source element maps exactly to p36 relative norm');
const pages=corpus.pages.filter(p=>p.page<=55 && p.indices.length);
const original=pages.flatMap(p=>p.indices);
const p36=pages.find(p=>p.page===36).indices;
const offset=pages.filter(p=>p.page<36).reduce((n,p)=>n+p.indices.length,0)+p36.length;
assert.equal(original.length,12956);
assert.equal(p36.length,degree);
assert.equal(offset,8944);
const plant=Array.from({length:degree},(_,i)=>corpus.pages[57].indices[i%corpus.pages[57].indices.length]);
for (const [encoder,decoder] of [[forward,backward],[backward,forward]]) {
  assert.ok(equals(decoder(encoder(plant)),plant),'native-GP solved source plant roundtrips');
}
const cap=1n<<1152n;
/** @param {number[]} digits @returns {boolean} */
function fits144(digits) {
  let n=0n;
  for (const d of digits) n=n*29n+BigInt(d);
  return n<cap;
}
const records=[];
for (const [clock,start] of [['book',0],['after-p36',offset]]) {
  for (const rev of [false,true]) {
    for (const [operation,decode,encode] of [['forward',forward,backward],['inverse',backward,forward]]) {
      const gp=[],scores=[],first=[],eligible=[0,0];
      let blocks=0;
      for (let i=start;i+degree<=original.length;i+=degree) {
        const raw=original.slice(i,i+degree);
        const field=trim((rev?raw.slice().reverse():raw.slice()));
        const decoded=as238(decode(field));
        const restored=encode(trim(decoded.slice()));
        assert.ok(equals(field,restored),'original 238-rune forward reencryption');
        const output=rev?decoded.slice().reverse():decoded;
        if (!first.length) first.push(...output.slice(0,30));
        gp.push(...output);
        scores.push(ioc(output));
        if (fits144(output))eligible[0]++;
        if (fits144(output.slice().reverse()))eligible[1]++;
        blocks++;
      }
      assert.equal(blocks,clock==='book'?54:16);
      records.push({clock,reverseCoefficients:rev,operation,blocks,
        meanBlockIoc:scores.reduce((a,b)=>a+b,0)/scores.length,
        maxBlockIoc:Math.max(...scores),concatenatedIoc:ioc(gp),
        eligible144BigEndian:eligible[0],eligible144LittleEndian:eligible[1],
        first30:first.map(x=>corpus.translit[x]).join(' ')});
    }
  }
}
const direct=records.find(x=>x.clock==='book'&&!x.reverseCoefficients&&x.operation==='forward');
const reverse=records.find(x=>x.clock==='book'&&!x.reverseCoefficients&&x.operation==='inverse');
assert.ok(Math.abs(direct.concatenatedIoc-0.034490867737994306)<1e-12);
assert.ok(Math.abs(reverse.concatenatedIoc-0.03445761534626214)<1e-12);
assert.ok(records.every(x=>x.maxBlockIoc<0.045));
assert.ok(records.every(x=>x.eligible144BigEndian<x.blocks && x.eligible144LittleEndian<x.blocks));
console.log(JSON.stringify({
  source:'Original LP2 32x8 grid and degree238 irreducible factor; signed 2013 DH23 6/15; p3 and p36 algebra',
  field:'GF(29^238)',p36OffsetAfterPage:offset,rawBookIoc:ioc(original),
  totalizedPoles:{forward14To23:true,inverse23To14:true},
  positiveControl:'p57-derived 238-rune plant roundtrips both directions',
  records,
  interpretation:'No native GP29 original plaintext or complete fixed-width 144-byte payload under any tested source-register direction.',
},null,2));
