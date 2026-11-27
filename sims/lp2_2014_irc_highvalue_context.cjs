'use strict';
const crypto=require('node:crypto'), fs=require('node:fs'), path=require('node:path');
const origins=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const ids=['TJBzPtKr','Wrqq9JLr','enVZ5uxL','YjaAmfjn','wSpPq5Aa','Hjmq1HCfpg','CO4O','iQUB','YJdG','Yg2u7HNw','7AvbevYe','CCZP1WkY'];
const sha1=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
async function main(){
 const out=[];
 for(const [name,size,sha] of origins){
  const res=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));
  const b=Buffer.from(await res.arrayBuffer());
  if(b.length!==size||sha1(b)!==sha) throw new Error('source mismatch '+name);
  const lines=b.toString('latin1').split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
   for(const id of ids) if(lines[i].includes(id)){
    out.push({id,file:name,line:i+1,context:lines.slice(Math.max(0,i-12),Math.min(lines.length,i+13)).map((text,j)=>({line:Math.max(0,i-12)+j+1,text}))});
   }
  }
 }
 console.log('CONTEXT '+JSON.stringify(out));
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify({hits:out}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});