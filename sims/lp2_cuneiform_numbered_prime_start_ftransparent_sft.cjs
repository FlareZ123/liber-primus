"use strict";

/**
 * LP2 five numbered cuneiform passages: prime-totient, F-transparent
 * original-cipher feasibility gate. Node.js 22 CommonJS, no dependencies.
 *
 * The original red 1..5 numerals nominate consecutive starting-prime ranks.
 * Key = phi(prime) mod29. Plaintext rune F (GP index 0) is sent literally,
 * consuming no prime, exactly as on authentically solved p56.
 *
 * All possible F-bypass histories are retained. One impossible position is
 * an exact ciphertext obstruction; no language model or unknown plaintext
 * is used in adjudicating a source-generated candidate.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const page = n => corpus.pages[n].indices;
assert.equal(corpus.pages.filter(p => p.page < 56)
  .reduce((n,p) => n+p.indices.length,0),12956);
assert.deepEqual([page(36).length,page(37).length,page(38).length],
  [238,228,228]);

const passages = [
  page(36).slice(99,238),
  page(37).slice(0,91),
  page(37).slice(91,189),
  page(37).slice(189,228).concat(page(38).slice(0,57)),
  page(38).slice(57,186)
];
assert.deepEqual(passages.map(p => p.length),[139,91,98,96,129]);
assert.equal(passages.flat().length,553);

/** @returns {number[]} */
function firstPrimes(n) {
  const out = [];
  for(let k=2;out.length<n;k++) {
    let prime=true;
    for(let d=2;d*d<=k;d++)if(k%d===0) { prime=false; break; }
    if(prime)out.push(k);
  }
  return out;
}
const primes = firstPrimes(700);
assert.equal(primes.filter(v => v<=3301).length,464);
assert.equal(primes[463],3301);

/**
 * @param {number[]} ciphertext
 * @param {number} initial Zero-based first prime index
 * @param {-1|1} sign Cipher = Plain + sign * totient(prime).
 * @returns {{ok:boolean,firstFail:number,possibleCounts:number}}
 */
function legal(ciphertext,initial,sign) {
  let states=new Set([0]);
  for(let i=0;i<ciphertext.length;i++) {
    const next=new Set();
    for(const consumed of states) {
      const c=ciphertext[i];
      // The authentic exception: plaintext-F emits ciphertext-F and holds
      // the prime clock. Ciphertext-F may also arise by ordinary encryption.
      if(c===0)next.add(consumed);
      const shift=(primes[initial+consumed]-1)%29;
      const p=(c-sign*shift+58)%29;
      // A plaintext F may never be transformed by the nonliteral branch.
      if(p!==0)next.add(consumed+1);
    }
    states=next;
    if(!states.size)return {ok:false,firstFail:i,possibleCounts:0};
  }
  return {ok:true,firstFail:ciphertext.length,possibleCounts:states.size};
}

/** @param {number[]} plaintext @param {number} initial @param {-1|1} sign */
function encode(plaintext,initial,sign) {
  let consumed=0;
  return plaintext.map(p => {
    if(p===0)return 0;
    const c=(p+sign*((primes[initial+consumed++]-1)%29)+29)%29;
    return c;
  });
}

// Original solved-p56 calibration: exact source plaintext and the single
// actual bypass at ciphertext-rune offset 56. Other ciphertext F glyphs are
// conventional non-F encrypted output, as the source solved example requires.
const authenticP56="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES "+
  "TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const gpTokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text */
function gpEncode(text) {
  const encoded=[];
  for(const word of text.split(" ")) {
    for(let i=0;i<word.length;) {
      const matched=gpTokens.find(t=>word.startsWith(t.s,i));
      assert(matched,"Unknown GP transliteration");
      encoded.push(matched.i);
      i+=matched.s.length;
    }
  }
  return encoded;
}
const plain56=gpEncode(authenticP56);
assert.equal(plain56.length,85);
assert.deepEqual(plain56.flatMap((v,i)=>v===0?[i]:[]),[56]);
assert.deepEqual(encode(plain56,0,1),page(56));
assert.equal(legal(page(56),0,1).ok,true);
assert.equal(page(57).length,95);

// Source-ranked literal model: paragraph numbered k starts at the k-th
// positive prime p_k. Both signs independently require 553 feasible runes.
const literal={};
for(const sign of [-1,1]) {
  const failures=passages.map((p,i)=>legal(p,i,sign).firstFail);
  assert.deepEqual(failures,sign===1
    ? [1,25,5,12,114] : [13,24,40,20,7]);
  assert(failures.every((v,i)=>v<passages[i].length));
  literal[sign]=failures;
}

// All-secret global initial phase while *preserving* the explicitly printed
// consecutive 1..5 rank spacing. The first 464 CicadaOS prime_echo primes
// terminate at 3301. q=0..459 keeps all five starting primes within those
// source-published 464 primes. Later consumed primes continue normally.
const phase={};
for(const sign of [-1,1]) {
  const passageSurvivals=[0,0,0,0,0];
  let complete=0,bestMinPrefix=-1,bestRank=null;
  for(let q=0;q<=459;q++) {
    const trial=passages.map((p,i)=>legal(p,q+i,sign));
    trial.forEach((s,i)=>{if(s.ok)passageSurvivals[i]++;});
    if(trial.every(s=>s.ok))complete++;
    const minPrefix=Math.min(...trial.map(s=>s.firstFail));
    if(minPrefix>bestMinPrefix) {
      bestMinPrefix=minPrefix;bestRank=q+1;
    }
  }
  assert.deepEqual(passageSurvivals,sign===-1
    ? [26,38,88,33,11] : [21,27,73,35,12]);
  assert.equal(complete,0);
  assert.equal(bestMinPrefix,sign===-1?53:36);
  assert.equal(bestRank,sign===-1?409:209);
  phase[sign]={passageSurvivals,complete,bestMinPrefix,bestRank};
}

// Independent source-native synthetic positive with exactly the five
// observed passage lengths, hidden global rank27 and no fitted ciphertext.
const plantP=passages.map(p=>Array.from({length:p.length},(_,i)=>
  page(57)[i%95]));
const planted=plantP.map((p,i)=>encode(p,26+i,1));
assert(planted.every((p,i)=>legal(p,26+i,1).ok));
assert(planted.every((p,i)=>p.length===passages[i].length));
console.log(JSON.stringify({
  original_runes:12956,
  numbered_passage_lengths:passages.map(p=>p.length),
  p56_exact_source_positive:85,
  original_literal_first_impossible_at_zero_based:literal,
  source_460_global_phase_obstructions:phase,
  planted_five_passages_all_legal:true,
  recovered_unknown_lp2_plaintext:false
},null,2));
