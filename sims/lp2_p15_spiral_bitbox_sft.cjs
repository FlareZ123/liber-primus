"use strict";
const fs=require("node:fs");
const path=require("node:path");
function run(corpus,native) {
  const ord=[6,7,8,9,5,0,1,10,4,3,2,11,15,14,13,12];
  const path=Array.from({length:16},(_,i)=>ord.indexOf(i));
  const check=(c,m)=>{if(!c)throw Error(m)};
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const bits=(a,lsb=false)=>a.flatMap(v=>Array.from({length:5},(_,i)=>(v>>(lsb?i:4-i))&1));
  const nums=(b,lsb=false)=>Array.from({length:b.length/5},(_,i)=>b.slice(i*5,i*5+5).reduce((v,x,j)=>v+(x<<(lsb?j:4-j)),0));
  function permute(s,p,offset=0) {
    const out=s.slice();
    for(let i=offset;i+16<=s.length;i+=16) for(let k=0;k<16;k++) out[i+k]=s[i+p[k]];
    return out;
  }
  const transform=(a,p,offset=0,lsb=false)=>nums(permute(bits(a,lsb),p,offset),lsb);
  function walk(a,p,lsb=false) {
    let out=[], hist=Array(19).fill(0);
    for(let i=0;i+16<=a.length;i+=16){
      const source=bits(a.slice(i,i+16),lsb);
      let b=source,k=0,v;
      do { b=permute(b,p); v=nums(b,lsb);k++;check(k<=18,"P-box order"); } while(v.some(x=>x>28));
      check(source.reduce((s,x)=>s+x,0)===b.reduce((s,x)=>s+x,0),"bit weight");
      hist[k]++;out.push(...v);
    }
    out.push(...a.slice(a.length-a.length%16));
    return {out,hist};
  }
  const names=corpus.translit;
  const nativeSections=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,a:[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(i=>i>=0)}));
  function lm(sections) {
    const u=Array(29).fill(0),b=Array(29*29).fill(0),t=Array(29**3).fill(0),bd=Array(29).fill(0),td=Array(29*29).fill(0);let n=0;
    for(const a of sections) for(let i=0;i<a.length;i++){
      const x=a[i]; u[x]++;n++;
      if(i){const k=a[i-1]*29+x;b[k]++;bd[a[i-1]]++}
      if(i>1){const k=a[i-2]*29+a[i-1];t[k*29+x]++;td[k]++}
    }
    return a=>{let s=0;for(let i=0;i<a.length;i++){
      const x=a[i];let pr=(u[x]+1)/(n+29);
      if(i) pr=(b[a[i-1]*29+x]+10*pr)/(bd[a[i-1]]+10);
      if(i>1){const k=a[i-2]*29+a[i-1];pr=(t[k*29+x]+10*pr)/(td[k]+10)}
      s+=Math.log(pr)
    }return s/a.length};
  }
  const origLM=lm(nativeSections.map(s=>s.a));
  const spans={p15body:corpus.pages[15].indices.slice(20),p16to22:corpus.pages.slice(16,23).flatMap(p=>p.indices),p15to22:corpus.pages.slice(15,23).flatMap(p=>p.indices).slice(20)};
  check(spans.p15body.length===139&&spans.p16to22.length===1744,"source sizes");
  const directions=[["gather",path,ord],["scatter",ord,path]];
  const direct=[],cyclewalk=[],controls=[];
  for(const [span,a] of Object.entries(spans)) for(const [direction,p,q] of directions) for(const lsb of [false,true]){
    let counts=[], first=[];
    for(let phase=0;phase<16;phase++){
      const v=transform(a,p,phase,lsb),bad=v.flatMap((n,i)=>n>28?[[i,n]]:[]);
      check(same(transform(v,q,phase,lsb),a),"unrestricted binary replay");
      counts.push(bad.length); if(!phase)first=bad.slice(0,5);
    }
    direct.push({span,n:a.length,direction,lsb,counts,firstPhaseZeroInvalid:first});
    // One fixed local walk per 80-bit packet; fringe is unchanged.
    const w=walk(a,p,lsb),back=walk(w.out,q,lsb);
    check(same(back.out,a),"original cyclewalk roundtrip");
    cyclewalk.push({span,n:a.length,direction,lsb,hist:w.hist,score:origLM(w.out),rawScore:origLM(a),first60:w.out.slice(0,60).map(x=>names[x]).join(" "),decoded:w.out});
  }
  for(const s of nativeSections) {
    const score=lm(nativeSections.filter(t=>t!==s).map(t=>t.a));
    const row={name:s.name,n:s.a.length,plainScore:score(s.a),controls:[]};
    for(const [direction,p,q] of directions)for(const lsb of [false,true]){
      const enc=walk(s.a,q,lsb),dec=walk(enc.out,p,lsb);
      check(same(dec.out,s.a),"control recovery");
      row.controls.push({direction,lsb,recovered:dec.out.length,cipherScore:score(enc.out)});
    }controls.push(row);
  }
  // Confirm the combinatorial argument on all local adjacent pairs and all phases.
  const signature=(i,j)=>Array.from({length:5},(_,b)=>Math.floor((16*b+i)/5)===Math.floor((16*b+j)/5)).map(Number).join("");
  for(let i=0;i<15;i++)for(let a=0;a<16;a++)for(let b=0;b<16;b++)if(signature(i,i+1)===signature(a,b))check(Math.abs(a-b)===1,"adjacency lemma");
  check(Array.from({length:15},(_,i)=>signature(i,i+1)===signature(15-i,14-i)).some(x=>!x),"reversal not automorphism");
  return {ord,path,direct,cyclewalk,controls,universalRepeated16BitPermutations:1};
}
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const native=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
console.log(JSON.stringify(run(corpus,native),null,2));
