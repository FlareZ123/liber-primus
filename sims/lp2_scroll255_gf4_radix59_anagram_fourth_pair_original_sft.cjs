'use strict';
/**
 * LP2 original 255 scroll-word / p8 255-rune, four source Parikh-class
 * collision constraints (3 literal repeated words + 1 unseen two-rune
 * anagram). The fourth pair was NOT used when the prior GF4/radix59 key was
 * selected from only the three exact-word duplicates.
 *
 * Source GF4 4-tap key code is frozen and reused without retuning.
 * A fixed 1,000,000-repetition histogram-preserving familywise null
 * calibrates all 64 original prior configurations jointly.
 *
 * Windows 11 / Node22:
 *   node sims/lp2_scroll255_gf4_radix59_anagram_fourth_pair_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..','resources','liber-primus');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('lp2-corpus.json'));
const grid=JSON.parse(read('lp2-grid-256.json'));
const ink=JSON.parse(read('lp2-ink-annotations.json'));
const parts=read('lp2-transcription.txt').split('%');
const gpMap=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {number} n @returns {number} */
const mod=n=>((n%29)+29)%29;
const words=[];
let pending=[];
for(let page=3;page<=7;page++){
  for(const ch of parts[page]){
    if(gpMap.has(ch))pending.push(gpMap.get(ch));
    else if((ch==='-'||ch==='.')&&pending.length){
      words.push(pending);
      pending=[];
    }
  }
}
if(pending.length)words.push(pending);
assert.equal(words.length,255);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices));
const original=gp.pages[8].indices;
assert.equal(original.length,255);
const pairs=[[47,240],[48,231],[235,236],[88,179]];
assert.deepEqual(words[88],[12,14]); // GP EO and X
assert.deepEqual(words[179],[14,12]); // GP X and EO, reversed
for(const [i,j] of pairs){
  assert.deepEqual([...words[i]].sort((a,b)=>a-b),
    [...words[j]].sort((a,b)=>a-b));
}
assert.notDeepEqual(words[88],words[179]);
for(const [i,j] of pairs.slice(0,3))assert.deepEqual(words[i],words[j]);
const parikhGroups=new Map();
words.forEach((w,i)=>{
  const k=[...w].sort((a,b)=>a-b).join(',');
  parikhGroups.set(k,[...(parikhGroups.get(k)||[]),i]);
});
assert.equal(parikhGroups.size,251);
assert.deepEqual([...parikhGroups.values()].filter(g=>g.length>1),pairs);
const scrollRed=new Set();
let off=0;
for(let page=3;page<=7;page++){
  for(const p of ink.pages.find(x=>x.page===page).red_spans){
    for(let j=0;j<p.length;j++)scrollRed.add(off+p.start+j);
  }
  off+=gp.pages[page].indices.length;
}
let cursor=0;const redWords=[];
words.forEach((w,i)=>{
  if(w.every((_,j)=>scrollRed.has(cursor+j)))redWords.push(i);
  else assert(w.every((_,j)=>!scrollRed.has(cursor+j)));
  cursor+=w.length;
});
assert.deepEqual(redWords,[0,1,2,22,176,177,178,179,250,251,252,253,254]);
assert(!redWords.includes(88));assert(redWords.includes(179)); // NEW cross-ink anagram
const observed=pairs.map(([i,j])=>mod(original[i]-original[j]));
assert.deepEqual(observed,[8,18,14,25]);
const redFive=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const products=redFive.map(w=>w.reduce((v,x)=>mod(v*x),1));
assert.deepEqual(products,[11,26,8,15,2]);
assert.deepEqual(gp.pages[7].indices.slice(194),redFive.flat());
const tokens=grid.pages.flatMap(p=>p.tokens);
const digits59=grid.alphabet.replace('f','');
const table59=tokens.map(t=>59*digits59.indexOf(t[0])+digits59.indexOf(t[1]));
const table60=grid.bytes;
assert.equal(tokens.length,256);
assert.equal(table59.length,256);
assert(table59.every(v=>v>=0&&v<=251));
/** @param {number} a @param {number} b @returns {number} */
function gf4mul(a,b){
  let v=0;
  for(let k=0;k<2;k++){
    if((b>>>k)&1)v^=a;
    a<<=1;
    if(a&4)a^=7;
  }
  return v;
}
/**
 * @param {number[]} taps
 * @param {number} seed
 * @param {number} seedPosition
 * @returns {number[]}
 */
