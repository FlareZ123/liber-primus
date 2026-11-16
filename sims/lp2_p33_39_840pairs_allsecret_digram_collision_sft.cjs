"use strict";

/**
 * Conditional all-secret original LP2 p33-39 GF(29²) pair-bijection gate.
 * The 7-page chapter has exactly 1680 GP symbols = 840 adjacent pairs.
 * Cuneiform numerals 1033 and 3301 are both units of group order 840.
 * Every *bijective* map B from 841 ordered rune pairs to the same alphabet
 * preserves whether each pair of equal input words has equal output words.
 * This holds regardless of field polynomial, secret exponent, field key,
 * arbitrary 841! lookup table, and either pair-reading orientation.
 *
 * Scopes: one key whole chapter; two alternating secret keys whole chapter;
 * one independent key per printed physical page; two alternating per page.
 * Models that change key at EACH pair are outside this theorem.
 *
 * Run: node sims/lp2_p33_39_840pairs_allsecret_digram_collision_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.slice(33, 40);
const pageLengths = [214, 261, 271, 238, 228, 228, 240];
assert.deepEqual(pages.map(p=>p.page), [33,34,35,36,37,38,39]);
assert.deepEqual(pages.map(p=>p.indices.length), pageLengths);
const whole = pages.flatMap(p=>p.indices);
assert.equal(whole.length,1680);
const modulo = n => (n%29+29)%29;
assert.equal(1033%840,193);
assert.equal(3301%840,781);
// Both original cuneiform numerals are coprime to |GF841^*|=840.
assert.equal(193%7,4);
assert.equal(781%7,4);

/** @param {string} plain @returns {number[]} */
function gp(plain) {
  const map = new Map(corpus.translit.map((symbol,i)=>[symbol,i]));
  const normalized=plain.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C")
    .replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g," ");
  const output=[];
  for(const word of normalized.split(" "))for(let j=0;j<word.length;){
    const pair=map.get(word.slice(j,j+2));
    if(pair!==undefined){output.push(pair);j+=2}
    else{const single=map.get(word[j]);assert.notEqual(single,undefined);output.push(single);j++}
  }
  return output;
}
/** @param {number[]} tape @returns {number[][]} */
function asPages(tape){
  assert.equal(tape.length,1680);
  let k=0;const result=pageLengths.map(n=>{const block=tape.slice(k,k+n);k+=n;return block});
  assert.equal(k,1680);return result;
}
/**
 * Four hard, key-independent collision invariants.
 * @param {number[]} tape
 * @returns {{global:number,globalParity:number,pageKey:number,pageParity:number}}
 */
function counts(tape){
  const source=asPages(tape);
  const observed={global:new Map(),globalParity:new Map(),pageKey:new Map(),pageParity:new Map()};
  const incr=(map,k)=>map.set(k,(map.get(k)||0)+1);
  for(let i=0;i+1<tape.length;i+=2){
    const code=29*tape[i]+tape[i+1],block=i/2;
    incr(observed.global,String(code));
    incr(observed.globalParity,(block%2)+":"+code);
  }
  for(let p=0;p<source.length;p++){
    const page=source[p];
    for(let j=0;j+1<page.length;j+=2){
      const code=29*page[j]+page[j+1],local=j/2;
      incr(observed.pageKey,p+":"+code);
      incr(observed.pageParity,p+":"+(local%2)+":"+code);
    }
  }
  const collision=map=>[...map.values()].reduce((s,n)=>s+n*(n-1)/2,0);
  return Object.fromEntries(Object.entries(observed).map(([k,map])=>[k,collision(map)]));
}
const original=counts(whole);
assert.equal(original.global,461);
assert.equal(original.globalParity,227);

/**
 * An invertible affine 841-to-841 pair alphabet:
 * [a',b']=[3a+5b+7, 11a+9b+4] mod29, determinant = -28 = 1 mod29.
 * Per-page/parity constants deliberately vary its secret bijections.
 * @param {number} a @param {number} b @param {number} p @param {number} par
 * @returns {[number,number]}
 */
function encrypt(a,b,p,par){
  return [modulo(3*a+5*b+7+3*p+13*par),modulo(11*a+9*b+4+5*p+17*par)];
}
/** @param {number} a @param {number} b @param {number} p @param {number} par
 * @returns {[number,number]} */
