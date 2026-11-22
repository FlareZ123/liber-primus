'use strict';

/**
 * Exact original-cipher RC4/KSA 256-byte provenance gate.
 * Independent keys: 213 original highlighted GP29 runes + 43 initials of
 * actual 2016 Cicada-signed words = RC4's 256-byte KSA state width.
 * This tests one source-order/selector, no position/phase/password fitting.
 * RC4 is legacy and cryptographically insecure; this is a historical solver.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const json=p=>JSON.parse(read(p));
const corpus=json('resources/liber-primus/lp2-corpus.json');
const ink=json('resources/liber-primus/lp2-ink-annotations.json');
const table=json('resources/liber-primus/base60-grid.json');
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const original=ink.pages.filter(p=>p.page<=55&&p.red_spans?.length)
 .flatMap(p=>p.red_spans.flatMap(s=>[...s.runes].map(r=>{
   const i=corpus.runes.indexOf(r);
   assert(i>=0);
   return i;
 })));
assert.equal(original.length,213);
const boundary=signed.indexOf('-----BEGIN PGP SIGNATURE-----');
assert(boundary>0);
const body=signed.slice(0,boundary).replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,'');
const words=body.match(/[A-Za-z]+/g).slice(0,43);
assert.equal(words.length,43);
assert.deepEqual(words.slice(0,6),['Hello','The','path','lies','empty','epiphany']);
assert.equal(words.at(-1),'OpenPGP');
const translit=new Map(corpus.translit.map((x,i)=>[x,i]));
const wordInitials=words.map(word=> {
  const letter=word[0].toUpperCase().replace('K','C').replace('V','U').replace('Q','C').replace('Z','S');
  assert(translit.has(letter));
  return translit.get(letter);
});
assert.equal(wordInitials.length,43);
const key=Uint8Array.from([...original,...wordInitials]);
assert.equal(key.length,256);
/**
 * Authentic fixed RC4 KSA + PRGA, with no nonstandard IV or drop offset.
 * @param {Uint8Array} secret
 * @param {number} count
 * @returns {Uint8Array}
 */
function rc4(secret,count){
  const s=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+secret[i%secret.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  let i=0;
  j=0;
  const out=new Uint8Array(count);
  for(let n=0;n<count;n++){
    i=(i+1)&255;
    j=(j+s[i])&255;
    [s[i],s[j]]=[s[j],s[i]];
    out[n]=s[(s[i]+s[j])&255];
  }
  return out;
}
const mod=n=>(n%29+29)%29;
const full=corpus.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(full.length,12956);
const stream=rc4(key,full.length);
const decrypt=full.map((c,i)=>mod(c-(stream[i]%29)));
const undo=decrypt.map((p,i)=>mod(p+(stream[i]%29)));
assert.deepEqual(undo,full);
const solved=corpus.pages[57].indices;
const solvedC=solved.map((p,i)=>mod(p+(stream[i]%29)));
const solvedBack=solvedC.map((c,i)=>mod(c-(stream[i]%29)));
assert.deepEqual(solvedBack,solved,'real GP native p57 forward/decrypt plant');
const byteCipher=Uint8Array.from(table.byte_rows.flat());
assert.equal(byteCipher.length,256);
const bytePlain=Buffer.from(byteCipher.map((byte,i)=>byte^stream[i]));
assert.deepEqual(Uint8Array.from(bytePlain.map((byte,i)=>byte^stream[i])),byteCipher);
const gp29=seg=>{
  const hist=Array(29).fill(0);seg.forEach(x=>hist[x]++);
  return hist.reduce((s,n)=>s+n*(n-1),0)/(seg.length*(seg.length-1));
};
const pageOffsets=[];
let index=0;
for(const p of corpus.pages.slice(0,56)){
  pageOffsets[p.page]={start:index,stop:index+p.indices.length};
  index+=p.indices.length;
}
function region(start,end){
  const a=decrypt.slice(pageOffsets[start].start,pageOffsets[end].stop);
  return {pages:start+'-'+end,runes:a.length,ioc:gp29(a),preview:a.slice(0,135).map(x=>corpus.translit[x]).join('')};
}
const output={
  hypothesis:'RC4 KSA with 256 source GP29 indices, 213 red+43 signed initials, direct source order',
  source_red:original.length,
  source_signed_words:wordInitials.length,
  signed_sha256:crypto.createHash('sha256').update(signed).digest('hex'),
  key_first32:Buffer.from(key.slice(0,32)).toString('hex'),
  rc4_first32:Buffer.from(stream.slice(0,32)).toString('hex'),
  source_cipher_runes:full.length,
  unsolved_gp29_ioc:gp29(decrypt),
  gp_preview:decrypt.slice(0,120).map(x=>corpus.translit[x]).join(''),
  heldout_regions:[region(16,21),region(40,53),region(54,55)],
  table256_original_sha256:crypto.createHash('sha256').update(byteCipher).digest('hex'),
  table256_xor_sha256:crypto.createHash('sha256').update(bytePlain).digest('hex'),
  table256_xor_first80_hex:bytePlain.subarray(0,80).toString('hex'),
  table256_xor_ascii_printable: [...bytePlain].filter(x=>x>=32&&x<=126).length,
  exact_ciphertext_replay:true,
  native_gp_p57_plant:true,
  original_binary_xor_replay:true
};
console.log(JSON.stringify(output,null,2));
