"use strict";
/**
 * LP2 original 32x8 grid, 56 unsolved physical page slots:
 * one 32-byte AES256 master key plus 56 x 4-byte per-page nonce.
 *
 * Fixed literal layout: first printed column is the 32-byte key.
 * The remaining seven columns, read row by row, make 224 bytes,
 * or one four-byte nonce per physical page p0..p55, including runeless p50.
 *
 * This experiment evaluates two standard 128-bit counter-block placements:
 * [nonce4, zero12] and [zero12, nonce4]. Neither the table's byte radix nor
 * the AES cipher/GP29 bridge is authenticated by Cicada; this is a conditional
 * original-cipher decoding experiment, not a claim that these are true keys.
 *
 * Reproducer: node sims/lp2_p50_aes256_56nonce_direct_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {encode,train}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const file=x=>fs.readFileSync(path.join(root,x),"utf8");
const json=x=>JSON.parse(file(x));
const corpus=json("resources/liber-primus/lp2-corpus.json");
const table=json("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(table.length,32);
assert.ok(table.every(r=>r.length===8));
const original=table.flat();
assert.equal(crypto.createHash("sha256").update(Buffer.from(original)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(original.length,256);
const key=Buffer.from(table.map(row=>row[0]));
const other=Buffer.from(table.flatMap(row=>row.slice(1)));
assert.equal(key.length,32);
assert.equal(other.length,224);
const nonces=Array.from({length:56},(_,i)=>other.subarray(i*4,i*4+4));
assert.ok(nonces.every(x=>x.length===4));
const pages=corpus.pages.filter(p=>p.page<=55);
assert.deepEqual(pages.map(p=>p.page),Array.from({length:56},(_,i)=>i));
const all=pages.flatMap(p=>p.indices);
assert.equal(all.length,12956);
assert.equal(pages[50].indices.length,0);
function iv(nonce,position) {
  const b=Buffer.alloc(16);
  nonce.copy(b,position==="prefix"?0:12);
  return b;
}
function stream(page,mode,len) {
  const cipher=crypto.createCipheriv("aes-256-ctr",key,iv(nonces[page],mode));
  return Buffer.concat([cipher.update(Buffer.alloc(len)),cipher.final()]);
}
const mod=(v,n)=>(v%n+n)%n;
function decode(c,k,kind,sign) {
  let prev=0;
  if(kind==="gp29") return c.map((v,i)=>mod(v+sign*(k[i]%29),29));
  return c.map((v,i)=>{
    const diff=mod(v-prev,29);
    prev=v;
    return diff===0?28:mod(diff-1+sign*(k[i]%28),28);
  });
}
function encodePlain(p,k,kind,sign) {
  let prev=0;
  if(kind==="gp29")return p.map((v,i)=>mod(v-sign*(k[i]%29),29));
  return p.map((v,i)=>{
    if(v!==28)prev=mod(prev+1+mod(v-sign*(k[i]%28),28),29);
    return prev;
  });
}
function ioc(p) {
  const f=Array(29).fill(0);
  p.forEach(x=>f[x]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(p.length*(p.length-1));
}
const text=file("resources/control/shakespeare_first300k.txt");
const native=encode(text);
const model=train(text);
assert.ok(native.length>all.length);
function score(p) {
  let total=0;
  for(let i=2;i<p.length;i++) total+=model.trigram[(p[i-2]*29+p[i-1])*29+p[i]];
  return total/(p.length-2);
}
const rows=[];
const p0=pages[0].indices,p54=pages[54].indices;
const native0=native.slice(0,p0.length);
for(const position of ["prefix","suffix"]) {
 const pads=pages.map(p=>stream(p.page,position,p.indices.length));
 for(const kind of ["gp29","gp28"]) {
  for(const sign of [-1,1]) {
   const decoded=pages.map((p,i)=>decode(p.indices,pads[i],kind,sign));
   const plaintext=decoded.flat();
   assert.equal(plaintext.length,12956);
   for(let i=0;i<pages.length;i++)
     assert.deepEqual(encodePlain(decoded[i],pads[i],kind,sign),pages[i].indices);
   const planted=encodePlain(native0,pads[0],kind,sign);
   assert.deepEqual(decode(planted,pads[0],kind,sign),native0);
   assert.deepEqual(encodePlain(decode(planted,pads[0],kind,sign),pads[0],kind,sign),planted);
   rows.push({iv:position,bridge:kind,sign,
     full_ioc:ioc(plaintext),full_trigram:score(plaintext),
     p0_ioc:ioc(decoded[0]),p0_trigram:score(decoded[0]),
     p54_ioc:ioc(decoded[54]),p54_trigram:score(decoded[54]),
     p0_first60:decoded[0].slice(0,60).map(x=>corpus.translit[x]).join("")});
  }
 }
}
rows.sort((a,b)=>b.full_trigram-a.full_trigram);
const nativePool=native.slice(0,all.length);
const raw={ioc:ioc(all),trigram:score(all)};
const reference={ioc:ioc(nativePool),trigram:score(nativePool)};
const best=rows[0];
console.log(JSON.stringify({
  title:"LP2 p50 first-column AES-256 master and remaining-seven-column 56 page nonces",
  canonical_table_sha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  slots:56,runeless_slot:50,key_len:32,nonces:56,nonce_len:4,
  layout:"first 32-row column; seven remaining columns read row-major; physical page offset",
  cipher:"AES-256-CTR, standard 16-byte IV with nonce at first or last 4 positions",
  consumers:"GP29 additive +/-; GP28 predecessor rank +/- with zero-delta reserved EA",
  initial_clock:"page 0, source-native GP29 index zero at each page for GP28",
  untouched_runes:all.length,raw,reference,
  positive:"8/8 complete source-shaped native controls and all 12,956 exact forward inverse checks pass",
  maximum_full_trigram:best.full_trigram,
  original:rows,
  decision:best.full_trigram<reference.trigram-1
    ?"No credible GP-native original plaintext in this frozen eight-variant AES transfer"
    :"Inspect best result for possible authentic original plaintext"
},null,2));
