'use strict';
/**
 * Original LP2 red-span boundaries as AES operands for the 256-byte table.
 * Node.js 22 CommonJS, read-only. Run from any working directory.
 * This is a bounded source hypothesis, not an authenticated Cicada decoder.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corp=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const grid=read('resources/liber-primus/lp2-grid-256.json');
const spans=ink.pages.filter(p=>p.page<56)
  .flatMap(p=>(p.red_spans||[]).map(s=>({page:p.page,s})));
assert.equal(spans.length,16);
const start=[],end=[];
for(const {page,s} of spans){
  const values=corp.pages.find(p=>p.page===page).indices;
  assert.equal(values.slice(s.start,s.start+s.length)
    .map(i=>corp.runes[i]).join(''),s.runes);
  start.push(values[s.start]);
  end.push(values[s.start+s.length-1]);
}
assert.equal(Buffer.from(start).toString('hex'),
  '0f140d18170e0014011317151b001018');
assert.equal(Buffer.from(end).toString('hex'),
  '0516020c131118151a0d060c0f080913');
const original=Buffer.from(grid.bytes);
assert.equal(original.length,256);
assert.deepEqual(grid.pages.flatMap(p=>p.bytes),grid.bytes);
const sha=crypto.createHash('sha256').update(original).digest('hex');
assert.equal(sha,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
/** @param {number[]} v */
const primes=v=>Buffer.from(v.map(i=>corp.prime[i]));
/** @param {Buffer} a @param {Buffer} b */
const zipped=(a,b)=>Buffer.from(Array.from(a).flatMap((x,i)=>[x,b[i]]));
const keys=[];
for(const [register,a,b] of [
  ['GP index',Buffer.from(start),Buffer.from(end)],
  ['GP prime',primes(start),primes(end)]
]){
  keys.push({register,role:'starts-key/ends-IV',key:a,iv:b});
  keys.push({register,role:'starts-then-ends',key:Buffer.concat([a,b]),iv:Buffer.alloc(16)});
  keys.push({register,role:'interleaved',key:zipped(a,b),iv:Buffer.alloc(16)});
}
/**
 * @param {Buffer} bytes
 * @param {Buffer} key
 * @param {Buffer} iv
 * @param {'ECB'|'CBC'|'CTR'} mode
 * @param {'encrypt'|'decrypt'} direction
 */
function aes(bytes,key,iv,mode,direction){
  const name='aes-'+key.length*8+'-'+mode.toLowerCase();
  const op=direction==='encrypt'
    ?crypto.createCipheriv(name,key,mode==='ECB'?null:iv)
    :crypto.createDecipheriv(name,key,mode==='ECB'?null:iv);
  if(mode!=='CTR')op.setAutoPadding(false);
  return Buffer.concat([op.update(bytes),op.final()]);
}
/** @param {Buffer} x */
function quality(x){
  let printable=0,run=0,longest=0;
  for(const b of x){
    const ascii=b>=32&&b<=126;
    printable+=Number(ascii||b===9||b===10||b===13);
    run=ascii?run+1:0;
    longest=Math.max(longest,run);
  }
  const pad=x.at(-1);
  const pkcs7=pad>=1&&pad<=16&&x.subarray(-pad).every(b=>b===pad);
  const headers=[['ZIP','504b0304'],['PNG','89504e47'],['PDF','25504446'],
    ['GZIP','1f8b'],['JPEG','ffd8'],['BZIP2','425a68'],['7ZIP','377abcaf']]
    .filter(([,hex])=>x.subarray(0,hex.length/2)
      .equals(Buffer.from(hex,'hex'))).map(([name])=>name);
  return {printable,longestAsciiRun:longest,pkcs7,headers};
}
const plant=Buffer.alloc(256);
Buffer.from('CICADA 3301 LIBER PRIMUS KNOWN CONTROL').copy(plant);
const results=[];
for(const {register,role,key,iv} of keys)for(const mode of ['ECB','CBC','CTR']){
  const decoded=aes(original,key,iv,mode,'decrypt');
  assert.deepEqual(aes(decoded,key,iv,mode,'encrypt'),original);
  const encrypted=aes(plant,key,iv,mode,'encrypt');
  assert.deepEqual(aes(encrypted,key,iv,mode,'decrypt'),plant);
  assert.notDeepEqual(aes(encrypted,Buffer.from(key).reverse(),iv,mode,'decrypt'),plant);
  results.push({register,role,mode,first16:decoded.subarray(0,16).toString('hex'),
    ...quality(decoded)});
}
assert.equal(results.length,18);
assert.equal(Math.max(...results.map(x=>x.printable)),110);
assert.equal(Math.max(...results.map(x=>x.longestAsciiRun)),7);
assert.ok(results.every(x=>!x.pkcs7&&x.headers.length===0));
console.log(JSON.stringify({
  source:'Original LP2 unknown red spans and grid',sha256:sha,
  start,end,tested:results.length,originalRoundTrips:18,
  plantedRoundTrips:18,typedPayloads:0,
  caveat:'AES, boundary roles, and zero AES256 IV are unselected hypotheses',
  results
},null,2));
