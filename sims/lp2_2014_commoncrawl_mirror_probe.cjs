'use strict';
/**
 * Original 2014 Stage11 ZIP mirrors: independent Common Crawl historical index.
 * The two URLs were named in May 2014 Freenode records; no guessed filenames.
 * Node 22/CommonJS. --selftest exercises source and parser without network.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const mirrors=[
  {host:'shadow-code.org',file:'/onion7.zip',date:'2014-05-02T14:53Z'},
  {host:'terrafant.asia',file:'/cicada/onion7.zip',date:'2014-05-09T00:56Z'}
];
const indexes=['CC-MAIN-2014-23','CC-MAIN-2014-35','CC-MAIN-2014-41',
  'CC-MAIN-2014-49','CC-MAIN-2014-52','CC-MAIN-2015-06','CC-MAIN-2015-22'];
const out=path.join('mirror-2014-original-recovery','commoncrawl-index.json');
/** @param {string} t */
function parse(t){return t.trim()?t.trim().split(/\r?\n/).map(JSON.parse):[];}
/** @param {string} idx @param {string} pattern @param {boolean} prefix */
function api(idx,pattern,prefix){
  const u=new URL('https://index.commoncrawl.org/'+idx+'-index');
  u.searchParams.set('url',pattern);u.searchParams.set('output','json');
  if(prefix)u.searchParams.set('matchType','prefix');
  u.searchParams.set('limit',prefix?'1000':'100');return u.toString();
}
/** @param {string} u */
async function query(u){
  for(let attempt=0;attempt<2;attempt++){
    try{
      const r=await fetch(u,{signal:AbortSignal.timeout(18000),
        headers:{'user-agent':'LP2-2014-CommonCrawl-original-source/1.0'}});
      const t=await r.text();
      if(r.status===404&&/no captures found/i.test(t))
        return {status:404,records:[],absent:true};
      if(!r.ok)return {status:r.status,error:t.slice(0,400),records:[]};
      return {status:r.status,records:parse(t)};
    }catch(e){if(attempt)return {error:String(e),records:[]};}
  }
}
/** @param {string} dest @param {string} txt */
function atomic(dest,txt){
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  const lock=dest+'.lock';const fd=fs.openSync(lock,'wx');
  try{
    const tmp=dest+'.'+crypto.randomBytes(6).toString('hex')+'.tmp';
    fs.writeFileSync(tmp,txt,{flag:'wx'});fs.renameSync(tmp,dest);
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
async function main(){
  if(process.argv.includes('--selftest')){
    assert.equal(parse('{"status":"200"}\n')[0].status,'200');
    assert.deepEqual(parse(''),[]);
    assert.equal(mirrors.length,2);assert.equal(indexes.length,7);
    assert(api(indexes[0],'shadow-code.org/onion7.zip',false).includes('output=json'));
    console.log('Common Crawl mirror source/parser SFT PASS');return;
  }
  const start=new Date().toISOString();
  const tasks=[];
  for(const idx of indexes){
    tasks.push({index:idx,role:'control',pattern:'example.com/*',prefix:false});
    for(const m of mirrors){
      tasks.push({index:idx,role:'source-exact',pattern:m.host+m.file,prefix:false,original_date:m.date});
      tasks.push({index:idx,role:'source-directory',pattern:m.host+path.posix.dirname(m.file)+'/',prefix:true,original_date:m.date});
    }
  }
  const results=[];
  for(let i=0;i<tasks.length;i+=5){
    results.push(...await Promise.all(tasks.slice(i,i+5).map(async t=>({
      ...t,...await query(api(t.index,t.pattern,t.prefix))
    }))));
  }
  const controls=results.filter(x=>x.role==='control');
  const positive=controls.filter(x=>x.status===200&&x.records.length>0);
  const target=results.filter(x=>x.role!=='control');
  const records=target.flatMap(x=>x.records);
  const exact=records.filter(x=>/\/onion7\.zip(?:$|[?#])/i.test(x.url||''));
  const errors=results.filter(x=>x.error||(x.status!==200&&!x.absent));
  const output={
    schema:1,source:'2014 participant-named exact mirror URLs in neuroretransmit/cicada Freenode log blob bdd277c14f94c34b5ae714cd00c238065beeed4e',
    mirrors,indexes,start,finished:new Date().toISOString(),
    control_pass_count:positive.length,expected_control_count:indexes.length,
    query_count:target.length,record_count:records.length,exact_zip_records:exact,
    distinct_urls:[...new Set(records.map(x=>x.url).filter(Boolean))].sort(),
    errors,queries:results,
    interpretation:positive.length!==indexes.length||errors.length
      ?'Partial retrieval or failed controls: no complete negative archive conclusion.'
      :exact.length?'Original ZIP URL captures indexed: next recover WARC bytes and authenticate members.'
        :'No exact ZIP records in these seven Common Crawl indexes. Binary files may be omitted by the crawler.',
    limits:'Exact named May 2014 host/directory paths; 2014-2015 indexed crawls only, 1000 directory entries per query.'
  };
  atomic(out,JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({controls:positive.length,queries:target.length,records:records.length,
    exact_zips:exact.length,errors:errors.length,output:out},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
