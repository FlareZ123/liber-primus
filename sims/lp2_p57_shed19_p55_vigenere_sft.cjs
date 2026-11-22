"use strict";

/**
 * Solved p57 source-extracted 19-rune circumference key applied to
 * original p55 as exactly four 19-rune periods (76 original runes).
 *
 * "SHED OUR OWN CIRCUMFERENCES" selects natural first/last rune of
 * every one of the 19 original p57 body words. Test both historical
 * additive-GP29 signs, no key phase search, no word-dependent fitting.
 *
 * Windows 11 / Node.js 22 SFT:
 *   node sims/lp2_p57_shed19_p55_vigenere_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=s=>fs.readFileSync(path.join(root,s),"utf8");
const db=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=read("resources/liber-primus/lp2-transcription.txt").split("%");
const indices=new Map(db.runes.map((r,i)=>[r,i]));
const runeString=s=>[...s].filter(r=>indices.has(r)).map(r=>indices.get(r));
const original55=db.pages.find(p=>p.page===55).indices;
const original57=db.pages.find(p=>p.page===57).indices;
assert.deepEqual(runeString(source[54]),original55);
assert.deepEqual(runeString(source[56]),original57);
assert.deepEqual([original55.length,original57.length],[76,95]);

const clear57=source[56].replaceAll("/\n","");
const body=clear57.split(".").slice(1,4)
  .flatMap(s=>s.split("-").map(runeString).filter(w=>w.length));
assert.equal(body.length,19);
assert.equal(body.reduce((s,w)=>s+w.length,0),88);
const beginning=body.map(w=>w[0]);
const ending=body.map(w=>w[w.length-1]);
assert.equal(beginning.length*4,original55.length);

const wordLengths=source[54].split(/[-.$&§]/u)
  .map(runeString).filter(w=>w.length).map(w=>w.length);
assert.deepEqual(wordLengths,
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const tokens=db.translit.map((label,i)=>({label,i}))
  .sort((a,b)=>b.label.length-a.label.length);
function native(word) {
  const out=[];
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let i=0;i<word.length;){
    if(word.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(word.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const t=tokens.find(x=>word.startsWith(x.label,i));
    if(!t)return null;
    out.push(t.i);i+=t.label.length;
  }
  return out;
}
const lexicon=new Set();
for(const line of read("resources/control/english_wordfreq_textblob.txt").split("\n")){
  const match=/^([a-z]+) \d+$/.exec(line.trim());
  if(!match)continue;
  const word=native(match[1]);
  if(word)lexicon.add(word.join(","));
}
assert(lexicon.size>20000);
const mod=x=>(x%29+29)%29;
/** @param {number[]} text @param {number[]} key @param {-1|1} sign */
const apply=(text,key,sign)=>text.map((x,i)=>mod(x+sign*key[i%19]));
/** @param {number[]} text */
function ioc(text){
  const frequency=new Uint32Array(29);
  for(const x of text)frequency[x]++;
  return frequency.reduce((a,n)=>a+n*(n-1),0)/(text.length*(text.length-1));
}
const records=[];
for(const [name,key] of [["first",beginning],["last",ending]]){
  for(const sign of [-1,1]){
    const decoded=apply(original55,key,sign);
    assert.deepEqual(apply(decoded,key,-sign),original55,
      "Exact original p55 additive inverse");
    const plantedCipher=apply(original57.slice(0,76),key,-sign);
    assert.deepEqual(apply(plantedCipher,key,sign),original57.slice(0,76),
      "Genuine original solved p57 plaintext is exactly recovered");
    let at=0,whole=0,long=0;
    for(const len of wordLengths){
      const word=decoded.slice(at,at+len);
      if(lexicon.has(word.join(","))){whole++;if(len>=6)long++;}
      at+=len;
    }
    assert.equal(at,76);
    assert.equal(long,0);
    records.push({key:name,sign,originalIoC:ioc(decoded),
      nativePrintedWordHits:whole,nativePrintedWordsAtLeastSixRunes:long});
  }
}
assert.equal(records.length,4);

// A stronger all-secret necessary condition for four parallel 19-word
// plaintext-feature channels: a fixed secret bijection in any channel
// must preserve source equality and distinctness. Both source-natural
// 4x19 and 19x4 layouts are granted without phase optimization.
const features={
  first:beginning,last:ending,
  length:body.map(w=>w.length),
  primeSumMod29:body.map(w=>w.reduce((s,i)=>s+db.prime[i],0)%29)
};
const equalityObstructions=[];
for(const [layout,at] of [
  ["fourRows19", (row,column)=>row*19+column],
  ["nineteenRows4", (row,column)=>column*4+row]
]){
  for(const [feature,plain] of Object.entries(features)){
    for(let row=0;row<4;row++){
      const sameSource=new Map(),sameCipher=new Map();
      let forwardConflicts=0,reverseConflicts=0;
      for(let column=0;column<19;column++){
        const p=plain[column],c=original55[at(row,column)];
        if(sameSource.has(p)&&sameSource.get(p)!==c)forwardConflicts++;
        if(sameCipher.has(c)&&sameCipher.get(c)!==p)reverseConflicts++;
        sameSource.set(p,c);sameCipher.set(c,p);
      }
      assert(forwardConflicts>0 && reverseConflicts>0);
      equalityObstructions.push({layout,feature,row,
        forwardConflicts,reverseConflicts});
    }
  }
}
assert.equal(equalityObstructions.length,32);

console.log(JSON.stringify({
  source:"Original p57 19 body words, first/final GP rune per word",
  target:"Original physical p55 all 76 rune positions",
  originalCipherIoC:ioc(original55),keyPeriod:19,periods:4,
  originalSourceGpPlant:"4/4 exact 76-rune roundtrips",
  candidates:records,codebookEqualityObstructions:equalityObstructions,
  recoveredUnknownPlaintext:0
},null,2));
