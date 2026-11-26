"use strict";
/** Exact p32 two-half arbitrary shared-pad literal-passage join. Read only. */
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/beowulf_oe_gp_profile_corrected.json","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/external/2013-liber-al-bookcode-I.txt","resources/external/2013-liber-al-bookcode-II.txt","resources/external/2013-liber-al-bookcode-III.txt","resources/control/gibran_prophet_58585.txt"];
function run(data){
 const gp=JSON.parse(data[0]), native=JSON.parse(data[1]), oe=JSON.parse(data[2]),m=x=>(x%29+29)%29;
 const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const encode=x=>{let a=[];for(let w of x.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[VKZQ]/g,x=>({V:"U",K:"C",Z:"S",Q:"C"})[x]);while(w){let q=spell.find(x=>w.startsWith(x.s));if(!q)throw Error(w);a.push(q.i);w=w.slice(q.s.length)}}return a};
 const texts=native.sections.map(s=>({name:s.name,P:[...s.source_text].map(x=>gp.runes.indexOf(x)).filter(x=>x>=0)}));
 texts.push({name:"Beowulf",P:[...oe.sourceGpBase29].map(x=>oe.positiveControlAlphabet.indexOf(x))});
 for(let i=3;i<8;i++)texts.push({name:["Self-Reliance","Liber AL I","Liber AL II","Liber AL III","Gibran"][i-3],P:encode(data[i])});
 const n=55,fit=32,hashlen=10,hash=new Map(),refs=[];
 for(let t=0;t<texts.length;t++){let P=texts[t].P;for(let at=0;at+n<=P.length;at++){let h=0;for(let j=0;j<hashlen;j++)h=h*29+m(P[at+j+1]-P[at+j]);let id=refs.length;refs.push({t,at});let a=hash.get(h);if(a)a.push(id);else hash.set(h,[id])}}
 /** Recover unknown shared pad and constant relative shift by exact difference joins. */
 function solve(L,R,s){let D=L.map((x,i)=>m(R[i]-s*x));let dd=D.slice(1).map((x,i)=>m(x-D[i]));let prefix=0,full=0,found=[];for(let {t,at} of refs){let A=texts[t].P,h=0;for(let j=0;j<hashlen;j++)h=h*29+m(dd[j]+s*(A[at+j+1]-A[at+j]));for(let id of hash.get(h)||[]){let b=refs[id],B=texts[b.t].P,k=m(D[0]-B[b.at]+s*A[at]);let j=1;while(j<fit&&m(B[b.at+j]-s*A[at+j]+k)===D[j])j++;if(j<fit)continue;prefix++;while(j<n&&m(B[b.at+j]-s*A[at+j]+k)===D[j])j++;if(j===n){full++;let key=L.map((x,i)=>m(x-A[at+i]));if(!R.every((x,i)=>x===m(B[b.at+i]+s*key[i]+k)))throw Error("replay");if(found.length<10)found.push({a:{t,at},b,shift:k,key,left:A.slice(at,at+n),right:B.slice(b.at,b.at+n)})}}}return {prefix,full,found}}
 const page=gp.pages[32].indices;if(page.length!==121)throw Error("geometry");const left=[],right=[],mirror=[],center=[];for(let row=0;row<11;row++){let a=page.slice(row*11,row*11+11);left.push(...a.slice(0,5));center.push(a[5]);right.push(...a.slice(6));mirror.push(...a.slice(6).reverse())}
 let seed=0xaacdb13;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
 const controls=[];for(let i=0;i<8;i++){let a=refs[rnd(refs.length)],b=refs[rnd(refs.length)],A=texts[a.t].P.slice(a.at,a.at+n),B=texts[b.t].P.slice(b.at,b.at+n),s=i%2?1:-1,k=rnd(29),K=A.map(()=>rnd(29)),L=A.map((x,j)=>m(x+K[j])),R=B.map((x,j)=>m(x+s*K[j]+k)),z=solve(L,R,s);let recovered=z.found.some(v=>v.key.every((x,j)=>x===K[j])&&v.shift===k&&v.left.every((x,j)=>x===A[j])&&v.right.every((x,j)=>x===B[j]));if(!recovered)throw Error("control not recovered");controls.push({a,b,s,k,prefix:z.prefix,full:z.full,recovered,withheldPairs:n-fit})}
 const original=[];for(let [orientation,R] of [["row-forward",right],["row-mirror",mirror]])for(let sign of [1,-1])original.push({orientation,sign,...solve(left,R,sign)});
 return {sourceSizes:texts.map(x=>({name:x.name,runes:x.P.length})),sourceWindows:refs.length,orderedPairsPerOrientation:refs.length**2,fit,holdout:n-fit,center,controls,original};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
