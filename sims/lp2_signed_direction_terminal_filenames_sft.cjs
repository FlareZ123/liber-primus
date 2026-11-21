'use strict';
/**
 * Source-exact Cicada 2016 signed-word directions, original printed image
 * filename targets, and clear LP2 terminal word-index controls.
 * Hypothesis, not an author-selected decoder. Windows Node 22 CommonJS SFT.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const solved=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const signed=read('resources/historical/cicada2016-4gq25-outguess.asc');
const transcript=read('resources/liber-primus/lp2-transcription.txt');
const B=table.pages.flatMap(p=>p.bytes),printed=table.pages.flatMap(p=>p.tokens);
assert.equal(B.length,256);
assert(signed.includes('Its words are the map, their '));
assert(signed.includes('numbers are the direction.'));
const terms=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number} */
function gp0(raw){
 let word=raw.toUpperCase().replace(/K|Q/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
 let value=0;
 while(word){
  const t=terms.find(x=>word.startsWith(x.s));
  assert(t,'Unrecognized source transliteration '+word);
  value+=t.i;word=word.slice(t.s.length);
 }
 return value;
}
const directWords=['HELLO','LIBER','DEVOTED','VERIFY','DIRECTION'];
const addresses=directWords.map(word=>({
 word,gp0:gp0(word),originalTableToken:printed[gp0(word)],
 value:B[gp0(word)],filename:String(B[gp0(word)])+'.jpg',
 physicalLP2Page:B[gp0(word)]-17
}));
assert.deepEqual(addresses.map(x=>[x.word,x.gp0,x.value]),
 [['HELLO',69,73],['LIBER',69,73],['DEVOTED',102,32],
  ['VERIFY',59,69],['DIRECTION',98,72]]);
const ioLigatureGP0=gp0('DIRECTIAN');
assert.equal(ioLigatureGP0,112);
assert.deepEqual([printed[98],printed[112],printed[201]],
 ['1C','1D','1E']);
assert.deepEqual([B[98],B[112],B[201]],[72,73,74]);
for(const name of ['72.jpg','73.jpg','74.jpg'])
 assert(fs.existsSync(path.join(root,'resources/liber-primus',name)));
const pages=transcript.split('%');
assert.equal(pages.length,57);
const runeWords=s=>(s.replace(/\/\r?\n/g,'').match(/[\u16A0-\u16FF]+/gu)||[]);
const p56=runeWords(pages.at(-2)),p57=runeWords(pages.at(-1));
assert.deepEqual([p56.length,p57.length],[25,20]);
assert.equal(p57[205%20],'ᛏᚩ');
assert.equal(p56[74%25],'ᚫᚾᚢᛋ');
const solved56=solved.sections.find(x=>x.name==='p56_an_end').source_text;
const solvedP56Words=(solved56.match(/[\u16A0-\u16FF]+/gu)||[]);
assert.equal(solvedP56Words.at(-1),'ᛈᚪᚷᛖ');
assert.equal(gp.pages[56].indices.length,85);
assert.equal(gp.pages[57].indices.length,95);
// The 2013 PARABLE clause GP-prime ordinal201 is established in the
// shared primary-source experiment; the caller to this file selects its
// third clause. This test checks its original table receiver, not provenance.
assert.equal(B[201],74);
console.log(JSON.stringify({
 status:'PASS',
 originalSigned2016WordAddresses:addresses,
 latinDirection:{
  literalGP0:98,literalOriginalJPEG:'72.jpg',literalPhysicalPage55:'p55',
  optionalIATransliterationGP0:112,alternateOriginalJPEG:'73.jpg',
  alternatePhysicalPage56:'p56'
 },
 solvedParableThirdClausePrimeOrdinal:201,
 correspondingOriginalTableCell201:printed[201],
 correspondingOriginalJPEG:String(B[201])+'.jpg',
 allThreeOriginalImageNumbers:[B[98],B[112],B[201]],
 terminalKnownWords:{
  originalP57GraphNode205Modulo20:5,originalP57SelectedWord:'TO',
  originalP56GraphNode74Modulo25:24,
  originalP56SelectedCipherword:p56.at(-1),
  sourceAuthenticatedDecodedWord:'PAGE',
  conditionalEnglish:'TO PAGE 74'
 },
 limits:'The IO→IA transcription, direct byte-as-filename, 2013 clause ordinal as table address, and node-modulo-page-word-count are not first-party selected operations; one word is already clear and the other already solved. No unknown LP2 ciphertext rune decoded.'
},null,2));
