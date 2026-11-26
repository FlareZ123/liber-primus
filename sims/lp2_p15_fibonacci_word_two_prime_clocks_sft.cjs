"use strict";
const fs = require("node:fs");

function experiment(corpus, donor) {
  const mod=x=>(x%29+29)%29;
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const primes=[];
  for(let x=2;primes.length<6000;x++){
    let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x);
  }
  const k=primes.map(p=>mod(p-1));
  const native=donor.sections.map(s=>Array.from(s.source_text,c=>corpus.runes.indexOf(c)).filter(x=>x>=0));
  const end=native[7];let j=0;
  assert(end.length===85 && end.map(p=>p===0?0:mod(p+k[j++])).every((c,i)=>c===corpus.pages[56].indices[i])&&j===84,"authentic p56 control");
  const target=corpus.pages.slice(15,23).flatMap(p=>p.indices).slice(20), fit=target.length-corpus.pages[22].indices.length;
  assert(target.length===1883 && fit===1752,"target framing");
  let fw="0";while(fw.length<target.length)fw=fw.replace(/./g,x=>x==="0"?"01":"0");
  const mask=Array.from(fw.slice(0,target.length),Number);
  const pos=[0,1].map(r=>mask.flatMap((x,i)=>x===r?[i]:[]));
  const split=t=>pos.map(a=>a.map(i=>t[i]));
  const enc=(p,origins,sign)=>{const s=origins.slice();return p.map((x,i)=>x===0?0:mod(x+sign*k[s[mask[i]]++]))};
  /** Exact reachable cursor set, including consuming ciphertext zero. */
  function reach(t,origin,sign){
    let states=new Set([origin]);
    for(let i=0;i<t.length;i++){
      const c=t[i],next=new Set();
      for(const j of states){if(c===0)next.add(j);if(mod(c-sign*k[j])!==0)next.add(j+1)}
      if(!next.size)return {dead:i,ends:[]};
      states=next;
    }
    return {dead:t.length,ends:[...states]};
  }
  function sweep(t){
    return [1,-1].map(sign=>{
      const survivors=[];let maxDead=-1,maxOrigins=[];
      for(let o=0;o<=3301;o++){
        const z=reach(t,o,sign);
        if(z.ends.length)survivors.push(o);
        if(z.dead>maxDead){maxDead=z.dead;maxOrigins=[o]}else if(z.dead===maxDead)maxOrigins.push(o);
      }
      return {sign,survivors,maxDead,maxOrigins,zeroOrigin:reach(t,0,sign)};
    });
  }
  const maxLag=Math.max(...pos.flatMap(a=>a.slice(1).map((p,i)=>p-a[i])));
  const train=[0,2,5,6,7,8].map(i=>native[i]);
  const count=Array(29).fill(1), lagCounts=Array.from({length:maxLag+1},()=>new Float64Array(29*29));
  for(const t of train){
    for(let i=0;i<t.length;i++){
      count[t[i]]++;
      for(let d=1;d<=Math.min(i,maxLag);d++)lagCounts[d][29*t[i-d]+t[i]]++;
    }
  }
  const tot=count.reduce((a,b)=>a+b,0), uni=count.map(x=>x/tot);
  const logUni=uni.map(Math.log);
  const logLag=lagCounts.map(a=>{
    const b=new Float64Array(29*29);
    for(let p=0;p<29;p++){let s=0;for(let q=0;q<29;q++)s+=a[29*p+q];for(let q=0;q<29;q++)b[29*p+q]=Math.log((a[29*p+q]+5*uni[q])/(s+5))}
    return b;
  });
  /** Exact per-rail lag-conditioned MAP: last plaintext rune and cursor are sufficient. */
  function viterbi(t,positions,origin,sign,previous=null){
    let states=new Map([[origin*29+(previous?.p??0),{score:0,cursor:origin,p:previous?.p??0,node:null}]]);
    for(let i=0;i<t.length;i++){
      const c=t[i], gap=i>0?positions[i]-positions[i-1]:previous?positions[i]-previous.pos:0, next=new Map();
      for(const v of states.values()){
        const choices=[];if(c===0)choices.push([0,v.cursor]);
        const p=mod(c-sign*k[v.cursor]);if(p!==0)choices.push([p,v.cursor+1]);
        for(const [q,cursor] of choices){
          const score=v.score+(gap===0?logUni[q]:logLag[gap][29*v.p+q]);
          const id=cursor*29+q;
          if(!next.has(id)||next.get(id).score<score)next.set(id,{score,cursor,p:q,node:{q,prev:v.node}});
        }
      }
      if(!next.size)return null;states=next;
    }
    let best=null;for(const v of states.values())if(best===null||v.score>best.score)best=v;
    const plain=[];for(let node=best.node;node;node=node.prev)plain.push(node.q);plain.reverse();
    return {score:best.score,cursor:best.cursor,p:best.p,plain};
  }
  function fitControl(c){
    const rails=split(c), prefixes=pos.map((a,i)=>rails[i].slice(0,a.filter(x=>x<fit).length));
    const sweeps=prefixes.map(sweep), options=[];
    for(const sign of [1,-1]){
      const best=[];
      for(let r=0;r<2;r++){
        const os=sweeps[r].find(v=>v.sign===sign).survivors;let winner=null;
        for(const origin of os){
          const z=viterbi(prefixes[r],pos[r].slice(0,prefixes[r].length),origin,sign);
          if(z&&(!winner||z.score>winner.score))winner={...z,origin};
        }
        if(winner)best.push(winner);
      }
      if(best.length===2)options.push({sign,best,score:best[0].score+best[1].score});
    }
    options.sort((a,b)=>b.score-a.score);
    if(!options.length)return {sweeps};
    const winner=options[0], full=Array(target.length).fill(-1), holdLegal=[];
    for(let r=0;r<2;r++){
      const z=winner.best[r],n=prefixes[r].length;
      z.plain.forEach((p,i)=>full[pos[r][i]]=p);
      const h=viterbi(rails[r].slice(n),pos[r].slice(n),z.cursor,winner.sign,{p:z.p,pos:pos[r][n-1]});
      holdLegal.push(!!h);if(h)h.plain.forEach((p,i)=>full[pos[r][n+i]]=p);
    }
    return {selectedSign:winner.sign,origins:winner.best.map(v=>v.origin),plain:full,holdLegal,counts:sweeps.map(a=>a.map(v=>v.survivors.length)),fitScore:winner.score/fit};
  }
  const controls=[];
  for(const [ids,o,s] of [[[1,3,4],[0,0],1],[[3,4,1],[17,113],1],[[4,1,3],[3299,3301],-1]]){
    const p=ids.flatMap(i=>native[i]).slice(0,target.length);
    const c=enc(p,o,s),rs=split(c),z=rs.map(sweep),got=fitControl(c);
    const trueRetained=z.map((a,i)=>a.find(v=>v.sign===s).survivors.includes(o[i]));
    const trueEnd=rs.map((t,i)=>reach(t,o[i],s).ends.includes(o[i]+split(p)[i].filter(x=>x!==0).length));
    assert(trueRetained.every(Boolean)&&trueEnd.every(Boolean),"positive exact reachability");
    controls.push({ids,o,s,trueRetained,trueEnd,allRailCounts:z.map(a=>a.map(v=>v.survivors.length)),fitCounts:got.counts,selectedSign:got.selectedSign,selectedOrigins:got.origins,fitScore:got.fitScore,holdLegal:got.holdLegal,fitMatch:got.plain?.slice(0,fit).filter((x,i)=>x===p[i]).length,holdMatch:got.plain?.slice(fit).filter((x,i)=>x===p[fit+i]).length,replay:got.plain?.every(x=>x>=0)?enc(got.plain,got.origins,got.selectedSign).every((x,i)=>x===c[i]):false});
  }
  const original=split(target).map(sweep),prefix=split(target).map((a,r)=>sweep(a.slice(0,pos[r].filter(x=>x<fit).length)));
  assert(original.every(a=>a.every(v=>v.survivors.length===0)),"original gate changed");
  return {p56Replay:85,maskPrefix:fw.slice(0,40),targetLength:target.length,fit,hold:target.length-fit,railLengths:pos.map(a=>a.length),fitRailLengths:pos.map(a=>a.filter(x=>x<fit).length),maxLag,original,prefix,controls};
}

if(require.main===module){
  const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
  const donor=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
  const output=experiment(corpus,donor);
  if(!output.controls.every(c=>c.replay&&c.holdMatch===131&&c.o.every((o,i)=>o===c.selectedOrigins[i])&&c.s===c.selectedSign))throw Error("control regression");
  console.log(JSON.stringify(output,null,2));
}
module.exports=experiment;
