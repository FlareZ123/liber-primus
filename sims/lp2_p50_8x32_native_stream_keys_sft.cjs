"use strict";
/**
 * Read-only bounded original-source key acquisition test:
 * original p50 32 rows x 8 columns = eight 256-bit candidate keys.
 * Try precisely source-direct AES-256-CTR and ChaCha20 zero-IV keystreams
 * as additive rune keys or previous-ciphertext-relative rune step keys.
 * All 8 source columns can be assigned to any original chapter, avoiding
 * false negatives due to conjectural eight-to-nine chapter assignment.
 *
 * This is a *motivated hypothesis*, not a discovered Cicada operation.
 * The actual creator's primitive, IV, serialization and filtering are unknown.
 * Windows Node.js 22; no npm dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const GP = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const originalWords = parseLP2Words(
  read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(originalWords.runeCount,12956);
assert.equal(originalWords.words.length,2896);
assert.equal(originalWords.crossPageWords,32);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row => row.length === 8));
const keys = Array.from({length:8},(_,c) =>
  Buffer.from(grid.byte_rows.map(row => row[c])));
assert(keys.every(key => key.length === 32));
const originalStream = GP.pages.filter(p =>
  p.page < 56 && p.indices.length).flatMap(p => p.indices);
const runeIndex = new Map(GP.runes.map((r,i) => [r,i]));
const indexWords = originalWords.words.map(w =>
  [...w.runes].map(c => {
    const idx = runeIndex.get(c);
    assert.notEqual(idx,undefined);
    return idx;
  }));
assert.deepEqual(indexWords.flat(), originalStream);
const physical = page => page >= 50 ? page+1 : page;
const groups = [
  [0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]
];
const sources = groups.map(([start,end],section) => {
  const whole = originalWords.words
    .map((word,i) => ({word,indices:indexWords[i]}))
    .filter(({word}) => {
      const first=physical(word.startPage),last=physical(word.endPage);
      assert.equal(first>=start&&first<=end,last>=start&&last<=end,
        "a printed word spans distinct original section starts");
      return first>=start&&first<=end;
    });
  const source=whole.flatMap(x => x.indices);
  const raw=GP.pages.filter(p => p.page>=start&&p.page<=end)
    .flatMap(p => p.indices);
  assert.deepEqual(source,raw,
    "source-native word alignment must exactly match original runes");
  return {section, pages:start+"-"+end, raw, wordLengths:whole.map(x=>x.indices.length)};
});
assert.equal(sources.reduce((a,s)=>a+s.raw.length,0),12956);
const dictionary = new Set((read("resources/control/gibran_prophet_58585.txt")
  .match(/[A-Za-z]+/g)||[]).map(w => encodeSourceNativeGP(w).join(",")));
assert.equal(dictionary.size,2482);
const ciphers=crypto.getCiphers();
for(const algorithm of ["aes-256-ctr","chacha20"]) {
  assert(ciphers.includes(algorithm),
    "OpenSSL must supply "+algorithm+" on this Node22 runner");
}
/**
 * @param {"aes-256-ctr"|"chacha20"} algorithm
 * @param {Buffer} key 32 bytes from one original column
 * @param {number} length stream byte count
 */
function stream(algorithm,key,length){
  const iv=Buffer.alloc(16);
  const c=crypto.createCipheriv(algorithm,key,iv);
  return Buffer.concat([c.update(Buffer.alloc(length)),c.final()]);
}
const mod=n=>((n%29)+29)%29;
/**
 * @param {number[]} original
 * @param {Buffer} keystream
 * @param {"direct"|"chain"} mode
 * @param {-1|1} sign
 */
