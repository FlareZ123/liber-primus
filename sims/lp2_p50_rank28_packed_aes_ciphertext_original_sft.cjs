'use strict';
/**
 * LP2 candidate: predecessor-ranked GP29 rune stream -> radix28 integer ->
 * binary bytes -> AES-256-CTR under source p50 numeral-column key.
 * Restores original rune seed and exact repeat sites to re-encode losslessly.
 * Independent of previous AES-per-GP-rune and direct unencrypted compression.
 * Windows Node22 CommonJS read-only SFT; historical operation not authenticated.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription=read('resources/lp2-transcription.txt');
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
const source=transcription.split('%').filter(x=>x.trim()).slice(0,-2).join('%');
const sections=source.split('$').filter(s=>/[\u16A0-\u16FF]/u.test(s))
  .map(s=>[...s.matchAll(/[\u16A0-\u16FF]/gu)].map(m=>runeMap.get(m[0])));
assert.equal(sections.length,8);
assert.deepEqual(sections.map(s=>s.length),[729,1145,1738,1894,1021,1433,1680,3316]);
const original=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(original.length,12956);
assert.deepEqual(sections.flat(),original);
const tokens=table.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const alpha60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(alpha60.length,60);
const alpha59=alpha60.replace('f','');
assert.equal(alpha59.length,59);
function typedBytes(radix){
  const a=radix===60?alpha60:alpha59;
  const out=tokens.map(t=>a.indexOf(t[0])*radix+a.indexOf(t[1]));
  assert(out.every(n=>Number.isInteger(n)&&n>=0&&n<=255));
  return out;
}
const b60=typedBytes(60);
assert.deepEqual(b60,table.pages.flatMap(p=>p.bytes));
const b59=typedBytes(59);
function columnKey(b,col){
  return Buffer.from(Array.from({length:32},(_,row)=>b[8*row+col]));
}
/** @param {number} previous @param {number} current @param {'sorted'|'cyclic'} order */
function rank(previous,current,order){
  if(current===previous)return null;
  return order==='sorted'?current-Number(current>previous):
    (current-previous+28)%29;
}
function encodeRank(previous,r,order){
  if(order==='sorted')return r+Number(r>=previous);
  return (previous+r+1)%29;
}
/** Retain the IV rune and exact escaped-repeat locations as original side info. */
function extract(glyphs,order){
  const escapes=[];let value=0n;let count=0;
  for(let i=1;i<glyphs.length;i++){
    const r=rank(glyphs[i-1],glyphs[i],order);
    if(r===null){escapes.push(i);continue;}
    assert(r>=0&&r<28);
    value=value*28n+BigInt(r);count++;
  }
  return {seed:glyphs[0],escapes,count,value,length:glyphs.length};
}
function restore(t,order){
  const ranks=Array(t.count);let n=t.value;
  for(let i=ranks.length-1;i>=0;i--){ranks[i]=Number(n%28n);n/=28n;}
  assert.equal(n,0n);
  const escapeSet=new Set(t.escapes);const result=[t.seed];let j=0;
  for(let i=1;i<t.length;i++){
    if(escapeSet.has(i)){result.push(result.at(-1));continue;}
    result.push(encodeRank(result.at(-1),ranks[j++],order));
  }
  assert.equal(j,t.count);
  return result;
}
function packedBytes(t,width){
  let hex=t.value.toString(16);
  if(hex.length%2)hex='0'+hex;
  if(width==='fixed')hex=hex.padStart(Math.ceil(t.count*Math.log2(28)/8)*2,'0');
  return Buffer.from(hex,'hex');
}
function aesTransform(bytes,key,iv,decrypt){
  const object=decrypt?crypto.createDecipheriv('aes-256-ctr',key,iv):
    crypto.createCipheriv('aes-256-ctr',key,iv);
  return Buffer.concat([object.update(bytes),object.final()]);
}
function marker(buf){
  const hex=buf.subarray(0,8).toString('hex');
  if(hex.startsWith('1f8b08'))return 'gzip';
  if(hex.startsWith('425a683'))return 'bzip2';
  if(hex.startsWith('504b0304'))return 'zip';
  if(hex.startsWith('25504446'))return 'PDF';
  if(hex.startsWith('89504e470d0a1a0a'))return 'PNG';
  if(hex.startsWith('fd377a585a00'))return 'XZ';
  if(hex.startsWith('7b22')||hex.startsWith('5b7b'))return 'JSON-start';
  return null;
}
function asciiStats(buf){
  let ascii=0,run=0,longest=0;
  for(const b of buf){
    const good=(b>=32&&b<=126)||b===9||b===10||b===13;
    if(good){ascii++;run++;longest=Math.max(run,longest);}else run=0;
  }
  return {printable:ascii/buf.length,longest};
}
function uncompress(buf,type){
  try{
    const opts={maxOutputLength:1<<20};
    return type==='raw'?zlib.inflateRawSync(buf,opts):
      type==='zlib'?zlib.inflateSync(buf,opts):zlib.gunzipSync(buf,opts);
  }catch{return null;}
}
const ivs={zero:Buffer.alloc(16),cicada3301:Buffer.alloc(16)};
ivs.cicada3301.writeUInt32BE(3301,12);
const known=Buffer.from(
  'FIND THE DIVINITY WITHIN AND EMERGE. LIKE THE INSTAR TUNNELING TO THE SURFACE.','ascii');
