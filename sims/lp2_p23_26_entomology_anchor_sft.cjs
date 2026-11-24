"use strict";
// #2607 source-selected delta on the six frozen long groups. No suffix scoring
// unless a full new legal key is frozen by a later, independently justified step.
const fs=require("node:fs"),path=require("node:path");
const cov=require("./lp2_p23_26_entomology_coverage_sft.cjs");
const files=cov.files;
function run(inputs,randomCount=16){
 const {data,expanded,relevant,unrelated}=cov.run(inputs,true);
 if(!data.gate)return {coverageGate:false};
 const src=inputs[7],start=src.indexOf(" const [gp,trans,lex,native]"),end=src.indexOf(" function run(label,");
 const get=new Function("inputs",src.slice(start,end)+"\nreturn {gp,originalWords,cutAt,candidates,feasibleStarts,partial};");
 const {gp,originalWords,cutAt,candidates,feasibleStarts,partial}=get(inputs);
 const begin=gp.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0),endPage=gp.pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);
 let off=0;const ws=originalWords.filter(w=>{const i=off;off+=w.length;return i>=begin&&off<=endPage});
 if(ws.flat().length!==1021)throw Error("source");
 const cut=cutAt(ws,500).cut,prefix=ws.slice(0,cut),flat=prefix.flat();
 if(cut!==113||flat.length!==502)throw Error("frozen split");
 const old=candidates(prefix,expanded,false);
 if(old.keys.size!==165)throw Error("old anchor set changed");
 const parse=k=>[...k].map(x=>x.charCodeAt(0)-65);
 const counts=d=>old.anchors.map(a=>{let n=0;for(const [,rows] of partial(prefix[a.i],d))n+=rows.length;return n});
 const oldCounts=counts(expanded),oldLegal=[...old.keys].filter(k=>feasibleStarts(flat,parse(k)));
 if(oldLegal.length)throw Error("baseline obstruction changed");
 const added=relevant.map((d,i)=>[...d].filter(([k])=>!expanded[i].has(k)).map(([,w])=>w));
 function test(d){
 const p=candidates(prefix,d,false),newKeys=[...p.keys].filter(k=>!old.keys.has(k)),legal=newKeys.filter(k=>feasibleStarts(flat,parse(k)));
 return {anchorRelationDelta:counts(d).map((n,i)=>n-oldCounts[i]),classes:p.keys.size,newClasses:newKeys.length,newFullClasses:newKeys.filter(k=>!k.includes("@")).length,legalNewClasses:legal.length,legalFullKeys:legal.filter(k=>!k.includes("@")).map(parse),legalPartialKeys:legal.filter(k=>k.includes("@")).map(parse)};
 }
 // Equal GP length and plaintext-F mask per added tuple; exact count, fixed seeds.
 function randomDict(seed){
 let state=seed>>>0;function rand(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}
 const out=expanded.map(d=>new Map(d));
 for(const [i,forms] of added.entries())for(const f of forms){let w,k;do{w=f.map(v=>v===0?0:1+rand()%28);k=String(w)}while(out[i].has(k));out[i].set(k,w)}
 return out;
 }
 const source=test(relevant),technicalControl=test(unrelated),random=[];
 for(let i=0;i<randomCount;i++)random.push(test(randomDict(3301+i)));
 return {coverageGate:true,cut,trainRunes:flat.length,untouchedRunes:519,anchors:old.anchors,oldCounts,baselineClasses:old.keys.size,baselineLegal:oldLegal.length,source,technicalControl,random,randomDesign:"same added GP tuple count per length and F mask, xorshift32 seeds 3301 through 3300+randomCount; fixed diagnostic, not calibrated significance",noSuffixScoring:true};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files};
