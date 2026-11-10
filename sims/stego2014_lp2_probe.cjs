'use strict';
/**
 * LP2 known-2014-stego-share key hypothesis screen.
 * Read local sources only; CommonJS; no writes or dependencies.
 * node sims/stego2014_lp2_probe.cjs [--all]
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const sources = JSON.parse(read('resources/cicada2014-outguess-hex.json'));
const corpusText = read('resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(corpusText);
const mod = v => (v % 29 + 29) % 29;

/** @param {string} hex Exactly 1982 hex chars. @returns {Uint8Array} */
function unhex(hex) {
  assert.match(hex,/^[0-9a-f]{1982}$/);
  return Uint8Array.from({length:hex.length/2},(_,i)=>parseInt(hex.slice(i*2,i*2+2),16));
}

/** @param {Uint8Array[]} inputs */
function deriveSources(inputs) {
  const combined = inputs.map((raw,i)=>({id:'share'+i,raw}));
  for (const [i,j] of [[0,1],[0,2],[1,2]]) {
    combined.push({id:'xor'+i+j,raw:inputs[i].map((x,k)=>x^inputs[j][k])});
  }
  combined.push({id:'xor012',
    raw:inputs[0].map((x,k)=>x^inputs[1][k]^inputs[2][k])});
  assert.equal(combined.length,7);
  const signed=Buffer.from(combined[6].raw).toString('utf8');
  assert.equal(combined[6].raw.length,991);
  assert.ok(signed.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
  assert.ok(signed.replace(/\s+/g,' ').includes(sources.expectedReconstruction.bodyCode));
  assert.ok(signed.includes('-----END PGP SIGNATURE-----'));
  return combined;
}

/** @param {number} n Number of required primes. @returns {number[]} */
function firstPrimes(n) {
  const result=[];
  for(let candidate=2;result.length<n;candidate++){
    let prime=true;
    for(const p of result){if(p*p>candidate)break;if(candidate%p===0){prime=false;break;}}
    if(prime)result.push(candidate);
  }
  return result;
}

/** @returns {Float64Array} Correctly decoded p56 and unencrypted p57 smoothed GP prior. */
function knownLanguage() {
  const p56=corpus.pages.find(x=>x.page===56).indices;
  const p57=corpus.pages.find(x=>x.page===57).indices;
  assert.equal(p56.length,85);
  const phi=firstPrimes(100).map(x=>x-1);
  let position=0;
  const decrypted=p56.map((rune,i)=>{
    if(i===56){assert.equal(rune,0);return 0;}
    return mod(rune-phi[position++]);
  });
  assert.equal(decrypted.slice(0,20).map(i=>corpus.translit[i]).join(''),
    'ANENDWITHINTHEDEEPWEBTH');
  const counts=Float64Array.from({length:29},()=>1);
  for(const x of [...decrypted,...p57])counts[x]++;
  const total=counts.reduce((a,b)=>a+b,0);
  return Float64Array.from(counts,x=>Math.log(x/total));
}

/** @param {number[]} ciphertext @param {Uint8Array} key
 * @param {number} offset @param {-1|1} sign @param {Float64Array} logPrior
 * @returns {number}
 */
function score(ciphertext,key,offset,sign,logPrior) {
  let s=0;
  for(let i=0;i<ciphertext.length;i++)
    s+=logPrior[mod(ciphertext[i]-sign*key[offset+i])];
  return s/ciphertext.length;
}

/** @param {number[]} ciphertext @param {{id:string,raw:Uint8Array}[]} sources
 * @param {Float64Array} prior
 */
function exhaustive(ciphertext,sources,prior) {
  const results=[];let settings=0;
  for(const source of sources)for(const reversed of [false,true])
    for(const reduction of ['mod29','scaled29']){
      const raw=reversed?source.raw.slice().reverse():source.raw;
      const key=Uint8Array.from(raw,x=>
        reduction==='mod29'?x%29:Math.floor(x*29/256));
      for(const sign of /** @type {const} */ ([-1,1])){
        for(let offset=0;offset<=key.length-ciphertext.length;offset++){
          settings++;
          const fit=score(ciphertext,key,offset,sign,prior);
          if(results.length<3||fit>results[results.length-1].score){
            results.push({source:source.id,reversed,reduction,sign,offset,
              score:fit});
            results.sort((a,b)=>b.score-a.score);
            if(results.length>3)results.pop();
          }
        }
      }
    }
  const top=results.map(entry=>{
    const item=sources.find(x=>x.id===entry.source);
    const raw=entry.reversed?item.raw.slice().reverse():item.raw;
    const key=Uint8Array.from(raw,x=>entry.reduction==='mod29'?
      x%29:Math.floor(x*29/256));
    return {...entry,preview:ciphertext.slice(0,65).map((x,i)=>
      corpus.translit[mod(x-entry.sign*key[entry.offset+i])]).join('')};
  });
  return {settings,top};
}

function main() {
  const inputs=sources.sources.map(s=>unhex(s.hex));
  const pads=deriveSources(inputs);
  const logPrior=knownLanguage();
  const testPages=process.argv.includes('--all')?
    corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.page):
    [0,7,23,28,42,53,55];
  const output=[];
  for(const page of testPages){
    const ciphertext=corpus.pages.find(p=>p.page===page).indices;
    output.push({page,runes:ciphertext.length,
      ...exhaustive(ciphertext,pads,logPrior)});
  }
  const known=corpus.pages.find(p=>p.page===57).indices;
  const plantKey=Uint8Array.from(pads[0].raw,x=>x%29);
  const planted=known.map((x,i)=>mod(x+plantKey[37+i]));
  const positive=exhaustive(planted,pads,logPrior);
  assert.ok(positive.top.some(x=>x.source==='share0'&&!x.reversed&&
    x.reduction==='mod29'&&x.sign===1&&x.offset===37));
  console.log(JSON.stringify({model:'2014 three stego shares as fixed, finite mod29 additive pads',
    corpusSha256:createHash('sha256').update(corpusText).digest('hex'),
    pages:output,
    positiveControl:{plaintextRunes:known.length,hiddenStart:37,
      truePad:'share0:mod29:forward:+1',
      truePadInTopThree:true,
      winner:positive.top[0]},
    inference:'Exploratory English-unigram screen; top scores do not establish plaintext or real key.'},null,2));
}
if(require.main===module)main();
module.exports={unhex,deriveSources,firstPrimes,knownLanguage,score,exhaustive};
