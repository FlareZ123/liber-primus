'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(data,caseIndex=-1,width=8192){
 const co=JSON.parse(data[0]),nat=JSON.parse(data[1]),hmm=JSON.parse(data[5]),mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const gp=new Map(co.runes.map((x,i)=>[x,i])),tok=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=s=>{let out=[];for(let w of s.match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(t=>w.startsWith(t.s,i));assert(t,"unknown token");out.push(t.i);i+=t.s.length}}return out};
 const native=nat.sections.map(s=>[...s.source_text].filter(x=>gp.has(x)).map(x=>gp.get(x))),train=[...native,encode(data[2]),encode(data[3])],em=encode(data[4]);
 const N=1883,cut=1752,F=[1,2];while(F.at(-1)+F.at(-2)<N)F.push(F.at(-1)+F.at(-2));const M=F.length;
 const bits=Array.from({length:N},(_,n)=>{let a=[];for(let k=M-1;k>=0;k--)if(F[k]<=n){a.push(k+1);n-=F[k]}assert(n===0,"Zeckendorf");return a});
 const U=new Float64Array(29).fill(1),B=new Float64Array(841),T=new Float64Array(29**3),BS=new Float64Array(29),TS=new Float64Array(841);
 for(const p of train)for(let i=0;i<p.length;i++){U[p[i]]++;if(i){B[p[i-1]*29+p[i]]++;BS[p[i-1]]++}if(i>1){let j=p[i-2]*29+p[i-1];T[j*29+p[i]]++;TS[j]++}}
 let total=U.reduce((a,b)=>a+b,0),lm=new Float64Array(29**3),bi=new Float64Array(841),uni=U.map(x=>Math.log(29*x/total));
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){bi[a*29+b]=Math.log(29*(B[a*29+b]+20*U[b]/total)/(BS[a]+20));for(let c=0;c<29;c++){let h=a*29+b;lm[h*29+c]=Math.log(29*(T[h*29+c]+12*Math.exp(bi[b*29+c])/29)/(TS[h]+12))}}
 function lscore(a,b,p){return b===29?uni[p]:a===29?bi[b*29+p]:lm[(a*29+b)*29+p]}
 const inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const primes=[];for(let x=2;primes.length<=F.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
 const V=[0,...F].map(j=>mod(Math.abs(3301-primes[j]))),A=V.slice(1).map(x=>mod(x*inv[V[0]]));
 const masks=bits.map(a=>a.reduce((s,k)=>s|(1<<(k-1)),0));
 const slopes=masks.map(m=>{let a=V[0];for(let k=0;k<M;k++)if(m&(1<<k))a=mod(a*A[k]);return a});
 const ratio=F.map(j=>mod(slopes[j]*inv[slopes[j-1]]));
 const rows=masks.map(m=>{let a=1,h=Array(M+1).fill(0);for(let k=0;k<M;k++)if(m&(1<<k)){h[k+1]=a;a=mod(a*A[k])}h[0]=a;return h});
 const schedule=K=>rows.map(row=>mod(row.reduce((s,h,k)=>s+h*K[k],0)));
 function deltas(K){let B=schedule(K);return F.map((j,k)=>mod(B[j]-ratio[k]*B[j-1]));}
 function keyFromDeltas(ds,b=0){let K=[b];for(let k=0;k<ds.length;k++){let old=rows[F[k]-1].reduce((s,h,j)=>s+h*(K[j]||0),0);let base=rows[F[k]][0]*b;K.push(mod(ds[k]+ratio[k]*old-base));}return K;}
 function forward(P,K,j=0){let held=[],B=schedule(K),C=P.map((p,i)=>{if(!p){held.push(i);return 0}let c=mod(slopes[j]*p+B[j]);j++;return c});return{C,holds:held,B};}

 const sparse=rows.map(r=>r.flatMap((h,k)=>h?[[k,h]]:[]));
 function shift(K,j){let s=0;for(const [k,h] of sparse[j])s+=h*K[k];return mod(s);}
 function beam(C,ds,width=8192){
   let nextId=0,states=[];
   for(let b=0;b<29;b++){let key={id:nextId++,K:keyFromDeltas(ds,b),child:new Map()};states.push({key,h:0,mask:0,a:29,b:29,v:0})}
   const counts=[],stride=(cut+1)*4;let maxRaw=0,totalRaw=0;
   for(let i=0;i<cut;i++){
     let c=C[i],next=new Map(),temps=new Map(),tempId=-1;
     function add(s,key,h,mask,p,v){let q=key.id*stride+h*4+mask,old=next.get(q);if(!old||v>old.v)next.set(q,{key,h,mask,a:s.b,b:p,v})}
     for(const s of states){
       let j=i-s.h,K=s.key.K,mask=(s.mask<<1)&3;
       if(c===0)add(s,s.key,s.h+1,mask|1,0,s.v+lscore(s.a,s.b,0));
       if(bits[j].length&&bits[j][0]>=K.length){
         assert(bits[j][0]===K.length&&F[K.length-1]===j,"first digit introduction");
         let arr=temps.get(s.key.id);if(!arr){arr=Array(29);temps.set(s.key.id,arr)}
         for(let w=0;w<29;w++){
           let p=mod((c-A[K.length-1]*K[0]-w)*inv[slopes[j]]);if(!p)continue;
           let child=s.key.child.get(w);
           if(!child){child=arr[w];if(!child){child={id:tempId--,parent:s.key,w};arr[w]=child}}
           add(s,child,s.h,mask,p,s.v+lscore(s.a,s.b,p));
         }
       }else{
         let p=mod((c-shift(K,j))*inv[slopes[j]]);if(p)add(s,s.key,s.h,mask,p,s.v+lscore(s.a,s.b,p));
       }
     }
     totalRaw+=next.size;maxRaw=Math.max(maxRaw,next.size);
     if(!next.size)return {dead:i,counts,maxRaw,totalRaw};
     states=[...next.values()];if(states.length>width){states.sort((a,b)=>b.v-a.v);states.length=width}
     for(const s of states)if(s.key.id<0){let k=s.key,parent=k.parent,child=parent.child.get(k.w);if(!child){child={id:nextId++,K:[...parent.K,k.w],child:new Map()};parent.child.set(k.w,child)}s.key=child}
     if(i===cut-1||F.includes(i)||i%200===199)counts.push([i,states.length,Math.max(...states.map(x=>x.v))]);
   }
   states.sort((a,b)=>b.v-a.v);const top=[];let seen=new Set();
   for(const s of states){let k=s.key.K.join(",");if(s.key.K.length===M+1&&!seen.has(k)){seen.add(k);top.push({K:s.key.K,beamScore:s.v,h:s.h});if(top.length===8)break}}
   return {top,counts,maxRaw,totalRaw,keys:nextId};
 }
 function exact(C,K,start,end,initial=null){
   let states=new Map();let base=initial?{...initial,prev:null}:{h:0,mask:0,a:29,b:29,v:0,prev:null};states.set(base.h*4+base.mask,base);
   for(let i=start;i<end;i++){
     let next=new Map(),c=C[i];
     function add(s,h,mask,p){let v=s.v+lscore(s.a,s.b,p),q=h*4+mask,old=next.get(q);if(!old||v>old.v)next.set(q,{h,mask,a:s.b,b:p,v,prev:s,p})}
     for(const s of states.values()){
       let j=i-s.h,mask=(s.mask<<1)&3;
       if(c===0)add(s,s.h+1,mask|1,0);
       let p=mod((c-shift(K,j))*inv[slopes[j]]);if(p)add(s,s.h,mask,p);
     }
     if(!next.size)return null;states=next;
   }
   let best=[...states.values()].reduce((a,b)=>a.v>b.v?a:b),s=best,P=[];
   for(let i=start;i<end;i++){P.push(s.p);s=s.prev}P.reverse();
   let f=forward(P,K,start-base.h);assert(f.C.every((x,i)=>x===C[start+i]),"exact replay");
   return {P,score:best.v-base.v,state:{h:best.h,mask:best.mask,a:best.a,b:best.b,v:best.v}};
 }
 const preview=p=>p?.slice(0,90).map(x=>co.translit[x]).join("")??null;
 let inputs=[];for(let i=0;i<4;i++){let P=em.slice(72000+i*N,72000+(i+1)*N),K=hmm.out[i].key,f=forward(P,K);assert(f.holds.filter(j=>j<cut).every((x,j)=>x===hmm.out[i].trueHolds[j]),"plant match");inputs.push({name:hmm.out[i].name,C:f.C,P,K,ds:hmm.out[i].rows[0].ds.slice(0,3)})}
 const C=co.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices).slice(20);assert(C.length===N,"original length");inputs.push({name:"original-p15-22",C,ds:hmm.out.at(-1).rows[0].ds.slice(0,3)});
 let results=[];
 for(const [i,t] of inputs.entries()){if(caseIndex!==-1&&i!==caseIndex)continue;
   let b=beam(t.C,t.ds,width);
   if(!b.top?.length){results.push({name:t.name,ds:t.ds,truth:t.K??null,beam:b});continue}
   let cand=b.top.map(x=>({...x,fit:exact(t.C,x.K,0,cut)})).filter(x=>x.fit).sort((a,b)=>b.fit.score-a.fit.score);
   let win=cand[0],hold=exact(t.C,win.K,cut,N,win.fit.state);
   results.push({name:t.name,ds:t.ds,truth:t.K??null,key:win.K,fit:win.fit.score/cut,hold:hold?hold.score/(N-cut):null,fitHolds:win.fit.state.h,holdHolds:hold?hold.state.h-win.fit.state.h:null,fitCorrect:t.P?win.fit.P.filter((x,i)=>x===t.P[i]).length:null,holdCorrect:t.P&&hold?hold.P.filter((x,i)=>x===t.P[cut+i]).length:null,keyCorrect:t.K?win.K.filter((x,i)=>x===t.K[i]).length:null,preview:preview(win.fit.P),holdPreview:preview(hold?.P),beam:{counts:b.counts,maxRaw:b.maxRaw,totalRaw:b.totalRaw,keys:b.keys,top:b.top}});
 }
 return {config:{N,cut,width,lowCarryClasses:3,method:"affine carry-HMM selected first three deltas; exact incremental affine digit offsets; latent F and trigram beam; exact top-eight prefix refinement and frozen continuation"},results};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-p15-affine-zeckendorf-latent-f-hmm.json"];
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),Number(process.argv[2]??-1),Number(process.argv[3]??8192)),null,2));
module.exports={experiment,paths};
