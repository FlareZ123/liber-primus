"use strict";

/**
 * Frozen original p55/native-GP29 RSA candidate from historical 2014 Onion1.
 *
 * Source:
 *  - 2014 first onion signed RSA/OAEP e/N; participant-factored p/q:
 *    neuroretransmit/cicada 2014/002-first-onion/README.md
 *  - original p55 runes: resources/liber-primus/lp2-transcription.txt
 *    and canonical original indices: lp2-corpus.json
 *  - word circumference removal motivated by solved p57 phrase:
 *    "SHED OUR OWN CIRCUMFERENCES".
 *
 * One frozen sequence: 76 original runes as base29, plus 43 intact
 * original printed-word interiors; 33 word exteriors are a negative
 * geometric control. RSA decryption is one literal raw 432-bit block.
 * OAEP SHA1 validation is performed by native Node crypto.
 *
 * SFT (Windows11/Node22):
 *   node sims/lp2_p55_2014_rsa_native_original_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../resources/liber-primus");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const document=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8");

const pubE=65537n;
const primeP=97513779050322159297664671238670850085661086043266591739338007321n;
const primeQ=77506098606928780021829964781695212837195959082370473820509360759n;
const modulus=7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n;
assert.equal(primeP*primeQ,modulus);
assert.equal(modulus.toString(2).length,432);

/** @param {bigint} a @param {bigint} m @returns {bigint} */
function inverseMod(a,m){
  let b=m,x=1n,nextX=0n;
  while(b!==0n){
    const factor=a/b;
    [a,b]=[b,a-factor*b];
    [x,nextX]=[nextX,x-factor*nextX];
  }
  assert.equal(a,1n);
  return (x%m+m)%m;
}
/** @param {bigint} a @param {bigint} e @param {bigint} m @returns {bigint} */
function powerMod(a,e,m){
  let out=1n;
  while(e>0n){
    if(e&1n)out=out*a%m;
    a=a*a%m;
    e>>=1n;
  }
  return out;
}
/** @param {bigint} x @param {number} size @returns {Buffer} */
function bufferFromInteger(x,size){
  const value=x.toString(16).padStart(size*2,"0");
  assert.ok(value.length<=size*2);
  return Buffer.from(value,"hex");
}
/** @param {bigint} x @returns {string} */
function b64url(x){
  let h=x.toString(16);
  if(h.length%2)h="0"+h;
  return Buffer.from(h,"hex").toString("base64url");
}
const phi=(primeP-1n)*(primeQ-1n);
const privateD=inverseMod(pubE,phi);
const publicKey=crypto.createPublicKey({
  key:{kty:"RSA",n:b64url(modulus),e:b64url(pubE)},
  format:"jwk"
});
const privateKey=crypto.createPrivateKey({
  key:{
    kty:"RSA",n:b64url(modulus),e:b64url(pubE),d:b64url(privateD),
    p:b64url(primeP),q:b64url(primeQ),
    dp:b64url(privateD%(primeP-1n)),
    dq:b64url(privateD%(primeQ-1n)),
    qi:b64url(inverseMod(primeQ,primeP))
  },
  format:"jwk"
});
const planted=Buffer.from("AN END","ascii");
const plantedRSA=crypto.publicEncrypt({
  key:publicKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:"sha1"
},planted);
assert.equal(plantedRSA.length,54);
assert.deepEqual(crypto.privateDecrypt({
  key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:"sha1"
},plantedRSA),planted);
assert.equal(bufferFromInteger(
  powerMod(BigInt("0x"+plantedRSA.toString("hex")),privateD,modulus),54)[0],0);
assert.equal(powerMod(powerMod(12345678912345n,pubE,modulus),privateD,modulus),
  12345678912345n);

// The source transcription omits numeric-grid p50; p55 is physical
// part index54 after splitting the primary "%" page delimiter.
const originalText=document.split("%")[54].replace(/\/\n/g,"");
const words=originalText.split(/[-.]/)
  .map(v=>[...v].filter(ch=>corpus.runes.includes(ch)))
  .filter(v=>v.length);
const asIndex=(glyph)=>corpus.runes.indexOf(glyph);
const whole=words.flat().map(asIndex);
const original=corpus.pages.find(v=>v.page===55).indices;
assert.equal(words.length,17);
assert.deepEqual(whole,original);
assert.equal(whole.length,76);
const interior=words.flatMap(w=>w.slice(1,-1)).map(asIndex);
const exterior=words.flatMap(w=>w.length===1?w:[w[0],w[w.length-1]])
  .map(asIndex);
assert.equal(interior.length,43);
assert.equal(exterior.length,33);
assert.equal(interior.length+exterior.length,76);

/** @param {number[]} values @returns {bigint} */
function gpNumber(values){
  return values.reduce((result,v)=>result*29n+BigInt(v),0n);
}
/**
 * Derive and decrypt ONE literal big-endian base29 integer.
 * OAEP SHA1 padded messages MUST begin with byte zero after raw RSA.
 * @param {string} name @param {number[]} source @returns {object}
 */
function check(name,source){
  const cipher=gpNumber(source);
  assert.ok(cipher<modulus && cipher>=0n);
  const raw=bufferFromInteger(powerMod(cipher,privateD,modulus),54);
  const bytePrinted=raw.filter(x=>x>=32&&x<=126).length;
  let validOAEP=false;
  let plaintext="";
  try{
    const out=crypto.privateDecrypt({
      key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash:"sha1"
    },bufferFromInteger(cipher,54));
    validOAEP=true;
    plaintext=out.toString("utf8");
  }catch(e){
    // The real input fails authentic OAEP unpadding; no alternate
    // padding or private key search is silently attempted.
  }
  assert.equal(raw[0]===0,false,
    "All original 2014-OAEP candidates fail the mandatory 00 prefix");
  assert.equal(validOAEP,false);
  return {
    original_runes:source.length, original_base29_bits:cipher.toString(2).length,
    valid_rsa_ciphertext_representative:cipher<modulus,
    decrypted_54byte_raw_hex_prefix:raw.toString("hex").slice(0,48),
    decrypted_raw_54byte_ascii_count:bytePrinted,
    rsa_oaep_sha1_first_byte_zero:raw[0]===0,
    rsa_oaep_sha1_valid:validOAEP,
    plaintext
  };
}
const findings={
  puzzle_source:"2014 432-bit RSA modulus, e=65537, original p55 GP29 runes",
  original_p55_printed_word_lengths:words.map(w=>w.length),
  known_solved_native_AN_END_rsa_oaep_sha1_positive:true,
  source_whole76:check("whole",whole),
  source_word_interiors43:check("interiors",interior),
  source_word_exteriors33:check("exteriors",exterior),
  conclusion:"Direct original p55 and source-word-shell RSA decryptions fail 2014 OAEP SHA1. No plaintext or author-specified RSA handoff."
};
console.log(JSON.stringify(findings,null,2));
