"use strict";
/**
 * Issue #1492: exact two/three independent original 14-rune word witness
 * compatibility under ONE global 29! alphabet permutation.
 *
 * Actual source-page prime-2 resets; for a word at within-page position j,
 * the unknown key index t at its first rune is any integer from
 * j - (# preceding occurrences of the selected bypass marker) through j.
 * This superset permits every prior F skip history. The whole π and sign are
 * SHARED across all three intact 14-rune words, on different pages.
 *
 * A lexical candidate fully fixes whether each printed marker is transparent:
 * P==marker implies C==marker and skips the prime; the converse fails,
 * since an encrypted non-marker may also emit C==marker. Normal emissions
 * obey α(C)-α(P)=±φ(prime_t) mod29 under unknown injective α=π^-1.
 * Exact component-potential and 29-state exact-cover checks certify the
 * existence of at least one global α for any accumulated word equations.
 * Uses historically pinned TextBlob English GP29 29,157-type vocabulary.
 *
 * Windows Node22 CJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const words=parseSharedCorpus().words;
assert.equal(words.length,2896);
const index=new Map(gp.runes.map((r,i)=>[r,i]));
const wnums=words.map(w=>[...w.runes].map(r=>index.get(r)));
const dictRows=read("resources/control/english_wordfreq_textblob.txt")
  .split(/\r?\n/).filter(s=>/^[a-z]+\s+\d+$/i.test(s))
  .map(s=>s.split(/\s+/)[0].toUpperCase());
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(word){
  const text=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<text.length;){
    if(text.startsWith("ING",i)){out.push(21);i+=3;}
    else if(text.startsWith("IO",i)){out.push(27);i+=2;}
    else{
      const t=tokens.find(x=>text.startsWith(x.s,i));
      if(!t)return null;
      out.push(t.i);i+=t.s.length;
    }
  }
  return out;
}
const extraSources=[
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
const extraWords=extraSources.flatMap(file=>
  read(file).toUpperCase().match(/[A-Z]+/g)||[]);
const dictionary=Array.from(new Set([...dictRows,...extraWords]))
  .map(s=>({word:s,nums:encode(s)}))
  .filter(x=>x.nums&&x.nums.length===14);
assert(dictionary.length>=155);
console.log("FULL_PINNED_GP14_LEXICON",JSON.stringify({
  total:dictionary.length,textblobBaseline:155,
  additionalSourceWords:dictionary.length-155
}));
const pgs=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const starts=[];
let cursor=0;
for(const p of pgs){starts.push(cursor);cursor+=p.indices.length;}
assert.equal(cursor,12956);
const wordStart=[];
cursor=0;
for(const w of words){wordStart.push(cursor);cursor+=w.length;}
assert.equal(cursor,12956);
const selected=[1353,2341,754];
const source=selected.map(w=>{
  assert.equal(wnums[w].length,14);
  const p=words[w].startPage;
  assert.equal(p,words[w].endPage);
  const local=wordStart[w]-starts[p];
  assert(local>=0);
  assert(local+14<=pgs[p].indices.length);
  assert.deepEqual(pgs[p].indices.slice(local,local+14),wnums[w],
    "authentic source: physical glyphs must equal transcript");
  return {wordIndex:w,physicalPage:pgs[p].page,
    original:wnums[w],local,
    prefix:pgs[p].indices.slice(0,local)};
});
console.log("SOURCE_THREE_LONG_WORDS",JSON.stringify(source.map(x=>({
  wordIndex:x.wordIndex,physicalPage:x.physicalPage,
  local:x.local,prefixRunes:x.prefix.length
}))));
const mod=n=>(n%29+29)%29;
function primes(count){
  const out=[];
  for(let n=2;out.length<count;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)out.push(n);
  }
  return out;
}
const SHIFT=primes(800).map(p=>(p-1)%29);
function popcount(x){let n=0;while(x){x&=x-1;n++;}return n;}
/** Exact consistency of all partial modular equalities with 29 distinct α. */
function valid(equations,pin=-1){
  const adj=Array.from({length:29},()=>[]);
  for(const [c,p,k] of equations){
    adj[c].push([p,mod(-k)]);adj[p].push([c,mod(k)]);
  }
  const comp=new Int8Array(29).fill(-1),offset=new Int8Array(29);
  const masks=[];
  for(let v=0;v<29;v++)if(comp[v]===-1){
    const id=masks.length;
    comp[v]=id;
    const queue=[v];let mask=0;
    for(let z=0;z<queue.length;z++){
      const x=queue[z],bit=1<<offset[x];
      if(mask&bit)return false;
      mask|=bit;
      for(const [y,dy] of adj[x]){
        const wanted=mod(offset[x]+dy);
        if(comp[y]===-1){comp[y]=id;offset[y]=wanted;queue.push(y);}
        else if(comp[y]!==id||offset[y]!==wanted)return false;
      }
    }
    masks.push(mask);
  }
  const all=(1<<29)-1;
  const groups=masks.map((mask,id)=>({id,mask,count:popcount(mask)}))
    .filter(x=>x.count>1).sort((a,b)=>b.count-a.count);
  const pinnedComp=pin<0?-1:comp[pin], fixed=pin<0?-1:mod(-offset[pin]);
  const taken=(pin>=0&&popcount(masks[pinnedComp])===1)?1:0;
  const rot=(bits,k)=>((bits<<k)|(bits>>>(29-k)))&all;
  function exact(i,used){
    if(i===groups.length)return true;
    const g=groups[i];
    const first=g.id===pinnedComp?fixed:0;
    const last=g.id===pinnedComp?fixed+1:29;
    for(let k=first;k<last;k++){
      const m=rot(g.mask,k);
      if(!(m&used)&&exact(i+1,used|m))return true;
    }
    return false;
  }
  return exact(0,taken);
}
/** Candidate plaintext fixes skip positions; no hidden branch is fitted. */
function relations(cipher,plain,start,sign,marker){
  const edges=[];
  let t=start;
  for(let i=0;i<14;i++){
    const C=cipher[i],P=plain[i];
    if(P===marker){
      if(C!==marker)return null;
      continue;
    }
    edges.push([C,P,mod(sign*SHIFT[t++])]);
  }
  return edges;
}
const cache=new Map();
function choices(wordNumber,sign,marker,pin,initialPrimeOffset=0){
  const key=[wordNumber,sign,marker,pin,initialPrimeOffset].join("/");
  if(cache.has(key))return cache.get(key);
  const item=source[wordNumber];
  const preceding=item.prefix.filter(x=>x===marker).length;
  const out=[];
  for(const plaintext of dictionary){
    for(let t=initialPrimeOffset+item.local-preceding;
      t<=initialPrimeOffset+item.local;t++){
      const edges=relations(item.original,plaintext.nums,t,sign,marker);
      if(edges&&valid(edges,pin)){
        out.push({word:plaintext.word,start:t,edges});
      }
    }
  }
  cache.set(key,out);
  return out;
}
const pairs=[];
let triple=null;
let totalPair=0;
let totalModes=0;
outer:for(const sign of [1,-1]){
  for(const mode of ["literal","underlying"]){
    for(const marker of mode==="literal"?[0]:Array.from({length:29},(_,i)=>i)){
      const pin=mode==="literal"?-1:marker;
      const a=choices(0,sign,marker,pin);
      const b=choices(1,sign,marker,pin);
      const c=choices(2,sign,marker,pin);
      let matches=0;
      let firstPair=null;
      for(const left of a){
        for(const right of b){
          const equations=left.edges.concat(right.edges);
          if(valid(equations,pin)){
            matches++;
            firstPair??={left:left.word,right:right.word,
              phases:[left.start,right.start]};
            for(const third of c){
              if(valid(equations.concat(third.edges),pin)){
                triple={mode,marker,sign,
                  words:[left.word,right.word,third.word],
                  phaseStarts:[left.start,right.start,third.start]};
                break outer;
              }
            }
          }
        }
      }
      pairs.push({mode,marker,sign,
        localCandidateTraces:[a.length,b.length,c.length],
        pairTraceMatches:matches,firstPair});
      totalPair+=matches;totalModes++;
    }
  }
}
console.log("PAIR_MATCHING_MODES",JSON.stringify(pairs));
console.log("GLOBAL_TRIPLE_WITNESS",JSON.stringify(triple));
console.log("MODES_SEARCHED",totalModes,"PAIR_TRACE_MATCHES",totalPair);
console.log("DECISION",triple
  ?"At least one shared π relation graph survives three whole source words; this is only a lexical feasibility witness, not a complete paragraph/key."
  :"No ONE global π can explain three original long words under pinned lexicon, all page-local marker skip histories and either sign for every fully explored mode.");


