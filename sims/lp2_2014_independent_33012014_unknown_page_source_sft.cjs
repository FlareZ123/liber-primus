'use strict';
/**
 * Independent original #33012014 channel LP2 May-Aug 2014
 * frozen original bytes, source-dated claims and linked programs.
 * No main channel excerpts, no plaintext invention.
 * Node.js 22 CommonJS. Full source blob SHA checked before content.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const name='#33012014.freenode.log',size=8629610;
const sha='a2880b1db31ce523599ef30ca2e55291bf295900';
const parse=(line,i)=>{
 const m=line.match(/^2014 ([A-Z][a-z]{2}) (\d\d) (\d\d:\d\d) <([^>]+)> (.*)$/);
 if(!m)return null;
 const months={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9};
 return {n:i+1,month:months[m[1]],day:+m[2],when:'2014 '+m[1]+' '+m[2]+' '+m[3],nick:m[4],msg:m[5]};
};
const important=/\b(?:liber(?:\s+primus)?|LP2|runic|runes?|gematria|decrypt(?:ed|ion)?|deci(?:pher|pher(?:ed)?)|cipher|page(?:s)?\s*\d{1,2}|page(?:s)?\s*(?:fifty|thirty)|prime(?:s)?|totient|plaintext|cleartext|solv(?:ed|e|ing)|keys?|hash|gpg|pgp|github|source(?:code)?|python|perl|pastebin|gist|titanpad|script|program|download|file|tool|code)\b/i;
const selective=/\b(?:liber(?:\s+primus)?|LP2|runic|runes?|gematria|decrypt(?:ed|ion)?|decipher|cipher|page(?:s)?\s*\d{1,2}|prime(?:s)?|totient|plaintext|cleartext|solv(?:ed|e|ing)|key(?:s)?|hash)\b/i;
const keyClaims=/\b(?:i|we|they|one|someone|it).{0,80}(?:solved|decoded|decrypted|deciphered|cracked|found|read|discovered)|(?:solved|decoded|decrypted|deciphered|cracked|found|read|discovered).{0,100}(?:page|key|rune|cipher|liber|plaintext)/i;
const toolLinks=/(?:https?|ftp):\/\/[^\s<>"']+/gi;
const explicit=/\b(?:p(?:age)?\s*0?[0-9]|p(?:age)?\s*[1-5][0-9])\b/i;
const str=x=>x.when+' L'+x.n+' <'+x.nick+'> '+x.msg;
async function main(){
 const response=await fetch('https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/'+encodeURIComponent(name));
 assert.equal(response.status,200);
 const bytes=Buffer.from(await response.arrayBuffer());
 assert.equal(bytes.length,size);
 assert.equal(crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),sha);
 const lines=bytes.toString('latin1').split(/\r?\n/);
 const rawDateLines=lines.map((line,i)=>({n:i+1,line})).filter(x=>
   /^2014 (May|Jun|Jul|Aug) [0-9]{2} /.test(x.line));
 const nonSpeaker=rawDateLines.filter(x=>!/^2014 (?:May|Jun|Jul|Aug) [0-9]{2} [0-9]{2}:[0-9]{2} <[^>]+> /.test(x.line));
 const nonSpeakerHigh=nonSpeaker.filter(x=>/(?:liber|primus|gematria|rune|decryp|deciph|plaintext|key|hash|p[0-5][0-9]|page.{0,7}[0-9]|http|pastebin|github|gist)/i.test(x.line));
 console.log('ORIGINAL RAW MayAug DATE ROWS '+rawDateLines.length+
   ' non-speaker rows '+nonSpeaker.length+' content-bearing non-speaker candidate '+nonSpeakerHigh.length);
 for(const x of nonSpeakerHigh.slice(0,75))console.log('METADATA L'+x.n+' '+x.line.slice(0,600));
 const all=lines.map(parse).filter(x=>x&&x.month>=5&&x.month<=8);
 const candidates=all.filter(x=>important.test(x.msg));
 const focused=candidates.filter(x=>selective.test(x.msg));
 const withPage=focused.filter(x=>explicit.test(x.msg));
 const strong=focused.filter(x=>keyClaims.test(x.msg));
 const urls=all.flatMap(x=>{
   const found=x.msg.match(toolLinks)||[];
   return found.map(url=>({...x,url:url.replace(/[.,;!?]+$/g,'')}))
 }).filter(x=>/\.(?:txt|zip|py|js|cjs|pl|pdf)(?:\b|[?#]|$)|pastebin|gist|github|gitlab|titanpad|etherpad|hackpad|dropbox|mega|infotomb|codepad|sprunge|google\.com\/drive/i.test(x.url)||selective.test(x.msg));
 console.log('SOURCE '+name+' '+size+' originalSHA '+sha+' lines '+lines.length+' MayAug original dated '+all.length+
  ' broad mentions '+candidates.length+' cipher-specific '+focused.length+' explicit-page '+withPage.length+
  ' first-person claim '+strong.length+' referenced URLs '+urls.length);
 const unique=(arr,limit)=>{
   const seen=new Set(), out=[];
   for(const x of arr) {
      const norm=x.msg.replace(/https?:\/\//g,'').replace(/\s+/g,' ').trim().toLowerCase();
      if(seen.has(norm))continue;
      seen.add(norm);out.push(x);
   }
   console.log('TOTAL Unique '+out.length);
   for(const x of out.slice(0,limit))console.log(str(x).slice(0,870));
 };
 console.log('\nALL FIRST-PERSON/EXPLICIT UNKNOWN PAGE CLAIMS');
 unique([...new Map([...strong,...withPage].sort((a,b)=>a.n-b.n).map(x=>[x.n,x])).values()],350);
 console.log('\nALL CIPHER/LIBER SPECIFIC DATED STATEMENTS');
 unique(focused,350);
 console.log('\nALL SOURCE LINKS WITH ORIGINAL 2014 DATE');
 unique(urls,170);
 console.log('\nLATE MAY-AUG SOURCE NICK STATS');
 const authors=[...new Map(all.map(x=>[x.nick,(all.filter(y=>y.nick===x.nick)).length])).entries()]
    .sort((a,b)=>b[1]-a[1]).slice(0,15);
 console.log(JSON.stringify({authors,mayAugByMonth:[5,6,7,8].map(month=>({month,n:all.filter(x=>x.month===month).length}))}));
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1});
