'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900']
];
const squares=[
 [[434,1311,312,278,966],[204,812,934,280,1071],[626,620,809,620,626],[1071,280,934,812,204],[966,278,312,1311,434]],
 [[7,375,236,190,27,17,181],[351,223,14,47,293,98,7],[456,232,121,114,72,23,15],[16,65,270,331,270,65,16],[15,23,72,114,121,232,456],[7,98,293,47,14,223,351],[181,17,27,190,236,375,7]],
 [[272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],[18,320,130,199,366],[151,131,341,138,272]]
];
for(const [i,m] of squares.entries()){
 const target=i===0?3301:1033,n=m.length,sum=a=>a.reduce((s,x)=>s+x,0);
 for(let j=0;j<n;j++){assert.equal(sum(m[j]),target);assert.equal(sum(m.map(r=>r[j])),target)}
 assert.equal(sum(m.map((r,j)=>r[j])),target);assert.equal(sum(m.map((r,j)=>r[n-1-j])),target);
}
const body=/^2014 (Jan|Feb|Mar|Apr|May) (\d\d) (\d\d:\d\d)\s+<([^>]+)>\s*(.*)$/;
const date=(m)=>({Jan:1,Feb:2,Mar:3,Apr:4,May:5}[m[1]]*100+Number(m[2]));
const rowPatterns=squares.flatMap((sq,si)=>sq.map((row,ri)=>({si,ri,pattern:new RegExp('(?:^|[^0-9])'+row.join('[^0-9]+')+'(?:$|[^0-9])')})));
const field=/\b(?:53301|71033|51033)(?:\s*[:=]|%3[dD]|%3[aA])|\b(?:POST|curl|wget)\b.{0,160}(?:cgi.bin.squares|53301|71033|51033)|\b(?:cgi.bin.squares|53301|71033|51033)\b.{0,160}(?:POST|curl|wget)/i;
const accept=/(?:\b(?:i|we|ive|i've|we've)\b.{0,80}\b(?:submit(?:ted)?|post(?:ed)?|sent|entered|pasted|used|filled|accepted|worked|got)\b.{0,100}\b(?:squares?|107\.jpg|167\.jpg|229\.jpg|thank you|submission|onion6|three (?:new )?(?:pages|images))\b)|(?:\b(?:squares?|107\.jpg|167\.jpg|229\.jpg|thank you|submission)\b.{0,80}\b(?:i|we|ive|i've|we've)\b.{0,60}\b(?:submit(?:ted)?|post(?:ed)?|sent|entered|pasted|used|filled|accepted|worked|got)\b)/i;
const reply=/thank you for you[r]? submission|got (?:the |all )?three (?:new )?(?:rune)?\s*(?:pages|images|jpgs)|107\.jpg.{0,100}167\.jpg/i;
function redact(s){return s.replace(/\b[a-z2-7]{16}\.onion(?:\/[^\s]*)?/gi,'[onion]').replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,'[email]').replace(/[\x00-\x1f]/g,' ').slice(0,850)}
async function main(){
 for(const [name,size,sha] of source){
  const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name);
  const res=await fetch(url);assert.equal(res.status,200);const bytes=Buffer.from(await res.arrayBuffer());assert.equal(bytes.length,size);assert.equal(crypto.createHash('sha1').update('blob '+size+'\0').update(bytes).digest('hex'),sha);
  const lines=bytes.toString('latin1').split(/\r?\n/),hits=[],witnesses=[],posts=[],replies=[],bySpeaker=new Map();let dated=0;
  for(let i=0;i<lines.length;i++){
   const m=lines[i].match(body);if(!m||date(m)<125||date(m)>505)continue;
   dated++;const raw=m[5],rows=rowPatterns.filter(r=>r.pattern.test(raw)).map(r=>[r.si,r.ri]);
   const item={line:i+1,day:date(m),speaker:m[4],raw:redact(raw)};
   if(rows.length){hits.push({...item,rows});if(!bySpeaker.has(m[4]))bySpeaker.set(m[4],[]);bySpeaker.get(m[4]).push({...item,rows});}
   if(field.test(raw))posts.push(item);
   if(accept.test(raw))witnesses.push(item);
   if(reply.test(raw))replies.push(item);
  }
  console.log(JSON.stringify({name,sha,size,dated,rowHits:hits.length,fieldHits:posts.length,firstPersonHits:witnesses.length,replyHits:replies.length}));
  for(const h of hits)console.log('ROW '+JSON.stringify(h));
  for(const h of posts)console.log('FIELD '+JSON.stringify(h));
  for(const h of witnesses)console.log('CLAIM '+JSON.stringify(h));
  for(const h of replies)console.log('REPLY '+JSON.stringify(h));
  for(const h of [...witnesses,...replies]){const row=bySpeaker.get(h.speaker)||[];const nearby=row.filter(x=>Math.abs(x.line-h.line)<=1500);if(nearby.length)console.log('LINK '+JSON.stringify({claim:h,rows:nearby}));}
 }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