const plantCipher=aesTransform(known,columnKey(b60,0),ivs.zero,false);
let plantValue=BigInt('0x'+plantCipher.toString('hex'));
const plantRanks=[];
while(plantValue){plantRanks.unshift(Number(plantValue%28n));plantValue/=28n;}
let positives=0;
for(const order of ['sorted','cyclic']){
  const emitted=[15];
  for(const r of plantRanks)emitted.push(encodeRank(emitted.at(-1),r,order));
  emitted.splice(11,0,emitted[10]);
  const p=extract(emitted,order);
  assert.deepEqual(restore(p,order),emitted);
  const packed=packedBytes(p,'minimal');
  assert.deepEqual(packed,plantCipher);
  const decrypted=aesTransform(packed,columnKey(b60,0),ivs.zero,true);
  assert.deepEqual(decrypted,known);positives++;
}
assert.equal(positives,2);
const outcomes=[];let originalCases=0,rawCompressed=0,readable=0,headers=0;
let bestAscii={printable:0},bestRun={longest:0};const byteRanges=[];
for(let s=0;s<8;s++)for(const order of ['sorted','cyclic']){
  const t=extract(sections[s],order);
  assert.deepEqual(restore(t,order),sections[s]);
  if(s===0)byteRanges.push({order,digits:t.count,
    escapeSites:t.escapes.length,bytes:packedBytes(t,'minimal').length});
  for(const width of ['minimal','fixed']){
    const blob=packedBytes(t,width);
    for(const radix of [60,59])for(let column=0;column<8;column++)
    for(const [ivName,iv] of Object.entries(ivs)){
      const plain=aesTransform(blob,columnKey(radix===60?b60:b59,column),iv,true);
      const stats=asciiStats(plain);
      const key={s,order,width,radix,column,iv:ivName,bytes:blob.length};
      originalCases++;
      if(stats.printable>bestAscii.printable)
        bestAscii={...key,...stats,prefixHex:plain.subarray(0,32).toString('hex')};
      if(stats.longest>bestRun.longest)
        bestRun={...key,...stats,prefixHex:plain.subarray(0,32).toString('hex')};
      const format=marker(plain);
      if(format){headers++;outcomes.push({...key,kind:'header',format});}
      for(const kind of ['raw','zlib','gzip']){
        const inflated=uncompress(plain,kind);
        if(!inflated)continue;
        rawCompressed++;
        const infStats=asciiStats(inflated);
        if(inflated.length>=128&&infStats.printable>=.85){
          readable++;
          outcomes.push({...key,kind,bytesOut:inflated.length,...infStats,
            text:inflated.subarray(0,128).toString('utf8')});
        }
      }
    }
  }
}
assert.equal(originalCases,1024);
console.log(JSON.stringify({
  hypothesis:'GP28 rank integer -> bytes -> p50 original AES-256-CTR key -> native English/file',
  originalRunes:original.length,sourceSections:sections.map(s=>s.length),
  originalTableBytes:256,sourceRadices:[60,59],originalCases,
  nativeSolvedSourceAsciiPlantRecoveries:positives,
  wholeSourceReencryptions:16,byteRanges,bestAscii,bestRun,
  headers,inflateSuccesses:rawCompressed,readableInflated:readable,
  genuinePayloadCandidates:outcomes,
  scope:'Fixed IV0/3301, 8 actual 32-byte table-column keys, two standard radix numerals, two rank orders, both integer widths. No original instruction selecting AES, rank28, or a key.'
},null,2));
