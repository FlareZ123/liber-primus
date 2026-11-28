'use strict';
/**
 * Original-input evidence gate: the p27/p55 wing-page double-word bookend.
 * No plaintext recovered and no assumed cipher mechanism.
 * Run: node sims/agent47_p27_p55_insect_wing_doubleword_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const corrected=read('resources/transcriptions/lp2-image-corrected.txt');
const historical=read('resources/lp2-transcription.txt');
const runes=new Set(corpus.runes);
const original=corpus.pages.filter(p=>p.page<=55&&p.indices.length>0);
assert.equal(original.length,55,'p50 has no runic ciphertext');
const stringify=a=>a.join(',');
const unpack=s=>s.split(',').map(Number);
function parseWholeWords(tape){
  const sections=tape.split('%').map(raw=>({
    raw,values:[...raw].filter(x=>runes.has(x)).map(x=>corpus.runes.indexOf(x))
  }));
  const out=[];
  for(const p of original){
    const matches=sections.filter(s=>s.values.length===p.indices.length
      &&s.values.every((v,i)=>v===p.indices[i]));
    assert.equal(matches.length,1,'page must match exactly one original rune tape: '+p.page);
    // Physical source separators: hyphen, sentence period, ampersand,
    // dollar, section. Slash and whitespace are line wraps, not words.
    const words=matches[0].raw.replace(/\s|\//gu,'')
      .split(/[-.$&§]+/u)
      .map(s=>[...s].filter(r=>runes.has(r)).map(r=>corpus.runes.indexOf(r)))
      .filter(w=>w.length>0);
    assert.deepEqual(words.flat(),p.indices,'exact original word payload p'+p.page);
    out.push({page:p.page,words,indices:p.indices});
  }
  return out;
}
function motifAudit(pages){
  const types=new Map(),pairs=new Map(),global=[];
  let totalWords=0,totalPairWindows=0,overlappingWindows=0;
  for(const p of pages){
    const words=p.words;
    totalWords+=words.length;
    totalPairWindows+=Math.max(0,words.length-1);
    overlappingWindows+=Math.max(0,words.length-2);
    for(let k=0;k<words.length;k++){
      const v=stringify(words[k]),list=types.get(v)||[];
      list.push({page:p.page,word:k,length:words[k].length});
      types.set(v,list);
      if(k<words.length-1){
        const next=stringify(words[k+1]),name=v+'|'+next;
        const list=pairs.get(name)||[];
        list.push({page:p.page,word:k,
          lengths:[words[k].length,words[k+1].length]});
        pairs.set(name,list);
      }
    }
    for(let j=0;j<p.indices.length;j++)global.push({page:p.page,offset:j,rune:p.indices[j]});
  }
  const duplicatedPairs=[...pairs].filter(([k,positions])=>positions.length>1)
    .map(([key,positions])=>({key,positions}));
  return {types,pairs,duplicatedPairs,totalWords,totalPairWindows,
    overlappingWindows,global};
}
const printed=parseWholeWords(corrected),other=parseWholeWords(historical);
const audit=motifAudit(printed),otherAudit=motifAudit(other);
assert.equal(audit.totalWords,2928);
assert.equal(audit.totalPairWindows,2873);
assert.equal(audit.overlappingWindows,2818);
assert.equal(audit.types.size,2744);
assert.deepEqual(other.map(x=>x.words),printed.map(x=>x.words),
  'both independent transcriptions must preserve the same exact words');
assert.equal(audit.duplicatedPairs.length,1,'unique repeated full-word bigram');
const expectedWordA=[23,11,1],expectedWordB=[17,18,10];
const pairKey=stringify(expectedWordA)+'|'+stringify(expectedWordB);
assert.equal(audit.duplicatedPairs[0].key,pairKey);
assert.deepEqual(audit.duplicatedPairs[0].positions,[
  {page:27,word:5,lengths:[3,3]},
  {page:55,word:15,lengths:[3,3]}
]);
assert.deepEqual(audit.types.get(stringify(expectedWordA)).map(x=>[x.page,x.word]),
  [[27,5],[55,15]]);
assert.deepEqual(audit.types.get(stringify(expectedWordB)).map(x=>[x.page,x.word]),
  [[27,6],[55,16]]);
const p27=printed.find(x=>x.page===27),p55=printed.find(x=>x.page===55);
assert.deepEqual(p27.indices.slice(28,34),expectedWordA.concat(expectedWordB));
assert.deepEqual(p55.indices.slice(70,76),expectedWordA.concat(expectedWordB));
assert.equal(p55.indices.length,76);
assert.equal(p27.indices.length,234);
assert.deepEqual(p55.words.slice(-2),[expectedWordA,expectedWordB]);
assert.equal(55-27,28,'physical pages separated by one half of 56 unsolved pages');

// Global longest repeated contiguous original-runic substring. This scan
// spans all 55 rune-bearing page tapes, avoiding postselection on the page pair.
function substrings(n){
  const seen=new Map(),repeats=new Map();
  for(let i=0;i<=audit.global.length-n;i++){
    const key=stringify(audit.global.slice(i,i+n).map(x=>x.rune));
    const a=seen.get(key);
    if(a!==undefined){
      if(!repeats.has(key))repeats.set(key,[a]);
      repeats.get(key).push(i);
    }else seen.set(key,i);
  }
  return repeats;
}
const repeat6=substrings(6),repeat7=substrings(7);
assert.equal(repeat6.size,1);
assert.equal(repeat7.size,0);
const onlySix=repeat6.get(stringify(expectedWordA.concat(expectedWordB)));
assert.ok(onlySix);
assert.deepEqual(onlySix.map(i=>[audit.global[i].page,audit.global[i].offset]),
 [[27,28],[55,70]]);
const countLength33=[...audit.pairs.values()].reduce((total,entries)=>{
  return total+entries.filter(e=>e.lengths[0]===3&&e.lengths[1]===3).length;
},0);
assert.equal(countLength33,182);

// Exact expectation under ONE completely specified null:
// randomly uniformly permute the 2,928 intact original word tokens among all
// printed word slots, preserving physical page word counts. No rune changes.
// Two pair positions can be disjoint (four independent slots) or overlap
// (three consecutive slots), requiring different multivariate hypergeometric
// expressions. Correctly handles repeated *individual* original word tokens.
const N=audit.totalWords,M=audit.totalPairWindows;
const overlapping=audit.overlappingWindows;
const disjoint=M*(M-1)/2-overlapping;
assert.equal(disjoint,4122810);
const fall=(n,k)=>{let v=1;for(let i=0;i<k;i++)v*=n-i;return v;};
function expectedDuplicatePair(typePredicate){
  const freq=[...audit.types.entries()]
    .filter(([s])=>typePredicate(unpack(s).length))
    .map(([,positions])=>positions.length);
  let S2=0,S2sq=0,S3=0,S4=0;
  for(const f of freq){
    const x=f*(f-1);
    S2+=x;S2sq+=x*x;
    S3+=f*(f-1)*(f-2);
    S4+=f*(f-1)*(f-2)*(f-3);
  }
  return {S2,S3,S4,S2sq,
    expectedDuplicatePairs:disjoint*(S2*S2-S2sq+S4)/fall(N,4)
      +overlapping*S3/fall(N,3)};
}
const allExpected=expectedDuplicatePair(()=>true);
const word3Expected=expectedDuplicatePair(len=>len===3);
assert.equal(allExpected.S2,560);
assert.equal(allExpected.S3,906);
assert.equal(word3Expected.S2,34);
assert.equal(word3Expected.S3,6);
assert.ok(Math.abs(allExpected.expectedDuplicatePairs-0.017462038560279537)<1e-12);
assert.ok(Math.abs(word3Expected.expectedDuplicatePairs-0.00006047973234410655)<1e-12);
const translit=a=>a.map(x=>corpus.translit[x]).join('');
const result={
  classification:'previously unreported exact crosspage original-cipher motif, not a decryption',
  originalJpegs:['resources/liber-primus/44.jpg (physical LP2 p27, wing)',
    'resources/liber-primus/72.jpg (physical LP2 p55, moth)'],
  originalSources:['resources/liber-primus/lp2-corpus.json',
    'resources/transcriptions/lp2-image-corrected.txt',
    'resources/lp2-transcription.txt'],
  parser:'page-local original rune words split only on - . $ & §, ignoring slash and whitespace wraps',
  corpus:{unknownRunePages:original.length,originalRunes:audit.global.length,
    printedWords:N,distinctWordTypes:audit.types.size,
    withinPageFullWordBigramWindows:M,physicalThreePlusThreePairs:countLength33},
  uniqueRepeatedWholeWordPair:{
    runes:expectedWordA.concat(expectedWordB).map(i=>corpus.runes[i]).join(''),
    numeric:expectedWordA.concat(expectedWordB),
    transliteration:translit(expectedWordA)+' '+translit(expectedWordB),
    originalSpelling:expectedWordA.map(i=>corpus.runes[i]).join('')+'-'+
      expectedWordB.map(i=>corpus.runes[i]).join(''),
    positions:audit.duplicatedPairs[0].positions,
    runeOffsets:[{page:27,start:28,endExclusive:34},
      {page:55,start:70,endExclusive:76,terminal:true}],
    physicalPageSeparation:28,
    copiesOfFirstWord:audit.types.get(stringify(expectedWordA)).length,
    copiesOfSecondWord:audit.types.get(stringify(expectedWordB)).length
  },
  completeWordPairDuplicateTypes:audit.duplicatedPairs.length,
  globalLongestRepeatedSubstring:{runes:6,typesAt6:repeat6.size,typesAt7:repeat7.size},
  exactWholeWordShuffleNull:{
    condition:'same multiset of exactly printed whole words and same page word counts; exchangeable token ordering',
    pairWindows:M,overlappingPairs:overlapping,disjointPairs:disjoint,
    expectedIdenticalPairCollisionsAnyLength:allExpected.expectedDuplicatePairs,
    expectedIdenticalPairCollisionsBothWordsLength3:word3Expected.expectedDuplicatePairs,
    note:'Markov upper bounds on at least one duplicate under this model; NOT post-discovery Cicada-intent p-values'
  },
  interpretation:'A literal two-word cross-page ciphertext match uniquely links a wing-illustrated page near its start and the moth-illustrated terminal page at its end. This is a high-priority fixed original-cipher clue for an independently chosen operation, NOT plaintext/key, and imagery/28-page spacing were noticed after the match.'
};
console.log(JSON.stringify(result,null,2));
if(process.env.RUNNER_TEMP)
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),
  JSON.stringify(result,null,2));
