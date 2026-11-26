'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path'),assert=require('node:assert/strict');
const inputs=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e',[['xeeQb7Yj',184732],['s8jxbq2y',169387]]],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d',[['hJPaQR4k',26043]]]];
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(20000),headers:{'user-agent':'Mozilla/5.0'}});const b=Buffer.from(await r.arrayBuffer());return {url,status:r.status,final:r.url,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),b};}
async function main(){const out=[];for(const [name,size,sha,targets] of inputs){
 const {b}=await get('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));
 assert.equal(b.length,size);assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(b).digest('hex'),sha);
 const lines=b.toString('latin1').split(/\r?\n/);
 for(const [id,line] of targets){assert(lines[line-1].includes(id));const context=lines.slice(line-7,line+6).map((body,i)=>({line:line-6+i,body}));let raw;
 try{const {b,...meta}=await get('https://pastebin.com/raw/'+id);raw={...meta,text:b.toString('utf8'),base64:b.toString('base64')};}catch(e){raw={error:String(e)};}
 console.log(JSON.stringify({id,line,context,raw:raw.error?raw:{...raw,text:raw.text.slice(0,6000),base64:undefined}}));out.push({id,line,file:name,context,raw});
 }}fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(out));}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
