'use strict';

/**
 * Source-bounded AES-256 terminal known-plaintext receiver.
 * p15's sixteen original 16-bit numbers supply a candidate 256-bit key;
 * original p49–51 supply 256 bytes; p56 solved + p57 clear supply 180
 * independently known native GP29 symbols on the 30x6 inner grid.
 *
 * This is a hypothesis test. There is no Cicada-authenticated AES opcode,
 * endian, mode or table/rune correspondence.
 *
 * Node.js 22, Windows 11, CommonJS, read-only. Run:
 * node sims/lp2_p15_aes256_terminal180_knownplaintext_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pg = (n) => source.pages.find((p) => p.page === n);

assert.equal(pg(55).indices.length, 76);
assert.equal(pg(56).indices.length, 85);
assert.equal(pg(57).indices.length, 95);
const primes = [];
for (let n = 2; primes.length < 85; n++)
  if (primes.every((p) => n % p !== 0)) primes.push(n);
const plain56 = pg(56).indices.map((cipher, i) => i === 56 ? 0 :
  ((cipher - (primes[i - (i > 56 ? 1 : 0)] - 1)) % 29 + 29) % 29);
assert.equal(pg(56).indices[56], 0);
assert.equal(plain56.map((i) => source.translit[i]).join(''),
  'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE');

const known180 = plain56.concat(pg(57).indices);
const printed180 = pg(56).indices.concat(pg(57).indices);
assert.equal(known180.length, 180);
assert.equal(printed180.length, 180);
const interior = [];
for (let r = 1; r <= 30; r++)
  for (let c = 1; c <= 6; c++) interior.push(r * 8 + c);
const perimeter = [];
for (let c = 0; c < 8; c++) perimeter.push(c);
for (let r = 1; r < 32; r++) perimeter.push(8 * r + 7);
for (let c = 6; c >= 0; c--) perimeter.push(31 * 8 + c);
for (let r = 30; r >= 1; r--) perimeter.push(r * 8);
assert.equal(interior.length, 180);
assert.equal(perimeter.length, 76);
assert.equal(new Set(interior.concat(perimeter)).size, 256);

/**
 * Original p57 asks the reader to shed circumferences. The original p15
 * square itself has a clockwise four-neighbour spiral. An alternative to
 * row-major interior is the three 68+60+52 inner rings of p50 in
 * top-left clockwise, outer-to-inner order. This one orientation is fixed
 * by the same original page layout and earlier established spiral, not
 * selected by language scoring.
 */
const spiralInterior=[];
for(let shell=0; shell<3; shell++){
  const top=1+shell,bottom=30-shell,left=1+shell,right=6-shell;
  for(let c=left;c<=right;c++)spiralInterior.push(top*8+c);
  for(let r=top+1;r<=bottom;r++)spiralInterior.push(r*8+right);
  for(let c=right-1;c>=left;c--)spiralInterior.push(bottom*8+c);
  for(let r=bottom-1;r>top;r--)spiralInterior.push(r*8+left);
}
assert.equal(spiralInterior.length,180);
assert.equal(new Set(spiralInterior).size,180);
assert.deepEqual([...spiralInterior].sort((a,b)=>a-b),[...interior].sort((a,b)=>a-b));


const rawTokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(rawTokens.length, 256);
const a60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const a59 = a60.replace('f', '');
assert.equal(a60.length, 60);
assert.equal(a59.length, 59);
const bytes = (alphabet) => Buffer.from(rawTokens.map((token) => {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0);
  const n = alphabet.length * hi + lo;
  assert(n >= 0 && n <= 255);
  return n;
}));
const g60 = bytes(a60);
const g59 = bytes(a59);
assert.deepEqual([...g60], grid.bytes);
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');
assert.equal(hash(g60), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(hash(g59), '511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');

// Exact red-centered source spiral and printed row-major alternative.
const row = [3258,3222,3152,3038,3278,3299,3298,2838,
             3288,3294,3296,2472,4516,1206,708,1820];
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,
                3152,3038,2838,2472,1820,708,1206,4516];
assert.deepEqual([...row].sort((a,b) => a-b),
  [...spiral].sort((a,b) => a-b));

/** @param {number[]} nums @param {'BE'|'LE'} endian */
function key(nums, endian) {
  const out = Buffer.alloc(32);
  for (let i = 0; i < 16; i++) {
    if (endian === 'BE') out.writeUInt16BE(nums[i], i*2);
    else out.writeUInt16LE(nums[i], i*2);
  }
  return out;
}
/** @param {Buffer} src */
function toColumn(src) {
  const out = Buffer.alloc(256);
  for (let r = 0; r < 32; r++)
    for (let c = 0; c < 8; c++) out[c*32+r] = src[r*8+c];
  return out;
}
/** @param {Buffer} src */
function fromColumn(src) {
  const out = Buffer.alloc(256);
  for (let r = 0; r < 32; r++)
    for (let c = 0; c < 8; c++) out[r*8+c] = src[c*32+r];
  return out;
}
/** @param {Buffer} input @param {Buffer} secret @param {'ecb'|'cbc'|'ctr'} mode @param {boolean} encrypt */
function aes(input, secret, mode, encrypt) {
  const instance = encrypt ? crypto.createCipheriv(
    'aes-256-'+mode, secret, mode === 'ecb' ? null : Buffer.alloc(16)
  ) : crypto.createDecipheriv(
    'aes-256-'+mode, secret, mode === 'ecb' ? null : Buffer.alloc(16)
  );
  if (mode !== 'ctr') instance.setAutoPadding(false);
  return Buffer.concat([instance.update(input), instance.final()]);
}

