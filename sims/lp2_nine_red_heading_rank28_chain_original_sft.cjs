'use strict';

/**
 * Original 9-heading rank28 chain: a source-motivated candidate, not an
 * authentic decipherment. A red heading transmits an IV and variable-length
 * repeating GP28 key. A repeated ciphertext glyph means rare plaintext EA;
 * other glyphs use a predecessor-excluding rank alphabet, shifted by the
 * heading key. The EA marker does not advance the key.
 *
 * The sender keeps the original red heading unchanged, then encodes body GP29
 * plaintext. All printed line, page, word and punctuation positions stay put.
 * Positive control: original 95 plaintext p57 rune symbols encrypted under an
 * authentic LP2 heading and decrypted exactly; wrong-key rejected.
 *
 * Standalone Windows Node 22 SFT:
 * node sims/lp2_nine_red_heading_rank28_chain_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'lp2-ink-annotations.json'),'utf8'));
const startPages=[0,3,8,15,23,27,33,40,54];
const endPages=[2,7,14,22,26,32,39,53,55];
const expectedLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
const expectedRedLengths=[13,16,12,9,16,19,10,8,9];
/** @param {number} x @param {number} n @returns {number} */
function mod(x,n) {return (x%n+n)%n;}
/** @param {number[]} xs @returns {number} */
function ioc(xs) {
 const h=Array(29).fill(0);
 for(const x of xs)h[x]++;
 return h.reduce((n,c)=>n+c*(c-1),0)/(xs.length*(xs.length-1));
}
/**
 * Inverse of a source-derived red-header seeded rank28 chain.
 * For every nonzero gap the plaintext is a 0..27 GP symbol; a zero gap
 * produces EA (index28) and pauses the red-heading key clock.
 * @param {number[]} cipher
 * @param {number[]} header
 * @returns {number[]}
 */
function decode(cipher,header) {
 assert.ok(header.length>0);
 let prev=header.at(-1);
 let cursor=0;
 const plaintext=[];
 for(const next of cipher) {
  const delta=mod(next-prev,29);
  prev=next;
  if(delta===0){plaintext.push(28);continue;}
  plaintext.push(mod(delta-1-header[cursor%header.length],28));
  cursor++;
 }
 return plaintext;
}
/**
 * Exact forward transform of the same GP29 model.
 * @param {number[]} plain
 * @param {number[]} header
 * @returns {number[]}
 */
function encode(plain,header) {
 assert.ok(header.length>0);
 let prev=header.at(-1);
 let cursor=0;
 const out=[];
 for(const p of plain) {
  assert.ok(Number.isInteger(p)&&p>=0&&p<29);
  if(p!==28) {
   prev=mod(prev+1+mod(p+header[cursor%header.length],28),29);
   cursor++;
  }
  out.push(prev);
 }
 return out;
}
assert.equal(corpus.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),12956);
const chapters=[];
let headerTotal=0,bodyTotal=0;
for(let z=0;z<9;z++) {
 const first=startPages[z],last=endPages[z];
 const source=corpus.pages.slice(first,last+1).flatMap(p=>p.indices);
 assert.equal(source.length,expectedLengths[z]);
 const originalInk=ink.pages.find(p=>p.page===first);
 assert.ok(originalInk&&originalInk.red_spans.length>0);
 assert.equal(originalInk.red_spans[0].start,0);
 const headerLen=originalInk.red_spans[0].length;
 assert.equal(headerLen,expectedRedLengths[z]);
 const header=source.slice(0,headerLen),body=source.slice(headerLen);
 assert.deepEqual(header,
  [...originalInk.red_spans[0].runes].map(r=>corpus.runes.indexOf(r)));
 const plain=decode(body,header);
 assert.deepEqual(encode(plain,header),body,
  'exact forward original ' + first+'-'+last);
 const hits=plain.filter(v=>v===28).length;
 const observedDoubles=body.reduce((n,c,j)=>
  n+Number(c===(j===0?header.at(-1):body[j-1])),0);
 assert.equal(hits,observedDoubles);
 chapters.push({pages:[first,last],headerRunes:headerLen,
  bodyRunes:body.length,EARepeatEvents:hits,decodedIoC:ioc(plain),
  first24:plain.slice(0,24).map(v=>corpus.translit[v]).join(' ')});
 headerTotal+=headerLen;
 bodyTotal+=body.length;
}
assert.equal(headerTotal,112);
assert.equal(bodyTotal,12844);
assert.ok(chapters.every(x=>x.decodedIoC<0.04),
 'one source chapter unexpectedly breaks the uniform output range');
const p57=corpus.pages[57].indices;
assert.equal(p57.length,95);
const key=corpus.pages[54].indices.slice(0,9);
const planted=encode(p57,key);
assert.deepEqual(decode(planted,key),p57);
assert.notDeepEqual(decode(planted,key.slice().reverse()),p57);
assert.deepEqual(encode(decode(planted,key),key),planted);
const clearIoC=ioc(p57);
assert.ok(clearIoC>0.045);
console.log(JSON.stringify({
 source:'LP2 physical p0-55, original red-heading annotations and p57 clear',
 model:'EA=identical predecessor; else delta=1+(P+redKey[clock]) mod28',
 keyClock:'advance only for non-EA; red first-heading runes repeat; chapter reset',
 original:{headers:headerTotal,body:bodyTotal,chapters,
  originalCipherRoundtrips:9,plaintetRecovered:false},
 nativePositive:{clearP57Runes:95,IoC:clearIoC,
  restored:95,wrongReversedKeyDoesNotRestore:true},
 conclusion:'source-red IV rank28 family yields uniform-like nonprose; no LP2 key'
},null,2));
