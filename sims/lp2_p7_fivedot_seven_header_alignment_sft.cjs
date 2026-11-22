"use strict";

/**
 * LP2 source-original nested five-dot -> literal 7 -> seven-lane gate.
 * SFT, Node.js 22/CommonJS, read-only, Windows-compatible.
 * Run from the repository root or another working directory with Node.js.
 * The source-selected alignment is exact. Its proposed cipher semantics are
 * conditional and have NOT recovered an unknown LP2 plaintext or key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {buildSourceNativeTrigramModel} = require("./lp1_source_native_trigram_model.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const pages = read("resources/liber-primus/lp2-transcription.txt").split(/\n%\n/);
const model = buildSourceNativeTrigramModel({corpus, referenceText:reference});
assert.equal(pages.length, 57);
const jpeg24 = fs.readFileSync(path.join(ROOT, "resources/liber-primus/24.jpg"));
assert.equal(crypto.createHash("sha256").update(jpeg24).digest("hex"),
  "91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c");

/** @typedef {{x:number,y:number}} Dot */
/* Independently measured centroids of the five native-JPEG dots on LP2 p7,
 * x-sorted; compare the original-raster audit linked in the report.
 * These coordinates define an original-image reading order, not a fitted key.
 */
const dots = [
  {x:796.94613,y:3105.73973},
  {x:992.46667,y:3166.68765},
  {x:1296.96618,y:2866.70402},
  {x:1479.36384,y:3127.5},
  {x:1527.21721,y:2936.20488},
];
assert(dots.every((dot,i)=>i===0||dots[i-1].x<dot.x));
const order = dots.map((dot,i)=>i).sort((a,b)=>dots[a].y-dots[b].y);
assert.deepEqual(order,[2,4,0,3,1]);

/** @type {string[]} */
const original = [];
let digitPage = -1;
let digitLocal = -1;
for(let p=8;p<=14;p++){
  let local=0;
  const pageRunes = [];
  for(const ch of pages[p]){
    if(!corpus.runes.includes(ch) && ch!=="7") continue;
    if(ch==="7"){
      assert.equal(digitPage,-1,"exactly one Arabic numeral in the chapter");
      digitPage=p;
      digitLocal=local;
    }else pageRunes.push(ch);
    original.push(ch);
    local++;
  }
  assert.deepEqual(pageRunes,corpus.pages[p].indices.map(i=>corpus.runes[i]),
    "original page transcription must match canonical GP29 runes");
}
const first7 = original.indexOf("7");
assert.equal(digitPage,10);
assert.equal(digitLocal,169);
assert.equal(first7,692);
assert.equal(original.length,1730);
assert.equal(original.filter(x=>x==="7").length,1);
assert.equal(original.filter(x=>x!=="7").length,1729);
assert.equal(1730/5,346);
assert.equal(1729/7,247);

/** @param {string[]} stream @param {number[]} perm */
function fiveColumnDeinterleave(stream,perm){
  assert.equal(stream.length%5,0);
  const height=stream.length/5;
  const out=[];
  for(let row=0;row<height;row++)
    for(const col of perm)out.push(stream[col*height+row]);
  return out;
}
/** @param {string[]} stream @param {number[]} perm */
function fiveColumnInterleave(stream,perm){
  assert.equal(stream.length%5,0);
  const height=stream.length/5;
  const columns=Array.from({length:5},()=>new Array(height));
  for(let row=0;row<height;row++)
    for(let j=0;j<5;j++)columns[perm[j]][row]=stream[row*5+j];
  return columns.flat();
}
const reversed=fiveColumnDeinterleave(original,order);
assert.equal(reversed[0],"7");
assert.equal(reversed.filter(x=>x==="7").length,1);
assert.deepEqual(fiveColumnInterleave(reversed,order),original);
const numeric = a=>a.map(x=>corpus.runes.indexOf(x));
const rawNumeric=numeric(original.filter(x=>x!=="7"));
const unwrapped=numeric(reversed.slice(1));
assert(rawNumeric.every(x=>x>=0));
assert(unwrapped.every(x=>x>=0));
const checksum=nums=>crypto.createHash("sha256").update(Buffer.from(nums)).digest("hex");

/** @param {number[]} a @param {number[]} perm */
function sevenTuple(a,perm){
  assert.equal(a.length%7,0);
  const out=[];
  for(let i=0;i<a.length;i+=7)
    for(const j of perm)out.push(a[i+j]);
  return out;
}
/** @param {number[]} a */
function sevenColumnsDown(a){
  assert.equal(a.length%7,0);
  const height=a.length/7,out=[];
  for(let j=0;j<7;j++)for(let i=0;i<height;i++)out.push(a[i*7+j]);
  return out;
}
/** @param {number[]} a */
function sevenColumnsAcross(a){
  assert.equal(a.length%7,0);
  const height=a.length/7,out=[];
  for(let i=0;i<height;i++)for(let j=0;j<7;j++)out.push(a[j*height+i]);
  return out;
}
/** @param {number[]} a */
const doubles=a=>a.reduce((n,x,i)=>n+(i>0&&x===a[i-1]?1:0),0);
const trials=[
  ["unchanged",rawNumeric,-3.421146782970008,9],
  ["p7-y-dot5",unwrapped,-3.4114003958971284,56],
  ["p7-dot5-then-source-stage05-seven",sevenTuple(unwrapped,[0,6,2,5,1,4,3]),-3.421150436307349,58],
  ["p7-dot5-then-stage05-opposite",sevenTuple(unwrapped,[0,4,2,6,5,3,1]),-3.419531555198646,53],
  ["p7-dot5-then-7-column-down",sevenColumnsDown(unwrapped),-3.4153795920077763,70],
  ["p7-dot5-then-7-column-across",sevenColumnsAcross(unwrapped),-3.410091749051137,68],
];
for(const [name,bytes,expectedScore,expectedDoublets] of trials){
  assert.equal(bytes.length,1729);
  assert.equal(doubles(bytes),expectedDoublets,name+" doublets");
  const score=model.scoreStream(bytes).mean;
  assert(Math.abs(score-expectedScore)<1e-10,name+" score");
}
/* A native original solved-text plant, encoded in the proposed order,
 * must recover both the leading literal 7 and every native GP rune. */
