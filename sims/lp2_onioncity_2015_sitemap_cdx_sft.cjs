'use strict';

/**
 * Narrow original-2015 OnionCity Common Crawl CDX probe.
 * Does not contact Tor, crawl unknown hosts or save downloaded content.
 * Source: https://tor.stackexchange.com/a/3907
 * Official index inventory: https://index.commoncrawl.org/collinfo.json
 * Node 22 / CommonJS, manual-only CI.
 */
const periods = ['2015-11','2015-14','2015-18','2015-22','2015-27','2015-32','2015-35','2015-40','2015-48'];
const targets = ['example.com/','onion.city/sitemap.xml','www.onion.city/sitemap.xml','ky2khlqdf7qdznac.onion.city/','onion.city/'];

/** @param {Response} response @returns {Promise<string>} */
async function readBounded(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  while (text.length < 40000) {
    const part = await reader.read();
    if (part.done) return text;
    text += decoder.decode(part.value, {stream: true});
  }
  await reader.cancel();
  return text.slice(0,40000)+'\n[TRUNCATED]';
}

/** @param {string} period @param {string} target @returns {Promise<object>} */
async function probe(period,target) {
  const url = new URL('https://index.commoncrawl.org/CC-MAIN-'+period+'-index');
  url.searchParams.set('url',target);
  url.searchParams.set('output','json');
  try {
    const response = await fetch(url,{signal: AbortSignal.timeout(12000)});
    const body = await readBounded(response);
    const entries = response.status === 200
      ? body.split(/\r?\n/).filter(Boolean).flatMap(line => {
          try {
            const z = JSON.parse(line);
            return [{url:z.url,timestamp:z.timestamp,status:z.status,filename:z.filename,offset:z.offset,length:z.length,digest:z.digest}];
          } catch { return []; }
        })
      : [];
    return {period,target,status:response.status,entries,excerpt:response.status===200?undefined:body.slice(0,200),truncated:body.includes('[TRUNCATED]')};
  } catch (err) { return {period,target,error:String(err)}; }
}

(async () => {
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),periods,targets,control:'example.com/'}));
  for (const period of periods) {
    const results = await Promise.all(targets.map(target => probe(period,target)));
    for(const r of results) console.log(JSON.stringify(r));
  }
})().catch(err => { console.error(err); process.exitCode=1; });
