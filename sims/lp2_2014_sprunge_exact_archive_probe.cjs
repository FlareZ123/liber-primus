'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const TARGETS = ['iQUB','YJdG'];
const CC_INDEXES = [
  'CC-MAIN-2014-10','CC-MAIN-2014-15','CC-MAIN-2014-23','CC-MAIN-2014-35','CC-MAIN-2014-42','CC-MAIN-2014-52',
  'CC-MAIN-2015-06','CC-MAIN-2015-11','CC-MAIN-2015-18','CC-MAIN-2015-22','CC-MAIN-2015-27','CC-MAIN-2015-32','CC-MAIN-2015-35','CC-MAIN-2015-40','CC-MAIN-2015-48',
  'CC-MAIN-2016-07','CC-MAIN-2016-18','CC-MAIN-2016-22','CC-MAIN-2016-26','CC-MAIN-2016-30','CC-MAIN-2016-36','CC-MAIN-2016-40','CC-MAIN-2016-44','CC-MAIN-2016-50'
];

function sha256(buf){ return crypto.createHash('sha256').update(buf).digest('hex'); }

async function fetchText(url) {
  try {
    const r = await fetch(url, { redirect:'follow', headers:{'User-Agent':'liber-primus-source-recovery/1.0'} });
    const b = Buffer.from(await r.arrayBuffer());
    return {
      requested_url:url, final_url:r.url, status:r.status,
      content_type:r.headers.get('content-type'), bytes:b.length,
      sha256:sha256(b), text:b.toString('utf8').slice(0,20000)
    };
  } catch (e) {
    return {requested_url:url,error:String(e)};
  }
}

async function main(){
  const out={generated_at:new Date().toISOString(), targets:{}};
  for (const id of TARGETS) {
    const exact=[
      'http://sprunge.us/'+id,
      'https://sprunge.us/'+id
    ];
    const item={live:[],wayback:[],commoncrawl:[]};
    for(const u of exact) item.live.push(await fetchText(u));

    for(const u of exact){
      const cdx='https://web.archive.org/cdx/search/cdx?url='+encodeURIComponent(u)+
        '&output=json&fl=timestamp,original,statuscode,mimetype,digest,length&filter=statuscode:200&collapse=digest';
      item.wayback.push(await fetchText(cdx));
    }

    for(const index of CC_INDEXES){
      for(const u of exact){
        const api='https://index.commoncrawl.org/'+index+'-index?url='+encodeURIComponent(u)+'&output=json';
        const res=await fetchText(api);
        if(res.status===200 && res.text && res.text.trim()) {
          item.commoncrawl.push({index,url:u,result:res});
        }
      }
    }
    out.targets[id]=item;
  }
  console.log('ARCHIVE_RESULT '+JSON.stringify(out));
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});