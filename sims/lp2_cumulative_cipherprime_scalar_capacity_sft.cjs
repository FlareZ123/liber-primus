"use strict";
// Cumulative ciphertext GP-prime checksum + predecessor scalar capacity.
// Run from the repository: node sims/lp2_cumulative_cipherprime_scalar_capacity_sft.cjs
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function experiment(gp,sources) {
  const Q=29, mod=x=>((x%Q)+Q)%Q;
  const pages=gp.pages.filter(p=>p.page>=40&&p.page<=53&&p.indices.length);
  const lengths=pages.map(p=>p.indices.length), tape=pages.flatMap(p=>p.indices);
  if(tape.length!==3008||lengths.length!==13||gp.prime.length!==29)throw Error("unexpected canonical chapter geometry");
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return a}
  function records(c,reset){let A=0,x=null,at=0,free=0;const triples=[];for(const n of lengths){if(reset){A=0;x=null}for(let j=0;j<n;j++){const y=c[at++];if(x===null)free++;else triples.push([A,x,y]);A=mod(A+gp.prime[y]);x=y}}return {triples,free}}
  function cap(rec,v,k){const h=new Int32Array(Q*Q);for(const [A,x,c] of rec.triples){const s=v===Q?x:mod(A+v*x),z=mod(c+k*(v===Q?A:x));h[s*Q+z]++}const out=Array(Q).fill(rec.free);for(let s=0;s<Q;s++){const row=Array.from(h.subarray(s*Q,(s+1)*Q)).sort((a,b)=>b-a);let acc=0;for(let j=0;j<Q;j++){acc+=row[j];out[j]+=acc}}return out}
  function scan(reset){const rec=records(tape,reset),maxima=Array(Q).fill(0),best=Array(Q).fill(null);let pure;for(let v=0;v<=Q;v++)for(let k=0;k<Q;k++){const U=cap(rec,v,k);if(v===0&&k===0)pure=U;for(let j=0;j<Q;j++)if(U[j]>maxima[j]){maxima[j]=U[j];best[j]=[v,k]}}const f=tape.filter(x=>x===0).length;const withF=maxima.map((x,j)=>Math.min(tape.length,Math.max(x,f+(j===0?0:maxima[j-1]))));return {reset,classes:870,free:rec.free,maxima,best,pure,withPhysicalClockF:withF}}
  const scans=[scan(false),scan(true)];
  function top2(h){let a=0,b=0;for(const x of h){if(x>=a){b=a;a=x}else if(x>b)b=x}return a+b}
  const nativeSources=sources.map(({name,source})=>({name,tape:native(source)}));
  const donors=nativeSources.map(({name,tape:d})=>{const h=new Int32Array(Q),W=tape.length;for(let i=0;i<W;i++)h[d[i]]++;let min=Infinity,minAt=-1;const passes=[0,0],fpasses=[0,0];for(let at=0;at+W<=d.length;at++){const t=top2(h);if(t<min){min=t;minAt=at}for(let i=0;i<2;i++){if(t<=scans[i].maxima[1])passes[i]++;if(t<=scans[i].withPhysicalClockF[1])fpasses[i]++}if(at+W<d.length){h[d[at]]--;h[d[at+W]]++}}return {name,length:d.length,windows:d.length-W+1,minTop2:min,minAt,passes,physicalClockFPasses:fpasses}});
  function plant(donor,offset,v,k,reset,hold,seed){let rng=seed>>>0;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0}
    const pi=Array.from({length:Q},()=>{const row=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){const j=rand()%(i+1);[row[i],row[j]]=[row[j],row[i]]}return row});const inverse=pi.map(row=>{const a=[];row.forEach((p,z)=>a[p]=z);return a});
    const P=donor.slice(offset,offset+tape.length),C=[],flags=[];let A=0,x=0,at=0;
    for(const n of lengths){if(reset){A=0;x=0}for(let j=0;j<n;j++){const p=P[at++],s=v===Q?x:mod(A+v*x),r=k*(v===Q?A:x),held=hold&&p===0,c=held?0:mod(inverse[s][p]-r);C.push(c);flags.push(held);A=mod(A+gp.prime[c]);x=c}}
    let decoded=[],h=new Int32Array(Q);A=0;x=0;at=0;for(const n of lengths){if(reset){A=0;x=0}for(let j=0;j<n;j++){const c=C[at],s=v===Q?x:mod(A+v*x),r=k*(v===Q?A:x),p=flags[at++]?0:pi[s][mod(c+r)];decoded.push(p);h[p]++;A=mod(A+gp.prime[c]);x=c}}
    if(decoded.some((p,i)=>p!==P[i]))throw Error("plant inverse failed");const U=cap(records(C,reset),v,k),F=C.filter(x=>x===0).length,lim=hold?Math.max(U[1],U[0]+F):U[1],actual=top2(h);if(actual>lim)throw Error("capacity violated");return {offset,v,k,reset,hold,seed,decoded:decoded.length,held:flags.filter(Boolean).length,cipherF:F,actualTop2:actual,capacity:lim}}
  const plants=[];for(let i=0;i<3;i++)for(const hold of [false,true])plants.push(plant(nativeSources[i%2].tape,i*3008,[0,7,29][i],[0,13,9][i],i!==0,hold,0x91a2b3c4+2*i+Number(hold)));
  return {lengths,N:tape.length,cipherF:tape.filter(x=>x===0).length,scans,donors,plants};
}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),paths.slice(1).map(name=>({name,source:read(name)}))),null,2));
module.exports={experiment};
