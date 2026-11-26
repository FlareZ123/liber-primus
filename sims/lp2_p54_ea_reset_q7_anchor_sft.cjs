"use strict";
/** Exact seven-phase additive key recovery with every ciphertext EA as a reset/control. */
function run(raw,profile){
 const S="0123456789abcdefghijklmnopqrs",N=29,Q=7,mod=x=>(x%N+N)%N;
 const names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
 const spell=new Map(names.map((x,i)=>[x,S[i]]));spell.set("ING",S[21]);const D=new Set();
 const assert=(x,m)=>{if(!x)throw Error(m)};
 for(const line of raw.split(/\r?\n/)){const m=/^([a-z]+)\s+([0-9]+)$/.exec(line.trim());if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){D.add(w);return}for(let n=1;n<=3&&i+n<=s.length;n++){const a=spell.get(s.slice(i,i+n));if(a!==undefined)walk(i+n,w+a)}}walk(0,"")}
 assert(D.size===38910,"register");const by=Array.from({length:60},()=>[]);for(const w of D)by[w.length].push(w);for(const a of by)a.sort();
 const words=[...profile.p54.all_visual_groups,...profile.p55.groups],base=words.join("");let off=0;const groups=words.map((w,i)=>{const lo=off;off+=w.length;return {i,lo,hi:off,w}});
 const last=profile.p54.all_visual_groups.length-1, split=232;
 assert(base.length===308&&groups[last].hi===split,"source");
 const train=groups.filter(g=>g.i>=2&&g.i<last&&!g.w.includes("s")),test=groups.filter(g=>g.i>last+1&&!g.w.includes("s"));
 const anchors=train.filter(g=>g.w.length>=Q&&!/[0s]/.test(g.w));assert(anchors.length===4,"anchor count");
 const marked=new Set(Array.from(base).flatMap((x,i)=>x==="s"?[i]:[]));
 function phases(c,h,j=0){const out=[];for(let i=0;i<c.length;i++){if(c[i]==="s"){out.push(-2);j=0}else if(h.has(i))out.push(-1);else{out.push(j);j=(j+1)%Q}}return {out,j}}
 function histories(c,hold){const z=Array.from(c).flatMap((x,i)=>x==="0"?[i]:[]);assert(z.length<=6,"F cap");return Array.from({length:hold?2**z.length:1},(_,b)=>new Set(z.filter((_,i)=>(b>>i)&1)))}
 function decode(c,p,k,hold){let s="";for(let i=0;i<c.length;i++){if(p[i]===-2)s+=".";else if(p[i]===-1)s+="0";else{const x=mod(S.indexOf(c[i])-k[p[i]]);if(hold&&x===0)return null;s+=S[x]}}return s}
 function recover(c,hold){const a=c.slice(0,split),b=c.slice(split),union=new Set(),accepted=[];let hist=0,checks=0,legal=0,best=0;
  for(const h of histories(a,hold)){hist++;const {out:p,j}=phases(a,h),ks=new Set();
   for(const g of anchors){assert(!/[0s]/.test(a.slice(g.lo,g.hi)),"anchor F");for(const w of by[g.w.length]){let k=Array(Q).fill(-1),ok=true;for(let i=g.lo;i<g.hi;i++){const x=S.indexOf(w[i-g.lo]),t=p[i];if(hold&&x===0){ok=false;break}const v=mod(S.indexOf(a[i])-x);if(k[t]!==-1&&k[t]!==v){ok=false;break}k[t]=v}if(ok&&k.every(x=>x>=0))ks.add(k.map(x=>S[x]).join(""))}}
   for(const s of ks){union.add(s);checks++;const k=[...s].map(x=>S.indexOf(x)),pt=decode(a,p,k,hold);if(pt===null)continue;legal++;const hits=train.filter(g=>D.has(pt.slice(g.lo,g.hi))).length;best=Math.max(best,hits);if(hits<train.length-3)continue;const continuations=[];for(const h2 of histories(b,hold)){const q=decode(b,phases(b,h2,j).out,k,hold);if(q!==null)continuations.push({q,hits:test.filter(g=>D.has(q.slice(g.lo-split,g.hi-split))).length})}accepted.push({k,pt,hits,continuations})}
  }return {histories:hist,distinctKeys:union.size,checks,legal,best,accepted};
 }
 let rng=0;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}
 function plant(hold,seed){rng=seed;const k=Array.from({length:Q},()=>rand(N));let phase=0,c="",p="",fcount=0;const omissions=anchors.slice(0,3).map(g=>g.i);
   for(const g of groups){if(g.lo===split)fcount=0;const isAnchor=anchors.some(a=>a.i===g.i),bad=omissions.includes(g.i),control=g.w.includes("s");let done=false;for(let t=0;t<30000&&!done;t++){let w=control||bad?Array.from({length:g.w.length},()=>S[rand(N)]).join(""):by[g.w.length][rand(by[g.w.length].length)];if(bad&&D.has(w))continue;let j=phase,cp="",pp="",zeros=0,ok=true;
     for(let i=0;i<w.length;i++){if(marked.has(g.lo+i)){cp+="s";pp+=".";j=0;continue}let x=S.indexOf(w[i]);if(hold&&g.lo+i===49)x=0;const y=hold&&x===0?0:mod(x+k[j]);if(!(hold&&x===0))j=(j+1)%Q;if(y===28||(isAnchor&&y===0)){ok=false;break}if(y===0)zeros++;cp+=S[y];pp+=S[x]}
     if(ok&&zeros===(hold&&g.lo<=49&&49<g.hi?1:0)){c+=cp;p+=pp;phase=j;fcount+=zeros;done=true}
   }assert(done,"plant sampler "+g.i)}
   const r=recover(c,hold);const match=r.accepted.filter(a=>a.k.every((x,i)=>x===k[i]));assert(match.some(a=>a.pt===p.slice(0,split)&&a.continuations.some(v=>v.q===p.slice(split))),"true plaintext absent");
   return {hold,seed,k,omissions,histories:r.histories,distinctKeys:r.distinctKeys,uniqueAcceptedKeys:new Set(r.accepted.map(a=>a.k.join(","))).size,truthRecovered:true};
 }
 const controls=[plant(false,0x19541501),plant(true,0x19541502)];return {register:D.size,train:train.length,test:test.length,anchors:anchors.map(g=>({i:g.i,lo:g.lo,w:g.w})),markerPositions:[...marked],controls,ordinary:recover(base,false),fhold:recover(base,true)};
}
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"))),null,2))}