/**
 * Independently planted pair under a REAL shared pi: a random global
 * permutation, two different physical-page-local starting offsets, original
 * phi(prime) clocks, and actual skip semantics. This prevents vacuous pair
 * contradiction from an inverted sign or incorrect component-cover logic.
 */
const nativeTokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encodeText(text){
  return Array.from(text.toUpperCase().match(/[A-Z]+/g)||[])
    .flatMap(w=>encode(w)||[]);
}
const book=encodeText(read("resources/control/gibran_prophet_58585.txt"));
assert(book.length>1000);
let seed=0x33012014|0;
function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
const pi=Array.from({length:29},(_,i)=>i);
for(let j=28;j>0;j--){const i=Math.floor(next()*(j+1));[pi[j],pi[i]]=[pi[i],pi[j]];}
const alpha=new Uint8Array(29);pi.forEach((x,i)=>{alpha[x]=i;});
function nativePlant(pageIndex,lexWord,marker,startPrimeIndex=0){
  const item=source[pageIndex];
  const plain=book.slice(pageIndex*250,pageIndex*250+item.local)
    .concat(lexWord.nums);
  assert.equal(plain.length,item.local+14);
  let consumed=0;
  const ciphertext=plain.map(P=>{
    if(P===marker)return marker;
    const out=pi[mod(alpha[P]+SHIFT[startPrimeIndex+consumed])];
    consumed++;
    return out;
  });
  const wordCipher=ciphertext.slice(item.local);
  const preceding=ciphertext.slice(0,item.local).filter(x=>x===marker).length;
  const phase=startPrimeIndex+plain.slice(0,item.local).filter(x=>x!==marker).length;
  assert(phase>=startPrimeIndex+item.local-preceding&&phase<=startPrimeIndex+item.local,
    "real transparent skips lie within ciphertext-marker prefix bound");
  const edges=relations(wordCipher,lexWord.nums,phase,1,marker);
  assert(edges);
  assert(valid(edges,marker===0?-1:marker));
  return {edges,phase,ciphertext:wordCipher,preceding};
}
for(const variant of ["literal","underlying"]){
  const marker=variant==="literal"?0:pi[0];
  const first=nativePlant(0,dictionary[0],marker);
  const second=nativePlant(1,dictionary[1],marker);
  assert(valid(first.edges.concat(second.edges),variant==="literal"?-1:marker),
    "genuine two-page common pi + native English must satisfy exact pairing");
  console.log("POSITIVE_PLANTED_COMMON_PI",JSON.stringify({
    variant,marker,words:[dictionary[0].word,dictionary[1].word],
    sourcePageLocalPhases:[first.phase,second.phase],
    sharedPiConstraintsSatisfiable:true
  }));
}


