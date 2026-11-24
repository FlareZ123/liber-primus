/* Agent 9: sparse independent-anchor key recovery for a 13-state GP prime clock. */
const fs = require('node:fs');
const experiment = function experiment(ct,tx,lex,plain) {
 const corpus=JSON.parse(ct),runeMap=new Map(corpus.runes.map((x,i)=>[x,i])),pages=tx.split("%");
 const q=13,weights=corpus.prime.map(x=>x%q),mod=(x,m)=>(x%m+m)%m,aliases=corpus.translit;
 const tokenMap=new Map(aliases.map((x,i)=>[x,i]));for(const [x,i] of [["ING",21],["IO",27],["K",5],["V",1],["Z",15]])tokenMap.set(x,i);
 const tokens=[...tokenMap.keys()].sort((a,b)=>b.length-a.length),id=a=>a.join(",");
 function encode(w){w=w.toUpperCase();let a=[];while(w.length){let t=tokens.find(t=>w.startsWith(t));if(!t)return null;a.push(tokenMap.get(t));w=w.slice(t.length)}return a}
 function sourceWords(p){let i=p<50?p:p-1;let ws=pages[i].replace(/[/\s]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>Array.from(w,x=>runeMap.get(x)));if(id(ws.flat())!==id(corpus.pages[p].indices))throw Error("source mismatch "+p);return ws}
 const wordMap=new Map();function add(a,freq,w){if(!a)return;let k=id(a),prev=wordMap.get(k);if(!prev||prev.freq<freq)wordMap.set(k,{a,freq,w})}
 for(let l of lex.split(/\r?\n/)){let m=l.match(/^([a-z]+) (\d+)$/);if(m)add(encode(m[1]),+m[2],m[1])}
 for(let w of plain.split("### 56")[0].match(/[A-Z]+/g))add(encode(w),1,w.toLowerCase());
 const ws57=sourceWords(57);for(let a of ws57)add(a,1,a.map(x=>aliases[x]).join("").toLowerCase());
 const byLen=new Map();for(let v of wordMap.values()){if(!byLen.has(v.a.length))byLen.set(v.a.length,[]);byLen.get(v.a.length).push(v)}
 function partial(c,p){let k=Array(q).fill(-1),s=0;for(let i=0;i<c.length;i++){let d=mod(c[i]-p[i],29);if(k[s]!==-1&&k[s]!==d)return null;k[s]=d;s=(s+weights[p[i]])%q}return k}
 function mask(k){let m=0;for(let i=0;i<q;i++)if(k[i]>=0)m|=1<<i;return m}
 function pop(m){let n=0;while(m){m&=m-1;n++}return n}
 function rotate(k,r){return Array.from({length:q},(_,i)=>k[mod(i-r,q)])}
 function canon(k){let best=id(k),v=k;for(let r=1;r<q;r++){let b=rotate(k,r),s=id(b);if(s<best){best=s;v=b}}return v}
 function candidates(c){let out=new Map();for(let v of byLen.get(c.length)||[]){let k=partial(c,v.a);if(k&&pop(mask(k))>=7)out.set(id(k),{k,m:mask(k),word:v.w})}return [...out.values()]}
 function plant(ws,k,s=0){return ws.map(w=>w.map(p=>{let c=mod(p+k[s],29);s=(s+weights[p])%q;return c}))}
 function decode(ws,k,s=0){return ws.map(w=>w.map(c=>{let p=mod(c-k[s],29);s=(s+weights[p])%q;return p}))}
 function score(ws){let hit=0,runes=0,known=0;for(let w of ws){runes+=w.length;if(wordMap.has(id(w))){hit+=w.length;known++}}return {hit,runes,known,words:ws.length,rate:runes?hit/runes:0}}
 function holdout(ws,k,expected){let best=null;for(let s=0;s<q;s++){let p=decode(ws,k,s),tr=score(p.slice(0,5));if(!best||tr.rate>best.training.rate){best={state:s,training:tr,holdout:score(p.slice(5)),full:score(p),preview:p.slice(0,12).map(w=>wordMap.get(id(w))?.w??w.map(x=>aliases[x]).join("")).join(" "),replay:id(plant(p,k,s).flat())===id(ws.flat()),exactPlain:expected?id(p.flat())===id(expected.flat()):null}}}return best}
 function supports(c,k){for(let s=0;s<q;s++)if(wordMap.has(id(decode([c],k,s)[0])))return true;return false}
 function recover(anchors,heldouts,expected=null){
  const ac=anchors.map(a=>({...a,v:candidates(a.c)}));const rotations=ac.map(a=>a.v.flatMap(v=>Array.from({length:q},(_,r)=>{let k=rotate(v.k,r);return {k,m:mask(k)}})));
  let keys=new Map(),pairComparisons=0,compatiblePairs=0,fullPairs=0,oneMissingPairs=0;
  for(let i=0;i<ac.length;i++)for(let j=i+1;j<ac.length;j++)for(let a of ac[i].v)for(let b of rotations[j]){
   const common=a.m&b.m,union=a.m|b.m;if(pop(common)<4||pop(union)<12)continue;pairComparisons++;
   let eq=true;for(let m=common;m;m&=m-1){let idx=31-Math.clz32(m&-m);if(a.k[idx]!==b.k[idx]){eq=false;break}}
   if(!eq)continue;compatiblePairs++;let k=a.k.map((v,x)=>v>=0?v:b.k[x]),missing=k.indexOf(-1);
   if(missing<0){fullPairs++;let v=canon(k);keys.set(id(v),v)}else{oneMissingPairs++;for(let x=0;x<29;x++){k[missing]=x;let v=canon(k);keys.set(id(v),v)}}
  }
  let bestSupport=-1,best=[],supportHist={};for(let k of keys.values()){let n=0;for(let a of ac)if(supports(a.c,k))n++;supportHist[n]=(supportHist[n]||0)+1;if(n>bestSupport){bestSupport=n;best=[k]}else if(n===bestSupport)best.push(k)}
  const exp=expected?canon(expected):null;let out={anchors:ac.length,compatibleAnchors:ac.filter(a=>a.v.length).length,candidatePartials:ac.reduce((s,a)=>s+a.v.length,0),pairComparisons,compatiblePairs,fullPairs,oneMissingPairs,keys:keys.size,supportHist,bestSupport,bestCount:best.length,expectedPresent:exp?keys.has(id(exp)):null,expectedUniqueWinner:exp&&best.length===1?id(exp)===id(best[0]):null};
  if(best.length&&best.length<=32)out.best=best.map(k=>({k,holdouts:heldouts.map(h=>({label:h.label,...holdout(h.ws,k,h.expected)}))}));return out
 }
 const train=[];for(let p=0;p<40;p++){let ws=sourceWords(p);for(let a=1;a<ws.length-1;a++)if(ws[a].length>=10)train.push({p,a,c:ws[a]})}
 const controls=[],anchorWords=["CIRCUMFERENCE","CONSCIOUSNESS","PRESERVATION","INSTRUCTION","UNREASONABLE","ENLIGHTENED","INTELLIGENCE","PILGRIMAGE","ULTIMATELY","CONSUMPTION","PRESERVING","EXPERIENCE"];
 for(let key of [[3,21,24,12,14,1,2,18,8,16,5,27,0],[28,0,5,12,7,19,4,1,8,23,9,14,17],[1,6,21,5,27,11,9,3,20,24,4,28,16]]){
  const anchors=anchorWords.map((w,i)=>({c:plant([encode(w)],key,(i*5+2)%q)[0]}));controls.push({key,...recover(anchors,[{label:"solved-p57",ws:plant(ws57,key,7),expected:ws57}],key)})
 }
 const original=recover(train,[{label:"p40",ws:sourceWords(40)},{label:"p54",ws:sourceWords(54)},{label:"p55",ws:sourceWords(55)}]);
 if(!controls.every(x=>x.expectedUniqueWinner&&x.best[0].holdouts[0].exactPlain&&x.best[0].holdouts[0].replay))throw Error("native positive control failed");
 return {q,lexicon:wordMap.size,weights,controls,original};
};
const paths = ["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
console.log(JSON.stringify(experiment(...paths.map(p => fs.readFileSync(p, 'utf8'))), null, 2));
