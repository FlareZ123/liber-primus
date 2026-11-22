"use strict";

/**
 * Frozen original-source nine-state / anti-doublet rank28 hypothesis.
 *
 * Upstream clues: first nine red glyphs on p15 and p54; degree-nine factor
 * of the 256-byte p49–51 table; exceptionally rare adjacent equal glyphs
 * in the unknown manuscript. Interpret an adjacent equal ciphertext pair
 * as plaintext F (escape 0), while a nonrepeat step ranks one of 28 other
 * plaintext GP symbols after an N9-generated rotation.
 *
 * This deliberately tests a different receiver from published direct
 * additive N9 pad hypotheses. Exact inverse/positive plant, no seed,
 * key phase, punctuation reset, or unknown key is fitted.
 *
 * SFT: node sims/lp2_nonic_red9_rank28_repeat_escape_sft.cjs
 * Windows Node 22, CommonJS, no packages and no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const json = filename => JSON.parse(fs.readFileSync(
  path.join(root, filename), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json");
const bytes = Buffer.from(grid.bytes);
assert.equal(bytes.length, 256);
assert.equal(createHash("sha256").update(bytes).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const N9 = [11,15,0,9,1,5,10,20,12,1]; // ascending GF29
const mod = (v,p) => ((v % p) + p) % p;
const work = grid.bytes.map(x => x % 29);
for(let i=0;i<=work.length-N9.length;i++) {
  const q=work[i];
  for(let j=0;j<N9.length;j++)
    work[i+j]=mod(work[i+j]-q*N9[9-j],29);
}
assert.deepEqual(work.slice(-9),Array(9).fill(0));

/**
 * Generate primitive N9 sequence from the nine original red-title GP digits.
 * @param {number[]} seed
 * @param {number} length
 * @returns {number[]}
 */
function key(seed,length) {
  assert.equal(seed.length,9);
  const out=seed.slice();
  for(let i=9;i<length;i++){
    let v=0;
    for(let j=0;j<9;j++)v+=N9[j]*out[i-9+j];
    out.push(mod(-v,29));
  }
  return out;
}

/**
 * Cipher receiver: F=0 iff a glyph repeats its predecessor; otherwise
 * plaintext rank1..28 is rotated by the source-key digit modulo28.
 * @param {number[]} cipher
 * @param {1 | -1} sign
 * @returns {number[]}
 */
function decode(cipher,sign){
  const stream=key(cipher.slice(0,9),cipher.length);
  const result=[];
  for(let i=9;i<cipher.length;i++) {
    const difference=mod(cipher[i]-cipher[i-1],29);
    result.push(difference===0?0:
      1+mod(difference-1-sign*(stream[i]%28),28));
  }
  return result;
}

/**
 * Encode a source-native positive-control plaintext under the same
 * red-nine seed and exact doublet escape rule.
 * @param {number[]} seed
 * @param {number[]} plaintext
 * @param {1 | -1} sign
 * @returns {number[]}
 */
function encode(seed,plaintext,sign){
  const stream=key(seed,plaintext.length+9),cipher=seed.slice();
  for(let i=0;i<plaintext.length;i++){
    const rune=plaintext[i];
    const step=rune===0?0:1+mod(rune-1+sign*(stream[i+9]%28),28);
    cipher.push(mod(cipher[cipher.length-1]+step,29));
  }
  return cipher;
}

/** @param {number[]} text @returns {number} */
function ioc(text){
  const h=Array(29).fill(0);
  for(const x of text)h[x]++;
  return h.reduce((s,v)=>s+v*(v-1),0)/(text.length*(text.length-1));
}

/** @param {number} first @param {number} last @returns {number[]} */
function chapter(first,last){
  return corpus.pages.filter(p=>p.page>=first&&p.page<=last)
    .flatMap(p=>p.indices);
}
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const chapters=[
 {label:"p15–22",start:15,end:22,n:1903,
  seed:[0,1,20,19,24,28,26,22,24],repeats:10,
  expected:[0.03514141747147134,0.03530318725521861]},
 {label:"p54–55",start:54,end:55,n:308,
  seed:[24,19,21,23,27,2,14,10,19],repeats:3,
  expected:[0.03591389643330116,0.03481403335503131]}
];
const results=[];
for(const group of chapters){
 const c=chapter(group.start,group.end);
 assert.equal(c.length,group.n);
 assert.deepEqual(c.slice(0,9),group.seed);
 const doubles=c.slice(1).filter((v,i)=>v===c[i]).length;
 assert.equal(doubles,group.repeats);
 for(const [index,sign] of [1,-1].entries()){
  const recovered=decode(c,sign);
  assert.equal(recovered.filter(x=>x===0).length,doubles);
  assert.deepEqual(encode(group.seed,recovered,sign),c);
  const synthetic=encode(group.seed,native,sign);
  assert.deepEqual(decode(synthetic,sign),native);
  const score=ioc(recovered);
  assert.ok(Math.abs(score-group.expected[index])<1e-12);
  results.push({chapter:group.label,sign,sourceRunes:c.length,
    sourceRepeatEscapes:doubles,decodedRunes:recovered.length,
    decodedIoc:score,
    prefix80:recovered.slice(0,80).map(v=>corpus.translit[v]).join(""),
    solvedP57PositiveRecovered:native.length});
 }
}
console.log(JSON.stringify({hypothesis:"N9/red9 seeded rank28 rotary receiver with ciphertext-doublet plaintext-F escape",
  results,decision:"Both independently source-seeded unknown chapters remain near uniform GP29 and do not yield English. Retire only this exact no-secret phase-9 receiver; no unknown plaintext or source-authenticated key."},null,2));
