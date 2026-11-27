const fs=require('node:fs');
const ps=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","im-results/lp2-pollux-differential-continuation-output.json"];
const inputs=Object.fromEntries(ps.map(p=>[p,fs.readFileSync(p,'utf8')]));
const extend=function extend(inputs,ps){
const corpus=JSON.parse(inputs[ps[0]]),j=JSON.parse(inputs[ps[2]]);
const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ",codes=".- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..".split(" "),M=Object.fromEntries([...chars].map((v,i)=>[v,codes[i]]));
const word=w=>[...w].map(x=>M[x]).join("x"),rev=s=>[...s].reverse().join("");
const entries=inputs[ps[1]].split(/\r?\n/).map(l=>l.match(/^([a-z]+)\s+(\d+)$/)).filter(Boolean).map(m=>m[1].toUpperCase()).filter(w=>w.length>1||["A","I","O"].includes(w)).map(w=>[word(w),w]);
const full=new Map(entries),pre=new Set(),suf=new Set();for(const [v] of entries)for(let i=1;i<=v.length;i++){pre.add(v.slice(0,i));suf.add(v.slice(-i))}
const cache=new Map();
function possible(s){if(cache.has(s))return cache.get(s);let ok=false;if(!s.includes("xxx")&&!/[.-]{5}/.test(s)){const a=s.split("xx"),leftOpen=!!a[0],rightOpen=!!a.at(-1),seg=a.filter(Boolean);if(seg.length===1&&leftOpen&&rightOpen){ok=entries.some(([v])=>v.includes(seg[0]));}else if(seg.length>0){ok=seg.every((t,i)=>{const l=i===0&&leftOpen,r=i===seg.length-1&&rightOpen;if(l)return suf.has(t)||(t.startsWith("x")&&full.has(t.slice(1)));if(r)return pre.has(t)||(t.endsWith("x")&&full.has(t.slice(0,-1)));return full.has(t)})}}
cache.set(s,ok);return ok}
const seq=corpus.pages.filter(x=>x.page===54||x.page===55).flatMap(x=>x.indices),diff=seq.slice(1).map((x,i)=>(x-seq[i]+29)%29),preceding=diff.slice(0,-75);const out={};
for(const [mode,{fit}] of Object.entries(j)){const reverse=mode.includes("reverse");const a=[];for(const [rank,q] of fit.allKeys.entries()){if(!possible(q.visible))throw Error("base rejected "+rank);for(const missingTrit of [".","-","x"]){const dec=x=>x===18?missingTrit:q.sep>>x&1?"x":q.dots>>x&1?".":"-";const extra=preceding.map(dec).join("");let n=0,t=q.visible;for(let k=1;k<=extra.length;k++){const cand=reverse?q.visible+rev(extra.slice(-k)):extra.slice(-k)+q.visible;if(!possible(cand))break;n=k;t=cand}
a.push({rank:rank+1,missingTrit,n,visible:t,internal:t.split("xx").slice(1,-1).map(v=>full.get(v)),score:q.score})}}
a.sort((x,y)=>y.n-x.n||x.rank-y.rank);out[mode]={tested:a.length,max:a[0].n,winners:a.filter(q=>q.n===a[0].n).slice(0,10),top:a.filter(q=>q.rank===1),hist:Object.fromEntries([...new Set(a.map(q=>q.n))].sort((a,b)=>a-b).map(n=>[n,a.filter(q=>q.n===n).length]))}}
return out;
};
console.log(JSON.stringify(extend(inputs,ps),null,2));
