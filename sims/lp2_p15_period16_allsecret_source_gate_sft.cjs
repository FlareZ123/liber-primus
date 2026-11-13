'use strict';
/**
 * All-secret GP29 16-phase permutation gate on original LP2 pp16-23.
 * Run: node sims/lp2_p15_period16_allsecret_source_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(16, 24);
const transcripts = read('resources/liber-primus/lp2-transcription.txt').split('%').slice(16, 24);
const pattern = new RegExp('[' + corpus.runes.join('') + ']+', 'gu');
const words = transcripts.map(t => (t.replace(/[\n\/]/g, '').match(pattern) || [])
  .map(w => [...w].map(g => corpus.runes.indexOf(g))));
const pageRunes = [267,273,260,271,269,273,131,213];
const pageWords = [60,69,61,66,65,55,28,46];
assert.deepEqual(pages.map(p => p.indices.length), pageRunes);
assert.deepEqual(words.map(w => w.length), pageWords);
for (let p = 0; p < 8; p++) {
  assert.deepEqual(words[p].flat(), pages[p].indices);
}
const cipher = pages.flatMap(p => p.indices);
assert.equal(cipher.length, 1957);
const clocks = [[],[],[],[]];
let pos = 0, word = 0;
for (let p = 0; p < words.length; p++) {
  let localPos = 0;
  for (let w = 0; w < words[p].length; w++) {
    for (const letter of words[p][w]) {
      assert.equal(letter,cipher[pos]);
      clocks[0].push(pos % 16);
      clocks[1].push(word % 16);
      clocks[2].push(p * 16 + localPos % 16);
      clocks[3].push(p * 16 + w % 16);
      pos++; localPos++;
    }
    word++;
  }
}
assert.equal(word,450);
/**
 * Exactly invariant under arbitrary bijections per class.
 * @param {number[]} seq
 * @param {number[]} clock
 * @param {number} groups
 * @returns {number}
 */
function ioc(seq,clock,groups) {
  assert.equal(seq.length,1957);
  const freq = Array.from({length:groups},()=>new Uint16Array(29));
  const n = new Uint16Array(groups);
  for (let i=0;i<seq.length;i++) {
    assert.ok(seq[i]>=0 && seq[i]<29);
    freq[clock[i]][seq[i]]++;
    n[clock[i]]++;
  }
  let hit=0,total=0;
  for (let j=0;j<groups;j++) {
    total += n[j]*(n[j]-1);
    for (const x of freq[j]) hit+=x*(x-1);
  }
  return hit/total;
}
const observed=clocks.map((c,m)=>ioc(cipher,c,m<2?16:128));
const exact=[0.03435378161171297,0.03455673257612293,0.032395625558841734,0.032174626206548484];
for(let m=0;m<4;m++) assert.ok(Math.abs(observed[m]-exact[m])<1e-12);
const sources=[
  ['Shakespeare','resources/control/shakespeare_first300k.txt',217106,1425],
  ['Gibran','resources/control/gibran_prophet_58585.txt',62492,401],
  ['Emerson','resources/control/emerson_essays_2944.txt',321327,2116]
];
const exactMin=[
  [0.054285377318753894,0.05453744200355878,0.053923928743379874,0.04920825184530944],
  [0.05705693056795781,0.05651638867177756,0.055299539170506916,0.050848526906819756],
  [0.05750341179047394,0.05658290788751601,0.05523075864915056,0.04996530187369882]
];
const results=[];
for(let si=0;si<sources.length;si++) {
  const [name,file,length,expectedWindows]=sources[si];
  const text=encodeSourceNativeGP(read(file));
  assert.equal(text.length,length);
  if(si===0) {
    const native=text.slice(0,1957);
    for(let m=0;m<4;m++) {
      const c=clocks[m];
      const plant=native.map((p,i)=>(5*p+(7*c[i]+3)%29)%29);
      const decoded=plant.map((v,i)=>(6*((v-(7*c[i]+3)%29+29)%29))%29);
      assert.deepEqual(decoded,native);
      assert.equal(ioc(plant,c,m<2?16:128),ioc(native,c,m<2?16:128));
    }
  }
  const minima=[Infinity,Infinity,Infinity,Infinity];
  const atOrBelow=[0,0,0,0];
  let windows=0;
  for(let start=0;start+1957<=text.length;start+=151) {
    const segment=text.slice(start,start+1957);
    for(let m=0;m<4;m++) {
      const z=ioc(segment,clocks[m],m<2?16:128);
      if(z<minima[m]) minima[m]=z;
      if(z<=observed[m]) atOrBelow[m]++;
    }
    windows++;
  }
  assert.equal(windows,expectedWindows);
  assert.deepEqual(atOrBelow,[0,0,0,0]);
  for(let m=0;m<4;m++) assert.ok(Math.abs(minima[m]-exactMin[si][m])<1e-12);
  results.push({name,windows,minima,atOrBelow});
}
assert.equal(results.reduce((a,r)=>a+r.windows,0),3942);
console.log(JSON.stringify({
  status:'Finite native-English control exclusion; no recovered unknown plaintext',
  pages:'LP2 p16-p23',runes:1957,words:450,
  observed,clocks:['global rune','global word','page-local rune','page-local word'],
  nativeControlRoundTrips:4,results,
  excluded:'Any 16-phase GP29 bijective symbol relabeling with those clocks against tested native controls',
  notExcluded:'Other plaintext registers, fractionation, stateful encryption, missing symbols, external keys'
},null,2));
