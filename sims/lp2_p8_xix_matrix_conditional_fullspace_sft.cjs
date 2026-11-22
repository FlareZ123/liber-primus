'use strict';
/**
 * Exact finite conditional family count for the source-derived p8 XIX matrix.
 * Preserve the first printed red word's prefix XIX/product4, second red
 * whole-word GP0 product3, final rune17, and the observed trace12.
 * Enumerate ALL 28^5 nonzero second-word completions (17,210,368).
 * Read-only, deterministic Node22/CJS, Windows11. No RNG or dependencies.
 *
 * This is a conditional retrospective fit count, not a creator-intent p-value.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const h = C.pages[8].indices.slice(0,12);
assert.deepEqual(h,[14,10,14,19,1,14,19,5,2,13,3,17]);
const mod = (x) => (x%29+29)%29;
const inverse = new Array(29).fill(0);
for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inverse[a]=b;
for(let a=1;a<29;a++)assert.ok(inverse[a]>0);
assert.equal(mod(14*10*14*19),4);
assert.equal(h.slice(4).reduce((s,v)=>mod(s*v),1),3);
assert.equal(h[11],17);
/**
 * Source matrix K = [19,a,b;c,5,d;e,f,17].
 * TraceK=19+5+17≡12, equal to original title length12.
 * Second word product implies a*b*c*d*e*f≡13 (mod29).
 * determinant19 and off-diagonal pair sum4 together are equivalent to
 * detK=19 and characteristic root -2 (because traceK=12).
 */
let family=0,det19=0,offDiagonal4=0,both=0,dhOnly=0,bothDH=0;
const matches=[];
for(let a=1;a<29;a++)for(let b=1;b<29;b++)
for(let c=1;c<29;c++)for(let d=1;d<29;d++)for(let e=1;e<29;e++){
  const f=mod(13*inverse[a]%29*inverse[b]%29*inverse[c]%29*inverse[d]%29*inverse[e]);
  const determinant=mod(19*(85-d*f)-a*(17*c-d*e)+b*(c*f-5*e));
  const offDiagonal=mod(a*c+b*e+d*f);
  const dh=mod(19*6+2*a+b)===14 && mod(6*c+5*2+d)===10
    && mod(6*e+2*f+17)===14;
  family++;
  if(determinant===19)det19++;
  if(offDiagonal===4)offDiagonal4++;
  if(determinant===19&&offDiagonal===4)both++;
  if(dh)dhOnly++;
  if(determinant===19&&offDiagonal===4&&dh){
    bothDH++;
    matches.push([a,b,c,d,e,f]);
  }
}
assert.deepEqual([family,det19,offDiagonal4,both,dhOnly,bothDH],
  [17210368,594272,592704,27440,730,2]);
assert.deepEqual(matches,[[1,14,19,2,13,3],[21,3,23,7,22,5]]);
const actual=[h[4],h[5],h[6],h[8],h[9],h[10]];
assert.deepEqual(actual,matches[0]);
console.log(JSON.stringify({
  fixedSource:'p8 XIX prefix; two red word products4/3; last index17; trace12',
  conditionalNonzeroMatrixSpace:family,
  determinant19:det19,
  offDiagonalSum4:offDiagonal4,
  jointMatrixSelfChecks:both,
  keyInverseIV_6_2_1:dhOnly,
  jointSelfChecksAndDHVector:bothDH,
  exactSurvivingMatrices:matches,
  classification:'retrospective conditional count, not probability of intended key or plaintext'
},null,2));
console.log('PASS all 17,210,368 source-conditioned GP29 red-title matrices enumerated');
