'use strict';
/**
 * Exact 2014 period-seven historical permutation transferred to original
 * LP2 word units and tested by the cipher-independent word-length channel.
 * The 2014 solve is an independent positive, not an LP2 instruction.
 * Node.js 22, CommonJS, no third-party packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadWords} = require('./word_partition_invariant.cjs');
const ROOT = path.resolve(__dirname, '..');
const FORWARD = [0,4,2,6,5,3,1];
const INVERSE = [0,6,2,5,1,4,3];
const HISTORICAL = {
  ciphertext:'TLBEIEOVUTHTREIDTSEOSTPOSOYRSLBTIIIYT4DGUQIMNU442I15339M',
  plaintext:'TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133'
};

/** @template T @param {T[][]} groups @param {number[]} permutation @returns {T[][]} */
function reorder(groups, permutation) {
  return groups.map(group => {
    const result=[];
    for(let offset=0;offset<group.length;offset+=7) {
      const block=group.slice(offset,offset+7);
      result.push(...(block.length===7?permutation.map(i=>block[i]):block));
    }
    return result;
  });
}

/** @param {number[]} lengths @returns {number} */
function chiSquare(lengths) {
  const table=Array.from({length:3},()=>[0,0,0]),rows=[0,0,0],cols=[0,0,0];
  const bin=n=>n<=2?0:n<=5?1:2;
  for(let i=1;i<lengths.length;i++) {
    const a=bin(lengths[i-1]),b=bin(lengths[i]);
    table[a][b]++;rows[a]++;cols[b]++;
  }
  let result=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++) {
    const expected=rows[i]*cols[j]/(lengths.length-1);
    result+=(table[i][j]-expected)**2/expected;
  }
  return result;
}

/** @param {number[][]} groups @returns {object} */
function evaluate(groups) {
  const all=groups.flat();
  return {
    baseline:chiSquare(all),
    globalInverse:chiSquare(reorder([all],INVERSE).flat()),
    globalForward:chiSquare(reorder([all],FORWARD).flat()),
    sectionInverse:chiSquare(reorder(groups,INVERSE).flat()),
    sectionForward:chiSquare(reorder(groups,FORWARD).flat())
  };
}

/** @param {number} seed @returns {()=>number} */
function randomGenerator(seed) {
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
}

