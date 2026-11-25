"use strict";
// Agent4, independent draw1, 25 Nov 2026.
// Distinct historical implementation: the same CPython random() instance
// generates key runes and collision-suppression coins. No external coin RNG.
// Seed list frozen from Agent2 #2665, not expanded. Uniform iid plaintext
// marginal, continuous offset zero, s=.81288, extra-draw cap 1600.
// Familywise alpha=.05 over 545 preselected seed variants. Require >=12/16
// correct native plants above the threshold; original candidates must then
// have independent language evidence. No plaintext or seed inferred from LR alone.
// MT integer seed initialization adapted from lp2_r18_skipcount_feasibility_sft.cjs.
function mtFloats(seed,n){const m=new Uint32Array(624);let words=[seed>>>0];if(seed>=4294967296)words.push(Math.floor(seed/4294967296)>>>0);m[0]=19650218;for(let i=1;i<624;i++)m[i]=(Math.imul(1812433253,m[i-1]^(m[i-1]>>>30))+i)>>>0;let i=1,j=0;for(let k=0;k<624;k++){m[i]=((m[i]^Math.imul(m[i-1]^(m[i-1]>>>30),1664525))+words[j]+j)>>>0;if(++i===624){m[0]=m[623];i=1}if(++j===words.length)j=0}for(let k=0;k<623;k++){m[i]=((m[i]^Math.imul(m[i-1]^(m[i-1]>>>30),1566083941))-i)>>>0;if(++i===624){m[0]=m[623];i=1}}m[0]=0x80000000;i=624;function draw(){if(i===624){for(let k=0;k<624;k++){const y=(m[k]&0x80000000)|(m[(k+1)%624]&0x7fffffff);m[k]=m[(k+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0)}i=0}let y=m[i++];y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;y^=y>>>18;return y>>>0}return Float64Array.from({length:n},()=>((draw()>>>5)*67108864+(draw()>>>6))/9007199254740992)}
const S=.81288,CAP=1600;
function marginal(C,U,cap=CAP,s=S){
 if(U.length<C.length+cap+2)throw Error("short tape");
 const K=Uint8Array.from(U,x=>Math.floor(29*x)),run=new Uint16Array(K.length);
 const lists=Array.from({length:29},()=>[]);
 for(let j=2;j<K.length;j++)if(U[j-1]<s){
   run[j]=1+(j>=4&&K[j-4]===K[j-2]?run[j-2]:0);
   lists[(K[j]-K[j-2]+29)%29].push(j);
 }
 const D=new Float64Array(cap+1);D[0]=1;
 const cursors=new Int32Array(29);let scale=0,repeats=0;
 for(let i=1;i<C.length;i++){
   const delta=(C[i]-C[i-1]+29)%29;
   if(delta===0){
     repeats++;
     for(let d=cap;d>=1;d--){
       const j=i+d-1;
       if(U[j+1]<s){D[d]=0;continue}
       let v=D[d-1];
       if(j>=2&&K[j]===K[j-2])for(let r=1;r<=run[j]&&2*r+1<=d;r++)v+=D[d-1-2*r];
       D[d]=v;
     }D[0]=0;
   }else{
     const list=lists[delta];let hi=cursors[delta];
     while(hi<list.length&&list[hi]<=i+cap)hi++;
     cursors[delta]=hi;
     for(let t=hi-1;t>=0&&list[t]>=i+2;t--){
       const j=list[t],d=j-i;let v=0;
       for(let r=1;r<=run[j]&&2*r<=d;r++)v+=D[d-2*r];
       D[d]+=v;
     }
   }
   if((i&127)===0){let z=0;for(const v of D)z+=v;if(z===0)return {llr:null,logPaths:null,meanExtra:null,edgeMass:0};for(let d=0;d<=cap;d++)D[d]/=z;scale+=Math.log(z)}
 }
 let z=0,m=0,e=0;for(let d=0;d<=cap;d++){z+=D[d];m+=d*D[d];if(d>=cap-50)e+=D[d]}
 if(z===0)return {llr:null,logPaths:null,meanExtra:null,edgeMass:0};
 const logPaths=scale+Math.log(z);
 return {llr:logPaths+(C.length-1)*Math.log1p(-s/29)-repeats*Math.log1p(-s),logPaths,meanExtra:m/z,edgeMass:e/z};
}
function plant(P,U,s=S){
 let j=0,prev=-1,rejects=0,repeats=0,maxReject=0;const C=[],ends=[];
 for(const p of P){let r=0,c;
   while(true){if(j+1>=U.length)throw Error("short plant tape");c=(p+Math.floor(29*U[j++]))%29;if(c!==prev)break;if(U[j++]>=s){repeats++;break}rejects++;r++}
   C.push(c);ends.push(j);prev=c;maxReject=Math.max(r,maxReject);
 }
 return {C,ends,rejects,repeats,maxReject,extra:j-P.length};
}
// Independent direct oracle: for each cursor and every possible plaintext
// rune, run the actual deterministic encoder, accumulate compatible paths.
function oracle(C,U,cap,s=S){
 let states=new Map([[0,1]]);
 for(let i=0;i<C.length;i++){
  const next=new Map(),prev=i?C[i-1]:-1;
  for(const [start,count] of states)for(let p=0;p<29;p++){
   let j=start,c;
   while(j<U.length){c=(p+Math.floor(29*U[j++]))%29;if(c!==prev)break;if(j>=U.length){c=-1;break}if(U[j++]>=s)break}
   if(c===C[i]&&j<=i+1+cap)next.set(j,(next.get(j)||0)+count);
  }states=next;
 }return [...states.values()].reduce((a,b)=>a+b,0);
}
function controls(C,P){
 const tests=[];for(let i=0;i<16;i++){
   const seed=0x49280311+i,U=mtFloats(seed,C.length+CAP+2);
   const plain=P.slice(500*i,500*i+C.length);
   if(plain.length!==C.length)throw Error("short native");
   const uniform=Array.from(mtFloats(seed^0x41deac05,C.length),v=>Math.floor(29*v));
   for(const [kind,p] of [["native",plain],["uniform",uniform]]){
     const E=plant(p,U),correct=marginal(E.C,U),wrong=marginal(E.C,mtFloats(seed^0x73410829,C.length+CAP+2));
     tests.push({seed,kind,extra:E.extra,rejects:E.rejects,repeats:E.repeats,maxReject:E.maxReject,correct,wrong});
   }
 }
 let checks=0;
 for(let i=0;i<128;i++){
   const U=mtFloats(0x771320+i,32),P=Array.from(mtFloats(0x616570+i,6),x=>Math.floor(29*x));
   const E=plant(P,U),C=E.C,cap=12;
   for(const sample of [C,C.map((v,j)=>j===3?(v+1)%29:v)]){
     const a=oracle(sample,U,cap),b=marginal(sample,U,cap).logPaths;
     if(a===0?b!==null:Math.abs(Math.log(a)-b)>1e-10)throw Error("oracle mismatch");
     checks++;
   }
 }
 return {tests,checks};
}
function rows(prior){return prior.rows.flatMap(x=>[{rank:x.rank,seed:x.seed,variant:"literal"},...(x.seed>4294967295?[{rank:x.rank,seed:x.seed>>>0,variant:"low32"}]:[])])}
function score(C,R){return R.map(x=>({...x,...marginal(C,mtFloats(x.seed,C.length+CAP+2))}))}
module.exports={mtFloats,marginal,plant,oracle,controls,rows,score,S,CAP};
if(require.main===module){
 const fs=require("node:fs"),read=p=>fs.readFileSync(p,"utf8");
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),prior=JSON.parse(read("im-results/lp2-r18-skipcount-feasibility-output.json")),C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
 const {convert}=require("./lp2_perl_pgp_keyskip1_sft.cjs");
 const [group="control",start="0",end="545"]=process.argv.slice(2);
 const result=group==="control"?controls(C,convert(read("resources/control/shakespeare_first300k.txt"),corpus.translit)):score(C,(group==="candidate"?rows(prior):prior.nulls.map(({seed})=>({seed}))).slice(+start,+end));
 console.log(JSON.stringify(result,null,2));
}
