"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function pilot(raw,donor=0,iterations=60){
 const gp=JSON.parse(raw[0]),A=29,AA=A*A,AAA=A*AA,tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),mod=x=>(x%A+A)%A;
 function spell(t){t=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const p=[];for(let j=0;j<t.length;){const v=t.startsWith("ING",j)?{t:"ING",i:21}:t.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>t.startsWith(x.t,j));if(!v)throw Error("token");p.push(v.i);j+=v.t.length}return p}
 // Preserve word seams so contractions do not cross Latin word boundaries.
 const text=raw.slice(1).map(t=>[...(t.toUpperCase().match(/[A-Z]+/g)||[])].flatMap(spell));
 const reserve=16000,held=text[donor].slice(-reserve),B=new Float64Array(AA).fill(.25),U=new Float64Array(A).fill(.25);
 for(const t of text){const s=t.slice(0,-reserve);for(let i=0;i<s.length;i++){U[s[i]]++;if(i)B[s[i-1]*A+s[i]]++}}
 let su=U.reduce((a,b)=>a+b,0);for(let i=0;i<A;i++)U[i]/=su;
 for(let q=0;q<A;q++){let s=0;for(let p=0;p<A;p++)s+=B[q*A+p];for(let p=0;p<A;p++)B[q*A+p]/=s}
 const frames=gp.pages.filter(p=>p.page<56&&p.indices.length).map(p=>({page:p.page,n:p.indices.length-1}));
 const train=frames.filter(p=>p.page<40),test=frames.filter(p=>p.page>=40);let offset=0;
 let seed=0x3329d000+donor;function R(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2**32}
 function perm(){const p=Array.from({length:A},(_,i)=>i);for(let i=A-1;i;i--){const j=Math.floor(R()*(i+1));[p[i],p[j]]=[p[j],p[i]]}return p}
 const key=Array.from({length:A},(_,q)=>{const p=perm(),rare=Array.from({length:A},(_,i)=>i).sort((a,b)=>Math.abs(B[q*A+a]-.00664)-Math.abs(B[q*A+b]-.00664)).slice(0,5),e=rare[Math.floor(R()*rare.length)],j=p.indexOf(e);[p[0],p[j]]=[p[j],p[0]];return p});
 const C=frames.map(f=>{const P=held.slice(offset,offset+f.n);offset+=f.n;if(P.length!==f.n)throw Error("short plant");let q=0;const d=P.map(p=>{const v=key[q].indexOf(p);q=p;return v});return {...f,P,d}});
 const tr=C.filter(f=>f.page<40),te=C.filter(f=>f.page>=40);
 function sink(RR,rounds=12){for(let q=0;q<A;q++){const base=q*AA;for(let k=0;k<rounds;k++){for(let d=0;d<A;d++){let s=0;for(let p=0;p<A;p++)s+=RR[base+d*A+p];for(let p=0;p<A;p++)RR[base+d*A+p]/=s}for(let p=0;p<A;p++){let s=0;for(let d=0;d<A;d++)s+=RR[base+d*A+p];for(let d=0;d<A;d++)RR[base+d*A+p]/=s}}}}
 // Minimum-cost square assignment (Hungarian potentials).
 function hard(RR){return Array.from({length:A},(_,q)=>{const u=new Float64Array(A+1),v=new Float64Array(A+1),p=new Int32Array(A+1),way=new Int32Array(A+1);for(let i=1;i<=A;i++){p[0]=i;let j0=0;const min=new Float64Array(A+1).fill(Infinity),used=new Uint8Array(A+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=A;j++)if(!used[j]){const c=-Math.log(Math.max(1e-30,RR[q*AA+(i0-1)*A+j-1]))-u[i0]-v[j];if(c<min[j]){min[j]=c;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=A;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta}j0=j1}while(p[j0]);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}const K=new Array(A);for(let j=1;j<=A;j++)K[p[j]-1]=j-1;return K})}
 function score(frames,K){let gain=0,exact=0,n=0,preview=[];for(const f of frames){let q=0;for(let t=0;t<f.d.length;t++){const p=K[q][f.d[t]];gain+=Math.log((t?B[q*A+p]:U[p])*A);exact+=p===f.P[t];n++;if(preview.length<100)preview.push(p);q=p}}return {gain:gain/n,exact,n,preview}}
 const RR=new Float64Array(AAA);for(let q=0;q<A;q++)for(let d=0;d<A;d++)for(let p=0;p<A;p++)RR[q*AA+d*A+p]=Math.exp((R()-.5)*3)*(d===0?Math.exp(-70*Math.abs(B[q*A+p]-.00664)):1);sink(RR);
 const trace=[],M=new Float64Array(AAA),F=new Float64Array(Math.max(...tr.map(f=>f.n+1))*A),sc=new Float64Array(F.length/A),b1=new Float64Array(A),b2=new Float64Array(A),E=new Float64Array(AAA);
 let best=null,bestK=null;
 for(let it=0;it<iterations;it++){
  for(let d=0;d<A;d++)for(let q=0;q<A;q++)for(let p=0;p<A;p++)M[d*AA+q*A+p]=B[q*A+p]*RR[q*AA+d*A+p];
  E.fill(.002);let ll=0;
  for(const f of tr){F.fill(0,0,(f.n+1)*A);F[0]=1;for(let t=0;t<f.n;t++){const d=f.d[t],a=t*A,next=a+A,base=d*AA;let s=0;
    if(t===0){for(let p=0;p<A;p++)F[next+p]=U[p]*RR[d*A+p]}
    else{for(let q=0;q<A;q++){const v=F[a+q],m=base+q*A;for(let p=0;p<A;p++)F[next+p]+=v*M[m+p]}}
    for(let p=0;p<A;p++)s+=F[next+p];if(!(s>0))throw Error("zero likelihood");sc[t]=s;ll+=Math.log(s*A);for(let p=0;p<A;p++)F[next+p]/=s;
   }
   let b=b1,c=b2;b.fill(1);for(let t=f.n-1;t>=0;t--){const d=f.d[t],a=t*A,base=d*AA,scale=sc[t];c.fill(0);
    if(t===0){for(let p=0;p<A;p++)E[d*A+p]+=U[p]*RR[d*A+p]*b[p]/scale}
    else for(let q=0;q<A;q++){const m=base+q*A,e=q*AA+d*A,fac=F[a+q]/scale;let s=0;for(let p=0;p<A;p++){const z=M[m+p]*b[p];E[e+p]+=fac*z;s+=z}c[q]=s/scale}
    [b,c]=[c,b];
   }
  }
  const power=it<iterations/2?1:1.15;for(let j=0;j<AAA;j++)RR[j]=Math.pow(E[j],power);sink(RR,15);
  if(it%10===9||it===iterations-1){const K=hard(RR),s=score(tr,K);const cellExact=K.reduce((a,row,q)=>a+row.filter((p,d)=>p===key[q][d]).length,0);trace.push({it:it+1,softGain:ll/tr.reduce((a,f)=>a+f.n,0),hardGain:s.gain,trainExact:s.exact,n:s.n,cellExact});if(!best||s.gain>best.gain){best=s;bestK=K}}
 }
 const holdout=score(te,bestK),oracle=score(tr,key),oracleHeld=score(te,key);
 return {donor,iterations,trainFrames:tr.length,heldoutFrames:te.length,trace,best,holdout,oracle,oracleHeld,cellExact:bestK.reduce((a,row,q)=>a+row.filter((p,d)=>p===key[q][d]).length,0),trueKey:key,recoveredKey:bestK};
}
console.log(JSON.stringify(pilot(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),Number(process.argv[2]||0),Number(process.argv[3]||60)),null,2));
