'use strict';

/**
 * Bounded cross-artifact AES-128-CTR interpretation:
 * - source p15 red-number-started 4×4 Fibonacci-prime spiral, 16 printed values,
 *   each byte reduced mod256, in authored spiral order => one AES128 key;
 * - p49–51 source 32×8 byte grid with source flower-gap masks22/31 and
 *   gap9 => sixteen disjoint mirrored two-row sixteen-byte IVs;
 * - source p40–55 sixteen flower-framed pages => exactly one IV per page.
 *
 * All source arithmetic is frozen, but AES-CTR and GP29/GP28 transport
 * remain hypotheses, never an authenticated original Cicada instruction.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} f */
const read=(f)=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/base60-grid.json');
assert.equal(corpus.pages.length,58);
const rows=grid.byte_rows.map(r=>Buffer.from(r));
assert.equal(rows.length,32);
assert(rows.every(r=>r.length===8));
assert.equal(crypto.createHash('sha256').update(Buffer.concat(rows)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const printedSpiral=[3299,3298,3296,3294,3288,3278,3258,3222,
 3152,3038,2838,2472,1820,708,1206,4516];
assert.equal(printedSpiral.length,16);
const spiralKey=Buffer.from(printedSpiral.map(x=>x%256));
assert.equal(spiralKey.toString('hex'),'e3e2e0ded8ceba9650de16a81cc4b6a4');
const pair=i=>[((22-9*i)%32+32)%32,(31+9*i)%32];
const pairs=Array.from({length:16},(_,i)=>pair(i));
assert.equal(new Set(pairs.flat()).size,32);
assert(pairs.every(([a,b])=>(a+b)%32===21));
const ivs=pairs.map(([a,b])=>Buffer.concat([rows[a],rows[b]]));
assert.equal(ivs[0].toString('hex'),'eb83a6af9028a751719eace6b424bd50');
assert.equal(ivs[10].toString('hex'),'443449f9900075af6e4ad144c24c7f15');
const pages=corpus.pages.slice(40,56).map(p=>p.indices);
assert.equal(pages.length,16);
assert.equal(pages[10].length,0);
assert.equal(pages.flat().length,3316);
assert.equal(pages.slice(0,14).flat().length,3008);
assert.equal(pages.slice(14).flat().length,308);
const native=corpus.pages[57].indices;
assert.equal(native.length,95);

/** @param {Buffer} iv @param {number} length */
function stream(iv,length) {
 const aes=crypto.createCipheriv('aes-128-ctr',spiralKey,iv);
 return Buffer.concat([aes.update(Buffer.alloc(length)),aes.final()]);
}
/** @param {number[]} src @param {Buffer} ks
 * @param {number} sign @param {boolean} literalF */
function change(src,ks,sign,literalF) {
 let k=0;
 return src.map(x=>{
  if(literalF && x===0)return 0;
  const m=literalF?28:29, v=literalF?x-1:x;
  const y=((v+sign*(ks[k++]%m))%m+m)%m;
  return literalF?y+1:y;
 });
}
/** @param {number[]} a */
function ioc(a) {
 const f=Array(29).fill(0);
 for(const v of a){assert(v>=0&&v<29);f[v]++;}
 return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
for(const literalF of [false,true])for(const sign of [-1,1]) {
 const original=[];
 for(let i=0;i<16;i++) {
  const ks=stream(ivs[i],pages[i].length),p=change(pages[i],ks,sign,literalF);
  assert.deepEqual(change(p,ks,-sign,literalF),pages[i]);
  original.push(p);
  const plant=Array.from({length:pages[i].length},(_,j)=>native[(j+13*i)%native.length]);
  const pc=change(plant,ks,-sign,literalF);
  assert.deepEqual(change(pc,ks,sign,literalF),plant);
 }
 const first=original.slice(0,14).flat(),last=original.slice(14).flat();
 const full=original.flat();
 console.log(JSON.stringify({
  key:spiralKey.toString('hex'),
  ivConstruction:'p50_mirror22-31_gap9',
  ring:literalF?'gp28_literalF':'gp29',
  sign,firstIoC:ioc(first),heldoutIoC:ioc(last),allIoC:ioc(full),
  firstPageFirst40:original[0].slice(0,40).map(x=>corpus.translit[x]).join(' ')
 }));
}
console.log('PASS source-frozen p15 Fibonacci spiral AES128 key + p50 mirrored IVs, all3316 original flower runes, signed GP29/28, exact reencrypt and native positive');
