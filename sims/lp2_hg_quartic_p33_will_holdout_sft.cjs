'use strict';
/**
 * An original-source frozen GF29 quartic H×G feedback keystream, seeded
 * exclusively by the independently published p33 WILL four-rune local crib.
 * Tests the 210 held-out original p33 runes. Does not search seeds/phases.
 * Windows 11 / Node.js 22: node sims/lp2_hg_quartic_p33_will_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname,'..');
const read = relative => fs.readFileSync(path.join(ROOT,relative),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const original = gp.pages.find(p => p.page === 33).indices;
const mod = x => ((x%29)+29)%29;
function inverse(x){
  for(let y=1;y<29;y++) if(x*y%29===1) return y;
  assert.fail('No inverse for '+x);
}
const H=[3,26,24],G=[27,5,15];
const poly=Array(5).fill(0);
for(let i=0;i<H.length;i++)
  for(let j=0;j<G.length;j++)poly[i+j]=mod(poly[i+j]+H[i]*G[j]);
assert.deepEqual(poly,[23,21,11,17,12]);
const desc=poly.slice().reverse();
const B=grid.byte_rows.flat().map(x=>x%29);
assert.equal(B.length,256);
const remain=B.slice(),quotient=[];
for(let i=0;i<=B.length-desc.length;i++){
  const coeff=mod(remain[i]*inverse(desc[0]));
  quotient.push(coeff);
  for(let j=0;j<desc.length;j++)
    remain[i+j]=mod(remain[i+j]-coeff*desc[j]);
}
assert.deepEqual(remain.slice(-4),[0,0,0,0]);
assert.equal(quotient.length,252);
assert.equal(original.length,214);
assert.deepEqual(original.slice(132,136),[3,15,17,22]);
const expectedWILL=[7,10,20,20];
const sourceSeed=original.slice(132,136).map((c,i)=>mod(c-expectedWILL[i]));
assert.deepEqual(sourceSeed,[25,5,26,2]);
const k=Array(original.length).fill(0);
for(let j=0;j<4;j++)k[132+j]=sourceSeed[j];
// The original printed grid's descending polynomial order fixes the
// characteristic polynomial P(E) = 23+21E+11E²+17E³+12E⁴.
// Both endpoint coefficients are invertible, so the 4-symbol local
// known-plaintext seed determines the *entire* 214-symbol keystream.
for(let i=136;i<k.length;i++)
  k[i]=mod(-inverse(poly[4])*poly.slice(0,4).reduce(
    (s,v,j)=>s+v*k[i-4+j],0));
for(let i=131;i>=0;i--)
  k[i]=mod(-inverse(poly[0])*poly.slice(1).reduce(
    (s,v,j)=>s+v*k[i+1+j],0));
assert.deepEqual(k.slice(0,20),
  [0,18,4,16,5,2,27,22,18,12,14,26,6,12,26,3,24,18,11,12]);
const decoded=original.map((v,i)=>mod(v-k[i]));
assert.deepEqual(decoded.slice(132,136),expectedWILL);
const encrypted=decoded.map((v,i)=>mod(v+k[i]));
assert.deepEqual(encrypted,original);
const clear=gp.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
const planted=clear.map((v,i)=>mod(v+k[i]));
assert.deepEqual(planted.map((v,i)=>mod(v-k[i])),clear);
const transcript=read('resources/liber-primus/lp2-transcription.txt').split('%')[33];
const runeIndex=new Map(gp.runes.map((s,i)=>[s,i]));
const bounds=[];let local=0,start=-1;
for(const ch of transcript){
  if(runeIndex.has(ch)){if(start<0)start=local;local++;}
  else if(/[-.&$§]/.test(ch)&&start>=0){
    bounds.push([start,local]);start=-1;
  }
}
if(start>=0)bounds.push([start,local]);
assert.equal(local,214);
assert.ok(bounds.some(([a,b])=>a===132&&b===136));
const words=bounds.map(([a,b])=>({
  start:a,roman:decoded.slice(a,b).map(i=>gp.translit[i]).join('')
}));
const dictionary=new Set(read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).map(line=>line.split(/\s+/)[0]));
const matches=words.filter(w=>w.roman.length>=4 &&
  dictionary.has(w.roman.toLowerCase()));
assert.deepEqual(matches,[{start:132,roman:'WILL'}]);
function ioc(input){
  const counts=Array(29).fill(0);
  for(const x of input)counts[x]++;
  return counts.reduce((acc,n)=>acc+n*(n-1),0)/
    (input.length*(input.length-1));
}
assert.equal(ioc(decoded),0.03571585274889211);
console.log(JSON.stringify({
  classification:'No recovered original p33 prose: exact 4-rune source-crib quartic stream is excluded',
  originalSource:'p50 modulo29 H(2013 signed BASE29) times G(p39 red); original p33 WILL local inverse',
  coefficientAscending:poly,quotientSymbols:quotient.length,
  divisionRemainder:remain.slice(-4),
  originalPage33Runes:original.length,
  plantedNativePage57Runes:clear.length,
  knownP33SourceWord:'WILL',originalCribOffset:132,
  sourceCribKey:sourceSeed,
  originalNativeIoC:ioc(decoded),rawCipherIoC:ioc(original),
  decodedPrintedWords:words.length,completeEnglishWordsLength4:matches,
  originalReencryptRunes:original.length,
  outputFirst100:decoded.slice(0,100).map(i=>gp.translit[i]).join(''),
  decision:'A quartic recurrence seeded from p33 WILL produces no additional heldout English words. It does not supply a valid page key; source factorization does not authorize LFSR.'
},null,2));
