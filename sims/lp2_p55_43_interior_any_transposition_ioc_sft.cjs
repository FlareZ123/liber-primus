"use strict";
/**
 * All-permutation invariant test of the visible p55 strict interiors.
 * A numeric 43-word key could reorder 43 interior runes in any secret
 * manner; reordering cannot change the original unigram histogram or IoC.
 * Compare with source-native GP29 English 43-rune controls. Node 22.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const gp = require("../resources/liber-primus/lp2-corpus.json");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const words = read("resources/lp2-transcription.txt").split("%")[54]
  .replace(/\/\s*/g,"").match(/[\u16A0-\u16FF]+/gu) || [];
const page = gp.pages[55].indices;
const slots = [];
let offset = 0;
for (const w of words) {
  const chars = [...w];
  for(let i=0;i<chars.length;i++) {
    assert.equal(page[offset+i],gp.runes.indexOf(chars[i]));
    if(i>0 && i+1<chars.length)slots.push(offset+i);
  }
  offset += chars.length;
}
assert.deepEqual([words.length,offset,slots.length],[17,76,43]);
const original = slots.map(i=>page[i]);
function ioc(s) {
  const n = Array(29).fill(0);
  for(const v of s)n[v]++;
  return n.reduce((z,v)=>z+v*(v-1),0)/(s.length*(s.length-1));
}
const sourceIoc = ioc(original);
assert.equal(sourceIoc,31/903); // 62 equal unordered rune pairs / 1806 ordered.
const randomOrder = original.map((_,i)=>original.length-1-i);
const reversed = randomOrder.map(i=>original[i]);
assert.equal(ioc(reversed),sourceIoc);
const tokens = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function encode(text) {
  const clean=text.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/Q/g,"C");
  const out=[];
  for(const word of clean.match(/[A-Z]+/g)||[])
    for(let k=0;k<word.length;) {
      const hit=tokens.find(t=>word.startsWith(t.s,k));
      assert(hit);
      out.push(hit.i);
      k+=hit.s.length;
    }
  return out;
}
const corpus=read("resources/control/shakespeare_first300k.txt");
const hold=encode(corpus.slice(240000));
assert.equal(hold.length,43802);
const controls=[];
for(let i=0;i+43<=hold.length;i+=43)
  controls.push(ioc(hold.slice(i,i+43)));
assert.equal(controls.length,1018);
controls.sort((a,b)=>a-b);
assert.equal(controls[0],sourceIoc);
assert.equal(controls.filter(x=>x<=sourceIoc).length,1);
console.log(JSON.stringify({
  p55: {words:words.length,strictInteriors:slots.length,
    originalIoc:sourceIoc,transpositionInvariant:true},
  nativeControl: {windows:controls.length,min:controls[0],
    median:controls[509],atOrBelowOriginal:1},
  finding:"Any direct permutation of 43 interiors has this same rare source-native histogram; one of 1,018 GP English windows matches or falls below it. This is evidence against typical GP English from a permutation alone, not a logical impossibility."
},null,2));
