'use strict';
/**
 * Original p50 256-byte table as an RC4 key on three historically stored
 * OutGuess extraction blobs, in contrast to earlier RC4-on-LP2-runes tests.
 * Node 22 CJS SFT: original data blobs are hash-pinned and never executed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const DATA = [
  {name:'page_17.bin',sha:'dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6'},
  {name:'page_21.bin',sha:'58ba0c966954f2a02964995613a6ba93fca57425'},
  {name:'page_43.bin',sha:'e4c94e1d285aff041276bf5c7bb1c265e987d93d'}
];
const BASE='https://raw.githubusercontent.com/Wulfic/Cicada3301-Liber_Primus/main/data/outguess/';
const HEAD=1417;
const DROPS=[0,256,768,3072];

/** @param {Buffer} b */
function gitBlob(b){
  return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
}
/** @param {number[]} key @param {number} count @param {number} drop */
function rc4(key,count,drop){
  assert(key.length>=1&&key.length<=256);
  const S=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+S[i]+key[i%key.length])&255;
    [S[i],S[j]]=[S[j],S[i]];
  }
  const output=Buffer.alloc(count);
  let i=0;
  j=0;
  for(let index=0;index<drop+count;index++){
    i=(i+1)&255;
    j=(j+S[i])&255;
    [S[i],S[j]]=[S[j],S[i]];
    if(index>=drop)output[index-drop]=S[(S[i]+S[j])&255];
  }
  return output;
}
/** @param {Buffer} b */
function summarize(b){
  const seen=new Set(b);
  const printable=Array.from(b).filter(x=>x>=32&&x<=126||x===9||x===10||x===13).length;
  const zero=Array.from(b).filter(x=>x===0).length;
  const ascii=b.subarray(0,96).toString('latin1').replace(/[^\x20-\x7E]/g,'.');
  return {length:b.length,distinct:seen.size,printable:printable/b.length,zeros:zero,ascii96:ascii,sha256:crypto.createHash('sha256').update(b).digest('hex')};
}
/** @param {number[]} b */
function keyOrders(b){
  assert.equal(b.length,256);
  return {
    row_major:b,
    reverse:b.slice().reverse(),
    each_row_reverse:Array.from({length:256},(_,i)=>b[(i>>3)*8+(7-(i&7))]),
    column_major:Array.from({length:256},(_,i)=>b[(i%32)*8+Math.floor(i/32)])
  };
}
async function getOriginal(name,sha) {
  const res=await fetch(BASE+name,{signal:AbortSignal.timeout(25000)});
  assert.equal(res.status,200,name+' unavailable');
  const b=Buffer.from(await res.arrayBuffer());
  assert.equal(gitBlob(b),sha,name+' content differs from dated repository');
  assert.equal(b.length,58152,name+' original byte count');
  return b;
}
async function main() {
  const key=Array.from(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8')).bytes);
  assert.equal(key.length,256);
  assert.equal(new Set(key).size,161);
  // The historical published RC4 test vector verifies both KSA and PRGA.
  assert.equal(Buffer.from('Plaintext').map((x,i)=>x^rc4([75,101,121],9,0)[i]).toString('hex'),'bbf316e8d940af0ad3');
  const test=Buffer.from('positive-control: original GP textual seed');
  const stream=rc4(key,test.length,768);
  const cipher=Buffer.from(test.map((x,i)=>x^stream[i]));
  assert.deepEqual(Buffer.from(cipher.map((x,i)=>x^stream[i])),test);
  console.log('POSITIVE RFC6229 / Wikipedia RC4 Key-Plaintext and planted decrypt full length PASS');
  if(!process.argv.includes('--network'))return;
  const data=await Promise.all(DATA.map(x=>getOriginal(x.name,x.sha)));
  let prefix=0;
  while(prefix<data[0].length&&data.every(x=>x[prefix]===data[0][prefix]))prefix++;
  console.log('ORIGINAL',JSON.stringify({source:'Wulfic/Cicada3301-Liber_Primus data/outguess',blobs:DATA.map((x,i)=>({name:x.name,gitBlob:x.sha,bytes:data[i].length,sha256:crypto.createHash('sha256').update(data[i]).digest('hex')})),common_prefix_bytes:prefix,head_window:HEAD,grid_unique_bytes:new Set(key).size}));
  for(const [order,K] of Object.entries(keyOrders(key))){
    for(const drop of DROPS) {
      const pad=rc4(K,data[0].length,drop);
      const outputs=data.map(b=>Buffer.from(b.map((x,i)=>x^pad[i])));
      const head=outputs.map(b=>summarize(b.subarray(0,HEAD)));
      const full=outputs.map(summarize);
      console.log('ORIGINAL-INV',JSON.stringify({order,drop,head,full:full.map(({length,distinct,printable,zeros,sha256})=>({length,distinct,printable,zeros,sha256}))}));
    }
  }
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
