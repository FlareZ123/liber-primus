"use strict";

/**
 * H2 unknown GP29 tableau: best-case recovery from two of four original
 * apostrophe words. Original cipher is never used as a training positive.
 *
 * The decoder is granted the true hidden row/key-pointer history, the real
 * first two plaintext contraction words and a 12,956-rune source-native
 * control ciphertext. It learns all possible row/cipher->plain identities
 * from those two cribs. Its generous unigram ML extension sorts ciphertext
 * counts by Shakespeare GP29 frequencies, respecting every known crib.
 *
 * Remaining two contraction words and an entire 150-rune contiguous span
 * are held out. The code also tests deliberately wrong training words and
 * a complete positive with the authentic secret tableau.
 *
 * Run: node sims/lp2_h2_apostrophe_oracle_recoverability_sft.cjs
 * Node 22 CommonJS; read-only, no dependencies or output files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const literature = read("resources/control/gibran_prophet_58585.txt");
const control = read("resources/control/shakespeare_first300k.txt");
const N = 29;
const LEN = 12956;
const TRIALS = 100;
const tokens = gp.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
const mod = x => (x % N + N) % N;

/** @param {string} w @returns {number[]} */
function word(w) {
  w = w.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i=0; i<w.length;) {
    if (w.startsWith("ING",i)) {out.push(21);i+=3;}
    else if (w.startsWith("IO",i)) {out.push(27);i+=2;}
    else {
      const t=tokens.find(t => w.startsWith(t.s,i));
      assert(t,"unmapped GP source word");
      out.push(t.i);
      i+=t.s.length;
    }
  }
  return out;
}
/** @param {string} text @returns {number[]} */
const textRunes = text => (text.match(/[A-Za-z]+/g)||[]).flatMap(word);
const plainText = textRunes(literature);
const reference = textRunes(control);
assert.equal(plainText.length, 62492);
assert.equal(reference.length, 217106);
const referenceCounts = Array(N).fill(0);
for (const r of reference) referenceCounts[r]++;

// Actual original-image apostrophe positions. A tick consumes no rune.
// Each "start" is the full word's first rune in the canonical flattened
// unknown LP2 stream. The training plaintext words are plants only.
// Original ciphertext MXI'W, AEO'Y, PE'T, XLJ'C remains unknown.
const sites = [
  {start:1107, markAfter:1110, word:"DONT"},
  {start:5136, markAfter:5138, word:"ITS"},
  {start:8513, markAfter:8515, word:"HES"},
  {start:10086,markAfter:10089,word:"CANT"}
];
assert.deepEqual(sites.map(s => s.markAfter), [1110,5138,8515,10089]);
assert.deepEqual(sites.map(s => word(s.word).length), [4,3,3,4]);
assert.deepEqual(sites.map(s => s.start + word(s.word).length - 1),
  sites.map(s => s.markAfter));
const at = s => Array.from({length:word(s.word).length},(_,i)=>s.start+i);
const trainPositions = sites.slice(0,2).flatMap(at);
const heldoutPositions = sites.slice(2).flatMap(at);
const heldoutSpan = Array.from({length:150},(_,i)=>8500+i);
assert.equal(trainPositions.length,7);
assert.equal(heldoutPositions.length,7);

// LP1 original contraction control: I RWN'B deciphers to I DON'T,
// using the actual five-letter initial FIRFU of the authentic 13-rune key.
// Apostrophe is punctuation and consumes no key symbol.
assert.deepEqual([10,23,3,9,16].map((p,i)=>
  mod(p+[0,10,4,0,1][i])), [10,4,7,9,17]);

// LP2 solved AN END verifies that the F bypass is a separate, authentic
// historical rule. It is NOT silently assumed for the unproven H2 model.
const solved56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" ").flatMap(word);
assert.equal(solved56.length,85);
assert.equal(solved56.indexOf(0),56);
const primeTotients = [];
const lim = 650000;
const sieve = new Uint8Array(lim + 1);
for (let i=2;i<=lim && primeTotients.length<45000;i++) {
  if (!sieve[i]) {
    primeTotients.push((i-1)%N);
    if (i*i<=lim) for (let j=i*i;j<=lim;j+=i) sieve[j]=1;
  }
}
assert.equal(primeTotients.length,45000);
let index56=0;
const original56=solved56.map(x=>x===0?0:mod(x+primeTotients[index56++]));
assert.equal(index56,84);
assert.deepEqual(original56,gp.pages[56].indices);

