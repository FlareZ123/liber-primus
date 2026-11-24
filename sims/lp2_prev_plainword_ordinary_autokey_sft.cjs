'use strict';
/** #2503: all 29 singleton anchors for ordinary previous-plaintext-word cyclic Vigenere. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpusText,transcription,solvedText,lexiconText){
 const corpus=JSON.parse(corpusText),solved=JSON.parse(solvedText),index=new Map(corpus.runes.map((r,i)=>[r,i]));
 const assert=(x,msg)=>{if(!x)throw Error(msg);};
 const words=[];let w=[];
 for(const c of transcription.split('%').slice(0,55).join('%')){
  if(index.has(c))w.push(index.get(c));
  else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}
 }
 if(w.length)words.push(w);
 const flat=words.flat(),canon=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 assert(words.length===2896&&flat.length===12956&&flat.every((x,i)=>x===canon[i]),"canonical source mismatch");
 const offsets=[];let off=0;for(const word of words){offsets.push(off);off+=word.length;}
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;
 }
 const code=p=>String.fromCharCode(...p),vocab=new Set();
 for(const l of lexiconText.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const p=gp(m[1]);if(p)vocab.add(code(p));}}
 assert(vocab.size===29060,"vocabulary count mismatch");
 const mod=x=>(x+29)%29;
 /** @param {number[]} c @param {number[]} k */
 const inverse=(c,k)=>c.map((x,j)=>mod(x-k[j%k.length]));
 /** @param {number[]} p @param {number[]} k */
 const forward=(p,k)=>p.map((x,j)=>mod(x+k[j%k.length]));
 function trajectory(ws,start,seed){
  const p=[seed];for(let i=start+1;i<ws.length;i++)p.push(inverse(ws[i],p.at(-1)));
  assert(p.slice(1).every((v,j)=>code(forward(v,p[j]))===code(ws[start+j+1])),"replay mismatch");return p;
 }
 function metrics(ws){
  const f=Array(29).fill(0);let n=0,adjacent=0,inside=0,pairs=0,last=-1,known=0,long=0,run=0,maxRun=0;
  for(const word of ws){const counts=Array(29).fill(0);for(let i=0;i<word.length;i++){const v=word[i];f[v]++;counts[v]++;n++;adjacent+=v===last;inside+=i>0&&v===word[i-1];last=v;}pairs+=counts.reduce((s,k)=>s+k*(k-1)/2,0);
   const hit=vocab.has(code(word));if(word.length>=5){long++;known+=hit;}run=hit?run+1:0;maxRun=Math.max(maxRun,run);}
  return {words:ws.length,runes:n,ioc:f.reduce((s,k)=>s+k*(k-1),0)/(n*(n-1)),adjacent,inside,pairs,long,known,maxRun,singletonTypes:[...new Set(ws.filter(w=>w.length===1).map(w=>w[0]))].sort((a,b)=>a-b)};
 }
 function pageRange(a,b){
  const start=corpus.pages.filter(p=>p.page<a).reduce((s,p)=>s+p.indices.length,0);
  return [start,start+corpus.pages.filter(p=>p.page>=a&&p.page<=b).reduce((s,p)=>s+p.indices.length,0)];
 }
 const anchor=words.findIndex(w=>w.length===1);
 assert(anchor===39&&offsets[anchor]===176,"first singleton");
 const candidates=Array.from({length:29},(_,s)=>trajectory(words,anchor,[s])),base=candidates[0];
 assert(candidates.every((p,s)=>p.every((w,i)=>w.every((x,j)=>x===mod(base[i][j]+(i%2?-s:s))))),"shift theorem");
 function select(p,a,b){const [lo,hi]=pageRange(a,b);return p.filter((w,j)=>offsets[j+anchor]>=lo&&offsets[j+anchor]+w.length<=hi);}
 const rows=candidates.map((p,s)=>({seed:s,opening:metrics(select(p,0,2)),hold1:metrics(select(p,16,21)),hold2:metrics(select(p,40,53)),full:metrics(p)}));
 rows.sort((a,b)=>b.opening.known-a.opening.known||b.opening.maxRun-a.opening.maxRun||a.seed-b.seed);
 const best=rows[0],bestP=candidates[best.seed],render=ws=>ws.map(w=>w.map(x=>corpus.translit[x]).join('-')).join(' / ');
 const byParity=[0,1].map(q=>[...new Set(base.filter((w,j)=>j%2===q&&w.length===1).map(w=>w[0]))].sort((a,b)=>a-b));
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>index.get(c))));
 assert(donor.flat().every(Number.isInteger),"donor parse");
 const plants=[0,150,300].map(start=>{
  const p=donor.slice(start,start+150),c=[p[0],...p.slice(1).map((w,i)=>forward(w,p[i]))],a=p.findIndex(w=>w.length===1);
  assert(a>=0&&a<60,"plant singleton");
  const q=Array.from({length:29},(_,s)=>trajectory(c,a,[s])),split=Math.floor((p.length-a)*0.6);
  const score=q.map((w,s)=>({s,train:metrics(w.slice(1,split))})).sort((x,y)=>y.train.known-x.train.known||y.train.maxRun-x.train.maxRun||x.s-y.s);
  const win=score[0].s,actual=p[a][0],same=q[win].flat().every((v,i)=>v===p.slice(a).flat()[i]);
  assert(win===actual&&same,"blind plant fails");
  return {start,anchor:a,actual,win,same,train:score[0].train,runner:score[1].train.known,hold:metrics(q[win].slice(split)),original:metrics(p.slice(a))};
 });
 const prefixWords=words.slice(0,anchor+1),seeds=[...vocab].filter(s=>s.length===prefixWords[0].length);
 let prefixBest=null,nConsistent=0;
 for(const s of seeds){
  const p=trajectory(prefixWords,0,Array.from(s,c=>c.charCodeAt(0)));
  if(p.at(-1)[0]!==best.seed)continue;nConsistent++;
  const m=metrics(p.slice(1));
  if(prefixBest===null||m.known>prefixBest.metrics.known||(m.known===prefixBest.metrics.known&&m.maxRun>prefixBest.metrics.maxRun))prefixBest={seed:Array.from(s,c=>c.charCodeAt(0)),metrics:m,plaintext:p};
 }
 assert(prefixBest!==null,"no lexicon prefix");
 const full=[...prefixBest.plaintext.slice(0,-1),...bestP];
 assert(full.length===words.length&&full.slice(1).every((w,i)=>code(forward(w,full[i]))===code(words[i+1])),"whole book replay");
 assert(best.seed===7&&best.opening.known===0&&best.hold1.known===0&&best.hold2.known===0,"original frozen result");
 assert(Math.min(...rows.map(r=>r.full.singletonTypes.length))===25&&byParity[0].length===23&&byParity[1].length===21,"original singleton obstruction");
 return {anchor,offset:offsets[anchor],byParity,allSeedSingletonTypes:rows.map(r=>[r.seed,r.full.singletonTypes.length]),best,runner:rows[1],ranges:rows.map(r=>({seed:r.seed,opening:r.opening.known,hold1:r.hold1.known,hold2:r.hold2.known,full:r.full.known,ioc:r.full.ioc})),plants,prefix:{nConsistent,seeds:seeds.length,seed:prefixBest.seed,metrics:prefixBest.metrics,render:render(full.slice(0,30))},entire:metrics(full),preview:render(bestP.slice(0,35)),hold1Preview:render(select(bestP,16,21).slice(0,25)),hold2Preview:render(select(bestP,40,53).slice(0,25))};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"].map(read)),null,2));
