"use strict";
const fs=require("node:fs"),path=require("node:path");
function localGate(c,src){
 const lookup=new Map(c.runes.map((r,i)=>[r,i])),q=29,mod=x=>(x%q+q)%q;
 let C=[],words=[],w=[],cut=[0],page=[0],raw=src.split("%").slice(0,55).join("%");
 for(const x of raw){if(lookup.has(x)){w.push(C.length);C.push(lookup.get(x))}else{if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){words.push(w);w=[]}if(".&$".includes(x)&&cut.at(-1)!==C.length)cut.push(C.length);if(x==="%")page.push(C.length)}}
 if(w.length)words.push(w);if(cut.at(-1)!==C.length)cut.push(C.length);
 const anchors=words.filter(w=>w.length===1).map(w=>w[0]),ps=new Set(page),coord=i=>{let p=0;while(p+1<page.length&&page[p+1]<=i)p++;return [p,i-page[p]]};
 function reachable(l,h,F,a){let D=new Uint8Array(q*q).fill(1),E=new Uint8Array(q*q),mask=new Set(a);for(let i=l;i<h;i++){E.fill(0);for(let k=0;k<q;k++)for(let d=0;d<q;d++)if(D[k*q+d]){
  let p=mod(C[i]-k),ok=!mask.has(i)||[24,10,3].includes(p);
  if(ok&&(!F||p!==0))E[mod(k+d)*q+d]=1;
  if(F&&C[i]===0&&!mask.has(i))E[k*q+d]=1;
 }[D,E]=[E,D];if(!D.some(x=>x))return {n:0,failedAt:i};}
 return {n:D.reduce((a,b)=>a+b,0)};
 }
 const variants=[];
 for(const [name,cuts] of [["marks",cut],["marks_plus_physical_page",Array.from(new Set([...cut,...ps])).sort((a,b)=>a-b)]])for(const F of [false,true]){
 let fail=[],total=0;
 for(let j=0;j<cuts.length-1;j++){let l=cuts[j],h=cuts[j+1],a=anchors.filter(i=>l<=i&&i<h),v=reachable(l,h,F,a);if(v.n)continue;total++;
 // Deletion-minimal witness: remove each redundant constraint, repeat not needed by monotonicity.
 let m=a.slice();for(const i of a){let z=m.filter(x=>x!==i);if(!reachable(l,h,F,z).n)m=z}
 fail.push({j,l,h,coord:coord(l),failedAt:v.failedAt,anchors:a,minimumWitness:m.map(i=>({i,pageOffset:coord(i),C:C[i]})),leaveOneOut:m.map(i=>reachable(l,h,F,m.filter(x=>x!==i)).n),unconstrained:reachable(l,h,F,[]).n});
 }
 variants.push({name,F,segments:cuts.length-1,failed:total,fail});
 }
 return {n:C.length,anchors:anchors.length,variants};
}
if(require.main===module){const root=path.join(__dirname,"../resources/liber-primus");console.log(JSON.stringify(localGate(JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8")),fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8")),null,2));}
module.exports=localGate;
