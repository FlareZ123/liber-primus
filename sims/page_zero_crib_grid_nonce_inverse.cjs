"use strict";
/**
 * Original seven-page source-grounded zero-rank crib screen.
 *
 * A maximal byte-packing hypothesis forces the first base-28 digit zero
 * on original LP2 physical pages 8–14. Test whether the eight 32-byte
 * base60-grid keys generate the observed first public GP28 ranks via
 * AES-256-CTR/ChaCha20 page IVs, no hidden rank permutation.
 *
 * All settings are fixed before inspecting language. Exact full 7/7
 * agreement would be required before decoding any remaining ciphertext.
 * Node 22 CommonJS; source-only, read-only.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const originals=corpus.pages.filter(p=>p.page>=8&&p.page<=14);
assert.equal(originals.length,7);
const pageNumbers=originals.map(p=>p.page);
assert.deepEqual(pageNumbers,[8,9,10,11,12,13,14]);
const sourceKeys=[
 ...Array.from({length:8},(_,col)=>({
   name:"column"+col, bytes:Buffer.from(grid.byte_rows.map(r=>r[col]))
 })),
 ...Array.from({length:8},(_,i)=>({
   name:"rows"+i,bytes:Buffer.from(grid.byte_rows.flat().slice(i*32,(i+1)*32))
 }))
];
assert.ok(sourceKeys.every(k=>k.bytes.length===32));

/** @param {number[]} seq */
function pairs(seq){
  const p=[];
  for(let i=1;i<seq.length;i++)if(seq[i]!==seq[i-1])p.push([seq[i-1],seq[i]]);
  return p;
}
const observed=[];
for(const traversal of ["forward","backward"])
for(const significance of ["big","little"])
for(const rank of ["sorted","cyclic"]){
  const values=originals.map(p=>{
    const q=traversal==="forward"?p.indices:p.indices.slice().reverse();
    const e=pairs(q);
    const D=e.length;
    let m=0;
    for(let n=256n,cap=28n**BigInt(D);n<=cap;n*=256n)m++;
    const max=((256n**BigInt(m))-1n)/(28n**BigInt(D-1));
    assert.equal(max,0n);
    const [a,b]=significance==="big"?e[0]:e.at(-1);
    return rank==="sorted"?b-Number(b>a):(b-a+28)%29;
  });
  observed.push({traversal,significance,rank,values});
}

const ivNames=["zero"];
for(const serial of ["physical","scan","local"])
for(const endian of ["be","le"])
for(const placement of ["head","tail"])
  ivNames.push(serial+"-"+endian+"-"+placement);

/** @param {string} name @param {number} page */
function ivFor(name,page){
  const iv=Buffer.alloc(16);
  if(name==="zero")return iv;
  const [source,endian,placement]=name.split("-");
  const n=source==="physical"?page:source==="scan"?page+17:page-8;
  const at=placement==="head"?0:12;
  if(endian==="le")iv.writeUInt32LE(n,at);
  else iv.writeUInt32BE(n,at);
  return iv;
}
/** @param {Buffer} key @param {string} cipher
 * @param {string} ivSpec */
function sevenPads(key,cipher,ivSpec){
  return pageNumbers.map(p=>{
    const c=crypto.createCipheriv(cipher,key,ivFor(ivSpec,p));
    return c.update(Buffer.alloc(1))[0];
  });
}
const mod=x=>(x%28+28)%28;
/** @param {number[]} got @param {number[]} pad
 * @param {"mod"|"scaled"} reduced @param {number} sign */
function successes(got,pad,reduced,sign){
  const expected=pad.map(b=>{
    const r=reduced==="mod"?b%28:Math.floor(28*b/256);
    return mod(sign*r);
  });
  const where=[];
  for(let i=0;i<7;i++)if(got[i]===expected[i])where.push(pageNumbers[i]);
  return {matches:where.length,matchingPages:where,expected};
}
function main(){
  const results=[],count=[0,0,0,0,0,0,0,0];
  for(const item of sourceKeys)
  for(const reversed of [false,true]){
    const key=reversed?Buffer.from(item.bytes).reverse():item.bytes;
    for(const algo of ["aes-256-ctr","chacha20"])
    for(const iv of ivNames){
      const pad=sevenPads(key,algo,iv);
      for(const reducer of ["mod","scaled"])
      for(const sign of [1,-1])
      for(const obs of observed){
        const s=successes(obs.values,pad,reducer,sign);
        count[s.matches]++;
        results.push({
          key:item.name,reversed,algo,iv,reducer,sign,
          rank:obs.rank,traversal:obs.traversal,
          significance:obs.significance,sourceRanks:obs.values,
          matches:s.matches,matchingPages:s.matchingPages,
          expectedRanks:s.expected
        });
      }
    }
  }
  results.sort((a,b)=>b.matches-a.matches||
    a.key.localeCompare(b.key)||a.iv.localeCompare(b.iv));
  // Independent planted control: a genuine source key, genuine page
  // nonces, and a byte reducer must satisfy all seven hard cribs.
  const plantedKey=sourceKeys[2].bytes;
  const truePad=sevenPads(plantedKey,"aes-256-ctr","physical-le-tail");
  const planted=truePad.map(x=>x%28);
  const plant=successes(planted,truePad,"mod",1);
  assert.equal(plant.matches,7);
  assert.equal(results.length,16*2*2*13*2*2*observed.length);
  return {
    source:"Original LP2 physical pages 8–14, 1729 runes",
    forcedZeroPlainRanks:7,variants:results.length,
    scoreCounts:count,perfectOriginal:count[7],
    best:results.slice(0,8),plantedControl:{
      realGridKey:"column2",algorithm:"aes-256-ctr",
      iv:"physical-le-tail",reducer:"mod",sign:1,
      matchingPages:plant.matchingPages,exactSevenOfSeven:true
    },
    conclusion:"A complete original match would require 7/7. "+
      "This test only covers public sorted/cyclic GP28 ranks, "+
      "eight source key columns or eight row chunks, their reversals, "+
      "two standard CSPRNG algorithms, 13 page-IV encodings, "+
      "two 28-reducers and two additive signs. "+
      "Unknown predecessor-row permutations or richer page-state "+
      "derivations are not tested. No original plaintext is recovered."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main};
