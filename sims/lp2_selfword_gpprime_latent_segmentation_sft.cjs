'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function experiment(raw){
 const g=JSON.parse(raw[0]),native=JSON.parse(raw[2]),idx=new Map(g.runes.map((x,i)=>[x,i])),alpha=new Map(g.translit.map((x,i)=>[x,i])),weights=g.prime,syms="0123456789ABCDEFGHIJKLMNOPQRS";
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const words=parse(raw[1].replace(/[\s/%]/g,"")).slice(0,2896),C=words.flat();if(C.length!==12956||C.join()!==g.pages.slice(0,56).flatMap(p=>p.indices).join())throw Error("source mismatch");
 const ps=[];for(let n=2;ps.length<6000;n++){let ok=true;for(const p of ps){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)ps.push(n)}
 const mod=x=>(x%29+29)%29, encode=w=>{let k=w.reduce((s,x)=>s+weights[x],0);return w.map(x=>x===0?0:mod(x+ps[k++-1]-1))};
 const key=w=>w.map(x=>syms[x]).join("");const dict=new Map();
 function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){const t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m){const v=[];variants(m[1],w=>v.push(w));for(const w of v){const k=key(w);dict.set(k,(dict.get(k)||0)+Number(m[2])/v.length)}}}
 const nativeWords=native.sections.map(s=>({name:s.name,words:parse(s.source_text)}));for(const s of nativeWords)for(const w of s.words){const k=key(w);if(!dict.has(k))dict.set(k,1)}
 if(dict.size!==38938)throw Error("dictionary count "+dict.size);
 const singletonSet=new Set(nativeWords.flatMap(s=>s.words.filter(w=>w.length===1).map(key)));
 const trie={next:new Map(),out:[]};let mass=0,kept=0,maxLen=0;
 for(const [k,f] of dict){if(k.length===1&&!singletonSet.has(k))continue;mass+=f;kept++;maxLen=Math.max(maxLen,k.length);const w=[...k].map(x=>syms.indexOf(x));let t=trie;for(const x of encode(w)){if(!t.next.has(x))t.next.set(x,{next:new Map(),out:[]});t=t.next.get(x)}t.out.push({w:k,f})}
 function decode(c){
 const n=c.length,gap=new Int32Array(n+1).fill(1e9),cost=new Float64Array(n+1).fill(Infinity),prev=new Int32Array(n+1).fill(-1),word=Array(n+1).fill(null),reachable=new Uint8Array(n+1);gap[0]=0;cost[0]=0;reachable[0]=1;let last=0;
 function relax(j,i,g,s,w){if(g<gap[j]||(g===gap[j]&&s<cost[j])){gap[j]=g;cost[j]=s;prev[j]=i;word[j]=w}}
 for(let i=0;i<n;i++){relax(i+1,i,gap[i]+1,cost[i],null);let t=trie;for(let j=i;j<n&&j<i+maxLen;j++){t=t.next.get(c[j]);if(!t)break;if(!t.out.length)continue;if(reachable[i]){reachable[j+1]=1;last=Math.max(last,j+1)}for(const o of t.out)relax(j+1,i,gap[i],cost[i]-Math.log(o.f/mass),o.w)}}
 const result=[];for(let j=n;j>0;j=prev[j])result.push({start:prev[j],end:j,w:word[j]});result.reverse();
 const replay=result.every(r=>r.w===null||key(encode([...r.w].map(x=>syms.indexOf(x))))===key(c.slice(r.start,r.end)));if(!replay)throw Error("replay");
 return {length:n,exact:reachable[n]===1,longestExactPrefix:last,minimumUncovered:gap[n],costPerCoveredRune:cost[n]/Math.max(1,n-gap[n]),tokens:result.length,decoded:result.map(r=>r.w===null?"?":r.w).join(" "),result};
 }
 const target=decode(C);const controls=nativeWords.map(s=>{const truth=s.words.flat(),c=s.words.flatMap(encode),d=decode(c);const pred=d.result.flatMap(r=>r.w===null?[-1]:[...r.w].map(x=>syms.indexOf(x)));return {name:s.name,length:c.length,exact:d.exact,minimumUncovered:d.minimumUncovered,costPerCoveredRune:d.costPerCoveredRune,correctRunes:pred.filter((x,i)=>x===truth[i]).length,correctBoundaries:d.result.filter(r=>r.w!==null&&new Set(s.words.reduce((a,w)=>[...a,a[a.length-1]+w.length],[0])).has(r.end)).length,truthWords:s.words.length,tokens:d.tokens}});
 let state=20261125;function rand(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state}
 const nulls=[];for(let j=0;j<8;j++){const c=Array.from({length:C.length},()=>rand()%29);const d=decode(c);nulls.push({minimumUncovered:d.minimumUncovered,longestExactPrefix:d.longestExactPrefix,costPerCoveredRune:d.costPerCoveredRune})}
 const sections=[];let start=0;for(const [lo,hi] of [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]]){const c=g.pages.slice(lo,hi+1).flatMap(p=>p.indices);const d=decode(c);sections.push({pages:[lo,hi],length:c.length,minimumUncovered:d.minimumUncovered,longestExactPrefix:d.longestExactPrefix,costPerCoveredRune:d.costPerCoveredRune});start+=c.length}if(start!==C.length)throw Error("chapter total");
 return {dictionary:dict.size,retained:kept,singletons:[...singletonSet].sort(),maxLen,target:{...target,result:undefined},controls,nulls,sections};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const shas=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7","1b064ef6d85819b7d96adaff31a82d1ec551598f","140e1d22b5f8c45deddd2e8b25549d9d6307d938"];
const raw=paths.map((p,i)=>{const b=fs.readFileSync(path.resolve(__dirname,'..',p));if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==shas[i])throw Error(p);return b.toString('utf8')});
console.log(JSON.stringify(experiment(raw),null,2));
