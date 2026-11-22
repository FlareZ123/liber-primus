"use strict";
/**
 * Exact lag-five word-shape crib on original LP2 p36 (scan 53.jpg).
 *
 * This is a conditional hypothesis, not a decryption: IF equal plaintext
 * symbols 5 positions apart share the same output substitution within a
 * printed word, the unusually structured ten-rune word admits precisely
 * one candidate in the project's existing English TextBlob lexicon.
 *
 * node sims/lp2_p36_lag5_tapestries_conditional_crib_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeAlphabet=corpus.runes, names=corpus.translit;
assert.equal(runeAlphabet.length,29);
const targetNames=["P","OE","J","A","NG","P","TH","P","A","NG"];
const target=targetNames.map(x=>names.indexOf(x));
assert(target.every(x=>x>=0));
const targetRunes=target.map(i=>runeAlphabet[i]).join("");
const page36=read("resources/liber-primus/lp2-transcription.txt")
  .split("%")[36];
const withoutLineWraps=page36.replace(/[\s/]/g,"");
assert(withoutLineWraps.includes(targetRunes));
assert.equal(withoutLineWraps.split(targetRunes).length-1,1);
const observed=Array.from({length:5},(_,i)=>target[i]===target[i+5]);
assert.deepEqual(observed,[true,false,false,true,true]);
const ordered=names.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/**
 * Native rune spelling follows LP1 conventions (ING is a single NG rune,
 * K->C, V->U, etc.). Encoded word length means GP runes, not Latin letters.
 * @param {string} word
 * @returns {number[]}
 */
function native(word) {
 const s=word.toUpperCase().replace(/ING/g,"NG").replace(/K/g,"C")
  .replace(/Q/g,"CW").replace(/V/g,"U").replace(/Z/g,"S")
  .replace(/[^A-Z]/g,"");
 const out=[];
 for(let pos=0;pos<s.length;) {
  const m=ordered.find(x=>s.startsWith(x.s,pos));
  if(!m)return [];
  out.push(m.i);
  pos+=m.s.length;
 }
 return out;
}
/** @param {number[]} a @returns {boolean} */
function agrees(a) {
 return a.length===target.length&&
  observed.every((x,i)=>(a[i]===a[i+5])===x);
}
const pairs=read("resources/control/english_wordfreq_textblob.txt")
 .split(/\r?\n/).filter(line=>/^[a-z]+ \d+$/.test(line))
 .map(line=>{const [word,n]=line.split(" ");return {word,count:Number(n)};});
assert.equal(pairs.length,29157);
const candidate=pairs.filter(x=>agrees(native(x.word)));
assert.deepEqual(candidate,[{word:"tapestries",count:1}]);
assert.deepEqual(
 Array.from({length:5},(_,i)=>native("tapestries")[i]===
  native("tapestries")[i+5]), observed);
console.log(JSON.stringify({
 printedLP2Page:36,originalJpeg:"53.jpg",
 originalRuneWord:targetRunes,
 transliteration:targetNames.join(" "),
 5StepSameLetterPattern:observed,
 lexicon:"resources/control/english_wordfreq_textblob.txt",
 distinctReferenceWords:pairs.length,
 conditionalCandidates:candidate,
 status:"TAPESTRIES is an independently chosen lexical crib within this one lexicon only; the underlying shared-phase substitution is unproven, and wider lexica yield other candidates. No plaintext recovered."
},null,2));
