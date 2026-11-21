'use strict';

/**
 * Source-first, literal 3-share GF29 hypothesis for three 308-rune regions.
 * p7 red third word supplies original GP indices [5,7,11], *hypothetical*
 * Shamir x coordinates. The secret would be the ordinary degree-2 value at x0.
 * Windows Node.js 22, no external packages or file writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
/** @param {number} n @returns {number[]} */
const page=n=>gp.pages.find(p=>p.page===n).indices;
const A=[...page(6).slice(82),...page(7).slice(0,194)];
const B=[...page(48).slice(199),...page(49).slice(0,66),
  ...page(51).slice(0,92),...page(52).slice(0,78)];
const C=[...page(54),...page(55)];
assert.deepEqual([A.length,B.length,C.length],[308,308,308]);
assert.deepEqual(page(7).slice(200,203),[5,7,11]);
const x=[5,7,11];
/** @param {number} z @returns {number} */
const mod=z=>(z%29+29)%29;
/** @param {number} n @returns {number} */
function inverse(n) {
  for(let i=1;i<29;i++)if(mod(i*n)===1)return i;
  throw Error('zero denominator');
}
// Shamir-Lagrange interpolation of three original GF29 shares at x=0.
/** @param {number[]} xs @returns {number[]} */
function lagrange(xs) {
  return xs.map((v,i)=>xs.reduce(
    (c,w,j)=>j===i?c:mod(c*mod(-w)*inverse(mod(v-w))),1));
}
const weights=lagrange(x);
assert.deepEqual(weights,[4,4,22]);
for(let degree=0;degree<3;degree++)assert.equal(mod(
  weights.reduce((sum,v,i)=>sum+v*(x[i]**degree),0)),Number(degree===0));
/** @param {number[][]} shares @returns {number[]} */
function decode(shares) {
  return shares[0].map((_,i)=>mod(shares.reduce(
    (sum,share,k)=>sum+weights[k]*share[i],0)));
}
/** @param {number[]} v @returns {number} */
function ioc(v) {
  const h=Array(29).fill(0);
  v.forEach(n=>h[n]++);
  return h.reduce((sum,f)=>sum+f*(f-1),0)/(v.length*(v.length-1));
}
/** @param {number[]} v @returns {string} */
const spell=v=>v.map(k=>gp.translit[k]).join(' ');
// Independent solved-source positive through a genuinely nonzero quadratic:
// a(i)=7i+13, b(i)=11i+23. Recover every plaintext rune without knowing a,b.
const solved=page(57);
assert.equal(solved.length,95);
const planted=Array.from({length:308},(_,i)=>solved[i%solved.length]);
const plantedShares=x.map(xx=>planted.map((v,i)=>
  mod(v+(7*i+13)*xx+(11*i+23)*xx*xx)));
assert.deepEqual(decode(plantedShares),planted);
assert(ioc(planted)>0.05);
const originals=[A,B,C];
const assignments=[[0,1,2],[0,2,1],[1,0,2],
  [1,2,0],[2,0,1],[2,1,0]];
const reports=assignments.map(order=>{
  const decoded=decode(order.map(i=>originals[i]));
  return {shareOrder:order.map(i=>['p6-p7-red-bracket',
    'pre+post-table-flanks','terminal-p54-p55'][i]),
    IoC:ioc(decoded),first40:spell(decoded.slice(0,40))};
});
assert(Math.abs(reports[0].IoC-0.033186683023816575)<1e-12);
assert(Math.abs(reports[1].IoC-0.034519226701637123)<1e-12);
assert(Math.abs(reports[3].IoC-0.03447692372773806)<1e-12);
assert(reports.every(x=>x.IoC<0.04));
console.log(JSON.stringify({
  originalSourceGroups:'original p6-p7 marker308; table flank138+170; p54-p55 terminal308',
  lengths:originals.map(x=>x.length),
  p7RedThreePrimeIndices:x,
  LagrangeAtZero:weights,
  signedMath:'all coefficients and reconstruction performed mod29',
  clearSolvedP57ControlIoC:ioc(solved),
  positiveDegree2Recovered:planted.length,
  originalSixAssignments:reports,
  conclusion:'No GP-native readable secret recovered from the 3-of-3 source-selected hypothesis; original share coordinates are not authenticated.'
},null,2));
