'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(data){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const N=1883,cut=1752,F=[1,2];while(F.at(-1)+F.at(-2)<N)F.push(F.at(-1)+F.at(-2));const M=F.length;
 const masks=Array.from({length:N},(_,n)=>{let b=0;for(let k=M-1;k>=0;k--)if(F[k]<=n){b|=1<<k;n-=F[k]}assert(n===0&&!(b&(b<<1)),"Zeckendorf");return b});
 const cls=new Uint8Array(N);for(let j=1;j<N;j++)cls[j]=31-Math.clz32(masks[j]^masks[j-1]);

 const inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const primes=[];for(let x=2;primes.length<=F.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
 const V=[0,...F].map(j=>mod(Math.abs(3301-primes[j]))),A=V.slice(1).map(x=>mod(x*inv[V[0]]));
 const slopes=masks.map(m=>{let a=V[0];for(let k=0;k<M;k++)if(m&(1<<k))a=mod(a*A[k]);return a});
 const ratio=F.map(j=>mod(slopes[j]*inv[slopes[j-1]]));
 const highInv=masks.map((m,j)=>{if(!j)return 1;let a=1;for(let k=cls[j]+1;k<M;k++)if(m&(1<<k))a=mod(a*A[k]);return inv[a]});
 const rows=masks.map(m=>{let a=1,h=Array(M+1).fill(0);for(let k=M-1;k>=0;k--)if(m&(1<<k)){h[k+1]=a;a=mod(a*A[k])}h[0]=a;return h});
 const schedule=K=>rows.map(row=>mod(row.reduce((s,h,k)=>s+h*K[k],0)));
 function deltas(K){let B=schedule(K);return F.map((j,k)=>mod(B[j]-B[j-1]));}
 function keyFromDeltas(ds,b=0){let K=[b];for(let k=0;k<ds.length;k++){let old=rows[F[k]-1].reduce((s,h,j)=>s+h*(K[j]||0),0);let base=rows[F[k]][0]*b;K.push(mod(ds[k]+old-base));}return K;}
 function forward(P,K){let j=0,held=[],B=schedule(K),C=P.map((p,i)=>{if(!p){held.push(i);return 0}let c=mod(slopes[j]*p+B[j]);j++;return c});return{C,held,B};}
 let seed=0x28112711;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 const U=new Float64Array(29).fill(1),D=Array.from({length:6},()=>new Float64Array(29).fill(1));
 for(const P of train)for(let i=0;i<P.length;i++){U[P[i]]++;if(i&&P[i]&&P[i-1])for(let k=0;k<6;k++)D[k][mod(slopes[F[k]]*P[i]-slopes[F[k]-1]*P[i-1])]++}
 const dLM=D.map(h=>{let n=h.reduce((a,b)=>a+b,0);return h.map(x=>Math.log(29*x/n))}),pF=U[0]/U.reduce((a,b)=>a+b,0),pi=pF/(pF+(1-pF)/29),lp=Math.log(pi),lq=Math.log1p(-pi);

 const logadd=(a,b)=>{if(a===-Infinity)return b;if(b===-Infinity)return a;let x=Math.max(a,b);return x+Math.log1p(Math.exp(-Math.abs(a-b)))};

 const J=Array.from({length:6},()=>Array.from({length:6},()=>new Float64Array(841).fill(.25)));
 for(const P of train)for(let i=2;i<P.length;i++)if(P[i]&&P[i-1]&&P[i-2])for(let k=0;k<6;k++)for(let l=0;l<6;l++){
 let d1=mod(slopes[F[k]]*P[i-1]-slopes[F[k]-1]*P[i-2]),d2=mod(slopes[F[l]]*P[i]-slopes[F[l]-1]*P[i-1]);J[k][l][d1*29+d2]++;
 }
 const inter=J.map((row,k)=>row.map((h,l)=>{const total=h.reduce((s,x)=>s+x,0);return h.map((x,i)=>Math.log(841*x/total)-dLM[k][Math.floor(i/29)]-dLM[l][i%29]);}));
 function model(C,width=8,levels=6){
   C=C.slice(0,cut);const zeros=C.flatMap((x,i)=>x===0?[i]:[]),Z=zeros.length,G=Z+1,sz=G*(G+1)/2,tri=g=>g*(g+1)/2;
   const emissions=Array.from({length:levels},()=>new Float64Array(sz*29));
   for(let g=0;g<G;g++){let a=g?zeros[g-1]+1:0,b=g<Z?zeros[g]:C.length;
     for(let h=0;h<=g;h++){let off=(tri(g)+h)*29;
       for(let i=a+1;i<b;i++){let k=cls[i-h];if(k>=levels)continue;let d=mod((C[i]-C[i-1])*highInv[i-h]),E=emissions[k];for(let w=0;w<29;w++)E[off+w]+=dLM[k][mod(d-w)]}
     }
   }

   // Precompute adjacent nonzero triples, grouped by highest active carry class.
   const triRecords=Array.from({length:levels},()=>[]);
   for(let g=0;g<G;g++){let a=g?zeros[g-1]+1:0,b=g<Z?zeros[g]:C.length;
     for(let h=0;h<=g;h++)for(let i=a+2;i<b;i++){
       let k=cls[i-h-1],l=cls[i-h],m=Math.max(k,l);if(m>=levels)continue;
       let d1=mod((C[i-1]-C[i-2])*highInv[i-h-1]),d2=mod((C[i]-C[i-1])*highInv[i-h]);
       triRecords[m].push([tri(g)+h,k,l,d1,d2]);
     }
   }
   function interaction(base,k){
     const E=emissions[k].slice();
     for(const [s,a,b,d1,d2] of triRecords[k]){const L=inter[a][b],off=s*29;
       if(a===k&&b===k){for(let w=0;w<29;w++)E[off+w]+=L[mod(d1-w)*29+mod(d2-w)];}
       else if(a===k){const e=mod(d2-base.ds[b]);for(let w=0;w<29;w++)E[off+w]+=L[mod(d1-w)*29+e];}
       else{const e=mod(d1-base.ds[a])*29;for(let w=0;w<29;w++)E[off+w]+=L[e+mod(d2-w)];}
     }
     return E;
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
     let candidates=[];for(const b of beam){const E=interaction(b,k);for(let w=0;w<29;w++)candidates.push({b,w,E,value:marginal(b.base,E,w)});}
     candidates.sort((a,b)=>b.value-a.value);beam=candidates.slice(0,width).map(({b,w,E,value})=>{let base=b.base.map((x,i)=>x+E[i*29+w]);return {base,ds:[...b.ds,w],value}});
   }
   return {zeros:Z,beams:beam.map(b=>({ds:b.ds,value:b.value,...marginal(b.base,null,0,true)}))};
 }

 const inputs=[];for(let i=0;i<4;i++){let P=em.slice(20000+i*N,20000+(i+1)*N),K=Array.from({length:M+1},()=>rand()%29),f=forward(P,K),ds=deltas(K);assert(P.length===N,"plant");assert(keyFromDeltas(ds,K[0]).every((x,j)=>x===K[j]),"carry inverse");for(let j=1;j<N;j++){const k=cls[j];assert(mod((f.B[j]-f.B[j-1])*highInv[j])===ds[k],"carry delta invariant");assert(mod(slopes[j]*inv[slopes[j-1]])===ratio[k],"ratio invariant");}inputs.push({name:"Emerson-affine-latent-"+i,P,K,...f,ds})}
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);assert(C.length===N,"original length");inputs.push({name:"original-p15-22",C});
 const out=[];for(const x of inputs){let m=model(x.C,16,6),correct=x.held?.filter(i=>i<cut),rs=m.beams.map(b=>{let good=correct?b.held.filter(i=>correct.includes(i)).length:null;return {ds:b.ds,score:b.value,holds:b.held.length,correct:good,wrong:good===null?null:b.held.length-good,missing:good===null?null:correct.length-good,shiftCorrect:x.ds?b.ds.filter((d,i)=>d===x.ds[i]).length:null,held:b.held}});out.push({name:x.name,key:x.K??null,truthDs:x.ds?.slice(0,6)??null,trueHolds:correct??null,zeros:m.zeros,rows:rs})}
 return {config:{N,cut,levels:6,width:16,pF,pi,trainingLengths:train.map(x=>x.length),seed:"0x28112711",slopes:V,method:"marginal-HMM with adjacent affine carry-difference interactions, high outer digit composition"},out};
}



const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={experiment,paths};
