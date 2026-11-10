'use strict';
/** @module external_27square_nextblock_fullgate
 * Complete published Reports 00-15 block-39 original-input successor check;
 * matched exact-inventory shuffles and source-independent word segmentation.
 * Run: node sims/external_27square_nextblock_fullgate.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const lexicon=fs.readFileSync(path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8');
const experiment=function experiment(corpus, lexicon, repetitions=0){
  const assert=(p,msg)=>{if(!p)throw Error(msg)};
  const grid=corpus.pages.slice(0,3).flatMap(p=>p.indices);
  assert(grid.length===729,"27x27 input");
  assert(corpus.pages.slice(0,3).map(p=>p.indices.length).join(",")==="262,266,201","page lengths");
  const M=29;
  const mod=n=>(n%M+M)%M;
  function gcd(a,b){while(b){const q=a%b;a=b;b=q}return a}
  function phi(n){let r=n,t=n;for(let p=2;p*p<=t;p++)if(t%p===0){r-=r/p;while(t%p===0)t/=p}if(t>1)r-=r/t;return r}
  function mu(n){let s=1;for(let p=2;p*p<=n;p++)if(n%p===0){n/=p;s=-s;if(n%p===0)return 0}return n>1?-s:s}
  const MU=Array.from({length:1600},(_,i)=>i?mu(i):0);
  const PHI=Array.from({length:29},(_,i)=>i?phi(i):0);
  const SIGN=PHI.map(v=>v?MU[v]:0);
  const n0=(r,c)=>27*(r-1)+c;
  const n1=(r,c)=>27*(c-1)+28-r;
  const n2=(r,c)=>730-n0(r,c);
  const n3=(r,c)=>730-n1(r,c);
  const at=(g,r,c)=>g[27*(r-1)+c-1];
  const words=new Map();
  const code=corpus.translit;
  function encode(w){
    w=w.toUpperCase().replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
    let result="";
    for(let i=0;i<w.length;){
      const pair=code.indexOf(w.slice(i,i+2));
      if(pair>=0){result+=pair.toString(36);i+=2;continue}
      const index=code.indexOf(w[i]);
      if(index<0)return null;
      result+=index.toString(36);i++;
    }
    return result;
  }
  for(const line of lexicon.split(/\r?\n/)){
    const match=/^([a-z]+)\s+(\d+)$/.exec(line);
    if(!match||+match[2]<20)continue;
    const w=match[1].toUpperCase(),s=encode(w),freq=+match[2];
    if(!s||s.length>12||(s.length===1&&w!=="A"&&w!=="I"))continue;
    const old=words.get(s);
    if(!old||freq>old.freq)words.set(s,{word:w,freq});
  }
  function lexical(sequence){
    const dp=new Array(sequence.length+1).fill(null);
    dp[0]={score:0,display:""};
    for(let i=0;i<sequence.length;i++){
      const prev=dp[i];if(!prev)continue;
      for(let len=1;len<=12&&i+len<=sequence.length;len++){
        const lex=words.get(sequence.slice(i,i+len));
        if(!lex)continue;
        const j=i+len,score=prev.score+Math.log(lex.freq)-8;
        if(!dp[j]||score>dp[j].score)dp[j]={score,display:prev.display?(prev.display+" "+lex.word):lex.word};
      }
    }
    return dp[sequence.length];
  }
  function keysFor(g){
    const out=[];
    for(let r=2;r<=26;r+=2)for(let c=2;c<=26;c+=2)for(let radius=2;radius<=12;radius+=2){
      if(c-radius<1||c+radius>27)break;
      const a=at(g,r,c-radius),h=at(g,r,c),b=at(g,r,c+radius);
      if(!a||!h||!b||a===b)continue;
      for(const [u,z] of [[a,b],[b,a]])for(const transform of [false,true]){
        const middle=transform?PHI[h]:h;
        if(SIGN[u]===0&&SIGN[middle]===1&&SIGN[z]===0)
          out.push({r,c,radius,transform,source:[u,h,z],key:[middle,z,u]});
      }
    }
    return out;
  }
  function segmentsFor(){
    const out=[];
    for(let r=1;r<=27;r+=2)for(let c=2;c<=26;c+=2){
      const dr=Math.abs(r-8),dc=Math.abs(c-17);
      if(dr!==dc)continue;
      for(const direction of [-1,1])for(let length=3;length<=27;length+=2){
        const er=r+(length-1)*direction,ec=c+length-1;
        if(er<1||er>27||ec>27)break;
        out.push({r,c,direction,length,er,ec,modeOK:MU[n1(r,c)]>=0});
      }
    }
    return out;
  }
  const segments=segmentsFor();
  function compatible(source,seg){
    const {r,c}=source,{er,ec}=seg;
    return MU[gcd(n0(r,c),n0(seg.r,seg.c))]!==0&&
      MU[gcd(n1(r,c),n3(er,ec))]!==0&&
      MU[gcd(n0(r,c),n2(er,ec))]!==0;
  }
  const run=(g,withExamples=false)=>{
    const source=keysFor(g),unique=new Set(),accepted=new Set();
    let pairs=0,modePairs=0,lexicalPairs=0;
    const byLen={},best=[];
    for(const seg of segments)for(const key of source){
      if(!compatible(key,seg))continue;
      pairs++;
      if(!seg.modeOK)continue;
      modePairs++;
      let decoded="";
      for(let j=0;j<seg.length;j++)
        decoded+=mod(at(g,seg.r+j*seg.direction,seg.c+j)-key.key[j%3]).toString(36);
      unique.add(decoded);
      const found=lexical(decoded);
      if(found){
        lexicalPairs++;accepted.add(decoded);byLen[seg.length]=(byLen[seg.length]||0)+1;
        if(withExamples)best.push({plain:found.display,score:found.score,
          cipherStart:[seg.r,seg.c],slope:seg.direction,length:seg.length,
          sourceCenter:[key.r,key.c],sourceRadius:key.radius,
          direct:!key.transform,source: key.source,alignedKey:key.key,
          plaintextIndices:Array.from(decoded,ch=>parseInt(ch,36))});
      }
    }
    best.sort((a,b)=>b.score-a.score);
    return {sourceAssignments:source.length,rawSegments:segments.length,
      report10Pairs:pairs,afterReport02Mode:modePairs,
      distinctBlocks:unique.size,lexicalAssignments:lexicalPairs,
      lexicalDistinct:accepted.size,byLength:byLen,
      best:best.slice(0,15)};
  };
  assert(segments.length===166,"Agent13 prior partial 166 segment count");
  const real=run(grid,true);
  assert(real.sourceAssignments===172,"Agent13 prior partial 172 keys");
  assert(real.report10Pairs===27580,"Report10 prior exact original count");
  assert(real.afterReport02Mode===21818,"Report02 exact original count");
  assert(real.lexicalAssignments===116,"frozen TextBlob 20+ lexicon check");
  assert(real.lexicalDistinct===95,"distinct lexical confirmations");
  const source=keysFor(grid);
  const chosen=source.find(k=>segments.some(s=>s.length===3&&s.modeOK&&compatible(k,s)&&
    Array.from({length:3},(_,j)=>n0(s.r+j*s.direction,s.c+j)).every(t=>
      ![n0(k.r,k.c-k.radius),n0(k.r,k.c),n0(k.r,k.c+k.radius)].includes(t))));
  assert(chosen,"source plant must exist");
  const s=segments.find(s=>s.length===3&&s.modeOK&&compatible(chosen,s)&&
    Array.from({length:3},(_,j)=>n0(s.r+j*s.direction,s.c+j)).every(t=>
      ![n0(chosen.r,chosen.c-chosen.radius),n0(chosen.r,chosen.c),n0(chosen.r,chosen.c+chosen.radius)].includes(t)));
  const target=encode("NOW");
  const plant=grid.slice();
  for(let j=0;j<3;j++)
    plant[n0(s.r+j*s.direction,s.c+j)-1]=mod(parseInt(target[j],36)+chosen.key[j%3]);
  const rekey=keysFor(plant).find(k=>k.r===chosen.r&&k.c===chosen.c&&
    k.radius===chosen.radius&&k.transform===chosen.transform&&
    k.key.join(",")===chosen.key.join(","));
  assert(rekey,"synthetic independent source key preserved");
  const recovered=Array.from({length:3},(_,j)=>mod(at(plant,s.r+j*s.direction,s.c+j)-rekey.key[j])).map(v=>v.toString(36)).join("");
  assert(recovered===target,"exact plant inversion");
  const positive={cipherStart:[s.r,s.c],slope:s.direction,sourceCenter:[chosen.r,chosen.c],
    expected:"NOW",decoded:lexical(recovered)?.display,exactRoundtrip:recovered===target};
  let rng=0x20261110;
  function next(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0}
  // Condition on the authentic physical source and ciphertext of block 38.
  // Scrambling any of these seven cells invalidates its frozen outgoing forecast.
  const anchorCells=[[11,13],[12,13],[13,13],[5,17],[6,17],[7,17],[8,17]];
  const anchors=new Set(anchorCells.map(([r,c])=>n0(r,c)-1));
  function shuffle(src){
    const result=src.slice();
    const movable=Array.from({length:src.length},(_,i)=>i).filter(i=>!anchors.has(i));
    const values=movable.map(i=>src[i]);
    for(let i=values.length-1;i>0;i--){
      const j=next()%(i+1);
      [values[i],values[j]]=[values[j],values[i]];
    }
    movable.forEach((index,i)=>{result[index]=values[i]});
    for(const index of anchors)assert(result[index]===src[index],"anchor must be frozen");
    return result;
  }
  const nulls=[];
  for(let i=0;i<repetitions;i++){
    nulls.push(run(shuffle(grid)));
  }
  const summarize=field=>{
    const a=nulls.map(o=>o[field]);
    if(a.length===0)return null;
    const mean=a.reduce((s,v)=>s+v,0)/a.length;
    return {mean,min:Math.min(...a),max:Math.max(...a),
      nAtLeastObserved:a.filter(x=>x>=real[field]).length,
      addOneTail:(a.filter(x=>x>=real[field]).length+1)/(a.length+1)};
  };
  return {version:"2026-11-10",original:real,positive,
    source:"pages0-2; 729 original GP indices; row-major 27x27",
    fullRuleScope:"Reports00-15 with frozen published block38 state, plus Report16 independently sourced TextBlob lexicon (freq>=20)",
    nullCount:repetitions,seed:"0x20261110",fixedAnchorCells:anchorCells,
    nulls:{sourceAssignments:summarize("sourceAssignments"),
      afterReport02Mode:summarize("afterReport02Mode"),
      lexicalAssignments:summarize("lexicalAssignments"),
      lexicalDistinct:summarize("lexicalDistinct")},
    caveat:"Full English word segmentation from a permissive source lexicon is a model choice, not evidence for authenticity. Predecessor block38 itself remains unverified."};
};
const result=experiment(corpus,lexicon,250);
assert.equal(result.original.report10Pairs,27580);
assert.equal(result.original.afterReport02Mode,21818);
assert.equal(result.original.lexicalAssignments,116);
assert.equal(result.positive.exactRoundtrip,true);
console.log(JSON.stringify(result,null,2));
module.exports={experiment};
