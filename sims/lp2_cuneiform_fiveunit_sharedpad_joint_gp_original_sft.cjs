/**
 * Five numbered cuneiform units p36..p38 as five possible messages
 * encrypted with one unknown GP29 additive pad reset at the printed 1..5.
 *
 * Key cancels in five ciphertext differences. Joint GP-native English
 * four-gram Viterbi beam inference recovers five full plaintext strings at
 * once. No key, phase, extra offset or unknown-page plaintext is fitted.
 *
 * Frozen source units: 139,91,98,96,129 runes. The common first91 runes
 * are attacked. Source-visible hyphen/period breaks remain intact.
 * Last50 original runes of the overlap are a no-retuning readout.
 *
 * Windows 11, Node22, CommonJS, read-only single-file test.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
/** @param {string} p @returns {any} */
const json = p => JSON.parse(read(p));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const known = json('resources/external/relikd-solved-gp29-native-v1.json');
const pageText = read('resources/lp2-transcription.txt').split('%');
const gpm = new Map(corpus.runes.map((r, i) => [r, i]));
const symbols = corpus.translit;
const alpha = new Map(symbols.map((s, i) => [s, i]));
const N = 29;
const W = 91;
const BEAM = 2400;
const N2 = N * N;
const N3 = N2 * N;
const N4 = N3 * N;
/** @param {number} x @returns {number} */
const mod = x => (x % N + N) % N;

/** @param {string} w @returns {number[]} */
function encodeWord(w) {
  const text = w.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Q/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.slice(i, i + 3) === 'ING') {
      out.push(alpha.get('NG'));
      i += 3;
      continue;
    }
    let code;
    for (const n of [2, 1]) {
      code = alpha.get(text.slice(i, i + n));
      if (code !== undefined) {
        i += n;
        break;
      }
    }
    assert.notEqual(code, undefined);
    out.push(code);
  }
  return out;
}

/** @param {string} text */
function encodeEnglish(text) {
  const words = (text.match(/[A-Za-z]+/g) || []).map(encodeWord);
  return {words, tape: words.flat()};
}

/**
 * Four-gram language model plus independent initial/final printed-word
 * marginal; train ONLY on first 70% of pinned non-Cicada literature.
 */
function trainModel() {
  const cp1 = new Float64Array(N);
  const cp2 = new Float64Array(N2);
  const cp3 = new Float64Array(N3);
  const cp4 = new Float64Array(N4);
  const ci = new Float64Array(N);
  const cf = new Float64Array(N);
  let total = 0, words = 0;
  const paths = [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt',
    'resources/control/shakespeare_first300k.txt'
  ];
  for (const pathname of paths) {
    const all = encodeEnglish(read(pathname));
    const selected = all.words.slice(0, Math.floor(all.words.length * 0.7));
    const tape = selected.flat();
    total += tape.length;
    for (const word of selected) {
      if (word.length) {
        ci[word[0]]++;
        cf[word[word.length - 1]]++;
        words++;
      }
    }
    for (let i = 0; i < tape.length; i++) {
      const x = tape[i];
      cp1[x]++;
      if (i >= 1) cp2[tape[i - 1] * N + x]++;
      if (i >= 2) cp3[(tape[i - 2] * N + tape[i - 1]) * N + x]++;
      if (i >= 3) cp4[((tape[i - 3] * N + tape[i - 2]) * N +
        tape[i - 1]) * N + x]++;
    }
  }
  const l1 = new Float64Array(N);
  const l2 = new Float64Array(N2);
  const l3 = new Float64Array(N3);
  const l4 = new Float32Array(N4);
  const ls = new Float64Array(N);
  const lf = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    l1[i] = Math.log((cp1[i] + 0.2) / (total + N * 0.2));
    ls[i] = Math.log((ci[i] + 0.5) / (words + N * 0.5)) - l1[i];
    lf[i] = Math.log((cf[i] + 0.5) / (words + N * 0.5)) - l1[i];
  }
  for (let i = 0; i < N2; i++) {
    l2[i] = Math.log((cp2[i] + 5 * Math.exp(l1[i % N])) /
      (cp1[Math.floor(i / N)] + 5));
  }
  for (let i = 0; i < N3; i++) {
    l3[i] = Math.log((cp3[i] + 5 * Math.exp(l2[i % N2])) /
      (cp2[Math.floor(i / N)] + 5));
  }
  for (let i = 0; i < N4; i++) {
    l4[i] = Math.log((cp4[i] + 7 * Math.exp(l3[i % N3])) /
      (cp3[Math.floor(i / N)] + 7));
  }
  return {l1, l2, l3, l4, ls, lf, total, trainedWords:words};
}

