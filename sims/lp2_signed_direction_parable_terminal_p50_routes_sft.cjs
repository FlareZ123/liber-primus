"use strict";
/**
 * Source-selected 2016 DIRECTION + 2013 PARABLE p50 pointer paths,
 * 2014 LP2 terminal scan-order 72,73,74 and 2016 THE DEVOTED page32.
 * Verify exact original source graphs, no language fits or hidden params.
 * Windows Node.js 22, read-only CommonJS with no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
assert(signed.includes("their numbers are the direction."));
assert(signed.includes("epiphany seeks the devoted."));
assert(signed.includes("words are the map"));
const words=gp.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
/** @param {string} sourceWord */
function gp0(sourceWord){
 let w=sourceWord.toUpperCase().replace(/ING/gu,"NG")
  .replace(/K|Q/gu,"C").replace(/V/gu,"U").replace(/Z/gu,"S");
 let sum=0;
 while(w){
   const x=words.find(t=>w.startsWith(t.token));
   assert(x,"not GP-encodable: "+w);
   sum+=x.i;w=w.slice(x.token.length);
 }
 return sum;
}
assert.equal(gp0("DIRECTION"),98);
assert.equal(gp0("THE"),20);
assert.equal(gp0("DEVOTED"),102);
const p50=table.pages.flatMap(page=>page.tokens);
assert.equal(p50.length,256);
assert.equal(table.alphabet.length,60);
const compactAlphabet=table.alphabet.replace("f","");
assert.equal(compactAlphabet.length,59);
/** @param {number} radix @param {number} index */
function value(radix,index){
 const a=radix===60?table.alphabet:compactAlphabet;
 const token=p50[index];
 const hi=a.indexOf(token[0]),lo=a.indexOf(token[1]);
 assert(hi>=0&&lo>=0);
 const x=radix*hi+lo;
 assert(x<256);
 return x;
}
const f=Array.from({length:256},(_,i)=>value(60,i));
/** @param {number} initial @param {number} n */
function follow(initial,n){
 let x=initial;const a=[x];
 for(let i=0;i<n;i++){x=f[x];a.push(x);}
 return a;
}
// Source document's DIRECTION identifies 72.jpg directly as a table cell.
const directionAddress=gp0("DIRECTION");
assert.equal(p50[directionAddress],"1C");
const firstScan=f[directionAddress];
assert.equal(firstScan,72);
const ordered=follow(firstScan,13);
assert.deepEqual(ordered,[72,164,105,63,51,59,69,73,79,82,201,74,205,76]);
const milestones=ordered.filter(x=>x===72||x===73||x===74);
assert.deepEqual(milestones,[72,73,74]);
assert.deepEqual([ordered.indexOf(72),ordered.indexOf(73),ordered.indexOf(74)],[0,7,11]);
for(const i of [55,56,57]){
 const filename=String(i+17)+".jpg";
 assert(fs.existsSync(path.join(root,"resources/liber-primus",filename)));
}
assert.deepEqual([55,56,57].map(p=>gp.pages[p].indices.length),[76,85,95]);

// A radix pair at fixed, independently selected source addresses selects
// the last four scan file names and both p55 body/full-runic lengths.
const source=gp.pages[57].indices;
const sums=[source.slice(7,37),source.slice(37,67),source.slice(67,95)]
 .map(part=>part.reduce((a,i)=>a+gp.prime[i],0));
