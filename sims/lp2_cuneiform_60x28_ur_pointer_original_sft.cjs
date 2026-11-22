'use strict';
/**
 * Source-first CUNEI 1033/3301 coordinate candidate, original p33–39.
 * The seven pages including cuneiform artwork contain 1680 GP runes.
 * 1680 = 60*28 (Babylonian sexagesimal base times nonzero GF29 residues).
 * Two printed base60 numbers 17,13 and 55,1 can serve 1-based
 * (row,column) positions in a 60-row x 28-column tableau. They read UR.
 *
 * This is a HYPOTHESIS, never a recovered LP2 decipherment.
 * Original first numbered 139-rune item and independent 91-rune second
 * item are used to test the explicit two simplest key interpretations.
 * Pure GP29 shift and authentic solved p56 plaintext-F transparency are
 * both checked for BOTH conventional arithmetic signs.
 *
 * Run: node sims/lp2_cuneiform_60x28_ur_pointer_original_sft.cjs
 * Windows11, Node22, CJS, read-only, no CLI arguments, no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalText = read('resources/liber-primus/lp2-transcription.txt').split('%');
const glyphId = new Map(gp.runes.map((value, index) => [value, index]));
assert.equal(glyphId.size, 29);
/** @param {number} n @returns {number[]} */
const page = n => gp.pages.find(p => p.page === n).indices;
assert.deepEqual(Array.from({length: 7}, (_, i) => page(i + 33).length),
  [214, 261, 271, 238, 228, 228, 240]);
const sevenPages = Array.from({length: 7}, (_, i) => page(i + 33)).flat();
assert.equal(sevenPages.length, 60 * 28);
const signedSource = [[17,13],[55,1]];
assert.deepEqual(signedSource.map(([high,low]) => 60*high+low),
  [1033,3301]);
// One-based coordinates select a grid index, not base-60 scalar position.
const positions = signedSource.map(([row,col]) => (row - 1)*28 + col - 1);
assert.deepEqual(positions, [460,1512]);
const picked = positions.map(i => sevenPages[i]);
assert.deepEqual(picked, [1,4]); // GP U, R
assert.equal(picked.map(i => gp.translit[i]).join(''), 'UR');

/**
 * Map a source glyph back to its original physical page and rune offset.
 * @param {number} i
 * @returns {{page:number,offset:number,glyph:string,index:number}}
 */
function sourceLocation(i) {
  let remain=i;
  for(let pg=33;pg<=39;pg++){
    if(remain<page(pg).length){
      const index=page(pg)[remain];
      return {page:pg,offset:remain,glyph:gp.runes[index],index};
    }
    remain-=page(pg).length;
  }
  throw new RangeError('Grid source index out of range');
}
assert.deepEqual(positions.map(sourceLocation),
  [{page:34,offset:246,glyph:'ᚢ',index:1},
   {page:39,offset:72,glyph:'ᚱ',index:4}]);

// Bound the seven-page-window reference universe. 44 other or identical
// seven-page windows contain both coordinate positions; only p33–39
// yields UR. This is descriptive, not a probability.
const comparisons = [];
for(let first=0;first<=49;first++){
  const tape=Array.from({length:7},(_,i)=>page(first+i)).flat();
  if(tape.length<=positions[1]) continue;
  comparisons.push({first,last:first+6,length:tape.length,
    text:positions.map(p=>gp.translit[tape[p]]).join('')});
}
assert.equal(comparisons.length,44);
assert.deepEqual(comparisons.filter(w=>w.text==='UR'),
  [{first:33,last:39,length:1680,text:'UR'}]);

// Exact original five numbered receivers; independent second item withheld
// from any key derivation. Source page4 contains a true page-spanning word.
const items=[
  page(36).slice(99,238),
  page(37).slice(0,91),
  page(37).slice(91,189),
  page(37).slice(189,228).concat(page(38).slice(0,57)),
  page(38).slice(57,186)
];
assert.deepEqual(items.map(x=>x.length),[139,91,98,96,129]);
const m=n=>(n%29+29)%29;
/** @param {number[]} runes @returns {number} */
function ioc(runes){
  const counts=Array(29).fill(0);
  for(const rune of runes) counts[rune]++;
  const n=runes.length;
  return counts.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1));
}
/**
 * Enumerate EVERY valid p56 F-transparent inverse branch at any ambiguous
 * cipher-F. A literal P=F emits F without advancing key, a non-F encodes
 * with the current key phase, and P=F via normal encryption is forbidden.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {{complete:boolean,blockedAt:number|null,survivorHistories:string}}
 */
