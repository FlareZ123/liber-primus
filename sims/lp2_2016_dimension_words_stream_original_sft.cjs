'use strict';
/**
 * The signed 2016 Cicada JPEG dimensions 563×569 uniquely select p0
 * word6 and p1 word33 by exact Gematria-prime sum. Freeze those original
 * 21 rune indices as source-derived key candidates before seeing any
 * plaintext, and try two historically plausible binary stream ciphers.
 *
 * Native Windows 11 Node 22 single runnable test:
 * node sims/lp2_2016_dimension_words_stream_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,createCipheriv}=require('node:crypto');
const {parseSharedCorpus}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
const book=pages.flatMap(p=>p.indices);
const parsed=parseSharedCorpus();
const words=parsed.words;
const runeId=new Map(gp.runes.map((r,i)=>[r,i]));
assert.deepEqual([pages.length,book.length,words.length],[55,12956,2896]);
const width=[...parsed.byStartPage[0][5].runes].map(r=>runeId.get(r));
const height=[...parsed.byStartPage[1][32].runes].map(r=>runeId.get(r));
assert.deepEqual(width,[9,18,7,17,24,15,22,12,10,21,1]);
assert.deepEqual(height,[11,0,10,9,27,5,26,28,10,27]);
assert.deepEqual([width,height].map(w=>w.reduce((n,x)=>n+gp.prime[x],0)),[563,569]);
const selected=[...width,...height];
const primed=Buffer.alloc(42);
selected.forEach((x,i)=>primed.writeUInt16BE(gp.prime[x],2*i));
const digest=b=>createHash('sha256').update(b).digest();
const material=[
  {name:'source-GP29-indices-u8',bytes:Buffer.from(selected)},
  {name:'source-GP-primes-u16BE',bytes:primed},
  {name:'source-runes-UTF8',bytes:Buffer.from(
    parsed.byStartPage[0][5].runes+parsed.byStartPage[1][32].runes,'utf8')}
];
const keys=material.map(x=>({...x,key:digest(x.bytes)}));
const mod=(x,n)=>(x%n+n)%n;
const maxPage=Math.max(...pages.map(p=>p.indices.length));
/** @param {string} name @param {Buffer} key @param {number} n */
function keystream(name,key,n){
  const crypt=createCipheriv(name,key,Buffer.alloc(16));
  return Buffer.concat([crypt.update(Buffer.alloc(n)),crypt.final()]);
}
const spellings=gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]} */
function native(raw){
  const s=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const r=[];
  for(let j=0;j<s.length;){
    if(s.startsWith('ING',j)){r.push(21);j+=3;continue;}
    if(s.startsWith('IO',j)){r.push(27);j+=2;continue;}
    const t=spellings.find(t=>s.startsWith(t.s,j));
    assert(t,'Unmapped native spelling '+s.slice(j));
    r.push(t.i);j+=t.s.length;
  }
  return r;
}
const textWords=(read('resources/control/shakespeare_first300k.txt')
  .match(/[A-Za-z]+/g)||[]).map(native);
const cut=Math.floor(textWords.length*0.7),source=textWords.slice(0,cut);
const bins=new Map();
for(const w of textWords.slice(cut)){
  if(!bins.has(w.length))bins.set(w.length,[]);
  bins.get(w.length).push(w);
}
const nativeWords=words.map((w,i)=>{
  const b=bins.get(w.length);
  assert(b?.length>0,'missing native word length '+w.length);
  return b[(131*i+17)%b.length];
});
assert.equal(nativeWords.flat().length,book.length);
/**
 * Two fully independent source-native GP smoothed conditional bigram
 * models are used for 29-symbol plaintext and reduced 28-symbol
 * plaintext respectively. The latter replaces rare EA with A in
 * the control only, since GP28 has no native EA code.
 * @param {number} radix
 */
