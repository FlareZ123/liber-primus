#!/usr/bin/env node
"use strict";

/* Director #3306: first-party signed-source 0/1-origin ambiguity.
 * Both conventions map the literal file-indexed p29 page and source DIRECTION
 * to the same canonical word. They disagree ONLY when raw numeric H outputs
 * are silently interpreted as word indices.
 *
 * This is a source-typed ambiguity gate, not a GP29 body cipher.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.join(__dirname,"..","resources");
const txt=fs.readFileSync(path.join(base,"historical",
  "cicada2016-4gq25-outguess.asc"),"utf8");
const signedBody=txt.split("Hash: SHA1\n\n")[1]
  .split("-----BEGIN PGP SIGNATURE-----")[0];
assert(signedBody && signedBody.includes("their numbers are the direction"));
const sourceWords=signedBody.trim().split(/\s+/)
  .filter(w=>/^[A-Za-z]+[.,;!]?$/.test(w))
  .map(w=>w.replace(/[.,;!]$/,"").toUpperCase());
assert.equal(sourceWords.length,43);
assert.equal(sourceWords[29],"DIRECTION");
assert.equal(sourceWords[30],"SEEK");
assert.equal(sourceWords[22],"THE");
assert.equal(sourceWords[23],"ROAD");
assert.equal(sourceWords[21],"IS");

const cor=JSON.parse(fs.readFileSync(path.join(base,
  "liber-primus","lp2-corpus.json"),"utf8"));
const lines=fs.readFileSync(path.join(base,"lp2-transcription.txt"),"utf8")
  .split("%");
const rune=new Map(cor.runes.map((v,i)=>[v,i]));
function wholeWords(pageText){
  const words=[],positions=[];
  let current=[],loc=0;
  for(const ch of pageText){
    if(rune.has(ch)){current.push(rune.get(ch));loc++;}
    else if(ch==="/"||/\s/u.test(ch))continue;
    else if(current.length){words.push(current);current=[];}
  }
  if(current.length)words.push(current);
  return words;
}
const page29=wholeWords(lines[29]),page30=wholeWords(lines[30]);
assert.equal(page29.length,71);
assert.deepEqual(page29[28],[8,15]);
assert.deepEqual(page29[29],[11,26,11,18]);
assert.deepEqual(page30[30],[22,12,22]);

const mod=x=>(x%29+29)%29;
function H2(v){assert.equal(v.length,2);return [mod(v[0]-v[1]),mod(v[0]+v[1])]}
function H4(v){assert.equal(v.length,4);return [
 mod(v[0]-v[3]),mod(v[1]-v[2]),
 mod(v[1]+v[2]),mod(v[0]+v[3])
]}
const small=H2(page29[28]),wide=H4(page29[29]);
assert.deepEqual(small,[22,23]);
assert.deepEqual(wide,[22,15,8,0]);
const jet=[24,25,26,27],extended=[...jet,28,29];
function sourceRead(indices,origin){
  return indices.map(v=>sourceWords[v-origin]||"<OUTSIDE>").join(" ");
}
assert.equal(sourceRead(small,0),"THE ROAD");
assert.equal(sourceRead(small,1),"IS THE");
assert.equal(sourceRead(extended,0),"AND THEIR NUMBERS ARE THE DIRECTION");
assert.equal(sourceRead(extended,1),"ROAD AND THEIR NUMBERS ARE THE");

/*
 * Physical file index n=29 represents both zero-based page index29
 * and human one-based ordinal30. Source DIRECTION is likewise source
 * zero-index29 or one-index30; canonical word29 (zero-based) equals
 * word30 (one-based). It is one observation, not two independent cues.
 */
const fileIndex=29;
assert.equal(page29[fileIndex],page29[(fileIndex+1)-1]);
assert.equal(sourceWords[fileIndex],sourceWords[(fileIndex+1)-1]);
assert.equal(fileIndex+1,30);
const page30Held=page30[30];
assert.deepEqual(page30Held,[22,12,22]);
assert.equal(sourceWords[30],"SEEK");
assert.equal(sourceWords[31-1],"SEEK");

console.log(JSON.stringify({
 status:"PASS",
 sourceWordCount:sourceWords.length,
 page29NamedByFileIndex:fileIndex,
 page29AsHumanOrdinal:30,
 selectedWordZeroIndex:29,
 selectedWordOneIndex:30,
 sharedWord:page29[29],
 H2small:small,
 H4wide:wide,
 sourceReadZero:sourceRead(small,0),
 sourceReadOne:sourceRead(small,1),
 jetZero:sourceRead(extended,0),
 jetOne:sourceRead(extended,1),
 heldNextNamedSource:sourceWords[30],
 heldNextPage30Word:page30Held,
 typedNextReceiver:"UNSELECTED",
 authenticKeyRecovered:false
},null,2));