/**
 * Collect exact rune interval and all intervening literal word delimiters.
 * Physical page break is not a word delimiter (some words cross pages).
 * @param {number} page
 * @param {number} lo
 * @param {number} hi
 * @returns {string}
 */
function sourceSpan(page, lo, hi) {
  let count = 0;
  let started = false;
  let result = '';
  for (const char of pageText[page]) {
    const isRune = gpm.has(char);
    if (isRune && count === lo) started = true;
    if (isRune && count === hi) break;
    if (started) result += char;
    if (isRune) count++;
  }
  assert.equal(count, hi);
  return result;
}

/** @param {string} text */
function parseRuneWords(text) {
  const tape = [], begins = [], ends = [];
  let wordStart = 0;
  for (const char of text) {
    if (gpm.has(char)) tape.push(gpm.get(char));
    else if (char === '-' || char === '.' || char === '&' || char === '•') {
      if (tape.length > wordStart) {
        begins[wordStart] = 1;
        ends[tape.length - 1] = 1;
      }
      wordStart = tape.length;
    }
  }
  if (tape.length > wordStart) {
    begins[wordStart] = 1;
    ends[tape.length - 1] = 1;
  }
  return {
    tape,
    begins: Array.from({length: tape.length}, (_, i) => begins[i] || 0),
    ends: Array.from({length: tape.length}, (_, i) => ends[i] || 0)
  };
}

const definitions = [
  [[36, 99, 238]],
  [[37, 0, 91]],
  [[37, 91, 189]],
  [[37, 189, 228], [38, 0, 57]],
  [[38, 57, 186]]
];
const original = definitions.map(parts => {
  const unit = parseRuneWords(parts.map(([p,a,b]) =>
    sourceSpan(p,a,b)).join(''));
  const expected = parts.flatMap(([p,a,b]) =>
    corpus.pages.find(entry => entry.page === p).indices.slice(a,b));
  assert.deepEqual(unit.tape, expected);
  return unit;
});
assert.deepEqual(original.map(unit => unit.tape.length), [139, 91, 98, 96, 129]);
assert.equal(original.reduce((n, unit) => n + unit.tape.length, 0), 553);
const sourceWordCount = original.reduce((n, unit) =>
  n + unit.begins.filter(Boolean).length, 0);
assert.equal(sourceWordCount, 122);
const message = original.map(unit => ({
  tape: unit.tape.slice(0,W),
  begins: unit.begins.slice(0,W),
  ends: unit.ends.slice(0,W)
}));

/**
 * Decode five natural-language plaintexts simultaneously from a single
 * arbitrary unknown GP29 pad. Their 5-way ciphertext differences are
 * exact. All shifts and coordinate resets are frozen by the five printed
 * red numerals. No test original rune value influences the decode model.
 *
 * @param {{tape:number[],begins:number[],ends:number[]}[]} encrypted
 * @param {ReturnType<typeof trainModel>} model
 */
