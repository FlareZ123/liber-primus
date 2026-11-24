"use strict";
// Node.js 22 CommonJS. Run from any directory. No third-party dependencies.
function research(g,t,l,sol,sh,gib,em){
  const gp=JSON.parse(g),map=new Map(gp.runes.map((x,i)=>[x,i])),Q=29,mod=x=>(x%Q+Q)%Q;
  const check=(a,m)=>{if(!a)throw Error(m)};
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const match=(a,b)=>a.filter((x,i)=>x===b[i]).length;
  const texts=JSON.parse(sol).sections.map(s=>Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x)));
  const tok=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  /** @param {string} t @returns {number[]} */
  function encode(t){let a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){let z=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tok.find(([s])=>w.startsWith(s,i));check(z,"native token "+w);a.push(z[1]);i+=z[0].length}}return a}
  const corp=[encode(sh),encode(gib),encode(em)];
  const pages=gp.pages.filter(p=>p.page<56),all=pages.flatMap(p=>p.indices),prefix=pages.filter(p=>p.page<40).flatMap(p=>p.indices),hold=pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
  const words=(t.replace(/[/%\s]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));let n=0;const ws=words.filter(w=>{n+=w.length;return n<=all.length});check(same(ws.flat(),all)&&ws.length===2896&&all.length===12956,"original transcription mismatch");check(prefix.length===9640&&hold.length===3008,"source split");
  const dict={13:new Map(),14:new Map()};for(const w of l.trim().split(/\s+/)){let p=encode(w);if(dict[p.length])dict[p.length].set(p.join(),p)}
  const anchors=ws.map((c,i)=>({c,i})).filter(x=>x.c.length>=13).map(({c,i})=>{let count=0;for(const p of dict[c.length].values()){let a=new Int8Array(Q).fill(-1),ok=true;for(let j=0;j<c.length-1;j++){let v=mod(c[j+1]-c[j]-p[j+1]+p[j]);if(a[c[j]]>=0&&a[c[j]]!==v){ok=false;break}a[c[j]]=v}if(ok)count++}return {word:i,c,candidates:count,distinctPredecessors:new Set(c.slice(0,-1)).size}});
  function rand(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}}
  /** Independent training data, conditional differences omit plaintext zero in F-hold mode. */
  function train(ps,fhold){let uni=new Float64Array(Q).fill(.5),bi=new Float64Array(Q*Q).fill(.5),du=new Float64Array(Q).fill(.5),db=new Float64Array(Q*Q).fill(.5);for(const p of ps){for(let i=0;i<p.length;i++){uni[p[i]]++;if(i){bi[p[i-1]*Q+p[i]]++;if(!fhold||(p[i]&&p[i-1]))du[mod(p[i]-p[i-1])]++}if(i>1&&(!fhold||(p[i]&&p[i-1]&&p[i-2])))db[mod(p[i-1]-p[i-2])*Q+mod(p[i]-p[i-1])]++}}function norm(a){let z=a.slice();for(let i=0;i<a.length;i+=Q){let sum=0;for(let j=0;j<Q;j++)sum+=a[i+j];for(let j=0;j<Q;j++)z[i+j]=Math.log(a[i+j]/sum)}return z}return {uni:norm(uni),bi:norm(bi),du:norm(du),db:norm(db)}}
  /** @param {number[]} p @param {number[]} d @param {number} k @param {boolean} fhold */
  function encrypt(p,d,k,fhold){return p.map(x=>{if(fhold&&!x)return 0;let c=mod(x+k);k=mod(k+d[c]);return c})}
  /** @param {number[]} c @param {number[]} d @param {number} k */
  function decode(c,d,k){return c.map(x=>{let p=mod(x-k);k=mod(k+d[x]);return p})}
  function score(p,m){let s=m.uni[p[0]];for(let i=1;i<p.length;i++)s+=m.bi[p[i-1]*Q+p[i]];return s/p.length}
  function best(c,d,m){return Array.from({length:Q},(_,k)=>{let p=decode(c,d,k);return {k,p,score:score(p,m)}}).sort((a,b)=>b.score-a.score)[0]}
  /** Pairwise discrete factor objective on adjacent plaintext differences. Exact coordinate maximization, heuristic global search. */
  function infer(c,m,fhold,seed=3301,starts=32){const next=rand(seed),u=new Float64Array(Q*Q),f=new Float64Array(Q**4),k2=Q*Q,lo=Number(fhold);let n=0;
    for(let i=1;i<c.length;i++){let a=c[i-1],x=mod(c[i]-a);if(fhold&&(!a||!c[i]))continue;for(let da=0;da<Q;da++)u[a*Q+da]+=m.du[mod(x-da)];if(i>1&&(!fhold||c[i-2])){n++;let b=c[i-2],y=mod(a-b),off=(b*Q+a)*k2;for(let db=0;db<Q;db++)for(let da=0;da<Q;da++)f[off+db*Q+da]+=m.db[mod(y-db)*Q+mod(x-da)]}}
    function value(d){let s=0;for(let a=lo;a<Q;a++)for(let b=lo;b<Q;b++)s+=f[(a*Q+b)*k2+d[a]*Q+d[b]];return s}
    const init=Array.from({length:Q},(_,a)=>{let z=0;for(let j=1;j<Q;j++)if(u[a*Q+j]>u[a*Q+z])z=j;return z});let bestD=null,bestV=-Infinity,unique=new Map();
    for(let run=0;run<starts;run++){let d=init.map((x,i)=>i<lo?0:run===0?x:run<starts/2?(next()%3===0?next()%Q:x):next()%Q);
      for(let it=0;it<40;it++){let changed=0,order=Array.from({length:Q-lo},(_,i)=>i+lo);for(let i=order.length-1;i>0;i--){let j=next()%(i+1);[order[i],order[j]]=[order[j],order[i]]}
        for(const a of order){let top=d[a],val=-Infinity;for(let da=0;da<Q;da++){let s=f[(a*Q+a)*k2+da*Q+da];for(let b=lo;b<Q;b++)if(b!==a)s+=f[(a*Q+b)*k2+da*Q+d[b]]+f[(b*Q+a)*k2+d[b]*Q+da];if(s>val){val=s;top=da}}if(top!==d[a]){d[a]=top;changed++}}if(!changed)break}
      let v=value(d);unique.set(d.join(),v);if(v>bestV){bestD=d.slice();bestV=v}}
    return {d:bestD,score:bestV/n,unique:unique.size,initial:init,n,top:Array.from(unique).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([s])=>s.split(",").map(Number))}}
  /** Exact fixed-table F-hold Viterbi on (incoming shift, previous plaintext). */
  function dp(c,d,m,start=null,trace=false){let prev=new Map();if(start)prev.set(start.k*Q+start.p,{s:0});else for(let k=0;k<Q;k++)prev.set(k*Q,{s:0,origin:k});const layers=trace?[]:null;
    for(let i=0;i<c.length;i++){const x=c[i],next=new Map();for(const [id,node] of prev){let k=Math.floor(id/Q),p=id%Q;const add=(plain,k2)=>{let z=k2*Q+plain,s=node.s+(!start&&i===0?m.uni[plain]:m.bi[p*Q+plain]);let old=next.get(z);if(!old||s>old.s)next.set(z,{s,origin:node.origin,from:id,plain})};if(!x)add(0,k);let y=mod(x-k);if(y)add(y,mod(k+d[x]))}if(!next.size)return {dead:i};if(trace)layers.push(next);prev=next}
    let [id,node]=[...prev].sort((a,b)=>b[1].s-a[1].s)[0],p=[];if(trace){let z=id;for(let i=layers.length-1;i>=0;i--){let a=layers[i].get(z);p.push(a.plain);z=a.from}p.reverse()}return {score:node.s/c.length,k:Math.floor(id/Q),last:id%Q,origin:node.origin,p}}
  function fit(c,est,m){let best=null,maxDead=0,legal=0,attempted=0;for(const d0 of est.top){let d=d0.slice();for(let z=0;z<Q;z++){attempted++;d[0]=z;let o=dp(c,d,m);if(o.dead!==undefined){maxDead=Math.max(maxDead,o.dead);continue}legal++;if(!best||o.score>best.o.score)best={d:d.slice(),o}}}if(best)best.o=dp(c,best.d,m,null,true);return {best,maxDead,legal,attempted}}
  function run(p,h,m,fhold,seed,starts){let rng=rand(seed),d=Array.from({length:Q},()=>rng()%Q),k=rng()%Q,c=encrypt(p.concat(h),d,k,fhold),pre=c.slice(0,p.length),tail=c.slice(p.length),a=infer(pre,m,fhold,seed,starts);if(!fhold){let b=best(pre,a.d,m),pall=decode(c,a.d,b.k);check(same(encrypt(pall,a.d,b.k,false),c),"ordinary replay");return {train:p.length,hold:h.length,initialExact:match(a.initial,d),estimateExact:match(a.d,d),phase:b.k===k,trainExact:match(pall.slice(0,p.length),p),holdExact:match(pall.slice(p.length),h),trainScore:b.score,holdScore:score(pall.slice(p.length),m),diffScore:a.score,unique:a.unique,replay:true}}
    let b=fit(pre,a,m),o=b.best,hout=o?dp(tail,o.d,m,{k:o.o.k,p:o.o.last},true):null;if(o){check(same(encrypt(o.o.p,o.d,o.o.origin,true),pre),"F-hold prefix replay");if(hout?.p)check(same(encrypt(o.o.p.concat(hout.p),o.d,o.o.origin,true),c),"F-hold whole replay")}
    return {train:p.length,hold:h.length,initialExact:match(a.initial.slice(1),d.slice(1)),estimateExact:match(a.d.slice(1),d.slice(1)),unique:a.unique,attempted:b.attempted,legal:b.legal,maxDead:b.maxDead,selectedExact:o?match(o.d,d):null,phase:o?o.o.origin===k:null,trainExact:o?match(o.o.p,p):null,holdExact:hout?.p?match(hout.p,h):null,holdDead:hout?.dead??null,trainScore:o?.o.score??null,holdScore:hout?.score??null,replay:!!hout?.p}}
  const out={source:{words:ws.length,runes:all.length,prefix:prefix.length,hold:hold.length,unused:all.length-prefix.length-hold.length,dict:Object.fromEntries(Object.entries(dict).map(([k,v])=>[k,v.size])),anchors},modes:{}};
  for(const fhold of [false,true]){const key=fhold?"fhold":"ordinary",controls=[];for(let j=0;j<3;j++){const p=corp[j].slice(10000,23000),m=train(corp.filter((_,i)=>i!==j).concat(texts),fhold);controls.push({name:["Shakespeare","Gibran","Emerson"][j],...run(p.slice(0,10000),p.slice(10000),m,fhold,3301+j,32)})}
    const m=train(corp.concat(texts),fhold),a=infer(prefix,m,fhold,3301,64);let original={candidate:a.d,initial:a.initial,diffScore:a.score,unique:a.unique,windows:a.n};
    if(!fhold){let b=best(prefix,a.d,m),p=decode(prefix.concat(hold),a.d,b.k),h=p.slice(prefix.length);check(same(encrypt(p,a.d,b.k,false),prefix.concat(hold)),"original ordinary replay");Object.assign(original,{origin:b.k,trainScore:b.score,holdScore:score(h,m),prefixExcerpt:b.p.slice(0,80).map(x=>gp.translit[x]).join(" "),holdExcerpt:h.slice(0,80).map(x=>gp.translit[x]).join(" "),replay:true})}
    else{let b=fit(prefix,a,m),o=b.best,h=o?dp(hold,o.d,m,{k:o.o.k,p:o.o.last},true):null;Object.assign(original,{attempted:b.attempted,legal:b.legal,maxDead:b.maxDead,best:o?{d:o.d,score:o.o.score}:null,holdDead:h?.dead??null,holdScore:h?.score??null});if(o)check(same(encrypt(o.o.p,o.d,o.o.origin,true),prefix),"original F-hold prefix replay");if(o&&h?.p)check(same(encrypt(o.o.p.concat(h.p),o.d,o.o.origin,true),prefix.concat(hold)),"original F-hold holdout replay")}
    // Entire authentic solved-rune collection as a short-domain plant, excluded from its language model.
    const native=texts.flat(),nm=train(corp,fhold),nativeControl=run(native.slice(0,2479),native.slice(2479),nm,fhold,93133,32);
    out.modes[key]={controls,nativeControl,original}
  }
  return out;
}
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(__dirname,"..");
const sources=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/control/dwyl-english-alpha-gp13-14-only.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
];
console.log(JSON.stringify(research(...sources.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));
