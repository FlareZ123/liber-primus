// LP2 p39 / p50 R238: complete secret period-16 Caesar-key inversion attempt.
// Reads original sourced GP29 runes, numeric panel, and independent native texts.
// No CLI args; execute under Node 22 from the repository, or the generic manual SFT workflow.
// Copyright / licenses remain with source corpus owners; do not redistribute source text.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {any} */
const json = filename => JSON.parse(fs.readFileSync(path.join(root, filename), 'utf8'));
const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const solved = json('resources/external/relikd-solved-gp29-native-v1.json');
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const mod = n => (n % 29 + 29) % 29;
assert.equal(corpus.pages[39].indices.length, 240);
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), [27, 5, 15]);
const F16 = [13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1];
const remainder = grid.bytes.slice(1).reverse().map(n => mod(-n));
const quotient = Array(239).fill(0);
for (let i = 238; i >= 0; i--) {
  const value = remainder[i + 16];
  quotient[i] = value;
  for (let j = 0; j < F16.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - value * F16[j]);
  }
}
assert.ok(remainder.every(x => x === 0));
const receiver = corpus.pages[39].indices.slice(1, -1);
const Q238 = quotient.slice(0, -1).reverse();
const residual = receiver.map((x, i) => mod(x - 5 * Q238[i]));
const vocab = corpus.translit.map((text, index) => ({ text, index }))
  .sort((a,b) => b.text.length - a.text.length);
/** @param {string} input @returns {number[]} */
function englishToGP(input) {
  const out = [];
  const s = input.toUpperCase().replaceAll('K','C')
    .replaceAll('V','U').replaceAll('Q','C').replaceAll('Z','S');
  let i = 0;
  while (i < s.length) {
    const candidate = vocab.find(x => s.startsWith(x.text, i));
    if (candidate) { out.push(candidate.index); i += candidate.text.length; }
    else i++;
  }
  return out;
}
/** @param {string} input @returns {number[]} */
function runeToGP(input) {
  return Array.from(input).filter(x => solved.runes.includes(x))
    .map(x => solved.runes.indexOf(x));
}
assert.deepEqual(solved.runes, corpus.runes);
const excluded = new Set(['0_loss_of_divinity','p56_an_end','p57_parable']);
const nativeTrain = solved.sections.filter(x => !excluded.has(x.name))
  .flatMap(x => runeToGP(x.source_text));
const shakespeareTrain = englishToGP(shakespeare);
const unigrams = Array(29).fill(1);
const triplets = new Uint32Array(29 ** 3);
const quads = new Uint32Array(29 ** 4);
/** @param {number[]} tape @param {number} weight */
function train(tape, weight) {
  for (const k of tape) unigrams[k] += weight;
  for (let i = 0; i + 3 < tape.length; i++) {
    const t = (tape[i]*29 + tape[i+1])*29 + tape[i+2];
    triplets[t] += weight;
    quads[t*29 + tape[i+3]] += weight;
  }
}
train(shakespeareTrain, 1);
train(nativeTrain, 16);
const log4 = new Float32Array(29 ** 4);
for (let t=0; t<triplets.length; t++) {
  const denom = triplets[t] + 29 * 0.35;
  for (let x=0; x<29; x++) {
    log4[t*29+x] = Math.log((quads[t*29+x] + 0.35) / denom);
  }
}
/** @param {number[]} p @param {number} i @returns {number} */
const gram = (p,i) => log4[((p[i]*29+p[i+1])*29+p[i+2])*29+p[i+3]];
/** @param {number[]} p @returns {number} */
function totalScore(p) {
  let s=0;
  for(let i=0; i+3<p.length; i++) s+=gram(p,i);
  return s;
}
const unigramTotal=unigrams.reduce((a,b)=>a+b,0);
const unigramLog=unigrams.map(x=>Math.log(x/unigramTotal));
// Exact original printed GP-F exception for mask 1 (first of four Fs).
// Authentic p56 selectively skips F while preserving GF29 ordinary operation.
const literalFPosition=42;
assert.equal(receiver[literalFPosition],0);
const phaseMap=Array(238).fill(-1);
const phaseGroups=Array.from({length:16},()=>[]);
let nativeKeyClock=0;
for(let i=0;i<238;i++)if(i!==literalFPosition){
  const phase=nativeKeyClock++%16;
  phaseMap[i]=phase;
  phaseGroups[phase].push(i);
}
const affected=phaseGroups.map(indices=>{
  const starts=new Set();
  for(const i of indices)for(let j=Math.max(0,i-3);j<=Math.min(234,i);j++)
    starts.add(j);
  return [...starts];
});
/** @param {number[]} cipher @returns {number[]} */
const peelQ=cipher=>cipher.map((x,i)=>
  i===literalFPosition?0:mod(x-5*Q238[i]));
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encryptWithSourceFMask(plain,key){
  return plain.map((x,i)=>i===literalFPosition?0:
    mod(x+key[phaseMap[i]]+5*Q238[i]));
}

