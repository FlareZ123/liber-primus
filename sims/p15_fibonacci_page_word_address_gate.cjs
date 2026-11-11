"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourcePages = read("resources/lp2-transcription.txt").split("%");
assert.equal(sourcePages.length, 57);
function printedWords(page) {
  return page.replaceAll("/", "").replaceAll("\n", "").replaceAll("\r", "")
    .split(/[-.&$§,:!?]/u)
    .map((piece) => (piece.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const pages = Array.from({length:58}, (_, p) =>
  p === 50 ? [] : printedWords(sourcePages[p > 50 ? p - 1 : p]));
assert.equal(pages.reduce((n, p) => n + p.length, 0), 2973);
assert.equal(pages[50].length, 0);
function firstPrimes(count) {
  const out = [];
  for (let n=2; out.length<count; n++) {
    let prime=true;
    for (let d=2; d*d<=n; d++) if (n%d===0) { prime=false; break; }
    if (prime) out.push(n);
  }
  return out;
}
const mod=(n,m)=>((n%m)+m)%m;
const fibonacci=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
const primeValues=grid.map(v=>Math.abs(3301-v));
const primeList=firstPrimes(988);
const ordinals=primeValues.map(p=>primeList.indexOf(p)+1);
assert.deepEqual(primeValues,[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
assert.deepEqual(ordinals,[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);

assert.deepEqual(ordinals,fibonacci.map(f=>f+1));

// The original p15 JPEG shows an infinity mark and a red arrow at the first
// body line below the grid. The page's nine-rune heading precedes 150 body
// runes. Continue the distinct-Fibonacci sequence encoded by the grid,
// reduce it in the native 29-symbol alphabet, and apply the p56 additive
// shift operation in both directions. n=F+1 is the displayed prime ordinal.
const page15Indices=corpus.pages[15].indices;
assert.equal(page15Indices.length,159);
const page15Body=page15Indices.slice(9);
assert.equal(page15Body.length,150);
const fibStream=[0,1,2];
while(fibStream.length<page15Body.length)
  fibStream.push(fibStream[fibStream.length-1]+fibStream[fibStream.length-2]);
assert.deepEqual(fibStream.slice(0,16),fibonacci);
const ordinalStream=fibStream.map(f=>f+1);
const decodeIndices=(indices)=>indices.map(i=>corpus.translit[i]).join("");
const transformBody=(stream,sign)=>decodeIndices(page15Body.map((v,i)=>mod(v+sign*mod(stream[i],29),29)));
const page15InfinityArrow={
  pageRuneCount:page15Indices.length,headingRunes:9,bodyRunes:page15Body.length,
  first16DistinctFibonacci:fibStream.slice(0,16),
  first40FibonacciMod29:fibStream.slice(0,40).map(x=>x%29),
  first40OrdinalMod29:ordinalStream.slice(0,40).map(x=>x%29),
  subtractF:transformBody(fibStream,-1),
  addF:transformBody(fibStream,1),
  subtractOrdinal:transformBody(ordinalStream,-1),
  addOrdinal:transformBody(ordinalStream,1)
};
assert.equal(page15InfinityArrow.subtractF,"LFMGFOERBJOMJFIFNGDHABBXNSJSAEEAMDEOMNMETDEOOEGFGHEOTGYABEOEWXJTEOREARFYTYNGOUSHEOHOOEEOPAEERHJEUIAEXEAFRJEABTNGMLNDTIEOACTSHTHNGSTHDHCIAULXEARSAEJDSEOWLOHTLAEUOENGEAFFJXIFELXEMNGUAW");
assert.equal(page15InfinityArrow.addF,"LTHDEOINUUNGYDNTHITHDIAXCRXIAMNSPIAEANGAETAEMGSFRGYRTHGIXLEOWJXTHOUENEEOGUHGWODCPAMGXHCATMGCUNGMIUJTHJNPIAECAEIDSAEOOENUDOEXDEESNIXUOYCFYMOPIASBMBDREAHSEACOOETHIAFDAELYMUFNIAEAIMPCOM");
assert.equal(page15InfinityArrow.subtractOrdinal,"MEAECEANGOTITHEIEANEALOEWDTTPHXIXAIAEOEJEHEBSOEJNGCEACWJSCAEDTBNGGPISJOIAOEAAESAELTHFXWJWTHNGJEOABOWJEUIAEXEAFRJEABTNGMLNDTIEOACTSHTHNGSTHDHCIAULXEARSAEJDSEOWLOHTLAEUOENGEAFFJXIFELXEMNGUAW");
assert.equal(page15InfinityArrow.addOrdinal,"NGOAPJITHTHOEIAAIOJOAEASGCSEALITXEAFOEYBYLWTUCWIACOWJSNGPHEOSORTHMIMPWTHNWHRAGXAELWSNGAEBLWGTHOEMIUJTHJNPIAECAEIDSAEOOENUDOEXDEESNIXUOYCFYMOPIASBMBDREAHSEACOOETHIAFDAELYMUFNIAEAIMPCOM");

function decode(word) {
  return [...word].map(r=>corpus.translit[corpus.runes.indexOf(r)]).join("");
}
function address(page,wordNumber,spiral) {
  const wordIndex=wordNumber-1,word=pages[page]?.[wordIndex]??null;
  return {spiral:spiral+1,page,wordNumber,wordIndex,word,transliteration:word?decode(word):null};
}
const A=primeValues.map((p,i)=>address(mod(p,56),mod(ordinals[i]-1,56)+1,i));
const B=primeValues.map((p,i)=>address(mod(fibonacci[i],56),mod(p-1,56)+1,i));
assert.deepEqual(A.map(x=>[x.page,x.wordNumber]),[[2,1],[3,2],[5,3],[7,4],[13,6],[23,9],[43,14],[23,22],[37,35],[39,56],[15,34],[45,33],[25,10],[17,42],[27,51],[33,36]]);
assert.deepEqual(A.map(x=>x.transliteration),["OEM","EOHNGCTHTAEJTXH","CNGD","LCJ","U","NGWURS","FOE","FAOIANGBEATHCA","IAEOE",null,"BHAEJIAI","LWCJWX","NGXXAE","EOGHEM","OERIANCCT","TJ"]);
assert.deepEqual(B.map(x=>[x.page,x.wordNumber]),[[0,2],[1,3],[2,5],[3,7],[5,13],[8,23],[13,43],[21,23],[34,37],[55,39],[33,15],[32,45],[9,25],[41,17],[50,27],[35,33]]);
assert.deepEqual(B.map(x=>x.transliteration),["SYENGC","OEAAENGSDPT","EARB","PNYASMB","EEADR","YSHUL","EATHML","RYIU","OE",null,"STHEAWJ",null,"GPIC","BTHOEEOYOEIB",null,"JRIA"]);
const validA=A.filter(x=>x.word),validB=B.filter(x=>x.word);
assert.equal(validA.length,15); assert.equal(validB.length,13);
function primeSum(word) {
  return [...word].reduce((s,r)=>{
    const i=corpus.runes.indexOf(r); assert.notEqual(i,-1); return s+corpus.prime[i];
  },0);
}
function next(page,index) {
  const word=pages[page]?.[index]; if(!word)return null;
  const s=primeSum(word),p=s%58,i=Math.floor(s/58);
  return pages[p]?.[i]?{page:p,index:i}:null;
}
function trace(start) {
  let p=start.page,i=start.index,steps=0,hitEnd=false;
  const seen=new Set(),path=[];
  while(pages[p]?.[i]) {
    const key=p+":"+i;
    if(seen.has(key))return {hitEnd,steps,stop:"cycle",cycleAt:key,path};
    seen.add(key);
    const word=pages[p][i],sum=primeSum(word);
    path.push({page:p,wordNumber:i+1,transliteration:decode(word),sum});
    if(p===56&&i===1)hitEnd=true;
    const n=next(p,i);
    if(!n)return {hitEnd,steps:steps+1,stop:"missing",path};
    p=n.page;i=n.index;steps++;
  }
  return {hitEnd,steps,stop:"missing",path};
}
const all=pages.flatMap((p,page)=>p.map((_,index)=>({page,index})));
assert.equal(all.length,2973);
const endBasin=all.filter(x=>trace(x).hitEnd).length;
assert.equal(endBasin,192);
const tracesA=validA.map(x=>trace({page:x.page,index:x.wordIndex}));
const tracesB=validB.map(x=>trace({page:x.page,index:x.wordIndex}));
const endHitsA=tracesA.map((t,i)=>t.hitEnd?validA[i].spiral:null).filter(Boolean);
const endHitsB=tracesB.map((t,i)=>t.hitEnd?validB[i].spiral:null).filter(Boolean);
assert.deepEqual(endHitsA,[16]); assert.deepEqual(endHitsB,[]);
assert.deepEqual([tracesA.filter(t=>t.stop==="cycle").length,tracesA.filter(t=>t.stop==="missing").length],[13,2]);
assert.deepEqual([tracesB.filter(t=>t.stop==="cycle").length,tracesB.filter(t=>t.stop==="missing").length],[13,0]);
function p0(n) {
  let p=1;
  for(let i=0;i<n;i++)p*= (all.length-endBasin-i)/(all.length-i);
  return p;
}
const hitPath=tracesA.find(t=>t.hitEnd).path;
const endPath=hitPath.slice(0,hitPath.findIndex(x=>x.page===56&&x.wordNumber===2)+1);
assert.deepEqual(endPath.map(x=>[x.page,x.wordNumber,x.transliteration]),[[33,36,"TJ"],[38,2,"IAAETECF"],[1,7,"OEI"],[56,2,"OESR"]]);
const result={
  source:{gridSpiral:grid,fibonacci,primeValues,primeOrdinals},
  page15InfinityArrow,
  printedWordModel:{pages:58,printedWords:all.length,page50Words:0},
  readingA:{rule:"page=p mod56; word=((ordinal-1) mod56)+1",valid:validA.length,addresses:A.map(x=>({spiral:x.spiral,page:x.page,word:x.wordNumber,token:x.transliteration})),recursiveEndHits:endHitsA,stops:{cycles:13,missing:2}},
  readingB:{rule:"page=F mod56; word=((p-1) mod56)+1",valid:validB.length,addresses:B.map(x=>({spiral:x.spiral,page:x.page,word:x.wordNumber,token:x.transliteration})),recursiveEndHits:endHitsB,stops:{cycles:13,missing:0}},
  recursivePointer:{rule:"word prime-sum S -> page S mod58, zero-based word index floor(S/58)",endNode:{page:56,zeroBasedWordIndex:1,token:"OESR",knownPlaintext:"END"},basin:{nodes:endBasin,total:all.length,fraction:endBasin/all.length},readingA:{expectedHits:validA.length*endBasin/all.length,pAtLeastOne:1-p0(validA.length),endPath},readingB:{expectedHits:validB.length*endBasin/all.length,pZero:p0(validB.length)}},
  decision:"Both direct paired page/word readings, their fixed recursive continuation, and the source-motivated infinite Fibonacci-mod29 additive reading of the p15 arrow-targeted body are bounded negatives; no unknown plaintext or key recovered."
};
assert.ok(Math.abs(result.recursivePointer.readingA.expectedHits-0.9687184661957619)<1e-12);
assert.ok(Math.abs(result.recursivePointer.readingA.pAtLeastOne-0.6335382418834523)<1e-12);
assert.ok(Math.abs(result.recursivePointer.readingB.expectedHits-0.8395560040363269)<1e-12);
assert.ok(Math.abs(result.recursivePointer.readingB.pZero-0.41907339665748883)<1e-12);
process.stdout.write(JSON.stringify(result,null,2)+"\n");
