"use strict";
/**
 * Exact GP30 previous-ciphertext S-box word-space theorem.
 * Node22, CommonJS, Windows-safe, no packages.
 * All 30 independent rows of 30! private permutations are covered.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r\n/g,"\n");
const text=read("resources/liber-primus/lp2-transcription.txt");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes=new Map(gp.runes.map((x,i)=>[x,i]));
let alive=false,words=0;
const pages=text.split("%").slice(0,55).map((page,p)=>{
  const t=[];
  for(const ch of page){
    if(runes.has(ch)){t.push(runes.get(ch));alive=true;}
    else if(ch==="/"||/\s/u.test(ch)){}
    else if(alive){t.push(29);words++;alive=false;}
  }
  assert.deepEqual(t.filter(x=>x<29),gp.pages.find(q=>q.page===(p<50?p:p+1)).indices);
  return {page:p<50?p:p+1,t};
});
if(alive){pages.at(-1).t.push(29);words++;}
const C=pages.flatMap(p=>p.t);
assert.equal(C.length,15852);
assert.equal(words,2896);
assert.equal(C.filter(x=>x<29).length,12956);
assert.equal(C.filter(x=>x===29).length,2896);
assert(C[0]<29&&C.at(-1)===29);
const N=Array.from({length:30},()=>Array(30).fill(0));
const triples=Array.from({length:29},()=>Array(29).fill(0));
for(let i=1;i<C.length;i++)N[C[i-1]][C[i]]++;
for(let i=1;i+1<C.length;i++)
  if(C[i]===29&&C[i-1]<29&&C[i+1]<29)
    triples[C[i-1]][C[i+1]]++;
assert.equal(N.reduce((a,row)=>a+row[29],0),2896);
assert.equal(N[29][29],0);
const G=Math.max(...N[29].slice(0,29));
const loss=Array.from({length:29},(_,r)=>({
  r,count:N[r][29],minimum:N[r][29]-Math.max(...N[r].slice(0,29))
})).sort((a,b)=>a.minimum-b.minimum);
const prevVariety=Array.from({length:29},(_,s)=>
  triples.filter(row=>row[s]>0).length);
assert.equal(G,117);
assert.deepEqual(loss.slice(0,3).map(x=>x.minimum),[56,60,60]);
assert.equal(Math.min(...prevVariety),25);
assert(loss.slice(0,3).reduce((a,x)=>a+x.minimum,0)>G);

/**
 * Every arbitrary secret row permutation has ONE source token that maps
 * to plaintext SPACE. Conditional equality of output word count permits
 * at most TWO changed rune-predecessor rows, since 56+60+60>117.
 * However for every source rune s following a source SPACE, there are
 * at least 25 source triples (r,SPACE,s) with distinct r. To avoid an
 * empty plaintext word, all those 25 r would have to suppress source
 * SPACE on the preceding position, requiring >=25 changed rows.
 * Contradiction; the predecessor-SPACE row must keep SPACE as selector.
 * Every other changed row then reduces word count. Thus all selectors
 * are original SPACE and all original word boundaries are immovable.
 */
const alters=[];
for(let r=0;r<29;r++)
  for(let s=0;s<29;s++)
    alters.push({r,s,d:N[r][29]-N[r][s],lost:N[r][29]});