function orbit(taps,seed,seedPosition){
  const state=[0,0,0,0];state[seedPosition]=seed;
  const addresses=[];
  for(let i=0;i<255;i++){
    addresses.push(state.reduce((v,d)=>4*v+d,0));
    let feedback=0;
    for(let j=0;j<4;j++)feedback^=gf4mul(state[j],taps[j]);
    state.splice(0,4,state[1],state[2],state[3],feedback);
  }
  return addresses;
}
const configurations=[];
const familySignatures=new Set(),familyThree=new Set();
const matchDistribution=Array(5).fill(0);
for(let rotation=0;rotation<5;rotation++){
  const rotated=products.slice(rotation).concat(products.slice(0,rotation));
  for(const reverseTaps of [false,true]){
    for(let seedPosition=0;seedPosition<4;seedPosition++){
      const taps=rotated.slice(0,4).map(v=>v%4);
      if(reverseTaps)taps.reverse();
      const addresses=orbit(taps,rotated[4]%4,seedPosition);
      if(new Set(addresses).size!==255)continue;
      for(const [radix,table] of [['59',table59],['60',table60]]){
        for(const sign of [-1,1]){
          for(const reverseAddress of [false,true]){
            const key=i=>table[
              reverseAddress?255-addresses[i]:addresses[i]];
            const prediction=pairs.map(([i,j])=>mod(sign*(key(j)-key(i))));
            const exact=prediction.filter((x,i)=>x===observed[i]).length;
            matchDistribution[exact]++;
            familySignatures.add(prediction.join(','));
            familyThree.add(prediction.slice(0,3).join(','));
            configurations.push({rotation,reverseTaps,seedPosition,radix,
              sign,reverseAddress,prediction,exact});
          }
        }
      }
    }
  }
}
assert.equal(configurations.length,64);
assert.deepEqual(matchDistribution,[53,8,2,0,1]);
assert.equal(familySignatures.size,64);
assert.equal(familyThree.size,62);
const winners=configurations.filter(x=>x.exact===4);
assert.deepEqual(winners,[{rotation:0,reverseTaps:false,seedPosition:0,
  radix:'59',sign:1,reverseAddress:false,
  prediction:[8,18,14,25],exact:4}]);
const selectedAddresses=orbit(products.slice(0,4).map(x=>x%4),
  products[4]%4,0);
assert.equal(new Set(selectedAddresses).size,255);
const key59=selectedAddresses.map(i=>table59[i]);
const corrected=original.map((v,i)=>mod(v+key59[i]));
assert.deepEqual(pairs.map(([i,j])=>[corrected[i],corrected[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);
// Positive source-native, commutative checksum: all four source Parikh
// collisions must reappear, and each arbitrary GP29 glyph weight is secret.
const secret=Array.from({length:29},(_,i)=>(7+13*i*i)%29);
const planted=words.map((w,i)=>mod(
  w.reduce((s,r)=>s+secret[r],5)-key59[i]));
const recovered=planted.map((c,i)=>mod(c+key59[i]));
for(const [i,j] of pairs)assert.equal(recovered[i],recovered[j]);
assert.deepEqual(recovered,words.map(w=>
  mod(5+w.reduce((s,r)=>s+secret[r],0))));
// Fixed source-histogram null, 8 distinct samples; includes full 64-choice
// scan but does not adjust for earlier discovery of source registration.
let randomState=0x3301a14c;
/** @returns {number} */
function random(){
  randomState^=randomState<<13;
  randomState^=randomState>>>17;
  randomState^=randomState<<5;
  return randomState>>>0;
}
let family=0,exactSignature=0,threeFamily=0;
const iterations=1000000;
for(let trial=0;trial<iterations;trial++){
  const used=new Set(),drawn=[];
  while(drawn.length<8){
    const i=random()%255;
    if(used.has(i))continue;
    used.add(i);
    drawn.push(original[i]);
  }
  const sig=[0,2,4,6].map(j=>mod(drawn[j]-drawn[j+1]));
  if(familySignatures.has(sig.join(',')))family++;
  if(familyThree.has(sig.slice(0,3).join(',')))threeFamily++;
  if(sig.every((v,i)=>v===observed[i]))exactSignature++;
}
assert.deepEqual([family,exactSignature,threeFamily],[78,3,2542]);
console.log(JSON.stringify({originalSourceScrollWords:words.length,
  sourceParikhClasses:parikhGroups.size,allOriginalParikhCollisions:pairs,
  nonidenticalAnagram:[88,179],originalInk88:'black',originalInk179:'red',
  p8CipherDifferences:observed,selectedCorrectedPairs:pairs.map(([i,j])=>
    [corrected[i],corrected[j]]),originalOtherChoices:configurations.length,
  matchDistribution,fourMatchConfigurations:winners,
  shuffleRepetitions:iterations,familywiseFourMatch:family,
  familywiseThreeMatch:threeFamily,
  exactFourSignature:exactSignature,plantedOriginalSourceMatches:255},null,2));
console.log('PASS: unseen original black/red anagram is fourth exact GF4/radix59 checksum equality; familywise shuffle result fixed.');
