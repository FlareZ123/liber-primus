"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/lp2-transcription.txt");
const quadgrams=read("resources/control/duko_round27_english_quadgrams.txt");
const gibranText=read("resources/control/gibran_prophet_58585.txt").replace(/^\uFEFF/u,"");
const runeSet=new Set(corpus.runes);
const p57Raw=transcription.split("%")[56];
const words=[];
let current=[];
for(const ch of [...p57Raw]){
 if(runeSet.has(ch))current.push(corpus.runes.indexOf(ch));
 else if(ch==="-"||ch==="."){if(current.length){words.push(current);current=[];}}
}
if(current.length)words.push(current);
assert.equal(words.length,20);
const translit=indices=>indices.map(i=>corpus.translit[i]).join("");
assert.equal(translit(words[0]),"PARABLE");
assert.equal(translit(words[19]),"EMERGE");
const bodyWords=words.slice(1);
assert.equal(bodyWords.length,19);
const bodyWordSums=bodyWords.map(word=>word.reduce((sum,index)=>sum+corpus.prime[index],0));
assert.deepEqual(bodyWordSums,[184,72,280,339,66,72,246,86,186,232,21,55,451,151,72,376,115,215,300]);
const p55=corpus.pages[55].indices;
assert.equal(p55.length,76);
const pairs=bodyWordSums.map((value,index)=>({value,index}));
const ascending=pairs.slice().sort((a,b)=>a.value-b.value||a.index-b.index).map(x=>x.index);
const descending=pairs.slice().sort((a,b)=>b.value-a.value||a.index-b.index).map(x=>x.index);
function decryptColumnsToRows(cipher,order){
 const grid=Array.from({length:4},()=>Array(19));let k=0;
 for(const col of order)for(let row=0;row<4;row++)grid[row][col]=cipher[k++];
 return grid.flat();
}
function readColumnsFromRows(cipher,order){
 const grid=Array.from({length:4},(_,row)=>cipher.slice(row*19,(row+1)*19));
 const output=[];for(const col of order)for(let row=0;row<4;row++)output.push(grid[row][col]);
 return output;
}
const outputs={
 decryptAsc:decryptColumnsToRows(p55,ascending),
 decryptDesc:decryptColumnsToRows(p55,descending),
 readAsc:readColumnsFromRows(p55,ascending),
 readDesc:readColumnsFromRows(p55,descending)
};
const mod=(n,m)=>((n%m)+m)%m;
const wordSumsMod4=bodyWordSums.map(x=>x%4);
function rotateColumns(sign){
 const grid=Array.from({length:4},(_,row)=>p55.slice(row*19,(row+1)*19));
 const rotated=Array.from({length:4},()=>Array(19));
 for(let col=0;col<19;col++)for(let row=0;row<4;row++)
  rotated[row][col]=grid[mod(row+sign*wordSumsMod4[col],4)][col];
 return rotated.flat();
}
const rotations={shiftPlus:rotateColumns(1),shiftMinus:rotateColumns(-1)};
const expectedRotations={
 shiftPlus:"NGAEMEBSEOCEOSUCXDAEFBEBCUWISEAOECEAMEAGDTHNGLIAASDIAPRWHBXMEMCPHXGEOMSEOTHTHFBTHFXIIEOEIGJUSEI",
 shiftMinus:"NGAEMRBSEOCEOSMCPHAEFEOMBCUWFSEAOECEAMEOEIGNGLSESDIAPEWHBXMEUCXDXGBESEOTHTHIBTHFXIIEAGDTHJUIAAI"
};
for(const [name,indices] of Object.entries(rotations))assert.equal(indices.map(i=>corpus.translit[i]).join("").replace(/[^A-Z]/gu,""),expectedRotations[name]);

