"use strict";
// Agent 5: finite arbitrary-schedule inverse envelope for the p7 five-product shift bank.
// Run: node sims/lp2_p7_five_shift_bank_arbitrary_schedule_sft.cjs
const fs=require("node:fs"), path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/blake_song_of_liberty_train.txt"
];
function experiment(corpus,transcript,solved,lexicalSources){
 const mod=x=>(x%29+29)%29, R=[11,26,8,15,2], idx=new Map(corpus.runes.map((r,i)=>[r,i])), check=(x,m)=>{if(!x)throw Error(m)};
 let words=[],w=[],offset=0,start=0;for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c)){if(!w.length)start=offset;w.push(idx.get(c));offset++}else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push({start,w});w=[];}}if(w.length)words.push({start,w});
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);check(words.length===2896&&JSON.stringify(tape)===JSON.stringify(words.flatMap(x=>x.w)),"source");
 let i=0;const bounds=corpus.pages.filter(p=>p.page<=55).map(p=>{let a=i;i+=p.indices.length;return {page:p.page,start:a,end:i}}), p7=bounds.find(x=>x.page===7), p8=bounds.find(x=>x.page===8);
 const header=words.filter(x=>x.start>=p7.end-14&&x.start+x.w.length<=p7.end);check(header.length===5&&JSON.stringify(header.map(x=>x.w.reduce((a,b)=>a*b%29,1)))===JSON.stringify(R),"p7 bank");
 const native=solved.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)))}));
 const nativeSingletons=[...new Set(native.flatMap(x=>x.words.filter(w=>w.length===1).flat()))].sort((a,b)=>a-b), singletonSet=[...new Set([...nativeSingletons,3])].sort((a,b)=>a-b);
 const options=(c,sign,hold)=>[...new Set([...R.map(k=>mod(c-sign*k)).filter(p=>!hold||p!==0),...(hold&&c===0?[0]:[])])];
 const sections=[{name:"p8 body",start:p8.start+12,end:p8.end},{name:"p8–14",start:p8.start+12,end:bounds.find(x=>x.page===14).end},{name:"p8–55",start:p8.start+12,end:tape.length},{name:"p0–55",start:0,end:tape.length}];
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function minCover(cs,sign,hold){let masks=cs.map(c=>options(c,sign,hold).reduce((a,p)=>a|(1<<p),0));let best=29,witness=0,seen=new Set();function dfs(mask){if(seen.has(mask)||pop(mask)>=best)return;seen.add(mask);let m=0,n=30;for(const p of masks){if(p&mask)continue;let z=pop(p);if(z<n){n=z;m=p}}if(!m){best=pop(mask);witness=mask;return}for(let k=0;k<29;k++)if(m&(1<<k))dfs(mask|(1<<k));}dfs(0);return {minimum:best,witness:Array.from({length:29},(_,i)=>i).filter(i=>witness&(1<<i)),nodes:seen.size}}
 function singletonStats(ws,sign,hold){const cs=ws.filter(x=>x.w.length===1).map(x=>x.w[0]);return {count:cs.length,distinct:[...new Set(cs)].sort((a,b)=>a-b),bad:cs.filter(c=>!options(c,sign,hold).some(p=>singletonSet.includes(p))).length,badTypes:[...new Set(cs.filter(c=>!options(c,sign,hold).some(p=>singletonSet.includes(p))))].sort((a,b)=>a-b),...minCover([...new Set(cs)],sign,hold)}}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3}else if(s.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>s.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}return a}
 const lexBase=new Map();function add(map,w){if(!w.length)return;let m=map.get(w.length);if(!m)map.set(w.length,m=new Map());m.set(w.join(","),w)}
 for(const text of lexicalSources)for(const word of text.match(/[A-Za-z]+/g)||[])add(lexBase,encode(word));
 function lexicon(exclude){const map=new Map([...lexBase].map(([k,v])=>[k,new Map(v)]));for(const s of native){if(s.name===exclude)continue;for(const w of s.words)add(map,w)}return new Map([...map].map(([k,v])=>[k,[...v.values()]]))}
 function lexStats(ws,sign,hold,lex){let out=[],total=0,matched=0,long=0,longMatched=0;const sets=Array.from({length:29},(_,c)=>options(c,sign,hold).reduce((a,p)=>a|(1<<p),0));for(const {w,start} of ws){if(w.length<2)continue;total++;if(w.length>=5)long++;let n=0;for(const p of lex.get(w.length)||[])if(p.every((v,j)=>sets[w[j]]&(1<<v)))n++;if(n){matched++;if(w.length>=5)longMatched++}else out.push({start,length:w.length,c:w});}return {total,matched,long,longMatched,unmatched:out}}
 function train(exclude){const n=29, tri=new Float64Array(n*n*n).fill(.1),bi=new Float64Array(n*n).fill(2.9),uni=new Float64Array(n).fill(.1);let total=2.9;for(const s of native){if(s.name===exclude)continue;const t=s.words.flat();for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i>=2){tri[(t[i-2]*n+t[i-1])*n+t[i]]++;bi[t[i-2]*n+t[i-1]]++}}}for(let i=0;i<tri.length;i++)tri[i]=Math.log(tri[i]/bi[Math.floor(i/n)]);return {tri,uni:uni.map(x=>Math.log(x/total))}}
 function decode(c,sign,hold,m){let cur=new Float64Array(841).fill(-Infinity),prevs=[];for(const a of options(c[0],sign,hold))for(const b of options(c[1],sign,hold))cur[a*29+b]=m.uni[a]+m.uni[b];for(let i=2;i<c.length;i++){let next=new Float64Array(841).fill(-Infinity),back=new Int8Array(841).fill(-1);for(let ab=0;ab<841;ab++){if(!Number.isFinite(cur[ab]))continue;for(const d of options(c[i],sign,hold)){let bd=(ab%29)*29+d,v=cur[ab]+m.tri[ab*29+d];if(v>next[bd]){next[bd]=v;back[bd]=Math.floor(ab/29)}}}cur=next;prevs.push(back)}let j=cur.indexOf(Math.max(...cur)),out=Array(c.length);out[c.length-2]=Math.floor(j/29);out[c.length-1]=j%29;for(let i=c.length-1;i>=2;i--){let a=prevs[i-2][j];out[i-2]=a;j=a*29+Math.floor(j/29)}check(out.every((p,i)=>options(c[i],sign,hold).includes(p)),"inverse path");return {score:Math.max(...cur)/c.length,out}}
 function plant(p,sign,hold,seed){let s=seed>>>0;const rng=()=>s=(Math.imul(s,1664525)+1013904223)>>>0;let c=[],state=[],attempts=0,repeats=0;for(const a of p){if(hold&&a===0){c.push(0);state.push(null);continue}let k=R[rng()%5],b=mod(a+sign*k);if(b===c.at(-1)){attempts++;k=R[rng()%5];b=mod(a+sign*k);if(b===c.at(-1))repeats++}c.push(b);state.push(k)}check(c.every((x,i)=>state[i]===null?x===0&&p[i]===0:x===mod(p[i]+sign*state[i])),"forward");return {c,attempts,repeats}}
 const lex=lexicon(null),result={R,nativeSingletons,singletonSet,lexiconSize:[...lex.values()].reduce((n,a)=>n+a.length,0),sections:[],controls:[],p8:[]};
 for(const s of sections){let ws=words.filter(x=>x.start>=s.start&&x.start+x.w.length<=s.end);result.sections.push({...s,variants:[1,-1].flatMap(sign=>[false,true].map(hold=>({sign,hold,...singletonStats(ws,sign,hold)})))})}
 const ws=words.filter(x=>x.start>=p8.start+12&&x.start+x.w.length<=p8.end);
 for(const sign of [1,-1])for(const hold of [false,true]){let c=tape.slice(p8.start+12,p8.end),a=decode(c,sign,hold,train(null));result.p8.push({sign,hold,score:a.score,plaintext:a.out.map(x=>corpus.translit[x]).join(""),lex:lexStats(ws,sign,hold,lex)});for(const s of native.filter(s=>s.words.flat().length>=243)){const p=s.words.flat().slice(0,243),z=plant(p,sign,hold,3301+result.controls.length),d=decode(z.c,sign,hold,train(s.name));check(p.every((x,i)=>options(z.c[i],sign,hold).includes(x)),"true path excluded");let offset=0;const cwords=[];for(const w of s.words){if(offset+w.length>243)break;cwords.push({start:offset,w:z.c.slice(offset,offset+w.length)});offset+=w.length}const l=lexStats(cwords,sign,hold,lexicon(s.name));result.controls.push({name:s.name,sign,hold,score:d.score,accuracy:d.out.filter((x,i)=>x===p[i]).length,attempts:z.attempts,repeats:z.repeats,lex:{total:l.total,matched:l.matched,long:l.long,longMatched:l.longMatched}})}}
 return result;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],JSON.parse(data[2]),data.slice(3)),null,2));