/** @param {number[][]} groups @param {()=>number} random */
function shuffleWithinSections(groups,random) {
  return groups.map(group=>{
    const copy=group.slice();
    for(let i=copy.length-1;i>0;i--) {
      const j=Math.floor(random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  });
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  const pairs=new Set(['TH','NG','EO','OE','AE','IA','EA']);
  let count=0;
  for(let i=0;i<word.length;i++,count++)if(pairs.has(word.slice(i,i+2)))i++;
  return count;
}

function main() {
  const plain=HISTORICAL.plaintext.split('');
  const cipher=HISTORICAL.ciphertext.split('');
  assert.equal(plain.length,56);
  assert.deepEqual(reorder([plain],FORWARD).flat(),cipher);
  assert.deepEqual(reorder([cipher],INVERSE).flat(),plain);

  const words=loadWords().cipher.map(word=>word.length);
  const transcript=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8');
  const runes=new Set(JSON.parse(fs.readFileSync(
    path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).runes);
  // The eight actual ciphertext section separators are dollar signs in
  // the canonical source; the historical master contains extra subdivisions.
  const sections=transcript.split('
  assert.deepEqual(sections,[158,255,385,435,224,326,378,735]);
  assert.equal(words.length,2896);
  let off=0;
  const originalGroups=sections.map(n=>{const group=words.slice(off,off+n);off+=n;return group;});
  assert.equal(off,words.length);
  const original=evaluate(originalGroups);
  assert(Math.abs(original.baseline-3.949446088360591)<1e-8);
  const maxOriginal=Math.max(original.globalInverse,original.globalForward,
    original.sectionInverse,original.sectionForward);

  const random=randomGenerator(0x1736254);
  const samples=Array.from({length:600},()=>{
    const trial=evaluate(shuffleWithinSections(originalGroups,random));
    return Math.max(trial.globalInverse,trial.globalForward,
      trial.sectionInverse,trial.sectionForward);
  }).sort((a,b)=>a-b);
  const exceeded=samples.filter(v=>v>=maxOriginal).length;

  const shakespeare=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8')
    .toUpperCase().match(/[A-Z]+/g).map(gpLength);
  let at=4000;
  const native=sections.map(n=>{const group=shakespeare.slice(at,at+n);at+=n;return group;});
  const scrambled=reorder(native,FORWARD);
  const recovered=reorder(scrambled,INVERSE);
  assert.deepEqual(recovered,native);
  const nativeChi=chiSquare(native.flat());
  const scrambledChi=chiSquare(scrambled.flat());
  assert(nativeChi>scrambledChi*5);

  const report={
    historicalPositive:{key:'1736254',forward:FORWARD,inverse:INVERSE,charactersRecovered:56},
    lp2:{words:words.length,sectionWordCounts:sections,original,maxOverFour:maxOriginal},
    null:{repetitions:samples.length,min:samples[0],median:samples[300],
      p95:samples[570],max:samples[599],exceeded,
      familywiseUpperTail:(exceeded+1)/(samples.length+1)},
    independentShakespearePlant:{words:native.flat().length,nativeChi,scrambledChi,
      recoveredChi:chiSquare(recovered.flat()),allWordsExactlyRecovered:true},
    decision:'The source-authentic 2014 seven-position word permutation does not restore detectable natural-language length dependence in LP2.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={reorder,chiSquare,evaluate,gpLength,main};
).slice(0,8).map(part=>part
    .replace(/\/\s*\n/g,'').replace(/%\s*/g,'')
    .split(/[-.\s&]+/).map(token=>[...token].filter(ch=>runes.has(ch)).length)
    .filter(Boolean).length);
  assert.deepEqual(sections,[158,255,385,435,224,326,378,735]);
  assert.equal(words.length,2896);
  let off=0;
  const originalGroups=sections.map(n=>{const group=words.slice(off,off+n);off+=n;return group;});
  assert.equal(off,words.length);
  const original=evaluate(originalGroups);
  assert(Math.abs(original.baseline-3.949446088360591)<1e-8);
  const maxOriginal=Math.max(original.globalInverse,original.globalForward,
    original.sectionInverse,original.sectionForward);

  const random=randomGenerator(0x1736254);
  const samples=Array.from({length:600},()=>{
    const trial=evaluate(shuffleWithinSections(originalGroups,random));
    return Math.max(trial.globalInverse,trial.globalForward,
      trial.sectionInverse,trial.sectionForward);
  }).sort((a,b)=>a-b);
  const exceeded=samples.filter(v=>v>=maxOriginal).length;

  const shakespeare=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8')
    .toUpperCase().match(/[A-Z]+/g).map(gpLength);
  let at=4000;
  const native=sections.map(n=>{const group=shakespeare.slice(at,at+n);at+=n;return group;});
  const scrambled=reorder(native,FORWARD);
  const recovered=reorder(scrambled,INVERSE);
  assert.deepEqual(recovered,native);
  const nativeChi=chiSquare(native.flat());
  const scrambledChi=chiSquare(scrambled.flat());
  assert(nativeChi>scrambledChi*5);

  const report={
    historicalPositive:{key:'1736254',forward:FORWARD,inverse:INVERSE,charactersRecovered:56},
    lp2:{words:words.length,sectionWordCounts:sections,original,maxOverFour:maxOriginal},
    null:{repetitions:samples.length,min:samples[0],median:samples[300],
      p95:samples[570],max:samples[599],exceeded,
      familywiseUpperTail:(exceeded+1)/(samples.length+1)},
    independentShakespearePlant:{words:native.flat().length,nativeChi,scrambledChi,
      recoveredChi:chiSquare(recovered.flat()),allWordsExactlyRecovered:true},
    decision:'The source-authentic 2014 seven-position word permutation does not restore detectable natural-language length dependence in LP2.'
  };
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)main();
module.exports={reorder,chiSquare,evaluate,gpLength,main};