const planted=["7",...model.training.slice(0,1729).map(x=>corpus.runes[x])];
assert.equal(planted.length,1730);
const encodedPlant=fiveColumnInterleave(planted,order);
assert.equal(encodedPlant[692],"7");
assert.deepEqual(fiveColumnDeinterleave(encodedPlant,order),planted);


/* A distinct, historically authenticated seven-marker consumer: the genuine
 * p56 consecutive-prime totient cipher with plaintext-F bypass. The literal
 * header '7' might designate prime value 7 (zero-based prime index 3), or
 * the seventh prime (index 6). These are fixed source interpretations.
 * Exhaust ALL legal skip histories without fitting guessed plaintext.
 */
const primes=[];
for(let n=2;primes.length<2000;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)primes.push(n);
}
/** @param {number[]} ct @param {number} startPrimeIndex
 * @returns {number|null} zero-based first impossible rune, or null if reachable
 */
function transparentPrimeDeadOffset(ct,startPrimeIndex){
  let states=new Set([0]);
  for(let i=0;i<ct.length;i++){
    const next=new Set();
    for(const consumed of states){
      const shift=(primes[startPrimeIndex+consumed]-1)%29;
      const decoded=(ct[i]-shift+29)%29;
      if(decoded!==0)next.add(consumed+1);
      if(ct[i]===0)next.add(consumed); // literal F never consumes prime
    }
    if(next.size===0)return i;
    states=next;
  }
  return null;
}
const sourcePrimeStarts=[0,3,6,7];
const sourcePrimeStartLabels=["prime2","prime7","seventhPrime17","zeroBasedSeventhPrime19"];
const primeExpected=[
  [22,49,18,61], // source five-dot inverse alone
  [61,1,22,24], // then historical seven tuple
  [5,26,25,39], // then inverse historical tuple
  [34,12,8,3], // then conventional seven columns down
  [37,3,20,17], // then conventional seven columns across
];
const primeTransfers=trials.slice(1).map(([name,nums],i)=>{
  const deadOffsets=sourcePrimeStarts.map(start=>transparentPrimeDeadOffset(nums,start));
  assert.deepEqual(deadOffsets,primeExpected[i],name+" prime-totient all-skip gate");
  return {name,firstImpossibleByStart:Object.fromEntries(
    sourcePrimeStartLabels.map((label,j)=>[label,deadOffsets[j]]))};
});
assert.equal(transparentPrimeDeadOffset(corpus.pages[56].indices,0),null,
  "authentically solved p56 must survive genuine F-transparent prime cipher");

const fiveDotCountStartIndices=[2,4];
const fiveDotCountStartLabels=["prime5","fifthPrime11"];
const fiveDotCountDeadOffsets=fiveDotCountStartIndices.map(start=>
  transparentPrimeDeadOffset(unwrapped,start)
);
assert.deepEqual(fiveDotCountDeadOffsets,[3,30],
  "the five-dot count as prime5 or fifthPrime11 must fail at its frozen offsets");

/* The header placement is a single exactly predicted source position.
 * It is a structural observation, not a posterior probability of intent. */
assert.equal(order[0]*346,692);
const yReversed=order.slice().reverse();
const xForward=[0,1,2,3,4],xBackward=xForward.slice().reverse();
const conventionalOrders=[order,yReversed,xForward,xBackward];
const markerPositions=conventionalOrders.map(p=>fiveColumnDeinterleave(original,p).indexOf("7"));
assert.deepEqual(markerPositions,[0,4,2,2]);
assert.equal(model.training.length,3510);
assert(Math.abs(model.p57Score-(-2.468144714244746))<1e-10);
console.log(JSON.stringify({
  source:"24.jpg five-dot centroids; original pp8-14 including one printed numeral 7",
  sevenPageSource:{runes:1729,numeralCount:1,streamUnits:1730,
    numeralSourceIndex:692,page:digitPage,pageLocalUnit:digitLocal,
    width5:346,width7AfterRemovingHeader:247},
  dotTopToBottomXIndices:order,
  headerAfterDeinterleave:reversed[0],
  otherNaturalDotOrdersHeaderIndices:markerPositions,
  recoveredGP29SHA256:checksum(unwrapped),
  positivePlant:"full 1730-symbol exact inverse including unencrypted 7",
  trials:trials.map(([name,bytes])=>({
    name,nativeLP1Trigram:model.scoreStream(bytes).mean,
    adjacentEqual:doubles(bytes),openingRunes:model.spell(bytes.slice(0,90))
  })),
  primeTransfers,
  fiveDotCountPrimeStartGate:Object.fromEntries(fiveDotCountStartLabels.map((label,i)=>
    [label,{zeroBasedPrimeIndex:fiveDotCountStartIndices[i],
      firstImpossibleRuneOffset:fiveDotCountDeadOffsets[i]}])),
  finding:"A source-selected nested numeral/header alignment; none of the direct 7-column continuations recovers readable GP-native plaintext",
  limitation:"Five-dot order is a hypothesis, not an authenticated cipher instruction; an independent source-keyed rune transform would be needed"
},null,2));
