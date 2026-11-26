'use strict';
function experiment(){
 const assert=(x,m)=>{if(!x)throw Error(m)}, bit=x=>1<<x, low=x=>31-Math.clz32(x&-x), pop=x=>{let n=0;while(x){x&=x-1;n++}return n}, each=x=>{const a=[];while(x){let q=low(x);a.push(q);x&=x-1}return a}, mod=(x,n)=>(x%n+n)%n;
 const LIMIT=250000, TABLE_CAP=4096, CAP_SIGNAL=Symbol("budget");
 class Work{constructor(limit){this.limit=limit;this.ops=0;this.nodes=0}add(n=1){this.ops+=n;if(this.ops>this.limit)throw CAP_SIGNAL}}
 function tape(c,n){return {c,d:c.map((x,i)=>i?mod(x-c[i-1],n):0)}}
 function legal(frames,key){const n=key.length;for(const t of frames){let s=1;for(let i=1;i<t.c.length;i++){let a=t.c[i]===0?s:0;for(const q of each(s)){let p=mod(t.d[i]+key[q],n);if(p)a|=bit(p)}s=a;if(!s)return false}}return true}
 function encode(p,k,iv){const c=[iv];let q=0;for(const x of p){if(!x)c.push(0);else{c.push(mod(c.at(-1)+x-k[q],k.length));q=x}}return c}
 function hall(dom,n,work){const match=Array(n).fill(-1);function rec(q,seen){for(const k of each(dom[q])){work.add();if(seen[k])continue;seen[k]=true;if(match[k]<0||rec(match[k],seen)){match[k]=q;return true}}return false}for(const q of Array.from({length:n},(_,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b])))if(!rec(q,Array(n).fill(false)))return false;return true}
 // Semantic port of Agent2's exact suspended-frontier search, using the
 // same branch ordering, domain restriction and backward relaxation at depth 2.
 function frontier(frames,n,limit){
  const work=new Work(limit),all=(1<<n)-1,key=Array(n).fill(-1);let used=0,witness=null;
  function expand(t,old,changed){if(old.done)return old;const pending=[],blocked=[],seen=new Set();let done=false;
   const push=(i,q)=>{if(i===t.c.length){done=true;return}const a=i*n+q;if(!seen.has(a)){seen.add(a);pending.push([i,q])}};
   for(const [i,q] of old.blocked){work.add();if(changed<0||q===changed)push(i,q);else{seen.add(i*n+q);blocked.push([i,q])}}
   while(pending.length&&!done){work.add();const [i,q]=pending.pop();const k=key[q];if(k<0)blocked.push([i,q]);else{const p=mod(t.d[i]+k,n);if(p)push(i+1,p)}if(t.c[i]===0)push(i+1,q)}
   return {done,blocked:done?[]:blocked};
  }
  function dfs(fs,depth){work.nodes++;work.add();let free=all&~used,dom=key.map(k=>k<0?free:bit(k)),affected=Array(n).fill(0),mandatory=Array(n).fill(0),blocked=Array(n).fill(0);let done=true;
   for(let j=0;j<fs.length;j++){work.add();const f=fs[j];if(f.done)continue;done=false;if(!f.blocked.length)return false;let rows=new Set();for(const [i,q] of f.blocked){work.add();rows.add(q);blocked[q]++}for(const q of rows)affected[q]++;if(rows.size===1){let q=rows.values().next().value;mandatory[q]++;let d=frames[j].d[f.blocked[0][0]];if(f.blocked.every(([i])=>frames[j].d[i]===d))dom[q]&=~bit(mod(-d,n))}}
   if(done){witness=[...key];let rest=free;for(let q=0;q<n;q++)if(witness[q]<0){let k=low(rest);witness[q]=k;rest&=rest-1}return true}
   if(dom.some(x=>!x))return false;
   if(depth>=2){for(let j=0;j<fs.length;j++){const f=fs[j],t=frames[j];if(f.done)continue;let left=Math.min(...f.blocked.map(x=>x[0])),reach=all;const shifts=[];for(let i=t.c.length-1;i>=left;i--){let a=0;for(const p of each(reach&~1)){work.add();a|=bit(mod(p-t.d[i],n))}shifts[i]=a;let prev=t.c[i]===0?reach:0;for(let q=0;q<n;q++){work.add();if(dom[q]&a)prev|=bit(q)}reach=prev}let rowmask=0,support=Array(n).fill(0);for(const [i,q] of f.blocked){work.add();let a=shifts[i]&dom[q];if(a){rowmask|=bit(q);support[q]|=a}}if(!rowmask)return false;if(pop(rowmask)===1){let q=low(rowmask);dom[q]&=support[q];if(!dom[q])return false}}}
   if(!hall(dom,n,work))return false;let q=-1;
   for(let i=0;i<n;i++)if(key[i]<0&&affected[i]&&(q<0||pop(dom[i])<pop(dom[q])||(pop(dom[i])===pop(dom[q])&&(mandatory[i]>mandatory[q]||mandatory[i]===mandatory[q]&&(affected[i]>affected[q]||affected[i]===affected[q]&&blocked[i]>blocked[q])))))q=i;
   assert(q>=0,"frontier branch");
   for(const k of each(dom[q])){work.add();key[q]=k;used|=bit(k);const next=fs.map((f,i)=>f.done||!f.blocked.some(x=>x[1]===q)?f:expand(frames[i],f,q));let ok=next.every(f=>f.done||f.blocked.length);if(ok&&dfs(next,depth+1))return true;key[q]=-1;used&=~bit(k)}
   return false;
  }
  let status;try{let fs=frames.map(t=>expand(t,{done:false,blocked:[[1,0]]},-1));status=dfs(fs,0)?"sat":"unsat"}catch(e){if(e!==CAP_SIGNAL)throw e;status="unknown"}if(witness)assert(legal(frames,witness),"bad baseline witness");return {status,ops:work.ops,nodes:work.nodes,witness};
 }
 // Explicit sparse tuple relations for zero-free intervals; each tuple is
 // (entry, exit, partial injective permutation) and obeys every repeated row.
 // F-boundaries are joined exactly in q-space; across intervals unknown key
 // completions are relaxed, then intersected by GAC for each key assignment.
 function intervalJoin(frames,n,limit,initial=null){
  const work=new Work(limit),all=(1<<n)-1,key=Array(n).fill(-1),tables=new Map(),clauses=[];
  let used=0,witness=null,entries=0,fallbacks=0,compiled=0,reused=0,clauseHits=0,learned=0,pruned=0;
  if(initial!==null){key[0]=initial;used=bit(initial)}
  function compile(ds,startMask){const id=startMask+":"+ds.join(",");if(tables.has(id)){reused++;return tables.get(id)}let tuples=[],local=0,aborted=false;const k=Array(n).fill(-1),pairs=[];
   function walk(i,q,from,u){if(aborted)return;if(i===ds.length){tuples.push({from,to:q,pairs:pairs.slice(),used:u});return}
    if(k[q]>=0){work.add();if(++local>TABLE_CAP){aborted=true;return}const p=mod(ds[i]+k[q],n);if(p)walk(i+1,p,from,u);return}
    for(const x of each(all&~u)){work.add();if(++local>TABLE_CAP){aborted=true;return}const p=mod(ds[i]+x,n);if(!p)continue;k[q]=x;pairs.push([q,x]);walk(i+1,p,from,u|bit(x));pairs.pop();k[q]=-1;if(aborted)return}
   }
   // Avoid paying a large failed compilation for obviously long high-alphabet
   // intervals. Such intervals use a sound independent-row relaxation.
   if(n>8&&ds.length>2)aborted=true;
   if(!aborted)for(const q of each(startMask)){walk(0,q,q,0);if(aborted)break}
   const obj=aborted?null:tuples;tables.set(id,obj);if(aborted)fallbacks++;else{compiled++;entries+=tuples.length}return obj;
  }
  function segments(t){const out=[];for(let i=1;i<t.c.length;){if(t.c[i]===0){out.push({zero:true,ds:[t.d[i]],table:null});i++;continue}let j=i+1;while(j<t.c.length&&t.c[j]!==0)j++;const ds=t.d.slice(i,j),startMask=out.length?all:1;out.push({zero:false,ds,table:compile(ds,startMask)});i=j}return out}
  function rotate(x,d){return d?((x<<d)|(x>>>(n-d)))&all:x}
  function relation(seg,dom){let adj=Array(n).fill(0),tuples=null;if(seg.table!==null){tuples=[];for(const e of seg.table){work.add();let ok=true;for(const [q,k] of e.pairs){work.add();if(!(dom[q]&bit(k))){ok=false;break}}if(ok){adj[e.from]|=bit(e.to);tuples.push(e)}}}else{
    for(let from=0;from<n;from++){let reach=bit(from);for(const d of seg.ds){let next=seg.zero?reach:0;for(const q of each(reach)){work.add();next|=rotate(dom[q],d)&~1}reach=next;if(!reach)break}adj[from]=reach}
   }return {adj,tuples};
  }
  function pagePass(segs,dom,cut){const rel=[],forward=[1];for(const seg of segs){const a=relation(seg,dom);rel.push(a);let x=0;for(const q of each(forward.at(-1))){work.add();x|=a.adj[q]}if(!x)return false;forward.push(x)}
   if(!cut)return true;let back=all;
   for(let i=rel.length-1;i>=0;i--){const a=rel[i];if(a.tuples!==null){const support=Array(n).fill(0);for(const e of a.tuples){work.add();if(!(forward[i]&bit(e.from))||!(back&bit(e.to)))continue;const fixed=new Map(e.pairs);for(let q=0;q<n;q++){work.add();support[q]|=fixed.has(q)?bit(fixed.get(q)):all&~e.used}}for(let q=0;q<n;q++){work.add();let next=dom[q]&support[q];if(!next)return false;if(next!==dom[q]){pruned+=pop(dom[q])-pop(next);dom[q]=next}}}
    let prev=0;for(let q=0;q<n;q++){work.add();if(a.adj[q]&back)prev|=bit(q)}back=prev;
   }return true;
  }
  function makeDom(k){let u=0;for(const v of k)if(v>=0)u|=bit(v);return k.map(v=>v<0?all&~u:bit(v))}
  function clausePass(dom){for(const c of clauses){let unit=null,unknown=0,satisfied=false;for(const [q,k] of c){work.add();if(!(dom[q]&bit(k))){satisfied=true;break}if(dom[q]!==bit(k)){unit=[q,k];unknown++;if(unknown>1)break}}if(satisfied||unknown>1)continue;if(!unknown){clauseHits++;return false}let [q,k]=unit;dom[q]&=~bit(k);clauseHits++;if(!dom[q])return false}return true}
  let segs;
  function propagate(k,learn=true,cut=true){const dom=makeDom(k);for(let round=0;round<n;round++){const before=dom.reduce((a,b)=>a+pop(b),0);if(learn&&!clausePass(dom))return null;if(!hall(dom,n,work))return null;for(const page of segs)if(!pagePass(page,dom,cut))return null;if(dom.reduce((a,b)=>a+pop(b),0)===before||!cut)break}return dom}
  function recordConflict(){let k=[...key];let assigned=k.map((v,i)=>v>=0?i:-1).filter(q=>q>=0);if(!assigned.length)return;
   // Minimize at most three candidate rows. Every retained conflict is an
   // actual failed necessary interval-chain relaxation, not a sampled key.
   for(const q of assigned.slice().reverse().slice(0,3)){const v=k[q];k[q]=-1;if(propagate(k,false,true)!==null)k[q]=v}
   let c=k.map((v,q)=>[q,v]).filter(x=>x[1]>=0);if(c.length){clauses.push(c);learned++}
  }
  function dfs(depth){work.nodes++;work.add();const dom=propagate(key);if(dom===null){recordConflict();return false}
   if(key.every(k=>k>=0)){assert(legal(frames,key),"interval join accepted illegal complete key");witness=[...key];return true}
   let q=-1;for(let i=0;i<n;i++)if(key[i]<0&&(q<0||pop(dom[i])<pop(dom[q])))q=i;
   for(const k of each(dom[q])){work.add();key[q]=k;used|=bit(k);if(dfs(depth+1))return true;used&=~bit(k);key[q]=-1}
   return false;
  }
  let status;try{segs=frames.map(segments);status=dfs(initial===null?0:1)?"sat":"unsat"}catch(e){if(e!==CAP_SIGNAL)throw e;status="unknown"}if(witness)assert(legal(frames,witness),"bad interval witness");
  return {status,ops:work.ops,nodes:work.nodes,witness,compiled,entries,fallbacks,reused,learned,clauseHits,pruned};
 }
 function truth(frames,n){let k=Array(n).fill(-1),out=false;function rec(i,used){if(i===n){out=legal(frames,k);return out}for(let x=0;x<n;x++)if(!(used&bit(x))){k[i]=x;if(rec(i+1,used|bit(x)))return true}return false}rec(0,0);return out?"sat":"unsat"}
 let seed=3055;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 let rows=[];for(let n=3;n<=8;n++)for(let trial=0;trial<8;trial++){const planted=trial<4,key=shuffle(Array.from({length:n},(_,i)=>i));const frames=Array.from({length:3},()=>{const len=12+rand(13),p=Array.from({length:len},()=>rand(n));return tape(planted?encode(p,key,rand(n)):Array.from({length:len+1},()=>rand(n)),n)});const t=truth(frames,n),a=frontier(frames,n,LIMIT),b=intervalJoin(frames,n,LIMIT);assert(a.status==="unknown"||a.status===t,"baseline error");assert(b.status==="unknown"||b.status===t,"interval error");rows.push({n,trial,planted,truth:t,a,b})}
 const solved=k=>rows.filter(x=>x[k].status!=="unknown").length, common=rows.filter(x=>x.a.status!=="unknown"&&x.b.status!=="unknown");
 const summary={instances:rows.length,truthSat:rows.filter(x=>x.truth==="sat").length,frontierSolved:solved("a"),intervalSolved:solved("b"),common:common.length,commonOpsFrontier:common.reduce((a,x)=>a+x.a.ops,0),commonOpsInterval:common.reduce((a,x)=>a+x.b.ops,0),totalTables:rows.reduce((a,x)=>a+x.b.compiled,0),totalTuples:rows.reduce((a,x)=>a+x.b.entries,0),fallbacks:rows.reduce((a,x)=>a+x.b.fallbacks,0),learned:rows.reduce((a,x)=>a+x.b.learned,0),clauseHits:rows.reduce((a,x)=>a+x.b.clauseHits,0)};
 summary.gate=summary.intervalSolved>summary.frontierSolved||(summary.intervalSolved===summary.frontierSolved&&summary.commonOpsInterval<.8*summary.commonOpsFrontier);
 return {summary,rows,intervalJoin,tape};
}
const out=experiment();console.log(JSON.stringify({summary:out.summary,rows:out.rows},null,2));
