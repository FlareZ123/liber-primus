'use strict';
// Blind boundary-anchored internal-repeat gate, issue #2462.
const fs=require('node:fs');
const path=require('node:path');
const files={};
const paths={
  "trans": "resources/liber-primus/lp2-transcription.txt",
  "punct": "resources/liber-primus/lp2-punctuation-identity.json",
  "quote": "resources/liber-primus/lp2-quote-punctuation-spans.json",
  "solved": "resources/external/relikd-solved-gp29-native-v1.json",
  "gibran": "resources/control/gibran_prophet_58585.txt",
  "shakespeare": "resources/control/shakespeare_first300k.txt",
  "crowley": "resources/external/2013-book-of-law-I.txt"
};
for(const [k,p] of Object.entries(paths))files[k]=fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(files){
 const solved=JSON.parse(files.solved), alphabet=new Set(solved.runes), punct=JSON.parse(files.punct),quote=JSON.parse(files.quote);
 const check=(b,m)=>{if(!b)throw Error(m)};
 // Stage 1: mask every original rune to X before identifying boundaries or ranking candidates.
 const masked=Array.from(files.trans.split("%").slice(0,55).join("%"),c=>alphabet.has(c)?"X":c).join("");
 const orig=[];let at=0,len=0;
 const marks=new Map();
 function mark(map,i,t){if(!map.has(i))map.set(i,new Set());map.get(i).add(t)}
 function finish(){if(len){orig.push({start:at-len,len});len=0}}
 for(const ch of masked){if(ch==="X"){at++;len++}else if(ch==="%"||ch==="/"||/\s/u.test(ch)){}else finish()}finish();
 check(at===12956&&orig.length===2896,"original layout");
 for(const e of punct.events){if(e.original_ink_event!==false)mark(marks,e.rune_offset,e.symbol==="⁜"?"H":e.symbol==="⁘"?"S":"C")}
 for(const q of quote.quotes){mark(marks,q.start,"Q");mark(marks,q.end,"E")}
 mark(marks,0,"H");
 const origW=orig.map(w=>({...w,word:null,before:[...(marks.get(w.start)||[])].sort().join("")}));
 // For each pair of distinct, non-overlapping boundary starts, match full length
 // and all interior punctuation. Initial boundary is an eligibility condition,
 // not a feature: permit both identical and different rhetorical boundary types.
 function rank(w,mode="boundary",limit=0){
  let anchors=w.map((x,i)=>mode==="all"||x.before?i:-1).filter(i=>i>=0);
  if(limit&&anchors.length>limit)anchors=Array.from({length:limit},(_,i)=>anchors[Math.floor(i*anchors.length/limit)]);
  let comparisons=0,top=[],max=0,held=0,train=0,truth=0,truthTrain=0,relaxedTrain=0,relaxedHold=0,relaxedTrue=0;const histogram={};
  for(let a=0;a<anchors.length;a++)for(let b=a+1;b<anchors.length;b++){
   let i=anchors[a],j=anchors[b],k=0,runes=0,inside=0;
   comparisons++;
   while(i+k<j&&j+k<w.length&&w[i+k].len===w[j+k].len&&(k===0||w[i+k].before===w[j+k].before)){
    runes+=w[i+k].len;if(k>0&&w[i+k].before)inside++;k++;
   }
   histogram[k]=(histogram[k]||0)+1;
   // Fixed 8-word/24-rune candidate. Two more words and a matched
   // interior rhetorical mark must survive beyond the discovery prefix.
   if(k>=8&&w.slice(i,i+8).reduce((s,x)=>s+x.len,0)>=24){
    train++;
    const isTrue=w[i].word!==null&&w.slice(i,i+8).every((x,z)=>x.word===w[j+z].word);
    if(isTrue)truthTrain++;
    if(k>=10&&w.slice(i+8,i+k).some(x=>x.before)){held++;if(isTrue&&w.slice(i,i+k).every((x,z)=>x.word===w[j+z].word))truth++}
   }
   // Sensitivity analysis: six discovery words, two withheld words, then a matched boundary.
   if(k>=6&&w.slice(i,i+6).reduce((s,x)=>s+x.len,0)>=18){relaxedTrain++; if(k>=8&&(w.slice(i+6,i+k).some(x=>x.before)||(w[i+k]?.before&&w[i+k].before===w[j+k]?.before))){relaxedHold++;if(w[i].word!==null&&w.slice(i,i+k).every((x,z)=>x.word===w[j+z].word))relaxedTrue++;}}
   if(k>max){max=k;top=[]}
   if(k===max&&k>0)top.push({i,j,runes,inside,offsets:[w[i].start,w[j].start],startTypes:[w[i].before,w[j].before],lengths:w.slice(i,i+k).map(x=>x.len),marks:w.slice(i,i+k).map(x=>x.before),next:[w[i+k]?.len,w[j+k]?.len],nextMarks:[w[i+k]?.before,w[j+k]?.before],exactWords:w[i].word===null?null:w.slice(i,i+k).every((x,z)=>x.word===w[j+z].word)});
  }
  return {words:w.length,anchors:anchors.length,comparisons,max,top:top.slice(0,12),ties:top.length,histogram,train,held,truthTrain,truth,relaxedTrain,relaxedHold,relaxedTrue}
 }
 const sw=[];let so=0;let prev="H";
 for(const s of solved.sections){
  prev="H";let word="";
  function end(){if(!word)return;sw.push({start:so,len:word.length,word,before:prev});so+=word.length;word="";prev=""}
  for(const c of s.source_text){if(alphabet.has(c)){word+=c}else{end();if(c==="⁜")prev+="H";else if(c==="⁘")prev+="S";else if(c==="⁚")prev+="C";else if(c==='"')prev+="Q";}}
  end();
 }
 // Control native-English GP greedy transliteration, as in the repository
 // external-quotation SFT; word identity retained only for scoring true repeats.
 const gp=["ING","TH","EO","OE","AE","EA","NG","IA","IO","F","U","O","R","C","G","W","H","N","I","J","P","X","S","T","B","E","M","L","D","A","Y"];
 function enc(raw){let x=raw.toUpperCase().replace(/'/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let out=[];while(x.length){const t=gp.find(t=>x.startsWith(t));if(!t)throw Error("unknown "+x);out.push(t);x=x.slice(t.length)}return out}
 function native(raw){let a=[],last=0,off=0;for(const m of raw.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)*/g)){const delim=raw.slice(last,m.index);const b=[];if(/[.!?]/.test(delim))b.push("S");if(/[,;:]/.test(delim))b.push("C");if(/["“”]/.test(delim))b.push("Q");if(/\n\s*\n/.test(delim))b.push("H");const w=enc(m[0]);a.push({start:off,len:w.length,word:w.join("|"),before:b.sort().join("")});off+=w.length;last=m.index+m[0].length;}return a}
 // Deterministic contiguous disjoint 2,896-word windows. Search all eligible
 // pairs in each window, not an artificial IID sequence.
 const ctr={};for(const key of ["gibran","shakespeare","crowley"]){let t=files[key];if(key!=="crowley"){let k=t.search(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG/i);if(k>=0)t=t.slice(t.indexOf("\n",k));let e=t.search(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG/i);if(e>=0)t=t.slice(0,e)}let w=native(t);let windows=[],matched=[];if(w.length<2896){windows.push(rank(w));matched.push(rank(w,"boundary",179));}else for(let i=0;i+2896<=w.length;i+=2896){const v=w.slice(i,i+2896);windows.push(rank(v));matched.push(rank(v,"boundary",179));}const brief=x=>({words:x.words,anchors:x.anchors,comparisons:x.comparisons,max:x.max,ties:x.ties,train:x.train,held:x.held,truthTrain:x.truthTrain,truth:x.truth,relaxedTrain:x.relaxedTrain,relaxedHold:x.relaxedHold,relaxedTrue:x.relaxedTrue});ctr[key]={total:w.length,windows:windows.map(brief),matched:matched.map(brief)};}
 return {original:rank(origW),solved:rank(sw),allWordOriginal:rank(origW,"all"),allWordSolved:rank(sw,"all"),controls:ctr};
}
const result=experiment(files);
const assert=require("node:assert/strict");
assert.equal(result.original.max,5);assert.equal(result.original.comparisons,15931);assert.equal(result.original.train,0);assert.equal(result.original.held,0);assert.equal(result.solved.max,12);assert.ok(result.solved.top[0].exactWords);
console.log(JSON.stringify(result,null,2));
