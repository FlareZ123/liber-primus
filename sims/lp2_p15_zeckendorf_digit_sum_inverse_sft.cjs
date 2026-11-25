'use strict';
// Agent28: p15 Zeckendorf-weighted keystream, source-fixed and blind inverse.
const fs=require('node:fs'),path=require('node:path');
function experiment(data){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),A=29,mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token "+w);out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x)));
 const train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20),N=C.length,cut=N-co.pages[22].indices.length;assert(N===1883&&cut===1752,"source cut");
 const F=[1,2];while(F.at(-1)+F.at(-2)<N)F.push(F.at(-1)+F.at(-2));const M=F.length;
 const primes=[];for(let x=2;primes.length<=F.at(-1);x++)if(primes.every(p=>p*p>x||x%p!==0))primes.push(x);
 const orig=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 assert([0,...F.slice(0,15)].every((f,i)=>Math.abs(3301-primes[f])===orig[i]),"grid");
 const masks=Array.from({length:N},(_,n)=>{let b=0;for(let k=M-1;k>=0;k--)if(F[k]<=n){b|=1<<k;n-=F[k]}assert(n===0&&!(b&(b<<1)),"Zeckendorf");return b});
 const source=[1,...F.map(f=>mod(primes[f]-2))];
 function schedule(K){return masks.map(b=>{let x=K[0];for(let k=0;k<M;k++)if(b&(1<<k))x+=K[k+1];return mod(x)})}
 const fixed=schedule(source);assert([0,...F].every(f=>fixed[f]===mod(primes[f]-1)),"interpolation");
 const U=new Float64Array(29).fill(1),B=new Float64Array(29*29),T=new Float64Array(29**3),BS=new Float64Array(29),TS=new Float64Array(29*29);
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i){B[p[i-1]*29+p[i]]++;BS[p[i-1]]++}if(i>1){let j=p[i-2]*29+p[i-1];T[j*29+p[i]]++;TS[j]++}}
 let total=U.reduce((a,b)=>a+b,0);const lm=new Float64Array(29**3),bi=new Float64Array(29*29),uni=U.map(x=>Math.log(29*x/total));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){bi[a*29+b]=Math.log(29*(B[a*29+b]+20*U[b]/total)/(BS[a]+20));for(let c=0;c<29;c++){let h=a*29+b;lm[h*29+c]=Math.log(29*(T[h*29+c]+12*Math.exp(bi[b*29+c])/29)/(TS[h]+12))}}
 function score(P,a=0,b=P.length){let v=0;for(let i=a;i<b;i++)v+=i>1?lm[(P[i-2]*29+P[i-1])*29+P[i]]:i===1?bi[P[0]*29+P[1]]:uni[P[0]];return v}
 function ordinary(C,K){let s=schedule(K),P=C.map((x,i)=>mod(x-s[i]));assert(P.every((x,i)=>mod(x+s[i])===C[i]),"ordinary replay");return P}
 const preview=p=>p.slice(0,100).map(x=>co.translit[x]).join("");
 function holdDecode(C,shifts){let states=new Map([[0,1n]]),max=1;for(let i=0;i<C.length;i++){let next=new Map(),add=(j,n)=>next.set(j,(next.get(j)||0n)+n);for(let [j,n] of states){if(C[i]===0)add(j,n);if(mod(C[i]-shifts[j])!==0)add(j+1,n)}if(!next.size)return {dead:i,states:0,max};max=Math.max(max,next.size);states=next}return {dead:null,states:states.size,paths:String([...states.values()].reduce((a,b)=>a+b,0n)),max}}
 function holdEnc(P,shifts){let j=0;return P.map(p=>p===0?0:mod(p+shifts[j++]))}
 let p56=co.pages.find(p=>p.page===56).indices,known56=p56.map((c,i)=>i===56?0:mod(c-primes[i-(i>56?1:0)]+1));
 assert(holdEnc(known56,primes.map(p=>mod(p-1))).every((x,i)=>x===p56[i]),"p56 authentic replay");
 const fp=ordinary(C,source),sourceOutput={key:source,fit:score(fp,0,cut)/cut,hold:score(fp,cut)/(N-cut),preview:preview(fp),transparent:holdDecode(C,fixed),control:holdDecode(holdEnc(em.slice(0,N),fixed),fixed)};
 // Pairwise key cancellation: a one-digit toggle changes precisely one weight.
 const pairs=F.map((f,k)=>Array.from({length:cut-f},(_,i)=>i).filter(i=>(masks[i]^(masks[i+f]))===(1<<k)&&!(masks[i]&(1<<k))));
 const diffs=F.map(f=>{let h=new Float64Array(29).fill(1);for(const P of train)for(let i=f;i<P.length;i++)h[mod(P[i]-P[i-f])]++;const n=h.reduce((a,b)=>a+b,0);return h.map(x=>Math.log(x/n))});
 let seed=0x28112501;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const flags=[Array.from({length:cut},(_,i)=>i),...F.map((_,k)=>Array.from({length:cut},(_,i)=>i).filter(i=>masks[i]&(1<<k)))];
 function optimize(C){
   const ranks=pairs.map((pair,k)=>Array.from({length:29},(_,w)=>[w,pair.reduce((s,i)=>s+diffs[k][mod(C[i+F[k]]-C[i]-w)],0)]).sort((a,b)=>b[1]-a[1]));
   let best=null;
   const starts=[source.slice(),[0,...ranks.map(x=>x[0][0])],...Array.from({length:6},()=>[rand()%29,...ranks.map(x=>x[rand()%3][0])])];
   for(const K0 of starts){
     let K=K0.slice(),P=ordinary(C,K).slice(0,cut),v=score(P),sweeps=0;
     for(;sweeps<10;sweeps++){
       let changed=false;
       for(let k=0;k<K.length;k++){
         let delta=0,sv=v;
         // Scores only training positions; holdout values are never consulted.
         for(let d=1;d<29;d++){
           for(const i of flags[k])P[i]=mod(P[i]-1);
           let z=score(P);if(z>sv+1e-9){sv=z;delta=d}
         }
         for(const i of flags[k])P[i]=mod(P[i]-1-delta); // cumulative -28; another -1 restores, then -delta
         if(delta){K[k]=mod(K[k]+delta);v=sv;changed=true}
       }
       assert(Math.abs(score(P)-v)<1e-5,"coordinate state");if(!changed)break;
     }
     if(!best||v>best.v)best={K,v,sweeps};
   }
   const P=ordinary(C,best.K);return {key:best.K,fit:best.v/cut,hold:score(P,cut)/(N-cut),preview:preview(P),holdPreview:preview(P.slice(cut)),pairTop:ranks.map(x=>x[0][0]),pairMargins:ranks.map(x=>+(x[0][1]-x[1][1]).toFixed(5)),sweeps:best.sweeps,P};
 }
 const summarize=(r,P,K)=>{const {P:decoded,...out}=r;return {...out,keyCorrect:K?out.key.filter((x,i)=>x===K[i]).length:null,fitCorrect:P?decoded.slice(0,cut).filter((x,i)=>x===P[i]).length:null,holdCorrect:P?decoded.slice(cut).filter((x,i)=>x===P[cut+i]).length:null}};
 const controls=[];for(let j=0;j<4;j++){const P=em.slice(500+j*N,500+(j+1)*N),K=Array.from({length:M+1},()=>rand()%29),S=schedule(K),cipher=P.map((x,i)=>mod(x+S[i]));assert(P.length===N,"plant length");controls.push({name:"Emerson-"+j,truth:K,...summarize(optimize(cipher),P,K)})}
 const original=summarize(optimize(C));const nulls=[];for(let j=0;j<2;j++){const c=em.slice(500+j*N,500+(j+1)*N).map(p=>mod(p+rand()%29));nulls.push(summarize(optimize(c)))}
 return {config:{N,cut,F,source,pairCounts:pairs.map(x=>x.length),trainingLengths:train.map(x=>x.length),seed:"0x28112501",fit:"p15 body through p21; p22 holdout",method:"eight fixed starts, up to 10 full coordinate sweeps, GP29 trigram, no printed word separators; source interpolation matches p56 prime-minus-one at each Fibonacci index"},sourceOutput,controls,original,nulls};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,paths};
