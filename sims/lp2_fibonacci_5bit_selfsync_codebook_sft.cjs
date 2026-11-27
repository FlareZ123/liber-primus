"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(c,t){
 const ck=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const ids=s=>[...s].map(ch=>c.runes.indexOf(ch)).filter(x=>x>=0);
 const source=c.pages.filter(p=>p.indices.length),pg=t.split("%").filter(s=>ids(s).length);
 ck(eq(pg.map(ids),source.map(p=>p.indices)),"transcript");
 const pp=pg.filter((_,i)=>source[i].page<=55),pages=pp.map(ids),lines=pp.flatMap(p=>p.split("/").map(ids).filter(a=>a.length)),groups=pp.join("").replace(/[\/\n&$]/g,"").split(/[-.]/).map(ids).filter(a=>a.length),tape=pages.flat();
 ck(tape.length===12956&&eq(tape,lines.flat())&&eq(tape,groups.flat()),"conservation");
 const bit5=i=>i.toString(2).padStart(5,"0"),bits=Array.from({length:32},(_,i)=>bit5(i));
 const ALL=(1<<29)-1;
 function pop(x){x-=(x>>>1)&0x55555555;x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24}
 function parse(s,init){let last=init,start=-1,w=[];for(let i=0;i<s.length;i++){const v=+s[i];if(last&&v){if(start>=0)w.push(s.slice(start,i+1));start=i+1;last=0}else last=v}return {start,last,w}}
 const anchors=bits.flatMap((s,i)=>[0,1].every(x=>parse(s,x).start===5)?[i]:[]);
 const zero=bits.flatMap((s,i)=>s.includes("11")?[]:[i]);
 ck(eq(anchors,[3,11,15,19,27])&&zero.length===13,"sync patterns");
 ck(zero.filter(i=>bits[i].startsWith("1")).length===5&&zero.filter(i=>bits[i].endsWith("1")).length===5,"cross bound");
 const F=bits.map(a=>bits.map(b=>{const p=parse(a+b,0).w,q=new Set(parse(a+b,1).w);return [...new Set(p)].filter(w=>q.has(w))}));
 ck(F.flat(2).every(w=>w.length<=10),"disjoint length");
 function shortBounds(missing){
  const minima=Array(6).fill(Infinity);let cases=0;
  for(let a=0;a<30;a++)for(let b=a+1;b<31;b++)for(let c=b+1;c<32;c++){
   const S=Array.from({length:32},(_,i)=>i).filter(i=>![a,b,c].includes(i));let k=S.filter(i=>anchors.includes(i)).length;
   const f=new Map();for(let p of S)for(let q of S)for(let w of F[p][q])f.set(w,(f.get(w)??0)+1);
   const n=[...f.values()].filter(v=>v>missing).length;minima[k]=Math.min(minima[k],n);cases++;
  }
  ck(cases===4960,"omitted sets");return minima.slice(2);
 }
 // Integer-certified PSD lower bound. Float Cholesky only nominates a factor.
 // Exact integer residual diagonal dominance proves M+lambda I is PSD.
 let certs=0,maxResidual=0;
 function psd(mat){
  const n=mat.length,Q=10000,Q2=Q*Q;
  for(let l=1;l<=2*n;l++){
   let L=Array.from({length:n},()=>Array(n).fill(0)),ok=true;
   for(let i=0;i<n&&ok;i++)for(let j=0;j<=i;j++){
    let v=mat[i][j]+(i===j?l:0);for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];
    if(i===j){if(v<=1e-8){ok=false;break}L[i][j]=Math.sqrt(v)}else L[i][j]=v/L[j][j];
   }
   if(!ok)continue;
   const R=L.map(row=>row.map(x=>Math.round(x*Q))),lambda=l+1;
   for(let i=0;i<n&&ok;i++){
    let diag=0,off=0;
    for(let j=0;j<n;j++){
     let v=Q2*(mat[i][j]+(i===j?lambda:0));for(let k=0;k<=Math.min(i,j);k++)v-=R[i][k]*R[j][k];
     ck(Number.isSafeInteger(v),"integer residual");
     if(i===j)diag=v;else off+=Math.abs(v);
    }
    if(diag<off)ok=false;else maxResidual=Math.max(maxResidual,off);
   }
   if(ok){certs++;return lambda}
  }
  throw Error("PSD certificate failed");
 }
 function spectral(mask,I,m){
  const n=I.length,M=I.map(i=>I.map(j=>((mask[i]>>>j)&1)+((mask[j]>>>i)&1)));
  const d=M.map(r=>r.reduce((s,x)=>s+x,0)).sort((a,b)=>a-b);
  const sum=d.reduce((s,x)=>s+x,0),low=d.slice(0,m).reduce((s,x)=>s+x,0),l=psd(M);
  const num=2*m*n*low-m*m*sum-l*m*(n-m)*n,den=2*n*n;
  return {bound:Math.ceil(num/den),lambda:l,num,den};
 }
 // Independent small-graph controls compare every actual induced subset.
 let toy=0;for(let seed=0;seed<64;seed++){
  let x=(seed+1)>>>0,mask=new Uint32Array(8);for(let i=0;i<8;i++)for(let j=0;j<8;j++){x=(Math.imul(x,1664525)+1013904223)>>>0;if(x>>>31)mask[i]|=1<<j}
  const I=Array.from({length:8},(_,i)=>i);
  for(let m=1;m<=8;m++){let b=spectral(mask,I,m).bound;for(let Z=1;Z<256;Z++)if(pop(Z)===m){let e=0;for(let i=0;i<8;i++)if(Z>>>i&1)e+=pop(mask[i]&Z);ck(e>=b,"spectral lower bound");toy++}}
 }
 function analyze(label,frames){
  let pairs=new Set(),out=Array.from({length:29},()=>new Uint32Array(29)),trigrams=0;
  for(let a of frames){for(let i=1;i<a.length;i++)pairs.add(a[i-1]*29+a[i]);for(let i=2;i<a.length;i++){out[a[i-2]][a[i-1]]|=1<<a[i];trigrams++}}
  const missing=841-pairs.size,short=shortBounds(missing),results=[];
  for(let k=2;k<=5;k++){
   const m=15-k;let best=Infinity,n=0,winner=null,minRow=Infinity,spectralCount=0;
   function walk(a,idx,mask,A){
    if(a.length===k){
     const N=ALL^A,I=Array.from({length:29},(_,i)=>i).filter(i=>!(A>>>i&1));
     let d=I.map(i=>Math.max(0,pop(mask[i]&N)-(29-k-m))).sort((a,b)=>a-b);
     let row=d.slice(0,m).reduce((s,v)=>s+v,0);minRow=Math.min(minRow,row);
     let val=row,cert=null;
     // Only refine where the cheap row bound does not already meet 47
     // (47-25+at least eight forced short words >29).
     if(k<=3||row<47){cert=spectral(mask,I,m);spectralCount++;val=Math.max(val,cert.bound)}
     if(val<best){best=val;winner={a,row,cert}}
     n++;return;
    }
    for(let x=idx;x<=29-(k-a.length);x++)walk([...a,x],x+1,mask.map((v,b)=>v|out[x][b]),A|(1<<x));
   }
   walk([],0,new Uint32Array(29),0);
   const long=Math.max(0,best-25),s=short[k-2];results.push({k,m,anchorSubsets:n,minRow,best,spectralCount,winner,short:s,long,total:s+long});
  }
  return {label,frames:frames.length,pairSupport:pairs.size,missing,trigrams,results,min:Math.min(...results.map(x=>x.total))};
 }
 const original=[analyze("continuous",[tape]),analyze("page",pages),analyze("line",lines)];
 ck(original[0].min>29,"continuous original");
 return {anchors,zero,original,toy,psdCertificates:certs,maxResidual};
}
module.exports=run;
if(require.main===module){const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt")),null,2))}
