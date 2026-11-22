'use strict';
/**
 * Original p7/p8 red eigen-root20 predicts independent p39 red double-root24.
 * Tests exact shared-pad subtraction of seven-lane Fourier inverse readouts.
 * Read-only Windows11 Node22 CommonJS SFT; no unknown plaintext claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const ink = JSON.parse(read('lp2-ink-annotations.json'));
const parts = read('lp2-transcription.txt').split('%');
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = x => (x % 29 + 29) % 29;
const pow = (x, n) => {
  let v = 1;
  for (let k = 0; k < n; k++) v = v * x % 29;
  return v;
};
/** @param {number} page @returns {number[][]} */
function redWords(page) {
  const reds = new Set(ink.pages.find(p => p.page === page).red_spans
    .flatMap(s => Array.from({length:s.length}, (_,j) => s.start + j)));
  const section = parts[page >= 50 ? page - 1 : page];
  let position = 0, current = [], allRed = true;
  const out = [];
  const flush = () => {
    if (current.length && allRed) out.push(current);
    current = []; allRed = true;
  };
  for (const ch of section) {
    const rune = index.get(ch);
    if (rune !== undefined) {
      current.push(rune);
      const isRed = reds.has(position);
      position++;
      allRed = allRed && isRed;
    } else if (ch === '-' || ch === '.') flush();
  }
  flush();
  assert.equal(position, corpus.pages[page].indices.length);
  return out;
}
const product = word => word.reduce((s, x) => s * x % 29, 1);
const p7 = redWords(7), p8 = redWords(8);
assert.deepEqual(p7.map(product), [11,26,8,15,2]);
assert.deepEqual(p8.map(product), [4,3]);
const i = p8[1].at(-1);
assert.equal(i, 17);
assert.equal(pow(i, 2), 28);
const z = mod((3 + 4 * i) * 6); // 5^-1 = 6 (mod29)
const w = mod((8 + 15 * i) * 12); // 17^-1 = 12 (mod29)
assert.deepEqual([z,w,pow(z,5),pow(z,7)], [20,24,24,1]);
for (let k=1;k<7;k++) assert.notEqual(pow(z,k),1);
const red39 = ink.pages.find(p => p.page === 39).red_spans
  .filter(s => s.length === 3);
assert.equal(red39.length, 1);
const q = corpus.pages[39].indices
  .slice(red39[0].start, red39[0].start + 3);
const amplitude = product(p7[3]); // Fourth red word is the R^5 y-component 15.
const predictedRed39 = [mod(amplitude * w * w),
  mod(-2 * amplitude * w), amplitude];
assert.deepEqual(predictedRed39, [27,5,15]);
assert.deepEqual(q, predictedRed39);
// The only other wholly red GP three-rune span is p3 offset119.
const p3red = ink.pages.find(p => p.page === 3)
  .red_spans.filter(s => s.length === 3);
assert.equal(p3red.length, 1);
assert.equal(p3red[0].start, 119);
assert.equal(red39[0].start, 119);
const sourceP3 = corpus.pages[3].indices.slice(
  p3red[0].start, p3red[0].start + 3);
const pagePhase = page => pow(z, ((product(p7[4]) - page) % 7 + 7) % 7);
assert.equal(pagePhase(3), 16);
assert.equal(pagePhase(39), 24);
const amplitude3 = product(p7[4]); // Original p7 fifth word product2.
const vertex3 = pow(z, amplitude3); // z^2=23.
const predictedRed3 = [
  mod(amplitude3 * pagePhase(3) ** 2 + vertex3),
  mod(-2 * amplitude3 * pagePhase(3)), amplitude3
];
assert.deepEqual(predictedRed3, [13,23,2]);
assert.deepEqual(sourceP3, predictedRed3);
// A simpler exact full-function relation drops the assumed page clock:
// Q39(x) = (p7[3]/p7[4]) * (Q3(x-p7[2]) - z^2) mod29.
// The scale, horizontal shift, and vertical shift all use earlier
// physically printed p7/p8 operands. Still retrospective operator choice.
const gp3 = x => mod(sourceP3[0] + sourceP3[1]*x + sourceP3[2]*x*x);
const gp39 = x => mod(q[0] + q[1]*x + q[2]*x*x);
const xShift = product(p7[2]); // 8
const yShift = pow(z,2); // 23
const yScale = mod(product(p7[3]) * 15); // 15 / 2, since inverse(2)=15
assert.deepEqual([xShift,yShift,yScale],[8,23,22]);
for (let x=0;x<29;x++) {
  assert.equal(mod(yScale * (gp3(mod(x-xShift)) - yShift)), gp39(x));
}
// Discriminant is invariant under affine x -> a*x+b up to a^2.
// It is also invariant as a zero/nonzero square class under fractional
// linear coordinate substitutions with nonzero determinant.
// Q3 is irreducible over F29; Q39 is a double-root square.
// Therefore these two red quadratics CANNOT be the same binary quadratic
// under a nonsingular page-clock / PGL2 change of coordinates.
const discriminant = c => mod(c[1]*c[1] - 4*c[0]*c[2]);
const disc3 = discriminant(sourceP3);
const disc39 = discriminant(q);
const squares = new Set(Array.from({length:29}, (_,n)=>mod(n*n)));
assert.deepEqual([disc3,disc39],[19,0]);
assert.equal(squares.has(disc3),false);
assert.equal(squares.has(disc39),true);
assert.deepEqual(Array.from({length:29},(_,x)=>x).filter(
  x=>mod(sourceP3[0]+sourceP3[1]*x+sourceP3[2]*x*x)===0),[]);
