'use strict';
// Director #2655: literal GP0 BASE29 transport of GEB austere TNT.
// Read-only source test. No language scoring, private alphabet or phase search.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const alphabet = [..."0S=+·()<>[]a'∧∨⊃~∃∀:"];
const codons = ['666','123','111','112','236','362','323','212','213','312','313','262','163','161','616','633','223','333','626','636'];
const map = Object.fromEntries(alphabet.map((x,i)=>[x,codons[i]]));
map[';'] = '611'; // GEB Chapter XIV: proof line separator
const inverse = Object.fromEntries(Object.entries(map).map(([k,v])=>[v,k]));
/** @param {number[]} digits @returns {bigint} */
const from29 = digits => digits.reduce((n,x)=>n*29n+BigInt(x),0n);
/** @param {bigint} n @returns {number[]} */
function to29(n) {
  const digits = [];
  do { digits.unshift(Number(n%29n)); n/=29n; } while(n);
  return digits;
}
/** @param {string} text @returns {string} */
function encode(text) {
  return [...text].map(x=>{assert.ok(map[x], x); return map[x];}).join('');
}
/** @param {string} text @returns {string|null} */
function decode(text) {
  if (text.length%3) return null;
  const groups = text.match(/.{3}/g) ?? [];
  return groups.every(x=>Object.hasOwn(inverse,x)) ? groups.map(x=>inverse[x]).join('') : null;
}
const axioms = ["∀a:~Sa=0","∀a:(a+0)=a","∀a:∀a':(a+Sa')=S(a+a')","∀a:(a·0)=0","∀a:∀a':(a·Sa')=((a·a')+a)"];
// GEB Ch. IX, pp. 268–269: exact worked derivation of 1+1=2,
// normalized from the austere formulas rather than OCR digit typos.
const derivation = [axioms[2],"∀a':(S0+Sa')=S(S0+a')","(S0+S0)=S(S0+0)",axioms[1],"(S0+0)=S0","S(S0+0)=SS0","(S0+S0)=SS0"];
assert.equal(encode(axioms[0]),'626262636223123262111666');
assert.equal(encode(derivation.at(-1)), '362123666112123666323111123123666');
const proof = encode(derivation.join(';'));
const planted = to29(BigInt(proof));
assert.equal(proof.length,315);
assert.equal(planted.length,216);
assert.equal(decode(from29(planted).toString()),derivation.join(';'));
for (const axiom of axioms) {
  assert.equal(decode(from29(to29(BigInt(encode(axiom)))).toString()),axiom);
}
const pages = Object.fromEntries(corpus.pages.map(x=>[x.page,x.indices]));
const spans = [pages[36].slice(99,238),pages[37].slice(0,91),pages[37].slice(91,189),pages[37].slice(189,228).concat(pages[38].slice(0,57)),pages[38].slice(57,186)];
assert.deepEqual(spans.map(v=>v.length),[139,91,98,96,129]);
assert.deepEqual(spans.map(v=>v[0]),[20,9,23,21,8]);
const results = spans.map((v,i)=>{
  const n=from29(v), s=n.toString(), groups=s.match(/.{1,3}/g), ax=encode(axioms[i]);
  assert.deepEqual(to29(n),v);
  return {item:i+1,runes:v.length,distinct:new Set(v).size,firstRune:v[0],
    decimalLength:s.length,first24:s.slice(0,24),illegalDigits:[...s].filter(x=>!'1236'.includes(x)).length,
    validCodons:groups.filter(x=>Object.hasOwn(inverse,x)).length,codonGroups:groups.length,
    firstInvalidCodon:groups.findIndex(x=>!Object.hasOwn(inverse,x)),validProofAlphabet:decode(s)!==null,
    expectedAxiomGpLength:to29(BigInt(ax)).length,matchesCorrespondingAxiom:n===BigInt(ax),beginsWithAxiom:s.startsWith(ax)};
});
assert.deepEqual(results.map(x=>x.illegalDigits),[122,75,78,87,116]);
assert.deepEqual(results.map(x=>x.validCodons),[3,1,2,1,2]);
assert.deepEqual(results.map(x=>x.expectedAxiomGpLength),[17,21,45,21,52]);
assert.ok(results.every(x=>!x.validProofAlphabet&&!x.matchesCorrespondingAxiom&&!x.beginsWithAxiom&&x.firstInvalidCodon===0));
assert.deepEqual(results.map(x=>x.distinct),[29,28,29,28,29]);
console.log(JSON.stringify({control:{formulas:7,decimalDigits:proof.length,gpDigits:planted.length,exactRoundtrip:true},results,decision:'Literal GP0 TNT proof or axiom transport rejected in all five original numbered units. No authored bridge to any different representation established.'},null,2));
