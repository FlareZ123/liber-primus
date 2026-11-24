"use strict";
// Agent 11: fixed p7 multipliers, all independent GP29 intercepts, arbitrary schedule.
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
 const N=29**5,pow=[1,29,841,24389,707281];
 let words=[],w=[],offset=0,start=0;
 for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c)){if(!w.length)start=offset;w.push(idx.get(c));offset++}else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push({start,w});w=[];}}
 if(w.length)words.push({start,w});
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 check(words.length===2896&&JSON.stringify(tape)===JSON.stringify(words.flatMap(x=>x.w)),"original source mismatch");
 let i=0;const bounds=corpus.pages.filter(p=>p.page<=55).map(p=>{let a=i;i+=p.indices.length;return {page:p.page,start:a,end:i}}),p7=bounds.find(x=>x.page===7),p8=bounds.find(x=>x.page===8);
 const R=words.filter(x=>x.start>=p7.end-14&&x.start+x.w.length<=p7.end).map(x=>x.w.reduce((a,b)=>a*b%29,1));
 check(JSON.stringify(R)==="[11,26,8,15,2]","red word products");
 const native=solved.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)))}));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3}else if(s.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>s.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}return a}
 const lexBase=new Map();
 function add(map,w){if(w.length<7)return;let m=map.get(w.length);if(!m)map.set(w.length,m=new Map());m.set(w.join(","),w)}
 for(const t of lexicalSources)for(const word of t.match(/[A-Za-z]+/g)||[])add(lexBase,encode(word));
 function lexicon(exclude){const map=new Map([...lexBase].map(([k,v])=>[k,new Map(v)]));for(const s of native){if(s.name===exclude)continue;for(const w of s.words)add(map,w)}return new Map([...map].map(([k,v])=>[k,[...v.values()]]))}
 const requirements=Array.from({length:29},(_,c)=>Array.from({length:29},(_,p)=>R.map(a=>mod(c-a*p))));
 function pack(b){return b.reduce((s,x,i)=>s+x*pow[i],0)}
 function unpack(x){return pow.map(p=>Math.floor(x/p)%29)}
 function matches(c,p,b,hold){return p.every((x,i)=>hold&&x===0?c[i]===0:R.some((a,j)=>mod(a*x+b[j])===c[i]))}
 // All assignments satisfying a disjunction of five intercept equalities per consuming rune.
 function clauses(c,p,hold){const rr=[];const seen=new Set();for(let i=0;i<c.length;i++){if(hold&&p[i]===0){if(c[i]!==0)return null;continue}const key=c[i]*29+p[i];if(!seen.has(key)){seen.add(key);rr.push(requirements[c[i]][p[i]])}}return rr}
 function enumeratePartial(rr,visit){
   const a=new Int8Array(5);a.fill(-1);
   function dfs(i){
     if(i===rr.length){let id=0;for(let j=4;j>=0;j--)id=id*30+a[j]+1;visit(id);return}
     const row=rr[i];for(let j=0;j<5;j++)if(a[j]===row[j]){dfs(i+1);return}
     for(let j=0;j<5;j++)if(a[j]===-1){a[j]=row[j];dfs(i+1);a[j]=-1}
   }
   dfs(0);
 }
 // Exhaustive all-key mark, one count per word even with many admissible spellings or schedules.
 function solve(ws,hold,lex,truth=null){
  const train=new Uint8Array(N),test=new Uint8Array(N),seen=new Uint8Array(N),cut=7,stats=[];
  check(ws.length===11,"frozen 11 anchors");
  for(let j=0;j<ws.length;j++){
   const c=ws[j].w,candidates=lex.get(c.length)||[],partial=new Set();
   for(const p of candidates){const rr=clauses(c,p,hold);if(rr)enumeratePartial(rr,x=>partial.add(x))}
   const counts=j<cut?train:test;let keys=0;
   for(let id of partial){let val=0,free=[];for(let k=0;k<5;k++){let x=id%30;id=Math.floor(id/30);if(x===0)free.push(pow[k]);else val+=(x-1)*pow[k]}
    function fill(k,x){if(k===free.length){if(seen[x]!==j+1){seen[x]=j+1;counts[x]++;keys++}return}for(let v=0;v<29;v++)fill(k+1,x+v*free[k])}
    fill(0,val);
   }
   stats.push({start:ws[j].start,length:c.length,lexicon:candidates.length,partial:partial.size,compatibleKeys:keys});
  }
  let best=-1,ties=0,first=-1,minTest=Infinity,maxTest=-Infinity,fullBest=-1,fullTies=0,fullFirst=-1;
  for(let k=0;k<N;k++){let a=train[k],b=test[k];if(a>best){best=a;ties=1;first=k;minTest=maxTest=b}else if(a===best){ties++;minTest=Math.min(minTest,b);maxTest=Math.max(maxTest,b)}if(a+b>fullBest){fullBest=a+b;fullTies=1;fullFirst=k}else if(a+b===fullBest)fullTies++}
  const b=unpack(first);const readouts=ws.map(({start,w:c})=>{const ps=(lex.get(c.length)||[]).filter(p=>matches(c,p,b,hold));return{start,count:ps.length,sample:ps.slice(0,4).map(p=>p.map(x=>corpus.translit[x]).join(""))}});
  const trueKey=truth?pack(truth):null;
  return{hold,trainingBest:best,trainingTies:ties,firstTrainingKey:b,heldout:test[first],trainingTiesHeldoutRange:[minTest,maxTest],fullBest,fullTies,fullFirstKey:unpack(fullFirst),truth,truthTraining:truth?train[trueKey]:null,truthHeldout:truth?test[trueKey]:null,truthIsTrainingWinner:truth?train[trueKey]===best:null,readouts,stats};
 }
 // Exhaustively validate clause expansion on a small 2-slot, 3-value independent analogue.
 // Then verify real five-slot point membership against direct forward support on random cases.
 let z=0x33011405;const rng=()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return z>>>0};
 function partialContains(ids,b){return [...ids].some(id=>{for(let j=0;j<5;j++){const v=id%30;id=Math.floor(id/30);if(v&&v!==b[j]+1)return false}return true})}
 for(let t=0;t<100;t++){const p=Array.from({length:7},()=>rng()%29),b=Array.from({length:5},()=>rng()%29),hold=t%2===0,c=p.map(x=>{const j=rng()%5;return hold&&x===0?0:mod(R[j]*x+b[j])});let r=clauses(c,p,hold),set=new Set();if(r)enumeratePartial(r,x=>set.add(x));check(partialContains(set,b),"planted clauses");for(let u=0;u<8;u++){const q=Array.from({length:5},()=>rng()%29);check(partialContains(set,q)===matches(c,p,q,hold),"clause direct-membership mismatch")}}
 const original=words.filter(x=>x.start>=p8.start+12&&x.start+x.w.length<=p8.end&&x.w.length>=7);
 check(original.length===11,"p8 long anchors");
 const out={sourceSlopes:R,allInterceptTuples:N,anchorMinLength:7,fitAnchors:7,holdoutAnchors:4,membershipChecks:900,controls:[],original:[]};
 for(const [name,hold] of [["0_welcome",false],["0_loss_of_divinity",true]]){
  const s=native.find(x=>x.name===name),b=Array.from({length:5},()=>rng()%29);let off=0,ws=[],planted=[];
  for(const p of s.words){const c=p.map(x=>{if(hold&&x===0)return 0;const j=rng()%5;return mod(R[j]*x+b[j])});check(matches(c,p,b,hold),"forward plant");if(p.length>=7&&ws.length<11){ws.push({start:off,w:c});planted.push(p)}off+=p.length}
  const lex=lexicon(name),result=solve(ws,hold,lex,b);result.name=name;
  result.donorInLexicon=planted.map(p=>(lex.get(p.length)||[]).some(q=>q.join(",")===p.join(",")));
  result.frozenKeyExactWords=planted.filter((p,i)=>matches(ws[i].w,p,result.firstTrainingKey,hold)).length;
  result.frozenKeyExactHeldoutWords=planted.slice(7).filter((p,i)=>matches(ws[i+7].w,p,result.firstTrainingKey,hold)).length;
  out.controls.push(result);
 }
 for(const hold of [false,true])out.original.push(solve(original,hold,lexicon(null)));
 return out;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],JSON.parse(data[2]),data.slice(3)),null,2));
