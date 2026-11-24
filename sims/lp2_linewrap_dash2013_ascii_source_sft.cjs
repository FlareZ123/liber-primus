'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const lp2 = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const authentic2013 = read('resources/historical/cicada2013-gematria-jpeg-outguess.asc');
function pack(bits) {
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) value = (value << 1) | bits[i + j];
    out.push(value);
  }
  return out;
}
function ascii(bytes) {
  return bytes.map(value => value >= 32 && value <= 126 ? String.fromCharCode(value) : '.').join('');
}
function inspect(bits) {
  const bytes = pack(bits);
  return {bitCount:bits.length,oneBits:bits.reduce((s,b)=>s+b,0),wholeBytes:bytes.length,
    leftoverBits:bits.length%8,printableBytes:bytes.filter(v=>v>=32&&v<=126).length,
    first32Hex:bytes.slice(0,32).map(v=>v.toString(16).padStart(2,'0')).join(''),
    asciiPreview:ascii(bytes).slice(0,120)};
}
// Authentic first-party positive control: spaces=0, tabs=1, MSB-first ASCII.
const signedBody = authentic2013.split('-----BEGIN PGP SIGNATURE-----')[0]
  .split(/\r?\n\r?\n/).slice(1).join('\n');
const controlLines = signedBody.split(/\r?\n/).filter(line=>line.length>0);
assert.equal(controlLines.length,4);
const controlBits = controlLines.map(line=>{
  const chars=[...line];
  assert.ok(chars.every(ch=>ch===' '||ch==='\t'));
  return chars.map(ch=>ch==='\t'?1:0);
});
assert.deepEqual(controlBits.map(b=>b.length),[240,200,80,32]);
const controlText=controlBits.map(bits=>String.fromCharCode(...pack(bits)));
assert.deepEqual(controlText,['Come to emiwp4muu2ktwknf.onion','We shall await you there.','Good luck.','3301']);
// One fixed LP2 analogue: final printed hyphen before slash=1, otherwise0.
function lineBits(source){return source.split(/\r?\n/).filter(line=>line.endsWith('/')).map(line=>Number(line.endsWith('-/')));}
const pages=lp2.split('%');
assert.equal(pages.length,57);
const early=lineBits(pages.slice(0,28).join('%'));
const heldout=lineBits(pages.slice(28,55).join('%'));
const allUnknown=lineBits(pages.slice(0,55).join('%'));
const solved=lineBits(pages.slice(55).join('%'));
const lp1Control=lineBits(lp1);
assert.equal(early.length,310); assert.equal(early.reduce((a,b)=>a+b,0),65);
assert.equal(heldout.length,284); assert.equal(heldout.reduce((a,b)=>a+b,0),42);
assert.equal(allUnknown.length,594); assert.equal(allUnknown.reduce((a,b)=>a+b,0),107);
assert.equal(solved.length,10); assert.equal(solved.reduce((a,b)=>a+b,0),0);
assert.equal(lp1Control.length,152); assert.equal(lp1Control.reduce((a,b)=>a+b,0),34);
console.log(JSON.stringify({
 authentic2013Control:{mapping:'space=0, tab=1, MSB-first ASCII',bitLengths:controlBits.map(b=>b.length),decodedLines:controlText},
 lp2Candidate:{mapping:'final hyphen before slash=1, otherwise0; MSB-first ASCII',
  p0_p27:inspect(early),withheld_p28_p55:inspect(heldout),full_p0_p55:inspect(allUnknown),
  complementaryPolarity:inspect(allUnknown.map(bit=>1-bit)),solved_p56_p57_control:inspect(solved),
  solved_LP1_control:inspect(lp1Control)},
 conclusion:'Authentic 2013 whitespace carrier reproduced; no typed LP2 payload in the single fixed source-motivated analogue.'
},null,2));
