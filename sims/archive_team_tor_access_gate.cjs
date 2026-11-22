/** Original-byte access gate for independently enumerated Archive Team Tor item indexes. */
'use strict';
const fs=require('node:fs');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const path=require('node:path');
const tests=[
  ['archiveteam_tor_20180102080000','archiveteam_tor_20180102080000.cdx.idx'],
  ['archiveteam_tor_20181101052100','archiveteam_tor_20181101052100.cdx.gz'],
  ['archiveteam_tor_20170918143620','archiveteam_tor_20170918143620.cdx.idx'],
];
/** @param {string} id @param {string} filename */
async function tryFile(id,filename) {
  const url='https://archive.org/download/'+id+'/'+filename;
  try {
    const response=await fetch(url,{signal:AbortSignal.timeout(25000),
      headers:{'user-agent':'LiberPrimus-archive-index-research/1.0'}});
    const content=Buffer.from(await response.arrayBuffer());
    const record={id,filename,status:response.status,contentType:response.headers.get('content-type'),
      length:content.length,sha256:crypto.createHash('sha256').update(content).digest('hex')};
    if(response.ok && content.length<=32000000) {
      const raw=filename.endsWith('.gz')?zlib.gunzipSync(content):content;
      const text=raw.toString('utf8');
      record.decodedBytes=raw.length;
      record.targetHostHits=(text.match(/ky2khlqdf7qdznac\.onion/gi)||[]).length;
      record.safePositiveHostHits=(text.match(/facebookcorewwwi\.onion/gi)||[]).length;
      record.firstLine=text.split(/\r?\n/,1)[0].slice(0,180);
    }
    console.log('INDEX_ACCESS',JSON.stringify(record));
    return record;
  }catch(error) {
    const record={id,filename,status:'error',message:String(error).slice(0,230)};
    console.log('INDEX_ACCESS',JSON.stringify(record));
    return record;
  }
}
async function main(){
  const out={at:new Date().toISOString(),
    scope:'three small original Archive Team Tor CDX index access tests',
    tests:[]};
  for(const [id,filename] of tests) out.tests.push(await tryFile(id,filename));
  const file=process.argv[2];
  if(file){
    const lock=file+'.lock',temp=file+'.'+process.pid+'.tmp';
    const fd=fs.openSync(lock,'wx');
    try{fs.writeFileSync(temp,JSON.stringify(out,null,2)+'\n');fs.renameSync(temp,file);}
    finally{if(fs.existsSync(temp))fs.unlinkSync(temp);fs.closeSync(fd);fs.unlinkSync(lock);}
  }
  console.log('SUMMARY',JSON.stringify({success:out.tests.filter(x=>x.status===200).length,
    restricted:out.tests.filter(x=>x.status===401||x.status===403).length}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
