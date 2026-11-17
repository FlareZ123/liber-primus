'use strict';
/**
 * Four first-party LP2 apostrophe words jointly constrain short GF(29)
 * key recurrences. Search ALL parameters for each selected finite family,
 * with strict plaintext spelling and a shared global, never-skipping clock.
 *
 * Motivation: original p4, p21, p35, p41 preserve an apostrophe and one
 * following rune. The candidate contraction dictionaries are frozen from
 * sims/lp2_apostrophe_fourcrib_original_sft.cjs, not estimated from output.
 * Success requires one deterministic keystream to reconstruct all four
 * complete original ciphertext words, plus a meaningful blind continuation.
 *
 * Native Node.js 22, CommonJS. Read-only SFT, no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const cipher = gp.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(cipher.length, 12956);
const byLetter = new Map(gp.translit.map((s, i) => [s, i])
  .filter(([s]) => s.length === 1));
const byRune = new Map(gp.runes.map((r, i) => [r, i]));
const options4 = ['DONT','CANT','WONT','AINT','ISNT','LETS',
  'GODS','ONES','MANS','MENS','SHED','YOUD','ALLS'];
const options3 = ['ITS','HES','WED','HED','ITD','DOS'];
const pages = transcript.split('%');
assert.equal(pages.length, 57);
const sourceSites = [
  { page:4, local:164, stem:3, text:[19,14,10,7], words:options4 },
  { page:21, local:36, stem:2, text:[25,3,26], words:options3 },
  { page:35, local:80, stem:2, text:[13,18,16], words:options3 },
  { page:41, local:218, stem:3, text:[14,20,11,5], words:options4 }
];
const prefix = [0];
for (const page of gp.pages.slice(0, 56))
  prefix.push(prefix.at(-1) + page.indices.length);
assert.equal(prefix.at(-1), 12956);
const encoded = word => [...word].map(ch => {
  const value = byLetter.get(ch);
  assert.notEqual(value, undefined, 'invalid GP29 contraction letter ' + ch);
  return value;
});
const mod = n => ((n % 29) + 29) % 29;
const sites = sourceSites.map(site => {
  const start = prefix[site.page] + site.local - site.stem;
  const length = site.stem + 1;
  const original = cipher.slice(start, start + length);
  assert.deepEqual(original, site.text, 'untouched original rune word');
  const parts = pages[site.page].match(/[\u16A0-\u16FF]+/gu) || [];
  assert(parts.some(part => [...part].map(rune => byRune.get(rune))
    .join(',') === original.join(',')), 'printed word absent');
  return { start, page:site.page, local:site.local-site.stem, original,
    plain: site.words.map(word => ({word, indices:encoded(word)})) };
});
assert.deepEqual(sites.map(x=>x.start), [1107,5136,8513,10086]);

/** @param {number[]} c @param {number[]} p @param {1|-1} sign */
function keyFor(c, p, sign) {
  return c.map((v, i) => mod(sign * (v - p[i])));
}
/** @param {number[]} a @returns {number} */
function pack(a) {
  let n=0,f=1;
  for (const x of a) { n+=x*f; f*=29; }
  return n;
}
/**
 * Deterministic four-crib exact intersection for two small recurrence
 * families:
 * A: K[n]=a K[n-1]+b K[n-2]+c K[n-3] mod29, 29^3 keys;
 * B: K[n]=a K[n-1]+b K[n-2]+c mod29, 29^3 keys.
 * Each parameter triple is tested without any ciphertext-dependent scoring.
 *
 * @param {number[]} sourceCipher Input ciphertext (authentic or planted)
 * @param {0|1} model 0=homogeneous order3; 1=affine order2
 * @param {1|-1} sign Ciphertext = plaintext +/- key
 * @returns {{model:number,sign:number,firstSiteFits:number,
 *   secondSiteFits:number,thirdSiteFits:number,fullFits:number,
 *   hits:object[]}}
 */
