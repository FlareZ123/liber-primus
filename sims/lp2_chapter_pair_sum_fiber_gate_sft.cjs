'use strict';
// Issue #3147: chapter-start GP29 pair-sum and shared-pair bijection gate.
// Run from repository: node sims/lp2_chapter_pair_sum_fiber_gate_sft.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt"
];
const read = p => fs.readFileSync(path.join(root,p),'utf8');
function experiment(d,native,donors) {
  const A=29, B=A*A, mod=x=>(x%A+A)%A;
  const assert=(condition,message)=>{if(!condition)throw Error(message)};
  const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  /** @param {string} s */
  function encode(s){
    const out=[];
    for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){
        const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));
        out.push(j); i+=t.length;
      }
    }
    return out;
  }
  const starts=[0,3,8,15,23,27,33,40,54,56];
  const chapters=starts.slice(0,-1).map((p,i)=>d.pages.slice(p,starts[i+1]).flatMap(x=>x.indices));
  const lens=chapters.map(x=>x.length), N=lens.reduce((a,b)=>a+b,0);
  assert(N===12956 && lens.join(",")==="729,1145,1729,1903,1021,1433,1680,3008,308","chapter fixture");
  const pair=(a,i)=>A*a[i]+a[i+1], sum=v=>mod(Math.floor(v/A)+v%A);
  const packets=a=>Array.from({length:a.length>>1},(_,i)=>pair(a,i*2));
  // Incremental collision count: ordered equal-pair pairs H*(H-1).
  function accumulator(){
    const h=new Int32Array(A), b=new Int32Array(B);
    let m=0, sumColl=0,pairColl=0,distinct=0;
    function add(v,delta){
      const s=sum(v);
      if(delta===1){sumColl+=2*h[s];pairColl+=2*b[v];if(!b[v])distinct++}
      else {assert(h[s]>0&&b[v]>0,"bad rolling count");sumColl-=2*(h[s]-1);pairColl-=2*(b[v]-1);if(b[v]===1)distinct--}
      h[s]+=delta;b[v]+=delta;m+=delta;
    }
    return {add,read:()=>({n:m,sumColl,pairColl,distinct,sumIOC:sumColl/(m*(m-1)),pairIOC:pairColl/(m*(m-1))}),hist:()=>Array.from(h)};
  }
  function stats(vs){const a=accumulator();for(const v of vs)a.add(v,1);return {...a.read(),sumHist:a.hist()}}
  const originals=chapters.map(packets);
  const original=originals.map(stats), pooled=stats(originals.flat());
  const solved=native.sections.map(s=>({name:s.name,a:Array.from(s.source_text).map(x=>d.runes.indexOf(x)).filter(x=>x>=0)}));
  // All aligned windows, independent even and odd rune starts. A segment
  // defines pair starts relative to the start of the candidate rune window.
  function windowScan(a,segments,length){
    if(a.length<length)return null;
    const result={windows:0,minSumColl:Infinity,minPairColl:Infinity,maxDistinct:0};
    for(let parity=0;parity<2&&parity+length<=a.length;parity++){
      const acc=accumulator();
      for(const [offset,count] of segments)for(let j=0;j<count;j++)acc.add(pair(a,parity+offset+2*j),1);
      for(let off=parity;off+length<=a.length;off+=2){
        const r=acc.read();result.windows++;
        if(r.sumColl<result.minSumColl){result.minSumColl=r.sumColl;result.minSumAt=off}
        if(r.pairColl<result.minPairColl){result.minPairColl=r.pairColl;result.minPairAt=off}
        if(r.distinct>result.maxDistinct){result.maxDistinct=r.distinct;result.maxDistinctAt=off}
        if(off+2+length>a.length)break;
        for(const [offset,count] of segments){acc.add(pair(a,off+offset),-1);acc.add(pair(a,off+offset+2*count),1)}
      }
    }
    assert(result.windows===a.length-length+1,"all starts");
    const m=segments.reduce((s,x)=>s+x[1],0);
    return {...result,minSumIOC:result.minSumColl/(m*(m-1)),minPairIOC:result.minPairColl/(m*(m-1))};
  }
  let pos=0; const segments=lens.map(l=>{const x=[pos,l>>1];pos+=l;return x});
  // Verify rolling update independently on a small prefix.
  const trial=solved[1].a.slice(0,100), seg=[[0,10],[21,9]], length=40;
  const slow=Array.from({length:trial.length-length+1},(_,off)=>stats(seg.flatMap(([s,m])=>Array.from({length:m},(_,j)=>pair(trial,off+s+2*j)))));
  const fast=windowScan(trial,seg,length);
  assert(fast.minSumColl===Math.min(...slow.map(x=>x.sumColl))&&fast.minPairColl===Math.min(...slow.map(x=>x.pairColl))&&fast.maxDistinct===Math.max(...slow.map(x=>x.distinct)),"rolling vs naive");
  // Exact ordered sum tape. Stop only at the first mismatching pair; scan
  // every possible rune start with enough length for the original chapter.
  function prefixScan(a,target,length){
    let maxPrefix=0, exact=0, windows=0;
    const t=target.map(sum);
    for(let off=0;off+length<=a.length;off++){
      windows++; let k=0;while(k<t.length&&sum(pair(a,off+2*k))===t[k])k++;
      maxPrefix=Math.max(maxPrefix,k);if(k===t.length)exact++;
    }
    return {windows,maxPrefix,exact};
  }
  const references=[...solved.map(x=>({...x,kind:"solved native"})),...donors.map(x=>({name:x.name,a:encode(x.text),kind:"literary"}))];
  const reference=references.map(({name,a,kind})=>({name,kind,length:a.length,whole:stats(packets(a)),pooled:windowScan(a,segments,N),chapters:lens.map((l,i)=>({window:windowScan(a,[[0,l>>1]],l),ordered:prefixScan(a,originals[i],l)}))}));
  // Independent planted maps: Fisher-Yates per fiber; anchors reveal only
  // observed mappings. A one-entry remainder is uniquely forced.
  function plant(a,seed){
    let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
    const forward=new Int32Array(B),inverse=new Int32Array(B);
    for(let s=0;s<A;s++){
      const perm=Array.from({length:A},(_,i)=>i);
      for(let i=A-1;i>0;i--){let j=next()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}
      for(let p=0;p<A;p++){const input=A*p+mod(s-p),q=perm[p],output=A*q+mod(s-q);forward[input]=output;inverse[output]=input}
    }
    assert(new Set(forward).size===B&&forward.every((v,i)=>sum(v)===sum(i)&&inverse[v]===i),"true nonlinear inverse");
    const train=packets(a.slice(0,20000)), held=packets(a.slice(20000,24000));
    const learned=new Map(), reverse=new Map();
    for(const p of train){const c=forward[p];assert(!learned.has(c)||learned.get(c)===p,"anchor");learned.set(c,p);reverse.set(p,c)}
    const direct=learned.size;
    let forced=0;
    for(let s=0;s<A;s++){const missingC=[],missingP=[];for(let i=0;i<A;i++){let v=A*i+mod(s-i);if(!learned.has(v))missingC.push(v);if(!reverse.has(v))missingP.push(v)}
      assert(missingC.length===missingP.length,"partial bijection");
      if(missingC.length===1){learned.set(missingC[0],missingP[0]);forced++}}
    const encrypted=held.map(p=>forward[p]);
    let covered=0,correct=0;
    for(let i=0;i<held.length;i++){const p=learned.get(encrypted[i]);if(p!==undefined){covered++;if(p===held[i]&&forward[p]===encrypted[i])correct++}}
    const aStats=stats(held),cStats=stats(encrypted);
    assert(aStats.sumColl===cStats.sumColl&&aStats.pairColl===cStats.pairColl&&aStats.distinct===cStats.distinct&&held.every((p,i)=>sum(p)===sum(encrypted[i])),"invariant plant");
    assert(correct===covered,"wrong recovered pair");
    return {seed,anchors:train.length,direct,forced,held:held.length,covered,correct,unknown:held.length-covered,fullReplay:encrypted.every((c,i)=>inverse[c]===held[i])};
  }
  const plants=references.filter(x=>x.kind==="literary").slice(0,2).map((x,i)=>({name:x.name,...plant(x.a,[0x31470001,0x31470002][i])}));
  return {chapterLengths:lens,original,pooled,reference,plants};
}
const result=experiment(JSON.parse(read(files[0])),JSON.parse(read(files[1])),files.slice(2).map(p=>({name:path.basename(p),text:read(p)})));
console.log(JSON.stringify(result,null,2));
