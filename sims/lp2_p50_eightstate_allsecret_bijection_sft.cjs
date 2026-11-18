'use strict';
/**
 * Exactly optimize decoded GP29 coincidence over every independently secret
 * 29! alphabet bijection for each source-defined (previous ciphertext rune,
 * 3-bit byte-table state) pair, 29*8=232 possible receiver contexts.
 *
 * For each context, sort all 29 observed ciphertext-rune histogram counts in
 * descending order. Aligning every sorted histogram across contexts achieves
 * the global optimum via pairwise rearrangement inequality, with no key fit.
 *
 * Positive plant: encode source-native 12956-rune English using unknown
 * per-context affine secret GP29 bijections with table state updated from
 * previous observed ciphertext; decode it exactly and verify the envelope.
 *
 * Windows Node.js 22, CommonJS, no extra packages, no network/file mutation.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json')).bytes;
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const pages=gp.pages.filter(x=>x.page<=55&&x.indices.length);
const N=pages.reduce((n,p)=>n+p.indices.length,0);
assert.equal(N,12956);
assert.equal(table.length,256);

/**
 * @param {0|1} packing
 * @param {number} state
 * @param {number} previousC
 * @returns {number}
 */
function next(packing,state,previousC){
  const x=table[8*previousC+state];
  return packing===0?x>>>5:x&7;
}
/** @param {number[]} runes @returns {number} */
function coincidence(runes){
  const h=new Int32Array(29);
  for(const r of runes){assert(r>=0&&r<29);h[r]++;}
  return h.reduce((s,n)=>s+n*(n-1),0)/(runes.length*(runes.length-1));
}
/**
 * @param {number[][]} pageRunes
 * @param {0|1} packing
 * @param {number} initialState
 * @param {boolean} resetPage
 * @param {boolean} fullContext
 * @returns {number}
 */
function bound(pageRunes,packing,initialState,resetPage,fullContext){
  const counts=Array.from({length:fullContext?232:8},()=>new Int32Array(29));
  let state=initialState,previousC=0,n=0;
  for(const runes of pageRunes){
    if(resetPage){state=initialState;previousC=0;}
    for(const c of runes){
      const context=fullContext?8*previousC+state:state;
      counts[context][c]++;n++;
      state=next(packing,state,previousC);
      previousC=c;
    }
  }
  assert.equal(n,N);
  const max=new Int32Array(29);
  for(const h of counts){
    const sorted=[...h].sort((a,b)=>b-a);
    for(let j=0;j<29;j++)max[j]+=sorted[j];
  }
  return max.reduce((s,v)=>s+v*(v-1),0)/(N*(N-1));
}
/** @param {string} corpus Full untouched natural-language reference. */
function minNativeWindow(corpus){
  const p=encodeSourceNativeGP(corpus);
  assert(p.length>=N);
  const histogram=new Int32Array(29);
  for(let i=0;i<N;i++)histogram[p[i]]++;
  let collisions=histogram.reduce((s,n)=>s+n*(n-1),0);
  let minimum=collisions,at=0;
  for(let start=1;start<=p.length-N;start++){
    const leaving=p[start-1],entering=p[start+N-1];
    // Counts updated exactly, O(1) per 12956-rune window shift.
    collisions-=2*(--histogram[leaving]);
    collisions+=2*(histogram[entering]++);
    if(collisions<minimum){minimum=collisions;at=start;}
  }
  assert.equal(histogram.reduce((s,n)=>s+n,0),N);
  return {runes:p.length,windows:p.length-N+1,minIoC:minimum/(N*(N-1)),
    minOrderedPairs:minimum,minStart:at};
}
const textSources=[
 ['gibran','resources/control/gibran_prophet_58585.txt'],
 ['shakespeare','resources/control/shakespeare_first300k.txt'],
 ['emerson','resources/control/emerson_essays_2944.txt']
];
const control=textSources.map(([name,p])=>({name,...minNativeWindow(read(p))}));
const nativeMin=Math.min(...control.map(x=>x.minIoC));
let outcomes=[],max=0;
for(const packing of [0,1])
 for(const resetPage of [false,true])
  for(let initialState=0;initialState<8;initialState++){
    const full=bound(pages.map(p=>p.indices),packing,initialState,resetPage,true);
    const stateOnly=bound(pages.map(p=>p.indices),packing,initialState,resetPage,false);
    assert(full>=stateOnly-1e-12);
    outcomes.push({packing,resetPage,initialState,fullIoC:full,stateOnlyIoC:stateOnly});
    max=Math.max(max,full);
  }
