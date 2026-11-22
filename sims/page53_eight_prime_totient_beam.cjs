"use strict";
/**
 * Original-input prime/totient inversion linked to page-53 red GP numeral.
 * The red 51-digit base-29 integer has eight prime factors, paired here
 * in ascending order with the eight original $-delimited LP2 sections.
 * Each factor starts the existing solved-page phi(prime) additive GP stream.
 * An unknown subset of ciphertext F runes can be literal key interrupters.
 * GP-Shakespeare trigram likelihood, alpha=.3, beam width512, and a fixed
 * 20% literal-F prior select the skip map. Solved LP2 p56 is a genuine
 * known-key, known-plaintext positive, without a synthetic substitute.
 *
 * Bounded negative hypothesis, no claim of historical key or plaintext.
 * Run: node sims/page53_eight_prime_totient_beam.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeGP} = require("./exponent_feedback_lookup_attack.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/lp2-transcription.txt");
const english = encodeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(english.length, 218800);
const red = ink.pages.find(p => p.page === 53).red_spans[0];
assert.equal(red.start, 128);
assert.equal(red.length, 51);
const redDigits = Array.from(red.runes, x => data.runes.indexOf(x));
assert.ok(redDigits.every(x => x >= 0));
const R = redDigits.reduce((a, x) => a * 29n + BigInt(x), 0n);
const factors = [2n,113n,179n,27241n,39901n,68909n,265541n,
  269573819958837950787541728931395654992696677965349n];
assert.equal(factors.reduce((a,b) => a*b,1n),R);
const alphabet = new Map(data.runes.map((x,i) => [x,i]));
const sections = transcript.split("$").slice(0,8).map(x =>
  Array.from(x).filter(ch => alphabet.has(ch)).map(ch => alphabet.get(ch)));
assert.deepEqual(sections.map(x => x.length),
  [729,1145,1738,1894,1021,1433,1680,3316]);
assert.deepEqual(sections.flat(),
  data.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

/** @param {bigint} b @param {bigint} e @param {bigint} m */
function modPow(b,e,m) {
  let z=1n;
  while(e) {if(e&1n)z=z*b%m; b=b*b%m; e>>=1n;}
  return z;
}
/** Fixed-base strong probable-prime test, not a primality certificate. */
function probablePrime(n) {
  if(n===2n)return true;
  if(n<2n || n%2n===0n)return false;
  const bases=[2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
  for(const b of bases) {if(n===b)return true;if(n%b===0n)return false;}
  let d=n-1n,s=0;
  while(!(d&1n)){d>>=1n;s++;}
  for(const b of bases) {
    let x=modPow(b,d,n);
    if(x===1n || x===n-1n)continue;
    let witness=true;
    for(let j=1;j<s;j++){
      x=x*x%n;
      if(x===n-1n){witness=false;break;}
    }
    if(witness)return false;
  }
  return true;
}
/** @param {bigint} p */
function nextPrime(p){
  let n=p+1n;
  if(!(n&1n))n++;
  while(!probablePrime(n))n+=2n;
  return n;
}
/** @param {bigint} prime @param {number} count */
function totientPad(prime,count){
  assert.ok(probablePrime(prime));
  const k=new Int8Array(count);
  for(let i=0;i<count;i++){k[i]=Number((prime-1n)%29n);prime=nextPrime(prime);}
  return k;
}
const counts=new Uint32Array(29**3);
const bigrams=new Uint32Array(29**2);
for(let i=1;i<english.length;i++){
  bigrams[29*english[i-1]+english[i]]++;
  if(i>1)counts[841*english[i-2]+29*english[i-1]+english[i]]++;
}
const alpha=.3,logp=new Float64Array(29**3);
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const den=bigrams[29*a+b]+29*alpha;
  for(let c=0;c<29;c++){
    const index=841*a+29*b+c;
    logp[index]=Math.log((counts[index]+alpha)/den);
  }
}
/** @param {number[]} seq */
function ioc(seq){
  const counts=new Uint32Array(29);
  for(const x of seq)counts[x]++;
  const same=counts.reduce((s,x)=>s+x*(x-1),0);
  return same/(seq.length*(seq.length-1));
}
/**
 * @param {number[]} cipher
 * @param {bigint} seed
 * @param {number} width
 */
function decode(cipher,seed,width){
  const pad=totientPad(seed,cipher.length+1);
  let beam=[{clock:0,a:0,b:0,score:0,parent:null,p:-1,literal:false,offset:-1}];
  for(let offset=0;offset<cipher.length;offset++){
    const c=cipher[offset],pool=new Map();
    for(const n of beam){
      const insert=state=>{
        const key=841*state.clock+29*state.a+state.b;
        const old=pool.get(key);
        if(!old || state.score>old.score)pool.set(key,state);
      };
      const p=(c-pad[n.clock]+29)%29;
      insert({clock:n.clock+1,a:n.b,b:p,score:n.score+
        logp[841*n.a+29*n.b+p]+(c===0?Math.log(.8):0),
        parent:n,p,literal:false,offset});
      if(c===0)insert({clock:n.clock,a:n.b,b:0,
        score:n.score+logp[841*n.a+29*n.b]+Math.log(.2),
        parent:n,p:0,literal:true,offset});
    }
    beam=Array.from(pool.values()).sort((a,b)=>b.score-a.score).slice(0,width);
  }
  const last=beam[0],plain=[],skips=[];
  for(let n=last;n.parent;n=n.parent){
    plain.push(n.p);
    if(n.literal)skips.push(n.offset);
  }
  plain.reverse();skips.reverse();
  assert.equal(plain.length,cipher.length);
  const skipped=new Set(skips);
  let clock=0;
  for(let i=0;i<cipher.length;i++){
    const predicted=skipped.has(i)?0:(plain[i]+pad[clock++])%29;
    assert.equal(predicted,cipher[i], "exact original-source reencryption");
  }
  return{score:last.score/cipher.length,skips,ioc:ioc(plain),
    prefix:plain.slice(0,65).map(x=>data.translit[x]).join("")};
}
const solved=data.pages.find(p=>p.page===56).indices;
assert.equal(solved.length,85);
const positive=decode(solved,2n,1024);
assert.deepEqual(positive.skips,[56]);
assert.ok(positive.prefix.startsWith("ANENDWITHINTHEDEEPWEB"));
assert.ok(positive.score>-3);
const original=sections.map((s,i)=>{
  const v=decode(s,factors[i],512);
  assert.ok(v.score < -3.8);
  return{section:i,runes:s.length,sourcePrime:String(factors[i]),
    scoreNatsPerGP:v.score,IoC:v.ioc,skippedFs:v.skips.length,
    prefix:v.prefix};
});
console.log(JSON.stringify({
  hypothesis:"Red p53 eight factors as eight section-initial phi(prime) values",
  source:"Canonical physical LP2 rune transcription, ink annotation, red base29 integer",
  control:{solvedPage56Runes:85,literalFPositions:positive.skips,
    score:positive.score,decodedPrefix:positive.prefix},
  original,exactOriginalRoundtrip:12956,
  failureScope:"No direct-GP prose under this section-prime/skip-aware model",
  remaining:"Other factor orderings, keys, nonlinear registers and non-GP plaintext remain untested"
},null,2));
