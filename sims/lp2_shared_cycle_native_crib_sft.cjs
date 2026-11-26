"use strict";
/** Agent10: exact native crib recovery for common GP29 cyclic action and F holds.
 * Run from repository root: node sims/lp2_shared_cycle_native_crib_sft.cjs
 */
const mod=x=>((x%29)+29)%29;
const inv=Array.from({length:29},(_,v)=>{for(let x=1;x<29;x++)if(v*x%29===1)return x;return 0});
function assert(x,msg){if(!x)throw Error(msg)}
function signature(A,i,L,q,holds){
 const rows=new Int8Array(q*29).fill(-1),next=new Int8Array(q);let h=0,r=0,chars=[];
 for(let t=0;t<L;t++){
  if(h<holds.length&&holds[h]===t){h++;continue}
  const k=r*29+A[i+t];let v=rows[k];if(v<0)rows[k]=v=next[r]++;
  chars.push(65+v);if(++r===q)r=0;
 }
 return String.fromCharCode(...chars);
}
function compatible(P,j,C,i,q){
 const fw=new Int8Array(q*29).fill(-1),rv=new Int8Array(q*29).fill(-1),m=new Int8Array(q);let r=0,t=0,L=Math.min(P.length-j,C.length-i);
 for(;t<L;t++){
  const p=P[j+t],c=C[i+t];if(!p){if(c)break;continue}
  const x=r*29+p,y=r*29+c,z=p===c?1:2;
  if((m[r]&&m[r]!==z)||(fw[x]>=0&&fw[x]!==c)||(rv[y]>=0&&rv[y]!==p))break;
  m[r]=z;fw[x]=c;rv[y]=p;if(++r===q)r=0;
 }
 return t;
}
function indexed(C,D,q,L,fixedStart=null){
 const masks=new Map();let windows=0;
 for(let donor=0;donor<D.length;donor++){const P=D[donor].P;for(let j=0;j+L<=P.length;j++){
  const h=[];for(let t=0;t<L;t++)if(P[j+t]===0)h.push(t);
  const mk=h.join(","),s=signature(P,j,L,q,h);let mm=masks.get(mk);if(!mm)masks.set(mk,mm=new Map());
  const arr=mm.get(s);if(arr)arr.push([donor,j]);else mm.set(s,[[donor,j]]);windows++;
 }}
 let rows=[],relaxed=0,maskLookups=0,maxF=0,max=0;
 for(let i=fixedStart??0;i+L<=C.length&&(fixedStart===null||i===fixedStart);i++){
  const z=[];for(let t=0;t<L;t++)if(C[i+t]===0)z.push(t);maxF=Math.max(maxF,z.length);
  assert(z.length<31,"too many optional holds for exhaustive bitmask");
  for(let k=0;k<(1<<z.length);k++){
   const h=[];for(let b=0;b<z.length;b++)if((k>>b)&1)h.push(z[b]);const mm=masks.get(h.join(","));if(!mm)continue;maskLookups++;
   const arr=mm.get(signature(C,i,L,q,h));if(!arr)continue;relaxed+=arr.length;
   for(const[donor,j]of arr){const len=compatible(D[donor].P,j,C,i,q);if(len<L)continue;rows.push({donor,j,i,len});max=Math.max(max,len)}
  }
 }
 return {q,L,windows,maskTypes:masks.size,maskLookups,maxF,relaxed,count:rows.length,max,rows}
}
function solve(P,j,C,i,L,q,limit=2e6){
 const n=28+q,rows=[];let phase=0;
 for(let t=0;t<L;t++){
  const p=P[j+t],c=C[i+t];if(!p){if(c)return {status:"F"};continue}
  const row=new Int32Array(n+1);if(c)row[c-1]++;if(p)row[p-1]--;row[28+phase]--;
  rows.push(Array.from(row,mod));if(++phase===q)phase=0;
 }
 // All solutions equivalent by nonzero scaling. pi(0)=0, pi(1)=1.
 const gauge=new Array(n+1).fill(0);gauge[0]=1;gauge[n]=1;rows.push(gauge);
 let piv=[],r=0;
 for(let k=0;k<n;k++){
  let s=r;while(s<rows.length&&!rows[s][k])s++;if(s===rows.length)continue;
  [rows[r],rows[s]]=[rows[s],rows[r]];
  const iv=inv[rows[r][k]];for(let l=k;l<=n;l++)rows[r][l]=mod(rows[r][l]*iv);
  for(let t=0;t<rows.length;t++)if(t!==r&&rows[t][k]){const m=rows[t][k];for(let l=k;l<=n;l++)rows[t][l]=mod(rows[t][l]-m*rows[r][l])}
  piv.push(k);r++;
 }
 if(rows.slice(r).some(x=>x[n]))return {status:"inconsistent",rank:r};
 const free=Array.from({length:n},(_,k)=>k).filter(k=>!piv.includes(k)),d=free.length;
 const forms=Array.from({length:n+1},()=>new Int8Array(d+1));
 for(let j=0;j<d;j++)forms[free[j]+1][j+1]=1;
 for(let t=0;t<r;t++){const x=forms[piv[t]+1];x[0]=rows[t][n];for(let j=0;j<d;j++)x[j+1]=mod(-rows[t][free[j]])}
 const seen=new Set();for(let k=0;k<29;k++){const s=forms[k].join(",");if(seen.has(s))return {status:"forced_equal_labels",rank:r,nullity:d};seen.add(s)}
 const num=29**d;
 if(num>limit)return {status:"unresolved",rank:r,nullity:d,num};
 let count=0,one=null;
 for(let a=0;a<num;a++){
  let z=a,xs=[];for(let j=0;j<d;j++){xs.push(z%29);z=Math.floor(z/29)}
  const values=new Int8Array(n+1);let mask=0,valid=true;
  for(let k=0;k<29;k++){
   const f=forms[k];let v=f[0];for(let j=0;j<d;j++)v+=f[j+1]*xs[j];v%=29;
   if(mask&(1<<v)){valid=false;break}mask|=1<<v;values[k]=v;
  }
  if(!valid)continue;
  for(let k=29;k<=n;k++){const f=forms[k];let v=f[0];for(let j=0;j<d;j++)v+=f[j+1]*xs[j];values[k]=v%29}
  count++;if(!one)one={pi:Array.from(values.slice(0,29)),K:Array.from(values.slice(29))};
 }
 return {status:count?"feasible":"enumerated_no_permutation",rank:r,nullity:d,num,count,one}
}
function encrypt(P,pi,K){
 const rev=new Int8Array(29);pi.forEach((x,i)=>rev[x]=i);
 let phase=0;return P.map(p=>{if(p===0)return 0;const c=rev[mod(pi[p]+K[phase])];phase=(phase+1)%K.length;return c});
}
function inversePaths(C,pi,K,initial){
 const rev=new Int8Array(29);pi.forEach((x,i)=>rev[x]=i);let states=[{phase:initial,P:[]}];
 for(const c of C){const out=[];
  for(const {phase,P} of states){
   if(c===0)out.push({phase,P:[...P,0]});
   const p=rev[mod(pi[c]-K[phase])];if(p)out.push({phase:(phase+1)%K.length,P:[...P,p]});
  }
  states=out;
 }
 return states.map(x=>x.P);
}
function control(D,q,donor,j,seed){
 let s=seed>>>0;const rng=n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n};
 const pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>=2;i--){const k=1+rng(i);[pi[i],pi[k]]=[pi[k],pi[i]]}
 const K=Array.from({length:q},()=>rng(29));assert(K.some(x=>x!==K[0]),"degenerate control");
 const fit=160,hold=64,P=D[donor].P.slice(j,j+fit+hold);assert(P.length===fit+hold,"control source");
 const C=encrypt(P,pi,K),z=indexed(C.slice(0,fit),D,q,fit,0);
 let feasible=[],unresolved=0;
 for(const row of z.rows){const r=solve(D[row.donor].P,row.j,C,0,fit,q);if(r.status==="feasible")feasible.push({...row,...r});if(r.status==="unresolved")unresolved++}
 assert(!unresolved&&feasible.length===1,"nonunique control crib "+JSON.stringify({unresolved,feasible}));
 const {one,count,donor:foundD,j:foundJ}=feasible[0];
 assert(foundD===donor&&foundJ===j&&count===1,"control did not recover exact normalized key "+JSON.stringify(feasible[0]));
 const scale=inv[pi[1]];
 assert(one.pi.every((v,i)=>v===mod(pi[i]*scale))&&one.K.every((v,i)=>v===mod(K[i]*scale)),"control wrong key");
 const phase=P.slice(0,fit).filter(x=>x!==0).length%q;
 const candidates=inversePaths(C.slice(fit),one.pi,one.K,phase);
 const truth=P.slice(fit).join(",");
 assert(candidates.some(x=>x.join(",")===truth),"control lost withheld plaintext");
 assert(encrypt(P,one.pi,one.K).every((x,i)=>x===C[i]),"control exact replay");
 return {q,source:D[donor].name,sourceOffset:j,seed,fit,hold,phase,feasible:feasible.length,rank:feasible[0].rank,normalizedKeyCount:count,exactKey:true,heldoutPaths:candidates.length,heldoutTruth:true,uniqueHeldout:candidates.length===1};
}
function main(corpus,native){
 const C=corpus.pages.filter(x=>x.page<56).flatMap(x=>x.indices),idx=new Map(native.runes.map((x,i)=>[x,i]));
 const D=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 assert(C.length===12956&&D.length===9&&D.map(x=>x.P.length).join(",")==="184,515,157,780,755,319,89,85,95","source profile");
 const controls=[control(D,8,1,101,0x60319a),control(D,13,3,151,0x83079b)];
 const outputs=[];
 for(const q of [8,13]){
  const z=indexed(C,D,q,48);let hist={},feasible=[],unresolved=[];
  for(const row of z.rows){
   // Exactly the frozen 48-prefix, not its longer relaxed extension.
   const s=solve(D[row.donor].P,row.j,C,row.i,z.L,q);
   hist[s.status]=(hist[s.status]||0)+1;
   if(s.status==="feasible")feasible.push({...row,section:D[row.donor].name,...s});
   if(s.status==="unresolved")unresolved.push({...row,...s});
  }
  delete z.rows;outputs.push({...z,hist,feasible,unresolved,alignments:(C.length-z.L+1)*z.windows});
 }
 return {sourceLengths:D.map(x=>[x.name,x.P.length]),cipher:C.length,controls,outputs};
}
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){
 const fs=require("node:fs");console.log(JSON.stringify(main(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8")),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"))),null,2));
}

if(typeof module!=="undefined")module.exports={indexed,solve,compatible,signature,encrypt,inversePaths};
