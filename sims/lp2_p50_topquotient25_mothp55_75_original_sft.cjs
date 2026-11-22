'use strict';
/**
 * LP2 p50 maximum GF29 quotient → 25 GP29 rune key → p55 complete 75-rune
 * moth body (one carried rune excluded). Source-cued finite Vigenere gate.
 * Node.js 22 CommonJS SFT; no fitted phases or candidate key search.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const table=read('resources/liber-primus/lp2-grid-256.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const bytes=table.bytes;
const sha=crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const source=bytes.map((n,i)=>Math.floor(n/29)===8?i:-1).filter(i=>i>=0);
assert.deepEqual(source,[5,9,12,48,56,65,92,115,121,138,140,148,157,158,159,160,166,167,168,170,176,214,227,233,236]);
const key=source.map(i=>bytes[i]%29);
assert.equal(key.length,25);
const c=corpus.pages.find(p=>p.page===55).indices;
assert.equal(c.length,76);
const original=c.slice(1); // first NG carries the previous page's word
assert.equal(original.length,75);
const mod=n=>(n%29+29)%29;
const shift=(plain,sgn)=>plain.map((n,i)=>mod(n+sgn*key[i%key.length]));
const ioc=v=>{
 const f=Array.from({length:29},(_,k)=>v.filter(x=>x===k).length);
 return f.reduce((a,n)=>a+n*(n-1),0)/(v.length*(v.length-1));
};
const print=v=>v.map(n=>corpus.translit[n]).join('/');
const inverse=shift(original,-1),forward=shift(original,1);
assert.deepEqual(shift(inverse,1),original);
assert.deepEqual(shift(forward,-1),original);
assert.ok(Math.abs(ioc(original)-0.03855855855855856)<1e-14);
assert.ok(Math.abs(ioc(inverse)-0.03963963963963964)<1e-14);
assert.ok(Math.abs(ioc(forward)-0.036036036036036036)<1e-14);
const known=corpus.pages.find(p=>p.page===57).indices.slice(0,75);
assert.equal(known.length,75);
assert.deepEqual(shift(shift(known,1),-1),known);
assert.deepEqual(shift(shift(known,-1),1),known);
console.log(JSON.stringify({
 hypothesis:'source p50 q=8 gives 25 GP residues, aligned with LP1 p05 5x5 moth and three complete p55 25-rune blocks',
 status:'both original p55 75-rune inverses nonlinguistic; no key or plaintext recovered',
 sourceKey:print(key),keySourcePositions:source,sourceSha256:sha,
 original:{page:55,firstRuneCarry:c[0],bodyRuneCount:75,IoC:ioc(original)},
 subtraction:{IoC:ioc(inverse),GP29:print(inverse)},
 addition:{IoC:ioc(forward),GP29:print(forward)},
 knownSolvedP57Positive:true,completeReencryption:true
},null,2));
