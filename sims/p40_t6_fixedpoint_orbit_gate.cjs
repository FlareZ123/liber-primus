"use strict";

/**
 * Source-fixed affine-orbit obstruction for the original LP2 word-local T6 clue.
 *
 * If y = H + a * (x - H) mod29 for any secret nonzero multiplier a,
 * x=H if and only if y=H. This necessary invariant remains exact even
 * when a is unknown and changes at every position.
 *
 * Input: original LP2 rune transcript and pinned GP order.
 * The p40 red heading's prime quotient 435/29=15 selects S/53.
 * Its final H has index8; T6(x)=53-2*x mod29=8+27*(x-8) mod29.
 *
 * Run: node sims/p40_t6_fixedpoint_orbit_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

/** @param {number} value @returns {number} */
const mod = value => ((value % 29) + 29) % 29;

/** @param {number} a @param {number} b @returns {number} */
function powMod(a,b) {
  let x=1;
  for(let i=0;i<b;i++)x=mod(x*a);
  return x;
}

/** @param {number} value @returns {number} */
function inverse(value) {
  for(let k=1;k<29;k++)if(mod(value*k)===1)return k;
  throw new Error("F29 inverse requested for zero");
}

const root = path.join(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const transcript = fs.readFileSync(path.join(root,"resources","lp2-transcription.txt"),"utf8");
const parsed = parseLP2Words(transcript);
assert.equal(parsed.words.length,2896);
assert.equal(parsed.runeCount,12956);
assert.equal(parsed.crossPageWords,32);

const glyphToIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
/** @type {number[][]} */
const words = parsed.words.map(word=>[...word.runes].map(glyph=>{
  const idx=glyphToIndex.get(glyph);
  assert.notEqual(idx,undefined,"unrecognized rune");
  return idx;
}));
assert.deepEqual(corpus.prime.slice(14,17),[47,53,59]);
assert.equal(corpus.prime[15],53);
assert.equal(glyphToIndex.get("ᚻ"),8);
assert.equal(mod(53-2*8),8);
assert.equal(powMod(27,28),1);
assert.equal(new Set(Array.from({length:28},(_,i)=>powMod(27,i))).size,28);

const exponents=new Map(Array.from({length:28},(_,i)=>[powMod(27,i),i]));
const counts=Array(28).fill(0);
let eligible=0,blocked=0,bothH=0,nonH=0,t6=0;
let pageCrossWords=0;
for(const word of words) {
  for(let i=6;i<word.length;i++) {
    eligible++;
    const x=word[i-6],y=word[i];
    if(mod(53-2*x)===y)t6++;
    if((x===8)!==(y===8)){blocked++;continue;}
    if(x===8){bothH++;continue;}
    const quotient=mod((y-8)*inverse(mod(x-8)));
    const exponent=exponents.get(quotient);
    assert.notEqual(exponent,undefined);
    counts[exponent]++;
    nonH++;
    assert.equal(mod(8+powMod(27,exponent)*(x-8)),y);
  }
}
assert.equal(eligible,1290);
assert.equal(blocked,84);
assert.equal(bothH,2);
assert.equal(nonH,1204);
assert.equal(t6,80);
assert.equal(counts[1],78);
assert.equal(counts.reduce((a,b)=>a+b,0),nonH);
const top12=counts.slice().sort((a,b)=>b-a).slice(0,12).reduce((a,b)=>a+b,0);
assert.equal(top12,616);

// Positive: distinct 28-ary non-H GP plaintexts, six secret lane seeds
// per word, and the same T6 power operation. Hidden powers are fully recovered
// from emitted ciphertext. This proves the inverse is sensitive to a real plant.
let recovered=0;
let seed=0x33015308;
/** @returns {number} */
function rand28(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%28;}
for(const length of words.map(w=>w.length)) {
  if(length<7)continue;
  const plain=Array.from({length},()=>rand28());
  const cipher=Array(length).fill(0);
  for(let i=0;i<Math.min(6,length);i++){
    const n=rand28();
    cipher[i]=n<8?n:n+1;
  }
  for(let i=6;i<length;i++){
    cipher[i]=mod(8+powMod(27,plain[i])*(cipher[i-6]-8));
    assert.notEqual(cipher[i],8);
  }
  for(let i=6;i<length;i++){
    const q=mod((cipher[i]-8)*inverse(mod(cipher[i-6]-8)));
    const candidate=exponents.get(q);
    assert.equal(candidate,plain[i]);
    assert.equal(mod(8+powMod(27,candidate)*(cipher[i-6]-8)),cipher[i]);
    recovered++;
  }
}
assert.equal(recovered,1290);

const output={
  model:"Any independent secret nonzero F29 multiplier about fixed rune H at every printed word-local lag-six position",
  original_runes:parsed.runeCount,words:parsed.words.length,cross_page_words:parsed.crossPageWords,
  eligible_lag6_pairs:eligible,impossible_H_status_flips:blocked,
  ambiguous_both_H:bothH,invertible_nonH_pairs:nonH,
  exact_source_T6_matches:t6,
  exponent_order_0_to_27:counts,top12_exponent_frequency:top12,
  positive_secret_exponent_roundtrips:recovered,
  conclusion:"Every exact full-coverage fixed-H lag-six multiplicative model is impossible on the original source; conditional non-H exponent output is not authenticated GP plaintext."
};
process.stdout.write(JSON.stringify(output,null,2)+"\n");
