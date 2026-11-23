'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(dir,'lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(dir,'lp2-ink-annotations.json'),'utf8'));
/** @param {number} n @returns {number[]} */
const pg=n=>corpus.pages.find(p=>p.page===n).indices;
assert.deepEqual(ink.pages.find(p=>p.page===54).large_punctuation,[[9,13,'red']]);
assert.deepEqual(ink.pages.find(p=>p.page===55).large_punctuation,[[76,13,'red']]);
const source=[...pg(54).slice(9),...pg(55)];
assert.deepEqual([pg(54).length,pg(55).length,source.length],[232,76,299]);
const known=['auqgnxjtvdbll3pv','cu343l33nqaekrnw','fv7lyucmeozzd5j4','avowyfgl5lkzfj3n','q4utgdi2n4m4uim5','ut3qtzbrvs7dtvzp','ky2khlqdf7qdznac'].map(host=>Buffer.from(host+'.onion\n','ascii'));
known.forEach(b=>assert.equal(b.length,23));
const phone=Buffer.from('5edb5e8029dd2182560da925ec6cd3e1257efc0b8328b4','hex');
const pad13=Buffer.from('6ab768f540ad4ff1226fce429b06aa970b119262ec46be','hex');
assert.equal(Buffer.from(phone.map((b,i)=>b^pad13[i])).toString('ascii'),'4l6uipnstbggwjyv.onion\n');
/** @param {number[]} runes @returns {Buffer[]} */
function decode(runes) {
  assert.equal(runes.length,299);
  const rows=[];
  for(let i=0;i<23;i++){
    let n=0n;for(const r of runes.slice(i*13,(i+1)*13))n=n*29n+BigInt(r);
    const row=Buffer.alloc(8);
    for(let j=7;j>=0;j--){row[j]=Number(n&255n);n>>=8n}
    rows.push(row);
  }
  return Array.from({length:8},(_,j)=>Buffer.from(rows.map(r=>r[j])));
}
/** @param {Buffer[]} columns @returns {number[]} */
function encode(columns) {
  columns.forEach(b=>assert.equal(b.length,23));
  const out=[];
  for(let i=0;i<23;i++){
    let n=0n;for(let j=0;j<8;j++)n=n*256n+BigInt(columns[j][i]);
    assert.ok(n<29n**13n);
    const digits=Array(13).fill(0);
    for(let j=12;j>=0;j--){digits[j]=Number(n%29n);n/=29n}
    out.push(...digits);
  }
  return out;
}
const actual=decode(source);
assert.deepEqual(encode(actual),source);
const common=Buffer.from(actual[0].map((b,i)=>b^known[0][i]));
const dec=actual.map(row=>Buffer.from(row.map((b,i)=>b^common[i])));
const matches=dec.map((row,j)=>j<7?row.reduce((s,b,i)=>s+Number(b===known[j][i]),0):null);
assert.deepEqual(matches,[23,0,0,0,1,0,0,null]);
const plant=[...known,Buffer.from('abcdef234567wxyz.onion\n','ascii')];
assert.deepEqual(decode(encode(plant)),plant);
console.log(JSON.stringify({status:'PASS',originalRunes:299,payloadBytes:184,historical2013Control:'4l6uipnstbggwjyv.onion',knownOnionMatches:matches,heldoutSuccessorMatches:1,heldoutBytes:138,eighthHex:dec[7].toString('hex'),claim:'common 23-byte XOR pad rejected'},null,2));
