"use strict";
/**
 * Key-independent 43-period additive-pad reuse gate: LP2 p27 five 43-rune
 * blocks plus p55's 43 strict word-interior runes. Exact marginalization of
 * each of the 43 unknown GP29 pad symbols (29^43 candidate whole pads).
 * Tests a native-GP unigram English register; no known key is assumed.
 * Reproduce: node sims/lp2_p27_p55_shared43_keyless_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const literal = read("resources/lp2-transcription.txt");
const p27 = gp.pages[27].indices.slice(19);
assert.equal(p27.length, 215);
const p55 = gp.pages[55].indices;
assert.equal(p55.length, 76);
const printed = literal.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const interior = [];
let offset = 0;
for (const word of printed) {
  const glyphs = [...word];
  for (let i = 1; i < glyphs.length - 1; i++) {
    assert.equal(p55[offset+i],gp.runes.indexOf(glyphs[i]));
    interior.push(p55[offset+i]);
  }
  offset += glyphs.length;
}
assert.deepEqual([offset,interior.length],[76,43]);
const cipherRows = Array.from({length:5},(_,i)=>p27.slice(43*i,43*i+43));
cipherRows.push(interior);
const lex = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** Encode existing pinned English into native GP29 graphemes.
 * @param {string} text
 * @returns {number[]}
 */
function encode(text) {
  const s=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const result=[];
  for (const w of s.match(/[A-Z]+/g)||[]) for(let i=0;i<w.length;) {
    const token=lex.find(x=>w.startsWith(x.s,i));
    assert.ok(token,"unmappable native symbol");
    result.push(token.i);
    i+=token.s.length;
  }
  return result;
}
const train=encode(read("resources/control/shakespeare_first300k.txt"));
const hold=encode(read("resources/control/gibran_prophet_58585.txt"));
assert.deepEqual([train.length,hold.length],[218800,63114]);
const logs=new Float64Array(29).fill(0.1);
for(const x of train)logs[x]++;
const total=logs.reduce((a,b)=>a+b,0);
for(let i=0;i<29;i++)logs[i]=Math.log(logs[i]/total);

/** Log-likelihood ratio against independent uniform GP29 ciphertext.
 * The unknown additive key for column i is summed EXACTLY over 29 choices.
 * A different key is allowed in every column and reused in all six rows.
 * @param {number[][]} rows (five or six independently word-free rows)
 */
function score(rows) {
  let gain=0;
  for(let column=0;column<43;column++) {
    const values=[];
    for(let key=0;key<29;key++) {
      let lp=-Math.log(29); // uniform key prior
      for(const row of rows)
        lp+=logs[(row[column]-key+29)%29];
      values.push(lp);
    }
    const max=Math.max(...values);
    gain+=max+Math.log(values.reduce((s,x)=>s+Math.exp(x-max),0))
      +rows.length*Math.log(29);
  }
  return gain;
}
let state=3301;
/** Deterministic, uniformly distributed uint32 xorshift. */
function random() {
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;
}
/** @param {number} n */
const randint=n=>Math.floor(random()*n);
/** @param {number[]} a */
function metrics(a,threshold) {
  const sorted=a.slice().sort((x,y)=>x-y);
  return {samples:a.length,min:sorted[0],median:sorted[300],
    max:sorted.at(-1),atOrBelowOriginal:a.filter(x=>x<=threshold).length};
}
function run() {
  const realFive=score(cipherRows.slice(0,5));
  const realSix=score(cipherRows);
  const sample={plant5:[],plant6:[],wrong5:[],wrong6:[]};
  for(let r=0;r<600;r++) {
    const start=randint(hold.length-258);
    const rowset=Array.from({length:6},(_,i)=>
      hold.slice(start+43*i,start+43*(i+1)));
    const key=Array.from({length:43},()=>randint(29));
    const plant=rowset.map(row=>row.map((v,i)=>(v+key[i])%29));
    const wrong=rowset.map(row=>row.map(v=>(v+randint(29))%29));
    sample.plant5.push(score(plant.slice(0,5)));
    sample.plant6.push(score(plant));
    sample.wrong5.push(score(wrong.slice(0,5)));
    sample.wrong6.push(score(wrong));
  }
  const summary={
    original:{firstFive:realFive,withP55:realSix},
    planted:{firstFive:metrics(sample.plant5,realFive),
      withP55:metrics(sample.plant6,realSix)},
    wrongKeys:{firstFive:metrics(sample.wrong5,realFive),
      withP55:metrics(sample.wrong6,realSix)}
  };
  assert(summary.planted.firstFive.min>realFive);
  assert(summary.planted.withP55.min>realSix);
  assert(summary.wrongKeys.withP55.median<realSix);
  return summary;
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,score};
