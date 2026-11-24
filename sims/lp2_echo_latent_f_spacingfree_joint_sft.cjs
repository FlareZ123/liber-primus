"use strict";
// Agent 5: exact spacing-free latent-F shared-pad suffix inference at the two DJU BEI echoes.
// Run: node sims/lp2_echo_latent_f_spacingfree_joint_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function experiment(corpus,solved,literary,config={case:0,length:256}){
 const N=29,mod=x=>(x%N+N)%N, idx=new Map(corpus.runes.map((r,i)=>[r,i])),check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g," ");const a=[];for(const word of s.split(/ +/)){for(let i=0;i<word.length;){if(word.startsWith("ING",i)){a.push(21);i+=3}else if(word.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>word.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}}return a}
 const native=solved.sections.map(s=>({name:s.name,tape:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const lit=literary.map((text,i)=>({name:["Gibran","Shakespeare","Emerson"][i],tape:encode(text).slice(4000,44000)}));check(lit.every(x=>x.tape.length===40000),"literary length");

 const H=N+1,BOS=N,SIZE=H*H*N,lnN=Math.log(N);
 const L=config.length??256;
  function language(exclude){const u=new Float64Array(N),b=new Float64Array(N*N),t=new Float64Array(N*N*N),bu=new Float64Array(N),tb=new Float64Array(N*N);let total=0;
  for(const s of [...native,...lit]){if(exclude.includes(s.name))continue;const t0=[...s.tape].reverse();for(let i=0;i<t0.length;i++){const c=t0[i];u[c]++;total++;if(i>=1){let a=t0[i-1];b[a*N+c]++;bu[a]++}if(i>=2){let ab=t0[i-2]*N+t0[i-1];t[ab*N+c]++;tb[ab]++}}}
  for(let c=0;c<N;c++)u[c]=(u[c]+.5)/(total+N*.5);
  for(let a=0;a<N;a++)for(let c=0;c<N;c++)b[a*N+c]=(b[a*N+c]+20*u[c])/(bu[a]+20);
  for(let ab=0;ab<N*N;ab++)for(let c=0;c<N;c++)t[ab*N+c]=(t[ab*N+c]+12*b[(ab%N)*N+c])/(tb[ab]+12);
  return {u,b,t};
 }

 function rows(M){
  const P=Array.from({length:H*H},(_,i)=>{const a=Math.floor(i/H),b=i%H;return b===BOS?M.u:a===BOS?M.b.subarray(b*N,b*N+N):M.t.subarray((a*N+b)*N,(a*N+b+1)*N)});
  return {P,logP:P.map(row=>Float64Array.from(row,Math.log))}
 }
 // Scaled single-stream suffix likelihood under independent uniform pad.
 // Scale by N for every observed physical rune, so consuming emission
 // factor 1/N cancels and transparent F contributes N.
 function suffix(C,R){
  const n=C.length,T=Array.from({length:n+1},()=>new Float64Array(H*H)),V=Array.from({length:n+1},()=>new Float64Array(H*H)),Q=Array.from({length:n},()=>new Uint8Array(H*H));
  T[n].fill(1);
  for(let i=n-1;i>=0;i--)for(let a=0;a<H;a++)for(let b=0;b<H;b++){
   const z=a*H+b,p=R.P[z],lp=R.logP[z],off=b*H;let sum=0,best=-Infinity,qbest=0;
   if(C[i]===0){sum=N*p[0]*T[i+1][off];best=lnN+lp[0]+V[i+1][off]}
   for(let q=1;q<N;q++){sum+=p[q]*T[i+1][off+q];let v=lp[q]+V[i+1][off+q];if(v>best){best=v;qbest=q}}
   T[i][z]=sum;V[i][z]=best;Q[i][z]=qbest;
  }
  const zeros=new Uint8Array(n+1);zeros[n]=1;for(let i=n-1;i>=0;i--)zeros[i]=C[i]===0&&zeros[i+1];
  return {T,V,Q,zeros};
 }
 function allHold(C,i,a,b,R,Z){
  if(!Z[i])return [0,-Infinity];let w=1,l=0;
  for(;i<C.length;i++){const k=a*H+b;w*=N*R.P[k][0];l+=lnN+R.logP[k][0];a=b;b=0}
  return [w,l]
 }
 function joint(C,D,M,wantPath=true){
  const R=rows(M),n=C.length,m=D.length,A=suffix(C,R),B=suffix(D,R),stride=m+1,grid=new Map(),history=new Map(),start=Date.now();
  const code=(a0,b0,p)=>(a0*H+b0)*N+p,cellId=(i,j)=>i*stride+j;
  function cell(i,j){
   let id=cellId(i,j),x=grid.get(id);if(!x){x={sum:new Float64Array(SIZE),active:[],max:wantPath?new Float64Array(SIZE).fill(-Infinity):null,parent:wantPath?new Float64Array(SIZE).fill(-1):null};grid.set(id,x)}
   return x;
  }
  let total=0,best=-Infinity,terminal=null,states=0,cells=0,edges=0;
  function expand(i,j,a0,a,b0,b,w,v,par){
   const za=a0*H+a,zb=b0*H+b,ha=allHold(C,i,a0,a,R,A.zeros),hb=allHold(D,j,b0,b,R,B.zeros);
   // Disjoint sum: A consumes no further key, or B consumes no further
   // key but A does consume at least once. Max is idempotent.
   if(ha[0]){total+=w*ha[0]*B.T[j][zb];if(wantPath){let t=v+ha[1]+B.V[j][zb];if(t>best){best=t;terminal={i,j,a0,a,b0,b,par,end:"A"}}}}
   if(hb[0]){total+=w*hb[0]*Math.max(0,A.T[i][za]-ha[0]);if(wantPath){let t=v+hb[1]+A.V[i][za];if(t>best){best=t;terminal={i,j,a0,a,b0,b,par,end:"B"}}}}
   if(i===n||j===m)return;
   let ai=a0,ap=a,wa=1,la=0;
   for(let ii=i;ii<n;ii++){
    const ra=ai*H+ap,pA=R.P[ra],lA=R.logP[ra];let bi=b0,bp=b,wb=1,lb=0;
    for(let jj=j;jj<m;jj++){
     const rb=bi*H+bp,pB=R.P[rb],lB=R.logP[rb],delta=mod(C[ii]-D[jj]),to=cell(ii+1,jj+1),factor=w*wa*wb*N,logFactor=v+la+lb+lnN,off=(ap*H+bp)*N;
     edges++;
     for(let p=1;p<N;p++){
      let q=mod(p-delta);if(q===0)continue;const k=off+p,u=factor*pA[p]*pB[q];
      if(to.sum[k]===0)to.active.push(k);to.sum[k]+=u;
      if(wantPath){let x=logFactor+lA[p]+lB[q];if(x>to.max[k]){to.max[k]=x;to.parent[k]=par}}
     }
     if(D[jj]!==0)break;
     wb*=N*pB[0];lb+=lnN+lB[0];bi=bp;bp=0;
    }
    if(C[ii]!==0)break;
    wa*=N*pA[0];la+=lnN+lA[0];ai=ap;ap=0;
   }
  }
  expand(0,0,BOS,BOS,BOS,BOS,1,0,-1);
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){
   let id=cellId(i,j),x=grid.get(id);if(!x)continue;grid.delete(id);cells++;states+=x.active.length;
   const delta=mod(C[i-1]-D[j-1]);
   if(wantPath)history.set(id,{indices:Int32Array.from(x.active),parents:Float64Array.from(x.active,k=>x.parent[k])});
   for(const k of x.active){const p=k%N,h=Math.floor(k/N),a0=Math.floor(h/H),b0=h%H,q=mod(p-delta);expand(i,j,a0,p,b0,q,x.sum[k],wantPath?x.max[k]:0,id*SIZE+k)}
  }
  check(total>0&&Number.isFinite(total),"joint likelihood");
  const ind=A.T[0][BOS*H+BOS]*B.T[0][BOS*H+BOS];check(ind>0&&Number.isFinite(ind),"independent likelihood");
  const result={n,m,llr:Math.log(total)-Math.log(ind),logJointScaled:Math.log(total),logIndependentScaled:Math.log(ind),cells,states,edges,elapsedMs:Date.now()-start};
  if(!wantPath)return result;
  check(terminal,"terminal");
  const PA=new Int8Array(n).fill(-1),PB=new Int8Array(m).fill(-1);
  function traceTail(C,P,S,i,a,b){for(;i<C.length;i++){const q=S.Q[i][a*H+b];P[i]=q;a=b;b=q}}
  let {i,j,a0,a,b0,b,par,end}=terminal;
  if(end==="A"){PA.fill(0,i);traceTail(D,PB,B,j,b0,b)}else{PB.fill(0,j);traceTail(C,PA,A,i,a0,a)}
  while(par>=0){
   let id=Math.floor(par/SIZE),k=par%SIZE,ii=Math.floor(id/stride),jj=id%stride,p=k%N,q=mod(p-mod(C[ii-1]-D[jj-1]));
   PA[ii-1]=p;PB[jj-1]=q;const h=history.get(id),at=h.indices.indexOf(k);check(at>=0,"backpointer");const prev=h.parents[at];
   let pi=prev<0?0:Math.floor(Math.floor(prev/SIZE)/stride),pj=prev<0?0:Math.floor(prev/SIZE)%stride;
   PA.fill(0,pi,ii-1);PB.fill(0,pj,jj-1);par=prev;
  }
  check(PA.every(p=>p>=0)&&PB.every(p=>p>=0),"complete MAP");
  function key(C,P){let k=[];for(let i=0;i<C.length;i++){if(P[i]===0){check(C[i]===0,"F replay");continue}k.push(mod(C[i]-P[i]))}return k}
  const ka=key(C,PA),kb=key(D,PB);check(ka.slice(0,Math.min(ka.length,kb.length)).every((v,i)=>v===kb[i]),"shared MAP pad replay");
  return {...result,PA:Array.from(PA),PB:Array.from(PB),key:ka.length>=kb.length?ka:kb,bestScaledLog:best};
 }
 function smallChecks(M){
  for(const c of [0,5,12])for(const d of [0,5,12]){
   const z=joint([c],[d],M,false),u=M.u;let expected=0;
   for(let p=1;p<N;p++){let q=mod(p-c+d);if(q!==0)expected+=N*u[p]*u[q]}
   if(c===0)expected+=N*u[0]*(1-u[0]);if(d===0)expected+=N*u[0]*(1-u[0]);if(c===0&&d===0)expected+=N*N*u[0]*u[0];
   check(Math.abs(Math.exp(z.logJointScaled)-expected)<1e-10,"one-symbol exact marginal");
  }
 }
 function firstNoF(s){for(let i=4000;i<s.tape.length-L;i++){let p=s.tape.slice(i,i+L).reverse();if(p.slice(0,6).every(x=>x!==0))return p}throw Error("no native echo")}
 function plant(p,q,seed,shared){
  let z=seed>>>0;const rng=()=>z=(Math.imul(z,1664525)+1013904223)>>>0;
  const K=Array.from({length:L},()=>rng()%N),J=shared?K:K.slice(0,6).concat(Array.from({length:L-6},()=>rng()%N));
  function enc(P,keys){let k=0;return P.map(x=>x===0?0:mod(x+keys[k++]))}
  const c=enc(p,K),d=enc(q,J);check(c.slice(0,6).every((v,i)=>v===d[i]),"echo plant");
  return {c,d,K,J};
 }
 function score(C,D,M,known=null,wantPath=true){
  const head=joint(C.slice(0,6),D.slice(0,6),M,false),full=joint(C,D,M,wantPath);
  const middle=config.innerLength?joint(C.slice(0,config.innerLength),D.slice(0,config.innerLength),M,false):null;
  const res={innerLLR:middle?.llr??null,outerLLR:middle?full.llr-middle.llr:null,outerGain:middle?(full.llr-middle.llr)/(C.length-config.innerLength):null,prefixLLR:head.llr,fullLLR:full.llr,conditionalLLR:full.llr-head.llr,conditionalGain:(full.llr-head.llr)/(C.length-6),cells:full.cells,states:full.states,edges:full.edges,elapsedMs:full.elapsedMs,zeroA:C.filter(x=>x===0).length,zeroB:D.filter(x=>x===0).length};
  if(wantPath){res.candidateA=full.PA.slice(0,150).map(x=>corpus.translit[x]).join("");res.candidateB=full.PB.slice(0,150).map(x=>corpus.translit[x]).join("");res.mapKeyLength=full.key.length;if(known){res.accuracyA=full.PA.filter((p,i)=>p===known.p[i]).length;res.accuracyB=full.PB.filter((p,i)=>p===known.q[i]).length;res.keyCorrect=full.key.filter((p,i)=>p===known.K[i]).length}}
  return res;
 }
 const pairs=[[0,1],[0,2],[1,2]],which=config.case??0;
 if(which<6){
  const j=Math.floor(which/2),shared=which%2===0,[a,b]=pairs[j].map(i=>lit[i]),p=firstNoF(a),q=firstNoF(b);q.splice(0,6,...p.slice(0,6));const z=plant(p,q,853301+j,shared),M=language([a.name,b.name]);smallChecks(M);
  return {case:which,shared,donors:[a.name,b.name],length:L,...score(z.c,z.d,M,shared?{p,q,K:z.K}:null,config.wantPath??true)}
 }
 const tape=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),endA=6561,endB=12956;
 check(tape.length===12956,"original length");const C=tape.slice(endA-L,endA).reverse(),D=tape.slice(endB-L,endB).reverse();check(C.slice(0,6).every((v,i)=>v===D[i]),"original echo");
 const M=language([]);smallChecks(M);return {case:which,length:L,sourceEnds:[endA,endB],...score(C,D,M,null,config.wantPath??true)};
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2),{case:Number(process.argv[2]??0),length:Number(process.argv[3]??256),wantPath:process.argv[4]!=="sum",innerLength:process.argv[5]===undefined?undefined:Number(process.argv[5])}),null,2));