function scan(sourceCipher, model, sign) {
  const targets=sites.map(site => new Set(site.plain.map(p =>
    pack(keyFor(sourceCipher.slice(site.start,
      site.start+site.original.length),p.indices,sign)))));
  let firstSiteFits=0,secondSiteFits=0,thirdSiteFits=0,fullFits=0;
  const hits=[];
  for(const candidate of sites[0].plain) {
    const first=keyFor(sourceCipher.slice(sites[0].start,
      sites[0].start+4),candidate.indices,sign);
    for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){
      const [k0,k1,k2,k3]=first;
      if(model===0){
        if(mod(a*k2+b*k1+c*k0)!==k3)continue;
      } else if(mod(a*k1+b*k0+c)!==k2 ||
        mod(a*k2+b*k1+c)!==k3)continue;
      firstSiteFits++;
      let x=k1,y=k2,z=k3;
      let at=sites[0].start+4,matched=true;
      for(let siteIndex=1;siteIndex<4;siteIndex++){
        const site=sites[siteIndex],seq=[];
        for(;at<site.start+site.original.length;at++){
          const next=model===0?mod(a*z+b*y+c*x):
            mod(a*z+b*y+c);
          x=y;y=z;z=next;
          if(at>=site.start)seq.push(next);
        }
        if(!targets[siteIndex].has(pack(seq))){
          matched=false;break;
        }
        if(siteIndex===1)secondSiteFits++;
        if(siteIndex===2)thirdSiteFits++;
      }
      if(!matched)continue;
      fullFits++;
      hits.push({model,sign,coefficients:[a,b,c],
        openingCandidate:candidate.word});
    }
  }
  return {model,sign,firstSiteFits,secondSiteFits,thirdSiteFits,
    fullFits,hits:hits.slice(0,20)};
}

/**
 * Independent positive: a single secret global order-3 recurrence generates
 * four planted source-compatible contractions at the exact four original
 * nonadjacent positions. Only four tiny cipher spans are given to the
 * decoder, as in the original case.
 */
function makePlant() {
  const input=cipher.slice();
  const words=['DONT','ITS','HES','CANT'];
  const [a,b,c]=[11,4,7];
  const key=new Int8Array(sites.at(-1).start+4-sites[0].start);
  key.set([12,19,8],0);
  for(let i=3;i<key.length;i++)
    key[i]=mod(a*key[i-1]+b*key[i-2]+c*key[i-3]);
  for(let j=0;j<sites.length;j++){
    const site=sites[j],plain=encoded(words[j]);
    for(let i=0;i<plain.length;i++)
      input[site.start+i]=mod(plain[i]+key[site.start+i-sites[0].start]);
  }
  return {input,coefficients:[a,b,c],words};
}
const planted=makePlant();
const positive=scan(planted.input,0,1);
assert(positive.fullFits>=1);
assert(positive.hits.some(h=>
  h.openingCandidate===planted.words[0] &&
  h.coefficients.join(',')===planted.coefficients.join(',')),
  'true source-native GF29 planted key must be recovered');
const original=[];
for(const model of [0,1])for(const sign of [1,-1])
  original.push(scan(cipher,model,sign));
const successes=original.flatMap(r=>r.hits);
const output = {
  status:'four nonadjacent original apostrophe contractions, all key triples',
  originalRuneCount:cipher.length,apostropheSites:sites.map(s=>({
    page:s.page,local:s.local,global:s.start,ciphertext:s.original,
    candidates:s.plain.map(x=>x.word)})),
  modelDefinitions:['homogeneous GF29 recurrence order3',
    'affine GF29 recurrence order2'],
  testedParametersPerModelAndSign:29**3,
  exactOriginal:original,
  plant:{originalWordSlots:sites.length,opening:planted.words[0],
    plantedCoefficients:planted.coefficients,
    exactRecoveries:positive.fullFits,hasTrueParameters:true},
  evidenceLimits:'Only fixed visible-contraction dictionary and one shared book-global non-skipping additive GP29 key; F interruption, longer keys, altered spellings and other ciphers not excluded.',
  verdict:successes.length?
    'Exact four-site matches require blind original continuation before any plaintext claim':
    'No four-site exact key in either bounded GF29 recurrence family; no unknown plaintext/key.'
};
console.log(JSON.stringify(output,null,2));
