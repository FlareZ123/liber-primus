'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');
const fs = require('node:fs');
const SIGNED_URL = 'https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc';
const P56_DIGEST_HEX = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
function getBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error('GET ' + url + ' returned HTTP ' + response.statusCode)); return; }
      const chunks = []; response.on('data', (chunk) => chunks.push(chunk)); response.on('error', reject);
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}
function extractHexBlocks(text) {
  const blocks=[]; let current=[];
  for (const raw of text.split(/\r?\n/)) {
    const line=raw.trim();
    if (/^[0-9a-f]{2,}$/i.test(line) && line.length%2===0) { current.push(line); continue; }
    if (current.length) { blocks.push(current.join('')); current=[]; }
  }
  if (current.length) blocks.push(current.join(''));
  return blocks.filter(h=>h.length>=100).map(h=>Buffer.from(h,'hex'));
}
function sha512(bytes) { return crypto.createHash('sha512').update(bytes).digest(); }
function hex(bytes) { return bytes.toString('hex'); }
function rowPair(bytes,a,b) {
  const out=[]; for(let row=0;row<32;row+=1){out.push(bytes[row*8+a],bytes[row*8+b]);}
  return Buffer.from(out);
}
async function main() {
  const signed=await getBytes(SIGNED_URL);
  const assets=extractHexBlocks(signed.toString('utf8'));
  assert.equal(assets.length,3); assert.deepEqual(assets.map(x=>x.length),[1084,1635,9288]);
  const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
  assert.equal(grid.bytes.length,256);
  const table=Buffer.from(grid.bytes);
  const orbitPositions=Array.from({length:64},(_,i)=>((147-1)+28*i)%256);
  const orbitSet=new Set(orbitPositions); assert.equal(orbitSet.size,64);
  const selectedColumns=[...new Set(orbitPositions.map(i=>(i%8)+1))].sort((a,b)=>a-b);
  assert.deepEqual(selectedColumns,[3,7]);
  const blocks=[
    {label:'147_plus_28_orbit',bytes:Buffer.from(orbitPositions.map(i=>table[i]))},
    {label:'columns_1_2',bytes:rowPair(table,0,1)},
    {label:'columns_4_5',bytes:rowPair(table,3,4)},
    {label:'columns_6_8',bytes:rowPair(table,5,7)}
  ];
  assert.ok(blocks.every(b=>b.bytes.length===64));
  const assetHashes=assets.map(sha512);
  const references=[
    ...assetHashes.map((bytes,i)=>({label:'SHA512(signed_asset_'+(i+1)+')',bytes})),
    {label:'p56_published_64_byte_digest',bytes:Buffer.from(P56_DIGEST_HEX,'hex')}
  ];
  const matchMatrix=blocks.map(block=>({
    block:block.label,
    exactMatches:references.filter(r=>block.bytes.equals(r.bytes)).map(r=>r.label),
    hammingDistances:references.map(r=>({reference:r.label,differingBytes:block.bytes.reduce((s,v,i)=>s+(v===r.bytes[i]?0:1),0)})),
    blockHex:hex(block.bytes)
  }));
  const complement=Buffer.from(Array.from({length:256},(_,i)=>i).filter(i=>!orbitSet.has(i)).map(i=>table[i]));
  const orderedAssetHashes=Buffer.concat(assetHashes);
  console.log('P50 GRID:',grid.shape,'256 bytes; row-major');
  console.log('SOURCE SELECTOR: one-based cell 147, step 28 mod 256, 64 positions');
  console.log('ORBIT COLUMNS (1-based):',selectedColumns.join(','));
  console.log('COMPLEMENT COLUMNS (1-based): 1,2,4,5,6,8');
  console.log('SIGNED ASSET LENGTHS:',assets.map(x=>x.length).join(','));
  console.log('SIGNED ASSET SHA512:',assetHashes.map(hex).join('\n'));
  console.log('P56 TARGET:',P56_DIGEST_HEX);
  console.log('FOUR 64-BYTE BLOCK COMPARISONS:',JSON.stringify(matchMatrix,null,2));
  console.log('ROW-MAJOR COMPLEMENT == ASSET HASH CONCAT:',complement.equals(orderedAssetHashes));
  console.log('PASS: exact source extraction and all 4×4 byte comparisons completed.');
}
main().catch(error=>{console.error('FAIL:',error);process.exitCode=1;});
