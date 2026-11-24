"use strict";
/** Original printed p15 4x4 matrix outer layer over authentic GP29 F-hold
 * periodic substitution. Exact collision bounds with no guessed key.
 * Node CommonJS: node sims/lp2_p15_grid_outer_fhold_gate_sft.cjs
 */
const fs=require("node:fs"), path=require("node:path"), assert=require("node:assert/strict");
const files=["resources/liber-primus/lp2-corpus.json","resources/cicada2014-openpuff-magic-squares.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const mod=x=>((x%29)+29)%29;
/** @param {number[][]} M */
function inverse(M){
 const n=M.length,A=M.map((row,i)=>row.map(mod).concat(M.map((_,j)=>+(i===j))));
 for(let j=0;j<n;j++){
  const p=A.findIndex((row,i)=>i>=j&&row[j]);assert(p>=j);
  [A[p],A[j]]=[A[j],A[p]];let inv=1;while(mod(A[j][j]*inv)!==1)inv++;
  A[j]=A[j].map(v=>mod(v*inv));for(let i=0;i<n;i++)if(i!==j){const v=A[i][j];A[i]=A[i].map((x,k)=>mod(x-v*A[j][k]));}
 }return A.map(row=>row.slice(n));
}
/** @param {number[][]} M @param {number[]} C */
function transform(M,C){
 const n=M.length,out=[];assert.equal(C.length%n,0);
 for(let i=0;i<C.length;i+=n)for(const row of M)out.push(mod(row.reduce((a,x,j)=>a+x*C[i+j],0)));
 return out;
}
/** @param {number[]} C @param {number} q */
function stats(C,q){
 let r=0,b=0;for(let i=0;i<C.length;i++)for(let k=1;k<=3;k++){let j=i-k*q;if(j>=0&&C[i]===C[j]){r++;if(j>0&&C[i-1]===C[j-1])b++;}}
 return [r,b];
}
/** Exact independent extrema over all possible transparent F deletions.
 * @param {number[]} C @param {number} q */
function bounds(C,q){
 const D=3*q+1;let S=new Map([["",[0,0,0,0]]]),peak=1;
 for(const c of C){
  const T=new Map(),z=String.fromCharCode(c);
  const merge=(h,a,r,b)=>{const p=T.get(h);if(p){p[0]=Math.min(p[0],a[0]+r);p[1]=Math.max(p[1],a[1]+r);p[2]=Math.min(p[2],a[2]+b);p[3]=Math.max(p[3],a[3]+b);}else T.set(h,[a[0]+r,a[1]+r,a[2]+b,a[3]+b]);};
  for(const [h,a] of S){if(c===0)merge(h,a,0,0);let r=0,b=0;for(let k=1;k<=3;k++){const j=h.length-k*q;if(j>=0&&h.charCodeAt(j)===c){r++;if(j>0&&h.charCodeAt(j-1)===h.charCodeAt(h.length-1))b++;}}merge((h+z).slice(-D),a,r,b);}
  S=T;peak=Math.max(peak,S.size);
 }
 const v=[Infinity,-Infinity,Infinity,-Infinity];for(const a of S.values()){v[0]=Math.min(v[0],a[0]);v[1]=Math.max(v[1],a[1]);v[2]=Math.min(v[2],a[2]);v[3]=Math.max(v[3],a[3]);}
 return {rune:v.slice(0,2),bigram:v.slice(2),peak};
}
/** @param {string} s @param {string[]} alphabet */
function native(s,alphabet){
 const tok=alphabet.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),out=[];
 for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length);}}
 return out;
}
function run(data){
 const gp=JSON.parse(data[0]),M=data[1].trim().split(/\r?\n\s*\r?\n/).map(s=>s.trim().split(/\r?\n/).map(s=>s.trim().split(/\s+/).map(Number)));
 assert.deepEqual(M.map(m=>m.length),[5,7,5]);
 const D=data.slice(2).map(s=>native(s,gp.translit)),S=[[16,22,null,0,1744]],out=[];
 M[0]=[[3258,3222,3152,3038],[3278,3299,3298,2838],[3288,3294,3296,2472],[4516,1206,708,1820]];
 for(let i=0;i<1;i++){
  const [lo,hi,skipPage,skip,n]=S[i],C=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices.slice(p.page===skipPage?skip:0));
  assert.equal(C.length,n);
  const I=inverse(M[i]),U=transform(I,C);assert.deepEqual(transform(M[i],U),C);
  for(const q of [8,13]){
   const B=bounds(U,q),cf=U.filter(x=>x===0).length,controls=[];
   for(let k=0;k<D.length;k++)for(let w=0;w<32;w++){
    const start=Math.round(w*(D[k].length-n)/31),P=D[k].slice(start,start+n),F=P.filter(x=>x===0).length,[r,b]=stats(P.filter(x=>x!==0),q);
    controls.push({donor:k,window:w,F,r,b,pass:F<=cf&&r>=B.rune[0]&&r<=B.rune[1]&&b>=B.bigram[0]&&b<=B.bigram[1]});
   }
   // A full layered native plant; actual F positions are known only for this comparator.
   const P=D[i].slice(1000,1000+n),K=Array.from({length:q},(_,j)=>mod(j*j+5*j+3*i+7));
   let phase=0;const E=P.map(x=>x===0?0:mod(x+K[phase++%q])),plantC=transform(M[i],E),plantU=transform(I,plantC);assert.deepEqual(plantU,E);
   const pStats=stats(P.filter(x=>x!==0),q),eStats=stats(E.filter((_,j)=>P[j]!==0),q),PB=bounds(plantU,q);
   assert.deepEqual(pStats,eStats);assert(pStats[0]>=PB.rune[0]&&pStats[0]<=PB.rune[1]&&pStats[1]>=PB.bigram[0]&&pStats[1]<=PB.bigram[1]);
   out.push({pages:[lo,hi],n,q,innerCipherF:cf,bounds:B,controls:controls.length,matched:controls.filter(x=>x.pass),controlMinimum:{rune:Math.min(...controls.map(x=>x.r)),bigram:Math.min(...controls.map(x=>x.b))},plant:{runeBigram:pStats,bounds:PB,exactOuterRoundtrip:true}});
  }
 }
 return out;
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files,bounds,stats,inverse,transform};
