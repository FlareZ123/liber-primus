#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const src=JSON.parse(data[0]), N=29,Q=28,mod=(x,m=Q)=>(x%m+m)%m,AIO=[24,10,3], allowed=new Set(AIO);
 const C=src.pages.slice(16,23).flatMap(p=>p.indices),begin=src.pages.slice(0,16).reduce((a,p)=>a+p.indices.length,0),cut=src.pages.slice(16,19).reduce((a,p)=>a+p.indices.length,0);
 const ensure=(ok,s)=>{if(!ok)throw Error(s)};
 const words=[];let cur=[],at=0,start=0;const ix=new Map(src.runes.map((v,i)=>[v,i]));
 function flush(){if(cur.length)words.push({start,indices:cur});cur=[]}
 for(const ch of data[1].split("%").slice(0,55).join("%")){if(ix.has(ch)){if(!cur.length)start=at;cur.push(ix.get(ch));at++}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))flush()}flush();
 ensure(at===12956&&words.length===2896,"transcript");
 const sites=words.filter(w=>w.indices.length===1&&w.start>=begin&&w.start<begin+C.length).map(w=>w.start-begin);
 ensure(C.length===1744&&sites.length===17&&sites[0]===21,"source counts");
 const tokens=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(t){let out=[],singleton=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<w.length;){const tok=tokens.find(x=>w.startsWith(x.s,i));if(tok){a.push(tok.i);i+=tok.s.length}else i++}if(a.length===1&&allowed.has(a[0]))singleton.push(out.length);out.push(...a)}return {out,singleton}}
 const train=native(data[2]).out, h1=new Float64Array(N),h2=new Float64Array(N*N),h3=new Float64Array(N**3);
 for(let i=0;i<train.length;i++){h1[train[i]]++;if(i)h2[train[i-1]*N+train[i]]++;if(i>1)h3[(train[i-2]*N+train[i-1])*N+train[i]]++}
 const tot=train.length, log3=new Float64Array(N**3);
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let s2=0,s3=0;for(let c=0;c<N;c++){s2+=h2[b*N+c];s3+=h3[(a*N+b)*N+c]}for(let c=0;c<N;c++){const p1=(h1[c]+.5)/(tot+N*.5),p2=(h2[b*N+c]+10*p1)/(s2+10);log3[(a*N+b)*N+c]=Math.log((h3[(a*N+b)*N+c]+10*p2)/(s3+10))}}
 const score=(p,a,b)=>{let s=0;for(let i=a+2;i<b;i++)s+=log3[(p[i-2]*N+p[i-1])*N+p[i]];return s/(b-a-2)};
 const ioc=p=>{let h=Array(N).fill(0);for(const v of p)h[v]++;return h.reduce((a,b)=>a+b*(b-1),0)/(p.length*(p.length-1))};
 const M=[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]],I=[[12,1,4,17],[8,0,14,7],[19,18,0,20],[7,16,1,18]];
 const id=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>+(i===j)));
 const mul=(a,b)=>a.map(row=>b[0].map((_,j)=>mod(row.reduce((s,v,i)=>s+v*b[i][j],0))));
 ensure(JSON.stringify(mul(M,I))===JSON.stringify(id)&&JSON.stringify(mul(I,M))===JSON.stringify(id),"matrix inverse");
 const tr=a=>a[0].map((_,j)=>a.map(r=>r[j]));
 const matrices=[M,I,tr(M),tr(I)],names=["ordinal-forward","ordinal-inverse","transpose-forward","transpose-inverse"];
 const powers=[],logs=Array(N).fill(-1);let v=1;for(let i=0;i<Q;i++){powers.push(v);logs[v]=i;v=v*15%N}ensure(new Set(powers).size===Q,"primitive");
 function rows(A,n){let h=id,out=[];while(out.length<n){out.push(...h);h=mul(A,h)}return out.slice(0,n)}
 const rank=(p,e)=>p>e?p-1:p, gp=(p,e)=>p>=e?p+1:p;
 const dot=(row,key)=>mod(row[0]*key[0]+row[1]*key[1]+row[2]*key[2]+row[3]*key[3]);
 function makeClock(c,hold){let cursor=0,ks=new Int32Array(c.length),ds=new Int32Array(c.length);ks[0]=-1;for(let j=1;j<c.length;j++){const d=mod(c[j]-c[j-1],N);ds[j]=d;ks[j]=cursor;if(d||!hold)cursor++}return {ks,ds,n:cursor}}
 function dec(c,H,key,e,hold,read,clock=makeClock(c,hold)){let p=[c[0]];for(let j=1;j<c.length;j++){const d=clock.ds[j];p.push(d?gp(mod((read?logs[d]:d-1)-dot(H[clock.ks[j]],key)),e):e)}return p}
 function enc(p,H,key,e,hold,read){let c=[p[0]],t=0;for(let j=1;j<p.length;j++){if(p[j]===e){c.push(c[j-1]);if(!hold)t++}else{const r=mod(rank(p[j],e)+dot(H[t++],key));c.push(mod(c[j-1]+(read?powers[r]:r+1),N))}}return c}
 const packed=(a,b,c,d)=>((a*Q+b)*Q+c)*Q+d;
 const num=Q**4;
 function search(c,ss,truth=null){
  const s=ss.filter(i=>i>0),result=[],allH=matrices.map(a=>rows(a,c.length));let overall=null,allPerfect=0,total=0,truthHits=0;
  for(const hold of [false,true]){
   const clock=makeClock(c,hold),fit=s.filter(i=>i<cut&&clock.ds[i]!==0).slice(0,4);
   ensure(fit.length===4,"four nonrepeat fitting sites");
   const mr=s.some(i=>i<cut&&clock.ds[i]===0), masks=[new Uint32Array(num),new Uint32Array(num)];
   for(let read=0;read<2;read++)for(let e=0;e<N;e++){
    if(mr&&!allowed.has(e))continue;
    const rs=fit.map(i=>AIO.filter(x=>x!==e).map(p=>mod((read?logs[clock.ds[i]]:clock.ds[i]-1)-rank(p,e))));
    for(const a of rs[0])for(const b of rs[1])for(const c of rs[2])for(const d of rs[3])masks[read][packed(a,b,c,d)]|=1<<e;
   }
   for(let m=0;m<4;m++){
    const H=allH[m],R=fit.map(i=>H[clock.ks[i]]);let candidates=0,perfect=0,exact=0,minimum=Infinity,best=null;
    for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c0=0;c0<Q;c0++)for(let d=0;d<Q;d++){
     const k=packed(...R.map(row=>mod(row[0]*a+row[1]*b+row[2]*c0+row[3]*d)));
     if(!(masks[0][k]|masks[1][k]))continue;
     const key=[a,b,c0,d];
     for(let read=0;read<2;read++){let bits=masks[read][k];while(bits){const e=31-Math.clz32(bits&-bits);bits&=bits-1;const p=dec(c,H,key,e,hold,read,clock);ensure(fit.every(i=>allowed.has(p[i])),"fit");const fail=s.filter(i=>!allowed.has(p[i])).length,failTrain=s.filter(i=>i<cut&&!allowed.has(p[i])).length,failHeld=fail-failTrain;minimum=Math.min(minimum,fail);if(!fail)perfect++;if(truth&&p.every((v,i)=>v===truth[i]))exact++;candidates++;
      const trainScore=score(p,1,cut),heldScore=score(p,cut,c.length);
      if(!best||trainScore>best.train){ensure(enc(p,H,key,e,hold,read).every((v,i)=>v===c[i]),"replay");best={m:names[m],key,e,hold,read,train:trainScore,held:heldScore,fail,failTrain,failHeld,trainIoC:ioc(p.slice(1,cut)),heldIoC:ioc(p.slice(cut)),excerpt:p.slice(cut,cut+90).map(x=>src.translit[x]).join(""),heldExact:truth?p.slice(cut).filter((v,i)=>v===truth[cut+i]).length:null}}
     }}
    }
    result.push({matrix:names[m],hold,fit,candidates,perfect,exact,minContradictions:minimum===Infinity?null:minimum,best});total+=candidates;allPerfect+=perfect;truthHits+=exact;if(best&&(!overall||best.train>overall.train))overall=best;
   }
  }
  return {candidates:total,perfect:allPerfect,exact:truthHits,overall,models:result};
 }
 const original=search(C,sites),controls=[];
 for(let d=0;d<2;d++){
  const {out,singleton}=native(data[3+d]),offset=d?6000:4200,p=out.slice(offset,offset+C.length),ss=singleton.filter(i=>i>=offset&&i<offset+C.length).map(i=>i-offset);
  const m=d===0?0:3,key=d===0?[9,18,2,7]:[15,5,23,11],e=d===0?28:21,hold=d===0,read=d, H=rows(matrices[m],C.length),c=enc(p,H,key,e,hold,read);
  const res=search(c,ss,p);ensure(res.exact>=1&&res.overall.heldExact===C.length-cut,"blind positive");
  controls.push({plant:{matrix:names[m],key,e,hold,read,sites:ss.length,offset},...res});
 }
 return {source:{length:C.length,cut,sites,repeatSites:sites.filter(i=>C[i]===C[i-1])},original,controls};
}
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
