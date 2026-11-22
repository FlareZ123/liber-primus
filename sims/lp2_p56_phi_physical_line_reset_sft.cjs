#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const transcription=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const rawPages=transcription.split('%').map(s=>s.trim()).filter(Boolean);
rawPages.splice(50,0,'');
assert.equal(rawPages.length,58);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod29=n=>((n%29)+29)%29;
function firstPrimes(count){
 const out=[];
 for(let n=2;out.length<count;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
  if(prime)out.push(n);
 }
 return out;
}
const primeValues=firstPrimes(128);
const phiKey=primeValues.map(p=>(p-1)%29);
function parseRuneLines(pageText){
 return pageText.split(/\r?\n/).map((raw,sourceLine)=>({
  sourceLine:sourceLine+1,
  indices:[...raw].filter(ch=>runeIndex.has(ch)).map(ch=>runeIndex.get(ch))
 })).filter(line=>line.indices.length>0);
}
const flatten=lines=>lines.flatMap(line=>line.indices);
function encryptWithReset(plain){
 let used=0;
 return plain.map(p=>p===0?0:mod29(p+phiKey[used++]));
}
function decodeWithMask(cipher,mask){
 const fPositions=cipher.flatMap((c,i)=>c===0?[i]:[]);
 let used=0,fOrdinal=0;
 const plain=[];
 for(const c of cipher){
  if(c===0){
   const transparent=((mask>>>fOrdinal)&1)===1;
   fOrdinal++;
   if(transparent){plain.push(0);continue;}
  }
  const p=mod29(c-phiKey[used++]);
  if(p===0)return null;
  plain.push(p);
 }
 assert.equal(fOrdinal,fPositions.length);
 return {plain,used,mask};
}
function enumerateLineDecodes(cipher){
 const fCount=cipher.filter(c=>c===0).length;
 assert.ok(fCount<=12);
 const out=[];
 for(let mask=0;mask<(1<<fCount);mask++){
  const decoded=decodeWithMask(cipher,mask);
  if(!decoded)continue;
  assert.deepEqual(encryptWithReset(decoded.plain),cipher);
  out.push(decoded);
 }
 return out;
}
function firstDeadRune(cipher){
 let states=new Set([0]);
 for(let i=0;i<cipher.length;i++){
  const c=cipher[i],next=new Set();
  for(const used of states){
   if(c===0)next.add(used);
   const p=mod29(c-phiKey[used]);
   if(p!==0)next.add(used+1);
  }
  if(next.size===0)return i;
  states=next;
 }
 return null;
}
function toGpRunes(text){
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const out=[];
 for(const word of text.split(' ')){
  for(let i=0;i<word.length;){
   const token=tokens.find(t=>word.startsWith(t.s,i));
   assert.ok(token);
   out.push(token.i);i+=token.s.length;
  }
 }
 return out;
}
const p56Plain=toGpRunes('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const p56Cipher=corpus.pages.find(p=>p.page===56).indices;
assert.equal(p56Plain.length,85);
assert.equal(p56Cipher.length,85);
assert.deepEqual(encryptWithReset(p56Plain),p56Cipher);
const p56FPositions=p56Cipher.flatMap((c,i)=>c===0?[i]:[]);
assert.deepEqual(p56FPositions,[35,47,51,56,74]);
const p56Decoded=decodeWithMask(p56Cipher,8);
assert.ok(p56Decoded);
assert.deepEqual(p56Decoded.plain,p56Plain);
assert.equal(p56Decoded.used,84);

// Plant 170 known runes across ten lines using p56's original physical line lengths.
const p56Lines=parseRuneLines(rawPages[56]);
const p56LineLengths=p56Lines.map(line=>line.indices.length);
assert.deepEqual(p56LineLengths,[20,19,6,22,18]);
const plantedPlain=[...p56Plain,...p56Plain];
const plantedLengths=[...p56LineLengths,...p56LineLengths];
const plantedLines=[];
let offset=0;
for(const length of plantedLengths){plantedLines.push(plantedPlain.slice(offset,offset+length));offset+=length;}
assert.equal(offset,plantedPlain.length);
const plantedCipherLines=plantedLines.map(encryptWithReset);
let plantedLiteralF=0,plantedEncryptedZero=0,plantedExactLines=0;
for(let i=0;i<plantedLines.length;i++){
 for(let j=0;j<plantedLines[i].length;j++){
  if(plantedLines[i][j]===0)plantedLiteralF++;
  else if(plantedCipherLines[i][j]===0)plantedEncryptedZero++;
 }
 const matches=enumerateLineDecodes(plantedCipherLines[i]).filter(x=>JSON.stringify(x.plain)===JSON.stringify(plantedLines[i]));
 assert.ok(matches.length>0);
 plantedExactLines++;
}
assert.equal(plantedPlain.length,170);
assert.equal(plantedExactLines,10);
assert.ok(plantedLiteralF>0&&plantedEncryptedZero>0);

// Original p0-p55 lines: validate exact flattening before the inverse test.
let unknownRunes=0,lineCount=0,validLineCount=0,impossibleLineCount=0,totalValidPaths=0,maxFPerLine=0;
let firstImpossible=null;
const failuresByPage=[];
for(let pageNo=0;pageNo<=55;pageNo++){
 const page=corpus.pages.find(p=>p.page===pageNo);
 assert.ok(page);
 const lines=parseRuneLines(rawPages[pageNo]);
 assert.deepEqual(flatten(lines),page.indices);
 unknownRunes+=page.indices.length;lineCount+=lines.length;
 let pageFailures=0;
 for(let i=0;i<lines.length;i++){
  const cipher=lines[i].indices;
  maxFPerLine=Math.max(maxFPerLine,cipher.filter(c=>c===0).length);
  const paths=enumerateLineDecodes(cipher);
  totalValidPaths+=paths.length;
  if(paths.length===0){
   impossibleLineCount++;pageFailures++;
   if(!firstImpossible)firstImpossible={page:pageNo,runeLine:i+1,sourceLine:lines[i].sourceLine};
  }else validLineCount++;
 }
 if(pageFailures)failuresByPage.push({page:pageNo,impossibleLines:pageFailures,totalLines:lines.length});
}
assert.equal(unknownRunes,12956);
assert.equal(lineCount,594);
assert.equal(validLineCount,351);
assert.equal(impossibleLineCount,243);
assert.equal(totalValidPaths,626);
assert.deepEqual(firstImpossible,{page:0,runeLine:10,sourceLine:10});

// p55 rune-bearing line 3 immediately precedes the #1506-selected line3/line4 boundary.
const p55Line3=parseRuneLines(rawPages[55])[2].indices;
assert.equal(p55Line3.length,22);
assert.equal(p55Line3.filter(c=>c===0).length,0);
const p55Dead=firstDeadRune(p55Line3);
assert.equal(p55Dead,4);
assert.equal(p55Line3[4],10);
assert.equal(primeValues[4],11);
assert.equal(phiKey[4],10);
assert.equal(mod29(p55Line3[4]-phiKey[4]),0);

console.log(JSON.stringify({
 model:'solved p56 C=P+phi(prime_j) mod29; plaintext F=0 transparent; reset prime cursor to p=2 at every physical rune-bearing line',
 p56SingleSequenceControl:{runes:85,cipherFPositions:p56FPositions,transparentMask:8,consumedPrimeValues:p56Decoded.used,exactForwardAndInverse:true},
 plantedMultiLineControl:{runes:170,lines:10,lineLengths:plantedLengths,literalFCount:plantedLiteralF,encryptedToCipherFCount:plantedEncryptedZero,exactRecoveredLines:plantedExactLines},
 originalP0ToP55:{runes:unknownRunes,runeBearingPhysicalLines:lineCount,linesWithLegalInverse:validLineCount,linesWithNoLegalInverse:impossibleLineCount,totalLegalPerLinePaths:totalValidPaths,maxCipherFPerLine:maxFPerLine,firstImpossibleLine:firstImpossible,failuresByPage},
 p55SelectedBoundaryLine:{runeLine:3,runes:p55Line3.length,cipherFCount:0,firstImpossibleRune:p55Dead+1,fifthCipherRune:p55Line3[4],fifthPrime:primeValues[4],fifthTotient:phiKey[4],attemptedPlainRune:mod29(p55Line3[4]-phiKey[4]),explanation:'C=10 minus phi(11)=10 gives plaintext F at a non-F ciphertext position; no transparent branch exists.'}
},null,2));
