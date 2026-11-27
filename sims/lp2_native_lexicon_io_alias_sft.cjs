"use strict";
// Compare the exact old all-spellings TextBlob register with the source-native IA/IO alias.
// The known-native fixture is a comparator, not an unknown plaintext training target.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sym="0123456789abcdefghijklmnopqrs";
const alpha=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
/** @param {string} text @param {boolean} io @returns {Set<string>} */
function build(text,io){
  const m=new Map(alpha.map((x,i)=>[x,sym[i]]));m.set("ING",sym[21]);if(io)m.set("IO",sym[27]);
  const d=new Set();
  for(const line of text.split(/\r?\n/)){
    const r=/^([a-z]+)\s+(\d+)\s*$/.exec(line);if(!r)continue;
    const w=r[1].toUpperCase().replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");
    /** @param {number} i @param {string} p */
    function rec(i,p){if(i===w.length){d.add(p);return;}for(let n=1;n<=3&&i+n<=w.length;n++){const z=m.get(w.slice(i,i+n));if(z!==undefined)rec(i+n,p+z);}}
    rec(0,"");
  }return d;
}
/** @param {string} text @param {object} native @param {object} fixture */
function evaluate(text,native,fixture){
  const old=build(text,false),neu=build(text,true),extras=fixture.added.split(/\s+/);
  const rune=new Map(native.runes.map((x,i)=>[x,sym[i]]));
  const truth=new Set(native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w).map(x=>rune.get(x)||"").join("")).filter(Boolean)));
  const missing=d=>[...truth].filter(x=>!d.has(x)).sort();
  const fullOld=new Set([...old,...extras]),fullNew=new Set([...neu,...extras]);
  let fnv=2166136261;for(const x of [...fullNew].sort().join("\n"))fnv=Math.imul(fnv^x.charCodeAt(0),16777619)>>>0;
  const r={old:old.size,new:neu.size,oldPlus:fullOld.size,newPlus:fullNew.size,extraNew:[...fullNew].filter(x=>!fullOld.has(x)).length,native:truth.size,oldMissing:missing(old),newMissing:missing(neu),addedNative:[...truth].filter(x=>!old.has(x)&&neu.has(x)).sort(),fnv:fnv.toString(16),missingAfterExtras:missing(fullNew)};
  assert.equal(r.old,38910);assert.equal(r.new,40730);assert.equal(r.oldPlus,38938);assert.equal(r.newPlus,40751);assert.equal(r.extraNew,1813);assert.equal(r.native,272);assert.equal(r.oldMissing.length,28);assert.equal(r.newMissing.length,21);assert.equal(r.addedNative.length,7);assert.equal(r.fnv,"cf60443a");assert.equal(r.missingAfterExtras.length,0);
  return r;
}
console.log(JSON.stringify(evaluate(read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),JSON.parse(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"))),null,2));
