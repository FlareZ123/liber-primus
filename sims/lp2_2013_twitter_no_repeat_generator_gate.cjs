#!/usr/bin/env node
"use strict";
// Direct 2013 Twitter-byte -> GP29 generator with strict adjacent-repeat suppression.
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const dump=fs.readFileSync(path.join(root,"resources/cicada2013-twitter-hex-stream.txt"),"utf8");
const cipher=corpus.pages.filter(p=>p.status==="unsolved").flatMap(p=>p.indices);
function assert(x,m){if(!x)throw new Error(m);}
function parse(text){
 const chunks=[];let n=0;
 for(const line of text.trim().split(/\r?\n/)){const m=line.match(/^([0-9a-f]+):\s*([0-9a-f]+)$/i);if(!m)continue;const o=parseInt(m[1],16),h=m[2];assert(h.length%2===0,"odd hex");chunks.push({o,h});n=Math.max(n,o+h.length/2);}
 const b=new Uint8Array(n),seen=new Uint8Array(n);let count=0;
 for(const c of chunks)for(let i=0;i<c.h.length/2;i++){const p=c.o+i;assert(!seen[p],"overlap");b[p]=parseInt(c.h.slice(2*i,2*i+2),16);seen[p]=1;count++;}
 assert(count===n&&seen.every(Boolean),"gap");return {b,records:chunks.length};
}
function generate(bytes,mode,policy){
 const out=[];let prev=-1,consumed=0;
 for(let i=0;i<bytes.length&&out.length<cipher.length;i++){
  let v=mode==="mod29"?bytes[i]%29:mode==="scaled29"?Math.floor(29*bytes[i]/256):bytes[i]&31;
  if(v>=29)continue;
  if(policy==="reject"&&v===prev)continue;
  if(policy==="cycle"&&v===prev)v=(v+1)%29;
  out.push(v);prev=v;consumed=i+1;
 }
 let matches=0,firstMismatch=-1,adjacentRepeats=0,longestAlignedRun=0,run=0;
 for(let i=0;i<Math.min(out.length,cipher.length);i++){
  if(out[i]===cipher[i]){matches++;run++;longestAlignedRun=Math.max(longestAlignedRun,run);}
  else{if(firstMismatch<0)firstMismatch=i;run=0;}
 }
 for(let i=1;i<out.length;i++)if(out[i]===out[i-1])adjacentRepeats++;
 return {mode,policy,generated:out.length,bytesConsumed:consumed,matches,matchRate:matches/cipher.length,firstMismatch,adjacentRepeats,longestAlignedRun,exact:out.length===cipher.length&&matches===cipher.length};
}
const {b,records}=parse(dump);
const repeats=cipher.slice(1).filter((v,i)=>v===cipher[i]).length;
const results=[];
for(const mode of ["mod29","scaled29","low5"])for(const policy of ["reject","cycle"])results.push(generate(b,mode,policy));
const p=1/29,n=cipher.length,expected=n*p,sd=Math.sqrt(n*p*(1-p));
for(const r of results)r.z=(r.matches-expected)/sd;
console.log(JSON.stringify({ciphertextRunes:n,ciphertextAdjacentRepeats:repeats,twitterBytes:b.length,twitterRecords:records,chanceBaseline:{p,expectedMatches:expected,sd},results},null,2));
