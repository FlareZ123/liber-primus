"use strict";

/**
 * Original LP2 256-cell register as one RSA CRT d_p or d_q exponent for the
 * two authentic Cicada 4096-bit OpenPGP RSA moduli, rather than a prime.
 *
 * A true CRT d_p obeys e*d_p = 1 (mod p-1). For a small witness a coprime
 * to N=pq, gcd(a^(e*d_p)-a,N) therefore reveals at least p and normally
 * reveals exactly p. Every candidate is tested without a private key.
 *
 * No dependencies, Node22 CommonJS, read-only. Source/input assertions and
 * a small mathematically independent RSA CRT positive control are required.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {dearmor,parseKeys}=require("./grid_rsa_pgp_signature.cjs");
const ROOT=path.join(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-grid-256.json"),"utf8"));
const publicKey=fs.readFileSync(path.join(ROOT,
  "resources/control/cicada-3301-public-key.asc"),"utf8");
const keys=parseKeys(dearmor(publicKey));
assert.equal(keys.length,2);
assert(keys.every((k)=>k.exponent===65537n && k.bits===4096));
assert.equal(keys[0].fingerprint,"6D854CD7933322A601C3286D181F01E57A35090F");
const alphabet60="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const alphabet59=alphabet60.replace("f","");
assert.equal(alphabet60.length,60);
assert.equal(alphabet59.length,59);
assert.equal(grid.pages.length,3);
const tokens=grid.pages.flatMap((p)=>p.tokens);
const srcBytes=grid.pages.flatMap((p)=>p.bytes);
assert.equal(tokens.length,256);
assert.equal(srcBytes.length,256);
/**
 * @param {string[]} sourceTokens
 * @param {string} alphabet
 * @returns {number[]}
 */
function readTokens(sourceTokens,alphabet) {
 const out=sourceTokens.map((s)=>alphabet.indexOf(s[0])*alphabet.length+
   alphabet.indexOf(s[1]));
 assert(out.every((x)=>Number.isInteger(x)&&x>=0&&x<256));
 return out;
}
const base60=readTokens(tokens,alphabet60);
const base59=readTokens(tokens,alphabet59);
assert.deepEqual(base60,srcBytes);
assert.equal(base60.reduce((x,y)=>x+y,0),33006);
assert.equal(base59.reduce((x,y)=>x+y,0),32499);
/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y) {
 while(y!==0n) [x,y]=[y,x%y];
 return x<0n?-x:x;
}
/** @param {bigint} a @param {bigint} exponent @param {bigint} modulus @returns {bigint} */
function modPow(a,exponent,modulus) {
 let result=1n,b=a%modulus,e=exponent;
 while(e>0n) {
  if((e&1n)===1n) result=(result*b)%modulus;
  b=(b*b)%modulus;
  e>>=1n;
 }
 return result;
}
/** @param {number[]} bytes @returns {bigint} */
function asBigInt(bytes) {
 return BigInt("0x"+bytes.map(x=>x.toString(16).padStart(2,"0")).join(""));
}
/** @param {number[]} bytes @returns {number[]} */
function colMajor(bytes) {
 return Array.from({length:8},(_,c)=>Array.from({length:32},
   (_,r)=>bytes[r*8+c])).flat();
}
const N=61n*53n,e=17n,dp=53n;
const positive=gcd((modPow(2n,e*dp,N)-2n+N)%N,N);
assert(positive===61n || positive===53n,
  "CRT positive fails to recover a prime factor");
const failures=[];
const candidates=[];
for(const [radix,src] of [["base60",base60],["base59",base59]]) {
 for(const [order,original] of [["rows",src],["columns",colMajor(src)]]) {
  for(const [transform,bytes] of [
   ["forward",original],
   ["reversed",original.slice().reverse()],
   ["complement",original.map(x=>255-x)]
  ]) {
   const candidate=asBigInt(bytes);
   assert(candidate>1n);
   candidates.push({radix,order,transform,bits:candidate.toString(2).length});
   for(const [keyIndex,key] of keys.entries()) {
    for(const base of [2n,3n]) {
     const N=key.modulus;
     // The source private CRT exponent would satisfy
     // a^(e*dp) == a mod p, hence gcd(a^(e*dp)-a,N) is nontrivial.
     const residue=modPow(base,key.exponent*candidate,N);
     const factor=gcd((residue-base+N)%N,N);
     if(factor!==1n) failures.push({
       radix,order,transform,keyIndex,base:Number(base),
       factorBits:factor.toString(2).length,
       nontrivial:factor>1n && factor<N,
       wholeModulus:factor===N
     });
    }
   }
  }
 }
}
assert.equal(candidates.length,12);
assert.equal(failures.length,0,"Candidate potentially reveals a factor");
console.log(JSON.stringify({
 source:"original LP2 pp49-51 32x8 printed base60/base59 table",
 interpretation:"single 2048-bit RSA CRT private exponent dp or dq",
 publicKeyFingerprint:keys[0].fingerprint,positiveFactor:positive.toString(),
 candidates, authenticKeys:keys.length,witnessBases:[2,3],
 exactModularGcdTests:12*2*2,nonunitGcds:failures,
 decision:"No direct original table RSA CRT exponent unlocks Cicada's primary or subkey under these 12 source readings."
},null,2));
