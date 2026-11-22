"use strict";

/**
 * 2016 563x569 image-dimension book-address walk, exact original-source test.
 * This is a conditional navigation hypothesis, not recovered LP2 plaintext.
 * Node.js 20+, CommonJS, no packages and no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createDecipheriv} = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const chunks = read("resources/lp2-transcription.txt").split("%");
const prime = new Map(corpus.runes.map((ch,i) => [ch,corpus.prime[i]]));
assert.equal(chunks.length,57);
const gridTokens = table.pages.find(p => p.page===50).tokens;
assert.equal(gridTokens.length,104);
assert.deepEqual(table.pages.filter(p => [49,50,51].includes(p.page))
  .map(p => p.tokens.length),[80,104,72]);
assert.equal(grid.byte_rows[10][0],142);

/** @param {string} source @returns {string[]} */
function printedWords(source) {
  const words = [];
  let word = "";
  for (const ch of source) {
    if (prime.has(ch)) word += ch;
    else if (ch==="/" || /\s/u.test(ch)) continue;
    else if (word) { words.push(word); word=""; }
  }
  if (word) words.push(word);
  return words;
}
const words = Array.from({length:58},(_,p) => p===50 ? gridTokens
  : printedWords(chunks[p>=51?p-1:p]));
const wordSum = word => [...word].reduce((v,ch) => v + prime.get(ch),0);
assert.equal(wordSum(words[0][5]),563);
assert(words[0][5].startsWith("ᚾᛖᚹᛒᚪᛋ"));
assert.equal(wordSum(words[1][32]),569);
const row = corpus.pages.find(p => p.page===32).indices.slice(0,11);
const col = Array.from({length:11},(_,i) =>
  corpus.pages.find(p => p.page===32).indices[i*11]);
assert.equal(row.reduce((n,i)=>n+corpus.prime[i],0),563);
assert.equal(col.reduce((n,i)=>n+corpus.prime[i],0),569);
const originalSums = words.map((ws,p) => p===50 ? [] : ws.map(wordSum));

/**
 * @param {number} first
 * @param {number[][]} sums
 * @returns {{reason:string,path:number[],terminal:number,period?:number,enteredAt?:number}}
 */
function walk(first,sums) {
  let n=first;
  const seen = new Map(), route = [];
  for (let k=0;k<150;k++) {
    const p=n%58,idx=Math.floor(n/58);
    if (idx>=words[p].length) return {reason:"invalid",path:route,terminal:n};
    if (p===50) return {reason:"table",path:route,terminal:n};
    if (p>=56) return {reason:"solved",path:route,terminal:n};
    if (seen.has(n)) return {reason:"cycle",path:route,terminal:n,
      period:route.length-seen.get(n),enteredAt:seen.get(n)};
    seen.set(n,route.length);
    route.push(n);
    n=sums[p][idx];
  }
  throw new Error("Unexpected walk >150 steps");
}
const width = walk(563,originalSums),height = walk(569,originalSums);
assert.deepEqual(width.path,[
  563,180,267,66,250,157,276,245,427,211,258,285,227,111,
  117,604,226,495,162,225,255,522,83,17,78,101,264,191,
  362,307,384,320,290]);
assert.equal(width.terminal,563);
// Independent exact 2016 signed-prose words as unfitted GP-prime seeds.
// MAP is already on the width563 cycle; WORDS reaches it after one
// book-word lookup; WAY (also the candidate p15 source readout) after three.
// This is a conditional semantic navigation witness, not a decoding key.
/** @param {string} token @returns {number} */
function signedProseGPPrimeSum(token) {
  return [...token].reduce((acc,ch) => {
    const i=corpus.translit.indexOf(ch);
    assert(i>=0,"unmapped signed-prose rune "+ch);
    return acc+corpus.prime[i];
  },0);
}
const signedProseGPPrimeSums={
  WORDS:signedProseGPPrimeSum("WORDS"),
  MAP:signedProseGPPrimeSum("MAP"),
  WAY:signedProseGPPrimeSum("WAY")
};
assert.deepEqual(signedProseGPPrimeSums,{WORDS:179,MAP:211,WAY:219});
const wordSourceWalk=walk(179,originalSums);
const mapSourceWalk=walk(211,originalSums);
const waySourceWalk=walk(219,originalSums);
for(const result of [wordSourceWalk,mapSourceWalk,waySourceWalk]){
  assert.equal(result.reason,"cycle");
  assert.equal(result.period,33);
}
assert.equal(wordSourceWalk.enteredAt,1);
assert.equal(mapSourceWalk.enteredAt,0);
assert.equal(waySourceWalk.enteredAt,3);
assert.deepEqual(wordSourceWalk.path.slice(0,2),[179,117]);
assert.deepEqual(mapSourceWalk.path.slice(0,2),[211,258]);
assert.deepEqual(waySourceWalk.path.slice(0,4),[219,30,296,180]);
assert(width.path.includes(117)&&width.path.includes(211)&&width.path.includes(180));