function recover(encrypted, model) {
  assert.equal(encrypted.length, 5);
  for (const unit of encrypted) assert.equal(unit.tape.length, W);
  const delta = encrypted.map(unit => unit.tape.map((x, i) =>
    mod(x - encrypted[0].tape[i])));
  const values = delta.map(d => d.map(x =>
    Int8Array.from({length:N}, (_, v) => (v + x) % N)));
  /** @param {number} i @param {number[]} v */
  const initialScore = (i, v) => v.reduce((sum, x, lane) => {
    const u = encrypted[lane];
    const p = values[lane][i][x];
    return sum + model.l1[p] +
      0.4 * (u.begins[i] * model.ls[p] + u.ends[i] * model.lf[p]);
  }, 0);
  let beam = [];
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)for(let c=0;c<N;c++){
    let score=0;
    for(let lane=0;lane<5;lane++){
      const x=values[lane][0][a], y=values[lane][1][b],
        z=values[lane][2][c], unit=encrypted[lane];
      score+= model.l1[x]+model.l2[x*N+y]+model.l3[(x*N+y)*N+z];
      score+=0.4 * (unit.begins[0]*model.ls[x]+unit.ends[0]*model.lf[x] +
        unit.begins[1]*model.ls[y]+unit.ends[1]*model.lf[y] +
        unit.begins[2]*model.ls[z]+unit.ends[2]*model.lf[z]);
    }
    beam.push({index:(a*N+b)*N+c,score,parent:null,seed:[a,b,c]});
  }
  beam.sort((a,b)=>b.score-a.score || a.index-b.index);
  beam.length=BEAM;
  const stateScore=new Float64Array(N3), parentIndex=new Int32Array(N3);
  for(let pos=3;pos<W;pos++){
    stateScore.fill(-Infinity);
    for(let pi=0;pi<beam.length;pi++){
      const item=beam[pi],key=item.index,
        a=Math.floor(key/N2), b=Math.floor(key/N)%N,c=key%N,
        nextBase=(b*N+c)*N;
      for(let v=0;v<N;v++){
        let score=item.score;
        for(let lane=0;lane<5;lane++){
          const V=values[lane], unit=encrypted[lane],
            aa=V[pos-3][a],bb=V[pos-2][b],
            cc=V[pos-1][c],dd=V[pos][v];
          score+= model.l4[((aa*N+bb)*N+cc)*N+dd];
          score+=0.4*(unit.begins[pos]*model.ls[dd] +
            unit.ends[pos]*model.lf[dd]);
        }
        const next=nextBase+v;
        if(score>stateScore[next]){
          stateScore[next]=score;
          parentIndex[next]=pi;
        }
      }
    }
    const nextIndices=[];
    for(let i=0;i<N3;i++)if(stateScore[i]>-Infinity)nextIndices.push(i);
    nextIndices.sort((a,b)=>stateScore[b]-stateScore[a] || a-b);
    const prior=beam;
    beam=nextIndices.slice(0,BEAM).map(index=>({
      index,score:stateScore[index],parent:prior[parentIndex[index]],
      last:index%N
    }));
  }
  let node=beam[0],ref=[];
  while(node.parent){
    ref.push(node.last);
    node=node.parent;
  }
  ref.push(...node.seed.slice().reverse());
  ref.reverse();
  assert.equal(ref.length,W);
  const plaintext=values.map(V=>ref.map((x,i)=>V[i][x]));
  const pad=ref.map((x,i)=>mod(encrypted[0].tape[i]-x));
  for(let k=0;k<5;k++)
    for(let i=0;i<W;i++)
      assert.equal(mod(plaintext[k][i]+pad[i]),encrypted[k].tape[i]);
  return {scorePerRune:beam[0].score/(5*W),plaintext,pad,
    gap:beam[0].score-beam[1].score};
}

/** @param {number[]} tape */
function translit(tape) {
  return tape.map(i=>symbols[i]).join('');
}
/** @param {number[]} tape @param {number[]} starts */
function wordsAtSourceBreaks(tape, starts) {
  const out=[];
  let part='';
  for(let i=0;i<tape.length;i++){
    if(starts[i] && part){out.push(part);part='';}
    part+=symbols[tape[i]];
  }
  if(part)out.push(part);
  return out.join(' ');
}

/** xorshift32, fixed before evaluation. @param {number} seed */
function random(seed) {
  let x=seed>>>0;
  return()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;
  };
}
const randomOne=random(21501991);
/**
 * Native solved source text with its own authentic lexical boundaries. No
 * solved-section strings or word-edge flags are used to fit original input.
 */
const knownSections=known.sections.filter(item=>
  [...item.source_text].filter(ch=>gpm.has(ch)).length>=W).slice(0,5);
