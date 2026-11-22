"use strict";
/**
 * Strict ASCII packing exclusion for the 55 x 233 GP28 nonrepeat stream.
 * All original packet phases, digit directions and two no-repeat rank maps.
 * Node.js 22 CommonJS; exact original-shaped synthetic inverse included.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number[][]} pages @param {"cyclic"|"sorted"} kind */
function ranks(pages, kind) {
  const out = [];
  for (const page of pages) for (let i = 1; i < page.length; i++) {
    const c = page[i], prev = page[i-1];
    if (c === prev) continue;
    const r = kind === "cyclic" ? (c-prev+29)%29-1 : c-Number(c>prev);
    assert.ok(r >= 0 && r < 28);
    out.push(r);
  }
  return out;
}

/** @param {number[]} bytes */
function encodeBytes(bytes) {
  assert.equal(bytes.length, 140);
  let n=0n;
  for (const b of bytes) n=n*256n+BigInt(b);
  const d=Array(233);
  for(let i=232;i>=0;i--){d[i]=Number(n%28n);n/=28n;}
  assert.equal(n,0n);
  return d;
}

/** @param {number[]} digits */
function decodeBytes(digits) {
  assert.equal(digits.length,233);
  let n=0n;
  for(const d of digits) n=n*28n+BigInt(d);
  assert.ok(n < 256n**140n);
  const b=Array(140);
  for(let i=139;i>=0;i--){b[i]=Number(n%256n);n/=256n;}
  return b;
}

/** @param {number[]} seq @param {number[][]} original @param {"cyclic"|"sorted"} kind */
function emit(seq, original, kind) {
  let at=0, repeated=0;
  const out=[];
  for(const page of original) {
    const c=[page[0]];
    for(let i=1;i<page.length;i++){
      const prev=c[i-1];
      if(page[i]===page[i-1]){c.push(prev);repeated++;continue;}
      const r=seq[at++];
      const current=kind==="cyclic"?(prev+r+1)%29:r+Number(r>=prev);
      assert.notEqual(current,prev);
      c.push(current);
    }
    out.push(c);
  }
  assert.equal(at,12815);
  assert.equal(repeated,86);
  return out;
}

/** @param {number} seed */
function random(seed) {
  let s=seed>>>0;
  return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
}

/** @param {object} corpus */
function run(corpus) {
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
  assert.equal(pages.length,55);
  assert.equal(pages.reduce((n,p)=>n+p.length,0),12956);
  assert.equal(pages.reduce((n,p)=>n+p.slice(1).filter((c,i)=>c===p[i]).length,0),86);
  assert.ok(28n**233n > 256n**140n);
  const w=28n**232n, unit=256n**139n;
  const ascii=Array.from({length:28},(_,i)=>i).filter(d=>BigInt(d)*w<128n*unit);
  const printable=Array.from({length:28},(_,i)=>i)
    .filter(d=>BigInt(d)*w<127n*unit && BigInt(d+1)*w>32n*unit);
  assert.deepEqual(ascii,Array.from({length:13},(_,i)=>i));
  assert.deepEqual(printable,Array.from({length:10},(_,i)=>i+3));
  const original={};
  for(const kind of ["cyclic","sorted"]){
    const s=ranks(pages,kind);
    assert.equal(s.length,12815);
    const hist=Array(29).fill(0);
    let weakest={count:29},maximum=0;
    for(let phase=0;phase<233;phase++)for(const reverse of [false,true]){
      const heads=[];
      for(let i=phase;i+233<=s.length;i+=233)heads.push(s[i+(reverse?232:0)]);
      assert.equal(heads.length,phase?54:55);
      const count=new Set(heads).size;
      hist[count]++;
      if(count<weakest.count)weakest={count,phase,reverse};
      maximum=Math.max(maximum,count);
      assert.ok(count>ascii.length);
    }
    assert.equal(weakest.count,20);
    assert.equal(hist.reduce((a,b)=>a+b,0),466);
    original[kind]={weakest,maximum,histogram:hist.map((n,i)=>[i,n]).filter(x=>x[1])};
  }
  // Full original-shaped positive. Secret alphabet known to synthetic inverse only.
  const message="THE PRIMES ARE SACRED AND ALL THINGS SHOULD BE ENCRYPTED. ";
  const bytes=Array.from({length:7700},(_,i)=>message.charCodeAt(i%message.length));
  const digits=[];
  for(let p=0;p<55;p++)digits.push(...encodeBytes(bytes.slice(p*140,(p+1)*140)));
  assert.equal(digits.length,12815);
  const perm=Array.from({length:28},(_,i)=>i),next=random(0x15523328);
  for(let i=27;i>0;i--){const j=next()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}
  const inv=[];
  perm.forEach((value,i)=>{inv[value]=i;});
  const secretSteps=digits.map(d=>perm[d]);
  const planted={};
  for(const kind of ["cyclic","sorted"]){
    const ciphertext=emit(secretSteps,pages,kind);
    const actual=ranks(ciphertext,kind);
    assert.deepEqual(actual,secretSteps);
    const recovered=[];
    for(let p=0;p<55;p++)recovered.push(...decodeBytes(actual
      .slice(p*233,(p+1)*233).map(d=>inv[d])));
    assert.deepEqual(recovered,bytes);
    assert.deepEqual(emit(actual,pages,kind),ciphertext);
    const types=new Set(Array.from({length:55},(_,i)=>actual[i*233]));
    assert.ok(types.size<=printable.length);
    planted[kind]={recovered_ascii_bytes:7700,reencrypted_original_shape_runes:12956,
      exact_original_repeat_sites:86,distinct_packet_leaders:types.size};
  }
  return {source_runes:12956,nonrepeat_ranks:12815,frames:932,
    max_7bit_leading_ranks:ascii.length,max_printable_leading_ranks:printable.length,
    original,planted,
    scope:"55x233 radix28 digits to 55x140 unrestricted 7-bit ASCII bytes, global secret 28-permutation; two predecessor exclusion rules; transparent original doublets"};
}
if(require.main===module){
  const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources",
    "liber-primus","lp2-corpus.json"),"utf8"));
  process.stdout.write(JSON.stringify(run(corpus),null,2)+"\n");
}
module.exports={run,ranks,encodeBytes,decodeBytes,emit};
