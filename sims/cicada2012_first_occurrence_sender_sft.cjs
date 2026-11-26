"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
function analyze(source,payload){
 const upper=source.toUpperCase(),start=upper.indexOf("KING ARTHUR WAS AT CAERLLEON");
 if(start!==17345)throw Error("carrier start");
 const raw=upper.slice(start).split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,188),lines=[];
 for(const l of raw){if(l.split(/\s+/).length<=3)lines[lines.length-1]+=" "+l;else lines.push(l);}
 const pairs=Array.from(payload.matchAll(/^(\d+):(\d+)$/gm),m=>[+m[1],+m[2]]);
 const message="CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT";
 if(lines.length!==185||pairs.length!==76||message.length!==76)throw Error("source lengths");
 let choices=1n;
 const rows=Array.from(message,(ch,i)=>{
  const line=lines[i],positions=Array.from(line,(c,j)=>c===ch?j+1:0).filter(Boolean);
  choices*=BigInt(positions.length);
  return {line:i+1,observed:pairs[i],reconstructed:[i+1,positions[0]],choices:positions.length};
 });
 return {records:rows.length,exact:rows.filter(x=>x.observed.join()===x.reconstructed.join()).length,unique:rows.filter(x=>x.choices===1).length,sameOutputAssignments:String(choices),rows};
}
async function main(){
 const bytes=process.argv[2]?fs.readFileSync(process.argv[2]):Buffer.from(await(async()=>{const response=await fetch("https://raw.githubusercontent.com/GITenberg/The-Mabinogion_5160/86b1521ce54ddae3caaa235a6fb04a9ae67f2370/old/mbng10.txt");assert.ok(response.ok);return response.arrayBuffer();})());
 assert.equal(crypto.createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex"),"2a149950ed767f5c6f03d9710935f288b85d72d0");
 const payload=fs.readFileSync(path.join(__dirname,"../im-results/2012-first-image-1CcV1-outguess.txt"),"utf8");
 const out=analyze(bytes.toString("ascii"),payload);
 assert.equal(out.exact,76);assert.equal(out.unique,14);
 assert.equal(out.sameOutputAssignments,"150063642028420516609526127919104000000000000");
 console.log(JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
