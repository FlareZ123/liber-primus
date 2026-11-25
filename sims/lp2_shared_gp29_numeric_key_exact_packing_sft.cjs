'use strict';
// Agent2: corrected terminal numeric DIVINITY action, exact weighted union/packing.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function experiment(gp,t,n,l){
 const g=JSON.parse(gp),nat=JSON.parse(n),key=[23,10,1,10,9,10,16,26],M=x=>(x%29+29)%29,mask29=0x1fffffff;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const parse=x=>(x.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(c=>g.runes.indexOf(c)));
 const all=parse(t),groups=all.slice(2830,2896);
 assert(all.length===2941&&groups.length===66&&groups.flat().length===308,"group selection");
 assert(groups.flat().join()===g.pages.slice(54,56).flatMap(p=>p.indices).join(),"physical mismatch");
 assert(groups.slice(0,49).flat().length===222&&groups[49].length===11&&groups[56].length===13,"anchor locations");
 const al=new Map(g.translit.map((v,i)=>[v,i]));const dict=new Map();const add=(w,f)=>{let k=String.fromCharCode(...w);if(!dict.has(k)||dict.get(k).f<f)dict.set(k,{w,f})};
 for(const ln of l.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(ln);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w,+m[2]);return}for(const k of [1,2,3]){const sub=s.slice(i,i+k),v=k===3?(sub==="ING"?al.get("NG"):undefined):al.get(sub);if(sub.length===k&&v!==undefined)walk(i+k,[...w,v])}}walk(0,[])}
 const native=nat.sections.flatMap(s=>parse(s.source_text));for(const w of native)add(w,1);
 const by=Array.from({length:40},()=>[]);for(const v of dict.values())by[v.w.length].push(v);
 const rot=(mask,d)=>d?((mask<<d)|(mask>>>(29-d)))&mask29:mask;
 const init=()=>({p:Uint8Array.from({length:29},(_,i)=>i),v:new Uint8Array(29),sz:new Uint8Array(29).fill(1),m:new Int32Array(29).fill(1),rank:0});
 const clone=s=>({p:s.p.slice(),v:s.v.slice(),sz:s.sz.slice(),m:s.m.slice(),rank:s.rank});
 function root(s,i){let v=0;while(s.p[i]!==i){v+=s.v[i];i=s.p[i]}return [i,v%29]}
 // pi(c)-pi(p)=k. A component mask records all occupied relative coordinates.
 function edge(s,c,p,k){let [a,x]=root(s,c),[b,y]=root(s,p),d=M(x-y-k);if(a===b)return d===0;if(s.sz[a]<s.sz[b]){[a,b]=[b,a];d=M(-d)}const q=rot(s.m[b],d);if(s.m[a]&q)return false;s.p[b]=a;s.v[b]=d;s.sz[a]+=s.sz[b];s.m[a]|=q;s.rank++;return true}
 function opts(c){const out=[];for(const {w,f} of by[c.length])for(let start=0;start<8;start++){let j=start,s=init(),e=[],ok=true;for(let i=0;i<c.length;i++){if(w[i]===0){if(c[i]!==0){ok=false;break}continue}const k=key[j];if(!edge(s,c[i],w[i],k)){ok=false;break}e.push([c[i],w[i],k]);j=(j+1)%8}if(ok)out.push({s,e,w,start,f})}return out}
 // Enumerate all translations of disconnected components into disjoint residues.
 function enumPi(s,visit,limit=Infinity){const [fr,fv]=root(s,0),u=rot(s.m[fr],M(-fv));const cs=[];for(let i=0;i<29;i++)if(i!==fr&&s.p[i]===i)cs.push(i);cs.sort((a,b)=>s.sz[b]-s.sz[a]);const shifts=new Int8Array(29).fill(-1);shifts[fr]=M(-fv);let count=0;
 function dfs(i,used){if(i===cs.length){const pi=Array.from({length:29},(_,j)=>{const [a,v]=root(s,j);return M(v+shifts[a])});assert(pi[0]===0&&new Set(pi).size===29,"non-permutation");count++;visit(pi);return count>=limit}const c=cs[i];for(let d=0;d<29;d++){const v=rot(s.m[c],d);if(!(used&v)){shifts[c]=d;if(dfs(i+1,used|v))return true}}shifts[c]=-1;return false}
 dfs(0,u);return count}
 function pair(c1,c2){const A=opts(c1),B=opts(c2);let consistent=0;const pairs=[];for(const a of A)for(const b of B){const s=clone(a.s);let ok=true;for(const [c,p,k] of b.e)if(!edge(s,c,p,k)){ok=false;break}if(!ok)continue;consistent++;if(!enumPi(s,()=>{},1))continue;pairs.push({s,a,b})}
 return {domains:[A.length,B.length],consistent,pairs}}
 const show=w=>w.map(i=>g.translit[i]).join("");
 function encode(w,pi,start){const inv=[];pi.forEach((v,i)=>inv[v]=i);let j=start;return w.map(p=>{if(!p)return 0;const c=inv[M(pi[p]+key[j])];j=(j+1)%8;return c})}
 function decode(c,pi){const inv=[];pi.forEach((v,i)=>inv[v]=i);const words=new Map();for(let phase=0;phase<8;phase++){const walk=(i,j,w)=>{if(i===c.length){const k=String.fromCharCode(...w);const e=dict.get(k);if(e)words.set(k,{w,start:phase,f:e.f});return}if(c[i]===0)walk(i+1,j,[...w,0]);const p=inv[M(pi[c[i]]-key[j])];if(p!==0)walk(i+1,(j+1)%8,[...w,p])};walk(0,phase,[])}return [...words.values()]}
 function rng(seed){let s=seed;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0}}
 function plant(seed){const rand=rng(seed),inv=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rand()%i;[inv[i],inv[j]]=[inv[j],inv[i]]}const pi=[];inv.forEach((v,i)=>pi[v]=i);const truth=groups.map(c=>{const pool=native.filter(w=>w.length===c.length);assert(pool.length,"native length");return {w:pool[rand()%pool.length],start:rand()%8}});const C=truth.map(({w,start})=>encode(w,pi,start));return {C,truth,pi}}
 function test(C,truth,piTruth){const {domains,consistent,pairs}=pair(C[56],C[49]);let completions=0,cap=500000,scored=0,best=-1,truePiRetained=false,full=0;const winners=new Map(),info=[],allOriginal=[];const train=Array.from({length:17},(_,i)=>i+49).filter(i=>i!==49&&i!==56).sort((a,b)=>C[b].length-C[a].length);
 for(const {s,a,b} of pairs){let count=enumPi(s,pi=>{completions++;if(piTruth&&pi.join()===piTruth.join())truePiRetained=true;let n=0;for(let j=0;j<train.length;j++){if(decode(C[train[j]],pi).length)n++;if(n+train.length-j-1<best&&truth)return}scored++;if(n===train.length)full++;if(n>best){best=n;winners.clear()}if(n===best)winners.set(pi.join(),pi);if(!truth)allOriginal.push({pi,trainSupported:n,allSupported:C.filter(c=>decode(c,pi).length).length})},cap-completions);info.push({anchors:[show(a.w),show(b.w)],starts:[a.start,b.start],rank:s.rank,components:Array.from({length:29},(_,i)=>i).filter(i=>s.p[i]===i).map(i=>s.sz[i]).sort((x,y)=>y-x),count});if(completions>=cap)break}
 const fits=[...winners.values()].map(pi=>{const fit=C.map(c=>decode(c,pi));const hold=fit.slice(0,49);let replay=0;for(let i=0;i<fit.length;i++)for(const w of fit[i]){assert(encode(w.w,pi,w.start).join()===C[i].join(),"replay");replay+=w.w.length}return {pi,exactPi:truth?pi.join()===piTruth.join():null,holdoutSupported:hold.filter(x=>x.length).length,holdoutTruth:truth?hold.filter((x,i)=>x.some(v=>v.w.join()===truth[i].w.join())).length:null,holdoutUniqueTruth:truth?hold.filter((x,i)=>x.length===1&&x[0].w.join()===truth[i].w.join()).length:null,allSupported:fit.filter(x=>x.length).length,replayRunesAcrossCandidateWords:replay,words:truth?null:fit.map((x,i)=>({i,words:x.map(v=>show(v.w)),n:x.length})).filter(x=>x.n)}})
 return {domains,consistent,pairs:pairs.length,info,completions,capped:completions>=cap,scored,best,bestDistinctPi:winners.size,full,truePiRetained,fits,allOriginal}
 }
 const p=plant(20161125),q=plant(3301);const controls=[test(p.C,p.truth,p.pi),test(q.C,q.truth,q.pi)];assert(controls.every(x=>!x.capped&&x.fits.some(y=>y.exactPi&&y.holdoutTruth===49)),"blind recovery control");const original=test(groups);return {dict:dict.size,anchors:[56,49],key,trainingGroups:[49,65],holdoutGroups:[0,48],controls,original}
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const got=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(got!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify(experiment(...data),null,2));
