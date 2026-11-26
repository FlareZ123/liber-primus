"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const files=["resources/transcriptions/lp2-image-corrected.txt","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt"];
function run(raw,assert){
 const rune=/[\u16a0-\u16ff]+/gu, alphabet="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ", primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
 const pages=raw[0].split("%").filter(s=>s.match(rune)).slice(0,-2);
 const parse=s=>s.replace(/[\/\n]/g,"").match(rune)||[];
 const old=pages.flatMap(parse),fixed=parse(pages.join(""));
 assert(old.length===2928&&fixed.length===2896&&old.join("")===fixed.join("")&&old.join("").length===12956,"parse");
 const tw=raw.slice(1).join("\n").match(/[A-Za-z]+/g),M=tw.length;
 const sum=w=>[...w].reduce((s,c)=>s+primes[alphabet.indexOf(c)],0);
 const rows=ws=>{let offset=0;return ws.map((w,k)=>{const s=sum(w),i=k+1,j=s*i%M,o={i,start:offset,end:offset+w.length,s,j,target:tw[j],letter:tw[j][0].toUpperCase()};offset+=w.length;return o})};
 const a=rows(old),b=rows(fixed),map=new Map(a.map(x=>[x.start+":"+x.end,x]));
 let unchanged=0,changedAddr=0,changedLetter=0,joined=0;
 for(const x of b){const y=map.get(x.start+":"+x.end);if(!y){joined++;continue}unchanged++;if(x.j!==y.j)changedAddr++;if(x.letter!==y.letter)changedLetter++;}
 const differentPairs=[];
 for(let k=0;k<b.length-1;k++){const x=b[k],y=b[k+1];if(x.s!==y.s){const j1=y.s*x.i%M,j2=x.s*y.i%M;if(tw[j1][0].toUpperCase()!==x.letter||tw[j2][0].toUpperCase()!==y.letter){differentPairs.push({i:x.i,original:[x.letter,y.letter],swapped:[tw[j1][0].toUpperCase(),tw[j2][0].toUpperCase()],s:[x.s,y.s]});k++;}}}
 return {M,oldGroups:a.length,fixedGroups:b.length,joined,unchanged,changedAddr,changedLetter,firstChanged:b.find(x=>!map.has(x.start+":"+x.end)||map.get(x.start+":"+x.end).j!==x.j),distinctAddresses:new Set(b.map(x=>x.j)).size,oldHead:a.slice(0,100).map(x=>x.letter).join(""),fixedHead:b.slice(0,100).map(x=>x.letter).join(""),fixedTail:b.slice(-100).map(x=>x.letter).join(""),headTargets:b.slice(0,20),tailTargets:b.slice(-20),disjointOrderWitnesses:differentPairs.length,exampleOrderWitness:differentPairs[0]};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8")),assert),null,2));
module.exports={run};
