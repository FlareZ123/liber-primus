'use strict';
// Exact p10 source-matrix affine offset inverse (all 29^13 offsets, four matrix orientations).
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native) {
  const Q=29,N=13,mod=x=>((x%Q)+Q)%Q;
  const p=corpus.pages.find(x=>x.page===10).indices;
  if(p.length!==263 || p.slice(260).join(",")!=="22,24,10") throw Error("p10 source framing mismatch");
  const M=Array.from({length:N},(_,i)=>p.slice(i*N,(i+1)*N));
  const tr=A=>A[0].map((_,j)=>A.map(a=>a[j]));
  /** @param {number[][]} A @returns {number[][]} */
  function inv(A){let b=A.map((a,i)=>a.concat(Array.from({length:N},(_,j)=>+(i===j))));for(let i=0;i<N;i++){let k=b.findIndex((a,j)=>j>=i&&a[i]);if(k<0)throw Error("singular matrix");[b[i],b[k]]=[b[k],b[i]];let s=Array.from({length:Q},(_,j)=>j).find(j=>mod(j*b[i][i])===1);b[i]=b[i].map(x=>mod(x*s));for(let j=0;j<N;j++)if(j!==i){let f=b[j][i];b[j]=b[j].map((x,k)=>mod(x-f*b[i][k]));}}return b.map(a=>a.slice(N));}
  const ops=[M,inv(M),tr(M),tr(inv(M))],names=["M","M^-1","M^T","M^-T"], inverses=ops.map(inv);
  const apply=(A,a)=>Array.from({length:a.length/N},(_,i)=>A.map(row=>mod(row.reduce((s,x,k)=>s+x*a[i*N+k],0)))).flat();
  const held=["0_warning","0_wisdom","jpg107-167","p57_parable"];
  const ss=Object.fromEntries(native.sections.map(s=>[s.name,[...s.source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0)]));
  let u=Array(Q).fill(.5),b=Array.from({length:Q},()=>Array(Q).fill(0)),training=0;
  for(const [k,a] of Object.entries(ss))if(!held.includes(k)){training+=a.length;a.forEach(x=>u[x]++);for(let i=1;i<a.length;i++)b[a[i-1]][a[i]]++;}
  const sum=a=>a.reduce((s,x)=>s+x,0),U=u.map(x=>x/sum(u)),B=b.map(row=>row.map((x,i)=>(x+16*U[i])/(sum(row)+16)));
  // Exact relative-uniform partition function over all 29^13 affine offsets.
  // Condition on first offset; all remaining interactions form a path.
  /** @param {number[]} a */
  function infer(a){
    const w=Array.from({length:N},()=>Array.from({length:Q},()=>new Float64Array(Q).fill(1))),start=U.map((_,k)=>Q*U[mod(a[0]-k)]);
    for(let t=1;t<a.length;t++){const j=t%N;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)w[j][x][y]*=Q*B[mod(a[t-1]-x)][mod(a[t]-y)];}
    let Z=0,best=-1,bkey;
    for(let k0=0;k0<Q;k0++){
      let s=new Float64Array(Q),m=new Float64Array(Q),back=Array.from({length:N},()=>new Int8Array(Q));s[k0]=m[k0]=start[k0];
      for(let j=1;j<N;j++){
        let sn=new Float64Array(Q),mn=new Float64Array(Q);
        for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){let f=w[j][x][y];sn[y]+=s[x]*f;let v=m[x]*f;if(v>mn[y]){mn[y]=v;back[j][y]=x;}}
        s=sn;m=mn;
      }
      for(let x=0;x<Q;x++){Z+=s[x]*w[0][x][k0];let z=m[x]*w[0][x][k0];if(z>best){best=z;bkey=Array(N);bkey[N-1]=x;for(let j=N-1;j>0;j--)bkey[j-1]=back[j][bkey[j]];}}
    }
    return {lnBF:Math.log(Z)-N*Math.log(Q),key:bkey,score:Math.log(best)/a.length-Math.log(Q)};
  }
  const decode=(a,k)=>a.map((x,i)=>mod(x-k[i%N])),enc=(a,k)=>a.map((x,i)=>mod(x+k[i%N]));
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const count=(a,b)=>a.reduce((s,x,i)=>s+Number(x===b[i]),0);
  const lse=a=>{const m=Math.max(...a);return m+Math.log(sum(a.map(x=>Math.exp(x-m))));};
  /** @param {number[]} ciphertext @param {number[]|null} truth @param {boolean} detail */
  function examine(ciphertext,truth,detail=false){
    const rows=ops.map((A,i)=>{
      const a=apply(A,ciphertext),fit=infer(a.slice(0,65)),full=infer(a);
      const pfit=decode(a,fit.key),pfull=decode(a,full.key);
      if(!same(apply(inverses[i],enc(pfull,full.key)),ciphertext))throw Error("full replay failure");
      if(!same(apply(inverses[i],enc(pfit,fit.key)),ciphertext))throw Error("fit replay failure");
      return {op:names[i],fitBF:fit.lnBF,fullBF:full.lnBF,heldPredictiveBF:full.lnBF-fit.lnBF,fitKey:fit.key,fullKey:full.key,fullScore:full.score,fitHeldCorrect:truth?count(pfit.slice(65),truth.slice(65)):null,fullCorrect:truth?count(pfull,truth):null,...(detail?{fullIndices:pfull,fitHeldIndices:pfit.slice(65),readout:pfull.map(x=>corpus.translit[x]).join("")}:{})};
    });
    const fit=lse(rows.map(x=>x.fitBF))-Math.log(4),full=lse(rows.map(x=>x.fullBF))-Math.log(4);
    const fitBest=rows.reduce((a,b)=>a.fitBF>b.fitBF?a:b),fullBest=rows.reduce((a,b)=>a.fullBF>b.fullBF?a:b);
    return {mixFitBF:fit,mixFullBF:full,mixHeldBF:full-fit,fitBest:fitBest.op,fullBest:fullBest.op,fitBestHeldCorrect:fitBest.fitHeldCorrect,fullBestCorrect:fullBest.fullCorrect,rows};
  }
  let seed=3301;
  function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%Q;}
  const original=examine(p.slice(169,260),null,true);
  const controls=[];
  const windows=held.map((k,i)=>[k,0,i]).concat([["0_warning",91,1],["jpg107-167",91,3],["jpg107-167",182,0]]);
  for(const [section,offset,i] of windows){const truth=ss[section].slice(offset,offset+91);if(truth.length!==91)throw Error("control length");const key=Array.from({length:N},rand),ct=apply(inverses[i],enc(truth,key));controls.push({section,offset,trueOp:names[i],trueKey:key,...examine(ct,truth)});}
  const nulls=Array.from({length:8},(_,i)=>({id:i,...examine(Array.from({length:91},rand),null)}));
  return {scope:"p10 original rune offsets169:260, final offsets260:263 unconsumed",training,held,seed:3301,original,controls,nulls};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
