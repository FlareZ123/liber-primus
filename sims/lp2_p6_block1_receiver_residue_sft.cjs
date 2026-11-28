"use strict";

const fs=require("fs");
const path=require("path");
const assert=require("assert");

/** @param {number} x @returns {number} */
function mod29(x){return((x%29)+29)%29;}
/** @param {number[]} x @returns {number[]} */
function h4(x){assert.equal(x.length,4);return[mod29(x[0]-x[3]),mod29(x[1]-x[2]),mod29(x[1]+x[2]),mod29(x[0]+x[3])];}
/** @param {number[]} h @returns {number[]} */
function h4Inv(h){assert.equal(h.length,4);const inv2=15;return[mod29((h[0]+h[3])*inv2),mod29((h[1]+h[2])*inv2),mod29((h[2]-h[1])*inv2),mod29((h[3]-h[0])*inv2)];}
/** @param {number[]} values @returns {number[][]} */
function permutations(values){const out=[];function visit(prefix,rest){if(rest.length===0){out.push(prefix);return;}for(let i=0;i<rest.length;i+=1)visit(prefix.concat(rest[i]),rest.slice(0,i).concat(rest.slice(i+1)));}visit([],values);return out;}
/** @param {number[][]} arrays @returns {number[][]} */
function cartesian(arrays){let out=[[]];for(const array of arrays){const next=[];for(const prefix of out)for(const value of array)next.push(prefix.concat(value));out=next;}return out;}

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const blocks=transcription.split(/^\s*%\s*$/m).slice(0,55);
/** @param {number} block @returns {number} */
function physicalPage(block){return block>=50?block+1:block;}

const allWords=[];let current=[],startPage=-1,endPage=-1,startOffset=-1;
/** @returns {void} */
function flushWord(){if(current.length===0)return;allWords.push({page:startPage,endPage,start:startOffset,values:current.slice(),length:current.length});current=[];}
for(let block=0;block<blocks.length;block+=1){const page=physicalPage(block);let offset=0;for(const ch of blocks[block]){const value=runeIndex.get(ch);if(value!==undefined){if(current.length===0){startPage=page;startOffset=offset;}endPage=page;current.push(value);offset+=1;}else if(!/[\s/]/u.test(ch))flushWord();}}
flushWord();
const canonicalWords=allWords.filter((word)=>word.page===word.endPage);
/** @param {number} page @returns {Array<{page:number,endPage:number,start:number,values:number[],length:number}>} */
function pageWords(page){return canonicalWords.filter((word)=>word.page===page);}
/** @param {number} page @returns {number} */
function firstPeriodEnd(page){const block=page<=49?page:page-1;let offset=0;for(const ch of blocks[block]){if(runeIndex.has(ch))offset+=1;else if(ch===".")return offset-1;}throw new Error("no period on page "+page);}

const translitTokens=corpus.translit.map((spelling,value)=>({spelling,value})).sort((a,b)=>b.spelling.length-a.spelling.length);
/** @param {string} word @returns {number[]} */
function gp(word){const text=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const out=[];for(let i=0;i<text.length;){if(text.startsWith("ING",i)){out.push(21);i+=3;continue;}if(text.startsWith("IO",i)){out.push(27);i+=2;continue;}const token=translitTokens.find((entry)=>text.startsWith(entry.spelling,i));assert(token,"unmapped GP text at "+text.slice(i));out.push(token.value);i+=token.spelling.length;}return out;}

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/u).filter((word)=>/^[A-Za-z]+$/u.test(word)).map((word)=>word.toUpperCase());
assert.deepEqual(signedWords.slice(32,36),["YOU","WILL","BE","FOUND"]);
const sourceLengths=signedWords.slice(32,36).map((word)=>gp(word).length);
assert.deepEqual(sourceLengths,[3,4,2,5]);