let state=0x6c703339;
/** @returns {number} Deterministic xorshift32 output in [0,1). */
function random() {
  state ^= state<<13;
  state ^= state>>>17;
  state ^= state<<5;
  return (state>>>0)/4294967296;
}
/** @param {number[]} cipher @param {number} restarts @param {number} iterations */
function crack(cipher, restarts, iterations) {
  assert.equal(cipher.length,238);
  assert.equal(cipher[literalFPosition],0);
  const frequencyGuess=Array.from({length:16},(_,phase)=>{
    let best=-Infinity,value=0;
    for(let key=0;key<29;key++){
      let score=0;
      for(const i of phaseGroups[phase])score+=unigramLog[mod(cipher[i]-key)];
      if(score>best){best=score;value=key;}
    }
    return value;
  });
  let champion={score:-Infinity,key:[],plain:[],restart:-1};
  for(let restart=0;restart<restarts;restart++){
    const key=restart===0?frequencyGuess.slice()
      :restart%3===0?Array.from({length:16},()=>Math.floor(random()*29))
      :frequencyGuess.map(k=>random()<0.40?Math.floor(random()*29):k);
    const plain=cipher.map((x,i)=>i===literalFPosition?0:mod(x-key[phaseMap[i]]));
    let score=totalScore(plain);
    for(let j=0;j<iterations;j++){
      const phase=Math.floor(random()*16),candidate=Math.floor(random()*29);
      if(candidate===key[phase])continue;
      let before=0,after=0;
      for(const i of affected[phase])before+=gram(plain,i);
      const old=[];
      for(const i of phaseGroups[phase]){old.push(plain[i]);plain[i]=mod(cipher[i]-candidate);}
      for(const i of affected[phase])after+=gram(plain,i);
      const delta=after-before,temp=0.07+1.2*(1-j/iterations)**1.4;
      if(delta>=0||random()<Math.exp(delta/temp)){
        key[phase]=candidate;score+=delta;
      }else{for(let i=0;i<phaseGroups[phase].length;i++)plain[phaseGroups[phase][i]]=old[i];}
    }
    if(score>champion.score)champion={score,key:key.slice(),plain:plain.slice(),restart};
  }
  return champion;
}
const plantedOriginal=runeToGP(solved.sections.find(x=>
  x.name==='0_loss_of_divinity').source_text).slice(428,666);
assert.equal(plantedOriginal.length,238);
assert.equal(plantedOriginal[literalFPosition],0);
const plantedKey=Array.from({length:16},(_,i)=>mod(11+7*i));
const plantedCipher=encryptWithSourceFMask(plantedOriginal,plantedKey);
const restored=crack(peelQ(plantedCipher),130,4400);
assert.deepEqual(restored.plain,plantedOriginal);
assert.deepEqual(restored.key,plantedKey);
const observedInput=peelQ(receiver);
const real=crack(observedInput,130,4400);
assert.deepEqual(encryptWithSourceFMask(real.plain,real.key),receiver);

const donorScores=[];
for(const section of solved.sections){
  const runeText=runeToGP(section.source_text);
  const stride=Math.max(1,Math.floor((runeText.length-238)/10));
  for(let i=0;i+238<=runeText.length;i+=stride){
    donorScores.push(totalScore(runeText.slice(i,i+238)));
  }
}
assert.equal(donorScores.length,44);
assert.ok(restored.score>-600);
assert.ok(real.score<-600);
assert.ok(Math.min(...donorScores)>-600);
const report={
  case:'original p39 R238 red5 16 unknown key, p56 authentic 29-valued selective literal-F first-position mask',
  originalReceiverRuneCount:238,
  originalResidualScore:totalScore(observedInput),
  originalLiteralFPosition:literalFPosition,
  sourceNativePlantOffset:428,
  originalBestScore:real.score,
  originalBestKey:real.key,
  originalBestTransliteration:real.plain.map(x=>corpus.translit[x]).join(''),
  solvedNativeDonorCount:donorScores.length,
  nativeDonorScoreRange:[Math.min(...donorScores),Math.max(...donorScores)],
  heldoutNativePlant:{
    originalRuneCount:238, trueScore:totalScore(plantedOriginal),
    recoveredScore:restored.score, keyCorrect:16,
    plaintextCorrect:238
  },
  trainingCounts:{shakespeareGP:shakespeareTrain.length,nativeGP:nativeTrain.length},
  randomSeed:'0x6c703339',
  annealing:{restarts:130,iterationsPerRestart:4400}
};
console.log(JSON.stringify(report,null,2));
