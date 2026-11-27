'use strict';
// Agent8 #3106: exact 2014 missing-19 and mayfly key-agreement source context.
// Only archived public text; no onion, service or participant interaction.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const origin='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/%23cicadasolvers.freenode.log';
const ranges=[[169245,169280],[172856,172875],[175235,175256],[176580,176625],[176650,176725],[177015,177045],[180875,180889],[183222,183230],[216940,216951]];
const pasteIds=['0wmWfct8','rKBY198Y'];
async function main(){
 const r=await fetch(origin);assert.equal(r.status,200);
 const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,18487233);
 assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'bdd277c14f94c34b5ae714cd00c238065beeed4e');
 const lines=b.toString('latin1').split(/\r?\n/);
 const contexts=ranges.map(([a,z])=>({a,z,messages:lines.slice(a-1,z).map((body,i)=>({line:a+i,body})).filter(x=>/^2014 [A-Za-z]{3} \d\d \d\d:\d\d\s+<[^>]+>/.test(x.body))}));
 const pastes=[];
 for(const id of pasteIds){
  try{
   const resp=await fetch('https://pastebin.com/raw/'+id,{signal:AbortSignal.timeout(20000)});
   const buf=Buffer.from(await resp.arrayBuffer());
   const record={id,status:resp.status,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')};
   if(resp.ok&&buf.length<250000)record.base64=buf.toString('base64');
   pastes.push(record);console.log('PASTE '+JSON.stringify({...record,base64:undefined}));
  }catch(e){pastes.push({id,error:String(e)});console.log('PASTE ERROR '+id+' '+e)}
 }
 fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify({contexts,pastes},null,2));
 for(const x of contexts){console.log('CONTEXT '+x.a+'-'+x.z);for(const m of x.messages.filter(y=>/mayfl|ephemeral|diffie|missing|prime|whitespace|space|pastebin/i.test(y.body)))console.log(m.line+' '+m.body.slice(0,350))}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
