'use strict';

/**
 * Historically linked 2014 signed-message whitespace 173/178, original
 * p50 graph address178 (provisionally p0), and 2014 solved p56 original
 * GP29 prime-totient F-transparent cipher. This is a falsification gate for
 * transferring the actual p56 cipher with literal seed173/178 into original
 * p0; no invented keystream, key fitting or language optimization.
 *
 * Read-only. Windows Node.js 22:
 * node sims/lp2_2014_whitespace173178_p0_phi_original_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const load = x => JSON.parse(fs.readFileSync(path.join(root,x),'utf8'));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const grid=load('resources/liber-primus/lp2-grid-256.json');
const signed2014=fs.readFileSync(path.join(root,
  'resources/cicada2014-may2-signed-message.asc'),'utf8');
const original=corpus.pages[0].indices;
const solved=corpus.pages[56].indices;
assert.equal(original.length,262);
assert.equal(solved.length,85);
const parent=grid.bytes;
assert.equal(parent.length,256);
assert.deepEqual([parent[178],parent[201],parent[74]],[166,74,205]);
// The original 2014 padding source is recorded separately in
// sims/lp2_2014_whitespace_173_178_p50_graph_original_sft.cjs.
assert(signed2014.includes('BEGIN PGP SIGNED MESSAGE'));
const trailing=173,allExterior=178;

/** @returns {number[]} */
function firstPrimeTotients(n) {
  const prime = [];
  for(let value=2;prime.length<n;value++){
    let isPrime=true;
    for(let j=2;j*j<=value;j++)if(value%j===0){isPrime=false;break}
    if(isPrime)prime.push((value-1)%29);
  }
  return prime;
}
const phi=firstPrimeTotients(650);
/**
 * Calculate the furthest rune whose authentic p56 plaintext-F-transparent
 * GP29 decryption is possible. A ciphertext F can represent literal F,
 * with no key advance, OR a non-F encrypted rune (key advances). A non-F
 * ciphertext cannot encode a literal F, even if its naive GP29 inverse is 0.
 * Every legal state is retained and deduplicated by key-use count.
 * @param {number[]} cipher
 * @param {number} seed
 * @returns {{reached:number,total:number,terminalStates:number}}
 */
function furthest(cipher,seed){
  let states=[0];
  for(let i=0;i<cipher.length;i++){
    const seen=new Set(),next=[];
    for(const used of states){
      if(cipher[i]===0&&!seen.has(used)){
        seen.add(used);
        next.push(used);
      }
      const plain=((cipher[i]-phi[seed+used])%29+29)%29;
      if(plain!==0&&!seen.has(used+1)){
        seen.add(used+1);
        next.push(used+1);
      }
    }
    if(next.length===0)return {reached:i,total:cipher.length,terminalStates:states.length};
    states=next;
  }
  return {reached:cipher.length,total:cipher.length,terminalStates:states.length};
}
/** @param {number[]} clear @param {number} start @returns {number[]} */
function encrypt(clear,start){
  let k=start;
  return clear.map(x=>x===0?0:(x+phi[k++])%29);
}
const known = furthest(solved,0);
assert.deepEqual(known,{reached:85,total:85,terminalStates:5});
const plant=Array.from({length:original.length},(_,i)=>corpus.pages[57].indices[i%95]);
assert.equal(furthest(encrypt(plant,allExterior),allExterior).reached,262);
const outside2014=furthest(original,trailing);
const all2014=furthest(original,allExterior);
assert.deepEqual([outside2014.reached,all2014.reached],[88,90]);
assert(outside2014.reached<original.length&&all2014.reached<original.length);
console.log(JSON.stringify({
  result:'PASS: literal signed2014 whitespace prime-index seeds reject p0 under authentic p56 phi(F-transparent) transfer',
  original2014PaddingCandidates:[trailing,allExterior],
  sourceAddress178Successor:parent[178],
  originalP0Runes:original.length,
  originalResults:{trailing173:outside2014,allExterior178:all2014},
  authenticSolvedP56:known,plantedOriginalP0:true,
  decision:'Only the exact first-party F-transparent prime-totient cipher with 0-based start 173 or178 is excluded on original p0; graph route and other ciphers remain.'
},null,2));
