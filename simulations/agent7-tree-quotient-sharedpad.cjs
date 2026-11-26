"use strict";
const fs=require("node:fs");
const path=require("node:path");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const study=function study(raw){
 const corpus=JSON.parse(raw[0]), R=29, S=841;
 const mod=x=>(x%R+R)%R, assert=(x,msg)=>{if(!x)throw Error(msg)};
 const pages=corpus.pages.map(p=>p.indices), tokens=corpus.translit.map((x,i)=>[x.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let out=[];for(let w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:tokens.find(t=>w.startsWith(t[0]));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 function div(x,r){let q=[x[0]];for(let i=1;i<x.length-1;i++)q.push(mod(x[i]+r*q[i-1]));assert(mod(x.at(-1)+r*q.at(-1))===0,"nonzero remainder");return q}
 function mul(x,r){return [x[0],...x.slice(1).map((a,i)=>mod(a-r*x[i])),mod(-r*x.at(-1))]}
 let left=div(div(pages[10],7),24),right=div(pages[11],24);
 assert(JSON.stringify(mul(mul(left,24),7))===JSON.stringify(pages[10]),"p10 replay");
 assert(JSON.stringify(mul(right,24))===JSON.stringify(pages[11]),"p11 replay");
 assert(left.length===pages[12].length&&right.length===pages[13].length,"pair lengths");
 const train=encode(raw[1]), g=encode(raw[2]), e=encode(raw[3]);
 const solved=JSON.parse(raw[4]).sections.map(s=>Array.from(s.source_text).map(x=>corpus.runes.indexOf(x)).filter(x=>x>=0));
 const c1=new Float64Array(R),c2=new Float64Array(S),c3=new Float64Array(S*R);
 for(let i=0;i<train.length;i++){let x=train[i];c1[x]++;if(i)c2[train[i-1]*R+x]++;if(i>1)c3[(train[i-2]*R+train[i-1])*R+x]++}
 const p1=Float64Array.from(c1,x=>(x+.5)/(train.length+14.5)),p2=new Float64Array(S),p3=new Float64Array(S*R);
 for(let a=0;a<R;a++){let n=0;for(let b=0;b<R;b++)n+=c2[a*R+b];for(let b=0;b<R;b++)p2[a*R+b]=(c2[a*R+b]+16*p1[b])/(n+16)}
 for(let ab=0;ab<S;ab++){let n=0;for(let c=0;c<R;c++)n+=c3[ab*R+c];for(let c=0;c<R;c++)p3[ab*R+c]=(c3[ab*R+c]+32*p2[(ab%R)*R+c])/(n+32)}
 /** Exact sum-product and max-product over common-pad histories. */
 function infer(streams,truth){
  let n=Math.max(...streams.map(x=>x.length)), f=new Float64Array(S),v=new Float64Array(S),trace=new Uint8Array(n*S), logL=0,df=0;
  const dec=streams.map(x=>x.map(z=>Array.from({length:R},(_,k)=>mod(z-k))));
  function norm(f,v,len){let sum=0,max=0;for(let i=0;i<len;i++){sum+=f[i];if(v[i]>max)max=v[i]}assert(sum>0&&max>0,"positive probability");for(let i=0;i<len;i++){f[i]/=sum;v[i]/=max}logL+=Math.log(sum)}
  for(let i=0;i<n;i++){
   let active=dec.filter(x=>x.length>i);df+=active.length-1;
   let nf=new Float64Array(S),nv=new Float64Array(S);
   if(i===0){for(let k=0;k<R;k++){let w=1;for(let x of active)w*=p1[x[0][k]];nf[k]=nv[k]=w}norm(nf,nv,R)}
   else if(i===1){for(let a=0;a<R;a++)for(let b=0;b<R;b++){let w=1;for(let x of active)w*=p2[x[0][a]*R+x[1][b]];nf[a*R+b]=f[a]*w;nv[a*R+b]=v[a]*w}norm(nf,nv,S)}
   else {
    const rows=active.map(x=>[x[i-2],x[i-1],x[i]]);
    for(let a=0;a<R;a++)for(let b=0;b<R;b++){
     let ix=a*R+b, fa=f[ix],va=v[ix],bases=rows.map(x=>(x[0][a]*R+x[1][b])*R);
     for(let c=0;c<R;c++){let w=1;for(let j=0;j<rows.length;j++)w*=p3[bases[j]+rows[j][2][c]];let dest=b*R+c;nf[dest]+=fa*w;let q=va*w;if(q>nv[dest]){nv[dest]=q;trace[i*S+dest]=a}}
    }
    norm(nf,nv,S)
   }f=nf;v=nv;
  }
  let best=0;for(let j=1;j<S;j++)if(v[j]>v[best])best=j;
  let key=new Array(n);key[n-1]=best%R;key[n-2]=Math.floor(best/R);
  for(let i=n-1;i>=2;i--){key[i-2]=trace[i*S+key[i-1]*R+key[i]]}
  let plain=streams.map(x=>x.map((z,i)=>mod(z-key[i])));assert(plain.every((x,j)=>x.every((z,i)=>mod(z+key[i])===streams[j][i])),"pad replay");
  let out={logBF:logL+df*Math.log(R),constraints:df,bitsPerConstraint:(logL+df*Math.log(R))/df/Math.log(2),decoded:plain.map(x=>x.map(z=>corpus.translit[z]).join(""))};
  if(truth)out.accuracy=plain.map((x,j)=>x.filter((z,i)=>z===truth[j][i]).length/x.length);
  return out;
 }
 let seed=0x37e51a9d;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29}
 let lengths=[left.length,pages[12].length,right.length,pages[13].length], n=Math.max(...lengths);
 function evaluate(x,truth){return {left:infer(x.slice(0,2),truth?.slice(0,2)),right:infer(x.slice(2),truth?.slice(2)),all:infer(x,truth)}}
 let results={lengths,train:train.length,controlLengths:[g.length,e.length],solvedLengths:solved.map(x=>x.length),controls:[]};
 for(let j=0;j<3;j++){
  let truth=[g.slice(3000+j*1700,3000+j*1700+lengths[0]),e.slice(5000+j*1700,5000+j*1700+lengths[1]),g.slice(12000+j*1700,12000+j*1700+lengths[2]),e.slice(16000+j*1700,16000+j*1700+lengths[3])];
  let pads=Array.from({length:4},()=>Array.from({length:n},rand));
  for(let mode of ["shared","pairwise","independent"]){
   let x=truth.map((s,k)=>s.map((z,i)=>mod(z+pads[mode==="shared"?0:mode==="pairwise"?Math.floor(k/2):k][i])));
   assert(JSON.stringify(div(div(mul(mul(x[0],24),7),7),24))===JSON.stringify(x[0]),"planted quotient");
   results.controls.push({j,mode,...evaluate(x,truth)});
  }
 }
 results.original=evaluate([left,pages[12],right,pages[13]]);
 return results;
};
console.log(JSON.stringify(study(inputs.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
