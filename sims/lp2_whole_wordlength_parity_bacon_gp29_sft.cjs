"use strict";
/** Original 2896-word GP29 five-bit word-length-parity channel SFT.
 * Frozen before output in workplace/agent5-whole-lp2-wordlength-bacon-5bit-precommit.md.
 * Node.js22 / CommonJS; read-only, no external modules.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const base=path.join(__dirname,"..","resources","liber-primus");
const txt=fs.readFileSync(path.join(base,"lp2-transcription.txt"),"utf8");
const corpus=JSON.parse(fs.readFileSync(path.join(base,"lp2-corpus.json"),"utf8"));
const runes=new Set(corpus.runes);
// P50 has no rune-bearing text; original 57 transcript chunks index physical
// pages 0..49,51..57; first 55 carry physical pages 0..55 excluding p50.
const transcript=txt.split(/^\s*%\s*$/m).slice(0,55).join("");
const words=transcript.split(/[.\-&$]+/).map(x=>[...x].filter(ch=>runes.has(ch))).filter(x=>x.length>0);
assert.equal(words.length,2896);
assert.equal(words.reduce((sum,word)=>sum+word.length,0),12956);
assert.equal(words.filter(word=>word.length===1).length,83);
const bits=words.map(word=>word.length%2);
/** @param {number[]} stream */
function fiveBits(stream){
  const out=[];
  for(let i=0;i+5<=stream.length;i+=5){
    out.push(stream.slice(i,i+5).reduce((v,b)=>2*v+b,0));
  }
  return out;
}
const values=fiveBits(bits);
assert.equal(values.length,579);
assert.equal(bits.length%5,1);
const invalid=values.flatMap((v,i)=>v>=29?[i]:[]);
assert.equal(invalid.length,53);
assert.deepEqual(invalid.slice(0,10),[21,38,52,63,64,85,103,105,107,109]);
/** @param {number[]} a */
function ioc(a){
  const f=Array(29).fill(0);for(const v of a)f[v]++;
  return f.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}
const inRange=values.filter(v=>v<=28);
assert.ok(Math.abs(ioc(inRange)-0.03445229042187217)<1e-12);
// Authentic clear p57 GP29-native symbols planted as a valid five-bit word-length register.
const originalNative=corpus.pages.find(p=>p.page===57).indices;
assert.equal(originalNative.length,95);
const nativeBits=originalNative.flatMap(v=>[4,3,2,1,0].map(shift=>(v>>shift)&1));
const syntheticWordLengths=nativeBits.map(bit=>2+bit);
const decodedPlant=fiveBits(syntheticWordLengths.map(length=>length%2));
assert.deepEqual(decodedPlant,originalNative);
console.log(JSON.stringify({
  verdict:"NEGATIVE unedited full-book Bacon-style GP29 register",
  originalWords:words.length,originalRunes:12956,singletonWords:83,
  oddLengthBits:bits.filter(x=>x===1).length,
  completeFiveBitCodes:values.length,leftoverBits:1,
  invalidGp29Codes:invalid.length,invalidPositionsFirst10:invalid.slice(0,10),
  validSymbolsIoc:ioc(inRange),
  first160:values.slice(0,160).map(v=>v<=28?corpus.translit[v]:"#").join(""),
  nativeSolvedP57ControlRecoveredExactly:true
},null,2));
