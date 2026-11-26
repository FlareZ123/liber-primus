"use strict";
const fs=require("node:fs");
const {edges,replay,encode,primes,makeRng,train,decode:characterDecode}=require('./lp2_vnull_fhold_joint_clock_sft.cjs');
const paths=["resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/orthodox_daily_prayers_pg34981.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function makeDecoder(raw,encoding="native",contextual=true){
 const Q=29,S="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),tok=S.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length),id=p=>String.fromCharCode(...p.map(x=>65+x)), supp=1-.664/3.448,maxWord=20;
 function words(t){t=t.split(/\*\*\* END OF/i)[0].replace(/^.*?\*\*\* START OF[^\n]*\n/is,"");return (t.toUpperCase().match(/[A-Z]+(?:'[A-Z]+)*/g)||[]).map(w=>{w=w.replace(/'/g,"");if(encoding==="native")w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA");w=w.replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];while(w){let t=tok.find(x=>w.startsWith(x[0]));if(!t)throw Error(w);a.push(t[1]);w=w.slice(t[0].length)}return a})}
 const a=new Map(),b=new Map(),add=(m,k,v)=>m.set(k,(m.get(k)||0)+v),train=raw.slice(0,2).flatMap(words),cnt=Array.from({length:4},()=>new Map()),ctx=Array.from({length:4},()=>new Map());
 for(const p of train){if(p.length<=maxWord)add(a,id(p),1)}
 for(const l of raw[2].split(/\r?\n/)){let m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){const p=words(m[1])[0];if(p.length<=maxWord)add(b,id(p),+m[2])}}
 const total=m=>[...m.values()].reduce((a,b)=>a+b,0),A=total(a),B=total(b),lex=new Map(),prefix=new Map(),suffix=new Map();
 for(const k of new Set([...a.keys(),...b.keys()])){let q=.97*(.65*(a.get(k)||0)/A+.35*(b.get(k)||0)/B);lex.set(k,q);for(let j=1;j<=k.length;j++){add(prefix,k.slice(0,j),q);add(suffix,k.slice(-j),q)}}
 const pairs=new Map(),preceding=new Map();if(contextual)for(let i=1;i<train.length;i++){const u=id(train[i-1]),v=id(train[i]);add(pairs,u+"|"+v,1);add(preceding,u,1)}
 const suffTot=total(suffix);for(const [k,v] of suffix)suffix.set(k,v/suffTot*.97);
 for(const p of train)for(let i=0;i<p.length;i++){let w=id(p.slice(Math.max(0,i-3),i+1));for(let d=0;d<w.length;d++){let k=w.slice(-(d+1));add(cnt[d],k,1);add(ctx[d],k.slice(0,-1),1)}}
 function lp(w){let p=( (cnt[0].get(w.slice(-1))||0)+.5)/( (ctx[0].get("")||0)+14.5);for(let d=1;d<Math.min(4,w.length);d++){let k=w.slice(-(d+1));p=((cnt[d].get(k)||0)+8*p)/((ctx[d].get(k.slice(0,-1))||0)+8)}return Math.log(p)}
 function wordProb(w,first,last,cl){let len=w.length,unknown=.03*.20*.80**(len-1)*Math.exp(cl),q=(first?suffix:last?prefix:lex).get(w)||0;return Math.log(q+unknown)}

 const la=(a,b)=>a===-Infinity?b:b===-Infinity?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 function decode(C,K,L=null,s=supp){
  const n=C.length;if(K.length<n)throw Error("short key");
  // Remove all states that cannot reach the final ciphertext boundary.
  const E=Array.from({length:n+1},()=>new Map()), R=Array.from({length:n+1},()=>new Set());
  R[0].add(0);
  for(let i=0;i<n;i++)for(const j of R[i]){const es=edges(C,K,i,j,s);E[i].set(j,es);for(const e of es)R[e.i].add(e.j)}
  for(let i=n-1;i>=0;i--)for(const [j,es] of E[i]){const good=es.filter(e=>R[e.i].has(e.j));E[i].set(j,good);if(!good.length)R[i].delete(j)}
  if(!R[0].has(0))return null;
  const W=Array.from({length:n},()=>new Map());
  function wordEdges(i,j){
   if(W[i].has(j))return W[i].get(j);
   const out=[];
   function visit(x,y,w,p,z,cl){
    if(w.length){const l=wordProb(w,i===0,x===n,cl);out.push({i:x,j:y,p,w:z+l,word:w,logp:l});if(w.length===maxWord)return}
    if(x===n)return;
    for(const e of E[x].get(y)){const k=w+String.fromCharCode(65+e.p);visit(e.i,e.j,k,[...p,e.p],z+e.w,cl+lp(k))}
   }
   visit(i,j,"",[],0,0);W[i].set(j,out);return out;
  }
  const D=Array.from({length:n+1},()=>new Map());D[0].set("0|0|",{j:0,t:0,prev:"",a:0,b:-Infinity});
  const key=(j,t,p)=>j+"|"+t+"|"+p;
  function weight(u,e){if(!contextual||!u.prev||e.i===n)return e.w;const f=preceding.get(u.prev)||0;if(!f)return e.w;const c=pairs.get(u.prev+"|"+e.word)||0;return e.w+Math.log((20+c/Math.exp(e.logp))/(20+f))}
  function destination(i,u,e){const t=u.t+e.p.length,prev=contextual&&i>0?e.word:"";if(L!==null&&(t>L||t+n-e.i<L))return null;return {t,prev,k:key(e.j,t,prev)}}
  for(let i=0;i<n;i++)for(const u of D[i].values())for(const e of wordEdges(i,u.j)){
   const d=destination(i,u,e);if(!d)continue;let v=D[e.i].get(d.k);if(!v){v={j:e.j,t:d.t,prev:d.prev,a:-Infinity,b:-Infinity};D[e.i].set(d.k,v)}v.a=la(v.a,u.a+weight(u,e));
  }
  let Z=-Infinity;for(const u of D[n].values())if(L===null||u.t===L){u.b=0;Z=la(Z,u.a)}
  if(!Number.isFinite(Z))return null;
  const M=Array.from({length:n},()=>new Float64Array(Q));
  for(let i=n-1;i>=0;i--)for(const u of D[i].values())for(const e of wordEdges(i,u.j)){
   const d=destination(i,u,e);if(!d)continue;const v=D[e.i].get(d.k);if(!v||v.b===-Infinity)continue;
   const w=weight(u,e);u.b=la(u.b,w+v.b);const post=Math.exp(u.a+w+v.b-Z);for(let k=0;k<e.p.length;k++)M[u.t+k][e.p[k]]+=post;
  }
  if(Math.abs(D[0].get("0|0|").b-Z)>1e-7)throw Error("forward-backward disagreement");
  const T=Array.from({length:n+1},()=>new Map());T[0].set("0|0",{j:0,t:0,v:0});
  for(let i=0;i<n;i++)for(const u of T[i].values())for(const e of E[i].get(u.j)){
   const t=u.t+1;if(L!==null&&(t>L||t+n-e.i<L))continue;const k=e.j+"|"+t,v=u.v+M[u.t][e.p],o=T[e.i].get(k);if(!o||v>o.v)T[e.i].set(k,{j:e.j,t,v,back:u,e});
  }
  let best=null;for(const u of T[n].values())if((L===null||u.t===L)&&(!best||u.v>best.v))best=u;
  const ev=[];for(let u=best;u.back;u=u.back)ev.push(u.e);ev.reverse();replay(C,K,ev,s);
  return {P:ev.map(e=>e.p),events:ev,ll:Z/n,states:D.reduce((a,x)=>a+x.size,0),risk:best.v};
 }
 return {decode,encodeWords:words,lexicon:lex.size,supp};
}
function edit(a,b){let d=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const q=[i+1];for(let j=0;j<b.length;j++)q.push(Math.min(d[j+1]+1,q[j]+1,d[j]+(a[i]!==b[j])));d=q}return d.at(-1)}
function experiment(raw,seed=0x47f0a11,N=60,holdout=false){
 const {decode,encodeWords:words,lexicon,supp}=makeDecoder(raw),rng=makeRng(seed),mod=x=>(x%29+29)%29,prime=primes(2000).map(p=>mod(p-1)),kw=["WELCOME","DIUINITY","FIRFUMFERENFE"].map(w=>words(w).flat()),native=JSON.parse(raw[5]),rm=new Map(native.runes.map((r,i)=>[r,i])),ns=native.sections.map(s=>({name:s.name,P:[...s.source_text].filter(r=>rm.has(r)).map(r=>rm.get(r))})).filter(x=>x.P.length>=240);
 const seq=[raw[0],raw[1],raw[3]].map(t=>words(t).flat()),lp=train(seq.map(a=>a.slice(0,Math.floor(a.length*.7)))),other=words(raw[4]).flat(),out=[];
 function score(d,P){return d?{pos:d.P.reduce((n,x,i)=>n+(x===P[i]),0)/P.length,edit:edit(d.P,P),len:d.P.length,ll:d.ll,states:d.states}:null}
 for(let i=0;i<N;i++){
  const donor=i%2===0?ns[rng(ns.length)].P:holdout?other:seq[i%3].slice(Math.floor(seq[i%3].length*.7));
  const at=rng(donor.length-239),P=donor.slice(at,at+240),kind=i%5,K=kind===0?Array.from({length:600},()=>rng(29)):kind===1?prime.slice(0,600):Array.from({length:600},(_,j)=>kw[kind-2][j%kw[kind-2].length]);
  const {C}=encode(P,K,rng),W=Array.from({length:600},()=>rng(29));
  const char=characterDecode(C,K,lp),blind=decode(C,K),fixed=decode(C,K,240),wrong=decode(C,W);
  if(!blind||!fixed||!char.possible)throw Error("true path lost");
  out.push({i,kind,at,n:C.length,char:score(char,P),blind:score(blind,P),fixed:score(fixed,P),wrong:wrong?wrong.ll:null});
 }
 function summary(k){const a=out.map(x=>x[k]);return {exact:a.filter(x=>x.edit===0).length,pass:a.filter(x=>x.pos>=.85).length,meanPos:a.reduce((n,x)=>n+x.pos,0)/N,meanEdit:a.reduce((n,x)=>n+x.edit,0)/N,minLL:Math.min(...a.map(x=>x.ll)),maxStates:Math.max(...a.map(x=>x.states))}}
 return {seed:"0x"+seed.toString(16),holdout,N,lexicon,summary:{char:summary("char"),blind:summary("blind"),fixed:summary("fixed"),wrongFeasible:out.filter(x=>x.wrong!==null).length,wrongMax:Math.max(...out.filter(x=>x.wrong!==null).map(x=>x.wrong))},rows:out};
}
if(require.main===module){const raw=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify({development:experiment(raw),holdout:experiment(raw,0x47a91c2,40,true)},null,2))}
module.exports={makeDecoder,experiment,paths};
