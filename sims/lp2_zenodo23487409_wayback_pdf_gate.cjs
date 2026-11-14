'use strict';

/**
 * Exact-read-only preservation check for the missing Zenodo working-paper PDF.
 * This tests historical archive captures, not the five official Zenodo URLs
 * already tested in the separate 2026-11-14 original-server probe.
 *
 * Source object: DOI 10.5281/zenodo.23487409; filename "Cicada 3301.pdf";
 * published 2026-10-20; publicly indexed MD5
 * 89f1248f3c24f8b628e4305fb1dcbe6c.
 *
 * Run: node sims/lp2_zenodo23487409_wayback_pdf_gate.cjs
 * No third-party PDF content is persisted or committed.
 *
 * @typedef {{timestamp?:string,original?:string,mimetype?:string,digest?:string,length?:string}} Capture
 */
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const target = 'https://zenodo.org/records/23487409/files/Cicada%203301.pdf';
const expectedMd5 = '89f1248f3c24f8b628e4305fb1dcbe6c';
const queries = [
  {
    label: 'exact-file',
    url: 'https://web.archive.org/cdx/search/cdx?' + new URLSearchParams({
      url: target, output: 'json', fl: 'timestamp,original,mimetype,statuscode,digest,length',
      filter: 'statuscode:200', from: '2026', to: '2026', limit: '30'
    })
  },
  {
    label: 'record-file-prefix',
    url: 'https://web.archive.org/cdx/search/cdx?' + new URLSearchParams({
      url: 'zenodo.org/records/23487409/files/*', matchType: 'prefix',
      output: 'json', fl: 'timestamp,original,mimetype,statuscode,digest,length',
      from: '2026', to: '2026', limit: '50'
    })
  },
  {
    label: 'record-available',
    url: 'https://archive.org/wayback/available?' + new URLSearchParams({
      url: target, timestamp: '20261021'
    })
  }
];

/** @param {string} url @returns {Promise<{status:number,type:string,bytes:Uint8Array,url:string}>} */
async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Cicada3301-research-preservation-check/1.0', Accept: '*/*' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow'
  });
  const bytes = new Uint8Array(await res.arrayBuffer());
  return {status:res.status,type:res.headers.get('content-type')||'',bytes,url:res.url};
}

/** @param {Uint8Array} bytes @returns {string} */
function string(bytes) { return Buffer.from(bytes).toString('utf8'); }

/** @param {Uint8Array} bytes @param {string} from @returns {void} */
function inspectPdf(bytes, from) {
  const md5 = crypto.createHash('md5').update(bytes).digest('hex');
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  console.log('ARCHIVE_PDF',JSON.stringify({from,length:bytes.length,md5,sha256,exact:md5===expectedMd5}));
  if (md5!==expectedMd5) return;
  // Print plain strings from PDF text-stream objects, if any; not a full PDF
  // parser. If no plain text exists, claim verified bytes only.
  const raw=Buffer.from(bytes).toString('latin1');
  const terms=Array.from(raw.matchAll(/(liber primus|LP2|decrypt(?:ed|ion)?|gematria|rune|SHA512|cipher)/gi))
    .slice(0,20).map(m=>raw.slice(Math.max(0,m.index-90),m.index+140).replace(/[^\x20-\x7e]/g,' '));
  console.log('ARCHIVE_PDF_LITERAL_STRINGS',JSON.stringify(terms));
}

(async()=>{
  const archived = new Set();
  for (const q of queries) {
    try {
      const r=await get(q.url);
      const txt=string(r.bytes);
      console.log('WAYBACK_QUERY',JSON.stringify({label:q.label,status:r.status,type:r.type,bytes:r.bytes.length,
        preview:txt.slice(0,1600)}));
      if (r.status!==200) continue;
      try {
        const json=JSON.parse(txt);
        if (Array.isArray(json)&&json.length>1) {
          const header=json[0];
          for (const values of json.slice(1)) {
            const row=Object.fromEntries(header.map((k,i)=>[k,values[i]]));
            if (row.statuscode==='200' && row.mimetype==='application/pdf')
              archived.add('https://web.archive.org/web/'+row.timestamp+'id_/'+row.original);
          }
        }
        if (json.archived_snapshots?.closest?.status==='200')
          archived.add(json.archived_snapshots.closest.url.replace('/web/','/web/').replace(/\/web\/(\d+)\//,'/web/$1id_/'));
      } catch { /* A non-JSON CDX error page is already exposed above. */ }
    } catch(e) {
      console.log('WAYBACK_QUERY_FAILED',JSON.stringify({label:q.label,error:String(e).slice(0,240)}));
    }
  }
  for(const url of Array.from(archived).slice(0,5)){
    try {
      const r=await get(url);
      console.log('WAYBACK_CAPTURE',JSON.stringify({url,status:r.status,type:r.type,size:r.bytes.length}));
      if(r.status===200 && Buffer.from(r.bytes).subarray(0,5).toString('ascii')==='%PDF-')
        inspectPdf(r.bytes,url);
    } catch(e) {
      console.log('WAYBACK_CAPTURE_FAILED',JSON.stringify({url,error:String(e).slice(0,200)}));
    }
  }
  console.log('WAYBACK_DONE',JSON.stringify({candidateArchivedPdfCaptures:archived.size,expectedMd5}));
})();
