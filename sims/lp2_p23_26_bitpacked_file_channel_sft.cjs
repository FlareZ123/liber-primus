'use strict';
/** LP2 p23–26 original 201×5 one-bit-per-rune binary file gate.
 * Frozen source bit assignments: GP alphabet-index parity, GP-prime parity.
 * Preserve original 16-rune red p23 heading, all five-rune grouping, natural
 * chronological bit order, MSB-first bytes, and final 3 zero pad bits.
 * Separate full valid 1x1 PNG and wrong-rule synthetic positive controls.
 * Node.js 22, CommonJS, no dependencies, read-only.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages=[23,24,25,26].map(n=>corpus.pages.find(p=>p.page===n));
assert.deepEqual(pages.map(p=>p.indices.length),[213,270,273,265]);
const heading=pages[0].indices.slice(0,16);
assert.deepEqual(heading,[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body=pages.flatMap((p,i)=>i===0?p.indices.slice(16):p.indices);
assert.equal(body.length,1005);
assert.equal(body.length/5,201);
/** @param {number[]} bits */
function pack(bits){
  const out=Buffer.alloc(Math.ceil(bits.length/8));
  for(let i=0;i<bits.length;i++)out[i>>3]|=bits[i]<<(7-(i&7));
  return out;
}
/** @param {Buffer} bytes */
function isPng(bytes){
  const signature=Buffer.from('89504e470d0a1a0a','hex');
  if(bytes.length<signature.length||!bytes.subarray(0,8).equals(signature))return false;
  let offset=8,first=true;
  while(offset+12<=bytes.length){
    const size=bytes.readUInt32BE(offset);
    if(size>bytes.length-offset-12)return false;
    const end=offset+8+size;
    const name=bytes.toString('ascii',offset+4,offset+8);
    if((zlib.crc32(bytes.subarray(offset+4,end))>>>0)!==
        bytes.readUInt32BE(end))return false;
    if(first&&(name!=='IHDR'||size!==13))return false;
    if(name==='IHDR'&&(bytes.readUInt32BE(offset+8)===0||
       bytes.readUInt32BE(offset+12)===0))return false;
    first=false;
    offset=end+4;
    if(name==='IEND'){
      if(size!==0)return false;
      // A fixed-length binary channel may pad its complete PNG with 00.
      return bytes.subarray(offset).every(x=>x===0);
    }
  }
  return false;
}
/** @param {Buffer} bytes */
function recognize(bytes){
  if(isPng(bytes))return 'PNG (all chunk CRCs, IEND and zero padding)';
  const magic=[
    ['gzip','1f8b08'],['zip','504b0304'],['jpeg','ffd8ff'],
    ['bzip2','425a68'],['xz','fd377a585a00'],['7zip','377abcaf271c'],
    ['elf','7f454c46'],['pdf','255044462d'],['ogg','4f676753'],
    ['midi','4d546864'],['riff','52494646'],['pgp-armored','2d2d2d2d2d424547494e20504750']
  ];
  for(const [label,hex] of magic)if(bytes.subarray(0,hex.length/2).equals(
    Buffer.from(hex,'hex')))return label+' (signature only)';
  if(bytes.subarray(0,6).toString('ascii')==='GIF89a'||
     bytes.subarray(0,6).toString('ascii')==='GIF87a')return 'GIF (signature only)';
  if(bytes[0]===0x78&&((bytes[0]<<8)|bytes[1])%31===0){
    try{zlib.inflateSync(bytes);return 'zlib (integrity passed)';}
    catch(_e){/* malformed full payload */}
  }
  return null;
}
/** @param {Buffer} b */
function stats(b){
  let max=0,run=0;const frequency=Array(256).fill(0);
  for(const x of b){
    frequency[x]++;
    run=x>=32&&x<=126?run+1:0;
    if(run>max)max=run;
  }
  return {first32hex:b.subarray(0,32).toString('hex'),
    terminalHex:b.subarray(-8).toString('hex'),
    printableAscii:b.filter(x=>x>=32&&x<=126).length,
    uniqueBytes:frequency.filter(n=>n!==0).length,
    longestPrintableRun:max,
    ffBytes:frequency[255],recognized:recognize(b)};
}
const cases=[
  ['index parity',i=>i&1,481],
  ['GP prime parity',i=>corpus.prime[i]&1,968]
];
const output=[];
for(const [name,toBit,expectedOnes] of cases){
  const bits=body.map(toBit);
  assert.equal(bits.filter(Boolean).length,expectedOnes);
  const bytes=pack(bits);
  assert.equal(bytes.length,126);
  assert.equal(bytes[125]&7,0); // Three fixed padding bits.
  output.push({name,bits:bits.length,onBits:expectedOnes,bytes:bytes.length,
    padBits:3,...stats(bytes)});
  assert.equal(recognize(bytes),null);
}
const png=Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNgYGAAAAAEAAH2FzhVAAAAAElFTkSuQmCC',
  'base64');
assert.equal(png.length,69);
assert(isPng(png));
const plantBits=Array.from(png).flatMap(byte=>
  Array.from({length:8},(_,shift)=>(byte>>(7-shift))&1));
while(plantBits.length<body.length)plantBits.push(0);
assert.equal(plantBits.length,1005);
// Index-parity known-good symbol 2 for zero, symbol 1 for one.
const plantRunes=plantBits.map(bit=>bit?1:2);
const planted=pack(plantRunes.map(i=>i&1));
assert.deepEqual(planted.subarray(0,png.length),png);
assert.equal(recognize(planted),'PNG (all chunk CRCs, IEND and zero padding)');
const wrong=pack(plantRunes.map(i=>corpus.prime[i]&1));
assert.notEqual(recognize(wrong),'PNG (all chunk CRCs, IEND and zero padding)');
console.log(JSON.stringify({
  premise:'Five printed dots; 16-rune red p23 heading; 1,005 unchanged post-heading body runes',
  sourcePageLengths:pages.map(p=>p.indices.length),
  groups:201, positive:'69-byte valid PNG with native-GP parity encoding',
  plantPngRecoveredBytes:69, wrongPrimeParityDidNotRecoverPng:true,
  outcomes:output,
  conclusion:'Neither source-fixed bit rule yields a plaintext or recognized original binary format'
},null,2));
