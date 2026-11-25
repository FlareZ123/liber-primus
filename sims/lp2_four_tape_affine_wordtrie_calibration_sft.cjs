'use strict';
// Four-lane word-trie calibration; controls only, original gated on successful calibration.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[["sims/lp2_p27_p55_four_tape_shared_pad_sft.cjs","fc752ebe36ee92452b12aa3bf16d9816d3fdc57b"],["resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],["resources/control/shakespeare_first300k.txt","94c677ad9dd50771c6670e0c4e4dad9052b46d85"],["resources/control/gibran_prophet_58585.txt","df260a07d56bf5998d40a6360b6132c35c252d10"],["resources/control/emerson_essays_2944.txt","a92be8ba5b3511a003a22ba31523c14397aaa83a"],["resources/control/english_wordfreq_textblob.txt","140e1d22b5f8c45deddd2e8b25549d9d6307d938"]];
const values=inputs.map(([p,sha])=>{const b=fs.readFileSync(p);if(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')!==sha)throw Error('pin mismatch '+p);return b.toString('utf8')});
const {tokenize}=require('./lp2_p27_p55_four_tape_shared_pad_sft.cjs');
function prepare(corpus,raw,tokenize){
 const Q=29,mod=x=>(x%Q+Q)%Q;
 const body=t=>{const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)};
 const donors=raw.slice(0,3).map(t=>(body(t).match(/[A-Za-z]+/g)||[]).map(w=>tokenize(corpus,w)).filter(w=>w.length>0)),cuts=donors.map(t=>Math.floor(t.length*.67));
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),counts=new Map(),external=new Map(),inc=(m,k,v)=>m.set(k,(m.get(k)||0)+v);let sum=0,esum=0;
 for(let d=0;d<3;d++)for(const w of donors[d].slice(0,cuts[d])){if(w.length>24)continue;inc(counts,id(w),1);sum++}
 for(const line of raw[3].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const w=tokenize(corpus,m[1]);if(!w.length||w.length>24)continue;inc(external,id(w),+m[2]);esum+=+m[2]}
 const words=[...new Set([...counts.keys(),...external.keys()])];const nodes=[{next:new Int32Array(Q).fill(-1),mass:0,term:0,word:-1}],wordMap=new Map(),paths=[];
 for(let j=0;j<words.length;j++){const w=words[j],mass=.84*(counts.get(w)||0)/sum+.159*(external.get(w)||0)/esum+.001/words.length;let k=0,route=[0];nodes[k].mass+=mass;for(const c of w){const x=c.charCodeAt(0)-65;let u=nodes[k].next[x];if(u<0){u=nodes.length;nodes[k].next[x]=u;nodes.push({next:new Int32Array(Q).fill(-1),mass:0,term:0,word:-1})}k=u;nodes[k].mass+=mass;route.push(k)}nodes[k].term=mass;nodes[k].word=j;wordMap.set(w,j);paths.push(route)}
 // Sparse conditional prefix counts from observed training word bigrams.
 const prefix=Array.from({length:words.length},()=>null),term=Array.from({length:words.length},()=>null);
 for(let d=0;d<3;d++){let prev=-1;for(const w of donors[d].slice(0,cuts[d])){const j=wordMap.get(id(w))??-1;if(prev>=0&&j>=0){const a=prefix[prev]??(prefix[prev]=new Map()),b=term[prev]??(term[prev]=new Map());for(const k of paths[j])inc(a,k,1);inc(b,paths[j].at(-1),1)}prev=j}}
 return {Q,donors,cuts,id,wordMap,nodes,prefix,term,words,lex:words.length};
}
function recover(model,ct,W=512){
 const {Q,nodes,prefix,term}=model,N=ct[0].length,mod=x=>(x%Q+Q)%Q;const check=(x,m)=>{if(!x)throw Error(m)};
 check(ct.length===4&&ct.every(t=>t.length===N),"tapes");
 const tuples=ct[0].map((_,i)=>{const seen=new Set(),out=[];for(let a=1;a<Q;a++)for(let b=0;b<Q;b++){const p=ct.map(t=>mod(a*t[i]+b)),code=p.reduce((n,v)=>n*Q+v,0);if(!seen.has(code)){seen.add(code);out.push({p,a,b})}}return out});
 const L=12,cache=new Map();
 function options(prev,node){
  const tag=prev+","+node;if(cache.has(tag))return cache.get(tag);const a=prev<0?null:prefix[prev],b=prev<0?null:term[prev],m=nodes[node],den=(a?.get(node)||0)+L*m.mass;
  const opts=Array.from({length:Q},()=>[]);
  for(let x=0;x<Q;x++){const k=m.next[x];if(k>=0)opts[x].push({prev,node:k,s:Math.log(((a?.get(k)||0)+L*nodes[k].mass)/den),end:false})}
  if(m.word>=0){const close=Math.log(((b?.get(node)||0)+L*m.term)/den),q=prefix[m.word],root=(q?.get(0)||0)+L*nodes[0].mass;
   for(let x=0;x<Q;x++){const k=nodes[0].next[x];if(k>=0)opts[x].push({prev:m.word,node:k,s:close+Math.log(((q?.get(k)||0)+L*nodes[k].mass)/root),end:true})}}
  cache.set(tag,opts);return opts;
 }
 let beam=[{s:0,prev:[-1,-1,-1,-1],node:[0,0,0,0],path:null}],maxCache=0,expanded=0;
 for(let i=0;i<N;i++){
  const T=tuples[i],heap=[],K=W*2;
  const push=(s,j,k,a,b,c,d)=>{if(heap.length===K&&s<=heap[0].s)return;const x={s,j,k,a,b,c,d};if(heap.length<K){let u=heap.length;heap.push(x);while(u){const v=(u-1)>>1;if(heap[v].s<=s)break;heap[u]=heap[v];u=v}heap[u]=x;return}let u=0;while(2*u+1<heap.length){let v=2*u+1;if(v+1<heap.length&&heap[v+1].s<heap[v].s)v++;if(heap[v].s>=s)break;heap[u]=heap[v];u=v}heap[u]=x};
  for(let j=0;j<beam.length;j++){const q=beam[j],o=q.node.map((n,t)=>options(q.prev[t],n));for(let k=0;k<T.length;k++){const p=T[k].p,A=o[0][p[0]],B=o[1][p[1]],C=o[2][p[2]],D=o[3][p[3]];if(!A.length||!B.length||!C.length||!D.length)continue;for(const a of A)for(const b of B)for(const c of C)for(const d of D){expanded++;push(q.s+a.s+b.s+c.s+d.s,j,k,a,b,c,d)}}}
  heap.sort((a,b)=>b.s-a.s);const seen=new Set(),next=[];
  for(const x of heap){const z=[x.a,x.b,x.c,x.d],prev=z.map(a=>a.prev),node=z.map(a=>a.node),tag=prev.join(",")+"|"+node.join(",");if(seen.has(tag))continue;seen.add(tag);next.push({s:x.s,prev,node,path:{old:beam[x.j].path,k:x.k,ends:z.map(a=>a.end)}});if(next.length===W)break}
  beam=next;maxCache=Math.max(maxCache,cache.size);if(cache.size>50000)cache.clear();if(!beam.length)return {deadAt:i,expanded,maxCache};
 }
 const best=beam[0],choices=[],ends=[];for(let v=best.path;v;v=v.old){choices.push(v.k);ends.push(v.ends)}choices.reverse();ends.reverse();const p=ct.map((_,j)=>choices.map((k,i)=>tuples[i][k].p[j])),inverse=choices.map((k,i)=>[tuples[i][k].a,tuples[i][k].b]);check(p.every((t,j)=>t.every((v,i)=>v===mod(inverse[i][0]*ct[j][i]+inverse[i][1]))),"replay");return {p,inverse,ends,score:best.s,mean:best.s/(4*N),expanded,maxCache};
}
function control(model,j,W){
 const {donors,cuts,id,wordMap,Q}=model,N=76;const p=[],offsets=[],wordSeq=[];
 for(let t=0;t<4;t++){const d=(j+t)%3,words=donors[d];let at=cuts[d]+500+j*200+t*60;for(;at<words.length;at++){let v=[],ws=[];for(let z=at;v.length<N&&z<words.length;z++){const w=words[z];if(!wordMap.has(id(w)))break;v.push(...w);ws.push(w)}if(v.length>=N){p.push(v.slice(0,N));wordSeq.push(ws);offsets.push([d,at]);break}}}
 if(p.length!==4)throw Error("short source");let seed=(0x8fae1+j*1337)>>>0;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n)};const a=Array.from({length:N},()=>1+rnd(28)),b=Array.from({length:N},()=>rnd(Q)),ct=p.map(t=>t.map((v,i)=>(a[i]*v+b[i])%Q));const hit=recover(model,ct,W);const exact=hit.p?hit.p.reduce((n,t,k)=>n+t.filter((v,i)=>v===p[k][i]).length,0):0;return {j,offsets,exact,truth:p,words:wordSeq,ct,planted:{a,b},...hit};
}
function exactFixedTape(model,tape){
 const {Q,nodes,prefix,term}=model,L=12;let states=new Map([["-1,0",{prev:-1,node:0,s:0}]]),maxStates=1;
 for(const x of tape){const next=new Map();const add=(prev,node,s)=>{const k=prev+","+node;if(!next.has(k)||next.get(k).s<s)next.set(k,{prev,node,s})};
  for(const v of states.values()){const {prev,node,s}=v,a=prev<0?null:prefix[prev],b=prev<0?null:term[prev],m=nodes[node],den=(a?.get(node)||0)+L*m.mass,k=m.next[x];
   if(k>=0)add(prev,k,s+Math.log(((a?.get(k)||0)+L*nodes[k].mass)/den));
   if(m.word>=0){const close=Math.log(((b?.get(node)||0)+L*m.term)/den),q=prefix[m.word],root=(q?.get(0)||0)+L*nodes[0].mass,u=nodes[0].next[x];if(u>=0)add(m.word,u,s+close+Math.log(((q?.get(u)||0)+L*nodes[u].mass)/root))}
  }
  states=next;maxStates=Math.max(maxStates,states.size);
 }
 return {score:Math.max(...[...states.values()].map(x=>x.s)),maxStates};
}
function oneSiteAlternatives(model,control,exactFixedTape){
 const p=control.truth.map(t=>t.slice()),ct=control.ct,N=p[0].length,Q=29,mod=x=>(x%Q+Q)%Q,base=p.reduce((s,t)=>s+exactFixedTape(model,t).score,0);
 let valid=0,improved=0,sites=0,best=null;const perSite=[];
 for(let i=0;i<N;i++){
  const costs=p.map(t=>{const old=t[i],a=new Float64Array(Q);for(let x=0;x<Q;x++){t[i]=x;a[x]=exactFixedTape(model,t).score}t[i]=old;return a});
  const seen=new Set(),truth=p.map(t=>t[i]);let v=0,imp=0;
  for(let a=1;a<Q;a++)for(let b=0;b<Q;b++){const z=ct.map(t=>mod(a*t[i]+b)),code=z.reduce((n,x)=>n*Q+x,0);if(seen.has(code)||z.every((x,j)=>x===truth[j]))continue;seen.add(code);
   const s=z.reduce((n,x,j)=>n+costs[j][x],0);if(!Number.isFinite(s))continue;v++;if(s>base+1e-8)imp++;if(!best||s>best.score)best={i,a,b,z,old:truth,score:s,delta:s-base};}
  valid+=v;improved+=imp;if(v)sites++;perSite.push({i,valid:v,improved:imp});
 }
 const witness=p.map((t,j)=>t.map((x,i)=>i===best?.i?best.z[j]:x));
 return {base,valid,improved,sites,best,witness,perSite};
}
module.exports={prepare,recover,control,exactFixedTape,oneSiteAlternatives};
if(require.main===module){const model=prepare(JSON.parse(values[1]),values.slice(2),tokenize);const out=control(model,Number(process.argv[2]||0),Number(process.argv[3]||512));out.exactTruth=out.truth.map(t=>exactFixedTape(model,t));out.exactRecovered=out.p?.map(t=>exactFixedTape(model,t));out.oneSite=oneSiteAlternatives(model,out,exactFixedTape);console.log(JSON.stringify(out,null,2))}
