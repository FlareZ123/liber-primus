"use strict";
/**
 * LP2 p15 original BASE29 heading -> historical DATA/560.13 byte offset.
 * Test the same 2013 BASE29 numeral conversion and historical XOR operation
 * composed on the complete following p15:9-p22 original GP29 register.
 *
 * Usage (Node 22, Windows 11):
 *   node sims/lp2_p15_56013_base29_integer_xor_sft.cjs C:\path\to\DATA_560.13
 *
 * @typedef {{size:number, printable:number, letters:number, spaces:number, longestPrintable:number, magic:string[], prefixHex:string, preview:string}} ByteStats
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const p15=corpus.pages.find(p=>p.page===15);
assert.deepEqual(p15.indices.slice(0,9),[0,1,20,19,24,28,26,22,24]);
const heading=p15.indices.slice(0,9);
const headingInteger=heading.reduce((n,d)=>n*29n+BigInt(d),0n);
const quotient=headingInteger/3301n;
assert.equal(headingInteger,29553734724n);
assert.equal(quotient,8952964n);
assert.equal(headingInteger%3301n,560n);
const section=corpus.pages.filter(p=>p.page>=15&&p.page<=22)
  .flatMap(p=>p.page===15?p.indices.slice(9):p.indices);
assert.equal(section.length,1894);
const padPath=process.argv[2];
assert.ok(padPath,"Provide the full historical DATA/560.13 path");
const fullPad=fs.readFileSync(padPath);
assert.equal(fullPad.length,118818811);
const padSha=crypto.createHash("sha256").update(fullPad).digest("hex");
assert.equal(padSha,"db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
/** @param {number[]} digits @returns {bigint} */
function fromBase29(digits){
  return digits.reduce((n,d)=>{
    assert.ok(Number.isInteger(d)&&d>=0&&d<29);
    return n*29n+BigInt(d);
  },0n);
}
/** @param {bigint} n @param {number} width @returns {number[]} */
function toBase29(n,width){
  const result=Array(width).fill(0);
  for(let i=width-1;i>=0;i--){result[i]=Number(n%29n);n/=29n;}
  assert.equal(n,0n);
  return result;
}
/** @param {bigint} n @returns {Buffer} */
function toMinimalBytes(n){
  let hex=n.toString(16);
  if(hex.length%2)hex="0"+hex;
  return Buffer.from(hex,"hex");
}
/** @param {Buffer} bytes @returns {bigint} */
function fromBytes(bytes){
  return BigInt("0x"+bytes.toString("hex"));
}
/** @param {Buffer} bytes @param {Buffer} key @returns {Buffer} */
function xor(bytes,key){
  assert.ok(key.length>=bytes.length);
  return Buffer.from(bytes.map((v,i)=>v^key[i]));
}
/** @param {Buffer} bytes @returns {ByteStats} */
function stats(bytes){
  const print=v=>v>=32&&v<=126;
  let longest=0,run=0;
  for(const v of bytes){run=print(v)?run+1:0;longest=Math.max(longest,run);}
  const hx=bytes.toString("hex");
  const magic=[
    ["gzip","1f8b08"],["PNG","89504e470d0a1a0a"],["PDF","255044462d"],
    ["ZIP","504b0304"],["JPEG","ffd8ff"],["bzip2","425a68"],
    ["xz","fd377a585a00"],["7z","377abcaf271c"],
    ["PGP armor","2d2d2d2d2d424547494e20504750"],
    ["SQLite","53514c69746520666f726d6174203300"],
    ["OGG","4f676753"],["RIFF","52494646"],["Zstd","28b52ffd"]
  ].filter(([,head])=>hx.startsWith(head)).map(([name])=>name);
  return {
    size:bytes.length,
    printable:[...bytes].filter(print).length,
    letters:[...bytes].filter(v=>(v>=65&&v<=90)||(v>=97&&v<=122)).length,
    spaces:[...bytes].filter(v=>v===32).length,
    longestPrintable:longest,magic,prefixHex:hx.slice(0,64),
    preview:[...bytes.subarray(0,100)].map(v=>print(v)?String.fromCharCode(v):".").join("")
  };
}
const cipherInteger=fromBase29(section);
assert.deepEqual(toBase29(cipherInteger,section.length),section);
const cipherBytes=toMinimalBytes(cipherInteger);
assert.equal(fromBytes(cipherBytes),cipherInteger);
const key=fullPad.subarray(Number(quotient),Number(quotient)+cipherBytes.length);
assert.equal(key.length,cipherBytes.length);
const plainBytes=xor(cipherBytes,key);
const p56Hash="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const algorithms=["sha512","sha3-512","blake2b512"].filter(h=>crypto.getHashes().includes(h));
const digestMatches=Object.fromEntries(algorithms.map(h=>[h,crypto.createHash(h).update(plainBytes).digest("hex")===p56Hash]));
// Positive control: a genuine source-key XOR-encrypted printable message, represented
// as exactly the same number of GP29 digits, decodes byte for byte.
const plantPlain=Buffer.alloc(1140);
const english=Buffer.from("THE PATH LIES EMPTY; EPIPHANY SEEKS THE DEVOTED. ");
for(let i=0;i<plantPlain.length;i++)plantPlain[i]=english[i%english.length];
plantPlain[0]=key[0]===0x58?0x59:0x58;
const plantCipherBytes=xor(plantPlain,key);
assert.ok(plantCipherBytes[0]!==0,"Key-selected plant needs nonminimal leading byte");
const plantCipher=toBase29(fromBytes(plantCipherBytes),section.length);
assert.deepEqual(toBase29(fromBase29(plantCipher),section.length),plantCipher);
let plantRecovered=xor(toMinimalBytes(fromBase29(plantCipher)),key);
assert.deepEqual(plantRecovered,plantPlain);
assert.deepEqual(xor(plainBytes,key),cipherBytes);
const outcome={
  status:"PASS",
  method:"Canonical GP29 positional integer of entire p15:9-p22 register -> minimal bigendian bytes -> historical DATA/560.13 XOR at source-derived offset 8952964",
  source:{
    headingNumber:headingInteger.toString(),remainder:Number(headingInteger%3301n),
    historicalFile:"DATA/560.13",offset:Number(quotient),datasetSha256:padSha,
    originalRunes:section.length,base29ByteLength:cipherBytes.length
  },
  original:{cipher:stats(cipherBytes),xorDecoded:stats(plainBytes),
    nativeEnglishOrFileMagicRecovered:stats(plainBytes).magic.length>0||stats(plainBytes).longestPrintable>=60,
    p56DigestMatches:digestMatches},
  tests:{wholeRegisterBase29Roundtrip:true,keyedXorRoundtrip:true,
    nativeEnglish1140BytePositiveRecovered:true}
};
console.log(JSON.stringify(outcome,null,2));
