"use strict";
/**
 * Source-fixed RSA-4096 verification gate for the four historical 256-byte
 * Cicada-related byte arrays.  Two arrays exactly fill one 512-byte RSA
 * signature. Test all 12 source-order concatenations under Cicada's authentic
 * 4096-bit signing key, without deriving any guessed key or plaintext.
 *
 * Positive control: independently recover PKCS#1 v1.5 signature padding from
 * an original, signed 2013 Cicada message using the same public operation.
 *
 * Run from repository root with Node.js >= 22:
 * node sims/lp2_256byte_historical_rsa4096_signature_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
/** @param {string} p */
const json=p=>JSON.parse(read(p));
/** @param {string} s @param {string} label */
function dearmor(s,label) {
  const start="-----BEGIN PGP "+label+"-----";
  const end="-----END PGP "+label+"-----";
  assert.ok(s.includes(start)&&s.includes(end));
  const inside=s.split(start)[1].split(end)[0];
  const lines=inside.split(/\r?\n/).map(x=>x.trim());
  return Buffer.from(lines.filter(x=>/^[A-Za-z0-9+/]{20,}={0,2}$/.test(x)).join(""),"base64");
}
/** OpenPGP old-format, finite-length packet from fixed original controls.
 * @param {Buffer} b @param {number} tag */
function packet(b,tag) {
  const h=b[0];
  assert.equal((h&0xc0),0x80);
  assert.equal((h>>2)&15,tag);
  let j=1,size;
  if((h&3)===0)size=b[j++];
  else if((h&3)===1){size=b.readUInt16BE(j);j+=2;}
  else if((h&3)===2){size=b.readUInt32BE(j);j+=4;}
  else throw Error("Unsupported indeterminate packet");
  assert.ok(j+size<=b.length);
  return b.subarray(j,j+size);
}
/** @param {Buffer} b @param {number} at */
function mpi(b,at) {
  const bits=b.readUInt16BE(at);
  const byteCount=Math.ceil(bits/8);
  const data=b.subarray(at+2,at+2+byteCount);
  assert.equal(data.length,byteCount);
  return {value:BigInt("0x"+data.toString("hex")),bytes:byteCount};
}
/** @param {bigint} b @param {bigint} e @param {bigint} n */
function powmod(b,e,n) {
  let r=1n;
  while(e>0n){
    if(e&1n)r=r*b%n;
    b=b*b%n;e>>=1n;
  }
  return r;
}
/** @param {Buffer} input @param {bigint} n @param {bigint} e */
function rsaPublic(input,n,e) {
  const s=BigInt("0x"+input.toString("hex"));
  if(s>=n)return null;
  return Buffer.from(powmod(s,e,n).toString(16).padStart(1024,"0"),"hex");
}
/** Validate full PKCS#1 v1.5 signature padding, accepting an arbitrary
 * DigestInfo only if its DER prefix and payload length are reasonable.
 * @param {Buffer|null} b */
function isPkcs1Signature(b) {
  if(!b||b.length!==512||b[0]!==0||b[1]!==1)return false;
  let at=2;
  while(at<b.length&&b[at]===255)at++;
  if(at<10||at>=b.length||b[at]!==0)return false;
  const info=b.subarray(at+1);
  return info.length>=30&&info[0]===0x30&&
    info[1]===info.length-2&&info[2]===0x30;
}
const keyText=read("resources/control/cicada-3301-public-key.asc");
const publicBody=packet(dearmor(keyText,"PUBLIC KEY BLOCK"),6);
assert.equal(publicBody[0],4);
assert.equal(publicBody[5],1);
const keyFingerprint=crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from([0x99,publicBody.length>>8,publicBody.length&255]),
  publicBody
])).digest("hex");
assert.equal(keyFingerprint,"6d854cd7933322a601c3286d181f01e57a35090f");
const modulus=mpi(publicBody,6);
const exponent=mpi(publicBody,8+modulus.bytes);
assert.equal(modulus.bytes,512);
assert.equal(exponent.value,65537n);

// A bona fide original signed Cicada message establishes the whole RSA
// public-op and PKCS#1-v1.5 parser without a fabricated matching signature.
const signed=read("resources/external/2013-do-not-share-this-information-2.asc");
const signaturePacket=packet(dearmor(signed,"SIGNATURE"),2);
assert.equal(signaturePacket[0],4);
assert.equal(signaturePacket[2],1); // RSA
let at=6+signaturePacket.readUInt16BE(4);
at+=2+signaturePacket.readUInt16BE(at)+2; // unhashed subs + two-byte hash
const authenticSignature=mpi(signaturePacket,at);
const authenticPad=rsaPublic(
  Buffer.from(authenticSignature.value.toString(16).padStart(1024,"0"),"hex"),
  modulus.value,exponent.value);
assert.ok(isPkcs1Signature(authenticPad),"Original Cicada signature control failed");
const digestPrefix="3021300906052b0e03021a05000414"; // SHA-1 DigestInfo
assert.ok(authenticPad.toString("hex").includes(digestPrefix));

const source=json("resources/cicada-hiddenservice-256-candidates.json");
const grid=json("resources/liber-primus/base60-grid.json");
assert.equal(source.sourceServices.length,3);
const streams=source.sourceServices.map(s=>({
  name:s.id, data:Buffer.from(s.hex,"hex")
}));
streams.push({name:"lp2-p50",data:Buffer.from(grid.byte_rows.flat())});
assert.ok(streams.every(s=>s.data.length===256));
const results=[];
for(const a of streams)for(const b of streams){
  if(a===b)continue;
  const input=Buffer.concat([a.data,b.data]);
  const deciphered=rsaPublic(input,modulus.value,exponent.value);
  const isPkcs=isPkcs1Signature(deciphered);
  results.push({
    order:a.name+"+"+b.name,
    signatureInModulus:deciphered!==null,
    recoveredBlockPrefix:deciphered?.subarray(0,14).toString("hex")??null,
    pkcs1v15Signature:isPkcs
  });
}
assert.equal(results.length,12);
assert.ok(results.every(r=>!r.pkcs1v15Signature),
  "Unexpected valid PKCS#1 signature: investigate before publishing");
assert.equal(results.filter(r=>r.signatureInModulus).length,9);
console.log(JSON.stringify({
  signerFingerprint:keyFingerprint,
  rsaBits:4096,
  signerExponent:String(exponent.value),
  authentic2013SignatureControl:"PASS",
  sourceLengths:streams.map(x=>({name:x.name,bytes:x.data.length})),
  testedOrderedPairs:results.length,
  validPkcs1Signatures:results.filter(x=>x.pkcs1v15Signature).length,
  results
},null,2));