assert.deepEqual(sums,[1259,1031,1229]);
/** @param {number} n */
function primeRank(n){
 let k=0;
 for(let v=2;v<=n;v++){
   let p=true;
   for(let d=2;d*d<=v;d++)if(v%d===0){p=false;break;}
   if(p)k++;
 }
 return k;
}
const primes=sums.map(primeRank);
assert.deepEqual(primes,[205,173,201]);
assert.deepEqual([98,201,205].map(i=>p50[i]),["1C","1E","1G"]);
assert.deepEqual([98,201,205].map(i=>value(59,i)),[71,73,75]);
assert.deepEqual([98,201,205].map(i=>value(60,i)),[72,74,76]);
assert.equal(gp.pages[55].indices.length,76);
assert.equal(gp.pages[55].indices.slice(1).length,75);
assert.equal(f[74],205);
assert.equal(f[205],76);
// The already-solved p56 PAGE has exact native GP prime value 224.
const gpPage="ᛈᚪᚷᛖ";
const section=solved.sections.find(s=>s.name==="p56_an_end");
assert.equal(section.source_text.split(gpPage).length-1,2);
assert.equal([...gpPage].reduce((sum,rune)=>{
 const n=gp.runes.indexOf(rune);
 assert(n>=0);
 return sum+gp.prime[n];
},0),224);

// The third independent source PARABLE ordinal selects the 56-ancestor tree.
// The eight-ancestor middle ordinal supplies a self-consistent 8-bit pointer.
const reverse=Array.from({length:256},()=>[]);
f.forEach((parent,i)=>reverse[parent].push(i));
/** @param {number} rootId */
function ancestors(rootId){
 const queue=[rootId],seen=new Set(queue);
 for(let j=0;j<queue.length;j++)
   for(const child of reverse[queue[j]])
     if(!seen.has(child)){seen.add(child);queue.push(child);}
 return queue.sort((a,b)=>a-b);
}
assert.deepEqual(primes.map(i=>ancestors(i).length),[58,8,56]);
const middle=ancestors(173);
assert.deepEqual(middle,[26,41,84,93,147,173,215,239]);
const digitLine=middle.map(i=>p50[i][0]).join("");
assert.equal(digitLine,"21212112");
const bits=[...digitLine].map(ch=>String(Number(ch)-1)).join("");
assert.equal(bits,"10101001");
const corner=parseInt(bits,2);
assert.equal(corner,169);
assert.equal(corner,primes[1]+primes[2]-primes[0]);
assert.equal(p50[corner],"3m");
assert.equal(value(59,corner),224);
assert.equal(value(60,corner),228);
assert.deepEqual(follow(corner,6),[169,228,144,125,20,102,32]);
assert.equal(f[gp0("THE")],gp0("DEVOTED"));
assert.equal(f[gp0("DEVOTED")],32);
assert.equal(gp.pages[32].indices.length,121);

// These are exact conditional counts in the original graph, not design p.
const parent20AtFour=Array.from({length:256},(_,i)=>i)
 .filter(i=>follow(i,4)[4]===20);
assert.deepEqual(parent20AtFour,[168,169,252]);
const eightRoots=Array.from({length:256},(_,i)=>i).filter(i=>ancestors(i).length===8);
assert.deepEqual(eightRoots,[28,81,112,113,148,173]);
assert.deepEqual(eightRoots.filter(i=>
 ancestors(i).every(node=>/^[12]$/u.test(p50[node][0]))),[173]);

console.log(JSON.stringify({
 status:"PASS",
 sourceRoute:"2016 signed DIRECTION and p57 2013 authenticated PARABLE prime indices",
 sourceWordAddresses:{DIRECTION:98,THE:20,DEVOTED:102},
 threeTokenRadixPair:{addresses:[98,201,205],printed:["1C","1E","1G"],
   base59:[71,73,75],base60:[72,74,76]},
 originalImageScanPath:ordered,
 matchingFileNames:["72.jpg","73.jpg","74.jpg"],
 sourceP55RuneCount:76,sourceP55IntactBody:75,
 sourcePrimeOrdinals:primes,sourceReverseAncestorSizes:[58,8,56],
 middleEightDigitReadout:digitLine,bitString:bits,decodedCorner:corner,
 cornerToSignedWordsAndP32:follow(corner,6),
 exactOriginalFourStepStartersForTHE20:parent20AtFour,
 caveat:"No source-authored instruction fixes radix switching, pointer stopping, page-node assignment, or original decryption operator. Zero unknown-page plaintext recovered."
},null,2));
