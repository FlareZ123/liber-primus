'use strict';
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,q=8;
 const chart=gp.translit.map(x=>x.length),map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);
 }
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of ["A","I","O"])variants(s);for(const sec of solved)for(const w of sec)add(w);
 const tries=dict.map(d=>{const root={e:new Map()};for(const w of d.values()){let n=root;for(const x of w){if(!n.e.has(x))n.e.set(x,{e:new Map()});n=n.e.get(x);}}return root;});

 const spiral=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 const tape=Array.from(spiral.join(""),Number);
 const begin=gp.pages.slice(0,15).reduce((a,p)=>a+p.indices.length,0)+20,end=gp.pages.slice(0,23).reduce((a,p)=>a+p.indices.length,0);
 let off=0;const words=originalWords.filter(w=>{const old=off;off+=w.length;return old>=begin&&off<=end});
 assert(words.flat().length===1883&&String(words.flat())===String(gp.pages.slice(15,23).flatMap((p,i)=>p.indices.slice(i===0?20:0))),"chapter exact");
 function encode(ws,key){let i=0;return ws.map(w=>w.map(p=>p===0?0:mod(p+key[i++%key.length])))}
 function match(c,p){return p===0?c===0:mod(c-p)<=9}
 function relaxed(ws){let n=0,covered=0;const failures=[];for(const w of ws){const candidates=[...(dict[w.length]||new Map()).values()].filter(p=>p.every((v,i)=>match(w[i],v)));if(candidates.length){n++;covered+=w.length}else failures.push({index:failures.length?undefined:0,c:w.map(x=>gp.translit[x]).join(""),length:w.length});}return {words:ws.length,runes:ws.flat().length,compatibleWords:n,compatibleRunes:covered,failedWords:failures.length,examples:failures.slice(0,12)}}
 function exact(ws,key,lexical){let states=new Map([[0,{prev:null,word:null}]]),used=0,nodes=0;for(const w of ws){const next=new Map();for(const [phase,head] of states){function step(i,ph,word,trie){nodes++;if(i===w.length){if(!next.has(ph))next.set(ph,{prev:head,word:word.slice()});return}let c=w[i],p=mod(c-key[ph]);function branch(x,n){const child=lexical?trie.e.get(x):null;if(lexical&&!child)return;word.push(x);step(i+1,n,word,child);word.pop()}if(c===0)branch(0,ph);if(p!==0)branch(p,(ph+1)%key.length)}step(0,phase,[],lexical?tries[w.length]:null)}if(!next.size)return {complete:false,used,deadWord:used,deadRune:ws.slice(0,used).flat().length,nodes};states=next;used++}let st=states.values().next().value;const p=[];while(st.word){p.unshift(st.word);st=st.prev}assert(String(encode(p,key).flat())===String(ws.flat()),"replay");return {complete:true,used,nodes,finalStates:states.size,replay:true,plaintext:p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")}}
 function hidden(ws,period){let states=new Map([["0|"+Array(period).fill(-1).join(","),{phase:0,key:Array(period).fill(-1),head:null}]]),counts=[];for(const w of ws){let next=new Map();for(const st of states.values()){const k=st.key.slice();function rec(i,ph,trie,p){if(i===w.length){const id=ph+"|"+k.join(",");if(!next.has(id))next.set(id,{phase:ph,key:k.slice(),head:{word:p.slice(),prev:st.head}});return}const c=w[i];if(c===0&&trie.e.has(0)){p.push(0);rec(i+1,ph,trie.e.get(0),p);p.pop()}for(const [x,ch] of trie.e){if(x===0)continue;const d=mod(c-x);if(d>9||k[ph]>=0&&k[ph]!==d)continue;const old=k[ph];k[ph]=d;p.push(x);rec(i+1,(ph+1)%period,ch,p);p.pop();k[ph]=old}}rec(0,st.phase,tries[w.length],[])}states=next;counts.push(states.size);if(!states.size)break}return {states,counts}}
 const control=solved[3].slice(135),testKey=[3,8,4,1,9,0,7,2],plant=encode(control,testKey),first=plant.slice(0,38),held=plant.slice(38),learn=hidden(first,8);const ks=[...new Set([...learn.states.values()].map(v=>v.key.join(",")))];assert(ks.length===1&&ks[0]===testKey.join(","),"hidden q8 plant");const decoded=exact(plant,testKey,true);assert(decoded.complete&&decoded.plaintext===control.map(w=>w.map(x=>gp.translit[x]).join("")).join(" "),"native plant exact");const bound=relaxed(words),plantBound=relaxed(plant);assert(plantBound.failedWords===0,"plant support bound");
 const original=exact(words,tape,true),raw=exact(words,tape,false);
 return {tape:tape.join(""),tapeLength:tape.length,vocabulary:dict.reduce((a,d)=>a+d.size,0),source:{begin,end,runes:words.flat().length,words:words.length},plant:{hiddenKey:testKey,learned:ks,trainingRunes:first.flat().length,heldRunes:held.flat().length,counts:learn.counts,exactPlaintext:true,bound:plantBound},relaxed:bound,original,raw};
}

const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
