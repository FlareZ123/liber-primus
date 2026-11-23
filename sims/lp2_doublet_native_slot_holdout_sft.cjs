'use strict';
/**
 * Key-independent GP29 plaintext-escape word-slot challenge on the original 86 LP2 doublets.
 *
 * The known 29 GP runes, original printed words and first/second 27-page split are fixed.
 * Tests two directly interpretable mechanisms against a genuine English GP-transcribed
 * reference lexicon: (i) a repeated ciphertext glyph encodes one special plaintext rune,
 * and (ii) an unchanged plaintext repeated digraph creates the observed ciphertext pair.
 *
 * A negative rules out only these particular plaintext-transparent mechanisms with
 * original word segmentation and the specified native English control. No cipher
 * plaintext is generated here. Run: node sims/lp2_doublet_native_slot_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { plaintextWords } = require('./authentic_decryption_regression.cjs');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {string} raw */
function sourceSlots(raw) {
  const physicalSections = raw.split('%').slice(0, -2);
  assert.equal(physicalSections.length, 55);
  const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
  const tokens = [];
  let wordId = 0;
  for (let section = 0; section < physicalSections.length; section++) {
    const current = physicalSections[section].replace(/[\/\s]+/gu, '');
    for (const character of current) {
      if (runeIndex.has(character)) {
        tokens.push({ section, symbol: runeIndex.get(character), wordId });
      } else if (/[-.&$§]/.test(character)) {
        wordId++;
      }
    }
    const p = section < 50 ? section : section + 1;
    assert.equal(tokens.filter(t => t.section === section).length,
      corpus.pages.find(page => page.page === p).indices.length);
  }
  const words = new Map();
  for (const token of tokens) {
    const word = words.get(token.wordId) || [];
    token.position = word.length;
    word.push(token);
    words.set(token.wordId, word);
  }
  for (const word of words.values()) for (const token of word) token.length = word.length;

  /** @type {{[key: string]: Map<string, {length:number,position:number,n:number,k:number}>}} */
  const two = { train: new Map(), holdout: new Map() };
  let same = 0;
  let within = 0;
  let wordstart = 0;
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.section !== tokens[i - 1].section) continue;
    const key = t.length + ',' + t.position;
    const map = t.section < 27 ? two.train : two.holdout;
    const row = map.get(key) || { length: t.length, position: t.position, n: 0, k: 0 };
    row.n++;
    if (t.symbol === tokens[i - 1].symbol) {
      row.k++;
      same++;
      if (t.position > 0) within++; else wordstart++;
    }
    map.set(key, row);
  }
  assert.equal(tokens.length, 12956);
  assert.equal(words.size, 2896);
  assert.deepEqual([same,within,wordstart], [86,63,23]);
  return {
    totalRunes: tokens.length,
    wordCount: words.size,
    pages: physicalSections.length,
    sameRunes: same,
    sameWithinWords: within,
    sameWordStarts: wordstart,
    train: [...two.train.values()],
    holdout: [...two.holdout.values()]
  };
}

/** @returns {{totals:Map<number,number>, single:Map<string,number>, equal:Map<string,number>, types:number}} */
function nativeCounts() {
  const source = fs.readFileSync(path.join(ROOT,
    'resources/control/english_wordfreq_textblob.txt'), 'utf8');
  const totals = new Map();
  const single = new Map();
  const equal = new Map();
  let types = 0;
  for (const line of source.split(/\r?\n/)) {
    const match = /^([a-z]+)\s+(\d+)$/.exec(line.trim());
    if (!match || /q(?!u)/.test(match[1])) continue; // Only original GP-encodable QU words.
    const weight = Number(match[2]);
    const symbols = plaintextWords(match[1])[0];
    if (symbols.length === 0) continue;
    types++;
    const L = symbols.length;
    totals.set(L, (totals.get(L) || 0) + weight);
    for (let j = 0; j < L; j++) {
      const id = L + ',' + j + ',' + symbols[j];
      single.set(id, (single.get(id) || 0) + weight);
      if (j && symbols[j] === symbols[j - 1]) {
        const eqid = L + ',' + j;
        equal.set(eqid, (equal.get(eqid) || 0) + weight);
      }
    }
  }
  assert.ok(types > 28000);
  return { totals, single, equal, types };
}

/** @param {number} x */
function cap(x) { return Math.max(1e-10, Math.min(1 - 1e-10, x)); }

/** @param {Array<{n:number,k:number}>} rows @param {number} p */
function fixedLogLikelihood(rows, p) {
  const q = cap(p);
  return rows.reduce((s,r) => s + r.k * Math.log(q) +
    (r.n - r.k) * Math.log1p(-q), 0);
}

/** @param {Array<{n:number,k:number}>} rows */
function rate(rows) {
  return rows.reduce((s,r) => s + r.k, 0) /
    rows.reduce((s,r) => s + r.n, 0);
}

/** @param {Array<{length:number,position:number,n:number,k:number}>} rows
 *  @param {ReturnType<typeof nativeCounts>} native @param {number|null} symbol
 *  @param {boolean} repeated */
function qs(rows, native, symbol, repeated) {
  return rows.map(({length:L,position:j}) => {
    const count = repeated ? native.equal.get(L+','+j) :
      native.single.get(L+','+j+','+symbol);
    const total = native.totals.get(L);
    return total ? ((count || 0) / total) * (1 - 1e-4) + 1e-4 : 1e-4;
  });
}

/** @param {Array<{n:number,k:number}>} rows @param {number[]} q @param {number} alpha */
function projectedLL(rows,q,alpha) {
  return rows.reduce((s,r,i) => {
    const p=cap(alpha*q[i]);
    return s + r.k*Math.log(p)+(r.n-r.k)*Math.log1p(-p);
  },0);
}

