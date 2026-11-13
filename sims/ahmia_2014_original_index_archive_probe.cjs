'use strict';

/**
 * Original-era Ahmia front-end archive census, not a crawl of Tor services.
 * Uses Arquivo.pt's documented CDX interface and raw archived HTML replays.
 * Pin original source host strings before network results.
 * Run: node sims/ahmia_2014_original_index_archive_probe.cjs
 */
const {createHash} = require('node:crypto');

const knownHosts = [
  'auqgnxjtvdbll3pv', 'cu343l33nqaekrnw', 'fv7lyucmeozzd5j4',
  'avowyfgl5lkzfj3n', 'q4utgdi2n4m4uim5', 'ut3qtzbrvs7dtvzp',
  'ky2khlqdf7qdznac', 'eq6emgv2ehsrix6t',
];
const host = 'ahmia.fi';

/** @param {string} url */
async function download(url) {
  try {
    const res = await fetch(url, {
      headers:{'user-agent':'LP2-Ahmia-Historical-Index-Source-Search/1'},
      signal:AbortSignal.timeout(20000),
    });
    const bytes = Buffer.from(await res.arrayBuffer());
    return {
      httpStatus:res.status, requested:url, finalUrl:res.url,
      length:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex'),
      text:bytes.toString('utf8'),
    };
  } catch (error) {
    return {requested:url, error:String(error)};
  }
}

/** @param {string} hostname @param {number} limit */
async function cdx(hostname,limit) {
  const q = new URL('https://arquivo.pt/wayback/cdx');
  q.searchParams.set('url',hostname);
  q.searchParams.set('matchType','host');
  q.searchParams.set('from','2014');
  q.searchParams.set('to','2015');
  q.searchParams.set('limit',String(limit));
  q.searchParams.set('output','json');
  const response=await download(q.href);
  let captures=[];
  if(response.httpStatus===200 && response.text){
    try { captures=response.text.trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); }
    catch(error) { response.parseError=String(error); }
  }
  delete response.text;
  return {hostname, captures, ...response};
}

/** @param {unknown} record */
function getRecord(record) {
  const r=/** @type {{url?:string,timestamp?:string,status?:number|string,statuscode?:number|string,mime?:string,mimetype?:string}} */(record);
  return {
    url:String(r.url||''), timestamp:String(r.timestamp||''),
    status:String(r.status||r.statuscode||''),
    mime:String(r.mime||r.mimetype||''),
  };
}

/** @param {string} text */
function matches(text) {
  const low=text.toLowerCase();
  return knownHosts.filter(name=>low.includes(name));
}

async function main() {
  const control=await cdx('www.sapo.pt',3);
  const original=await cdx(host,5000);
  const www=await cdx('www.'+host,5000);
  const all=[...original.captures,...www.captures].map(getRecord);
  const distinct=new Map(all.map(c=>[c.timestamp+'|'+c.url,c]));
  const records=[...distinct.values()];
  const valid=records.filter(c=>/^2014|^2015/.test(c.timestamp));
  const relevant=valid.filter(c=>/\/onion|\/stats|\/search|\/static\/visuals|\/directory|\/sites|\/index|\/robots|\/\.onion/i.test(c.url));
  const indexHits=valid.filter(c=>matches(c.url).length).map(c=>({...c,knownHosts:matches(c.url)}));
  const selectCaptures=valid.filter(c=>c.status==='200' && (!c.mime||/text\/html|text\/plain|application\/xml|application\/json|application\/xhtml/.test(c.mime)));
  selectCaptures.sort((a,b)=>{
    const priority=u=>/\/onion|\/stats\/history|\/static\/visuals|\/search/i.test(u)?0:1;
    return priority(a.url)-priority(b.url) || a.timestamp.localeCompare(b.timestamp);
  });
  const uniquePages=[...new Map(selectCaptures.map(c=>[c.url,c])).values()].slice(0,16);
  const replays=[];
  for(const c of uniquePages) {
    const replay='https://arquivo.pt/noFrame/replay/'+c.timestamp+'id_/'+c.url;
    const result=await download(replay);
    const bodyHits=matches(result.text||'');
    delete result.text;
    replays.push({source:c,knownHosts:bodyHits,...result});
  }
  delete original.captures;delete www.captures;delete control.captures;
  const report={
    schema:1, generatedAt:new Date().toISOString(),
    question:'Can an external archive provide dated 2014-15 Ahmia URL/HTML evidence for Cicada LP2?',
    knownHosts, control:{...control, count:3}, indexes:[
      {...original,count:all.length-valid.length?all.length:records.length},
      {...www,count:records.length},
    ],
    unique2014to2015Captures:valid.length,
    distinctSourceUrls:new Set(valid.map(c=>c.url)).size,
    matchedKnownHostUrls:indexHits,
    relevantCaptureCount:relevant.length,
    relevantCaptureExamples:relevant.slice(0,60),
    replays,
    caution:'Capture index or text is not a LP2 hash preimage. Search engine may not retain raw onion HTTP bodies. Failed controls or requests mean inconclusive.',
  };
  console.log(JSON.stringify(report,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
