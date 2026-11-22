'use strict';
// Fixed, source-reproducible p22 three-rail fence test.
// Run from repository root: node sims/lp2_p22_three_rail_fence_sft.cjs
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const transcription=fs.readFileSync('resources/lp2-transcription.txt','utf8').split('%');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const reference=fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt','utf8');
const image=fs.readFileSync('resources/liber-primus/39.jpg');
const imageBlobSha1=crypto.createHash('sha1').update(Buffer.from('blob '+image.length+'\0','ascii')).update(image).digest('hex');
assert.equal(image.length,512143);
assert.equal(imageBlobSha1,'0270e099f35a00dc24a9dc673ce13d4a0a843802');
const runeRegex=/[ᚠ-᛿]/gu;
const runeStream=s=>(s.match(runeRegex)||[]).join('');
const wordRuns=s=>s.split('-').map(runeStream).filter(Boolean);
const pages=transcription;
assert.equal(pages.length,57);
const p22= runeStream(pages[22]);
const chapterPages=pages.slice(15,23);
const chapter=runeStream(chapterPages.join('%'));
const p22Words=wordRuns(pages[22]);
const chapterWords=chapterPages.flatMap(wordRuns);
const p22LineRuneCounts=pages[22].split(/\r?\n/u).map(runeStream).filter(Boolean).map(x=>x.length);
const chapterPageRuneCounts=chapterPages.map(runeStream).map(x=>x.length);
const alphabet=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index}));
alphabet.push({token:'ing',index:corpus.translit.indexOf('NG')});
alphabet.sort((a,b)=>b.token.length-a.token.length);
function encodeWords(text){
  const words=text.match(/[A-Za-z]+/gu)||[];let out='',bad=[];
  for(const word0 of words){
    const word=word0.toLowerCase().replace(/v/g,'u').replace(/k/g,'c').replace(/z/g,'s');
    let encoded='',i=0;
    while(i<word.length){
      const hit=alphabet.find(x=>word.startsWith(x.token,i));
      if(!hit){bad.push(word0);encoded='';break;}
      encoded+=corpus.runes[hit.index];i+=hit.token.length;
    }
    if(encoded)out+=encoded;
  }
  return {out,bad,wordCount:words.length};
}
const controlLines=reference.split(/\r?\n/u).filter(line=>
  !line.startsWith('#')&&!line.startsWith('[')&&
  !/^[0-9a-f]{32,}$/i.test(line.trim())&&!/^\s*\d/u.test(line)
);
const controlResult=encodeWords(controlLines.join(' '));
const p56Section=reference.split('### 56')[1].split('### 57')[0]
  .split(/\r?\n/u).filter(line=>!/^[0-9a-f]{32,}$/i.test(line.trim())).join(' ');
