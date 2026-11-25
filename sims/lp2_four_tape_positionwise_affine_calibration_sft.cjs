'use strict';
// Calibration only: no original ciphertext scored.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[["sims/lp2_p27_p55_four_tape_shared_pad_sft.cjs","fc752ebe36ee92452b12aa3bf16d9816d3fdc57b"],["resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],["resources/control/shakespeare_first300k.txt","94c677ad9dd50771c6670e0c4e4dad9052b46d85"],["resources/control/gibran_prophet_58585.txt","df260a07d56bf5998d40a6360b6132c35c252d10"],["resources/control/emerson_essays_2944.txt","a92be8ba5b3511a003a22ba31523c14397aaa83a"]];
const values=inputs.map(([p,sha])=>{const b=fs.readFileSync(p);if(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')!==sha)throw Error('pin mismatch '+p);return b.toString('utf8')});
const helpers=require('./lp2_p27_p55_four_tape_shared_pad_sft.cjs');
function affineBeam(model,ct,W=512){
 const R=29,N=ct[0].length,mod=x=>(x%R+R)%R;if(ct.length!==4||ct.some(t=>t.length!==N||t.some(v=>!Number.isInteger(v)||v<0||v>=R)))throw Error("invalid tape");
 const tuples=ct[0].map((_,i)=>{const map=new Map();for(let a=1;a<R;a++)for(let b=0;b<R;b++){const p=ct.map(t=>mod(a*t[i]+b));const code=p.reduce((s,v)=>s*R+v,0);if(!map.has(code))map.set(code,{p,a,b})}return [...map.values()]});
 let beam=[{s:0,h:[0,0,0,0],p:[]}];
 for(let i=0;i<N;i++){
  const T=tuples[i],n=T.length,order=Math.min(i+1,4),tail=R**Math.min(i,2),L=model[order-1],heap=[];
  const push=x=>{if(heap.length<W){let j=heap.length;heap.push(x);while(j){const p=(j-1)>>1;if(heap[p].s<=x.s)break;heap[j]=heap[p];j=p}heap[j]=x;return}if(x.s<=heap[0].s)return;let j=0;while(2*j+1<heap.length){let k=2*j+1;if(k+1<heap.length&&heap[k+1].s<heap[k].s)k++;if(heap[k].s>=x.s)break;heap[j]=heap[k];j=k}heap[j]=x};
  for(let j=0;j<beam.length;j++){const q=beam[j],h=q.h,b0=h[0]*R,b1=h[1]*R,b2=h[2]*R,b3=h[3]*R;
   for(let k=0;k<n;k++){const t=T[k].p,s=q.s+L[b0+t[0]]+L[b1+t[1]]+L[b2+t[2]]+L[b3+t[3]];if(heap.length<W||s>heap[0].s)push({s,j,k})}}
  heap.sort((a,b)=>b.s-a.s);const next=[],seen=new Set();
  for(const x of heap){const q=beam[x.j],t=T[x.k].p,h=q.h.map((v,j)=>(v%tail)*R+t[j]),id=h.join(",");if(seen.has(id))continue;seen.add(id);next.push({s:x.s,h,p:q.p.concat(x.k)})}beam=next;
 }
 const best=beam[0],p=ct.map((_,j)=>best.p.map((k,i)=>tuples[i][k].p[j])),inverse=best.p.map((k,i)=>{const {a,b}=tuples[i][k];return [a,b]});let check=0;for(const t of p)for(let i=0;i<N;i++){let n=0,o=Math.min(4,i+1);for(let j=i-o+1;j<=i;j++)n=n*R+t[j];check+=model[o-1][n]}if(Math.abs(check-best.s)>1e-7||!p.every((t,j)=>t.every((v,i)=>v===mod(inverse[i][0]*ct[j][i]+inverse[i][1]))))throw Error("traceback");return {p,inverse,mean:best.s/(4*N),score:best.s,beam:W};
}
function controls(corpus,raw,helpers){
 const {tokenize,train,score}=helpers,donors=raw.map(t=>tokenize(corpus,t)),cuts=donors.map(t=>Math.floor(t.length*.67));const model=train(donors.map((t,i)=>t.slice(0,cuts[i])));let seed=0x8fae1;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n)};
 const results=[];for(let j=0;j<4;j++){const p=Array.from({length:4},(_,t)=>{const d=(j+t)%donors.length,off=cuts[d]+7200+j*1200+t*230;return donors[d].slice(off,off+76)});if(p.some(t=>t.length!==76))throw Error("short donor");const a=Array.from({length:76},()=>1+rnd(28)),b=Array.from({length:76},()=>rnd(29)),ct=p.map(t=>t.map((v,i)=>(a[i]*v+b[i])%29));const hit=affineBeam(model,ct,512);const truthMean=p.reduce((s,t)=>s+score(model,t),0)/304,exact=hit.p.reduce((n,t,k)=>n+t.filter((v,i)=>v===p[k][i]).length,0);results.push({j,exact,mean:hit.mean,truthMean,truth:p,recovered:hit.p,ct,planted:{a,b},inverse:hit.inverse})}return {train:cuts,heldout:donors.map((t,i)=>t.length-cuts[i]),beam:512,results};
}
console.log(JSON.stringify(controls(JSON.parse(values[1]),values.slice(2),helpers),null,2));
