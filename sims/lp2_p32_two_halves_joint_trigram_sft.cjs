'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(data){
 const gp=JSON.parse(data[0]), native=JSON.parse(data[4]),q=29,nn=q*q,n=55,fit=32,m=x=>(x%q+q)%q;
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(text){let out=[];for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[VKZQ]/g,x=>({V:"U",K:"C",Z:"S",Q:"C"})[x]);while(w){let x=spell.find(y=>w.startsWith(y.s));if(!x)throw Error(w);out.push(x.i);w=w.slice(x.s.length)}}return out}
 const training=[encode(data[1]),encode(data[2])], held=encode(data[3]), solved=native.sections.map(s=>({name:s.name,P:[...s.source_text].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0)})).filter(s=>s.P.length>=n);
 const uni=new Float64Array(q),bi=new Float64Array(nn),tri=new Float64Array(nn*q),ct1=new Float64Array(q),ct2=new Float64Array(nn);
 let total=0;
 for(let t of training)for(let i=0;i<t.length;i++){let c=t[i];uni[c]++;total++;if(i){let b=t[i-1];bi[b*q+c]++;ct1[b]++;if(i>1){let ab=t[i-2]*q+b;tri[ab*q+c]++;ct2[ab]++}}}
 const U=Float64Array.from(uni,c=>Math.log((c+1)/(total+q))),B=new Float64Array(nn),T=new Float64Array(nn*q);
 for(let b=0;b<q;b++)for(let c=0;c<q;c++){let bc=b*q+c;B[bc]=Math.log((bi[bc]+10*Math.exp(U[c]))/(ct1[b]+10));for(let a=0;a<q;a++){let ab=a*q+b,abc=ab*q+c;T[abc]=Math.log((tri[abc]+10*Math.exp(B[bc]))/(ct2[ab]+10))}}
 function score(A){let z=U[A[0]]+B[A[0]*q+A[1]];for(let i=2;i<A.length;i++)z+=T[(A[i-2]*q+A[i-1])*q+A[i]];return z}
 const textOf=A=>A.map(x=>gp.translit[x]).join("");
 /** Given D = R-sL, exactly optimize both plaintexts for a fixed shift. */
 function fixed(D,s,shift){
   const maps=D.map(d=>Int8Array.from({length:q},(_,a)=>m(d+s*a-shift)));
   let old=new Float64Array(nn),next=new Float64Array(nn),back=new Int8Array(n*nn);
   for(let a=0;a<q;a++)for(let b=0;b<q;b++){let x=maps[0][a],y=maps[1][b];old[a*q+b]=U[a]+B[a*q+b]+U[x]+B[x*q+y]}
   let prefix;
   for(let i=2;i<n;i++){let x=maps[i-2],y=maps[i-1],z=maps[i];next.fill(-Infinity);
      for(let a=0;a<q;a++)for(let b=0;b<q;b++){let ab=a*q+b,off1=ab*q,off2=(x[a]*q+y[b])*q,v=old[ab],bc=b*q;for(let c=0;c<q;c++){let value=v+T[off1+c]+T[off2+z[c]],idx=bc+c;if(value>next[idx]){next[idx]=value;back[i*nn+idx]=a}}}
      [old,next]=[next,old];if(i===fit-1)prefix=Math.max(...old);
   }
   let ix=0;for(let j=1;j<nn;j++)if(old[j]>old[ix])ix=j;
   const A=Array(n);A[n-2]=Math.floor(ix/q);A[n-1]=ix%q;
   for(let i=n-1;i>=2;i--)A[i-2]=back[i*nn+A[i-1]*q+A[i]];
   const P=A.map((a,i)=>maps[i][a]),full=old[ix];
   if(Math.abs(score(A)+score(P)-full)>1e-8)throw Error("Viterbi score mismatch");
   return {shift,prefix,full,A,P};
 }
 function solve(L,R,s){
   const D=L.map((x,i)=>m(R[i]-s*x));let all=Array.from({length:q},(_,b)=>fixed(D,s,b));
   const best=all.reduce((a,b)=>a.full>b.full?a:b),frozen=all.reduce((a,b)=>a.prefix>b.prefix?a:b);
   for(let v of [best,frozen]){v.key=L.map((x,i)=>m(x-v.A[i]));if(!R.every((x,i)=>x===m(v.P[i]+s*v.key[i]+v.shift)))throw Error("replay");v.mean=v.full/(2*n);v.prefixMean=v.prefix/(2*fit);v.left=textOf(v.A);v.right=textOf(v.P)}
   return {best,frozen,shiftScores:all.map(v=>({b:v.shift,prefix:v.prefix,full:v.full}))};
 }
 let seed=0x3e714a52;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%k}
 const page=gp.pages[32].indices;if(page.length!==121)throw Error("p32 geometry");const L=[],R=[],M=[],center=[];for(let i=0;i<11;i++){let a=page.slice(i*11,i*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse());center.push(a[5])}
 const original=[];for(let [orientation,RR] of [["row-forward",R],["row-mirror",M]])for(let s of [1,-1])original.push({orientation,s,...solve(L,RR,s)});
 const controls=[];for(let i=0;i<8;i++){
   let t=i<4?held:solved[(i-4)%solved.length].P,u=i<4?held:solved[(i-3)%solved.length].P;
   let at=rnd(t.length-n+1),bt=rnd(u.length-n+1),A=t.slice(at,at+n),P=u.slice(bt,bt+n),s=i%2?1:-1,b=rnd(q),K=A.map(()=>rnd(q)),l=A.map((a,j)=>m(a+K[j])),r=P.map((a,j)=>m(a+s*K[j]+b)),z=solve(l,r,s);
   const accuracy=v=>v.A.reduce((k,a,j)=>k+(a===A[j])+(v.P[j]===P[j]),0);
   controls.push({kind:i<4?"held-Gibran":"native-solved",at,bt,s,b,actualScore:(score(A)+score(P))/(2*n),mapAccuracy:accuracy(z.best),frozenAccuracy:accuracy(z.frozen),mapShift:z.best.shift,frozenShift:z.frozen.shift,best:z.best.mean,frozen:z.frozen.mean});
 }
 const nulls=[];for(let i=0;i<8;i++){let l=Array.from({length:n},()=>rnd(q)),r=Array.from({length:n},()=>rnd(q)),s=i%2?1:-1,z=solve(l,r,s);nulls.push({s,best:z.best.mean,frozen:z.frozen.mean})}
 return {trainingRunes:training.map(t=>t.length),heldRunes:held.length,fit,n,center:textOf(center),controls,nulls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
