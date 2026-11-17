'use strict';

/**
 * Original LP2 cyclic-H2 all-secret, one-exception and unigram-capacity gate.
 *
 * An unknown global GP29 bijection tau maps native English plaintext to
 * unshifted letter labels. The visible text is then shifted by consecutive
 * prime-totient residues. Literal plaintext F emits F without consuming key,
 * and a proposed repeat of the previous visible rune may be rejected while
 * consuming the key, up to two legal rejections per emitted non-F rune.
 *
 * All 18 original printed single-rune words in black pp15-22 normally
 * belong to an unknown set of <=3 tau(A),tau(I),tau(O) values. This study
 * even allows one completely arbitrary exceptional singleton and any
 * of the first 29 ordinary prime-key origins.
 *
 * Single-file, read-only Windows Node.js 22 SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const original = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const parsed = [], singleton = new Set();
let wordAt = -1, wordCount = 0;
for (const ch of transcription) {
  if (parsed.length === original.length) break;
  if (alphabet.has(ch)) {
    if (wordAt < 0) wordAt = parsed.length;
    parsed.push(alphabet.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && wordAt >= 0) {
    if (parsed.length - wordAt === 1) singleton.add(wordAt);
    wordCount++;
    wordAt = -1;
  }
}
if (wordAt >= 0) wordCount++;
assert.equal(original.length, 12956);
assert.deepEqual(parsed, original);
assert.equal(wordCount, 2896);
assert.equal(singleton.size, 83);

const START = 3623, END = 5506, LENGTH = END - START;
const originalBlack = original.slice(START, END);
const originalSingleton = [...singleton].filter(p => p >= START && p < END);
assert.deepEqual(originalSingleton, [
  3738,3783,3881,4006,4142,4148,4176,4217,4233,
  4358,4474,4633,4699,4751,4794,5253,5319,5336
]);

const sieve = new Uint8Array(400000);
const key = [];
for (let p = 2; p < sieve.length && key.length < 16000; p++) {
  if (sieve[p]) continue;
  key.push((p - 1) % 29);
  if (p * p < sieve.length)
    for (let m = p * p; m < sieve.length; m += p) sieve[m] = 1;
}
assert.equal(key.length, 16000);
assert.ok(key.every((v, i) => i+2 >= key.length ||
  !(v === key[i+1] && v === key[i+2])));
const mod = x => ((x % 29) + 29) % 29;
function bits(mask) {
  let n = 0;
  for (let v = mask; v; v &= v-1) n++;
  return n;
}

/**
 * Enumerate every exact allowed step, permitting a literal plaintext-F
 * bypass on a ciphertext-F rune outside original single-rune words.
 * The non-F encrypted branches intentionally overpermit assignments to
 * tau(F) because tau is unknown; exclusions remain conservative.
 *
 * @param {number[]} tape
 * @param {number} phase
 * @param {number} pos
 * @param {number} drift
 * @returns {{drift:number,base:number,skipped:number}[]}
 */
function rawSteps(tape, phase, pos, drift) {
  const c = tape[pos], prior = pos ? tape[pos-1] : -1;
  const one = singleton.has(START + pos);
  const at = phase + pos + drift;
  const steps = [];
  if (c === 0 && !one) steps.push({drift:drift-1,base:-1,skipped:-1});
  for (let s = 0; s <= (pos ? 2 : 0); s++) {
    const j = at+s;
    if (j < 0 || j >= key.length) continue;
    const base = mod(c-key[j]);
    if (s >= 1 && mod(base+key[at]) !== prior) continue;
    if (s >= 2 && mod(base+key[at+1]) !== prior) continue;
    steps.push({drift:drift+s,base,skipped:s});
  }
  return steps;
}

/**
 * Exhaustive unknown-alphabet DP with at most three normal singletons
 * and at most one exceptional singleton, which is excluded from mask.
 * @param {number[]} tape
 * @param {number} phase
 * @param {number|null} fixedException if null, may place one anywhere
 * @param {{masks:number[],drifts:number[]}|null} oracle
 */