/** @param {Array<{n:number,k:number}>} rows @param {number[]} q */
function fitAlpha(rows,q) {
  let a=0,b=1;
  const ratio=(Math.sqrt(5)-1)/2;
  let c=b-ratio*(b-a), d=a+ratio*(b-a);
  for(let i=0;i<72;i++){
    if(projectedLL(rows,q,c)>projectedLL(rows,q,d)){
      b=d;d=c;c=b-ratio*(b-a);
    }else{
      a=c;c=d;d=a+ratio*(b-a);
    }
  }
  const alpha=(a+b)/2;
  return {alpha, logLikelihood:projectedLL(rows,q,alpha)};
}

function run() {
  const src=sourceSlots(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-transcription.txt'),'utf8'));
  const native=nativeCounts();
  const trainRate=rate(src.train);
  const testBaseLL=fixedLogLikelihood(src.holdout,trainRate);
  const candidates=corpus.translit.map((symbolName,i)=>{
    const trainQ=qs(src.train,native,i,false);
    const holdoutQ=qs(src.holdout,native,i,false);
    const fit=fitAlpha(src.train,trainQ);
    return {symbolName,alpha:fit.alpha,trainLL:fit.logLikelihood,
      holdoutLL:projectedLL(src.holdout,holdoutQ,fit.alpha)};
  }).sort((a,b)=>b.trainLL-a.trainLL);
  const candidate=candidates[0];
  const trainWithin=src.train.filter(r=>r.position>0);
  const holdoutWithin=src.holdout.filter(r=>r.position>0);
  const withinRate=rate(trainWithin);
  const nativeEqualFit=fitAlpha(trainWithin,qs(trainWithin,native,null,true));
  const nativeEqualHoldoutLL=projectedLL(holdoutWithin,
    qs(holdoutWithin,native,null,true),nativeEqualFit.alpha);
  const withinBaseLL=fixedLogLikelihood(holdoutWithin,withinRate);

  // Positive metric plant, using exact expected source-native TH features.
  const thesym=corpus.translit.indexOf('TH');
  assert.equal(thesym,2);
  const plantTrainQ=qs(src.train,native,thesym,false);
  const plantHoldoutQ=qs(src.holdout,native,thesym,false);
  const trueAlpha=0.3;
  const plantedTrain=src.train.map((r,i)=>({...r,k:r.n*trueAlpha*plantTrainQ[i]}));
  const plantedHoldout=src.holdout.map((r,i)=>({...r,k:r.n*trueAlpha*plantHoldoutQ[i]}));
  const selectedNative=corpus.translit.map((name,i)=>({
    name,i,...fitAlpha(plantedTrain,qs(src.train,native,i,false))
  })).sort((a,b)=>b.logLikelihood-a.logLikelihood)[0];
  assert.equal(selectedNative.name,'TH','source-native synthetic expected-count plant must recover selected hidden letter');
  const truePlantTestLL=projectedLL(plantedHoldout,plantHoldoutQ,
    selectedNative.alpha);
  const uniformPlantTestLL=fixedLogLikelihood(plantedHoldout,rate(plantedTrain));
  assert.ok(truePlantTestLL>uniformPlantTestLL);

  assert.ok(candidate.holdoutLL<testBaseLL);
  assert.ok(nativeEqualHoldoutLL<withinBaseLL);
  return {
    classification: 'Key-independent original-cipher negative for plaintext-transparent doublet event interpretations',
    original: {
      pageSegments:src.pages,runicCount:src.totalRunes,wholeWordCount:src.wordCount,
      sameSymbolEvents:src.sameRunes,withinWordEvents:src.sameWithinWords,
      wordStartEvents:src.sameWordStarts,
      first27:{opportunities:src.train.reduce((s,r)=>s+r.n,0),events:src.train.reduce((s,r)=>s+r.k,0)},
      final28:{opportunities:src.holdout.reduce((s,r)=>s+r.n,0),events:src.holdout.reduce((s,r)=>s+r.k,0)}
    },
    nativeReference:{source:'resources/control/english_wordfreq_textblob.txt',
      GP29Encoding:'sims/authentic_decryption_regression.cjs plaintextWords',
      distinctWords:native.types},
    oneFixedGPPlaintextEscape:{
      meaning:'a doublet at the current original word-length and position occurs with alpha times the native probability of ONE unknown plaintext rune',
      selectedFromTraining:candidate,
      topFiveTraining:candidates.slice(0,5),
      holdoutUniformBaselineLL:testBaseLL,
      holdoutDeltaLL:candidate.holdoutLL-testBaseLL
    },
    genuinePlaintextRepeatedDigraph:{
      meaning:'a within-word ciphertext doublet occurs with alpha times the native probability of an unchanged identical plaintext rune pair at this location',
      trainWithinWordEvents:trainWithin.reduce((s,r)=>s+r.k,0),
      holdoutWithinWordEvents:holdoutWithin.reduce((s,r)=>s+r.k,0),
      fittedAlpha:nativeEqualFit.alpha,
      holdoutNativeFeatureLL:nativeEqualHoldoutLL,
      holdoutUniformBaselineLL:withinBaseLL,
      holdoutDeltaLL:nativeEqualHoldoutLL-withinBaseLL
    },
    plantedNativeMetricControl:{
      plantedPlaintextSymbol:'TH',trueAlpha,
      recoveredSymbol:selectedNative.name,recoveredAlpha:selectedNative.alpha,
      plantHoldoutLogLikelihoodGain:truePlantTestLL-uniformPlantTestLL
    },
    limitation:'Native English word-slot frequencies are a reference model. Changing original printed word boundaries, switching language/register or allowing independent unconstrained exception coding could evade these exclusions. No plaintext recovered.'
  };
}
if (require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={run};
