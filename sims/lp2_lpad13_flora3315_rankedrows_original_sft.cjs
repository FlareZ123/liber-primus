'use strict';

/**
 * Source-keyed LPAD(13,F) rank-permutation gate, original LP2 p40–55.
 * Windows 11 / Node.js 22 SFT: node sims/lp2_lpad13_flora3315_rankedrows_original_sft.cjs
 * This is a finite candidate test, not a decipherment claim.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {string} */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const symbol=new Map(gp.runes.map((r,i)=>[r,i]));
const initials=ink.pages.filter(p=>p.page>=3&&p.page<=7)
  .flatMap(p=>p.red_spans.map(s=>[...s.runes][0]))
  .map(r=>gp.translit[symbol.get(r)]).join('');
assert.equal(initials,'LPAD');
const words=parseLP2Words(read('resources/liber-primus/lp2-transcription.txt')).words
  .filter(w=>w.startPage>=3&&w.endPage<=7)
  .map(w=>[...w.runes].map(r=>symbol.get(r)));
assert.equal(words.length,255);
assert.equal(words.reduce((a,w)=>a+w.length,0),1145);
assert.equal(Math.max(...words.map(w=>w.length)),12);
const keys=words.map(w=>Array(13-w.length).fill(0).concat(w));
const floral=gp.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.indices);
assert.equal(floral.length,3316);assert.equal(floral[0],0);
const cipher=floral.slice(1),mod=x=>(x%29+29)%29;
/** @param {number[]} a @returns {number} */
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
/** @param {number[]} k @param {boolean} desc @returns {number[]} */
function rank(k,desc){return Array.from({length:13},(_,i)=>i)
  .sort((i,j)=>(desc?k[j]-k[i]:k[i]-k[j])||i-j);}
/** @param {number[]} row @param {number[]} order @param {boolean} inv @returns {number[]} */
function perm(row,order,inv){const y=Array(13);for(let i=0;i<13;i++)if(inv)y[order[i]]=row[i];else y[i]=row[order[i]];return y;}
/**
 * @param {number[]} data
 * @param {boolean} desc
 * @param {boolean} inv
 * @param {number} sign
 * @param {'pre'|'post'} placement
 * @param {boolean} encode
 * @returns {number[]}
 */
function transform(data,desc,inv,sign,placement,encode){
 assert.equal(data.length,3315);const output=[];
 for(let row=0;row<255;row++){
  const key=keys[row],order=rank(key,desc);
  const slice=data.slice(13*row,13*(row+1));
  /** @param {number[]} values @param {number} factor */
  const shift=(values,factor)=>values.map((n,i)=>mod(n+factor*key[i]));
  if(!encode)output.push(...(placement==='pre'
    ?perm(shift(slice,sign),order,inv)
    :shift(perm(slice,order,inv),sign)));
  else output.push(...(placement==='pre'
    ?shift(perm(slice,order,!inv),-sign)
    :perm(shift(slice,-sign),order,!inv)));
 }
 return output;
}
const known=gp.pages.find(p=>p.page===57).indices;
assert.equal(known.length,95);
const plant=Array.from({length:3315},(_,i)=>known[i%95]);
assert.ok(ioc(plant)>0.06);
const tested=[];
for(const desc of [false,true])for(const inv of [false,true])
for(const sign of [-1,0,1])for(const placement of sign===0?['pre']:['pre','post']){
 const plain=transform(cipher,desc,inv,sign,placement,false);
 assert.deepEqual(transform(plain,desc,inv,sign,placement,true),cipher);
 assert.deepEqual(transform(transform(plant,desc,inv,sign,placement,true),
  desc,inv,sign,placement,false),plant);
 tested.push({desc,inv,sign,placement,ioc:ioc(plain),
  opening:plain.slice(0,24).map(i=>gp.translit[i]).join(' ')});
}
assert.equal(tested.length,20);
const best=[...tested].sort((a,b)=>b.ioc-a.ioc);
assert.ok(Math.abs(ioc(cipher)-0.034459958255620156)<1e-14);
assert.ok(Math.abs(best[0].ioc-0.0345797480591048)<1e-14);
assert.ok(tested.every(t=>t.ioc<0.035));
console.log(JSON.stringify({key:'original LPAD 255x13 GP29 source-ordered stable rune ranks',
 originalSourceRunes:1145,insertedZeroPads:2170,targetCipherRunes:3315,
 rawIoc:ioc(cipher),variants:20,top:best.slice(0,5),
 originalForwardChecks:20,plantedP57Roundtrips:20,
 recoveredUnknownPlaintext:false},null,2));
