"use strict";
/**
 * All-coefficient 5/8/13-lag linear-feedback candidate after a conjectured
 * EPIPHANY SEECS first title. Conditional on that conjecture and the solved
 * page56 plaintext-F bypass convention, test every GF(29)^3 coefficient.
 *
 * Original pp0–55, no source rune changed. Node.js 22 / Windows CommonJS:
 * node sims/lp2_p0_epiphany_fibonacci_allcoeff_strictf_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const MOD = 29;
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const native57 = corpus.pages.find(p => p.page === 57).indices;
const presumedTitle = "EPIPHANYSEECS";
const seedExpected = [26,24,8,19,27,24,18,3,0,8,0,16,19];

/** @param {number} n @returns {number} */
function mod(n) { return ((n % MOD) + MOD) % MOD; }

/**
 * @param {number[]} seed
 * @param {number} size
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {Uint8Array}
 */
function recurrence(seed, size, a, b, c) {
  const key = new Uint8Array(size);
  key.set(seed);
  for(let i = seed.length; i < size; i++)
    key[i] = mod(a * key[i-13] + b * key[i-8] + c * key[i-5]);
  return key;
}

/**
 * Exhaustive legal *key clocks* from fixed first 13 title runes.
 * A ciphertext F may be plaintext F, retaining the clock, or a
 * genuinely encrypted non-F whose key is nonzero. Any nonzero
 * ciphertext equal to its active key would force forbidden plaintext F.
 * @param {number[]|Uint8Array} cipher
 * @param {Uint8Array} key
 * @returns {{failure:number|null,survivors:number}}
 */
function firstContradiction(cipher, key) {
  assert.ok(key.length >= cipher.length);
  const states = new Uint8Array(cipher.length+1);
  const next = new Uint8Array(cipher.length+1);
  let current=states, subsequent=next, low=13, high=13;
  current[13]=1;
  for(let i=13;i<cipher.length;i++) {
    subsequent.fill(0);
    let min=cipher.length,max=0,any=false;
    for(let clock=low;clock<=high;clock++)if(current[clock]) {
      const keyRune=key[clock];
      if(cipher[i]===0) {
        subsequent[clock]=1;
        if(keyRune!==0)subsequent[clock+1]=1;
        min=Math.min(min,clock);
        max=Math.max(max,clock+(keyRune!==0?1:0));
        any=true;
      } else if(cipher[i]!==keyRune) {
        subsequent[clock+1]=1;
        min=Math.min(min,clock+1);
        max=Math.max(max,clock+1);
        any=true;
      }
    }
    if(!any)return {failure:i,survivors:0};
    [current,subsequent]=[subsequent,current];
    low=min;high=max;
  }
  let survivors=0;
  for(let clock=low;clock<=high;clock++) survivors+=current[clock];
  return {failure:null,survivors};
}

/**
 * @param {number[]} plaintext
 * @param {Uint8Array} key
 * @returns {{cipher:number[],consumed:number}}
 */
function encryptTransparentF(plaintext, key) {
  let clock=0;
  const cipher=plaintext.map(p => p===0?0:mod(p+key[clock++]));
  return {cipher,consumed:clock};
}

function run() {
  assert.equal(original.length,12956);
  assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.runic_count),
    [262,266,201]);
  const cipherFirst=original.slice(0,729);
  const title=[...presumedTitle].map(ch=> {
    const v=corpus.translit.indexOf(ch);
    assert.ok(v>=0,"no GP code for "+ch);
    return v;
  });
  assert.equal(title.length,13);
  assert.ok(title.every(v=>v!==0));
  const seed=title.map((v,i)=>mod(original[i]-v));
  assert.deepEqual(seed,seedExpected);
  const counters={total:0,failWithinP0:0,failLaterFirstChapter:0,
    survive729:0, nonzeroSurvive12956:0};
  const surviving=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++) {
    counters.total++;
    const keyFirst=recurrence(seed,729,a,b,c);
    const r=firstContradiction(cipherFirst,keyFirst);
    if(r.failure!==null) {
      if(r.failure<262)counters.failWithinP0++;
      else counters.failLaterFirstChapter++;
      continue;
    }
    counters.survive729++;
    const keyWhole=recurrence(seed,original.length,a,b,c);
    const holdout=firstContradiction(original,keyWhole);
    if(holdout.failure===null && (a!==0||b!==0||c!==0))
      counters.nonzeroSurvive12956++;
    surviving.push({a,b,c,firstChapterClocks:r.survivors,
      firstFailureAfter729:holdout.failure,
      firstFailurePhysicalPage:holdout.failure===null?null:corpus.pages
        .filter(p=>p.page<=55).reduce((obj,p)=> {
          if(obj.page!==null)return obj;
          const nextEnd=obj.runeEnd+p.indices.length;
          return {runeEnd:nextEnd,page:holdout.failure<nextEnd?p.page:null};
        },{runeEnd:0,page:null}).page});
  }
  assert.deepEqual(counters,{
    total:24389,failWithinP0:22998,failLaterFirstChapter:1381,
    survive729:10,nonzeroSurvive12956:0
  });
  const expected=[
    [0,0,0,null],[1,6,25,879],[5,13,4,852],[5,25,9,734],
    [8,19,25,749],[9,14,10,737],[11,25,0,738],
    [16,1,13,799],[20,17,25,761],[25,21,5,1082]
  ];
  assert.deepEqual(surviving.map(x=>[x.a,x.b,x.c,x.firstFailureAfter729]),
    expected);
  assert.equal(surviving.find(x=>x.firstFailureAfter729===null).a,0);
  const positiveTriples=[[25,21,5],[5,25,9],[0,0,0]];
  const positive=[];
  for(const [a,b,c] of positiveTriples) {
    const key=recurrence(seed,original.length,a,b,c);
    const message=title.concat(Array.from({length:original.length-13},
      (_,i)=>native57[i%native57.length]));
    const planted=encryptTransparentF(message,key);
    assert.deepEqual(planted.cipher.slice(0,13),original.slice(0,13));
    const check=firstContradiction(planted.cipher,key);
    assert.equal(check.failure,null,"true key must remain legal for plant");
    positive.push({a,b,c,plaintextRunes:message.length,
      consumedKeySymbols:planted.consumed,
      survivingClocks:check.survivors});
  }
  console.log(JSON.stringify({
    source:"Original LP2 pp0–55, assumed 13-rune p0 title, historical F rule",
    recurrence:"K[i] = a*K[i-13]+b*K[i-8]+c*K[i-5] (mod 29)",
    seed,
    counters,
    survivingFirstChapter:surviving,
    sourceNativePlantedPositives:positive,
    recoveredUnknownPlaintext:false,
    conditionalConclusion:"Every nonzero coefficient triple fails original holdout"
  },null,2));
}
if(require.main===module)run();
module.exports={run,firstContradiction,recurrence,encryptTransparentF};
