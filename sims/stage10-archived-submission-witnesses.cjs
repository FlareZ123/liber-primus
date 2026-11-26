'use strict';
/** Stage10 actual submitted-value/response witnesses outside prior Feb5–16 IRC audit.
 * Only archived public Git files. No live endpoint or participant contact.
 */
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
const sources=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const date=s=>{const m=s.match(/^2014 ([A-Z][a-z]{2}) (\d\d) (\d\d:\d\d)/);if(!m)return 0;return (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(m[1])+1)*100+Number(m[2])};
const topic=/(?:magic\s*square|\bsquares?\b|cgi.bin.squares|53301|71033|51033|onion\s*(?:6|six)|ut3qtzbrvs7dtvzp)/i;
const accept=/(?:submi\w*|paste\w*|\bpost(?:ed|ing)?\b|\benter(?:ed|ing)?\b|accept\w*|reject\w*|validat\w*|\b(?:invalid|wrong|bad|empty|blank|random|arbitrary|fail(?:ed|ure)?|error|success|thank|worked|works|result|reply|respond\w*|response|received)\b)/i;
const first=/(?:\b(?:i|we)\s+(?:have\s+|just\s+|had\s+)?(?:submi\w*|paste\w*|posted|entered|sent|got|received|tried|tested|put|used)|\b(?:i|we)\s+(?:get|see|saw|could|can|did)\b|thank you for you[r]? submission)/i;
const num=/(?:\b\d{1,4}[\s,;]+){4}\d{1,4}\b/;
const clean=s=>s.replace(/[\x00-\x1f]/g,' ').replace(/\b(?!ut3qtzbrvs7dtvzp|ky2khlqdf7qdznac)[a-z2-7]{16}\.onion\b/gi,'[participant/other onion redacted]').slice(0,1000);
async function run(){let result=[];for(const [name,bytes,sha] of sources){let b=Buffer.from(await (await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name))).arrayBuffer());assert.equal(b.length,bytes);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),sha);let lines=b.toString('latin1').split(/\r?\n/);let dates=lines.map(date),hits=[],all=0;for(let i=0;i<lines.length;i++){let d=dates[i];if(!d||d<125||(d>=205&&d<=216))continue;all++;let l=lines[i];if(!topic.test(l)||!accept.test(l))continue;let context=[];for(let j=Math.max(0,i-3);j<=Math.min(lines.length-1,i+3);j++)if(dates[j]===d)context.push({line:j+1,text:clean(lines[j])});let score=Number(first.test(l))*4+Number(num.test(l))*5+Number(/\b(?:empty|blank|wrong|invalid|random|arbitrary|reject\w*|thank|failure|error|accepted)\b/i.test(l))*3+Number(/cgi.bin.squares|53301|71033|51033/.test(l))*3;hits.push({line:i+1,day:d,score,text:clean(l),context})}
let high=hits.filter(x=>x.score>=4).sort((a,b)=>b.score-a.score||a.line-b.line);result.push({name,sha,eligibleLines:all,matched:hits.length,high:high.length,hits});console.log(JSON.stringify({name,eligibleLines:all,matched:hits.length,high:high.length}));for(const h of high.slice(0,35))console.log(JSON.stringify({line:h.line,score:h.score,text:h.text}));}fs.writeFileSync('agent12-square-response-witnesses.json',JSON.stringify(result,null,2)+'\n');}
run().catch(e=>{console.error(e);process.exitCode=1});
