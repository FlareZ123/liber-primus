'use strict';

/**
 * Frozen moth-pair 56-word -> 56 physical page key experiment.
 * Two source-motivated key conversions, authenticated p56 inverse clock,
 * and exact original-cipher plaintext-F legality DP.
 *
 * Independent research, Node.js 22 CommonJS, no packages or CLI flags.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const text = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndices = new Map(corpus.runes.map((r,i)=>[r,i]));
const words = segment => [...text[segment].replace(/\/\s*/g,'')
  .replace(/\s/g,'').matchAll(/[\u16A0-\u16FF]+/gu)]
  .map(m=>[...m[0]].map(r=>runeIndices.get(r)));
const first = words(52); // p53: 179 runes, 40 complete local words
const last = words(54); // p55: inherited p54 NG, then 16 complete words
assert.equal(first.length,40);
assert.equal(last.length,17);
assert.deepEqual(last[0],[21]);
const donors = [...first,...last.slice(1)];
assert.equal(donors.length,56);
assert.equal(donors.flat().length,254);
const alphabet = grid.alphabet;
const bytes = grid.pages.flatMap(p=>p.tokens)
  .map(s=>60*alphabet.indexOf(s[0])+alphabet.indexOf(s[1]));
assert.equal(bytes.length,256);

/* Source-typed word integers. A word-prime sum is canonical GP;
 * base29-to-cell is motivated by signed 2013 BASE29 but NOT authored
 * as an LP2 lookup instruction. These are two bounded separate gates. */
const keys = {
  word_prime_sum:donors.map(w=>w.reduce((sum,i)=>sum+corpus.prime[i],0)),
  word_base29_address_then_table_byte:donors.map(w=>
    bytes[w.reduce((n,i)=>(29*n+i)%256,0)])
};
const maximumStart = Math.max(...Object.values(keys).flat());
assert.equal(maximumStart,709);

// Authenticated solved-p56 rule: use (prime-1) modulo 29, advance on
// every nonzero plaintext rune, bypass plaintext F (index 0) without
// consuming any prime. Unknown ciphertext F can represent either branch.
function primeTotients(count) {
  const limit = 100000, composite = new Uint8Array(limit), out = [];
  for (let p=2;p<limit && out.length<count;p++) {
    if (composite[p]) continue;
    out.push((p-1)%29);
    for (let n=p*p;n<limit;n+=p) composite[n]=1;
  }
  assert.equal(out.length,count);
  return out;
}
const k = primeTotients(maximumStart+600);
const mod29 = n=>(n%29+29)%29;
const ioc = seq => {
  const counts = new Array(29).fill(0);
  for (const value of seq) counts[value]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
};
function furthest(cipher,start) {
  let states = [0];
  for (let i=0;i<cipher.length;i++) {
    const seen = new Uint8Array(i+2),next = [];
    for (const used of states) {
      if (cipher[i]===0 && !seen[used]) {
        seen[used]=1;
        next.push(used);
      }
      if (mod29(cipher[i]-k[start+used])!==0 && !seen[used+1]) {
        seen[used+1]=1;
        next.push(used+1);
      }
    }
    if (next.length===0) return i;
    states = next;
  }
  return cipher.length;
}
function allPlaintexts(cipher,start) {
  let states=[{used:0,plain:[]}];
  for (const c of cipher) {
    const next=[];
    for (const state of states) {
      if (c===0) next.push({used:state.used,plain:[...state.plain,0]});
      const p=mod29(c-k[start+state.used]);
      if (p!==0) next.push({
        used:state.used+1,plain:[...state.plain,p]});
    }
    states=next;
    if (!states.length) return [];
  }
  return states;
}
// Direct historical Vigenere consumer: donor ciphertext word repeated over
// its assigned original physical page, two natural GP29 directions.
const repeatedWordKey = [];
for (let page=0;page<56;page++) {
  if (page===50) continue;
  const input=corpus.pages[page].indices;
  const donor=donors[page];
  for (const sign of [-1,1]) {
    const decoded=input.map((v,i)=>mod29(v+sign*donor[i%donor.length]));
    assert.deepEqual(
      decoded.map((v,i)=>mod29(v-sign*donor[i%donor.length])),input);
    repeatedWordKey.push({page,sign,key_length:donor.length,
      decoded_gp29_ioc:ioc(decoded)});
  }
}
assert.equal(repeatedWordKey.length,110);
const wordKeyHighest = Math.max(...repeatedWordKey.map(x=>x.decoded_gp29_ioc));
assert.ok(wordKeyHighest < 0.04);

const details = {};
for (const [method,seeds] of Object.entries(keys)) {
  const rows=[],survivors=[];
  for (let page=0;page<56;page++) {
    const cipher=corpus.pages[page].indices;
    if (page===50) {
      assert.equal(cipher.length,0);
      continue;
    }
    const reached=furthest(cipher,seeds[page]);
    rows.push({page,runes:cipher.length,start:seeds[page],
      reachable_runes:reached});
    if (reached===cipher.length) {
      const plains=allPlaintexts(cipher,seeds[page]);
      assert.ok(plains.length);
      const best=Math.max(...plains.map(p=>ioc(p.plain)));
      survivors.push({page,start:seeds[page],paths:plains.length,
        best_gp29_ioc:best});
    }
  }
  assert.equal(rows.length,55);
  details[method]={survivors,full_count:survivors.length,
    rejected_page_count:55-survivors.length,
    initial_decisions:rows.slice(0,6)};
}
assert.deepEqual(details.word_prime_sum.survivors.map(p=>p.page),[18,49,55]);
assert.deepEqual(details.word_prime_sum.survivors.map(p=>p.paths),[18,1,1]);
assert.deepEqual(
  details.word_base29_address_then_table_byte.survivors.map(p=>p.page),[32]);
assert.deepEqual(
  details.word_base29_address_then_table_byte.survivors.map(p=>p.paths),[3]);
console.log(JSON.stringify({
  source:'two original repeated-moth LP2 p53/p55 ciphertext pages',
  source_word_partition:{before_flora:40,flora:16,unsolved_physical_pages:56},
  cipher:'exact p56 phi(prime) clock, original plaintext-F nonconsuming bypass',
  candidates:details,
  direct_repeating_donor_word_vigenere:{
    original_full_page_decoders:repeatedWordKey.length,
    best_gp29_ioc:wordKeyHighest,
    readable_GP_pages:0,
    best_candidate:repeatedWordKey.reduce((best,row)=>
      row.decoded_gp29_ioc>best.decoded_gp29_ioc?row:best)
  },
  conclusion:'Neither of these complete source-sized 56-word page-key rules decodes all original pages; no unknown plaintext.'
},null,2));
