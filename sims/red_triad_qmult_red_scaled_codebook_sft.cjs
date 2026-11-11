"use strict";

/**
 * Arbitrary-secret 256-field-symbol codebook exclusion with original
 * 51 red glyphs as row-specific multipliers alpha_r=u^(R_r).
 *
 * Three initial 127-field-pair source rows suffice. For each feedback
 * variant, enumerate 841 possible GF841 starting states PER ROW and
 * all 841^3 hidden seed triples, with an exact three-set cardinality
 * lower bound as in red_triad_qmult_three_row_codebook_sft.cjs.
 *
 * This is a distinct, explicitly source-constrained ciphertext output:
 *   C[r,j] = alpha[r]*P[r,j] + S[r,j]
 *   S[r,j+1] = Q[j]*S[r,j] + (C[r,j] or P[r,j])
 *
 * Positive control plants a fully noncanonical 256-symbol byte codebook
 * and recovers all 381 arbitrary field outputs with hidden row seeds.
 * Run: node sims/red_triad_qmult_red_scaled_codebook_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {quotient, generatorTable} = require("./red_triad_qmult_allstate_byte_sft.cjs");
const {mul} = require("./red_triad_quotient_multiplicative_inverse.cjs");
const {
  uniqueFields, pairMatrix, exhaustiveThree
} = require("./red_triad_qmult_three_row_codebook_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const STATES = 841;
const ROWS = 3;
const WIDTH = 127;

/** @typedef {[number,number]} Field */

/** @param {string} name @returns {any} */
function json(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }
/** @param {Field} a @param {Field} b @returns {Field} */
function plus(a,b) { return [mod(a[0]+b[0]), mod(a[1]+b[1])]; }
/** @param {Field} a @param {Field} b @returns {Field} */
function minus(a,b) { return [mod(a[0]-b[0]), mod(a[1]-b[1])]; }

/**
 * @param {Field[]} row
 * @param {Field[]} q
 * @param {Field} seed
 * @param {"cipher"|"plain"} feedback
 * @param {Field} inverseAlpha
 * @returns {Field[]}
 */
function decrypt(row,q,seed,feedback,inverseAlpha) {
  let state = seed.slice();
  const plain = [];
  for (let j=0;j<WIDTH;j++) {
    const p = mul(minus(row[j],state),inverseAlpha);
    plain.push(p);
    state = plus(mul(q[j],state),feedback==="cipher"?row[j]:p);
  }
  return plain;
}

/**
 * @param {Field[]} plain
 * @param {Field[]} q
 * @param {Field} seed
 * @param {"cipher"|"plain"} feedback
 * @param {Field} alpha
 * @returns {Field[]}
 */
function encrypt(plain,q,seed,feedback,alpha) {
  let state=seed.slice();
  const ciphertext=[];
  for(let j=0;j<WIDTH;j++) {
    const c=plus(mul(alpha,plain[j]),state);
    ciphertext.push(c);
    state=plus(mul(q[j],state),feedback==="cipher"?c:plain[j]);
  }
  return ciphertext;
}

/**
 * @param {Field[]} row
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @param {Field} inverseAlpha
 * @returns {number[][]}
 */
function allStates(row,q,feedback,inverseAlpha) {
  return Array.from({length:STATES},(_,h)=>
    uniqueFields(decrypt(row,q,[h%29,Math.floor(h/29)],feedback,inverseAlpha)));
}

/**
 * @param {Field[]} q
 * @param {Field[][]} ciphertext
 * @param {"cipher"|"plain"} feedback
 * @param {Field[]} inverseAlpha
 * @returns {any}
 */
