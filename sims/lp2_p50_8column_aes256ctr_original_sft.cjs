'use strict';
/**
 * Source-selected fixed AES-256-CTR operand test (Agent26, 2026-11-23).
 * Exact register: original 8 '$'-terminated runic sections and the
 * original 32x8 p50 canonical base60 bytes, one 32-byte column per section.
 * Cipher model is conjectured: Cicada did NOT authenticate AES-CTR, zero IV,
 * byte-to-GP29 modulo reduction, or either additive sign as an LP2 cipher.
 * Read-only, no dependencies beyond Node.js 22 built-ins.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
const page=Object.fromEntries(corpus.pages.map(p=>[p.page,p.indices]));
const ranges=[[0,2],[3,7],[8,15],[16,22],[23,26],[27,32],[33,39],[40,55]];
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
assert.equal(ranges.map(([a,b])=>Array.from({length:b-a+1},(_,j)=>page[a+j].length).reduce((s,n)=>s+n,0)).reduce((s,n)=>s+n,0),12956);
const keys=Array.from({length:8},(_,k)=>Buffer.from(Array.from({length:32},(_,i)=>bytes[8*i+k])));
assert(keys.every(k=>k.length===32));
const sections=ranges.map(([a,b])=>Array.from({length:b-a+1},(_,j)=>page[a+j]).flat());
function pad(key,n){
 const cipher=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
 return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]).map(x=>x%29);
}
function transform(plain, key, sign){
 const stream=pad(key,plain.length);
 return plain.map((p,i)=>(p+29+sign*stream[i])%29);
}
function ioc(a){
 const hist=Array(29).fill(0);for(const x of a){assert(x>=0&&x<29);hist[x]++;}
 return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
function hist(a){let h=Array(29).fill(0);for(let x of a)h[x]++;return h;}
function out(a,n){return a.slice(0,n).map(x=>corpus.translit[x]).join(' ');}
const control=page[57];
for(const sign of [+1,-1]){
 const encrypted=transform(control,keys[0],sign),decrypted=transform(encrypted,keys[0],-sign);
 assert.deepEqual(decrypted,control);
 assert.notDeepEqual(encrypted,control);
}
console.log('AUTHENTIC native solved-p57 GP29 plant 95/95 exact AES-256-CTR forward and inverse PASS; true plaintext IOC='+ioc(control).toFixed(6));
const aggregate={'1':[],'-1':[]};
for(let j=0;j<8;j++){
 const c=sections[j];
 for(const s of [+1,-1]){
  const p=transform(c,keys[j],-s);
  assert.deepEqual(transform(p,keys[j],s),c);
  aggregate[String(s)].push(...p);
  const h=hist(p);
  console.log('section='+j+' pages='+ranges[j].join('-')+' n='+c.length+' cipherSign='+s+
    ' originalCipherIOC='+ioc(c).toFixed(6)+' GPplaintextIOC='+ioc(p).toFixed(6)+
    ' E='+h[18]+'/'+p.length+' mostFrequent='+Math.max(...h)+' startGP='+out(p,40));
 }
}
for(const s of [+1,-1]){
 const p=aggregate[String(s)];
 console.log('TOTAL cipherSign='+s+' n='+p.length+' plaintextIOC='+ioc(p).toFixed(6)+
 ' E='+hist(p)[18]+'/'+p.length+' prefixGP='+out(p,75));
}

/* An independent, exact 8-column SHA-256 checksum candidate:
 * use only ciphertext source bytes and four independently specified
 * serializations; no image-stage stego or English crib is involved.
 * Column/rowchunk and I-vs-l ambiguous printed cells are accounted for.
 */
