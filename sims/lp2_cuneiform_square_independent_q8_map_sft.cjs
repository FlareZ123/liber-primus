'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/cicada2014-openpuff-magic-squares.txt"];
const experiment=function experiment(inputs){
 const [corp,nat,sq]=inputs,db=JSON.parse(corp),native=JSON.parse(nat),N=29,q=8,mod=x=>(x%N+N)%N,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(x,m)=>{if(!x)throw Error(m)};
 const mapp=new Map(db.runes.map((x,i)=>[x,i])),donors=native.sections.map(s=>[...s.source_text].filter(x=>mapp.has(x)).map(x=>mapp.get(x)));
 const C=[db.pages[36].indices.slice(99,238),db.pages[37].indices.slice(0,91),db.pages[37].indices.slice(91,189),db.pages[37].indices.slice(189,228).concat(db.pages[38].indices.slice(0,57)),db.pages[38].indices.slice(57,186)];
 const lens=C.map(x=>x.length),cuts=lens.map(n=>Math.min(80,Math.floor(n*.75)));assert(eq(lens,[139,91,98,96,129]),"source spans");
 const squares=sq.trim().split(/\r?\n\s*\r?\n/).map(b=>b.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number))); const matrices=[squares[0],squares[2]];
 assert(eq(matrices.map(M=>M[0].reduce((s,x)=>s+x,0)),[3301,1033]),"source matrices");
 function inverse(M){const n=M.length,A=M.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>+(i===j))));for(let j=0;j<n;j++){let k=A.findIndex((r,i)=>i>=j&&r[j]);assert(k>=0,"singular");[A[j],A[k]]=[A[k],A[j]];let b=1;while(mod(A[j][j]*b)!==1)b++;A[j]=A[j].map(x=>mod(x*b));for(let i=0;i<n;i++)if(i!==j){const c=A[i][j];A[i]=A[i].map((x,h)=>mod(x-c*A[j][h]));}}return A.map(r=>r.slice(n))}
 function mix(A,M,rev){const out=lens.map(()=>[]),cache=new Map();for(let t=0;t<Math.max(...lens);t++){const act=lens.flatMap((n,i)=>t<n?[i]:[]),sig=act.join(",");if(!cache.has(sig)){const sub=act.map(i=>act.map(j=>M[i][j]));cache.set(sig,rev?inverse(sub):sub)}const B=cache.get(sig);act.forEach((i,k)=>out[i].push(mod(B[k].reduce((s,v,j)=>s+v*A[act[j]][t],0))))}return out}
 function model(exclude=-1){let un=Array(N).fill(1),bi=Array.from({length:N},()=>Array(N).fill(0));donors.forEach((d,i)=>{if(i===exclude)return;for(let t=0;t<d.length;t++){un[d[t]]++;if(t)bi[d[t-1]][d[t]]++}});const tot=un.reduce((s,x)=>s+x,0);un=un.map(x=>x/tot);return {initial:un.map(Math.log),pair:bi.map(r=>{const s=r.reduce((a,b)=>a+b,0);return r.map((x,j)=>Math.log((x+12*un[j])/(s+12)))})}}
 function encode(p,key,hold){let phase=0;return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key[phase]);phase=(phase+1)%q;return y})}
 function decodePrefix(c,key,holds,hold){let phase=0;const p=c.map((x,i)=>{if(holds[i])return 0;const y=mod(x-key[phase]);assert(!hold||y!==0,"illegal consuming F");phase=(phase+1)%q;return y});return {p,phase}}
 function score(p,lm){return p.reduce((s,x,i)=>s+(i?lm.pair[p[i-1]][x]:lm.initial[x]),0)}
 function fit(c,lm,hold){
  const zeros=c.flatMap((x,i)=>x===0?[i]:[]),maskN=hold?2**zeros.length:1;assert(maskN<=4096,"fit mask budget");let winner=null,legal=0;
  for(let mask=0;mask<maskN;mask++){
   const held=Array(c.length).fill(false);zeros.forEach((v,i)=>{if(hold&&(mask&(1<<i)))held[v]=true});
   const phases=[],allowed=Array.from({length:q},()=>Array(N).fill(true));let phase=0;
   for(let i=0;i<c.length;i++){if(held[i])phases.push(-1);else{phases.push(phase);if(hold)allowed[phase][c[i]]=false;phase=(phase+1)%q}}
   if(allowed.some(r=>r.every(x=>!x)))continue;
   const U=Array.from({length:q},()=>new Float64Array(N)),E=Array.from({length:q},()=>new Float64Array(N*N));let constant=0;
   if(held[0])constant+=lm.initial[0];else for(let k=0;k<N;k++)U[0][k]+=lm.initial[mod(c[0]-k)];
   for(let i=1;i<c.length;i++){const a=phases[i-1],b=phases[i];if(a<0&&b<0)constant+=lm.pair[0][0];
    else if(a<0)for(let k=0;k<N;k++)U[b][k]+=lm.pair[0][mod(c[i]-k)];
    else if(b<0)for(let k=0;k<N;k++)U[a][k]+=lm.pair[mod(c[i-1]-k)][0];
    else{assert(b===(a+1)%q,"cycle edge");for(let k=0;k<N;k++){const row=lm.pair[mod(c[i-1]-k)];for(let l=0;l<N;l++)E[a][k*N+l]+=row[mod(c[i]-l)]}}
   }
   legal++;let best=-Infinity,key=null;
   for(let start=0;start<N;start++)if(allowed[0][start]){
    let d=new Float64Array(N).fill(-Infinity);d[start]=U[0][start];const parent=[];
    for(let j=1;j<q;j++){const nd=new Float64Array(N).fill(-Infinity),pr=new Int8Array(N).fill(-1);for(let b=0;b<N;b++)if(allowed[j][b])for(let a=0;a<N;a++){const v=d[a]+E[j-1][a*N+b]+U[j][b];if(v>nd[b]){nd[b]=v;pr[b]=a}}d=nd;parent.push(pr)}
    for(let end=0;end<N;end++){const v=d[end]+E[q-1][end*N+start]+constant;if(v>best){best=v;key=Array(q);key[q-1]=end;for(let j=q-1;j>0;j--)key[j-1]=parent[j-1][key[j]]}}
   }
   if(key&&(!winner||best>winner.score)){const decoded=decodePrefix(c,key,held,hold);assert(Math.abs(best-score(decoded.p,lm))<1e-7,"MAP objective");assert(eq(encode(decoded.p,key,hold),c),"fit replay");winner={key,score:best,mask,held,...decoded}}
  }
  return {winner,legal,masks:maskN};
 }
 function suffix(c,key,phase,last,lm,hold){let count=0,best=null;function rec(i,k,prev,p,s){if(i===c.length){count++;if(!best||s>best.score)best={p:p.slice(),score:s};return}const x=c[i],y=mod(x-key[k]);if(hold&&x===0){p.push(0);rec(i+1,k,0,p,s+lm.pair[prev][0]);p.pop()}if(!hold||y!==0){p.push(y);rec(i+1,(k+1)%q,y,p,s+lm.pair[prev][y]);p.pop()}}
 rec(0,phase,last,[],0);return {count,best}}
 const render=p=>p.map(x=>db.translit[x]).join(" ");
 function attack(D,lm,cut,hold,truth=null,keyTruth=null,full=false){const f=fit(D.slice(0,cut),lm,hold);if(!f.winner)return {masks:f.masks,legal:f.legal,fit:null};const w=f.winner,h=suffix(D.slice(cut),w.key,w.phase,w.p.at(-1),lm,hold),p=h.best?w.p.concat(h.best.p):null;if(p)assert(eq(encode(p,w.key,hold),D),"full replay");
  const result={masks:f.masks,legal:f.legal,key:w.key,mask:w.mask,fit:w.score/cut,holdout:h.best?h.best.score/(D.length-cut):null,holdoutPaths:h.count,fitPreview:render(w.p.slice(0,24)),holdoutPreview:h.best?render(h.best.p.slice(0,24)):null,complete:p?render(p):null};
  if(truth){result.keyExact=eq(w.key,keyTruth);result.fitCorrect=w.p.filter((x,i)=>x===truth[i]).length;result.holdoutCorrect=h.best?h.best.p.filter((x,i)=>x===truth[cut+i]).length:0;result.fitN=cut;result.holdoutN=D.length-cut}
  if(full){const g=fit(D,lm,hold);result.fullMAP=g.winner?{score:g.winner.score/D.length,key:g.winner.key,mask:g.winner.mask,plaintext:render(g.winner.p),replay:true}:null}
  return result;
 }
 let seed=0x33011033;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n};
 const controls=[];
 for(const hold of [false,true])for(let plant=0;plant<3;plant++){
  const ix=lens.map((n,i)=>(i+plant)%6),P=lens.map((n,i)=>{const d=donors[ix[i]],at=rnd(d.length-n+1);return d.slice(at,at+n)}),keys=lens.map(()=>Array.from({length:q},()=>rnd(N))),D=P.map((p,i)=>encode(p,keys[i],hold)),M=matrices[plant%2],cipher=mix(D,M,false),unmixed=mix(cipher,M,true);assert(eq(D,unmixed),"plant matrix inverse");
  const lanes=unmixed.map((d,i)=>attack(d,model(ix[i]),cuts[i],hold,P[i],keys[i]));controls.push({plant,hold,donors:ix,lanes});
 }
 const original=[];
 for(let j=0;j<2;j++){const M=matrices[j],D=mix(C,M,true);assert(eq(mix(D,M,false),C),"matrix replay");for(const hold of [false,true]){
   const lanes=D.map((d,i)=>attack(d,model(),cuts[i],hold,null,null,true));original.push({matrix:[3301,1033][j],hold,lanes})
 }}
 return {q,lens,cuts,controls,original};
};
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
