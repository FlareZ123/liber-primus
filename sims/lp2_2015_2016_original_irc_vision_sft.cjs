'use strict';

/**
 * First-hand 2015–2016 #cicadasolvers dialogue search for p0–p55 plaintext.
 * Original immutable Git objects; a search hit is not a decipherment.
 * Reproduction: Windows/Node.js 22, pure CommonJS and built-in fetch.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const sources=[
  {name:'#cicadasolvers.freenode.log',bytes:18487233,sha:'bdd277c14f94c34b5ae714cd00c238065beeed4e'},
  {name:'#cicadasolvers.freenode.2.log',bytes:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'}
];
const linePattern=/^(201[56]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d\d) (\d\d):(\d\d) <([^>]+)> (.*)$/;
const explicitPage=/\b(?:page|pg|pic(?:ture)?|p)\s*[#:\-.\s]?\s*(0?\d|[1-4]\d|5[0-5])\b/ig;
const hitWords=/\b(?:solved?|decod(?:ed|ing|e)|decrypt(?:ed|ion|ing)?|decipher(?:ed|ing)?|translat(?:ed|ion|ing)?|crack(?:ed|ing)?|plaintext|cleartext|found\s+(?:the\s+)?key|key\s+(?:is|found)|it\s+(?:says|reads)|reads\s+(?:as|like)|we\s+(?:got|have|found)|first\s+word|last\s+word|revealed|worked\s+on)\b/i;
const proof=/\b(?:equation|formula|inverse|shift|vigenere|prime|fibonacci|modulo|mapping|unrune|decoder|code|script|source|link|paste|github|cipher|key|runes)\b/i;
const quote=/(?:[A-Z][A-Z '.,;:!?-]{19,}|(?:\b[A-Z]{2,}[-\/ ]){7,}[A-Z]{2,})/;
const context=/\b(?:liber(?:\s+primus)?|LP2|runes|cicada|cipher|crypt|decrypt|solve|book)\b/i;
const error=/\b(?:jok(?:e|ing)?|lol|guess(?:ing)?|maybe|might|could|fake|sorry|can't|cannot|unable|didn't|doesn't|false|no\s+(?:solution|luck|key))\b/i;

/** @param {Buffer} data */
function blobSha(data){return crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');}
/** @param {string} message */
function pageNumbers(message){
  return [...new Set([...message.matchAll(explicitPage)].map(m=>Number(m[1])).filter(n=>n<=55))];
}
/** @param {string} line @param {number} n @param {string} filename */
function parse(line,n,filename) {
  const m=line.match(linePattern);
  if(!m)return null;
  return {year:+m[1],date:line.slice(0,11),clock:m[4]+':'+m[5],nick:m[6],
    body:m[7],line:n,source:filename,pages:pageNumbers(m[7])};
}
/** @param {ReturnType<typeof parse>[]} rows */
function mine(rows){
  const hits=[];
  for(let i=0;i<rows.length;i++){
    const r=rows[i];
    const c=hitWords.test(r.body),p=proof.test(r.body),q=quote.test(r.body);
    if(!c&&!q)continue;
    let anchor=null;
    for(let j=i;j>=Math.max(0,i-90);j--){
      const t=rows[j];
      if(t.date!==r.date)break;
      if(t.pages.length && (!/\b(?:p56|page\s*56|p57|page\s*57)\b/i.test(t.body)) &&
        (context.test(t.body)||t===r)){anchor={r:t,d:i-j};break;}
    }
    if(!anchor)continue;
    let score=(c?9:0)+(q?6:0)+(p?4:0)
      +(r.pages.length?8:0)+(anchor.d<7?8:anchor.d<=25?3:0)
      -(error.test(r.body)?7:0);
    hits.push({year:r.year,date:r.date+' '+r.clock,nick:r.nick,
      page:anchor.r.pages,locationLine:anchor.r.line,
      line:r.line,source:r.source,score,body:r.body.slice(0,650),row:i});
  }
  const selected=[];
  for(const h of hits.sort((a,b)=>b.score-a.score||a.line-b.line)){
    if(selected.some(t=>t.source===h.source&&Math.abs(t.line-h.line)<=16))continue;
    selected.push(h);
  }
  return {hits,selected};
}
function selftest(){
  assert.equal(blobSha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
  assert.deepEqual(pageNumbers('page 7 p55 page 56'),'7,55'.split(',').map(Number));
  const rows=[
    '2015 Feb 19 01:55 <x> the runes on page 42',
    '2015 Feb 19 01:56 <y> Decoded this: "THE COMPLETE SOURCE IS HERE"',
    '2015 Feb 20 01:57 <y> decoded another thing'
  ].map((t,i)=>parse(t,i+1,'synthetic')).filter(Boolean);
  const result=mine(rows);
  assert(result.hits.some(h=>h.line===2&&h.page.includes(42)));
  assert(!result.hits.some(h=>h.line===3));
  console.log('SELFTEST PASS exact Git SHA, page 0..55 bounds, same-day carry and negative control');
}
async function main(){
  selftest();
  const all=[];
  for(const source of sources){
    const url='https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(source.name);
    const res=await fetch(url);
    assert.equal(res.status,200);
    const data=Buffer.from(await res.arrayBuffer());
    assert.equal(data.length,source.bytes);
    assert.equal(blobSha(data),source.sha);
    const rows=data.toString('latin1').split(/\r?\n/u)
      .map((line,i)=>parse(line,i+1,source.name)).filter(Boolean);
    const mined=mine(rows);
    console.log('ORIGINAL '+source.name+' sha='+source.sha+
      ' 2015='+rows.filter(r=>r.year===2015).length+
      ' 2016='+rows.filter(r=>r.year===2016).length+
      ' candidateMessages='+mined.hits.length+
      ' distinctDialogueClusters='+mined.selected.length);
    all.push({source:source.name,rows,selected:mined.selected});
  }
  const ranked=all.flatMap(x=>x.selected)
    .sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date));
  console.log('TOTAL RANKED DISTINCT 2015/16 LP2 UNKNOWN-PAGE CLUSTERS '+ranked.length);
  for(let i=0;i<Math.min(100,ranked.length);i++){
    const h=ranked[i];
    console.log('HIT '+(i+1)+' '+JSON.stringify({...h,row:undefined}));
    if(i>=25)continue;
    const src=all.find(x=>x.source===h.source);
    for(let j=Math.max(0,h.row-6);j<Math.min(src.rows.length,h.row+9);j++){
      const r=src.rows[j];
      if(r.date!==src.rows[h.row].date)continue;
      console.log('  L'+r.line+' '+r.date+' '+r.clock+' <'+r.nick+'> '+r.body.slice(0,430));
    }
  }
  const anchors=[82289,84447,89874,102799,256472,271355,294013,340195,340853];
  const record=all.find(x=>x.source==='#cicadasolvers.freenode.2.log');
  for(const line of anchors){
    const i=record.rows.findIndex(r=>r.line===line);
    assert(i>=0,'missing dated original-line focus '+line);
    const center=record.rows[i];
    console.log('FOCUS '+line+' '+center.date+' '+center.clock);
    for(let j=Math.max(0,i-15);j<Math.min(record.rows.length,i+21);j++){
      const r=record.rows[j];
      if(r.date!==center.date)continue;
      console.log('  L'+r.line+' '+r.date+' '+r.clock+' <'+r.nick+'> '+r.body.slice(0,650));
    }
  }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