function decrypt(a,b,p,par){
  const x=modulo(a-7-3*p-13*par),y=modulo(b-4-5*p-17*par);
  return [modulo(9*x-5*y),modulo(-11*x+3*y)];
}
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const output=encrypt(a,b,2,1);
  assert.deepEqual(decrypt(...output,2,1),[a,b]);
}
const sources=[
  {name:"Gibran",file:"resources/control/gibran_prophet_58585.txt"},
  {name:"Shakespeare",file:"resources/control/shakespeare_first300k.txt"},
  {name:"Emerson",file:"resources/control/emerson_essays_2944.txt"}
];
const stride=337;
const controls=[];
for(const source of sources) {
  const encoded=gp(read(source.file));
  const windows=[];
  for(let start=0;start+1680<=encoded.length;start+=stride) {
    windows.push({start,...counts(encoded.slice(start,start+1680))});
  }
  assert.ok(windows.length>=30);
  const min={},max={};
  for(const key of Object.keys(original)){
    min[key]=Math.min(...windows.map(w=>w[key]));
    max[key]=Math.max(...windows.map(w=>w[key]));
    assert.ok(min[key]>original[key],`${source.name} ${key} had native control collision <= original`);
  }
  controls.push({name:source.name,sourceRunes:encoded.length,windows:windows.length,stride,min,max});
}

// Independent original-shape native GP plant tested against separate,
 // correctly scoped secret maps: global, per page, and page plus parity.
const plant=gp(read(sources[0].file)).slice(0,1680);
const plantPages=asPages(plant);
/** @param {"global"|"page"|"pageParity"} scope
 * @returns {{encoded:number[], recovered:number[]}} */
function plantCipher(scope) {
  const encoded=[], recovered=[];
  for(let p=0;p<plantPages.length;p++){
    const source=plantPages[p],out=[],back=[];
    for(let j=0;j<source.length;j+=2){
      if(j+1===source.length){out.push(source[j]);back.push(source[j]);continue}
      const secretPage=scope==="global"?0:p;
      const secretParity=scope==="pageParity"?(j/2)%2:0;
      const cipher=encrypt(source[j],source[j+1],secretPage,secretParity);
      out.push(...cipher);
      back.push(...decrypt(...cipher,secretPage,secretParity));
    }
    assert.deepEqual(back,source);
    encoded.push(...out);recovered.push(...back);
  }
  assert.deepEqual(recovered,plant);
  return {encoded,recovered};
}
/**
 * Global chapter pairs are clocked across page boundaries, two of which
 * are odd-length; a global-map positive MUST use the global pair grouping.
 * @param {boolean} alternating
 * @returns {number[]}
 */
function globalCipher(alternating){
  const result=[];
  for(let j=0;j<plant.length;j+=2){
    const secretParity=alternating?(j/2)%2:0;
    const cipher=encrypt(plant[j],plant[j+1],0,secretParity);
    result.push(...cipher);
    assert.deepEqual(decrypt(...cipher,0,secretParity),plant.slice(j,j+2));
  }
  return result;
}
const positiveBefore=counts(plant);
const globalEncoded=globalCipher(false),globalParityEncoded=globalCipher(true),
  pagePlant=plantCipher("page"),parityPlant=plantCipher("pageParity");
assert.equal(positiveBefore.global,counts(globalEncoded).global);
assert.equal(positiveBefore.globalParity,counts(globalParityEncoded).globalParity);
assert.equal(positiveBefore.pageKey,counts(pagePlant.encoded).pageKey);
assert.equal(positiveBefore.pageParity,counts(parityPlant.encoded).pageParity);
assert.ok(positiveBefore.pageParity>original.pageParity);
console.log(JSON.stringify({
  premise:"1680 original rune chapter = 840 ordered GP29 rune pairs, cuneiform units 1033 & 3301",
  originalPages:pageLengths, original,
  controlScope:"source-native GP29 prose, complete original 1680 symbol shape",
  controls,
  positive:{runesRecovered:pagePlant.recovered.length,
   globalEqualPairs:positiveBefore.global,pageKeyEqualPairs:positiveBefore.pageKey,
   pageParityEqualPairs:positiveBefore.pageParity,
   distinctScopesPreserved:["global","globalParity","pageKey","pageParity"]},
  conclusion:"conditional all-841!-secret fixed-pair substitution family excluded for these three source-native English registers; no plaintext/key"
},null,2));
