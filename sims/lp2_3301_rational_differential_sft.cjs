'use strict';
// Read-only rational BASE29 differential receiver; no CI required.
const fs=require('node:fs'),path=require('node:path');
function run(data,nativeData){
  const M=3301, B=29, mod=(x,m)=>((x%m)+m)%m;
  const digits=Uint8Array.from({length:M},(_,r)=>Math.floor(B*r/M)%28), next=Uint16Array.from({length:M},(_,r)=>B*r%M);
  const log=new Int8Array(29).fill(-1), pow=[];for(let i=0,v=1;i<28;i++,v=v*15%29){log[v]=i;pow.push(v)}
  const map=new Map(data.runes.map((x,i)=>[x,i]));
  const src=nativeData.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>map.has(x)).map(x=>map.get(x))}));
  const holdNames=["0_welcome","0_koan_1","0_loss_of_divinity"],count=Array(28).fill(.5);
  for(const {name,p} of src)if(!holdNames.includes(name))for(const x of p)if(x!==28)count[x]++;
  const total=count.reduce((a,b)=>a+b),weights=Float64Array.from(count.map(x=>Math.log(28*x/total)));
  const modes=[];for(const rank of ["linear","log15"])for(const advance of ["all","nonrepeat"])for(const sign of [1,-1])modes.push({rank,advance,sign});
  const rankOf=(delta,mode)=>mode.rank==="linear"?delta-1:log[delta];
  const deltaOf=(r,mode)=>mode.rank==="linear"?r+1:pow[r];
  function encode(p,seed,mode,iv=0){let state=seed,c=iv;const out=[c];for(const x of p){if(x!==28)c=(c+deltaOf(mod(x+mode.sign*digits[state],28),mode))%29;out.push(c);if(x!==28||mode.advance==="all")state=next[state]}return out}
  function decode(C,seed,mode){let state=seed;const out=[];for(let i=1;i<C.length;i++){const delta=mod(C[i]-C[i-1],29);out.push(delta?mod(rankOf(delta,mode)-mode.sign*digits[state],28):28);if(delta||mode.advance==="all")state=next[state]}return out}
  function census(C,cut=C.length-1){
    const dif=Uint8Array.from({length:cut},(_,i)=>mod(C[i+1]-C[i],29));let n=0;for(const d of dif)if(d)n++;
    const summaries=[];let globalBest=null,globalTop2=null;
    for(const mode of modes){
      const ds=Int8Array.from(dif,d=>d?rankOf(d,mode):-1);let best=null,top=null,ties=[];
      const counts=new Uint16Array(28);
      for(let seed=1;seed<M;seed++){
        counts.fill(0);let r=seed;const s=mode.sign;
        for(let i=0;i<ds.length;i++){const v=ds[i];if(v>=0){let x=v-s*digits[r];if(x<0)x+=28;else if(x>=28)x-=28;counts[x]++;r=next[r]}else if(mode.advance==="all")r=next[r]}
        let score=0,a=0,b=0;for(let j=0;j<28;j++){const q=counts[j];score+=q*weights[j];if(q>=a){b=a;a=q}else if(q>b)b=q}
        if(!best||score>best.score){best={seed,mode,score};ties=[best]}else if(score===best.score)ties.push({seed,mode,score});
        if(!top||a+b>top.count)top={seed,mode,count:a+b};
      }
      summaries.push({mode,best,top,ties});if(!globalBest||best.score>globalBest.score)globalBest=best;if(!globalTop2||top.count>globalTop2.count)globalTop2=top;
    }
    return {n,markers:cut-n,best:globalBest,top:globalTop2,ties:summaries.flatMap(x=>x.ties).filter(x=>x.score===globalBest.score),modes:summaries}
  }
  function freq(p){const h=Array(28).fill(0);for(const x of p)if(x!==28)h[x]++;const n=h.reduce((a,b)=>a+b,0),q=h.slice().sort((a,b)=>b-a);return {n,top2:q[0]+q[1],fraction:(q[0]+q[1])/n,score:h.reduce((s,x,i)=>s+x*weights[i],0)/n}}
  const render=p=>p.map(x=>data.translit[x]).join(" ");
  const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const chapters=ranges.map(([a,b])=>{const C=data.pages.slice(a,b+1).flatMap(p=>p.indices),g=census(C),p=decode(C,g.best.seed,g.best.mode);if(encode(p,g.best.seed,g.best.mode,C[0]).join()!==C.join())throw Error("original chapter replay failed");return {pages:[a,b],...g,top2Fraction:g.top.count/g.n,bestScorePerRune:g.best.score/g.n,bestPrefix:render(p.slice(0,70))}});
  const C=data.pages.slice(0,56).flatMap(p=>p.indices),cut=data.pages.slice(0,40).reduce((s,p)=>s+p.indices.length,0)-1;
  const fit=census(C,cut),p=decode(C,fit.best.seed,fit.best.mode);
  if(encode(p,fit.best.seed,fit.best.mode,C[0]).join()!==C.join())throw Error("whole replay failed");
  const original={fitLength:cut,holdoutLength:p.length-cut,fit,fitStats:freq(p.slice(0,cut)),holdoutStats:freq(p.slice(cut)),fitPrefix:render(p.slice(0,100)),holdoutPrefix:render(p.slice(cut,cut+100)),replay:true};
  original.tiePredictions=[...new Set(fit.ties.map(x=>decode(C,x.seed,x.mode).slice(cut).join(',')))].length;
  const controls=holdNames.map((name,i)=>{const p=src.find(s=>s.name===name).p,mode=modes[[0,3,6][i]],seed=[1033,3300,1777][i],C=encode(p,seed,mode,7+i),cut=Math.floor(p.length*.67),g=census(C,cut),q=decode(C,g.best.seed,g.best.mode);if(encode(q,g.best.seed,g.best.mode,C[0]).join()!==C.join())throw Error("control replay failed");const tieTapes=g.ties.map(x=>decode(C,x.seed,x.mode));return {name,seed,mode,cut,selected:g.best,ties:g.ties,distinctHeldoutTapes:new Set(tieTapes.map(t=>t.slice(cut).join(','))).size,trueTapeInFitTie:tieTapes.some(t=>t.join()===p.join()),heldoutConsensusCorrect:p.slice(cut).filter((x,j)=>tieTapes.every(t=>t[cut+j]===x)).length,fitCorrect:q.slice(0,cut).filter((x,j)=>x===p[j]).length,holdoutCorrect:q.slice(cut).filter((x,j)=>x===p[j+cut]).length,holdoutLength:p.length-cut,fitStats:freq(q.slice(0,cut)),holdoutStats:freq(q.slice(cut)),nativeStats:freq(p)}});
  return {parameters:{M,B,states:M-1,rankModes:["linear","log15"],reserved:28,fitPages:[0,39],holdoutPages:[40,55],modes},original,chapters,controls,native:src.map(s=>({name:s.name,...freq(s.p)}))};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
