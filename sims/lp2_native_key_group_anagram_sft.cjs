"use strict";
const fs=require("node:fs"),path=require("node:path");

function experiment(raw){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29;
 const keys={WELCOME:[23,10,1,10,9,10,16,26],KOAN:[0,10,4,0,1,19,0,18,4,18,9,0,18]};
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>[...s].map(x=>x.charCodeAt(0)-65);
 const sig=w=>id(w.slice().sort((a,b)=>a-b)),extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);t=t.slice(a?a.index+a[0].length:0,b?b.index:t.length);return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let p=[];for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(q,"unmapped "+w);p.push(q.i);j+=q.t.length}return p})}
 function words(t,sep){let out=[],w=[];for(const x of t){if(ix.has(x))w.push(ix.get(x));else if(sep(x)&&w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
 const donors=raw.slice(4).map(native),dict=new Set();
 for(const d of donors)for(const w of d.slice(0,Math.floor(d.length*.8)))if(w.length<=24)dict.add(id(w));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))for(const w of words(s.source_text,()=>true))dict.add(id(w));
 assert(dict.size===10842,"frozen dictionary");
 const index=new Map();for(const w of dict){const h=sig(nums(w));if(!index.has(h))index.set(h,[]);index.get(h).push(w)}
 function encode(P,K,s){let C=[];for(const p of P){if(p===0)C.push(0);else{C.push(mod(p+K[s]));s=(s+1)%K.length}}return {C,s}}
 const w=gold.sections.find(s=>s.name==="0_welcome"),k=gold.sections.find(s=>s.name==="jpg107-167");
 const wC=extract(raw[2].split("%").slice(1,3).join("%")),kC=extract(raw[2].split("$")[5]);
 assert(id(encode(extract(w.source_text),keys.WELCOME,0).C)===id(wC),"WELCOME replay");
 assert(id(encode(extract(k.source_text),keys.KOAN,0).C)===id(kC),"KOAN replay");
 function domain(C,K){
  const out=[];let legal=0;
  for(let s=0;s<K.length;s++){const seen=new Set();function visit(i,p,word){
  if(i===C.length){legal++;const h=sig(word);if(index.has(h)){const z=p+"|"+h;if(!seen.has(z)){seen.add(z);out.push({s,t:p,sig:h,arrangement:id(word)})}}return}
  const c=C[i];if(c===0)visit(i+1,p,word.concat(0));const q=mod(c-K[p]);if(q!==0)visit(i+1,(p+1)%K.length,word.concat(q))
  }visit(0,s,[])}
  return {out,legal}
 }
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){let j=R()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function summary(D){
 let covered=0,uniqueMultiset=0,uniqueWord=0,options=0,legal=0,uniquePhaseEdge=0;
 for(const {out,legal:l} of D){legal+=l;options+=out.length;if(out.length){covered++;const multisets=new Set(out.map(e=>e.sig));if(multisets.size===1)uniqueMultiset++;const ws=new Set([...multisets].flatMap(h=>index.get(h)));if(ws.size===1)uniqueWord++;if(new Set(out.map(e=>e.s+","+e.t)).size===1)uniquePhaseEdge++}}
 return {groups:D.length,covered,missing:D.length-covered,uniqueMultiset,uniqueWord,uniquePhaseEdge,options,legal}
 }
 const controls=[],nulls=[];
 for(const [name,K] of Object.entries(keys))for(let d=0;d<donors.length;d++){
  const donor=donors[d],n=40,R=rng(330105+d+K.length*100);let start=-1,truth=null;
  for(let i=Math.floor(donor.length*.8);i+n<=donor.length;i++){
   const window=donor.slice(i,i+n);if(!window.every(w=>dict.has(id(w))))continue;
   let phase=0,hold=0,consumeZero=0;
   let rows=window.map((P,j)=>{const A=shuffle(P,R),s=phase,{C,s:t}=encode(A,K,s);phase=t;hold+=A.filter(x=>x===0).length;consumeZero+=C.filter((x,l)=>x===0&&A[l]!==0).length;return {P,A,C,s,t,j}});
   if(hold&&consumeZero){start=i;truth=rows;break}
  }
  assert(start>=0,"no eligible heldout window "+name+" "+d);
  const D=truth.map(x=>domain(x.C,K));
  const trueEdges=truth.filter((x,i)=>D[i].out.some(e=>e.s===x.s&&e.t===x.t&&e.sig===sig(x.P))).length;
  assert(trueEdges===n,"positive true edge missing");
  // In a control, use the true order (not a solved order claim) to find
  // all start-zero continuous paths with the lexical domain.
  const forward=[new Set([0])];
  for(const {out} of D){const prev=forward.at(-1),next=new Set(out.filter(e=>prev.has(e.s)).map(e=>e.t));forward.push(next)}
  assert(forward.at(-1).size>0,"continuous true phase path missing");
  const backward=Array(n+1);backward[n]=forward[n];
  for(let i=n-1;i>=0;i--)backward[i]=new Set(D[i].out.filter(e=>forward[i].has(e.s)&&backward[i+1].has(e.t)).map(e=>e.s));
  const viable=D.map((x,i)=>({out:x.out.filter(e=>forward[i].has(e.s)&&backward[i+1].has(e.t)),legal:x.legal}));
  let path=[],s=0;for(let i=0;i<n;i++){const e=viable[i].out.find(e=>e.s===s);assert(e,"witness missing");const A=nums(e.arrangement),re=encode(A,K,s);assert(id(re.C)===id(truth[i].C)&&re.s===e.t,"witness replay");path.push(e);s=e.t}
  const matched=path.filter((e,i)=>e.sig===sig(truth[i].P)).length;
  const ambiguity=path.reduce((s,e)=>s+Math.log10(index.get(e.sig).length),0);
  controls.push({key:name,donor:d,start,runecount:truth.reduce((s,x)=>s+x.C.length,0),...summary(D),continuous:summary(viable),trueEdges,matchedMultisets:matched,log10LexicalAmbiguityLowerBound:ambiguity,holds:truth.reduce((s,x)=>s+x.A.filter(p=>p===0).length,0),consumingZeros:truth.reduce((s,x)=>s+x.C.filter((p,i)=>p===0&&x.A[i]!==0).length,0)});
  const unrelated=truth.map(x=>encode(x.A,Array.from({length:K.length},()=>R()%29),R()%K.length).C);
  const N=unrelated.map(C=>domain(C,K));nulls.push({key:name,donor:d,...summary(N)})
 }
 const original=words(raw[1].split("%").slice(0,55).join("%"),x=>x!=="%"&&x!=="/"&&!/\s/u.test(x));
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 assert(original.length===2896&&original.flat().length===12956&&id(original.flat())===id(tape),"original source mismatch");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,gp.pages.filter(x=>x.page<54).reduce((s,x)=>s+x.indices.length,0),12956];
 let cursor=0,chapter=0;const chapters=Array.from({length:9},()=>[]);
 for(const w of original){while(cursor===cuts[chapter+1])chapter++;assert(cursor+w.length<=cuts[chapter+1],"cut inside printed group");chapters[chapter].push(w);cursor+=w.length}
 const originalResult=[];
 for(const [name,K] of Object.entries(keys))for(let ch=0;ch<chapters.length;ch++){const D=chapters[ch].map(C=>domain(C,K)),s=summary(D);originalResult.push({key:name,chapter:ch+1,runes:cuts[ch+1]-cuts[ch],...s,allowedOOV:Math.floor(.05*s.groups),status:s.missing>Math.floor(.05*s.groups)?"infeasible by empty multiset domains":"requires further phase-order feasibility",firstMissing:chapters[ch].filter((_,i)=>!D[i].out.length).slice(0,5).map(id)})}
 return {dictionaryTypes:dict.size,multisetTypes:index.size,keys,nativeReplay:[wC.length,kC.length],cuts,controls,nulls,original:originalResult};
}

const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
