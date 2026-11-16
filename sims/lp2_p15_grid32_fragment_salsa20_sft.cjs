"use strict";
/**
 * Original LP2 three-artifact Salsa20/20 GP29 inversion experiment.
 *
 * Distinct source objects:
 *  (1) LP2 p15 printed 4x4 Fibonacci-prime square = sixteen 16-bit numbers,
 *      supplying one 32-byte Salsa20/20 key via 2-byte big/little-endian packing;
 *  (2) pp49–51 32x8 base60 byte field = 32 different 8-byte nonces;
 *  (3) 31 authentic 13-dot marks = 32 ordered fragments / nonce assignments.
 *
 * Uses original Salsa20/20 (2005) with 64-bit counter and 64-bit nonce.
 * A source-independent zero-vector tests the implemented 20-round core.
 *
 * We test one standard GP29 additive keystream receiver and two predecessor-
 * exclusion 28-rank receivers (cyclic and ordered). A rank28 receiver emits
 * repeat cipher runes for literal source EA(index 28) and skips that key byte.
 * These additions are NOT authentically selected by the book; the exact
 * encoded 32-byte key, nonce and GP transport are informed hypotheses.
 *
 * Node 22 Windows SFT: node sims/lp2_p15_grid32_fragment_salsa20_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {candidates}=require("./fibonacci_spiral_key_derivation.cjs");
const root=path.resolve(__dirname,"..");
const read=s=>fs.readFileSync(path.join(root,s),"utf8");
const data=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const rows=JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows;
const M=29,mod=(x,m)=>((x%m)+m)%m;
assert.equal(rows.length,32);
assert(rows.every(r=>r.length===8&&r.every(x=>x>=0&&x<256)));
// Salsa20/20 standard zero-key/nonce stream vector is checked below.

const original=data.pages.filter(p=>p.page<=55)
  .flatMap(p=>p.indices);
const all=data.pages.flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.equal(all.length,13136);

const marks=[];
let pageStart=0;
for(const page of data.pages){
  const events=(ink.pages.find(p=>p.page===page.page)
    ?.large_punctuation||[]).filter(m=>m[1]===13);
  for(const event of events) marks.push(pageStart+event[0]);
  pageStart+=page.indices.length;
}
assert.equal(pageStart,13136);
assert.equal(marks.length,31);
marks.sort((a,b)=>a-b);
const bounds=[0,...marks,13136];
assert.equal(bounds.length,33);
assert.equal(bounds[28],12956,"28 fragments are unknown LP2");
assert.deepEqual(bounds.map((b,i)=>i<32&&b===bounds[i+1]?i:-1)
  .filter(i=>i>=0),[8,11]);

// Actual 16 numbers printed on p15, no arbitrary key bytes.
// The authors' clockwise traversal and literal row order are both
// physically readable; endian order is a fixed conventional ambiguity.
const keys=candidates().filter(k=>
  /^absolute-(spiral|row-major):(BE|LE)$/.test(k.name));
assert.equal(keys.length,4);
const keyMap=new Map(keys.map(k=>[k.name,k.key]));
assert(keys.every(k=>k.key.length===32));

/**
 * Portable Salsa20/20 core (Bernstein 20 rounds). Verified against the
 * public zero-key, zero-nonce 64-byte Salsa20/20 reference test vector.
 * This is an unframed stream cipher; original 8-byte printed grid rows
 * specify nonces and each segment starts its 64-bit block counter at zero.
 * @param {Buffer} key 32-byte source key
 * @param {Buffer} nonce 8-byte source nonce
 * @param {number} lo counter low word
 * @param {number} hi counter high word
 * @returns {Uint8Array} 64 stream bytes
 */
