'use strict';
/**
 * Original LP2 p49-51 PNG-Average byte unfilter => p55 76-cell perimeter.
 * Source-conditional receiver only, not an authenticated Cicada cipher.
 * Run: node sims/lp2_p50_meanpng_average_p55_outer76_fhold_sft.cjs
 * Original inputs: canonical lp2-corpus.json and lp2-grid-256.json.
 * Uses no nonstandard dependencies and does not modify source files.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const source = grid.bytes;
const cipher = corpus.pages[55].indices;
const native = corpus.pages[57].indices.slice(0, 76);
assert.strictEqual(source.length, 256);
assert.strictEqual(cipher.length, 76);
assert.strictEqual(native.length, 76);
assert.deepStrictEqual(source.slice(0, 8), [203,231,167,186,97,237,126,183]);
const mod29 = n => ((n % 29) + 29) % 29;
function averageUnfilter(bytes) {
  const out = Array.from({length:32}, () => Array(8).fill(0));
  for(let r=0;r<32;r++) for(let c=0;c<8;c++) {
    const left = c ? out[r][c-1] : 0;
    const above = r ? out[r-1][c] : 0;
    out[r][c] = (bytes[r*8+c] + Math.floor((left+above)/2)) & 255;
  }
  for(let r=0;r<32;r++) for(let c=0;c<8;c++) {
    const left = c ? out[r][c-1] : 0;
    const above = r ? out[r-1][c] : 0;
    assert.strictEqual((out[r][c] - Math.floor((left+above)/2) + 256) & 255, bytes[r*8+c]);
  }
  return out.flat();
}
const cw=[];
for(let c=0;c<8;c++) cw.push(c);
for(let r=1;r<32;r++) cw.push(r*8+7);
for(let c=6;c>=0;c--) cw.push(31*8+c);
for(let r=30;r>0;r--) cw.push(r*8);
assert.strictEqual(cw.length, 76);
assert.strictEqual(new Set(cw).size, 76);
const onBorder = new Set(cw);
const row = Array.from({length:256}, (_,i)=>i).filter(i=>onBorder.has(i));
const orders = {cw,ccw:[...cw].reverse(),row,rowrev:[...row].reverse()};
const recovered = averageUnfilter(source);
assert.deepStrictEqual(recovered.slice(0,8), [203,76,205,32,113,37,144,255]);
function getKey(table,order) {return order.map(i=>table[i]%29);}
function ioc(seq) {
  const ct=Array(29).fill(0);
  seq.forEach(v=>ct[v]++);
  return ct.reduce((acc,n)=>acc+n*(n-1),0)/(seq.length*(seq.length-1));
}
function decrypt(cipher,key,sign) {return cipher.map((x,i)=>mod29(x+sign*key[i]));}
function encrypt(plain,key,sign) {return plain.map((x,i)=>mod29(x-sign*key[i]));}
function encryptFhold(plain,key,sign) {
  const out=[];let phase=0;
  for(const p of plain) {
    if(p===0){out.push(0);continue;}
    assert(phase<key.length);
    out.push(mod29(p-sign*key[phase]));
    phase++;
  }
  return out;
}
function decodeFhold(cipher,key,sign) {
  // Each state stores the number of consuming positions and every path to it.
  // Small 76-rune test (only a few source F positions); exact, not a beam.
  let states=[{phase:0,plain:[]}];
  for(let i=0;i<cipher.length;i++) {
    const next=[];
    for(const state of states) {
      if(cipher[i]===0) next.push({phase:state.phase,plain:[...state.plain,0]});
      if(state.phase<key.length) {
        const p=mod29(cipher[i]+sign*key[state.phase]);
        if(p!==0) next.push({phase:state.phase+1,plain:[...state.plain,p]});
      }
    }
    if(next.length===0) return {fail:i,paths:[]};
    assert(next.length<=100000,'unexpected F-branch explosion');
    states=next;
  }
  return {fail:null,paths:states.map(x=>x.plain)};
}
function same(a,b) {return a.length===b.length && a.every((x,i)=>x===b[i]);}
const output=[];
const keyOptions=[];
for(const [name,order] of Object.entries(orders)) {
  const key=getKey(recovered,order);
  keyOptions.push({name,key});
  for(const sign of [-1,+1]) {
    const p=decrypt(cipher,key,sign);
    assert(same(encrypt(p,key,sign),cipher));
    const f=decodeFhold(cipher,key,sign);
    const planted=encryptFhold(native,key,sign);
    const plantPaths=decodeFhold(planted,key,sign);
    assert(plantPaths.paths.some(path=>same(path,native)),
      'authentic native GP57 F-hold planted control must be recovered');
    output.push({
      name,sign,direct_ioc:ioc(p), direct_first24:p.slice(0,24).map(v=>corpus.translit[v]).join('-'),
      fhold_count:f.paths.length,fhold_first_impossible:f.fail,
      fhold_iocs:f.paths.map(ioc)
    });
  }
}
assert.deepStrictEqual(output.map(x=>Number(x.direct_ioc.toFixed(6))),
 [0.037895,0.032632,0.051228,0.032982,0.038246,0.035439,0.033684,0.036842]);
assert.deepStrictEqual(output.map(x=>x.fhold_count),[0,0,1,0,0,2,0,0]);
assert.deepStrictEqual(output.map(x=>x.fhold_first_impossible),[30,63,null,57,8,null,55,2]);
const obs=Math.max(...output.map(x=>x.direct_ioc));
// Both controls preserve exact original source inventory; first shuffles GP
// ciphertext against the fixed unfiltered table and takes the 8-way maximum.
function makeRng(seed) {
 let st=seed>>>0;
 return ()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return st>>>0;};
}
function shuffled(input,rand) {
 const arr=input.slice();
 for(let j=arr.length-1;j>0;j--) {
   const k=rand()%(j+1),z=arr[j];arr[j]=arr[k];arr[k]=z;
 }
 return arr;
}
const n=30000;
let geCipher=0;const rngCipher=makeRng(0x330176c1);
for(let j=0;j<n;j++) {
  const shuffledCipher=shuffled(cipher,rngCipher);
  let best=0;
  for(const {key} of keyOptions) for(const sign of [-1,+1]) {
    const v=ioc(decrypt(shuffledCipher,key,sign));
    if(v>best)best=v;
  }
  if(best>=obs)geCipher++;
}
assert.strictEqual(geCipher,47);
const rngTable=makeRng(0x33010019);
const selected=orders.ccw;
let geTable=0;
for(let j=0;j<n;j++) {
  const shuffledSource=shuffled(source,rngTable);
  const key=getKey(averageUnfilter(shuffledSource),selected);
  if(ioc(decrypt(cipher,key,-1))>=obs) geTable++;
}
assert.strictEqual(geTable,11);
const report={original_cipher_ioc:ioc(cipher),native_p57_first76_ioc:ioc(native),
  decoded_results:output,controls:{
    fixed_cipher_inventory_max8:{n,ge:geCipher,plus_one_p:(geCipher+1)/(n+1),seed:'0x330176c1'},
    fixed_table_inventory_ccw_minus:{n,ge:geTable,plus_one_p:(geTable+1)/(n+1),seed:'0x33010019'}
  }};
console.log(JSON.stringify(report,null,2));
