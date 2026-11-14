'use strict';
/**
 * Original-source 2014 IRC unknown-LP2-page plaintext witnesses.
 * Emits independent page-numbered decipherment claims with original line windows.
 * Run with Node22: node sims/lp2_2014_unsolved_page_witness_scan_sft.cjs
 * This is a claim locator; a decrypted page requires exact original-cipher replay.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const files=[
 ['#cicadasolvers.freenode.log',18487233,'bdd277c14f94c34b5ae714cd00c238065beeed4e'],
 ['#33012014.freenode.log',8629610,'a2880b1db31ce523599ef30ca2e55291bf295900'],
 ['#cicadasolvers.freenode.2.log',27234234,'72634a9d071d32af767edbffc0493d810e88cd0d']
];
const ref='ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const date=/^2014 (?:May|Jun|Jul|Aug) \d{2} \d{2}:\d{2} /;
const page=/(?:\b(?:page|pg|pic|picture)\s*[#:.\-]?\s*|\bp\s*#?)(?:0?\d|[1-4]\d|5[0-5])\b/ig;
const discovery=/\b(?:solv\w*|decrypt\w*|decipher\w*|crack\w*|plaintext|cleartext|readable|read\s+as|translat\w*|got\s+(?:the|a|it)|work(?:s|ed)?\s+(?:for|on)|key\s+(?:for|on|works|found)|means|says|text\s+(?:is|reads|says))\b/i;
const strong=/\b(?:solved|decrypted|deciphered|cracked|plaintext|cleartext|i\s+(?:got|found|think)|reads|says|gives|makes\s+sense|first\s+(?:word|line)|last\s+(?:word|line))\b/i;
const tablePage=/\\b(?:page|pg|pic|p)\\s*[#:.\\-]?\\s*(?:49|50|51)\\b/i;
const tableLanguage=/\\b(?:numeric|numerical|base[ -]?(?:29|60|59|64)|grid|matrix|table|32[\\s×x*]+8|256|hexadecimal|filetype|image|aes|rsa|numbers|digits|cells|character\\s+code)\\b/i;
const tableExplicit=/\\b(?:base[ -]?(?:29|60|59|64)|32[\\s×x*]+8|256\\s+(?:numbers|values|bytes)|number\\s+grid|numerical\\s+page|number\\s+table)\\b/i;
const textlike=/\b(?:the|and|that|there|within|find|hidden|seek|truth|end|beginning|pilgrim|key)\b/i;
function gitBlob(data) {return crypto.createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');}
function context(lines,i,r=3){return lines.slice(Math.max(0,i-r),i+r+1).map((s,j)=>'L'+(Math.max(0,i-r)+j+1)+' '+s.slice(0,420)).join('\n');}
assert(page.test('page 54 solved'));page.lastIndex=0;
assert(!page.test('page 56 solved'));page.lastIndex=0;
assert(discovery.test('page 54 decrypted'));
assert.equal(gitBlob(Buffer.from('hi')),'32f95c0d1244a78b2be1bab8de17906fabb2c4a8');
async function run() {
  for(const [name,size,sha] of files) {
    const url='https://raw.githubusercontent.com/neuroretransmit/cicada/'+ref+'/irc-logs/'+encodeURIComponent(name);
    const response=await fetch(url);assert.equal(response.status,200,url);
    const b=Buffer.from(await response.arrayBuffer());
    assert.equal(b.length,size,name+' bytes');assert.equal(gitBlob(b),sha,name+' pinned blob');
    const lines=b.toString('latin1').split(/\r?\n/);
    const strongMatches=[],allMatches=[],english=[],solvers=[],tablePageHits=[],tableExplicitHits=[],pageMentions=new Map();
    for(let i=0;i<lines.length;i++) {
      const s=lines[i];if(!date.test(s)||!/<[^>]+>/.test(s))continue;
      const matches=[...s.matchAll(page)];if(matches.length)for(const m of matches){
        const no=+m[0].match(/\d+/)[0];pageMentions.set(no,(pageMentions.get(no)||0)+1);
      }
      if((tablePage.test(s)&&tableLanguage.test(s)))tablePageHits.push(i);
      if(tableExplicit.test(s))tableExplicitHits.push(i);
      if(matches.length&&discovery.test(s))allMatches.push(i);
      if(matches.length&&strong.test(s))strongMatches.push(i);
      if(matches.length&&textlike.test(s)&&strong.test(s))english.push(i);
      if(/<(?:cluosh|mdzhb|Nem0|nikkler|Ammar__)>/i.test(s)&&/(?:decryp|decipher|key|plaintext|plain.?text|solv|prime|totient)/i.test(s)&&matches.length)solvers.push(i);
    }
    console.log('TABLE PRIMARY '+tablePageHits.length+' '+tableExplicitHits.length);
    for(const [label,hits] of [['TABLE_P49-51',tablePageHits],['TABLE_EXPLICIT',tableExplicitHits]]) {
      console.log('CATEGORY '+label+' '+hits.length);
      for(const i of hits.slice(0,150))console.log('L'+(i+1)+' '+lines[i].slice(0,500));
      for(const i of hits.slice(0,50))console.log('TABLE_WINDOW '+label+' L'+(i+1)+'\\n'+context(lines,i,2));
    }
    const format=hits=>hits.map(i=>('L'+(i+1)+' '+lines[i].slice(0,500))).slice(0,180);
    console.log('ARCHIVE '+name+' bytes='+size+' sha='+sha+' date-matched lines='+lines.filter(x=>date.test(x)).length);
    console.log('COUNTS explicit_other_page+discovery='+allMatches.length+', strong='+strongMatches.length+', strong_english='+english.length+', named_solver='+solvers.length);
    console.log('PAGES '+JSON.stringify([...pageMentions].sort((a,b)=>a[0]-b[0])));
    for(const [label,hits] of [['STRONG',strongMatches],['ENGLISH',english],['SOLVER',solvers]]){
      console.log('CATEGORY '+label+' '+hits.length);
      for(const s of format(hits))console.log(s);
    }
    const picks=[...new Set([...english,...strongMatches,...solvers])].sort((a,b)=>a-b).slice(0,160);
    console.log('CONTEXT WINDOWS '+name+' '+picks.length);
    for(const i of picks)console.log('WINDOW '+name+' L'+(i+1)+'\n'+context(lines,i,2));
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
