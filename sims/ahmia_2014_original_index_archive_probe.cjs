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
  const sourceCounts={root:original.captures.length,www:www.captures.length,control:control.captures.length};
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
    knownHosts, control:{...control,count:sourceCounts.control}, indexes:[
      {...original,count:sourceCounts.root},
      {...www,count:sourceCounts.www},
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

/**
 * Separate original-era Wayback CDX witness, selected by ARCHIVE_MODE=wayback.
 * No onion service is requested. The replay target is always the Ahmia site.
 */
async function waybackMain() {
  /** @param {string} hostname @param {number} limit */
  async function list(hostname,limit) {
    const q=new URL('https://web.archive.org/cdx/search/cdx');
    q.searchParams.set('url','http://'+hostname+'/*');
    q.searchParams.set('from','2014');
    q.searchParams.set('to','2015');
    q.searchParams.set('output','json');
    q.searchParams.set('filter','statuscode:200');
    q.searchParams.set('collapse','urlkey');
    q.searchParams.set('gzip','false');
    q.searchParams.set('limit',String(limit));
    const response=await download(q.href);
    let records=[];
    if(response.httpStatus===200 && response.text){
      try {
        const matrix=JSON.parse(response.text);
        const fields=matrix[0];
        records=matrix.slice(1).map(row=>Object.fromEntries(fields.map((field,i)=>[field,row[i]])));
      } catch(error) {response.parseError=String(error);}
    }
    delete response.text;
    return {hostname,records,...response};
  }

  const control=await list('example.com',2);
  const original=await list('ahmia.fi',1000);
  const www=await list('www.ahmia.fi',1000);
  const counts={control:control.records.length,original:original.records.length,www:www.records.length};
  const relevant=[...original.records,...www.records].filter(r=>/^2014|^2015/.test(String(r.timestamp||'')));
  const unique=[...new Map(relevant.map(x=>[x.original,x])).values()];
  const hostURLs=unique.filter(r=>matches(String(r.original||'')).length);
  const planned=unique.sort((a,b)=>{
    const score=u=>/\/onion|\/stats|\/search|\/static\/visuals|\/directory/i.test(u)?0:1;
    return score(a.original)-score(b.original) || a.timestamp.localeCompare(b.timestamp);
  }).slice(0,12);
  const replays=[];
  for(const capture of planned){
    const request='https://web.archive.org/web/'+capture.timestamp+'id_/'+capture.original;
    const response=await download(request);
    const hits=matches(response.text||'');
    delete response.text;
    replays.push({capture:{timestamp:capture.timestamp,url:capture.original},hits,...response});
  }
  delete control.records;delete original.records;delete www.records;
  console.log(JSON.stringify({
    schema:1,archive:'Internet Archive Wayback CDX',generatedAt:new Date().toISOString(),
    purpose:'May-to-autumn 2014 Ahmia source-index witness, not unknown .onion crawling',
    sources:[
      {...control,count:counts.control},
      {...original,count:counts.original},
      {...www,count:counts.www},
    ],
    knownHosts,visibleUniqueURLs:unique.length,
    originalURLHostMatches:hostURLs.map(r=>({url:r.original,knownHosts:matches(r.original)})),
    selectedCaptures:planned,
    replays,
    caution:'A blocked CDX positive control means no coverage claims. Only exact original target body bytes could authenticate the LP2 512-bit digest.',
  },null,2));
}

const runner=process.env.ARCHIVE_MODE==='wayback'?waybackMain:main;
runner().catch(error=>{console.error(error);process.exitCode=1;});
