'use strict';

const crypto = require('node:crypto');
const zlib = require('node:zlib');

const URL = 'https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/A-primary-artifacts/2014/signed_interconnectedness_decoded.bin';

function sha256(b) { return crypto.createHash('sha256').update(b).digest('hex'); }
function ascii(b, n=96) {
  return [...b.subarray(0,n)].map(x => x >= 32 && x < 127 ? String.fromCharCode(x) : '.').join('');
}
function entropy(b) {
  const c = new Uint32Array(256);
  for (const x of b) c[x]++;
  let h=0;
  for (const n of c) if(n) { const p=n/b.length; h -= p*Math.log2(p); }
  return h;
}
function jpegDimensions(b, off=0) {
  if (b[off]!==0xff || b[off+1]!==0xd8) return null;
  let i=off+2;
  while(i+4<b.length) {
    if(b[i]!==0xff) { i++; continue; }
    while(b[i]===0xff) i++;
    const m=b[i++];
    if(m===0xd9 || m===0xda) return null;
    if(m===0xd8 || m===0x01 || (m>=0xd0&&m<=0xd7)) continue;
    if(i+2>b.length) return null;
    const len=b.readUInt16BE(i);
    if(len<2 || i+len>b.length) return null;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m)) {
      return {width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3),marker:m.toString(16)};
    }
    i+=len;
  }
  return null;
}
function findAll(b, sig, max=30) {
  const out=[]; let p=0;
  while(out.length<max && (p=b.indexOf(sig,p))>=0) { out.push(p); p+=sig.length; }
  return out;
}
function printableStrings(b, min=12, limit=80) {
  const out=[]; let start=-1;
  for(let i=0;i<=b.length;i++) {
    const x=i<b.length?b[i]:0;
    if(i<b.length && x>=32 && x<=126) { if(start<0)start=i; }
    else if(start>=0) { if(i-start>=min) out.push({off:start,s:b.toString('ascii',start,i).slice(0,180)}); start=-1; if(out.length>=limit)break; }
  }
  return out;
}
function describe(name,b) {
  const sigs=[
    ['JPEG',Buffer.from([0xff,0xd8,0xff])],['PNG',Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])],
    ['PDF',Buffer.from('%PDF-')],['ZIP',Buffer.from([0x50,0x4b,0x03,0x04])],['GZIP',Buffer.from([0x1f,0x8b])],
    ['7Z',Buffer.from([0x37,0x7a,0xbc,0xaf,0x27,0x1c])],['RAR',Buffer.from('Rar!')],['Ogg',Buffer.from('OggS')],
    ['FLAC',Buffer.from('fLaC')],['ID3',Buffer.from('ID3')],['WAVE',Buffer.from('RIFF')],
    ['ELF',Buffer.from([0x7f,0x45,0x4c,0x46])],['SQLite',Buffer.from('SQLite format 3')],
    ['PGP',Buffer.from('-----BEGIN PGP')],['MP3 frame',Buffer.from([0xff,0xfb])]
  ];
  console.log('\n['+name+'] len='+b.length+' sha256='+sha256(b)+' entropy='+entropy(b).toFixed(5));
  console.log('first128hex='+b.subarray(0,128).toString('hex'));
  console.log('first128ascii='+ascii(b,128));
  console.log('last64hex='+b.subarray(-64).toString('hex'));
  const found=[];
  for(const [n,s] of sigs){const offs=findAll(b,s,8);if(offs.length)found.push({type:n,offsets:offs});}
  console.log('signatures='+JSON.stringify(found));
  const jd=jpegDimensions(b);
  if(jd) console.log('jpeg_dimensions='+JSON.stringify(jd));
  const strings=printableStrings(b);
  console.log('strings='+JSON.stringify(strings));
}
(async()=>{
  const res=await fetch(URL,{redirect:'follow'});
  if(!res.ok) throw new Error('download failed '+res.status+' '+res.statusText);
  const b=Buffer.from(await res.arrayBuffer());
  describe('signed_interconnectedness_decoded.bin',b);
  for(const [name,fn] of [['inflate',zlib.inflateSync],['inflateRaw',zlib.inflateRawSync],['gunzip',zlib.gunzipSync],['unzip',zlib.unzipSync],['brotli',zlib.brotliDecompressSync]]) {
    try {
      const d=fn(b,{maxOutputLength:50*1024*1024});
      describe('decompressed:'+name,d);
    } catch(e) { console.log(name+': no ('+String(e.message).slice(0,120)+')'); }
  }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
