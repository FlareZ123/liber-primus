'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const grid = JSON.parse(readFileSync(require.resolve('../resources/liber-primus/base60-grid.json'),'utf8')).byte_rows;
const corpus = JSON.parse(readFileSync(require.resolve('../resources/liber-primus/lp2-corpus.json'),'utf8'));
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
assert.equal(grid.length,32);
assert.ok(grid.every(row => row.length===8 && row.every(n => Number.isInteger(n) && n>=0 && n<256)));
const left = [...pages.get(48).slice(-72), ...pages.get(49)];
const right = [...pages.get(51), ...pages.get(52).slice(0,78)];
assert.equal(left.length,138);
assert.equal(right.length,170);
const flanks = [...left,...right];
assert.equal(flanks.length,308);
assert.ok(flanks.every(v=>Number.isInteger(v)&&v>=0&&v<29));
const privateScalar = grid.map(row=>row[4]);
const scalarBits = privateScalar.map(n=>n.toString(2).padStart(8,'0')).join('');
assert.equal(Buffer.from(privateScalar).toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(scalarBits.length,256);
assert.equal((256-32)*8-flanks.length*5,252);
assert.equal(4*60+12,252);

/** @param {number[]} values @param {'MSB'|'LSB'} orientation */
function toBits(values, orientation) {
  return values.map(v=>{
    const s=v.toString(2).padStart(8,'0');
    return orientation==='MSB'?s:[...s].reverse().join('');
  }).join('');
}
/** @param {string} bits @param {'MSB'|'LSB'} orientation */
function fromGroups(bits,orientation){
  assert.equal(bits.length,1540);
  return Array.from({length:308},(_,i)=>{
    const five=bits.slice(5*i,5*i+5);
    return Number.parseInt(orientation==='MSB'?five:[...five].reverse().join(''),2);
  });
}
/** @param {string} x @param {string} y */
function hamming(x,y){
  assert.equal(x.length,y.length);
  let d=0;
  for(let i=0;i<x.length;i++) if(x[i]!==y[i])d++;
  return d;
}
const result=[];
for(const layout of ['row-major','column-major']){
  const filler=layout==='row-major'
    ? grid.flatMap(row=>row.filter((_,j)=>j!==4))
    : [0,1,2,3,5,6,7].flatMap(j=>grid.map(row=>row[j]));
  assert.equal(filler.length,224);
  for(const orientation of ['MSB','LSB']){
    const bits=toBits(filler,orientation);
    for(const split of ['body-first','sidecar-first']){
      const body=split==='body-first'?bits.slice(0,1540):bits.slice(252);
      const side=split==='body-first'?bits.slice(1540):bits.slice(0,252);
      const values=fromGroups(body,orientation);
      const invalidRuneCodes=values.filter(v=>v>=29).length;
      const exactFlankCipherRuneMatches=values.filter((v,i)=>v===flanks[i]).length;
      const sidecarHamming=Math.min(hamming(side,scalarBits.slice(0,252)),hamming(side,scalarBits.slice(4)));
      result.push({layout,orientation,split,invalidRuneCodes,exactFlankCipherRuneMatches,sidecarHamming});
    }
  }
}
assert.equal(result.length,8);
assert.deepEqual(result.map(x=>x.invalidRuneCodes),[24,25,29,20,30,30,24,25]);
assert.deepEqual(result.map(x=>x.exactFlankCipherRuneMatches),[5,11,10,12,13,16,10,14]);
assert.ok(result.every(x=>x.invalidRuneCodes>0 && x.sidecarHamming>100 && x.exactFlankCipherRuneMatches<20));
// Positive: the identical packet reader accepts a genuine original 308-rune
// GP29 source stream, with an independently specified exact 252-bit sidecar.
const genuinePackedFlanks=flanks.map(v=>v.toString(2).padStart(5,'0')).join('');
const positiveBits=genuinePackedFlanks+scalarBits.slice(0,252);
assert.equal(positiveBits.length,1792);
const positive=fromGroups(positiveBits.slice(0,1540),'MSB');
assert.deepEqual(positive,flanks);
assert.equal(hamming(positiveBits.slice(1540),scalarBits.slice(0,252)),0);
console.log(JSON.stringify({source:'physical LP2 p48-49/p51-52; original p49-51 table',runesBefore:138,runesAfter:170,bodyBits:1540,sidecarBits:252,missing4CAsBase60:252,tests:result,syntheticPositive:'308/308 symbols and exact 252-bit sidecar PASS'},null,2));
console.log('PASS: original literal 5-bit framing rejected; byte-exact positive source-framed control recovered');