function salsaBlock(key,nonce,lo=0,hi=0){
  const read32=(src,i)=>(src[i]|(src[i+1]<<8)|
    (src[i+2]<<16)|(src[i+3]<<24))>>>0;
  const rot=(x,n)=>(x<<n)|(x>>>(32-n));
  const add=(a,b)=>(a+b)>>>0;
  const x=Uint32Array.of(0x61707865,read32(key,0),read32(key,4),
    read32(key,8),read32(key,12),0x3320646e,read32(nonce,0),
    read32(nonce,4),lo,hi,0x79622d32,read32(key,16),
    read32(key,20),read32(key,24),read32(key,28),0x6b206574);
  const z=Uint32Array.from(x);
  for(let n=0;n<10;n++){
    z[4]^=rot(add(z[0],z[12]),7);z[8]^=rot(add(z[4],z[0]),9);
    z[12]^=rot(add(z[8],z[4]),13);z[0]^=rot(add(z[12],z[8]),18);
    z[9]^=rot(add(z[5],z[1]),7);z[13]^=rot(add(z[9],z[5]),9);
    z[1]^=rot(add(z[13],z[9]),13);z[5]^=rot(add(z[1],z[13]),18);
    z[14]^=rot(add(z[10],z[6]),7);z[2]^=rot(add(z[14],z[10]),9);
    z[6]^=rot(add(z[2],z[14]),13);z[10]^=rot(add(z[6],z[2]),18);
    z[3]^=rot(add(z[15],z[11]),7);z[7]^=rot(add(z[3],z[15]),9);
    z[11]^=rot(add(z[7],z[3]),13);z[15]^=rot(add(z[11],z[7]),18);
    z[1]^=rot(add(z[0],z[3]),7);z[2]^=rot(add(z[1],z[0]),9);
    z[3]^=rot(add(z[2],z[1]),13);z[0]^=rot(add(z[3],z[2]),18);
    z[6]^=rot(add(z[5],z[4]),7);z[7]^=rot(add(z[6],z[5]),9);
    z[4]^=rot(add(z[7],z[6]),13);z[5]^=rot(add(z[4],z[7]),18);
    z[11]^=rot(add(z[10],z[9]),7);z[8]^=rot(add(z[11],z[10]),9);
    z[9]^=rot(add(z[8],z[11]),13);z[10]^=rot(add(z[9],z[8]),18);
    z[12]^=rot(add(z[15],z[14]),7);z[13]^=rot(add(z[12],z[15]),9);
    z[14]^=rot(add(z[13],z[12]),13);z[15]^=rot(add(z[14],z[13]),18);
  }
  const out=new Uint8Array(64);
  for(let i=0;i<16;i++){
    const value=add(z[i],x[i]);
    for(let b=0;b<4;b++)out[4*i+b]=(value>>>(8*b))&255;
  }
  return out;
}
function stream(key,fragment,count){
  const nonce=Buffer.from(rows[fragment]);
  assert.equal(nonce.length,8);
  const bytes=new Uint8Array(count);
  for(let block=0;block*64<count;block++){
    const offset=block*64;
    const current=salsaBlock(key,nonce,block>>>0,Math.floor(block/2**32));
    bytes.set(current.subarray(0,Math.min(64,count-offset)),offset);
  }
  return bytes;
}
const zeroReference=
  "9a97f65b9b4c721b960a672145fca8d4"+
  "e32e67f9111ea979ce9c4826806aeee63"+
  "de9c0da2bd7f91ebcb2639bf989c6251b"+
  "29bf38d39a9bdce7c55f4b2ac12a39";
assert.equal(Buffer.from(salsaBlock(Buffer.alloc(32),Buffer.alloc(8)))
  .toString("hex"),zeroReference,"Salsa20/20 known zero vector");

/**
 * @typedef {{relation:"gp29"|"cyclic28"|"ordered28",sign:-1|1}} Scheme
 * @param {ArrayLike<number>} sequence Cipher or plain GP rune indices
 * @param {Buffer} key
 * @param {Scheme} scheme
 * @param {boolean} decode
 * @returns {Uint8Array}
 */
function transform(sequence,key,scheme,decode){
  const out=new Uint8Array(sequence.length);
  for(let g=0;g<28;g++){
    const begin=bounds[g],end=bounds[g+1],length=end-begin;
    if(length===0)continue;
    const keybytes=stream(key,g,length);
    if(scheme.relation==="gp29"){
      for(let i=begin;i<end;i++){
        const k=keybytes[i-begin]%M;
        out[i]=mod(sequence[i]+(decode?1:-1)*scheme.sign*k,M);
      }
      continue;
    }
    // First ciphertext rune in each segment is an unencrypted IV.
    out[begin]=sequence[begin];
    let used=0;
    for(let i=begin+1;i<end;i++){
      const prevCipher=decode?sequence[i-1]:out[i-1];
      const input=sequence[i];
      const isRepeat=decode?input===prevCipher:input===28;
      if(isRepeat){
        out[i]=decode?28:prevCipher;
        continue;
      }
      const k=keybytes[used++]%28;
      if(decode){
        const digit=scheme.relation==="cyclic28"?
          mod(input-prevCipher-1,M):
          input-(input>prevCipher?1:0);
        assert.ok(digit>=0&&digit<28);
        out[i]=mod(digit+scheme.sign*k,28);
      }else{
        const digit=mod(input-scheme.sign*k,28);
        out[i]=scheme.relation==="cyclic28"?
          mod(prevCipher+digit+1,M):
          digit+(digit>=prevCipher?1:0);
        assert.notEqual(out[i],prevCipher);
      }
    }
  }
  return out;
}