/** @param {Buffer} raw @param {number[]} target @param {'mod29'|'literal'|'GPprime'} transport */
function matches(raw, target, transport, coords=interior) {
  let count=0;
  const gpPrime=source.prime;
  for (let i=0;i<180;i++) {
    const value=raw[coords[i]];
    const want=target[i];
    if (transport === 'mod29' && value%29 === want) count++;
    if (transport === 'literal' && value === want) count++;
    if (transport === 'GPprime' && value === gpPrime[want]) count++;
  }
  return count;
}

const scored=[];
let models=0;
for (const [radix, raw] of [['60',g60],['59',g59]])
  for (const [keyOrder,nums] of [['row',row],['spiral',spiral]])
    for (const endian of ['BE','LE'])
      for (const tableOrder of ['row','column'])
        for (const mode of ['ecb','cbc','ctr']) {
          const secret=key(nums,endian);
          const data=tableOrder==='row'?raw:toColumn(raw);
          const decoded=aes(data,secret,mode,false);
          assert(aes(decoded,secret,mode,true).equals(data));
          const view=tableOrder==='row'?decoded:fromColumn(decoded);
          const record={radix,keyOrder,endian,tableOrder,mode};
          for (const [layout,coords] of [['row',interior],['inward_spiral',spiralInterior]])
            for (const [targetName,target] of [['plaintext',known180],['printed',printed180]])
              for (const transport of ['mod29','literal','GPprime'])
                scored.push({...record,layout,target:targetName,transport,
                  matches:matches(view,target,transport,coords)});
          models++;
        }
assert.equal(models,48);
assert.equal(scored.length,576);
scored.sort((a,b) => b.matches-a.matches);
const primary=scored.filter(x=>x.target==='plaintext'&&x.transport==='mod29');
const report={
  classification:'Exact source-selected known180 receiver test (hypothesized AES; no authentic AES operator)',
  source:{
    p15Numbers:16,keyBytes:32,p50Cells:256,
    interiorCells:180,terminalKnown:known180.length,
    p55OuterCells:perimeter.length
  },
  original:{
    originalInteriorLayouts:['row','inward_spiral'], AESModels:models,transportAndRegisterComparisons:scored.length,
    best10:scored.slice(0,10),
    bestSolvedPlainMod29:primary[0],
    perfectKnownReceivers:scored.filter(x=>x.matches===180).length
  }
};
assert.equal(report.original.perfectKnownReceivers,0,
  'Unexpected full original known180 receiver: inspect direct candidate immediately');
assert.ok(scored[0].matches<50,
  'Unexpectedly elevated known180 matching: independently inspect original receiver');

// Genuine page-shaped AES-CTR positive using the independently solved
// native180 and a withheld 76-rune clear p57 passage, laid out on exact
// original 32x8 cells. The positive table is SYNTHETIC; original untouched.
const synthetic=new Array(256).fill(-1);
const withheld=pg(57).indices.slice(0,76);
for (let i=0;i<180;i++) synthetic[interior[i]]=known180[i];
for (let i=0;i<76;i++) synthetic[perimeter[i]]=withheld[i];
assert(synthetic.every(x=>x>=0&&x<29));
const trueKey=key(spiral,'BE');
const plantCipher=aes(Buffer.from(synthetic),trueKey,'ctr',true);
const recovered=aes(plantCipher,trueKey,'ctr',false);
assert.deepEqual(interior.map(i=>recovered[i]),known180);
assert.deepEqual(perimeter.map(i=>recovered[i]),withheld);
assert.equal(matches(recovered,known180,'mod29'),180);
report.syntheticPositive={
  known180Recovered:180,blindHeldout76Recovered:76,
  cipherMode:'AES256CTR with p15 spiral BE key and zero IV, original-sized synthetic 32x8 table'
};
// Distinct source-shaped spiral known180 plant: only the site order changes.
const syntheticSpiral=new Array(256).fill(-1);
for(let i=0;i<180;i++)syntheticSpiral[spiralInterior[i]]=known180[i];
for(let i=0;i<76;i++)syntheticSpiral[perimeter[i]]=withheld[i];
assert(syntheticSpiral.every(x=>x>=0&&x<29));
const recoveredSpiral=aes(aes(Buffer.from(syntheticSpiral),trueKey,'ctr',true),trueKey,'ctr',false);
assert.deepEqual(spiralInterior.map(i=>recoveredSpiral[i]),known180);
assert.deepEqual(perimeter.map(i=>recoveredSpiral[i]),withheld);
assert.equal(matches(recoveredSpiral,known180,'mod29',spiralInterior),180);
report.syntheticPositive.inwardSpiralKnown180Recovered=180;
report.syntheticPositive.inwardSpiralBlindHeldout76Recovered=76;
console.log(JSON.stringify(report,null,2));
