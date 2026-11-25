'use strict';
// Agent48: historically specified prime-difference register, exact all-period-key ordinary lexical anchor gate.
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
function experiment(gp,trans,nat,lex){
 const g=JSON.parse(gp),native=JSON.parse(nat),Q=8,mod=x=>(x%29+29)%29,id=w=>String.fromCharCode(...w),arr=s=>Array.from(s,x=>x.charCodeAt(0)),assert=(v,m)=>{if(!v)throw Error(m)};
 const raw=s=>Array.from(s).filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c)),words=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(raw);
 const groups=words(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(groups.length===2896&&groups.flat().length===12956&&groups.flat().join()===g.pages.slice(0,56).flatMap(p=>p.indices).join(),"source");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956],chapters=[];let at=0,j=0;
 for(let k=1;k<cuts.length;k++){const start=j;while(at<cuts[k])at+=groups[j++].length;assert(at===cuts[k],"chapter boundary");chapters.push(groups.slice(start,j))}
 assert(chapters[0].slice(0,2).flat().length===13&&chapters[8].slice(0,2).flat().length===9,"rubrics");
 const al=new Map(g.translit.map((s,i)=>[s,i])),dict=new Map();
 function add(w){if(w.length)dict.set(id(w),w)}
 function variants(s,visit){const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function dfs(i,a){if(i===w.length){visit(a);return}for(let k=1;k<=3;k++){const t=w.slice(i,i+k);if(t.length!==k)continue;const v=k===3?t==="ING"?al.get("NG"):undefined:al.get(t);if(v!==undefined)dfs(i+k,[...a,v])}}dfs(0,[])}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],add)}
 const prose=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,ws:words(s.source_text)}));
 for(const s of native.sections)for(const w of words(s.source_text))add(w);

 const primes=[];for(let n=2;primes.length<13000;n++){let ok=true;for(let j=0;primes[j]*primes[j]<=n;j++)if(n%primes[j]===0){ok=false;break}if(ok)primes.push(n)}
 const by=Array.from({length:64},()=>[]);for(const w of dict.values())if(w.length<64)by[w.length].push(w);
 function regroup(x,ws){let i=0;return ws.map(w=>{const a=x.slice(i,i+w.length);i+=w.length;return a})}
 function historical(ws,depth){const c=ws.flat(),d=[];let s=27;for(let i=0;i<c.length;i++){const t=mod(c[i]-primes[i+1]);d.push(mod(t-s));s=t}if(depth===2)for(let i=d.length-1;i>0;i--)d[i]=mod(d[i]-d[i-1]);return regroup(d,ws)}
 function inverse(ws,depth){const d=ws.flat();if(depth===2)for(let i=1;i<d.length;i++)d[i]=mod(d[i]+d[i-1]);let s=27;return regroup(d.map((v,i)=>{s=mod(s+v);return mod(s+primes[i+1])}),ws)}
 function encode(ws,k,hold=false){let pos=0;return ws.map(w=>w.map(p=>hold&&p===0?0:mod(p+k[pos++%k.length])))}
 function ordinaryDomains(ws,q){let pos=0;return ws.map((w,index)=>{const set=new Set(),a=Array(q).fill(29);let mask=0;for(let i=0;i<w.length;i++)mask|=1<<((pos+i)%q);
   for(const p of by[w.length]){a.fill(29);let ok=true;for(let i=0;i<w.length;i++){const j=(pos+i)%q,v=mod(w[i]-p[i]);if(a[j]!==29&&a[j]!==v){ok=false;break}a[j]=v}if(ok)set.add(id(a))}
   pos+=w.length;return {index,n:w.length,mask,keys:[...set]}})}
 function project(s,mask){let t="";for(let j=0;mask;mask>>>=1,j++)if(mask&1)t+=s[j];return t}
 function searchOrd(ws,q,budget){
  const dom=ordinaryDomains(ws,q).sort((a,b)=>b.n-a.n||a.keys.length-b.keys.length),full=(1<<q)-1;
  // At least one of B+1 chosen anchor words must be in the dictionary.
  const anchors=dom.slice(0,budget+1),groups=new Map();for(const a of anchors){if(!groups.has(a.mask))groups.set(a.mask,new Set());for(const k of a.keys)groups.get(a.mask).add(k)}
  let total=0,peak=0,minimum=Infinity,remaining=[];
  for(const [mask,keys] of groups){let candidates=[...keys].map(k=>({k,bad:0}));total+=candidates.length;peak=Math.max(peak,candidates.length);
   for(const d of dom){if(!candidates.length)break;const m=mask&d.mask;if(!m&&d.keys.length)continue;const s=new Set(d.keys.map(k=>project(k,m))),next=[];for(const a of candidates){if(!s.has(project(a.k,m)))a.bad++;if(a.bad<=budget)next.push(a);else minimum=Math.min(minimum,a.bad)}candidates=next}
   for(const a of candidates)remaining.push({...a,mask});
  }
  // The anchor upper-bound ignores conflicts in unassigned digits. With B=0,
  // finish all surviving partial keys by extending compatible word domains.
  const solved=new Set();
  function complete(k,mask){if(mask===full){solved.add(k);return}const d=dom.filter(d=>d.mask&~mask).sort((a,b)=>{const bits=x=>x.toString(2).replace(/0/g,"").length;return bits(b.mask&~mask)-bits(a.mask&~mask)||a.keys.length-b.keys.length})[0];if(!d)return;const m=mask&d.mask;for(const v of d.keys){if(project(k,m)!==project(v,m))continue;let a=k.split("");for(let j=0;j<q;j++)if(d.mask&(1<<j))a[j]=v[j];const kk=a.join(""),mm=mask|d.mask;if(dom.every(x=>x.keys.some(y=>project(y,x.mask&mm)===project(kk,x.mask&mm))))complete(kk,mm)}}
  if(budget===0)for(const a of remaining)complete(a.k,a.mask);
  const keyMatches=k=>{let i=0;return ws.filter(w=>dict.has(id(w.map(c=>mod(c-k.charCodeAt(i++%q)))))).length};
  if(budget===0)for(const k of solved)assert(keyMatches(k)===ws.length,"complete false positive");
  return {q,budget,words:ws.length,anchors:anchors.map(a=>({index:a.index,n:a.n,domain:a.keys.length})),anchorCandidates:total,peak,minEliminated:minimum===Infinity?null:minimum,remaining:remaining.length,completeKeys:[...solved].map(arr),excluded:remaining.length===0};
 }
 // Literal-F receiver for a specified key: full phase/word DP with no dictionary
 // requirement, and best lexical score among all legal plaintext paths.
 function fixedHold(ws,k){
   const q=k.length;let states=new Map([[0,0]]),reach=new Set([0]);let offset=0;
   for(const w of ws){for(const c of w){const next=new Set();for(const j of reach){if(c===0)next.add(j);if(mod(c-k[j])!==0)next.add((j+1)%q)}reach=next;if(!reach.size)return {reachable:false,deadOffset:offset};offset++}}
   for(const w of ws){const next=new Map();for(const [j,sc] of states){let d=new Map([[j,[""]]]);for(const c of w){const e=new Map();function add(j,s){if(!e.has(j))e.set(j,[]);e.get(j).push(s)}for(const [t,a] of d)for(const s of a){if(c===0)add(t,s+id([0]));const p=mod(c-k[t]);if(p!==0)add((t+1)%q,s+id([p]))}d=e}for(const [t,a] of d){const score=sc+(a.some(s=>dict.has(s))?1:0);next.set(t,Math.max(next.get(t)??-Infinity,score))}}states=next}
   return {reachable:true,lexicalMax:Math.max(...states.values()),words:ws.length}
 }

 function fragments(w,q){const groups=new Map();for(const p of by[w.length]){const a=[];let ok=true;for(let i=0;i<w.length;i++){if(p[i]===0){if(w[i]!==0){ok=false;break}continue}const k=mod(w[i]-p[i]);if(a.length>=q&&a[a.length%q]!==k){ok=false;break}a.push(k)}if(ok){const n=Math.min(q,a.length);if(!groups.has(n))groups.set(n,new Set());groups.get(n).add(id(a.slice(0,q)))}}return groups}
 function holdRelax(ws,q,budget){
  const domains=ws.map((w,i)=>({i,n:w.length,min:w.length-w.filter(c=>c===0).length,f:fragments(w,q)})).sort((a,b)=>b.min-a.min||b.n-a.n||a.i-b.i);
  const seeds=new Map();for(const d of domains.slice(0,budget+1))for(const [l,s] of d.f){if(!seeds.has(l))seeds.set(l,new Set());for(const k of s)seeds.get(l).add(k)}
  let total=0,remaining=0;const byLength=[],fullKeys=[];
  for(const [l,keys] of seeds){let live=[...keys].map(k=>({k,bad:0}));total+=live.length;const stats={l,initial:live.length,remaining:0};
   for(const d of domains){if(!live.length)break;
    const checks=[];let free=false;
    for(const [m,fs] of d.f){if(!fs.size)continue;if(l+m<=q){free=true;break}
     // Relative target phase r is arbitrary; project its overlapping
     // positions into the anchor's coordinates. Preserve order of indices.
     const projections=new Map();
     for(let r=0;r<q;r++){let aa=[],bb=[];for(let j=0;j<m;j++){const a=(r+j)%q;if(a<l){aa.push(a);bb.push(j)}}const code=bb.join(",");let s=projections.get(code);if(!s){s=new Set();for(const f of fs){let p="";for(const j of bb)p+=f[j];s.add(p)}projections.set(code,s)}checks.push({aa,s})}
    }
    if(free)continue;
    const next=[];for(const a of live){let ok=false;for(const {aa,s} of checks){let p="";for(const j of aa)p+=a.k[j];if(s.has(p)){ok=true;break}}if(!ok)a.bad++;if(a.bad<=budget)next.push(a)}live=next;
   }
   stats.remaining=live.length;remaining+=live.length;byLength.push(stats);if(l===q)for(const a of live)fullKeys.push(arr(a.k));
  }
  return {q,budget,words:ws.length,total,remaining,excluded:remaining===0,byLength,fullKeys};
 }
 const controls=[];for(const [z,name] of ["0_welcome","0_koan_1","0_loss_of_divinity"].entries()){const p=prose.find(s=>s.name===name).ws;for(const q of [8,13]){const k=Array.from({length:q},(_,i)=>(13*z+7*i*i+11*i+3)%29),depth=z%2+1,c=inverse(encode(p,k),depth),d=historical(c,depth),r=searchOrd(d,q,0);assert(r.completeKeys.some(a=>a.join()===k.join()),"hidden key lost");assert(inverse(d,depth).flat().join()===c.flat().join(),"inverse");controls.push({name,depth,q,hidden:k,keys:r.completeKeys.length,runes:p.flat().length})}}
 const rows=[];const keys=[[23,10,1,10,9,10,16,26],[5,10,4,5,27,19,8,18,4,18,9,5,18]]; 
 // q13 native keyword from literal GP29 labels instead of hardcoded guessed indices.
 const k13=Array.from("FIRFUMFERENFE").map(c=>al.get(c));assert(k13.length===13&&k13.every(x=>x!==undefined),"q13");keys[1]=k13;
 for(const ch of [0,7])for(const depth of [1,2]){const c=chapters[ch],d=historical(c,depth);assert(inverse(d,depth).flat().join()===c.flat().join(),"original roundtrip");const budget=Math.floor(d.length*.05);for(const q of [8,13]){const o=searchOrd(d,q,budget),k=keys[q===8?0:1];let j=0;const p=d.map(w=>w.map(x=>mod(x-k[j++%q])));rows.push({chapter:ch,depth,ordinary:o,knownKey:k,knownOrdinaryMatches:p.filter(w=>dict.has(id(w))).length,knownHold:fixedHold(d,k)})}}
 const relaxed=[];const controlHold=[];for(const q of [8,13]){const p=prose.find(s=>s.name==="0_koan_1").ws,k=Array.from({length:q},(_,i)=>(13+7*i*i+11*i+3)%29),c=inverse(encode(p,k,true),1),d=historical(c,1),r=holdRelax(d,q,0);assert(!r.excluded,"F-hold plant rejected");if(q===8){const shifts=Array.from({length:q},(_,j)=>k.slice(j).concat(k.slice(0,j)).join());assert(r.fullKeys.some(a=>shifts.includes(a.join())),"F-hold full key lost")}controlHold.push({q,total:r.total,remaining:r.remaining,fullKeys:r.fullKeys.length,byLength:r.byLength})}
 for(const ch of [0,7])for(const depth of [1,2])for(const q of [8,13]){const d=historical(chapters[ch],depth),r=holdRelax(d,q,Math.floor(d.length*.05));relaxed.push({ch,depth,...r,fullKeys:r.fullKeys.slice(0,10),fullKeyCount:r.fullKeys.length})}
 return {vocabulary:dict.size,controls,rows,controlHold,relaxed};

}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify(experiment(...data),null,2));
