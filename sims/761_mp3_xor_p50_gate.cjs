#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const xor = (a,b) => {
  if (a.length !== b.length) throw new Error('XOR length mismatch');
  const o = Buffer.alloc(a.length);
  for (let i=0;i<a.length;i++) o[i]=a[i]^b[i];
  return o;
};
const has = (b,hex) => b.indexOf(Buffer.from(hex,'hex')) >= 0;
const jpeg = b => b[0]===0xff && b[1]===0xd8 && has(b,'ffdb') &&
  (has(b,'ffc0') || has(b,'ffc2')) && has(b,'ffda');
const summary = b => {
  const printable=[...b].filter(x=>x===9||x===10||x===13||(x>=32&&x<=126)).length;
  const ascii=[...b].map(x=>x>=32&&x<=126?String.fromCharCode(x):'.').join('');
  const counts=new Array(256).fill(0); for(const x of b) counts[x]++;
  let entropy=0; for(const n of counts) if(n){const p=n/b.length;entropy-=p*Math.log2(p);}
  const magic=[['JPEG','ffd8ff'],['PNG','89504e470d0a1a0a'],['GIF','47494638'],['ZIP','504b0304'],['PDF','25504446'],['GZIP','1f8b']]
    .find(([name,h])=>b.subarray(0,Buffer.from(h,'hex').length).equals(Buffer.from(h,'hex')));
  return {length:b.length,sha256:sha(b),first16:b.subarray(0,16).toString('hex'),
    hex:b.toString('hex'),ascii,printable_ratio:Number((printable/b.length).toFixed(4)),
    unique_byte_count:new Set(b).size,permutation_0_to_255:b.length===256&&new Set(b).size===256,
    entropy_bits_per_byte:Number(entropy.toFixed(4)),leading_magic:magic?magic[0]:null};
};

const mp3=fs.readFileSync(process.argv[2]);
if(mp3.toString('ascii',0,3)!=='ID3') throw new Error('Pinned 761.MP3 lacks ID3 header');
const tag=10+(mp3[6]&127)*0x200000+(mp3[7]&127)*0x4000+(mp3[8]&127)*0x80+(mp3[9]&127);
const records=fs.readFileSync('resources/cicada2013-twitter-hex-stream.txt','utf8').trim().split(/\r?\n/).map((line,i)=>{
  const m=/^([0-9a-fA-F]+):\s*([0-9a-fA-F]+)\s*$/.exec(line);
  if(!m) throw new Error('Malformed Twitter hex line '+(i+1));
  return {offset:parseInt(m[1],16),bytes:Buffer.from(m[2],'hex')};
}).sort((a,b)=>a.offset-b.offset);
if(records[0].offset!==0) throw new Error('Twitter stream does not start at 0');
const total=records[records.length-1].offset+records[records.length-1].bytes.length;
const twitter=Buffer.alloc(total); let cursor=0;
for(const r of records){if(r.offset!==cursor)throw new Error('Twitter stream gap/overlap at '+cursor.toString(16));r.bytes.copy(twitter,cursor);cursor+=r.bytes.length;}
if(twitter.length!==64167) throw new Error('Unexpected Twitter stream length '+twitter.length);

const alignments=[{label:'whole-file-start',offset:0},{label:'audio-payload-start-after-ID3',offset:tag}].map(x=>{
 const pad=mp3.subarray(x.offset,x.offset+twitter.length);
 if(pad.length!==twitter.length)throw new Error('Short MP3 pad');
 const out=xor(twitter,pad);
 return {...x,jpeg:jpeg(out),first16:out.subarray(0,16).toString('hex'),sha256:sha(out)};
});
console.log(JSON.stringify({stage:'historical-positive-control',mp3_length:mp3.length,mp3_sha256:sha(mp3),
 id3_total_bytes:tag,twitter_records:records.length,twitter_length:twitter.length,
 twitter_sha256:sha(twitter),alignments},null,2));
const matches=alignments.filter(x=>x.jpeg);
if(matches.length!==1)throw new Error('Historical XOR control did not uniquely select a pad offset; stop before p50');
const offset=matches[0].offset;

const grid=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json','utf8'));
const p50=Buffer.from(grid.bytes);
if(p50.length!==256||grid.bytes.some(x=>!Number.isInteger(x)||x<0||x>255))throw new Error('p50 source is not 256 bytes');
const key=mp3.subarray(offset,offset+256);
const candidate=xor(p50,key);
const shifted=xor(p50,mp3.subarray(offset+1,offset+257));
const wrong=xor(p50,twitter.subarray(0,256));
console.log(JSON.stringify({stage:'frozen-p50-xor-test',
 operation:'p50[i] XOR 761.MP3[offset+i]',selected_offset:offset,
 p50_sha256:sha(p50),pad_sha256:sha(key),candidate:summary(candidate),
 one_byte_shift_control:summary(shifted),wrong_source_twitter_control:summary(wrong)},null,2));
