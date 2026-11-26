"use strict";
// Same fixed register and authored-body boundaries as Agent46's reference receiver.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-outer-fhold-reference-output.json"];
function evaluate(raw,mode="summary"){
 const g=JSON.parse(raw[0]),bounds=JSON.parse(raw[4]).bounds;
 const C=g.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 let hash=2166136261;for(const x of C)hash=Math.imul(hash^x,16777619)>>>0;
 if(C.length!==3008||hash!==1862123327||Math.max(...Array.from({length:29},(_,a)=>C.filter(x=>x===a).length))!==125)throw Error("original tape");
 const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end);if(a<0||b<=a)throw Error("body");return s.slice(a,b)}
 const refs=[["Gibran",donor(body(raw[1],"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(raw[2])],["Emerson",donor(body(raw[3],"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
 const encode=p=>p.map(x=>x.toString(36)).join("");
 if(mode==="tape")return encode(C);
 if(mode==="gibran"||mode==="shakespeare")return encode(refs[mode==="gibran"?0:1][1].slice(10000,13008));
 const comparisons=[];
 for(const [name,v] of refs){const c=Array(29).fill(0);let n=0,max=0,maxRelaxed=0,maxPrior=0,nPrior=0,nRelaxed=0,rareHist={},rareRelaxed={},rarePrior={};for(let i=0;i<v.length;i++){c[v[i]]++;if(i>=3008)c[v[i-3008]]--;if(i<3007)continue;n++;const a=c.slice(1).sort((a,b)=>a-b),rare=a[0]+a[1]+a[2]+a[3];rareHist[rare]=(rareHist[rare]||0)+1;max=Math.max(max,rare);if(c[18]<=354&&c[0]<=125){nRelaxed++;maxRelaxed=Math.max(maxRelaxed,rare);rareRelaxed[rare]=(rareRelaxed[rare]||0)+1}if(bounds.some(b=>c[0]<=b[0]&&c[18]<=b[2])){nPrior++;maxPrior=Math.max(maxPrior,rare);rarePrior[rare]=(rarePrior[rare]||0)+1}}comparisons.push({name,n,max,nPrior,maxPrior,nRelaxed,maxRelaxed,rareHist,rareRelaxed,rarePrior})}
 if(comparisons.reduce((s,x)=>s+x.n,0)!==561456||comparisons.reduce((s,x)=>s+x.nRelaxed,0)!==174561||comparisons.reduce((s,x)=>s+x.nPrior,0)!==82685||comparisons.some(x=>x.maxRelaxed>12))throw Error("reference mismatch");
 return {n:C.length,hash,relaxedE:354,relaxedF:125,rareMax:12,requiredCap:53,comparisons};
}
if(require.main===module){const v=evaluate(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]||"summary");console.log(typeof v==="string"?v:JSON.stringify(v,null,2))}
module.exports={evaluate,paths};
