'use strict';
/**
 * Exact source candidate: the printed 256-byte p49-p51 numeric table might
 * XOR-encrypt an unframed binary book stream. Convert each distinct
 * successor GP29 rune to its rank among 28 alternatives, serialize all
 * ranks as a base28 integer, XOR literal source table bytes repeatedly.
 * Test complete unknown book and floral chapter containing the table.
 * Windows Node22 CommonJS; no secret keys/IVs/bit-offset tuning.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const load=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const grid=load('resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page<=55);
const all=pages.flatMap(p=>p.indices);
const flower=pages.filter(p=>p.page>=40).flatMap(p=>p.indices);
assert.equal(all.length,12956);
assert.equal(flower.length,3316);
const alpha='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const alpha59=alpha.replace('f','');
const cells=grid.pages.flatMap(p=>p.tokens);
assert.equal(cells.length,256);
function table(radix){
  const letters=radix===60?alpha:alpha59;
  const bytes=cells.map(t=>radix*letters.indexOf(t[0])+letters.indexOf(t[1]));
  assert(bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
  return Buffer.from(bytes);
}
const keys={base60:table(60),base59:table(59)};
assert.deepEqual([...keys.base60],grid.pages.flatMap(p=>p.bytes));
function rank(previous,current,order){
  if(previous===current)return null;
  return order==='cyclic'?(current-previous+28)%29:
    current-Number(current>previous);
}
function unrank(previous,digit,order){
  return order==='cyclic'?(previous+digit+1)%29:
    digit+Number(digit>=previous);
}
function extract(runes,order){
  let value=0n,count=0;const escapes=[];
  for(let i=1;i<runes.length;i++){
    const digit=rank(runes[i-1],runes[i],order);
    if(digit===null){escapes.push(i);continue;}
    value=value*28n+BigInt(digit);count++;
  }
  return {value,count,escapes,first:runes[0],length:runes.length};
}
function restore(p,order){
  let n=p.value;const digits=Array(p.count);
  for(let i=digits.length-1;i>=0;i--){digits[i]=Number(n%28n);n/=28n;}
  assert.equal(n,0n);
  const omitted=new Set(p.escapes);const runes=[p.first];let j=0;
  for(let i=1;i<p.length;i++)runes.push(omitted.has(i)?runes.at(-1):
    unrank(runes.at(-1),digits[j++],order));
  assert.equal(j,p.count);
  return runes;
}
function toBytes(p,fixed){
  let hex=p.value.toString(16);
  if(hex.length%2)hex='0'+hex;
  if(fixed)hex=hex.padStart(2*Math.ceil(p.count*Math.log2(28)/8),'0');
  return Buffer.from(hex,'hex');
}
function xor(bytes,key){return Buffer.from(bytes.map((b,i)=>b^key[i%key.length]));}
function printable(bytes){
  if(!bytes.length)return 0;
  let good=0;
  for(const b of bytes)good+=Number((b>=32&&b<=126)||b===9||b===10||b===13);
  return good/bytes.length;
}
function marker(bytes){
  const hex=bytes.subarray(0,8).toString('hex');
  for(const [name,magic] of [
    ['gzip','1f8b08'],['bzip2','425a683'],['zip','504b0304'],
    ['PNG','89504e470d0a1a0a'],['PDF','25504446'],
    ['XZ','fd377a585a00']])if(hex.startsWith(magic))return name;
  return null;
}
function attempt(bytes,kind){
  try{
    return kind==='raw'?zlib.inflateRawSync(bytes,{maxOutputLength:1048576}):
      kind==='zlib'?zlib.inflateSync(bytes,{maxOutputLength:1048576}):
      zlib.gunzipSync(bytes,{maxOutputLength:1048576});
  }catch{return null;}
}
// Positive source-native English plant through compress -> XOR -> rank28 ->
// literal doublet -> exact inverse -> XOR -> decompress, all byte-identical.
const known=Buffer.from(('LIKE THE INSTAR TUNNELING TO THE SURFACE. '+
  'WE MUST SHED OUR OWN CIRCUMFERENCES. ').repeat(8));
const compressed=zlib.deflateRawSync(known);
const encrypted=xor(compressed,keys.base60);
let value=BigInt('0x'+encrypted.toString('hex'));
const digits=[];
while(value){digits.unshift(Number(value%28n));value/=28n;}
let positives=0;
for(const order of ['sorted','cyclic']){
  const fake=[17];
  for(const d of digits)fake.push(unrank(fake.at(-1),d,order));
  fake.splice(10,0,fake[9]);
  const p=extract(fake,order);
  assert.deepEqual(restore(p,order),fake);
  assert.deepEqual(toBytes(p,false),encrypted);
  assert.deepEqual(attempt(xor(toBytes(p,false),keys.base60),'raw'),known);
  positives++;
}
assert.equal(positives,2);
const trials=[];let originalCases=0,decoded=0;
for(const [name,runes] of [['floral',flower],['whole-book',all]])
for(const order of ['sorted','cyclic']){
  const t=extract(runes,order);
  assert.deepEqual(restore(t,order),runes);
  for(const width of ['minimal','fixed'])
  for(const [radix,key] of Object.entries(keys)){
    const buf=xor(toBytes(t,width==='fixed'),key);
    const result={name,order,width,radix,bytes:buf.length,
      runes:runes.length,digits:t.count,repeats:t.escapes.length,
      printable:printable(buf),prefixHex:buf.subarray(0,24).toString('hex'),
      magic:marker(buf)};
    originalCases++;
    for(const algorithm of ['raw','zlib','gzip']){
      const plain=attempt(buf,algorithm);
      if(!plain)continue;
      const mark=printable(plain);
      result[algorithm]={bytes:plain.length,printable:mark};
      if(plain.length>=128&&mark>=0.85){
        decoded++;
        result[algorithm].text=plain.subarray(0,120).toString('utf8');
      }
    }
    trials.push(result);
  }
}
assert.equal(originalCases,16);
const genuine=trials.filter(t=>t.magic||
  ['raw','zlib','gzip'].some(k=>t[k]&&t[k].text));
console.log(JSON.stringify({
  hypothesis:'Full source p50 byte table as repeated XOR on GP28 packed binary',
  source:'Original 32x8 numerals within illustrated floral chapter',
  originalCases,sourceCorpusRunes:12956,sourceFloralRunes:3316,
  nativeCompressedPlaintextPlants:positives,originalRuneForwardReconstructions:4,
  readableInflatedOriginals:decoded,payloadCandidates:genuine,trials
},null,2));
