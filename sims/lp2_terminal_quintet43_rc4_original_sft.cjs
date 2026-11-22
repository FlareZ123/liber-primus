'use strict';
// @ts-check
/**
 * Original LP2 p55 43-byte quintet packet as a period-attested RC4 key.
 *
 * Input: original physical LP2 pp0-55 (55 rune-bearing pages), the
 * 45-byte source-selected p55 quintet readout and its 43 interior bytes.
 * Frozen consumers: raw RC4 or ASCII "Seeding"/"Encryption" domain prefix,
 * drop 0 or 256, three byte -> GP29 reductions, continuous or page reset,
 * and additive +/- sign. All 72 original decoders are evaluated before
 * selecting any outcome. Re-encryption and a full-length source-native GP
 * plaintext plant are required. No unknown plaintext claim.
 *
 * Run: node sims/lp2_terminal_quintet43_rc4_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const pages=source.pages.filter(p=>p.page<=55&&p.indices.length>0);
const original=pages.flatMap(p=>p.indices);
const p55=source.pages.find(p=>p.page===55).indices;
assert.equal(pages.length,55);
assert.equal(original.length,12956);
assert.equal(p55.length,76);

const MOD=29,LIMIT=2**24;
const body=p55.slice(1);
assert.equal(body.length,75);
const packed=[], flags=[];
for(let i=0;i<body.length;i+=5){
  const number=body.slice(i,i+5).reduce((s,v)=>s*MOD+v,0);
  flags.push(Math.floor(number/LIMIT));
  const low=number%LIMIT;
  packed.push((low>>>16)&255,(low>>>8)&255,low&255);
}
assert.equal(flags.join(''),'100100000000000');
assert.equal(packed.length,45);
assert.equal(packed[0],p55[0]);
assert.equal(packed.at(-1),packed.length);
const seed=packed.slice(1,-1);
assert.equal(seed.length,43);
assert.equal(Buffer.from(seed).toString('hex'),
  '023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e8892b6460c27a66059a2e9bc7310637750');

/** @param {number[]} key @param {number} length @returns {number[]} */
function rc4(key,length){
  assert.ok(key.length);
  const s=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+key[i%key.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  let x=0,y=0;
  const out=[];
  for(let n=0;n<length;n++){
    x=(x+1)&255;
    y=(y+s[x])&255;
    [s[x],s[y]]=[s[y],s[x]];
    out.push(s[(s[x]+s[y])&255]);
  }
  return out;
}
/**
 * @param {number} length
 * @param {string} prefix
 * @param {number} drop
 * @param {'mod'|'scale'|'reject'} reducer
 * @returns {number[]}
 */
function keyValues(length,prefix,drop,reducer){
  const key=[...Buffer.from(prefix,'ascii'),...seed];
  const emitted=rc4(key,drop+length*2+100).slice(drop);
  if(reducer==='mod')return emitted.slice(0,length).map(x=>x%MOD);
  if(reducer==='scale')return emitted.slice(0,length).map(x=>Math.floor(x*MOD/256));
  const accepted=emitted.filter(x=>x<232).slice(0,length);
  assert.equal(accepted.length,length);
  return accepted.map(x=>x%MOD);
}
/**
 * @param {string} prefix @param {number} drop
 * @param {'mod'|'scale'|'reject'} reducer
 * @param {'continuous'|'page'} reset
 */
function schedule(prefix,drop,reducer,reset){
  const pad=reset==='continuous'
    ?keyValues(original.length,prefix,drop,reducer)
    :pages.flatMap(page=>keyValues(page.indices.length,prefix,drop,reducer));
  assert.equal(pad.length,original.length);
  return pad;
}
/** @param {number[]} a */
function ioc(a){
  const f=Array(MOD).fill(0);
  for(const x of a)f[x]++;
  return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} src @param {number[]} key @param {number} sign */
function crypt(src,key,sign){
  return src.map((v,i)=>(v+sign*key[i]%MOD+MOD)%MOD);
}

/** @param {string} text */
function toGP(text){
  const words=(text.toUpperCase().match(/[A-Z]+/g)||[]);
  const symbols=source.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
  const digits=[];
  for(let word of words){
    word=word.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
    for(let i=0;i<word.length;){
      const token=symbols.find(s=>word.startsWith(s.x,i));
      assert.ok(token,'GP register token');
      digits.push(token.i);
      i+=token.x.length;
    }
    if(digits.length>=original.length)break;
  }
  assert.ok(digits.length>=original.length);
  return digits.slice(0,original.length);
}
const known=toGP(fs.readFileSync(path.join(root,
  'resources','control','shakespeare_first300k.txt'),'utf8'));
const positives=source.pages[57].indices;
assert.equal(positives.length,95);
assert.ok(ioc(known)>.055);
assert.ok(ioc(positives)>.055);

const result=[];
for(const prefix of ['','Seeding','Encryption']){
  for(const drop of [0,256]){
    for(const reducer of /** @type {const} */ (['mod','scale','reject'])){
      for(const reset of /** @type {const} */ (['continuous','page'])){
        const key=schedule(prefix,drop,reducer,reset);
        for(const sign of [-1,1]){
          const plain=crypt(original,key,sign);
          const cipherBack=crypt(plain,key,-sign);
          assert.deepEqual(cipherBack,original);
          result.push({
            prefix:prefix||'raw',drop,reducer,reset,sign,
            ioc:ioc(plain),p55IoC:ioc(plain.slice(-76)),
            first32:plain.slice(0,32).map(x=>source.translit[x]).join(' ')
          });
        }
      }
    }
  }
}
assert.equal(result.length,72);
const best=[...result].sort((a,b)=>b.ioc-a.ioc);
assert.ok(best[0].ioc<.04);
assert.ok(best.at(-1).ioc>.03);
const positiveKey=schedule('',0,'mod','continuous');
const planted=crypt(known,positiveKey,-1);
const decoded=crypt(planted,positiveKey,1);
assert.deepEqual(decoded,known);
assert.ok(ioc(decoded)>.055);
const p57key=positiveKey.slice(0,positives.length);
assert.deepEqual(crypt(crypt(positives,p57key,-1),p57key,1),positives);
console.log(JSON.stringify({
  claim:'One source-frozen 43-byte p55 payload candidate, historical RC4 additive GP29 consumer',
  source:{pages:pages.length,runicLength:original.length,
    p55CarryRune:p55[0],quintets:15,overflow:flags.join(''),
    packetHex:Buffer.from(packed).toString('hex'),
    candidateKeyHex:Buffer.from(seed).toString('hex')},
  scan:{models:result.length,best:best.slice(0,5),
    minIoC:best.at(-1).ioc,maxIoC:best[0].ioc,
    originalIoC:ioc(original)},
  positive:{plantSource:'Shakespeare first 12,956 canonical GP runes',
    exactRecovered:decoded.length,
    recoveredIoC:ioc(decoded),p57KnownSourceIoC:ioc(positives),
    p57Roundtrip:positives.length},
  interpretation:'No original GP-English plaintext under 72 direct additive GP29 RC4 consumers. The 43-byte packet and the XOR/ARC4 cipher premise remain speculative; key-skip, non-prose and alternative transports are untested.'
},null,2));
