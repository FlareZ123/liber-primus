'use strict';
/**
 * SFT: four source-visible LP2 apostrophes versus every shared-slope,
 * word-relative affine GP29 key under plaintext suffixes S/D/T.
 * Node 22; run: node sims/lp2_apostrophe_shared_affine_suffix_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const gp=read('resources/liber-primus/lp2-corpus.json');
const punctuation=read('resources/liber-primus/lp2-quote-punctuation-spans.json');
/** @param {number} x */
const mod=x=>(x%29+29)%29;
const fixed=[
  [4,3,"MXI'W",1110,7],
  [21,2,"AEO'Y",5138,26],
  [35,2,"PE'T",8515,16],
  [41,3,"XLJ'C",10089,5],
];
assert.equal(punctuation.source_visible_apostrophes.length,4);
assert.equal(gp.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),12956);
for(let i=0;i<4;i++){
  const x=punctuation.source_visible_apostrophes[i];
  const [page,stem,word,global,tail]=fixed[i];
  assert.deepEqual([x.page,x.stem_runes,x.tail_runes,x.cipher_word,
    x.global_before_rune,x.scan],[page,stem,1,word,global,(page+17)+'.jpg']);
  const current=gp.pages[page].indices;
  const part=current.slice(x.local_before_rune-stem,x.local_before_rune+1);
  assert.equal(part.map(v=>gp.translit[v]).join(''),word.replace("'",""));
  assert.equal(part.at(-1),tail);
  assert.equal(gp.pages.slice(0,page).reduce((n,p)=>n+p.indices.length,0)
    +x.local_before_rune,global);
}
const suffix=['S','D','T'].map(s=>gp.translit.indexOf(s));
assert.deepEqual(suffix,[15,23,16]);
const diffs=[...new Set(suffix.flatMap(a=>suffix.map(b=>mod(a-b))))]
  .filter(x=>x!==0).sort((a,b)=>a-b);
assert.deepEqual(diffs,[1,7,8,21,22,28]);
/** @param {number} difference3 @param {number} difference2 */
function slopes(difference3,difference2){
  const survivors=[];
  for(let a=1;a<29;a++){
    const possible=new Set(diffs.map(d=>mod(a*d)));
    if(possible.has(difference3)&&possible.has(difference2))survivors.push(a);
  }
  return survivors;
}
const diff3=mod(fixed[0][4]-fixed[3][4]); // 3+1 suffixes W,C
const diff2=mod(fixed[1][4]-fixed[2][4]); // 2+1 suffixes Y,T
assert.deepEqual([diff3,diff2],[2,10]);
assert.deepEqual(slopes(diff3,diff2),[]);
const ratio=mod(diff2*15); // inverse of 2 in GF29 is 15
assert.equal(ratio,5);
assert.deepEqual(diffs.map(d=>mod(d*ratio)).sort((a,b)=>a-b),
  [5,6,11,18,23,24]);
// Independent positive plant: common a, unrelated position-specific offsets,
// S/T at 3+1 and D/S at 2+1, all in the same source-attested suffix set.
const a=7,offset={2:4,3:19},plain=[15,23,15,16];
const plant=fixed.map((x,i)=>mod(a*plain[i]+offset[x[1]]));
assert(slopes(mod(plant[0]-plant[3]),mod(plant[1]-plant[2])).includes(a));
// Authentic solved LP1 DON'T -> RWN'B with the FIRFUMFERENFE key clock.
// This checks that our GP indices and additive direction are consistent.
const p=['D','O','N','T'].map(x=>gp.translit.indexOf(x));
const c=['R','W','N','B'].map(x=>gp.translit.indexOf(x));
assert.deepEqual(c.map((x,i)=>mod(x-p[i])),[10,4,0,1]);
console.log(JSON.stringify({
 originalSuffixPairs:{threePlusOne:[7,5],twoPlusOne:[26,16]},
 observedDifferences:[diff3,diff2],allowedPlainSuffixes:['S','D','T'],
 sourceDifferenceSet:diffs,possibleCommonAffineSlopes:slopes(diff3,diff2),
 plant:{trueSlope:a,recoveredSlopes:slopes(mod(plant[0]-plant[3]),
   mod(plant[1]-plant[2]))},
 knownLP1KeyTail:[10,4,0,1],status:'conditional exact obstruction only'
},null,2));