const p6=pageWords(6);
const p6Title=p6.filter((word)=>[71,75,76,80].includes(word.start));
assert.deepEqual(p6Title.map((word)=>word.start),[71,75,76,80]);
assert.deepEqual(p6Title.map((word)=>word.length),[4,1,4,2]);
assert.deepEqual(p6Title[3].values,[14,12]);
const titleLengths=p6Title.map((word)=>word.length);
const lengthShell=h4(titleLengths);
assert.deepEqual(lengthShell,[2,26,5,6]);
const state={K:2,e:3,q:4,g:5,a:6,A:8,b:15,B:19,p:23,F:0};
assert.deepEqual(lengthShell,[state.K,mod29(-state.e),state.g,state.a]);

const selectedStarts=[30,132,4,25];
const selectedResidues=selectedStarts.map((start)=>start%29);
assert.deepEqual(selectedResidues,[1,16,4,25]);
const selectedShell=h4(selectedResidues);
assert.deepEqual(selectedShell,[5,12,20,26]);
assert.deepEqual(selectedShell,[state.g,mod29(state.a*state.K),mod29(state.q*state.g),mod29(-state.e)]);
assert.deepEqual(h4Inv(selectedShell),selectedResidues);

const p32Word=pageWords(32).find((word)=>word.start===30);
const p33Word=pageWords(33).find((word)=>word.start===132);
const p34Word=pageWords(34).find((word)=>word.start===4);
assert(p32Word&&p33Word&&p34Word);
assert.deepEqual(p32Word.values,[0,3,2]);assert.deepEqual(p33Word.values,[3,15,17,22]);assert.deepEqual(p34Word.values,[12,23]);
assert.equal(firstPeriodEnd(32),32);assert.equal(p32Word.start+p32Word.length-1,32);

const p35Words=pageWords(35),p35Packets=[];
for(let i=0;i+1<p35Words.length;i+=1)if(p35Words[i].length===2&&p35Words[i+1].length===3)p35Packets.push({start:p35Words[i].start,values:p35Words[i].values.concat(p35Words[i+1].values)});
const p35Selected=p35Packets.find((packet)=>packet.start===25);
assert(p35Selected);assert.deepEqual(p35Selected.values,[19,17,19,24,11]);

const pools=[pageWords(32).filter((word)=>word.length===sourceLengths[0]),pageWords(33).filter((word)=>word.length===sourceLengths[1]),pageWords(34).filter((word)=>word.length===sourceLengths[2]),p35Packets];
const directHits=selectedResidues.map((residue,slot)=>pools[slot].filter((receiver)=>receiver.start%29===residue).map((receiver)=>receiver.start));
assert.deepEqual(directHits,[[1,30],[132],[4],[25]]);

const w4=p6Title[3].values;
const titleGp0=p6Title.map((word)=>mod29(word.values.reduce((total,value)=>total+value,0)));
assert.deepEqual(titleGp0,[13,19,7,26]);

// Reconstruct p6's color-separated physical line widths around the known
// red title offsets71..81. The lower title line contains 11 red runes, so
// only its seven black runes belong to the after-title region.
let p6RuneOffset=0;
const p6LineRegions=blocks[6].split("\n").map((line)=>{
  let before=0,red=0,after=0;
  for(const ch of line){
    if(!runeIndex.has(ch))continue;
    if(p6RuneOffset<71)before+=1;
    else if(p6RuneOffset<82)red+=1;
    else after+=1;
    p6RuneOffset+=1;
  }
  return {before,red,after};
});
assert.equal(p6RuneOffset,corpus.pages.find((page)=>page.page===6).indices.length);
const upperLineCounts=p6LineRegions.map((line)=>line.before).filter(Boolean);
const lowerLineCounts=p6LineRegions.map((line)=>line.after).filter(Boolean);
assert.deepEqual(upperLineCounts,[20,24,24,3]);
assert.deepEqual(lowerLineCounts,[7,19,20,24,22,22]);
const sharedLineWidths=[...new Set(upperLineCounts)].filter((value)=>lowerLineCounts.includes(value)).sort((a,b)=>a-b);
assert.deepEqual(sharedLineWidths,[20,24]);
const occurrences=(values,target)=>values.filter((value)=>value===target).length;
const balancedLineWidths=sharedLineWidths.filter((value)=>occurrences(upperLineCounts,value)===1&&occurrences(lowerLineCounts,value)===1);
assert.deepEqual(balancedLineWidths,[20]);

