'use strict';
/**
 * One source-selected GP29 exceptional successor-offset schedule:
 * the 13 original p0 RED opening runes, as physical ink verified,
 * cycled within words with either sign and one of 13 finite phases.
 *
 * Cipher class is the lossless word-first exception:
 *    C[w,j] = C[w,j-1] + F[w,j](P[w,j]) mod29
 * with the unique zero preimage of F at P[w,0] ± RED[(j+phase)%13].
 * Remaining 28 outputs are freely bijected on each separate rune.
 * Thus repeated ciphertext pairs have a key-independent original
 * English test based only on word-initial-relative rune recurrence.
 *
 * Read-only Windows Node22 CommonJS SFT, reproducible original-source
 * whole-book exact source-length-matched probability distribution.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-p0-physical-ink-override.json'));
const RED = ink.physical_zero_based.red_words.flatMap(w => w.gp_indices);
assert.deepEqual(RED, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(ink.physical_zero_based.large_punctuation[0].after_runes, 13);
assert.equal(ink.original_jpeg.path, 'resources/liber-primus/17.jpg');
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const LEN = 14, TOTAL = 12956, Q = 29, CAP = 95;
const lenCounts = new Uint32Array(LEN + 1);
const wordStarts = [];
const original = [];
let word = [], start = 0, total = 0;
for (const ch of read('resources/liber-primus/lp2-transcription.txt')) {
  if (runeMap.has(ch)) {
    if (!word.length) start = total;
    word.push(runeMap.get(ch)); total++;
    if (total === TOTAL) { original.push({start, indices:word}); break; }
  } else if ('-.&'.includes(ch) && word.length) {
    original.push({start, indices:word}); word=[];
  }
}
assert.equal(original.length, 2896);
assert.equal(total, TOTAL);
for (const w of original) lenCounts[w.indices.length]++;
assert.deepEqual(Array.from(lenCounts.slice(1)),
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]);
let observed = 0;
for (const w of original)
  for (let j = 1; j < w.indices.length; j++)
    observed += Number(w.indices[j] === w.indices[j-1]);
assert.equal(observed, 63);
const pageCuts = new Set();
let n = 0;
for (const p of gp.pages) {
  if (p.page >= 56) break;
  n += p.indices.length;
  if (n < TOTAL) pageCuts.add(n);
}
let carry = 0;
for (const w of original)
  if ([...pageCuts].some(c => w.start < c && c < w.start+w.indices.length)) carry++;
assert.equal(carry, 32);
assert.equal(observed + carry, CAP);

/** @param {number} x @returns {number} */
const mod = x => ((x%Q)+Q)%Q;
/** @param {number} pos @param {number} sign @param {number} phase @returns {number} */
function offset(pos, sign, phase) {
  return mod(sign * RED[(pos+phase)%RED.length]);
}
const tokens = gp.translit.map((value, i) => ({value, i}))
  .sort((a,b) => b.value.length - a.value.length);
/** @param {string} spelling @returns {number[]} */
function nativeWord(spelling) {
  const s = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let j=0;j<s.length;) {
    if (s.startsWith('ING',j)) { out.push(21); j+=3; continue; }
    if (s.startsWith('IO',j)) { out.push(27); j+=2; continue; }
    const t = tokens.find(t => s.startsWith(t.value,j));
    assert.ok(t, 'unknown source native rune');
    out.push(t.i); j+=t.value.length;
  }
  return out;
}
/**
 * Full reversible demonstrator of a 29-way bijection at each site.
 * The remaining 28 successors have a simple changing rotation, chosen
 * as an implementation test only.
 * @param {number[]} plaintext @param {number} sign @param {number} phase
 * @returns {number[]}
 */
