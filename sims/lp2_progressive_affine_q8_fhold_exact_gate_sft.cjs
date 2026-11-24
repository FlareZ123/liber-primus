"use strict";
/** Exact q8 progressive affine drift gate with arbitrary phase bijections and latent F holds. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
function run(gp,raw,sourceBlobShas){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"translit "+w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 function power(a,b){const T=[Array.from({length:29},(_,i)=>i)];for(let m=1;m<=3;m++)T.push(T[m-1].map(i=>(a*i+b)%29));return T}
 function stats(c,q,a=1,b=0){const T=power(a,b);let R=0,B=0;for(let m=1;m<=3;m++){const lag=m*q;for(let i=lag;i<c.length;i++)if(T[m][c[i-lag]]===c[i]){R++;if(i>lag&&T[m][c[i-lag-1]]===c[i-1])B++}}return [R,B]}
 function graph(C,q){let states=[""],steps=[],peak=1;for(const c of C){const next=[],map=new Map();function id(h){if(!map.has(h)){map.set(h,next.length);next.push(h)}return map.get(h)}const edges=states.map(h=>{const pairs=[];for(let m=1;m<=3;m++){let l=m*q;if(h.length>=l)pairs.push([m,h.charCodeAt(h.length-l),c,h.length>l?h.charCodeAt(h.length-l-1):-1,h.length>l?h.charCodeAt(h.length-1):-1])}return [c===0?id(h):-1,id((h+String.fromCharCode(c)).slice(-(3*q+1))),pairs]});steps.push([next.length,edges]);states=next;peak=Math.max(peak,states.length)}return {steps,peak}}
 function bounds(G,a,b){const T=power(a,b);let R=new Int16Array(G.peak),B=new Int16Array(G.peak),S=new Int16Array(G.peak),U=new Int16Array(G.peak);let n=1;for(const [len,edges] of G.steps){S.fill(-1,0,len);U.fill(-1,0,len);for(let i=0;i<n;i++){const [skip,take,pairs]=edges[i];if(skip>=0){if(R[i]>S[skip])S[skip]=R[i];if(B[i]>U[skip])U[skip]=B[i]}let x=0,y=0;for(const [m,v,w,v0,w0] of pairs){if(T[m][v]===w){x++;if(v0>=0&&T[m][v0]===w0)y++}}if(R[i]+x>S[take])S[take]=R[i]+x;if(B[i]+y>U[take])U[take]=B[i]+y;}[R,S]=[S,R];[B,U]=[U,B];n=len;}return [Math.max(...R.subarray(0,n)),Math.max(...B.subarray(0,n))]}
 let seed=0xaff2641;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 let toyCases=0;for(let t=0;t<64;t++){const c=Array.from({length:16},()=>rng()%5),zs=c.flatMap((v,i)=>v===0?[i]:[]),q=2+rng()%3,a=2+rng()%27,b=rng()%29,g=[];for(let m=0;m<(1<<zs.length);m++){const skip=new Set(zs.filter((_,i)=>(m>>i)&1));g.push(stats(c.filter((_,i)=>!skip.has(i)),q,a,b))}const bo=bounds(graph(c,q),a,b);assert(bo.every((v,j)=>v===Math.max(...g.map(x=>x[j]))),"toy max");toyCases++}
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),P=raw.map(native),n=C.length,F=C.filter(x=>x===0).length;assert(n===3008&&F===125,"source shape");const q=8;
 const plants=[];
 for(const [j,a,b,start,origin] of [[0,2,7,10000,0],[1,7,13,23000,3],[2,28,11,4000,7]]){
   const plain=P[j].slice(start,start+n),K=Array.from({length:q},()=>{const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let k=rng()%(i+1);[p[i],p[k]]=[p[k],p[i]]}return p});
   let k=origin,T=Array.from({length:29},(_,i)=>i);const cipher=plain.map(x=>{if(x===0)return 0;const out=T[K[k%q][x]];k++;if(k%q===0)T=T.map(y=>(a*y+b)%29);return out});
   const pa=plain.filter(x=>x!==0),ca=cipher.filter((_,i)=>plain[i]!==0),actual=stats(pa,q),cipherStats=stats(ca,q,a,b);assert(actual.join()===cipherStats.join(),"affine invariant");
   const G=graph(cipher,q),bo=bounds(G,a,b);assert(actual.every((v,i)=>v<=bo[i]),"plant bound");
   plants.push({source:j,a,b,start,origin,K,n:plain.length,holds:n-pa.length,cipherFs:cipher.filter(x=>x===0).length,actual,max:bo,peak:G.peak});
 }
 const controls=P.flatMap((p,j)=>Array.from({length:32},(_,i)=>{const start=Math.round(i*(p.length-n)/31),w=p.slice(start,start+n),a=w.filter(x=>x!==0);return {j,i,start,H:n-a.length,stats:stats(a,q)}}));
 const min=[0,1].map(j=>Math.min(...controls.map(x=>x.stats[j]))), minNativeRate=[0,1].map(j=>Math.min(...controls.map(x=>x.stats[j]/(3*(n-x.H)-6*q-3*j))));
 const G=graph(C,q),results=[];
 for(let a=2;a<29;a++)for(let b=0;b<29;b++){const max=bounds(G,a,b),pass=controls.filter(c=>c.H<=F&&c.stats.every((v,j)=>v<=max[j])).length;results.push({a,b,max,pass})}
 return {sourceBlobShas,n,F,q,seed:"0xaff2641",toyCases,plants,min,minNativeRate,peak:G.peak,max:[0,1].map(j=>Math.max(...results.map(x=>x.max[j]))),survivors:results.filter(x=>x.pass),controls,results};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const shas=raw.map(x=>crypto.createHash("sha1").update("blob "+Buffer.byteLength(x)+"\0").update(x).digest("hex"));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1),shas),null,2));
