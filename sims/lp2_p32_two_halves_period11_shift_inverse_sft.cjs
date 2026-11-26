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
 let seed=0x9f4173ac;function rnd(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%k}
 const period=11,width=12,fitLength=44;
 /** Exact cyclic factor maximization over the 12 highest-unigram candidates per phase. */
 function periodic(L,R,s,len){
   const domains=Array.from({length:period},(_,j)=>Array.from({length:q},(_,k)=>{
      let v=0;for(let i=j;i<len;i+=period)v+=U[m(L[i]-k)]+U[m(R[i]-s*k)];return{k,v}
   }).sort((a,b)=>b.v-a.v||a.k-b.k).slice(0,width).map(x=>x.k));
   // Precompute each phase triple's entire contribution, including initial unary/bigram.
   const W=width,W2=W*W,W3=W2*W,F=Array.from({length:period},()=>new Float64Array(W3));
   for(let j=0;j<period;j++){let ja=(j+period-2)%period,jb=(j+period-1)%period;
     for(let a=0;a<W;a++)for(let b=0;b<W;b++)for(let c=0;c<W;c++){
       let ka=domains[ja][a],kb=domains[jb][b],kc=domains[j][c],v=0;
       for(let i=j;i<len;i+=period){let x=m(L[i]-kc),y=m(R[i]-s*kc);
         if(i===0)v+=U[x]+U[y];
         else{let xb=m(L[i-1]-kb),yb=m(R[i-1]-s*kb);
           if(i===1)v+=B[xb*q+x]+B[yb*q+y];
           else{let xa=m(L[i-2]-ka),ya=m(R[i-2]-s*ka);v+=T[(xa*q+xb)*q+x]+T[(ya*q+yb)*q+y]}
         }
       }
       F[j][(a*W+b)*W+c]=v;
     }
   }
   let best=-Infinity,key=null;
   // Condition on the first two phase values; exact chain DP + closing factors.
   let old=new Float64Array(W2),next=new Float64Array(W2),back=new Int8Array(period*W2);
   for(let first=0;first<W;first++)for(let second=0;second<W;second++){
     old.fill(-Infinity);old[first*W+second]=0;
     for(let j=2;j<period;j++){next.fill(-Infinity);let f=F[j];
       for(let a=0;a<W;a++)for(let b=0;b<W;b++){let ab=a*W+b,v=old[ab];if(v===-Infinity)continue;for(let c=0;c<W;c++){let idx=b*W+c,score=v+f[ab*W+c];if(score>next[idx]){next[idx]=score;back[j*W2+idx]=a}}}
       [old,next]=[next,old];
     }
     for(let a=0;a<W;a++)for(let b=0;b<W;b++){let v=old[a*W+b]+F[0][(a*W+b)*W+first]+F[1][(b*W+first)*W+second];if(v<=best)continue;best=v;
       let k=Array(period);k[period-2]=a;k[period-1]=b;for(let j=period-1;j>=2;j--)k[j-2]=back[j*W2+k[j-1]*W+k[j]];
       if(k[0]!==first||k[1]!==second)throw Error("closing states");key=k.map((d,i)=>domains[i][d]);
     }
   }
   const A=L.map((x,i)=>m(x-key[i%period])),P=R.map((x,i)=>m(x-s*key[i%period]));
   if(Math.abs(score(A.slice(0,len))+score(P.slice(0,len))-best)>1e-8)throw Error("factor score");
   if(!A.every((x,i)=>m(x+key[i%period])===L[i])||!P.every((x,i)=>m(x+s*key[i%period])===R[i]))throw Error("replay");
   const prefix=score(A.slice(0,fitLength))+score(P.slice(0,fitLength)),full=score(A)+score(P);
   return {key,domains,fitMean:prefix/(2*fitLength),heldMean:(full-prefix)/(2*(n-fitLength)),fullMean:full/(2*n),A,P,left:textOf(A),right:textOf(P)};
 }
 function solvePeriod(L,R,s){
   let best=null,scores=[];
   for(let b=0;b<q;b++){let v=periodic(L,R.map(x=>m(x-b)),s,fitLength);v.shift=b;
      if(!v.P.every((x,i)=>m(x+s*v.key[i%period]+b)===R[i]))throw Error("relative shift replay");
      scores.push({b,fit:v.fitMean});
      if(!best||v.fitMean>best.fitMean)best=v;
   }
   return {frozen:best,shiftScores:scores};
 }
 const page=gp.pages[32].indices,L=[],R=[],M=[],center=[];for(let i=0;i<11;i++){let a=page.slice(i*11,i*11+11);L.push(...a.slice(0,5));R.push(...a.slice(6));M.push(...a.slice(6).reverse());center.push(a[5])}
 const controls=[];for(let i=0;i<4;i++){
   let t=i<2?held:solved[(i-2)%solved.length].P,u=i<2?held:solved[(i-1)%solved.length].P;
   let at=rnd(t.length-n+1),bt=rnd(u.length-n+1),A=t.slice(at,at+n),P=u.slice(bt,bt+n),s=i%2?1:-1,K=Array.from({length:period},()=>rnd(q)),b=rnd(q),l=A.map((a,j)=>m(a+K[j%period])),r=P.map((a,j)=>m(a+s*K[j%period]+b)),z=solvePeriod(l,r,s);
   const metric=v=>({keyMatches:v.key.filter((x,j)=>x===K[j]).length,domainCoverage:v.domains.filter((d,j)=>d.includes(K[j])).length,heldRuneMatches:v.A.slice(fitLength).reduce((k,a,j)=>k+(a===A[j+fitLength])+(v.P[j+fitLength]===P[j+fitLength]),0),fitMean:v.fitMean,heldMean:v.heldMean,fullMean:v.fullMean});
   controls.push({kind:i<2?"held-Gibran":"native-solved",s,at,bt,K,b,selectedShift:z.frozen.shift,frozen:metric(z.frozen)});
 }
 const original=[];for(let [orientation,RR] of [["row-forward",R],["row-mirror",M]])for(let s of [1,-1])original.push({orientation,s,...solvePeriod(L,RR,s)});
 return {trainingRunes:training.map(t=>t.length),heldRunes:held.length,period,width,fitLength,n,center:textOf(center),controls,original};

}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
