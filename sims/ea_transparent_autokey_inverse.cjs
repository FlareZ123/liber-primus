"use strict";
/**
 * Source-constrained, reversible F29-EA transparent autokey attack.
 *
 * The actual p40 red prime-sum quotient 15 supplies the F29 generator
 * and the proposed plaintext-feedback multiplier; p15 quotient22 gives
 * a preselected additive start. The forward hypothesis is:
 *
 *   DeltaC_i = 0 if P_i=EA (28);
 *   otherwise DeltaC_i = 15^((P_i + a*prev(P) + b) mod28) mod29.
 *
 * At zero steps recover EA without knowing any key; at other positions
 * recover P_i by subtracting the exact previous plaintext. The model is
 * invertible after choosing an initial plaintext rune. Test both natural
 * EA feedback conventions (EA updates state as 0, or EA does not update)
 * and all 28 b values with section-local initial-rune profiling.
 *
 * The original manuscript result is conditional evidence, not a
 * recovery of a source key or previously unsolved plaintext.
 *
 * Reproduce: node sims/ea_transparent_autokey_inverse.cjs
 * @module ea_transparent_autokey_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = path0 => fs.readFileSync(path.join(ROOT, path0), "utf8");
const META = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RN = new Map(META.runes.map((v, i) => [v, i]));
const GP = new Map(META.translit.map((v, i) => [v, i]));
const A = [15, 22];
const EA = 28;
const M = 28;
const LOG = new Int8Array(29).fill(-1);
const POWER = new Uint8Array(M);
let pow = 1;
for (let j = 0; j < M; j++) {
  POWER[j] = pow; LOG[pow] = j; pow = pow * 15 % 29;
}
assert.equal(pow, 1);
assert.equal(new Set(POWER).size, M);
assert.equal(POWER[2], 22);
assert.equal(POWER[4], 20);

/** @param {string} word */
function gpEncode(word) {
  const src = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < src.length;) {
    const dg = GP.get(src.slice(i, i + 2));
    if (dg !== undefined) { output.push(dg); i += 2; }
    else {
      const one = GP.get(src[i]);
      if (one === undefined) return [];
      output.push(one); i++;
    }
  }
  return output;
}

function sources() {
  const cipher = read("resources/lp2-transcription.txt").split("$")
    .slice(0, 8).map(s => [...s].filter(c => RN.has(c))
      .map(c => RN.get(c)));
  const lengths = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
  assert.deepEqual(cipher.map(x => x.length), lengths);
  const english = read("resources/control/shakespeare_first300k.txt");
  assert.equal(english.length, 300000);
  return {
    cipher,
    train: (english.slice(0, 230000).match(/[A-Za-z]+/g)||[])
      .flatMap(gpEncode),
    test: (english.slice(230000).match(/[A-Za-z]+/g)||[])
      .flatMap(gpEncode)
  };
}

function training(train) {
  const unig = new Float64Array(29).fill(1);
  const bi = Array.from({length:29},
    () => new Float64Array(29).fill(.15));
  const tri = Array.from({length:841},
    () => new Float64Array(29).fill(.25));
  for (let i = 0; i < train.length; i++) {
    const p = train[i]; unig[p]++;
    if (i) bi[train[i-1]][p]++;
    if (i >= 2) tri[train[i-2]*29+train[i-1]][p]++;
  }
  const n = unig.reduce((a,b)=>a+b);
  for (let i = 0; i < 29; i++) unig[i]/=n;
  for (let i = 0; i < 29; i++) {
    const d=bi[i].reduce((a,b)=>a+b);
    for (let k = 0; k < 29; k++) bi[i][k]/=d;
  }
  for (let i = 0; i < 841; i++) {
    const d=tri[i].reduce((a,b)=>a+b);
    for (let k = 0; k < 29; k++)
      tri[i][k]=.8*tri[i][k]/d+.2*bi[i%29][k];
  }
  return {unig,bi,tri};
}

/** @param {number[]} p @param {ReturnType<typeof training>} t */
function logLike(p,t) {
  let ll=0;
  for (let i=0;i<p.length;i++) {
    if (i===0) ll+=Math.log(t.unig[p[i]]);
    else if (i===1) ll+=Math.log(t.bi[p[i-1]][p[i]]);
    else ll+=Math.log(t.tri[p[i-2]*29+p[i-1]][p[i]]);
  }
  return ll;
}

const mod28=x=>(x%M+M)%M;
const mod29=x=>(x%29+29)%29;

/**
 * One exact conditional forward inverse on original ciphertext.
 * @param {number[]} C
 * @param {number} alpha
 * @param {number} beta
 * @param {number} firstPlain
 * @param {boolean} skipEA
 */
function decrypt(C,alpha,beta,firstPlain,skipEA) {
  const P=[firstPlain];
  let feedback=firstPlain;
  for (let i=1;i<C.length;i++) {
    const delta=mod29(C[i]-C[i-1]);
    const p=delta===0?EA:mod28(LOG[delta]-alpha*(feedback%M)-beta);
    P.push(p);
    if (!skipEA || p!==EA) feedback=p;
  }
  return P;
}

