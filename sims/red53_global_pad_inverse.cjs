"use strict";

/**
 * Known-GP-register six-phase key recovery for the source-selected affine
 * recurrence K[i] = 53 - 2 K[i-6] (mod29), now across the COMPLETE LP2 book.
 * Because 53-2x is a 28-cycle on the 28 nonfixed symbols of F29, the
 * continuous key has period at most 168. There are only 6 unknown seed
 * symbols; for each lane, all 29 seeds can be ranked independently by a
 * frozen genuine GP-English rune-frequency reference.
 *
 * Fit only original pages' first half of the 12,956 rune stream and evaluate
 * the unchanged six seeds on the second half. Test synthetic plaintext under
 * the same precise recurrence and ~81% collision suppression.
 *
 * Run: node sims/red53_global_pad_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const SOURCE = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const INK = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const ENGLISH = fs.readFileSync(path.join(ROOT,
  "resources/control/shakespeare_first300k.txt"), "utf8");
const CIPHER = SOURCE.pages.filter(p => p.status === "unsolved")
  .flatMap(p => p.indices);
const M = 29, PERIOD = 6, ROOT_SEED = 0x64113301;
const ROMAN = new Map(SOURCE.translit.map((letters,i)=>[letters,i]));
const RUNE_ID = new Map(SOURCE.runes.map((glyph,i)=>[glyph,i]));
assert.equal(CIPHER.length,12956);
function mod(x) {return (x%M+M)%M;}
function T(x) {return mod(53-2*x);}

const SPAN = INK.pages.find(p=>p.page===40).red_spans[0];
const redSum = [...SPAN.runes].reduce((s,glyph)=>
  s+SOURCE.prime[RUNE_ID.get(glyph)],0);
assert.equal(redSum,435);
assert.deepEqual(SOURCE.prime.slice(redSum/29-1,redSum/29+2),
  [47,53,59]);

/** @param {string} text English source reference. @returns {number[]} */
function encode(text) {
  const out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;) {
      const pair=ROMAN.get(word.slice(i,i+2));
      if(pair!==undefined) {
        out.push(pair);i+=2;
      } else {
        const single=ROMAN.get(word[i]);
        assert.notEqual(single,undefined);
        out.push(single);i++;
      }
    }
  }
  return out;
}

/** @param {number} s Nonzero xorshift32 seed. */
function random32(s) {
  let x=s>>>0;
  return()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return x>>>0;
  };
}

const GP_ENGLISH=encode(ENGLISH);
assert.ok(GP_ENGLISH.length>CIPHER.length+100);
const frequency=Array(M).fill(1);
for(const symbol of GP_ENGLISH)frequency[symbol]++;
const total=frequency.reduce((s,n)=>s+n,0);
const logProb=frequency.map(n=>Math.log(n/total));
const keyCycle=Array.from({length:M},(_,seed)=>{
  const arr=[seed];
  for(let i=1;i<28;i++)arr.push(T(arr.at(-1)));
  assert.equal(T(arr.at(-1)),seed);
  return arr;
});

/** @param {number[]} cipher @param {number} from @param {number} to */
function fitSixSeeds(cipher,from,to) {
  const score=Array.from({length:PERIOD},()=>Array(M).fill(0));
  for(let i=from;i<to;i++) {
    const lane=i%PERIOD, exponent=Math.floor(i/PERIOD)%28;
    for(let seed=0;seed<M;seed++){
      const p=mod(cipher[i]-keyCycle[seed][exponent]);
      score[lane][seed]+=logProb[p];
    }
  }
  return score.map(row=>row.indexOf(Math.max(...row)));
}

/**
 * Decode with the six independent seeds chosen in the training half.
 * @param {number[]} cipher
 * @param {number[]} seeds
 * @param {number} from
 * @param {number} to
 */
function evaluate(cipher,seeds,from,to) {
  const counts=Array(M).fill(0);
  let logLikelihood=0;
  for(let i=from;i<to;i++){
    const key=keyCycle[seeds[i%PERIOD]][Math.floor(i/PERIOD)%28];
    const plain=mod(cipher[i]-key);
    counts[plain]++;
    logLikelihood+=logProb[plain];
  }
  return {runes:to-from,meanGPLogLikelihood:logLikelihood/(to-from),
    recoveredRuneIoC:counts.reduce((s,n)=>s+n*(n-1),0)/
      ((to-from)*(to-from-1))};
}

/** @param {number[]} plaintext @param {number[]} seeds @param {()=>number} random */
function encrypt(plaintext,seeds,random) {
  const out=[];
  let previous=-1,repairs=0;
  for(let i=0;i<plaintext.length;i++) {
    const key=keyCycle[seeds[i%PERIOD]][Math.floor(i/PERIOD)%28];
    let c=mod(plaintext[i]+key);
    if(c===previous&&random()%10000<8100){
      c=mod(c+1+random()%28);
      repairs++;
    }
    out.push(c);previous=c;
  }
  return {out,repairs};
}

function run() {
  const n=CIPHER.length,half=n/2;
  assert.equal(half,6478);
  const realSeeds=fitSixSeeds(CIPHER,0,half);
  const real={seeds:realSeeds,train:evaluate(CIPHER,realSeeds,0,half),
    heldout:evaluate(CIPHER,realSeeds,half,n)};
  const random=random32(ROOT_SEED);
  const genuineSeeds=Array.from({length:PERIOD},()=>random()%29);
  const reference=GP_ENGLISH.slice(100,100+n);
  const plant=encrypt(reference,genuineSeeds,random);
  const recoveredSeeds=fitSixSeeds(plant.out,0,half);
  assert.deepEqual(recoveredSeeds,genuineSeeds);
  const positive={trueSeeds:genuineSeeds,recoveredSeeds,
    correctlyRecoveredSeedSymbols:PERIOD,collisionRepairs:plant.repairs,
    train:evaluate(plant.out,recoveredSeeds,0,half),
    heldout:evaluate(plant.out,recoveredSeeds,half,n)};
  assert.ok(positive.heldout.meanGPLogLikelihood >
    real.heldout.meanGPLogLikelihood+0.5);
  return {
    status:"Global six-seed GP-English affine-pad recurrence fails original heldout; positive keys exactly recovered",
    source:{redPage40PrimeSum:redSum,selectedPrime53:true,
      originalCorpusSha256:createHash("sha256").update(
        fs.readFileSync(path.join(ROOT,
          "resources/liber-primus/lp2-corpus.json"))).digest("hex"),
      shakespeareReferenceSha256:createHash("sha256").update(ENGLISH).digest("hex"),
      gpReferenceRunes:GP_ENGLISH.length},
    proposal:"K[i]=(53-2*K[i-6]) mod29 continuously; C[i]=P[i]+K[i] mod29",
    trainRunes:half, heldoutRunes:n-half,
    original:real,syntheticPositive:positive,
    caveat:"Only direct-GP-English global key recurrence, frozen reference corpus and the tested 81%-repair plant are evaluated. A different alphabet, word/page reset, unknown key skipping or another cipher stage is not excluded."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={encode,fitSixSeeds,evaluate,encrypt,run};
