"use strict";

/**
 * SFT: exact all-secret GP29 2x2-neighborhood 81^2 -> 80^2 stencil gate.
 *
 * The source's repeated DJU BEI ending marks an 81x81 initial block,
 * leaving 6395 runes, five short of 80x80. Test two source-visible ways
 * to fill exactly five slots: the solved p56 AN END ciphertext after the
 * terminal boundary; or pp36-38's five numbered original paragraphs.
 *
 * Allow an ENTIRELY ARBITRARY secret 29^4 -> 29 output function, not
 * merely affine or determinant stencils. A repeat of exactly the same
 * ordered source four-symbol neighborhood MUST yield the same output.
 *
 * Windows 11: node sims/lp2_bookend_81to80_unrestricted_2x2_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const first=original.slice(0,81*81);
const tail=original.slice(81*81);
assert.deepEqual([first.length,tail.length],[6561,6395]);
assert.deepEqual(first.slice(-6),tail.slice(-6),
  "original identical 3+3-rune 81^2 bookend");
const five=gp.pages.find(p=>p.page===56).indices.slice(0,5);
assert.deepEqual(five,[25,11,22,15,4],
  "actual independently solved p56 ciphertext heading");
const terminal=[...tail,...five];
assert.equal(terminal.length,6400);
const holeSlots=new Set([2244,2384,2476,2575,2672]);
assert.equal(holeSlots.size,5);
const ORDINAL=Array.from({length:6400},(_,i)=>
  holeSlots.has(i) ? null : -1);
let t=0;
for(let i=0;i<6400;i++)
  if(ORDINAL[i]!==null)ORDINAL[i]=tail[t++];
assert.equal(t,tail.length);

const DIM=80;
/**
 * Orientation of source 2×2 corners for an output cell r,c.
 * 8 dihedral views of the 80×80 neighborhoods.
 * @param {number} row @param {number} col @param {number} mode
 * @returns {[number,number]}
 */
function orient(row,col,mode) {
  if(mode&1)col=DIM-1-col;
  if(mode&2)row=DIM-1-row;
  if(mode&4)[row,col]=[col,row];
  return [row,col];
}
/**
 * Collision-free tuple key <29^4 =707281.
 * @param {number} row @param {number} col
 */
function neighborhood(row,col) {
  const j=81*row+col;
  return [first[j],first[j+1],first[j+81],first[j+82]];
}
function keyOf(a) {
  return ((a[0]*29+a[1])*29+a[2])*29+a[3];
}
/**
 * Exact number of output edits needed to fit ANY fixed deterministic
 * secret 2×2 source-stencil function.
 *
 * For each observed four-rune input, the best output symbol is its most
 * frequently observed target. A single secret function attains this bound.
 * Null targets are arbitrary erasures and can always be assigned later.
 *
 * @param {(number|null)[]} targets
 * @param {number} mode
 */
function fit(targets,mode) {
  assert.equal(targets.length,6400);
  const groups=new Map();
  let observed=0;
  for(let i=0;i<targets.length;i++) {
    const outcome=targets[i];
    if(outcome===null)continue;
    assert(outcome>=0&&outcome<29);
    const [r,c]=orient(Math.floor(i/80),i%80,mode);
    const tuple=keyOf(neighborhood(r,c));
    let hist=groups.get(tuple);
    if(!hist) {
      hist=new Uint16Array(29);
      groups.set(tuple,hist);
    }
    hist[outcome]++;
    observed++;
  }
  let forcedEdits=0,collisionPairs=0;
  let largestGroup=0;
  for(const hist of groups.values()) {
    let n=0,best=0;
    for(const v of hist){n+=v;best=Math.max(best,v);}
    forcedEdits+=n-best;
    collisionPairs+=n*(n-1)/2;
    largestGroup=Math.max(largestGroup,n);
  }
  assert.equal([...groups.values()].reduce((s,h)=>
    s+h.reduce((a,b)=>a+b,0),0),observed);
  return {
    mode,observed,distinctInputs:groups.size,collisionPairs,
    largestGroup,forcedEdits
  };
}
/** @param {number} mode @returns {number[]} */
function planted(mode) {
  return Array.from({length:6400},(_,i)=>{
    const [r,c]=orient(Math.floor(i/80),i%80,mode);
    const [a,b,d,e]=neighborhood(r,c);
    return (7*a+11*b+3*d+15*e+a*b+d*e+5)%29;
  });
}
const plant=planted(5);
const pfull=fit(plant,5);
assert.equal(pfull.forcedEdits,0);
const phole=plant.map((x,i)=>holeSlots.has(i)?null:x);
const pholes=fit(phole,5);
assert.equal(pholes.forcedEdits,0);
assert.deepEqual([pfull.observed,pholes.observed],[6400,6395]);
const direct=Array.from({length:8},(_,mode)=>fit(terminal,mode));
const ordinal=Array.from({length:8},(_,mode)=>fit(ORDINAL,mode));
assert.deepEqual(direct.map(x=>x.forcedEdits),
  [35,39,40,39,38,39,40,40]);
assert.deepEqual(ordinal.map(x=>x.forcedEdits),
  [39,39,39,35,39,36,38,39]);
for(const x of [...direct,...ordinal])
  assert(x.forcedEdits>=35);
console.log(JSON.stringify({
  input:{source81x81:first.length,secondUnknown:tail.length,
    p56KnownFive:five,ordinalFiveSlots:[...holeSlots]},
  exactArbitraryLookupFamily:"ANY deterministic GP29^4 -> GP29 table, per view",
  terminalFive:direct,
  ordinalFiveHoles:ordinal,
  plantedPositive:{terminal:pfull,ordinal:pholes},
  verdict:"Neither authored five-slot completion can be emitted by a stationary unrestricted two-by-two source neighborhood function, under any of eight orientations. No plaintext recovered."
},null,2));
