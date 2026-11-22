'use strict';

/**
 * Bounded public 2014 participant-screen recovery for Director issue #908.
 * Node.js 22 CommonJS; fixed six IRC-sourced original links. Screens are
 * participant evidence, never Cicada-authored instructions.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const sources = [
  {id:'3g0vw2',line:168640,date:'2014-05-05',url:'http://prntscr.com/3g0vw2',claim:'Nem0 / Anoniem4l first-rune A conjecture'},
  {id:'3ilh97',line:175366,date:'2014-05-12',url:'http://prntscr.com/3ilh97',claim:'Nem0 key-length proof-of-concept'},
  {id:'3ix2fd',line:177109,date:'2014-05-13',url:'http://prntscr.com/3ix2fd',claim:'Nem0 key reset / length diagram'},
  {id:'3fugdf',line:165756,date:'2014-05-03',url:'http://prntscr.com/3fugdf',claim:'Ammar page43 guessed phrase'},
  {id:'1mkseB8',line:198062,date:'2014-06-11',url:'http://i.imgur.com/1mkseB8.jpg',claim:'idontworkfor3301 p55/p54 visual asymmetry; separate earlier p34/p35 guesses'},
  {id:'474ruj',line:228534,date:'2014-07-28',url:'http://prntscr.com/474ruj',claim:'Nem0 restricted-shift frequency illustration'}
];

/** @param {Buffer} data @returns {string|null} */
function imageExt(data) {
  if (data.length>=3 && data[0]===0xff && data[1]===0xd8 && data[2]===0xff) return '.jpg';
  if (data.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) return '.png';
  if (data.subarray(0,4).toString('ascii')==='GIF8') return '.gif';
  if (data.subarray(0,4).toString('ascii')==='RIFF' && data.subarray(8,12).toString('ascii')==='WEBP') return '.webp';
  return null;
}

/** @param {Buffer} data */
function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }

/** @param {string} dir @param {string} name @param {Buffer|string} data */
function atomicWrite(dir,name,data) {
  const dest=path.join(dir,name), tmp=dest+'.tmp';
  fs.writeFileSync(tmp,data,{flag:'wx'});
  fs.renameSync(tmp,dest);
}

/** @param {string} url */
async function request(url) {
  const resp=await fetch(url,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; LP2-original-capture-check/1.0)'},signal:AbortSignal.timeout(18000)});
  const bytes=Buffer.from(await resp.arrayBuffer());
  if (bytes.length>12000000)throw new Error('response too large');
  return {status:resp.status,url:resp.url,mediaType:resp.headers.get('content-type'),bytes};
}

/** @param {string} html @param {string} origin */
function extractImageUrl(html,origin) {
  const meta=html.match(/<meta\b[^>]*\b(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*\bcontent=["']([^"']+)/i)
    || html.match(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\b(?:property|name)=["'](?:og:image|twitter:image)["']/i)
    || html.match(/<img\b[^>]*\bid=["']screenshot-image["'][^>]*\bsrc=["']([^"']+)/i);
  if (!meta)return null;
  const raw=meta[1].replace(/&amp;/g,'&');
  try{return new URL(raw,origin).href;}catch{return null;}
}

/** @param {typeof sources[number]} source @param {string} outputDir */
async function inspect(source,outputDir) {
  const result={...source};
  try {
    const first=await request(source.url);
    result.first={status:first.status,finalUrl:first.url,type:first.mediaType,bytes:first.bytes.length,sha256:sha256(first.bytes)};
    let image=first;
    if (!imageExt(image.bytes) && /html/i.test(first.mediaType||'')) {
      const html=first.bytes.toString('utf8');
      atomicWrite(outputDir,source.id+'.html',first.bytes);
      const target=extractImageUrl(html,first.url);
      result.embeddedImageUrl=target;
      if (target && /^https?:\/\//i.test(target))image=await request(target);
    }
    const ext=imageExt(image.bytes);
    if (ext) {
      atomicWrite(outputDir,source.id+ext,image.bytes);
      result.image={status:image.status,finalUrl:image.url,type:image.mediaType,bytes:image.bytes.length,sha256:sha256(image.bytes),file:source.id+ext};
    } else {
      result.image=null;
      if (image!==first)result.second={status:image.status,finalUrl:image.url,type:image.mediaType,bytes:image.bytes.length,sha256:sha256(image.bytes)};
    }
  } catch(e) { result.error=String(e); }
  console.log('CAPTURE',JSON.stringify(result));
  return result;
}

function selftest() {
  assert.equal(sources.length,6);
  assert.equal(new Set(sources.map(s=>s.id)).size,6);
  assert.equal(imageExt(Buffer.from('ffd8ffe1','hex')),'.jpg');
  assert.equal(imageExt(Buffer.from('89504e470d0a1a0a','hex')),'.png');
  assert.equal(imageExt(Buffer.from('<html>')),null);
  assert.equal(extractImageUrl('<meta property="og:image" content="/foo.png">','https://prntscr.com/x'),'https://prntscr.com/foo.png');
  console.log('SELFTEST PASS: six exact sourced handles, image-byte signatures and HTML image locator');
}

async function main() {
  assert.equal(process.argv.length,3,'Output directory required');
  const dir=path.resolve(process.argv[2]);
  fs.mkdirSync(dir,{recursive:true});
  const lock=path.join(dir,'.capture.lock');
  const fd=fs.openSync(lock,'wx');
  try {
    const results=[];
    for (const s of sources)results.push(await inspect(s,dir));
    atomicWrite(dir,'manifest.json',JSON.stringify({source:'2014 original IRC Git blob bdd277c14f94c34b5ae714cd00c238065beeed4e',results},null,2)+'\n');
    console.log('SUMMARY',JSON.stringify({total:results.length,images:results.filter(x=>x.image).length,errors:results.filter(x=>x.error).length}));
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (process.argv[2]==='--selftest')selftest();
else main().catch(e=>{console.error(e);process.exitCode=1;});
