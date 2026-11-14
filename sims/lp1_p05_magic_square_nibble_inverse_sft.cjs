'use strict';
/**
 * Exact original LP1 p05 mirror-center -> historical 2014 five-by-five square.
 * Source: im-results/lp1-p05-central-block.txt (360 bytes from 05.jpg).
 * Independent comparison: resources/cicada2014-openpuff-magic-squares.txt.
 * Run from the repository root: node sims/lp1_p05_magic_square_nibble_inverse_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const preserved=fs.readFileSync(path.join(ROOT,'im-results','lp1-p05-central-block.txt'),'utf8');
// The repository transcription carries one editorial final CRLF. The original
// 360 JPEG bytes contain exactly two leading LF and 358 lowercase hex digits.
assert(preserved.replace(/\r\n/g,'\n').startsWith('\n\n'));
const hex=preserved.trim();
assert.equal(Buffer.byteLength('\n\n'+hex,'ascii'),360);
assert.match(hex,/^[0-9a-f]{358}$/);
const payload=Buffer.from(hex,'hex');
assert.equal(payload.length,179);
assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),
 '82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa');
/** @param {number} v @returns {number} */
const swapNibble=v=>((v&15)<<4)|(v>>>4);
const readable=Buffer.from(payload.map(swapNibble)).toString('ascii');
assert.match(readable,/^\n(?:[\d ]+\n){4}[\d ]+$/);
const lines=readable.trim().split('\n');
assert.equal(lines.length,5);
assert(lines.every(line=>line.trim().split(/\s+/).length===5));
/** @param {string} text @returns {string} */
const unmirrorDigits=text=>text.replace(/\d+/g,word=>word.split('').reverse().join(''));
const revealed=unmirrorDigits(readable);
/** @param {string} text @returns {string[][]} */
const matrix=text=>text.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/));
const decoded=matrix(revealed);
assert.deepEqual(decoded,decoded.slice().reverse().map(r=>r.slice().reverse()));
// This independent stage source explicitly prints three matrices, of which
// the recovered original p05 hidden matrix must be the third, word-for-word.
const historical=fs.readFileSync(path.join(ROOT,'resources','cicada2014-openpuff-magic-squares.txt'),'utf8');
const blocks=historical.trim().split(/(?:\r?\n){2,}/).map(matrix);
assert.equal(blocks.length,3);
assert.deepEqual(decoded,blocks[2]);
assert.notDeepEqual(matrix(readable),blocks[2]);
const numeric=decoded.map(row=>row.map(Number));
for(let r=0;r<5;r++){
  assert.equal(numeric[r].reduce((a,b)=>a+b,0),1033,'magic row');
  assert.equal(numeric.reduce((sum,row)=>sum+row[r],0),1033,'magic column');
}
assert.equal(numeric.reduce((sum,row,r)=>sum+row[r],0),1033,'diagonal');
assert.equal(numeric.reduce((sum,row,r)=>sum+row[4-r],0),1033,'reverse diagonal');
// Exact byte-level reversible recovery (no loss from numeric leading zero).
const reconstructed=Buffer.from([...Buffer.from(unmirrorDigits(revealed),'ascii')].map(swapNibble));
assert.deepEqual(reconstructed,payload);
assert.equal(reconstructed.toString('hex'),hex);
// One frozen, expressly hypothetical historical key transfer: p05's words
// teach Euler's totient; the newly revealed 25 values would give three complete
// 25-rune cycles on the 76-rune LP2 p55 if the source p55 F at index25 is literal.
// This exact natural transfer is a negative. No key phase/mask optimization.
/** @param {number} n @returns {number} */
function totient(n) {
  let out=n,remaining=n;
  for(let d=2;d<=remaining;d++){
    if(remaining%d!==0)continue;
    while(remaining%d===0)remaining/=d;
    out-=out/d;
  }
  return out;
}
const gridKey=decoded.flat().map(s=>totient(Number(s))%29);
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const originalP55=corpus.pages.find(page=>page.page===55).indices;
assert.equal(originalP55.length,76);
assert.equal(originalP55[25],0);
let clock=0;
const p55Inverse=originalP55.map((r,i)=>i===25?0:(r-gridKey[(clock++)%25]+29)%29);
assert.equal(clock,75);
assert(p55Inverse.every((r,i)=>i===25?originalP55[i]===0:(r+gridKey[(i<25?i:i-1)%25])%29===originalP55[i]));
const p55counts=Array(29).fill(0);
p55Inverse.forEach(r=>p55counts[r]++);
const p55ioc=p55counts.reduce((sum,n)=>sum+n*(n-1),0)/(76*75);
assert.equal(p55ioc,1/30);
const p55runeglish=p55Inverse.map(r=>corpus.translit[r]).join('');
assert.equal(p55runeglish,'NINAETHJOEAWNTEONHFDSCOEUAEOEDTHTFTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA');

const output=decoded.map(r=>r.join(' ')).join('\n');
console.log(JSON.stringify({
 status:'PASS',source:'original LP1 05.jpg central 179-byte object',
 operation:'ASCII hex -> swap 8-bit nibbles -> reverse digits of each decimal token',
 sourceBytes:179,sourceSha256:crypto.createHash('sha256').update(payload).digest('hex'),
 target:'2014 OpenPuff magic squares, independently preserved third 5x5 square',
 exactSquare:true,magicSum1033:true,rotationallySymmetric:true,exactByteReencoding:true,
 matrix:output,provisionalP55PhiKey:gridKey,provisionalP55Decoded:p55runeglish,provisionalP55IoC:p55ioc,unknownLP2PlaintextRecovered:false
},null,2));