function secretMasks(tape, phase, fixedException = null, oracle = null) {
  // State key encodes (29-bit normal-label mask * 2 + exceptionUsed).
  let states = new Map([[0, new Set([0])]]);
  let trueMask = 0, trueUsed = 0;
  for (let i = 0; i < tape.length; i++) {
    const one = singleton.has(START+i);
    const next = new Map();
    const put = (mask, used, drift) => {
      const code = mask*2 + used;
      let row = next.get(code);
      if (!row) {
        row = new Set();
        next.set(code, row);
      }
      row.add(drift);
    };
    if (oracle && one) {
      if (START+i === fixedException) trueUsed = 1;
      else trueMask |= 1 << oracle.masks[i];
    }
    for (const [code, drifts] of states) {
      const mask = Math.floor(code/2), used = code%2;
      for (const drift of drifts) {
        for (const step of rawSteps(tape,phase,i,drift)) {
          if (!one) {
            put(mask,used,step.drift);
          } else {
            const m2 = mask | (1 << step.base);
            if (bits(m2) <= 3) put(m2,used,step.drift);
            if (!used && (fixedException === null ||
              START+i === fixedException))
              put(mask,1,step.drift);
          }
        }
      }
    }
    states = next;
    if (oracle) assert.ok(states.get(trueMask*2 + trueUsed)
      ?.has(oracle.drifts[i]), 'positive true path lost at '+i);
    if (!states.size) {
      return {pass:false,at:START+i,terminalStates:0,masks:[]};
    }
  }
  const masks = [...new Set([...states.keys()].map(k => Math.floor(k/2)))]
    .sort((a,b) => a-b);
  return {pass:true,at:null,
    terminalStates:[...states.values()].reduce((s,a) => s+a.size,0),
    masks};
}

/**
 * Once a successful all-secret history has fixed its singleton labels,
 * reconstruct all forward-reachable drift paths, then retain only those
 * from which some complete original legal path reaches the source end.
 * @param {number[]} tape
 * @param {number} phase
 * @param {number} special
 * @param {Set<number>} labels
 * @returns {{terminal:number,viableLabels:{[index:string]:number[]}}}
 */
function viablePathLabels(tape,phase,special,labels) {
  const allowed = (i,b) => !singleton.has(START+i) ||
    START+i === special || labels.has(b);
  const forward = Array(tape.length+1);
  forward[0] = new Set([0]);
  for (let i=0;i<tape.length;i++) {
    const next=new Set();
    for (const d of forward[i])
      for (const step of rawSteps(tape,phase,i,d))
        if (allowed(i,step.base)) next.add(step.drift);
    forward[i+1]=next;
    assert.ok(next.size, 'no complete trace at '+i);
  }
  const backward=Array(tape.length+1);
  backward[tape.length]=new Set(forward[tape.length]);
  const viableLabels={};
  for (let i=tape.length-1;i>=0;i--) {
    const prior=new Set(), localLabels=new Set();
    for (const d of forward[i]) {
      for (const step of rawSteps(tape,phase,i,d)) {
        if (allowed(i,step.base) &&
          backward[i+1].has(step.drift)) {
          prior.add(d);
          if (singleton.has(START+i)) localLabels.add(step.base);
        }
      }
    }
    backward[i]=prior;
    if (singleton.has(START+i))
      viableLabels[START+i]=[...localLabels].sort((a,b)=>a-b);
  }
  assert.deepEqual([...backward[0]],[0]);
  return {terminal:forward[tape.length].size,viableLabels};
}

/**
 * Find the largest number of appearances of ANY fixed hidden-base symbol
 * b in any legal complete original forward path (not the greedy path).
 * The upper bound is independent of which GP plaintext letter tau maps
 * to b, including E, under the fixed source-required singleton labels.
 * @param {number[]} tape
 * @param {number} phase
 * @param {number} special
 * @param {Set<number>} labels
 * @param {number} specialBase
 * @param {number} target
 */