assert.equal(width.period,33);
assert.equal(width.enteredAt,0);
assert.deepEqual(height.path,[569,374]);
assert.equal(height.reason,"table");
assert.equal(height.terminal,50);
assert.equal(words[50][0],"2M");

const short2012=walk(503,originalSums),long2012=walk(509,originalSums);
assert.equal(short2012.reason,"cycle");
assert.equal(short2012.period,4);
assert.equal(long2012.reason,"table");
assert.equal(long2012.terminal,166);
console.log("2016 width563: 33-word original cycle through p0:w5.");
console.log("2016 height569: 569 -> 374 -> p50:w0, token 2M;",
  "global grid cell80 (zero-based), row10 column0, byte142.");
console.log("2012 controls: 503 enters 4-cycle; 509 reaches p50:w2 in 5 hops.");
console.log("Full 563 cycle GP prime sums:",width.path.join(","));

// One predeclared table consumer: 32 non-starting cycle values as a
// 32-byte key modulo256, decrypt the original 256-byte table with AES256-ECB.
// This source-motivated consumer is exploratory and not historically instructed.
const key=Buffer.from(width.path.slice(1).map(n => n%256));
const bytes=Buffer.from(grid.byte_rows.flat());
assert.equal(key.length,32);
assert.equal(bytes.length,256);
assert.equal(key.toString("hex"),
  "b40b42fa9d14f5abd3021de36f755ce2efa2e1ff0a53114e6508bf6a33804022");
const decrypt=createDecipheriv("aes-256-ecb",key,null);
decrypt.setAutoPadding(false);
const decoded=Buffer.concat([decrypt.update(bytes),decrypt.final()]);
assert.equal(decoded.subarray(0,16).toString("hex"),
  "ec728a5f0ef6c14bbabdc4abf60f0fa4");
const printable=decoded.reduce((n,v)=>n+(v>=32&&v<=126),0);
assert.equal(printable,93);
console.log("32-cycle-value AES256-ECB key:",key.toString("hex"));
console.log("AES256-ECB table plaintext prefix:",decoded.subarray(0,24).toString("hex"));
console.log("AES256-ECB printable bytes:",printable,"/256 (not recognizable plaintext)");



// One frozen source-shaped 32-row direct consumer: use the 32 noninitial
// orbit sums as one byte key for each original eight-cell table row.
// Original keys, row order, operations and mod-256 byte grammar stay fixed.
const orbitRowKeys=width.path.slice(1).map(n=>n%256);
assert.equal(orbitRowKeys.length,32);
const orbitRowModes=[
 ["xor",(v,k)=>(v^k)&255,(v,k)=>(v^k)&255,96,
   "7f53130ed559ca0357f297d5fc0fbcdf3b884d6324cb7915"],
 ["minus",(v,k)=>(v-k+256)&255,(v,k)=>(v+k)&255,98,
   "1733f306ad39ca0351ee91d3ecf9acc93788cddf2447f915"],
 ["plus",(v,k)=>(v+k)&255,(v,k)=>(v-k+256)&255,91,
   "7f9b5b6e15a1326b6704a7e9020fc2dfbb0c5163a8cb7d99"]
];
const orbitAsciiPlant=Buffer.from(Array.from({length:256},(_,i)=>65+i%26));
for(const [label,apply,inverse,nPrintable,expectedHex] of orbitRowModes) {
  const transform=data=>Buffer.from(data.map((v,i)=>apply(v,orbitRowKeys[i>>3])));
  const recover=data=>Buffer.from(data.map((v,i)=>inverse(v,orbitRowKeys[i>>3])));
  const decoded=transform(bytes);
  assert.equal(decoded.subarray(0,24).toString("hex"),expectedHex);
  assert.equal(decoded.reduce((n,v)=>n+(v>=32&&v<=126),0),nPrintable);
  assert(recover(decoded).equals(bytes));
  assert(recover(transform(orbitAsciiPlant)).equals(orbitAsciiPlant));
  console.log("Original 32-row",label,nPrintable,"/256 printable; roundtrip passed");
}