// Direct GP29 additive reading: one p57 body-word prime sum per p55 column.
// p55 is exactly four 19-rune rows, so the source-order key repeats four times.
const additiveKey=bodyWordSums.map(value=>mod(value,29));
function applyAdditive(sign){
 return p55.map((value,index)=>mod(value+sign*additiveKey[index%19],29));
}
const additiveOutputs={
 subtract:applyAdditive(-1),
 add:applyAdditive(1)
};
const expectedAdditive={
 subtract:"JJFMEAUOSWSLNWAEJUEAEOWATBPNXSSIAMNHYTHWNGPWCPPDNNDIAGFEWNGDFFWTGCTHBEOIAWBHGTIIAHIABYTHEGF",
 add:"THINUSFTHPTHSROIHIEAYWIASSYAAEPXPOEMOETHFXGMJTHAEREOOLAEOEYRAELSYEOEACXUAEOETNGNDTWRJIJTHUFAEFTUL"
};
for(const [name,indices] of Object.entries(additiveOutputs))assert.equal(translit(indices).replace(/[^A-Z]/gu,""),expectedAdditive[name]);
// Exact known-text round-trip control for the fixed 19-symbol additive implementation.
const plantedPlain=corpus.pages[57].indices.slice(0,76);
const plantedCipher=plantedPlain.map((value,index)=>mod(value+additiveKey[index%19],29));
const plantedRecovered=plantedCipher.map((value,index)=>mod(value-additiveKey[index%19],29));
assert.deepEqual(plantedRecovered,plantedPlain);
const expected={
 decryptAsc:"MDSCMIAXEAPEANGWUHUCMEOESTHEOEASAGFFEAESBNGWXUCSDAETHIEOBSXBIMBELRDCEOTHIAFTHMGCEIHGIXIEOBJPEOE",
 decryptDesc:"MXIAMCSUEAHEAUCNGPEWEOMDSGASEAEOWENGFBXAEFSSCUTHDSBEOITHRILXEDMBTHBEOCAEIAECGMTHBGEOIIJIHOEXEPF",
 readAsc:"EOUEAMGCECWBBSAEUIATHSEAHTHAENGXJXXCCIAEOSBTHHGDNGCDEOMIEOEAAMEESMEIBFEOOEMWPTHBSSIIRFEFLGUDPIX",
 readDesc:"DPIXFLGUIRFEBSSIMWPTHBFEOOESMEIAMEEMIEOEANGCDEOTHHGDIAEOSBXXCCAEUIATHSEAHTHAENGXJWBBSGCECEOUEAM"
};
const expand=indices=>translit(indices).replace(/[^A-Z]/gu,"");
for(const [name,indices] of Object.entries(outputs))assert.equal(expand(indices),expected[name]);
const counts=new Map();let total=0;
for(const line of quadgrams.trim().split(/\r?\n/u)){
 const match=line.match(/^([A-Z]{4})\s+(\d+)$/u);
 if(match){const n=Number(match[2]);counts.set(match[1],n);total+=n;}
}
function score(text){
 let sum=0,windows=0,known=0;
 for(let i=0;i+4<=text.length;i++){
  const count=counts.get(text.slice(i,i+4))??0;
  sum+=Math.log10((count+0.1)/(total+0.1*26**4));windows++;
  if(count>0)known++;
 }
 return {mean:sum/windows,known,windows};
}
const startMarker="*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***";
const endMarker="*** END OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***";
const start=gibranText.indexOf(startMarker),end=gibranText.indexOf(endMarker);
assert.ok(start>=0&&end>start);
const body=gibranText.slice(start+startMarker.length,end);
const translitMap=new Map(corpus.translit.map((token,index)=>[token,index]));
function encodeEnglishWord(word){
 const normalized=word.toUpperCase().replace(/QU/gu,"CW").replace(/V/gu,"U").replace(/K/gu,"C").replace(/Z/gu,"S");
 const encoded=[];
 for(let i=0;i<normalized.length;){
  const digraph=normalized.slice(i,i+2);
  if(translitMap.has(digraph)){encoded.push(translitMap.get(digraph));i+=2;}
  else if(translitMap.has(normalized[i])){encoded.push(translitMap.get(normalized[i]));i+=1;}
  else i+=1;
 }
 return encoded;
}
const nativeRunes=(body.toUpperCase().match(/[A-Z]+/gu)??[]).flatMap(encodeEnglishWord);
const nativeScores=[];
for(let i=0;i+76<=nativeRunes.length;i++)nativeScores.push(score(expand(nativeRunes.slice(i,i+76))).mean);
nativeScores.sort((a,b)=>a-b);
assert.equal(nativeScores.length,47959);
const rawScore=score(expand(p55));
const candidateScores=Object.fromEntries(Object.entries(outputs).map(([name,indices])=>[name,score(expand(indices))]));
const rotationScores=Object.fromEntries(Object.entries(rotations).map(([name,indices])=>[name,score(expand(indices))]));
const additiveScores=Object.fromEntries(Object.entries(additiveOutputs).map(([name,indices])=>[name,score(expand(indices))]));
assert.ok(Object.values(rotationScores).every(x=>x.mean<rawScore.mean));
assert.ok(Object.values(candidateScores).every(x=>x.mean<nativeScores[0]));
assert.ok(Object.values(additiveScores).every(x=>x.mean<rawScore.mean));
assert.ok(Object.values(additiveScores).every(x=>x.mean<nativeScores[0]));
const result={
  p57:{totalWords:words.length,heading:translit(words[0]),bodyWords:bodyWords.map(translit),bodyWordSums,terminalWord:translit(words[19])},
  p55:{runes:p55.length,rows:4,columns:19},
  keyOrders:{ascending,descending},
  outputs:Object.fromEntries(Object.entries(outputs).map(([name,indices])=>[name,expand(indices)])),
  wordSumsMod4,
  columnRotations:Object.fromEntries(Object.entries(rotations).map(([name,indices])=>[name,expand(indices)])),
  rotationScores,
  additiveKeyModulo29:additiveKey,
  directAdditiveOutputs:Object.fromEntries(Object.entries(additiveOutputs).map(([name,indices])=>[name,expand(indices)])),
  directAdditiveScores:additiveScores,
  additiveRoundTrip:{plaintextRunes:plantedPlain.length,recoveredRunes:plantedRecovered.length,exact:plantedRecovered.every((value,index)=>value===plantedPlain[index])},
  scores:{raw:rawScore,candidates:candidateScores,native:{windows:nativeScores.length,minimum:nativeScores[0],median:nativeScores[Math.floor(nativeScores.length/2)]}},
  decision:"The direct repeating 19-symbol GP29 additive key fails in both signs: both scores are below raw p55 and every native 76-rune Gibran window. The 19-column transpositions and per-column rotations also fail. These are bounded candidate negatives, not a source-authenticated cipher exclusion."
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
