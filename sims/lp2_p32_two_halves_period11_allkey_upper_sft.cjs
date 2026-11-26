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

 const period=11;
 /** All-29-value upper bound: unroll cyclic factor graph, free the two duplicated end variables. */
 function upper(L,R,s,b){
   const RR=R.map(x=>m(x-b)),F=Array.from({length:period},()=>new Float64Array(q*nn));
   for(let j=0;j<period;j++)for(let a=0;a<q;a++)for(let h=0;h<q;h++)for(let c=0;c<q;c++){
     let v=0;for(let k=j;k<n;k+=period){let x=m(L[k]-c),y=m(RR[k]-s*c);
       if(k===0)v+=U[x]+U[y];else{let xb=m(L[k-1]-h),yb=m(RR[k-1]-s*h);
         if(k===1)v+=B[xb*q+x]+B[yb*q+y];else{let xa=m(L[k-2]-a),ya=m(RR[k-2]-s*a);v+=T[(xa*q+xb)*q+x]+T[(ya*q+yb)*q+y]}
       }
     } F[j][(a*q+h)*q+c]=v;
   }
   let old=new Float64Array(nn),next=new Float64Array(nn),bounds=[];
   for(let cut=0;cut<period;cut++){
     old.fill(0); // all initial copies are allowed
     for(let j=0;j<period;j++){let f=F[(cut+j)%period];next.fill(-Infinity);
       for(let a=0;a<q;a++)for(let h=0;h<q;h++){let ah=a*q+h,v=old[ah],base=ah*q,hq=h*q;for(let c=0;c<q;c++){let z=v+f[base+c],idx=hq+c;if(z>next[idx])next[idx]=z}}
       [old,next]=[next,old];
     }
     bounds.push(Math.max(...old)/(2*n));
   }
   return {b,bounds,upper:Math.min(...bounds)};
 }
 const page=gp.pages[32].indices,L=[],R=[],M=[];for(let i=0;i<11;i++){let a=page.slice(i*11,i*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse())}
 // Use a new independent control set and check each true full-key score against every cut.
 let seed=0xe24d112b;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];for(let i=0;i<8;i++){let t=i<4?held:solved[(i-4)%solved.length].P,u=i<4?held:solved[(i-3)%solved.length].P,at=rnd(t.length-n+1),bt=rnd(u.length-n+1),A=t.slice(at,at+n),P=u.slice(bt,bt+n),s=i%2?1:-1,b=rnd(q),K=Array.from({length:period},()=>rnd(q)),l=A.map((x,j)=>m(x+K[j%period])),r=P.map((x,j)=>m(x+s*K[j%period]+b)),actual=(score(A)+score(P))/(2*n),z=upper(l,r,s,b);
 if(z.bounds.some(x=>x+1e-9<actual))throw Error("upper bound excludes actual key");controls.push({kind:i<4?"held-Gibran":"native-solved",at,bt,s,b,actual,upper:z.upper,bounds:z.bounds});
 }
 const original=[];for(let [orientation,RR] of [["row-forward",R],["row-mirror",M]])for(let s of [1,-1]){
   let all=Array.from({length:q},(_,b)=>upper(L,RR,s,b));let best=all.reduce((a,b)=>a.upper>b.upper?a:b);original.push({orientation,s,best,zeroShift:all[0],all});
 }
 return {trainingRunes:training.map(t=>t.length),period,controls,original};

}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
