'use strict';

/**
 * Literal signed-2013 BASE29 full-integer receiver for already proposed
 * original base60-minus-f/base59 SHED five-state digits.
 * Four fixed concentric rectangular original table scopes (0..3 peels).
 * No key, language fit, phase, word resegmentation, or free length.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'..');
const G=JSON.parse(fs.readFileSync(path.join(dir,'resources','liber-primus','lp2-grid-256.json'),'utf8'));
const C=JSON.parse(fs.readFileSync(path.join(dir,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const a=G.alphabet;
const b=a.replace('f','');
assert.equal(a,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const tok=G.pages.flatMap(p=>p.tokens);
assert.equal(tok.length,256);
const d=tok.map(x=>60*a.indexOf(x[0])+a.indexOf(x[1])-
  59*b.indexOf(x[0])-b.indexOf(x[1]));
const expectedN=[256,180,112,52];
const expectedGp=[123,87,53,25];
const expectedBits=[595,418,255,118];
const expectedSums=[507,345,199,94];

/** @param {number[]} digits @param {number} base */
function fromDigits(digits,base) {
  return digits.reduce((n,v)=>n*BigInt(base)+BigInt(v),0n);
}
/** @param {bigint} value @param {number} base */
function toDigits(value,base) {
  if(value===0n) return [0];
  const digits=[];
  while(value!==0n){digits.push(Number(value%BigInt(base)));value/=BigInt(base)}
  return digits.reverse();
}
/** @param {number[]} data */
function ioc(data) {
  const counts=Array(29).fill(0);
  data.forEach(n=>counts[n]++);
  return counts.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const outputs=[];
for(let peel=0;peel<=3;peel++) {
  const cells=[];
  for(let row=peel;row<32-peel;row++)
    for(let col=peel;col<8-peel;col++)cells.push(d[row*8+col]);
  assert.equal(cells.length,expectedN[peel]);
  assert.equal(cells.reduce((s,v)=>s+v,0),expectedSums[peel]);
  const value=fromDigits(cells,5);
  assert.equal(value.toString(2).length,expectedBits[peel]);
  const gp=toDigits(value,29);
  assert.equal(gp.length,expectedGp[peel]);
  assert.deepEqual(toDigits(fromDigits(gp,29),5),toDigits(value,5));
  const native=gp.map(v=>C.translit[v]).join('');
  outputs.push(gp);
  console.log('Peel '+peel+': '+cells.length+' base5 digits -> '+
    gp.length+' exact GP29 digits, IoC='+ioc(gp).toFixed(9)+
    ', transliteration='+native);
}

// Full original D-field happens to start with TH,E (literal 'THE'),
// but no original word boundaries or native-GP prose follow.
assert.deepEqual(outputs[0].slice(0,3),[2,18,13]);
assert.equal(outputs[0].map(v=>C.translit[v]).join('').slice(0,5),'THEPX');

// Source-native solved p57 packed as a single 29-ary integer then into base5
// recovers precisely all 95 actual unencrypted GP rune symbols.
const clear=C.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
assert.notEqual(clear[0],0);
const encoded=toDigits(fromDigits(clear,29),5);
assert.deepEqual(toDigits(fromDigits(encoded,5),29),clear);
console.log('Original solved p57 planted full-integer BASE29 positive: '+
  clear.length+'/'+clear.length+' recovered; packed base5 length '+encoded.length);
console.log('DECISION: no original p50 SHED direct full-integer BASE29 text; '+
  'no source selector for a second cipher or text split.');


/**
 * Single historical second-stage candidate: solved p56 running
 * prime-totient GP29 cipher, no F skips on unknown table outputs.
 * Genuine p56 authenticated source positive has sole transparent F at56.
 */
const solved=JSON.parse(fs.readFileSync(path.join(dir,
  'resources','external','relikd-solved-gp29-native-v1.json'),'utf8'));
const p56cipher=C.pages.find(p=>p.page===56).indices;
const p56plain=[...solved.sections.find(s=>s.name==='p56_an_end').source_text]
  .filter(ch=>C.runes.includes(ch)).map(ch=>C.runes.indexOf(ch));
assert.equal(p56cipher.length,85);
assert.equal(p56plain.length,85);
const primes=[];
for(let n=2;primes.length<160;n++){
  let prime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}
  if(prime)primes.push(n);
}
/**
 * @param {number[]} sequence
 * @param {number[]} transparentPositions
 */
function primeTotientDecode(sequence,transparentPositions=[]) {
  let counter=0;
  return sequence.map((c,i)=>{
    if(transparentPositions.includes(i))return c;
    const shift=(primes[counter++]-1)%29;
    return (c-shift+29)%29;
  });
}
assert.equal(p56cipher[56],0);
assert.equal(p56plain[56],0);
assert.deepEqual(primeTotientDecode(p56cipher,[56]),p56plain);
for(let peel=0;peel<=3;peel++){
  const candidate=primeTotientDecode(outputs[peel]);
  console.log('Uninterrupted prime-totient second-stage peel '+peel+
    ' length='+candidate.length+' IoC='+ioc(candidate).toFixed(9)+
    ' opening='+candidate.map(v=>C.translit[v]).join('').slice(0,140));
}
console.log('Authentic original solved p56 running totient GP positive recovered 85/85.');
console.log('DECISION: historical totient cipher alone does not decrypt any SHED-to-BASE29 original scope.');
