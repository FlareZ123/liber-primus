#!/usr/bin/env node
'use strict';
/* Reproduce the all-six DH3301 -> phi(e) mod 29 -> Wisdom-square selector audit. */
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),text=p=>read(p).toString('utf8');
function gitSha(b){return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');}
function powmod(a,e,m){let r=1n,x=BigInt(a),n=BigInt(e),mod=BigInt(m);while(n){if(n&1n)r=r*x%mod;x=x*x%mod;n>>=1n;}return Number(r);}
function factor(n){let x=n,out=[];for(let p=2;p*p<=x;p++)if(x%p===0){let k=0;while(x%p===0){x/=p;k++;}out.push([p,k]);}if(x>1)out.push([x,1]);return out;}
function phi(n){let r=n;for(const[p]of factor(n))r=r/p*(p-1);return r;}
function primeRank(n){if(n<2)return null;for(let d=2;d*d<=n;d++)if(n%d===0)return null;let rank=0;for(let x=2;x<=n;x++){let prime=true;for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break;}if(prime)rank++;}return rank;}
const signed=read('resources/external/2013-tcp-server-signed-source.md');
const dh=read('im-results/lp2-2013-base29-dh11-field-power-gate.md');
const squareBytes=read('resources/external/derived/2014-stage04/05-square.txt');
const corpusBytes=read('resources/liber-primus/lp2-corpus.json');
const wisdomBound=read('im-results/2013-wisdom-2014-stage04-256bytes-lp2-bound.md');
assert.equal(gitSha(signed),'75fb7d95e90e4a920328ed645de930f68b71c22a');
assert.equal(gitSha(dh),'1e7218c8a51673a22544283e28dde923b013ff10');
assert.equal(gitSha(squareBytes),'f081bf3bd3cb45b55359fa0e8961b1f033aa10c7');
assert.equal(gitSha(corpusBytes),'054f2a0f780b7d46901acbe3d9bf4f0ac1801165');
assert.equal(gitSha(wisdomBound),'db39dc4d7d19b2567c1145ecbf0349e6df5ef843');
assert.match(signed.toString('utf8'),/unsigned participant transcript/i);
assert.match(dh.toString('utf8'),/e≡11 mod550/);
assert.match(wisdomBound.toString('utf8'),/totient/i);
const grid=squareBytes.toString('utf8').trim().split(/\s+/).map(Number);
assert.equal(grid.length,25);
assert.deepEqual(grid,[272,138,341,131,151,366,199,130,320,18,226,245,91,245,226,18,320,130,199,366,151,131,341,138,272]);
const base=2757,modulus=3301,clientShare=2800,serverSecret=331;
assert.equal(powmod(base,550,modulus),1);
for(const d of [2,5,11])assert.notEqual(powmod(base,550/d,modulus),1);
assert.equal(powmod(base,serverSecret,modulus),1264);
assert.equal(powmod(clientShare,serverSecret,modulus),1067);
const exponents=Array.from({length:6},(_,k)=>11+550*k);
const candidates=exponents.map(e=>{
  assert.equal(powmod(base,e,modulus),clientShare);
  const phiE=phi(e),residue=phiE%29;
  const oneCell=residue===0?29:residue;
  const oneValue=grid[oneCell-1],zeroValue=grid[residue];
  return {e,factorization:factor(e),phi_e:phiE,phi_mod29:residue,
    one_based_cell:oneCell,one_based_value:oneValue,one_based_prime_rank:primeRank(oneValue),
    zero_based_index:residue,zero_based_value:zeroValue,zero_based_prime_rank:primeRank(zeroValue)};
});
const corpus=JSON.parse(corpusBytes.toString('utf8'));
const p36=corpus.pages.find(p=>p.page===36);
assert.equal(p36.indices.length,238);
const oneBasedPrimes=candidates.filter(x=>x.one_based_prime_rank!==null);
const zeroBasedPrimes=candidates.filter(x=>x.zero_based_prime_rank!==null);
assert.equal(oneBasedPrimes.length,1);
assert.deepEqual({e:oneBasedPrimes[0].e,cell:oneBasedPrimes[0].one_based_cell,value:oneBasedPrimes[0].one_based_value,rank:oneBasedPrimes[0].one_based_prime_rank},{e:1661,cell:21,value:151,rank:36});
const output={
  classification:'Positive selector evidence, not a decryption: under the inferred one-based phi(e) mod 29 square-address rule, only e=1661 selects a prime-valued Wisdom-square cell.',
  provenance:{signed_server_protocol:'GPG-verified signed 2013 TCP challenge; it authenticates DH protocol, not the specific DH3301 participant exchange.',dh3301_exchange:'separate unsigned participant transcript; base/share/secret values are transcript-derived, not Cicada-authenticated.',wisdom_square:'derived 5x5 row-major transcription; prime/totient clue and 2013/2014 square relationship documented in the pinned bound report.'},
  dh:{base,modulus,client_public_share:clientShare,server_secret:serverSecret,server_public_share:1264,shared_secret:1067,base_order:550,exponent_representatives:exponents},
  square:grid,
  candidates,
  one_based_prime_selector:oneBasedPrimes,
  zero_based_alternative:zeroBasedPrimes,
  p36:{physical_page:36,runes:p36.indices.length,selected_prime:151,prime_ordinal:36},
  interpretation:'The all-six one-based selector uniquely chooses e=1661 -> phi(e) mod 29 = 21 -> cell 21 = 151 -> 36th prime -> p36. Zero-based array indexing is not equivalent: it leaves two prime-valued candidates (131 and 199), so the printed-grid one-based convention is consequential. The selector remains inferred; it selects a page candidate, not a cipher or key.'
};
console.log(JSON.stringify(output,null,2));
