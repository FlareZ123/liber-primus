'use strict';
/**
 * Source-exact 2014 Feb6–13 Cicada Onion6 squares CGI behavioral-witness gate.
 * Query historically captured IRC for rejected/accepted square submission,
 * typed criterion and original POST/response/handler. No speculative requests
 * to dead onions or credential/form submissions.
 * Node.js 22 CommonJS and immutable original external Git blob.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const source=[
  ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
  ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const target=/\b(magic\s*square|squares?|submit|submission|cgi-bin|urlencoded|form|onion\s*address|entered|accepted|rejected|correct|incorrect|response|validation|validate|result|success|wrong|error|order\s*[57]|3301|1033|ut3qtzbrvs7dtvzp)\b/i;
const high=/\b(squares?|submitted|submission|cgi-bin|filled|form|rejected|accepted|correct\s*square|wrong\s*square|response|validation|validate|order\s*[57])\b/i;
const veryHigh=/\b(cgi-bin\/squares|wrong\s+square|any\s+(?:magic\s+)?square|accepted\s+any|invalid\s+square|submitted|submission|reject(?:ed|s|ing)?|validat(?:ed|ion|ing)?|(?:squares?|form).{0,50}(?:wrong|correct|check|accepted|rejected|script|error|result|response|handler)|(?:wrong|correct|check|accepted|rejected|script|error|result|response|handler).{0,50}(?:squares?|form))\b/i;
const day=str=>{
  const p=str.match(/^2014 ([A-Z][a-z]{2}) (\d\d) (\d\d:\d\d)/);
  if(!p) return null;
  const mo={Jan:1,Feb:2,Mar:3}[p[1]];
  return mo?mo*100+Number(p[2]):null;
};
const normalize=x=>x.replace(/[\x00-\x1f]/g,' ').slice(0,670);
async function one(info){
 const [name,bytes,sha]=info;
 const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name);
 const response=await fetch(url);
 assert.equal(response.status,200,url);
 const buffer=Buffer.from(await response.arrayBuffer());
 assert.equal(buffer.length,bytes);
 assert.equal(crypto.createHash('sha1').update('blob '+buffer.length+'\0').update(buffer).digest('hex'),sha);
 const lines=buffer.toString('latin1').split(/\r?\n/);
 const hits=[];
 const rawHits=[];
 let count=0;
 for(let i=0;i<lines.length;i++){
   const line=lines[i],dt=day(line);
   if(dt===null||dt<205||dt>216)continue;
   count++;
   if(target.test(line)){
     hits.push({n:i+1,dt,text:normalize(line)});
     if(high.test(line))rawHits.push({n:i+1,dt,text:normalize(line)});
   }
 }
 console.log('\nSOURCE '+name+' valid Git blob '+sha+' lines '+lines.length+
   ' Feb5-16 dated '+count+' term hits '+hits.length+' narrow '+rawHits.length);
 for(const e of rawHits.slice(0,190))console.log('HIT L'+e.n+' '+e.text);

 if(name==='#cicadasolvers.freenode.log'){
   console.log('## Actual Feb 10 live CGI index observation L114785–115005');
   for(let i=114785;i<=115005;i++) {
     const line=lines[i-1];
     if(/^2014 Feb 10 /.test(line))console.log('RAW L'+i+' '+normalize(line));
   }
   console.log('## Original dated submitted-squares behavioral claims');
   for(let i=0;i<lines.length;i++){
     const line=lines[i],dt=day(line);
     if(dt!==null && dt>=206 && dt<=216
       && /(wrong|bad|invalid|empty|random|any|arbitrary|different|submitted|submission|accepted|reject|even|unrelated|check|verify|script)/i.test(line)
        && /(squares?|cgi.bin.squares|thank you for you submission|submission|input validation)/i.test(line)) {
       console.log('BEHAV L'+(i+1)+' '+normalize(line));
     }
   }
 }
 console.log('NEAR HANDLER/REJECTION CRITERION '+rawHits.filter(x=>veryHigh.test(x.text)).length);
 for(const x of rawHits.filter(x=>veryHigh.test(x.text)).slice(0,90)){
   console.log('HIGH L'+x.n+' '+x.text);
   for(let k=Math.max(0,x.n-3);k<Math.min(lines.length,x.n+2);k++) {
      if(k===x.n-1)continue;
      console.log('CTX L'+(k+1)+' '+normalize(lines[k]));
   }
 }
 for(const x of hits.filter(x=>/(?:https?|ftp):\/\//i.test(x.text)&&/(square|submission|script|paste|form|cgi)/i.test(x.text)).slice(0,45))
   console.log('URL L'+x.n+' '+x.text);
}
async function main(){for(const x of source)await one(x)}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
