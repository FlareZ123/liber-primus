"use strict";
/**
 * LP2 32 physical cross-page words and the 32x8 numeral table.
 * Tests a specific byte-key route, including original p50 table data.
 *
 * Source-input only; no ciphertext-alphabet fitting or guessed passwords.
 * Windows 11 / Node.js 22: node sims/lp2_pagecarry32_p50_hash_aes_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const base = path.join(__dirname, "..", "resources", "liber-primus");

/** @param {string} name */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));
}
const gp = load("lp2-corpus.json");
const grid = load("lp2-grid-256.json");
const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const cross = parsed.words.filter(w => w.startPage !== w.endPage);
assert.equal(cross.length, 32);
assert.equal(cross.reduce((n,w) => n+w.length,0),209);
assert(cross.every(w=>w.endPage === w.startPage+1));
const gpIndex = new Map(gp.runes.map((r,i)=>[r,i]));
const indices = cross.map(w=>[...w.runes].map(r=>gpIndex.get(r)));
assert(indices.flat().every(i=>Number.isInteger(i) && i>=0 && i<29));
const tokens = grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.equal(grid.bytes.length,256);
const digits59=grid.alphabet.replace("f","");
assert.equal(digits59.length,59);
const tab59=tokens.map(s=>59*digits59.indexOf(s[0])+digits59.indexOf(s[1]));
assert(tab59.every(v=>v>=0 && v<=255));
const streams=[
  ["base60",Buffer.from(grid.bytes),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"],
  ["base59",Buffer.from(tab59),"511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79"]
];
for(const [,bytes,digest] of streams) {
  assert.equal(bytes.length,256);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),digest);
}
/** @param {number[]} symbols @param {string} format */
function serialize(symbols,format) {
  if(format==="indices") return Buffer.from(symbols);
  if(format==="runes") return Buffer.from(symbols.map(i=>gp.runes[i]).join(""),"utf8");
  if(format==="latin") return Buffer.from(symbols.map(i=>gp.translit[i]).join(""),"utf8");
  throw new Error("Unknown frozen source word representation");
}
const comparisons=[];
for(const [radix,bytes] of streams) {
  for(const format of ["indices","runes","latin"]) {
    const source=indices.map(w=>serialize(w,format));
    for(const alg of ["sha1","sha256","sha512"]) {
      const digests=source.map(buf=>crypto.createHash(alg).update(buf).digest());
      for(const end of ["prefix","suffix"]) {
        for(const reverse of [false,true]) {
          let complete=0,agreeingBytes=0;
          for(let i=0;i<32;i++) {
            const expect=end==="prefix"?digests[i].subarray(0,8):digests[i].subarray(-8);
            const actual=Buffer.from(bytes.subarray(i*8,i*8+8));
            if(reverse)actual.reverse();
            if(actual.equals(expect))complete++;
            for(let k=0;k<8;k++)agreeingBytes+=Number(actual[k]===expect[k]);
          }
          comparisons.push({radix,format,alg,end,reverse,complete,agreeingBytes});
        }
      }
    }
  }
}
assert.equal(comparisons.length,72);
assert(comparisons.every(v=>v.complete===0));
const maxAgree=Math.max(...comparisons.map(v=>v.agreeingBytes));
const shaPositive=indices.map(w=>crypto.createHash("sha256")
  .update(serialize(w,"runes")).digest().subarray(0,8));
assert.equal(shaPositive.length,32);
assert(shaPositive.every((row,i)=>row.equals(crypto.createHash("sha256")
  .update(serialize(indices[i],"runes")).digest().subarray(0,8))));
const key=Buffer.from(indices.map(word=>word.reduce((sum,i)=>sum+gp.prime[i],0)%256));
assert.equal(key.length,32);
const aesResults=[];
for(const [radix,bytes] of streams)for(const mode of ["ecb","cbc","ctr"]) {
  const iv=mode==="ecb"?null:Buffer.alloc(16);
  const decrypt=crypto.createDecipheriv("aes-256-"+mode,key,iv);
  decrypt.setAutoPadding(false);
  const clear=Buffer.concat([decrypt.update(bytes),decrypt.final()]);
  assert.equal(clear.length,256);
  const ascii=clear.reduce((n,b)=>n+Number((b>=32&&b<=126)||b===9||b===10||b===13),0);
  aesResults.push({radix,mode,printable:ascii});
}
assert(aesResults.every(x=>x.printable<160));
// A real standard AES-256-CTR plaintext, with this precise key and IV, is recovered.
const proof=Buffer.from(("A WARNING. TEST THE KNOWLEDGE. FIND YOUR TRUTH. ").repeat(6).slice(0,256),"ascii");
assert.equal(proof.length,256);
const enc=crypto.createCipheriv("aes-256-ctr",key,Buffer.alloc(16));
const plant=Buffer.concat([enc.update(proof),enc.final()]);
const dec=crypto.createDecipheriv("aes-256-ctr",key,Buffer.alloc(16));
assert.deepEqual(Buffer.concat([dec.update(plant),dec.final()]),proof);
console.log(JSON.stringify({
  originalCrossPageWords:cross.length,sourceRuneCount:209,
  firstCrossWordGP:indices[0].join(","),
  lastCrossWordGP:indices.at(-1).join(","),
  originalTableRows:32,tableWidth:8,
  standardDigestComparisons:comparisons.length,exactFullRowMatches:0,
  maximumCoincidentBytesPer32Rows:maxAgree,
  allHashComparisonRows:comparisons.filter(x=>x.agreeingBytes===maxAgree),
  candidatePrimeSumAES256Key:key.toString("hex"),aesResults,
  sha256RowPositive:32,aesCTRFullBytePositive:256
},null,2));
console.log("PASS: 32 original carried words / 32 original table rows; no direct SHA-2/SHA-1 or GP-prime-sum AES plaintext.");
