"use strict";
/** Fixed BASE29 page-row factorization -> repeated prime-minus-one GP29 shifts. Node 22. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const load=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const small=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a}
/** @param {bigint} a @param {bigint} e @param {bigint} m */
function pow(a,e,m){let x=1n;for(a%=m;e;e>>=1n,a=a*a%m)if(e&1n)x=x*a%m;return x}
/** Deterministic Miller-Rabin in unsigned 64-bit domain. @param {bigint} n */
function prime(n){
  if(n<2n)return false;assert(n<(1n<<64n));
  for(const p of small){if(n===p)return true;if(n%p===0n)return false}
  let d=n-1n,s=0;while(!(d&1n)){d>>=1n;s++}
  for(const a of [2n,325n,9375n,28178n,450775n,9780504n,1795265022n]){
    if(a%n===0n)continue;let x=pow(a,d,n);
    if(x===1n||x===n-1n)continue;
    let ok=false;for(let j=1;j<s;j++){x=x*x%n;if(x===n-1n){ok=true;break}}
    if(!ok)return false;
  }return true
}
/** Deterministic bounded Brent rho. @param {bigint} n */
function split(n){
  for(const p of small)if(n%p===0n)return p;
  for(let c=1n;c<=32n;c++){
    const step=x=>(x*x+c)%n;let y=2n,g=1n,x=0n,ys=0n,span=1,work=0;
    while(g===1n&&work<2000000){
      x=y;for(let j=0;j<span;j++)y=step(y);work+=span;
      for(let k=0;k<span&&g===1n;k+=128){
        ys=y;let q=1n;
        for(let j=0;j<Math.min(128,span-k);j++){y=step(y);q=q*(x>y?x-y:y-x)%n;work++}
        g=gcd(q,n)
      }span*=2
    }
    if(g===n){do{ys=step(ys);g=gcd(x>ys?x-ys:ys-x,n);work++}while(g===1n&&work<3000000)}
    if(g>1n&&g<n)return g;
  }throw Error("Unresolved factorization: "+n)
}
/** @param {bigint} n */
function factors(n){
  assert(n>=2n);const stack=[n],out=[];
  while(stack.length){const v=stack.pop();if(prime(v))out.push(v);else{const d=split(v);stack.push(d,v/d)}}
  out.sort((a,b)=>a<b?-1:a>b?1:0);assert.equal(out.reduce((a,b)=>a*b,1n),n);assert(out.every(prime));return out
}
/** @param {number[]} d */
const number29=d=>d.reduce((a,b)=>29n*a+BigInt(b),0n);
/** @param {number[]} t @param {number[]} k @param {boolean} hold */
function enc(t,k,hold){let j=0;return t.map(p=>hold&&p===0?0:(p+k[j++%k.length])%29)}
/** @param {number[]} c @param {number[]} k @param {boolean} hold @param {number[][]} logs */
function inv(c,k,hold,logs){
  if(!hold)return {t:c.map((x,j)=>(x-k[j%k.length]+29)%29),n:1n};
  let states=new Map([[29,{s:0,t:[],n:1n}]]);
  for(const x of c){
    const next=new Map();
    for(const [id,v] of states){
      const j=Math.floor(id/30),prev=id%30,p=(x-k[j]+29)%29,opts=[];
      if(x===0)opts.push([j,0]);if(p)opts.push([(j+1)%k.length,p]);
      for(const [jj,b] of opts){const id2=jj*30+b,s=v.s+logs[prev][b],old=next.get(id2);
        if(!old||s>old.s)next.set(id2,{s,t:[...v.t,b],n:(old?.n??0n)+v.n});else old.n+=v.n}
    }states=next;if(!states.size)return {t:null,n:0n}
  }
  const a=[...states.values()];return {t:a.reduce((u,v)=>u.s>=v.s?u:v).t,n:a.reduce((s,v)=>s+v.n,0n)}
}
function run(c,n){
  const pages=Object.fromEntries(c.pages.map(p=>[p.page,p.indices]));
  const opening=[...pages[0],...pages[1],...pages[2]];assert.equal(opening.length,729);assert.equal(opening[13],2);
  const rows=[opening.slice(0,13),...Array.from({length:55},(_,i)=>opening.slice(14+i*13,27+i*13))];
  assert(rows.every(r=>r.length===13));const fact=rows.map(r=>factors(number29(r)));
  const al=new Map(c.runes.map((r,i)=>[r,i]));
  const texts=n.sections.map(s=>[...s.source_text].filter(r=>al.has(r)).map(r=>al.get(r)));
  const counts=Array.from({length:30},()=>Array(29).fill(.5));
  for(const t of texts.slice(0,-2)){let a=29;for(const b of t){counts[a][b]++;a=b}}
  const logs=counts.map(row=>{const s=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(29*x/s))});
  function score(t){let s=0,a=29;for(const b of t){s+=logs[a][b];a=b}return s/t.length}
  function ioc(t){const a=Array(29).fill(0);for(const x of t)a[x]++;return a.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1))}
  const p56=texts.at(-2),p57=texts.at(-1),clock=[];
  for(let p=2n;clock.length<p56.length;p++)if(prime(p))clock.push(Number((p-1n)%29n));
  assert.deepEqual(enc(p56,clock,true),pages[56]);assert.deepEqual(p57,pages[57]);
  assert.deepEqual(factors(1595277641n),[1031n,1229n,1259n]);
  assert.deepEqual(factors(4294967291n*2147483647n),[2147483647n,4294967291n]);
  const out={historical_p56_replay:p56.length,historical_parable_factors:factors(1595277641n).map(String),rows:fact.map((f,p)=>({p,value:String(number29(rows[p])),factors:f.map(String),factor_count:f.length})),native_scores:[score(p56),score(p57)],results:[]};
  for(const reverse of [false,true]){
    const keys=fact.map(f=>(reverse?[...f].reverse():f).map(x=>Number((x-1n)%29n)));
    for(const hold of [false,true]){
      const plants=[p56,p57].map((t,i)=>{const k=keys[3+i],x=enc(t,k,hold),v=inv(x,k,hold,logs);assert(v.n>0n);assert.deepEqual(enc(v.t,k,hold),x);return {n:t.length,key:k,exact:v.t.every((x,j)=>x===t[j]),paths:String(v.n),true_score:score(t),best_score:score(v.t)}});
      const records=[];
      for(let p=3;p<=39;p++){const x=pages[p],k=keys[p],v=inv(x,k,hold,logs),r={p,n:x.length,key:k,paths:String(v.n)};
        if(v.n){assert.deepEqual(enc(v.t,k,hold),x);Object.assign(r,{score:score(v.t),ioc:ioc(v.t),preview:v.t.slice(0,100).map(i=>c.translit[i]).join("")})}records.push(r)}
      const good=records.filter(r=>r.paths!=="0"),nr=good.reduce((s,r)=>s+r.n,0);
      out.results.push({factor_order:reverse?"descending":"ascending",hold,legal_pages:good.length,legal_runes:nr,weighted_score:nr?good.reduce((s,r)=>s+r.n*r.score,0)/nr:null,top:good.slice().sort((a,b)=>b.score-a.score).slice(0,3),plants,records})
    }
  }return out
}
if(require.main===module)console.log(JSON.stringify(run(load("resources/liber-primus/lp2-corpus.json"),load("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
module.exports={run};
