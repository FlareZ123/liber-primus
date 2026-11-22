'use strict';
/**
 * Exact original 2013 Cicada OS 761.mp3 source vs original solved p56 hash.
 * Source: archived audio (NOT a guessed string, MP3 re-encoding or transcript).
 * Human clue: the 2013 ID3 metadata already carries p57's 2014 PARABLE.
 *
 * Windows 11 / Node.js 22: node sims/lp2_p56_2013_instar_audio_exact_digest_sft.cjs
 * Read-only on all local files; fetches only the immutable original public audio.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const SOURCE={
 url:'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/2013/002-3301/3301-contents/audio/761.mp3',
 expectedBytes:4010732,
 gitBlob:'7e2bd299fbc7b96283219cf15e2904641daf631f'
};
const target='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.equal(target.length,128);
assert.equal(crypto.createHash('sha512').update('abc').digest('hex'),
 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f');
/** @param {Buffer} b @returns {string} */
function gitsha(b){return crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');}
/** @param {Buffer} b @returns {number} */
function id3v2End(b){
 assert.equal(b.subarray(0,3).toString('ascii'),'ID3');
 const n=Array.from(b.subarray(6,10));
 assert(n.every(x=>x<128));
 const size=((n[0]*128+n[1])*128+n[2])*128+n[3];
 const footer=(b[5]&0x10)?10:0;
 const end=10+size+footer;
 assert(end>10&&end<b.length);
 return end;
}
/** @param {Buffer} b @param {string} label @returns {object} */
function test(b,label){
 const digests={};
 for(const alg of ['sha512','sha3-512','blake2b512']){
  const digest=crypto.createHash(alg).update(b).digest('hex');
  assert.equal(digest.length,128);
  digests[alg]=digest;
 }
 return {label,bytes:b.length,digests,matched:Object.keys(digests).filter(a=>digests[a]===target)};
}
async function main(){
 const response=await fetch(SOURCE.url,{signal:AbortSignal.timeout(120000)});
 assert.equal(response.status,200);
 const source=Buffer.from(await response.arrayBuffer());
 assert.equal(source.length,SOURCE.expectedBytes);
 assert.equal(gitsha(source),SOURCE.gitBlob,'exact 2013 original Git blob identity');
 const tagEnd=id3v2End(source);
 const sound=source.subarray(tagEnd);
 assert.equal(sound[0],0xff,'MP3 audio frames begin with 0xFF MPEG sync');
 assert.equal(sound[1]&0xe0,0xe0,'audio MPEG sync header');
 assert.equal(source.length,tagEnd+sound.length);
 const rows=[
  test(source,'exact public 2013 MP3 original bytes'),
  test(source.subarray(0,tagEnd),'original ID3v2 tag including header'),
  test(source.subarray(10,tagEnd),'original ID3v2 payload excluding header'),
  test(sound,'original MP3 frames after ID3v2 tag')
 ];
 // Native positives verify hash gate and complete length-preserving partition.
 assert.equal(rows[0].bytes,rows[1].bytes+rows[3].bytes);
 assert.equal(crypto.createHash('sha512').update(Buffer.from('abc')).digest('hex').length,128);
 console.log(JSON.stringify({input:'original authenticated 2013 CicadaOS 761.mp3',sourceGitBlob:gitsha(source),
  sourceBytes:source.length,id3End:tagEnd,target,fullSourceHashComparisons:rows.length*3,
  variants:rows,anyMatch:rows.some(x=>x.matched.length>0),
  result:'A hash match is a genuine source byte preimage; a mismatch excludes only these four natural original audio/ID3 byte slices and three algorithms'
 },null,2));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