/** Independent English GP native-score reference, not fitted to LP2. */
const spellings=data.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
function englishGP(input){
  const out=[];
  for(let w of input.toUpperCase().match(/[A-Z]+/g)||[]){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<w.length;){
      const token=spellings.find(t=>w.startsWith(t.s,i));
      assert.ok(token,"Encodable GP normal form");
      out.push(token.i);
      i+=token.s.length;
    }
  }
  return out;
}
const english=englishGP(read("resources/control/shakespeare_first300k.txt"));
const sample=english.slice(-17000,-17000+original.length);
assert.equal(sample.length,original.length);
const counts=new Uint32Array(M*M*M),total=new Uint32Array(M*M);
for(let i=2;i<english.length-18000;i++){
  const p=english[i-2]*M+english[i-1];
  counts[p*M+english[i]]++;
  total[p]++;
}
const logp=Float32Array.from(counts,(v,i)=>
  Math.log((v+0.2)/(total[Math.floor(i/M)]+M*0.2)));
function score(sequence,start=0,end=sequence.length){
  let value=0;
  for(let i=start+2;i<end;i++)
    value+=logp[(sequence[i-2]*M+sequence[i-1])*M+
      sequence[i]];
  return value/(end-start-2);
}

/** Read authentic original chapters as continuous physical pages. */
function chapterIndices(first,last){
  const start=data.pages.slice(0,first)
    .reduce((n,p)=>n+p.indices.length,0);
  const length=data.pages.slice(first,last+1)
    .reduce((n,p)=>n+p.indices.length,0);
  return [start,start+length];
}
const [trainStart,trainEnd]=chapterIndices(0,2);
const [holdAStart,holdAEnd]=chapterIndices(8,14);
const [holdBStart,holdBEnd]=chapterIndices(40,53);
assert.deepEqual([trainEnd-trainStart,holdAEnd-holdAStart,
  holdBEnd-holdBStart],[729,1729,3008]);

const metrics=[];
for(const {name,key} of keys)
  for(const relation of ["gp29","cyclic28","ordered28"])
    for(const sign of [-1,1]){
      /** @type {Scheme} */
      const scheme={relation,sign};
      const output=transform(original,key,scheme,true);
      assert.deepEqual(transform(output,key,scheme,false),
        Uint8Array.from(original));
      metrics.push({
        key:name,relation,sign,
        first13:Array.from(output.slice(0,13),v=>data.translit[v]).join(" "),
        chapter1:score(output,trainStart,trainEnd),
        holdA:score(output,holdAStart,holdAEnd),
        holdB:score(output,holdBStart,holdBEnd),
        all:score(output)
      });
    }
metrics.sort((a,b)=>b.chapter1-a.chapter1);
assert.equal(metrics.length,24);

// Independent full-size GP-English positive, using actual segment boundaries,
// the real fixed p15 root key and p50 row nonce. This is a synthetic cipher,
// never a claim that the original uses this form.
const knownKey=keyMap.get("absolute-row-major:BE");
assert.ok(knownKey);
const positive=[];
for(const relation of ["gp29","cyclic28","ordered28"]){
  const scheme={relation,sign:-1};
  const planted=transform(sample,knownKey,scheme,false);
  const recovered=transform(planted,knownKey,scheme,true);
  assert.deepEqual(recovered,Uint8Array.from(sample));
  positive.push({relation,runes:sample.length,
    exactRecovered:true,exactReencrypted:true,
    plaintextScore:score(recovered)});
}
const sha256=arr=>crypto.createHash("sha256")
  .update(Buffer.from(arr)).digest("hex");
console.log(JSON.stringify({
  experiment:"2014-era 32-byte key + 8-byte nonce Salsa20/20 source join",
  cue:"p15 16xuint16 root; p49-51 32x8 table nonce; 31 13dot marks ->32 segments",
  original:{
    runes:original.length,sha256:sha256(original),
    fragments:28,emptyFragments:[8,11],
    p0First13:original.slice(0,13).map(v=>data.translit[v]).join(" ")
  },
  keySource:keys.map(k=>({name:k.name,
    sha256:sha256(k.key)})),
  nonceSources:rows.length,
  testedPrograms:metrics.length,
  baseline:{
    originalChapter1:score(original,trainStart,trainEnd),
    originalHoldA:score(original,holdAStart,holdAEnd),
    originalHoldB:score(original,holdBStart,holdBEnd),
    genuineClearP57:score(data.pages[57].indices),
    independentEnglish:score(sample)
  },
  topOriginal:metrics.slice(0,8),
  completeProgramMaxOriginalChapter1:metrics[0].chapter1,
  positive,
  outcome:"Bounded source-joined test, no claim of historical cipher."
},null,2));
