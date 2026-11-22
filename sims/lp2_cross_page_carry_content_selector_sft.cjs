#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const carryCsv = read('im-results/lp2-all-32-cross-page-word-boundaries.csv');
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const runeSet = new Set(corpus.runes);
const runeIndex = new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts = transcription.split(/^%$/m);
const sourcePages = [];
for(let page=0;page<=55;page+=1) {
  if(page===50) continue;
  sourcePages.push({page,body:parts[page<50?page:page-1]||''});
}

let globalRune=0;
let currentWord=[];
let wordStart=0;
const completeWords=[];
const lineBreaks=[];
const pageRuneCounts=new Map();
const pageLineCounts=new Map();

function finishWord() {
  if(!currentWord.length) return;
  completeWords.push({
    start:wordStart,end:globalRune,length:globalRune-wordStart,
    values:currentWord.slice()
  });
  currentWord=[];
}

for(const {page,body} of sourcePages) {
  let line=1;
  let pageRunes=0;
  for(const ch of body) {
    if(runeIndex.has(ch)) {
      if(!currentWord.length) wordStart=globalRune;
      currentWord.push(runeIndex.get(ch));
      globalRune+=1;
      pageRunes+=1;
    } else if(ch==='/') {
      lineBreaks.push({page,lineBefore:line,lineAfter:line+1,boundary:globalRune});
      line+=1;
    } else if(/\s/u.test(ch)) {
      // Printed whitespace is layout, not a word delimiter.
    } else {
      finishWord();
    }
  }
  pageRuneCounts.set(page,pageRunes);
  pageLineCounts.set(page,line);
}
finishWord();

function isRuneLineBreak(boundary) {
  const body=sourcePages.find(item=>item.page===boundary.page).body;
  const lines=body.split(/\/\r?\n/u);
  const before=lines[boundary.lineBefore-1]||'';
  const after=lines[boundary.lineAfter-1]||'';
  return [...before].some(ch=>runeIndex.has(ch)) &&
    [...after].some(ch=>runeIndex.has(ch));
}

let wordCursor=0;
const withinPageSplits=[];
for(const boundary of lineBreaks.filter(isRuneLineBreak)) {
  while(wordCursor<completeWords.length &&
        completeWords[wordCursor].end<=boundary.boundary) wordCursor+=1;
  const word=completeWords[wordCursor];
  if(word && word.start<boundary.boundary && boundary.boundary<word.end) {
    withinPageSplits.push({
      page:boundary.page,
      lineBefore:boundary.lineBefore,
      lineAfter:boundary.lineAfter,
      wordLength:word.length,
      prefix:boundary.boundary-word.start,
      suffix:word.end-boundary.boundary,
      values:word.values
    });
  }
}

function parseCsv(text) {
  const lines=text.trim().split(/\r?\n/u);
  const headers=lines[0].split(',');
  return lines.slice(1).map(line=>{
    const values=line.split(',');
    return Object.fromEntries(headers.map((header,index)=>[header,values[index]]));
  });
}
const csvRows=parseCsv(carryCsv);
const carries=csvRows.map(row=>{
  const leftRunes=[...row.previous_fragment];
  const rightRunes=[...row.next_fragment];
  const wordRunes=[...row.word_runes];
  const left=leftRunes.map(rune=>runeIndex.get(rune));
  const right=rightRunes.map(rune=>runeIndex.get(rune));
  const full=wordRunes.map(rune=>runeIndex.get(rune));
  assert.equal(left.length+right.length,Number(row.word_length));
  assert.deepEqual(full,[...left,...right]);
  return {
    fromPage:Number(row.from_page),
    toPage:Number(row.to_page),
    previousImage:row.previous_image,
    nextImage:row.next_image,
    wordRunes:row.word_runes,
    wordTranslit:row.word_translit,
    leftRunes:row.previous_fragment,
    rightRunes:row.next_fragment,
    leftGP29:left,
    rightGP29:right,
    splitOffset:left.length,
    wordLength:Number(row.word_length),
    previousLine:Number(row.previous_line),
    nextLine:Number(row.next_line),
    previousLineRuneStart:Number(row.previous_line_rune_start),
    previousLineRuneEnd:Number(row.previous_line_rune_end),
    nextLineRuneStart:Number(row.next_line_rune_start),
    nextLineRuneEnd:Number(row.next_line_rune_end),
    previousLocalStart:Number(row.previous_local_start),
    previousLocalEnd:Number(row.previous_local_end),
    nextLocalStart:Number(row.next_local_start),
    nextLocalEnd:Number(row.next_local_end),
    globalStart:Number(row.global_start),
    globalEnd:Number(row.global_end)
  };
});

const canonical=parseLP2Words(transcription,55);
assert.equal(globalRune,12956);
assert.equal(completeWords.length,2896);
assert.equal(lineBreaks.length,539);
assert.equal(withinPageSplits.length,388);
assert.equal(carries.length,32);
assert.equal(canonical.runeCount,globalRune);
assert.equal(canonical.crossPageWords,carries.length);
assert.deepEqual(
  carries.map(item=>item.wordRunes),
  canonical.words.filter(word=>word.startPage!==word.endPage).map(word=>word.runes)
);
for(const carry of carries) {
  assert.equal(carry.toPage,carry.fromPage+1);
  assert.equal(carry.previousLocalEnd,pageRuneCounts.get(carry.fromPage)-1);
  assert.equal(carry.nextLocalStart,0);
  assert.equal(carry.previousLine,pageLineCounts.get(carry.fromPage));
  assert.equal(carry.nextLine,1);
}

