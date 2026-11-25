"use strict";
// Standalone Node 22 reproduction for Issue #2745.
// Exact model: C=(P+K) mod 29^N, K is an 8-GP-digit word repeated MSB-first.
// Standard addition starts with carry 0 at the least-significant end; overflow
// is discarded at the most-significant end. No word/page reset and no F bypass.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gold = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp2Blocks = read("resources/liber-primus/lp2-transcription.txt").split("%");
const donorTexts = [
  read("resources/control/gibran_prophet_58585.txt"),
  read("resources/control/shakespeare_first300k.txt"),
  read("resources/control/emerson_essays_2944.txt")
];
const wordfreq = read("resources/control/english_wordfreq_textblob.txt");
const T = corpus.translit, Q = 29;
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const toks = T.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
const keyOf = a => a.map(x=>String.fromCharCode(65+x)).join("");
const fromKey = s => Array.from(s,c=>c.charCodeAt(0)-65);
const spell = a => a.map(x=>T[x]).join(" ");
function gpWord(w,alt=true) {
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let j=0;j<w.length;) {
    const t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:toks.find(x=>w.startsWith(x.t,j));
    if(!t) throw Error("Unencodable donor/key word: "+w);
    out.push(t.i);j+=t.t.length;
  }
  return out;
}
function gutenbergBody(s) {
  const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);
  const b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);
  return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);
}
function donorWords(s) {
  return (gutenbergBody(s).toUpperCase().match(/[A-Z]+/g)||[]).map(source=>({source,gp:gpWord(source,true)}));
}
const donors=donorTexts.map(donorWords);
const training=new Set(),external=new Set();
for(const d of donors) for(const w of d.slice(0,Math.floor(d.length*.8))) if(w.gp.length<=24) training.add(keyOf(w.gp));
for(const sec of gold.sections) if(!["0_welcome","jpg107-167"].includes(sec.name))
  for(const w of (sec.source_text.match(/[\u16a0-\u16ff]+/gu)||[])
    .map(x=>[...x].map(c=>runeIndex.get(c)))
    .filter(w=>w.length&&w.length<=24&&w.every(Number.isInteger))) training.add(keyOf(w));
for(const line of wordfreq.split(/\r?\n/)) {
  const m=line.match(/^([a-z]+)\s+(\d+)$/i);
  if(m) for(const k of new Set([keyOf(gpWord(m[1],true)),keyOf(gpWord(m[1],false))])) if(k.length<=24) external.add(k);
}
const lex=new Set([...training,...external,...Array.from({length:Q},(_,i)=>keyOf([i]))]);
const q8=[...lex].filter(k=>k.length===8).sort();
assert.deepEqual([training.size,external.size,lex.size,q8.length],[10842,33369,35944,5370]);