assert.equal(knownSections.length,5);
const referenceUnits=knownSections.map(section=>
  parseRuneWords([...section.source_text].map(ch=>
    gpm.has(ch)?ch:'-').join('')));
const offsets=[
  [50,100,20,180,240],
  [0,0,0,0,0],
  [90,220,50,400,600]
];
const plantedSets=offsets.map(group=>referenceUnits.map((source,lane)=>{
  const begin=group[lane];
  const end=begin+W;
  assert(source.tape.length>=end);
  return {
    tape:source.tape.slice(begin,end),
    begins:source.begins.slice(begin,end),
    ends:source.ends.slice(begin,end)
  };
}));
/** @param {{tape:number[],begins:number[],ends:number[]}[]} units
 * @param {boolean} shared
 */
function encryptedControl(units,shared) {
  const sharedPad=Array.from({length:W},()=>Math.floor(randomOne()*N));
  return units.map(unit=>{
    const pad=shared?sharedPad:
      Array.from({length:W},()=>Math.floor(randomOne()*N));
    const coded=unit.tape.map((x,i)=>mod(x+pad[i]));
    return {tape:coded,begins:unit.begins.slice(),
      ends:unit.ends.slice()};
  });
}
const model=trainModel();
const planted=plantedSets.map(unit=>({
  unit,
  decoded:recover(encryptedControl(unit,true),model)
}));
const negatives=Array.from({length:9},(_,j)=>recover(
  encryptedControl(plantedSets[j%plantedSets.length],false),model));
const found=recover(message,model);
const positives=planted.map(({unit,decoded},i)=>({
  case:i, scorePerRune:decoded.scorePerRune,
  exactOriginalRuneHits:decoded.plaintext.map((t,j)=>t.filter(
    (x,k)=>x===unit[j].tape[k]).length),
  exactTail50RuneHits:decoded.plaintext.map((t,j)=>t.slice(41).filter(
    (x,k)=>x===unit[j].tape[k+41]).length),
  decodedNativePrefix:i===0?
    decoded.plaintext.map(t=>translit(t.slice(0,38))):undefined
}));
const negativeScores=negatives.map(x=>x.scorePerRune);
console.log(JSON.stringify({
  status:'COMPLETE frozen five-unit source-original shared-pad plaintext attack',
  original:{runes:553,originalUnitLengths:original.map(x=>x.tape.length),
    originalUnitWords:original.map(x=>x.begins.filter(Boolean).length),
    reset:'first rune after printed red number 1..5',
    commonRuneCount:W,freeCipherPadDimensions:W,
    originalPunctuation:'unaltered literal dash/period and physical page-carry',
    heldoutRegion:'first91 common-rune interval, positions41..90 of each lane'},
  model:{trainingRunes:model.total,trainingWords:model.trainedWords,
    beamStates:BEAM,nGram:4,wordEdgePriorWeight:0.4},
  sourceNativeSharedPadPositives:{
    nativeSourceNames:knownSections.map(x=>x.name),
    tests:positives,
    minimumHeldoutAccuracy:Math.min(...positives.flatMap(x=>x.exactTail50RuneHits))/50},
  independentPadsControls:{
    tests:negativeScores,
    bestScore:Math.max(...negativeScores),
    worstScore:Math.min(...negativeScores),
    differenceFromOriginal:negativeScores.map(x=>found.scorePerRune-x)},
  originalFiveUnit:{
    scorePerRune:found.scorePerRune,
    complete91GP29RuneCandidates:found.plaintext.map(translit),
    originalWordBreakReadouts:found.plaintext.map((t,j)=>
      wordsAtSourceBreaks(t,message[j].begins)),
    heldoutLast50Readouts:found.plaintext.map(t=>translit(t.slice(41))),
    recoveredPadPrefix:found.pad.slice(0,29),
    originalForwardReplay:'455/455 exact modulo29 (necessary algebraic identity)'
  },
  interpretation:'A model-fit native phrase must be calibrated against independent-pad and solved-GP controls; round-trip alone is not decipherment.'
},null,2));
