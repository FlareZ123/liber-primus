'use strict';

/**
 * Frozen, low-cost original source 56-bit page-carry mask → DES-ECB p50 bytes.
 * The 56-bit key and 256-byte target are visible-size hypotheses. The book
 * does NOT instruct using DES. Only one bit order/mode is evaluated.
 * Windows Node22 SFT, no packages, network or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @type {{runes:string[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(base,'lp2-corpus.json'),'utf8'));
const text = fs.readFileSync(path.join(base,'lp2-transcription.txt'),'utf8');
/** @type {{pages:{tokens:string[],bytes:number[]}[]}} */
const grid = JSON.parse(fs.readFileSync(path.join(base,'lp2-grid-256.json'),'utf8'));
const known = new Set(corpus.runes);
const words = [];
let page = 0, buffer='', start=-1;
/** @type {number[]} */
let fragments = [];
function flush(){
  if (buffer) words.push({start,fragments:[...fragments]});
  buffer = '';start=-1;fragments=[];
}
for (const ch of text) {
  if (known.has(ch)) {
    if (!buffer) {start=page;fragments=[0];}
    fragments[fragments.length-1]++;
    buffer+=ch;
  } else if(ch==='%') {
    page++;
    if(buffer) fragments.push(0);
  } else if(ch!=='/' && !/\s/u.test(ch)){
    flush();
  }
}
flush();
const unknown=words.filter(w=>w.start<55);
assert.equal(unknown.length,2896);
assert.equal(unknown.reduce((s,w)=>s+w.fragments.reduce((a,b)=>a+b,0),0),12956);
const carries=unknown.filter(w=>w.fragments.length>1&&w.fragments.at(-1)>0);
assert.equal(carries.length,32);
const mask=Array(56).fill(0);
for(const w of carries){
  const phys=w.start<50?w.start:w.start+1;
  assert.equal(w.fragments.length,2);
  assert.ok(phys<55&&phys!==49, 'directly adjacent rune-bearing physical pages');
  mask[phys]=1;
}
assert.equal(mask.reduce((s,x)=>s+x,0),32);
const bits=mask.join('');
assert.equal(bits,'11011110110000001011010111010101010100001111111110011010');
// DES data key: 56 bits grouped MSB-first as eight 7-bit words, odd parity
// appended at each byte's least-significant bit. DES ignores parity in key
// schedule. Three equal 8-byte keys make EDE3 identical to single DES.
const desKey=Buffer.alloc(8);
for(let i=0;i<8;i++){
  const value=parseInt(bits.slice(7*i,7*i+7),2);
  const ones=value.toString(2).replace(/0/g,'').length;
  desKey[i]=(value<<1)|(ones%2===0?1:0);
  assert.equal(desKey[i].toString(2).replace(/0/g,'').length%2,1);
}
const key3=Buffer.concat([desKey,desKey,desKey]);
assert.equal(key3.length,24);
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
assert.ok(bytes.every(x=>Number.isInteger(x)&&x>=0&&x<256));
const cipher=Buffer.from(bytes);
/** @param {Buffer} data @param {boolean} encrypt @returns {Buffer} */
function ecb(data,encrypt){
  const instance=encrypt?crypto.createCipheriv('des-ede3',key3,null):
    crypto.createDecipheriv('des-ede3',key3,null);
  instance.setAutoPadding(false);
  return Buffer.concat([instance.update(data),instance.final()]);
}
const decoded=ecb(cipher,false);
assert.equal(decoded.length,256);
assert.ok(ecb(decoded,true).equals(cipher));
// Actual DES-mode native reference NIST known answer test, key 010101... is
// known weak and provider-dependent. Instead independently use a fixed solved
// p57 phrase as a *synthetic plaintext* and assert entire round-trip.
const syntheticMessage=Buffer.alloc(256);
const sourceMessage=Buffer.from('AN END PARABLE FIND THE DIVINITY WITHIN','ascii');
for(let i=0;i<syntheticMessage.length;i++)syntheticMessage[i]=sourceMessage[i%sourceMessage.length];
const plant=ecb(syntheticMessage,true);
assert.ok(ecb(plant,false).equals(syntheticMessage));
/** @param {Buffer} data */
function stats(data){
  const counts=Array(256).fill(0);
  for(const x of data)counts[x]++;
  const entropy=-counts.filter(Boolean).reduce((s,x)=>{
    const p=x/data.length;return s+p*Math.log2(p);
  },0);
  return {length:data.length,first32:data.subarray(0,32).toString('hex'),
    last16:data.subarray(-16).toString('hex'),
    printableAscii:[...data].filter(v=>v>=32&&v<=126).length,
    ascii7:[...data].filter(v=>v<128).length,
    nul:[...data].filter(v=>v===0).length,entropy,
    first96AsAscii:[...data.subarray(0,96)].map(x=>x>=32&&x<=126?String.fromCharCode(x):'.').join('')};
}
const original=stats(cipher), result=stats(decoded);
console.log(JSON.stringify({
  source:{unknownPages:56,unknownWords:2896,unknownRunes:12956,
    carriedWords:32,maskBitCount:56,pageCarryMask:bits,key8Hex:desKey.toString('hex'),
    p50Cells:256,firstP50Token:grid.pages[0].tokens[0],
    keyRule:'56 source-visible page boundaries, bit for any GP word crossing to next physical page; DES MSB-first odd-parity mapping'},
  hypothesis:'one DES-ECB block-decoder on original 256 table bytes (base60 interpretation), 3DES EDE with three equal keys',
  originalTable:original,decodedTable:result,
  syntheticPositive:{bytesRecovered:256,status:'PASS'},
  conclusion:result.printableAscii>200?'Investigate original source candidate with independent heldout authentication':'Original does not yield a recognizable direct plaintext/file header from this frozen operation',
  limitations:'No authentic manuscript instruction says DES, ECB, odd-parity carry bits or base60; this is a single cheap bounded architectural test',
  pass:true
},null,2));