function parseRunicWords(s,close=true) {
  const words=[];let w=[];
  const finish=()=>{if(w.length)words.push(w);w=[];};
  for(const ch of s) {
    const ix=runeIndex.get(ch);
    if(ix!==undefined) w.push(ix);
    else if(ch==="/"||ch==="%"||/\s/u.test(ch)) {}
    else finish();
  }
  if(close)finish();
  return {words,partial:w};
}
function removeFirstRunes(s,n) {
  let seen=0,out="";
  for(const ch of s) {
    if(runeIndex.has(ch)&&seen<n){seen++;continue;}
    out+=ch;
  }
  assert.equal(seen,n);
  return out;
}
function wordOffsets(words) {
  let at=0;
  return words.map(w=>{const x={start:at,end:at+w.length};at+=w.length;return x;});
}
function encryptCarry(plain,k) {
  const c=new Array(plain.length);let carry=0;
  for(let i=plain.length-1;i>=0;i--) {
    const x=plain[i]+k[i%8]+carry;
    c[i]=x%Q;carry=Math.floor(x/Q);
  }
  return c; // final MSB overflow is intentionally discarded
}
function encryptDigitwise(plain,k) { return plain.map((x,i)=>(x+k[i%8])%Q); }
function encryptIndependent(plain,seed=0x3301) {
  let s=seed>>>0;
  return plain.map(x=>{
    s^=s<<13;s^=s>>>17;s^=s<<5;s>>>=0;
    return (x+(s%Q))%Q;
  });
}
function decodeSuffix(cipher,start,k) {
  const out=new Array(cipher.length-start);let borrow=0;
  for(let j=out.length-1;j>=0;j--) {
    const i=start+j,x=cipher[i]-k[i%8]-borrow;
    if(x<0){out[j]=x+Q;borrow=1;} else {out[j]=x;borrow=0;}
  }
  return {plain:out,borrowAtPrefix:borrow};
}
function search(cipher,offsets,start) {
  const complete=offsets.filter(w=>w.start>=start),rows=[];
  for(const ks of q8) {
    const k=fromKey(ks),d=decodeSuffix(cipher,start,k);
    const hits=complete.filter(w=>lex.has(keyOf(d.plain.slice(w.start-start,w.end-start)))).length;
    rows.push({keyIndex:ks,key:spell(k),hits,total:complete.length,borrowAtPrefix:d.borrowAtPrefix});
  }
  rows.sort((a,b)=>b.hits-a.hits||a.keyIndex.localeCompare(b.keyIndex));
  return {start,suffixRunes:cipher.length-start,completeWords:complete.length,maxHits:rows[0]?.hits||0,
    perfect:rows.filter(x=>x.hits===complete.length),top:rows.slice(0,10),rows};
}
function decodeFull(cipher,k) {
  const p=new Array(cipher.length);let borrow=0;
  for(let i=cipher.length-1;i>=0;i--) {
    const x=cipher[i]-k[i%8]-borrow;
    if(x<0){p[i]=x+Q;borrow=1;} else {p[i]=x;borrow=0;}
  }
  return p;
}
function choosePlant(donorIndex,startIndex) {
  const held=donors[donorIndex].slice(Math.floor(donors[donorIndex].length*.8));
  for(let end=0;end<held.length-startIndex;end++) {
    const cand=held.slice(startIndex,startIndex+end+1);
    const runes=cand.reduce((n,x)=>n+x.gp.length,0);
    if(runes>299)break;
    if(runes!==299)continue;
    let before=0,split=-1,remainder=0;
    for(let j=0;j<cand.length;j++) {
      const L=cand[j].gp.length;
      if(before<223&&before+L>223){split=j;remainder=before+L-223;break;}
      before+=L;
    }
    if(split<0)continue;
    const suffixWords=cand.slice(split+1);
    if(suffixWords.length!==16||remainder!==1||suffixWords.some(x=>!lex.has(keyOf(x.gp))))continue;
    return {words:cand.map(x=>x.gp),source:cand.map(x=>x.source),start:startIndex,endExclusive:startIndex+end+1,
      splitWord:cand[split].source,remainder,prefixOov:cand.slice(0,split).filter(x=>!lex.has(keyOf(x.gp))).map(x=>x.source),
      donor:["Gibran","Shakespeare","Emerson"][donorIndex]};
  }
  throw Error("No source-excluded p55-shaped plant for donor "+donorIndex);
}
const keyWords=["DIVINITY","PRESERVE","YOURSELF"];
const keyDigits=Object.fromEntries(keyWords.map(w=>[w,gpWord(w,true)]));
for(const [w,k] of Object.entries(keyDigits)) {
  assert.equal(k.length,8,w+" must be q8");
  assert(lex.has(keyOf(k)),w+" must be in the frozen native lexicon");
  assert(q8.includes(keyOf(k)),w+" must be among q8 candidates");
}
const plantSpecs=[
  {donorIndex:0,start:1855,key:"DIVINITY"},
  {donorIndex:1,start:1990,key:"PRESERVE"},
  {donorIndex:2,start:2375,key:"YOURSELF"}
];
const plants=plantSpecs.map(spec=>{
  const p=choosePlant(spec.donorIndex,spec.start),flat=p.words.flat(),offs=wordOffsets(p.words),k=keyDigits[spec.key];
  assert.equal(flat.length,299);
  const cipher=encryptCarry(flat,k);
  const short=search(cipher,offs,223),long=search(cipher,offs,147);
  const trueShort=short.rows.find(x=>x.keyIndex===keyOf(k));
  const trueLong=long.rows.find(x=>x.keyIndex===keyOf(k));
  const exact=JSON.stringify(decodeFull(cipher,k))===JSON.stringify(flat);
  const digit=search(encryptDigitwise(flat,k),offs,223);
  const independent=search(encryptIndependent(flat),offs,223);
  assert.deepEqual([short.maxHits,short.completeWords,short.perfect.length,trueShort.hits,short.rows.findIndex(x=>x.keyIndex===keyOf(k))+1],[16,16,1,16,1]);
  assert.equal(exact,true);
  assert.equal(long.rows.findIndex(x=>x.keyIndex===keyOf(k))+1,1);
  return {
    donor:p.donor,start:p.start,endExclusive:p.endExclusive,words:p.words.length,runes:flat.length,
    splitWord:p.splitWord,seamRemainder:p.remainder,prefixOov:p.prefixOov,
    keyWord:spec.key,keyGP:spell(k),
    suffix76:{maxHits:short.maxHits,total:short.completeWords,perfectKeyCount:short.perfect.length,trueKeyRank:1,trueKeyHits:trueShort.hits},
    suffix152:{maxHits:long.maxHits,total:long.completeWords,perfectKeyCount:long.perfect.length,trueKeyRank:1,trueKeyHits:trueLong.hits},
    fullReplayExact:exact,
    digitwiseControl:{maxHits:digit.maxHits,total:digit.completeWords,trueKeyHits:digit.rows.find(x=>x.keyIndex===keyOf(k)).hits},
    independentPadControl:{maxHits:independent.maxHits,total:independent.completeWords,trueKeyHits:independent.rows.find(x=>x.keyIndex===keyOf(k)).hits},
    top76:short.top.slice(0,3),top152:long.top.slice(0,3)
  };
});
assert.deepEqual(plants.map(x=>[x.start,x.endExclusive,x.words,x.runes,x.splitWord,x.seamRemainder,x.prefixOov]),[
  [1855,1931,76,299,"THE",1,[]],
  [1990,2069,79,299,"THE",1,["INFERR"]],
  [2375,2453,78,299,"SEE",1,["MUSED"]]
]);
assert.deepEqual(plants.map(x=>[x.suffix152.total,x.suffix152.trueKeyHits,x.digitwiseControl.maxHits,x.independentPadControl.maxHits]),[
  [34,34,6,5],[39,39,5,4],[38,37,3,3]
]);

