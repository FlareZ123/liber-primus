"use strict";
/**
 * One source-positioned 52-rune p55 / p57 direct-key trial.
 *
 * Original p55's final three printed lines contain 22+22+8=52 runes,
 * beginning at page-local index24; original p57's last52 runes begin at
 * the first rune of SHED after the printed WE MUST, page-local index43.
 * Freeze both exact source cut points and the historically authentic GP29
 * subtractive Vigenere operation, with no guessed phase or reset.
 * This is a hypothesis: the text does not direct using the imperative as
 * a key. No actual p55 plaintext is recovered by this model.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page=n=>corpus.pages.find(x=>x.page===n).indices;
const mod=x=>((x%29)+29)%29;
const c=page(55).slice(24),k=page(57).slice(43);
assert.equal(c.length,52);
assert.equal(k.length,52);
const decoded=c.map((v,i)=>mod(v-k[i]));
assert.deepEqual(decoded.map((v,i)=>mod(v+k[i])),c);
const alphabet=Object.fromEntries(corpus.translit.map((s,i)=>[s,i]));
/** @param {string} text @returns {number[]} */
function gp(text){
 const src=text.toUpperCase().replace(/V/g,"U").replace(/K/g,"C")
   .replace(/Q/g,"C").replace(/Z/g,"S");
 const result=[];
 for(let i=0;i<src.length;i++){
  if(!/[A-Z]/.test(src[i]))continue;
  if(src.slice(i,i+3)==="ING"){result.push(alphabet.NG);i+=2;continue;}
  const pair=src.slice(i,i+2);
  if(Object.hasOwn(alphabet,pair)){result.push(alphabet[pair]);i++;continue;}
  if(Object.hasOwn(alphabet,src[i]))result.push(alphabet[src[i]]);
 }
 return result;
}
const source=gp(read("resources/control/shakespeare_first300k.txt"));
assert.equal(source.length,217644);
const bi=new Uint32Array(841),tri=new Uint32Array(24389);
for(let i=1;i<source.length;i++){
 bi[source[i-1]*29+source[i]]++;
 if(i>=2)tri[(source[i-2]*29+source[i-1])*29+source[i]]++;
}
/** @param {number[]} values @returns {number} */
function score(values){
 let z=0;
 for(let i=2;i<values.length;i++){
  const pair=values[i-2]*29+values[i-1];
  z+=Math.log((tri[pair*29+values[i]]+0.1)/(bi[pair]+2.9));
 }
 return z/(values.length-2);
}
const native=[];
for(let i=0;i+52<=source.length;i+=52)
 native.push(score(source.slice(i,i+52)));
native.sort((a,b)=>a-b);
assert.equal(native.length,4185);
assert.equal(native.filter(v=>v<=score(decoded)).length,0);
const plant=source.slice(5000,5052);
const enc=plant.map((v,i)=>mod(v+k[i]));
assert.deepEqual(enc.map((v,i)=>mod(v-k[i])),plant);
const count=new Uint16Array(29);
decoded.forEach(x=>count[x]++);
const IoC=count.reduce((s,n)=>s+n*(n-1),0)/(52*51);
console.log(JSON.stringify({
 scope:"Original p55 rune24..75 against clear p57 SHED rune43..94",
 length:52,sourceNativePlantRecovered:52,actualRoundtrip:52,
 rawScore:score(c),decodedScore:score(decoded),
 decodedIoC:IoC,nativeControlCount:native.length,
 nativeMinimum:native[0],nativeMedian:native[2092],
 nativeAtOrBelowDecoded:0,
 decodedTranslit:decoded.map(x=>corpus.translit[x]).join("")
},null,2));
