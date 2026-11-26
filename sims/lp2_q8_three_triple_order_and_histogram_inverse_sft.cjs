"use strict";
function run(raw,profile,source){
 const A="0123456789abcdefghijklmnopqrs",labels="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
 const mod=x=>(x+58)%29,check=(x,m)=>{if(!x)throw Error(m)},str=k=>k.map(x=>A[x]).join(""),canon=k=>Array.from({length:8},(_,i)=>str(k.slice(i).concat(k.slice(0,i)))).sort()[0],primitive=k=>![1,2,4].some(d=>k.every((x,i)=>x===k[(i+d)%8]));
 function* partitions(n,m=1){if(!n){yield [];return}for(let i=m;i<=n;i++)for(const p of partitions(n-i,i))yield [i,...p]}
 function* perms(h,p=[]){if(p.length===8){yield p;return}for(let i=0;i<h.length;i++)if(h[i]){h[i]--;yield*perms(h,p.concat(i));h[i]++}}
 function* orders(h){for(const k of perms(h.slice()))if(primitive(k)&&canon(k)===str(k))yield k}
 const sig=(k,o)=>Array.from({length:8},(_,j)=>o.map(d=>k[(j+d)%8]).join(",")).sort().join(";");
 const p=[[0,1],[0,2],[0,3],[0,4]],a=[0,1,2],b=[0,1,3],c=[0,1,4],gs=[p,[...p,a],[...p,a,b],[a,b],[a,b,c]];
 let count=0,tab=gs.map(g=>({offsets:g,ambiguousClasses:0,ambiguousOrders:0,witnesses:[]}));
 for(const h of partitions(8)){let maps=gs.map(()=>new Map());for(const k of orders(h)){count++;gs.forEach((g,j)=>{let s=g.map(o=>sig(k,o)).join("|");if(!maps[j].has(s))maps[j].set(s,[]);maps[j].get(s).push(k)})}maps.forEach((m,j)=>{for(const ks of m.values())if(ks.length>1){tab[j].ambiguousClasses++;tab[j].ambiguousOrders+=ks.length;tab[j].witnesses.push({h,ks})}})}
 check(count===11932&&tab[0].ambiguousClasses===16&&tab[2].ambiguousClasses===1&&!tab[4].ambiguousClasses,"population census");
 const norm=s=>s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 let dict=new Map(),pool=Array.from({length:40},()=>[]),freq=Array(40).fill(0);
 for(const line of raw.split(/\r?\n/)){let m=line.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;let w=norm(m[1]),ws=new Set();function f(i,s){if(i===w.length){ws.add(s);return}for(let j=0;j<29;j++)if(w.startsWith(labels[j],i))f(i+labels[j].length,s+A[j]);if(w.startsWith("ING",i))f(i+3,s+A[21])}f(0,"");for(const s of ws)dict.set(s,(dict.get(s)||0)+Number(m[2])/ws.size)}
 for(const [w,n] of dict){pool[w.length].push(w);freq[w.length]+=n}pool.forEach(w=>w.sort());check(dict.size===38910,"register");
 const donor=Array.from({length:40},()=>[]);for(let w of source.match(/[A-Za-z]+/g)||[]){w=norm(w);let s="";while(w.length){let t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0],j=labels.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(j>=0)s+=A[j];w=w.slice(t.length)}if(s.length&&s.length<40)donor[s.length].push(s)}
 const fit=profile.p54.body_groups.slice(0,47).map(w=>w.length),held=[11,...profile.p55.groups.slice(1).map(w=>w.length)];
 check(fit.length===47&&fit.reduce((a,b)=>a+b)===213&&held.length===17&&held.reduce((a,b)=>a+b)===86,"corrected profile");
 const prob=(w,weighted)=>0.05/29**w.length+(dict.has(w)?0.95*(weighted?dict.get(w)/freq[w.length]:1/pool[w.length].length):0);
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
 function shuffle(a,r,first=0){for(let i=a.length-1;i>first;i--){let j=first+r(i-first+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function maps(pi){let ip=[];pi.forEach((v,i)=>ip[v]=i);return {enc:Array.from({length:29},(_,d)=>pi.map(v=>ip[mod(v+d)])),dec:Array.from({length:29},(_,d)=>pi.map(v=>ip[mod(v-d)]))}}
 function enc(w,k,j,T){let s="";for(const x of w){let p=A.indexOf(x);if(!p)s+="0";else{s+=A[T.enc[k[j]][p]];j=(j+1)%8}}return s}
 function likelihood(cs,k,T,weighted,details=false){let total=0,post=details?new Map():null;function walk(i,j,w){if(i===cs.length){let q=prob(w,weighted)/8;total+=q;if(post)post.set(w,(post.get(w)||0)+q);return}let c=cs[i];if(!c)walk(i+1,j,w+"0");let p=T.dec[k[j]][c];if(p)walk(i+1,(j+1)%8,w+A[p])}for(let j=0;j<8;j++)walk(0,j,"");return details?{total,post}:total}
 const digits=w=>Array.from(w,x=>A.indexOf(x)),score=(C,k,T,w)=>C.reduce((s,c)=>s+Math.log(likelihood(c,k,T,w)),0);
 function plant(seed,kind,weighted){let r=rng(seed),pi=shuffle(Array.from({length:29},(_,i)=>i),r,1),T=maps(pi),v=shuffle(Array.from({length:28},(_,i)=>i+1),r),k=kind==="distinct"?v.slice(0,8):kind==="repeat-zero"?shuffle([0,0,v[0],v[0],v[1],v[1],v[2],v[3]],r):shuffle([0,0,0,v[0],v[0],v[0],v[0],v[0]],r);
 check(primitive(k),"primitive key");let by=weighted?donor:pool;
 const choose=ls=>ls.map(l=>{check(by[l].length,"length pool");return by[l][r(by[l].length)]});
 // Preserve exact length inventory. Use first plant attaining 3 visible F / 2 adjacent equalities, or nearest of 5000, and report which.
 let best=null;for(let i=0;i<5000;i++){let P=choose(fit),phase=P.map(()=>r(8)),C=P.map((w,j)=>enc(w,k,phase[j],T)),s=C.join(""),F=s.split("0").length-1,E=Array.from(s).filter((x,j)=>j&&x===s[j-1]).length,d=Math.abs(F-3)+Math.abs(E-2);if(!best||d<best.d)best={P,C,F,E,d,draw:i+1};if(!d)break}
 let H=choose(held),HC=H.map(w=>enc(w,k,r(8),T));return {seed,kind,weighted,pi,k,T,...best,H,HC}}
 const reports=[];
 for(const [j,kind] of ["distinct","repeat-zero","binary"].entries())for(const weighted of [false,true]){
 let z=plant(0x31b80000+j*16+Number(weighted),kind,weighted),C=z.C.map(digits),vals=[...new Set(z.k)].sort((a,b)=>a-b),h=vals.map(v=>z.k.filter(x=>x===v).length),truthScore=score(C,z.k,z.T,weighted),best=-Infinity,second=-Infinity,winners=[],higher=0,ties=0,tested=0;
 for(const a of orders(h)){let k=a.map(v=>vals[v]),s=score(C,k,z.T,weighted);tested++;if(s>truthScore+1e-8)higher++;if(Math.abs(s-truthScore)<1e-8)ties++;if(s>best+1e-8){second=best;best=s;winners=[k]}else if(Math.abs(s-best)<1e-8)winners.push(k);else if(s>second)second=s}
 check(winners.length,"winner");let k=winners[0],H=z.H.map((w,i)=>{let q=likelihood(digits(z.HC[i]),k,z.T,weighted,true),a=[...q.post].sort((a,b)=>b[1]-a[1]),truth=q.post.get(w)||0;let top=a[0],tol=Math.max(1e-30,top[1]*1e-10),n=a.filter(x=>Math.abs(x[1]-top[1])<=tol).length;return {truth:w,c:z.HC[i],map:top[0],truthMass:truth/q.total,truthRetained:truth>0,truthAtMAP:Math.abs(truth-top[1])<=tol&&truth>0,uniqueTruthMAP:n===1&&Math.abs(truth-top[1])<=tol&&truth>0,paths:a.length,runeMatches:Array.from(w).filter((x,j)=>x===top[0][j]).length}});
 reports.push({seed:z.seed,kind,source:weighted?"Shakespeare, TextBlob weighted decoder":"uniform TextBlob lexical oracle",fitVisibleF:z.F,fitAdjacentEqual:z.E,matchedExact:z.d===0,selectedDraw:z.draw,fitOov:z.P.filter(w=>!dict.has(w)).length,holdOov:z.H.filter(w=>!dict.has(w)).length,actualKey:z.k,oracleCycle:z.pi,orders:tested,rank:higher+1,truthTies:ties,topTies:winners.length,exact:canon(k)===canon(z.k)&&winners.length===1,winningKey:k,bestGap:best-second,truthGap:best-truthScore,held:{truthRetained:H.filter(x=>x.truthRetained).length,truthAtMAP:H.filter(x=>x.truthAtMAP).length,uniqueTruthMAP:H.filter(x=>x.uniqueTruthMAP).length,runeMatches:H.reduce((a,x)=>a+x.runeMatches,0),words:H}})
 }
 return {schema:"q8-three-triple-order-histogram-inverse-v1",population:{orders:count,tab},geometry:{fit,held},dictionary:dict.size,controls:reports};
}
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8")),fs.readFileSync("resources/control/shakespeare_first300k.txt","utf8")),null,2))}
module.exports={run};
