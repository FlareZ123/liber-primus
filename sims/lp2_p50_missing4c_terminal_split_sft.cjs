'use strict';

/**
 * Exact original LP2 p49–p51 missing-4C dual-radix arithmetic, Agent38.
 * Windows Node22 read-only single runnable test against canonical resources.
 * An authored cipher instruction or unknown-page decryption is NOT established.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {any} */
const json = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const grid = json('resources/liber-primus/base60-grid.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const tokens = grid.rows.flat();
const alphabet = grid.alphabet;
/** @param {string} token @returns {number} */
function radix60(token) {
  assert.equal(token.length, 2);
  const first = alphabet.indexOf(token[0]);
  const second = alphabet.indexOf(token[1]);
  assert(first >= 0 && second >= 0);
  return first * 60 + second;
}
const bytes = tokens.map(radix60);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert(bytes.every(v => v >= 0 && v <= 255));
const counts = corpus.pages.slice(55, 58).map(p => p.runic_count);
assert.deepEqual(counts, [76, 85, 95]);
const knownLength = counts[1] + counts[2];
const total = counts.reduce((a,b) => a+b, 0);
assert.equal(total, bytes.length);
// p57's source-visible “shed circumferences”: one outer ring / 30×6 core.
/** @type {number[]} */
const outer=[];
/** @type {number[]} */
const inner=[];
for(let row=0;row<32;row++)for(let col=0;col<8;col++) {
  const i=row*8+col;
  if(row===0 || row===31 || col===0 || col===7) outer.push(i);
  else inner.push(i);
}
assert.equal(outer.length,76);
assert.equal(inner.length,180);
assert.equal(outer.length,counts[0]);
assert.equal(inner.length,knownLength);

/** @param {number} i @param {number} j @returns {boolean} */
function near(i, j) {
  return Math.max(Math.abs(Math.floor(i/8)-Math.floor(j/8)),
    Math.abs(i%8-j%8))===1;
}
/**
 * Enumerate spatial 8-neighbor paths realizing successive original tokens.
 * @param {string[]} sought
 * @returns {number[][]}
 */
function paths(sought) {
  let branches = tokens.map((t,i) => t===sought[0] ? [i] : null).filter(Boolean);
  for (const t of sought.slice(1)) {
    const next=[];
    for (const b of branches) {
      for(let i=0;i<tokens.length;i++) {
        if(tokens[i]===t && near(b[b.length-1],i) && !b.includes(i))
          next.push([...b,i]);
      }
    }
    branches=next;
  }
  return branches;
}
/**
 * Source-only extraction: enumerate every maximal increasing-by-one
 * 8-neighbor path without preselecting a byte range, ASCII, or token string.
 * @returns {number[][]} Paths of source-cell indices.
 */
function maximalSuccessorPaths() {
  const successors=bytes.map((v,i)=>bytes.flatMap((w,j)=>
    near(i,j) && w===v+1 ? [j] : []));
  const hasPredecessor=bytes.map((v,i)=>bytes.some((w,j)=>
    near(i,j) && w===v-1));
  /** @type {number[][]} */
  const maximal=[];
  /** @param {number[]} trail */
  function visit(trail) {
    const next=successors[trail[trail.length-1]];
    if(next.length===0) {
      if(trail.length>=3) maximal.push(trail);
      return;
    }
    for(const j of next) visit([...trail,j]);
  }
  for(let i=0;i<bytes.length;i++) if(!hasPredecessor[i]) visit([i]);
  return maximal;
}
const maximal=maximalSuccessorPaths();
const maximalValues=maximal.map(trail=>trail.map(i=>bytes[i]))
  .sort((a,b)=>a[0]-b[0]||a.length-b.length);
assert.deepEqual(maximalValues,[
  [248,249,250,251],
  [248,249,250,251],
  [253,254,255]
]);
const missingBetweenMaxima=maximalValues[2][0]-
  maximalValues[1][maximalValues[1].length-1]-1;
assert.equal(missingBetweenMaxima,1);
const bridgeValue=maximalValues[1][maximalValues[1].length-1]+1;
assert.equal(bridgeValue,252);
const bridgeToken=alphabet[Math.floor(bridgeValue/60)]+alphabet[bridgeValue%60];
assert.equal(bridgeToken,'4C');
assert(!tokens.includes(bridgeToken));
// An independent source-only route starts with the *printed* 32×8
// circumference and solved p57's word SHED, without consulting p55.
const peeledCircumferenceToken=outer.length.toString(16).toUpperCase();
assert.equal(peeledCircumferenceToken,bridgeToken);
const inferredAddress=radix60(peeledCircumferenceToken);
assert.equal(inferredAddress,252);
assert.equal(bytes[inferredAddress],inner.length);
assert.equal(tokens[inferredAddress],'30');

const lower=paths(['48','49','4A','4B']);
const upper=paths(['4D','4E','4F']);
assert.equal(lower.length,2);
assert.equal(upper.length,1);
assert(!tokens.includes('4C'));

// Charge ALL 80 uppercase two-digit hexadecimal strings that represent
// valid original base60 table indices, not only the favourable high band.
/** @type {{token:string,address:number,hex:number,tableValue:number,present:boolean}[]} */
const complements=[];
let eligibleCount=0;
let missingCount=0;
for(const a of '01234') {
  for(const b of '0123456789ABCDEF') {
    const token=a+b;
    const address=radix60(token);
    if(address>=bytes.length)continue;
    eligibleCount++;
    const present=tokens.includes(token);
    if(!present)missingCount++;
    const hex=Number.parseInt(token,16);
    const tableValue=bytes[address];
    if(hex+tableValue===total)
      complements.push({token,address,hex,tableValue,present});
  }
}
assert.equal(eligibleCount,80);
assert.deepEqual(complements,[{
  token:'4C',address:252,hex:76,tableValue:180,present:false
}]);
assert.equal(bytes[252],knownLength);
assert.equal(Number.parseInt('4C',16),counts[0]);

// A deterministic pointer observation only; no historical stop rule is known.
let current=252;
const seen=new Set();
/** @type {number[]} */
const walk=[];
while(!seen.has(current)) {
  seen.add(current);
  walk.push(current);
  current=bytes[current];
}
assert.equal(walk[0],252);
assert.equal(walk[1],180);
assert.equal(walk.indexOf(76),15);

console.log(JSON.stringify({
  source:'Original LP2 p49–p51 32×8 table and p55–p57 rune counts',
  sourceTableLength:bytes.length,
  consecutivePathCounts:{'48→49→4A→4B':lower.length,'4D→4E→4F':upper.length},
  sourceOnlyMaximalPaths:maximal.map(trail=>({indices:trail,values:trail.map(i=>bytes[i])})),
  missingToken:'4C',
  independentSourceSelectors:{
    maximalPathBridge:bridgeToken,
    p57ShedCircumferenceHex:peeledCircumferenceToken,
    peeledRemainder:grid.rows.length*8-outer.length
  },
  missingHexValue:76,
  missingBase60Address:252,
  addressToken:tokens[252],
  addressValue:bytes[252],
  terminalRunes:{p55:counts[0],p56:counts[1],p57:counts[2]},
  p57Circumference:{outerGridCells:outer.length,innerGridCells:inner.length},
  completenessScan:{eligibleCount,missingCount,complements},
  pointerWalkThrough76:walk.slice(0,16),
  interpretation:'Exact original-data coincidence; no source-selected cipher, recovered unknown plaintext, or key'
},null,2));
