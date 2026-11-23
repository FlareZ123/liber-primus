'use strict';
/**
 * Frozen CONDITIONAL p55 two-prime textbook RSA -> original p50 grid columns.
 * Windows Node22, CommonJS, read-only SFT. No CLI required.
 *
 * Interpretation not sourced as Cicada instruction:
 * - original p55 43 interior GP0 digits form N=8P, with P prime;
 * - original p55 32 exterior GP0 digits form E=43Q;
 * - original p55 13-dot closing mark motivates exploratory factor 13^2;
 *   source has NO instruction selecting square or Q-1, so this is a
 *   candidate with a strong missing-opcode warning;
 * - Q-1=32*13^2*H and H independently probable prime;
 * - n=P*H, RSA public exponent 3301, p50 eight printed 32-byte columns.
 *
 * Both base60 and f-omitted base59 are explicit provenance-preserving
 * rival table readings. Textbook RSA with no KDF or padding is frozen.
 * Native planted cipher controls and all original-column forward replays
 * test the complete reversible operation. Outputs remain random-like.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {checkPrimeSync} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus', file), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('base60-grid.json');
const src = corpus.pages.find(page => page.page === 55).indices;
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(src.length, 76);
let at=1;
const words = lengths.map(k=>{const w=src.slice(at,at+k);at+=k;assert.equal(w.length,k);return w;});
assert.equal(at,76);
const interior = words.flatMap(w=>w.slice(1,-1));
const exterior = words.flatMap(w=>[w[0],w.at(-1)]);
assert.deepEqual([interior.length,exterior.length],[43,32]);
/** @param {number[]} digits */
const base29=digits=>digits.reduce((a,d)=>29n*a+BigInt(d),0n);
const N=base29(interior),E=base29(exterior);
assert.equal(N%8n,0n);
assert.equal(E%43n,0n);
const P=N/8n,Q=E/43n;
assert.equal(P,63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q,1268532719737981052966698570711268391040527137n);
assert.equal((Q-1n)%(32n*13n*13n),0n);
const H=(Q-1n)/(32n*13n*13n);
assert.equal(H,234565961490011289379936865885959391834417n);
assert.ok(checkPrimeSync(P,{checks:24}));
assert.ok(checkPrimeSync(H,{checks:24}));
const n=P*H,e=3301n,phi=(P-1n)*(H-1n);
/** @param {bigint} a @param {bigint} b */
function inverse(a,b) {
  let [r,s,t,u]=[b,a,0n,1n];
  while(s){const q=r/s;[r,s]=[s,r-q*s];[t,u]=[u,t-q*u];}
  assert.equal(r,1n);return (t%b+b)%b;
}
/** @param {bigint} a @param {bigint} e0 @param {bigint} mod */
function powMod(a,e0,mod){
  let out=1n;
  while(e0){if(e0&1n)out=out*a%mod;a=a*a%mod;e0>>=1n;}
  return out;
}
const d=inverse(e,phi);
assert.equal(n.toString(2).length,343);
assert.equal(H.toString(2).length,138);
assert.equal(grid.rows.length,32);
assert.ok(grid.rows.every(row=>row.length===8));
const planted=Buffer.from('SOURCE SELECTED ORIGINAL CONTROL!','ascii');
assert.equal(planted.length,33);
const plantInt=BigInt('0x'+planted.toString('hex'));
assert.ok(plantInt<n);
assert.equal(powMod(powMod(plantInt,e,n),d,n),plantInt);
const results=[];
for(const [radixName,alphabet] of [
  ['printed-base60',grid.alphabet],
  ['omitted-f-base59',grid.alphabet.replace('f','')],
]){
  const base=alphabet.length;
  const bytes=grid.rows.map(row=>row.map(t=>{
    assert.equal(t.length,2);
    const hi=alphabet.indexOf(t[0]),lo=alphabet.indexOf(t[1]);
    assert.ok(hi>=0&&lo>=0);
    const val=hi*base+lo;
    assert.ok(val<256);
    return val;
  }));
  let totalPrintable=0, totalGp=0;
  for(let col=0;col<8;col++){
    const ciphertext=Buffer.from(bytes.map(row=>row[col]));
    assert.equal(ciphertext.length,32);
    const C=BigInt('0x'+ciphertext.toString('hex'));
    assert.ok(C<n);
    const decrypted=powMod(C,d,n);
    assert.equal(powMod(decrypted,e,n),C);
    const padded=Buffer.from(decrypted.toString(16).padStart(86,'0'),'hex');
    assert.equal(padded.length,43);
    const printable=[...padded].filter(x=>x>=32&&x<127).length;
    const gp29=[...padded].filter(x=>x<29).length;
    totalPrintable+=printable;totalGp+=gp29;
    results.push({
      radixName, column:col, originalBytes:32, recoveredBytes:43,
      printable, gp29, prefixHex:padded.subarray(0,12).toString('hex')
    });
  }
  assert.ok(totalPrintable<205, 'A true readable 8-column text would demand review');
  console.log(radixName+' original 8 RSA column receivers: total printable='+
    totalPrintable+'/344, direct GP29 bytes='+totalGp+'/344');
}
console.log(JSON.stringify(results,null,2));
console.log('PASS: source arithmetic and 16 exact 32-byte RSA ciphertext replays; no unknown plaintext');
