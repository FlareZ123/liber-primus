"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
 "resources/liber-primus/lp2-corpus.json",
 "resources/transcriptions/lp2-image-corrected.txt",
 "resources/external/relikd-solved-gp29-native-v1.json",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/shakespeare_first300k.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/english_wordfreq_textblob.txt"
];
const OUT=path.join(__dirname,"..","im-results","lp2-p56-intragroup-multiset-prime-clock-output.json");
function experiment(raw){
 const assert=(x,m)=>{if(!x)throw Error(m);};
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,id=w=>w.join(",");
 const sortedKey=w=>id(w.slice().sort((a,b)=>a-b));
 const momentKey=w=>{let a=0,b=0,c=0;for(const x of w){a=(a+x)%29;b=(b+x*x)%29;c=(c+x*x*x)%29;}return w.length+":"+a+":"+b+":"+c;};
 function runeWords(t,sep){const out=[];let w=[],between="";for(const ch of t){if(ix.has(ch)){if(w.length&&sep.test(between)){out.push(w);w=[];}w.push(ix.get(ch));between="";}else between+=ch;}if(w.length)out.push(w);return out;}
 function spell(word,alt=true){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,"unknown token "+w);p.push(v.i);j+=v.t.length;}return p;}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w));}
 const donors=raw.slice(3,6).map(native),wordForms=new Map();
 function addWord(w){if(w.length<=24){const k=id(w);if(!wordForms.has(k))wordForms.set(k,w.slice());}}
 for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))addWord(w);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of runeWords(s.source_text,/[^\u16a0-\u16ff]/u))addWord(w);
 for(const line of raw[6].split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(line);if(m)for(const alt of [false,true]){const w=spell(m[1],alt);if(w.length&&w.length<=24)addWord(w);}}
 for(let x=0;x<29;x++)addWord([x]);
 assert(wordForms.size===35944,"frozen word-form register "+wordForms.size);
 const multiMap=new Map(),momentSet=new Set();
 for(const w of wordForms.values()){const k=sortedKey(w);let a=multiMap.get(k);if(!a)multiMap.set(k,a=[]);a.push(w);momentSet.add(momentKey(w));}
 const render=w=>w.map(i=>gp.translit[i]).join("");
 const primes=[],sieve=new Uint8Array(150000);
 for(let p=2;p<sieve.length;p++)if(!sieve[p]){primes.push(p);if(p*p<sieve.length)for(let x=p*p;x<sieve.length;x+=p)sieve[x]=1;}
 const K=primes.map(p=>(p-1)%29);assert(K.length>5000,"prime schedule too short");
 function encodePrime(w,start,sign){let s=start;const C=[];for(const p of w){if(p===0)C.push(0);else C.push(mod(p+sign*K[s++]));}return {C,start,end:s,key:sortedKey(w)};}
 function encodeQ8(w,start,sign,key){let j=start;const C=[];for(const p of w){if(p===0)C.push(0);else C.push(mod(p+sign*key[j++%key.length]));}return {C,start,end:j,key:sortedKey(w)};}
 function encodeIndependent(w,sign,key){let j=0;const C=[];for(const p of w){if(p===0)C.push(0);else C.push(mod(p+sign*key[j++%key.length]));}return {C,start:0,end:j,key:sortedKey(w)};}
 function domain(C,startMax,sign){
  const found=new Map(),P=[];
  function visit(i,s,a,b,c,start){
   if(i===C.length){if(!momentSet.has(C.length+":"+a+":"+b+":"+c))return;const key=sortedKey(P),forms=multiMap.get(key);if(!forms)return;const k=start+":"+s+":"+key;const prior=found.get(k);if(prior)prior.variants++;else found.set(k,{start,end:s,key,forms:forms.length,sample:forms.slice(0,3).map(render),fCount:P.filter(x=>x===0).length,variants:1});return;}
   const ch=C[i];
   if(ch===0){P.push(0);visit(i+1,s,a,b,c,start);P.pop();}
   if(s<K.length){const p=mod(ch-sign*K[s]);if(p!==0){P.push(p);visit(i+1,s+1,(a+p)%29,(b+p*p)%29,(c+p*p*p)%29,start);P.pop();}}
  }
  for(let start=0;start<=startMax;start++)visit(0,start,0,0,0,start);
  return [...found.values()].sort((a,b)=>a.start-b.start||a.end-b.end||a.key.localeCompare(b.key));
 }
 function summarize(groups,startMax,sign,truth=null,minLen=8){
  const rows=[];let eligible=0,covered=0,edges=0,uniqueEdge=0,uniqueStart=0,trueFound=0,trueUnique=0;
  for(let i=0;i<groups.length;i++){const g=groups[i];if(g.C.length<minLen)continue;eligible++;const D=domain(g.C,startMax,sign);edges+=D.length;if(D.length)covered++;const starts=[...new Set(D.map(x=>x.start))];if(D.length===1)uniqueEdge++;if(starts.length===1&&D.length)uniqueStart++;let found=false,unique=false;if(truth&&truth[i]){const t=truth[i];found=D.some(x=>x.start===t.start&&x.end===t.end&&x.key===t.key);if(found)trueFound++;unique=found&&D.length===1;if(unique)trueUnique++;}rows.push({index:i,page:g.page||null,length:g.C.length,zeroCount:g.C.filter(x=>x===0).length,candidateEdges:D.length,uniqueStarts:starts.length,trueEdgeFound:truth?found:null,trueEdgeUnique:truth?unique:null,candidates:D.slice(0,40)});}
  return {groups:groups.length,minLen,startMax,sign,eligible,covered,missing:eligible-covered,candidateEdges:edges,uniqueEdge,uniqueStart,trueFound:truth?trueFound:null,trueUnique:truth?trueUnique:null,rows};
 }
 const source=runeWords(raw[1],/[-.&]/u),unknown=source.slice(0,2896);
 assert(unknown.length===2896&&unknown.flat().length===12956,"unknown corpus word/rune count");
 assert(id(unknown.flat())===id(gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),"original source/corpus mismatch");
 const chapter=unknown.slice(-66),p54=chapter.slice(0,49),p55=chapter.slice(49);
 assert(p54.length===49&&p54.flat().length===222&&p55.length===17&&p55.flat().length===86,"p54/p55 source frame mismatch");
 const p54Lens=p54.map(w=>w.length),p55Lens=p55.map(w=>w.length),chapterRunes=chapter.flat().length;
 const p56=runeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text,/[^\u16a0-\u16ff]/u);
 const original56=gp.pages.find(p=>p.page===56).indices;
 const p56Cipher=encodePrime(p56.flat(),0,1);
 assert(id(p56Cipher.C)===id(original56)&&p56Cipher.end===84,"authentic p56 85/85, 84-consuming replay");
 let seed=0x33012695;
 function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const donorNames=["Gibran","Shakespeare","Emerson"];
 function selectWindow(donor,minLongA,minLongB){
  const lo=Math.floor(donor.length*.8),pool=donor.slice(lo);
  for(let i=0;i+66<=pool.length;i++){
   const words=pool.slice(i,i+66),a=words.slice(0,49),b=words.slice(49),total=words.reduce((s,w)=>s+w.length,0);
   const longA=a.filter(w=>w.length>=8).length,longB=b.filter(w=>w.length>=8).length;
   const oovA=a.filter(w=>!multiMap.has(sortedKey(w))).length,oovB=b.filter(w=>!multiMap.has(sortedKey(w))).length;
   if(total>=250&&total<=360&&longA>=minLongA&&longB>=minLongB&&oovA<=2&&oovB===0&&words.every(w=>w.length<=24))
    return {words:words.map(w=>w.slice()),start:lo+i,total,longA,longB,oovA,oovB};
  }
  throw Error("no held-out donor window: "+minLongA+"/"+minLongB);
 }
 function makePrimeControl(d,sign){
  seed=(0x33012695^(d*0x10203)^(sign<0?0x5a5a:0))>>>0;
  const minLongA=d===0?6:8,minLongB=d===0?1:2,win=selectWindow(donors[d],minLongA,minLongB);
  const a=shuffle(win.words.slice(0,49).map(w=>shuffle(w.slice()))),b=shuffle(win.words.slice(49).map(w=>shuffle(w.slice())));
  let s=[0,1033,3301][d];const p54c=[],p55c=[],truth54=[],truth55=[];
  for(const [page,words,target,truth] of [["p54",a,p54c,truth54],["p55",b,p55c,truth55]])for(const w of words){const e=encodePrime(w,s,sign);s=e.end;target.push({C:e.C,page});truth.push({start:e.start,end:e.end,key:sortedKey(w),word:render(w)});}
  return {d,sign,origin:[0,1033,3301][d],window:win,p54:p54c,p55:p55c,truth54,truth55,end:s,heldF:[...a,...b].flat().filter(x=>x===0).length};
 }
 function makeQ8Control(d){
  seed=(0x33012695^(d*0x1111)^0x7777)>>>0;const win=selectWindow(donors[d],6,1);
  const a=shuffle(win.words.slice(0,49).map(w=>shuffle(w.slice()))),b=shuffle(win.words.slice(49).map(w=>shuffle(w.slice())));
  const key=[5,10,17,15,19,18,24,6];let s=0;const p54c=[],p55c=[];
  for(const [page,words,target] of [["p54",a,p54c],["p55",b,p55c]])for(const w of words){const e=encodeQ8(w,s,1,key);s=e.end;target.push({C:e.C,page});}
  return {d,window:win,key,p54:p54c,p55:p55c};
 }
 function makeIndependentControl(d){
  seed=(0x33012695^(d*0x2222)^0x9999)>>>0;const win=selectWindow(donors[d],8,2);
  const a=shuffle(win.words.slice(0,49).map(w=>shuffle(w.slice()))),b=shuffle(win.words.slice(49).map(w=>shuffle(w.slice())));
  const p54c=[],p55c=[];let n=0;
  for(const [page,words,target] of [["p54",a,p54c],["p55",b,p55c]])for(const w of words){const key=Array.from({length:8},()=>next()%29),e=encodeIndependent(w,1,key);target.push({C:e.C,page});n++;}
  return {d,window:win,p54:p54c,p55:p55c,independentGroupPads:n};
 }
 const controls=[];
 for(let d=0;d<3;d++)for(const sign of [1,-1]){
  const c=makePrimeControl(d,sign),maxStart=c.origin+c.window.total;
  const r54=summarize(c.p54,maxStart,sign,c.truth54,8),r55=summarize(c.p55,maxStart,sign,c.truth55,8);
  controls.push({kind:"p56-prime-positive",donor:donorNames[d],sign,origin:c.origin,window:c.window.start,totalRunes:c.window.total,chapterEnd:c.end,heldF:c.heldF,profile:{longP54:c.window.longA,longP55:c.window.longB,oovP54:c.window.oovA,oovP55:c.window.oovB},p54:{eligible:r54.eligible,covered:r54.covered,edges:r54.candidateEdges,trueFound:r54.trueFound,trueUnique:r54.trueUnique},p55:{eligible:r55.eligible,covered:r55.covered,edges:r55.candidateEdges,trueFound:r55.trueFound,trueUnique:r55.trueUnique}});
 }
 const q8=makeQ8Control(0),q8neg=[1,-1].map(sign=>{const a=summarize(q8.p54,3301+q8.window.total,sign,null,8),b=summarize(q8.p55,3301+q8.window.total,sign,null,8);return {sign,p54:{covered:a.covered,edges:a.candidateEdges},p55:{covered:b.covered,edges:b.candidateEdges}};});
 const independent=makeIndependentControl(1),indneg=[1,-1].map(sign=>{const a=summarize(independent.p54,3301+independent.window.total,sign,null,8),b=summarize(independent.p55,3301+independent.window.total,sign,null,8);return {sign,p54:{covered:a.covered,edges:a.candidateEdges},p55:{covered:b.covered,edges:b.candidateEdges}};});
 const originalP54=p54.map((C)=>({C,page:"p54"})),originalP55=p55.map((C)=>({C,page:"p55"})),original=[];
 for(const sign of [1,-1]){
  const r54=summarize(originalP54,3301+chapterRunes,sign,null,8),r55=summarize(originalP55,3301+chapterRunes,sign,null,8);
  original.push({sign,p54:r54,p55:r55});
 }
 const p54OovBudget=Math.floor(p54.length*.05),p55OovBudget=Math.floor(p55.length*.05);
 const gate=original.map(x=>({sign:x.sign,p54LongMissing:x.p54.missing,p54OovBudget,p54Pass:x.p54.missing<=p54OovBudget,p55LongMissing:x.p55.missing,p55OovBudget,p55Pass:x.p55.missing<=p55OovBudget,completeContinuation:x.p54.missing<=p54OovBudget&&x.p55.missing<=p55OovBudget,tilingSearchRequired:x.p54.missing<=p54OovBudget&&x.p55.missing<=p55OovBudget}));
 return {
  frozen:{model:"C=P+sign*(prime[j]-1 mod29); plaintext F is literal and holds j; no collision redraw; each decrypted group is compared as a rune multiset; whole-group order is not assumed; candidate intervals must be compatible with a contiguous chapter clock.",originRange:[0,3301],maxStart:3301+chapterRunes,chapterRunes,wordForms:wordForms.size,distinctMultisets:multiMap.size,momentKeys:momentSet.size,p54Groups:p54.length,p54Runes:222,p55Groups:p55.length,p55Runes:86,longThreshold:8},
  p56Control:{runes:original56.length,consuming:p56Cipher.end,exactReplay:true},
  controls,
  negativeControls:{q8:{donor:"Gibran",window:q8.window.start,totalRunes:q8.window.total,key:q8.key,results:q8neg},independentPads:{donor:"Shakespeare",window:independent.window.start,totalRunes:independent.window.total,groups:independent.independentGroupPads,results:indneg}},
  original,gate
 };
}
const result=experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")));
fs.writeFileSync(OUT,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({frozen:result.frozen,p56Control:result.p56Control,controls:result.controls,negativeControls:result.negativeControls,gate:result.gate,original:result.original.map(x=>({sign:x.sign,p54:{eligible:x.p54.eligible,covered:x.p54.covered,missing:x.p54.missing,edges:x.p54.candidateEdges,rows:x.p54.rows},p55:{eligible:x.p55.eligible,covered:x.p55.covered,missing:x.p55.missing,edges:x.p55.candidateEdges,rows:x.p55.rows}}))},null,2));