/**
 * One historical 2014 "let the text guide you" source-key transfer:
 * concatenate the 33 original orbit words, starting with the 563-selected
 * word. Use those exact GP tokens as the period-147 Vigenere subtraction key
 * with an independently reset key phase at each candidate target-page start.
 * This complete inverse does not fit any original ciphertext parameter.
 */
const orbitRuneKey=[...width.path.map(n=>words[n%58][Math.floor(n/58)]).join("")]
  .map(ch=>corpus.runes.indexOf(ch));
assert.equal(orbitRuneKey.length,147);
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const counts=Array(29).fill(0);
  for(const v of arr)counts[v]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));
}
for(const [page,expected] of [[32,0.03732782369146005],
                             [53,0.03621869311405436],
                             [55,0.03333333333333333]]) {
  const cipher=corpus.pages.find(p=>p.page===page).indices;
  const plain=cipher.map((v,i)=>(v-orbitRuneKey[i%147]+29)%29);
  assert.equal(ioc(plain),expected);
  assert(plain.every((v,i)=>(v+orbitRuneKey[i%147])%29===cipher[i]));
  console.log("Source-key 2014-Vigenere transfer, original p"+page,
    "count:",cipher.length,"decoded IoC:",ioc(plain).toFixed(12));
}

// Matched original-layout null: each page retains its GP-prime inventory,
// printed word lengths, and physical page position. Shuffle rune weights only
// within each of the 55 unknown rune-bearing physical pages. The signed 2016
// dimensions remain independent, unchanged 563 and 569.
const sourcePages=words.map((ws,p)=>p===50 ? null : ({
  lengths: ws.map(w=>[...w].length),
  values: ws.join("").split("").map(ch=>prime.get(ch))
}));
let state=0x33015635;
/** @returns {number} */
function random() {
  state ^= state<<13; state ^= state>>>17; state ^= state<<5;
  return state>>>0;
}
/** @param {number[]} values @param {number[]} lengths @returns {number[]} */
function reSum(values,lengths) {
  const sums=[];
  let j=0;
  for (const len of lengths) {
    let s=0;
    for (let i=0;i<len;i++)s+=values[j++];
    sums.push(s);
  }
  assert.equal(j,values.length);
  return sums;
}
const B=10000;
let anyCycle=0,exact33=0,heightFirst=0,heightAny=0,joint=0;
for(let k=0;k<B;k++) {
  const sums=originalSums.slice();
  for(let p=0;p<56;p++) {
    if(p===50)continue;
    const list=sourcePages[p];
    const v=list.values.slice();
    for(let j=v.length-1;j>0;j--){
      const at=random()%(j+1);
      [v[j],v[at]]=[v[at],v[j]];
    }
    sums[p]=reSum(v,list.lengths);
  }
  const a=walk(563,sums),b=walk(569,sums);
  const isExact33=a.reason==="cycle" && a.terminal===563 &&
    a.enteredAt===0 && a.period===33;
  const isFirst=b.reason==="table" && b.path.length===2 && b.terminal===50;
  if(a.reason==="cycle")anyCycle++;
  if(isExact33)exact33++;
  if(isFirst)heightFirst++;
  if(b.reason==="table" && b.path.length===2)heightAny++;
  if(isExact33 && isFirst)joint++;
}
assert.deepEqual([anyCycle,exact33,heightFirst,heightAny,joint],
  [3167,0,24,169,0]);
console.log("Within-page shuffled rune null B=10000, xorshift seed 0x33015635");
console.log({anyCycle,exact33,heightFirst,heightAny,joint});

/**
 * Independent null conditioning more tightly on the original word register:
 * shuffle complete source rune words ONLY among same-length word slots
 * within each physical page. This preserves every page's entire word-sum
 * inventory, source GP-rune spelling and printed slot lengths.
 * All event selectors are still retrospectively recognized.
 */