function language(radix){
  const matrix=new Uint32Array(radix*radix);
  const row=new Uint32Array(radix);
  const reduce=x=>x===28&&radix===28?24:x;
  for(const w of source)for(let i=1;i<w.length;i++){
    const a=reduce(w[i-1]),b=reduce(w[i]);
    matrix[a*radix+b]++;row[a]++;
  }
  /** @param {number[][]} data */
  return data=>{
    let sum=0,n=0;
    for(const w of data)for(let i=1;i<w.length;i++){
      const a=w[i-1],b=w[i];
      if(a<0||b<0||a>=radix||b>=radix)continue;
      sum+=Math.log((matrix[a*radix+b]+0.25)/(row[a]+0.25*radix));
      n++;
    }
    return {mean:sum/n,transitions:n};
  };
}
const lm29=language(29),lm28=language(28);
const control29=lm29(nativeWords);
const control28=lm28(nativeWords.map(w=>w.map(x=>x===28?24:x)));
const fold=seq=>{
  let i=0;
  const out=words.map(w=>{
    const result=seq.slice(i,i+w.length);
    i+=w.length;return result;
  });
  assert.equal(i,book.length);return out;
};
const raw29=lm29(fold(book));
/**
 * @param {number[]} bytes already expanded to actual original page shapes
 * @param {number} radix
 * @param {-1|1} sign
 * @param {boolean} exclusion
 */
function decode(bytes,radix,sign,exclusion){
  const out=[];
  let i=0,exceptions=0;
  for(const page of pages){
    for(let j=0;j<page.indices.length;j++,i++){
      const c=page.indices[j],prev=page.indices[j-1];
      if(exclusion&&(j===0||c===prev)){
        out.push(-1);exceptions++;continue;
      }
      const rank=exclusion?c-Number(c>prev):c;
      out.push(mod(rank+sign*(bytes[i]%radix),radix));
    }
  }
  assert.equal(i,book.length);
  return {out,exceptions};
}
const tests=[];
for(const item of keys){
  for(const algorithm of ['aes-256-ctr','chacha20']){
    const stream=keystream(algorithm,item.key,book.length);
    const firstPage=keystream(algorithm,item.key,maxPage);
    for(const clock of ['book','page']){
      const bytes=clock==='book'
        ? [...stream]
        : pages.flatMap(p=>[...firstPage.subarray(0,p.indices.length)]);
      for(const sign of [-1,1]){
        const direct=decode(bytes,29,sign,false);
        const rank=decode(bytes,28,sign,true);
        tests.push({key:item.name,algorithm,clock,sign,
          transport:'GP29-additive',...lm29(fold(direct.out)),
          prefix:direct.out.slice(0,50).map(x=>gp.translit[x]).join('')});
        tests.push({key:item.name,algorithm,clock,sign,
          transport:'GP28-predecessor-exclusion',exceptions:rank.exceptions,
          ...lm28(fold(rank.out)),
          prefix:rank.out.slice(0,50).map(x=>x<0?'?':gp.translit[x]).join('')});
      }
      // Independent native-original-shape plants force the inverse to recover
      // every GP29 rune and every noninitial GP28 rune exactly.
      const nativePlain=nativeWords.flat();
      const encrypted=nativePlain.map((p,i)=>mod(p+bytes[i]%29,29));
      assert.deepEqual(encrypted.map((c,i)=>mod(c-bytes[i]%29,29)),nativePlain);
      const reduced=nativePlain.map(x=>x===28?24:x);
      let offset=0,good=0;
      for(const page of pages){
        let prev=0;offset++;
        for(let j=1;j<page.indices.length;j++,offset++){
          const rank=mod(reduced[offset]+bytes[offset]%28,28);
          const emitted=rank+Number(rank>=prev);
          const inverseRank=emitted-Number(emitted>prev);
          assert.equal(mod(inverseRank-bytes[offset]%28,28),reduced[offset]);
          prev=emitted;good++;
        }
      }
      assert.equal(good,12956-55);
    }
  }
}
tests.sort((a,b)=>b.mean-a.mean);
assert.equal(tests.length,48);
const best29=tests.find(x=>x.transport==='GP29-additive');
const best28=tests.find(x=>x.transport==='GP28-predecessor-exclusion');
console.log(JSON.stringify({
  claim:'finite source-key inverse test, not a source-selected cipher or decoded LP2',
  uniqueWordGematria:[563,569],keyMaterial:keys.map(k=>({
    name:k.name,materialBytes:k.bytes.length,sha256:k.key.toString('hex')})),
  original:{unknownRunes:book.length,words:words.length,raw29},
  nativeReference:{source:'withheld Shakespeare, exact original word lengths',
    GP29:control29,GP28:control28},
  tested:tests.length,best29,best28,
  topPerTransport:['GP29-additive','GP28-predecessor-exclusion'].map(t=>
    ({transport:t,candidates:tests.filter(x=>x.transport===t).slice(0,5)})),
  positive:{gp29RestoredPerVariant:12956,gp28RestoredPerVariant:12901},
  decision:'A successful claim requires independent readable LP2 prose, not key-stream roundtrip alone.'
},null,2));