function encrypt(plaintext,sign,phase) {
  const out = [plaintext[0]];
  for (let j=1;j<plaintext.length;j++) {
    const delta=mod(plaintext[j]-plaintext[0]-offset(j,sign,phase));
    const step=delta===0?0:1+(delta-1+11*j)%28;
    out.push(mod(out.at(-1)+step));
  }
  return out;
}
/** @param {number[]} cipher @param {number} sign @param {number} phase @returns {number[]} */
function decrypt(cipher,sign,phase) {
  const p=[cipher[0]];
  for (let j=1;j<cipher.length;j++) {
    const step=mod(cipher[j]-cipher[j-1]);
    const relative=step===0?0:1+mod28(step-1-11*j);
    p.push(mod(p[0]+offset(j,sign,phase)+relative));
  }
  return p;
}
/** @param {number} x @returns {number} */
const mod28=x=>((x%28)+28)%28;
const witness=original[1476].indices;
assert.deepEqual(witness,[12,4,9,15,3,3,5,24,18,26,18,18]);
const doubleSites = w => w.flatMap((v,j)=>j&&v===w[j-1]?[j]:[]);
assert.deepEqual(doubleSites(witness),[5,11]);
const wordList=read('resources/control/english_wordfreq_textblob.txt');
const dictionary=[];
for(const m of wordList.matchAll(/^([a-z]+)\s+\d+$/gm)){
  const w=nativeWord(m[1]);
  if(w.length===12)dictionary.push({word:m[1],indices:w});
}
assert.equal(dictionary.length,772);

const expandedDictionary = new Map(dictionary.map(({word,indices})=>[word,indices]));
for (const sourcePath of [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
]) {
  for(const match of read(sourcePath).matchAll(/[A-Za-z]+/g)) {
    const spelling = match[0].toLowerCase();
    if(expandedDictionary.has(spelling))continue;
    const indices=nativeWord(spelling);
    if(indices.length===12) expandedDictionary.set(spelling,indices);
  }
}
assert.equal(expandedDictionary.size,872); // 100 additional independent native words
const allDictionary = [...expandedDictionary].map(([word,indices])=>({word,indices}));

const masks=[];
for(const sign of [1,-1])for(let phase=0;phase<13;phase++){
  const options=dictionary.filter(({indices:w}) =>
    w.slice(1).every((v,i) =>
      (v===mod(w[0]+offset(i+1,sign,phase)))===
        doubleSites(witness).includes(i+1)));
  masks.push({sign,phase,words:options.map(o=>o.word)});
}
assert.deepEqual(masks.find(x=>x.sign===1&&x.phase===0).words, ['complacently']);
assert.deepEqual(masks.find(x=>x.sign===-1&&x.phase===0).words,
  ['intelligence','intelligible']);
assert.equal(masks.filter(x=>x.words.length===0).length,12);

/**
 * Entire finite source-red13 additive GF29 differential consumer with
 * a single nonzero secret slope per word:
 * P_j - P_0 = slope*(C_j-C_(j-1)) + sign*RED[(j+phase)%13].
 * The 12-rune original p27 unknown-word fingerprint must be exactly a
 * pinned native GP dictionary word modulo the unknown first rune.
 * @returns {number}
 */
function countOriginalAffineWordFits() {
  const fingerprints = new Set(allDictionary.map(({indices:w}) =>
    w.slice(1).map(v=>mod(v-w[0])).join(',')));
  let hits=0;
  for(const sign of [1,-1])for(let phase=0;phase<13;phase++)
    for(let slope=1;slope<Q;slope++){
      const differences=witness.slice(1).map((v,i)=>mod(v-witness[i]));
      const fingerprint=differences.map((delta,i)=>
        mod(slope*delta+offset(i+1,sign,phase))).join(',');
      hits+=Number(fingerprints.has(fingerprint));
    }
  return hits;
}
assert.equal(countOriginalAffineWordFits(),0); // 26 clocks x 28 invertible slopes

/**
 * A more general static per-word 29! substitution, with a source-red
 * positional subtraction before applying the same secret alphabet.
 * Every observed equal/different pattern in the original p27 successor
 * differences must agree exactly with the input-relative differences
 * for a candidate native GP word, independent of the secret table.
 * @returns {number}
 */
function countOriginalStaticWordPermutations() {
  let options=0;
  const differences=witness.slice(1).map((v,i)=>mod(v-witness[i]));
  for(const sign of [1,-1])for(let phase=0;phase<13;phase++)
    for(const {indices:w} of allDictionary){
      const inputToOutput=new Map([[0,0]]);
      const outputToInput=new Map([[0,0]]);
      let possible=true;
      for(let j=1;j<w.length;j++){
        const x=mod(w[j]-w[0]-offset(j,sign,phase));
        const y=differences[j-1];
        if((inputToOutput.has(x)&&inputToOutput.get(x)!==y)||
            (outputToInput.has(y)&&outputToInput.get(y)!==x)){
          possible=false;break;
        }
        inputToOutput.set(x,y);
        outputToInput.set(y,x);
      }
      options+=Number(possible);
    }
  return options;
}
assert.equal(countOriginalStaticWordPermutations(),0); // 26 clocks x 872 native words


