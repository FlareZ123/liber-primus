"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const study=function study(raw){
 const R=29,START=29,B=128,mod=x=>(x%R+R)%R,assert=(x,m)=>{if(!x)throw Error(m)},corpus=JSON.parse(raw[0]);
 const tokens=corpus.translit.map((x,i)=>[x.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let out=[];for(let w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){while(w.length){let t=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:tokens.find(t=>w.startsWith(t[0]));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 function div(x,r){let q=[x[0]];for(let i=1;i<x.length-1;i++)q.push(mod(x[i]+r*q[i-1]));assert(mod(x.at(-1)+r*q.at(-1))===0,"remainder");return q}
 const pages=corpus.pages.map(p=>p.indices),original=[div(div(pages[10],7),24),pages[12],div(pages[11],24),pages[13]],lengths=original.map(x=>x.length);
 const train=encode(raw[1]),g=encode(raw[2]),e=encode(raw[3]),c1=new Float64Array(R),c2=new Float64Array(R*R),p=new Float64Array((R+1)*R);
 for(let i=0;i<train.length;i++){c1[train[i]]++;if(i)c2[train[i-1]*R+train[i]]++}
 for(let z=0;z<R;z++)p[START*R+z]=(c1[z]+.5)/(train.length+R*.5);
 for(let a=0;a<R;a++){let n=0;for(let z=0;z<R;z++)n+=c2[a*R+z];for(let z=0;z<R;z++)p[a*R+z]=(c2[a*R+z]+16*p[START*R+z])/(n+16)}
 const prob=(a,z)=>p[a*R+z];
 function suffix(c){let n=c.length,f=new Float64Array((n+1)*30);for(let a=0;a<30;a++)f[n*30+a]=1;for(let i=n-1;i>=0;i--)for(let a=0;a<30;a++){let sum=0;for(let z=0;z<R;z++)if(z||c[i]===0)sum+=prob(a,z)*(z?1:29)*f[(i+1)*30+z];f[i*30+a]=sum}return f}
 function infer(c,truth){
  const n=c.map(x=>x.length),suf=c.map(suffix),base=suf.reduce((a,f)=>a*f[START],1);
  const group=pos=>({pos,f:new Float64Array(30),v:new Float64Array(30),prev:new Array(30),key:new Uint8Array(30),mask:new Uint8Array(30),score:0});
  const start=group([0,0,0,0]);start.f[START]=start.v[START]=1;let current=[start],total=0,best=0,terminal=null,edges=0,pruned=0,maxGroups=0,rounds=0;
  const mapId=pos=>(((pos[0]*(n[1]+1)+pos[1])*(n[2]+1)+pos[2])*(n[3]+1)+pos[3]);
  // pLast[position][previous key] is defined only for still-active streams.
  const last=c.map(x=>Array.from({length:x.length+1},(_,i)=>Array.from({length:30},(_,k)=>i===0||k===START?START:mod(x[i-1]-k))));
  for(let t=0;current.length&&t<=Math.max(...n);t++){
   rounds=t+1;let next=new Map();
   for(let u of current){
    const opts=c.map((x,j)=>{let i=u.pos[j],o=[];if(i===x.length)return [{dest:i,h:0,consume:false,already:true}];let h=0;for(;;){if(i===x.length){o.push({dest:i,h,consume:false,already:false});break}o.push({dest:i+1,h,consume:true,z:x[i],already:false});if(x[i]!==0)break;i++;h++}return o});
    for(let o0 of opts[0])for(let o1 of opts[1])for(let o2 of opts[2])for(let o3 of opts[3]){
     const os=[o0,o1,o2,o3],dest=os.map(o=>o.dest),mask=os.reduce((m,o,j)=>m|(o.consume?1<<j:0),0),consume=os.filter(o=>o.consume).length;
     let target=null;
     if(consume){let id=mapId(dest);target=next.get(id);if(!target){target=group(dest);next.set(id,target)}}
     const consuming=[];for(let j=0;j<4;j++)if(os[j].consume)consuming.push(j);
     const multiplier=consume?29**(consume-1):1;
     for(let k=0;k<30;k++){let uf=u.f[k],uv=u.v[k];if(!uf)continue;
      let w=multiplier,prev=[];
      for(let j=0;j<4;j++){let o=os[j],a=last[j][u.pos[j]][k];if(o.h){w*=29*prob(a,0)*(29*prob(0,0))**(o.h-1);a=0}prev[j]=a}
      if(!consume){total+=uf*w;let q=uv*w;if(q>best){best=q;terminal={u,k}}continue}
      for(let l=0;l<R;l++){
       let z=1;
       for(let j of consuming){let a=mod(os[j].z-l);if(!a){z=0;break}z*=prob(prev[j],a)}
       if(!z)continue;z*=w;target.f[l]+=uf*z;let q=uv*z;if(q>target.v[l]){target.v[l]=q;target.prev[l]=u;target.key[l]=k;target.mask[l]=mask}edges++;
      }
     }
    }
   }
   let arr=Array.from(next.values());maxGroups=Math.max(maxGroups,arr.length);
   for(let u of arr){let score=0;for(let k=0;k<R;k++){let w=u.f[k];if(!w)continue;for(let j=0;j<4;j++)if(u.pos[j]<n[j])w*=suf[j][u.pos[j]*30+last[j][u.pos[j]][k]];score+=w}u.score=score}
   arr.sort((a,b)=>b.score-a.score);pruned+=Math.max(0,arr.length-B);current=arr.slice(0,B)
  }
  assert(terminal&&total>0&&best>0,"terminal");
  const plain=n.map(i=>Array(i).fill(0));let {u,k}=terminal;
  while(u!==start){let mask=u.mask[k];for(let j=0;j<4;j++)if(mask&(1<<j)){let i=u.pos[j]-1;plain[j][i]=mod(c[j][i]-k)}let prev=u.prev[k],pk=u.key[k];u=prev;k=pk}
  const keys=plain.map((x,j)=>x.flatMap((z,i)=>{if(z===0){assert(c[j][i]===0,"F hold");return []}return [mod(c[j][i]-z)]}));let long=keys.reduce((a,b)=>a.length>b.length?a:b);assert(keys.every(x=>x.every((z,i)=>z===long[i])),"common replay");
  let out={logBFLowerBound:Math.log(total/base),beam:B,prunedGroups:pruned,maxGroups,rounds,edges,zeros:c.map(x=>x.filter(z=>z===0).length),consumed:keys.map(x=>x.length),decoded:plain.map(x=>x.map(z=>corpus.translit[z]).join(""))};
  if(truth)out.accuracy=plain.map((x,j)=>x.filter((z,i)=>z===truth[j][i]).length/x.length);return out
 }
 let seed=0x334a7111;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29}
 function enc(x,k){let i=0;return x.map(z=>z===0?0:mod(z+k[i++]))}
 const out={train:train.length,beam:B,controls:[]};
 for(let j=0;j<2;j++){let truth=[g.slice(3000+j*1700,3000+j*1700+lengths[0]),e.slice(5000+j*1700,5000+j*1700+lengths[1]),g.slice(12000+j*1700,12000+j*1700+lengths[2]),e.slice(16000+j*1700,16000+j*1700+lengths[3])],pads=Array.from({length:4},()=>Array.from({length:272},rand));
 for(let mode of ["shared","pairwise","independent"]){let x=truth.map((s,k)=>enc(s,pads[mode==="shared"?0:mode==="pairwise"?Math.floor(k/2):k]));out.controls.push({j,mode,...infer(x,truth)})}}
 out.original=infer(original);return out
};
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
