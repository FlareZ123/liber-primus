"use strict";

/**
 * LP2 ALL-BOOK physical-page same keystream reuse challenge.
 *
 * Exhaust 55 original rune-bearing unsolved pages and all C(55,2)=1485
 * zero-offset black-body page-pair clocks. Source-typed first red headings
 * are excluded using the original ink metadata. Keep exact original
 * physical printed words, punctuation and the first/last fragment caution.
 *
 * For every pair, independently reject source-native English assignments
 * under BOTH secret arbitrary additive GP29 and secret arbitrary 5-bit XOR
 * keystreams when an original overlapping whole-word constraint has
 * no lexical support. Propagate arc consistency on all local survivors.
 *
 * Windows11 Node22 CommonJS SFT:
 * node sims/lp2_allbook_page_reset_native_word_csp_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript=read("resources/lp2-transcription.txt").split("%").slice(0,55);
const textSources=[
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
const vocabulary=new Set(textSources.flatMap(name=>
  read(name).toUpperCase().match(/[A-Z]+/g)||[]));
const gp=new Map(corpus.translit.map((r,i)=>[r,i]));
const rune=new Map(corpus.runes.map((r,i)=>[r,i]));
const digraphs=["TH","EO","NG","OE","AE","IA","EA"];
/** @param {string} word @returns {number[]} */
function encode(word){
  const out=[];
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S")
    .replace(/ING/g,"NG").replace(/IO/g,"IA");
  for(let i=0;i<word.length;){
    const t=digraphs.find(t=>word.startsWith(t,i))||word[i];
    const index=gp.get(t);
    if(index===undefined)return[];
    out.push(index);
    i+=t.length;
  }
  return out;
}
const byLength=Array.from({length:15},()=>[]);
const names=new Map(),seen=Array.from({length:15},()=>new Set());
for(const word of vocabulary){
  const v=encode(word),n=v.length;
  if(n<1||n>14)continue;
  const k=v.join(",");
  if(!names.has(k))names.set(k,[]);
  names.get(k).push(word);
  if(!seen[n].has(k)){seen[n].add(k);byLength[n].push(v);}
}
assert.equal(vocabulary.size,32196);
assert.deepEqual(byLength.slice(1).map(x=>x.length),
  [26,194,806,2285,3954,5174,5286,4792,3770,2652,1607,867,422,172]);

/** @param {number} id */
function page(id){
  const raw=transcript[id>=51?id-1:id];
  const skip=ink.pages.find(x=>x.page===id)?.red_spans
    ?.find(x=>x.start===0)?.length||0;
  let index=0,first=0,word=[];
  const words=[];
  function finish(){
    if(word.length){
      words.push({start:first,end:index,length:word.length,values:word});
      word=[];
    }
  }
  for(const ch of raw){
    const v=rune.get(ch);
    if(v!==undefined){
      if(word.length===0)first=index;
      word.push(v);index++;
    }else if(ch==="/"||/\s/u.test(ch)){
      // Original linebreaks and page-end slash are never a word split.
    }else finish();
  }
  finish();
  assert.equal(index,corpus.pages[id].indices.length);
  const complete=words.filter(w=>w.start>=skip).map(w=>({
    ...w,start:w.start-skip,end:w.end-skip
  })).slice(1,-1);
  return {
    id,skip,length:index-skip,complete,
    cipher:corpus.pages[id].indices.slice(skip)
  };
}
const pages=corpus.pages.filter(x=>x.page>=0&&x.page<=55&&x.indices.length)
  .map(x=>page(x.page));
assert.equal(pages.length,55);
assert(!pages.some(x=>x.id===50));

/** @param {number} a @param {number} b
 * @param {"add"|"xor"} mode */
function delta(a,b,mode){
  return mode==="add"?(a-b+29)%29:(a^b);
}
/**
 * Every overlap couples one source-native full word on each page.
 * @param {object} a @param {object} b @param {"add"|"xor"} mode
 * @param {number[]} [cipherA] @param {number[]} [cipherB]
 */