const candidates=[];
for(let s=0;s<30;s++){
  const gain=N[29][s];
  if(gain===0)candidates.push({s,swaps:[],lost:0});
  for(const a of alters)
    if(a.d===gain)candidates.push({s,swaps:[a],lost:a.lost});
  for(let i=0;i<alters.length;i++)
    for(let j=i+1;j<alters.length;j++){
      const a=alters[i],b=alters[j];
      if(a.r!==b.r&&a.d+b.d===gain)
        candidates.push({s,swaps:[a,b],lost:a.lost+b.lost});
    }
}
assert.equal(candidates.length,400);
assert.equal(Math.max(...candidates.map(x=>x.lost)),158);
let emptyWord=0,nonempty=0;
for(const c of candidates){
  const select=Array(30).fill(29);
  select[29]=c.s;
  for(const a of c.swaps)select[a.r]=a.s;
  let previous=false,hasEmpty=false,count=0,changed=0;
  for(let i=0;i<C.length;i++){
    const isSpace=i>0&&C[i]===select[C[i-1]];
    if(isSpace){count++;if(previous)hasEmpty=true;}
    if(isSpace!==(C[i]===29))changed++;
    previous=isSpace;
  }
  assert.equal(count,2896);
  if(hasEmpty)emptyWord++;
  else{nonempty++;assert.equal(changed,0);}
}
assert.equal(emptyWord,399);
assert.equal(nonempty,1);
// Upper capacity even if output word count is allowed to change.
const U=N.reduce((a,row)=>a+Math.max(...row),0);
assert.equal(U,3013);
/*
 * Stronger bound independent of ANY plaintext word-count / nonempty-word
 * premise: each secret bijection assigns distinct source symbols to output
 * SPACE and any ONE output rune. For each previous-source state, their
 * combined observed count is at most the sum of its two largest entries.
 */
const maximumSpacePlusAnyRune=1+N.reduce((sum,row)=>
  sum+row.slice().sort((a,b)=>b-a).slice(0,2)
    .reduce((a,b)=>a+b,0),0);
assert.equal(maximumSpacePlusAnyRune,3707);
// In the REAL output-grammar case, adjacent plaintext spaces are forbidden.
// If the previous-SPACE row creates a gap from rune s, every distinct
// predecessor r in (r,SPACE,s) MUST suppress original SPACE. All those
// changed rune rows lose at least their row-specific minimum deficit.
const nonemptyWithNewAfterSpace=Array.from({length:29},(_,s)=>{
  const required=Array.from({length:29},(_,r)=>r)
    .filter(r=>triples[r][s]>0);
  const minLoss=required.reduce((n,r)=>n+
    (N[r][29]-Math.max(...N[r].slice(0,29))),0);
  return {s,requiredRows:required.length,
    optimisticMaxSpaces:2896+N[29][s]-minLoss};
});
const maxIfNewAfterSpace=Math.max(
  ...nonemptyWithNewAfterSpace.map(x=>x.optimisticMaxSpaces));
assert.equal(maxIfNewAfterSpace,991);
assert(nonemptyWithNewAfterSpace.every(x=>x.requiredRows>=25));
/*
 * Therefore every VALID nonempty-word decoded stream falls into two:
 *  (a) previous-SPACE row keeps SPACE: W<=2896, or
 *  (b) previous-SPACE row creates new gaps: W<=991.
 * Global all-key maximum for valid word outputs is 2896 (identity attains).
 * This no-additional-words theorem does NOT assume equal word count.
 */
const legalNonemptyUpperBound=2896;
const sMax=Array(30).fill(29);
sMax[29]=N[29].indexOf(G);
assert.equal(C.slice(1).filter((x,i)=>x===sMax[C[i]]).length,U);
// Construct a complete bijective first-order cipher and invert it on
// every original GP30 symbol. Its rune identities change; gaps remain.
const forward=Array.from({length:30},(_,r)=>
  Array.from({length:30},(_,x)=>x===29?29:(x+r+1)%29));
const backward=forward.map(row=>{
  const x=Array(30);
  row.forEach((y,i)=>x[y]=i);
  return x;
});
let prev=29;
const P=C.map(c=>{const p=forward[prev][c];prev=c;return p;});
prev=29;
assert.deepEqual(P.map(p=>{const c=backward[prev][p];prev=c;return c;}),C);
assert.deepEqual(P.map(x=>x===29),C.map(x=>x===29));
assert(P.some((x,i)=>x!==C[i]&&C[i]<29));

function maxSpace(chunks){
  const n=Array.from({length:30},()=>Array(30).fill(0));
  for(const chunk of chunks)
    for(let i=1;i<chunk.length;i++)n[chunk[i-1]][chunk[i]]++;
  return n.reduce((sum,row)=>sum+Math.max(...row),0);
}
const privateByPage=pages.reduce((n,p)=>n+maxSpace([p.t]),0);
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const privateByChapter=ranges.reduce((n,[a,b])=>
  n+maxSpace([pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.t)]),0);