function proof(q,ciphertext,feedback,inverseAlpha) {
  const sets=ciphertext.map((row,i)=>allStates(row,q,feedback,inverseAlpha[i]));
  const ab=pairMatrix(sets[0],sets[1]);
  const ac=pairMatrix(sets[0],sets[2]);
  const bc=pairMatrix(sets[1],sets[2]);
  const result=exhaustiveThree(sets[0],sets[1],sets[2],ab.scores,ac.scores,bc.scores);
  assert.equal(result.triplesEnumerated,594823321);
  assert.equal(result.triplesNotRuledOut,0);
  assert.ok(result.minLowerBound>256);
  const witness=result.witnessSeeds.map((seed,i)=>new Set(sets[i][seed]));
  const intersection=(a,b)=>[...a].filter(x=>b.has(x)).length;
  const pair=[intersection(witness[0],witness[1]),intersection(witness[0],witness[2]),intersection(witness[1],witness[2])];
  const triple=[...witness[0]].filter(x=>witness[1].has(x)&&witness[2].has(x)).length;
  const actualUnion=new Set(witness.flatMap(x=>[...x])).size;
  assert.equal(actualUnion,result.minLowerBound+triple);
  return {
    ...result,
    witnessSingles:witness.map(x=>x.size),
    witnessPairs:pair,
    witnessTriple:triple,
    witnessActualUnion:actualUnion
  };
}

/**
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @param {Field[]} alpha
 * @param {Field[]} inv
 * @returns {any}
 */
function plant(q,feedback,alpha,inv) {
  const codebook=new Set(Array.from({length:256},(_,b)=>(37*b+17)%841));
  const seeds=/** @type {Field[]} */ ([[9,3],[12,20],[15,8]]);
  let successes=0,matchingStates=[];
  for(let i=0;i<ROWS;i++) {
    const raw=Array.from({length:WIDTH},(_,j)=>{
      const b=(i*73+j*19+i*j*7)%256;
      const v=(37*b+17)%841;
      return /** @type {Field} */ ([v%29,Math.floor(v/29)]);
    });
    const c=encrypt(raw,q,seeds[i],feedback,alpha[i]);
    assert.deepEqual(decrypt(c,q,seeds[i],feedback,inv[i]),raw);
    const eligible=allStates(c,q,feedback,inv[i])
      .flatMap((fields,h)=>fields.every(v=>codebook.has(v))?[h]:[]);
    const expected=seeds[i][0]+29*seeds[i][1];
    assert.ok(eligible.includes(expected));
    successes+=WIDTH;
    matchingStates.push(eligible.length);
  }
  return {codebookSize:codebook.size,recoveredFieldPairs:successes,eligibleSecretsByRow:matchingStates};
}

function main(){
  const corpus=json("resources/liber-primus/lp2-corpus.json");
  const grid=json("resources/liber-primus/base60-grid.json");
  const red=json("resources/liber-primus/lp2-page53-red-span.json");
  const runes=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert.equal(runes.length,12956);
  const payload=runes.slice(2);
  const rowCipher=Array.from({length:ROWS},(_,i)=>
    Array.from({length:WIDTH},(_,j)=>{
      const p=(i*WIDTH+j)*2;
      return /** @type {Field} */ ([payload[p],payload[p+1]]);
    }));
  const redIndices=[...red.red_text.runes].map(c=>corpus.runes.indexOf(c));
  assert.equal(redIndices.length,51);
  assert.deepEqual(redIndices.slice(0,3),[16,13,7]);
  const q=quotient(grid.byte_rows.flat());
  const {powers}=generatorTable();
  const alpha=redIndices.slice(0,ROWS).map(x=>powers[x]);
  const inverseAlpha=redIndices.slice(0,ROWS).map(x=>powers[(840-x)%840]);
  for(let i=0;i<ROWS;i++)assert.deepEqual(mul(alpha[i],inverseAlpha[i]),[1,0]);
  const summary={};
  for(const feedback of /** @type {const} */ (["cipher","plain"])){
    const original=proof(q,rowCipher,feedback,inverseAlpha);
    assert.equal(original.minLowerBound,feedback==="cipher"?260:261);
    summary[feedback]={original,arbitraryCodebookControl:plant(q,feedback,alpha,inverseAlpha)};
  }
  process.stdout.write(JSON.stringify({
    source:"LP2 original first three 127-field rows plus first 3 p53 red rune exponents",
    redRowExponents:redIndices.slice(0,ROWS),
    inverseFieldMultipliers:inverseAlpha,
    codebookAlphabetCap:256,
    exactSeedTriplesPerModel:STATES**ROWS,
    summary,
    conclusion:"No stationary 256-symbol GF841 plaintext codebook for either public red-scaled quotient feedback law, under any per-row secret field starting states."
  },null,2)+"\n");
}

if(require.main===module) main();
module.exports={decrypt,encrypt,allStates,proof};
