'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,grid,transcript,shakespeare,gibran){
const check=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29;
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const runeMap=new Map(corpus.runes.map((x,i)=>[x,i]));
const tape=corpus.pages.slice(0,56).flatMap(x=>x.indices);
const words=transcript.split("%").slice(0,-2).join("").replace(/[\/\r\n&$]/g,"").split(/[.\-]/).map(w=>[...w].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c))).filter(x=>x.length);
check(equal(words.flat(),tape),"source mismatch");
const trainTarget=corpus.pages.slice(0,40).reduce((s,x)=>s+x.indices.length,0);
let cut=0;for(const w of words){if(cut+w.length>trainTarget)break;cut+=w.length}
const lens=words.map(w=>w.length),start=new Uint8Array(tape.length),end=new Uint8Array(tape.length);let off=0;for(const n of lens){start[off]=1;end[off+n-1]=1;off+=n}
const alphabet=corpus.translit.map((token,id)=>({token,id})).sort((a,b)=>b.token.length-a.token.length);
const native=word=>{const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3;continue;}if(s.startsWith("IO",i)){a.push(27);i+=2;continue;}const h=alphabet.find(x=>s.startsWith(x.token,i));check(h,"native "+s);a.push(h.id);i+=h.token.length}return a};
const nativeWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(native);
const init=Array(29).fill(1),bi=Array.from({length:29},()=>Array(29).fill(1)),dictionary=new Set();
for(const w of nativeWords(shakespeare)){dictionary.add(w.join(","));init[w[0]]++;for(let i=1;i<w.length;i++)bi[w[i-1]][w[i]]++}
const lognorm=a=>{const n=a.reduce((s,x)=>s+x,0);return a.map(x=>Math.log(x/n))};
const U=lognorm(init),B=bi.map(lognorm);
const pools=new Map();for(const w of nativeWords(gibran)){if(!pools.has(w.length))pools.set(w.length,[]);pools.get(w.length).push(w)}
let rng=0x50330184;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
const T=grid.bytes;check(T.length===256,"table size");
const step=(s,c,mode)=>mode==="XOR"?(T[s]^c):((T[s]+c)&255);
const states=(c,mode)=>{let s=84;return c.map(x=>{const old=s;s=step(s,x,mode);return old})};
const encode=(p,key,mode)=>{let s=84;return p.map(x=>{const c=mod(x+key[s]);s=step(s,c,mode);return c})};
const decode=(c,key,mode)=>{const S=states(c,mode);return c.map((x,i)=>mod(x-key[S[i]]))};
const ioc=a=>{let n=Array(29).fill(0);a.forEach(x=>n[x]++);return n.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
function measure(p,lo,hi){let ll=0,hits=0,wordHits=0,numWords=0,wordStart=lo;for(let i=lo;i<hi;i++){ll+=start[i]?U[p[i]]:B[p[i-1]][p[i]];if(end[i]){const w=p.slice(wordStart,i+1);if(dictionary.has(w.join(","))){hits+=w.length;wordHits++}numWords++;wordStart=i+1}}return{ll:ll/(hi-lo),coverage:hits/(hi-lo),wordHits,numWords,ioc:ioc(p.slice(lo,hi)),prefix:p.slice(lo,lo+100).map(x=>corpus.translit[x]).join("")}}
function fit(c,mode){
const S=states(c,mode),groups=Array.from({length:256},()=>[]);
for(let i=0;i<cut;i++)groups[S[i]].push(i);
const initKey=groups.map(g=>{let best=-Infinity,k=0;for(let a=0;a<29;a++){let v=0;for(const i of g)v+=U[mod(c[i]-a)];if(v>best){best=v;k=a}}return k});
let winner=null;
for(let restart=0;restart<6;restart++){
const key=initKey.map(x=>restart===0?x:(rand()%100<45?rand()%29:x));
const p=c.slice(0,cut).map((x,i)=>mod(x-key[S[i]]));
for(let pass=0;pass<30;pass++){
let changed=0;const order=Array.from({length:256},(_,i)=>i);for(let j=255;j>0;j--){const k=rand()%(j+1);[order[j],order[k]]=[order[k],order[j]]}
for(const s of order){const g=groups[s];if(!g.length)continue;let best=-Infinity,k=key[s];
for(let a=0;a<29;a++){
let v=0;for(const i of g){const x=mod(c[i]-a);v+=start[i]?U[x]:B[S[i-1]===s?mod(c[i-1]-a):p[i-1]][x];if(!end[i]&&i+1<cut&&S[i+1]!==s)v+=B[x][p[i+1]]}
if(v>best+1e-10){best=v;k=a}}
if(k!==key[s]){changed++;key[s]=k;for(const i of g)p[i]=mod(c[i]-k)}}
if(!changed)break;
}
let ll=measure(p,0,cut).ll;if(!winner||ll>winner.ll)winner={key:[...key],ll}
}
return {...winner,coverageStates:groups.filter(g=>g.length).length};
}
function evaluate(c,mode,trueKey=null,plain=null){const found=fit(c,mode),p=decode(c,found.key,mode);check(equal(encode(p,found.key,mode),c),"replay");const s=states(c,mode),trainStates=new Set(s.slice(0,cut));return{mode,train:measure(p,0,cut),holdout:measure(p,cut,p.length),coverageStates:found.coverageStates,unseenHoldout:s.slice(cut).filter(x=>!trainStates.has(x)).length,keyAccuracy:trueKey?[...trainStates].filter(x=>trueKey[x]===found.key[x]).length/trainStates.size:null,holdoutRuneAccuracy:plain?p.slice(cut).filter((x,i)=>x===plain[cut+i]).length/(p.length-cut):null,key:found.key}}
const plants=[];for(const mode of ["XOR","ADD"]){const p=lens.flatMap(n=>{const pool=pools.get(n);check(pool?.length,"word pool "+n);return pool[rand()%pool.length]});const key=Array.from({length:256},()=>rand()%29);plants.push(evaluate(encode(p,key,mode),mode,key,p));}
const original=["XOR","ADD"].map(mode=>evaluate(tape,mode));
return {n:tape.length,words:words.length,train:cut,holdout:tape.length-cut,plants,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
const input=files.map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(input[0]),JSON.parse(input[1]),...input.slice(2)),null,2));
