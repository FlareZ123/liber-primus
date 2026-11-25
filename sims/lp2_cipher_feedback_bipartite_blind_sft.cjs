"use strict";
function prepare(gp,texts){
 const q=29,mod=x=>(x%q+q)%q,chart=new Map(gp.translit.map((s,i)=>[s,i]));
 for(const [a,b] of [["K","C"],["V","U"],["Z","S"],["Q","C"],["ING","NG"],["IO","IA"]])if(chart.has(b)&&!chart.has(a))chart.set(a,chart.get(b));
 function spell(t){let out=[];for(const m of t.toUpperCase().match(/[A-Z]+/g)||[]){let w=[],i=0;for(;i<m.length;){let n=Math.min(3,m.length-i);for(;n>0&&!chart.has(m.slice(i,i+n));n--);if(!n)break;w.push(chart.get(m.slice(i,i+n)));i+=n}if(i===m.length)out.push(...w)}return out}
 const donors=texts.map(spell),n1=new Float64Array(q),n2=new Float64Array(q*q),n3=new Float64Array(q*q*q),d2=new Float64Array(q),d3=new Float64Array(q*q);
 const T=donors[0];for(let i=0;i<T.length;i++){const c=T[i];n1[c]++;if(i){const b=T[i-1];n2[b*q+c]++;d2[b]++;if(i>1){const a=T[i-2];n3[(a*q+b)*q+c]++;d3[a*q+b]++}}}
 const p1=Array.from(n1,x=>(x+0.5)/(T.length+0.5*q)),l1=p1.map(Math.log),l2=new Float64Array(q*q),l3=new Float64Array(q*q*q);
 for(let a=0;a<q;a++)for(let b=0;b<q;b++)l2[a*q+b]=Math.log((n2[a*q+b]+12*p1[b])/(d2[a]+12));
 for(let a=0;a<q;a++)for(let b=0;b<q;b++)for(let c=0;c<q;c++){const j=a*q+b;l3[j*q+c]=Math.log((n3[j*q+c]+12*Math.exp(l2[b*q+c]))/(d3[j]+12))}
 return {donors,l1,l2,l3,training:T.length};
}
function solve(C,fit,model,seed=123,options={}){
 const q=29,mod=x=>(x%q+q)%q,check=(x,m)=>{if(!x)throw Error(m)}, {l1,l2,l3}=model;
 const n=fit,ns=C.length,edges=new Int32Array(q*q*q),u=new Uint8Array(ns),v=new Uint8Array(ns);
 for(let i=2;i<ns;i++){u[i]=C[i-1];v[i]=C[i-2];if(i<n)edges[(u[i]*q+v[i])*q+C[i]]++}
 let state=seed>>>0;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
 const roots=Array.from({length:q},(_,i)=>[Math.cos(2*Math.PI*i/q),Math.sin(2*Math.PI*i/q)]);
 const vars=Array.from({length:58},()=>[]),affected=Array.from({length:58},()=>[]);
 for(let i=2;i<n;i++){vars[u[i]].push(i);vars[q+v[i]].push(i)}
 for(let j=0;j<58;j++)affected[j]=[...new Set(vars[j].flatMap(i=>[i,i+1,i+2]).filter(i=>i>=4&&i<n))].sort((a,b)=>a-b);
 function dec(A,U,V,end=ns){const P=new Uint8Array(end);for(let i=2;i<end;i++)P[i]=(A*C[i]+U[u[i]]+V[v[i]])%q;return P}
 function trig(P,lo,hi){let s=0;for(let i=Math.max(4,lo);i<hi;i++)s+=l3[(P[i-2]*q+P[i-1])*q+P[i]];return s}
 function unary(A){let L=new Float64Array(q*q*q);for(let i=0;i<q*q;i++)for(let c=0;c<q;c++){const count=edges[i*q+c];if(count)for(let s=0;s<q;s++)L[i*q+s]+=count*l1[(A*c+s)%q]}return L}
 function normalize(U,V){const g=U[0];for(let i=0;i<q;i++){U[i]=mod(U[i]-g);V[i]=mod(V[i]+g)}}
 function uniscore(L,U,V){let s=0;for(let i=0;i<q;i++)for(let j=0;j<q;j++)s+=L[(i*q+j)*q+(U[i]+V[j])%q];return s}
 function asc(L,U,V,sweeps){let score=-Infinity;for(let it=0;it<sweeps;it++){for(let phase=0;phase<2;phase++){const a=phase?V:U,b=phase?U:V;for(let i=0;i<q;i++){let best=-Infinity,kbest=a[i];for(let k=0;k<q;k++){let s=0;for(let j=0;j<q;j++)s+=L[(phase?(j*q+i):(i*q+j))*q+(k+b[j])%q];if(s>best+1e-9){best=s;kbest=k}}a[i]=kbest}}const s=uniscore(L,U,V);if(s<=score+1e-9)break;score=s}normalize(U,V);return uniscore(L,U,V)}
 // First-harmonic continuous synchronization. H[i,j] has preferred phase U_i+V_j.
 function spectral(L){
  const R=new Float64Array(q*q),I=new Float64Array(q*q);
  for(let i=0;i<q*q;i++)for(let k=0;k<q;k++){R[i]+=L[i*q+k]*roots[k][0];I[i]+=L[i*q+k]*roots[k][1]}
  let U=Array.from({length:q},()=>2*Math.PI*rand()),V=Array.from({length:q},()=>2*Math.PI*rand());
  for(let it=0;it<40;it++){for(let phase=0;phase<2;phase++){const a=phase?V:U,b=phase?U:V;for(let i=0;i<q;i++){let x=0,y=0;for(let j=0;j<q;j++){const k=phase?j*q+i:i*q+j,co=Math.cos(b[j]),si=Math.sin(b[j]);x+=R[k]*co+I[k]*si;y+=I[k]*co-R[k]*si}a[i]=Math.atan2(y,x)}}}
  return [U.map(x=>mod(Math.round(x*q/(2*Math.PI)))),V.map(x=>mod(Math.round(x*q/(2*Math.PI))))];
 }
 // Exact conditional trigram score for each offset change, with incremental cached plaintext.
 function refine(A,U,V,sweeps=12,temp0=0){
  const P=dec(A,U,V,n),mask=new Uint8Array(n);let s=trig(P,4,n),best=s,bU=U.slice(),bV=V.slice();
  const order=Array.from({length:58},(_,i)=>i);
  for(let it=0;it<sweeps;it++){
   for(let j=57;j>0;j--){const k=Math.floor(rand()*(j+1));[order[j],order[k]]=[order[k],order[j]]}
   let changed=0;const temp=temp0*(1-it/sweeps);
   for(const j of order){const a=j<q?U:V,k=j%q,old=a[k],ids=vars[j],terms=affected[j];if(!ids.length)continue;
    for(const i of ids)mask[i]=1;
    let base=0;for(const i of terms)base+=l3[(P[i-2]*q+P[i-1])*q+P[i]];
    let b=base,delta=0;for(let d=1;d<q;d++){let x=0;for(const i of terms){const c=P[i]+d*mask[i],z=P[i-1]+d*mask[i-1],y=P[i-2]+d*mask[i-2];x+=l3[((y%q)*q+(z%q))*q+c%q]}const t=x+(temp>0?-temp*Math.log(-Math.log(Math.max(1e-12,rand()))):0);if(t>b+1e-9){b=t;delta=d}}
    if(delta){let x=0;for(const i of ids)P[i]=(P[i]+delta)%q;for(const i of terms)x+=l3[(P[i-2]*q+P[i-1])*q+P[i]];s+=x-base;a[k]=(old+delta)%q;changed++}
    for(const i of ids)mask[i]=0;
    if(s>best+1e-7){best=s;bU=U.slice();bV=V.slice()}
   }
   if(!changed)break;
  }
  normalize(bU,bV);const Pbest=dec(A,bU,bV,n),score=trig(Pbest,4,n);check(Math.abs(score-best)<1e-5,"incremental score drift");return {A,U:bU,V:bV,score};
 }
 let cand=[];
 for(let A=1;A<q;A++){
  const L=unary(A),seen=new Set();let local=[];
  for(let restart=0;restart<(options.restarts??6);restart++){
   let [U,V]=restart<3?spectral(L):[Array.from({length:q},()=>Math.floor(rand()*q)),Array.from({length:q},()=>Math.floor(rand()*q))];const score=asc(L,U,V,20),id=U.join()+":"+V.join();if(seen.has(id))continue;seen.add(id);local.push({A,U,V,score});
  }
  local.sort((a,b)=>b.score-a.score);cand.push(...local.slice(0,2));
 }
 cand.sort((a,b)=>b.score-a.score);const shortlist=cand.slice(0,options.shortlist??20),results=[];
 for(const k of shortlist){const z=refine(k.A,k.U.slice(),k.V.slice(),options.sweeps??12,0);results.push({...z,uni:k.score})}
 results.sort((a,b)=>b.score-a.score);const best=results[0];
 const P=dec(best.A,best.U,best.V);return {best,fit:best.score/(n-4),holdout:trig(P,n,ns)/(ns-n),plain:Array.from(P),uniRanking:shortlist.map(z=>({A:z.A,score:z.score/(n-2)})),ranked:results.slice(0,5).map(x=>({A:x.A,score:x.score/(n-4)}))};
}
function experiment(gp,texts,which="controls",options={}){
 const model=prepare(gp,texts),C0=gp.pages.filter(p=>p.page>=40&&p.page<=53).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices),N=C0.length,fit=options.fit??2200,q=29,mod=x=>(x%q+q)%q;
 const inv=x=>{for(let y=1;y<q;y++)if(x*y%q===1)return y;throw Error("inverse")};
 let s=0xc0ffeed;const rand=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296},r=()=>Math.floor(rand()*q);
 const render=P=>P.map(x=>gp.translit[x]).join("");
 function plant(j){const donor=model.donors[1+j],start=1000+j*700,P=donor.slice(start,start+N),a=[7,19][j],H=Array.from({length:q},r),J=Array.from({length:q},r),entry=[r(),r()];let [u,v]=entry;const C=P.map(x=>{const c=mod(a*x+H[u]+J[v]);v=u;u=c;return c});return {P,C,a,H,J,entry}}
 function report(C,truth,seed){const z=solve(C,fit,model,seed,options),k=z.best;let replay=true;const a=inv(k.A);for(let i=2;i<C.length;i++)if(mod(a*(z.plain[i]-k.U[C[i-1]]-k.V[C[i-2]]))!==C[i])replay=false;if(!replay)throw Error("inverse replay");return {...z,fitExact:truth?z.plain.slice(2,fit).filter((x,i)=>x===truth.P[i+2]).length:null,holdExact:truth?z.plain.slice(fit).filter((x,i)=>x===truth.P[i+fit]).length:null,trueA:truth?inv(truth.a):null,preview:render(z.plain.slice(fit,fit+150)),truthPreview:truth?render(truth.P.slice(fit,fit+150)):null}}
 const out={N,fit,train:model.training,controls:[]};
 if(which!=="original")for(let j=0;j<2;j++){const t=plant(j);out.controls.push(report(t.C,t,0x140013+j))}
 if(which==="original")out.original=report(C0,null,0x140015);
 return out;
}
module.exports={prepare,solve,experiment};
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
 const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),texts=["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(x=>read("resources/control/"+x));
 console.log(JSON.stringify(experiment(gp,texts,process.argv[2]??"controls"),null,2));
}
