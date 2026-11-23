"use strict";
/**
 * Exact all-key original-cipher GP30 predecessor-row pair invariant,
 * 29 independent source-visible large-mark intervals, moving word spaces.
 * Windows Node 22, CommonJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8")
  .replace(/\r\n/g,"\n");
const original=read("resources/liber-primus/lp2-transcription.txt");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.deepEqual(solved.runes,corpus.runes);
const index=new Map(corpus.runes.map((x,i)=>[x,i]));
const stream=[],originalWords=[],pageStarts=new Map(),runeEnds=new Map();
let active=false,word=[],wordCount=0;
for(let k=0;k<55;k++){
  const page=k<50?k:k+1;pageStarts.set(page,stream.length);let r=0;
  const seen=[];
  for(const ch of original.split("%")[k]){
    if(index.has(ch)){
      const x=index.get(ch);stream.push(x);seen.push(x);
      word.push(x);active=true;runeEnds.set(page+":"+(++r),stream.length);
    }else if(ch==="/"||/\s/u.test(ch)){}
    else if(active){
      stream.push(29);originalWords.push(word);word=[];
      active=false;wordCount++;
    }
  }
  assert.deepEqual(seen,corpus.pages.find(p=>p.page===page).indices);
}
if(active){stream.push(29);originalWords.push(word);wordCount++;}
assert.equal(stream.length,15852);
assert.equal(wordCount,2896);
assert.equal(originalWords.flat().length,12956);
const marks=ink.pages.filter(p=>p.page<=55).flatMap(p=>
  (p.large_punctuation||[]).map(m=>{
    const end=m[0]===0?pageStarts.get(p.page):
      runeEnds.get(p.page+":"+m[0]);
    assert.notEqual(end,undefined);
    return end+Number(m[0]>0&&stream[end]===29);
  }));
assert.equal(marks.length,31);
const cuts=[0,...new Set(marks.filter(x=>x>0&&x<stream.length)),stream.length]
  .sort((a,b)=>a-b);
assert.equal(cuts.length,30);
const zoneAt=new Uint8Array(stream.length);
for(let z=0;z+1<cuts.length;z++)zoneAt.fill(z,cuts[z],cuts[z+1]);
const stateGroups=Array.from({length:cuts.length-1},()=>Array.from(
  {length:30},()=>[]));
for(let z=0;z+1<cuts.length;z++)
  for(let i=cuts[z]+1;i<cuts[z+1];i++)
    stateGroups[z][stream[i-1]].push(i);
const choose2=n=>n*(n-1)/2;
const totalPairs=stateGroups.flat().reduce((sum,a)=>sum+choose2(a.length),0);
assert.equal(totalPairs,759325);
/**
 * Exact invariant under every zone-private predecessor-ciphertext row
 * permutation: within a fixed (zone,previous ciphertext), source and
 * plaintext successor equality classes must coincide.
 * @param {number[]} values
 * @returns {number}
 */
function pairs(values){
  let count=0;
  for(const group of stateGroups.flat()){
    const buckets=new Uint16Array(30);
    for(const i of group)buckets[values[i]]++;
    for(const n of buckets)count+=choose2(n);
  }
  return count;
}
const sourcePairs=pairs(stream);
assert.equal(sourcePairs,37484);
let seed=0x33012123;
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
}
const spell=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function native(text){
  const out=[];
  for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){out.push(21);i+=3;}
      else if(w.startsWith("IO",i)){out.push(27);i+=2;}
      else{
        const match=spell.find(x=>w.startsWith(x.s,i));
        assert(match,"missing GP transliteration "+w+" @"+i);
        out.push(match.i);i+=match.s.length;
      }
    }
    out.push(29);
  }
  return out;
}
const p57=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert.deepEqual(native(p57).filter(x=>x<29),corpus.pages[57].indices);
const donors=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const literary=[];
for(const [name,file] of donors){
  const donor=native(read(file)),samples=[];
  for(let t=0;t<128;t++){
    const off=Math.floor(random()*(donor.length-stream.length));
    samples.push(pairs(donor.slice(off,off+stream.length)));
  }
  samples.sort((a,b)=>a-b);
  literary.push({source:name,windows:128,minimum:samples[0],
    median:samples[64],maximum:samples.at(-1),
    atMostOriginal:samples.filter(x=>x<=sourcePairs).length});
}
assert.deepEqual(literary.map(x=>x.atMostOriginal),[0,0,0]);
assert.deepEqual(literary.map(x=>x.minimum),[54569,56597,56025]);
function runeWords(text){
  const result=[];let word=[];
  for(const ch of text){
    if(index.has(ch))word.push(index.get(ch));
    else if(word.length){result.push(word);word=[];}
  }
  if(word.length)result.push(word);
  return result;
}
const pools=[solved.sections.slice(0,5),solved.sections.slice(5)]
  .map(sections=>{
    const p=new Map();
    for(const w of sections.flatMap(s=>runeWords(s.source_text))){
      if(!p.has(w.length))p.set(w.length,[]);
      p.get(w.length).push(w);
    }
    return p;
  });
