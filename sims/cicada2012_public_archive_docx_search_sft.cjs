'use strict';
/**
 * Source-pinned search of additional public 2012 archive DOCX files for the
 * missing sq6 /NUM enrollment email. No token is guessed; only exact source
 * text and source-verified bytes are reported.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const repo = 'cijhho123/cicada3301';
const ref = 'd360ad97d39c4719e42dc88b0cbbb81ed54aa02c';
const sources = [
  ['2012/2012 - what happend part 1.docx', 1374855, 'b44c4352f697fdc59ff2d37f43490e08df79c857'],
  ['2012/2012 - what happend part 2.docx', 54715, 'fc38e4f095c4d58d5345b969248c24dbdef5c1ef'],
  ['2012/additional docs/the outgussed messege.docx', 38618, '98f0df31c58ec29dc1abe70682a9351b57055775'],
  ['2012/additional docs/unverified claims from alleged winners on Unfiction.docx', 589635, '541dc532fb5a1621288a7234b6a4d260e71a4c97'],
  ['2012/additional docs/the subreddit/The subreddit.docx', 142630, '8ada6606c9282495cd284677c811579c7107ecf9'],
  ['2012/additional docs/scream314 git pages/2012.docx', 1650929, '867401ba9a1daa9def058464b7ab64f02bfe8d03']
];
function gitBlobSha1(buf) {
  return crypto.createHash('sha1').update(Buffer.from('blob ' + buf.length + '\0','ascii')).update(buf).digest('hex');
}
function zipEntries(buf) {
  let eocd=-1;
  for(let i=Math.max(0,buf.length-65557);i<=buf.length-22;i++) if(buf.readUInt32LE(i)===0x06054b50)eocd=i;
  assert.notEqual(eocd,-1,'ZIP EOCD missing');
  const count=buf.readUInt16LE(eocd+10);
  let pos=buf.readUInt32LE(eocd+16);
  const out=new Map();
  for(let n=0;n<count;n++){
    assert.equal(buf.readUInt32LE(pos),0x02014b50,'bad central directory');
    const method=buf.readUInt16LE(pos+10), csize=buf.readUInt32LE(pos+20), usize=buf.readUInt32LE(pos+24);
    const nl=buf.readUInt16LE(pos+28), el=buf.readUInt16LE(pos+30), cl=buf.readUInt16LE(pos+32), off=buf.readUInt32LE(pos+42);
    const name=buf.toString('utf8',pos+46,pos+46+nl);
    pos+=46+nl+el+cl;
    assert.equal(buf.readUInt32LE(off),0x04034b50,'bad local header');
    const lnl=buf.readUInt16LE(off+26), lel=buf.readUInt16LE(off+28);
    const start=off+30+lnl+lel, comp=buf.subarray(start,start+csize);
    const data=method===0?Buffer.from(comp):method===8?zlib.inflateRawSync(comp):null;
    assert(data,'unsupported compression for '+name);
    assert.equal(data.length,usize,'bad size for '+name);
    out.set(name,data);
  }
  return out;
}
function xmlText(xml) {
  return xml.replace(/<w:tab\b[^>]*\/>/g,'\t').replace(/<w:br\b[^>]*\/>/g,'\n')
    .replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'");
}
function redact(s) {
  return s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email redacted]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g,'[IP redacted]');
}
async function main(){
  for(const [path,expectedBytes,expectedSha] of sources){
    const url='https://raw.githubusercontent.com/'+repo+'/'+ref+'/'+path.split('/').map(encodeURIComponent).join('/');
    const response=await fetch(url);
    assert.equal(response.status,200,path+' HTTP '+response.status);
    const raw=Buffer.from(await response.arrayBuffer());
    assert.equal(raw.length,expectedBytes,path+' bytes');
    const sha=gitBlobSha1(raw);
    assert.equal(sha,expectedSha,path+' Git blob SHA-1');
    const entries=zipEntries(raw);
    const xml=entries.get('word/document.xml');
    assert(xml,path+' missing word/document.xml');
    const text=xmlText(xml.toString('utf8'));
    const lines=text.split(/\r?\n/);
    const regex=/(sq6wmgv2zcsrix6t|cginiziglyaobyph|numbers dot tk|\/NUM\b|unique number|number.{0,50}email|email.{0,50}number|number.{0,50}received|received.{0,50}number)/i;
    const hits=[];
    for(let i=0;i<lines.length;i++) if(regex.test(lines[i])) hits.push(i);
    const urlHits=[...text.matchAll(/https?:\/\/sq6wmgv2zcsrix6t\.onion\/[0-9]{6,30}/gi)].map(m=>m[0]);
    const numeric=[];
    for(let i=0;i<lines.length;i++){
      if(regex.test(lines[i])){
        for(const m of lines[i].matchAll(/\b\d{12,}\b/g)) numeric.push({line:i+1,value:m[0],context:lines[i]});
      }
    }
    console.log('\n=== '+path+' ===');
    console.log(JSON.stringify({bytes:raw.length,gitBlobSha1:sha,docxEntries:entries.size,paragraphLines:lines.length,hitCount:hits.length,exactSq6NumericUrls:[...new Set(urlHits)]},null,2));
    for(const i of hits){
      const from=Math.max(0,i-2),to=Math.min(lines.length,i+3);
      console.log('--- context lines '+(from+1)+'-'+to+' ---');
      for(let j=from;j<to;j++) console.log((j+1)+': '+redact(lines[j]).slice(0,900));
    }
    if(numeric.length) console.log('LONG NUMBERS IN RELEVANT CONTEXT '+JSON.stringify(numeric.map(x=>({line:x.line,value:x.value,context:redact(x.context).slice(0,500)}))));
    const media=[...entries.entries()].filter(([name])=>/^word\/media\//.test(name));
    console.log('EMBEDDED MEDIA '+JSON.stringify(media.map(([name,data])=>({name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')}))));
    if(path.includes('unverified claims') || path.includes('the subreddit')) {
      for(const [name,data] of media) {
        if(data.length>8000 && data.length<=130000) {
          const mime=data[0]===0xff&&data[1]===0xd8?'image/jpeg':data.subarray(0,8).toString('hex')==='89504e470d0a1a0a'?'image/png':name.endsWith('.gif')?'image/gif':'application/octet-stream';
          console.log('MEDIA_BASE64 '+JSON.stringify({source:path,name,bytes:data.length,mime,base64:data.toString('base64')}));
        }
      }
    }
    if(path.includes('what happend part 1') || path.includes('scream314 git pages')) {
      for(const [name,data] of media) {
        if(data.length<=60000) {
          const mime=data[0]===0xff&&data[1]===0xd8?'image/jpeg':data.subarray(0,8).toString('hex')==='89504e470d0a1a0a'?'image/png':'application/octet-stream';
          console.log('MEDIA_BASE64 '+JSON.stringify({source:path,name,bytes:data.length,mime,base64:data.toString('base64')}));
        }
      }
    }
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
