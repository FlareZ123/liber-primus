'use strict';
/**
 * Original LP2 p23 (213 runes) + p55 43 physical word interiors,
 * as an exact finite-field syndrome against original p50 root213.
 *
 * This is a conditional source-collision audit, NOT an authenticated
 * cipher or plaintext recovery. In particular the composite/field/2013
 * scalar was recognized after the original numeric table was visible.
 *
 * Windows 11 / Node.js22, CommonJS, standard library only, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'base60-grid.json'),'utf8'));
const transcript=fs.readFileSync(path.join(root,'lp2-transcription.txt'),'utf8');
const p23=corpus.pages[23].indices;
const p55=corpus.pages[55].indices;
const p57=corpus.pages[57].indices;
const table=grid.byte_rows.flat();
const R=213, P=257, A=8;
const mod=(n,m=P)=>(n%m+m)%m;
/** @param {number[]} a @param {number} [x] */
function at(a,x=R) {
  return a.reduce((v,y)=>mod(v*x+y),0);
}
/** @param {number[]} array */
function ioc(array) {
  const n=Array(29).fill(0);
  for(const x of array)n[x]++;
  return n.reduce((a,b)=>a+b*(b-1),0)/(array.length*(array.length-1));
}
assert.equal(p23.length,213);
assert.equal(p55.length,76);
assert.equal(table.length,256);
assert.equal(grid.rows.length,32);
assert.deepEqual(Array.from({length:P},(_,i)=>i)
  .filter(x=>at(table,x)===0),[213]);

// Real printed p55 words including the continued initial p54 rune.
// Exactly one continuation rune precedes 16 full local words. Physical
// hyphens/periods delimit fragments; slash-newline is only a line wrap.
const physical=transcript.split(/\r?\n%\r?\n/)[54]
  .replace(/\/\r?\n/g,'').replace(/\r?\n/g,'');
const runeSet=new Set(corpus.runes);
const fragments=physical.split(/[-.&$§]/)
  .map(text=>[...text].filter(r=>runeSet.has(r))).filter(v=>v.length);
assert.equal(fragments.length,17);
assert.deepEqual(fragments.map(x=>x.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(fragments.flat().map(r=>corpus.runes.indexOf(r)),p55);
const p55Inside=fragments.slice(1).flatMap(word=>
  word.slice(1,-1)).map(r=>corpus.runes.indexOf(r));
assert.equal(p55Inside.length,43);
const original=p23.concat(p55Inside);
assert.equal(original.length,256);

// Exact, post-observed field relationships; GPG2013 DH has A=8.
assert.equal(at(original),249);
assert.equal(at(original),mod(-A));
assert.equal(at(table),0);
// Reversing the two independent source channels fails.
assert.equal(at(p55Inside.concat(p23)),176);
// Plain source-order contiguous 43-rune windows do not imitate syndrome.
const contiguous=Array.from({length:34},(_,start)=>
  at(p23.concat(p55.slice(start,start+43))));
assert.ok(contiguous.every(x=>x!==249));
assert.equal(at(p23.concat(p55.slice(0,43))),256);
assert.equal(at(p23.concat(p55.slice(-43))),84);
assert.equal(at(p23.concat(p57.slice(0,43))),145);

// An EXACT root-producing 256-rune planted control constructed from
// authentic clear p57 GP29 symbols, with no English crib on unknown data.
const plantedPrefix=Array.from({length:255},(_,i)=>p57[(8+i)%p57.length]);
const ending=mod(mod(-A)-R*at(plantedPrefix));
assert.equal(ending,24);
const planted=plantedPrefix.concat([ending]);
assert.ok(planted.every(x=>x<29&&x>=0));
assert.equal(at(planted),249);
const changed=[...original]; changed[255]=mod(changed[255]+1,29);
assert.notEqual(at(changed),249);

// Direct, reversible polynomial-division idea: modify the last source
// coefficient +A in GF257 so that X−213 exactly divides it; the quotient
// has 255 GF257 entries, most of them outside native GP29 domain.
const adjusted=[...original];
adjusted[255]=mod(adjusted[255]+A);
assert.equal(at(adjusted),0);
const quotient=[adjusted[0]];
for(let i=1;i<255;i++)quotient.push(
  mod(adjusted[i]+R*quotient[i-1]));
assert.equal(mod(adjusted[255]+R*quotient.at(-1)),0);
assert.equal(quotient.length,255);
const native=quotient.filter(v=>v<29).length;
assert.equal(native,25);
const quotientReduced=quotient.map(x=>x%29);
assert.ok(Math.abs(ioc(quotientReduced)-0.033441408059286706)<1e-12);


// Shared irreducible-factor test beyond the forced X−213 root.
// Comparing the ACTUAL full 256-byte table polynomial to T+A avoids
// confusing an arranged single checksum with a shared secret polynomial.
/** @param {number} a @param {number} n */
function pow257(a,n){
  let out=1;
  for(;n>0;n=Math.floor(n/2),a=mod(a*a))
    if(n%2)out=mod(out*a);
  return out;
}
/** @param {number[]} a */
function trim(a){
  while(a.length>0 && a[a.length-1]===0)a.pop();
  return a;
}
/** @param {number[]} source @param {number[]} divisor */
function polyRemainder(source,divisor){
  const a=trim([...source]),b=trim([...divisor]);
  const inverse=pow257(b[b.length-1],P-2);
  while(a.length>=b.length){
    const shift=a.length-b.length,scale=mod(a.at(-1)*inverse);
    for(let j=0;j<b.length;j++)
      a[shift+j]=mod(a[shift+j]-scale*b[j]);
    trim(a);
  }
  return a;
}
/** @param {number[]} left @param {number[]} right */
function polynomialGcd(left,right){
  let a=trim([...left]),b=trim([...right]);
  while(b.length>0)[a,b]=[b,polyRemainder(a,b)];
  const inverse=pow257(a.at(-1),P-2);
  return a.map(x=>mod(x*inverse));
}
const sourceGcd=polynomialGcd([...table].reverse(),[...adjusted].reverse());
assert.deepEqual(sourceGcd,[44,1]); // exact X−213, no other factor

console.log(JSON.stringify({
  source:'Original p23 GP length213 plus p55 strict 43-interior rune channel',
  original:{p23Runes:p23.length,p55Runes:p55.length,
    p55Fragments:fragments.length,p55InteriorRunes:p55Inside.length,
    totalCompositeSymbols:original.length},
  sourceField:{GF:P,highFirstOriginalGridBytes:table.length,
    uniqueTableRoot:R,signed2013AliceDH_A:A},
  composite:{originalAtRoot:at(original),negativeA:mod(-A),
    reversedChannelAtRoot:at(p55Inside.concat(p23)),
    contiguousP55Windows:contiguous.length,
    contiguousMatchingMinusA:contiguous.filter(x=>x===mod(-A)).length,
    first43AtRoot:contiguous[0],
    last43AtRoot:contiguous.at(-1),
    solvedP57CrossControlAtRoot:at(p23.concat(p57.slice(0,43)))},
  positiveControl:{source:'repeat authentic p57 clear runes',plantedLastRune:ending,
    plantedGF257Syndrome:at(planted),oneChangedOriginalRunefails:true},
  quotient:{GF257Symbols:quotient.length,coeffsInNativeGP29Domain:native,
    modulo29IoC:ioc(quotientReduced),sourceTableGcdLowFirst:sourceGcd},
  result:'Exact source-shaped GF257 minus-A syndrome, discovered in-sample; no author-selected receiver, readable plaintext or key'
},null,2));
