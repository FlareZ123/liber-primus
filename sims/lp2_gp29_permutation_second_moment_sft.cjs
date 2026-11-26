'use strict';
function run(){
 let seed=0x29a45;
 const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
 const mod=(x,p)=>((x%p)+p)%p;
 const inv=(x,p)=>{for(let i=1;i<p;i++)if(mod(i*x,p)===1)return i;throw Error("zero inverse")};
 const shuf=p=>{const a=Array.from({length:p},(_,i)=>i);for(let i=p-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const roots=new Map();
 const root=(a,b,c,p)=>{
  a=mod(a,p);b=mod(b,p);c=mod(c,p);
  if(!a)return b?[mod(-c*inv(b,p),p)]:c?[]:Array.from({length:p},(_,i)=>i);
  if(!roots.has(p)){const q=Array.from({length:p},()=>[]);for(let x=0;x<p;x++)q[x*x%p].push(x);roots.set(p,q)}
  const d=mod(b*b-4*a*c,p);return roots.get(p)[d].map(x=>mod((-b+x)*inv(2*a,p),p));
 };
 const sum=a=>a.reduce((s,x)=>s+x,0),sum2=a=>a.reduce((s,x)=>s+x*x,0);
 const add=(a,t,p)=>a.map(x=>mod(x+t,p));
 const dis=(a,p)=>new Set(a).size===p;
 const packing=[];
 for(const p of [5,7,11,29]){
  let plants=0,valid=0,candidates=0,brute=0,maxCandidates=0;
  for(let i=0;i<1000;i++){
   const a=1+rand(p-2),b=1+rand(p-a-1),c=p-a-b,v=shuf(p);
   const A=v.slice(0,a),B=i%2===0?v.slice(a,a+b).map(x=>mod(x-v[a],p)):[0,...shuf(p-1).slice(0,b-1).map(x=>x+1)];
   const C=i%2===0?v.slice(a+b).map(x=>mod(x-v[a+b],p)):[0,...shuf(p-1).slice(0,c-1).map(x=>x+1)];
   const S=sum(A)+sum(B)+sum(C),U=sum2(A)+sum2(B)+sum2(C);
   const e0=mod(-S*inv(c,p),p),e1=mod(-b*inv(c,p),p);
   const q2=mod(b+c*e1*e1,p),q1=mod(2*sum(B)+2*e1*sum(C)+2*c*e0*e1,p);
   const q0=mod(U+2*e0*sum(C)+c*e0*e0,p);
   if(q2!==mod(-a*b*inv(c,p),p)||q2===0)throw Error("quadratic degeneracy");
   const possible=root(q2,q1,q0,p),sol=[];
   for(const t of possible){const u=mod(e0+e1*t,p);if(dis([...A,...add(B,t,p),...add(C,u,p)],p))sol.push(t*p+u);}
   const truth=[];for(let t=0;t<p;t++)for(let u=0;u<p;u++)if(dis([...A,...add(B,t,p),...add(C,u,p)],p))truth.push(t*p+u);
   sol.sort((x,y)=>x-y);
   if(JSON.stringify(sol)!==JSON.stringify(truth)||i%2===0&&truth.length===0)throw Error("packing mismatch");
   candidates+=possible.length;maxCandidates=Math.max(maxCandidates,possible.length);brute+=p*p;valid+=truth.length;plants+=i%2===0;
  }
  packing.push({p,states:1000,plants,quadraticCandidates:candidates,bruteTranslations:brute,completeSolutions:valid,maxCandidates});
 }
 const connected=[];
 for(const d of [1,2,3]){
  const p=29,states=24;
  let baseline=0,retained=0,valid=0,degeneratePrefixes=0,rootCalls=0;
  for(let i=0;i<states;i++){
   const v=shuf(p),z=Array.from({length:d},()=>rand(p));
   const A=Array.from({length:p},(_,x)=>Array.from({length:d},()=>x===0?0:rand(p)));
   for(let j=0;j<d;j++)A[p-1][j]=mod(-A.slice(0,-1).reduce((s,x)=>s+x[j],0),p);
   const B=v.map((x,k)=>mod(x-v[0]-A[k].reduce((s,y,j)=>s+y*z[j],0),p));
   if(i%2===1){B[1]=mod(B[1]+1,p);B[2]=mod(B[2]-1,p);}
   const params=Array(d).fill(0),found=[],oracle=[];
   const evals=()=>A.map((a,x)=>mod(B[x]+a.reduce((s,w,j)=>s+w*params[j],0),p));
   const visit=(n,leaf)=>{if(n===0){leaf();return;}for(let x=0;x<p;x++){params[n-1]=x;visit(n-1,leaf);}};
   visit(d,()=>{baseline++;if(dis(evals(),p))oracle.push(params.join(","));});
   const j=d-1,lead=mod(A.reduce((s,a)=>s+a[j]*a[j],0),p);
   const walk=(i)=>{
    if(i===j){
     const f=A.map((a,x)=>mod(B[x]+a.slice(0,j).reduce((s,w,k)=>s+w*params[k],0),p));
     const lin=mod(2*f.reduce((s,x,k)=>s+x*A[k][j],0),p),con=mod(sum2(f),p);
     rootCalls++;degeneratePrefixes+=lead===0&&lin===0&&con===0;
     for(const t of root(lead,lin,con,p)){params[j]=t;retained++;if(dis(evals(),p))found.push(params.join(","));}
     return;
    }
    for(let t=0;t<p;t++){params[i]=t;walk(i+1);}
   };
   walk(0);
   found.sort();oracle.sort();
   if(JSON.stringify(found)!==JSON.stringify(oracle)||i%2===0&&!found.includes(z.join(",")))throw Error("connected permutation mismatch");
   valid+=found.length;
  }
  connected.push({p,d,states,bruteKeyAssignments:baseline,secondMomentCandidates:retained,rootCalls,degeneratePrefixes,validPermutations:valid});
 }
 return {packing,connected,scope:"Exact permutation moment filters on generated component/affine states; not an original LP2 key search or measured C++ receiver speedup."};
}
console.log(JSON.stringify(run(),null,2));
