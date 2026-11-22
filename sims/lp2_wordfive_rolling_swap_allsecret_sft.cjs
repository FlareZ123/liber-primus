'use strict';

/**
 * Original LP2 five-back rolling-sum finite-state cipher: all-secret gate.
 *
 * Cipher family (GP29, plaintext EA index 28):
 *   state = sum of up to five previous ciphertext runes in this printed word mod29
 *   q[state] = secret row[state][EA]
 *   y = secret row[state][plaintext]
 *   ciphertext = swap(y, q[state], previous published ciphertext rune)
 *
 * Every secret row is an arbitrary 29-permutation, so this family is
 * fully reversible, can suppress adjacent repeats across word boundaries,
 * and genuinely consults a word-local five-rune register. By undoing the
 * position-specific swap for every candidate unknown q[state], the
 * hidden-row equality-pair invariant yields a complete upper bound on
 * the original cipher for ALL 29!^29 possible secret permutation tables.
 *
 * Run: node sims/lp2_wordfive_rolling_swap_allsecret_sft.cjs
 * Read-only. Node.js 22 CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { encodeSourceNativeGP } =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/lp2-transcription.txt');
const runic = raw.split('%').slice(0, 55).join('%');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));

/** @type {Array<{value:number,page:number,wordStart:boolean,wordOffset:number}>} */
const events = [];
let page = 0, wordStart = true, offset = 0;
for (const ch of runic) {
  if (runeIndex.has(ch)) {
    if (wordStart) offset = 0;
    events.push({value:runeIndex.get(ch),page,wordStart,wordOffset:offset});
    wordStart = false;
    offset++;
  } else if (ch === '%') {
    page++;
  } else if (ch === '/' || /\s/u.test(ch)) {
    // Editorial line/page formatting is not a source word break.
  } else {
    wordStart = true;
  }
}
const original = events.map(e => e.value);
const wordLengths = [];
for (let i = 0; i < events.length;) {
  assert(events[i].wordStart);
  let j = i + 1;
  while (j < events.length && !events[j].wordStart) j++;
  wordLengths.push(j - i);
  i = j;
}
assert.equal(page, 54);
assert.equal(original.length, 12956);
assert.equal(wordLengths.length, 2896);
assert.deepEqual(original, gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices));
assert.equal(events.filter(e => e.wordOffset >= 5).length, 2105);

/** @returns {()=>number} */
function random32(seed) {
  let state = seed >>> 0;
  assert(state !== 0);
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number} x @param {number} a @param {number} b */
function swap(x, a, b) {
  return x === a ? b : x === b ? a : x;
}