assert.equal(crypto.createHash('sha256').update('abc').digest('hex'),
 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
const marks=grid.pages.flatMap(p=>p.tokens).map(t=>/[Il]$/.test(t));
assert.equal(marks.length,256);
const shaStats=[];
for(let z=0;z<8;z++){
 const runes=sections[z];
 const inputs=[
  ['gp29indices',Buffer.from(runes)],
  ['utf8runes',Buffer.from(runes.map(x=>corpus.runes[x]).join(''),'utf8')],
  ['romanized',Buffer.from(runes.map(x=>corpus.translit[x]).join(''),'utf8')],
  ['indicesCSV',Buffer.from(runes.join(','),'utf8')]
 ];
 for(const [name,src] of inputs){
  const digest=crypto.createHash('sha256').update(src).digest();
  assert.equal(digest.length,32);
  for(const layout of ['column','rowchunk']){
   const cellIds=Array.from({length:32},(_,j)=>layout==='column'?8*j+z:32*z+j);
   const possible=cellIds.map((k,j)=>{
    const x=bytes[k];
    return digest[j]===x || (marks[k] && (digest[j]===x+29||digest[j]===x-29));
   });
   shaStats.push({section:z,form:name,layout,hits:possible.filter(Boolean).length});
  }
 }
}
assert.equal(shaStats.length,64);
const best=Math.max(...shaStats.map(x=>x.hits));
assert(best<32,'Original digest unexpectedly exactly matched a full printed table column/chunk');
console.log('P50_SHA256_CHECKSUM 8 source sections x 4 fixed encodings x 2 table layouts =64 source-original tests; max canonical+I/l-ambiguous byte matches out of32 = '+best);
console.log('P50_SHA256_CHECKSUM top='+JSON.stringify(shaStats.filter(x=>x.hits===best).slice(0,8)));


/* Exhaust every *actual* original table I/l glyph alternative for both
 * historical plausible radix choices; 2^10 global byte readings, factored
 * by independent source columns. No fitted IV/clock/nonce/key permutation.
 */
const printed=grid.pages.flatMap(p=>p.tokens);
assert.equal(printed.length,256);
const symbols60=grid.alphabet;
const symbols59=symbols60.replace('f','');
assert.equal(symbols60.length,60);
assert.equal(symbols59.length,59);
const variants=[];
for(const [radix,alphabet] of [[60,symbols60],[59,symbols59]]){
 let product=1, evaluated=0, results=[];
 for(let col=0;col<8;col++){
  const tokens=Array.from({length:32},(_,row)=>printed[row*8+col]);
  const ambiguities=tokens.flatMap((v,i)=>/[Il]$/.test(v)?[i]:[]);
  product*=2**ambiguities.length;
  let best={'1':{ioc:-1},'-1':{ioc:-1}};
  const masks=2**ambiguities.length;
  for(let mask=0;mask<masks;mask++){
   const actual=tokens.slice();
   for(let j=0;j<ambiguities.length;j++){
    if(mask&(1<<j)){
      const i=ambiguities[j];
      const t=actual[i];
      actual[i]=t.slice(0,-1)+(t.endsWith('I')?'l':'I');
    }
   }
   const k=Buffer.from(actual.map(t=>{
      const hi=alphabet.indexOf(t[0]),lo=alphabet.indexOf(t[1]);
      assert(hi>=0&&lo>=0);
      const v=hi*radix+lo;
      assert(v>=0&&v<=255);
      return v;
   }));
   for(const sign of [-1,1]){
    const p=transform(sections[col],k,-sign);
    assert.deepEqual(transform(p,k,sign),sections[col]);
    const score=ioc(p);
    if(score>best[String(sign)].ioc)best[String(sign)]={ioc:score,mask,E:hist(p)[18],first30:out(p,30)};
   }
  }
  evaluated+=masks;
  results.push({col,alternativeGlyphs:ambiguities.length,keyVariants:masks,best});
 }
 assert.equal(product,2**marks.filter(Boolean).length);
 variants.push({radix,product,evaluated,results});
 console.log('P50_AES_ALL_GLYPHS radix='+radix+' global I/l readings='+product+' independent column AES keys evaluated='+evaluated);
 for(const row of results) console.log('P50_AES_ALL_GLYPHS col='+row.col+' m='+row.alternativeGlyphs+' keys='+row.keyVariants+' maxIOC_signPlus='+row.best['1'].ioc.toFixed(6)+' maxIOC_signMinus='+row.best['-1'].ioc.toFixed(6));
}

console.log('DONE. AES-CTR and key/IV mapping are an unauthenticated candidate; roundtrip is an implementation invariant, not plaintext evidence.');
