"use strict";

/**
 * Clue-constrained p50 byte-pointer 11-cycle -> p32 11x11 GP29 page.
 * Frozen finite literal key clocks only; no fitted phase, keys, words, or
 * charset. SFT: node sims/lp2_p32_p50_pointer11_wordfree_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
const original = gp.pages.find(p => p.page === 32).indices;
assert.equal(original.length, 121);
assert.equal(table.length, 256);
const mod = n => ((n % 29) + 29) % 29;

/** Starting at original upper-left cell, follow exact byte addresses. */
const states = [0],seen = new Set();
while (!seen.has(states[states.length - 1])) {
  const state = states[states.length - 1];
  seen.add(state);
  states.push(table[state]);
}
assert.deepEqual(states, [0,203,68,199,47,76,114,197,115,247,192,0]);
const cycle = states.slice(0,-1);
assert.equal(cycle.length, 11);
const keys = {
  "absolute-address-mod29":cycle.map(mod),
  "successor-byte-mod29":cycle.map(i => mod(table[i])),
  "printed-row-index-mod29":cycle.map(i => mod(Math.floor(i / 8))),
  "printed-column-index":cycle.map(i => i % 8)
};

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {"row"|"column"} clock
 * @param {1|-1} sign
 * @param {boolean} transpose
 * @returns {number[]}
 */
function decipher(cipher,key,clock,sign,transpose) {
  return Array.from({length:121},(_,i)=>{
    const pos=transpose?(i%11)*11+Math.floor(i/11):i;
    const index=clock==="row"?Math.floor(i/11):i%11;
    return mod(cipher[pos]-sign*key[index]);
  });
}

/** Strict inverse, with both GP29 clock and 11x11 readout orientation. */
function encipher(plain,key,clock,sign,transpose){
  const cipher = new Array(121);
  for(let i=0;i<121;i++){
    const pos=transpose?(i%11)*11+Math.floor(i/11):i;
    const index=clock==="row"?Math.floor(i/11):i%11;
    cipher[pos]=mod(plain[i]+sign*key[index]);
  }
  return cipher;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const n=new Array(29).fill(0);
  symbols.forEach(v=>n[v]++);
  return n.reduce((sum,x)=>sum+x*(x-1),0)/(symbols.length*(symbols.length-1));
}
const actual=[];
for(const [name,key] of Object.entries(keys)){
  for(const clock of ["row","column"]){
    for(const sign of [1,-1]){
      for(const transpose of [false,true]){
        const p=decipher(original,key,clock,sign,transpose);
        assert.deepEqual(encipher(p,key,clock,sign,transpose),original);
        actual.push({
          key:name,clock,sign,transpose,
          ioc:ioc(p),
          prefix:p.slice(0,32).map(i=>gp.translit[i]).join("")
        });
      }
    }
  }
}
assert.equal(actual.length,32);
actual.sort((a,b)=>b.ioc-a.ioc);
assert.equal(actual[0].key,"absolute-address-mod29");
assert.equal(actual[0].clock,"row");
assert.equal(actual[0].sign,1);
assert.equal(actual[0].transpose,false);
assert(Math.abs(actual[0].ioc - 0.03746556473829201)<1e-12);
const lp1=read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start=lp1.indexOf("ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ"),end=lp1.indexOf("272-",start);
assert(start>=0&&end>start);
const p5=[...lp1.slice(start,end)].filter(r=>gp.runes.includes(r)).map(r=>gp.runes.indexOf(r));
assert.equal(p5.length,81);
const plant=p5.concat(gp.pages.find(p=>p.page===57).indices.slice(0,40));
assert.equal(plant.length,121);
for(const key of Object.values(keys)){
  for(const clock of ["row","column"]){
    for(const sign of [1,-1]){
      for(const transpose of [false,true]){
        const e=encipher(plant,key,clock,sign,transpose);
        assert.deepEqual(decipher(e,key,clock,sign,transpose),plant);
        assert.deepEqual(encipher(decipher(e,key,clock,sign,transpose),key,clock,sign,transpose),e);
      }
    }
  }
}
console.log(JSON.stringify({
  verdict:"NO UNKNOWN PLAINTEXT; fixed direct 11x11 cycle key models remain cipher-like",
  originalGp29Ioc:ioc(original),best:actual[0],nextBest:actual.slice(1,4),
  fullModelCount:actual.length,p50ElevenCycle:cycle,
  controls:"32/32 native-GP 121-rune exact source-language plants and original reencryption",
  scope:"Direct GP29 additive 11-address key, table byte, table row or column; row/column clock, both directions and reading orientations"
},null,2));
