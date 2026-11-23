'use strict';
/**
 * Source-original p15 Fibonacci-prime spiral -> p50 256-cell panel ID3 cue.
 * Classifies a conditional cross-source address reading, not an LP2 decryption.
 * Node.js 22, read-only; no network or external packages.
 */
const assert = require('node:assert/strict');
const {createCipheriv,createDecipheriv} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const alphabet60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alphabet59 = alphabet60.replace('f', '');
const printed = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const expectedSpiral = [3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516];
const movements = [[0,1],[1,0],[0,-1],[0,-1],[-1,0],[-1,0],
  [0,1],[0,1],[0,1],[1,0],[1,0],[1,0],[0,-1],[0,-1],[0,-1]];

const coords = [[1,1]];
for(const [dy,dx] of movements){
  const [y,x]=coords[coords.length-1];
  coords.push([y+dy,x+dx]);
}
assert.equal(new Set(coords.map(([y,x])=>y+','+x)).size,16);
assert(coords.every(([y,x])=>y>=0&&y<4&&x>=0&&x<4));
const spiral = coords.map(([y,x])=>printed[y][x]);
assert.deepEqual(spiral, expectedSpiral);

const distinctFibonacci=[0,1,2];
while(distinctFibonacci.length<16){
  const n=distinctFibonacci.length;
  distinctFibonacci.push(distinctFibonacci[n-1]+distinctFibonacci[n-2]);
}
/** @param {number} target */
function nthPrime(target){
  let n=1, ordinal=0;
  while(ordinal<target){
    n++;
    let prime=true;
    for(let f=2;f*f<=n;f++)if(n%f===0){prime=false;break;}
    if(prime)ordinal++;
  }
  return n;
}
assert.deepEqual(distinctFibonacci,[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]);
assert.deepEqual(spiral,distinctFibonacci.map(n=>Math.abs(3301-nthPrime(n+1))));

const tokens=grid.pages.flatMap(page=>page.tokens);
assert.deepEqual(grid.pages.map(p=>p.rows),[10,13,9]);
assert.equal(tokens.length,256);
assert.equal(grid.bytes.length,256);
assert.equal(corpus.pages.find(p=>p.page===57).indices.length,95);
/** @param {string} token @param {string} alphabet */
function decode(token, alphabet){
  assert.equal(token.length,2);
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  assert(hi>=0&&lo>=0);
  return hi*alphabet.length+lo;
}
assert.deepEqual(tokens.map(t=>decode(t,alphabet60)),grid.bytes);
const addresses=spiral.map(n=>n%256);
const sourceTokens=addresses.map(i=>tokens[i]);
const bytes60=sourceTokens.map(t=>decode(t,alphabet60));
const bytes59=sourceTokens.map(t=>decode(t,alphabet59));
assert.deepEqual(addresses.slice(0,5),[227,226,224,222,216]);
assert.deepEqual(sourceTokens.slice(0,5),['49','1D','18','0p','2M']);
assert.deepEqual(bytes60.slice(0,5),[249,73,68,51,142]);
assert.equal(String.fromCharCode(...bytes60.slice(1,4)),'ID3');
assert.equal(String.fromCharCode(...bytes59.slice(1,4)),'HC2');
assert(![2,3,4].includes(bytes60[4]),'Unexpectedly valid ID3 major version');

const counts=new Array(256).fill(0);
for(const b of grid.bytes)counts[b]++;
const pFixed=(counts[73]*counts[68]*counts[51])/(256*255*254);
const total=bytes60.length-2;
const matches=Array.from({length:total},(_,i)=>i)
  .filter(i=>String.fromCharCode(...bytes60.slice(i,i+3))==='ID3');
assert.deepEqual(matches,[1]);
const hex=bytes60.map(b=>b.toString(16).padStart(2,'0')).join('');
assert.equal(hex,'f94944338e7f13998e333bf096b0a769');


// Exact finite typed binary receiver, motivated solely by the 16 extracted bytes.
// These modes/IV semantics are exploratory, not specified by the creator.
const sourceKey=Buffer.from(bytes60);
const originalPanel=Buffer.from(grid.bytes);
assert.equal(sourceKey.length,16);
assert.equal(originalPanel.length,256);
/** @param {Buffer} buffer */
function printableStats(buffer){
  let printable=0,maxRun=0,run=0;
  for(const b of buffer){
    if(b>=32&&b<=126){run++;maxRun=Math.max(maxRun,run);}
    else run=0;
    if((b>=32&&b<=126)||[9,10,13].includes(b))printable++;
  }
  return {printable,maxRun};
}
/** @param {Buffer} buffer */
function validPkcs7(buffer){
  const n=buffer[buffer.length-1];
  return n>=1&&n<=16&&buffer.subarray(buffer.length-n).every(b=>b===n);
}
const aesVariants=[
  {name:'ECB',mode:'aes-128-ecb',iv:null},
  {name:'CBC_zeroIV',mode:'aes-128-cbc',iv:Buffer.alloc(16)}
];
const aesOutputs=aesVariants.map(x=>{
  const dec=createDecipheriv(x.mode,sourceKey,x.iv);
  dec.setAutoPadding(false);
  const plain=Buffer.concat([dec.update(originalPanel),dec.final()]);
  const enc=createCipheriv(x.mode,sourceKey,x.iv);
  enc.setAutoPadding(false);
  const roundtrip=Buffer.concat([enc.update(plain),enc.final()]);
  assert.deepEqual(roundtrip,originalPanel);
  return {name:x.name,...printableStats(plain),
    validPkcs7:validPkcs7(plain),
    first32:plain.subarray(0,32).toString('hex')};
});
assert.deepEqual(aesOutputs.map(x=>[x.printable,x.maxRun,x.validPkcs7]),
  [[101,6,false],[109,5,false]]);

console.log(JSON.stringify({
  source:{p15Image:'resources/liber-primus/32.jpg',
    p15PhysicalPage:15,sourceRedStart:3299,spiralCells:16,
    p50GridTokens:256,sourceClearP57Runes:95},
  rule:'p15 source-visible spiral N -> N modulo 256 -> p50 zero-based cell -> byte',
  firstFive:{spiral:spiral.slice(0,5),addresses:addresses.slice(0,5),
    tokens:sourceTokens.slice(0,5),base60:bytes60.slice(0,5),
    base59:bytes59.slice(0,5)},
  base60:{hex,threeByteMagic:String.fromCharCode(...bytes60.slice(1,4)),
    magicAtSpiralOffset:matches,
    nextByte:bytes60[4],validID3Header:false},
  base59:{magicAlternative:String.fromCharCode(...bytes59.slice(1,4))},
  aes128Exact16ByteKey:{keyHex:sourceKey.toString('hex'),original256ByteReceiver:aesOutputs},
  conditionalFixedAddressMultisetNull:{countI:counts[73],countD:counts[68],
    count3:counts[51],fixedTripleChance:pFixed,
    chanceAny14StartUnionBound:Math.min(1,total*pFixed)},
  decision:'An ID3 three-byte echo to authentic 2013 761.MP3, not a valid ID3 file or an author-selected LP2 decoder; the modulo256 address rule remains unauthenticated.'
},null,2));