function overlapEdges(a,b,mode,cipherA=a.cipher,cipherB=b.cipher){
  const output=[];
  for(const wa of a.complete)for(const wb of b.complete){
    const start=Math.max(wa.start,wb.start),end=Math.min(wa.end,wb.end);
    if(end<=start)continue;
    const differences=[];
    for(let i=start;i<end;i++)
      differences.push(delta(cipherA[i],cipherB[i],mode));
    output.push({a:wa,b:wb,start,end,length:end-start,differences});
  }
  output.sort((a,b)=>b.length-a.length);
  return output;
}
const sectionCache=new Map();
/** @param {number} length @param {number} start @param {number} size */
function allowedPieces(length,start,size){
  const id=[length,start,size].join("|");
  let cached=sectionCache.get(id);
  if(cached)return cached;
  cached=new Set(byLength[length].map(x=>x.slice(start,start+size).join(",")));
  sectionCache.set(id,cached);
  return cached;
}
/** Key-free necessary original source-native word-overlap constraint. */
function locallyPossible(edge,mode){
  const {a,b,start,length,differences}=edge;
  const offA=start-a.start,offB=start-b.start;
  const accepted=allowedPieces(b.length,offB,length);
  for(const x of byLength[a.length]){
    const need=[];
    for(let i=0;i<length;i++){
      const rune=x[offA+i];
      need.push(mode==="add"?(rune-differences[i]+29)%29:
        rune^differences[i]);
    }
    if(accepted.has(need.join(",")))return true;
  }
  return false;
}
/** Enforce ALL original word-overlap constraints on full dictionary domains. */
function propagate(left,right,edges,mode){
  const as=left.complete.map((w,i)=>({...w,id:"A"+i,
    domain:byLength[w.length].slice()}));
  const bs=right.complete.map((w,i)=>({...w,id:"B"+i,
    domain:byLength[w.length].slice()}));
  const mapA=new Map(left.complete.map((w,i)=>[w,as[i]]));
  const mapB=new Map(right.complete.map((w,i)=>[w,bs[i]]));
  const all=edges.map(e=>({...e,a:mapA.get(e.a),b:mapB.get(e.b)}));
  let rounds=0,revisions=0,contradiction=null;
  while(rounds<30){
    rounds++;
    let changed=false;
    for(const e of all){
      for(const side of ["a","b"]){
        const own=e[side],other=e[side==="a"?"b":"a"],
          left=e.start-own.start,right=e.start-other.start;
        const values=new Set(other.domain.map(w=>
          w.slice(right,right+e.length).join(",")));
        const old=own.domain.length;
        own.domain=own.domain.filter(w=>{
          const need=[];
          for(let i=0;i<e.length;i++)
            need.push(mode==="xor"?(w[left+i]^e.differences[i]):
              (w[left+i]+(side==="a"?-e.differences[i]:
                e.differences[i])+29)%29);
          return values.has(need.join(","));
        });
        if(own.domain.length!==old){revisions++;changed=true;}
        if(own.domain.length===0){
          contradiction={start:e.start,length:e.length,side,
            ownWordLength:own.length,otherWordLength:other.length};
          break;
        }
      }
      if(contradiction)break;
    }
    if(contradiction||!changed)break;
  }
  const forced=[...as.map(w=>({...w,page:left.id})),
    ...bs.map(w=>({...w,page:right.id}))]
    .filter(w=>w.domain.length===1)
    .map(w=>({page:w.page,start:w.start,length:w.length,
      plaintext:names.get(w.domain[0].join(","))?.slice(0,5)||[]}));
  return {rounds,revisions,contradiction,forced};
}
const analyses={},allResults={};
let totalPairs=0;
for(const mode of ["add","xor"]){
  const locallyViable=[];
  let examined=0,failed=0;
  for(let i=0;i<pages.length;i++)for(let j=i+1;j<pages.length;j++){
    const left=pages[i],right=pages[j],edges=
      overlapEdges(left,right,mode);
    totalPairs++;
    let blocked=null;
    for(const e of edges){
      examined++;
      if(!locallyPossible(e,mode)){
        blocked={start:e.start,length:e.length,
          wordLengths:[e.a.length,e.b.length]};
        failed++;
        break;
      }
    }
    if(!blocked)locallyViable.push({left,right,edges});
  }
  const survivors=locallyViable.map(x=>({
    pair:[x.left.id,x.right.id],overlapEdges:x.edges.length,
    maxOverlap:x.edges[0]?.length||0,
    arc:propagate(x.left,x.right,x.edges,mode)
  }));
  analyses[mode]={
    originalPairs:pages.length*(pages.length-1)/2,
    totalLocalWordChecks:examined,
    locallyRejected:failed,
    locallyViable:locallyViable.length,
    postArcViable:survivors.filter(x=>!x.arc.contradiction).length
  };
  allResults[mode]=survivors;
}
assert.equal(totalPairs,2970);
assert.deepEqual(analyses,{
  add:{originalPairs:1485,totalLocalWordChecks:1948,
    locallyRejected:1468,locallyViable:17,postArcViable:4},
  xor:{originalPairs:1485,totalLocalWordChecks:1881,
    locallyRejected:1472,locallyViable:13,postArcViable:0}
});
assert.deepEqual(allResults.add.filter(x=>!x.arc.contradiction).map(x=>x.pair),
  [[5,49],[10,49],[46,49],[48,49]]);