// Direct typed p6 artifact shell: transformed title-length coordinate,
// terminal title rune, balanced physical width, terminal-word GP0.
const typedVisualShell=[lengthShell[2],w4[w4.length-1],balancedLineWidths[0],titleGp0[3]];
assert.deepEqual(typedVisualShell,[5,12,20,26]);
assert.deepEqual(h4Inv(typedVisualShell),selectedResidues);

// Broad typed-artifact charge: any H(length) coordinate, either terminal-word
// rune, either width shared across the red divider, any title-word GP0, and
// every coordinate order. This does not read target rune values.
let typedLabeledCount=0;
const typedUniqueShells=new Map();
for(const a of lengthShell){
  for(const b of w4){
    for(const c of sharedLineWidths){
      for(const d of titleGp0){
        for(const shell of permutations([a,b,c,d])){
          typedLabeledCount+=1;
          const key=shell.join(",");
          if(!typedUniqueShells.has(key))typedUniqueShells.set(key,{shell,labels:[]});
          typedUniqueShells.get(key).labels.push({a,b,c,d});
        }
      }
    }
  }
}
assert.equal(typedLabeledCount,1536);
assert.equal(typedUniqueShells.size,1488);
const typedSupported=[];
for(const entry of typedUniqueShells.values()){
  const residues=h4Inv(entry.shell);
  const hits=residues.map((residue,slot)=>pools[slot].filter((receiver)=>receiver.start%29===residue).map((receiver)=>receiver.start));
  if(hits.every((row)=>row.length>0))typedSupported.push({shell:entry.shell,residues,hits,labels:entry.labels});
}
assert.equal(typedSupported.length,1);
assert.deepEqual(typedSupported[0].shell,[5,12,20,26]);
assert.deepEqual(typedSupported[0].residues,[1,16,4,25]);
assert.deepEqual(typedSupported[0].hits,[[1,30],[132],[4],[25]]);
assert.deepEqual(typedSupported[0].labels,[{a:5,b:12,c:20,d:26}]);

// Second p6-only address coordinate: mirror every adjacent title-length pair,
// both orientations, then invert H4 to obtain a base29 quotient vector.
const quotientLabeled=[];
const quotientUnique=new Map();
for(let pairIndex=0;pairIndex+1<titleLengths.length;pairIndex+=1){
  for(const reverse of [false,true]){
    let pair=[titleLengths[pairIndex],titleLengths[pairIndex+1]];
    if(reverse)pair=pair.slice().reverse();
    const shell=[pair[0],pair[1],pair[1],pair[0]];
    const quotient=h4Inv(shell);
    quotientLabeled.push({pairIndex,reverse,pair,shell,quotient});
    const key=quotient.join(",");
    if(!quotientUnique.has(key))quotientUnique.set(key,{quotient,labels:[]});
    quotientUnique.get(key).labels.push({pairIndex,reverse,pair,shell});
  }
}
assert.equal(quotientLabeled.length,6);
assert.equal(quotientUnique.size,4);
assert.deepEqual([...quotientUnique.values()].map((entry)=>entry.quotient),[
  [4,1,0,0],
  [1,4,0,0],
  [4,2,0,0],
  [2,4,0,0],
]);