/** @param {number} seed @returns {{u:()=>number,int:(n:number)=>number}} */
function random(seed) {
  let state=seed>>>0;
  const u=()=> {
    state ^= state<<13;
    state ^= state>>>17;
    state ^= state<<5;
    return (state>>>0)/4294967296;
  };
  return {u,int:n=>Math.floor(u()*n)};
}
/** @param {{int:(n:number)=>number}} rng @returns {number[]} */
function shuffle(rng) {
  const a=Array.from({length:N},(_,i)=>i);
  for (let i=N-1;i>0;i--) {
    const j=rng.int(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/**
 * Optimistic decoder: true key rows are already given! Train a partial
 * lookup from the specified known-plaintext slots. Complete the table
 * using an over-permissive maximum-likelihood iid-language assignment
 * (highest observed cipher frequency gets highest reference GP frequency)
 * among the as-yet-unassigned permutation entries.
 *
 * @param {number[]} cipher
 * @param {number[]} rows
 * @param {number[]} positions
 * @param {number[]} known
 * @returns {{mapping:number[][],fix:Map<number,number>[],contradiction:boolean}}
 */
function infer(cipher, rows, positions, known) {
  const counts=Array.from({length:N},()=>Array(N).fill(0));
  const fixed=Array.from({length:N},()=>new Map());
  for (let i=0;i<cipher.length;i++) counts[rows[i]][cipher[i]]++;
  let contradiction=false;
  for (const i of positions) {
    const row=rows[i],c=cipher[i],p=known[i];
    if (fixed[row].has(c) && fixed[row].get(c)!==p) contradiction=true;
    fixed[row].set(c,p);
  }
  const mapping=Array.from({length:N},()=>Array(N).fill(-1));
  for (let row=0;row<N;row++) {
    const usedC=new Set(),usedP=new Set();
    for (const [c,p] of fixed[row]) {
      if (usedP.has(p)) contradiction=true;
      usedC.add(c);usedP.add(p);
      mapping[row][c]=p;
    }
    const cRest=Array.from({length:N},(_,i)=>i)
      .filter(c=>!usedC.has(c)).sort((a,b)=>
        counts[row][b]-counts[row][a]||a-b);
    const pRest=Array.from({length:N},(_,i)=>i)
      .filter(p=>!usedP.has(p)).sort((a,b)=>
        referenceCounts[b]-referenceCounts[a]||a-b);
    cRest.forEach((c,i)=>mapping[row][c]=pRest[i]);
  }
  return {mapping,fix:fixed,contradiction};
}
/** @param {number[][]} mapping @param {number[]} cipher @param {number[]} rows @param {number[]} plain @param {number[]} pos @returns {number} */
function score(mapping,cipher,rows,plain,pos) {
  let n=0;
  for (const i of pos) if (mapping[rows[i]][cipher[i]]===plain[i]) n++;
  return n;
}
/** @param {object[]} rs @param {string} field @returns {number} */
function avg(rs,field) {
  return rs.reduce((s,v)=>s+Number(v[field]),0)/rs.length;
}

const stats=[];
for (let t=0;t<TRIALS;t++) {
  const rng=random((0x3301abcd+t*1013904223)>>>0);
  const sourceOffset=rng.int(plainText.length-LEN);
  const plain=plainText.slice(sourceOffset,sourceOffset+LEN);
  for (const site of sites)
    plain.splice(site.start,word(site.word).length,...word(site.word));
  assert.equal(plain.length,LEN);
  const table=Array.from({length:N},()=>shuffle(rng));
  const cipher=new Array(LEN),rows=new Array(LEN);
  let keyPointer=0,prev=-1,collisions=0;
  for (let i=0;i<LEN;i++) {
    let c=table[primeTotients[keyPointer]][plain[i]];
    while (c===prev && rng.u()<0.81) {
      keyPointer++;
      c=table[primeTotients[keyPointer]][plain[i]];
    }
    cipher[i]=c;
    rows[i]=primeTotients[keyPointer];
    if (c===prev) collisions++;
    prev=c;
    keyPointer++;
  }

  // Fully informed independent positive, even with the exact stochastic
  // skip and real punctuation coordinates: all 12,956 runes come back.
  const inv=table.map(a=>{
    const v=Array(N);
    a.forEach((c,p)=>{v[c]=p;});
    return v;
  });
  assert.deepEqual(cipher.map((c,i)=>inv[rows[i]][c]),plain);

  const correct=infer(cipher,rows,trainPositions,plain);
  assert.equal(correct.contradiction,false);
  const noCrib=infer(cipher,rows,[],plain);
  const wrongPlain=plain.slice();
  wrongPlain.splice(sites[0].start,4,...word("CANT"));
  wrongPlain.splice(sites[1].start,3,...word("HES"));
  const wrong=infer(cipher,rows,trainPositions,wrongPlain);
  const literalCoverage=positions=>
    positions.filter(i=>correct.fix[rows[i]].has(cipher[i])).length;
  const recoveredSite=sites.slice(2).map(s=>
    score(correct.mapping,cipher,rows,plain,at(s))===at(s).length);

  stats.push({
    collisions,
    literalHeldout:literalCoverage(heldoutPositions),
    literalSpan:literalCoverage(heldoutSpan),
    heldout:score(correct.mapping,cipher,rows,plain,heldoutPositions),
    span:score(correct.mapping,cipher,rows,plain,heldoutSpan),
    heldoutNo:score(noCrib.mapping,cipher,rows,plain,heldoutPositions),
    spanNo:score(noCrib.mapping,cipher,rows,plain,heldoutSpan),
    heldoutWrong:score(wrong.mapping,cipher,rows,plain,heldoutPositions),
    spanWrong:score(wrong.mapping,cipher,rows,plain,heldoutSpan),
    site35Exact:recoveredSite[0],site41Exact:recoveredSite[1],
    wrongContradiction:wrong.contradiction
  });
}
const summary={
  seed:"0x3301abcd + trial*1013904223",
  trials:TRIALS,
  model:"H2 unknown 29x29 permutation tableau; phi(successive prime) key; q=0.81 repeated-cipher skip",
  literalKnownGlyphs:7,
  heldoutOriginalApostrophePositions:[8515,10089],
  fullSourceRageRunes:LEN,
  originalCorpusDoublets:86,
  meanPlantedDoublets:avg(stats,"collisions"),
  heldoutOracleDirectIdentityMean:avg(stats,"literalHeldout"),
  heldoutDirectIdentityZero:stats.filter(x=>x.literalHeldout===0).length,
  spanOracleDirectIdentityMean:avg(stats,"literalSpan"),
  unigramOracleCorrectCribHeldoutMean:avg(stats,"heldout"),
  unigramOracleCorrectCribSpanMean:avg(stats,"span"),
  unigramOracleNoCribHeldoutMean:avg(stats,"heldoutNo"),
  unigramOracleNoCribSpanMean:avg(stats,"spanNo"),
  unigramOracleWrongCribHeldoutMean:avg(stats,"heldoutWrong"),
  unigramOracleWrongCribSpanMean:avg(stats,"spanWrong"),
  wrongCribRowConflicts:stats.filter(x=>x.wrongContradiction).length,
  p35Exact:stats.filter(x=>x.site35Exact).length,
  p41Exact:stats.filter(x=>x.site41Exact).length,
  bothHeldoutWordsExact:stats.filter(x=>x.site35Exact&&x.site41Exact).length,
  contiguous150Exact:stats.filter(x=>x.span===150).length
};
assert.equal(summary.meanPlantedDoublets,88.23);
assert.equal(summary.heldoutOracleDirectIdentityMean,0.21);
assert.equal(summary.heldoutDirectIdentityZero,81);
assert.equal(summary.spanOracleDirectIdentityMean,2.31);
assert.equal(summary.unigramOracleCorrectCribHeldoutMean,1.79);
assert.equal(summary.unigramOracleCorrectCribSpanMean,42.23);
assert.equal(summary.unigramOracleNoCribHeldoutMean,1.58);
assert.equal(summary.unigramOracleNoCribSpanMean,40.37);
assert.equal(summary.unigramOracleWrongCribHeldoutMean,1.75);
assert.equal(summary.unigramOracleWrongCribSpanMean,40.12);
assert.equal(summary.wrongCribRowConflicts,3);
assert.equal(summary.p35Exact,3);
assert.equal(summary.p41Exact,0);
assert.equal(summary.bothHeldoutWordsExact,0);
assert.equal(summary.contiguous150Exact,0);
console.log(JSON.stringify(summary,null,2));
