#!/usr/bin/env node
'use strict';

/**
 * Original p22 corpse + unique printed EA|EA doublet -> historically
 * attested Old English Rune Poem final EAR stanza, 2013 pinned source.
 * Exactly one fully specified additive source-key receiver (both signs).
 * Windows Node 22, standalone offline read-only test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const trainSource = fs.readFileSync(path.join(root,'resources/control/gibran_prophet_58585.txt'),'utf8');
const earStanza='Ear byþ egle eorla gehwylcun ðonne fæstlice flæsc onginneþ hraw colian hrusan ceosan blac to gebeddan bleda gedreosaþ wynna gewitaþ wera geswicaþ';
// First-party GP29 and original source mapping. Exact historical stanza in
// pinned 2013 Dukotah transcription, Git blob dea9478b3ded47cc1fbbe30be7b8941486054e07.
// https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/data/keys/runepoem_oe.txt
const tokens = corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
/** @param {string} s @returns {string} */
function normalize(s) {
  return s.replace(/[þðÞÐ]/g,'TH').replace(/[æÆ]/g,'AE')
    .replace(/[ƿǷ]/g,'W').toUpperCase().replace(/QU/g,'CW')
    .replace(/ING/g,'NG').replace(/IO/g,'IA')
    .replace(/K/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
}
/** @param {string} source @returns {number[]} */
function gp(source) {
  const output=[];
  for(const word of (normalize(source).match(/[A-Z]+/g)||[])){
    let w=word;
    while(w){
      const x=tokens.find(item=>w.startsWith(item.t));
      assert.ok(x,'unknown source grapheme '+w);
      output.push(x.i);
      w=w.slice(x.t.length);
    }
  }
  return output;
}
const mod=n=>(n%29+29)%29, p22=corpus.pages[22].indices;
const key=gp(earStanza);
assert.equal(p22.length,131);
assert.equal(key.length,118);
assert.deepEqual(key.slice(0,3),[18,24,4]); // Historical "EAR" normalized as E|A|R.
const printedDoublets=p22.flatMap((v,i)=>i>0&&v===p22[i-1]?[{position:i,rune:v}]:[]);
assert.deepEqual(printedDoublets,[{position:101,rune:28}]);

const english=gp(trainSource);
assert.equal(english.length,62492);
const pair=new Uint32Array(841),tri=new Uint32Array(24389);
for(let i=2;i<english.length;i++){
  pair[english[i-2]*29+english[i-1]]++;
  tri[english[i-2]*841+english[i-1]*29+english[i]]++;
}
/** @param {number[]} a @returns {number} */
function logScore(a){
  let sum=0;
  for(let i=2;i<a.length;i++){
    sum+=Math.log((tri[a[i-2]*841+a[i-1]*29+a[i]]+0.05)/
      (pair[a[i-2]*29+a[i-1]]+29*0.05));
  }
  return sum/(a.length-2);
}
/** @param {number[]} x @returns {number} */
function ioc(x){
  const f=new Uint32Array(29);
  for(const a of x)f[a]++;
  return [...f].reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
const spell=x=>x.map(v=>corpus.translit[v]).join('');
const results=[];
for(const [keyName,k] of [['fullOriginalEARStanza',key],['omitEARTitleControl',key.slice(3)]]){
  for(const sign of [-1,1]){
    const out=p22.map((v,i)=>mod(v+sign*k[i%k.length]));
    // The original key (118 runes) is shorter than 131 cipher runes.
    // This is a single uncomplicated source-continuation (periodic repeat).
    assert.deepEqual(out.map((v,i)=>mod(v-sign*k[i%k.length])),p22);
    const plant=corpus.pages[57].indices.slice(0,85);
    const plantCipher=plant.map((v,i)=>mod(v-sign*k[i%k.length]));
    assert.deepEqual(plantCipher.map((v,i)=>mod(v+sign*k[i%k.length])),plant);
    results.push({keyName,keyRunes:k.length,sign,
      meanGPTrigramLogProbability:logScore(out),ioc:ioc(out),output:spell(out)});
  }
}
assert.ok(results.every(r=>r.meanGPTrigramLogProbability < -4.30));
const p57=corpus.pages[57].indices;
assert.ok(logScore(p57) > -3.0);
console.log(JSON.stringify({
  input:{page22Runes:131,uniqueEARDoublet:printedDoublets,
    source:'old English final 29th Rune Poem EAR stanza',sourceKeyLength:118,
    cipherContinuation:'periodic source stanza repeated only after rune118'},
  calibration:{unmodifiedP22LogScore:logScore(p22),authenticP57LogScore:logScore(p57)},
  directKeyResults:results,
  conclusion:'No native-GP English plaintext; fixed original-source stanza is not an authenticated decoding key.'
},null,2));
