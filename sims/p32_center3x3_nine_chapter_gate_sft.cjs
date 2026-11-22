"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const root=path.resolve(__dirname,"..");
const readJson=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=readJson("resources/liber-primus/lp2-corpus.json");
const master=fs.readFileSync(path.join(root,"resources/transcriptions/liber_primus_master.txt"),"utf8");
const lp1Reference=fs.readFileSync(path.join(root,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
const sourceNativeModel=buildSourceNativeTrigramModel({corpus,referenceText:lp1Reference});
const mod29=x=>((x%29)+29)%29;
const glyphSet=new Set(corpus.runes);
const glyphIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const translit=xs=>xs.map(i=>corpus.translit[i]).join("");
const sourceNativeSpelling=xs=>sourceNativeModel.spell(xs);
const runeWords=s=>s.split(/[-.&$§]/u).map(part=>Array.from(part).filter(g=>glyphSet.has(g)).map(g=>glyphIndex.get(g))).filter(w=>w.length);
const page0Incipit=corpus.pages[0].indices.slice(0,8).map(i=>corpus.runes[i]).join("");
const start=master.indexOf(page0Incipit);
assert(start>=0,"LP2 page 0 incipit missing");
const allPages=master.slice(start).split("%");
assert.equal(allPages.length,59);
const lp2Pages=allPages.slice(0,56);
const lp2Text=lp2Pages.join("%");
const runeCount=Array.from(lp2Text).filter(g=>glyphSet.has(g)).length;
const lp2Words=runeWords(lp2Text);
assert.equal(runeCount,12956);
assert.equal(lp2Words.length,2896);
assert.equal(runeWords(allPages[57]).length,20);
const chapterPages=[
 [0,1,2],[3,4,5,6,7],[8,9,10,11,12,13,14],[15,16,17,18,19,20,21,22],
 [23,24,25,26],[27,28,29,30,31,32],[33,34,35,36,37,38,39],
 [40,41,42,43,44,45,46,47,48,49,50,51,52,53],[54,55]
];
const expectedRuneLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedWordCounts=[158,255,383,437,224,326,378,669,66];
const chapters=chapterPages.map(group=>group.flatMap(page=>corpus.pages.find(p=>p.page===page).indices));
const chapterWords=chapterPages.map(group=>runeWords(group.map(p=>lp2Pages[p]).join("%")));
assert.deepEqual(chapters.map(x=>x.length),expectedRuneLengths);
assert.deepEqual(chapterWords.map(x=>x.length),expectedWordCounts);
assert.equal(chapterWords.flat().length,2896);
assert.equal(chapters.flat().length,12956);
assert.equal(corpus.pages.find(p=>p.page===50).indices.length,0);
const p32=corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
const grid=Array.from({length:11},(_,r)=>p32.slice(r*11,r*11+11));
const center=grid.slice(4,7).flatMap(row=>row.slice(4,7));
assert.deepEqual(center,[20,24,7,2,7,14,14,24,1]);
const primeWeights=center.map(i=>corpus.prime[i]);
const primeResidues=primeWeights.map(x=>x%29);
assert.deepEqual(primeWeights,[73,97,19,5,19,47,47,97,3]);
assert.deepEqual(primeResidues,[15,10,19,5,19,18,18,10,3]);
const centerCell=grid[5][5],centerCellPrimeResidue=corpus.prime[centerCell]%29;
assert.equal(centerCell,7);
assert.equal(centerCellPrimeResidue,19);
const quadgrams=new Map();
let quadgramTotal=0;
for(const line of fs.readFileSync(path.join(root,"resources/control/duko_round27_english_quadgrams.txt"),"utf8").trim().split(/\r?\n/u)){
 const [gram,countText]=line.trim().split(/\s+/u);
 if(gram&&countText){const n=Number(countText);quadgrams.set(gram,n);quadgramTotal+=n;}
}
assert.equal(quadgrams.size,79495);
assert.equal(quadgramTotal,7266795);
function score(chs){
 let sum=0,total=0;const perChapter=[];
 for(const indices of chs){
  const text=translit(indices).replace(/[^A-Z]/gu,"");let part=0,count=0;
  for(let i=0;i<=text.length-4;i++){part+=Math.log10((quadgrams.get(text.slice(i,i+4))||0.01)/quadgramTotal);count++;}
  sum+=part;total+=count;perChapter.push(part/count);
 }
 return {mean:sum/total,perChapter};
}
function ioc(chs){
 const values=chs.flat(),counts=Array(29).fill(0);for(const x of values)counts[x]++;
 return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
function chapterShift(chs,keys,sign){return chs.map((ch,s)=>ch.map(x=>mod29(x+sign*keys[s])));}
function globalShift(chs,key,sign){return chs.map(ch=>ch.map(x=>mod29(x+sign*key)));}
function repeat9(chs,key,phase,sign){
 let offset=0;
 return chs.map(ch=>{const base=phase==="chapter-reset"?0:offset;const out=ch.map((x,i)=>mod29(x+sign*key[(base+i)%9]));offset+=ch.length;return out;});
}
const raw={ioc:ioc(chapters),score:score(chapters),sourceNativeScore:sourceNativeModel.scoreChapters(chapters)};
const variants=[];
function add(name,meta,out,replay){assert.deepEqual(replay,chapters,name+" replay");variants.push({name,...meta,ioc:ioc(out),score:score(out),sourceNativeScore:sourceNativeModel.scoreChapters(out)});}
for(const [keyName,keys] of [["ordinal",center],["prime-residue",primeResidues]])for(const sign of [-1,1]){
 const out=chapterShift(chapters,keys,sign);add("chapter Caesar",{keyName,sign},out,chapterShift(out,keys,-sign));
}
for(const [keyName,key] of [["center-cell ordinal",centerCell],["center-cell prime-residue",centerCellPrimeResidue]])for(const sign of [-1,1]){
 const out=globalShift(chapters,key,sign);add("global center Caesar",{keyName,key,sign},out,globalShift(out,key,-sign));
}
for(const [keyName,key] of [["ordinal",center],["prime-residue",primeResidues]])for(const phase of ["continuous","chapter-reset"])for(const sign of [-1,1]){
 const out=repeat9(chapters,key,phase,sign);add("repeating 9-symbol key",{keyName,phase,sign},out,repeat9(out,key,phase,-sign));
}
const selectWords=keys=>keys.map((index,s)=>{
 assert(index>=1&&index<=chapterWords[s].length);
 const word=chapterWords[s][index-1];
 return {chapter:s+1,oneBasedWordIndex:index,runeLength:word.length,legacyTransliteration:translit(word),sourceNativeTransliteration:sourceNativeSpelling(word)};
});
const wordSelections={primeWeight:selectWords(primeWeights),ordinal:selectWords(center)};
const p57=corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57.length,95);
const p57Score=score([p57]);
const p57SourceNativeScore=sourceNativeModel.scoreStream(p57);
let positiveControls=0;
for(const keys of [center,primeResidues])for(const key of keys)for(const sign of [-1,1]){
 const encrypted=chapterShift([p57],[key],sign);
 assert.deepEqual(chapterShift(encrypted,[key],-sign),[p57]);positiveControls++;
}
for(const key of [centerCell,centerCellPrimeResidue])for(const sign of [-1,1]){
 const encrypted=globalShift([p57],key,sign);
 assert.deepEqual(globalShift(encrypted,key,-sign),[p57]);positiveControls++;
}
const planted=Array.from({length:9},()=>p57);
for(const key of [center,primeResidues])for(const phase of ["continuous","chapter-reset"])for(const sign of [-1,1]){
 const encrypted=repeat9(planted,key,phase,sign);
 assert.deepEqual(repeat9(encrypted,key,phase,-sign),planted);positiveControls++;
}
assert.equal(positiveControls,48);
const expectedScores=[
 -7.477996420674915,-7.501617441990411,-7.477440868513701,-7.4903345160035455,
 -7.465684971103718,-7.447525347621745,-7.4756541635815275,-7.505504009350975,
 -7.505829634984301,-7.495766529692274,-7.489741298645008,-7.504683903325993,
 -7.544464930634306,-7.502984542894498,-7.536632677767909,-7.532540445135153
];
assert.equal(variants.length,expectedScores.length);
variants.forEach((v,i)=>assert(Math.abs(v.score.mean-expectedScores[i])<1e-10));
assert(Math.abs(raw.score.mean-(-7.4391377865159365))<1e-10);
assert(Math.abs(p57Score.mean-(-4.420633417052125))<1e-10);
assert(Math.abs(raw.sourceNativeScore.mean-(-3.417534064366273))<1e-10);
assert(Math.abs(p57SourceNativeScore.mean-(-2.468144714244746))<1e-10);
const expectedSourceNativeScores=[-3.4147534132857045,-3.418528978772266,-3.415200686819373,-3.4210530630070894,-3.4134216802685744,-3.415081357865264,-3.420672528860212,-3.413396068914289,-3.415064228871744,-3.417098396528964,-3.4145684401217826,-3.419894641791138,-3.4184556645479587,-3.4132494270166935,-3.41152704455519,-3.4161898267147097];
variants.forEach((v,i)=>assert(Math.abs(v.sourceNativeScore.mean-expectedSourceNativeScores[i])<1e-10));
console.log(JSON.stringify({
 source:{center3x3Ordinal:center,center3x3Transliteration:translit(center),center3x3SourceNativeSpelling:sourceNativeSpelling(center),center3x3PrimeWeights:primeWeights,center3x3PrimeResidues:primeResidues,centerCellOrdinal:centerCell,centerCellPrimeResidue,chapterPages,chapterRuneLengths:chapters.map(x=>x.length),chapterWordCounts:chapterWords.map(x=>x.length),lp2RuneCount:runeCount,lp2WordCount:lp2Words.length},
 raw,variants,wordSelections,solvedP57PositiveControl:{length:p57.length,score:p57Score},positiveControls,
 result:"The tested direct central-3x3 key and word-address interpretations do not recover plaintext."
},null,2));
