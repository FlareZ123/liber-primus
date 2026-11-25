"use strict";
// Exact common GF(2) recurrence recovery from 8 simultaneous output bits.
function infer(y,prefix,degree){
 const rows=Array(degree).fill(0n),mask=(1n<<BigInt(degree))-1n,bit=1n<<BigInt(degree);
 let rank=0,eqs=0,fail=null;
 for(let t=degree;t<prefix&&!fail;t++)for(let b=0;b<8;b++){
  let row=((y[t]>>>b)&1)?bit:0n;
  for(let j=0;j<degree;j++)if((y[t-degree+j]>>>b)&1)row|=1n<<BigInt(j);
  eqs++;
  for(let j=0;j<degree;j++)if(row&(1n<<BigInt(j))){if(rows[j])row^=rows[j];else{rows[j]=row;rank++;row=0n;break}}
  if((row&mask)===0n&&(row&bit)){fail={t,b};break}
 }
 if(fail)return {feasible:false,degree,rank,eqs,fail};
 let key=0n;
 for(let j=degree-1;j>=0;j--){let r=rows[j];if(!r)continue;let v=Number(Boolean(r&bit));for(let k=j+1;k<degree;k++)if((r&(1n<<BigInt(k)))&&(key&(1n<<BigInt(k))))v^=1;if(v)key|=1n<<BigInt(j)}
 const coeff=Array.from({length:degree},(_,i)=>Number((key>>BigInt(i))&1n)),predict=history=>coeff.reduce((v,c,j)=>c?v^history[history.length-degree+j]:v,0);
 const out=y.slice(0,prefix),one=[];for(let t=prefix;t<y.length;t++){out.push(predict(out));one.push(predict(y.slice(0,t)))}
 for(let t=degree;t<prefix;t++)if(predict(y.slice(0,t))!==y[t])throw Error("fit replay");
 return {feasible:true,degree,rank,eqs,nullity:degree-rank,coeff,holdout:out.slice(prefix),exact:out.slice(prefix).filter((v,i)=>v===y[i+prefix]).length,oneStepExact:one.filter((v,i)=>v===y[i+prefix]).length};
}
function recover(bytes,prefix=192,max=160){
 // Differencing allows arbitrary constant output XOR and affine state transition;
 // for affine z[t+1]=M z[t]+b, z[t+1]^z[t] follows M.
 const y=bytes.slice(1).map((x,i)=>x^bytes[i]),n=prefix-1;
 const cap=infer(y,n,max);
 if(!cap.feasible)return {max,cap};
 let lo=1,hi=max;while(lo<hi){const m=Math.floor((lo+hi)/2);if(infer(y,n,m).feasible)hi=m;else lo=m+1}
 const best=infer(y,n,lo);let previous=bytes[prefix-1];const prediction=best.holdout.map(x=>previous^=x);
 return {max,cap:{degree:cap.degree,rank:cap.rank,feasible:cap.feasible},best,prediction,byteExact:prediction.filter((x,i)=>x===bytes[prefix+i]).length};
}
function run(grid){
 const alphabet=grid.alphabet,source=grid.pages.flatMap(p=>p.tokens);
 if(source.length!==256)throw Error("grid shape");
 const rows=source.map(t=>alphabet.indexOf(t[0])*60+alphabet.indexOf(t[1]));
 let seed=0x9910af;const r=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 const controls=[];
 for(let k=0;k<4;k++){
  let x=r(),y=r(),z=r(),w=r(),out=[];
  for(let i=0;i<256;i++){const t=(x^(x<<11))>>>0;x=y;y=z;z=w;w=(w^(w>>>19)^t^(t>>>8))>>>0;out.push(((w>>>(8*k))&255)^0xa7)}
  const s=recover(out);if(s.best?.degree>128||s.byteExact!==64)throw Error("xorshift128 recovery");controls.push({name:"xorshift128 byte "+k,...s});
 }
 let w=r();const out=[];for(let i=0;i<256;i++){w^=w<<13;w^=w>>>17;w^=w<<5;out.push((w>>>8)&255)}
 const s=recover(out);if(s.best?.degree>32||s.byteExact!==64)throw Error("xorshift32 recovery");controls.push({name:"xorshift32 second byte",...s});
 const nulls=Array.from({length:4},()=>recover(Array.from({length:256},()=>r()>>>24)));
 // The null generator itself must not be xorshift, hence use a non-linear
 // 32-bit mixing function of independent successive xorshift outputs.
 const mixedNulls=Array.from({length:4},()=>recover(Array.from({length:256},()=>{let v=r();v=Math.imul(v^(v>>>16),0x85ebca6b);v=Math.imul(v^(v>>>13),0xc2b2ae35);return (v^(v>>>16))&255})));
 if(mixedNulls.some(x=>x.cap.feasible))throw Error("negative control unexpectedly feasible");
 const original=[];
 for(const radix of [59,60]){
  const abc=radix===60?alphabet:alphabet.replace("f",""),v=source.map(t=>abc.indexOf(t[0])*radix+abc.indexOf(t[1]));
  if(v.some(x=>x<0||x>255))throw Error("invalid byte");
  for(const order of ["row","column"]){const b=order==="row"?v:Array.from({length:256},(_,i)=>v[(i%32)*8+Math.floor(i/32)]);original.push({radix,order,...recover(b)})}
 }
 return {prefixBytes:192,holdoutBytes:64,maxStateBits:160,controls,linearOutputSanity:nulls,mixedNulls,original};
}
module.exports={infer,recover,run};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-grid-256.json"),"utf8"))),null,2))}
