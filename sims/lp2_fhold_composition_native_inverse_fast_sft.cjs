'use strict';
// Baseline semantic frontier adapted from lp2_fhold_zero_free_interval_join_sft.cjs (#3055).
function experiment(raw){
 const assert=(x,m)=>{if(!x)throw Error(m)}, bit=x=>1<<x, low=x=>31-Math.clz32(x&-x), pop=x=>{let n=0;while(x){x&=x-1;n++}return n}, each=x=>{const a=[];while(x){let q=low(x);a.push(q);x&=x-1}return a}, mod=(x,n)=>(x%n+n)%n;
 const LIMIT=250000, TABLE_CAP=4096, CAP_SIGNAL=Symbol("budget");
 class Work{constructor(limit){this.limit=limit;this.ops=0;this.nodes=0}add(n=1){this.ops+=n;if(this.ops>this.limit)throw CAP_SIGNAL}}
 function tape(c,n){return {c,d:c.map((x,i)=>i?mod(x-c[i-1],n):0)}}
 function legal(frames,key){const n=key.length;for(const t of frames){let s=1;for(let i=1;i<t.c.length;i++){let a=t.c[i]===0?s:0;for(const q of each(s)){let p=mod(t.d[i]+key[q],n);if(p)a|=bit(p)}s=a;if(!s)return false}}return true}
 function encode(p,k,iv){const c=[iv];let q=0;for(const x of p){if(!x)c.push(0);else{c.push(mod(c.at(-1)+x-k[q],k.length));q=x}}return c}
 function hall(dom,n,work){const match=Array(n).fill(-1);function rec(q,seen){for(const k of each(dom[q])){work.add();if(seen[k])continue;seen[k]=true;if(match[k]<0||rec(match[k],seen)){match[k]=q;return true}}return false}for(const q of Array.from({length:n},(_,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b])))if(!rec(q,Array(n).fill(false)))return false;return true}
 function frontier(frames,n,limit,mode,initial=null){
  const work=new Work(limit),all=(1<<n)-1,key=Array(n).fill(-1);let used=0,witness=null,cuts=0,arcCuts=0,arcCalls=0,arcRejects=0; if(initial)for(let q=0;q<n;q++)if(initial[q]>=0){key[q]=initial[q];used|=bit(initial[q]);}
  const kinv=Array(n).fill(-1);for(let q=0;q<n;q++)if(key[q]>=0)kinv[key[q]]=q;
  function expand(t,old,changed){if(old.done)return old;const pending=[],blocked=[],seen=new Set();let done=false;
   const push=(i,q)=>{if(i===t.c.length){done=true;return}const a=i*n+q;if(!seen.has(a)){seen.add(a);pending.push([i,q])}};
   for(const [i,q] of old.blocked){work.add();if(changed<0||q===changed)push(i,q);else{seen.add(i*n+q);blocked.push([i,q])}}
   while(pending.length&&!done){work.add();const [i,q]=pending.pop();const k=key[q];if(k<0)blocked.push([i,q]);else{const p=mod(t.d[i]+k,n);if(p)push(i+1,p)}if(t.c[i]===0)push(i+1,q)}
   return {done,blocked:done?[]:blocked};
  }
  function dfs(fs,depth){work.nodes++;work.add();let free=all&~used,dom=key.map(k=>k<0?free:bit(k)),affected=Array(n).fill(0),mandatory=Array(n).fill(0),blocked=Array(n).fill(0);let done=true;
   for(let j=0;j<fs.length;j++){work.add();const f=fs[j];if(f.done)continue;done=false;if(!f.blocked.length)return false;let rows=new Set();for(const [i,q] of f.blocked){work.add();rows.add(q);blocked[q]++}for(const q of rows)affected[q]++;if(rows.size===1){let q=rows.values().next().value;mandatory[q]++;let d=frames[j].d[f.blocked[0][0]];if(f.blocked.every(([i])=>frames[j].d[i]===d))dom[q]&=~bit(mod(-d,n));if(mode>=6&&f.blocked.length===1){const [i]=f.blocked[0],t=frames[j];if(i+1<t.c.length&&t.c[i+1]!==0){work.add();const v=mod(-t.d[i+1],n),p=kinv[v];let forbidden=0;if(p>=0)forbidden|=bit(mod(p-d,n));else if(mod(v+d,n)===q)forbidden|=bit(v);const before=dom[q];dom[q]&=~forbidden;arcCuts+=pop(before)-pop(dom[q]);}}}}
   if(done){witness=[...key];let rest=free;for(let q=0;q<n;q++)if(witness[q]<0){let k=low(rest);witness[q]=k;rest&=rest-1}return true}
   if(dom.some(x=>!x))return false;
   if(mode===3||mode===4||mode===7){const arcs=mandatoryArcs(fs,frames,n,work).filter(a=>mode!==7||pop(a.ds)>1);if(arcs.length){arcCalls++;const stats=arcProp(dom,arcs,n,work);arcCuts+=stats.cuts;if(!stats.ok){arcRejects++;return false}}}
   if(depth>=2&&(mode===0||mode===1||mode===2||mode===4)){for(let j=0;j<fs.length;j++){const f=fs[j],t=frames[j];if(f.done)continue;let left=Math.min(...f.blocked.map(x=>x[0]));const pass=backward(t,left,dom,n,work,mode===4?1:mode);if(!pass){cuts++;return false}const {shifts,rows}=pass;let rowmask=0,support=Array(n).fill(0);for(const [i,q] of f.blocked){work.add();let a=(rows[i]&bit(q))?shifts[i]&dom[q]:0;if(a){rowmask|=bit(q);support[q]|=a}}if(!rowmask)return false;if(pop(rowmask)===1){let q=low(rowmask);dom[q]&=support[q];if(!dom[q])return false}}}
   if(!hall(dom,n,work))return false;let q=-1;
   for(let i=0;i<n;i++)if(key[i]<0&&affected[i]&&(q<0||pop(dom[i])<pop(dom[q])||(pop(dom[i])===pop(dom[q])&&(mandatory[i]>mandatory[q]||mandatory[i]===mandatory[q]&&(affected[i]>affected[q]||affected[i]===affected[q]&&blocked[i]>blocked[q])))))q=i;
   assert(q>=0,"frontier branch");
   for(const k of each(dom[q])){work.add();key[q]=k;kinv[k]=q;used|=bit(k);const next=fs.map((f,i)=>f.done||!f.blocked.some(x=>x[1]===q)?f:expand(frames[i],f,q));let ok=next.every(f=>f.done||f.blocked.length);if(ok&&dfs(next,depth+1))return true;key[q]=-1;kinv[k]=-1;used&=~bit(k)}
   return false;
  }
  let status;try{let fs=frames.map(t=>expand(t,{done:false,blocked:[[1,0]]},-1));status=dfs(fs,0)?"sat":"unsat"}catch(e){if(e!==CAP_SIGNAL)throw e;status="unknown"}if(witness)assert(legal(frames,witness),"bad baseline witness");return {status,ops:work.ops,nodes:work.nodes,witness,cuts,arcCuts,arcCalls,arcRejects};
 }

 // Safe-start domains for a suffix: M subset S(K) subset U,
 // lo <= |S(K)| <= hi, simultaneously for every permitted permutation.
 function backward(t,left,dom,n,work,mode){
  const all=(1<<n)-1, shifts=[],rows=[];let U=all,M=all,lo=n,hi=n;
  const rot=(x,d)=>{d=mod(d,n);return d?((x<<d)|(x>>>(n-d)))&all:x};
  function tighten(m,u,l,h){work.add();l=Math.max(l,pop(m));h=Math.min(h,pop(u));
   if(l>h)return null;
   if(h===pop(m))u=m;
   if(l===pop(u))m=u;
   return [m,u,l,h];
  }
  for(let i=t.c.length-1;i>=left;i--){
   const d=t.d[i];let sh=0;
   if(mode===0){for(const p of each(U&~1)){work.add();sh|=bit(mod(p-d,n))}}
   else {work.add();sh=rot(U&~1,-d)}
   shifts[i]=sh;
   if(mode!==2){let next=0;for(let q=0;q<n;q++){work.add();if(dom[q]&sh)next|=bit(q)}
    rows[i]=next;U=t.c[i]===0?U|next:next;continue}
   work.add();const sure=rot(M&~1,-d);
   let cu=0,cm=0;
   for(let q=0;q<n;q++){work.add();if(dom[q]&sh)cu|=bit(q);work.add();if((dom[q]&~sure)===0)cm|=bit(q)}
   let z=tighten(cm,cu,Math.max(0,lo-((U&1)?1:0)),hi-((M&1)?1:0));
   if(!z)return null;
   let [mc,uc,lc,hc]=z;rows[i]=uc;
   if(!hc)shifts[i]=0;
   if(t.c[i]===0){
    work.add(3);
    z=tighten(M|mc,U|uc,Math.max(lo,lc,lo+lc-pop(U&uc)),Math.min(n,hi+hc-pop(M&mc)));
    if(!z)return null;
    [M,U,lo,hi]=z;
   }else [M,U,lo,hi]=z;
   if(!hi){for(let j=i-1;j>=left;j--){work.add();rows[j]=0;shifts[j]=0}break}
  }
  return {shifts,rows,U,M,lo,hi};
 }
 function exactSafe(t,key,n){const all=(1<<n)-1;let s=all;for(let i=t.c.length-1;i>=1;i--){let a=t.c[i]===0?s:0;for(let q=0;q<n;q++){const p=mod(t.d[i]+key[q],n);if(p&&(s&bit(p)))a|=bit(q)}s=a;}return s}
 function complete(initial,n,fn){const key=initial.slice();let used=0;for(const k of key)if(k>=0)used|=bit(k);
  function rec(q,u){while(q<n&&key[q]>=0)q++;if(q===n){fn(key);return}for(const k of each(((1<<n)-1)&~u)){key[q]=k;rec(q+1,u|bit(k));key[q]=-1}}
  rec(0,used)
 }
 function oracle(frames,n,initial){let sat=false,completions=0;complete(initial,n,key=>{completions++;if(legal(frames,key))sat=true});return {status:sat?"sat":"unsat",completions}}
 let seed=314347;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function initialFor(n,h){const k=shuffle(Array.from({length:n},(_,i)=>i)),p=k.slice();for(const q of shuffle(Array.from({length:n},(_,i)=>i)).slice(0,h))p[q]=-1;return [k,p]}

 // A singleton unfinished frontier means every legal extension must
 // consume at (i,q). If the following ciphertext is nonzero, it must
 // consume too. For a fixed q and v=-d[i+1], the inverse row K^-1(v)
 // cannot lie in {K[q]+d[i]} for ANY mandatory branch in this group.
 function mandatoryArcs(fs,frames,n,work){
  const by=new Map();
  for(let j=0;j<fs.length;j++){work.add();const f=fs[j],t=frames[j];
   if(f.done||f.blocked.length!==1)continue;const [i,q]=f.blocked[0];
   if(i+1>=t.c.length||t.c[i+1]===0)continue;
   const d=t.d[i],v=mod(-t.d[i+1],n),id=q*n+v;
   const a=by.get(id)||{q,v,ds:0};a.ds|=bit(d);by.set(id,a);
  }
  return Array.from(by.values());
 }
 function arcProp(dom,arcs,n,work){
  const all=(1<<n)-1,rot=(x,d)=>d?((x<<d)|(x>>>(n-d)))&all:x;
  let cuts=0;
  // A bounded number of sound GAC sweeps; full-key DFS preserves completeness.
  for(let round=0;round<2;round++){let change=0;
   const inv=Array(n).fill(0),target=new Set(arcs.map(a=>a.v));
   for(const v of target)for(let q=0;q<n;q++){work.add();if(dom[q]&bit(v))inv[v]|=bit(q)}
   function remove(q,mask){
    const lost=dom[q]&mask;if(!lost)return;dom[q]&=~lost;const count=pop(lost);cuts+=count;change+=count;
    for(const v of each(lost)){work.add();if(target.has(v))inv[v]&=~bit(q)}
   }
   for(const {q,v,ds} of arcs){
    work.add();const candidates=dom[q];let kSupport=0,pSupport=0;
    for(const k of each(candidates)){
     work.add();const reached=rot(ds,k);if(reached&1)continue;
     const support=inv[v]&(k===v?bit(q):all&~bit(q))&~reached;
     if(support){kSupport|=bit(k);pSupport|=support}
    }
    if(!kSupport)return {ok:false,cuts};
    remove(q,all&~kSupport);
    for(const p of each(inv[v]&~pSupport)){work.add();remove(p,bit(v));if(!dom[p])return {ok:false,cuts}}
    if(!dom[q]||!inv[v])return {ok:false,cuts};
   }
   if(!change)break;
  }
  return {ok:true,cuts};
 }
 function validArcs(key,arcs,n){for(const {q,v,ds} of arcs)for(const d of each(ds)){const p=mod(key[q]+d,n);if(!p||key[p]===v)return false}return true}

 const gp=JSON.parse(raw[0]),alphabet=gp.translit,tokens=alphabet.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1).map(native),n=29,limit=250000;
 seed=31434729;
 const out=[],modes=[1,3,5,6,7];
 const lengths=gp.pages.filter(p=>p.page<=55&&p.indices.length>1).map(p=>({len:p.indices.length-1,iv:p.indices[0],page:p.page}));
 for(let di=0;di<donors.length;di++)for(let trial=0;trial<8;trial++){
   const planted=trial%2===0,[k,p]=initialFor(n,8);
   const frames=[],pages=[];let pos=rand(donors[di].length-3000),start=pos;
   const selected=shuffle(lengths.slice()).slice(0,6);
   for(const {len,iv,page} of selected){let plain=donors[di].slice(pos,pos+len);pos+=len;assert(plain.length===len,"source range");frames.push(tape(encode(plain,k,iv),n));pages.push(page)}
   // Corrupt one randomly chosen nonzero ciphertext cell in each of two
   // frames for negative candidates. Exact residual enumeration labels
   // actual SAT/UNSAT, rather than assuming perturbation is impossible.
   const mutations=[];if(!planted)for(let j=0;j<2;j++){const t=frames[j],i=1+rand(t.c.length-1),old=t.c[i],val=(old+1+rand(n-1))%n;t.c[i]=val;frames[j]=tape(t.c,n);mutations.push([j,i,old,val])}
   const o=oracle(frames,n,p);
   if(planted)assert(o.status==="sat","plant invalid");
   const solvers=modes.map(m=>frontier(frames,n,limit,m,p));
   for(const v of solvers)assert(v.status==="unknown"||v.status===o.status,"solver/oracle mismatch");
   const F=frames.reduce((s,t)=>s+t.c.slice(1).filter(v=>!v).length,0),N=frames.reduce((s,t)=>s+t.c.length-1,0);
   out.push({di,trial,planted,truth:o.status,completions:o.completions,sourceOffset:start,pages,mutations,initial:p,key:k,N,F,solvers});
 }
 function sum(rows){return {cases:rows.length,sat:rows.filter(x=>x.truth==="sat").length,completions:rows.reduce((a,x)=>a+x.completions,0),modes:modes.map((mode,i)=>({mode,solved:rows.filter(x=>x.solvers[i].status!=="unknown").length,ops:rows.reduce((s,x)=>s+x.solvers[i].ops,0),nodes:rows.reduce((s,x)=>s+x.solvers[i].nodes,0),arcCuts:rows.reduce((s,x)=>s+x.solvers[i].arcCuts,0),arcRejects:rows.reduce((s,x)=>s+x.solvers[i].arcRejects,0)})),pair:[[3,2],[4,2],[3,0]].map(([a,b])=>{const common=rows.filter(x=>x.solvers[a].status!=="unknown"&&x.solvers[b].status!=="unknown");return {a:modes[a],b:modes[b],common:common.length,ops:[a,b].map(i=>common.reduce((s,x)=>s+x.solvers[i].ops,0)),wins:rows.filter(x=>x.solvers[a].status!=="unknown"&&(x.solvers[b].status==="unknown"||x.solvers[a].ops<x.solvers[b].ops)).length,losses:rows.filter(x=>x.solvers[b].status!=="unknown"&&(x.solvers[a].status==="unknown"||x.solvers[b].ops<x.solvers[a].ops)).length}})}}
 return {seed:31434729,summary:sum(out),sat:sum(out.filter(x=>x.truth==="sat")),unsat:sum(out.filter(x=>x.truth==="unsat")),rows:out};
}
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module){const fs=require('node:fs'),path=require('node:path');console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));}
module.exports={experiment,INPUTS};
