'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {encodeSourceNativeGP:encode}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json')),n=3008,mod=x=>(x%29+29)%29;
const ct=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices),actual=ct.reduce((s,x,i)=>s+(i>0&&x===ct[i-1]),0);
assert.equal(ct.length,n);assert.equal(actual,18);
const files=['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt','resources/control/emerson_essays_2944.txt'];
const mul=Array.from({length:29},(_,a)=>Uint8Array.from({length:29},(_,x)=>a*x%29));
function scan(p){
 const d=Uint8Array.from(p.slice(1),(x,i)=>mod(x-p[i])),N=d.length-2,W=n-3;
 let min=Infinity,max=0,which=null,keysPass=0,windowPass=0;
 const hit=new Uint8Array(N);
 for(let b=0;b<29;b++){const B=mul[b];for(let c=1;c<29;c++){const C=mul[c];let sum=0,m=Infinity,localMax=0,at=0,pass=0;
 for(let i=0;i<N;i++){const x=d[i]+B[d[i+1]]+C[d[i+2]],z=+(x===0||x===29||x===58);hit[i]=z;sum+=z;if(i>=W)sum-=hit[i-W];if(i>=W-1){if(sum<m){m=sum;at=i-W+1}if(sum>localMax)localMax=sum;if(sum<=actual)pass++}}
 if(m<min){min=m;which={b,c,at}}if(localMax>max)max=localMax;if(pass){keysPass++;windowPass+=pass}}}
 return {length:p.length,windows:p.length-n+1,keys:812,min,max,which,keysPass,windowPass};
}
const output=files.map(file=>({file,...scan(encode(read(file)))}));
assert.deepEqual(output.map(x=>[x.min,x.keysPass,x.windowPass]),[[45,0,0],[48,0,0],[47,0,0]]);
console.log(JSON.stringify({originalLength:n,actual,output},null,2));
