"use strict";
/**
 * Reproduce a source-native GP29 morphological holdout for the original
 * seven LP2 words of length 13 or 14, and a fixed p7 five-tap global-q
 * recovery conditional on that language register.
 *
 * Scope: verified solved LP1 orthographic calibration; exact withheld LP2
 * p57 CIRCUMFERENCES (14 GP runes); independent pre-existing literary
 * and TextBlob sources; strict nominal singular -> plural derivation.
 * No source text from unknown LP2 pages enters the lexicon.
 *
 * Node.js 22 / Windows: node sims/lp2_p7_morph_native_sharedq_holdout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originals = parseSharedCorpus();
const runeIndex = new Map(gp.runes.map((r,i) => [r,i]));
const W = [11,26,8,15,2];
const mod = x => ((x % 29) + 29) % 29;
const inverses = new Int8Array(29);
for (let x=1;x<29;x++) for (let y=1;y<29;y++)
  if ((x*y)%29===1) inverses[x]=y;

/** A textual source's *literal* word is a distinct class from a generated form. */
const words = new Map();
function add(word,source) {
  word=word.toLowerCase();
  if (!/^[a-z]+$/.test(word) || words.has(word)) return;
  // Withhold this solved LP2 lexical token from *all* training sources.
  if (word === "circumferences" && source !== "attested TextBlob noun lemma + source plurals") return;
  const p = encodeSourceNativeGP(word);
  if (p.length===13 || p.length===14) words.set(word,{word,P:p,source});
}
const baseCounts = new Map();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = /^([a-z]+) (\d+)$/.exec(line);
  if (!match) continue;
  baseCounts.set(match[1],Number(match[2]));
  add(match[1],"TextBlob attested");
}
// Authentic solved p57 is strictly withheld, never part of train.
const trainingSources = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/blake_song_of_liberty_train.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
for (const file of trainingSources) {
  const text = read(file);
  const preP57 = file.endsWith("lp1-plaintext-reference.txt")
    ? text.split("### 57\n")[0] : text;
  for (const word of preP57.match(/[A-Za-z]+/g)||[]) add(word,file);
}
// Freeze the only derived forms to a noun plural rule observed in solved
// LP1: PRIMES, ILLUSIONS, REALITIES. The held-out solved LP2 plural
// CIRCUMFERENCES must be generated from independent singular evidence.
const nounEnding = /(?:tion|sion|ment|ness|ence|ance|ity|hood|ship|ure|age|dom|ism|ist|er|or)$/;
function plural(noun) {
  if (noun.endsWith("s")) return null;
  if (/[^aeiou]y$/.test(noun)) return noun.slice(0,-1)+"ies";
  if (/(?:ch|sh|x|z)$/.test(noun)) return noun+"es";
  return noun+"s";
}
let generated=0;
for (const [lemma,count] of baseCounts) {
  if (count<2 || !nounEnding.test(lemma)) continue;
  const derived=plural(lemma);
  if (!derived || words.has(derived)) continue;
  const before=words.size;
  add(derived,"attested TextBlob noun lemma + source plurals");
  if (words.size>before) generated++;
}
assert.equal(baseCounts.get("circumference"),2);
assert.equal(words.get("circumferences").source,
  "attested TextBlob noun lemma + source plurals");
const heldOut = encodeSourceNativeGP("CIRCUMFERENCES");
assert.equal(heldOut.length,14);
const page57=gp.pages.find(p=>p.page===57).indices.join(",");
assert(page57.includes(heldOut.join(",")),
  "withheld independently solved p57 original GP14 word");
assert.deepEqual(heldOut,words.get("circumferences").P);

// Exact source-selected all-secret feedback algebra as previously published
// in lp2_p7_fivefeedback_sharedkey_fullenglish_sft.cjs; no new parameters.
function innovation(s) {
  const out=[];
  for (let i=5;i<s.length;i++){
    let v=s[i];
    for (let j=0;j<5;j++)v-=W[j]*s[i-j-1];
    out.push(mod(v));
  }
  return out;
}
/**
 * Full-rank exact GF29 solver. Unique solutions only; rank-deficient
 * words cannot establish an authentic shared key from seven long words.
 * @param {number[][]} matrix @param {number[]} target
 * @returns {{q:number[],a:number}|null}
 */
