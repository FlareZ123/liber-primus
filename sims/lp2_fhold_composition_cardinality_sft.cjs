'use strict';
// Baseline semantic frontier adapted from lp2_fhold_zero_free_interval_join_sft.cjs (#3055).
function experiment(){
 const assert=(x,m)=>{if(!x)throw Error(m)}, bit=x=>1<<x, low=x=>31-Math.clz32(x&-x), pop=x=>{let n=0;while(x){x&=x-1;n++}return n}, each=x=>{const a=[];while(x){let q=low(x);a.push(q);x&=x-1}return a}, mod=(x,n)=>(x%n+n)%n;
 const LIMIT=250000, TABLE_CAP=4096, CAP_SIGNAL=Symbol("budget");
 class Work{constructor(limit){this.limit=limit;this.ops=0;this.nodes=0}add(n=1){this.ops+=n;if(this.ops>this.limit)throw CAP_SIGNAL}}
 function tape(c,n){return {c,d:c.map((x,i)=>i?mod(x-c[i-1],n):0)}}
 function legal(frames,key){const n=key.length;for(const t of frames){let s=1;for(let i=1;i<t.c.length;i++){let a=t.c[i]===0?s:0;for(const q of each(s)){let p=mod(t.d[i]+key[q],n);if(p)a|=bit(p)}s=a;if(!s)return false}}return true}
 function encode(p,k,iv){const c=[iv];let q=0;for(const x of p){if(!x)c.push(0);else{c.push(mod(c.at(-1)+x-k[q],k.length));q=x}}return c}
 function hall(dom,n,work){const match=Array(n).fill(-1);function rec(q,seen){for(const k of each(dom[q])){work.add();if(seen[k])continue;seen[k]=true;if(match[k]<0||rec(match[k],seen)){match[k]=q;return true}}return false}for(const q of Array.from({length:n},(_,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b])))if(!rec(q,Array(n).fill(false)))return false;return true}
 function frontier(frames,n,limit,mode,initial=null){
  const work=new Work(limit),all=(1<<n)-1,key=Array(n).fill(-1);let used=0,witness=null,cuts=0; if(initial)for(let q=0;q<n;q++)if(initial[q]>=0){key[q]=initial[q];used|=bit(initial[q]);}
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
   if(depth>=2){for(let j=0;j<fs.length;j++){const f=fs[j],t=frames[j];if(f.done)continue;let left=Math.min(...f.blocked.map(x=>x[0]));const pass=backward(t,left,dom,n,work,mode);if(!pass){cuts++;return false}const {shifts,rows}=pass;let rowmask=0,support=Array(n).fill(0);for(const [i,q] of f.blocked){work.add();let a=(rows[i]&bit(q))?shifts[i]&dom[q]:0;if(a){rowmask|=bit(q);support[q]|=a}}if(!rowmask)return false;if(pop(rowmask)===1){let q=low(rowmask);dom[q]&=support[q];if(!dom[q])return false}}}
   if(!hall(dom,n,work))return false;let q=-1;
   for(let i=0;i<n;i++)if(key[i]<0&&affected[i]&&(q<0||pop(dom[i])<pop(dom[q])||(pop(dom[i])===pop(dom[q])&&(mandatory[i]>mandatory[q]||mandatory[i]===mandatory[q]&&(affected[i]>affected[q]||affected[i]===affected[q]&&blocked[i]>blocked[q])))))q=i;
   assert(q>=0,"frontier branch");
   for(const k of each(dom[q])){work.add();key[q]=k;used|=bit(k);const next=fs.map((f,i)=>f.done||!f.blocked.some(x=>x[1]===q)?f:expand(frames[i],f,q));let ok=next.every(f=>f.done||f.blocked.length);if(ok&&dfs(next,depth+1))return true;key[q]=-1;used&=~bit(k)}
   return false;
  }
  let status;try{let fs=frames.map(t=>expand(t,{done:false,blocked:[[1,0]]},-1));status=dfs(fs,0)?"sat":"unsat"}catch(e){if(e!==CAP_SIGNAL)throw e;status="unknown"}if(witness)assert(legal(frames,witness),"bad baseline witness");return {status,ops:work.ops,nodes:work.nodes,witness,cuts};
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
 function control(){
  let strictMasks=0,strictEmpty=0,strictExample=null,tested=0,completions=0;
  for(let n=3;n<=8;n++)for(let trial=0;trial<80;trial++){
   const [k,p]=initialFor(n,Math.min(n-1,2+rand(3)));let used=0;for(const v of p)if(v>=0)used|=bit(v);
   const dom=p.map(v=>v>=0?bit(v):((1<<n)-1)&~used);
   const len=8+rand(32), c=Array.from({length:len+1},()=>rand(n));
   if(trial%2===0)for(let i=1;i<c.length;i++)if(!c[i])c[i]=1+rand(n-1);
   const t=tape(c,n), a=backward(t,1,dom,n,new Work(1e8),1),b=backward(t,1,dom,n,new Work(1e8),2);
   let union=0,inter=(1<<n)-1,min=n,max=0;
   complete(p,n,key=>{const s=exactSafe(t,key,n);union|=s;inter&=s;min=Math.min(min,pop(s));max=Math.max(max,pop(s));completions++});
   assert(b!==null,"consistent partial permutation falsely rejected");
   // U/M retain the final suffix state even if upper bound reaches zero early.
   assert((union&~b.U)===0 && (b.M&~inter)===0 && b.lo<=min && b.hi>=max,"unsound suffix bound");
   if(b.U!==a.U){strictMasks++;if(!b.U&&a.U){strictEmpty++;if(!strictExample)strictExample={n,c,initial:p,dom,vanillaMask:a.U,newMask:b.U,newHi:b.hi,exactUnion:union}}}
   tested++;
  }
  return {tested,completions,strictMasks,strictEmpty,strictExample};
 }
 function bench(){
  const out=[],limit=250000;
  for(const n of [3,4,5,6,7,8,29]){
   for(let trial=0;trial<(n===29?24:8);trial++){
    const planted=trial%2===0;
    const [k,p]=initialFor(n,n===29?6:n);
    const frames=Array.from({length:n===29?5:3},()=>{const len=(n===29?45:12)+rand(n===29?30:13),plain=Array.from({length:len},()=>rand(n));
      return tape(planted?encode(plain,k,rand(n)):Array.from({length:len+1},()=>rand(n)),n)});
    const o=oracle(frames,n,p),a=frontier(frames,n,limit,0,p),b=frontier(frames,n,limit,1,p),c=frontier(frames,n,limit,2,p);
    for(const v of [a,b,c])assert(v.status==="unknown"||v.status===o.status,"solver/oracle mismatch");
    out.push({n,trial,planted,truth:o.status,completions:o.completions,a,b,c})
   }
  }
  const sum=rows=>{const common=rows.filter(x=>x.b.status!=="unknown"&&x.c.status!=="unknown");
   return {cases:rows.length,sat:rows.filter(x=>x.truth==="sat").length,solved:[...["a","b","c"]].map(k=>rows.filter(x=>x[k].status!=="unknown").length),common:common.length,ops:["a","b","c"].map(k=>common.reduce((s,x)=>s+x[k].ops,0)),nodes:["a","b","c"].map(k=>rows.reduce((s,x)=>s+x[k].nodes,0)),wins:rows.filter(x=>x.c.status!=="unknown"&&(x.b.status==="unknown"||x.c.ops<x.b.ops)).length,losses:rows.filter(x=>x.b.status!=="unknown"&&(x.c.status==="unknown"||x.b.ops<x.c.ops)).length}};
  return {summary:{all:sum(out),reduced:sum(out.filter(x=>x.n<29)),gp29:sum(out.filter(x=>x.n===29))},rows:out}
 }
 return {soundness:control(),...bench()};
}
if(require.main===module)console.log(JSON.stringify(experiment(),null,2));
module.exports={experiment};