function decrypt(original,keystream,mode,sign){
  let predecessor=0;
  return original.map((value,i)=>{
    const p=mod(value-(mode==="chain"?predecessor:0)+sign*(keystream[i]%29));
    predecessor=value;
    return p;
  });
}
function encrypt(plain,keystream,mode,sign){
  let predecessor=0;
  return plain.map((value,i)=>{
    const c=mod(value+(mode==="chain"?predecessor:0)-sign*(keystream[i]%29));
    predecessor=c;
    return c;
  });
}
function score(decoded,wordLengths){
  let n=0,hits=0,runes=0,longHits=0,offset=0;
  for(const length of wordLengths){
    const word=decoded.slice(offset,offset+length);
    const ok=dictionary.has(word.join(","));
    hits+=Number(ok);
    if(ok){runes+=length;longHits+=Number(length>=4);}
    n++;offset+=length;
  }
  assert.equal(offset,decoded.length);
  const frequencies=new Array(29).fill(0);
  for(const x of decoded)frequencies[x]++;
  const count=decoded.length;
  const ioc=frequencies.reduce((a,c)=>a+c*(c-1),0)/(count*(count-1));
  return {words:n,runeHits:runes,wordHits:hits,longHits,
    runeCoverage:runes/count,ioc};
}
// Actual original source p57 clear text, exactly 95 runes, is the positive.
// Plant under each genuine original 32-byte column and require exact
// reverse and forward reproduction for both AES/ChaCha and both modes/signs.
const clear=GP.pages[57].indices;
assert.equal(clear.length,95);
let planted=0;
for(const algorithm of ["aes-256-ctr","chacha20"])
for(let column=0;column<8;column++)
for(const mode of ["direct","chain"])
for(const sign of [-1,1]){
  const k=stream(algorithm,keys[column],clear.length);
  const cipher=encrypt(clear,k,mode,sign);
  assert.deepEqual(decrypt(cipher,k,mode,sign),clear);
  assert.deepEqual(encrypt(decrypt(cipher,k,mode,sign),k,mode,sign),cipher);
  planted++;
}
const trial=[];
for(const original of sources)
for(let column=0;column<8;column++)
for(const algorithm of ["aes-256-ctr","chacha20"]){
  const k=stream(algorithm,keys[column],original.raw.length);
  for(const mode of ["direct","chain"])
  for(const sign of [-1,1]){
    const output=decrypt(original.raw,k,mode,sign);
    const stats=score(output,original.wordLengths);
    trial.push({section:original.section,pages:original.pages,
      length:original.raw.length,column,algorithm,mode,sign,...stats,
      first80:output.slice(0,80).map(x=>GP.translit[x]).join("")});
  }
}
assert.equal(trial.length,9*8*2*2*2);
const top=trial.slice().sort((a,b)=>
  b.runeCoverage-a.runeCoverage || b.longHits-a.longHits).slice(0,12);
const bestBySection=sources.map(source=>{
  const a=trial.filter(x=>x.section===source.section)
    .sort((a,b)=>b.runeCoverage-a.runeCoverage||b.longHits-a.longHits);
  return a[0];
});
const major=trial.filter(x=>x.length>=200);
const highestIoc=major.slice().sort((a,b)=>b.ioc-a.ioc).slice(0,8);
const longEnglish=major.filter(x=>x.longHits>=5&&x.runeCoverage>.12);
const result={status:longEnglish.length?
  "Potential source-native GP lexical lead requires independent original test":
  "No original English-like plaintext under the eight-column AES/ChaCha zero-IV source-key models",
  source:"Original p50 32x8 base60 table -> eight 32-byte columns; canonical original GP29 LP2 original bytes",
  input:{runes:12956,sections:sources.map(s=>({pages:s.pages,length:s.raw.length,
    words:s.wordLengths.length})),columnLengths:keys.map(x=>x.length),
    dictionaryDistinctNativeGPWords:dictionary.size},
  boundedModels:{ciphers:["aes-256-ctr","chacha20"],iv:"16 byte all-zero, no salt",
    keys:"eight source columns, any assignment to nine original sections",
    modes:["C−keystreamByte%29","C−previousC−keystreamByte%29"],
    signs:["plus","minus"],trials:trial.length,plantedSourceControls:planted},
  bestOriginalWordCoverage:top,bestPerOriginalSection:bestBySection,
  highestOriginalIoC:highestIoc,
  multiwordHighCoverage:longEnglish,
  limitation:"Only exactly these source-raw column keys with fixed zero-IV AES/ChaCha byte modulo29. No original cipher/nonce, no unknown plaintext, no general key-or-operation exclusion."};
console.log(JSON.stringify(result,null,2));
