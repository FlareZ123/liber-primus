'use strict';
// Issue #2687. Exact q8 cyclic max-sum prefix key inference.
const fs=require('node:fs');
function experiment(co,src){
 const A=29,Q=8,B=139,mod=x=>(x%29+29)%29,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),check=(x,s)=>{if(!x)throw Error(s)};
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);check(C.length===1883&&co.pages[15].indices.length===159,"source lengths");
 const prime=[];for(let x=2;prime.length<C.length+1;x++)if(prime.every(p=>x%p!==0))prime.push(x);const mul=prime.filter(x=>x!==29).map(x=>x%29),inv=mul.map(x=>{for(let y=1;y<A;y++)if(x*y%A===1)return y;throw Error("inverse")});
 const donorNames=["0_koan_1","0_loss_of_divinity"],ix=new Map(co.runes.map((x,i)=>[x,i])),native=src.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x))}));
 const u=new Float64Array(A).fill(.5),bi=new Float64Array(A*A),bt=new Float64Array(A),tr=new Float64Array(A**3),tt=new Float64Array(A*A);for(const {name,p} of native){if(donorNames.includes(name))continue;p.forEach((x,i)=>{u[x]++;if(i){let y=p[i-1];bi[y*A+x]++;bt[y]++;if(i>1){let a=p[i-2]*A+y;tr[a*A+x]++;tt[a]++}}})}
 const n=u.reduce((a,b)=>a+b,0),log=new Float64Array(30*30*A);for(let x=0;x<=A;x++)for(let y=0;y<=A;y++)for(let z=0;z<A;z++){let p1=u[z]/n,p2=y===A?p1:(bi[y*A+z]+4*p1)/(bt[y]+4),p3=x===A||y===A?p2:(tr[(x*A+y)*A+z]+8*p2)/(tt[x*A+y]+8);log[(x*30+y)*A+z]=Math.log(p3)}
 function lp(x,y,z){return log[(x*30+y)*A+z]}function score(p){let s=0;for(let i=0;i<p.length;i++)s+=lp(i>1?p[i-2]:A,i?p[i-1]:A,p[i]);return s}
 function enc(p,k,start=0){let j=start;return {c:p.map(x=>x===0?0:(mul[j]*x+k[j++%Q])%A),end:()=>j}}
 function max(arr){let m=-Infinity;for(let x of arr)if(x>m)m=x;return m}
 // Exact max-sum over a cycle of 8 triple factors. Fix first two variables,
 // solve the remaining chain; use only admissible upper bounds for pruning.
 function ring(F,D,lower=-Infinity){
  const M=F.map(max),other=M.slice(2,6).reduce((a,b)=>a+b,0),pairs=[];
  const m1=Array(D[1]).fill(-Infinity),m6=Array(D[0]).fill(-Infinity),m7=new Float64Array(D[0]*D[1]).fill(-Infinity);
  for(let b=0;b<D[1];b++)for(let c=0;c<D[2];c++)for(let d=0;d<D[3];d++)m1[b]=Math.max(m1[b],F[1][(b*D[2]+c)*D[3]+d]);
  for(let a=0;a<D[6];a++)for(let b=0;b<D[7];b++)for(let c=0;c<D[0];c++)m6[c]=Math.max(m6[c],F[6][(a*D[7]+b)*D[0]+c]);
  for(let a=0;a<D[7];a++)for(let b=0;b<D[0];b++)for(let c=0;c<D[1];c++){const i=b*D[1]+c;m7[i]=Math.max(m7[i],F[7][(a*D[0]+b)*D[1]+c])}
  for(let a=0;a<D[0];a++)for(let b=0;b<D[1];b++){let m=-Infinity;for(let c=0;c<D[2];c++)m=Math.max(m,F[0][(a*D[1]+b)*D[2]+c]);pairs.push({a,b,ub:m+m1[b]+other+m6[a]+m7[a*D[1]+b]})}
  pairs.sort((a,b)=>b.ub-a.ub);let best=lower,key=null,visited=0;
  for(const {a,b,ub} of pairs){if(ub<best-1e-8)break;visited++;let dp=new Float64Array(D[2]*D[3]);for(let c=0;c<D[2];c++)for(let d=0;d<D[3];d++)dp[c*D[3]+d]=F[0][(a*D[1]+b)*D[2]+c]+F[1][(b*D[2]+c)*D[3]+d];const back=[];
   for(let t=2;t<=5;t++){const x=D[t],y=D[t+1],z=D[t+2],nx=new Float64Array(y*z).fill(-Infinity),arg=new Int8Array(y*z),f=F[t];for(let i=0;i<x;i++)for(let j=0;j<y;j++){const v=dp[i*y+j],off=(i*y+j)*z,o=j*z;for(let k=0;k<z;k++){const s=v+f[off+k];if(s>nx[o+k]){nx[o+k]=s;arg[o+k]=i}}}dp=nx;back[t]=arg}
   let val=best,tail=null;for(let x=0;x<D[6];x++)for(let y=0;y<D[7];y++){const s=dp[x*D[7]+y]+F[6][(x*D[7]+y)*D[0]+a]+F[7][(y*D[0]+a)*D[1]+b];if(s>val){val=s;tail=[x,y]}}
   if(tail){best=val;key=[a,b,0,0,0,0,...tail];for(let t=5;t>=2;t--)key[t]=back[t][key[t+1]*D[t+2]+key[t+2]]}
  }return {best,key,visited,pairs:pairs.length}
 }
 // Independently brute-force a small ring; test the exact DP and bound.
 let seed=0x2687a024;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 for(let h=0;h<8;h++){const D=Array(8).fill(2),F=Array.from({length:8},()=>Float64Array.from({length:8},()=>-(rand()%100)/17));let best=-Infinity;for(let m=0;m<256;m++){const k=D.map((_,i)=>(m>>i)&1),s=F.reduce((s,f,i)=>s+f[4*k[i]+2*k[(i+1)%8]+k[(i+2)%8]],0);best=Math.max(best,s)}check(Math.abs(ring(F,D).best-best)<1e-9,"ring toy")}
 function fit(c){
  const zeros=c.map((v,i)=>v===0?i:-1).filter(i=>i>=0);check(zeros.length<=15,"prefix mask cap");const zeroMap=new Map(zeros.map((v,i)=>[v,i]));let best=-Infinity,bestFit=null,masks=0,pruned=0,pairs=0;
  for(let mask=0;mask<2**zeros.length;mask++){
   const held=c.map((v,i)=>v===0&&((mask>>zeroMap.get(i))&1)!==0),clock=[];let j=0;const forbid=Array(Q).fill(0);for(let i=0;i<c.length;i++){if(held[i])clock.push(-1);else{clock.push(j);forbid[j%Q]|=1<<c[i];j++}}
   const dom=forbid.map(f=>Array.from({length:A},(_,k)=>k).filter(k=>!(f&(1<<k))));if(dom.some(x=>!x.length))continue;masks++;
   const refs=clock.map((j,i)=>j<0?{ph:-1,v:0}:{ph:j%Q,vs:dom[j%Q].map(k=>mod(inv[j]*(c[i]-k)))}),sent={ph:-1,v:A},terms=Array.from({length:Q},()=>[]);let constant=0;
   for(let i=0;i<c.length;i++){const row=[i>1?refs[i-2]:sent,i?refs[i-1]:sent,refs[i]],first=row.find(x=>x.ph>=0);if(!first){constant+=lp(row[0].v,row[1].v,row[2].v);continue}const q=first.ph,rr=row.map(x=>x.ph<0?{off:-1,v:x.v}:{off:(x.ph-q+Q)%Q,vs:x.vs});check(rr.every(x=>x.off<=2),"nonlocal factor");terms[q].push(rr)}
   const D=dom.map(x=>x.length),F=terms.map((t,q)=>{const d0=D[q],d1=D[(q+1)%Q],d2=D[(q+2)%Q],f=new Float64Array(d0*d1*d2);for(let a=0;a<d0;a++)for(let b=0;b<d1;b++)for(let d=0;d<d2;d++){let s=0;for(const row of t){const x=row[0],y=row[1],z=row[2],vx=x.off<0?x.v:x.vs[x.off===0?a:x.off===1?b:d],vy=y.off<0?y.v:y.vs[y.off===0?a:y.off===1?b:d],vz=z.off<0?z.v:z.vs[z.off===0?a:z.off===1?b:d];s+=lp(vx,vy,vz)}f[(a*d1+b)*d2+d]=s}return f});
   const ub=constant+F.reduce((s,f)=>s+max(f),0);if(ub<best-1e-8){pruned++;continue}
   let rot=0;for(let q=1;q<Q;q++)if(D[q]*D[(q+1)%Q]<D[rot]*D[(rot+1)%Q])rot=q;const rotate=a=>a.slice(rot).concat(a.slice(0,rot)),sol=ring(rotate(F),rotate(D),best-constant);pairs+=sol.visited;if(!sol.key)continue;
   const key=Array(Q);sol.key.forEach((x,i)=>key[(i+rot)%Q]=dom[(i+rot)%Q][x]);const p=clock.map((j,i)=>j<0?0:mod(inv[j]*(c[i]-key[j%Q])));const s=score(p);check(Math.abs(s-(sol.best+constant))<1e-7&&eq(enc(p,key).c,c),"factor/replay");if(s>best){best=s;bestFit={key,p,score:s,cursor:j,mask,held:held.filter(Boolean).length}}
  }return {...bestFit,zeros:zeros.length,masks,pruned,pairs}
 }
 function continuation(c,k,start,prefix){let st=new Map([[`${start},${prefix.at(-2)},${prefix.at(-1)}`,{j:start,x:prefix.at(-2),y:prefix.at(-1),s:0,prev:null,p:null}]]),peak=1;for(let i=0;i<c.length;i++){const nx=new Map;for(const v of st.values()){const p=mod(inv[v.j]*(c[i]-k[v.j%Q])),o=[];if(c[i]===0)o.push([0,v.j]);if(p!==0)o.push([p,v.j+1]);for(const [p,j] of o){const s=v.s+lp(v.x,v.y,p),id=`${j},${v.y},${p}`;if(!nx.has(id)||s>nx.get(id).s)nx.set(id,{j,x:v.y,y:p,s,prev:v,p})}}if(!nx.size)return {dead:i,peak};st=nx;peak=Math.max(peak,st.size)}let end=[...st.values()].sort((a,b)=>b.s-a.s)[0],p=[];for(let v=end;v.prev;v=v.prev)p.push(v.p);p.reverse();check(eq(enc(p,k,start).c,c),"suffix replay");return {dead:null,peak,p,score:end.s,end:end.j}}
 function run(c,truth,key){const f=fit(c.slice(0,B));if(!f.key)return {fit:f};const h=continuation(c.slice(B),f.key,f.cursor,f.p),res={key:f.key,keyExact:key?eq(f.key,key):null,prefixCorrect:truth?f.p.filter((x,i)=>x===truth[i]).length:null,prefixScore:f.score/B,prefix:f.p.map(x=>co.translit[x]).join(""),zeros:f.zeros,masks:f.masks,pruned:f.pruned,pairs:f.pairs,cursor:f.cursor,held:f.held,suffix:h.dead!==null?{dead:h.dead,peak:h.peak}:{dead:null,peak:h.peak,score:h.score/(c.length-B),correct:truth?h.p.filter((x,i)=>x===truth[B+i]).length:null,n:h.p.length,preview:h.p.slice(0,80).map(x=>co.translit[x]).join("")}};return res}
 const keys=[[7,22,3,14,11,2,18,25],[16,0,9,4,27,13,5,21]],controls=donorNames.map((name,i)=>{const p=native.find(x=>x.name===name).p,c=enc(p,keys[i]).c;return {name,n:p.length,generatedPrefixZeros:c.slice(0,B).filter((x,i)=>x===0&&p[i]!==0).length,...run(c,p,keys[i])}}),pass=controls.every(c=>c.keyExact&&c.prefixCorrect===B&&c.suffix?.correct===c.n-B);
 const original=pass?run(C,null,null):null;
 return {N:C.length,B,sourceBlackOffset:20,controlKeys:keys,controls,pass,original,classification:pass?"frozen prefix exact key fit and withheld continuation":"control gate failed; original unscored"};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(...paths.map(p=>JSON.parse(fs.readFileSync(p,'utf8')))),null,2));