/** @param {()=>number} rng @returns {number[][]} */
function newRows(rng) {
  return Array.from({length:29}, () => {
    const permutation = Array.from({length:29}, (_,i) => i);
    for (let i = 28; i > 0; i--) {
      const j = rng() % (i + 1);
      [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    assert.equal(new Set(permutation).size, 29);
    return permutation;
  });
}

/**
 * The five-rune state resets at each printed word, while previous C carries
 * across word/line/page boundaries. No reset at physical page turns.
 *
 * @param {number[]} clear
 * @param {number[][]} rows
 */
function encrypt(clear, rows) {
  assert.equal(clear.length, events.length);
  const published = [], recent = [];
  for (let i = 0; i < clear.length; i++) {
    if (events[i].wordStart) recent.length = 0;
    const state = recent.reduce((a,b) => a + b, 0) % 29;
    const previous = i === 0 ? 0 : published[i-1];
    const cipher = swap(rows[state][clear[i]],rows[state][28],previous);
    published.push(cipher);
    recent.push(cipher);
    if (recent.length > 5) recent.shift();
  }
  return published;
}

/**
 * @param {number[]} ciphertext
 * @param {number[][]} rows
 */
function decrypt(ciphertext, rows) {
  assert.equal(ciphertext.length, events.length);
  const output = [], recent = [];
  for (let i = 0; i < ciphertext.length; i++) {
    if (events[i].wordStart) recent.length = 0;
    const state = recent.reduce((a,b) => a + b, 0) % 29;
    const previous = i === 0 ? 0 : ciphertext[i-1];
    const value = swap(ciphertext[i],rows[state][28],previous);
    const plain = rows[state].indexOf(value);
    assert(plain >= 0);
    output.push(plain);
    recent.push(ciphertext[i]);
    if (recent.length > 5) recent.shift();
  }
  return output;
}

/**
 * @param {number[]} source
 * @param {(e:typeof events[number])=>boolean} eligible
 * @returns {Array<Array<{previous:number,current:number}>>}
 */
function stateRows(source, eligible) {
  const states = Array.from({length:29},()=>[]);
  const recent = [];
  for (let i = 0; i < source.length; i++) {
    const e = events[i];
    if (e.wordStart) recent.length = 0;
    const s = recent.reduce((a,b)=>a+b,0)%29;
    if (i > 0 && eligible(e)) {
      states[s].push({previous:source[i-1],current:source[i]});
    }
    recent.push(source[i]);
    if (recent.length > 5) recent.shift();
  }
  return states;
}

/**
 * Corrected output Y = swap(C, previous C, q_s) is just
 * secretRow_s(P). Secret permutations preserve every equality pair
 * among observations with the same known rolling state.
 *
 * @param {Array<Array<{previous:number,current:number}>>} states
 * @param {number[]|null} qKnown
 */
function scoreRows(states,qKnown=null) {
  let count=0,pairs=0,chosen=0,trueScore=0;
  const bestQ=[];
  for(let s=0;s<29;s++) {
    const row=states[s];
    count+=row.length;
    pairs+=row.length*(row.length-1)/2;
    let best=-1,bq=0;
    for(let q=0;q<29;q++) {
      const hist=new Uint16Array(29);
      for(const e of row) hist[swap(e.current,e.previous,q)]++;
      let hit=0;
      for(const v of hist) hit+=v*(v-1)/2;
      if(hit>best){best=hit;bq=q;}
      if(qKnown && q===qKnown[s])trueScore+=hit;
    }
    chosen+=Math.max(best,0);
    bestQ.push(bq);
  }
  return {
    count,pairs,maxRate:chosen/pairs,
    trueRate:qKnown?trueScore/pairs:null,bestQ
  };
}

/**
 * Original feature vector on unmodified ciphertext; singleton word count is
 * a segmentation invariant of a length-preserving cipher and fixed at 83.
 * @param {number[]} c
 */
function features(c) {
  let internalDoublets=0,externalDoublets=0,lag5=0,lag5Eligible=0;
  for(let i=1;i<c.length;i++) {
    if(c[i]===c[i-1]) {
      if(events[i].wordStart) externalDoublets++;
      else internalDoublets++;
    }
    if(events[i].wordOffset>=5) {
      lag5Eligible++;
      if(c[i]===c[i-5])lag5++;
    }
  }
  return {internalDoublets,externalDoublets,lag5,lag5Eligible,
    singletonWords:wordLengths.filter(n=>n===1).length};
}

/** @param {string} content */
function vocabulary(content) {
  const groups=Array.from({length:15},()=>[]);
  for(const word of content.match(/[A-Za-z]+/g)||[]) {
    const gpWord=encodeSourceNativeGP(word);
    if(gpWord.length<=14)groups[gpWord.length].push(gpWord);
  }
  assert(wordLengths.every(n=>groups[n]&&groups[n].length>0));
  return groups;
}

/** @param {number[][][]} dict @param {()=>number} rng */
function nativePlant(dict,rng) {
  const out=[];
  for(const length of wordLengths) {
    const candidates=dict[length];
    out.push(...candidates[rng()%candidates.length]);
  }
  assert.equal(out.length,events.length);
  return out;
}

/** @param {number[]} values */
function range(values) {
  const s=values.slice().sort((a,b)=>a-b);
  return {min:s[0],median:s[Math.floor(s.length/2)],max:s[s.length-1]};
}
const deep = e => e.wordOffset>=5;
const train = e => e.wordOffset>=5&&e.page<40;
const hold = e => e.wordOffset>=5&&e.page>=40;
const originalDeep=scoreRows(stateRows(original,deep));
const originalTrain=scoreRows(stateRows(original,train));
const originalHold=scoreRows(stateRows(original,hold));
const frozenHold=scoreRows(stateRows(original,hold),
  originalTrain.bestQ);
const originalFeatures=features(original);
assert.equal(originalFeatures.internalDoublets,63);
assert.equal(originalFeatures.externalDoublets,23);
assert.equal(originalFeatures.lag5,104);
assert.equal(originalFeatures.singletonWords,83);
assert.equal(originalDeep.count,2105);
assert.equal(originalTrain.count+originalHold.count,2105);

// A fully source-blind wrong key still gives a perfect inverse and roundtrip.
// Exact reencryption does not authenticate any hypothesized key.
const aliasRng=random32(0x74a3125f);
const fakeA=newRows(aliasRng),fakeB=newRows(aliasRng);
const wrongA=decrypt(original,fakeA),wrongB=decrypt(original,fakeB);
assert.deepEqual(encrypt(wrongA,fakeA),original);
assert.deepEqual(encrypt(wrongB,fakeB),original);
assert.notDeepEqual(wrongA,wrongB);

const references=[
  ['shakespeare','resources/control/shakespeare_first300k.txt'],
  ['gibran','resources/control/gibran_prophet_58585.txt'],
  ['emerson','resources/control/emerson_essays_2944.txt']
];
const countPerCorpus=64,summary={};
for(let corpus=0;corpus<references.length;corpus++) {
  const [name,file]=references[corpus];
  const dict=vocabulary(read(file));
  const rng=random32((0x33011033+corpus*0x10ed3f01)>>>0);
  const scores={deep:[],hold:[],internal:[],external:[],lag5:[],
    doublets:[],eaCount:[]};
  for(let trial=0;trial<countPerCorpus;trial++) {
    const plain=nativePlant(dict,rng);
    const rows=newRows(rng);
    const cipher=encrypt(plain,rows);
    const recovered=decrypt(cipher,rows);
    assert.deepEqual(recovered,plain,'native GP plaintext recovered');
    assert.deepEqual(encrypt(recovered,rows),cipher,'exact ciphertext re-encryption');
    const knownQ=rows.map(row=>row[28]);
    const full=scoreRows(stateRows(cipher,deep),knownQ);
    const later=scoreRows(stateRows(cipher,hold),knownQ);
    const f=features(cipher);
    assert.equal(f.internalDoublets+f.externalDoublets,
      plain.slice(1).filter(x=>x===28).length);
    assert(full.trueRate<=full.maxRate+1e-12);
    scores.deep.push(full.trueRate);
    scores.hold.push(later.trueRate);
    scores.internal.push(f.internalDoublets);
    scores.external.push(f.externalDoublets);
    scores.lag5.push(f.lag5);
    scores.doublets.push(f.internalDoublets+f.externalDoublets);
    scores.eaCount.push(plain.filter(x=>x===28).length);
  }
  const minDeep=Math.min(...scores.deep);
  const minHold=Math.min(...scores.hold);
  // An oracle search over every q_s on original must still be
  // below every genuine planted source-native decoder.
  assert(minDeep>originalDeep.maxRate,name+' deep original all-secret gate');
  assert(minHold>originalHold.maxRate,name+' withheld original all-secret gate');
  summary[name]={
    n:countPerCorpus,
    trueDeepCollision:range(scores.deep),
    trueHoldCollision:range(scores.hold),
    internalDoublets:range(scores.internal),
    externalDoublets:range(scores.external),
    fiveBackEquals:range(scores.lag5),
    totalDoublets:range(scores.doublets),
    plaintextEA:range(scores.eaCount),
    controlsBelowOriginalDeepUpper:
      scores.deep.filter(x=>x<=originalDeep.maxRate).length,
    controlsBelowOriginalHoldUpper:
      scores.hold.filter(x=>x<=originalHold.maxRate).length
  };
}
console.log(JSON.stringify({
  status:'PASS',
  classification:'Original-input all-secret bounded negative; no LP2 plaintext or creator key',
  originalSourceSHA256:crypto.createHash('sha256').update(raw).digest('hex'),
  observed:{runes:original.length,words:wordLengths.length,
    trainRunes:gp.pages.filter(p=>p.page<=39).reduce((a,p)=>a+p.indices.length,0),
    features:originalFeatures,
    deepAll:{count:originalDeep.count,pairs:originalDeep.pairs,
      oracleMaximum:originalDeep.maxRate},
    deepTrain:{count:originalTrain.count,pairs:originalTrain.pairs,
      oracleMaximum:originalTrain.maxRate},
    deepHold:{count:originalHold.count,pairs:originalHold.pairs,
      oracleMaximum:originalHold.maxRate,
      frozenTrainChosenQRate:frozenHold.trueRate}
  },
  controls:summary,sourceNativePositive:{
    fullyRecoveredPlants:references.length*countPerCorpus,
    fullyRecoveredRunes:references.length*countPerCorpus*original.length,
    wrongKeysExactRoundtrip:2
  },
  mechanism:'29 hidden arbitrary GP29 row permutations; word-local rolling-five sum selects row; dynamic swap maps EA to previous C',
  explicitLimits:'Excludes only fixed per-rolling-state permutations with native GP-English source text, exact published segmentation and this stated swap. It cannot exclude secret row changes, deeper hidden states, unknown intermediate registers or lost key material.'
},null,2));
