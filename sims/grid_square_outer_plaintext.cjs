'use strict';
/**
 * Direct 29! outer-alphabet inversion of the BEST cross-clue, equality-selected
 * AES/ChaCha key. Fit an exact Hungarian alphabet mapping on the first 800
 * ciphertext runes of each section and evaluate locked plaintext likelihood
 * against held-out section tails.
 *
 * Reproduce: node sims/grid_square_outer_plaintext.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inputs, cipherBytes } = require('./grid_section_column_keys.cjs');
const { candidateIVs } = require('./grid_square_iv_keys.cjs');
const { search } = require('./grid_square_outer_equality.cjs');
const { words, flatten, training, fit, category } = require('./outer_permutation_word_context.cjs');
const { encodeEnglish } = require('./outer_permutation_assignment.cjs');

const ROOT = path.join(__dirname, '..');
const RUNES = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const DICT = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const RINDEX = new Map(RUNES.map((r,i) => [r,i]));
const HEAD = 800;
const MOD = 29, mod = v => (v % MOD + MOD) % MOD;

/** @returns {{words:number[][][], classes:string[][]}} */
function sectionWords() {
  const master = fs.readFileSync(path.join(ROOT, 'resources/transcriptions/liber_primus_master.txt'), 'utf8');
  const begin = master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ');
  assert.ok(begin > 0);
  const unsolved = master.slice(begin).split('%').slice(0,56).join('%');
  const raw = unsolved.split('$').map(s => s.split(/[-.&§]/)
    .map(w => [...w].filter(c => RINDEX.has(c)).map(c => RINDEX.get(c)))
    .filter(w => w.length)).filter(group => group.length);
  assert.equal(raw.length, 9);
  const groups = [raw[0],raw[1],raw[2],raw[3].concat(raw[4]),
    raw[5],raw[6],raw[7],raw[8]];
  const classes = groups.map(group => group.flatMap(word =>
    word.map((_, j) => category(word.length,j))));
  const numeric = groups.map(group => group.flat());
  assert.deepEqual(numeric.map(p=>p.length),[729,1145,1729,1903,1021,1524,1589,3316]);
  assert.equal(raw.flat(2).length,12956);
  return { words: groups, classes };
}

/** @param {number[][]} groups @param {number[][]} cols @param {ReturnType<typeof search>} selected */
function keyFromWinner(groups,cols,selected) {
  const iv = candidateIVs().find(x => x.name === selected.iv).iv;
  return groups.map((c,section) => {
    const source=cols[selected.assignment[section]];
    const raw=cipherBytes(selected.reverse?source.slice().reverse():source,
      selected.algorithm,c.length,iv);
    return Array.from(raw,b=>{
      const n=selected.scaled?Math.floor(MOD*b/256):b%MOD;
      return mod(selected.sign*n);
    });
  });
}

/** @param {number[][]} cipher @param {number[][]} pads @param {string[][]} contexts @param {ReturnType<typeof training>} model */
function recover(cipher,pads,contexts,model) {
  const trainCipher = cipher.flatMap(c=>c.slice(0,HEAD));
  const trainKeys = pads.flatMap(k=>k.slice(0,HEAD));
  const trainContexts = contexts.flatMap(c=>c.slice(0,HEAD));
  const matched=fit(trainCipher,trainKeys,trainContexts,model);
  let holdout=0,holdoutN=0,correct=0;
  const samples=[];
  const decodedPages=cipher.map((group,section)=>{
    const plain=group.map((c,i)=>mod(matched.inverse[c]-pads[section][i]));
    let ll=0,n=0;
    for(let i=HEAD;i<plain.length;i++) {
      const p=model.logProb[contexts[section][i]]||model.prior.map(Math.log);
      ll+=p[plain[i]];
      n++;
    }
    holdout+=ll;
    holdoutN+=n;
    if (section<8) samples.push({section,preview:plain.slice(0,100).map(x=>DICT[x]).join(' '),
      heldoutMean:n?ll/n:null});
    return plain;
  });
  return {
    fittedAlphabet:matched.inverse, training:matched.score, trainingMean:matched.score/trainCipher.length,
    holdout, holdoutN, holdoutMean:holdout/holdoutN,
    sectionSamples:samples, decodedPages
  };
}

/** @param {string} source @param {number[]} lengths */
function plantEnglish(source,lengths) {
  const raw=words(source);
  const groupWords=[],groups=[],classes=[],wanted=lengths.reduce((a,b)=>a+b,0);
  const flat=flatten(raw).values;
  assert.ok(flat.length>=wanted);
  let cursor=0;
  for (const length of lengths) {
    const out=flat.slice(cursor,cursor+length);
    cursor+=length;
    groups.push(out);
    classes.push(Array.from({length},()=> 'middle')); // deliberately conservative unigram fallback
    groupWords.push(out);
  }
  return {groups,classes,groupWords};
}

/** @param {number} seed */
function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}}

function main() {
  const { groups, columnKeys }=inputs();
  const text = fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const corpus = words(text);
  const model=training(flatten(corpus.slice(600,50000)));
  const parsed=sectionWords();
  assert.deepEqual(parsed.words.map(x=>x.flat()),groups);
  const selected=search(groups,columnKeys,candidateIVs());
  const pads=keyFromWinner(groups,columnKeys,selected);
  const actual=recover(groups,pads,parsed.classes,model);
  console.log('ACTUAL',JSON.stringify({selected, training:actual.trainingMean,
    heldout:actual.holdoutMean, decoded:actual.sectionSamples,
    recoveredAlphabet:actual.fittedAlphabet}));

  const controlEnglish=plantEnglish(text.slice(0,175000),groups.map(g=>g.length));
  const plantedIV=candidateIVs().find(x=>x.name==='spiral-prime-complement-mod256').iv;
  const plantedPads=groups.map((c,section)=>Array.from(cipherBytes(columnKeys[section],
    'aes-256-ctr',c.length,plantedIV),b=>b%MOD));
  const rand=random(0x451ac557),sigma=Array.from({length:MOD},(_,i)=>i);
  for(let i=MOD-1;i>0;i--){const j=rand()%(i+1);[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
  let repairs=0;
  const plantedCipher=controlEnglish.groups.map((g,section)=>{
    const ct=g.map((p,i)=>sigma[mod(p+plantedPads[section][i])]);
    for(let i=1;i<ct.length;i++){
      if(ct[i]===ct[i-1] && rand()/2**32<0.81){ct[i]=mod(ct[i]+1+rand()%28);repairs++;}
    }
    return ct;
  });
  const matched=recover(plantedCipher,plantedPads,controlEnglish.classes,model);
  const exact=matched.fittedAlphabet.filter((v,c)=>sigma[v]===c).length;
  const correct=matched.decodedPages.flat().filter((v,i)=>v===controlEnglish.groups.flat()[i]).length;
  assert.equal(exact,MOD);
  assert.ok(correct>=Math.floor(0.95*groups.flat().length));
  console.log('PLANT',JSON.stringify({outerPermutationRecovered:exact,
    rewrittenSymbols:repairs, plaintextCorrect:correct,
    total:groups.flat().length,holdoutMean:matched.holdoutMean,
    trainingMean:matched.trainingMean}));
}
if(require.main===module)main();
module.exports={sectionWords,keyFromWinner,recover,plantEnglish};
