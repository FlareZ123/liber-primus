"use strict";
// Agent 7: arbitrary hidden-state differential alphabet support capacity.
function run(corpus,controls){
 const A=29,R=n=>Array.from({length:n},(_,i)=>i),assert=(x,m)=>{if(!x)throw Error(m)};
 /** Exact maximum count in an axis-aligned q×q×q tensor box. */
 function box(F,A,q){
  const M=new Uint32Array(A*A),S=[],candidates=[];let best=0,witness=null,nodes=0,leaves=0,processed=0;
  const top=(a,q)=>{let b=new Uint32Array(q);for(const v of a){if(v<=b[0])continue;b[0]=v;for(let k=0;k<q-1&&b[k]>b[k+1];k++){let x=b[k];b[k]=b[k+1];b[k+1]=x;}}let z=0;for(let v of b)z+=v;return z;};
  function bounds(){let row=R(A).map(i=>top(M.subarray(i*A,(i+1)*A),q)),col=R(A).map(j=>top(R(A).map(i=>M[i*A+j]),q));return {row,ub:Math.min(top(row,q),top(col,q))};}
  function outer(st){if(S.length===q){candidates.push({S:S.slice(),ub:bounds().ub});return;}for(let i=st;i<=A-(q-S.length);i++){for(let j=0;j<M.length;j++)M[j]+=F[i*A*A+j];S.push(i);outer(i+1);S.pop();for(let j=0;j<M.length;j++)M[j]-=F[i*A*A+j];}}
  outer(0);candidates.sort((a,b)=>b.ub-a.ub);
  for(const x of candidates){if(x.ub<=best)break;processed++;M.fill(0);for(let i of x.S)for(let j=0;j<M.length;j++)M[j]+=F[i*A*A+j];let row=bounds().row,order=R(A).sort((a,b)=>row[b]-row[a]),col=new Uint32Array(A),sel=[];
   function dfs(st,rs){nodes++;let remain=q-sel.length;if(remain===0){leaves++;let v=top(col,q);if(v>best){best=v;witness=[x.S.slice(),sel.slice(),R(A).sort((a,b)=>col[b]-col[a]).slice(0,q)];}return;}const p=top(col,q);for(let z=st;z<=A-remain;z++){let add=0;for(let j=z;j<z+remain;j++)add+=row[order[j]];if(rs+add<=best||p+add<=best)break;let i=order[z];sel.push(i);for(let j=0;j<A;j++)col[j]+=M[i*A+j];dfs(z+1,rs+row[i]);for(let j=0;j<A;j++)col[j]-=M[i*A+j];sel.pop();}}
   dfs(0,0);
  }
  if(witness){let check=0;for(let i of witness[0])for(let j of witness[1])for(let k of witness[2])check+=F[(i*A+j)*A+k];assert(check===best,"witness");}
  return {q,best,witness,processed,nodes,leaves,outer:candidates.length,maxOuterBound:candidates[0].ub};
 }
 function tensor(d,A){let f=new Uint32Array(A**3);for(let i=2;i<d.length;i++)f[(d[i-2]*A+d[i-1])*A+d[i]]++;return f;}
 let seed=35719;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 // Independent exhaustive small-tensor check (including zero and ties).
 let bruteTests=0;for(let a of [4,5,6])for(let q of [2,3])for(let t=0;t<5;t++){let f=Uint32Array.from({length:a**3},()=>t===0?0:rnd()%8),sets=[];function rec(s,st){if(s.length===q){sets.push(s.slice());return;}for(let i=st;i<=a-(q-s.length);i++){s.push(i);rec(s,i+1);s.pop();}}rec([],0);let best=0;for(let x of sets)for(let y of sets)for(let z of sets){let n=0;for(let i of x)for(let j of y)for(let k of z)n+=f[(i*a+j)*a+k];best=Math.max(best,n);}assert(box(f,a,q).best===best,"brute mismatch");bruteTests++;}
 const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices),C=pages.flat(),N=C.length,mod=x=>(x+A)%A;
 const dif=x=>x.slice(1).map((v,i)=>mod(v-x[i]));
 const f=tensor(dif(C),A),fp=new Uint32Array(A**3);for(const p of pages){let h=tensor(dif(p),A);for(let i=0;i<h.length;i++)fp[i]+=h[i];}
 const continuous=[3,4].map(q=>box(f,A,q)),reset=[3,4].map(q=>box(fp,A,q));
 const mask=[];let off=0;for(const p of pages){for(let j=0;j<p.length;j++)if(j===0||j+2>=p.length)if(off+j<=N-3)mask.push(off+j);off+=p.length;}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(txt){const words=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;}else if(w.startsWith("IO",i)){a.push(27);i+=2;}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length;}}return a;});return {p:words.flat(),word:words.flatMap((w,i)=>w.map(()=>i))};}
 /** Exact sliding maximum trigram multiplicity, with optional fixed relative start exclusions. */
 function scan(seq,n,exclusions,caps){let hist=new Uint32Array(n+1),f=new Uint32Array(A**3),mx=0;function add(v){if(v<0)return;let k=f[v]++;if(k)hist[k]--;hist[k+1]++;if(k+1>mx)mx=k+1;}function rem(v){if(v<0)return;let k=--f[v];hist[k+1]--;if(k)hist[k]++;while(mx&&!hist[mx])mx--;}for(let j=0;j<=n-3;j++)add(seq[j]);let min=Infinity,max=0,passes=caps.map(()=>0),windows=seq.length-n+3;for(let i=0;i<windows;i++){if(i){rem(seq[i-1]);add(seq[i+n-3]);}for(let j of exclusions)rem(seq[i+j]);min=Math.min(min,mx);max=Math.max(max,mx);for(let k=0;k<caps.length;k++)passes[k]+=+(mx<=caps[k]);for(let j of exclusions)add(seq[i+j]);}return {windows,min,max,passes};}
 let results=[];for(const [name,txt] of controls){let {p,word}=gp(txt),all=Int32Array.from({length:p.length-2},(_,i)=>(p[i]*A+p[i+1])*A+p[i+2]),nof=Int32Array.from(all,(v,i)=>p[i]&&p[i+1]&&p[i+2]?v:-1),prevnof=Int32Array.from(nof,(v,i)=>i&&p[i-1]?v:-1),within=Int32Array.from(all,(v,i)=>word[i]===word[i+2]?v:-1),withinNoF=Int32Array.from(nof,(v,i)=>word[i]===word[i+2]?v:-1),cc=continuous.map(x=>x.best),rc=reset.map(x=>x.best);
 // Full original differential tape is one rune shorter than the printed text.
 results.push({name,n:p.length,continuous:scan(all,N-1,[],cc),continuousNoF:scan(nof,N-1,[],cc),continuousSkipF:scan(prevnof,N-1,[0],cc),withinWord:scan(within,N-1,[],cc),withinWordNoF:scan(withinNoF,N-1,[],cc),pageReset:scan(all,N,mask,rc),pageResetNoF:scan(nof,N,mask,rc),pageResetSkipF:scan(prevnof,N,mask,rc)});
 }
 // Hidden state may change arbitrarily and may depend on previous absolute cipher;
 // encode two genuine native samples per q and both F conventions, then verify every
 // plaintext trigram count against its TRUE unknown-chart support box (not just max).
 const plants=[];let donor=gp(controls[0][1]).p;
 for(let q of [3,4])for(let t=0;t<2;t++)for(let mode of ["ordinary","literalF-physical","literalF-skipAccumulator"]){const keys=R(q).map(()=>{let a=R(A);for(let i=A-1;i>0;i--){let j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;});const p=donor.slice(1000+t*4000,1000+t*4000+N),c=[],acc0=rnd()%A;let acc=acc0,physical=acc0;for(let i=0;i<p.length;i++){let s=(rnd()+physical)%q;let v=mode!=="ordinary"&&p[i]===0?0:mod(acc+keys[s][p[i]]);if(mode!=="literalF-skipAccumulator"||p[i]!==0)acc=v;physical=v;c.push(v);}let d=dif(c),T=tensor(d,A),counts=new Uint32Array(A**3);for(let i=1;i+2<p.length;i++){if(mode!=="ordinary"&&(!p[i]||!p[i+1]||!p[i+2]))continue;if(mode==="literalF-skipAccumulator"&&!p[i-1])continue;counts[(p[i]*A+p[i+1])*A+p[i+2]]++;}let tested=0,maxPlain=0;for(let id=0;id<counts.length;id++)if(counts[id]){let x=Math.floor(id/A/A),y=Math.floor(id/A)%A,z=id%A,b=0;for(let i of new Set(keys.map(k=>k[x])))for(let j of new Set(keys.map(k=>k[y])))for(let k of new Set(keys.map(k=>k[z])))b+=T[(i*A+j)*A+k];assert(counts[id]<=b,"native plant support failure");tested++;maxPlain=Math.max(maxPlain,counts[id]);}plants.push({q,t,mode,tested,maxPlain});}
 return {N,continuousTripleCount:f.reduce((a,b)=>a+b,0),pageResetTripleCount:fp.reduce((a,b)=>a+b,0),pages:pages.length,maskedStarts:mask.length,bruteTests,continuous,reset,results,plants};
}
module.exports={run};
if(require.main===module){const fs=require("node:fs"),read=p=>fs.readFileSync(p,"utf8"),files=["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),files.map(f=>[f,read("resources/control/"+f)])),null,2));}
