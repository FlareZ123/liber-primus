/** Enumerate public Archive Team Tor collection metadata before WARC retrieval. Node.js 22. */
'use strict';
const fs = require('node:fs');

/** @param {string} url @returns {Promise<object>} */
async function getJson(url) {
  const r = await fetch(url, {signal: AbortSignal.timeout(20000), headers: {'user-agent': 'LiberPrimus-archive-index-research/1.0', accept: 'application/json'}});
  const body = await r.text();
  if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + body.slice(0,150));
  return JSON.parse(body);
}

/** @param {string} name @param {string} url @param {object} result @returns {Promise<object|null>} */
async function tryJson(name,url,result) {
  try {
    const data = await getJson(url);
    result.requests.push({name,url,status:'ok'});
    return data;
  } catch (err) {
    result.requests.push({name,url,status:'unavailable',error:String(err).slice(0,280)});
    console.log('UNAVAILABLE',name,String(err).slice(0,280));
    return null;
  }
}

async function main() {
  const out = {at:new Date().toISOString(),collection:'archiveteam_tor',
    targetHost:'ky2khlqdf7qdznac.onion',positiveHost:'dstormer6em3i4km.onion',
    requests:[],items:[],limits:{pageSize:500,maxPages:20,maxItems:120}};
  const collection = await tryJson('collection',
    'https://archive.org/metadata/archiveteam_tor',out);
  if (collection) out.collectionMeta = {
    identifier:collection.metadata?.identifier, mediatype:collection.metadata?.mediatype,
    title:collection.metadata?.title, fileCount:collection.files?.length};
  let listed=[],total=null;
  for (let page=1;page<=out.limits.maxPages;page++) {
    const q=new URLSearchParams({q:'collection:archiveteam_tor',rows:'500',
      page:String(page),output:'json'});
    for(const field of ['identifier','title','date','year','publicdate']) q.append('fl[]',field);
    const x=await tryJson('list_'+page,
      'https://archive.org/advancedsearch.php?'+q,out);
    if (!x) break;
    const docs=x.response?.docs;
    if (!Array.isArray(docs)) break;
    listed.push(...docs);
    total=x.response?.numFound??null;
    console.log('PAGE',page,'COUNT',docs.length,'TOTAL',total);
    if (docs.length<500 || (total!==null && listed.length>=total)) break;
  }
  out.total=total;out.listed=listed.length;
  out.incompleteList=total!==null && total>listed.length;
  out.firstIds=listed.slice(0,20).map(x=>x.identifier);
  const dated=listed.filter(x=>/201[4-8]/.test(JSON.stringify([x.date,x.year,x.publicdate,x.title])));
  const targets=(dated.length?dated:listed).slice(0,out.limits.maxItems);
  for(const item of targets) {
    const id=item.identifier;
    const m=await tryJson('item_'+id,
      'https://archive.org/metadata/'+encodeURIComponent(id),out);
    if (!m) continue;
    const files=(m.files||[]).filter(x=>/(?:\.warc(?:\.gz|\.zst)?|\.cdx(?:\.gz)?|\.idx(?:\.gz)?)$/i.test(x.name||''));
    const result={id,title:m.metadata?.title||item.title,
      date:m.metadata?.date||item.date,publicdate:m.metadata?.publicdate||item.publicdate,
      files:files.map(x=>({name:x.name,size:Number(x.size),restricted:x.private||null})),
      targetMetadataMention:JSON.stringify(m.metadata||{}).includes(out.targetHost)};
    out.items.push(result);
    if (files.length) console.log('WARC_ITEM',JSON.stringify(result));
  }
  out.metadataItems=out.items.length;
  out.warcItems=out.items.filter(x=>x.files.some(f=>/warc/i.test(f.name))).length;
  console.log('RESULT',JSON.stringify(out));
  if(process.argv[2]) {
    const dest=process.argv[2],lock=dest+'.lock',temp=dest+'.'+process.pid+'.tmp';
    const fd=fs.openSync(lock,'wx');
    try {fs.writeFileSync(temp,JSON.stringify(out,null,2)+'\n');fs.renameSync(temp,dest);}
    finally {if(fs.existsSync(temp))fs.unlinkSync(temp);fs.closeSync(fd);fs.unlinkSync(lock);}
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
