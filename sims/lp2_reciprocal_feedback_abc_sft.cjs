'use strict';

/**
 * Director #583: Complete, source-interval GP29 3-parameter reciprocal-feedback
 * inverse, with preregistered GP language ranking and unfitted second chapter.
 *
 * C_i = P_i + a*C_(i-1) + b*P_(i-1) + c mod29.
 * All chapter-start previous symbols are zero. No F exceptions or key phases.
 * Run: node sims/lp2_reciprocal_feedback_abc_sft.cjs
 *
 * This is an exploratory cipher family, not an original Cicada-selected key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus, physicalLP2Page} = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function gpNative(text) {
  const out = [];
  for (const raw of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const t = tokens.find(z => word.startsWith(z.s, i));
      assert(t, 'unmapped native text token: ' + word.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/** @param {number[]} cipher @param {{a:number,b:number,c:number}} key @returns {number[]} */
function decrypt(cipher, key) {
  let pPrev = 0, cPrev = 0;
  const out = [];
  for (const x of cipher) {
    const p = mod(x - key.a*cPrev - key.b*pPrev - key.c);
    out.push(p);
    cPrev = x;
    pPrev = p;
  }
  return out;
}
/** @param {number[]} plain @param {{a:number,b:number,c:number}} key @returns {number[]} */
function encrypt(plain, key) {
  let pPrev = 0, cPrev = 0;
  const out = [];
  for (const p of plain) {
    const x = mod(p + key.a*cPrev + key.b*pPrev + key.c);
    out.push(x);
    pPrev = p;
    cPrev = x;
  }
  return out;
}

/**
 * Fixed interpolated unigram, bigram and trigram language likelihood.
 * All estimates are trained only on known Cicada solved-source prose.
 * @param {number[]} training
 * @returns {(runic:number[])=>number} Average natural-log score per rune.
 */
function languageModel(training) {
  const V = MOD, n = training.length;
  const uni = new Float64Array(V);
  const bi = new Float64Array(V*V);
  const tri = new Float64Array(V*V*V);
  for (let i = 0; i < n; i++) {
    const z = training[i];
    uni[z]++;
    if (i > 0) bi[training[i-1]*V + z]++;
    if (i > 1) tri[(training[i-2]*V + training[i-1])*V + z]++;
  }
  const l1 = new Float64Array(V);
  const l2 = new Float64Array(V*V);
  const l3 = new Float64Array(V*V*V);
  for (let x = 0; x < V; x++) l1[x] = Math.log((uni[x]+1)/(n+V));
  for (let x = 0; x < V; x++) for (let y = 0; y < V; y++) {
    l2[x*V+y] = Math.log((bi[x*V+y]+4*Math.exp(l1[y]))/(uni[x]+4));
  }
  for (let x = 0; x < V; x++) for (let y = 0; y < V; y++)
    for (let z = 0; z < V; z++) {
      const xy = x*V+y, yz = y*V+z, xyz = xy*V+z;
      l3[xyz] = Math.log((tri[xyz]+4*Math.exp(l2[yz]))/(bi[xy]+4));
    }
  return runic => {
    let sum = 0;
    for (let i = 0; i < runic.length; i++) {
      const p = runic[i];
      let val = .33*l1[p];
      if (i > 0) val += .34*l2[runic[i-1]*V+p];
      if (i > 1) val += .33*l3[(runic[i-2]*V+runic[i-1])*V+p];
      sum += val;
    }
    return sum/runic.length;
  };
}

/**
 * @param {number[]} x
 * @returns {number}
 */
function ioc(x) {
  const h = new Uint32Array(MOD);
  for (const p of x) h[p]++;
  return h.reduce((sum, n) => sum+n*(n-1), 0)/(x.length*(x.length-1));
}

/**
 * @param {number[]} ciphertext
 * @param {(runes:number[]) => number} score
 * @returns {Array<{a:number,b:number,c:number,train:number}>}
 */
function rank(ciphertext, score) {
  const top = [];
  for (let a = 0; a < MOD; a++)
    for (let b = 0; b < MOD; b++)
      for (let c = 0; c < MOD; c++) {
        const key = {a,b,c};
        const candidate = decrypt(ciphertext, key);
        const val = score(candidate);
        if (top.length === 10 && val <= top[top.length-1].train) continue;
        top.push({...key, train:val});
        top.sort((x,y) => y.train-x.train);
        if (top.length > 10) top.pop();
      }
  return top;
}

/**
 * Source words preserve original word boundaries across *physical* page breaks.
 * No word can span the selected source-visible chapter boundaries.
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function originalWordLengths(start, end) {
  const words = parseSharedCorpus().words.filter(w => {
    const s = physicalLP2Page(w.startPage);
    const e = physicalLP2Page(w.endPage);
    return s >= start && e <= end;
  });
  return words.map(w => w.length);
}

/**
 * @param {number[]} runes
 * @param {number[]} wordLengths
 * @param {Set<string>} dictionary
 * @returns {{total:number,recognized:number,recognizedAtLeast3:number,longest:string[]}}
 */
