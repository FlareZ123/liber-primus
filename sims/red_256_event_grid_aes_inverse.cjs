"use strict";
/**
 * Direct AES-256 original grid decryption with fixed 256-ink-event keys.
 * Supports candidate ASCII/plaintext and known-plaintext plant checks.
 * Node.js 22 CommonJS; run: node sims/red_256_event_grid_aes_inverse.cjs.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {events}=require("./red_256_event_key_inverse.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/base60-grid.json"),"utf8")).byte_rows;
const event=events();
assert.equal(event.length,256);
const n=new Uint8Array(event.map(x=>x.value));
const prime=new Uint8Array(event.map(x=>x.kind?corpus.prime[x.value]:13));

/** @param {number[]} bits */
function packBits(bits) {
  assert.equal(bits.length,256);
  const result=Buffer.alloc(32);
  for(let i=0;i<256;i++)result[i>>3]|=bits[i]<<(7-i%8);
  return result;
}
const flag=packBits(event.map(x=>Number(x.kind===0)));
const parity=packBits(event.map(x=>x.kind?x.value%2:1));
const primeParity=packBits(event.map(x=>x.kind?corpus.prime[x.value]%2:1));
const sha256=x=>crypto.createHash("sha256").update(x).digest();
const keys={
  markBits:flag,
  gpIndexParity:parity,
  gpPrimeParity:primeParity,
  sha256GpIndices:sha256(n),
  sha256GpPrimes:sha256(prime),
  sha256MarkBits:sha256(flag),
  sha256GpParity:sha256(parity)
};
const row=Buffer.from(grid.flat());
const col=Buffer.from(Array.from({length:256},(_,i)=>
  grid[i%32][Math.floor(i/32)]));
assert.equal(row.length,256);
const orders={
  row,column:col,reversedRow:Buffer.from(row).reverse(),
  reversedColumn:Buffer.from(col).reverse()
};
const zero=Buffer.alloc(16);

/**
 * Exact AES-256 ciphertext translation, disabling PKCS#7 removal for
 * original sources with no known authenticated padding.
 * @param {Buffer} data
 * @param {Buffer} key
 * @param {string} mode
 * @param {boolean} encrypt
 */
function runCipher(data,key,mode,encrypt) {
  const parts=mode.split("/");
  const algorithm="aes-256-"+parts[0];
  const iv=parts[0]==="ecb"?null:
    parts[1]==="prefix"?data.subarray(0,16):zero;
  const raw=parts[1]==="prefix"?data.subarray(16):data;
  const transform=encrypt?
    crypto.createCipheriv(algorithm,key,iv):
    crypto.createDecipheriv(algorithm,key,iv);
  if(parts[0]!=="ctr")transform.setAutoPadding(false);
  const result=Buffer.concat([transform.update(raw),transform.final()]);
  return result;
}

/** @param {Buffer} buf */
function printableFraction(buf) {
  return [...buf].filter(x=>(x>=32&&x<=126)||x===9||x===10||x===13)
    .length/buf.length;
}
function run() {
  const modes=["ecb/zero","cbc/zero","cbc/prefix",
    "ctr/zero","ctr/prefix"];
  const candidates=[];
  for(const [keyName,key] of Object.entries(keys))
    for(const [order,bytes] of Object.entries(orders))
      for(const mode of modes) {
        const plain=runCipher(bytes,key,mode,false);
        const printable=printableFraction(plain);
        const spaces=plain.filter(v=>v===32).length;
        const englishLetters=plain.filter(v=>
          v>=65&&v<=90||v>=97&&v<=122).length;
        candidates.push({key:keyName,order,mode,
          length:plain.length,printable,spaces,englishLetters});
      }
  candidates.sort((a,b)=>b.printable-a.printable);
  const native=Buffer.alloc(256);
  const text="BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE. ";
  for(let i=0;i<256;i++)native[i]=text.charCodeAt(i%text.length);
  const encrypted=runCipher(native,keys.sha256GpIndices,"ctr/zero",true);
  assert.deepEqual(runCipher(encrypted,keys.sha256GpIndices,"ctr/zero",false),native);
  assert.equal(printableFraction(native),1);
  assert.equal(candidates.length,140);
  return {class:"fixed source-derived AES-256 original-grid ASCII inverse",
    candidateCount:candidates.length,sourceEventCount:event.length,
    sourceGridBytes:row.length,
    best:candidates.slice(0,10),
    maxPrintable:candidates[0].printable,
    naturalAsciiThreshold075:candidates.filter(x=>x.printable>=0.75).length,
    referencePlantExactRecovery:256,
    caveat:"Binary/compressed/non-AES plaintext and other keys remain open"};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,runCipher,packBits};
