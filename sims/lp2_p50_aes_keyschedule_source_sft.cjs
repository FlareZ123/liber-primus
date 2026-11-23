#!/usr/bin/env node
'use strict';

/**
 * Exact original LP2 pp49-51 AES expanded-key schedule test.
 * AES-256's expanded key is 240 bytes, leaving 16 of the 256 panel bytes;
 * AES-128 and AES-192 schedules have 176 and 208 bytes respectively.
 * Exhaust both source alphabets, row/column order, direction and every
 * contiguous full-schedule placement, without inspecting unknown plaintext.
 *
 * Scope: a directly printed, unmodified AES expanded schedule. No Cicada
 * source authenticates AES or this serialization; encrypted/reshuffled key
 * material is outside the test. Windows: Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
assert.equal(source.alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
assert.equal(source.rows.length, 32);
assert.ok(source.rows.every((row) => row.length === 8));

/** @param {number} a @param {number} b @returns {number} */
function multiply(a,b) {
  let out=0;
  while(b) { if(b&1) out^=a; a=((a<<1)^((a&128)?0x11b:0))&255; b>>>=1; }
  return out;
}
/** @param {number} a @param {number} p @returns {number} */
function power(a,p) {
  let out=1;
  while(p) { if(p&1) out=multiply(out,a); a=multiply(a,a); p>>>=1; }
  return out;
}
/** @param {number} x @param {number} r @returns {number} */
function rotate(x,r) { return ((x<<r)|(x>>>(8-r)))&255; }
const S=Array.from({length:256},(_,a)=>{
  const x=a?power(a,254):0;
  return x^rotate(x,1)^rotate(x,2)^rotate(x,3)^rotate(x,4)^0x63;
});
/** @param {number[]} key @returns {number[]} */
function expand(key) {
  const n=key.length/4, words=Array.from({length:4*(n+7)},()=>[]);
  assert.ok([4,6,8].includes(n));
  for(let i=0;i<n;i++) words[i]=key.slice(4*i,4*i+4);
  let rc=1;
  for(let i=n;i<words.length;i++){
    let previous=words[i-1].slice();
    if(i%n===0){
      previous.push(previous.shift()); previous=previous.map(x=>S[x]);
      previous[0]^=rc; rc=multiply(rc,2);
    } else if(n===8&&i%n===4) previous=previous.map(x=>S[x]);
    words[i]=words[i-n].map((x,j)=>x^previous[j]);
  }
  return words.flat();
}
const hex=b=>b.map(x=>x.toString(16).padStart(2,'0')).join('');
assert.equal(hex(expand(Array.from({length:16},(_,i)=>i)).slice(16,20)),'d6aa74fd');
assert.equal(hex(expand(Array.from({length:24},(_,i)=>i)).slice(24,28)),'5846f2f9');
assert.equal(hex(expand(Array.from({length:32},(_,i)=>i)).slice(32,36)),'a573c29f');

/** @param {string} alphabet @returns {number[]} */
function decode(alphabet) {
  return source.rows.flat().map(token=>{
    assert.equal(token.length,2);
    const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]);
    assert.ok(a>=0&&b>=0);
    const value=a*alphabet.length+b;
    assert.ok(value>=0&&value<=255);
    return value;
  });
}
/** @param {number[]} b @returns {number[]} */
function column(b) {
  return Array.from({length:8},(_,j)=>
    Array.from({length:32},(_,i)=>b[8*i+j])).flat();
}
/**
 * @param {number[]} b
 * @param {number} keyLength
 * @returns {{windows:number,derived:number,best:number,offset:number,full:number}}
 */
function scan(b,keyLength) {
  const length=16*(keyLength/4+7);
  let windows=0,best=-1,offset=-1,full=0;
  for(let start=0;start+length<=b.length;start++){
    const observed=b.slice(start,start+length),expected=expand(observed.slice(0,keyLength));
    let matches=0;
    for(let j=keyLength;j<length;j++) if(expected[j]===observed[j]) matches++;
    windows++;
    if(matches>best){ best=matches;offset=start; }
    if(matches===length-keyLength)full++;
  }
  return {windows,derived:length-keyLength,best,offset,full};
}
const base60=decode(source.alphabet);
const base59=decode(source.alphabet.replace('f',''));
assert.deepEqual(base60,source.byte_rows.flat());
assert.equal(new Set(base60).size,161);
assert.equal(new Set(base59).size,161);
const planted=Array(256).fill(0);
planted.splice(9,240,...expand(Array.from({length:32},(_,i)=>i)));
assert.deepEqual([scan(planted,32).full,scan(planted,32).offset],[1,9]);

const results=[];
for(const [radix,bytes] of [['base60',base60],['f-deleted-base59',base59]])
  for(const [layout,sequence] of [['row-major',bytes],['column-major',column(bytes)]])
    for(const [direction,stream] of [['forward',sequence],['reverse',sequence.slice().reverse()]])
      for(const keyLength of [16,24,32])
        results.push({radix,layout,direction,keyBits:keyLength*8,...scan(stream,keyLength)});

assert.equal(results.length,24);
assert.equal(results.reduce((s,r)=>s+r.windows,0),1176);
assert.ok(results.every(r=>r.full===0));
assert.equal(Math.max(...results.map(r=>r.best)),5);
const byKey=[128,192,256].map(bits=>{
  const filtered=results.filter(x=>x.keyBits===bits);
  return {keyBits:bits,derivedBytesPerWindow:filtered[0].derived,
    bestMatchedBytes:Math.max(...filtered.map(x=>x.best)),fullScheduleHits:0};
});
console.log(JSON.stringify({source:'original p49-p51 32x8 numeric table',
  sourceByteCount:256,distinctByteCount:161,sourceOrders:8,
  windowsTested:1176,positiveControls:'FIPS AES128/192/256 and planted schedule PASS',
  byKey,bestOverall:results.sort((a,b)=>b.best-a.best)[0]},null,2));
console.log('PASS: no directly serialized AES key expansion in any source-natural window.');
