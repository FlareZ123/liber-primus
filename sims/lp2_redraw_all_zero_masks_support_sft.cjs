"use strict";
function support(c,rings){
 const n=c.length,mod=x=>(x+29)%29,rol=(x,k)=>((x<<k)|(x>>(8-k)))&255;
 const R1=Uint8Array.from({length:256},(_,x)=>rol(x,1)),R2=Uint8Array.from({length:256},(_,x)=>rol(x,2)),L1=Uint8Array.from({length:256},(_,x)=>rol(x,7)),L2=Uint8Array.from({length:256},(_,x)=>rol(x,6));
 const d=Uint8Array.from(c.slice(1),(x,i)=>mod(x-c[i]));
 const B=new Uint8Array(n),h=new Uint16Array(29*256),used=new Uint16Array(29*256),Smap=new Uint32Array(256),counts=new Uint16Array(29),M=new Uint8Array(29);
 let out=[];
 for(let D of rings){
  const K=[0];for(let j=0;j<7;j++)K.push(mod(K[j]+D[j]));
  if(mod(K[7]+D[7]))throw Error("ring closure");
  M.fill(0);for(let j=0;j<8;j++)M[D[j]]|=1<<j;
  B[n-1]=255;
  for(let i=n-1;i>0;i--){let x=d[i-1],b=B[i];B[i-1]=(x?L1[b]:0)|(L2[b]&M[x]);}
  if(!B[0])throw Error("incompatible ring");
  let S=255,nu=0;h.fill(0);counts.fill(0);
  for(let i=0;i<n;i++){
   if(i){let x=d[i-1];S=(x?R1[S]:0)|R2[S&M[x]];}
   let k=c[i]*256+(S&B[i]);if(!(S&B[i]))throw Error("unreachable");if(!h[k])used[nu++]=k;h[k]++;
  }
  for(let s=1;s<256;s++){let bit=s&-s,j=31-Math.clz32(bit);Smap[s]=Smap[s^bit]|(1<<mod(-K[(j+7)&7]));}
  for(let u=0;u<nu;u++){let k=used[u],v=k>>8,b=Smap[k&255],m=((b<<v)|(b>>>(29-v)))&0x1fffffff;while(m){let bit=m&-m;counts[31-Math.clz32(bit)]+=h[k];m^=bit;}}
  let a=Array.from(counts).sort((a,b)=>b-a);
  out.push({D,upper:a[0]+a[1],single:a[0],support:Array.from(counts)});
 }
 return out.sort((a,b)=>b.upper-a.upper);
}
if(typeof module!=="undefined"){module.exports=support;if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8")),co=read("resources/liber-primus/lp2-corpus.json"),res=read("im-results/lp2-redraw-all-zero-masks-output.json");console.log(JSON.stringify(support(co.pages.slice(0,56).flatMap(p=>p.indices),res.masks.flatMap(x=>x.candidates).filter(x=>x.heldPhase).map(x=>x.D)),null,2));}}
