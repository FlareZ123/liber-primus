"use strict";
/** Agent9: fixed MSB-first 5x5 bit transpose; read-only SFT. */
const fs=require("node:fs"),path=require("node:path");
function experiment(input){
 const [cj,t,nj]=input,c=JSON.parse(cj),native=JSON.parse(nj),idx=new Map(c.runes.map((r,i)=>[r,i]));
 const check=(v,m)=>{if(!v)throw Error(m)};
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const transpose=a=>Array.from({length:5},(_,j)=>a.reduce((v,x)=>(v<<1)|((x>>(4-j))&1),0));
 const pages=c.pages.filter(p=>p.page>=23&&p.page<=26);
 const source=pages.flatMap(p=>p.indices);
 check(same(source,t.split("%").slice(23,27).join("").split("").filter(x=>idx.has(x)).map(x=>idx.get(x))),"source match");
 const body=source.slice(16);check(body.length===1005,"source body size");
 function summarize(a){const blocks=[];for(let i=0;i+4<a.length;i+=5){const b=a.slice(i,i+5),out=transpose(b);check(same(transpose(out),b),"exact replay");blocks.push({offset:i,input:b,output:out,invalid:out.filter(v=>v>=29).length});}const counts=Array(32).fill(0);for(const b of blocks)for(const x of b.output)counts[x]++;return {quintets:blocks.length,legal:blocks.filter(b=>b.invalid===0).length,invalidSymbols:counts.slice(29).reduce((a,b)=>a+b,0),invalidByCode:counts.slice(29),histogram:Array.from({length:6},(_,i)=>blocks.filter(b=>b.invalid===i).length),firstInvalid:blocks.find(b=>b.invalid>0),blocks};}
 // Test all 25 bit basis positions and their complements, plus known nonsymmetric example.
 for(let i=0;i<25;i++){const a=Array(5).fill(0);a[Math.floor(i/5)]=1<<(4-i%5);const b=Array(5).fill(0);b[i%5]=1<<(4-Math.floor(i/5));check(same(transpose(a),b),"basis mapping");check(same(transpose(b),a),"basis replay");check(same(transpose(a.map(v=>31^v)),b.map(v=>31^v)),"complement mapping");}
 const example=[1,2,4,8,16];check(same(transpose(example),example),"anti-diagonal");
 // Exact uniform legal-input null by inclusion-exclusion over five illegal-output column events.
 let legal=0;const moments=Array(6).fill(0);
 for(let m=0;m<32;m++){const k=m.toString(2).replace(/0/g,"").length;let first=0,last=0;for(let a=0;a<29;a++){if((a&m)===m)first++;for(let b=0;b<29;b++)if(((a|b)&m)===m)last++;}const joint=first**3*last;moments[k]+=joint;legal+=(k%2?-1:1)*joint;}
 const choose=(n,k)=>{let z=1;for(let i=1;i<=k;i++)z=z*(n-i+1)/i;return z;};
 const dist=Array.from({length:6},(_,j)=>moments.slice(j).reduce((s,v,i)=>s+(-1)**i*choose(j+i,j)*v,0));check(dist[0]===legal&&dist.reduce((a,b)=>a+b,0)===29**5,"null exact histogram");
 const original=summarize(body);
 const nativeControls=native.sections.map(s=>{const a=[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x));const {blocks,...summary}=summarize(a);return {name:s.name,...summary};});
 return {pageCounts:pages.map(p=>p.indices.length),heading:source.slice(0,16),original,uniformLegalInputNull:{total:29**5,legal,distribution:dist,legalProbability:legal/29**5,expectedInvalidSymbols:dist.reduce((s,n,i)=>s+n*i,0)/29**5*201},nativeControls,controls:{bitBasis:25,bitBasisComplements:25,originalExactFullRegisterReplay:original.quintets===201}};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