const equalLengthSlots = sourcePages.map((page,p) => {
  if (p===50 || p>=56) return [];
  const groups = new Map();
  for (let i=0;i<page.lengths.length;i++) {
    const size=page.lengths[i];
    if (!groups.has(size)) groups.set(size,[]);
    groups.get(size).push(i);
  }
  return [...groups.values()].filter(group=>group.length>1);
});
let wordState=0x33a0d01e;
/** @returns {number} */
function wordRandom() {
  wordState^=wordState<<13;wordState^=wordState>>>17;
  wordState^=wordState<<5;
  return wordState>>>0;
}
const W=20000;
let wordCycle=0,wordHeight=0,wordJoint=0,wordAnyCycle=0;
for(let k=0;k<W;k++) {
  const sums=originalSums.map(row=>row.slice());
  for(let p=0;p<56;p++) {
    if(p===50) continue;
    for(const group of equalLengthSlots[p]) {
      const values=group.map(j=>sums[p][j]);
      for(let j=values.length-1;j>0;j--) {
        const at=wordRandom()%(j+1);
        [values[j],values[at]]=[values[at],values[j]];
      }
      for(let j=0;j<group.length;j++) sums[p][group[j]]=values[j];
    }
  }
  const a=walk(563,sums),b=walk(569,sums);
  const ac=a.reason==="cycle" && a.terminal===563 &&
    a.period===33 && a.enteredAt===0;
  const bc=b.reason==="table" && b.path.length===2 && b.terminal===50;
  if(a.reason==="cycle")wordAnyCycle++;
  if(ac)wordCycle++;
  if(bc)wordHeight++;
  if(ac&&bc)wordJoint++;
}
assert.deepEqual([wordCycle,wordHeight,wordJoint,wordAnyCycle],
  [1,577,0,8485]);
console.log("20,000 page-and-word-length-preserving whole-word shuffles",
  {wordCycle,wordHeight,wordJoint,wordAnyCycle});


/**
 * A genuinely independent publication-envelope cross-check: the dated 2014
 * Stage11 HTML carries <title>133</title> and <div id="331">. Keep the
 * already frozen 2016 signed-image 563/569 book-word addressing rule and
 * evaluate both earlier source numerals without fitting a new map.
 *
 * Both pairs split identically: 133 reaches the 563 33-cycle, and 331
 * reaches the identical physical p50 first numeric token as 569. These
 * are original-data coincidences under a *hypothetical* navigation rule.
 */
const stage11=read("resources/historical/stage11-2014-index.html");
assert.match(stage11,/<title>133<\/title>/);
assert.match(stage11,/<div id="331">/);
const title133=walk(133,originalSums),div331=walk(331,originalSums);
assert.deepEqual(title133.path,[
  133,107,104,299,225,255,522,83,17,78,101,264,191,362,307,
  384,320,290,563,180,267,66,250,157,276,245,427,211,258,
  285,227,111,117,604,226,495,162]);
assert.equal(title133.reason,"cycle");
assert.equal(title133.period,33);
assert.equal(title133.enteredAt,4);
assert.deepEqual(div331.path,[331,68]);
assert.equal(div331.reason,"table");
assert.equal(div331.terminal,50);
assert.equal(height.terminal,div331.terminal);
assert.equal(div331.path.length,height.path.length);
assert(width.path.includes(title133.terminal));

assert.equal(short2012.period,4);
assert.equal(short2012.enteredAt,17);
assert.deepEqual(short2012.path.slice(0,8),
  [503,490,61,487,165,158,79,119]);
assert.deepEqual(long2012.path,[509,7,102,125,129]);
assert.equal(long2012.reason,"table");
assert.equal(long2012.terminal,166); // Physical p50 third numeral, unlike 2014/2016 p50 first.
console.log("Three dated original pairs (2012, 2014, 2016):",
  "503/133/563 enter word cycles; 509/331/569 enter physical p50.");

// A stronger source-aligned test than a generic grid origin: 2014 id331 and
// signed-image height569 BOTH point to global grid index80, the start of
// physical p50, namely row10 column0. Rotate complete eight-cell rows to
// this explicit original terminal while preserving the source cycle key order.
const tableStartRow=80/8;
assert.equal(tableStartRow,10);
const sourceRotatedTable=Buffer.from(grid.byte_rows.slice(tableStartRow)
  .concat(grid.byte_rows.slice(0,tableStartRow)).flat());
