'use strict';

// Original five-dot LP2 p23 against pre-2014 Xplanet Aquila line-graph path.
// Read-only CommonJS single-file test with built-in Node.js dependencies.
// Historical arc source: https://sources.debian.org/src/xplanet/1.2.0-6/xplanet/arcs/constellations
// Original printed dot coordinates and extraction from:
// sims/lp2_fivedot_aquila_astrometry_sft.py.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', '40.jpg'));
const hash = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(hash, 'd31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee');

/** @typedef {{x:number, y:number}} Point */
/** @typedef {{name:string, ra:number, dec:number}} Star */

/** @type {Point[]} Centroids of the exact five dark circles in original 40.jpg (p23). */
const dots = [
  {x:796.941276,y:568.226708},
  {x:992.5,y:507.362921},
  {x:1296.931479,y:807.211127},
  {x:1479.264688,y:546.5},
  {x:1527.153553,y:737.938931}
];

// The 2008 Xplanet 1.2.0-6 line-segment list supplies these RA hours and
// declinations (degrees), without LP2-dependent position optimization.
/** @type {Record<string, Star>} */
const stars = {
  gamma: {name:'gamma',ra:19.7712,dec:10.5997},
  alpha: {name:'alpha',ra:19.8461,dec:8.8694},
  beta:  {name:'beta', ra:19.9217,dec:6.3999},
  delta: {name:'delta',ra:19.4252,dec:3.0997},
  eta:   {name:'eta',  ra:19.8744,dec:1.0027},
  iota:  {name:'iota', ra:19.6116,dec:-1.2834},
  epsilon:{name:'epsilon',ra:18.9932,dec:15.0688},
  zeta:   {name:'zeta',ra:19.0902,dec:13.8484},
  aql15:  {name:'aql15',ra:19.1039,dec:-4.8644},
  aql12:  {name:'aql12',ra:19.0279,dec:-5.7353},
  aql66:  {name:'aql66',ra:20.1884,dec:-0.8193}
};

/** @param {Point[]} pts @returns {Point[]} */
function centered(pts) {
  const mx=pts.reduce((s,p)=>s+p.x,0)/pts.length;
  const my=pts.reduce((s,p)=>s+p.y,0)/pts.length;
  return pts.map(p=>({x:p.x-mx,y:p.y-my}));
}

/** @param {Star[]} selected @returns {Point[]} */
function project(selected) {
  const meanDec=selected.reduce((s,v)=>s+v.dec,0)/selected.length;
  const scale=Math.cos(meanDec*Math.PI/180);
  return centered(selected.map(s=>({x:s.ra*15*scale,y:s.dec})));
}

/** @param {Point[]} constellation @param {Point[]} ink @returns {{residual:number,assignment:number[],mirror:boolean}} */
function closestFit(constellation, ink) {
  const target=centered(ink);
  const lengthA=constellation.reduce((s,p)=>s+p.x*p.x+p.y*p.y,0);
  const lengthB=target.reduce((s,p)=>s+p.x*p.x+p.y*p.y,0);
  const denom=Math.sqrt(lengthA*lengthB);
  let best={residual:Infinity,assignment:[],mirror:false};
  /** @param {number[]} order @param {number} mask */
  function visit(order,mask) {
    if(order.length!==constellation.length){
      for(let i=0;i<constellation.length;i++)if((mask&(1<<i))===0)visit([...order,i],mask|(1<<i));
      return;
    }
    let re=0,im=0,mre=0,mim=0;
    for(let k=0;k<order.length;k++){
      const a=constellation[order[k]],b=target[k];
      re+=a.x*b.x+a.y*b.y;
      im+=a.x*b.y-a.y*b.x;
      mre+=a.x*b.x-a.y*b.y;
      mim+=a.x*b.y+a.y*b.x;
    }
    for(const entry of [{amp:Math.hypot(re,im),mirror:false},{amp:Math.hypot(mre,mim),mirror:true}]){
      const residual=Math.sqrt(Math.max(0,1-(entry.amp/denom)**2));
      if(residual<best.residual)best={residual,assignment:order.slice(),mirror:entry.mirror};
    }
  }
  visit([],0);
  return best;
}

/** @param {string[]} names */
function evaluate(names) {
  const selected=names.map(x=>stars[x]);
  const f=closestFit(project(selected),dots);
  return {catalogue:names,normalizedRms:f.residual,
          sourceLeftToRight:f.assignment.map(i=>names[i]),
          orientation:f.mirror?'reflection':'rotation'};
}

// Actual 2008 source arcs: Tarazed->Altair->Beta->Eta->Iota.
// The postselected previously claimed five-star fit substitutes Delta for Beta.
const historicalPath=evaluate(['gamma','alpha','beta','eta','iota']);
const postselected=evaluate(['gamma','alpha','delta','eta','iota']);
assert.ok(Math.abs(historicalPath.normalizedRms-0.36441998472038445)<1e-8);
assert.ok(Math.abs(postselected.normalizedRms-0.18798638870931958)<1e-8);
assert.deepEqual(historicalPath.sourceLeftToRight,['iota','eta','alpha','beta','gamma']);
assert.deepEqual(postselected.sourceLeftToRight,['gamma','alpha','delta','eta','iota']);


// Exhaust the complete five-node simple walks of the old source's Aquila arcs.
// Edges are transcribed directly from the period Xplanet constellation file.
// A path and its reverse describe the same five source stars.
const sourceArcs = [
  ['epsilon','zeta'],['zeta','gamma'],['gamma','alpha'],
  ['alpha','beta'],['beta','eta'],['eta','iota'],
  ['iota','aql15'],['aql15','aql12'],
  ['aql66','eta'],['eta','delta']
];
/** @type {Record<string,string[]>} */
const adjacency=Object.fromEntries(Object.keys(stars).map(name=>[name,[]]));
for(const [from,to] of sourceArcs){
  adjacency[from].push(to);
  adjacency[to].push(from);
}
/** @type {Map<string,string[]>} */
const uniquePaths=new Map();
/** @param {string[]} path */
function walk(path){
  if(path.length===5){
    const forward=path.join('|'), reverse=path.slice().reverse().join('|');
    uniquePaths.set(forward<reverse?forward:reverse,path.slice());
    return;
  }
  for(const to of adjacency[path[path.length-1]])if(!path.includes(to))walk([...path,to]);
}
for(const name of Object.keys(stars))walk([name]);
const pathFits=[...uniquePaths.values()].map(evaluate)
  .sort((a,b)=>a.normalizedRms-b.normalizedRms);
assert.equal(pathFits.length,9);
assert.ok(Math.abs(pathFits[0].normalizedRms-0.26099664723361377)<1e-8);
assert.deepEqual([...pathFits[0].catalogue].sort(),['aql12','aql15','delta','eta','iota']);

// A genuine chart silhouette, transformed by arbitrary similarity and
// reflection, must fit to numerical roundoff under this exact fitter.
const original=project(['gamma','alpha','beta','eta','iota'].map(x=>stars[x]));
const planted=original.map(p=>({x:1234+11*p.x-7*p.y,y:567+7*p.x+11*p.y}));
assert.ok(closestFit(original,planted).residual<1e-7);

console.log(JSON.stringify({originalScanSha256:hash,source:'Xplanet 1.2.0-6 (Debian lenny, pre-2014)',
  path:historicalPath,alternativeSubset:postselected,
  ratio:historicalPath.normalizedRms/postselected.normalizedRms,
  sourcePathCount:pathFits.length, bestHistoricalPath:pathFits[0], allHistoricalPaths:pathFits,
  positiveControl:'PASS',ciphertextRecovered:0},null,2));