function signature(item) {
  return item.wordLength+':'+item.prefix+'/'+item.suffix;
}
const withinSignatureCounts=new Map();
for(const item of withinPageSplits) {
  const key=signature(item);
  withinSignatureCounts.set(key,(withinSignatureCounts.get(key)||0)+1);
}
const withinEndpointCounts=new Map();
for(const item of withinPageSplits) {
  const key=item.values[item.prefix-1]+','+item.values[item.prefix];
  withinEndpointCounts.set(key,(withinEndpointCounts.get(key)||0)+1);
}
const carrySignatureCounts=new Map();
const carryTable=carries.map(carry=>{
  const sig=carry.wordLength+':'+carry.splitOffset+'/'+(carry.wordLength-carry.splitOffset);
  const endpoint=carry.leftGP29.at(-1)+','+carry.rightGP29[0];
  const signatureMatches=withinSignatureCounts.get(sig)||0;
  const endpointMatches=withinEndpointCounts.get(endpoint)||0;
  carrySignatureCounts.set(sig,(carrySignatureCounts.get(sig)||0)+1);
  return {
    ...carry,
    signature:sig,
    withinMatchedSplitSignatures:signatureMatches,
    endpointPair:endpoint,
    withinEndpointPairMatches:endpointMatches
  };
});
const matchedSignatures=carryTable.filter(item=>item.withinMatchedSplitSignatures>0).length;
const endpointPairMatches=carryTable.filter(item=>item.withinEndpointPairMatches>0).length;
const exactWordDuplicates=carryTable.filter(carry=>
  withinPageSplits.some(item=>item.values.join(',')===carry.leftGP29.concat(carry.rightGP29).join(','))
).length;
assert.equal(matchedSignatures,32);
assert.equal(Math.min(...carryTable.map(item=>item.withinMatchedSplitSignatures)),1);
assert.equal(Math.max(...carryTable.map(item=>item.withinMatchedSplitSignatures)),29);
assert.equal(carrySignatureCounts.size,20);
assert.equal(endpointPairMatches,5);
assert.equal(exactWordDuplicates,0);

function countSolvedLineCarries(section) {
  const lines=section.source_text.split(/\n/u);
  let word=[];
  let count=0;
  for(let i=0;i<lines.length;i+=1) {
    for(const ch of lines[i]) {
      if(runeIndex.has(ch)) word.push(ch);
      else if(ch==='•'||ch==='⁘'||ch==='⁜') word=[];
      else if(/\s/u.test(ch)) {
        // A newline can preserve a word only if no printed separator intervenes.
      } else word=[];
    }
    if(i<lines.length-1 && word.length &&
       [...lines[i+1]].some(ch=>runeIndex.has(ch))) count+=1;
  }
  return {lineCount:lines.length,lineBreakCarryCount:count};
}
const p56=solved.sections.find(section=>section.name==='p56_an_end');
const p57=solved.sections.find(section=>section.name==='p57_parable');
assert(p56 && p57,'solved p56/p57 controls must exist');
const p56Control=countSolvedLineCarries(p56);
const p57Control=countSolvedLineCarries(p57);
const p56LastLine=p56.source_text.split(/\n/u).at(-1);
const p57FirstLine=p57.source_text.split(/\n/u)[0];
const solvedPageBoundaryCarry=!p56LastLine.endsWith('⁜') &&
  [...p57FirstLine].some(ch=>runeIndex.has(ch));
assert.equal(p56Control.lineBreakCarryCount,0);
assert.equal(p57Control.lineBreakCarryCount,0);
assert.equal(solvedPageBoundaryCarry,false);

const lengthDistribution={};
for(const carry of carries) {
  lengthDistribution[carry.wordLength]=(lengthDistribution[carry.wordLength]||0)+1;
}
const splitDistribution={};
for(const carry of carries) {
  const key=carry.splitOffset+'/'+(carry.wordLength-carry.splitOffset);
  splitDistribution[key]=(splitDistribution[key]||0)+1;
}
const output={
  summary:{
    runeCount:globalRune,
    completePrintedWords:completeWords.length,
    withinPageLineBreaks:lineBreaks.length,
    withinPageWordCarries:withinPageSplits.length,
    crossPageWordCarries:carries.length,
    exactSplitSignaturesMatchedByWithinPageControls:matchedSignatures,
    distinctCarrySplitSignatures:carrySignatureCounts.size,
    exactBoundaryEndpointPairsSeenWithinPage: endpointPairMatches,
    exactCompleteCarryWordsDuplicatedWithinPage:exactWordDuplicates,
    carryWordLengthDistribution:lengthDistribution,
    carrySplitDistribution:splitDistribution,
    splitSignatureMatchRange:[
      Math.min(...carryTable.map(item=>item.withinMatchedSplitSignatures)),
      Math.max(...carryTable.map(item=>item.withinMatchedSplitSignatures))
    ],
    solvedP56P57Controls:{
      p56:p56Control,
      p57:p57Control,
      p56LastLine,
      p57FirstLine,
      pageBoundaryCarry:solvedPageBoundaryCarry
    },
    decision:"All 32 split-coordinate signatures occur among ordinary within-page linebreak carries; no source-selected page-boundary selector is established."
  },
  carryTable
};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
