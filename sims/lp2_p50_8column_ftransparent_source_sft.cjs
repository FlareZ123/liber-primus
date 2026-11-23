"use strict";
/**
 * Original p49-p51 32x8 numeric source as eight 256-bit AES/ChaCha keys,
 * transferred through the independently authenticated Cicada plaintext-F
 * no-key-consumption rule. Unlike earlier direct modulo29 tests, the key
 * byte clock advances ONLY when plaintext is non-F. Original p51-p53 and
 * p54-p55 are distinct complete printed-word scopes.
 *
 * Bounded source-shaped experiment, not an authenticated cipher claim.
 * Windows 11, Node.js 22, CommonJS, no dependencies or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  decode, encrypt, printedWords, concat, lexicon, original
} = require("./lp2_ftransparent_original_lexical_viterbi_sft.cjs");

const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) { return fs.readFileSync(path.join(root,file), "utf8"); }
const tableText = read("resources/liber-primus/base60-grid.json");
const grid = JSON.parse(tableText);
const manuscript = read("resources/liber-primus/lp2-transcription.txt");
const chunks = manuscript.split("%");
assert.equal(grid.byte_rows.length,32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
const keys = Array.from({length:8},(_,column) =>
  Buffer.from(grid.byte_rows.map(row => row[column])));
assert.ok(keys.every(key => key.length === 32));

/** @param {number} number @returns {number} */
function mod(number) { return (number%29+29)%29; }
/**
 * @param {"aes-256-ctr"|"chacha20"} algorithm
 * @param {Buffer} key
 * @param {number} length
 * @returns {Buffer}
 */
function bytes(algorithm,key,length) {
  const cipher=crypto.createCipheriv(algorithm,key,Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(length)),cipher.final()]);
}
/**
 * Strict F-aware encoding feasibility, entirely independent of word scores.
 * @param {number[]} ciphertext
 * @param {(consumed:number)=>number} shift
 * @returns {{feasible:boolean, maxStates:number, firstFailure:number|null}}
 */
function feasibility(ciphertext,shift) {
  let states=new Set([0]),maxStates=1;
  for(let i=0;i<ciphertext.length;i++){
    const c=ciphertext[i],next=new Set();
    for(const k of states) {
      if(c===0)next.add(k);
      if(mod(c-shift(k))!==0)next.add(k+1);
    }
    states=next;
    maxStates=Math.max(maxStates,states.size);
    if(!states.size)return {feasible:false,maxStates,firstFailure:i};
  }
  return {feasible:true,maxStates,firstFailure:null};
}
/**
 * @param {number[]} values
 * @returns {number}
 */
function ioc(values) {
  const freq=Array(29).fill(0);
  for(const n of values)freq[n]++;
  return freq.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/**
 * @param {number[][]} words
 * @param {number[]} plaintext
 * @returns {{wordHits:number, longHits:number, runeCoverage:number, words:number}}
 */
function wordStats(words,plaintext) {
  let off=0,wordHits=0,longHits=0,runeHits=0;
  for(const w of words){
    const letters=plaintext.slice(off,off+w.length);
    const hit=lexicon.has(letters.join(","));
    if(hit){wordHits++;runeHits+=w.length;if(w.length>=4)longHits++;}
    off+=w.length;
  }
  assert.equal(off,plaintext.length);
  return {wordHits,longHits,runeCoverage:runeHits/plaintext.length,words:words.length};
}
const scopes=[
  {name:"physical p51-p53, directly after numeric spread", physical:[51,52,53], transcript:[50,51,52]},
  {name:"physical p54-p55, terminal disjoint holdout", physical:[54,55], transcript:[53,54]}
].map(s=>{
  const words=printedWords(s.transcript.map(i=>chunks[i]).join(""));
  const ciphertext=concat(words);
  const exact=s.physical.flatMap(p=>original.pages[p].indices);
  assert.deepEqual(ciphertext,exact,"exact original printed word and rune alignment");
  return {...s,words,ciphertext,rawIOC:ioc(ciphertext)};
});
assert.deepEqual(scopes.map(s=>s.ciphertext.length),[534,308]);
const sourceControls=printedWords(chunks[56]);
assert.deepEqual(concat(sourceControls),original.pages[57].indices);
const positive=original.pages[57].indices;
const tests=[];
for(const algorithm of ["aes-256-ctr","chacha20"]){
  assert.ok(crypto.getCiphers().includes(algorithm));
  for(let column=0;column<8;column++){
    const stream=bytes(algorithm,keys[column],Math.max(534,308,95));
    for(const sign of [-1,1]){
      const shift=/** @param {number} used */ used => mod(sign*(stream[used]%29));
      const planted=encrypt(positive,shift);
      assert.equal(feasibility(planted,shift).feasible,true);
      const controlWords=[]; let off=0;
      for(const w of sourceControls) {
        controlWords.push(planted.slice(off,off+w.length));off+=w.length;
      }
      assert.equal(off,95);
      const decodedControl=decode(controlWords,shift).states[0];
      const positiveExact=decodedControl.plain.every((x,i)=>x===positive[i]);
      assert.deepEqual(encrypt(decodedControl.plain,shift),planted);
      for(const scope of scopes) {
        const feasibilityResult=feasibility(scope.ciphertext,shift);
        if(!feasibilityResult.feasible) {
          tests.push({algorithm,column,sign,scope:scope.name,positiveExact,
            ...feasibilityResult,rawIOC:scope.rawIOC});
          continue;
        }
        const recovered=decode(scope.words,shift);
        const best=recovered.states[0];
        assert.deepEqual(encrypt(best.plain,shift),scope.ciphertext);
        const ws=wordStats(scope.words,best.plain);
        tests.push({algorithm,column,sign,scope:scope.name,positiveExact,
          ...feasibilityResult,rawIOC:scope.rawIOC,outputIOC:ioc(best.plain),
          lexicalScore:best.score,...ws,finalStates:recovered.states.length,
          literalF:best.literals.length,
          first80:best.plain.slice(0,80).map(n=>original.translit[n]).join(""),
          unseenFirst8:best.unseenWords.slice(0,8)});
      }
    }
  }
}
assert.equal(tests.length,64);
const ranked=tests.filter(t=>t.feasible).slice().sort((a,b)=>
  b.runeCoverage-a.runeCoverage||b.longHits-a.longHits||b.lexicalScore-a.lexicalScore);
const result={
  classification:"bounded original-cipher test; valid F-clock original key still required",
  source:"untouched original 32x8 byte panel, physical p51-p53 and p54-p55, independently verified Cicada F-bypass operation",
  input:{first:scopes[0].ciphertext.length,holdout:scopes[1].ciphertext.length,
    originalColumns:keys.length,words:scopes.map(x=>x.words.length),
    tableSha256:crypto.createHash("sha256").update(tableText).digest("hex"),
    textSha256:crypto.createHash("sha256").update(manuscript).digest("hex")},
  tested:"8 original 32-byte column keys x AES-256-CTR/ChaCha20 x two signs x two original intact scopes; 16-byte zero IV, byte mod29, original plaintext F literal and no clock advance",
  totals:{candidates:tests.length,feasible:ranked.length,
    impossible:tests.filter(x=>!x.feasible).length,
    p57ControlExact:tests.filter(x=>x.positiveExact).length/2},
  bestOriginal:ranked.slice(0,12),
  impossibleExamples:tests.filter(x=>!x.feasible).slice(0,6),
  decision:"Only a recovered multiword source-native plaintext with independent original-page continuity could support a cipher. Perfect re-encryption alone follows from the known F-forward contract.",
};
console.log(JSON.stringify(result,null,2));