assert.equal(sourceRotatedTable[0],142);
const rotatedResults=[
  ["xor",(v,k)=>(v^k)&255,(v,k)=>(v^k)&255,93,
    "3a8e7d7519a8dbf5d8d7cd3ae75f33289cd40a6011a7628c80c5e520f442da89"],
  ["minus",(v,k)=>(v-k+256)&255,(v,k)=>(v+k)&255,84,
    "da86150df968bb8dc8d1bb26e1492d189c5406e011a3de8c804525e014be2679"],
  ["plus",(v,k)=>(v+k)&255,(v,k)=>(v-k+256)&255,95,
    "42ee7d7561d023f5dee7d13cf75f432e20d88a6495276210743919d408b21a6d"]
];
for(const [label,forward,inverse,nPrintable,hex32] of rotatedResults) {
 const apply=data=>Buffer.from(data.map((v,i)=>forward(v,orbitRowKeys[i>>3])));
 const undo=data=>Buffer.from(data.map((v,i)=>inverse(v,orbitRowKeys[i>>3])));
 const encoded=apply(sourceRotatedTable);
 assert.equal(encoded.subarray(0,32).toString("hex"),hex32);
 assert.equal(encoded.reduce((n,v)=>n+(v>=32&&v<=126),0),nPrintable);
 assert(undo(encoded).equals(sourceRotatedTable));
 assert(undo(apply(orbitAsciiPlant)).equals(orbitAsciiPlant));
 console.log("Original p50 row10 source-start",label,nPrintable,
   "/256 printable; all bytes and planted control round-trip");
}


/**
 * Source-terminal p50 first token selects one standalone 13x8 numeric page.
 * One minimal historical operator transfer: GP29 +/- pad using those 104
 * source-order bytes reduced mod29 against the *authentically solved* p56
 * 85-rune ciphertext. Calibrate against the exact native P56 plaintext and
 * honor its one original literal-F key hold (position56).
 */
const knownP56="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES "+
 "TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const longFirst=corpus.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} source */
function gpEncodeSolved(source) {
 const out=[];
 for(const word of source.split(" ")) {
  for(let i=0;i<word.length;) {
   const alias=longFirst.find(t=>word.startsWith(t.s,i));
   assert(alias,"Missing GP token from verified solved phrase");
   out.push(alias.i);i+=alias.s.length;
  }
 }
 return out;
}
const originalP56=corpus.pages.find(p=>p.page===56).indices;
const canonicalP56=gpEncodeSolved(knownP56);
assert.equal(originalP56.length,85);
assert.deepEqual(originalP56
 .map((v,i)=>v===0?i:-1).filter(i=>i>=0),[35,47,51,56,74]);
assert.equal(canonicalP56.length,85);
const primes56=[];
for(let n=2;primes56.length<84;n++) {
 let isPrime=true;
 for(let k=2;k*k<=n;k++)if(n%k===0){isPrime=false;break;}
 if(isPrime)primes56.push(n);
}
let k56=0;
const oracleShift=originalP56.map((c,i)=>{
 if(i===56) return null; // Only literal unencrypted F; no key spent.
 const shift=(primes56[k56++]-1)%29;
 assert.equal((c-shift+29)%29,canonicalP56[i]);
 return shift;
});
assert.equal(k56,84);
assert.equal(originalP56[56],canonicalP56[56]);
const sourceP50Only=grid.byte_rows.slice(10,23).flat();
assert.equal(sourceP50Only.length,104);
assert.equal(sourceP50Only[0],142);
const first85=sourceP50Only.slice(0,85);
let p50Matches=[0,0,0,0],p50QuotientUnsupported=0;
for(let i=0;i<85;i++) {
 if(i===56)continue;
 const a=first85[i]%29,b=first85[i-(i>56?1:0)]%29;
 const key=oracleShift[i];
 if(a===key)p50Matches[0]++;
 if(b===key)p50Matches[1]++;
 if((a+key)%29===0)p50Matches[2]++;
 if((b+key)%29===0)p50Matches[3]++;
 if(key>8)p50QuotientUnsupported++;
}
assert.deepEqual(p50Matches,[2,4,3,2]);
assert.equal(p50QuotientUnsupported,58);
console.log("P50-only 13x8 source-start known p56 84-step native control:",
 "GP29 remainder matches advance/hold and +/-:",p50Matches,
 "quotient0..8 incapable of matching",p50QuotientUnsupported,
 "of84 original signed-prime shifts. No solved transfer.");

