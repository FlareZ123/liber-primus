'use strict';
// Agent8 #3106: recover previously unindexed historical source references.
// Read-only, pinned IRC inputs; excludes live URL retrieval.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const origins=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']];
const known=/p(?:age\s*)?56\b|an end\b|36367763|p(?:age\s*)?54\b|xeeQb7Yj|s8jxbq2y|hJPaQR4k|8c12a10087bd6a798609216c13c8fdcf6773ea0d|vFCy7T5p0O|hJ8pVQ5S43/i;
const relevant=/\b(?:liber primus|runes?|runic|cipher|gematria|outguess|cuneiform|illustration|page\s*\d{1,2}|p\d{1,2}|spiral|sexagesimal|base.?60)\b/i;
const source=/\b(?:found|source|original|taken from|comes from|based on|same as|matches?|recogniz\w*|identif\w*|diagram|reference|quote|book|paper|author|illustrat\w*|file|upload|download|artifact|attachment|transcription|script|code|algorithm|formula|sequence|key)\b/i;
const urlre=/https?:\/\/[^\s<>"']+/gi;
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)])}
const corpus=walk('resources').concat(walk('im-results')).filter(f=>/\.(md|txt|json|csv)$/i.test(f)&&fs.statSync(f).size<2000000).map(f=>fs.readFileSync(f,'utf8')).join('\n');
const norm=s=>s.replace(/[),.;!?]+$/,'').replace(/^http:/i,'https:').replace(/\/$/,'');
const present=new Set([...corpus.matchAll(urlre)].map(m=>norm(m[0]).toLowerCase()));
const candidates=new Map();
async function main(){
 for(const [name,bytes,sha] of origins){
  const r=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));
  assert.equal(r.status,200);const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,bytes);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),sha);
  const lines=b.toString('latin1').split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
   if(!/^2014 (?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d\d \d\d:\d\d\s+<[^>]+>/.test(lines[i]))continue;
   const urls=[...lines[i].matchAll(urlre)].map(m=>norm(m[0]));
   if(!urls.length)continue;
   const context=lines.slice(Math.max(0,i-3),i+4);
   const joined=context.join('\n');
   if(!relevant.test(joined)||!source.test(joined))continue;
   for(const url of urls){
    if(known.test(url)||present.has(url.toLowerCase()))continue;
    const key=url.toLowerCase();
    const score=4*Number(relevant.test(lines[i]))+3*Number(source.test(lines[i]))+5*Number(/\b(?:found|source|original|taken from|comes from|same as|matches?|identif\w*)\b/i.test(lines[i]))+3*Number(/\b(?:page\s*\d{1,2}|p\d{1,2})\b/i.test(joined))-5*Number(known.test(joined));
    const row={file:name,line:i+1,url,score,context};
    if(!candidates.has(key)||candidates.get(key).score<score)candidates.set(key,row);
   }
  }
 }
 const rows=[...candidates.values()].sort((a,b)=>b.score-a.score||a.line-b.line);
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify({scope:'URL-context triage; exact normalized URL absence in local resource/report text is not proof of novelty',knownUrlCount:present.size,count:rows.length,rows},null,2));
 console.log('CANDIDATES '+rows.length+' KNOWN_URLS '+present.size);
 for(const row of rows.slice(0,24))console.log(JSON.stringify(row));
 console.log('END CANDIDATES');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
