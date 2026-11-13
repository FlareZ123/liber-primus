'use strict';

/**
 * Direct source table inverse, no fitted state or key:
 * original row = preceding ciphertext GP index,
 * original column = eight visible macro-chapter ordinal,
 * GP28 output = log15(nonzero ciphertext delta) - table byte mod28.
 * Zero delta is transparent GP-EA. Chapter first rune is a seed.
 * This does not authenticate the mechanism as a Cicada original cipher.
 * Run: node sims/lp2_grid_cprev_column_root15_gp28_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} p */
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=json('resources/liber-primus/lp2-corpus.json');
const grid=json('resources/liber-primus/lp2-grid-256.json').bytes;
const cipher=db.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
assert.equal(cipher.length,12956);
assert.equal(grid.length,256);
const pow=Array.from({length:28},(_,i)=>{
  let n=1;for(let j=0;j<i;j++)n=n*15%29;return n;
});
assert.equal(new Set(pow).size,28);
const logs=Array(29).fill(-1);
pow.forEach((v,i)=>{logs[v]=i;});
const mod=(x,n)=>(x%n+n)%n;
/** @param {number[]} c @param {number} chapter @returns {number[]} */
function decode(c,chapter) {
  const p=[c[0]];
  for(let i=1;i<c.length;i++){
    const delta=mod(c[i]-c[i-1],29);
    const k=grid[8*c[i-1]+chapter]%28;
    p.push(delta===0?28:mod(logs[delta]-k,28));
  }
  return p;
}
/** @param {number[]} p @param {number} chapter @returns {number[]} */
function encode(p,chapter) {
  const c=[p[0]];
  for(let i=1;i<p.length;i++){
    const prev=c[i-1],k=grid[8*prev+chapter]%28;
    c.push(p[i]===28?prev:mod(prev+pow[mod(p[i]+k,28)],29));
  }
  return c;
}
/** @param {number[]} p */
const ioc=p=>{const f=Array(29).fill(0);for(let x of p)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1));};
const native=db.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const rows=[];
for(let chapter=0;chapter<8;chapter++){
  const c=cipher.slice(cuts[chapter],cuts[chapter+1]);
  const p=decode(c,chapter);
  assert.deepEqual(encode(p,chapter),c);
  assert.deepEqual(decode(encode(native,chapter),chapter),native);
  rows.push({chapter,runes:c.length,decodedIoC:Number(ioc(p).toFixed(9)),
    decodedFirst40Gp:p.slice(0,40).map(x=>db.translit[x]).join('')});
}
assert.deepEqual(rows.map(r=>r.runes),[729,1145,1729,1903,1021,1433,1680,3008]);
assert.deepEqual(rows.map(r=>r.decodedIoC),
  [0.035084942,0.035337588,0.035165371,0.035242378,
    0.03500989,0.035013664,0.03520945,0.03519337]);
assert(rows.every(r=>r.decodedIoC<0.04));
if(require.main===module)console.log(JSON.stringify({
  status:'PASS',originalInputRunes:12956,originalTableCells:256,
  decoder:'row=previous published GP29 rune, col=source visual chapter, root15 nonzero delta, EA zero',
  originalInverseRunes:cuts[8],nativeSolvedPlantPerChapter:95,
  noNinthSourceColumnForTerminal308:true,rows,
  decision:'No native GP29 prose, no original plaintext or authentic source-selected decoder'
},null,2));
module.exports={decode,encode};