let nativeSeed=0x3301a211;
function nativeRandom(){
  nativeSeed=(Math.imul(nativeSeed,1664525)+1013904223)>>>0;
  return nativeSeed/4294967296;
}
const authentic=[];
for(const [j,pool] of pools.entries()){
  const samples=[];
  for(let t=0;t<128;t++){
    const P=[];
    for(const word of originalWords){
      const donor=pool.get(word.length);
      P.push(...(donor?donor[Math.floor(nativeRandom()*donor.length)]:
        Array.from({length:word.length},()=>Math.floor(nativeRandom()*29))));
      P.push(29);
    }
    assert.equal(P.length,stream.length);
    samples.push(pairs(P));
  }
  samples.sort((a,b)=>a-b);
  authentic.push({pool:j===0?"solved-training":"solved-holdout",
    windows:128,minimum:samples[0],median:samples[64],
    maximum:samples.at(-1),
    atMostOriginal:samples.filter(x=>x<=sourcePairs).length});
}
assert(authentic.every(x=>x.atMostOriginal===0));
/** Secret 29x30x30 row permutations, independent zone-specific tables.
 * Encrypt authentic-native GP30 plaintext. Every word gap is movable.
 * Check the forward-reencrypt/decrypt equations and equality conservation
 * using the generated ciphertext's actual predecessor state partition.
 */
function makeTables(){
  return Array.from({length:cuts.length-1},()=>Array.from({length:30},()=>{
    const p=Array.from({length:30},(_,i)=>i);
    for(let i=p.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [p[j],p[i]]=[p[i],p[j]];
    }
    return p;
  }));
}
const F=makeTables(),B=F.map(z=>z.map(row=>{
  const inv=Array(30);row.forEach((x,i)=>inv[x]=i);
  return inv;
}));
const P=native(read(donors[0][1])).slice(1234,1234+stream.length);
assert.equal(P.length,stream.length);
const generated=[],recovered=[];
for(let z=0;z<cuts.length-1;z++){
  let previousC=29;
  for(let i=cuts[z];i<cuts[z+1];i++){
    const c=B[z][previousC][P[i]];
    generated.push(c);
    recovered.push(F[z][previousC][c]);
    previousC=c;
  }
}
assert.deepEqual(recovered,P);
const generatedGroups=Array.from({length:cuts.length-1},()=>
  Array.from({length:30},()=>[]));
for(let z=0;z<cuts.length-1;z++)
  for(let i=cuts[z]+1;i<cuts[z+1];i++)
    generatedGroups[z][generated[i-1]].push(i);
function pairCount(groups,values){
  let eq=0;
  for(const g of groups.flat()){
    const f=Array(30).fill(0);
    for(const i of g)f[values[i]]++;
    for(const n of f)eq+=choose2(n);
  }
  return eq;
}
assert.equal(pairCount(generatedGroups,generated),pairCount(generatedGroups,P));
const changedSpaces=generated.filter((x,i)=>(x===29)!==(P[i]===29)).length;
assert(changedSpaces>0);
// Source-shaped original ciphertext positive: the actual 29 visible mark
// locations remain at the printed source-word boundaries. Encrypt/decrypt
// the *original* tape with one private alphabet for every zone/predecessor.
const sourcePlain=[],sourceReplay=[];
for(let z=0;z<cuts.length-1;z++){
  let previousC=29;
  for(let i=cuts[z];i<cuts[z+1];i++){
    const decoded=F[z][previousC][stream[i]];
    sourcePlain.push(decoded);
    const reen=B[z][previousC][decoded];
    sourceReplay.push(reen);
    previousC=reen;
  }
}
assert.deepEqual(sourceReplay,stream);
assert.equal(pairs(sourcePlain),sourcePairs);
const sourceGapMoves=sourcePlain.filter((x,i)=>
  (x===29)!==(stream[i]===29)).length;
assert(sourceGapMoves>0);
console.log(JSON.stringify({
  source:{runes:12956,words:2896,tokens:stream.length,
    marks:marks.length,independentMarkZones:cuts.length-1,
    predecessorRows:(cuts.length-1)*30,
    eligiblePairDenominator:totalPairs,
    invariantPairs:sourcePairs,
    invariantRate:sourcePairs/totalPairs},
  nativeControls:{literary,authentic,
    all640ComparisonsAboveOriginal:
      literary.every(x=>x.atMostOriginal===0)&&authentic.every(x=>x.atMostOriginal===0)},
  positive:{entireOriginalLength:true,exactForwardInverse:true,
    repeatedCipherPairEqInvariant:true,
    changedSpaceStatuses:changedSpaces,
    sourceOriginalTapeRoundTrips:true,
    sourceOriginalChangedSpaceStatuses:sourceGapMoves},
  decision:"conditional nonprose exclusion of every 29-zone shared-within-zone predecessor-ciphertext GP30 secret-row permutation; no decoded LP2 text or key"
},null,2));
