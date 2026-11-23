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
