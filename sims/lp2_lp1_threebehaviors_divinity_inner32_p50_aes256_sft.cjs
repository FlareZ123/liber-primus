"use strict";
/**
 * LP1 "three behaviors of the circumference" and LP2 p57 "shed our own
 * circumferences, find the divinity within": take only the strict INTERIOR
 * GP29 runes of CONSUMPTION, PRESERVATION, ADHERENCE, DIVINITY.
 *
 * The original GP spellings have 11+12+9+8 = 40 runes; removing 8 outer
 * runes yields 32, an AES-256 key length and the 32 row count of p50's
 * original 32x8 numerical panel. This is a source-motivated hypothesis,
 * not an authenticated key / recovered plaintext.
 *
 * Direct binary consumer only. Do not infer hidden nonce, password KDF,
 * output text language, reordering or first-party opcode not in the book.
 *
 * Run: node sims/lp2_lp1_threebehaviors_divinity_inner32_p50_aes256_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const lp1=read("resources/liber-primus/lp1-plaintext-reference.txt");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const panels=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const grid=Buffer.from(panels.pages.flatMap(p=>p.bytes));
assert.equal(grid.length,256);
assert.equal(panels.pages.reduce((n,p)=>n+p.bytes.length,0),256);
assert.equal(crypto.createHash("sha256").update(grid).digest("hex"),
 "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.ok(lp1.includes("THE CIRCUMFERENCE PRACTICES THREE BEHAVIORS WHICH CAUSE THE LOSS OF DIVINITY"));
const words=["CONSUMPTION","PRESERVATION","ADHERENCE","DIVINITY"];
const starts=words.slice(0,3).map(w=>lp1.indexOf("\n"+w+"\n"));
assert.ok(starts.every(i=>i>0)&&starts[0]<starts[1]&&starts[1]<starts[2]);
assert.ok(gp.pages[57].indices.length===95);
const gpWords=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
function normalize(word){
 let str=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
   .replace(/[KQ]/g,"C").replace(/Z/g,"S"),out=[];
 for(let i=0;i<str.length;){
  const token=gpWords.find(x=>str.startsWith(x.s,i));
  assert.ok(token,"Unknown GP runic representation "+str.slice(i));
  out.push(token.i);i+=token.s.length;
 }
 return out;
}
const forms=words.map(normalize);
assert.deepEqual(forms.map(x=>x.length),[11,12,9,8]);
const inner=forms.flatMap(x=>x.slice(1,-1));
assert.deepEqual(forms.map(x=>x.length-2),[9,10,7,6]);
assert.equal(inner.length,32);
assert.deepEqual(inner.slice(0,10),[3,9,15,1,19,13,16,10,3,4]);
const keys={
 "ordinal-byte":Buffer.from(inner),
 "GP-prime-byte":Buffer.from(inner.map(x=>gp.prime[x]))
};
assert.equal(keys["ordinal-byte"].toString("hex"),
 "03090f01130d100a0304120f12040118100a03170812041209050a010a090a10");
assert.equal(keys["GP-prime-byte"].toString("hex"),
 "071d3503472b3b1f070b4335430b03613b1f075917430b431d0d1f031f1d1f3b");
for(const [name,key] of Object.entries(keys))assert.equal(key.length,32,name);
// Independent NIST SP 800-38A AES-256 ECB vector, no source bytes involved.
const vectorKey=Buffer.from("603deb1015ca71be2b73aef0857d7781"+
 "1f352c073b6108d72d9810a30914dff4","hex");
const vectorPlain=Buffer.from("6bc1bee22e409f96e93d7e117393172a","hex");
const expected=Buffer.from("f3eed1bdb5d2a03c064b5a7e3db181f8","hex");
const vector=crypto.createCipheriv("aes-256-ecb",vectorKey,null);
vector.setAutoPadding(false);
assert.deepEqual(Buffer.concat([vector.update(vectorPlain),vector.final()]),expected);
function crypt(method,key,source,decrypt){
 const mode=method==="ECB"?"aes-256-ecb":
  method==="CBC"?"aes-256-cbc":"aes-256-ctr";
 const iv=method==="ECB"?null:Buffer.alloc(16);
 const worker=decrypt?crypto.createDecipheriv(mode,key,iv):
  crypto.createCipheriv(mode,key,iv);
 if(method!=="CTR")worker.setAutoPadding(false);
 return Buffer.concat([worker.update(source),worker.final()]);
}
const magic=[
 ["PDF",Buffer.from("%PDF-")],["PNG",Buffer.from("89504e470d0a1a0a","hex")],
 ["ZIP",Buffer.from("504b0304","hex")],["GZIP",Buffer.from("1f8b","hex")],
 ["BZIP2",Buffer.from("BZh")],["XZ",Buffer.from("fd377a585a00","hex")],
 ["7ZIP",Buffer.from("377abcaf271c","hex")],["PGP-armor",Buffer.from("-----BEGIN PGP")],
 ["SQLite",Buffer.from("SQLite format 3")],["HTML",Buffer.from("<html")],
 ["UTF8-BOM",Buffer.from("efbbbf","hex")]
];
const outputs=[];
for(const [keyName,key] of Object.entries(keys)){
 const native=Buffer.from(("CICADA 3301. Original source-derived key plant.\n").repeat(7)
  .slice(0,256).padEnd(256," "),"utf8");
 for(const order of ["original-rowmajor","byte-reversal"]){
  const ciphertext=order==="original-rowmajor"?grid:Buffer.from(grid).reverse();
  for(const method of ["ECB","CBC","CTR"]){
   const planted=crypt(method,key,native,false);
   const recovered=crypt(method,key,planted,true);
   assert.deepEqual(recovered,native,"AES-256 native plant "+keyName+order+method);
   const decoded=crypt(method,key,ciphertext,true);
   assert.equal(decoded.length,256);
   const printable=[...decoded].filter(b=>b>=32&&b<=126||[9,10,13].includes(b)).length;
   const gpByte=[...decoded].filter(b=>b<29).length;
   const magicPrefix=magic.filter(([,prefix])=>decoded.subarray(0,prefix.length).equals(prefix))
    .map(([name])=>name);
   outputs.push({keyName,order,method,printable,gpByte,
    first16hex:decoded.subarray(0,16).toString("hex"),
    sha256:crypto.createHash("sha256").update(decoded).digest("hex"),
    magicPrefix});
  }
 }
}
assert.equal(outputs.length,12);
assert.deepEqual(outputs.map(x=>x.printable),
 [103,103,86,99,103,106,102,90,96,102,93,95]);
assert.ok(outputs.every(x=>x.magicPrefix.length===0));
console.log(JSON.stringify({
 decision:"No recognizable file or direct readable byte plaintext under these 12 fixed source-derived AES-256 interpretations. Neither the 32-rune extraction nor AES receiver is authenticated; a compressed or encrypted binary without magic is not ruled out.",
 sourceWords:words,wholeRuneLengths:forms.map(x=>x.length),
 interiors:forms.map(x=>x.length-2),sourceKeyRunes:inner.length,
 keyRegisters:Object.fromEntries(Object.entries(keys)
  .map(([name,k])=>[name,k.toString("hex")])),
 p50Bytes:grid.length,
 p50Sha256:crypto.createHash("sha256").update(grid).digest("hex"),
 controls:"NIST AES-256 ECB vector and 12 256-byte exact native encrypt/decrypt plants pass",
 outputs
},null,2));
