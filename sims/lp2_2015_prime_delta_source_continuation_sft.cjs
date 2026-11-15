'use strict';

/**
 * Exact, bounded February 2015 original IRC continuation search for #979.
 * Identifies the source-witnessed prime/difference proposal, its attributed
 * earlier discoverer, subsequent typed operations, and outbound code links.
 * Source bytes are checked before selecting historical evidence.
 * Node.js 22 CommonJS, Windows-compatible.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const source = {
  name: '#cicadasolvers.freenode.2.log',
  bytes: 27234234,
  sha: '72634a9d071d32af767edbffc0493d810e88cd0d'
};
const relevant = /\b(?:prime(?:s)?|fibonacci|totient|diff(?:erence|erencing)?|double(?:t)?s?|dup(?:licate)?s?|shifts?|key|decrypt|decoded?|plaintext|cipher|mod29|runic|runes?|code|script|program|paste|git(?:hub)?|source)\b/i;
const focus = /(?:prime.{0,35}(?:diff|dup|shift|sequenc)|diff.{0,35}(?:prime|dup)|(?:40|forty).{0,20}(?:dup|rune)|ether8unny.{0,40}(?:found|prime))/i;
const urlPattern = /(?:https?|ftp):\/\/[^\s<>"']+/gi;
const datePrefix = /^2015 (?:Jan|Feb|Mar) \d\d /;
const parse = (line, i) => {
  const m = line.match(/^2015 (\w{3}) (\d\d) (\d\d:\d\d) <([^>]+)> (.*)$/);
  return m ? {n:i+1, date:'2015 '+m[1]+' '+m[2],time:m[3],nick:m[4],body:m[5]} : null;
};
const word = x => x.date+' '+x.time+' L'+x.n+' <'+x.nick+'> '+x.body;
function summarize(label, arr, limit) {
  console.log('\n## '+label+' count='+arr.length);
  for (const x of arr.slice(0,limit)) console.log(word(x).slice(0,850));
  if(arr.length>limit) console.log('REMAINING '+(arr.length-limit));
}
async function main(){
  const response=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(source.name));
  assert.equal(response.status,200);
  const buf=Buffer.from(await response.arrayBuffer());
  assert.equal(buf.length,source.bytes);
  assert.equal(crypto.createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex'),source.sha);
  const raw=buf.toString('latin1').split(/\r?\n/);
  assert(raw[89873].includes('wetsand')&&raw[89873].includes('prime shift'));
  assert(raw[89900].includes('wetsand')&&raw[89900].includes('40 dups'));
  const rows=raw.map(parse).filter(Boolean);
  const dates=rows.filter(x=>x.date>='2015 Feb 01'&&x.date<='2015 Feb 16');
  const authors=dates.filter(x=>/^(?:wetsand|ether8unny)$/i.test(x.nick));
  const focused=dates.filter(x=>focus.test(x.body));
  const authorOps=authors.filter(x=>relevant.test(x.body));
  const local=rows.filter(x=>x.n>=89850&&x.n<=90030);
  summarize('All direct participants in original local Feb4 exchange, 89850-90030 (exclude bot/chat noise)',local.filter(x=>/^(?:wetsand|ether8unny|dude12312414|sir_phobos|crashdemons)$/i.test(x.nick)),130);
  summarize('Two-week source-wide prime+difference semantic conjunction',focused,110);
  summarize('Source-speaker technical and linked remarks Feb1-16',authorOps,180);
  const urls=[];
  for(const row of dates) {
    const matches=row.body.match(urlPattern)||[];
    const context=focused.some(f=>Math.abs(f.n-row.n)<=75);
    if(!matches.length||(!context&&!/^(?:wetsand|ether8unny)$/i.test(row.nick)))continue;
    for(let url of matches)urls.push({...row,url:url.replace(/[.,;!?]+$/g,'')});
  }
  summarize('Outward links from source speakers OR within 75 raw lines of relevant prime/delta conversation',urls,150);
  console.log('\n## Exact raw unsanitized context for 2015 Feb5 code-paste claim');
  for(const at of [90113,90114,90115,90123,90124,90135,90136,90137,90138,90139,90140]) {
    console.log('RAW L'+at+' '+JSON.stringify(raw[at-1]).slice(0,1200));
  }
  // Freeze original whole-conversation neighborhoods for the historical
  // author's own result, its February 5 continuation, and later method fork.
  for (const [anchor,before,after] of [
    [88095,22,15], [89526,28,60], [90119,32,32], [93044,20,26], [93740,14,22]
  ]) {
    const neighboring=rows.filter(x=>x.n>=anchor-before&&x.n<=anchor+after);
    summarize('Full contemporaneous conversation at original L'+anchor,
      neighboring.filter(x=>!/(?:Bot$|Bot\d$)/i.test(x.nick)),110);
  }
  const allMonths=rows.filter(x=>x.date>='2015 Jan 01'&&x.date<='2015 Mar 31');
  const later=allMonths.filter(x=>focus.test(x.body)&&!dates.includes(x));
  summarize('Same concrete mechanism elsewhere Jan-Mar 2015',later,100);
  console.log('\nTOTAL '+JSON.stringify({sourceBytes:source.bytes,originalGitBlobSha:source.sha,
    originalLines:raw.length,sourceDatedLines:rows.length,twoWeekLines:dates.length,
    sameSpeakerMessages:authors.length,sameSpeakerRelevant:authorOps.length,
    preciseMechanismMentions:focused.length,nearbyOutgoingLinks:urls.length,
    elsewhereMechanismMentions:later.length}));
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1});
