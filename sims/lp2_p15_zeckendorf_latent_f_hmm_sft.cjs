'use strict';
// Agent28: latent F Fibonacci carry-class HMM.
const fs=require('node:fs'),path=require('node:path');
function experiment(data){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const N=1883,cut=1752,F=[1,2];while(F.at(-1)+F.at(-2)<N)F.push(F.at(-1)+F.at(-2));const M=F.length;
 const masks=Array.from({length:N},(_,n)=>{let b=0;for(let k=M-1;k>=0;k--)if(F[k]<=n){b|=1<<k;n-=F[k]}assert(n===0&&!(b&(b<<1)),"Zeckendorf");return b});
 const cls=new Uint8Array(N);for(let j=1;j<N;j++)cls[j]=31-Math.clz32(masks[j]^masks[j-1]);
 function schedule(K){return masks.map(b=>{let x=K[0];for(let k=0;k<M;k++)if(b&(1<<k))x+=K[k+1];return mod(x)})}
 const U=new Float64Array(29).fill(1),D=new Float64Array(29).fill(1);
 for(const P of train)for(let i=0;i<P.length;i++){U[P[i]]++;if(i&&P[i]&&P[i-1])D[mod(P[i]-P[i-1])]++}
 const dsum=D.reduce((a,b)=>a+b,0),dLM=D.map(x=>Math.log(29*x/dsum)),pF=U[0]/U.reduce((a,b)=>a+b,0),pi=pF/(pF+(1-pF)/29),lp=Math.log(pi),lq=Math.log1p(-pi);
 let seed=0x28112502;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function forward(P,K){let j=0,held=[],S=schedule(K),C=P.map((p,i)=>{if(!p){held.push(i);return 0}return mod(p+S[j++])});return {C,held,S}}
 const logadd=(a,b)=>{if(a===-Infinity)return b;if(b===-Infinity)return a;let x=Math.max(a,b);return x+Math.log1p(Math.exp(-Math.abs(a-b)))};
 function model(C,width=8,levels=6){
   C=C.slice(0,cut);const zeros=C.flatMap((x,i)=>x===0?[i]:[]),Z=zeros.length,G=Z+1,sz=G*(G+1)/2,tri=g=>g*(g+1)/2;
   const emissions=Array.from({length:levels},()=>new Float64Array(sz*29));
   for(let g=0;g<G;g++){let a=g?zeros[g-1]+1:0,b=g<Z?zeros[g]:C.length;
     for(let h=0;h<=g;h++){let off=(tri(g)+h)*29;
       for(let i=a+1;i<b;i++){let k=cls[i-h];if(k>=levels)continue;let d=mod(C[i]-C[i-1]),E=emissions[k];for(let w=0;w<29;w++)E[off+w]+=dLM[mod(d-w)]}
     }
   }
   function marginal(base,E=null,w=0,trace=false){
     let prev=new Float64Array(G).fill(-Infinity),next=new Float64Array(G),back=trace?new Uint8Array(sz):null;
     prev[0]=base[0]+(E?E[w]:0);
     for(let g=1;g<G;g++){const off=tri(g);
       for(let h=0;h<=g;h++){let a=h<g?prev[h]+lq:-Infinity,b=h?prev[h-1]+lp:-Infinity;
         if(trace){back[off+h]=b>a?1:0;next[h]=Math.max(a,b)}else next[h]=logadd(a,b);
         next[h]+=base[off+h]+(E?E[(off+h)*29+w]:0);
       }
       [prev,next]=[next,prev];
     }
     if(!trace){let t=-Infinity;for(let h=0;h<G;h++)t=logadd(t,prev[h]);return t}
     let h=0;for(let i=1;i<G;i++)if(prev[i]>prev[h])h=i;let value=prev[h],held=[];
     for(let g=G-1;g>0;g--)if(back[tri(g)+h]){held.push(zeros[g-1]);h--}
     return {value,held:held.reverse()};
   }
   let beam=[{base:new Float64Array(sz),ds:[],value:0}];
   for(let k=0;k<levels;k++){
     let candidates=[];for(const b of beam)for(let w=0;w<29;w++)candidates.push({b,w,value:marginal(b.base,emissions[k],w)});
     candidates.sort((a,b)=>b.value-a.value);beam=candidates.slice(0,width).map(({b,w,value})=>{let base=b.base.map((x,i)=>x+emissions[k][i*29+w]);return {base,ds:[...b.ds,w],value}});
   }
   return {zeros:Z,beams:beam.map(b=>({ds:b.ds,value:b.value,...marginal(b.base,null,0,true)}))};
 }
 const inputs=[];for(let i=0;i<4;i++){let P=em.slice(10000+i*N,10000+(i+1)*N),K=Array.from({length:M+1},()=>rand()%29),f=forward(P,K),ds=F.map(j=>mod(f.S[j]-f.S[j-1]));assert(P.length===N,"plant");inputs.push({name:"Emerson-latent-"+i,P,K,...f,ds})}
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);assert(C.length===N,"original length");
 inputs.push({name:"original-p15-22",C});
 const out=[];for(const x of inputs){let m=model(x.C),correct=x.held?.filter(i=>i<cut),rows=m.beams.map(b=>{let good=correct?b.held.filter(i=>correct.includes(i)).length:null;return {ds:b.ds,score:b.value,holds:b.held.length,correct:good,wrong:good===null?null:b.held.length-good,missing:good===null?null:correct.length-good,shiftCorrect:x.ds?b.ds.filter((d,i)=>d===x.ds[i]).length:null,held:b.held}});out.push({name:x.name,key:x.K??null,truthDs:x.ds?.slice(0,6)??null,trueHolds:correct??null,zeros:m.zeros,rows})}
 return {config:{N,cut,levels:6,width:8,pF,pi,trainingLengths:train.map(x=>x.length),seed:"0x28112502",method:"exact logsumexp over all visible-zero hold histories for difference-only emissions, beam over six most common Fibonacci carry classes"},out};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,paths};
