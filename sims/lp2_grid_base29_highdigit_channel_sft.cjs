'use strict';

/**
 * Exact, source-constrained complement channel of the marked GP29
 * factorization of the 256 original LP2 base-60 table bytes.
 *
 * For every printed byte b, write b = 29q+r (0<=r<29, 0<=q<=8).
 * The known 2013 / p39 polynomial relations constrain r, leaving q as
 * a candidate additional channel. Test two direct base9→text transports:
 * paired base9 digits into ASCII 32..112 (32 rows x four characters),
 * and one big-endian base9 integer into binary bytes.
 *
 * Evidence scope: cleartext/simple-file signal only. Neither transport
 * is specified in the original manuscript, and no encryption is excluded.
 * Run from repository root with Node 22:
 * node sims/lp2_grid_base29_highdigit_channel_sft.cjs
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','base60-grid.json'),'utf8'));
const table=source.byte_rows.flat();
assert.equal(table.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(table)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.deepEqual(source.rows.flat().map(s=>source.alphabet.indexOf(s[0])*60+source.alphabet.indexOf(s[1])),table);
const q=table.map(v=>Math.floor(v/29));
const remainder=table.map(v=>v%29);
assert.deepEqual(q.map((v,i)=>29*v+remainder[i]),table);
assert(q.every(v=>v>=0&&v<=8));
const histogram=Array.from({length:9},(_,v)=>q.filter(d=>d===v).length);
assert.deepEqual(histogram,[22,33,38,22,29,32,34,21,25]);

/** @param {number[]} digits Every value is a base9 digit. */
function paired(digits){
  assert.equal(digits.length,256);
  return Buffer.from(Array.from({length:128},(_,i)=>32+9*digits[2*i]+digits[2*i+1]));
}
/** @param {number[]} digits Digits of one unsigned base9 integer. */
function whole(digits){
  let value=0n;
  for(const digit of digits)value=9n*value+BigInt(digit);
  let h=value.toString(16);
  if(h.length&1)h='0'+h;
  return Buffer.from(h,'hex');
}
/** @param {Buffer} a */
function printable(a){return [...a].filter(v=>v>=32&&v<=126).length;}
/** @param {Buffer} a */
function lettersAndSpaces(a){return [...a].filter(v=>v===32||(v>=65&&v<=90)||(v>=97&&v<=122)).length;}
/** @param {Buffer} a @param {(v:number)=>boolean} predicate */
function longestRun(a,predicate){
  let n=0,max=0;
  for(const v of a){n=predicate(v)?n+1:0;max=Math.max(max,n);}
  return max;
}
const traversals=[
 ['printed',q],
 ['reverse',q.slice().reverse()],
 ['column-major',Array.from({length:256},(_,i)=>q[8*(i%32)+Math.floor(i/32)])],
 ['reverse-column',Array.from({length:256},(_,i)=>q[8*((255-i)%32)+Math.floor((255-i)/32)])]
];
const outcomes=traversals.map(([name,digits])=>{
  const pa=paired(digits), wh=whole(digits);
  return {orientation:name,
    pairedChars:pa.length,
    pairedLettersAndSpaces:lettersAndSpaces(pa),
    pairedLongestLettersOrSpaces:longestRun(pa,v=>v===32||(v>=65&&v<=90)||(v>=97&&v<=122)),
    pairedFirst24:pa.toString('ascii').slice(0,24),
    packedBytes:wh.length,
    packedPrintable:printable(wh),
    packedLongestPrintable:longestRun(wh,v=>v>=32&&v<=126),
    packedFirst8Hex:wh.subarray(0,8).toString('hex')};
});
assert.deepEqual(outcomes.map(v=>[v.pairedLettersAndSpaces,v.packedPrintable,v.packedLongestPrintable]),
  [[74,35,3],[57,38,6],[59,44,4],[61,39,5]]);
assert(outcomes.every(v=>v.pairedLettersAndSpaces<80&&v.packedLongestPrintable<8));

/** Synthetic readable source validates the exact paired transport. */
const phrase='THE PRIMES ARE SACRED AND ALL THINGS SHOULD BE ENCRYPTED ';
const planted=phrase.repeat(3).slice(0,128);
assert.equal(planted.length,128);
assert([...planted].every(c=>c.charCodeAt(0)>=32&&c.charCodeAt(0)<=112));
const plantDigits=[...planted].flatMap(c=>{
  const v=c.charCodeAt(0)-32;return [Math.floor(v/9),v%9];
});
assert.equal(paired(plantDigits).toString('ascii'),planted);
const plantBytes=plantDigits.map(v=>29*v);
assert(plantBytes.every(v=>v>=0&&v<=255));
assert.deepEqual(plantBytes.map(v=>Math.floor(v/29)),plantDigits);

/** One-integer base9 transport recovers a separate native ASCII plant. */
const binaryPlant=Buffer.from('CICADA 3301: FIND THE DIVINITY WITHIN AND EMERGE.','ascii');
let integer=BigInt('0x'+binaryPlant.toString('hex'));
const base9=[];
while(integer>0n){base9.unshift(Number(integer%9n));integer/=9n;}
while(base9.length<256)base9.unshift(0);
assert.equal(base9.length,256);
assert.deepEqual(whole(base9),binaryPlant);
console.log(JSON.stringify({
  status:'bounded source-high-digit cleartext gate; no recovered plaintext/key',
  sourceSha256:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
  base29QuotientHistogram:histogram,
  fullOriginalReconstruction:256,
  outputs:outcomes,
  independentCleartextPlants:'PASS, paired 128 ASCII and whole base9 native bytes'
},null,2));
