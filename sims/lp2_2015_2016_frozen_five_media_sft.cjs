'use strict';

/**
 * Five source-frozen 2015–16 LP2-related participant images for Director #913.
 * Freeze: issue comment 6882535676. Downloads are passive; no downloaded code runs.
 * Node.js 22 CommonJS. Original dated IRC blob:
 * SHA1 72634a9d071d32af767edbffc0493d810e88cd0d.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const items = [
  {id:'2015-p50-spiral', date:'2015-01-25', line:81708, nick:'crashdemons', url:'https://i.imgur.com/dS9wLm1.png'},
  {id:'2015-p50-hex', date:'2015-01-26', line:82344, nick:'crashoverride', url:'https://i61.tinypic.com/2cfcp4p.png'},
  {id:'2016-dots-mirror', date:'2016-03-25', line:314599, nick:'hiddentooruser', url:'https://i.imgur.com/0CIDkl4.jpg'},
  {id:'2016-p34-cuneiform', date:'2016-03-26', line:314952, nick:'hiddentooruser', url:'https://i.imgur.com/ABL7v5M.jpg'},
  {id:'2016-p24-ink', date:'2016-03-31', line:318596, nick:'AntigravityHat', url:'https://i.imgur.com/ZpiQZpp.jpg'}
];

/** @param {Buffer} buf */
function format(buf) {
  if(buf.length>=8 && buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
  if(buf.length>=3 && buf[0]===255 && buf[1]===216 && buf[2]===255)return 'jpeg';
  if(buf.subarray(0,6).toString('ascii').match(/^GIF8[79]a$/))return 'gif';
  return 'other';
}
/** @param {Buffer} buf */
function sha256(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
/** @param {string} destination @param {Buffer} buf */
function atomicWriteLocked(destination,buf) {
  const lock=destination+'.lock';
  const handle=fs.openSync(lock,'wx');
  const tmp=destination+'.'+process.pid+'.tmp';
  try {
    fs.writeFileSync(tmp,buf,{flag:'wx'});
    fs.renameSync(tmp,destination);
  } finally {
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(handle);
    fs.unlinkSync(lock);
  }
}
async function main(){
  assert.equal(items.length,5);
  assert.equal(new Set(items.map(x=>x.url)).size,5);
  assert.equal(format(Buffer.from([137,80,78,71,13,10,26,10])), 'png');
  assert.equal(format(Buffer.from([255,216,255,224])), 'jpeg');
  const out=process.env.LP2_MEDIA_OUT || path.join(os.tmpdir(),'lp2-2015-16-five-original-images');
  fs.mkdirSync(out,{recursive:true});
  const manifest=[];
  for(const item of items){
    const started=new Date().toISOString();
    try{
      const response=await fetch(item.url,{headers:{'user-agent':'Mozilla/5.0 (compatible; LP2-period-source-audit/1.0)','accept':'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'},signal:AbortSignal.timeout(22000)});
      const buf=Buffer.from(await response.arrayBuffer());
      const type=format(buf);
      const data={...item,started,http_status:response.status,final_url:response.url,content_type:response.headers.get('content-type'),bytes:buf.length,sha256:sha256(buf),image_type:type};
      const isRemoved = response.url.endsWith('/removed.png') || (buf.length === 503 && sha256(buf) === '9b5936f4006146e4e1e9025b474c02863c0b5614132ad40db4b925a10e8bfbb9');
      data.removed_placeholder=isRemoved;
      if(response.ok && type!=='other' && !isRemoved && buf.length<=25000000) {
        const filename=item.id+'.'+(type==='jpeg'?'jpg':type);
        atomicWriteLocked(path.join(out,filename),buf);
        data.saved_file=filename;
        if(process.env.LP2_EMIT_BASE64 === '1') {
          const b64=buf.toString('base64');
          console.log('IMAGE_BEGIN '+item.id+' '+type+' '+b64.length);
          for(let start=0;start<b64.length;start+=4000)console.log('IMAGE_CHUNK '+item.id+' '+b64.slice(start,start+4000));
          console.log('IMAGE_END '+item.id);
        }
      }else data.sample=buf.subarray(0,170).toString('utf8').replace(/[\r\n]/g,' ');
      manifest.push(data);
      console.log('FROZEN_IMAGE '+JSON.stringify(data));
    }catch(e){
      const data={...item,started,error:String(e)};
      manifest.push(data);
      console.log('FROZEN_IMAGE '+JSON.stringify(data));
    }
  }
  atomicWriteLocked(path.join(out,'manifest.json'),Buffer.from(JSON.stringify({source:'Git blob 72634a9d071d32af767edbffc0493d810e88cd0d',freeze_issue_comment:6882535676,manifest},null,2)+'\n'));
  console.log('ACQUISITION_SUMMARY '+JSON.stringify({frozen:5,valid_images:manifest.filter(x=>x.saved_file).length,report:out,other:manifest.filter(x=>!x.saved_file).map(x=>x.id)}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
