'use strict';
// Agent 2, 2026-11-25. Run from repository root with Node 22.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-grid-256.json",
    "sha": "2550eae357442912220e05dc51147523a61dd75a"
  },
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  }
];
function layoutExperiment(grid,corpus,solved){
 const n=256,q=29,M=x=>(x%q+q)%q,inv=x=>{for(let y=1;y<q;y++)if(M(x*y)===1)return y;throw Error("zero")},assert=(x,m)=>{if(!x)throw Error(m)};
 const nat=name=>[...solved.sections.find(s=>s.name===name).source_text].map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0);
 const C=[...corpus.pages[56].indices,...corpus.pages[57].indices],P=[...nat("p56_an_end"),...nat("p57_parable")];
 assert(C.length===180&&P.length===180,"known length");
 const layouts=[];
 for(const axis of ["row","column"])for(const outerRev of [false,true])for(const innerRev of [false,true])for(const snake of [false,true]){
   const sites=[];const outer=axis==="row"?30:6,inner=axis==="row"?6:30;
   for(let i=0;i<outer;i++)for(let j=0;j<inner;j++){
     const a=outerRev?outer-i:i+1,b=(innerRev!==(snake&&i%2===1))?inner-j:j+1;
     sites.push(axis==="row"?8*a+b:8*b+a);
   }
   assert(new Set(sites).size===180&&sites.every(i=>i>=8&&i<248&&i%8>0&&i%8<7),"layout");
   layouts.push({axis,outerRev,innerRev,snake,sites});
 }
 assert(new Set(layouts.map(x=>x.sites.join(","))).size===16,"distinct layouts");
 const result=[];
 for(const radix of [59,60]){
   const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet,T=grid.pages.flatMap(p=>p.tokens).map(t=>alpha.indexOf(t[0])*radix+alpha.indexOf(t[1]));
   const d=Array(n).fill(0);T.forEach(i=>d[i]++);
   for(const l of layouts){
     const sites=l.sites,pairs=[];for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++){
       const a=sites[i],b=sites[j];if(d[a]||d[b]||T[a]!==T[b])continue;
       const dc=M(C[i]-C[j]),dp=M(P[i]-P[j]);pairs.push({cells:[a,b],offsets:[i,j],C:[C[i],C[j]],P:[P[i],P[j]],dc,dp,a:dc?M(dp*inv(dc)):dp?"impossible":"any"});
     }
     const values=[...new Set(pairs.filter(p=>typeof p.a==="number").map(p=>p.a))];
     const linear=values.length<=1&&!pairs.some(p=>p.a==="impossible");
     // With arbitrary bijective input/output substitutions, a nonzero
     // coefficient requires equality-pattern agreement on every sibling pair.
     // A zero coefficient requires equal plaintext for every sibling pair.
     const relabel=pairs.every(p=>p.dp===0)||pairs.every(p=>(p.dc===0)===(p.dp===0));
     const {sites:_,...info}=l;
     result.push({radix,...info,pairs:pairs.length,distinctRequiredSlopes:values.length,linearSurvives:linear,relabelNecessarySurvives:relabel,zeroSlopeWitness:pairs.find(p=>p.dc!==0&&p.dp===0)||null,nonzeroSlopeWitness:pairs.find(p=>p.dp!==0)||null,equalCipherMismatch:pairs.find(p=>p.dc===0&&p.dp!==0)||null});
   }
 }
 return result;
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);const actual=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(actual!==sha)throw Error(`input changed: ${path}`);return JSON.parse(b)});
console.log(JSON.stringify(layoutExperiment(...data),null,2));
