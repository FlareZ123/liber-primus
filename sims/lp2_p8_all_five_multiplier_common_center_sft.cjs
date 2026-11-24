"use strict";
// Agent 5: exact shared arbitrary five-multiplier bank, common fixed point.
// Run: node sims/lp2_p8_all_five_multiplier_common_center_sft.cjs
const fs=require("node:fs"),path=require("node:path");
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
 const mod=x=>(x%29+29)%29, idx=new Map(corpus.runes.map((r,i)=>[r,i])), check=(x,m)=>{if(!x)throw Error(m)};
 let words=[],w=[],offset=0,start=0;for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c)){if(!w.length)start=offset;w.push(idx.get(c));offset++}else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push({start,w});w=[];}}if(w.length)words.push({start,w});
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);check(words.length===2896&&JSON.stringify(tape)===JSON.stringify(words.flatMap(x=>x.w)),"source");
 let i=0;const bounds=corpus.pages.filter(p=>p.page<=55).map(p=>{let a=i;i+=p.indices.length;return {page:p.page,start:a,end:i}}), p7=bounds.find(x=>x.page===7),p8=bounds.find(x=>x.page===8);
 const R=words.filter(x=>x.start>=p7.end-14&&x.start+x.w.length<=p7.end).map(x=>x.w.reduce((a,b)=>a*b%29,1));check(JSON.stringify(R)==="[11,26,8,15,2]","red products");
 const native=solved.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)))}));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3}else if(s.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>s.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}return a}
 const lexBase=new Map();function add(map,w){if(w.length<5)return;let m=map.get(w.length);if(!m)map.set(w.length,m=new Map());m.set(w.join(","),w)}
 for(const text of lexicalSources)for(const word of text.match(/[A-Za-z]+/g)||[])add(lexBase,encode(word));
 function lexicon(exclude){const map=new Map([...lexBase].map(([k,v])=>[k,new Map(v)]));for(const s of native){if(s.name===exclude)continue;for(const w of s.words)add(map,w)}return new Map([...map].map(([k,v])=>[k,[...v.values()]]))}
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 const list=[],id=new Map();function expand(mask,begin,remaining,visit){if(!remaining){visit(mask);return;}for(let i=begin;i<=28-remaining+1;i++){if(mask&(1<<i))continue;expand(mask|(1<<i),i+1,remaining-1,visit)}}
 // The loop's conservative upper bound can miss supersets when existing bits are after i;
 // enumerate with an unrestricted bound to preserve every five-set.
 function allExpand(mask,begin,remaining,visit){if(!remaining){visit(mask);return;}for(let i=begin;i<29;i++){if(mask&(1<<i))continue;allExpand(mask|(1<<i),i+1,remaining-1,visit)}}
 allExpand(0,1,5,m=>{id.set(m,list.length);list.push(m)});check(list.length===98280,"all banks");
 const letters=m=>Array.from({length:29},(_,i)=>i).filter(i=>m&(1<<i));
 const inv=Array.from({length:29},(_,a)=>a===0?0:Array.from({length:28},(_,i)=>i+1).find(x=>a*x%29===1));
 const tables=Array.from({length:29},(_,b)=>Array.from({length:29},(_,c)=>Array.from({length:29},(_,p)=>p===b?(c===b?0:-1):(c===b?-1:1<<mod((c-b)*inv[mod(p-b)])))));
 function supportCenter(ws,hold,lex,b,truth=null){let n=ws.length,cut=Math.ceil(n*0.65),training=new Uint16Array(list.length),test=new Uint16Array(list.length),marker=new Uint16Array(list.length),wordCounts=[],fixed=[0,0],fixedInverse=[0,0];const table=tables[b],fixedMask=R.reduce((m,x)=>m|(1<<x),0),fixedInv=R.reduce((m,x)=>m|(1<<inv[x]),0);
  for(let j=0;j<n;j++){const c=ws[j].w,masks=new Set();for(const p of lex.get(c.length)||[]){let m=0,ok=true;for(let k=0;k<c.length;k++){if(hold&&p[k]===0){if(c[k]!==0){ok=false;break}continue}let bit=table[c[k]][p[k]];if(bit===-1){ok=false;break}m|=bit;if(pop(m)>5){ok=false;break}}if(ok)masks.add(m)}
   let count=0;if([...masks].some(m=>(m&fixedMask)===m))fixed[+(j>=cut)]++;if([...masks].some(m=>(m&fixedInv)===m))fixedInverse[+(j>=cut)]++;
   for(const m of masks)allExpand(m,1,5-pop(m),bank=>{const i=id.get(bank);check(i!==undefined,"bank enumeration");if(marker[i]===j+1)return;marker[i]=j+1;count++;(j<cut?training:test)[i]++});wordCounts.push(count);
  }
  let best=-1,top=[],fullBest=-1,fullCount=0,fullWitness=null;for(let i=0;i<list.length;i++){const s=training[i],t=test[i];if(s>best){best=s;top=[i]}else if(s===best)top.push(i);if(s+t>fullBest){fullBest=s+t;fullCount=1;fullWitness=i}else if(s+t===fullBest)fullCount++}
  let tmin=Infinity,tmax=-Infinity;for(const i of top){tmin=Math.min(tmin,test[i]);tmax=Math.max(tmax,test[i]);}let first=top[0],actual=truth===null?null:id.get(truth);
  return {b,hold,n,cut,trainingBest:best,trainingTies:top.length,firstTrainingBank:letters(list[first]),firstTrainingHeldout:test[first],trainingTiesHeldoutRange:[tmin,tmax],fullBest,fullTies:fullCount,fullWitness:letters(list[fullWitness]),trueBank:truth===null?null:letters(truth),trueTrain:actual===null?null:training[actual],trueTest:actual===null?null:test[actual],trueTop:actual===null?null:training[actual]===best,fixed,fixedInverse,wordCounts};
 }
 function support(ws,hold,lex,trueCenter=null,trueBank=null){let rows=[];for(let b=0;b<29;b++)rows.push(supportCenter(ws,hold,lex,b,b===trueCenter?trueBank:null));let best=Math.max(...rows.map(x=>x.trainingBest)),fullBest=Math.max(...rows.map(x=>x.fullBest)),top=rows.filter(x=>x.trainingBest===best),full=rows.filter(x=>x.fullBest===fullBest),first=top[0];return {hold,n:first.n,cut:first.cut,trainingBest:best,ties:top.reduce((n,x)=>n+x.trainingTies,0),first:{b:first.b,bank:first.firstTrainingBank,heldout:first.firstTrainingHeldout},heldoutRange:[Math.min(...top.map(x=>x.trainingTiesHeldoutRange[0])),Math.max(...top.map(x=>x.trainingTiesHeldoutRange[1]))],fullBest,fullTies:full.reduce((n,x)=>n+x.fullTies,0),fullWitness:{b:full[0].b,bank:full[0].fullWitness},fixedAtZero:rows[0].fixed,fixedInverseAtZero:rows[0].fixedInverse,trueCenter,trueBank:trueBank===null?null:letters(trueBank),actual:trueCenter===null?null:rows[trueCenter],centerSummary:rows.map(x=>[x.b,x.trainingBest,x.fullBest]),noBankWords:ws.map((x,i)=>rows.every(r=>r.wordCounts[i]===0)?x.start:null).filter(x=>x!==null)}}
 function plant(s,hold,seed){let z=seed>>>0;const rng=()=>z=(Math.imul(z,1664525)+1013904223)>>>0;let bank=0,b=rng()%29;while(pop(bank)<5)bank|=1<<(1+rng()%28);const R=letters(bank),t=s.words.flat().slice(0,243),c=[];for(const p of t){if(hold&&p===0){c.push(0);continue}let k=R[rng()%5],v=mod(b+k*(p-b));if(v===c.at(-1)){k=R[rng()%5];v=mod(b+k*(p-b))}check(v===mod(b+k*(p-b)),"forward");c.push(v)}let offset=0,ws=[];for(const w of s.words){if(offset+w.length>243)break;if(w.length>=5)ws.push({start:offset,w:c.slice(offset,offset+w.length)});offset+=w.length}return {bank,b,ws}}
 const ws=words.filter(x=>x.start>=p8.start+12&&x.start+x.w.length<=p8.end&&x.w.length>=5);check(ws.length===23,"p8 anchors");const out={banksPerCenter:list.length,total:list.length*29,original:[],controls:[]};for(const hold of [false,true]){out.original.push(support(ws,hold,lexicon(null)));for(const s of native.filter(x=>x.words.flat().length>=243)){let p=plant(s,hold,8301+out.controls.length);out.controls.push({name:s.name,...support(p.ws,hold,lexicon(s.name),p.b,p.bank)})}}
 return out;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],JSON.parse(data[2]),data.slice(3)),null,2));
