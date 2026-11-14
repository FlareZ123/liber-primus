'use strict';
/**
 * Original LP1 scan-05 NGC magic-square rows/columns/diagonals against the
 * original LP2 p56 five-black-dot illustration. Frozen source-only test.
 * Node.js 22 CommonJS, no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'control', 'openngc-square-subset.json'), 'utf8'));
const matrix = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
];
const dots = [
  [873.345787, 2517.000000],
  [921.226708, 2708.058724],
  [1103.934251, 2447.301489],
  [1408.121998, 2747.286227],
  [1603.870144, 2686.500000],
];
const objects = new Map(data.objects.map(o => [o.id, o]));
/** @param {string} s @returns {number} */
function parseRa(s) { const [h, m, sec] = s.split(':').map(Number); return 15 * (h + m / 60 + sec / 3600); }
/** @param {string} s @returns {number} */
function parseDec(s) { const [d, m, sec] = s.slice(1).split(':').map(Number); return (s[0] === '-' ? -1 : 1) * (d + m / 60 + sec / 3600); }
/**
 * @param {Array<[number,number]>} points
 * @returns {Array<[number,number]>}
 */
function normalize(points) {
  assert.equal(points.length, 5);
  const cx = points.reduce((s, p) => s + p[0], 0) / 5;
  const cy = points.reduce((s, p) => s + p[1], 0) / 5;
  const shifted = points.map(p => [p[0] - cx, p[1] - cy]);
  const norm = Math.sqrt(shifted.reduce((s, p) => s + p[0] ** 2 + p[1] ** 2, 0));
  assert.ok(norm > 0);
  return shifted.map(p => [p[0] / norm, p[1] / norm]);
}
/**
 * @param {number[]} ids
 * @returns {Array<[number,number]>}
 */
function skyFigure(ids) {
  const points = ids.map(id => {
    const o = objects.get(id);
    assert.ok(o, 'Missing NGC ' + id);
    return [parseRa(o.ra), parseDec(o.dec)];
  });
  const meanDec = points.reduce((s, p) => s + p[1], 0) / 5;
  const cos = Math.cos(meanDec * Math.PI / 180);
  return normalize(points.map(p => [p[0] * cos, p[1]]));
}
/**
 * Least-squares residual under uniform scale, translation, mirror and rotation.
 * @param {Array<[number,number]>} a
 * @param {Array<[number,number]>} b
 * @returns {number}
 */
function residual(a, b) {
  let real = 0, imag = 0, mirrorReal = 0, mirrorImag = 0;
  for (let i = 0; i < 5; i++) {
    const [x,y] = a[i], [u,v] = b[i];
    real += x*u + y*v;
    imag += y*u - x*v;
    mirrorReal += x*u - y*v;
    mirrorImag += y*u + x*v;
  }
  const coherence = Math.max(Math.hypot(real, imag), Math.hypot(mirrorReal, mirrorImag));
  return Math.sqrt(Math.max(0, 1 - coherence ** 2));
}
/** @param {number[]} items @returns {number[][]} */
function permutations(items) {
  if (items.length === 1) return [items.slice()];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    for (const tail of permutations([...items.slice(0,i),...items.slice(i+1)])) out.push([items[i],...tail]);
  }
  return out;
}
for (const row of matrix) assert.equal(row.reduce((a,b)=>a+b,0),1033);
for (let c=0;c<5;c++) assert.equal(matrix.reduce((a,row)=>a+row[c],0),1033);
for (const diag of [0,1]) assert.equal(matrix.reduce((a,row,i)=>a+row[diag ? 4-i : i],0),1033);
const assignments = permutations([0,1,2,3,4]);
const candidates = [
  ...matrix.map((ids,i) => ({name:'row'+i,ids})),
  ...Array.from({length:5},(_,i)=>({name:'col'+i,ids:matrix.map(row=>row[i])})),
  {name:'diagonal',ids:matrix.map((row,i)=>row[i])},
  {name:'antidiagonal',ids:matrix.map((row,i)=>row[4-i])},
].map(candidate => ({...candidate,shape:skyFigure(candidate.ids)}));
assert.equal(candidates.length,12);
assert.equal(assignments.length,120);
/**
 * @param {Array<[number,number]>} points
 * @returns {{residual:number,name:string,ids:number[],assignment:number[]}}
 */
function best(points) {
  const target=normalize(points);
  let chosen={residual:Infinity,name:'',ids:[],assignment:[]};
  for(const {name,ids,shape} of candidates){
    for(const assignment of assignments){
      const score=residual(shape,assignment.map(i=>target[i]));
      if(score<chosen.residual) chosen={residual:score,name,ids,assignment};
    }
  }
  return chosen;
}
const original=best(dots);
assert.equal(original.name,'row2');
assert.deepEqual(original.ids,[226,245,91,245,226]);
assert.ok(Math.abs(original.residual-0.3221954527861324)<1e-10);
const controls=assignments.map(a=>best(dots.map((p,i)=>[p[0],dots[a[i]][1]])).residual);
assert.ok(Math.abs(controls[0]-original.residual)<1e-10);
const count=controls.filter(x=>x<=original.residual+1e-12).length;
assert.equal(count,92);
const plantSky=skyFigure(candidates.find(x=>x.name==='col1').ids);
const plant=[2,4,0,1,3].map(i=>{
  const [x,y]=plantSky[i], theta=0.67;
  return [800+97*(x*Math.cos(theta)-y*Math.sin(theta)),
    2500+97*(x*Math.sin(theta)+y*Math.cos(theta))];
});
const positive=best(plant);
assert.ok(positive.residual<1e-7);
const sorted=controls.slice().sort((a,b)=>a-b);
console.log(JSON.stringify({
  source:'Original LP1 scan05 NGC5x5 vs solved LP2 p56 five black dots',
  families:{sourcePaths:12,dotAssignments:120,exactRearrangements:120},
  original,control:{atLeastAsGood:count,total:120,conditionalFraction:count/120,
    min:sorted[0],median:sorted[59],max:sorted[119]},
  positive:{path:positive.name,residual:positive.residual},
  conclusion:'No matched NGC sky pattern or unknown LP2 plaintext, key or continuation',
},null,2));
