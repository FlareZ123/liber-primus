'use strict';

/**
 * Source-suggested but unprescribed operation:
 * LP2 p55 76 runes versus the original p50 32x8 table's clockwise
 * 76-cell outer ring; GP29 root15 steps with transparent EA.
 * Run: node sims/lp2_p55_outer76_root15_gp28_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} p */
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=json('resources/liber-primus/lp2-corpus.json');
const cells=json('resources/liber-primus/lp2-grid-256.json').bytes;
const cipher=db.pages.find(p=>p.page===55).indices;
assert.equal(cipher.length,76);
assert.equal(cells.length,256);
const coordinates=[];
for(let col=0;col<8;col++)coordinates.push([0,col]);
for(let row=1;row<32;row++)coordinates.push([row,7]);
for(let col=6;col>=0;col--)coordinates.push([31,col]);
for(let row=30;row>=1;row--)coordinates.push([row,0]);
assert.equal(coordinates.length,76);
assert.equal(new Set(coordinates.map(x=>x.join(','))).size,76);
const ring=coordinates.map(([r,c])=>cells[r*8+c]);
assert.deepEqual(ring.slice(0,16),
  [203,231,167,186,97,237,126,183,212,87,133,5,76,80,51,108]);
const powers=Array.from({length:28},(_,i)=>{
  let x=1;for(let j=0;j<i;j++)x=x*15%29;return x;
});
assert.equal(new Set(powers).size,28);
const logs=Array(29).fill(-1);
powers.forEach((v,i)=>{logs[v]=i;});
const mod=(n,k)=>(n%k+k)%k;
/** @param {number[]} plain @returns {number[]} */
function encrypt(plain) {
  assert.equal(plain.length,76);
  const out=[mod(plain[0]+ring[0]%29,29)];
  for(let i=1;i<76;i++)out.push(plain[i]===28?out[i-1]:
    mod(out[i-1]+powers[mod(plain[i]+ring[i]%28,28)],29));
  return out;
}
/** @param {number[]} input @returns {number[]} */
function decrypt(input) {
  assert.equal(input.length,76);
  const out=[mod(input[0]-ring[0]%29,29)];
  for(let i=1;i<76;i++){
    const delta=mod(input[i]-input[i-1],29);
    out.push(delta===0?28:mod(logs[delta]-ring[i]%28,28));
  }
  return out;
}
/** @param {number[]} v */
const ioc=v=>{
  const hist=Array(29).fill(0);
  for(const j of v)hist[j]++;
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(v.length*(v.length-1));
};
const plain=decrypt(cipher);
assert.deepEqual(encrypt(plain),cipher);
const solvedP57=db.pages.find(p=>p.page===57).indices.slice(0,76);
assert.equal(solvedP57.length,76);
assert.deepEqual(decrypt(encrypt(solvedP57)),solvedP57);
assert.equal(plain.filter(x=>x===28).length,1);
assert(Math.abs(ioc(plain)-0.03543859649122807)<1e-12);
const result={
  status:'PASS',scope:'one original 76-symbol printed clockwise-outer-ring GP28 inverse',
  manuscript:'original p55 76 runes',
  table:'original 32x8 base60 bytes, 76-cell outer boundary clockwise from top-left',
  operator:'D=(C[i]-C[i-1]) mod29; zero D=GP EA; else P=log15(D)-ring[i] mod28',
  knownAuthenticCryptoOperation:false,
  decodedGP:plain.map(v=>db.translit[v]).join(''),
  decodedIoC:ioc(plain),
  originalReencryptExactly:true,
  solvedNativePlant76Exactly:true,
  result:'No intelligible GP29 source plaintext; direct outer ring under this model unsupported'
};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={ring,encrypt,decrypt};
