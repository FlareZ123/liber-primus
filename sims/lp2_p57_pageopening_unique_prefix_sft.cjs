"use strict";
/** Windows Node22 SFT. Post-observation page-opening coincidence, not decryption. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.join(__dirname,"..");
const db=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources","liber-primus","lp2-transcription.txt"),"utf8").split("%");
const map=new Map(db.runes.map((r,i)=>[r,i]));
const pages=db.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
function runes(s){return Array.from(s).filter(ch=>map.has(ch)).map(ch=>map.get(ch));}
for(let i=0;i<pages.length;i++)assert.deepEqual(runes(transcription[i]),pages[i].indices);
let words=[],word=[];
for(const ch of transcription[56]){
  if(map.has(ch))word.push(map.get(ch));
  else if(ch!=="/"&&!/\s/u.test(ch)&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
assert.equal(words.length,20);
assert.equal(words.reduce((n,w)=>n+w.length,0),95);
function key3(a,i=0){const n=a.length;return (a[i]*29+a[(i+1)%n])*29+a[(i+2)%n];}
function key4(a,i=0){return key3(a,i)*29+a[(i+3)%a.length];}
const a=new Set(words.filter(w=>w.length>=3).map(w=>key3(w)));
const b=new Set(words.filter(w=>w.length>=4).map(w=>key4(w)));
assert.equal(a.size,15);assert.equal(b.size,12);
const hits=pages.filter(p=>a.has(key3(p.indices))||b.has(key4(p.indices))).map(p=>p.page);
assert.deepEqual(hits,[0,12]);
assert.deepEqual(pages[0].indices.slice(0,4),[15,8,18,3]);
assert.deepEqual(pages[12].indices.slice(0,5),[5,10,4,5,7]);
assert(transcription[12].trimStart().startsWith("ᚳᛁ-ᚱᚳᚹ"));

// Cross-round source gate: the independently archived 2014 Stage10 response
// names 107.jpg/167.jpg/229.jpg before the 58-page manuscript release.
// The p50 numerical register and its f-shed alphabet are *proposed* receivers.
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources","liber-primus","base60-grid.json"),"utf8"));
const letters=[...grid.alphabet];
const shedLetters=letters.filter(ch=>ch!=="f");
const cells=grid.rows.flat();
assert.equal(letters.length,60);
assert.equal(shedLetters.length,59);
assert.equal(letters.indexOf("f"),41);
assert.equal(cells.length,256);
/** @param {string} token @param {string[]} radixLetters @returns {number} */
function readCell(token,radixLetters){
  return radixLetters.indexOf(token[0])*radixLetters.length+radixLetters.indexOf(token[1]);
}
assert.equal(pages[0].indices.slice(0,3).reduce((s,n)=>s+n,0),41);
assert.equal(pages[12].indices.slice(0,4).reduce((s,n)=>s+n,0),24);
assert.equal(cells[41],"1O");
assert.equal(readCell(cells[41],shedLetters),83);
assert.equal(words[19].reduce((s,n)=>s+n,0),83); // clear p57 EMERGE
assert.equal(cells[24],"1n");
assert.equal(readCell(cells[24],shedLetters),107);
assert.equal(cells.filter(cell=>readCell(cell,shedLetters)===107).length,1);

const stage10=fs.readFileSync(
  path.join(root,"resources","external","2014-stage10-post-square-response.html"),"utf8"
);
const knownJpgs=Array.from(stage10.matchAll(/<img src="\/(\d+)\.jpg"/g),match=>Number(match[1]));
assert.deepEqual(knownJpgs,[107,167,229]);

const lp1Clear=fs.readFileSync(
  path.join(root,"resources","liber-primus","lp1-plaintext-reference.txt"),"utf8"
);
const stage10FirstPage=lp1Clear.split("### 14")[1].split("### 15")[0];
assert(stage10FirstPage.includes('"THE I IS THE VOICE OF THE CIRCUMFERENCE"'));

const crossRound=[];
for(let index=0;index<words.length;index++){
  for(const prefixLength of [3,4,words[index].length]){
    if(prefixLength>words[index].length)continue;
    const address=words[index].slice(0,prefixLength).reduce((s,n)=>s+n,0);
    if(address>=256)continue;
    const token=cells[address];
    for(const radixLetters of [letters,shedLetters]){
      const target=readCell(token,radixLetters);
      if(knownJpgs.includes(target)){
        crossRound.push({word:index,prefixLength,address,radix:radixLetters.length,target});
      }
    }
  }
}
assert.deepEqual(crossRound,[{word:13,prefixLength:4,address:24,radix:59,target:107}]);

let seed=0x3301a157;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
let two=0,one4=0,both=0,dist=[0,0,0,0];
for(let t=0;t<200000;t++){
  let n3=0,n4=0;
  for(const p of pages){
    const c=p.indices,o=rnd()%c.length;
    if(a.has(key3(c,o)))n3++;
    if(b.has(key4(c,o)))n4++;
  }
  dist[n3]++;
  if(n3>=2)two++;
  if(n4>=1)one4++;
  if(n3>=2&&n4>=1)both++;
}
assert.deepEqual([two,one4,both],[111,788,22]);
assert.deepEqual(dist,[192546,7343,109,2]);
console.log(JSON.stringify({unknownPages:55,runes:12956,clearWords:20,
  unique3:a.size,unique4:b.size,
  observed:[
    {page:0,match:"SHE / SHED",nextCipherRune:"O",nextClearRune:"D"},
    {page:12,match:"CIRC / CIRCUMFERENCES",nextCipherRune:"W",nextClearRune:"U",wordBreak:"CI-RCW"}],
  rotationNull:{trials:200000,atLeastTwoThreeRuneHits:two,atLeastOneFourRuneHit:one4,
    joint:both,empiricalJointTail:(both+1)/200001,threeRuneHitDistribution:dist},
  status:"Unselected original-clue hypothesis, not a decryption"},null,2));
