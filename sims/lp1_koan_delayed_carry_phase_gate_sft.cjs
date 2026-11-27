"use strict";
const assert=require("node:assert/strict");
function run(raw, native){
 const idx=c=>native.runes.indexOf(c);
 const strip=s=>[...s].filter(c=>idx(c)>=0).map(idx);
 const pages=raw.split("%").slice(12,14);
 const c=pages.flatMap(strip), p=strip(native.sections.find(s=>s.name==="jpg107-167").source_text);
 assert.equal(c.length,319);assert.equal(p.length,319);
 const seam=strip(pages[0]).length;
 const end=seam+strip(pages[1].split("-")[0]).length;
 const start=seam-strip(pages[0].split("-").at(-1)).length;
 assert.deepEqual([start,seam,end],[222,226,229]);
 const render=a=>a.map(i=>native.runes[i]).join("");
 assert.equal(render(p.slice(start,end)),"ᛋᛏᚩᛈᛈᛖᛞ");
 assert.equal(render(c.slice(start,end)),"ᚱᛏᛈᛒᛈᛗᛈ");
 const hold=i=>p[i]===0&&c[i]===0;
 assert(!p.slice(0,13).some((_,i)=>hold(i)));
 const key=p.slice(0,13).map((x,i)=>(c[i]-x+29)%29);
 assert.deepEqual(key,[0,10,4,0,1,19,0,18,4,18,9,0,18]);
 const phaseAt=i=>p.slice(0,i).filter((_,j)=>!hold(j)).length%13;
 function match(lo,hi,phase){
  let j=phase,ok=0;
  for(let i=lo;i<hi;i++) {
   if(hold(i)){ok++;continue;}
   if((p[i]+key[j++%13])%29===c[i])ok++;
  }
  return {ok,phase:j%13};
 }
 const seamPhases=[...Array(13).keys()].map(i=>match(seam,319,i).ok);
 const delayedPhases=[...Array(13).keys()].map(i=>match(end,319,i).ok);
 const fit=[...Array(13).keys()].map(i=>match(end,end+13,i).ok);
 const fitted=fit.map((v,i)=>v===13?i:-1).filter(i=>i>=0);
 assert.deepEqual(fitted,[6]);assert.deepEqual([phaseAt(start),phaseAt(seam),phaseAt(end)],[12,3,6]);
 const held=match(end+13,319,fitted[0]);
 assert.equal(held.ok,77);assert.equal(match(13,319,phaseAt(13)).ok,306);
 assert.equal(seamPhases[3],93);assert.equal(delayedPhases[6],90);
 assert.equal(Math.max(...seamPhases.filter((_,i)=>i!==3)),22);
 assert.equal(Math.max(...delayedPhases.filter((_,i)=>i!==6)),21);
 return {key,carry:{start,seam,end,cipher:render(c.slice(start,end)),plain:render(p.slice(start,end)),phases:[phaseAt(start),phaseAt(seam),phaseAt(end)]},seamPhases,delayedPhases,fit,fitted,held,wholePostTraining:306};
}
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");
 const raw=fs.readFileSync(path.join(root,"resources/transcriptions/lp1_wulfic_canonical.txt"),"utf8");
 const native=JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8"));
 console.log(JSON.stringify(run(raw,native),null,2));
}
module.exports={run};
