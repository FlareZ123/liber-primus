'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const grid=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/base60-grid.json'),'utf8'));
const alphabet=grid.alphabet,tokens=grid.rows.flat(),canonical=Buffer.from(grid.byte_rows.flat());
const target=Buffer.from('36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4','hex');
assert.equal(canonical.length,256);assert.equal(target.length,64);assert.equal(tokens.length,256);
const ambiguities=[];
for(let i=0;i<tokens.length;i++){if(!/[Il]/.test(tokens[i]))continue;const alt=[...tokens[i]].map(ch=>ch==='I'?'l':ch==='l'?'I':ch).join('');const v=alphabet.indexOf(alt[0])*60+alphabet.indexOf(alt[1]);assert.notEqual(v,canonical[i]);ambiguities.push({index:i,altValue:v});}
assert.equal(ambiguities.length,10);
const sha=data=>crypto.createHash('sha512').update(data).digest();
const hits={chunkEqualsTarget:[],chunkSha512EqualsTarget:[],concatDigests:[],reverseConcatDigests:[],hashedLeafMerkle:[],reverseHashedLeafMerkle:[],rawLeafMerkle:[],reverseRawLeafMerkle:[]};
let canonicalDetails=null;
for(let mask=0;mask<(1<<ambiguities.length);mask++){
 const bytes=Buffer.from(canonical);for(let bit=0;bit<ambiguities.length;bit++)if(mask&(1<<bit))bytes[ambiguities[bit].index]=ambiguities[bit].altValue;
 const chunks=Array.from({length:4},(_,i)=>bytes.subarray(i*64,(i+1)*64)),hs=chunks.map(sha),rh=hs.slice().reverse(),rc=chunks.slice().reverse();
 if(chunks.some(x=>x.equals(target)))hits.chunkEqualsTarget.push(mask);
 if(hs.some(x=>x.equals(target)))hits.chunkSha512EqualsTarget.push(mask);
 if(sha(Buffer.concat(hs)).equals(target))hits.concatDigests.push(mask);
 if(sha(Buffer.concat(rh)).equals(target))hits.reverseConcatDigests.push(mask);
 const hm=sha(Buffer.concat([sha(Buffer.concat([hs[0],hs[1]])),sha(Buffer.concat([hs[2],hs[3]]))]));
 const rhm=sha(Buffer.concat([sha(Buffer.concat([rh[0],rh[1]])),sha(Buffer.concat([rh[2],rh[3]]))]));
 const rm=sha(Buffer.concat([sha(Buffer.concat([chunks[0],chunks[1]])),sha(Buffer.concat([chunks[2],chunks[3]]))]));
 const rrm=sha(Buffer.concat([sha(Buffer.concat([rc[0],rc[1]])),sha(Buffer.concat([rc[2],rc[3]]))]));
 if(hm.equals(target))hits.hashedLeafMerkle.push(mask);if(rhm.equals(target))hits.reverseHashedLeafMerkle.push(mask);if(rm.equals(target))hits.rawLeafMerkle.push(mask);if(rrm.equals(target))hits.reverseRawLeafMerkle.push(mask);
 if(mask===0)canonicalDetails={p50Sha512:sha(bytes).toString('hex'),chunkSha512:hs.map(x=>x.toString('hex')),concatChunkDigestsSha512:sha(Buffer.concat(hs)).toString('hex'),hashedLeafMerkleRoot:hm.toString('hex'),rawLeafMerkleRoot:rm.toString('hex')};
}
for(const family of Object.values(hits))assert.equal(family.length,0);
console.log(JSON.stringify({p50Bytes:256,p56TargetBytes:64,blockSize:64,blocks:4,iSlashLCells:10,readingsTested:1024,hits,canonicalDetails},null,2));
