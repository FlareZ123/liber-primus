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

 const page=gp.pages[32].indices;if(page.length!==121)throw Error("p32 geometry");
 const L=[],R=[],M=[];for(let i=0;i<11;i++){let a=page.slice(i*11,i*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse())}
 // P_R=P_L=P. Complementary shifts give 2P=L+R-b; inverse 2 mod29 is15.
 function solve(L,R){
   const plusD=L.map((a,i)=>m(R[i]-a)),equalShift=new Set(plusD).size===1;
   const all=Array.from({length:q},(_,b)=>{let P=L.map((a,i)=>m(15*(a+R[i]-b))),K=L.map((a,i)=>m(a-P[i]));
      if(!R.every((a,i)=>a===m(P[i]-K[i]+b)))throw Error("duplicate replay");
      return {b,P,K,mean:score(P)/n,text:textOf(P)};
   }).sort((a,b)=>b.mean-a.mean);
   return {equalShift,distinctDifference:new Set(plusD).size,best:all[0],all};
 }
 let seed=0x6012ddf;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const controls=[];for(let i=0;i<8;i++){const t=i<4?held:solved[i-4].P,at=rnd(t.length-n+1),P=t.slice(at,at+n),b=rnd(q),K=P.map(()=>rnd(q)),L=P.map((a,j)=>m(a+K[j])),R=P.map((a,j)=>m(a-K[j]+b)),z=solve(L,R);
  if(!z.all.some(v=>v.b===b&&v.P.every((x,j)=>x===P[j])))throw Error("true branch");
  controls.push({kind:i<4?"held-Gibran":"native-solved",b,rank:1+z.all.findIndex(v=>v.b===b),best:z.best.mean,trueScore:score(P)/n,keyExact:z.best.K.every((x,j)=>x===K[j])});
 }
 return {trainingRunes:training.map(t=>t.length),controls,original:[{orientation:"row-forward",...solve(L,R)},{orientation:"row-mirror",...solve(L,M)}]};

}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