function fBranchInverse(cipher,key,sign){
  let states=new Map([[0,1n]]);
  for(let i=0;i<cipher.length;i++){
    const next=new Map();
    for(const [phase,count] of states){
      if(cipher[i]===0)next.set(phase,(next.get(phase)||0n)+count);
      const plain=m(cipher[i]-sign*key[phase]);
      if(plain!==0){
        const after=(phase+1)%key.length;
        next.set(after,(next.get(after)||0n)+count);
      }
    }
    if(next.size===0)
      return {complete:false,blockedAt:i,survivorHistories:'0'};
    states=next;
  }
  return {
    complete:true,blockedAt:null,
    survivorHistories:[...states.values()].reduce((sum,n)=>sum+n,0n).toString()
  };
}
/**
 * Source-authentic p56-style encryption; F transparent and nonconsuming.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function fForward(plain,key,sign){
  let i=0;
  return plain.map(v=>{
    if(v===0)return 0;
    const out=m(v+sign*key[i%key.length]);i++;
    return out;
  });
}
const keys=[
  {name:'UR',runes:picked},
  {name:'URNAMMU',runes:[1,4,9,24,19,19,1]}
];
const nativeSource=page(57);assert.equal(nativeSource.length,95);
const cases=[];
for(const key of keys)for(const sign of [-1,1]){
  const plant=Array.from({length:139},(_,i)=>nativeSource[i%95]);
  const encrypted=fForward(plant,key.runes,sign);
  const recovered=fBranchInverse(encrypted,key.runes,sign);
  assert.equal(recovered.complete,true);
  const originals=items.map((cipher,i)=>{
    const direct=cipher.map((v,j)=>m(v-sign*key.runes[j%key.runes.length]));
    return {
      item:i+1,runes:cipher.length,
      directIoc:ioc(direct),
      directFirst12:direct.slice(0,12).map(id=>gp.translit[id]).join(' '),
      fTransparent:fBranchInverse(cipher,key.runes,sign)
    };
  });
  assert.equal(originals[0].fTransparent.complete,false);
  assert(originals[0].directIoc<0.04);
  assert(originals[1].directIoc<0.045);
  cases.push({key:key.name,sign,plantSurvives:true,originals});
}
assert.deepEqual(cases.filter(x=>x.key==='UR').map(x=>
  x.originals[0].fTransparent.blockedAt),[5,43]);
assert.deepEqual(cases.filter(x=>x.key==='URNAMMU').map(x=>
  x.originals[0].fTransparent.blockedAt),[6,40]);

console.log(JSON.stringify({
  classification:'HYPOTHESIS / source-derived two-rune address / no LP2 decipherment',
  images:'original LP2 physical p33–39, seven cuneiform pages',
  pageRuneCounts:[214,261,271,238,228,228,240],
  grid:'60 rows x 28 columns, 1-based row and column',
  cuneiform:{numbers:[1033,3301],base60Pairs:signedSource,
    linearZeroBased:positions,coordinates:positions.map(sourceLocation),
    letters:'UR'},
  competingCoordinateConventions:{
    zeroBasedRowAndColumn:positions.map((_,i)=>{
      const [row,col]=signedSource[i];
      return gp.translit[sevenPages[28*row+col]];
    }).join(''),
    oneBasedRowAndColumn:'UR'
  },
  sevenPageReferenceWindows:{total:comparisons.length,
    windowsYieldingUR:comparisons.filter(x=>x.text==='UR')},
  candidateKeyHypotheses:cases,
  decision:'UR is an original-data-selected two-rune output under a specific'
    +' 60x28 one-based grid convention, NOT authenticated cipher plaintext.'
    +' Both direct repeating-shift and the original p56 F-transparent'
    +' repeating-shift classes fail on item1 with UR or URNAMMU as keys.'
    +' Because the cuneiform marked section begins inside p33,'
    +' starting the grid at the top of p33 remains unselected.'
},null,2));
console.log('PASS original CUNEI 60x28 UR candidate, 1-based coordinates and key gate');