const Q = x => mod(q[0] + q[1]*x + q[2]*x*x);
const dQ = x => mod(q[1] + 2*q[2]*x);
const roots = Array.from({length:29}, (_,x) => x)
  .filter(x => Q(x) === 0 && dQ(x) === 0);
assert.deepEqual(roots, [24]);
for (let x=0;x<29;x++) assert.equal(Q(x), mod(15*mod(x-24)**2));
const coeff=p7.map(product);
const P=x=>coeff.reduceRight((v,a)=>mod(v*x+a),0);
let state=5; const cycle=[];
for (let t=0;t<7;t++) {cycle.push(state);state=P(state);}
assert.deepEqual(cycle,[5,15,28,9,10,24,7]);

/**
 * @param {number[]} source
 * @param {number} root
 * @param {boolean} inverse
 * @returns {number[]}
 */
function sevenLanes(source,root,inverse) {
  assert.equal(source.length%7,0);
  const width=source.length/7,out=Array(source.length);
  for(let col=0;col<width;col++)
    for(let k=0;k<7;k++) {
      let sum=0;
      for(let j=0;j<7;j++) {
        const exponent=(((inverse?-1:1)*j*k)%7+7)%7;
        sum+=source[j*width+col]*pow(root,exponent);
      }
      out[k*width+col]=mod(sum*(inverse?25:1));
    }
  return out;
}
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const h=Array(29).fill(0);
  for(const c of tape)h[c]++;
  return h.reduce((a,n)=>a+n*(n-1),0)/(tape.length*(tape.length-1));
}
const botanical=corpus.pages.slice(8,15).flatMap(p=>p.indices);
const cuneiform=corpus.pages[33].indices.slice(91)
  .concat(corpus.pages.slice(34,40).flatMap(p=>p.indices));
assert.deepEqual([botanical.length,cuneiform.length],[1729,1589]);
const a=sevenLanes(botanical,z,true), b=sevenLanes(cuneiform,w,true);
assert.deepEqual(sevenLanes(a,z,false),botanical);
assert.deepEqual(sevenLanes(b,w,false),cuneiform);
const differences=[];
for(const start of [0,20]) {
  const selected=Array.from({length:7},(_,j)=>
    a.slice(j*247+start,j*247+start+227)).flat();
  const d=selected.map((v,j)=>mod(v-b[j]));
  const score=ioc(d);
  const expected=start===0?0.034634364403891366:0.03446157699422827;
  assert(Math.abs(score-expected)<1e-13);
  differences.push({p8LaneColumnStart:start, runes:d.length,
    differenceIoC:score, first24:d.slice(0,24).map(x=>corpus.translit[x]).join('')});
}
const known=corpus.pages[57].indices;
assert.equal(known.length,95);
const nativeA=Array.from({length:1589},(_,j)=>known[j%95]);
const nativeB=Array.from({length:1589},(_,j)=>known[(j+37)%95]);
const key=Array.from({length:1589},(_,j)=>mod(7*j*j+13*j+11));
const syntheticA=sevenLanes(nativeA.map((v,j)=>mod(v+key[j])),z,false);
const syntheticB=sevenLanes(nativeB.map((v,j)=>mod(v+key[j])),w,false);
const recoveredA=sevenLanes(syntheticA,z,true);
const recoveredB=sevenLanes(syntheticB,w,true);
assert.deepEqual(recoveredA.map((v,j)=>mod(v-recoveredB[j])),
  nativeA.map((v,j)=>mod(v-nativeB[j])));
console.log(JSON.stringify({
  sourceP7WordProducts:coeff, sourceP8WordProducts:p8.map(product),
  originalPrintedImaginaryIndex:i, rootP8:z, powerFiveRootP39:pow(z,5),
  sourcePredictedFullP39RedTriad:predictedRed39,
  sourceRed119PagePair:[3,39],
  matchedOriginalRed119Positions:[p3red[0].start,red39[0].start],
  pagePhases:[pagePhase(3),pagePhase(39)],
  predictedP3RedTriad:predictedRed3, originalP3RedTriad:sourceP3,
  originalP39RedRuneCoefficients:q, uniqueDoubleRoot:roots,
  sourceFixedAffineGraphTransform:{xShift,yShift,yScale},
  quadraticDiscriminants:[disc3,disc39],
  p3HasNoGF29ZeroRoots:true,
  nonsingularLinearPageclockConjugacyImpossible:true,
  sevenCycle:cycle, originalRuneLengths:[botanical.length,cuneiform.length],
  crossChapterSharedPadTests:differences,
  plantedNativeDifferenceRecovered:1589, unknownPlaintextRecovered:false
},null,2));
