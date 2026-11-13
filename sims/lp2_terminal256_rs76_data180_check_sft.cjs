"use strict";

/**
 * Reverse GF841 [256,76] original-source erasure gate.
 * Treat p55 (76 unknown) as DATA and p56+p57 (180 solved) as PARITY.
 * Freeze x[j] = (19+13u)^j, u^2=3u+8, source 32x8 ring geometry.
 * Interpolate from only 76 of the 180 known symbols and test 104 withheld.
 * Run node sims/lp2_terminal256_rs76_data180_check_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const mod = n => ((n % 29) + 29) % 29;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];
// u^2 = 3u + 8 in the irreducible p3 source-defined quadratic.
const mul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
function inv29(n) {
  for (let j = 1; j < 29; j++) if (mod(n * j) === 1) return j;
  throw new Error("Noninvertible GF29 scalar");
}
function inv(x) {
  const [a, b] = x;
  const z = inv29(mod(a * a + 3 * a * b - 8 * b * b));
  return [mod((a + 3 * b) * z), mod(-b * z)];
}
const div = (x, y) => mul(x, inv(y));
const same = (x, y) => x[0] === y[0] && x[1] === y[1];

/** Standard 32x8 outer-to-inner rectangular clockwise ring traversal. */
function rings() {
  const output = [];
  for (let margin = 0; margin < 4; margin++) {
    const top = margin, bottom = 31 - margin;
    const left = margin, right = 7 - margin, ring = [];
    for (let c = left; c <= right; c++) ring.push([top, c]);
    for (let r = top + 1; r <= bottom; r++) ring.push([r, right]);
    for (let c = right - 1; c >= left; c--) ring.push([bottom, c]);
    for (let r = bottom - 1; r > top; r--) ring.push([r, left]);
    output.push(ring);
  }
  assert.deepEqual(output.map(a => a.length), [76, 68, 60, 52]);
  assert.equal(new Set(output.flat().map(a => a.join(","))).size, 256);
  return output;
}

/**
 * Newton divided differences fitted to all supplied distinct points.
 * @param {number[][]} x
 * @param {number[][]} y
 */
function interpolator(x, y) {
  const n = x.length;
  assert.equal(y.length, n);
  const coefficients = y.map(v => v.slice());
  for (let d = 1; d < n; d++) {
    for (let j = n - 1; j >= d; j--) {
      coefficients[j] = div(sub(coefficients[j], coefficients[j - 1]),
        sub(x[j], x[j - d]));
    }
  }
  return function evaluate(t) {
    let value = coefficients[n - 1];
    for (let j = n - 2; j >= 0; j--)
      value = add(coefficients[j], mul(sub(t, x[j]), value));
    return value;
  };
}


const ringGeometry = rings().map(group=>group.length);
const p55=corpus.pages.find(p=>p.page===55).indices;
const p56=corpus.pages.find(p=>p.page===56).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
const words='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const alphabet=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const solved56=[];
for(const word of words.split(' ')) {
  for(let j=0;j<word.length;) {
    const entry=alphabet.find(x=>word.startsWith(x.token,j));
    assert(entry,'Unknown p56 GP token');
    solved56.push(entry.index);
    j+=entry.token.length;
  }
}
assert.equal(solved56.length,85);
const generator=[19,13],points=[[1,0]];
for(let j=1;j<256;j++) points.push(mul(points[j-1],generator));
assert.equal(new Set(points.map(x=>x.join(','))).size,256);
const cases=[];
for(const [name,head] of [['solved',solved56],['visible',p56]]) {
  const known=head.concat(p57).map(x=>[x,0]);
  assert.equal(known.length,180);
  const f=interpolator(points.slice(76,152),known.slice(0,76));
  for(let j=76;j<152;j++)assert(same(f(points[j]),known[j-76]));
  const heldout=points.slice(152).map(f);
  const matches=heldout.filter((x,j)=>same(x,known[j+76])).length;
  const first=heldout.findIndex((x,j)=>!same(x,known[j+76]));
  const recovered=points.slice(0,76).map(f);
  cases.push({register:name,parityMatches:matches,
    parityTotal:104,firstMismatch:76+first,
    firstPrediction:heldout[first],firstActual:known[76+first],
    recoveredSubfield:recovered.filter(x=>x[1]===0).length,
    recoveredMatchingVisible:recovered.filter((x,j)=>
      same(x,[p55[j],0])).length});
}
assert.deepEqual(cases.map(x=>[
  x.register,x.parityMatches,x.firstMismatch,
  x.firstPrediction,x.firstActual,x.recoveredSubfield,
  x.recoveredMatchingVisible
]),[
  ['solved',0,76,[24,22],[1,0],1,0],
  ['visible',0,76,[25,5],[6,0],6,0]
]);
// Independent correct polynomial [256,76] positive. No ciphertext fitting.
const coefficients=Array.from({length:76},(_,j)=>
  [mod(11*j+7),mod(17*j+5)]);
const polynomial=x=>coefficients.reduceRight((v,c)=>
  add(mul(v,x),c),[0,0]);
const planted=points.map(polynomial);
const fit=interpolator(points.slice(76,152),planted.slice(76,152));
const recovered=points.filter((x,j)=>same(fit(x),planted[j])).length;
assert.equal(recovered,256);
console.log(JSON.stringify({status:'PASS',mode:'[256,76] 76-data/180-parity',
  ringGeometry,generator,original:cases,positiveRecovered:recovered,
  decision:'No known parity continuation; no recovered p55 plaintext.'},null,2));