assert.equal(outcomes.length,32);
assert(max<nativeMin,'Unanticipated source-consistent all-secret text capacity');
/** @param {number[]} plain @param {0|1} packing */
function encrypt(plain,packing){
  let previousC=0,state=0;
  const out=[];
  for(const p of plain){
    const multiplier=1+((previousC+3*state)%28);
    const add=(7*previousC+5*state)%29;
    const c=(p*multiplier+add)%29;
    out.push(c);
    state=next(packing,state,previousC);
    previousC=c;
  }
  return out;
}
/** @param {number[]} cipher @param {0|1} packing */
function decrypt(cipher,packing){
  let previousC=0,state=0;
  const inverseA=new Array(29).fill(0);
  for(let a=1;a<29;a++)for(let b=1;b<29;b++)if((a*b)%29===1)inverseA[a]=b;
  const out=[];
  for(const c of cipher){
    const multiplier=1+((previousC+3*state)%28);
    const add=(7*previousC+5*state)%29;
    const p=((c-add+29)*inverseA[multiplier])%29;
    out.push(p);
    state=next(packing,state,previousC);
    previousC=c;
  }
  return out;
}
const plant=encodeSourceNativeGP(read('resources/control/gibran_prophet_58585.txt'))
  .slice(0,N);
assert.equal(plant.length,N);
const positive=[];
for(const packing of [0,1]){
 const cipher=encrypt(plant,packing);
 assert.deepEqual(decrypt(cipher,packing),plant);
 const boundPositive=bound([cipher],packing,0,false,true);
 assert(boundPositive>=coincidence(plant)-1e-12);
 positive.push({packing,originalNativeIoC:coincidence(plant),
   maxAllSecretIoC:boundPositive,recovered:N});
}
outcomes.sort((a,b)=>b.fullIoC-a.fullIoC);
const stateOnlyMax=Math.max(...outcomes.map(x=>x.stateOnlyIoC));
console.log('SOURCE '+JSON.stringify({originalRunes:N,sourceTable:'32x8 256 original bytes',
  contextsPerModel:232,models:outcomes.length,
  nativeReference:control}));
console.log('ALL_SECRET_EXACT '+JSON.stringify({maxFullContextIoC:max,
  maxEightStateIoC:stateOnlyMax,
  best:outcomes.slice(0,4),minimumReferenceIoC:nativeMin,
  minimumMissingOrderedEqualPairs:Math.ceil((nativeMin-max)*N*(N-1)-1e-7),
  mathematicalMethod:'sort 29 ciphertext label counts per observed context; align ranks (pairwise rearrangement), exact 29!^232 upper optimum'}));
console.log('POSITIVE '+JSON.stringify(positive));
console.log('DECISION: both byte field packings, page/book reset, all initial states and all secret stationary GP29 alphabets per observed prior-cipher-rune and state are insufficient to represent every pinned GP-native English control window. This excludes only the specified observable table-state direct 29-symbol receiver, without claims about unseen adaptive keys or altered registers.');


// The 2016 source phrase "words are the map" licenses testing visible word
// starts as one additional context bit; it does not specify any unknown keys.
const wordFlags=[];
const runeMap=new Map(gp.runes.map((r,i)=>[r,i]));
let first=true;
for(const ch of read('resources/liber-primus/lp2-transcription.txt')){
  const index=runeMap.get(ch);
  if(index!==undefined){
    if(wordFlags.length===N)break;
    wordFlags.push(Number(first));
    first=false;
  }else if('-.&§'.includes(ch))first=true;
}
assert.equal(wordFlags.length,N);
assert.equal(wordFlags.reduce((sum,v)=>sum+v,0),2896);
function wordBitBound(packing,initialState,resetPage){
  const h=Array.from({length:464},()=>new Int32Array(29));
  let state=initialState,prev=0,k=0;
  for(const page of pages){
    if(resetPage){state=initialState;prev=0;}
    for(const c of page.indices){
      h[2*(8*prev+state)+wordFlags[k++]][c]++;
      state=next(packing,state,prev);
      prev=c;
    }
  }
  assert.equal(k,N);
  const total=new Int32Array(29);
  for(const hist of h){
    const sorted=[...hist].sort((a,b)=>b-a);
    for(let j=0;j<29;j++)total[j]+=sorted[j];
  }
  return total.reduce((s,n)=>s+n*(n-1),0)/(N*(N-1));
}
const wordModels=[];
for(const packing of [0,1])
  for(const resetPage of [false,true])
    for(let initialState=0;initialState<8;initialState++)
      wordModels.push({packing,resetPage,initialState,
        ceiling:wordBitBound(packing,initialState,resetPage)});
assert.equal(wordModels.length,32);
wordModels.sort((a,b)=>b.ceiling-a.ceiling);
assert(wordModels.every(x=>x.ceiling>=nativeMin));
console.log('VISIBLE_WORD_BOUNDARY_RIVAL '+JSON.stringify({
  printedWords:2896,sourceRunes:N,models:wordModels.length,
  independentlySecretAlphabets:464,
  bestCeiling:wordModels[0].ceiling,
  worstCeiling:wordModels.at(-1).ceiling,
  sourceSelection:'real printed word starts in original transcript, not line/page wraps',
  interpretation:'One extra source-visible word-initial bit lifts attainable collision above native GP29 English; key remains unknown and no plaintext has been recovered.'
}));
