'use strict';
/**
 * Source-native real 2014 Stage05 gzip packet-positive for GP29 anti-repeat
 * byte-COBS transport. The packetization is newly planted; the compressed
 * source bytes and resulting decompressed original image stream are historical.
 * Run: node sims/lp2_antirepeat_cobs_stage05_sourcepositive_sft.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const {encode,decode}=require('./lp2_antirepeat_cobs_packet_sft.cjs');

const URL='https://raw.githubusercontent.com/iBotPeaches/cicada_3301/a0a616d85717af59f8b806875b43d51e06e1e874/onions/avowyfgl5lkzfj3n.onion/post/index.html';
const ORIGINAL_GIT_SHA='f8b6e108b8dab4fa095356f73a4f53e41918cb55';
const OUTPUT_SHA256='8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a';

async function main(){
  const response=await fetch(URL);
  assert.equal(response.status,200,'archived 2014 HTML retrieval failed');
  const html=Buffer.from(await response.arrayBuffer());
  const blobsha=crypto.createHash('sha1').update('blob '+html.length+'\0').update(html).digest('hex');
  assert.equal(blobsha,ORIGINAL_GIT_SHA,'archived Git blob changed');
  const body=html.toString('utf8'), start=/1f8b08/i.exec(body);
  assert(start,'historical GZIP hex source missing');
  let hex='',index=start.index;
  for(;index<body.length;index++){
    const c=body[index];
    if(/[0-9a-fA-F]/.test(c))hex+=c;
    else if(!/\s/.test(c))break;
  }
  assert.equal(hex.length%2,0,'original source hex has incomplete byte');
  const packed=Buffer.from(hex,'hex');
  const unpacked=zlib.gunzipSync(packed);
  assert.equal(unpacked.length,3010703);
  assert.equal(crypto.createHash('sha256').update(unpacked).digest('hex'),OUTPUT_SHA256);
  assert(packed.length>1_000_000);
  const frameBytes=192;
  const packets=[];
  for(let i=0;i<packed.length;i+=frameBytes)packets.push([...packed.subarray(i,i+frameBytes)]);
  const runes=encode(packets,24);
  const result=decode(runes);
  assert.equal(result.repeats,packets.length-1);
  assert(result.decoded.every(x=>x!==null));
  assert.deepEqual(Buffer.concat(result.decoded.map(x=>Buffer.from(x))),packed);
  assert.deepEqual(encode(result.decoded,24),runes);
  assert.equal(crypto.createHash('sha256').update(zlib.gunzipSync(Buffer.concat(result.decoded.map(x=>Buffer.from(x))))).digest('hex'),OUTPUT_SHA256);
  console.log(JSON.stringify({status:'PASS',source:'2014 avowy onion Stage05 archived GZIP hex',gitBlobSHA1:blobsha,compressedBytes:packed.length,originalUnpackedBytes:unpacked.length,unpackedSHA256:OUTPUT_SHA256,plantedPackets:packets.length,plantedRunes:runes.length,exactByteInverse:true,sourceNativeDecompression:true},null,2));
}
main().catch(err=>{console.error(err);process.exitCode=1;});
