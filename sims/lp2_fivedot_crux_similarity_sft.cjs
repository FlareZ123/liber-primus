"use strict";

/**
 * Source-fixed five-dot / five brightest Crux stars similarity gate.
 * Node.js 22, standalone CommonJS. Original p56 dot centroids are from
 * communications/broadcast/20261116T215649_agent30_vespucci-orthogonal-triangle-lead.md.
 * J2000 Crux coordinates from Guide to Observing Deep-Sky Objects
 * (Crux table at https://naedine.astrolab.ru/sites/default/files/books/farinacci.pdf).
 * No LP2 ciphertext, prose scoring, fitted astronomic labels, or arbitrary affine map.
 */
const assert = require('node:assert/strict');

/** @typedef {[number, number]} Point */
/** @type {Point[]} */
const page = [[873,2517], [921,2708], [1104,2447], [1408,2747], [1604,2686]];
/** @type {{name:string,ra:number,dec:number}[]} */
const stars = [
  {name:'alpha', ra:12+26/60+35.9/3600, dec:-(63+5/60+56/3600)},
  {name:'beta', ra:12+47/60+43.3/3600, dec:-(59+41/60+19/3600)},
  {name:'gamma',ra:12+31/60+9.9/3600, dec:-(57+6/60+47/3600)},
  {name:'delta',ra:12+15/60+8.6/3600, dec:-(58+44/60+56/3600)},
  {name:'epsilon',ra:12+21/60+21.5/3600,dec:-(60+24/60+4/3600)}
];
const dec0 = stars.reduce((a, x) => a+x.dec, 0)/stars.length;
const sky = stars.map(s => [15*s.ra*Math.cos(dec0*Math.PI/180), s.dec]);

/** Center five points and give them unit Frobenius norm.
 * @param {Point[]} points
 * @returns {Point[]}
 */
function normalize(points) {
  const cx=points.reduce((a,p)=>a+p[0],0)/points.length;
  const cy=points.reduce((a,p)=>a+p[1],0)/points.length;
  const centered=points.map(p=>[p[0]-cx,p[1]-cy]);
  const norm=Math.sqrt(centered.reduce((a,p)=>a+p[0]*p[0]+p[1]*p[1],0));
  return centered.map(p=>[p[0]/norm,p[1]/norm]);
}

/** @param {number[]} a @returns {number[][]} */
function permutations(a) {
  if(a.length===0) return [[]];
  return a.flatMap((x,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(b=>[x,...b]));
}
const orders=permutations([0,1,2,3,4]);

/** Best optimal scale, rotation, reflection and any 5! stellar assignment.
 * Reflected and unreflected orthogonal Procrustes are solved analytically.
 * @param {Point[]} source
 * @param {Point[]} target
 * @returns {{error:number,score:number,indices:number[],reflected:boolean}}
 */
function fit(source,target) {
  const X=normalize(source),Y=normalize(target);
  let best={error:2,score:-1,indices:[],reflected:false};
  for(const order of orders) {
    for(const reflected of [false,true]) {
      let dot=0,cross=0;
      for(let i=0;i<5;i++){
        const p=X[order[i]], q=Y[i];
        const x=p[0],y=reflected?-p[1]:p[1];
        dot+=x*q[0]+y*q[1];
        cross+=x*q[1]-y*q[0];
      }
      const score=Math.hypot(dot,cross);
      if(score>best.score) best={error:Math.sqrt(Math.max(0,1-score*score)),score,indices:[...order],reflected};
    }
  }
  return best;
}

/** @param {number} seed @returns {()=>number} */
function seededUniform(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}

// Self-test the exact similarity family on artificial data.
const synthetic=sky.map(([x,y])=>[2.5*y+100,-2.5*x-42]);
assert(fit(sky,synthetic).error<1e-7, 'known similarity control must fit');
assert.equal(orders.length,120);

const actual=fit(sky,page);
console.log('Original p56 five-dot / brightest five Crux gate');
console.log('source order in row-major original-centroid list:',actual.indices.map(i=>stars[i].name).join(','));
console.log('reflection:',actual.reflected,'normalized residual:',actual.error.toFixed(9));
console.log('RMS geometric misalignment in source image px:',
  (actual.error*Math.sqrt(page.reduce((a,p)=>a+(p[0]-page.reduce((s,q)=>s+q[0],0)/5)**2+
    (p[1]-page.reduce((s,q)=>s+q[1],0)/5)**2,0)/5)).toFixed(3));
assert(actual.error>0.39 && actual.error<0.41);

const random=seededUniform(3301);
const n=2000;
const errors=[];
for(let i=0;i<n;i++){
  const cloud=Array.from({length:5},()=>[731*random(),300*random()]);
  errors.push(fit(cloud,page).error);
}
errors.sort((a,b)=>a-b);
const rank=errors.filter(x=>x<=actual.error).length;
console.log('rectangle-conditioned random-five-stencil comparisons:',n);
console.log('random median residual:',errors[Math.floor(n/2)].toFixed(6));
console.log('fraction of random shapes with stronger best fit:',(rank/n).toFixed(4));
assert(rank>n/2,'Crux geometry should be less specific than typical random aspect-matched cloud');
console.log('PASS: all five Crux stars do not supply a distinctive source-native similarity map');
