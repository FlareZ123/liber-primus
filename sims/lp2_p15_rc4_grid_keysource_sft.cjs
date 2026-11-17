'use strict';

/**
 * Windows/Node22 source-original SFT: sixteen LP2 p15 decimal values used as
 * RC4 key material against the 256 numeric bytes printed on pp49–51.
 * @returns {void}
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));
const alpha60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59 = alpha60.replace('f', '');
const row = [3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820];
const spiral = [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
const targetHash = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

/** @param {string[]} tokens @param {string} alphabet @returns {Buffer} */
function numeralBytes(tokens, alphabet) {
  return Buffer.from(tokens.map(token => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const n = a * alphabet.length + b;
    assert(n >= 0 && n <= 255);
    return n;
  }));
}

/** @param {Buffer} buf @returns {Buffer} */
function columnMajor(buf) {
  return Buffer.from(Array.from({length:256}, (_,i) => buf[(i%32)*8 + Math.floor(i/32)]));
}

/** @param {number[]} values @param {'low8'|'BE16'|'LE16'} mode @returns {Buffer} */
function keyFromNumbers(values,mode) {
  if(mode === 'low8') return Buffer.from(values.map(n => n & 255));
  const b = Buffer.alloc(32);
  values.forEach((n,i) => {
    if(mode === 'BE16') b.writeUInt16BE(n,2*i);
    else b.writeUInt16LE(n,2*i);
  });
  return b;
}

/**
 * RC4 KSA/PRGA. Node22 OpenSSL3 may disable RC4, so implement its documented
 * permutation directly, validated by the original RC4 'Key' known-answer test.
 * @param {Buffer} key @param {number} length @param {number} drop
 * @returns {Buffer}
 */
function rc4(key,length,drop) {
  const s = Uint8Array.from({length:256}, (_,i) => i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+key[i%key.length])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  let i=0;j=0;
  const out = Buffer.alloc(length);
  for(let t=0;t<drop+length;t++){
    i=(i+1)&255; j=(j+s[i])&255;
    [s[i],s[j]]=[s[j],s[i]];
    if(t>=drop) out[t-drop]=s[(s[i]+s[j])&255];
  }
  return out;
}

/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a,b){
  assert.equal(a.length,b.length);
  return Buffer.from(a.map((v,i) => v^b[i]));
}

/** @param {Buffer} b @returns {{printable:number,longest:number,low29:number}} */
function diagnostics(b){
  let printable=0,longest=0,run=0,low29=0;
  for(const n of b){
    if(n>=32 && n<=126){printable++;run++;}
    else run=0;
    longest=Math.max(longest,run);
    if(n<29) low29++;
  }
  return {printable,longest,low29};
}
assert.equal(alpha60.length,60);
assert.equal(alpha59.length,59);
assert.equal(source.rows.length,32);
assert(source.rows.every(x=>x.length===8));
assert.deepEqual(source.page_row_counts,[10,13,9]);
const cells=source.rows.flat();
assert.equal(cells.length,256);
assert(!cells.some(x=>x.includes('f')));
const t60=numeralBytes(cells,alpha60), t59=numeralBytes(cells,alpha59);
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const sha512=b=>crypto.createHash('sha512').update(b).digest('hex');
assert.equal(sha256(t60),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(sha256(t59),'511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79');
assert.deepEqual([...t60],source.byte_rows.flat());
assert.equal(new Set(t60).size,161);
assert.deepEqual([...row].sort((a,b)=>a-b),[...spiral].sort((a,b)=>a-b));
assert.equal(rc4(Buffer.from('Key'),10,0).toString('hex'),'eb9f7781b734ca72a719');
const keys=[];
for(const [order,values] of [['row',row],['spiral',spiral]]){
  for(const mode of ['low8','BE16','LE16']){
    keys.push({name:order+'-'+mode,key:keyFromNumbers(values,mode)});
  }
}
const findings=[];
for(const [radix,values] of [[60,t60],[59,t59]]){
  for(const [order,data] of [['rows',values],['columns',columnMajor(values)]]){
    for(const {name,key} of keys){
      for(const drop of [0,256]){
        const stream=rc4(key,256,drop),plain=xor(data,stream);
        const stats=diagnostics(plain);
        const magic=['89504e470d0a1a0a','25504446','504b0304',
          '1f8b08','ffd8ff','474946383961','474946383761','7f454c46'];
        findings.push({
          radix,order,key:name,drop,...stats,
          equalPad:data.reduce((a,n,i)=>a+(n===stream[i]),0),
          header:magic.some(m=>plain.toString('hex').startsWith(m)),
          hash:sha512(plain)===targetHash,
          first8:plain.subarray(0,8).toString('hex')
        });
      }
    }
  }
}
assert.equal(findings.length,48);
assert(!findings.some(x=>x.header||x.hash));
assert.equal(Math.max(...findings.map(x=>x.printable)),121);
assert.equal(Math.max(...findings.map(x=>x.longest)),7);
assert.equal(Math.max(...findings.map(x=>x.low29)),34);
assert.equal(Math.max(...findings.map(x=>x.equalPad)),3);
const incidental=findings.find(x=>x.radix===60&&x.order==='rows'
  &&x.key==='spiral-low8'&&x.drop===256);
assert.equal(incidental.first8,'1428572e6687ba4f');

// Independent complete-input positive and exact reciphering.
const seed=keyFromNumbers(spiral,'low8');
const message=Buffer.alloc(256);
Buffer.from('WITHIN THE DEEP WEB THERE EXISTS A PAGE','ascii').copy(message);
const stream=rc4(seed,256,256);
const plant=xor(message,stream);
assert.deepEqual(xor(plant,stream),message);
assert.deepEqual(xor(xor(plant,stream),stream),plant);
findings.sort((a,b)=>b.printable-a.printable||b.longest-a.longest);
console.log(JSON.stringify({
  source:'LP2 original 16 decimal values and 256 numeric cells',
  models:findings.length,
  bestPrintable:findings[0],
  maxLongest:7,maxGP29Digits:34,maxDirectPadEqual:3,
  incidentalSixHexDigits:incidental.first8,
  allFileMagicAndP56HashesAbsent:true,
  plantedExactInverse:true
},null,2));