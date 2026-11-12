'use strict';

/*
 * One source-frozen key-consumer test:
 * p15 BASE29 quotient -> DATA/560.13 byte base; p15 Fibonacci-prime spiral
 * -> sixteen relative byte offsets; sampled bytes -> 16-byte key; p50 256-byte
 * numerical table -> direct repeating XOR or AES-128-ECB.
 *
 * No offset/phase/mode/IV search. The quotient-plus-prime address and AES use
 * remain hypotheses, not an authenticated Cicada instruction.
 *
 * Node 22:
 * node sims/lp2_p15_56013_baseprime_aes128_sft.cjs <DATA_560.13> <output.json>
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {readSquare,clockwiseSpiral,primeList,uniqueFibonacciPrimeRanks}=require('./fibonacci_prime_spiral.cjs');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const p15=corpus.pages.find(p=>p.page===15);
const heading=p15.indices.slice(0,9);
assert.deepEqual(heading,[0,1,20,19,24,28,26,22,24]);
const titleNumber=heading.reduce((v,x)=>v*29n+BigInt(x),0n);
assert.equal(titleNumber,29553734724n);
const base=Number(titleNumber/3301n);
assert.equal(base,8952964);
assert.equal(Number(titleNumber%3301n),560);

const square=readSquare();
const spiralPositions=clockwiseSpiral();
const spiralNumbers=spiralPositions.map(([r,c])=>square[r][c]);
assert.deepEqual(spiralNumbers,[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const ranks=uniqueFibonacciPrimeRanks();
const allPrimes=primeList(ranks[ranks.length-1]);
const primeOffsets=ranks.map(rank=>allPrimes[rank-1]);
assert.deepEqual(ranks,[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]);
assert.deepEqual(primeOffsets,[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]);
assert.deepEqual(spiralNumbers,primeOffsets.map(p=>Math.abs(3301-p)));
assert.ok(primeOffsets.every(x=>Number.isInteger(x)&&x>0));

const padPath=process.argv[2];
assert.ok(padPath,'Provide the complete original DATA/560.13 file');
const pad=fs.readFileSync(padPath);
assert.equal(pad.length,118818811);
const padSha256=crypto.createHash('sha256').update(pad).digest('hex');
assert.equal(padSha256,'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');

const cipher=Buffer.from(grid.bytes);
assert.equal(cipher.length,256);
const tableSha256=crypto.createHash('sha256').update(cipher).digest('hex');
assert.equal(tableSha256,'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const column=[];
for(let c=0;c<8;c++)for(let r=0;r<32;r++)column.push(cipher[8*r+c]);
const layouts=new Map([['row-major',cipher],['column-major',Buffer.from(column)]]);

// The only two address conventions: quotient and prime are zero-based byte
// offsets, or both are one-based positions (subtract one from their sum).
const keys=new Map([
 ['base+prime-zero-based',Buffer.from(primeOffsets.map(p=>pad[base+p]))],
 ['base+prime-one-based',Buffer.from(primeOffsets.map(p=>pad[base+p-1]))]
]);
for(const [name,key] of keys)assert.equal(key.length,16,name);

function xorRepeat(data,key){
 const out=Buffer.alloc(data.length);
 for(let i=0;i<data.length;i++)out[i]=data[i]^key[i%key.length];
 return out;
}
function aesEcb(data,key,decrypt){
 const engine=decrypt?crypto.createDecipheriv('aes-128-ecb',key,null):crypto.createCipheriv('aes-128-ecb',key,null);
 engine.setAutoPadding(false);
 return Buffer.concat([engine.update(data),engine.final()]);
}
function metrics(data){
 let printable=0,letters=0,spaces=0,run=0,longest=0;
 for(const b of data){
  if((b>=32&&b<=126)||b===9||b===10||b===13)printable++;
  if((b>=65&&b<=90)||(b>=97&&b<=122))letters++;
  if(b===32)spaces++;
  if(b>=32&&b<=126){run++;longest=Math.max(longest,run);}else run=0;
 }
 const sigs=[
  ['PDF','255044462d'],['PNG','89504e470d0a1a0a'],['ZIP','504b0304'],
  ['gzip','1f8b08'],['JPEG','ffd8ff'],['bzip2','425a68'],
  ['xz','fd377a585a00'],['zstd','28b52ffd'],
  ['SQLite','53514c69746520666f726d6174203300'],['ELF','7f454c46'],['GIF','47494638']
 ];
 const magic=sigs.filter(([,h])=>data.subarray(0,h.length/2).toString('hex')===h).map(([n])=>n);
 return {printable,letters,spaces,longestAsciiRun:longest,magic,
  sha256:crypto.createHash('sha256').update(data).digest('hex'),
  sha512:crypto.createHash('sha512').update(data).digest('hex'),
  prefixHex:data.subarray(0,32).toString('hex')};
}
const p56Target='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const results=[];
for(const [keyName,key] of keys){
 // Independent round-trip controls using the actual extracted key.
 const plant=Buffer.from(Array.from({length:256},(_,i)=>(i*73+19)&255));
 assert.deepEqual(aesEcb(aesEcb(plant,key,false),key,true),plant);
 assert.deepEqual(xorRepeat(xorRepeat(plant,key),key),plant);
 for(const [layout,data] of layouts){
  const xor=xorRepeat(data,key);
  results.push({key:keyName,keyHex:key.toString('hex'),layout,consumer:'repeating-XOR',...metrics(xor),p56HashMatch:metrics(xor).sha512===p56Target});
  const aes=aesEcb(data,key,true);
  results.push({key:keyName,keyHex:key.toString('hex'),layout,consumer:'AES-128-ECB',...metrics(aes),p56HashMatch:metrics(aes).sha512===p56Target});
 }
}
assert.equal(results.length,8);
const summary={
 source:{base29Title:titleNumber.toString(),divisor:3301,quotientOffset:base,remainder:560,
  spiralPrimeOffsets:primeOffsets,padBytes:pad.length,padSha256,tableBytes:cipher.length,tableSha256},
 candidates:results,
 conclusion:'This fixed quotient-plus-prime 16-byte key sample was tested only as a repeating XOR pad and as an AES-128-ECB key against the original 256-byte p50 table in row/column order. No fitted IV, phase, offset, or alternate cipher mode is searched.'
};
const json=JSON.stringify(summary,null,2);
if(process.argv[3])fs.writeFileSync(process.argv[3],json+'\n');
console.log(json);