const jointAddress=[];
for(const residueEntry of typedUniqueShells.values()){
  const residues=h4Inv(residueEntry.shell);
  const hits=residues.map((residue,slot)=>pools[slot].filter((receiver)=>receiver.start%29===residue).map((receiver)=>receiver.start));
  if(!hits.every((row)=>row.length>0))continue;
  for(const starts of cartesian(hits)){
    const quotients=starts.map((start)=>Math.floor(start/29));
    const quotientEntry=quotientUnique.get(quotients.join(","));
    if(quotientEntry)jointAddress.push({shell:residueEntry.shell,residues,hits,starts,quotients,quotientLabels:quotientEntry.labels});
  }
}
assert.equal(typedUniqueShells.size*quotientUnique.size,5952);
assert.equal(jointAddress.length,1);
assert.deepEqual(jointAddress[0].shell,[5,12,20,26]);
assert.deepEqual(jointAddress[0].residues,[1,16,4,25]);
assert.deepEqual(jointAddress[0].quotients,[1,4,0,0]);
assert.deepEqual(jointAddress[0].starts,[30,132,4,25]);
assert.deepEqual(h4(jointAddress[0].quotients),[1,4,4,1]);
assert.equal(jointAddress[0].quotientLabels.length,2);
assert.equal(firstPeriodEnd(32),32);

// Preserve the original algebraic discovery family as a reproducibility
// control. It is weaker causally because q*g was constructed after discovery.
const multipliers=[state.q,1,state.K];
let algebraicLabeledCount=0;
const algebraicUniqueShells=new Map();
for(let xIndex=0;xIndex<lengthShell.length;xIndex+=1)for(let zIndex=0;zIndex<lengthShell.length;zIndex+=1){if(zIndex===xIndex)continue;for(let yIndex=0;yIndex<w4.length;yIndex+=1)for(const multiplier of multipliers){const roles=[lengthShell[xIndex],w4[yIndex],mod29(multiplier*lengthShell[xIndex]),lengthShell[zIndex]];for(const shell of permutations(roles)){algebraicLabeledCount+=1;const key=shell.join(",");if(!algebraicUniqueShells.has(key))algebraicUniqueShells.set(key,{shell,labels:[]});algebraicUniqueShells.get(key).labels.push({xIndex,zIndex,yIndex,multiplier});}}}
assert.equal(algebraicLabeledCount,1728);
assert.equal(algebraicUniqueShells.size,1404);
const algebraicSupported=[];
for(const entry of algebraicUniqueShells.values()){const residues=h4Inv(entry.shell);const hits=residues.map((residue,slot)=>pools[slot].filter((receiver)=>receiver.start%29===residue).map((receiver)=>receiver.start));if(hits.every((row)=>row.length>0))algebraicSupported.push({shell:entry.shell,residues,hits,labels:entry.labels});}
assert.equal(algebraicSupported.length,1);
assert.deepEqual(algebraicSupported[0].shell,[5,12,20,26]);

console.log(JSON.stringify({
  p6:{titleStarts:p6Title.map((word)=>word.start),titleLengths,lengthShell,w4,titleGp0,upperLineCounts,lowerLineCounts,sharedLineWidths,balancedLineWidths,typedVisualShell},
  block1:{sourceWords:signedWords.slice(32,36),sourceLengths,selectedStarts,selectedResidues,selectedShell,targetBlindHits:directHits,p32FirstPeriodEnd:firstPeriodEnd(32)},
  typedFamily:{labeledConstructions:typedLabeledCount,distinctShells:typedUniqueShells.size,supportedShells:typedSupported.length,survivor:typedSupported[0]},
  quotientFamily:{labeledConstructions:quotientLabeled.length,distinctVectors:quotientUnique.size,vectors:[...quotientUnique.values()]},
  jointAddressFamily:{distinctGrammars:typedUniqueShells.size*quotientUnique.size,survivors:jointAddress.length,survivor:jointAddress[0]},
  algebraicAudit:{labeledConstructions:algebraicLabeledCount,distinctShells:algebraicUniqueShells.size,supportedShells:algebraicSupported.length,survivor:algebraicSupported[0]},
},null,2));
