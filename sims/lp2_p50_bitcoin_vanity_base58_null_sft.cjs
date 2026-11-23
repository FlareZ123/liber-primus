'use strict';
// Bitcoin P2PKH source-column test and conservative Base58Check-family null bound.
// Run from repository root: node sims/lp2_p50_bitcoin_vanity_base58_null_sft.cjs
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const n = 58n, Nmax = (1n << 192n) - 1n, Htotal = 1n << 160n, CRCwidth = 1n << 32n;
const bytes = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8')).bytes;
assert.equal(bytes.length,256);
const key = Buffer.from(Array.from({length:32},(_,r)=>bytes[8*r+4]));
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const ecdh = crypto.createECDH('secp256k1');
ecdh.setPrivateKey(key);
const pub = ecdh.getPublicKey(null, 'compressed');
const sha = b => crypto.createHash('sha256').update(b).digest();
const h160 = crypto.createHash('ripemd160').update(sha(pub)).digest();
const body = Buffer.concat([Buffer.from([0]),h160]);
const check = sha(sha(body)).subarray(0,4);
const addressBytes=Buffer.concat([body,check]);
let value=BigInt('0x'+addressBytes.toString('hex')),address='';
while(value>0n){address=alphabet[Number(value % n)]+address;value/=n;}
for (const x of addressBytes){if(x !== 0)break;address='1'+address;}
assert.equal(address,'1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');
const floorDiv=(a,b)=>{assert(b>0n); const q=a/b; return (a<0n && a%b!==0n) ? q-1n : q;};
const ceilDiv=(a,b)=>-floorDiv(-a,b);
const val=s=>[...s].reduce((r,c)=>r*n+BigInt(alphabet.indexOf(c)),0n);
// N = 2^32 * HASH160(pubkey) + first4(doubleSHA256(version||HASH160)).
// The leading zero version byte prints the initial '1' in every mainnet P2PKH address.
// Allow arbitrary checksum in 0..2^32-1 when counting candidate 160-bit hashes.
// This deliberately OVERCOUNTS valid Bitcoin checksums. It is a rigorous upper bound
// conditional on uniform 160-bit HASH160 output, not a simulation.
function countHashesForFixed7(prefix){
  const p=val(prefix);let total=0n;
  for(let L=7;L<=33;L++){
    const W=n**BigInt(L-7);const low=p*W,high=(p+1n)*W-1n;
    const lo=low>n**BigInt(L-1) ? low : n**BigInt(L-1);
    const hi=high<Nmax ? high : Nmax;
    if(lo>hi)continue;
    total+=(hi/CRCwidth)-(lo/CRCwidth)+1n;
  }
  return total;
}
const prefixBound=countHashesForFixed7('Meanpng');
// Fixed suffix after ANY four possible base58 characters, in the first seven
// characters after 1. The allowed first character is necessarily nonzero.
function countHashesAny4Suffix3(suffix){
  assert(suffix.length===3&&[...suffix].every(c=>alphabet.includes(c)));
  const B=n**3n,v=val(suffix), minFirst4=B,maxFirst4=n**4n-1n;
  let count=0n, intervalCount=0n;
  for(let L=7;L<=33;L++){
    const W=n**BigInt(L-7),pitch=B*W;
    const lo=n**BigInt(L-1),hi=(n**BigInt(L)-1n)<Nmax ? n**BigInt(L)-1n : Nmax;
    if(lo>hi)continue;
    const uMinTmp=ceilDiv(lo+1n-(v+1n)*W,pitch);
    const uMaxTmp=floorDiv(hi-v*W,pitch);
    const uMin=uMinTmp>minFirst4?uMinTmp:minFirst4;
    const uMax=uMaxTmp<maxFirst4?uMaxTmp:maxFirst4;
    if(uMin>uMax)continue;
    const nIntervals=uMax-uMin+1n;
    intervalCount+=nIntervals;
    // Each interval of width <=W intersects at most ceil(W/2^32)+1 hash bins.
    count+=nIntervals*(ceilDiv(W,CRCwidth)+1n);
  }
  return {count,intervalCount};
}
const suffixPng=countHashesAny4Suffix3('png');
// A broad recognizer: ANY four leading characters followed by ANY of ten
// common three-character file extensions. This family was chosen after
// recognizing the address; NOT a preregistered discovery-wide p-value.
const exts=['png','jpg','gif','pdf','txt','zip','asc','mp3','wav','ogg'];
let extensionBound=0n;
for(const ext of exts)extensionBound+=countHashesAny4Suffix3(ext).count;
const pFloat=x=>Number(x)/Number(Htotal);
const result={
  address,
  valid_source_column32:true,
  assumed_null:'uniform 160-bit HASH160; arbitrary 32-bit checksum; 32 model variants',
  fixed7_one_address_upper_probability:pFloat(prefixBound),
  fixed7_32variants_upper_probability:pFloat(32n*prefixBound),
  any4_png_32variants_upper_probability:pFloat(32n*suffixPng.count),
  any4_10extensions_32variants_upper_probability:pFloat(32n*extensionBound),
  suffix_png_original_prefix_interval_count:suffixPng.intervalCount.toString(),
  exact_fixed7_candidate_hash_upper_count:prefixBound.toString()
};
assert(result.fixed7_one_address_upper_probability<1.15e-12);
assert(result.fixed7_one_address_upper_probability>1.14e-12);
assert(result.any4_png_32variants_upper_probability<1.7e-4);
assert(result.any4_10extensions_32variants_upper_probability<1.7e-3);
console.log(JSON.stringify(result,null,2));
