'use strict';

/**
 * Agent38: exact missing-L column AES-256 plaintext receiver gate.
 *
 * Source-only selector: the unique gap between two maximal original +1
 * 8-neighbor paths is hex 4C -> uppercase ASCII L. The eight-letter
 * range H..O has eight labels for the eight printed table columns.
 * L is the fifth label, so column4 provides 32 original bytes; the
 * complementary seven columns provide 224 original bytes (=14 AES blocks).
 *
 * This visible selector does NOT authenticate AES, ECB/CBC, zero IV, the
 * H..O column-label convention, or any original encrypted payload.
 * Read-only Windows Node22 CJS, no external libraries.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} rel @returns {any} */
const json=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const grid=json('resources/liber-primus/base60-grid.json');
const corpus=json('resources/liber-primus/lp2-corpus.json');
const values=grid.byte_rows;
assert.equal(values.length,32);
assert(values.every(row=>row.length===8));
const flat=values.flat();
assert.equal(flat.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(flat)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const missingHex=0x4c;
const label=String.fromCharCode(missingHex);
assert.equal(label,'L');
const labels='HIJKLMNO';
assert.equal(labels.length,8);
const selectedColumn=labels.indexOf(label);
assert.equal(selectedColumn,4);
const key=Buffer.from(values.map(row=>row[selectedColumn]));
assert.equal(key.length,32);
const nonKeyColumns=Array.from({length:8},(_,i)=>i)
  .filter(i=>i!==selectedColumn);
assert.equal(nonKeyColumns.length,7);
const ciphertexts={
  'printed-row-major':Buffer.from(values.flatMap(row=>
    nonKeyColumns.map(col=>row[col]))),
  'complete-column-major':Buffer.from(nonKeyColumns.flatMap(col=>
    values.map(row=>row[col])))
};
assert(Object.values(ciphertexts).every(x=>x.length===224));
/**
 * @param {Buffer} ciphertext
 * @param {'ecb'|'cbc'} mode
 * @returns {Buffer}
 */
function decipher(ciphertext,mode) {
  const decryptor=crypto.createDecipheriv('aes-256-'+mode,key,
    mode==='ecb'?null:Buffer.alloc(16));
  decryptor.setAutoPadding(false);
  return Buffer.concat([decryptor.update(ciphertext),decryptor.final()]);
}
/**
 * @param {Buffer} plaintext
 * @param {'ecb'|'cbc'} mode
 * @returns {Buffer}
 */
function encipher(plaintext,mode) {
  const encryptor=crypto.createCipheriv('aes-256-'+mode,key,
    mode==='ecb'?null:Buffer.alloc(16));
  encryptor.setAutoPadding(false);
  return Buffer.concat([encryptor.update(plaintext),encryptor.final()]);
}
/**
 * @param {Buffer} bytes
 * @returns {{printable:number,continuous:number,textStart:string,hexStart:string}}
 */
function metrics(bytes) {
  let printable=0,run=0,continuous=0;
  for(const v of bytes) {
    if(v===10 || v===13 || v>=32 && v<=126) {
      printable++;run++;continuous=Math.max(continuous,run);
    } else run=0;
  }
  return {printable,continuous,
    textStart:Buffer.from(bytes.subarray(0,64)).toString('latin1')
      .replace(/[^\x20-\x7E]/g,'.'),
    hexStart:bytes.subarray(0,32).toString('hex')};
}
const knownAscii=Buffer.from(('AN AUTHENTIC LOOKING SOURCE NATIVE CRYPTOGRAPHIC' +
  ' PLAINTEXT IS RECOVERABLE. ').repeat(4).slice(0,224),'ascii');
assert.equal(knownAscii.length,224);
const outcomes=[];
for(const [order,ciphertext] of Object.entries(ciphertexts)) {
  for(const mode of /** @type {Array<'ecb'|'cbc'>} */ (['ecb','cbc'])) {
    const decoded=decipher(ciphertext,mode);
    assert.deepEqual(encipher(decoded,mode),ciphertext);
    assert.deepEqual(decipher(encipher(knownAscii,mode),mode),knownAscii);
    outcomes.push({order,mode,...metrics(decoded)});
  }
}
assert.equal(outcomes.length,4);

const cipher55=corpus.pages[55].indices;
assert.equal(cipher55.length,76);
const ctr=crypto.createCipheriv('aes-256-ctr',key,Buffer.alloc(16));
const pad=Buffer.concat([ctr.update(Buffer.alloc(76)),ctr.final()]);
const plain=cipher55.map((v,i)=>(v-(pad[i]%29)+29)%29);
assert.deepEqual(plain.map((v,i)=>(v+(pad[i]%29))%29),cipher55);
const native=corpus.pages[57].indices.slice(0,76);
const plant=native.map((v,i)=>(v+(pad[i]%29))%29);
assert.deepEqual(plant.map((v,i)=>(v-(pad[i]%29)+29)%29),native);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts=Array(29).fill(0);
  for(const v of a)counts[v]++;
  return counts.reduce((n,v)=>n+v*(v-1),0)/(a.length*(a.length-1));
}
console.log(JSON.stringify({
  premise:'Source-only missing 0x4C = ASCII L selects fifth of eight printed columns H..O',
  sourceKeyColumn:selectedColumn,keyBytes:key.length,keyHex:key.toString('hex'),
  tableReceivers:outcomes,
  p55Receiver:{runes:76,mode:'AES-256-CTR zero-IV GP29 subtract',
    originalIoC:ioc(cipher55),decodedIoC:ioc(plain),
    decodedStart:plain.slice(0,50).map(i=>corpus.translit[i]).join(''),
    planted95runeNativePagePrefixRecovered:'76/76'},
  exactForwardReplay:'all original table and GP29 receivers',
  conclusion:'Conditional AES interpretation only; original unreadable outputs cannot establish key or cipher'
},null,2));
