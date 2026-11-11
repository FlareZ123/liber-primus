"use strict";

/**
 * Original-source "shed our own circumferences" finite inverse gate.
 *
 * The solved PARABLE instruction suggests deleting the first and last
 * GP rune from every canonical printed word, preserving linewraps.
 * This operation gives 43 p55 interior runes, matching the authenticated
 * 2016 clear-signed message's 43 natural-language words and a distinct
 * 43-byte bracketed numerical-table interval. Check the already published
 * 43-step table->p32 compass readout against the independently published
 * p55 inner runes, including an arbitrary stationary secret substitution.
 *
 * This is a source-alignment hypothesis, NOT an authenticated cipher or
 * plaintext. Run: node sims/lp2_p55_shed_circumference_43_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname,"..");
const load = (p) => fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const text = load("resources/lp2-transcription.txt");
const asc = load("resources/historical/cicada2016-4gq25-outguess.asc");

const runePages = text.split("%");
assert.equal(runePages.length,57);
const gpRunic = /[\u16A0-\u16FF]+/gu;
/** @param {number} runePage @returns {string[]} */
function words(runePage) {
  return runePages[runePage].replace(/\/\s*/g,"").match(gpRunic)||[];
}
/** @param {string[]} list @returns {number[]} */
function insides(list) {
  return list.flatMap(w=>[...w].slice(1,-1))
    .map(r=>corpus.runes.indexOf(r));
}
const p55Words = words(54); // rune page54 = physical p55
const p55 = corpus.pages.find(p=>p.page===55).indices;
assert.equal(p55Words.length,17);
assert.deepEqual(p55Words.map(w=>[...w].length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(p55Words.reduce((n,w)=>n+[...w].length,0),76);
const inner55 = insides(p55Words);
assert.equal(inner55.length,43);
assert.equal(inner55.reduce((s,i)=>s+corpus.prime[i],0),2060);

// PARABLE's 19 body words (95 minus 7 heading runes) also shed two
// runes each to leave exactly 50. The numerical-only physical p50
// is a candidate destination, not proof of a directed instruction.
const p57Words = words(56); // rune page56 = physical p57
const p57 = corpus.pages.find(p=>p.page===57).indices;
assert.equal(p57Words.length,20);
assert.equal(p57Words[0].length,7);
assert.equal(p57.length,95);
assert.equal(insides(p57Words.slice(1)).length,50);
assert.equal(corpus.pages.find(p=>p.page===50).indices.length,0);

// Independent image-selected 2016 tree page p32 has 7/15 printed words
// and precisely 33/88 ciphertext runes in its two original sentences.
// The same original tree's sharp counterpart appears on p55. Deleting
// the outside of each p55 word leaves an OUTSIDE sequence of 33 runes,
// while the solved p57 PARABLE body independently has 88 runes.
// The 33+88=121 and 33+43=76 correspondences do not yet specify a cipher.
const p32Words=words(32);
assert.equal(p32Words.length,22);
const first32=p32Words.slice(0,7).reduce((n,w)=>n+[...w].length,0);
const second32=p32Words.slice(7).reduce((n,w)=>n+[...w].length,0);
assert.deepEqual([first32,second32],[33,88]);
const outside55=p55Words.flatMap(w=>{
  const a=[...w];
  return a.length===1?a:[a[0],a[a.length-1]];
}).map(r=>corpus.runes.indexOf(r));
assert.equal(outside55.length,33);
const all32=corpus.pages.find(p=>p.page===32).indices;
const p32First=all32.slice(0,33);
const p32Tail=all32.slice(33);
const p57Body=p57.slice(7);
assert.deepEqual([p32First.length,p32Tail.length,p57Body.length],[33,88,88]);
assert.equal(p32First.filter((v,i)=>v===outside55[i]).length,1);
assert.equal(p32Tail.filter((v,i)=>v===p57Body[i]).length,2);

// A different, complete all-hidden-key inverse of the same 88-rune
// source-selected known-plaintext suggestion: the printed numeric table has
// eight columns. Its natural 8-rune grouping gives 11 plaintext blocks of
// length 8 and 11 p32 cipher blocks. Any Hill8 key M over GF29 requires
// rank([P|C]) == rank(P), and any affine Hill8 key M,b requires
// rank([P|1|C]) == rank([P|1]), even with ALL secret coefficients.
const mod29=n=>((n%29)+29)%29;
const inverses=Array(29).fill(0);
for(let x=1;x<29;x++)for(let y=1;y<29;y++)
  if((x*y)%29===1)inverses[x]=y;
/** @param {number[][]} source @returns {number} */
function finiteRank(source){
  const a=source.map(v=>v.slice());
  let rank=0;
  for(let col=0;col<a[0].length&&rank<a.length;col++){
    let pivot=rank;
    while(pivot<a.length&&!a[pivot][col])pivot++;
    if(pivot===a.length)continue;
    [a[pivot],a[rank]]=[a[rank],a[pivot]];
    const scale=inverses[a[rank][col]];
    for(let j=col;j<a[0].length;j++)a[rank][j]=a[rank][j]*scale%29;
    for(let i=rank+1;i<a.length;i++){
      const factor=a[i][col];
      if(factor)for(let j=col;j<a[0].length;j++)
        a[i][j]=mod29(a[i][j]-factor*a[rank][j]);
    }
    rank++;
  }
  return rank;
}
const blocks=(arr)=>Array.from({length:11},(_,i)=>arr.slice(8*i,8*i+8));
const plain88=blocks(p57Body),cipher88=blocks(p32Tail);
const hillPlainRank=finiteRank(plain88);
const hillCombinedRank=finiteRank(plain88.map((p,i)=>p.concat(cipher88[i])));
const affinePlain=plain88.map(p=>p.concat([1]));
const affinePlainRank=finiteRank(affinePlain);
const affineCombinedRank=finiteRank(affinePlain.map((p,i)=>p.concat(cipher88[i])));
assert.deepEqual([hillPlainRank,hillCombinedRank],[8,11]);
assert.deepEqual([affinePlainRank,affineCombinedRank],[9,11]);
assert.ok(hillCombinedRank>hillPlainRank);
assert.ok(affineCombinedRank>affinePlainRank);

// Deterministic native positive: plant one unknown affine Hill8 transform
// without consulting the ciphertext, proving that the rank criterion allows
// all model-generated source-controlled cases.
const seededLinear=plain88.map(p=>p.map((v,j)=>
  mod29(v + 2*p[(j+1)%8])));
const seededAffine=seededLinear.map(v=>v.map(x=>mod29(x+7)));
assert.equal(finiteRank(plain88.map((p,i)=>p.concat(seededLinear[i]))),
  hillPlainRank);
assert.equal(finiteRank(affinePlain.map((p,i)=>p.concat(seededAffine[i]))),
  affinePlainRank);

// Use exact 2016 PGP-signed message grammar as source counts.
const signed = asc.slice(asc.indexOf("Hello."),
  asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
assert.ok(signed.startsWith("Hello."));
const signedWords = signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
assert.equal(grid.bytes.length,256);
assert.deepEqual([82,83,127,128].map(i=>grid.bytes[i]),
  [201,193,193,201]);
const table43 = grid.bytes.slice(84,127);
assert.equal(table43.length,inner55.length);

// Frozen existing companion 43-byte compass: 32 rows give distance byte>>3,
// eight printed columns give clockwise compass byte&7, toroidal p32 11x11,
// source-selected HOMEX at the first rune of row three.
const p32 = corpus.pages.find(p=>p.page===32).indices;
assert.equal(p32.length,121);
assert.equal(p32.slice(33,38).map(i=>corpus.translit[i]).join(""),"HOMEX");
const directions = [
  [-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]
];
const mod = (n,m) => ((n%m)+m)%m;
let row=3,col=0;
const visited=[];
for(const byte of table43) {
  const [dy,dx]=directions[byte&7], distance=byte>>3;
  row=mod(row+dy*distance,11);
  col=mod(col+dx*distance,11);
  visited.push(p32[row*11+col]);
}
assert.deepEqual([row,col],[3,4]);
assert.equal(new Set(visited).size,21);
assert.equal(visited.filter((v,i)=>v===inner55[i]).length,1);

/**
 * Optimizer over every possible stationary GP29 lookup (including secret,
 * noninjective dictionaries). Min alterations are 43 minus the sum of
 * each input group's plurality output count.
 * @param {number[]} inputs
 * @param {number[]} outputs
 * @returns {number}
 */
function minChanges(inputs,outputs) {
  assert.equal(inputs.length,outputs.length);
  const m = new Map();
  inputs.forEach((i,n)=>{
    const count=m.get(i)||new Map();
    count.set(outputs[n],(count.get(outputs[n])||0)+1);
    m.set(i,count);
  });
  let fits=0;
  for(const count of m.values()) fits+=Math.max(...count.values());
  return outputs.length-fits;
}
// Complete all-secret monoalphabetic key check on the independently
// solved 88-rune PARABLE body against image-selected p32's second clause.
// Zero errors are necessary for a stationary substitution on identical text.
const known88Changes=minChanges(p57Body,p32Tail);
assert.equal(known88Changes,63);
let seed88=0x33018876;
function random88(){
  seed88^=seed88<<13;
  seed88^=seed88>>>17;
  seed88^=seed88<<5;
  return (seed88>>>0)/0x100000000;
}
let null88AsGood=0;
for(let n=0;n<2000;n++){
  const perm=p32Tail.slice();
  for(let j=perm.length-1;j>0;j--){
    const k=Math.floor(random88()*(j+1));
    [perm[j],perm[k]]=[perm[k],perm[j]];
  }
  if(minChanges(p57Body,perm)<=known88Changes)null88AsGood++;
}
assert.equal(null88AsGood,1402);

const actual=minChanges(visited,inner55);
assert.equal(actual,20);

// Source-native all-secret lookup plant, with single forced edit.
const plant=visited.map(v=>(11*v+7)%29);
assert.equal(minChanges(visited,plant),0);
const eq=visited.findIndex((v,i)=>visited.indexOf(v)!==i);
assert.ok(eq>0);
const changed=plant.slice();
changed[eq]=(changed[eq]+1)%29;
assert.equal(minChanges(visited,changed),1);

// Hold rune inventory fixed; refit exactly the same ALL-secret lookup
// to every randomized assignment, no language scoring or searched shift.
let seed=0x33245567;
function uniform(){
  seed^=seed<<13;
  seed^=seed>>>17;
  seed^=seed<<5;
  return (seed>>>0)/0x100000000;
}
let atLeastAsGood=0;
const trials=2000;
for(let n=0;n<trials;n++){
  const shuffled=inner55.slice();
  for(let j=shuffled.length-1;j>0;j--){
    const k=Math.floor(uniform()*(j+1));
    [shuffled[j],shuffled[k]]=[shuffled[k],shuffled[j]];
  }
  if(minChanges(visited,shuffled)<=actual)atLeastAsGood++;
}
assert.equal(atLeastAsGood,866);

console.log(JSON.stringify({
  source:"p57 PARABLE circumference instruction, printed p55, signed-2016 words, source 43-byte table bracket",
  p55:{words:p55Words.length,runes:p55.length,singletons:1,interior:inner55.length,interiorGpPrimeSum:2060},
  p57:{bodyWords:19,bodyInteriorRunes:50,runelessPage:50},
  treeBridge:{p32Clauses:[33,88],p55Outside:33,p57Body:88,firstClauseLiteralMatches:1,bodyLiteralMatches:2,allSecretMonoalphabeticChanges:known88Changes,shuffleAsGoodOrBetter:null88AsGood,shuffleDraws:2000,hill8Ranks:[hillPlainRank,hillCombinedRank],affineHill8Ranks:[affinePlainRank,affineCombinedRank]},
  signed2016Words:signedWords.length,
  tableWindow:[84,127],delimiters:[201,193,193,201],
  p32Compass:{visitedDistinct:new Set(visited).size,literalMatches:1,arbitraryStationaryLookupMinimumChanges:actual},
  positive:"source-lookup plant 0 changes; one wrong rune forces 1",
  fixedInventoryNull:{trials,asGoodOrBetter:atLeastAsGood,addOneTail:(atLeastAsGood+1)/(trials+1)},
  status:"exact source arithmetic and limited negative; no unknown plaintext or source-prescribed decoder"
},null,2));
