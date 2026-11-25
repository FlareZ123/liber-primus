"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
function sharedPrefixGate(raw,k=6,q=76){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));assert(q,"donor spelling");o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const v=id(word(m[1],alt));if(v.length<=24)types.add(v);}}
 assert(types.size===35944,"dictionary");
 const bylen=Array.from({length:25},()=>[]);for(const t of types)bylen[t.length].push(t);
 const project=new Map;function proj(n,L){const z=n*32+L;if(!project.has(z))project.set(z,[...new Set(bylen[n].map(x=>x.slice(0,L)))].map(nums));return project.get(z)}
 let gs=[],w=[],sep="";for(const c of raw[6]){if(ix.has(c)){if(w.length&&/[-.&]/u.test(sep)){gs.push(w);w=[]}w.push(ix.get(c));sep=""}else sep+=c}if(w.length)gs.push(w);
 const target=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(gs.flat().slice(0,target.length).join()===target.join(),"tape");
 let n=0,orig=[];for(const w of gs){if(n>=target.length)break;orig.push(w);n+=w.length}assert(n===12956&&orig.length===2896,"counts");
 function cands(C,naive=false){
  const out=new Set,seen=new Set;
  for(const D of [C,...C.map((_,i)=>C.slice(0,i).concat(C.slice(i+1)))]){if(D.length>24||D.length<k)continue;let z=0,L=0;while(L<D.length&&z<k){if(D[L++]!==0)z++}if(z<k)continue;
   const tag=D.length+":"+id(D.slice(0,L));if(!naive&&seen.has(tag))continue;seen.add(tag);
   const pp=naive?bylen[D.length].map(nums):proj(D.length,L);
   if(L===k&&!naive){for(const P of pp){let u=0;for(let j=0;j<k;j++)u=u*29+mod(D[j]-P[j]);out.add(u)}}
   else for(const P of pp){function visit(j,h,u){if(h===k){out.add(u);return}if(j>=L)return;if(D[j]===0&&P[j]===0)visit(j+1,h,u);visit(j+1,h+1,u*29+mod(D[j]-P[j]))}visit(0,0,0)}
  }return out;
 }
 // A maximal run of selected distinct high-support windows is a simple
 // path in the overlap graph. DAG paths are exact; cyclic weak components
 // are relaxed to their full vertex count, which cannot underestimate.
 function graph(H,weights){
  const N=H.length;if(!N)return {maxPath:0,multi3:0,extra4:0,edges:0,cyclicComponentVertices:0};
  const index=new Map(H.map((v,i)=>[v,i])),pow=29**(k-1),parent=Int32Array.from(H,(_,i)=>i),sz=new Uint32Array(N).fill(1);
  const head=new Int32Array(N).fill(-1),to=[],next=[],indeg=new Uint8Array(N);
  function root(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i}
  function join(i,j){i=root(i);j=root(j);if(i===j)return;if(sz[i]<sz[j])[i,j]=[j,i];parent[j]=i;sz[i]+=sz[j]}
  for(let i=0;i<N;i++){let z=(H[i]%pow)*29;for(let d=0;d<29;d++){const j=index.get(z+d);if(j===undefined||j===i)continue;next.push(head[i]);to.push(j);head[i]=to.length-1;indeg[j]++;join(i,j)}}
  const dp=new Uint32Array(N).fill(1),queue=new Uint32Array(N);let a=0,b=0,maxPath=1;
  for(let i=0;i<N;i++)if(!indeg[i])queue[b++]=i;
  while(a<b){const i=queue[a++];maxPath=Math.max(maxPath,dp[i]);for(let e=head[i];e!==-1;e=next[e]){const j=to[e];dp[j]=Math.max(dp[j],dp[i]+1);if(--indeg[j]===0)queue[b++]=j}}
  let cyc=new Set;for(let i=0;i<N;i++)if(indeg[i])cyc.add(root(i));let cyclicComponentVertices=0;for(const z of cyc){maxPath=Math.max(maxPath,sz[z]);cyclicComponentVertices+=sz[z]}
  let multi3=0,extra4=0;const h3=new Map;
  for(let i=0;i<N;i++)if(weights[i]>=3){const z=root(i);h3.set(z,(h3.get(z)||0)+1);extra4+=Math.max(0,weights[i]-3)}
  for(const x of h3.values())multi3+=x-1;
  return {maxPath,multi3,extra4,edges:to.length,cyclicComponentVertices};
 }
 function gate(rows,budget,truth){
  const eligible=rows.filter(w=>w.filter(v=>v!==0).length>=k+1);
  let arr=k<=6?new Uint32Array(1<<20):new Float64Array(1<<20),used=0,confirmed=0;
  for(let i=0;i<eligible.length;i++){const C=eligible[i],S=cands(C);if(truth){const val=truth.get(C);if(val!==undefined){assert(S.has(val),"planted true tuple lost");confirmed++}}
   if(used+S.size>arr.length){let cap=arr.length;while(cap<used+S.size)cap=Math.ceil(cap*1.6);const b=new arr.constructor(cap);b.set(arr);arr=b}
   for(const v of S)arr[used++]=v;
  }
  const v=arr.subarray(0,used);v.sort();let histogram=[],heavy=[],distinct=0;
  for(let i=0;i<used;){let j=i+1;while(j<used&&v[j]===v[i])j++;const s=j-i;histogram[s]=(histogram[s]||0)+1;distinct++;if(s>=2)heavy.push([v[i],s]);i=j}
  const old=[],bounds=[];for(let p=1;p<=256;p++){old.push(Math.min(p,distinct));bounds.push(Math.min(p,distinct))}
  const edgeReport=[];let G2;
  for(let t=2;t<histogram.length;t++){
   const rows=heavy.filter(x=>x[1]>=t),H=rows.map(x=>x[0]),edges=[],G=graph(H,rows.map(x=>x[1]));if(t===2)G2=G;
   for(let d=1;d<k;d++){
    const pow=29**(k-d),div=29**d,pre=new Map,suf=new Map;
    for(const v of H){const p=Math.floor(v/div),s=v%pow;pre.set(p,(pre.get(p)||0)+1);suf.set(s,(suf.get(s)||0)+1)}
    let outgoing=0,incoming=0;for(const v of H){const p=Math.floor(v/div),s=v%pow,own=p===s?1:0;if((pre.get(s)||0)>own)outgoing++;if((suf.get(p)||0)>own)incoming++}edges.push([d,Math.min(outgoing,incoming)]);
   }
   for(let p=1;p<=256;p++){
    let h=Math.min(p,H.length);for(const [d,e] of edges)if(d%p!==0)h=Math.min(h,Math.floor((p+e)/2));old[p-1]+=h;
    if(p>G.maxPath&&G.maxPath>0)h=Math.min(h,Math.floor(p*G.maxPath/(G.maxPath+1)));
    for(let L=1;L<k&&L<p;L++){let correction=0;for(let d=1;d<=L;d++)correction+=(L+1-d)*edges[d-1][1];h=Math.min(h,Math.floor((p+correction)/(L+1)))}
    bounds[p-1]+=h;
   }
   edgeReport.push({t,tuples:H.length,edges,graph:G});
  }
  if(G2)for(let p=G2.maxPath+1;p<=256;p++)bounds[p-1]=Math.min(bounds[p-1],2*p+G2.multi3+G2.extra4);
  const required=Math.max(0,eligible.length-budget);let plain=0,left=q;for(let t=histogram.length-1;t>=1&&left>0;t--){const c=Math.min(left,histogram[t]||0);plain+=t*c;left-=c}
  function minP(b){let i=b.findIndex(x=>x>=required);return i<0?">256":i+1}
  return {groups:rows.length,eligible:eligible.length,budget,required,candidatePairs:used,distinct,histogram,edgeReport,period:q,unconstrainedSupport:plain,overlapSupport:old[q-1],gapGraphSupport:bounds[q-1],minPeriodOld:minP(old),minPeriod:minP(bounds),selected:[29,39,58,76,90,128,138,150,170,180,188,256].map(p=>[p,old[p-1],bounds[p-1]]),confirmed};
 }
 const examples=orig.filter(w=>w.filter(v=>v!==0).length>=k+1),check=[...examples.filter(w=>w.slice(0,k).includes(0)).slice(0,3),...examples.filter(w=>!w.includes(0)).slice(0,3)];
 for(const C of check){const a=cands(C),b=cands(C,true);assert(a.size===b.size&&[...a].every(x=>b.has(x)),"projection mismatch")}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 const controls=[];for(let d=0;d<3;d++){const R=rng(0x12d761+d),pool=donors[d].slice(Math.floor(donors[d].length*.8)).filter(w=>types.has(id(w))&&w.length>=k+1&&w.length<=15);assert(pool.length,"pool");const key=Array.from({length:q},()=>R()%29),rows=[],truth=new Map;for(let i=0;i<70;i++){const P=pool[R()%pool.length];let p=R()%q,start=p;const C=P.map(x=>{if(!x&&(R()%2))return 0;const y=mod(x+key[p]);p=(p+1)%q;return y});if(R()%100<45)C.splice(R()%(C.length+1),0,R()%29);let z=0;for(let j=0;j<k;j++)z=z*29+key[(start+j)%q];truth.set(C,z);rows.push(C)}const c=gate(rows,0,truth);assert(c.gapGraphSupport>=c.required&&c.confirmed===c.eligible,"control bound");controls.push(c)}
 const original=gate(orig,Math.floor(orig.length*.05));
 return {k,q,allowConsumingF:true,projectionChecks:check.length,controls,original};
}
if(require.main===module)console.log(JSON.stringify(sharedPrefixGate(paths.map(p=>fs.readFileSync(p,"utf8")),6,76),null,2));
module.exports={sharedPrefixGate};
