'use strict';
/** Complete exact source 2014/15 Fandom revision recovery for period LP2 reporting, Node22. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const url=new URL('https://uncovering-cicada.fandom.com/api.php');
const out=process.env.RUNNER_TEMP||process.cwd();
const journal=[];
let continuation=null, page=0, count=0;
const summary=[];
function sha(x){return crypto.createHash('sha256').update(x).digest('hex');}
async function main(){
  do{
    if(page>=40)throw Error('unexpected >40 API pages');
    const u=new URL(url);
    const args={action:'query',format:'json',formatversion:'2',prop:'revisions',pageids:'9003',rvstart:'2015-09-01T23:59:59Z',rvend:'2014-05-01T00:00:00Z',rvlimit:'max',rvprop:'ids|timestamp|content|comment',rvslots:'main'};
    for(const [k,v] of Object.entries(args))u.searchParams.set(k,v);
    if(continuation)for(const [k,v] of Object.entries(continuation))u.searchParams.set(k,v);
    const abort=new AbortController(), timer=setTimeout(()=>abort.abort(),45000);
    let resp,text;
    try{resp=await fetch(u,{signal:abort.signal,headers:{'User-Agent':'liber-primus-original-revision-science/1.0'}});text=await resp.text();}finally{clearTimeout(timer);}
    if(resp.status!==200)throw Error('API '+resp.status+' body '+text.slice(0,200));
    const result=JSON.parse(text);
    if(result.error)throw Error(JSON.stringify(result.error));
    const revs=result.query?.pages?.[0]?.revisions||[];
    for(const v of revs){const body=v.slots?.main?.content||v['*']||'';journal.push({id:v.revid,when:v.timestamp,sha:sha(body),text:body});const anchors=[...body.matchAll(/(?:decrypt|decoded|solve|unsolved|key|page.{0,4}[0-9]{1,2}|liber primus)/ig)].length;summary.push({id:v.revid,when:v.timestamp,n:body.length,anchors});count++;}
    continuation=result.continue||null;
    console.log(JSON.stringify({page,returned:revs.length,cumulative:count,first:revs[0]?.timestamp,last:revs.at(-1)?.timestamp,continued:!!continuation}));
    page++;
  }while(continuation);
  const data=JSON.stringify({source:'Fandom original MediaWiki revision API',pageid:9003,revisions:journal},null,2);
  const dest=path.join(out,'agent46-wikia-part9-original-revisions.json');
  fs.writeFileSync(dest+'.tmp',data);fs.renameSync(dest+'.tmp',dest);
  summary.sort((a,b)=>a.when.localeCompare(b.when));
  console.log(JSON.stringify({result:'complete-interval',count,oldest:summary[0],latest:summary.at(-1),head:summary.slice(0,6),tail:summary.slice(-3),sha256:sha(data)}));
}
main().catch(e=>{console.error(String(e));process.exitCode=1;});
