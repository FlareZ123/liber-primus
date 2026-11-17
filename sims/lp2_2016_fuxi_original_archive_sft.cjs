'use strict';
/**
 * SFT: attempt to recover the exact originally posted 2016 Fu-Xi commentary,
 * selected independently by Calypne post480 (2016-06-11).
 *
 * Only fetch the exact historical link, archive indices and snapshots.
 * No arbitrary link following, broad website search or execution of third-party code.
 */
const crypto = require('node:crypto');
const target = 'https://7a35090f.io/topic/16/irc-cicadasolvers-08-05-2016-user-fu-xi';
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const u = encodeURIComponent(target);
/** @param {string} label @param {string} url @param {number} [limit] */
async function inspect(label,url,limit=500) {
  try {
    const res = await fetch(url, {redirect:'follow',signal:AbortSignal.timeout(17000),headers:{'User-Agent':'LiberPrimusOriginalSourceReview/1.0 (archival research)'}});
    const body = await res.text();
    const excerpt = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'')
      .replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    console.log('SOURCE '+JSON.stringify({label,status:res.status,url:res.url,bytes:Buffer.byteLength(body),sha256:sha256(body),excerpt:excerpt.slice(0,limit)}));
    return {status:res.status,body,url:res.url};
  } catch(e){console.log('ERROR '+JSON.stringify({label,error:String(e)}));return null;}
}
(async()=>{
  const base = [
    ['original',target],
    ['wayback-available-2016', 'https://archive.org/wayback/available?url='+u+'&timestamp=20160611'],
    ['wayback-available-current', 'https://archive.org/wayback/available?url='+u],
    ['cdx-exact', 'https://web.archive.org/cdx/search/cdx?url='+u+'&output=json&filter=statuscode:200&collapse=timestamp:4'],
    ['cdx-domain', 'https://web.archive.org/cdx/search/cdx?url=7a35090f.io%2Ftopic%2F16%2F*&output=json&filter=statuscode:200&collapse=urlkey'],
    ['web2016', 'https://web.archive.org/web/20160611000000/'+target]
  ];
  for(const [label,url] of base) await inspect(label,url,900);
  const coll = await inspect('commoncrawl-index-list','https://index.commoncrawl.org/collinfo.json',180);
  if(coll?.status===200){
    let all;
    try{all=JSON.parse(coll.body)}catch(e){all=[]}
    const chosen = all.filter(x=>/CC-MAIN-201[678]-/.test(x.id)).slice(0,12);
    console.log('INDEXES '+JSON.stringify(chosen.map(x=>x.id)));
    for(const x of chosen) await inspect('commoncrawl-'+x.id,x['cdx-api']+'?url='+u+'&output=json',300);
  }
  console.log('FINISHED original requested '+target);
})().catch(e=>{console.error(e);process.exitCode=1;});