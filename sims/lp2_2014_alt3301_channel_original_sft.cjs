"use strict";
/**
 * Exact 2014 May-Aug alternate #33012014 IRC channel: source-selected
 * proposed unsolved LP2 operations/keys only. CJS Node22 read-only.
 * Independent of #cicadasolvers prose/inline scan tasks #888/#899.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
async function main(){
 const filename="#33012014.freenode.log";
 const url="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/"+encodeURIComponent(filename);
 const res=await fetch(url);assert.equal(res.status,200);
 const b=Buffer.from(await res.arrayBuffer());
 assert.equal(b.length,8629610);
 const sha=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
 assert.equal(sha,"a2880b1db31ce523599ef30ca2e55291bf295900");
 const lines=b.toString("latin1").split(/\r?\n/),id=[],matches=[];
 const trigger=/\b(?:liber[ -]?primus|liber[ -]?primum|lp2|run(?:e|es|ic)|page[ -]?(?:0|[1-5]?[0-9])\b|decode|decrypt|decipher|cipher|key|solved|solution|gematria|sha[ -]?512|totient|vigenere|atbash|primus|pilgrim|outguess|titanpad|encrypted|plaintext)\b/i;
 for(let i=0;i<lines.length;i++){
   const t=lines[i];
   if(!/^2014 (?:May|Jun|Jul|Aug) /.test(t))continue;
   id.push(i);
   if(trigger.test(t))matches.push(i);
 }
 function window(i){return lines.slice(Math.max(0,i-1),Math.min(lines.length,i+2)).map((l,j)=>({line:Math.max(0,i-1)+j+1,text:l.slice(0,460)}))}
 const top=matches.filter(i=>/\b(?:liber.?primus|p0|page [1-5]?\d|decrypt|decipher|key(?:word)?|vigenere|totient|solved|runes?)\b/i.test(lines[i]));
 console.log(JSON.stringify({sourceBlob:sha,sourceLines:lines.length,mayAugDated:id.length,
  matchedTotal:matches.length,strongMatched:top.length,
  strongest:top.slice(0,100).map(i=>({line:i+1,text:lines[i].slice(0,500)})),
  other:matches.filter(i=>!top.includes(i)).slice(0,40).map(i=>({line:i+1,text:lines[i].slice(0,300)})),
  recoveredUnknownPlaintext:false},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
