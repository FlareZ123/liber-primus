'use strict';
const fs=require('node:fs');
const path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
function run(raw){
  const d=JSON.parse(raw[0]),native=JSON.parse(raw[1]),N=29,seq=Array.from({length:N},(_,i)=>i);
  const check=(b,m)=>{if(!b)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),hist=x=>{let h=Array(N).fill(0);for(const v of x)if(v>=0)h[v]++;return h};
  // h = glyph in pivot, g = glyph in target plaintext slot, k = glyph in forbidden F slot.
  // kind 0: distinct slots; kind 1: target=pivot; kind 2: F=pivot.
  function gate(x,kind){
    const sz=N**3;let a=new Int32Array(sz).fill(-1),b=new Int32Array(sz).fill(-1),states=[];
    for(let h=0;h<N;h++)for(let g=0;g<N;g++)for(let k=0;k<N;k++){
      if(kind===1?(g!==h||k===h):kind===2?(k!==h||g===h):(h===g||h===k||g===k))continue;
      const i=(h*N+g)*N+k;a[i]=0;states.push(i);
    }
    for(const c of x){
      const next=[];
      function put(i,v){if(b[i]===-1)next.push(i);if(v>b[i])b[i]=v}
      for(const i of states){
        const k=i%N,g=Math.floor(i/N)%N,h=Math.floor(i/N/N),v=a[i];
        if(c===0)put(i,v); // literal F, no state update
        if(c!==k){ // consuming output from a non-F slot
          const gg=g===c?h:g;
          put((c*N+(kind===1?c:gg))*N+(kind===2?c:k),v+Number(c===g));
        }
      }
      for(const i of states)a[i]=-1;
      [a,b]=[b,a];states=next;
      if(!states.length)return null;
    }
    return Math.max(...states.map(i=>a[i]));
  }
  // After first consuming emission, pivot holds the emitted glyph, and all other
  // slots can be relabeled. The arbitrary first rank contributes at most one.
  // holds=true requires F slot initially holding ciphertext 0 and pivot != F.
  function labels(x,holds){
    const start=x.findIndex(v=>!holds||v!==0),first=x[start];
    const vals=seq.filter(v=>!holds||v!==0),a=[first,...vals.filter(v=>v!==first)];
    if(holds)a.push(0);
    const out=[];
    for(let i=0;i<x.length;i++){
      const c=x[i];
      if(holds&&c===0){out.push(28);continue}
      const r=a.indexOf(c);check(r>=0,"valid rank");out.push(i===start?-1:r);
      [a[r],a[0]]=[a[0],a[r]];
    }
    return out;
  }
  function metrics(x){
    const z=x.filter(v=>v===0).length, bounds=[0,1,2].map(k=>gate(x,k));
    const noHold=Math.max(...hist(labels(x,false)))+1;
    const hold=Math.max(z,...bounds.filter(v=>v!==null));
    const nonzeroTypes=new Set(x.filter(Boolean)).size,nonzeroRepeats=x.slice(1).filter((v,i)=>v!==0&&v===x[i]).length;
    if(nonzeroTypes===28&&nonzeroRepeats){
      check(bounds[2]===null,"F pivot impossible");
      // If F is not pivot its glyph never moves; full nonzero coverage forces it to 0.
      // First consuming output is free; subsequent equality partition is fixed.
      check(hold<=Math.max(z,Math.max(...hist(labels(x,true)))+1),"zero-slot collapse");
    }
    return {n:x.length,z,nonzeroTypes,nonzeroRepeats,bounds,noHold,hold,either:Math.max(noHold,hold)};
  }
  const source=d.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  check(source.length===12956,"original length");
  const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const book=metrics(source),chapters=cuts.slice(0,-1).map((a,i)=>({a,b:cuts[i+1],...metrics(source.slice(a,cuts[i+1]))}));
  const pages=d.pages.filter(p=>p.page<56&&p.indices.length).map(p=>({p:p.page,...metrics(p.indices)}));
  const sum=Object.fromEntries(["hold","noHold","either"].map(k=>[k,pages.reduce((s,p)=>s+p[k],0)]));
  check(book.hold===515&&book.noHold===504&&sum.hold===867&&sum.noHold===856&&sum.either===879,"frozen original bounds");
  const toks=d.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function parse(s){s=s.toUpperCase().replace(/V/g,"U").replace(/K/g,"C");let a=[];for(let i=0;i<s.length;){const t=toks.find(t=>s.startsWith(t.t,i));if(t){a.push(t.i);i+=t.t.length}else i++}return a}
  const law=parse(raw.slice(2,5).join("\n")),blake=parse(raw[5].slice(raw[5].indexOf("THE ARGUMENT"),raw[5].indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
  function minmax(x,n){let h=Array(N).fill(0),m=Infinity;for(let i=0;i<n;i++)h[x[i]]++;for(let s=0;s+n<=x.length;s++){if(s){h[x[s-1]]--;h[x[s+n-1]]++}m=Math.min(m,Math.max(...h))}return {min:m,windows:x.length-n+1}}
  for(const x of [book,...chapters]){x.law=minmax(law,x.n);x.blake=minmax(blake,x.n);check(x.either<Math.min(x.law.min,x.blake.min),"native-window gate")}
  check(sum.either<Math.min(book.law.min,book.blake.min),"page-private mixed gate");
  // Native plants: independent deterministic alphabets, actual literal F masks,
  // both hidden ordinary encrypted zeros and zero-slot special case, F as pivot.
  let seed=0x610924;
  function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
  function perm(){let a=seq.slice();for(let i=N-1;i;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function enc(p,init,pivot,holds){const a=init.slice();return p.map(v=>{if(holds&&v===0)return 0;const c=a[v];[a[v],a[pivot]]=[a[pivot],a[v]];return c})}
  function dec(c,init,pivot,mask){const a=init.slice();return c.map((v,i)=>{if(mask[i])return 0;const p=a.indexOf(v);check(p>=0,"known key inverse");[a[p],a[pivot]]=[a[pivot],a[p]];return p})}
  const glyph=new Map(d.runes.map((r,i)=>[r,i])),controls=[];
  for(const s of native.sections){
    const p=[...s.source_text].filter(v=>glyph.has(v)).map(v=>glyph.get(v));
    for(const mode of ["all","zero-slot","ordinary-zero","F-pivot"]){
      const init=perm(),holds=mode!=="all",pivot=mode==="F-pivot"?0:1+rnd(28);
      if(mode==="zero-slot"){const j=init.indexOf(0);[init[j],init[0]]=[init[0],init[j]]}
      if(mode==="ordinary-zero"&&init[0]===0){[init[0],init[18]]=[init[18],init[0]]}
      const c=enc(p,init,pivot,holds),mask=p.map(v=>holds&&v===0);
      const recovered=dec(c,init,pivot,mask);check(eq(recovered,p)&&eq(enc(recovered,init,pivot,holds),c),"plant roundtrip");
      const b=metrics(c),counts=hist(p),actual=Math.max(...counts);
      check(actual<=(holds?b.hold:b.noHold),"control true frequency not excluded");
      if(holds){
        const pp=counts[pivot],nonpivot=Math.max(...counts.filter((_,i)=>i!==0&&i!==pivot));
        check(counts[0]<=b.z,"F count");
        if(pivot===0)check(nonpivot<=b.bounds[2],"F pivot plant");
        else check(pp<=b.bounds[1]&&nonpivot<=b.bounds[0],"separate maxima");
      }
      let crib=null;
      if(mode==="all"||mode==="zero-slot"){
        const label=labels(c,holds),split=Math.floor(2*p.length/3),map=new Map();
        for(let i=0;i<split;i++)if(label[i]>=0){check(!map.has(label[i])||map.get(label[i])===p[i],"relabel lemma");map.set(label[i],p[i])}
        const tail=label.slice(split).map(v=>map.get(v));const n=tail.length,covered=tail.filter(v=>v!==undefined).length,correct=tail.filter((v,i)=>v===p[split+i]).length;
        check(covered===correct,"frozen crib prediction");
        crib={n,covered,correct};
      }
      controls.push({name:s.name,mode,n:p.length,actual,upper:holds?b.hold:b.noHold,heldZeros:mask.filter(Boolean).length,consumingZeros:c.filter((v,i)=>v===0&&!mask[i]).length,crib});
    }
  }
  return {book,chapters,pages,sum,controls};
}
const result=run(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')));
console.log(JSON.stringify(result,null,2));