assert.deepEqual(encrypt(decrypt(witness,1,0),1,0),witness);
const solved=gp.pages.find(p=>p.page===57).indices;
assert.deepEqual(decrypt(encrypt(solved,-1,7),-1,7),solved);
assert.equal(solved.length,95);

/** @param {string} source @returns {number[][][]} */
function pools(source) {
  const groups=Array.from({length:LEN+1},()=>[]);
  for(const m of source.matchAll(/[A-Za-z]+/g)){
    const w=nativeWord(m[0]);
    if(w.length<=LEN)groups[w.length].push(w);
  }
  for(let i=1;i<=LEN;i++)assert.ok(groups[i].length);
  return groups;
}
/**
 * Exact probability-generating-function convolution to 95, computing
 * native-GP word-initial-relative offset hit count over all 2,896
 * authentic original printed word slots.
 * @param {number[][][]} words
 * @param {number} sign
 * @param {number} phase
 * @returns {{mean:number,pAtMost95:number}}
 */
function exact(words,sign,phase) {
  const dp=new Float64Array(CAP+1),next=new Float64Array(CAP+1);
  dp[0]=1;let mean=0;
  for(let len=2;len<=LEN;len++){
    const hist=new Float64Array(len);
    for(const w of words[len]){
      let count=0;
      for(let j=1;j<len;j++)count+=Number(w[j]===mod(w[0]+offset(j,sign,phase)));
      hist[count]++;
    }
    for(let hit=0;hit<len;hit++){hist[hit]/=words[len].length;mean+=hit*hist[hit]*lenCounts[len];}
    for(let i=0;i<lenCounts[len];i++){
      next.fill(0);
      for(let got=0;got<=CAP;got++)if(dp[got]){
        for(let hit=0;hit<len&&got+hit<=CAP;hit++)
          next[got+hit]+=dp[got]*hist[hit];
      }
      dp.set(next);
    }
  }
  return {mean,pAtMost95:dp.reduce((a,b)=>a+b,0)};
}
const definitions=[
  ['Gibran','resources/control/gibran_prophet_58585.txt',1.067680147650052e-29,296.7413606056467],
  ['Shakespeare','resources/control/shakespeare_first300k.txt',2.363147996244482e-31,303.3504911944181],
  ['Emerson','resources/control/emerson_essays_2944.txt',1.934813198543028e-33,290.19403534302137]
];
const reports=[];
for(const [name,sourcePath,unionTarget,meanTarget] of definitions){
  const words=pools(read(sourcePath));
  const attempts=[];
  for(const sign of [1,-1])for(let phase=0;phase<13;phase++)
    attempts.push({sign,phase,...exact(words,sign,phase)});
  const union=attempts.reduce((sum,x)=>sum+x.pAtMost95,0);
  const direct=attempts.find(x=>x.sign===1&&x.phase===0);
  assert.ok(Math.abs(union/unionTarget-1)<1e-9);
  assert.ok(Math.abs(direct.mean-meanTarget)<1e-9);
  assert.ok(union<1e-28);
  reports.push({source:name,defaultPhase0Plus:direct,
    defaultPhase0Minus:attempts.find(x=>x.sign===-1&&x.phase===0),
    strongestTail:attempts.reduce((a,b)=>b.pAtMost95>a.pAtMost95?b:a),
    unionBoundAll26At95:union});
}
console.log(JSON.stringify({description:'source-red13 word-first exceptional differential cipher exact original GP29 key-independent gate',
 source:{total,words:original.length,withinWordDoubles:observed,pageCarryExemptions:carry,
  physicalRed13:RED,originalP27DoubleSites:doubleSites(witness)},
 controls:{solvedP57FullRoundTrip:95,p27Phase0Plus:masks[0].words,
  p27Phase0Minus:masks[13].words},
 model:'word-length-matched independent native-GP English; no claim about authorship or all transducers',
 reports, recoveredUnknownPlaintext:false},null,2));