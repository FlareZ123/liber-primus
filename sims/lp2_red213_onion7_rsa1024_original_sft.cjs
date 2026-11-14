"use strict";
/**
 * LP2 213 unsolved red GP29 runes -> original 2014 Onion7 RSA-1024 public key.
 * Windows/Node 22 SFT: node sims/lp2_red213_onion7_rsa1024_original_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const inputs=[
 ["resources/liber-primus/lp2-corpus.json","054f2a0f780b7d46901acbe3d9bf4f0ac1801165"],
 ["resources/liber-primus/lp2-ink-annotations.json","3c52f209ce6bd7b138eaa2d4a9323526952ba9f9"]
];
/** @param {string} filename @param {string} sha @returns {any} */
function source(filename,sha){
 const data=fs.readFileSync(path.join(root,filename));
 const git=crypto.createHash("sha1").update(Buffer.from("blob "+data.length+"\0")).update(data).digest("hex");
 assert.equal(git,sha,"Pinned input changed: "+filename);
 return JSON.parse(data.toString("utf8"));
}
const corpus=source(...inputs[0]),ink=source(...inputs[1]);
const pages=new Map(corpus.pages.map(p=>[p.page,p.indices]));
const marked=[],red=[];
for(const page of ink.pages)for(const span of page.red_spans||[]){
 const indices=pages.get(page.page).slice(span.start,span.start+span.length);
 assert.equal(indices.length,span.length);
 assert.equal(indices.map(n=>corpus.runes[n]).join(""),span.runes);
 marked.push(...indices);
 if(page.page<=55)red.push(...indices);
}
assert.equal(marked.length,225);assert.equal(red.length,213);
assert.deepEqual(red.slice(0,13),[15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.deepEqual(red.slice(-9),[24,19,21,23,27,2,14,10,19]);
/** @param {number[]} a @returns {bigint} */
function read29(a){return a.reduce((n,d)=>n*29n+BigInt(d),0n);}
/** @param {bigint} n @returns {number} */
function bits(n){return n.toString(2).length;}
/** @param {bigint} n @param {number} width @returns {number[]} */
function write29(n,width){
 const a=Array(width).fill(0);
 for(let j=width-1;j>=0;j--){a[j]=Number(n%29n);n/=29n;}
 assert.equal(n,0n);return a;
}
/** @param {bigint} n @param {number} exponent @returns {Buffer} */
function v2Identity(n,exponent){
 assert.equal(bits(n),1024);assert.equal(n%2n,1n);
 const modulus=Buffer.from(n.toString(16).padStart(256,"0"),"hex");
 const e=exponent===65537?Buffer.from([1,0,1]):Buffer.from([exponent]);
 const key=crypto.createPublicKey({format:"jwk",key:{
   kty:"RSA",n:modulus.toString("base64url"),e:e.toString("base64url")
 }});
 const pkcs1=key.export({format:"der",type:"pkcs1"});
 return crypto.createHash("sha1").update(pkcs1).digest().subarray(0,10);
}
/** @param {Buffer} b @returns {string} */
function onion(b){
 assert.equal(b.length,10);
 const a="abcdefghijklmnopqrstuvwxyz234567",n=BigInt("0x"+b.toString("hex"));
 return Array.from({length:16},(_,i)=>a[Number((n>>BigInt(5*(15-i)))&31n)]).join("");
}
// Positive: genuine fresh RSA-1024 JWK modulus encoded in 211 GP29 digits;
// recover identical PKCS#1 DER hash and v2 onion address.
const {publicKey}=crypto.generateKeyPairSync("rsa",{modulusLength:1024,publicExponent:65537});
const jwk=publicKey.export({format:"jwk"});
const mod=BigInt("0x"+Buffer.from(jwk.n,"base64url").toString("hex"));
assert.equal(read29(write29(mod,211)),mod);
const positive=crypto.createHash("sha1").update(publicKey.export({format:"der",type:"pkcs1"})).digest().subarray(0,10);
assert.deepEqual(v2Identity(mod,65537),positive);
const candidates=[];
for(const [direction,a] of [["forward",red],["reverse",[...red].reverse()]]){
 const full=read29(a);candidates.push({id:direction+"/full213",n:full});
 const hex=full.toString(16).padStart(Math.ceil(bits(full)/8)*2,"0");
 const bytes=Buffer.from(hex,"hex");
 assert.equal(bytes.length,130);
 candidates.push({id:direction+"/first128",n:BigInt("0x"+bytes.subarray(0,128).toString("hex"))});
 candidates.push({id:direction+"/last128",n:BigInt("0x"+bytes.subarray(-128).toString("hex"))});
 for(const width of [210,211])for(let start=0;start+width<=a.length;start++){
  candidates.push({id:direction+"/window"+width+"@"+start,n:read29(a.slice(start,start+width))});
 }
}
assert.equal(candidates.length,20);
const eligible=candidates.filter(c=>bits(c.n)===1024&&c.n%2n===1n);
assert.deepEqual(eligible.map(x=>x.id),["reverse/window211@2"]);
const computed=[3,17,65537].flatMap(exponent=>eligible.map(c=>({
 id:c.id,exponent,onion:onion(v2Identity(c.n,exponent))
})));
assert.deepEqual(computed.map(x=>x.onion),[
 "ktnpmwgxvagogpv5","lqr73kos6n4w2bzv","pixpoosan75hitlc"
]);
assert.ok(computed.every(x=>x.onion!=="ky2khlqdf7qdznac"));
console.log(JSON.stringify({
 sourceBlobs:inputs.map(x=>x[1]),redTotal:marked.length,
 unsolvedRed:red.length,fullBits:[bits(candidates[0].n),bits(candidates[10].n)],
 representations:candidates.length,eligible1024BitOdd:eligible.map(x=>x.id),
 exactOriginalOnionMatches:0,computed,positive:"RSA-1024 source-inverse and PKCS1-DER identity passed"
},null,2));
