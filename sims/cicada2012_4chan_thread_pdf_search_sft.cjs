'use strict';
/**
 * Extract text from the public 2012 4chan science-thread PDF.
 * Verifies the original Git blob before parsing; installs pdf-parse in a
 * temporary runner directory only. No live services or private sources.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');

const source = {
  url: 'https://raw.githubusercontent.com/cijhho123/cicada3301/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012/additional%20docs/4chan%20threads/sci%20thread%20from%202012.pdf',
  bytes: 312580,
  gitBlobSha1: 'a51411eb77dc1699457fb6b5cf4dcb470b562856'
};
function gitBlobSha1(buf) {
  return crypto.createHash('sha1').update(Buffer.from('blob ' + buf.length + '\0','ascii')).update(buf).digest('hex');
}
function redact(s) {
  return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email redacted]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP redacted]');
}
async function main() {
  const response = await fetch(source.url);
  assert.equal(response.status,200,'HTTP '+response.status);
  const raw = Buffer.from(await response.arrayBuffer());
  assert.equal(raw.length,source.bytes,'PDF byte count');
  const sha=gitBlobSha1(raw);
  assert.equal(sha,source.gitBlobSha1,'PDF Git blob SHA-1');
  console.log('SOURCE VERIFIED '+JSON.stringify({bytes:raw.length,gitBlobSha1:sha}));

  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cicada-pdf-'));
  execFileSync('npm',['install','--prefix',temp,'pdf-parse@1.1.1','--no-audit','--no-fund'],{stdio:'inherit'});
  const requireTemp=createRequire(path.join(temp,'package.json'));
  const pdfParse=requireTemp('pdf-parse');
  const parsed=await pdfParse(raw);
  const text=parsed.text||'';
  const lines=text.split(/\r?\n/);
  const re=/(sq6wmgv2zcsrix6t|cginiziglyaobyph|numbers dot tk|\/NUM\b|unique number|number.{0,80}email|email.{0,80}number|number.{0,80}received|received.{0,80}number)/i;
  const hits=[];
  for(let i=0;i<lines.length;i++) if(re.test(lines[i])) hits.push(i);
  const urls=[...text.matchAll(/https?:\/\/sq6wmgv2zcsrix6t\.onion\/[0-9]{6,30}/gi)].map(m=>m[0]);
  const nums=[];
  for(let i=0;i<lines.length;i++) if(re.test(lines[i])) for(const m of lines[i].matchAll(/\b\d{8,30}\b/g)) nums.push({line:i+1,value:m[0],context:lines[i]});
  console.log('PDF SUMMARY '+JSON.stringify({pages:parsed.numpages,chars:text.length,lineCount:lines.length,hitCount:hits.length,exactSq6NumericUrls:[...new Set(urls)]}));
  for(const i of hits){
    const from=Math.max(0,i-2),to=Math.min(lines.length,i+3);
    console.log('--- context '+(from+1)+'-'+to+' ---');
    for(let j=from;j<to;j++) console.log((j+1)+': '+redact(lines[j]).slice(0,1000));
  }
  console.log('LONG NUMBERS IN RELEVANT CONTEXT '+JSON.stringify(nums.map(x=>({line:x.line,value:x.value,context:redact(x.context).slice(0,600)}))));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