console.log("Cross-release fixed map: 2014 title133 joins 2016 width563",
  "33-cycle; 2014 div331 and 2016 height569 both reach p50:w0 after two words.");

let crossState=0x13333156;
/** @returns {number} */
function crossRandom() {
  crossState^=crossState<<13;
  crossState^=crossState>>>17;
  crossState^=crossState<<5;
  return crossState>>>0;
}
const CX=30000;
const crossCounts={sameCycle:0,same33Cycle:0,bothAnyCycle:0,
  bothP50First:0,bothSameTable:0,bothAnyTable:0,jointCycleP50:0,
  joint33P50:0,titleCycleDivTable:0,pair2012:0,tripleBroad2012:0,
  tripleSource2012:0,tripleStrict2012:0,pair2012Exact:0};
for(let trial=0;trial<CX;trial++) {
  const fake=originalSums.map(row=>row.slice());
  // Exact page/word-length/source-sum inventories are preserved. Only
  // existing complete rune words swap among matching-size page slots.
  for(let p=0;p<56;p++) {
    if(p===50) continue;
    for(const group of equalLengthSlots[p]) {
      const vals=group.map(j=>fake[p][j]);
      for(let k=vals.length-1;k>0;k--) {
        const j=crossRandom()%(k+1);
        [vals[k],vals[j]]=[vals[j],vals[k]];
      }
      for(let k=0;k<group.length;k++) fake[p][group[k]]=vals[k];
    }
  }
  const a=walk(133,fake),b=walk(331,fake);
  const c=walk(563,fake),e=walk(569,fake);
  const u=walk(503,fake),v=walk(509,fake);
  const bothCycle=a.reason==="cycle"&&c.reason==="cycle";
  const cCycleMembers=new Set(c.path.slice(c.enteredAt??0));
  const sameCycle=bothCycle&&cCycleMembers.has(a.terminal);
  const same33=sameCycle&&c.period===33&&c.enteredAt===0;
  const bothTable=b.reason==="table"&&e.reason==="table";
  const bothP50=bothTable&&b.terminal===50&&e.terminal===50&&
    b.path.length===2&&e.path.length===2;
  const bothSame=bothTable&&b.terminal===e.terminal&&
    b.path.length===2&&e.path.length===2;
  if(bothCycle)crossCounts.bothAnyCycle++;
  if(sameCycle)crossCounts.sameCycle++;
  if(same33)crossCounts.same33Cycle++;
  if(bothTable)crossCounts.bothAnyTable++;
  if(bothP50)crossCounts.bothP50First++;
  if(bothSame)crossCounts.bothSameTable++;
  if(sameCycle&&bothP50)crossCounts.jointCycleP50++;
  if(same33&&bothP50)crossCounts.joint33P50++;
  if(a.reason==="cycle"&&b.reason==="table")crossCounts.titleCycleDivTable++;
  const pair2012=u.reason==="cycle"&&v.reason==="table";
  const tripleBroad=pair2012&&a.reason==="cycle"&&b.reason==="table"&&bothCycle&&bothTable;
  const pair2012Exact=pair2012&&u.period===4&&v.terminal===166&&v.path.length===5;
  if(pair2012)crossCounts.pair2012++;
  if(tripleBroad)crossCounts.tripleBroad2012++;
  if(pair2012&&sameCycle&&bothP50)crossCounts.tripleSource2012++;
  if(pair2012Exact&&sameCycle&&bothP50)crossCounts.tripleStrict2012++;
  if(pair2012Exact)crossCounts.pair2012Exact++;
}
assert.deepEqual(crossCounts,{
  sameCycle:5723,same33Cycle:1,bothAnyCycle:8573,
  bothP50First:56,bothSameTable:56,bothAnyTable:2611,
  jointCycleP50:9,joint33P50:0,titleCycleDivTable:1688,
  pair2012:1552,tripleBroad2012:12,tripleSource2012:0,
  tripleStrict2012:0,pair2012Exact:5
});
console.log("Paired 2012+2014+2016 numeral matched 30,000 source-word shuffles",
  crossCounts,"seed 0x13333156; events selected after original inspection.");

console.log("Caveat: cycle length, two-hop landing and AES consumer were",
  "recognized after source inspection. No calibrated discovery p-value,",
  "authenticated key, unknown plaintext or onion destination.");
