'use strict';
/**
 * Exact public-catalogue acquisition for Vienna ÖNB Cod. 911, fol. 21r.
 * Complements #3324's blocked viewer, no LP2 key fitting.
 * Node 22, existing read-only runner, output source-test-output.json.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const base = 'https://obv-at-oenb.alma.exlibrisgroup.com/view/sru/43ACC_ONB';
/** @param {string} query @returns {string} */
function sru(query) {
  const u = new URL(base);
  Object.entries({version:'1.2',operation:'searchRetrieve',query,maximumRecords:'20',recordSchema:'marcxml'}).forEach(([k,v])=>u.searchParams.set(k,v));
  return u.href;
}
/** @param {string} url */
async function read(url) {
  try {
    const response = await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'LiberPrimus-research/1.0 (public manuscript catalogue lookup)','Accept':'text/html,application/xml,application/json,*/*'}});
    const bytes = Buffer.from(await response.arrayBuffer());
    const body = bytes.toString('utf8');
    const links = [...new Set([...body.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]))];
    return {requested:url,final:response.url,status:response.status,type:response.headers.get('content-type'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),links:links.filter(s=>/onb|digital|iiif|manifest|repo|viewer|\b10237\b/i.test(s)),body:body.slice(0,250000),truncated:body.length>250000};
  } catch (error) { return {requested:url,error:String(error),cause:String(error.cause || '')}; }
}
(async()=>{
  const urls=[
    'https://manuscripta.at/?ID=10237',
    'https://manuscripta.at/_scripts/php/msDescription2_m1_NEU.php?ID=10237&IDinitia=',
    sru('alma.title="In honorem sanctae crucis"'),
    sru('alma.all="Cod. 911"'),
    'https://data.onb.ac.at/rec/AL00169257',
    sru('alma.all="AL00169257"'),
    sru('alma.mms_id="21302414450003338"'),
    sru('alma.other_system_number="AC13952808"'),
    'https://search.onb.ac.at/primaws/rest/pub/pnxs/L/ONB_alma21302414450003338?vid=ONB&lang=de_DE&search_scope=ONB_gesamtbestand&adaptor=Local%20Search%20Engine'
  ];
  const records=[];
  for (const url of urls) {
    const item=await read(url); records.push(item);
    console.log(JSON.stringify({...item,body:undefined}));
  }
  const out=path.join(process.env.RUNNER_TEMP || os.tmpdir(),'source-test-output.json');
  fs.writeFileSync(out,JSON.stringify({shelfmark:'Wien, Österreichische Nationalbibliothek, Cod. 911',folio:'21r',catalogueId:10237,records},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