// Original p54 black body + p55, with the open seam carried across the page.
const p54Source=removeFirstRunes(lp2Blocks[53],9);
const p54=parseRunicWords(p54Source,false),p55=parseRunicWords(lp2Blocks[54],true);
const originalWords=p54.words.concat([p54.partial.concat(p55.words[0])],p55.words.slice(1));
const original=originalWords.flat(),originalOffsets=wordOffsets(originalWords);
assert.equal(corpus.pages.find(p=>p.page===54).indices.length,232);
assert.equal(corpus.pages.find(p=>p.page===55).indices.length,76);
assert.deepEqual(ink.pages.find(p=>p.page===54).red_spans.map(x=>({start:x.start,length:x.length})),[{start:0,length:9}]);
assert.deepEqual([p54.words.length,p54.partial.length,p55.words[0].length,p55.words.length-1,original.length,originalWords.length],[47,10,1,16,299,64]);
const original76=search(original,originalOffsets,223),original152=search(original,originalOffsets,147);
const divinity=original76.rows.find(x=>x.keyIndex===keyOf(keyDigits.DIVINITY));
assert.deepEqual([original76.completeWords,original76.maxHits,original76.perfect.length,divinity.hits],[16,6,0,0]);
assert.deepEqual([original152.completeWords,original152.maxHits,original152.perfect.length],[31,7,0]);

console.log(JSON.stringify({
  model:{base:29,keyLength:8,keyDirection:"MSB-first, aligned at chapter origin",operation:"C=(P+K) mod 29^N",carry:"standard right-to-left addition; least-significant carry 0; discard final MSB overflow",wordPageResets:false,FBypass:false},
  lexicon:{trainingTypes:training.size,externalTypes:external.size,rawForms:lex.size,q8Candidates:q8.length},
  plants,
  original:{p54BlackRunes:223,p55Runes:76,totalRunes:original.length,totalWords:originalWords.length,
    p54CompleteWords:p54.words.length,p54OpenSeamRunes:p54.partial.length,p55SeamRune:p55.words[0].length,p55CompleteWords:p55.words.length-1,
    suffix76:{completeWords:original76.completeWords,maxHits:original76.maxHits,perfectKeyCount:original76.perfect.length,divinityHits:divinity.hits,top:original76.top.slice(0,12)},
    suffix152:{completeWords:original152.completeWords,maxHits:original152.maxHits,perfectKeyCount:original152.perfect.length,top:original152.top.slice(0,12)}},
  disposition:"The frozen native-q8 repeated BASE29 carry receiver is recovered on all three positive plants and fails the original p54-p55 suffixes decisively."
},null,2));
