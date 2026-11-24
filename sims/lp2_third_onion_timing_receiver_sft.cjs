"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(data,corpus,transcript,shakespeare){
 const check=(x,m)=>{if(!x)throw Error(m)};
 const bytes=data.hex.match(/../g).map(x=>parseInt(x,16)),rows=data.rows,mod=x=>(x%29+29)%29;
 const intervals=new Map(),gaps=[];
 for(let i=0;i<rows.length;i++){const x=rows[i],p=rows[i-1],b=bytes.slice(0,x.length);check(b.reduce((a,b)=>a+b,0)/b.length===x.avg&&Math.min(...b)===x.min&&Math.max(...b)===x.max,"prefix "+x.length);if(!p)continue;const d=(Date.parse(x.ts)-Date.parse(p.ts))/1000;check(d===x.delta,"timestamp delta");if(x.length===p.length+1&&Math.abs(d-60*Math.round(d/60))<=2)intervals.set(x.length,Math.round(d/60));else gaps.push([p.length,x.length,d]);}
 const pads=[];
 for(const [start,end,unit] of [[17,132,1],[17,120,3],[121,132,1],[136,180,1],[183,256,1]]){
  const observations=Array.from({length:end-start+1},(_,i)=>{const n=start+i,k=intervals.get(n)/unit;check(Number.isInteger(k),"missing interval "+n);return [bytes[n-1],k]});
  for(const [label,fn] of [["k",(b,k)=>k],["xor",(b,k)=>b^k],["plus",(b,k)=>(b+k)&255],["minus",(b,k)=>(b-k)&255]])pads.push({start,end,unit,label,key:observations.map(x=>mod(fn(...x)))});
 }
 const map=new Map(corpus.runes.map((x,i)=>[x,i])),alphabet=corpus.translit.map((token,id)=>({token,id})).sort((a,b)=>b.token.length-a.token.length);
 const native=word=>{const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}let h=alphabet.find(x=>s.startsWith(x.token,i));check(h,"GP");out.push(h.id);i+=h.token.length;}return out};
 const dictionary=new Set(),unigram=Array(29).fill(1),bigram=Array.from({length:29},()=>Array(29).fill(1)),pool=new Map();
 for(const w of shakespeare.match(/[A-Za-z]+/g)){const x=native(w);dictionary.add(x.join(","));if(!pool.has(x.length))pool.set(x.length,[]);pool.get(x.length).push(x);for(let i=0;i<x.length;i++){unigram[x[i]]++;if(i)bigram[x[i-1]][x[i]]++;}}
 const total=unigram.reduce((a,b)=>a+b),u=unigram.map(v=>Math.log(v/total)),b=bigram.map(row=>{const t=row.reduce((a,v)=>a+v);return row.map(v=>Math.log(v/t));});
 const score=(x,lengths)=>{let k=0,hits=0,ll=0;for(const n of lengths){if(dictionary.has(x.slice(k,k+n).join(",")))hits+=n;for(let i=0;i<n;i++)ll+=i?b[x[k+i-1]][x[k+i]]:u[x[k+i]];k+=n;}check(k===x.length,"length");return {value:(ll+4*hits)/k,coverage:hits/k};};
 const segments=transcript.split("%").map(s=>s.replace(/[\/\r\n]/g,"").split(/[^ᚠ-᛿]+/u).filter(Boolean).map(w=>[...w].map(x=>map.get(x)))).filter(w=>w.length);
 const pages=[];let j=0;
 for(let n=0;n<56;n++){const c=corpus.pages[n].indices;if(c.length===0)continue;const words=segments[j++];check(words.flat().join(",")===c.join(","),"transcript alignment "+n);const lengths=words.map(x=>x.length);let cut=0,cutWords=0;while(cut<60&&cutWords<lengths.length)cut+=lengths[cutWords++];if(cut>=c.length)continue;pages.push({n,c,lengths,cut,cutWords});}
 const decode=(c,pad,phase,sgn,limit=c.length)=>{let x=new Array(limit);for(let i=0;i<limit;i++){let a=pad[(i+phase)%pad.length];x[i]=sgn===0?mod(c[i]-a):sgn===1?mod(c[i]+a):mod(a-c[i]);}return x};
 const solve=(page,allPads)=>{let best=null,tests=0;for(const pad of allPads)for(let phase=0;phase<pad.key.length;phase++)for(let sign=0;sign<3;sign++){const x=decode(page.c,pad.key,phase,sign,page.cut),s=score(x,page.lengths.slice(0,page.cutWords));tests++;if(!best||s.value>best.train.value)best={pad,phase,sign,train:s};}const x=decode(page.c,best.pad.key,best.phase,best.sign),held=score(x.slice(page.cut),page.lengths.slice(page.cutWords));let at=0;const words=page.lengths.map(n=>{let w=x.slice(at,at+n).map(v=>corpus.translit[v]).join("");at+=n;return w});let {key,...label}=best.pad;return {page:page.n,tests,...label,phase:best.phase,sign:best.sign,train:best.train,held,preview:words.slice(0,30).join(" ")};};
 const outputs=pages.map(p=>solve(p,pads));
 const pg=pages[0],plain=pg.lengths.flatMap((n,i)=>{let a=pool.get(n);check(a?.length,"plant words");return a[(i*23+41)%a.length]});
 const pk=pads.find(x=>x.start===183&&x.label==="xor"),phase=19,planted=plain.map((x,i)=>mod(x+pk.key[(i+phase)%pk.key.length])),plant=solve({...pg,c:planted},pads);
 check(decode(planted,pk.key,phase,0).join(",")===plain.join(","),"plant replay");
 return {rows:rows.length,observed:intervals.size,gaps,pages:pages.length,tests:outputs.reduce((a,b)=>a+b.tests,0),bestTraining:[...outputs].sort((a,b)=>b.train.value-a.train.value).slice(0,5),bestHoldout:[...outputs].sort((a,b)=>b.held.value-a.held.value).slice(0,5),plant,outputs};
}
const files=["resources/external/2014-third-onion-timing.json","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt"];
const a=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),JSON.parse(a[1]),a[2],a[3]),null,2));
