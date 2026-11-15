'use strict';

// Exact-byte direct-preimage test of the period-original 2014 Stage11 delivery
// index. This is a participant-archive copy, not an authenticated HTTP response.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const indexPath=path.join(root,'resources/cicada2014-onion7-index.html');
const bytes=fs.readFileSync(indexPath);
const target=JSON.parse(fs.readFileSync(path.join(root,'resources/cicada2014-archive-hash-manifest.json'),'utf8')).targetHex;
const expectedBlob='303db130705f0ef9be2a738f4336d5cfcebde80c';
const expectedBytes=1640;
const blobSha=crypto.createHash('sha1').update(Buffer.concat([
  Buffer.from('blob '+bytes.length+'\0','ascii'),bytes
])).digest('hex');
assert.equal(bytes.length,expectedBytes);
assert.equal(blobSha,expectedBlob);
assert.match(target,/^[0-9a-f]{128}$/);
assert.equal(
  crypto.createHash('sha512').update('abc','ascii').digest('hex'),
  'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
);

const html=bytes.toString('utf8');
const imageRefs=[...html.matchAll(/<img\b[^>]*\bsrc=["'](\d+)\.jpg["']/gi)].map(m=>Number(m[1]));
assert.equal(imageRefs.length,58);
assert.deepEqual(imageRefs,Array.from({length:58},(_,i)=>i));

const algorithms=['sha512','sha3-512','blake2b512'];
const hashes=Object.fromEntries(algorithms.map(name=>[
  name,crypto.createHash(name).update(bytes).digest('hex')
]));
const matches=Object.entries(hashes).filter(([,digest])=>digest===target).map(([algorithm])=>algorithm);
assert.equal(matches.length,0);
console.log(JSON.stringify({
  candidate:'exact original 2014 Stage11 index.html bytes',
  sourceCommit:'6c3421a4d245596e403c88e037509d162a2afd17',
  sourceCommitDate:'2014-05-11T18:33:43Z',
  byteLength:bytes.length,
  gitBlobSha1:blobSha,
  imageReferences:imageRefs.length,
  imageOrder:'0.jpg through 57.jpg, ascending',
  targetP56Sha512:target,
  algorithms,
  hashes,
  matches,
  decision:'NO_DIRECT_MATCH_FOR_THIS_EXACT_ARCHIVED_HTML_BODY',
  limitation:'The archived index copy is not an authenticated original HTTP entity body; no alternate whitespace or wrapper variants were tested.'
},null,2));