function solveSix(matrix,target) {
  const n=matrix.length;
  assert(n>=7 && target.length===n);
  const rows=matrix.map((r,k)=>r.map(mod).concat(mod(target[k])));
  const pivots=[];
  let rank=0;
  for(let col=0;col<6;col++){
    let pivot=rank;
    while(pivot<n && rows[pivot][col]===0)pivot++;
    if(pivot===n) continue;
    [rows[pivot],rows[rank]]=[rows[rank],rows[pivot]];
    const mul=inverses[rows[rank][col]];
    for(let k=col;k<=6;k++) rows[rank][k]=mod(rows[rank][k]*mul);
    for(let i=0;i<n;i++)if(i!==rank && rows[i][col]!==0){
      const m=rows[i][col];
      for(let k=col;k<=6;k++) rows[i][k]=mod(rows[i][k]-m*rows[rank][k]);
    }
    pivots.push(col);
    rank++;
  }
  for(let i=rank;i<n;i++)if(rows[i][6]!==0)return null;
  if(rank!==6) return null;
  const v=Array(6).fill(0);
  for(let i=0;i<rank;i++)v[pivots[i]]=rows[i][6];
  if(!v[5])return null;
  return {q:v.slice(0,5),a:v[5]};
}
/**
 * @param {number[]} C @param {number[]} P
 * @param {"ciphertext"|"plaintext"} mode
 * @returns {{q:number[],a:number}|null}
 */
function compatible(C,P,mode) {
  assert.equal(C.length,P.length);
  const Rc=innovation(C),Rp=innovation(P),drive=mode==="ciphertext"?C:P;
  const matrix=Array.from({length:C.length-6},(_,i)=>[
    ...Array.from({length:5},(_,j)=>
      mod(drive[i+6-j-1]-drive[5-j-1])),
    mod(Rp[i+1]-Rp[0])
  ]);
  const target=Rc.slice(1).map(x=>mod(x-Rc[0]));
  return solveSix(matrix,target);
}
/**
 * @param {number[]} P @param {"ciphertext"|"plaintext"} mode
 * @param {number[]} q @param {number} a @param {number} b
 * @param {number} r @param {number[]} seed
 * @returns {number[]}
 */
function encrypt(P,mode,q,a,b,r,seed){
  const K=seed.slice(),C=[];
  for(let i=0;i<P.length;i++){
    if(i>=5){
      let v=r;
      const drive=mode==="ciphertext"?C:P;
      for(let j=0;j<5;j++)v+=W[j]*K[i-j-1]+q[j]*drive[i-j-1];
      K.push(mod(v));
    }
    C.push(mod(a*P[i]+b+K[i]));
  }
  return C;
}
const byLength=new Map([[13,[]],[14,[]]]);
for(const x of words.values())byLength.get(x.P.length).push(x);
assert(byLength.get(14).some(x=>x.word==="circumferences"));
const dwyl=read("resources/control/dwyl-english-alpha-gp13-14-only.txt")
  .trim().split(/\r?\n/);
assert.equal(dwyl.length,29229);
const sourceWords = originals.words.filter(x=>x.length>=13).map(x=>({
  page:physicalLP2Page(x.startPage),
  C:[...x.runes].map(r=>runeIndex.get(r))
}));
assert.equal(sourceWords.length,7);
assert.deepEqual(sourceWords.map(x=>[x.page,x.C.length]),
  [[11,13],[13,14],[16,13],[25,14],[43,14],[52,13],[55,13]]);

const sharedPlant=[7,14,4,25,9],positive=[];
const syntheticWords=["circumferences","approximately"];
assert.deepEqual(syntheticWords.map(x=>words.get(x).P.length),[14,13]);
for(const mode of ["ciphertext","plaintext"]){
  for(const word of syntheticWords){
    const P=words.get(word).P;
    const C=encrypt(P,mode,sharedPlant,7,11,3,[23,2,5,2,19]);
    const params=compatible(C,P,mode);
    assert.deepEqual(params,{q:sharedPlant,a:7});
    positive.push({mode,word,recovered:params});
  }
}
const results={};
for(const mode of ["ciphertext","plaintext"]){
  const byQ=new Map(),wordFits=[];
  for(const {page,C} of sourceWords){
    let fitCount=0;
    for(const x of byLength.get(C.length)){
      const params=compatible(C,x.P,mode);
      if(!params)continue;
      fitCount++;
      const key=params.q.join(",");
      const hits=byQ.get(key)||[];
      hits.push({page,word:x.word,source:x.source,a:params.a});
      byQ.set(key,hits);
    }
    wordFits.push({page,length:C.length,fitCount});
  }
  const shared=[...byQ].filter(([,hits])=>
    new Set(hits.map(x=>x.page)).size>=2)
    .map(([q,hits])=>({q,hits}));
  results[mode]={wordFits,shared};
}
const output={
  decision:"Morphology adds an authenticated withheld LP2 GP14 word to a source-trained lexicon; inspect original shared-q before any plaintext claim",
  authenticHeldout:{word:"CIRCUMFERENCES",originalPage:57,
    nativeRuneLength:14,sourceLemma:"circumference",
    generatedBy:"one regular plural from independently attested TextBlob singular",
    exactOriginalRunes:page57.includes(heldOut.join(","))},
  lexicon:{sourceGP13:byLength.get(13).length,
    sourceGP14:byLength.get(14).length,
    morphGenerated:generated,oldUnfilteredDWYL:dwyl.length},
  positives:positive,
  unchangedOriginal7:results
};
console.log(JSON.stringify(output,null,2));