/**
 * Extension: grant the same unknown initial prime-index offset 1..28,
 * source p56 uses 0. This test is deliberately after the source-start
 * theorem and may show whether a first-party offset selector is required.
 * Exactly one offset is shared across BOTH original page resets.
 */
let alternativeOffsetsWithPairs=0;
const offsetSummaries=[];
for(let initialPrimeOffset=1;initialPrimeOffset<464;initialPrimeOffset++){
  let alternatives=0;
  let witness=null;
  for(const sign of [1,-1]){
    for(const mode of ["literal","underlying"]){
      for(const marker of mode==="literal"?[0]:Array.from({length:29},(_,i)=>i)){
        const pin=mode==="literal"?-1:marker;
        const A=choices(0,sign,marker,pin,initialPrimeOffset);
        const B=choices(1,sign,marker,pin,initialPrimeOffset);
        for(const left of A)for(const right of B){
          if(valid(left.edges.concat(right.edges),pin)){
            alternatives++;
            witness??={sign,mode,marker,
              words:[left.word,right.word],
              phases:[left.start,right.start]};
          }
        }
      }
    }
  }
  if(alternatives>0)alternativeOffsetsWithPairs++;
  offsetSummaries.push({initialPrimeOffset,pairedTraces:alternatives,witness});
}
console.log("ALTERNATIVE_P56_STARTS_1_TO_463",JSON.stringify(offsetSummaries));
console.log("OTHER_STARTS_WITH_ANY_LEXICAL_PAIR",alternativeOffsetsWithPairs);


for(const variant of ["literal","underlying"]){
  const marker=variant==="literal"?0:pi[0];
  const first=nativePlant(0,dictionary[0],marker,227);
  const second=nativePlant(1,dictionary[1],marker,227);
  assert(valid(first.edges.concat(second.edges),variant==="literal"?-1:marker),
    "true one-pi two-page native control with historical nonzero prime start227");
  console.log("POSITIVE_OFFSET227_SHARED_PI",JSON.stringify({
    variant,marker,starts:[first.phase,second.phase],pass:true
  }));
}
