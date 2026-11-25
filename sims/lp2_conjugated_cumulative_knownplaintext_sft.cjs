'use strict';
/** Known-plaintext exact two-permutation GP29 recovery and finite source retrieval. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function encode(gp,s){const out=[];let tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}let t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function recover(c,p){
 const m=29,mod=x=>((x%m)+m)%m,observed=[...new Set(p)].sort((a,b)=>a-b),N=m+observed.length;
 const idx=new Map(observed.map((x,i)=>[x,m+i]));
 const inv=Array.from({length:m},(_,a)=>{for(let b=1;b<m;b++)if(a*b%m===1)return b;return 0});
 const rows=p.map((x,i)=>{let r=new Int32Array(N);r[c[i+1]]++;r[c[i]]--;r[idx.get(x)]--;return r});
 let rank=0,piv=[];
 for(let j=0;j<N;j++){let ix=rows.findIndex((r,i)=>i>=rank&&mod(r[j])!==0);if(ix<0)continue;[rows[rank],rows[ix]]=[rows[ix],rows[rank]];let r=rows[rank],a=inv[mod(r[j])];for(let k=j;k<N;k++)r[k]=mod(r[k]*a);
   for(let i=0;i<rows.length;i++)if(i!==rank&&mod(rows[i][j])){let f=mod(rows[i][j]);for(let k=j;k<N;k++)rows[i][k]=mod(rows[i][k]-f*r[k])}
   piv.push(j);rank++;
 }
 const free=Array.from({length:N},(_,i)=>i).filter(i=>!piv.includes(i));const basis=free.map(f=>{let v=Array(N).fill(0);v[f]=1;for(let i=0;i<rank;i++)v[piv[i]]=mod(-rows[i][f]);return v});
 // Dimension 1 is the constant S/no-increment degeneracy. Dimension 2
 // means the nonconstant solution is unique up to common nonzero scale
 // and S translation. Higher dimensions remain unresolved, not rejected.
 if(basis.length!==2)return {rank,variables:N,dim:basis.length,key:null,status:basis.length===1?"impossible":"underdetermined"};
 for(const b of basis){let s=b.slice(0,m).map(x=>mod(x-b[0])),h0=b.slice(m);if(new Set(s).size===m&&new Set(h0).size===observed.length){let h=Array(m).fill(null);observed.forEach((x,i)=>h[x]=h0[i]);return {rank,variables:N,dim:2,key:{s,h},status:"gauge-unique-observed"} }}
 return {rank,variables:N,dim:2,key:null,status:"impossible"};
}
function experiment(gp,files,texts){
 const corpora=texts.map((s,i)=>encode(gp,i===3?s.split("\n").filter(l=>!l.startsWith("#")&&!l.startsWith("[")).join("\n"):s));
 const m=29,mod=x=>((x%m)+m)%m;
 const cipher=(p,s,h,iv)=>{let inv=[];s.forEach((v,i)=>inv[v]=i);let c=[iv];for(let x of p)c.push(inv[mod(s[c.at(-1)]+h[x])]);return c};
 const decipher=(c,s,h)=>{let inv=[];h.forEach((v,i)=>inv[v]=i);return c.slice(1).map((x,i)=>inv[mod(s[x]-s[c[i]])])};
 function filters(c){let pos=Array.from({length:841},()=>[]),diag=[];for(let i=0;i<c.length-1;i++){pos[29*c[i]+c[i+1]].push(i);if(c[i]===c[i+1])diag.push(i)}
  const eq=[];if(diag.length>1)for(let i=1;i<diag.length;i++)eq.push([diag[0],diag[i]]);
  for(let v of pos)if(v.length>1)for(let j=1;j<v.length;j++)eq.push([v[0],v[j]]);
  const neq=[];if(diag.length)for(let i=0;i<c.length-1;i++)if(c[i]!==c[i+1])neq.push([diag[0],i]);
  return {eq,neq,compatible(p,start){for(let [i,j] of eq)if(p[start+i]!==p[start+j])return false;for(let [i,j] of neq)if(p[start+i]===p[start+j])return false;
    let row=new Int32Array(841).fill(-1),col=new Int32Array(841).fill(-1);for(let i=0;i<c.length-1;i++){let x=p[start+i],a=c[i],b=c[i+1],r=a*m+x,t=b*m+x;if(row[r]>=0&&row[r]!==b||col[t]>=0&&col[t]!==a)return false;row[r]=b;col[t]=a}return true}};
 }
 const ranges=[[0,2],[3,7],[23,26],[54,55]],result=[];
 for(let [lo,hi] of ranges){const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices),f=filters(c),n=c.length-1,by=[];
  for(let k=0;k<corpora.length;k++){let p=corpora[k],windows=Math.max(0,p.length-n+1),pass=0,full=0,unresolved=0,keys=[];
   for(let j=0;j<windows;j++)if(f.compatible(p,j)){pass++;let r=recover(c,p.slice(j,j+n));if(r.key){full++;keys.push({offset:j,...r})}else if(r.status==="underdetermined")unresolved++}
   by.push({file:files[k],runes:p.length,windows,compatible:pass,full,unresolved,keys});
  }
  result.push({range:[lo,hi],n,eq:f.eq.length,neq:f.neq.length,by});
 }
 // Two independent native passages, distinct secret permutations.
 let seed=0x330128ab;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296},perm=()=>{let a=Array.from({length:m},(_,i)=>i);for(let i=m-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const controls=[];
 for(let [k,start] of [[0,10000],[1,30000]]){let truth=corpora[k].slice(start,start+1743),s=perm(),h=perm(),c=cipher(truth,s,h,7),prefix=c.slice(0,1101),p=truth.slice(0,1100);if(!filters(prefix).compatible(p,0))throw Error("positive constraint failure");let r=recover(prefix,p);if(!r.key)throw Error("positive rank failure "+JSON.stringify(r));
   let known=r.key.h,missing=known.map((x,i)=>x===null?i:-1).filter(x=>x>=0),remaining=Array.from({length:m},(_,i)=>i).filter(i=>!known.includes(i));
   let completions=1;for(let i=2;i<=missing.length;i++)completions*=i;
   // Compute per-position exact domains under all missing-H bijections.
   let inv=new Map(known.flatMap((x,i)=>x===null?[]:[[x,i]])),holdout=c.slice(1101).map((x,i)=>{let d=mod(r.key.s[x]-r.key.s[c[1100+i]]);return inv.has(d)?[inv.get(d)]:missing});
   let unique=holdout.filter(x=>x.length===1).length,actual=truth.slice(1100);if(holdout.some((domain,i)=>!domain.includes(actual[i])))throw Error("positive heldout domain");
   let full=known.slice();missing.forEach((x,i)=>full[x]=remaining[i]);let decoded=decipher(c,r.key.s,full);
   if(decoded.slice(0,1100).some((x,i)=>x!==truth[i])||cipher(decoded,r.key.s,full,c[0]).some((x,i)=>x!==c[i]))throw Error("positive replay");
   controls.push({file:files[k],start,rank:r.rank,variables:r.variables,dim:r.dim,unseen:missing,completions,uniqueCorrect:unique,total:actual.length,truePathAll:holdout.every((d,i)=>d.includes(actual[i])),key:r.key})
 }
 return {result,controls};
}
const files=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/blake_song_of_liberty_train.txt","resources/control/cicada2012_blake_chorus.txt"];
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),files,files.map(read)),null,2));
