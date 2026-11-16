"use strict";
/**
 * Original LP2 three-artifact ChaCha20 GP29 inversion experiment.
 *
 * Distinct source objects:
 *  (1) LP2 p15 printed 4x4 Fibonacci-prime square = sixteen 16-bit numbers,
 *      supplying one 32-byte ChaCha20 key via 2-byte big/little-endian packing;
 *  (2) pp49–51 32x8 base60 byte field = 32 different 8-byte nonces;
 *  (3) 31 authentic 13-dot marks = 32 ordered fragments / nonce assignments.
 *
 * Uses original 2008 ChaCha20 variant with 64-bit counter / 64-bit nonce,
 * as supplied by Node 22/OpenSSL createCipheriv('chacha20').
 *
 * We test one standard GP29 additive keystream receiver and two predecessor-
 * exclusion 28-rank receivers (cyclic and ordered). A rank28 receiver emits
 * repeat cipher runes for literal source EA(index 28) and skips that key byte.
 * These additions are NOT authentically selected by the book; the exact
 * encoded 32-byte key, nonce and GP transport are informed hypotheses.
 *
 * Node 22 Windows SFT: node sims/lp2_p15_grid32_fragment_chacha20_sft.cjs
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
assert.equal(crypto.getCiphers().includes("chacha20"),true,
  "Node/OpenSSL ChaCha20 implementation available");

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
 * @param {Buffer} key 32-byte original-artifact packed key
 * @param {number} fragment 13-dot interval ordinal
 * @param {number} count Requested stream byte count
 * @returns {Buffer} Original ChaCha20 key stream at block counter zero
 */
function stream(key,fragment,count){
  const nonce=Buffer.from(rows[fragment]);
  assert.equal(nonce.length,8);
  const iv=Buffer.concat([Buffer.alloc(8),nonce]);
  const cipher=crypto.createCipheriv("chacha20",key,iv);
  return Buffer.concat([cipher.update(Buffer.alloc(count)),
    cipher.final()]);
}

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
        first13:output.slice(0,13).map(v=>data.translit[v]).join(" "),
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
  experiment:"2014-era 32-byte key + 8-byte nonce ChaCha20 source join",
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