/** Reverse exactly, including transparent zero steps and original IV. */
function encrypt(P,alpha,beta,initialCipher,skipEA) {
  const C=[initialCipher];
  let feedback=P[0];
  for (let i=1;i<P.length;i++) {
    const p=P[i];
    const increment=p===EA?0:POWER[mod28(p+alpha*(feedback%M)+beta)];
    C.push(mod29(C[i-1]+increment));
    if (!skipEA || p!==EA) feedback=p;
  }
  return C;
}

/**
 * Profile all 29 unknown initial plaintext rune choices for every section
 * and 28 possible beta choices. Rank each actual end-to-end full-book
 * GP-English trigram likelihood without fitting the reference text.
 * @param {number[][]} cipher
 * @param {number} alpha
 * @param {boolean} skipEA
 * @param {ReturnType<typeof training>} lang
 */
function search(cipher,alpha,skipEA,lang) {
  const candidates=[];
  for (let beta=0;beta<M;beta++) {
    let score=0;
    const startRunes=[];
    for (const c of cipher) {
      let best=-Infinity,bestRune=-1;
      for (let first=0;first<29;first++) {
        const sample=decrypt(c,alpha,beta,first,skipEA);
        const ll=logLike(sample,lang);
        if (ll>best) {best=ll;bestRune=first;}
      }
      startRunes.push(bestRune);
      score+=best;
    }
    candidates.push({beta,score,avgPerRune:score/
      cipher.reduce((s,c)=>s+c.length,0),startRunes});
  }
  candidates.sort((a,b)=>b.score-a.score);
  const champion=candidates[0];
  const decoded=cipher.map((c,i)=>
    decrypt(c,alpha,champion.beta,champion.startRunes[i],skipEA));
  for (let i=0;i<cipher.length;i++) assert.deepEqual(
    encrypt(decoded[i],alpha,champion.beta,cipher[i][0],skipEA),
    cipher[i], "original exact forward roundtrip");
  return {
    alpha, skipEA, winner:champion,
    sourceFixedBeta22:candidates.find(x=>x.beta===22),
    runners:candidates.slice(1,3).map(({beta,score,avgPerRune})=>
      ({beta,score,avgPerRune})),
    initialDecodedGP:decoded[0].slice(0,110).map(x=>META.translit[x]).join(" ")
  };
}

/** @param {number} seed */
function rng(seed) {
  let x=seed>>>0;
  return () => {x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** Heldout GP-English original-layout positive for the exact rule. */
function positive(lengths,reference,alpha,beta,skipEA,lang,random) {
  let start=0;
  const plain=lengths.map(len=>reference.slice(start,start+=len));
  const cipher=plain.map(P=>encrypt(P,alpha,beta,random()%29,skipEA));
  const recovered=search(cipher,alpha,skipEA,lang);
  const prefix=plain.map((p,i)=>
    decrypt(cipher[i],alpha,recovered.winner.beta,
      recovered.winner.startRunes[i],skipEA));
  const sourceFlat=plain.flat(), recoveredFlat=prefix.flat();
  const recoveredRunes=sourceFlat.reduce((n,v,i)=>n+Number(v===recoveredFlat[i]),0);
  return {trueAlpha:alpha,trueBeta:beta,skipEA,
    selectedBeta:recovered.winner.beta,
    selectedAverage:recovered.winner.avgPerRune,
    recoveredRunes,sourceRunes:plain.flat().length,
    exactRoundtrip:prefix.every((p,i)=>encrypt(p,alpha,
      recovered.winner.beta,cipher[i][0],skipEA)
      .every((v,k)=>v===cipher[i][k]))};
}

function run() {
  const {cipher,train,test}=sources(),lang=training(train);
  const unsolvedRunes=cipher.reduce((s,c)=>s+c.length,0);
  const outputs=[];
  for (const skipEA of [false,true])
    for (const alpha of A)
      outputs.push(search(cipher,alpha,skipEA,lang));
  const random=rng(0x7153301);
  const positives=[positive(cipher.map(c=>c.length),test,15,22,false,lang,random),
    positive(cipher.map(c=>c.length),test,15,22,true,lang,random)];
  assert.ok(positives.every(x=>x.exactRoundtrip));
  assert.ok(positives.every(x=>x.selectedBeta===22),
    "Heldout true beta must rank first");
  assert.ok(positives.every(x=>x.recoveredRunes>0.95*x.sourceRunes),
    "Reversible source model must recover source plaintext");
  const result={
    classification:"bounded source-derived original F29 EA-autokey inverse; no authentic LP2 plaintext",
    construction:"DeltaC=0 iff P=EA, else DeltaC=15^((P+alpha*feedback+beta) mod28); feedback=Pprevious (EA=0) or preceding non-EA",
    sourceClues:{redRoot:15,redTitleQuotient:22},
    input:{originalRunes:unsolvedRunes,sourceTrainingRunes:train.length,
      heldoutRunes:test.length,sourceHeldoutAverage:logLike(test,lang)/test.length},
    original:outputs,positives};
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module)run();
module.exports={gpEncode,sources,training,logLike,decrypt,encrypt,search,positive,run};
