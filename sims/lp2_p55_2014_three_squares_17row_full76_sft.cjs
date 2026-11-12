#!/usr/bin/env node
"use strict";

/**
 * Direct original-source LP2 p55 whole-page 76-rune word-vs-row candidate.
 *
 * The historical 2014 three squares have 5+7+5=17 printed rows.
 * Original p55 has 17 printed page-local rune word segments. Align word i to
 * historical row i; the direct, simple "long word" grammar repeats the given
 * row modulo its length as a word-local GP29 Vigenere pad. Test the original
 * fixed row ordering and both directions; do not fit phases, row shuffles,
 * word shifts, or character conversions to the target.
 *
 * From root: node sims/lp2_p55_2014_three_squares_17row_full76_sft.cjs
 * Interpretation conditional: no source instructs Vigenere row cycling.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const source=read("resources/cicada2014-openpuff-magic-squares.txt");
const squareMatrices=source.trim().split(/\r?\n\s*\r?\n/).map(x=>
  x.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squareMatrices.map(s=>s.length),[5,7,5]);
const keyRows=squareMatrices.flat().map(row=>row.map(x=>x%29));
assert.equal(keyRows.length,17);
assert.deepEqual(keyRows.map(r=>r.length),[
  5,5,5,5,5,7,7,7,7,7,7,7,5,5,5,5,5
]);
const words=transcription.split("%")[54].replace(/\/\s*/g,"")
  .match(/[\u16A0-\u16FF]+/gu) || [];
const wordLengths=words.map(w=>[...w].length);
assert.deepEqual(wordLengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const cipher=words.map(w=>[...w].map(r=>c.runes.indexOf(r)));
assert.equal(cipher.length,keyRows.length);
assert.equal(cipher.flat().length,76);
assert.ok(cipher.flat().every(i=>i>=0&&i<29));
const mod=x=>(x%29+29)%29;
/** @param {number[][]} data @param {number} sign */
function transform(data,sign){
  assert.equal(data.length,17);
  return data.map((word,i)=>
    word.map((v,j)=>mod(v+sign*keyRows[i][j%keyRows[i].length])));
}
const decoded=Object.fromEntries([
  ["subtract",transform(cipher,-1)],
  ["add",transform(cipher,1)]
]);
assert.deepEqual(transform(decoded.subtract,1),cipher);
assert.deepEqual(transform(decoded.add,-1),cipher);
const alphabet=c.translit.map((symbol,index)=>({
  token:symbol.toUpperCase(),index
})).sort((a,b)=>b.token.length-a.token.length);
/** @param {string} w */
function encodeWord(w){
  const norm=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
  const values=[];
  for(let i=0;i<norm.length;){
    const match=alphabet.find(x=>norm.startsWith(x.token,i));
    if(!match)return null;
    values.push(match.index);
    i+=match.token.length;
  }
  return values;
}
const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,file])=>({
  name,
  words:(read(file).match(/[A-Za-z]+/g)||[]).map(encodeWord).filter(Boolean)
}));
const hist=Array.from({length:29},()=>new Uint32Array(29));
const unigrams=new Uint32Array(29);
for(const w of controls[0].words)for(let i=1;i<w.length;i++){
  hist[w[i-1]][w[i]]++;
  unigrams[w[i-1]]++;
}
const logp=hist.map((r,i)=>Array.from(r,n=>
  Math.log((n+.25)/(unigrams[i]+29*.25))));
/** @param {number[][]} data */
function bigramScore(data){
  assert.equal(data.length,17);
  let sum=0,n=0;
  for(const word of data){
    for(let k=1;k<word.length;k++){
      sum+=logp[word[k-1]][word[k]];
      n++;
    }
  }
  assert.equal(n,59);
  return sum/n;
}
const rawScore=bigramScore(cipher);
const subScore=bigramScore(decoded.subtract);
const addScore=bigramScore(decoded.add);
assert.ok(Math.abs(rawScore+6.258208659537937)<1e-8);
assert.ok(Math.abs(subScore+5.684912750268688)<1e-8);
assert.ok(Math.abs(addScore+5.983544640047489)<1e-8);

let seed=0x45001117;
/** @returns {number} */
function random32(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return seed>>>0;
}
const controlResults=[];
for(const {name,words:sourceWords} of controls){
  const buckets=Array.from({length:32},()=>[]);
  for(const w of sourceWords)if(w.length<32)buckets[w.length].push(w);
  assert.ok(new Set(wordLengths).size>0);
  for(const n of new Set(wordLengths))assert.ok(buckets[n].length>0);
  let min=Infinity,mean=0,lowSub=0,lowAdd=0;
  const trials=20000;
  for(let i=0;i<trials;i++){
    const plant=wordLengths.map(n=>{
      const bin=buckets[n];
      return bin[random32()%bin.length];
    });
    assert.equal(plant.flat().length,76);
    const value=bigramScore(plant);
    min=Math.min(min,value);
    mean+=value;
    if(value<=subScore)lowSub++;
    if(value<=addScore)lowAdd++;
    if(i===0){
      const encrypted=transform(plant,1);
      const recovered=transform(encrypted,-1);
      assert.deepEqual(recovered,plant);
      assert.equal(bigramScore(recovered),value);
      assert.deepEqual(transform(plant,-1).map((w,i)=>
        w.map((v,j)=>mod(v+keyRows[i][j%keyRows[i].length]))),plant);
    }
  }
  controlResults.push({name,trials,min,mean:mean/trials,
    atOrBelowSub:lowSub,atOrBelowAdd:lowAdd});
}
assert.ok(controlResults.every(x=>x.atOrBelowSub===0&&x.atOrBelowAdd===0));
assert.ok(controlResults.every(x=>x.min>-3.2));
const transliterate=words=>words.map(word=>word.map(i=>c.translit[i]).join(""))
  .join(" | ");
console.log(JSON.stringify({
  classification:"bounded negative: 17 source square rows as direct word-local repeating Vigenere keys",
  originalShape:wordLengths,
  sourceRowLengths:keyRows.map(r=>r.length),
  originalRuneCount:76,
  originalShakespeareTrainedBigramScore:rawScore,
  subtract:{score:subScore,output:transliterate(decoded.subtract),
    exactReencryption:"76/76"},
  add:{score:addScore,output:transliterate(decoded.add),
    exactReencryption:"76/76"},
  originalWordLengthMatchedNativeControls:controlResults,
  genuineNativePositive:"76/76 for both signs and every printed word length",
  caveat:"No original text explicitly prescribes repeat-row padding, Vigenere or this row-word pairing; p55 begins with a carried one-rune segment from p54."
},null,2));
console.log("SFT PASS: all 76 original runes forward reproduced and controls.");
