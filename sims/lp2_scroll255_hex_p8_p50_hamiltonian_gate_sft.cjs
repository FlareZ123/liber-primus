'use strict';
/**
 * SFT: exact p8 255-rune walk over original 256-cell p50 field.
 *
 * Source candidate: the independently discovered p3–p8 word-collision
 * differences spell HEX. Under the 2016 "numbers are direction" instruction,
 * HEX could select a six-neighbour axial lattice. A Hamiltonian walk of
 * all 256 grid cells would consume exactly p8's 255 printed rune moves and
 * provide a 256-byte key reorder without guessing English plaintext.
 *
 * This pins one small family: each original GP29 index mod6, or its original
 * printed prime mod6, becomes one of the six absolute hex-grid directions.
 * Allow every 6! = 720 secret bijective direction alphabets; starting point,
 * reflection, and rotation cannot repair a self-revisit before 255 moves.
 *
 * Windows 11, Node.js 22, CommonJS; original source reads only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const p8 = gp.pages.find(p => p.page === 8).indices;
assert.equal(p8.length, 255);
assert.deepEqual(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.equal(table.bytes.length, 256);
assert.equal(table.pages.reduce((n,p)=>n+p.tokens.length,0),256);

// Axial coordinates for a regular hexagonal 6-neighbour lattice.
const dirs = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
const permutations = [];
/** @param {number[]} left @param {number[]} right */
function permute(left,right) {
  if (!right.length) { permutations.push(left); return; }
  for (let i = 0; i < right.length; i++)
    permute([...left,right[i]],[...right.slice(0,i),...right.slice(i+1)]);
}
permute([], [0,1,2,3,4,5]);
assert.equal(permutations.length, 720);

/** @param {number[]} sixDigits @param {number[]} codebook */
function visit(sixDigits,codebook) {
  let x=0,y=0,minX=0,maxX=0,minY=0,maxY=0;
  const seen = new Set(['0,0']),points=[[0,0]];
  for (let i=0; i<sixDigits.length; i++) {
    const [dx,dy] = dirs[codebook[sixDigits[i]]];
    x+=dx; y+=dy;
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);
    minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    const key=x+','+y;
    if (seen.has(key)) return {prefix:i+1,collisionAtStep:i+1,
      distinctCells:seen.size,coords:points,span:[maxX-minX+1,maxY-minY+1]};
    points.push([x,y]);seen.add(key);
  }
  return {prefix:sixDigits.length,collisionAtStep:null,distinctCells:seen.size,
    coords:points,span:[maxX-minX+1,maxY-minY+1]};
}

const modes = {
  GPindex: p8.map(i => i%6),
  GPprime: p8.map(i => gp.prime[i]%6),
};
for (const [name, seq] of Object.entries(modes)) {
  assert.equal(seq.length,255);
  assert(seq.every(d => Number.isInteger(d) && d>=0 && d<6));
  let best=0, bestMap=[], perfect=0;
  for (const mapping of permutations) {
    const walk=visit(seq,mapping);
    if (walk.distinctCells>best) {best=walk.distinctCells;bestMap=mapping;}
    if (walk.distinctCells===256 &&
        ((walk.span[0]===8&&walk.span[1]===32)||
         (walk.span[0]===32&&walk.span[1]===8))) perfect++;
  }
  assert.equal(perfect,0);
  assert.equal(best,name==='GPindex'?19:194);
  console.log('HEX_32X8_SOURCE '+JSON.stringify({
    source:'Original p8 rune stream',kind:name,moveCount:seq.length,
    secretDirectionAlphabets:permutations.length,
    maximalUniqueCellsBeforeRevisit:best,
    all256CellTraversals:perfect,
    bestMap,
    conclusion:'No exact 256-cell Hamiltonian source walk in this grammar'
  }));
}

// Independent positive: a complete 32×8 serpentine hex-grid visit maps
// each of the 255 moves to GP digits {0,1,3}. The same decoder must
// extract every actual printed numeric-panel byte in its encoded visit order.
const planted=[];
for (let row=0;row<32;row++) {
  for (let col=0;col<7;col++) planted.push(row%2===0?0:3);
  if (row<31) planted.push(1);
}
assert.equal(planted.length,255);
const result=visit(planted,[0,1,2,3,4,5]);
assert.equal(result.collisionAtStep,null);
assert.equal(result.distinctCells,256);
assert.deepEqual(result.span,[8,32]);
const plantedBytes = result.coords.map(([col,row]) => table.bytes[row*8+col]);
const rowBytes = table.bytes.slice();
assert.equal(plantedBytes.length,256);
assert.deepEqual([...plantedBytes].sort((a,b)=>a-b),
  [...rowBytes].sort((a,b)=>a-b));
assert.equal(new Set(result.coords.map(p=>p.join(','))).size,256);

console.log('HEX_32X8_POSITIVE '+JSON.stringify({
  originalKeyBytesRecoveredByPlantedRoute:plantedBytes.length,
  firstRow:plantedBytes.slice(0,8),
  all256OriginalCellsUnique:true
}));
console.log('PASS: source-six-direction Hamiltonian walk exhausted; no original key recovered.');