assert.deepEqual(allResults.xor.filter(x=>!x.arc.contradiction),[]);

// True original-shaped, real native-word positive using independent source
// words in both printed source pages. Keep the original word-layout geometry.
const samples=[0,14,20,31,40,53].map(x=>pages.find(p=>p.id===x));
function sourcePlain(page){
  const p=Array(page.length).fill(0);
  for(const [i,w]of page.complete.entries())
    p.splice(w.start,w.length,...byLength[w.length][i%byLength[w.length].length]);
  return p;
}
let positivePairs=0;
for(const [pa,pb] of [[0,40],[14,20],[31,53]]){
  const a=pages.find(p=>p.id===pa),b=pages.find(p=>p.id===pb);
  const aPlain=sourcePlain(a),bPlain=sourcePlain(b);
  for(const mode of ["add","xor"]){
    const max=Math.max(aPlain.length,bPlain.length);
    const shared=Array.from({length:max},(_,i)=>{
      if(mode==="add")return(17*i+3)%29;
      const x=i<aPlain.length?aPlain[i]:0,
        y=i<bPlain.length?bPlain[i]:0;
      return i%2===0&&x!==28&&y!==28?1:0;
    });
    const ciphertext=(p)=>p.map((x,i)=>
      mode==="add"?(x+shared[i])%29:(x^shared[i]));
    const ca=ciphertext(aPlain),cb=ciphertext(bPlain);
    assert(ca.every(x=>x<29));
    assert(cb.every(x=>x<29));
    const overlap=overlapEdges(a,b,mode,ca,cb);
    assert(overlap.length>10);
    assert(overlap.every(x=>locallyPossible(x,mode)));
    assert.equal(propagate(a,b,overlap,mode).contradiction,null);
    positivePairs++;
  }
}
assert.equal(positivePairs,6);

console.log(JSON.stringify({
  objective:"All 55 original unsolved runic page-local starts: additive GP29 versus XOR five-bit two-time-pad English word cancellation",
  source:"Exact original LP2 rune tape, original page color annotation and four frozen English controls",
  original:analyses,
  survivorsAfterArc:allResults.add.filter(x=>!x.arc.contradiction).map(x=>({
    pages:x.pair,edges:x.overlapEdges,forcedWholeWords:x.arc.forced
  })),
  strongestRefutedXORCrossGroup:allResults.xor.find(x=>
    x.pair[0]===31&&x.pair[1]===53),
  strongestRefutedADDLongPair:allResults.add.find(x=>
    x.pair[0]===14&&x.pair[1]===20),
  nativeSamePadPositivePairs:positivePairs,
  conclusion:"Full 55-page page-start register: no native-English five-bit XOR shared pad between any two pages. Four additive page pairs remain word-feasible, all involving the 66-rune p49 text; their forced source-lexicon fragments are mutually incoherent and not authenticated plaintext. The finite corpus and exact boundary assumption limit this conclusion. No unknown plaintext or original key recovered."
},null,2));