const p57Section=reference.split('### 57')[1];
const p56=encodeWords(p56Section),p57=encodeWords(p57Section);
function railEncrypt(input,rails=3){
  const rows=Array.from({length:rails},()=>[]);let row=0,direction=1;
  for(const rune of input){
    rows[row].push(rune);
    if(row===0)direction=1;else if(row===rails-1)direction=-1;
    row+=direction;
  }
  return rows.flat().join('');
}
function railDecrypt(input,rails=3){
  const pattern=[];let row=0,direction=1;
  for(let i=0;i<input.length;i++){
    pattern.push(row);
    if(row===0)direction=1;else if(row===rails-1)direction=-1;
    row+=direction;
  }
  const counts=Array(rails).fill(0);for(const rail of pattern)counts[rail]++;
  const chunks=[];let offset=0;
  for(const count of counts){chunks.push([...input.slice(offset,offset+count)]);offset+=count;}
  const cursors=Array(rails).fill(0);
  return pattern.map(rail=>chunks[rail][cursors[rail]++]).join('');
}
function translit(input){
  return [...input].map(rune=>{
    const index=corpus.runes.indexOf(rune);assert.notEqual(index,-1);
    return corpus.translit[index];
  }).join('');
}
function stats(input){
  const counts=Array(29).fill(0),n=input.length;
  for(const rune of input){const index=corpus.runes.indexOf(rune);assert.notEqual(index,-1);counts[index]++;}
  return {n,ioc:counts.reduce((sum,count)=>sum+count*(count-1),0)/(n*(n-1)),
    top12Mass:counts.slice().sort((a,b)=>b-a).slice(0,12).reduce((a,b)=>a+b,0)/n,counts};
}
const control=controlResult.out;
const bigrams=new Map();let pairTotal=0;
for(let i=0;i<control.length-1;i++){
  const pair=control.slice(i,i+2);bigrams.set(pair,(bigrams.get(pair)||0)+1);pairTotal++;
}
function bigramScore(input){
  let sum=0;
  for(let i=0;i<input.length-1;i++){
    const count=bigrams.get(input.slice(i,i+2))||0;
    sum+=Math.log((count+0.1)/(pairTotal+0.1*841));
  }
  return sum/(input.length-1);
}
function controlWindowScores(length){
  const scores=[];
  for(let i=0;i+length<=control.length;i++)scores.push(bigramScore(control.slice(i,i+length)));
  return scores.sort((a,b)=>a-b);
}
function controlWindows(length){
  const scores=controlWindowScores(length);
  return {count:scores.length,min:scores[0],p01:scores[Math.floor(scores.length*0.01)],
    median:scores[Math.floor(scores.length*0.5)],max:scores[scores.length-1]};
}
function evaluate(scope,input){
  const zigzag=railEncrypt(input,3),inverse=railDecrypt(input,3),scores=controlWindowScores(input.length);
  const windows=controlWindows(input.length);
  const zigzagScore=bigramScore(zigzag),inverseScore=bigramScore(inverse);
  const zigzagPercentile=scores.filter(x=>x<=zigzagScore).length/scores.length;
  const inversePercentile=scores.filter(x=>x<=inverseScore).length/scores.length;
  const bothBelowMinimumControlWindow=zigzagScore<windows.min&&inverseScore<windows.min;
  assert(bothBelowMinimumControlWindow,'three-rail output no longer falls below all source-native control windows');
  return {
    scope,inputRunes:input,inputTranslit:translit(input),
    zigzagThenRowwiseRunes:zigzag,zigzagThenRowwiseTranslit:translit(zigzag),
    inverseConventionRunes:inverse,inverseConventionTranslit:translit(inverse),
    exactForwardReencryption:{
      inverseOfZigzagThenRowwise:railDecrypt(zigzag,3)===input,
      zigzagThenRowwiseOfInverse:railEncrypt(inverse,3)===input
    },
    unigramStats:{input:stats(input),zigzagThenRowwise:stats(zigzag),inverseConvention:stats(inverse)},
    sourceNativeBigramScore:{
      controlWindowDistribution:windows,zigzagThenRowwise:zigzagScore,
      inverseConvention:inverseScore,zigzagPercentile,inversePercentile,
      bothBelowMinimumControlWindow
    }
  };
}
assert.equal(p22.length,131);
assert.equal(p22Words.length,25);
assert.deepEqual(p22LineRuneCounts,[22,24,23,23,19,20]);
assert.equal(chapter.length,1903);
assert.equal(chapterWords.length,421);
assert.equal(chapterWords.filter(w=>w.length===1).length,18);
assert.deepEqual(chapterPageRuneCounts,[159,267,273,260,271,269,273,131]);
assert.equal(p56.out.length,85);
assert.equal(p57.out.length,95);
assert.equal(control.length,3083);
assert.equal(controlResult.wordCount,761);
assert.equal(controlResult.bad.length,0);
const output={
  source:{p22Image:'resources/liber-primus/39.jpg',p22ImageBytes:image.length,p22ImageGitBlobSha1:imageBlobSha1,
    transcription:'resources/lp2-transcription.txt',plaintextControl:'resources/liber-primus/lp1-plaintext-reference.txt',
    p22RuneLines:p22LineRuneCounts,p22WordLengths:p22Words.map(w=>w.length),
    chapterPages:[15,16,17,18,19,20,21,22],chapterPageRuneCounts,
    chapterWordRuns:chapterWords.length,chapterSingletonWords:chapterWords.filter(w=>w.length===1).length},
  parameters:{rails:3,transposition:'continuous rune stream; hyphen word boundaries and punctuation excluded; no per-word, per-line, offset, or alternate rail-count variants'},
  sourceNativeControls:{encoding:'longest GP29 transliteration match with source-attested ING alias to NG rune; normalize V->U, K->C, Z->S',
    controlWords:controlResult.wordCount,controlRunes:control.length,controlIoC:stats(control).ioc,
    controlTop12Mass:stats(control).top12Mass,p56Runes:p56.out.length,p56IoC:stats(p56.out).ioc,
    p57Runes:p57.out.length,p57IoC:stats(p57.out).ioc},
  p22:evaluate('p22',p22),chapter_p15_p22:evaluate('complete p15-22 visual chapter',chapter)
};
console.log(JSON.stringify(output,null,2));