function lexicalEvidence(runes, wordLengths, dictionary) {
  let pos = 0, recognized = 0, recognizedAtLeast3 = 0;
  const longest = [];
  for (const len of wordLengths) {
    const word = runes.slice(pos, pos+len).map(x => gp.translit[x]).join('');
    pos += len;
    if (dictionary.has(word)) {
      recognized++;
      if (len >= 3) {
        recognizedAtLeast3++;
        longest.push(word);
      }
    }
  }
  assert.equal(pos, runes.length);
  return {total:wordLengths.length, recognized, recognizedAtLeast3,
    longest:longest.sort((x,y) => y.length-x.length).slice(0,12)};
}

/** @returns {void} */
function main() {
  const clean = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .split(/\r?\n/u).filter(line => {
      const s = line.trim();
      return !s.startsWith('#') && !s.startsWith('[')
        && !/^[0-9a-f]{25,}$/iu.test(s);
    }).join(' ');
  const native = gpNative(clean);
  assert.equal(native.length, 3249);
  const score = languageModel(native);
  const referenceWords = new Set((clean.toUpperCase().match(/[A-Z]+/g) || [])
    .map(word => gpNative(word).map(x => gp.translit[x]).join('')));
  const training = gp.pages.slice(0,3).flatMap(p => p.indices);
  const independent = gp.pages.slice(54,56).flatMap(p => p.indices);
  assert.equal(training.length, 729);
  assert.equal(independent.length, 308);
  const trainWords = originalWordLengths(0, 2);
  const testWords = originalWordLengths(54,55);
  assert.equal(trainWords.length, 158);
  assert.equal(testWords.length, 66);
  assert.equal(trainWords.reduce((a,b)=>a+b,0),729);
  assert.equal(testWords.reduce((a,b)=>a+b,0),308);
  const expectedKeys = [[24,17,6],[18,3,17],[19,26,16],
    [23,6,4],[22,6,11],[13,22,14],[23,23,20],
    [2,14,26],[13,5,26],[7,11,12]];
  const top = rank(training, score);
  assert.deepEqual(top.map(x => [x.a,x.b,x.c]),expectedKeys);
  const reported = top.map((key, index) => {
    const p0 = decrypt(training, key);
    const p54 = decrypt(independent, key);
    assert.deepEqual(encrypt(p0,key),training);
    assert.deepEqual(encrypt(p54,key),independent);
    return {rank:index+1,a:key.a,b:key.b,c:key.c,
      trainingScore:key.train, independentScore:score(p54),
      trainIoC:ioc(p0), testIoC:ioc(p54),
      first30Training:p0.slice(0,30).map(x=>gp.translit[x]).join(' '),
      first30Independent:p54.slice(0,30).map(x=>gp.translit[x]).join(' '),
      trainingWords:lexicalEvidence(p0,trainWords,referenceWords),
      independentWords:lexicalEvidence(p54,testWords,referenceWords)};
  });

  // Independently held-out native-English GP plant, absent from training text.
  const shakespeare = gpNative(read('resources/control/shakespeare_first300k.txt').slice(180000));
  assert(shakespeare.length >= 1037);
  const planted = shakespeare.slice(0,729);
  const plantedTest = shakespeare.slice(729,1037);
  const plantedKey = {a:7,b:11,c:19};
  const ciphertext = encrypt(planted, plantedKey);
  const winner = rank(ciphertext,score);
  assert.deepEqual([winner[0].a,winner[0].b,winner[0].c],[7,11,19]);
  assert.deepEqual(decrypt(ciphertext,plantedKey),planted);
  assert.deepEqual(decrypt(encrypt(plantedTest,plantedKey),plantedKey),plantedTest);
  const wrongKey={a:8,b:11,c:19};
  const summary = {
    source:'original LP2 physical pp0–2 and independent pp54–55',
    exactKeys:29**3,
    languageModel:'LP1 solved-Cicada GP29 3249 runes, interpolated 1:2:3-grams (0.33:0.34:0.33), no original training',
    nativeModelMean:score(native.slice(-729)),
    raw:{training:score(training),independent:score(independent)},
    wordSpans:{training:trainWords.length,independent:testWords.length},
    top,
    independentlyEvaluated:reported,
    planted:{a:7,b:11,c:19,trainScore:score(planted),
      wrongKeyTrainScore:score(decrypt(ciphertext,wrongKey)),
      independentScore:score(plantedTest),
      trueKeyTrainingRank:1,plaintextRecovered:1037},
    interpretation:'No unknown original chapter plaintext under the 24389 frozen small reciprocal-feedback models.'
  };
  console.log(JSON.stringify(summary,null,2));
}
main();
