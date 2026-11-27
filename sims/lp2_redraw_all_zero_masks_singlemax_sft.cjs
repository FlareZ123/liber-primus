"use strict";
// Exact per-rune max count over all phase paths, normalized phase coordinates.
function singleMax(c,rings,threshold=2311){
const n=c.length,mod=x=>(x+29)%29,d=Uint8Array.from(c.slice(1),(x,i)=>mod(x-c[i]));
let a=new Int16Array(232),b=new Int16Array(232),m=new Int16Array(29),out=[];
for(const row of rings){
 if(row.upper<threshold)continue;
 const D=row.D,K=[0];for(let j=0;j<7;j++)K.push(mod(K[j]+D[j]));
 const z=D.indexOf(0),edges=Array.from({length:29},()=>[]);
 for(let k=1;k<=8;k++){let j=(z-k)&7;edges[D[j]].push(j);}
 a.fill(0);
 for(let u=0;u<8;u++)a[29*u+mod(c[0]-K[(u+7)&7])]++;
 for(let i=1;i<n;i++){
  let x=d[i-1],rel=(i-1)&7;
  if(x){for(let j of edges[x]){
    let u=(j-rel)&7,s=29*u,t=29*((u+1)&7);
    for(let k=0;k<29;k++)if(a[s+k]>a[t+k])a[t+k]=a[s+k];
  }}else{
   b.fill(-30000);
   for(let j of edges[0]){
    let u=(j-rel)&7,s=29*u,t=29*((u+1)&7);
    for(let k=0;k<29;k++)b[t+k]=a[s+k];
   }
   [a,b]=[b,a];
  }
  for(let u=0;u<8;u++)a[29*u+mod(c[i]-K[(u+i-1)&7])]++;
 }
 m.fill(0);for(let u=0;u<8;u++)for(let k=0;k<29;k++)if(a[u*29+k]>m[k])m[k]=a[u*29+k];
 for(let k=0;k<29;k++)if(m[k]>row.support[k])throw Error("single max exceeds support");
 let s=Array.from(m).sort((a,b)=>b-a);out.push({D,upper:s[0]+s[1],single:s[0],singleMax:Array.from(m),supportUpper:row.upper});
}
return out.sort((a,b)=>b.upper-a.upper);
}
if(typeof module!=="undefined"){module.exports=singleMax;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")),co=read("resources/liber-primus/lp2-corpus.json"),res=read("im-results/lp2-redraw-all-zero-masks-support.json");console.log(JSON.stringify(singleMax(co.pages.slice(0,56).flatMap(p=>p.indices),res),null,2));}}
