'use strict';

/**
 * Original 2014 signed Stage07 MP3 as historical 2013 bytewise-XOR pad on
 * original LP2 pp49–51 256-byte numeral panel. All raw audio offsets searched
 * exactly via source-fixed common binary file signatures; zlib inflate validated.
 * Agent43, 23 Nov 2026. Read-only, standard Node22 builtins.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const target = Buffer.from(grid.bytes);

assert.equal(target.length,256);
assert.equal(crypto.createHash('sha256').update(target).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2bdb23184a4b290');

const audioURL='https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3';
const sourceSHA256='1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6';
const sourceBlob='09fe068192b76a3697c47ec1d604b527703db798';

const signatures=[
 ['PNG','89504e470d0a1a0a'],
 ['ZIP','504b0304'],
 ['GZIP','1f8b08'],
 ['PDF','25504446'],
 ['JPEG','ffd8ff'],
 ['BZIP2','425a68'],
 ['7ZIP','377abcaf271c'],
 ['XZ','fd377a585a00'],
 ['RIFF','52494646'],
 ['OGG','4f676753'],
 ['ID3','494433'],
 ['OpenPGP-armor','2d2d2d2d2d424547494e2050475020'],
 ['SQLite','53514c69746520666f726d6174203300'],
 ['zlib-deflate-01','7801'],
 ['zlib-deflate-9C','789c'],
 ['zlib-deflate-DA','78da'],
];

/** @param {Buffer} audio @param {Buffer} ciphertext @param {Buffer} magic */
function exactOffsets(audio,ciphertext,magic) {
  const need=Buffer.alloc(magic.length);
  for(let i=0;i<magic.length;i++)need[i]=ciphertext[i]^magic[i];
  const result=[];
  let start=-1;
  while((start=audio.indexOf(need,start+1))!==-1){
    if(start+ciphertext.length>audio.length)continue;
    result.push(start);
  }
  return result;
}

/** @param {Buffer} audio @param {Buffer} ciphertext @param {number} offset */
function xorAt(audio,ciphertext,offset) {
  const output=Buffer.alloc(ciphertext.length);
  for(let i=0;i<output.length;i++)output[i]=ciphertext[i]^audio[offset+i];
  return output;
}

/** @param {Buffer} bytes @param {'GZIP'|'zlib'} type */
function attemptInflate(bytes,type){
  try {
    const output=type==='GZIP'?zlib.gunzipSync(bytes):zlib.inflateSync(bytes);
    return {valid:true,decodedBytes:output.length,first64:output.subarray(0,64).toString('hex'),
      readable:output.subarray(0,120).toString('utf8')};
  } catch(error){
    if(error?.code==='Z_DATA_ERROR'||error?.code==='Z_BUF_ERROR') return {valid:false};
    throw error;
  }
}

async function main() {
  const res=await fetch(audioURL,{signal:AbortSignal.timeout(120000)});
  assert.equal(res.status,200);
  const audio=Buffer.from(await res.arrayBuffer());
  assert.equal(audio.length,6651873);
  assert.equal(crypto.createHash('sha256').update(audio).digest('hex'),sourceSHA256);
  assert.equal(crypto.createHash('sha1')
    .update(Buffer.from('blob '+audio.length+'\0')).update(audio).digest('hex'),sourceBlob);
  const known=Buffer.from('504b0304','hex');
  const controlStart=1234567;
  const plant=Buffer.from(target);
  for(let i=0;i<known.length;i++)plant[i]=known[i]^audio[controlStart+i];
  const control=exactOffsets(audio,plant,known);
  assert.ok(control.includes(controlStart));
  assert.deepEqual(xorAt(audio,plant,controlStart).subarray(0,4),known);

  const matches=[];
  for(const [name,code] of signatures){
    const marker=Buffer.from(code,'hex');
    const offsets=exactOffsets(audio,target,marker);
    const entries=[];
    for(const off of offsets){
      const decrypted=xorAt(audio,target,off);
      assert.ok(decrypted.subarray(0,marker.length).equals(marker));
      const item={offset:off,first48Hex:decrypted.subarray(0,48).toString('hex')};
      if(name==='GZIP')item.inflate=attemptInflate(decrypted,'GZIP');
      if(name.startsWith('zlib-'))item.inflate=attemptInflate(decrypted,'zlib');
      entries.push(item);
    }
    matches.push({name,magicHex:code,count:offsets.length,
      validInflate:entries.filter(x=>x.inflate?.valid).length,
      candidates:entries.slice(0,20)});
  }
  console.log(JSON.stringify({
    sourceURL:audioURL,sourceSHA256,sourceBlob,
    originalGridByteSHA256:crypto.createHash('sha256').update(target).digest('hex'),
    audioOffsetsWithComplete256Bytes:audio.length-target.length+1,
    originalSignatures:matches,
    positiveControl:{ZIP4:controlStart,found:control.includes(controlStart)},
  },null,2));
  console.log('PASS original full-audio-offset exact historical XOR file-header recovery gate');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