function maximizeSymbol(tape,phase,special,labels,specialBase,target) {
  let states=new Map([[0,0]]);
  for (let i=0;i<tape.length;i++) {
    const next=new Map(),global=START+i,one=singleton.has(global);
    for (const [drift,score] of states) {
      for (const step of rawSteps(tape,phase,i,drift)) {
        if (one && global===special && step.base!==specialBase)
          continue;
        if (one && global!==special && !labels.has(step.base))
          continue;
        const value=score+Number(step.base===target);
        if (value>(next.get(step.drift) ?? -1))
          next.set(step.drift,value);
      }
    }
    states=next;
    assert.ok(states.size, 'no viable max-path at '+global);
  }
  return Math.max(...states.values());
}

const originalPhaseResults = Array.from({length:29},(_,phase)=>
  secretMasks(originalBlack,phase));
assert.deepEqual(originalPhaseResults.filter(s=>s.pass)
  .map(s=>originalPhaseResults.indexOf(s)),[28]);
assert.deepEqual(originalPhaseResults.slice(0,6).map(s=>s.at),
  Array(6).fill(4794));
assert.deepEqual(originalPhaseResults.slice(6,28).map(s=>s.at),
  Array(22).fill(5336));

const exceptional=originalSingleton.map(at=>
  ({exceptionAt:at,...secretMasks(originalBlack,28,at)}));
const success=exceptional.filter(r=>r.pass);
assert.equal(success.length,1);
assert.equal(success[0].exceptionAt,4217);
assert.equal(success[0].terminalStates,15);
const sourceMask=(1<<2)|(1<<15)|(1<<18);
assert.deepEqual(success[0].masks,[sourceMask]);
const labels=new Set([2,15,18]);
const viable=viablePathLabels(originalBlack,28,4217,labels);
assert.equal(viable.terminal,15);
const baseAt={3738:15,3783:2,3881:18,4006:2,4142:15,
  4148:18,4176:2,4217:20,4233:2,4358:18,
  4474:18,4633:15,4699:18,4751:18,4794:15,
  5253:18,5319:15,5336:18};
for (const [site,base] of Object.entries(baseAt))
  assert.deepEqual(viable.viableLabels[site],[base]);
assert.deepEqual(Object.keys(viable.viableLabels).length,18);

const symbolCaps=Array.from({length:29},(_,b)=>
  maximizeSymbol(originalBlack,28,4217,labels,20,b));
const maxCap=Math.max(...symbolCaps);
assert.equal(maxCap,113);
assert.equal(symbolCaps[12],113);
assert.equal(symbolCaps[18],105);

