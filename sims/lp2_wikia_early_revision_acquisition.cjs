'use strict';
/** Source-gated 2014/15 Uncovering-Cicada revision retrieval, Node 22, read-only remote. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ids=[5500,9075,8128,8314,9003,27743,23104,23106];
const bases=['https://uncovering-cicada.fandom.com/api.php','https://uncovering-cicada.wikia.com/api.php'];
const out=process.env.RUNNER_TEMP||process.cwd();
/** @param {string} tag @param {string} body */
function save(tag,body){
  const dest=path.join(out,'agent46-wikia-'+tag+'.txt');
  const tmp=dest+'.tmp-'+process.pid;
  fs.writeFileSync(tmp,body,'utf8');
  fs.renameSync(tmp,dest);
}
/** @param {string} url */
async function request(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),28000);
  try {
    const r=await fetch(url,{signal:controller.signal,headers:{'User-Agent':'liber-primus-historical-revision/1.0 (public research)','Accept':'application/json, text/xml, text/html;q=0.8'}});
    const t=await r.text();
    return {status:r.status,location:r.url,bytes:Buffer.byteLength(t),body:t};
  } finally {clearTimeout(timer);}
}
function details(j){
  const pages=j.query?.pages||[];
  return pages.flatMap(p=>(p.revisions||[]).map(v=>{
    const text=v.slots?.main?.content||v['*']||'';
    return {pageid:p.pageid,title:p.title,oldid:v.revid,when:v.timestamp,chars:text.length,sha256:crypto.createHash('sha256').update(text).digest('hex'),excerpt:text.slice(0,200).replace(/\s+/g,' ')};
  }));
}
async function main(){
  let hits=0, failures=0;
  for(const base of bases){
    const origin=new URL(base).origin.replace(/\W/g,'_');
    for(const id of ids){
      const u=new URL(base);
      for(const [k,v] of Object.entries({
        action:'query',format:'json',formatversion:'2',prop:'revisions',pageids:String(id),
        rvstart:'2015-12-31T23:59:59Z',rvend:'2014-05-01T00:00:00Z',
        rvlimit:'max',rvprop:'ids|timestamp|content|comment',rvslots:'main'
      }))u.searchParams.set(k,v);
      try{
        const r=await request(u.toString());
        save(origin+'-page'+id,r.body);
        const valid=r.body.startsWith('{')&&r.status===200;
        const parsed=valid?JSON.parse(r.body):null;
        const d=parsed?details(parsed):[];
        hits+=d.length;
        console.log(JSON.stringify({source:base,pageid:id,status:r.status,size:r.bytes,valid,returned:d.length,revisions:d.slice(0,16),continue:parsed?.continue||null,errors:parsed?.error||null}));
      }catch(e){failures++;console.log(JSON.stringify({source:base,pageid:id,error:String(e)}));}
    }
  }
  const archive='https://web.archive.org/web/20140524061049id_/http://uncovering-cicada.wikia.com/wiki/CICADA_3301_Liber_Primus_Sacred_BOOK?oldid=16242';
  try{
    const r=await request(archive);
    save('wayback-oldid16242',r.body);
    console.log(JSON.stringify({source:'20140524061049 oldid16242 indexed original',status:r.status,size:r.bytes,sha256:crypto.createHash('sha256').update(r.body).digest('hex'),excerpt:r.body.slice(0,350).replace(/\s+/g,' ')}));
  }catch(e){failures++;console.log('WAYBACK: '+String(e));}
  console.log(JSON.stringify({totalHistoricalRevisionsActuallyReceived:hits,transportFailures:failures,targets:ids,archiveOldid:16242,decision:hits?'Inspect actual historical content. No automatic plaintext claim.':'No historical revision content available from tested APIs; do not assert absent plaintext.'}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
