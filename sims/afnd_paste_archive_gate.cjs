'use strict';
/**
 * Source-frozen recovery of 2013 first-onion Pastebin AfndPJa0 COUNT record.
 * Original bytes fetched transiently, checked against SHA256 and numeric
 * GP29 calculations. Node.js 22/Windows; no third-party dependencies.
 */
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const TARGET='f3f7e546e7e66710f75649b9638c2d7c9a75b26a83bed0aa46daf159c97dafcd';
const c=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const gp=c.translit.map((token,i)=>({token,p:c.prime[i]})).sort((a,b)=>b.token.length-a.token.length);

/** @param {Buffer} b */
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
/** @param {string} v */
function sum(v){
  let s=v.toUpperCase().replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S')
    .replace(/ING/g,'NG').replace(/[^A-Z]/g,'');
  let z=0;
  while(s.length){
    const x=gp.find(q=>s.startsWith(q.token));
    assert(x,'Unknown token at '+s);
    z+=x.p;s=s.slice(x.token.length);
  }
  return z;
}
/** @param {number} n */
function prime(n){
  if(!Number.isSafeInteger(n)||n<2)return false;
  for(let k=2;k*k<=n;k++)if(n%k===0)return false;
  return true;
}
/** @param {string} url */
async function get(url){
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),
    headers:{'User-Agent':'LiberPrimus original 2013-source research'}});
  return {status:r.status,body:Buffer.from(await r.arrayBuffer()),url:r.url};
}
const cases=[
 ['Like the instar, tunneling to the surface',1259,'*'],
 ['We must shed our own circumferences;',1031,'*'],
 ['Find the divinity within and emerge.',1229,'*'],
 ['patience is a virtue',761,'*'],
 ['aleister crowley',751,'*'],
 ['The Instar Emergence',761,'*'],
 ['gematria primus',641,'+'],
 ['Liber AL vel Legis',797,'*'],
 ['Kether',163,'+']
];

async function main(){
  const live=await get('https://pastebin.com/raw/AfndPJa0');
  assert.equal(live.status,200);
  assert.equal(live.body.length,602);
  assert.equal(sha(live.body),TARGET);
  const raw=live.body.toString('utf8');
  assert(raw.includes('+ = regular prime, * = reversible prime'));
  const lines=raw.split('\r\n');
  const verified=cases.map(([phrase,expected,suffix])=>{
    const result=sum(phrase);
    assert.equal(result,expected,phrase);
    const i=lines.findIndex(line=>line.startsWith('count '+phrase));
    assert(i>=0,phrase);
    assert.equal(lines[i+1].trim(),String(expected)+suffix,phrase);
    const reversal=Number(String(result).split('').reverse().join(''));
    assert(prime(result));
    assert.equal(prime(reversal)?'*':'+',suffix);
    return {phrase,gematria:result,reversal,marker:suffix};
  });

  const liveHtml=await get('https://pastebin.com/AfndPJa0');
  const html=liveHtml.body.toString('utf8');
  const context=/(?:2013|2014|2015|2016)[^\n<]{0,130}/i.exec(html);
  const month=/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n<]{0,90}/i.exec(html);
  const archiveUrl='https://web.archive.org/web/20160411003839id_/http://pastebin.com/AfndPJa0';
  let archive;
  try{
    const r=await get(archiveUrl);
    const s=r.body.toString('utf8');
    archive={url:r.url,status:r.status,bytes:r.body.length,sha256:sha(r.body),
      titlePresent:s.includes('The Instar Emergence'),footnotePresent:s.includes('reversible prime')};
  }catch(error){
    archive={url:archiveUrl,error:String(error).slice(0,220)};
  }
  console.log(JSON.stringify({
    raw:{url:live.url,sha256:sha(live.body),bytes:live.body.length,
      markers:'+=regular prime; *=reversible prime (including palindrome 797)',
      verified},
    html:{url:liveHtml.url,status:liveHtml.status,bytes:liveHtml.body.length,
      dateContext:context?.[0]??null,monthContext:month?.[0]??null},
    archive,
    classification:'Unsigned participant transcript; no independently selected LP2 decoder.'
  },null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
