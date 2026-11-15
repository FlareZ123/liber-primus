'use strict';
/**
 * Source-gated original 2014 seventh-onion HTTP-path witness extraction.
 * Reads each immutable period IRC log as bytes, then reports only genuinely
 * typed absolute-host URLs and narrowly adjacent request commands.
 * Node 22 CommonJS. Invoke as a single read-only manual CI SFT.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const base='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/';
const host='ky2khlqdf7qdznac.onion';
const sources=[
 {name:'#cicadasolvers.freenode.log',size:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
 {name:'#cicadasolvers.freenode.2.log',size:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'},
 {name:'#33012014.freenode.log',size:8629610,sha:'a2880b1db31ce523599ef30ca2e55291bf295900'}
];
const period=/^2014 (?:May|Jun|Jul|Aug) \d\d \d\d:\d\d /;
const hostPattern=/\bky2khlqdf7qdznac\.onion\b/i;
const known=/^\/(?:index\.html?|(?:[0-9]|[1-4][0-9]|5[0-7])\.jpe?g)?\/?$/i;
function shaGit(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
function clean(x){return x.replace(/[),;.!?"'\]>]+$/g,'');}
function sourcePaths(line){
 const hits=[];
 const direct=/\b(?:https?:\/\/)?ky2khlqdf7qdznac\.onion(?::\d+)?(\/[^\s<>"'()\]]*)?/ig;
 for(const match of line.matchAll(direct)){
  const full=clean(match[0]);
  const tail=full.slice(full.toLowerCase().indexOf('.onion')+6);
  const path=tail.replace(/^:\d+/,'')||'/';
  hits.push({kind:'host-anchored',path,raw:full});
 }
 return hits;
}
function adjacentRequest(line){
 const hits=[];
 const command=/\b(GET|HEAD|POST)\s+(\/[^\s<>"']+)/ig;
 for(const m of line.matchAll(command))hits.push({kind:'explicit-http-'+m[1].toUpperCase(),path:clean(m[2]),raw:m[0]});
 const paths=/\b(?:robots\.txt|favicon\.ico|(?:[a-z0-9_.-]+\/)+[a-z0-9_.-]+\.(?:txt|asc|bin|php|html|zip|gz|json))\b/ig;
 for(const m of line.matchAll(paths))hits.push({kind:'relative-filename',path:'/'+m[0],raw:m[0]});
 return hits;
}
function selftest(){
 assert.equal(shaGit(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 assert.equal(sourcePaths('http://ky2khlqdf7qdznac.onion/key.asc')[0].path,'/key.asc');
 assert.equal(sourcePaths('ky2khlqdf7qdznac.onion/56.jpg')[0].path,'/56.jpg');
 assert(known.test('/56.jpg') && !known.test('/key.asc'));
 assert.equal(adjacentRequest('GET /config/key.asc HTTP/1.1')[0].path,'/config/key.asc');
 console.log('SELFTEST PASS Git-blob identity and literal Stage11 host/path/request parsing');
}
async function read(s){
 const response=await fetch(base+encodeURIComponent(s.name));
 assert.equal(response.status,200,'Fetch failed '+s.name+': HTTP '+response.status);
 const b=Buffer.from(await response.arrayBuffer());
 assert.equal(b.length,s.size,'Source length '+s.name);
 assert.equal(shaGit(b),s.sha,'Source Git blob '+s.name);
 console.log('VERIFIED '+s.name+' bytes='+b.length+' GitSHA1='+s.sha);
 return b.toString('latin1').split(/\r?\n/);
}
async function main(){
 selftest();if(process.argv.includes('--selftest'))return;
 const direct=[],indirect=[],hostLines=[];
 for(const s of sources){
  const rows=await read(s);
  let periodCount=0,hosts=0;
  for(let i=0;i<rows.length;i++){
   const line=rows[i];if(!period.test(line))continue;periodCount++;
   const hs=sourcePaths(line);
   if(hs.length){hosts+=hs.length;hostLines.push({source:s.name,line:i+1,text:line.slice(0,420)});
     for(const h of hs)direct.push({...h,source:s.name,line:i+1,text:line.slice(0,420)});
   }
   const nearby=rows.slice(Math.max(0,i-12),Math.min(rows.length,i+13))
     .some(q=>period.test(q)&&q.slice(0,11)===line.slice(0,11)&&hostPattern.test(q));
   if(nearby){
    for(const h of adjacentRequest(line)){
      if(hostPattern.test(line)&&h.kind==='relative-filename'&&known.test(h.path))continue;
      indirect.push({...h,source:s.name,line:i+1,text:line.slice(0,420)});
    }
   }
  }
  console.log('PERIOD '+s.name+' May-Aug lines='+periodCount+' host-anchored-mentions='+hosts);
 }
 const unique=new Map();
 for(const hit of direct){
  const key=hit.path.toLowerCase();
  if(!unique.has(key))unique.set(key,{path:hit.path,count:0,witnesses:[]});
  const record=unique.get(key);record.count++;
  if(record.witnesses.length<6)record.witnesses.push({source:hit.source,line:hit.line,text:hit.text});
 }
 const novel=[...unique.values()].filter(x=>!known.test(x.path))
 .sort((a,b)=>b.count-a.count||a.path.localeCompare(b.path));
 console.log('SUMMARY '+JSON.stringify({originalHostMentions:direct.length,distinctOriginalHostPaths:unique.size,distinctNewDirectPaths:novel.length,nearbyRequestEvidence:indirect.length}));
 for(const x of novel.slice(0,75))console.log('NONSTANDARD_DIRECT '+JSON.stringify(x));
 for(const x of indirect.slice(0,100))console.log('POSSIBLE_NEARBY '+JSON.stringify(x));
 for(const x of hostLines.slice(0,110))console.log('EXACT_HOST_WITNESS '+JSON.stringify(x));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
