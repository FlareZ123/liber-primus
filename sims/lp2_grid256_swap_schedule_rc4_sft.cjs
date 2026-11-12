'use strict';
/** Original-LP2 source-table direct swap-address RC4 test.
 * Each source table byte directly chooses the swap target for the matching
 * 0..255 index, then an unkeyed RC4 PRGA emits GP29 pads. This is distinct
 * from standard RC4 KSA and treating the table as a precomputed S-box.
 * Native solved LP2 p57 supplies an independent 95-rune positive plant.
 * Node 22/CommonJS; read-only, no dependencies.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname,'..');
/** @param {string} name */
const load = name => JSON.parse(fs.readFileSync(path.join(base,name),'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const printed = load('resources/liber-primus/lp2-grid-256.json').bytes;
const archived = load('resources/cicada2014-sexagesimal-source.json').decimal_values;
const pages = corpus.pages.filter(p=>p.page<=55&&p.indices.length>0);
const original = pages.flatMap(p=>p.indices);
const known = corpus.pages.find(p=>p.page===57).indices;
assert.equal(pages.length,55);
assert.equal(original.length,12956);
assert.equal(known.length,95);
/** @param {number} x */
const mod = x => (x%29+29)%29;
/** @param {number[]} table @param {number} count */
function prga(table,count){
  assert.equal(table.length,256);
  assert(table.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
  const s=Array.from({length:256},(_,i)=>i);
  for(let i=0;i<256;i++){const j=table[i];[s[i],s[j]]=[s[j],s[i]];}
  const pad=[];let i=0,j=0;
  for(let n=0;n<count;n++){
    i=(i+1)&255;j=(j+s[i])&255;[s[i],s[j]]=[s[j],s[i]];
    pad.push(s[(s[i]+s[j])&255]%29);
  }
  return pad;
}
/**
 * @param {number[]} input @param {number[]} pad
 * @param {'direct'|'difference'} kind @param {number} sign
 * @param {boolean} decrypt @param {number[]} lengths
 */
function transform(input,pad,kind,sign,decrypt,lengths){
  assert.equal(input.length,pad.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0),input.length);
  const out=[];let start=0;
  for(const count of lengths){
    let previous=0;
    for(let t=0;t<count;t++){
      const value=input[start+t],key=pad[start+t];
      if(decrypt){
        out.push(mod((kind==='difference'?value-previous:value)-sign*key));
        previous=value;
      } else {
        const c=mod(value+sign*key+(kind==='difference'?previous:0));
        out.push(c);previous=c;
      }
    }
    start+=count;
  }
  return out;
}
/** @param {number[]} values */
function ioc(values){
  const f=Array(29).fill(0);for(const x of values)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const tables=[['LP2 original',printed],['2014 archive',archived]];
const rows=[];
for(const [tableName,table] of tables)for(const clock of ['book','page']){
  const pad=clock==='book'?prga(table,original.length):
    pages.flatMap(p=>prga(table,p.indices.length));
  for(const kind of ['direct','difference'])for(const sign of [-1,1]){
    const out=transform(original,pad,kind,sign,true,pages.map(p=>p.indices.length));
    assert.deepEqual(transform(out,pad,kind,sign,false,pages.map(p=>p.indices.length)),original);
    const short=prga(table,95);
    assert.deepEqual(transform(
      transform(known,short,kind,sign,false,[95]),short,kind,sign,true,[95]),known);
    rows.push({table:tableName,clock,kind,sign,decodedIoc:ioc(out),
      preview:out.slice(0,32).map(x=>corpus.translit[x]).join(' '),
      nativePlantRecovered:95});
  }
}
assert.equal(rows.length,16);
assert(rows.every(r=>r.decodedIoc>0.0344&&r.decodedIoc<0.0346));
console.log(JSON.stringify({hypothesis:'Direct byte-address swap + RC4 PRGA',
  originalRunes:original.length,originalIoc:ioc(original),
  nativeP57Runes:known.length,nativeP57Ioc:ioc(known),results:rows,
  conclusion:'No unknown GP29 prose decoded in 16 fixed original hypotheses.'},null,2));
