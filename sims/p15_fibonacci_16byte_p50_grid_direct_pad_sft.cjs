'use strict';
/**
 * Literal 16-scalar p15 Fibonacci-prime spiral pad applied once to the
 * original p49-51 256-byte base60 table. This bounded source-clue route
 * is distinct from the earlier packed 256-bit AES/ChaCha20/RC4 trials:
 * test only the source-visible 16-periodic byte operation and GP29
 * arithmetic. No key offsets, IVs, encodings or posthoc parameter search.
 *
 * Run via manual fibonacci-spinal-key-256 workflow probe=literal-pad.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {readSquare, clockwiseSpiral, primeList, uniqueFibonacciPrimeRanks} =
  require('./fibonacci_prime_spiral.cjs');
const {encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.join(__dirname, '..');
const MOD = 29;
const GRID_SHA256 = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';

/** @param {number[]} a */
function toBuffer(a){return Buffer.from(a);}

/** @param {Buffer} data */
function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}

/** @param {number} a @param {number} m */
function mod(a,m){return (a%m+m)%m;}

/** @param {readonly number[]} a */
function ioc(a){
  const freq = new Array(MOD).fill(0);
  for(const v of a)freq[v]++;
  return freq.reduce((sum,n)=>sum+n*(n-1),0)/(a.length*(a.length-1));
}

/** @param {number[]} a */
function metrics(a){
  let run=0,longest=0;
  const printable=a.filter(b=>b>=32&&b<=126||b===9||b===10||b===13).length;
  const letters=a.filter(b=>b>=65&&b<=90||b>=97&&b<=122).length;
  for(const b of a){
    run=b>=32&&b<=126?run+1:0;
    longest=Math.max(longest,run);
  }
  const head=toBuffer(a).subarray(0,16).toString('hex');
  const signatures=[
    ['JPEG','ffd8ff'],['PNG','89504e470d0a1a0a'],
    ['PDF','255044462d'],['ZIP','504b0304'],['gzip','1f8b08'],
    ['7z','377abcaf271c'],['GIF','47494638'],['Ogg','4f676753'],
    ['OpenPGP-armor','2d2d2d2d2d424547494e20504750']
  ].filter(([name,signature])=>head.startsWith(signature)).map(([name])=>name);
  return {printable,letters,longestPrintableRun:longest,head16Hex:head,signatures};
}

/** @param {number[]} nums @param {number} value */
function periodicKey(nums,value){return mod(nums[value%16],256);}

/** @param {number} x @param {number} key @param {'xor'|'plus'|'minus'} mode */
function decodeByte(x,key,mode){
  if(mode==='xor')return x^key;
  return mod(x+(mode==='plus'?key:-key),256);
}

/** @param {number} x @param {number} key @param {'plus'|'minus'} mode */
function decodeGP(x,key,mode){return mod(x+(mode==='plus'?key:-key),MOD);}

function source(){
  const square=readSquare(),coords=clockwiseSpiral();
  const nums=coords.map(([r,c])=>square[r][c]);
  const ranks=uniqueFibonacciPrimeRanks();
  const primes=primeList(Math.max(...ranks));
  const primeNums=ranks.map(index=>primes[index-1]);
  assert.deepEqual(nums,primeNums.map(x=>Math.abs(3301-x)));
  assert.equal(nums.length,16);
  const data=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-grid-256.json'),'utf8'));
  assert.equal(data.bytes.length,256);
  const table=toBuffer(data.bytes);
  assert.equal(sha256(table),GRID_SHA256);
  return {keys:[{name:'printed-absolute-difference',values:nums},
    {name:'recovered-prime',values:primeNums}],
    grid:Array.from(table),sourceGridSha256:sha256(table)};
}

function run(){
  const {keys,grid,sourceGridSha256}=source();
  const english=encode(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'),'utf8')).slice(0,256);
  assert.equal(english.length,256);
  const realBytes=[],realGP=[],positive=[];
  const sample=Array.from(Buffer.from(('THE NUMBERS ARE THE DIRECTION. ').repeat(9),'ascii').subarray(0,256));
  assert.equal(sample.length,256);
  for(const key of keys){
    for(const mode of ['xor','plus','minus']){
      const decoded=grid.map((b,i)=>decodeByte(b,periodicKey(key.values,i),mode));
      const result=metrics(decoded);
      assert.ok(result.signatures.length===0, 'Source-locked original recovered header unexpectedly');
      assert.ok(result.printable<140,'Source-locked original produced high printable count');
      const inv=mode==='plus'?'minus':mode==='minus'?'plus':'xor';
      const planted=sample.map((b,i)=>decodeByte(b,periodicKey(key.values,i),inv));
      assert.deepEqual(planted.map((b,i)=>decodeByte(b,periodicKey(key.values,i),mode)),sample);
      realBytes.push({key:key.name,mode,...result});
      positive.push({key:key.name,mode,bytesRecovered:256});
    }
    for(const mode of ['plus','minus']){
      const decoded=grid.map((b,i)=>decodeGP(b%MOD,key.values[i%16]%MOD,mode));
      const result={key:key.name,mode,ioc:ioc(decoded),
        first24GP:decoded.slice(0,24)};
      assert.ok(result.ioc<0.05,'Unexpected strongly nonuniform original GP output');
      const inv=mode==='plus'?'minus':'plus';
      const planted=english.map((b,i)=>decodeGP(b,key.values[i%16]%MOD,inv));
      assert.deepEqual(planted.map((b,i)=>decodeGP(b,key.values[i%16]%MOD,mode)),english);
      realGP.push(result);
      positive.push({key:key.name,mode,GPRecovered:256,englishIOC:ioc(english)});
    }
  }
  console.log(JSON.stringify({
    scope:'p15 native 16-value spiral, repeated over fixed row-major original 256-byte table',
    sourceGridSha256,
    period:16,sourceKeys:keys.map(k=>({name:k.name,values:k.values})),
    realBytes,realGP,
    positiveControls:positive,
    decision:'no recognizable file or GP prose; only literal byte XOR/add/sub and GP29 add/sub at phase zero excluded'
  },null,2));
}
if(require.main===module)run();
module.exports={source,decodeByte,decodeGP,ioc,run};
