'use strict';
/**
 * Exact original-source hash bridge between LP2's 32x8 base60 numeric
 * grid on pages49-51 and the 64-byte deep-web hash printed on solved
 * page56. Check only source-preserving natural byte/text presentations.
 * A match would supply an independent authentic clue linking the two
 * original artifacts. No URL guessing or language-model fitting.
 */
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const file=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const grid=file('resources/liber-primus/lp2-grid-256.json');
const historical=file('resources/cicada2014-archive-hash-manifest.json');
const target=historical.targetHex.toLowerCase();
assert.match(target,/^[0-9a-f]{128}$/);
const pages=grid.pages,rows=pages.flatMap(page=>{
  assert.equal(page.rows*8,page.bytes.length);
  return Array.from({length:page.rows},(_,i)=>page.bytes.slice(i*8,i*8+8));
});
assert.equal(rows.length,32);
const raw=Buffer.from(rows.flat());
assert.equal(raw.length,256);
const alphabet=grid.alphabet;
assert.equal(alphabet.length,60);
const tokens=pages.flatMap(page=>page.tokens);
assert.equal(tokens.length,256);
for(let i=0;i<256;i++){
  const tok=tokens[i],value=60*alphabet.indexOf(tok[0])+alphabet.indexOf(tok[1]);
  assert.equal(value,raw[i]);
}
const baseRows=rows.map(row=>row.map(v=>grid.alphabet[Math.floor(v/60)]+
  grid.alphabet[v%60]));
const variants=new Map();
function add(name,bytes){variants.set(name,Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8'));}
function addPresentation(name,sequence){
  const bytes=Buffer.from(sequence);
  add(name+'-raw',bytes);
  add(name+'-reverse',Buffer.from(bytes).reverse());
  add(name+'-complement',Buffer.from(bytes.map(x=>255-x)));
}
addPresentation('row-major',raw);
addPresentation('column-major',Array.from({length:8},(_,j)=>rows.map(row=>row[j])).flat());
const perPageCol=pages.flatMap(page=>{
  const r=Array.from({length:page.rows},(_,i)=>page.bytes.slice(i*8,i*8+8));
  return Array.from({length:8},(_,j)=>r.map(row=>row[j])).flat();
});
addPresentation('page-local-column',perPageCol);
for(let i=0;i<4;i++)addPresentation('row-major-64chunk'+i,
  raw.subarray(i*64,(i+1)*64));
for(let col=0;col<8;col++){
  addPresentation('column-'+col,rows.map(row=>row[col]));
  if(col%2===0)addPresentation('column-pair-'+(col/2),
    [...rows.map(row=>row[col]),...rows.map(row=>row[col+1])]);
}
for(let i=0;i<8;i++)addPresentation('row-major-32chunk'+i,
  raw.subarray(i*32,(i+1)*32));
add('base60-token-characters-concatenated',tokens.join(''));
add('base60-tokens-joined-spaces',tokens.join(' '));
add('base60-table-linefeed',baseRows.map(row=>row.join(' ')).join('\n'));
add('base60-table-linefeed-final',baseRows.map(row=>row.join(' ')).join('\n')+'\n');
const algorithms=['sha512','sha3-512','blake2b512'];
function digest(bytes,algorithm){return crypto.createHash(algorithm).update(bytes).digest('hex');}
assert.equal(digest(Buffer.from('abc'),'sha512'),'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
function run(){
  let checked=0;const hits=[];
  for(const [label,bytes] of variants){
    for(const algorithm of algorithms){
      const value=digest(bytes,algorithm);checked++;
      if(value===target)hits.push({label,algorithm,inputHex:bytes.toString('hex')});
    }
    checked++;
    if(crypto.createHash('shake256',{outputLength:64}).update(bytes).digest('hex')===target)
      hits.push({label,algorithm:'shake256-512',inputHex:bytes.toString('hex')});
  }
  return {target,source:'Original LP2 grid page49-51 direct numeric table and solved p56 digest',
    originalGridBytes:raw.length,candidateByteRepresentations:variants.size,
    digestAlgorithms:[...algorithms,'shake256-512'],comparisons:checked,
    matches:hits,verdict:hits.length?'EXACT PHYSICAL SOURCE MATCH':'No exact grid presentation produces the stated p56 hash',
    limits:'Only literal naturally arranged original numeric grid and base60 text, with finite native cryptographic digest families; a keyed digest, hidden plaintext or external onion URL remains unresolved.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,variants,digest};
