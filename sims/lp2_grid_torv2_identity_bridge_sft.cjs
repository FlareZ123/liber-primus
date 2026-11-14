'use strict';
/**
 * Original LP2 p49–51 256-byte table as two Tor-v2 RSA1024 identity moduli.
 * Reproduces a bounded historical-key test; it asserts no recovered LP2 plaintext.
 * SFT: node sims/lp2_grid_torv2_identity_bridge_sft.cjs
 * @typedef {{reading:string,half:number,orientation:string,exponent:number,der:string,onion:string}} Candidate
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const src=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/base60-grid.json'),'utf8'));
const rows=src.byte_rows;
assert.equal(rows.length,32);
assert(rows.every(r=>r.length===8&&r.every(x=>Number.isInteger(x)&&x>=0&&x<=255)));
const table=Buffer.from(rows.flat());
assert.equal(table.length,256);
assert.equal(crypto.createHash('sha256').update(table).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const alphabet='abcdefghijklmnopqrstuvwxyz234567';
/** @param {Buffer} bytes @returns {string} */
function base32(bytes){
  let value=0,bits=0,out='';
  for(const byte of bytes){
    value=(value<<8)|byte;bits+=8;
    while(bits>=5){
      bits-=5;out+=alphabet[(value>>>bits)&31];value&=(1<<bits)-1;
    }
  }
  if(bits)out+=alphabet[(value<<(5-bits))&31];
  return out;
}
assert.equal(base32(Buffer.from('helloworld','ascii')),'nbswy3dpo5xxe3de');
/**
 * @param {Buffer} modulus 1024-bit candidate RSA modulus, big-endian.
 * @param {number} e Public exponent.
 * @param {'pkcs1'|'spki'} form DER serialization; historical Tor v2 uses PKCS1.
 */
function onion(modulus,e,form){
  assert.equal(modulus.length,128);
  const exponent=e===65537?Buffer.from([1,0,1]):Buffer.from([e]);
  const key=crypto.createPublicKey({key:{
    kty:'RSA',n:modulus.toString('base64url'),e:exponent.toString('base64url')
  },format:'jwk'});
  const der=key.export({format:'der',type:form});
  return base32(crypto.createHash('sha1').update(der).digest().subarray(0,10));
}
// A genuinely valid generated 1024-bit key verifies independent DER and SHA1
// roundtripping; the source-candidate output is independent of this random key.
const positive=crypto.generateKeyPairSync('rsa',{modulusLength:1024,publicExponent:65537}).publicKey;
const publicDer=positive.export({format:'der',type:'pkcs1'});
const publicModulus=Buffer.from(positive.export({format:'jwk'}).n,'base64url');
assert.equal(publicModulus.length,128);
assert.equal(onion(publicModulus,65537,'pkcs1'),
  base32(crypto.createHash('sha1').update(publicDer).digest().subarray(0,10)));
const readings={
  'first16-last16rows':[
    Buffer.from(rows.slice(0,16).flat()),Buffer.from(rows.slice(16).flat())
  ],
  'left4-right4columns':[
    Buffer.from(rows.flatMap(r=>r.slice(0,4))),Buffer.from(rows.flatMap(r=>r.slice(4)))
  ],
  'even-odd-rows':[
    Buffer.from(rows.filter((_,i)=>i%2===0).flat()),
    Buffer.from(rows.filter((_,i)=>i%2===1).flat())
  ],
  'even-odd-columns':[
    Buffer.from(rows.flatMap(r=>r.filter((_,i)=>i%2===0))),
    Buffer.from(rows.flatMap(r=>r.filter((_,i)=>i%2===1)))
  ]
};
const targets=new Set([
  '6sws36unkmvdy4b7', // unverified p55 prime-sum/mod32 candidate
  'ky2khlqdf7qdznac', // historical LP2 distributor
  'rejpopiv6ojgqzpn', // signed-2013 BASE29 per-word integer/mod32 alternative
  'zpopahrtrm4scfxr'  // p55 16-word first-rune index direct base32 control
]);
/** @type {Candidate[]} */
const candidates=[];
for(const [reading,halves] of Object.entries(readings)){
  for(let half=0;half<2;half++){
    for(const [orientation,bytes] of [
      ['forward',halves[half]],['reverse',Buffer.from(halves[half]).reverse()]
    ]){
      for(const exponent of [65537,3]){
        for(const der of ['pkcs1','spki']){
          candidates.push({reading,half,orientation,exponent,der,
            onion:onion(bytes,exponent,der)});
        }
      }
    }
  }
}
assert.equal(candidates.length,64);
assert.equal(new Set(candidates.map(x=>x.onion)).size,64);
const matches=candidates.filter(x=>targets.has(x.onion));
assert.deepEqual(matches,[]);
assert.equal(candidates[0].onion,'rrygwpxoseopdwbk');
assert.equal(candidates[1].onion,'ew4usw6rm6rxx6gj');
console.log(JSON.stringify({
  source:'LP2 printed numeric table, full 256 bytes; SHA256 fixed',
  historicalFormat:'Tor-v2 1024-bit RSA identity PKCS1 DER SHA1, first 80 bits',
  splits:4,halvesPerSplit:2,candidates:candidates.length,
  targetHosts:[...targets],matches:matches.length,
  first16RowPKCS1:candidates[0].onion,positiveRSA:true,
  decision:'No direct table half encodes the two historically relevant tested Tor-v2 public-key hashes. No unknown LP2 plaintext or authenticated host recovered.'
},null,2));
