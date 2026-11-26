'use strict';
// Agent6: p15 nonlinear plaintext-stride Fibonacci-prime orbit rank28 inversion.
const fs=require('node:fs');
const path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const core=function(data,which="all"){
 const s=JSON.parse(data[0]),M=28,N=29,mod=(x,m=M)=>(x%m+m)%m,check=(x,msg)=>{if(!x)throw Error(msg)};
 const c=s.pages.slice(16,23).flatMap(p=>p.indices),cut=s.pages.slice(16,19).reduce((a,p)=>a+p.indices.length,0),start=s.pages.slice(0,16).reduce((a,p)=>a+p.indices.length,0),AIO=[3,10,24];
 const sites=[];let at=0,w=0,o=0;const gs=new Set(s.runes);
 function flush(){if(w===1&&o>=start&&o<start+c.length)sites.push(o-start);w=0}
 for(const ch of data[1].split("%").slice(0,55).join("%")){if(gs.has(ch)){if(!w)o=at;w++;at++}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))flush()}flush();check(c.length===1744&&at===12956,"original scope");
 const primes=[];for(let n=2;primes.length<3301;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)primes.push(n)}
 const F=[];let u=0,v=1;do{F.push(u);[u,v]=[v,(u+v)%3301]}while(u!==0||v!==1);
 const q=F.length;check(q===1650,"Pisano orbit");const original=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 check(JSON.stringify([0,1,...F.slice(3,17)].map(x=>Math.abs(3301-primes[x])))===JSON.stringify(original),"printed source cells");
 const streams=[F.map(x=>mod(3301-primes[x])),F.map(x=>mod(Math.abs(3301-primes[x])))];
 const banks=streams.map(K=>Array.from({length:M},(_,a)=>Int8Array.from([...K,...K],x=>a*x%M)));
 const tokens=s.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
 function native(t){let out=[],ss=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const word=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<word.length;){const x=tokens.find(t=>word.startsWith(t.x,i));if(x){a.push(x.i);i+=x.x.length}else i++}if(a.length===1&&AIO.includes(a[0]))ss.push(out.length);out.push(...a)}return {out,ss}}
 const tr=native(data[2]).out,h1=new Float64Array(N),h2=new Float64Array(N*N),h3=new Float64Array(N**3),L=new Float64Array(N**3);
 for(let i=0;i<tr.length;i++){h1[tr[i]]++;if(i)h2[tr[i-1]*N+tr[i]]++;if(i>1)h3[(tr[i-2]*N+tr[i-1])*N+tr[i]]++}
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let n2=0,n3=0;for(let z=0;z<N;z++){n2+=h2[b*N+z];n3+=h3[(a*N+b)*N+z]}for(let z=0;z<N;z++){const p1=(h1[z]+.5)/(tr.length+N*.5),p2=(h2[b*N+z]+10*p1)/(n2+10);L[(a*N+b)*N+z]=Math.log((h3[(a*N+b)*N+z]+10*p2)/(n3+10))}}
 const pow=[],log=Array(N).fill(-1);let g=1;for(let i=0;i<M;i++){pow.push(g);log[g]=i;g=g*15%N}check(new Set(pow).size===28,"root");
 const rank=(p,e)=>p>e?p-1:p,unrank=(p,e)=>p>=e?p+1:p;
 function ev(x,hold,read){let t=0;const rs=new Int16Array(x.length).fill(-1),ts=new Int16Array(x.length).fill(-1);for(let i=1;i<x.length;i++){const d=mod(x[i]-x[i-1],N);rs[i]=d?(read===0?d-1:read===1?log[d]:x[i]-Number(x[i]>x[i-1])):-1;ts[i]=t%q;if(d||!hold)t++}return {rs,ts}}
 const stride=[Array.from({length:N},(_,p)=>p+1),primes.slice(0,N)];
 const key=(k,t)=>mod(k.sign*streams[k.kind][t]);
 function dec(x,k,E){let t=k.phase;const p=[x[0]];for(let i=1;i<x.length;i++){const z=E.rs[i]<0?k.e:unrank(mod(E.rs[i]-key(k,t)),k.e);p.push(z);if(E.rs[i]>=0||!k.hold)t=(t+stride[k.step][z])%q}return p}
 function enc(p,k){let t=k.phase,x=[p[0]];for(let i=1;i<p.length;i++){const u=x[i-1];if(p[i]===k.e){x.push(u);if(!k.hold)t=(t+stride[k.step][p[i]])%q;continue}const d=mod(rank(p[i],k.e)+key(k,t));x.push(k.read===2?d+Number(d>=u):mod(u+(k.read===1?pow[d]:d+1),N));t=(t+stride[k.step][p[i]])%q}return x}
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function score(p,a,b){let total=0;for(let i=a+2;i<b;i++)total+=L[(p[i-2]*N+p[i-1])*N+p[i]];return total/(b-a-2)}
 function search(x,ss,truth){
  let total=0,best=null,truthPresent=false,scored=0,stage=Array(30).fill(0),configs=[];
  const fit=ss.filter(i=>i>0&&i<cut),allowed=new Uint8Array(N);for(const p of AIO)allowed[p]=1;
  for(const hold of [false,true])for(const read of [0,1,2]){
   const E=ev(x,hold,read),R=E.rs,repeated=fit.some(i=>R[i]<0);let cfg=0;
   for(let e=0;e<N;e++){
    if(repeated&&!allowed[e])continue;
    for(let kind=0;kind<2;kind++)for(const sign of [1,-1])for(let step=0;step<2;step++){
     const advance=stride[step],K=streams[kind].map(v=>mod(sign*v));
     // Precompute deterministic transition table for each (cipher rank,phase).
     const P=new Uint8Array(M*q),T=new Uint16Array(M*q);
     for(let rr=0;rr<M;rr++)for(let t=0;t<q;t++){const z=unrank((rr-K[t]+28)%28,e),idx=rr*q+t;P[idx]=z;T[idx]=(t+advance[z])%q}
     const EStep=hold?0:advance[e];
     for(let phase=0;phase<q;phase++){
      let t=phase,at=1,j=0,z=x[0];
      for(;j<fit.length;j++){
       const stop=fit[j];
       for(;at<=stop;at++){
        const rr=R[at];if(rr<0){z=e;t+=EStep;if(t>=q)t-=q}else{const k=rr*q+t;z=P[k];t=T[k]}
       }
       if(!allowed[z])break;stage[j]++;
      }
      if(j!==fit.length)continue;
      total++;cfg++;const k={hold,read,e,kind,sign,step,phase};if(truth&&Object.keys(truth.k).every(f=>k[f]===truth.k[f]))truthPresent=true;
      const p=dec(x,k,E),v=score(p,0,cut);scored++;
      if(!best||v>best.train)best={k,train:v,p}
     }
    }
   }
   configs.push({hold,read,candidates:cfg});
  }
  const res={total,scored,stage,configs,fitSingletons:fit.length,heldSingletons:ss.filter(i=>i>=cut).length,truthPresent};
  if(!best)return res;
  const {p,...b}=best;check(equal(enc(p,b.k),x),"replay");
  return {...res,best:{...b,held:score(p,cut,p.length),heldSingletonHits:ss.filter(i=>i>=cut&&AIO.includes(p[i])).length,excerpt:p.slice(cut,cut+150).map(i=>s.translit[i]).join(""),...(truth?{heldRuneHits:p.slice(cut).filter((v,i)=>v===truth.p[cut+i]).length,keyExact:Object.keys(truth.k).every(f=>b.k[f]===truth.k[f])}:{})}};
 }
 const controls=[];for(const [j,o,k] of [[3,1400,{hold:true,read:0,e:21,kind:0,phase:763,sign:1,step:1}],[4,12400,{hold:false,read:2,e:28,kind:1,phase:1481,sign:-1,step:0}]]){
 if(which!=="all"&&which!==String(j))continue;const n=native(data[j]),p=n.out.slice(o,o+c.length),ss=n.ss.filter(i=>i>=o&&i<o+c.length).map(i=>i-o),x=enc(p,k);check(equal(dec(x,k,ev(x,k.hold,k.read)),p),"control inverse");controls.push({donor:j,offset:o,truth:k,...search(x,ss,{p,k})})
 }
 return {model:"rank28 source orbit, phase advanced by decoded GP prime or ordinal, signed/absolute prime distance, both signs, every initial phase/escape, hold/consume, three transports; no holdout fit",n:c.length,cut,period:q,original:which==="all"||which==="original"?search(c,sites,null):null,controls}
};
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),process.argv[2]||'all'),null,2));
module.exports={core};
