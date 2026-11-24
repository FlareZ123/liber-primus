"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(gp,nativeDonors,raw,starts=48){
 const Q=29,mod=x=>(x%Q+Q)%Q,assert=(x,m)=>{if(!x)throw Error(m)};let seed=0x2644fe;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
 const ix=new Map(gp.runes.map((x,i)=>[x,i])),D=nativeDonors.sections.map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)));
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const P=Array(Q).fill(.5),B=Array.from({length:Q},()=>Array(Q).fill(.5));for(const a of D)for(let i=0;i<a.length;i++){P[a[i]]++;if(i)B[a[i-1]][a[i]]++}const norm=a=>{const n=a.reduce((x,y)=>x+y,0);return a.map(x=>x/n)};const p=norm(P),b=B.map(norm);
 const opts=(c,s)=>c===0?(s?[0,Q-s]:[0]):c===s?[]:[mod(c-s)];
 function problem(xs){
  const count=new Int32Array(Q*Q*Q),w=new Float64Array(Q*Q*Q),bad=new Uint16Array(Q*Q*Q),allowed=new Uint32Array(Q*Q);let n=0,pad=0;
  for(const C of xs)for(let i=2;i<C.length;i++){const c=C[i],x=C[i-1],y=C[i-2];count[(x*Q+y)*Q+c]++;n++;pad+=Math.log(Q*(c===0?p[0]+(1-p[0])/Q:(1-p[0])/Q))}
  for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const k=(x*Q+y)*Q;let mask=0;for(let s=0;s<Q;s++){let z=0,f=0;for(let c=0;c<Q;c++)if(count[k+c]){const op=opts(c,s);if(!op.length){f+=count[k+c];z+=count[k+c]*Math.log(Q*.002)}else z+=count[k+c]*Math.log(Q*op.reduce((a,t)=>a+p[t],0))}w[k+s]=z;bad[k+s]=f;if(!f)mask|=1<<s}allowed[x*Q+y]=mask>>>0}
  return {w,bad,allowed,n,pad}
 }
 function evaluate(pr,A,B){let score=0,illegal=0;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const i=(x*Q+y)*Q+(A[x]+B[y])%Q;score+=pr.w[i];illegal+=pr.bad[i]}return {score,illegal}}
 function fit(pr){
  let best={A:Array(Q).fill(0),B:Array(Q).fill(0)};Object.assign(best,evaluate(pr,best.A,best.B));const trace=[];
  const e=new Float64Array(Q);let totalSweeps=0;
  for(let restart=0;restart<starts;restart++){
   const A=Array.from({length:Q},()=>restart===0?0:Math.floor(rng()*Q)),B=Array.from({length:Q},(_,i)=>restart===0||i===0?0:Math.floor(rng()*Q));
   for(let sweep=0;sweep<56;sweep++){const T=sweep<12?2:sweep<24?1:sweep<36?.4:sweep<44?.1:0,penalty=sweep<12?0:sweep<24?1:sweep<36?3:sweep<44?8:100;
    let changed=false;
    for(let side=0;side<2;side++){const u=side?B:A,v=side?A:B;
     for(let i=side?1:0;i<Q;i++){let max=-Infinity,arg=0;for(let a=0;a<Q;a++){let z=0;for(let j=0;j<Q;j++){const k=((side?j*Q+i:i*Q+j)*Q)+(a+v[j])%Q;z+=pr.w[k]-penalty*pr.bad[k]}e[a]=z;if(z>max){max=z;arg=a}}
      if(T){let tot=0;for(let a=0;a<Q;a++){e[a]=Math.exp((e[a]-max)/T);tot+=e[a]}let u0=rng()*tot;for(let a=0;a<Q;a++){u0-=e[a];if(u0<=0){arg=a;break}}}
      if(u[i]!==arg){changed=true;u[i]=arg}
     }
    }
    totalSweeps++;const z=evaluate(pr,A,B);if(!z.illegal&&z.score>best.score+1e-9)best={A:A.slice(),B:B.slice(),...z};if(!changed&&!T)break;
   }
   if(restart%8===7)trace.push({restart,score:best.score});
  }
  return {...best,trace,totalSweeps}
 }
 function decode(C,key,start=2,end=C.length){
  const {A,B:bb}=key;let states=[{p:-1,s:0,z:1}],log=0,layers=[];
  for(let i=start;i<end;i++){const o=opts(C[i],(A[C[i-1]]+bb[C[i-2]])%Q);if(!o.length)return {legal:false,at:i};const next=o.map(v=>{let s=-Infinity,j=-1,z=0;for(let k=0;k<states.length;k++){const a=states[k],q=a.p<0?p[v]:b[a.p][v],t=a.s+Math.log(q);z+=a.z*q;if(t>s){s=t;j=k}}return{p:v,s,j,z}});const sum=next.reduce((a,v)=>a+v.z,0);log+=Math.log(Q*sum);for(const v of next)v.z/=sum;layers.push(next);states=next}
  let j=states.reduce((a,v,i)=>v.s>states[a].s?i:a,0),out=[];for(let i=layers.length-1;i>=0;i--){const s=layers[i][j];out.push(s.p);j=s.j}out.reverse();assert(out.every((v,i)=>v===0?C[start+i]===0:mod(v+A[C[start+i-1]]+bb[C[start+i-2]])===C[start+i]),"replay");return{legal:true,log,out}
 }
 function illegal(C,key,start=2){let n=0;for(let i=start;i<C.length;i++)if(C[i]!==0&&C[i]===(key.A[C[i-1]]+key.B[C[i-2]])%Q)n++;return n}
 function upper(pr,g,transpose=false){
   let total=0,blocks=[];for(let off=0;off<Q;off+=g){const m=Math.min(g,Q-off),shifts=Array(m).fill(0),tables=Array.from({length:m},(_,t)=>Array.from({length:Q},(_,x)=>{const k=(transpose?(off+t)*Q+x:x*Q+off+t)*Q;return Array.from({length:Q},(_,s)=>pr.bad[k+s]?-Infinity:pr.w[k+s])}));let best=-Infinity,comb=Q**(m-1);
    for(let code=0;code<comb;code++){let z=code;for(let j=1;j<m;j++){shifts[j]=z%Q;z=Math.floor(z/Q)}let sum=0;
      for(let x=0;x<Q;x++){let hi=-Infinity;for(let a=0;a<Q;a++){let v=tables[0][x][a];if(v===-Infinity)continue;for(let j=1;j<m;j++)v+=tables[j][x][(a+shifts[j])%Q];if(v>hi)hi=v}sum+=hi;if(sum===-Infinity)break}if(sum>best)best=sum;
    }total+=best;blocks.push(best)
   }return {g,transpose,total,blocks}
 }
 function fixedCount(pr,side){let v=1n,domains=[];for(let i=0;i<Q;i++){let mask=(1<<Q)-1;for(let j=0;j<Q;j++)mask&=pr.allowed[side?j*Q+i:i*Q+j];let n=0;for(let s=0;s<Q;s++)if(mask&(1<<s))n++;domains.push(n);if(!side||i!==0)v*=BigInt(n)}return{domains,count:v.toString()}}
 const X=gp.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices),Y=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);assert(X.length===1744&&Y.length===3008,"original partition");
 const plants=[];for(let j=0;j<2;j++){const plain=native(raw[j]).slice(j?23000:10000,(j?23000:10000)+2344),A=Array.from({length:Q},()=>Math.floor(rng()*Q)),bb=Array.from({length:Q},(_,i)=>i?Math.floor(rng()*Q):0),C=[];let x=j+1,y=j+3;for(const v of plain){const c=v===0?0:mod(v+A[x]+bb[y]);C.push(c);y=x;x=c}const cut=1744,pr=problem([C.slice(0,cut)]),k=fit(pr),v=decode(C,k,cut);plants.push({j,truth:{A,B:bb},fit:k,truthFit:evaluate(pr,A,bb),exactA:A.filter((a,i)=>a===k.A[i]).length,exactB:bb.filter((a,i)=>a===k.B[i]).length,heldLegal:v.legal,heldIllegal:illegal(C,k,cut),heldHits:v.legal?v.out.filter((a,i)=>a===plain[cut+i]).length:0,held:600,heldLLR:v.log??null,truthHeldLLR:decode(C,{A,B:bb},cut).log});}
 const pr=problem([X]),fitKey=fit(pr),held=decode(Y,fitKey),joint=problem([X,Y]),fitJoint=fit(joint);
 const ub=[upper(joint,2),upper(joint,3),upper(joint,3,true)];
 return {plants,original:{fitN:pr.n,heldN:Y.length-2,prefixKey:fitKey,prefixPad:pr.pad,heldIllegal:illegal(Y,fitKey),heldLegal:held.legal,heldLLR:held.log??null,jointN:joint.n,jointPad:joint.pad,jointKey:fitJoint,jointZero:evaluate(joint,Array(Q).fill(0),Array(Q).fill(0)),jointBounds:ub,oneTable:[fixedCount(joint,false),fixedCount(joint,true)]}};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),JSON.parse(raw[1]),raw.slice(2),Number(process.argv[2]||48)),null,2));