/** Independent source-orthography transcription used by GP29 controls. */
const tokens=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]} */
function gpWord(word) {
  const word29=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for (let i=0;i<word29.length;) {
    if (word29.startsWith('ING',i)) {
      out.push(21);i+=3;
    } else if (word29.startsWith('IO',i)) {
      out.push(27);i+=2;
    } else {
      const match=tokens.find(t=>word29.startsWith(t.s,i));
      assert.ok(match,'unknown GP digraph '+word29.slice(i));
      out.push(match.i);i+=match.s.length;
    }
  }
  return out;
}
/** @param {string} sourceText */
function gpText(sourceText) {
  return (sourceText.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
}
/**
 * Exhaustively find minimum actual plaintext-E (GP index18) count in
 * EVERY contiguous window matching the original black-text length.
 * @param {number[]} sourceRunes
 */
function englishEWindows(sourceRunes) {
  let e=0,min=Infinity,max=0,minAt=-1;
  for (let i=0;i<sourceRunes.length;i++) {
    e+=Number(sourceRunes[i]===18);
    if (i>=LENGTH) e-=Number(sourceRunes[i-LENGTH]===18);
    if (i>=LENGTH-1) {
      if (e<min) {min=e;minAt=i-LENGTH+1;}
      max=Math.max(max,e);
    }
  }
  return {runes:sourceRunes.length, windows:sourceRunes.length-LENGTH+1,
    minE:min,maxE:max,minAt};
}
const shakespeare=gpText(read('resources/control/shakespeare_first300k.txt'));
const gibran=gpText(read('resources/control/gibran_prophet_58585.txt'));
assert.deepEqual([shakespeare.length,gibran.length],[217106,62492]);
const sourceControls={
  shakespeare:englishEWindows(shakespeare),
  gibran:englishEWindows(gibran)
};
assert.deepEqual([sourceControls.shakespeare.minE,
  sourceControls.gibran.minE],[147,185]);
assert.ok(sourceControls.shakespeare.minE>maxCap &&
  sourceControls.gibran.minE>maxCap);

/** Independent seed/state, no original ciphertext used to create plant. */
function rng(seed) {
  let state=seed>>>0;
  return () => {
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
const random=rng(0x330115cf);
const tau=Array.from({length:29},(_,i)=>i);
for (let i=28;i>0;i--) {
  const j=Math.floor(random()*(i+1));
  [tau[i],tau[j]]=[tau[j],tau[i]];
}
const truth=shakespeare.slice(0,LENGTH);
for (let i=0;i<originalSingleton.length;i++) {
  const local=originalSingleton[i]-START;
  truth[local]=originalSingleton[i]===4217?20:[24,10,3][i%3];
}
const truePlainE=truth.filter(p=>p===18).length;
assert.ok(truePlainE>maxCap);
const planted=[],trueDrifts=[],trueLabels=truth.map(p=>tau[p]);
let ptr=28,previous=-1,transparent=0,rejected=0;
for (let i=0;i<truth.length;i++) {
  const p=truth[i];
  let value;
  if (p===0) {
    value=0;transparent++;
  } else {
    value=mod(tau[p]+key[ptr]);
    let retries=0;
    while (value===previous && random()<0.81) {
      ptr++;retries++;rejected++;
      assert.ok(retries<=2);
      value=mod(tau[p]+key[ptr]);
    }
    ptr++;
  }
  planted.push(value);
  trueDrifts.push(ptr-28-i-1);
  previous=value;
}
assert.ok(rejected>0&&transparent>0);
const recovered=secretMasks(planted,28,4217,
  {masks:trueLabels,drifts:trueDrifts});
assert.ok(recovered.pass);
const plantedLabels=new Set([tau[24],tau[10],tau[3]]);
const positiveMaximum=maximizeSymbol(planted,28,4217,
  plantedLabels,tau[20],tau[18]);
assert.ok(positiveMaximum>=truePlainE,
  'all-secret unigram capacity may not reject native GP plant');

console.log(JSON.stringify({
  status:'PASS',
  classification:'original-source all-secret cyclic H2 necessary-condition capacity, conditional on preserved native GP singleton words',
  originalRunes:12956,sourceWords:wordCount,sourceSingletons:singleton.size,
  blackSpan:[START,END],blackSingletons:originalSingleton.length,
  all29StartsWithOneFreeSingleton:{
    survivingStartIndices:[28],
    excludedOther28:true,
    firstFailures:originalPhaseResults.slice(0,28).map(x=>x.at)
  },
  all18PossibleExceptionLocationsAtSurvivingStart:{
    survivingOriginalOffset:[4217],
    completeFinalHiddenStates:success[0].terminalStates,
    discoveredNormalSecretBaseLabels:[...labels],
    fullSingletonBaseLabels:viable.viableLabels
  },
  all29PossiblePlaintextLetterCountsMaximum:symbolCaps,
  globalAnyLetterCapacityMax:maxCap,
  nativeGP29EReferenceWindowMin:sourceControls,
  plant:{GP29Ecount:truePlainE,plaintextFBypasses:transparent,
    actualRejectedRows:rejected,trueHiddenStateRetained:recovered.pass,
    trueTableauEBase:tau[18],unrestrictedMaximumForE:positiveMaximum},
  decision:'All first-29 prime origins fail fixed-single-secret-tau cyclic H2 as native GP-English on black p15-22 even permitting one arbitrary singleton, because the sole surviving symbolic path has max 113 instances of ANY non-F letter and independent native GP E windows each have >=147. No original plaintext/key recovered.'
},null,2));
