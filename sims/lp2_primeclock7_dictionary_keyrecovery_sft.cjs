/* Agent 9: exploratory seven-state plaintext-prime clock key recovery. */
const fs = require('node:fs');
const experiment = function experiment(ct,tx,lex,plain){
const corpus=JSON.parse(ct),runeMap=new Map(corpus.runes.map((x,i)=>[x,i])),pages=tx.split("%");
const mod=(x,m)=>(x%m+m)%m,q=7,weights=corpus.prime.map(x=>x%q);
const aliases=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const tokenMap=new Map(aliases.map((x,i)=>[x,i]));for(const [x,i] of [["ING",21],["IO",27],["K",5],["V",1],["Z",15]])tokenMap.set(x,i);
const tokens=[...tokenMap.keys()].sort((a,b)=>b.length-a.length);
function encode(w){let out=[];w=w.toUpperCase();while(w.length){const t=tokens.find(t=>w.startsWith(t));if(!t)return null;out.push(tokenMap.get(t));w=w.slice(t.length)}return out}
const id=a=>a.join(",");
function sourceWords(p){const i=p<50?p:p-1;const ws=pages[i].replace(/[/\s]/g,"").match(/[\u16a0-\u16ff]+/g).map(s=>Array.from(s,x=>runeMap.get(x)));if(id(ws.flat())!==id(corpus.pages[p].indices))throw Error("source mismatch "+p);return ws}
const wordMap=new Map();function add(a,freq,w){if(!a)return;const k=id(a),prev=wordMap.get(k);if(!prev||prev.freq<freq)wordMap.set(k,{a,freq,w})}
for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+) (\d+)$/);if(m)add(encode(m[1]),+m[2],m[1])}
for(const w of plain.split("### 56")[0].match(/[A-Z]+/g))add(encode(w),1,w.toLowerCase());
const ws57=sourceWords(57);for(const a of ws57)add(a,1,a.map(x=>aliases[x]).join("").toLowerCase());
const byLen=new Map();for(const v of wordMap.values()){if(!byLen.has(v.a.length))byLen.set(v.a.length,[]);byLen.get(v.a.length).push(v)}
function plant(ws,key){let s=0;return ws.map(w=>w.map(p=>{const c=mod(p+key[s],29);s=(s+weights[p])%q;return c}))}
function decode(ws,key,s=0){return ws.map(w=>w.map(c=>{let p=mod(c-key[s],29);s=(s+weights[p])%q;return p}))}
function extend(w,v,state){let k=state.k.slice(),s=state.s;for(let i=0;i<w.length;i++){let p=v.a[i],d=mod(w[i]-p,29);if(k[s]!==-1&&k[s]!==d)return null;k[s]=d;s=(s+weights[p])%q}return {k,s}}
function score(a){let known=0,runes=0,hit=0;for(const w of a){runes+=w.length;if(wordMap.has(id(w))){known++;hit+=w.length}}return {known,total:a.length,hit,runes,rate:runes?hit/runes:0}}
function attack(ws,anchor,expected=null){
ws=ws.slice(anchor);let active=[{k:Array(q).fill(-1),s:0}],complete=new Map(),history=[];
for(let i=0;i<Math.min(8,ws.length);i++){let next=new Map();for(let st of active)for(let v of byLen.get(ws[i].length)||[]){let n=extend(ws[i],v,st);if(!n)continue;if(n.k.every(x=>x>=0))complete.set(id(n.k),n.k);else next.set(id(n.k)+":"+n.s,n)}active=[...next.values()];history.push({word:i,partial:active.length,complete:complete.size});if(active.length>200000)throw Error("too many partials");if(!active.length)break}
let best=null;const n=Math.min(12,Math.max(8,Math.floor(ws.length/2)));
for(const k of complete.values()){let p=decode(ws,k),train=score(p.slice(0,n));if(!best||train.rate>best.train.rate||train.rate===best.train.rate&&train.known>best.train.known){best={k,train,holdout:score(p.slice(n)),preview:p.slice(0,18).map(w=>wordMap.get(id(w))?.w??w.map(x=>aliases[x]).join("")).join(" "),p}}}
return {anchor,history,candidates:complete.size,expectedPresent:expected?complete.has(id(expected)):null,best:best?{k:best.k,train:best.train,holdout:best.holdout,preview:best.preview,replay:id(plant(best.p,best.k).flat())===id(ws.flat()),exact:expected?id(best.k)===id(expected):null}:null}}
const controls=[];for(const key of [[3,21,24,12,14,1,2],[28,0,5,12,7,19,4],[1,6,21,5,27,11,9]])controls.push({key,...attack(plant(ws57,key),0,key)});
const originals=[];let longCount=0,compatibleCount=0;let hist={};for(let p=0;p<56;p++){if(p===50)continue;const ws=sourceWords(p);for(let a=1;a<ws.length-1;a++){if(ws[a].length<9)continue;longCount++;let first=(byLen.get(ws[a].length)||[]).filter(v=>extend(ws[a],v,{k:Array(q).fill(-1),s:0}));hist[ws[a].length]??={words:0,compatible:0};hist[ws[a].length].words++;if(first.length){compatibleCount++;hist[ws[a].length].compatible++;if(ws.length-a>=12)originals.push({page:p,length:ws[a].length,first:first.length,...attack(ws,a)})}}}
return {weights,lexicon:wordMap.size,controls,longCount,compatibleCount,hist,originals};
};
const paths = ["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
console.log(JSON.stringify(experiment(...paths.map(p => fs.readFileSync(p, 'utf8'))), null, 2));
