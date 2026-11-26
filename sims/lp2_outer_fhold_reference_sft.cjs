"use strict";
// Agent46 #3029. Reproduce aligned-donor exclusion and source-reference counts.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const bounds=[[125,242,286],[98,301,328],[99,288,331],[121,298,344],[99,296,328],[85,282,321],[83,282,312],[85,282,312],[91,290,315],[110,298,331],[110,309,338],[120,309,338],[102,301,331],[100,298,331],[92,285,321],[100,304,328],[108,309,331],[109,304,341],[111,306,334],[101,301,331],[102,293,338],[102,298,334],[121,309,351],[95,288,338],[113,306,354],[114,309,338],[111,309,344],[106,304,334],[95,298,338]];
function evaluate(raw,bounds){
 const [g,rg,rs,re,native]=[JSON.parse(raw[0]),raw[1],raw[2],raw[3],JSON.parse(raw[4])],C=g.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);
 const assert=(x,m)=>{if(!x)throw Error(m)};
 let hash=2166136261;for(const c of C)hash=Math.imul(hash^c,16777619)>>>0;assert(C.length===3008&&hash===1862123327,"source tape");
 const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"token");out.push(t.i);w=w.slice(t.s.length)}}return out}
 function body(s,start,end){const a=s.indexOf(start),b=s.indexOf(end);assert(a>=0&&b>a,"body");return s.slice(a,b)}
 const refs=[["Gibran",donor(body(rg,"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet"))],["Shakespeare",donor(rs)],["Emerson",donor(body(re,"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))]];
 const comparisons=refs.map(([name,v])=>{
 let fpos=[];for(let i=0;i<v.length;i++)if(v[i]===0)fpos.push(i);
 let lo=0,hi=0,e=0,f=0,n=0,align=0,minDistinct=29,pass=[0,0],fixed=[0,0],byLabel=Array.from({length:29},()=>[0,0]),minF=Infinity,maxF=0,minE=Infinity,maxE=0;
 for(let i=0;i<v.length;i++){e+= +(v[i]===18);f+= +(v[i]===0);if(i>=C.length){e-= +(v[i-C.length]===18);f-= +(v[i-C.length]===0)}if(i<C.length-1)continue;const start=i-C.length+1;n++;
 while(lo<fpos.length&&fpos[lo]<start)lo++;while(hi<fpos.length&&fpos[hi]<=i)hi++;
 let mask=0;for(let j=lo;j<hi;j++)mask|=1<<C[fpos[j]-start];let d=0;for(let z=mask;z;z&=z-1)d++;
 minDistinct=Math.min(d,minDistinct);align+= +(d<=1);minF=Math.min(minF,f);maxF=Math.max(maxF,f);minE=Math.min(minE,e);maxE=Math.max(maxE,e);
 for(let j=0;j<2;j++){let ok=false;for(let h=0;h<29;h++){if(f<=bounds[h][0]&&e<=bounds[h][j+1]){byLabel[h][j]++;ok=true}}pass[j]+=+ok}
 }
 for(let i=0;i<32;i++){let start=Math.round(i*(v.length-C.length)/31),p=v.slice(start,start+C.length),e=p.filter(x=>x===18).length,f=p.filter(x=>x===0).length;for(let j=0;j<2;j++)fixed[j]+=+bounds.some(b=>b[0]>=f&&b[j+1]>=e)}
 return {name,n,align,minDistinct,minE,maxE,minF,maxF,pass,fixed,byLabel};
 });
 let seed=0x462029;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function direct(c,q,h,sub,t,f){
 const target=Array(q).fill(-1),ban=Array(q).fill(-1);sub.forEach((p,i)=>{target[p]=t[i];ban[p]=f[i]});
 let d=Array(q).fill(0);
 for(const x of c){let a=Array(q).fill(-1e9);for(let j=0;j<q;j++){if(d[j]<0)continue;if(x===h)a[j]=Math.max(a[j],d[j]);if(x!==ban[j]){let u=(j+1)%q;a[u]=Math.max(a[u],d[j]+ +(target[j]===x))}}d=a}
 return Math.max(...d)
 }
 function blocks(c,q,h,sub,t,f){
 const runs=[];let b=[];for(const x of c){if(x===h){runs.push(b);b=[]}else b.push(x)}runs.push(b);
 let d=Array(q).fill(0);
 for(let z=0;z<runs.length;z++){const run=runs[z],a=Array(q).fill(-1e9);
 for(let r=0;r<q;r++){if(d[r]<0)continue;let v=d[r],ok=true;
 for(let i=0;i<run.length;i++){const j=sub.indexOf((r+i)%q);if(j<0)continue;if(run[i]===f[j]){ok=false;break}v+= +(run[i]===t[j])}
 if(!ok)continue;const p=(r+run.length)%q,j=sub.indexOf(p);a[p]=Math.max(a[p],v);if(z+1<runs.length&&(j<0||f[j]!==h)){let u=(p+1)%q;a[u]=Math.max(a[u],v+ +(j>=0&&t[j]===h))}}
 d=a;
 }return Math.max(...d)
 }
 const map=new Map(g.runes.map((s,i)=>[s,i])),sections=native.sections.map(s=>({name:s.name,P:Array.from(s.source_text).filter(x=>map.has(x)).map(x=>map.get(x))}));
 const controls=[];
 for(const q of [8,13])for(const name of ["0_welcome","0_koan_1","p56_an_end"]){
  const p=sections.find(s=>s.name===name).P,pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rng()%(i+1);[pi[i],pi[j]]=[pi[j],pi[i]]}
  const K=Array.from({length:q},()=>rng()%29),start=rng()%q,h=pi[0];let j=start;const c=p.map(x=>x===0?h:pi[(x+K[j++%q])%29]);const E=p.filter(x=>x===18).length,F=p.filter(x=>x===0).length;
  const S=q===8?[0,2,4]:[0,2,4,6],scores=[];
  for(let i=0;i<q;i++){const s=S.map(x=>(x+i)%q),t=s.map(x=>pi[(18+K[x])%29]),f=s.map(x=>pi[K[x]]),a=blocks(c,q,h,s,t,f),b=direct(c,q,h,s,t,f);assert(a===b,"block vs direct");scores.push(a)}
  const cover=Math.floor(scores.reduce((a,b)=>a+b,0)/S.length);assert(E<=cover&&F<=c.filter(x=>x===h).length,"native hidden-label control");assert(p.every((x,i)=>x!==0||c[i]===h),"alignment control");controls.push({name,q,n:p.length,h,E,F,cover,pi,K,start});
 }
 for(let j=0;j<400;j++){const q=j%2?8:13,h=rng()%7,s=q===8?[0,2,4]:[0,2,4,6],c=Array.from({length:30},()=>rng()%7),t=s.map(()=>rng()%7),f=s.map(()=>rng()%7);assert(blocks(c,q,h,s,t,f)===direct(c,q,h,s,t,f),"toy legality mismatch")}
 return {n:C.length,hash,bounds,comparisons,controls,toyLegalChecks:400};
}
console.log(JSON.stringify(evaluate(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),bounds),null,2));
