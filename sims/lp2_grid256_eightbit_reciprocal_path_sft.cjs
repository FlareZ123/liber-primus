'use strict';

/**
 * Original p49–51 eight-bit reciprocal-direction gate.
 * Run with Node.js 22: node sims/lp2_grid256_eightbit_reciprocal_path_sft.cjs
 * Read-only, deterministic and dependency-free.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpusPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json');
const source = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const bytes = source.bytes;
assert.equal(bytes.length, 256);
assert.equal(bytes.every(x => Number.isInteger(x) && x >= 0 && x < 256), true);

// Four undirected directions, followed by their exact opposites.
// d0 E/W, d1 SE/NW, d2 S/N, d3 SW/NE.
const DELTA = [[0,1], [1,1], [1,0], [1,-1], [0,-1], [-1,-1], [-1,0], [-1,1]];
const edges = Array.from({length:4}, () => []);
const exits = Array.from({length:8}, () => []);
for (let r=0; r<32; r++) for (let c=0; c<8; c++) {
  const u=r*8+c;
  for (let d=0; d<8; d++) {
    const nr=r+DELTA[d][0], nc=c+DELTA[d][1];
    if (nr<0 || nr>=32 || nc<0 || nc>=8) exits[d].push(u);
    else if (d<4) edges[d].push([u,nr*8+nc]);
  }
}
assert.deepEqual(edges.map(x => x.length), [224,217,248,217]);
assert.deepEqual(exits.map(x => x.length), [32,39,8,39,32,39,8,39]);
const TOTAL=edges.reduce((n,a) => n+a.length,0)+exits.reduce((n,a) => n+a.length,0);
assert.equal(TOTAL,1142);

const mappings=[];
function enumerate(prefix,rest) {
  if (rest.length===0) { mappings.push(prefix); return; }
  for (let i=0; i<rest.length; i++)
    enumerate([...prefix,rest[i]],rest.filter((_,j) => j!==i));
}
enumerate([],[0,1,2,3,4,5,6,7]);
assert.equal(mappings.length,40320);

/** @param {number[]} cells @returns {{score:number,mapping:number[]}} */
function bestReciprocalFit(cells) {
  const boundary=Array.from({length:8},(_,d) =>
    Array.from({length:8},(_,b) =>
      exits[d].reduce((n,u) => n + Number(((cells[u]>>b)&1)===0),0)));
  const score=new Int32Array(4*64);
  for (let d=0; d<4; d++) for (let a=0; a<8; a++) for (let b=0; b<8; b++) {
    let n=boundary[d][a]+boundary[d+4][b];
    for (const [u,v] of edges[d])
      n+=Number(((cells[u]>>a)&1)===((cells[v]>>b)&1));
    score[d*64+a*8+b]=n;
  }
  let best=-1,chosen=null;
  for (const map of mappings) {
    let n=0;
    for (let d=0;d<4;d++) n+=score[d*64+map[d]*8+map[d+4]];
    if (n>best) {best=n;chosen=map;}
  }
  return {score:best,mapping:chosen};
}

// Deliberately planted unknown eight-bit/compass alphabet: all 1,142
// constraints are satisfied for *one true hidden* bijection.
let plantSeed=64111;
function plantRandom() {
  plantSeed|=0;plantSeed^=plantSeed<<13;plantSeed^=plantSeed>>>17;plantSeed^=plantSeed<<5;
  return (plantSeed>>>0)/4294967296;
}
const hiddenMap=[4,7,2,0,5,3,1,6];
const plant=Array(256).fill(0);
for (let d=0;d<4;d++)for(const [u,v] of edges[d]) {
  if (plantRandom()<0.5) {
    plant[u]|=1<<hiddenMap[d];
    plant[v]|=1<<hiddenMap[d+4];
  }
}
const plantFit=bestReciprocalFit(plant);
assert.equal(plantFit.score,TOTAL);
const originalFit=bestReciprocalFit(bytes);
assert.equal(originalFit.score,633);
assert.deepEqual(originalFit.mapping,[1,6,5,0,4,2,7,3]);

let shuffleSeed=21115;
function random() {
  shuffleSeed|=0;shuffleSeed^=shuffleSeed<<13;shuffleSeed^=shuffleSeed>>>17;shuffleSeed^=shuffleSeed<<5;
  return (shuffleSeed>>>0)/4294967296;
}
const nullScores=[];
for(let t=0;t<1000;t++) {
  const shuffled=bytes.slice();
  for (let i=shuffled.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
  }
  nullScores.push(bestReciprocalFit(shuffled).score);
}
nullScores.sort((a,b)=>a-b);
const exceed=nullScores.filter(x=>x>=originalFit.score).length;
const mean=nullScores.reduce((a,b)=>a+b,0)/nullScores.length;
assert.equal(exceed,605);
assert.equal(nullScores[0],605);
assert.equal(nullScores[999],667);
assert.equal(mean,634.366);

console.log(JSON.stringify({
  source:corpusPath,
  dimensions:[32,8],
  sourceBytes:256,
  original:originalFit,
  reciprocalAndEdgeConstraints:TOTAL,
  positivePlant:plantFit.score,
  randomSeed:21115,
  shuffledNull:{trials:1000,minimum:nullScores[0],median:nullScores[499],
    maximum:nullScores[999],mean,atLeastOriginal:exceed,
    empiricalTail:(exceed+1)/1001}
},null,2));
