'use strict';
const fs=require('node:fs');const path=require('node:path');
function terminal(corpus,src,orig){
 const lookup=new Map(corpus.runes.map((x,i)=>[x,i])),words=[];let w=[],offset=0;
 for(const ch of src.split("%").slice(0,55).join("%")){
  if(lookup.has(ch))w.push({i:offset++,c:lookup.get(ch)});
  else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[]}
 }if(w.length)words.push(w);
 const C=words.flat().map(x=>x.c),pages=corpus.pages.filter(p=>p.page<=55),start=pages.filter(p=>p.page<54).reduce((s,p)=>s+p.indices.length,0);if(C.join()!==pages.flatMap(p=>p.indices).join())throw Error("source");
 const c=C.slice(start),ww=words.filter(w=>w[0].i>=start).map(w=>w.map(x=>x.i-start));if(ww.flat().length!==c.length)throw Error("seam");
 const ss=ww.filter(w=>w.length===1).map(w=>w[0]),allowed=new Set([24,10,3]),mod=x=>(x%29+29)%29;
 const k=[];for(let p=2;k.length<orig.range[1]+c.length+1;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)k.push((p-1)%29)}
 const out=[];
 for(const {f,origins} of orig.originCounts.at(-1).byMarker)for(const o of origins){let states=[{j:o,holds:[],r:[]}];for(let i=0;i<c.length;i++){const next=[];for(const x of states){if(c[i]===0)next.push({j:x.j,holds:[...x.holds,i],r:[...x.r,-1]});let v=mod(c[i]-k[x.j]);if(v!==f)next.push({j:x.j+1,holds:x.holds,r:[...x.r,v]})}states=next}
  for(const x of states){const values=ss.map(i=>x.r[i]);out.push({f,o,holds:x.holds,anchorValues:values,anchorAI:values.every(x=>x===24||x===10),anchorAIO:values.every(x=>allowed.has(x)),r:x.r})}
 }
 return {n:c.length,ss,words:ww,paths:out};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(terminal(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('im-results/agent47-p56-calibrated-allorigin-output.json'))),null,2));}
module.exports={terminal};