assert.equal(privateByPage,3795);
assert.equal(privateByChapter,3077);
/** Exact two-output-symbol capacity when private predecessor keys restart
 * at each authentic source chapter (or physical page). The one first
 * token in each independent unit is granted completely free output.
 */
function maxTwoSymbols(chunks) {
  const mat=Array.from({length:30},()=>Array(30).fill(0));
  for(const chunk of chunks)
    for(let i=1;i<chunk.length;i++)mat[chunk[i-1]][chunk[i]]++;
  return chunks.length + mat.reduce((sum,row)=>{
    const sorted=row.slice().sort((a,b)=>b-a);
    return sum+sorted[0]+sorted[1];
  },0);
}
const chapterTwoSymbolRows=ranges.map(([a,b])=>{
  const unit=pages.filter(p=>p.page>=a&&p.page<=b)
    .flatMap(p=>p.t);
  return {chapter:[a,b],length:unit.length,
    capacity:maxTwoSymbols([unit])};
});
const chapterPrivateTwoSymbol=chapterTwoSymbolRows
  .reduce((sum,c)=>sum+c.capacity,0);
const pagePrivateTwoSymbol=pages.reduce((sum,p)=>
  sum+maxTwoSymbols([p.t]),0);
assert.equal(chapterPrivateTwoSymbol,4295);
assert.equal(pagePrivateTwoSymbol,6160);

// Independent solved-LP2 author control checks GP30 spelling.
const translit=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(source){
  const out=[];
  for(let w of source.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/[KQ]/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){out.push(21);i+=3;}
      else if(w.startsWith("IO",i)){out.push(27);i+=2;}
      else{const q=translit.find(q=>w.startsWith(q.s,i));
        assert(q);out.push(q.i);i+=q.s.length;}
    }
    out.push(29);
  }
  return out;
}
const p57=read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1];
assert.deepEqual(native(p57).filter(x=>x<29),gp.pages[57].indices);
let seed=0x33012026;
function random(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return(seed>>>0)/4294967296;}
const sources=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
];
const controls=[];
for(const [name,file] of sources){
  const donor=native(read(file)),values=[],joint=[];
  for(let z=0;z<128;z++){
    const offset=Math.floor(random()*(donor.length-C.length));
    const counts=Array(30).fill(0);
    for(const symbol of donor.slice(offset,offset+C.length))
      counts[symbol]++;
    values.push(counts[29]);
    joint.push(counts[29]+Math.max(...counts.slice(0,29)));
  }
  values.sort((a,b)=>a-b);joint.sort((a,b)=>a-b);
  controls.push({name,donorTokens:donor.length,
    min:values[0],median:values[64],max:values.at(-1),
    beyondGlobal:values.filter(x=>x>U).length,
    beyondAnyNonemptyGlobal:values.filter(x=>x>legalNonemptyUpperBound).length,
    beyondChapter:values.filter(x=>x>privateByChapter).length,
    spacePlusTopRune:{minimum:joint[0],median:joint[64],
      maximum:joint.at(-1),
      impossibleUnderAnyRowKey:
        joint.filter(x=>x>maximumSpacePlusAnyRune).length,
      impossibleUnderAnyChapterPrivateKey:
        joint.filter(x=>x>chapterPrivateTwoSymbol).length}});
}
assert.deepEqual(controls.map(x=>x.beyondGlobal),[114,128,125]);
assert.deepEqual(controls.map(x=>x.beyondAnyNonemptyGlobal),[121,128,127]);
assert.deepEqual(controls.map(x=>x.beyondChapter),[109,128,93]);
assert.deepEqual(controls.map(x=>x.spacePlusTopRune.minimum),
  [4364,4620,4472]);
assert(controls.every(x=>x.spacePlusTopRune.impossibleUnderAnyRowKey===128));
assert(controls.every(x=>x.spacePlusTopRune.impossibleUnderAnyChapterPrivateKey===128));

