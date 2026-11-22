'use strict';
/**
 * Original 2014 onion7 133/331 as candidate Trifid periods, source-gated SFT.
 * A period is speculative: the HTML offers two integers but does not say Trifid.
 * Model: book-fixed secret GP27 cube, transparent IA/EA, exact GP rune order.
 * @module lp2_onion7_133331_trifid_period_sft
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {test} = require('./trifid_27cube_periods_gate.cjs');
const {apply,gp} = require('./trifid_27cube_allsecret_gate.cjs');

const root = path.join(__dirname,'..');
const read = (rel) => fs.readFileSync(path.join(root,rel),'utf8');
const html = read('resources/external/cicada2014-stage11-onion7-original-index.html');
const title = Number(html.match(/<title>(\d+)<\/title>/)?.[1]);
const div = Number(html.match(/<div id="(\d+)">/)?.[1]);
assert.deepEqual([title,div],[133,331]);
const periods = [title,div];
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
const english = gp(read('resources/control/shakespeare_first300k.txt')).slice(0,original.length);
assert.equal(english.length,original.length);
const cube=Array.from({length:27},(_,i)=>(7*i)%27);
assert.equal(new Set(cube).size,27);

/** @param {number[]} seq @returns {number} */
function ioc(seq){
 const c=Array(29).fill(0);
 for(const x of seq)c[x]++;
 return c.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
const results=[];
for(const period of periods)for(const direction of ['standard','reverse']){
 const bound=test(period,direction);
 const plant=apply(english,cube,direction,true,period);
 assert.deepEqual(apply(plant,cube,direction,false,period),english);
 const inverse=apply(original,cube,direction,false,period);
 assert.deepEqual(apply(inverse,cube,direction,true,period),original);
 results.push({period,direction,allCubeEUpperBound:bound.bound,coreRemainder:12026%period,
   nativeEnglishReferenceMinimumE:1404,excludesThisDirectGPRegister:bound.bound<1404,
   decodedOriginalIOC:ioc(inverse),originalCipherReencryption:original.length,
   knownPlaintextPlant:english.length,rectangleNodes:bound.nodes});
}
console.log(JSON.stringify({source:'2014 onion7 original title and div HTML',
  model:'hypothetical Trifid period 133 or 331; arbitrary book-fixed 27-cube; IA/EA passthrough',
  results,qualification:'No original instruction establishes Trifid or a cube key; roundtrip by itself identifies neither.'},null,2));
