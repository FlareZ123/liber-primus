'use strict';
/** #2891: bounded May 2–4 public chat witness comparison. Node 22. */
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const sources=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const first=/\b(?:i|we|my|our)\b/i;
const receipt=/\b(?:received|got|receive|getting|uploaded|upload|posted|post|sent|message|reply|responded|response|visit(?:ed)?|hit)\b/i;
const context=/\b(?:onion|server|service|cicada|3301|pgp|gpg|key|squares?|random|numbers|identical|same|different|encrypt\w*|questionnaire|enlightenment)\b/i;
const selected=/\b(?:square|squares|random|determinant|same (?:message|upload)|identical|questionnaire|different (?:message|upload)|enlightenment)\b/i;
const redact=s=>s.replace(/[\x00-\x1f]/g,' ').replace(/\b[a-z2-7]{16}\.onion\b/gi,'[onion]').replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email]').slice(0,500);
function parse(l){const m=l.match(/^2014 May (0[234]) (\d\d:\d\d) <([^>]+)> (.*)$/);return m?{day:m[1],time:m[2],nick:m[3],body:m[4]}:null}
async function run(){
 for(const [name,size,sha] of sources){
  const r=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));assert(r.ok);
  const b=Buffer.from(await r.arrayBuffer());assert.equal(b.length,size);assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(b).digest('hex'),sha);
  const lines=b.toString('latin1').split(/\r?\n/);let selectedRows=[],firstRows=[],dated=0;
  const labels=new Map();const label=n=>{if(!labels.has(n))labels.set(n,'speaker'+(labels.size+1));return labels.get(n)};
  const fmt=(x,i)=>({line:i+1,day:x.day,time:x.time,speaker:label(x.nick),body:redact(x.body)});
  for(let i=0;i<lines.length;i++){const x=parse(lines[i]);if(!x)continue;dated++;
   if(selected.test(x.body)&&receipt.test(x.body))selectedRows.push(fmt(x,i));
   if(first.test(x.body)&&receipt.test(x.body)&&context.test(x.body))firstRows.push(fmt(x,i));
  }
  console.log(JSON.stringify({name,sha,dated,selectedRows,firstRows}));
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