/** Author-authentic solved-Cicada GP29 words, exact original word lengths.
 * Rare absent long lengths get uniformly random rune fillers, deliberately
 * reducing the native control's recurrent-symbol advantage.
 */
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert.deepEqual(solved.runes,gp.runes);
function runeWords(input,original=false){
  const result=[];let word=[];
  for(const ch of input){
    if(runes.has(ch))word.push(runes.get(ch));
    else if(original&&(ch==="%"||ch==="/"||/\s/u.test(ch))){}
    else if(word.length){result.push(word);word=[];}
  }
  if(word.length)result.push(word);
  return result;
}
const sourceWords=runeWords(text.split("%").slice(0,55).join("%"),true);
assert.equal(sourceWords.length,2896);
const authorPools=[solved.sections.slice(0,5),solved.sections.slice(5)]
  .map(sections=>{
    const m=new Map();
    for(const word of sections.flatMap(s=>runeWords(s.source_text))){
      if(!m.has(word.length))m.set(word.length,[]);
      m.get(word.length).push(word);
    }
    return m;
  });
let nativeSeed=0x3301a211;
function nativeRandom(){
  nativeSeed=(Math.imul(nativeSeed,1664525)+1013904223)>>>0;
  return nativeSeed/4294967296;
}
const creatorAuthentic=[];
for(const [poolId,pool] of authorPools.entries()){
  const values=[];
  for(let z=0;z<128;z++){
    const freq=Array(29).fill(0);
    for(const original of sourceWords){
      const donor=pool.get(original.length);
      const word=donor?donor[Math.floor(nativeRandom()*donor.length)]:
        Array.from({length:original.length},()=>
          Math.floor(nativeRandom()*29));
      for(const rune of word)freq[rune]++;
    }
    values.push(2896+Math.max(...freq));
  }
  values.sort((a,b)=>a-b);
  creatorAuthentic.push({pool:poolId===0?"training-authentic":
    "heldout-authentic",windows:128,
    minJoint:values[0],medianJoint:values[64],maxJoint:values.at(-1),
    impossibleUnderAnyRowKey:
      values.filter(x=>x>maximumSpacePlusAnyRune).length,
    impossibleUnderAnyChapterPrivateKey:
      values.filter(x=>x>chapterPrivateTwoSymbol).length});
}
assert.deepEqual(creatorAuthentic.map(x=>x.minJoint),[4383,4471]);
assert(creatorAuthentic.every(x=>x.impossibleUnderAnyRowKey===128));
assert(creatorAuthentic.every(x=>x.impossibleUnderAnyChapterPrivateKey===128));
console.log(JSON.stringify({
  source:{runes:12956,words,gp30:C.length,pages:pages.length},
  allKeyGlobal:{minRowDeficits:loss.slice(0,3),maxAfterSpaceGain:G,
    minDistinctTriplePredecessors:Math.min(...prevVariety),
    totalEqualCountSelectorCases:candidates.length,
    illegalEmptyWords:emptyWord,legalSelectors:nonempty,
    legalSelectorsMovingAnyWordBoundary:0,
    maxMovedSourceSpacesIfAllowEmptyWords:158,
    maximumPlaintextSpacesAllowingEmptyWords:U,
    maximumPlaintextSpacesIfAllWordsNonempty:legalNonemptyUpperBound,
    maximumSpacePlusAnyRuneUnderAllPrivateKeys:maximumSpacePlusAnyRune,
    maximumSpacesIfChangingAfterOriginalSpace:maxIfNewAfterSpace},
  relaxations:{chapterPrivateMax:privateByChapter,pagePrivateMax:privateByPage,
    chapterPrivateTwoSymbol,chapterTwoSymbolRows,pagePrivateTwoSymbol},
  positive:{fullOriginalTokensReencrypt:true,
    changedRunePositions:P.filter((x,i)=>x!==C[i]).length,
    allWordBoundariesPreserved:true},
  controls,creatorAuthentic,claim:"conditional exact all-secret theorem; no plaintext or key"
},null,2));
