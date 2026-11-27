'use strict';
// Exact historical mask selector: inspect source log and existing historical corpus for fixed bytes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const mask='8c12a10087bd6a798609216c13c8fdcf6773ea0d',key=Buffer.from(mask,'hex');
const orig=[
 ['#cicadasolvers.freenode.log','bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#cicadasolvers.freenode.2.log','72634a9d071d32af767edbffc0493d810e88cd0d'],
 ['#33012014.freenode.log','a2880b1db31ce523599ef30ca2e55291bf295900']];
async function main(){
 const logHits=[],conversations=[],repoHits=[];
 for(const [name,sha] of orig){
  const r=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));if(!r.ok)throw Error(r.status);
  const b=Buffer.from(await r.arrayBuffer());if(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')!==sha)throw Error('source changed');
  const lines=b.toString('latin1').split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
   const l=lines[i],s=l.toLowerCase();
   if(s.includes(mask)||s.includes(key.toString('base64').toLowerCase()))logHits.push({name,line:i+1,text:l});
   if(/^2014 (?:May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) /.test(l)&&/crashdemons>/i.test(l)&&/\b(?:xor|sha.?1|hash|scan|hex)\b/i.test(l))conversations.push({name,line:i+1,text:l});
  }
 }
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){let f=path.join(dir,e.name);if(e.isDirectory()){walk(f);continue;}if(fs.statSync(f).size>20000000)continue;const b=fs.readFileSync(f);const offsets=[b.indexOf(key),b.toString('latin1').toLowerCase().indexOf(mask),b.toString('latin1').indexOf(key.toString('base64'))];if(offsets.some(x=>x>=0))repoHits.push({f,offsets});}}
 walk('resources');
 const out={mask,logHits,repoHits,conversations};console.log('KEY SEARCH '+JSON.stringify({mask,logHits,repoHits,count:conversations.length}));
 for(const x of conversations.filter(x=>x.name.includes('.2.')&&x.line>=25500&&x.line<=26300))console.log('NEAR '+JSON.stringify(x));
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(out));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
