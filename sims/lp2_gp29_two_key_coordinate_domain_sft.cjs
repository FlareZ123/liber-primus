'use strict';
function main(){
 const P=29,FULL=0x1fffffff,mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>b).find(b=>a*b%29===1)||0),rot=(v,s)=>s?((v<<s)|(v>>>(29-s)))&FULL:v;
 let state=0x22c10c01;function rnd(n){state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)%n;}
 const dot=(a,x,y)=>mod(a[0]*x+a[1]*y+a[2]),sub=(a,b)=>a.map((x,i)=>mod(x-b[i])),add=(a,b)=>a.map((x,i)=>mod(x+b[i]));
 function masks(forms){let noX=0,slopes=new Uint32Array(29);for(const [a,b,c]of forms){if(!b){if(!a){if(!c)return new Uint32Array(29);continue;}noX|=1<<mod(-c*inv[a]);}else{let s=mod(-a*inv[b]),t=mod(-c*inv[b]);slopes[s]|=1<<t;}}
 let out=new Uint32Array(29);for(let x=0;x<29;x++)if(!(noX&(1<<x))){let forbidden=0;for(let s=0;s<29;s++)if(slopes[s])forbidden|=rot(slopes[s],s*x%29);out[x]=FULL^forbidden;}return out;}
 function points(m){let a=[];for(let x=0;x<29;x++)for(let y=0;y<29;y++)if(m[x]&(1<<y))a.push([x,y]);return a;}
 function normal(f){let i=f[0]?0:f[1]?1:-1;return i<0?(f[2]?"!":"0"):f.map(x=>x*inv[f[i]]%29).join(",");}
 const count=m=>points(m).length;let stats={cases:0,planted:0,keys:0,live:0,empty:0,oldSaturated:0,newEmptyOnly:0,featureTests:0,oldFeaturePass:0,newFeaturePass:0,optionTests:0,oldOptionPass:0,newOptionPass:0,mixedKeyOnly:0,wholePass:0};
 for(let z=0;z<600;z++){
  const x0=rnd(29),y0=rnd(29),plant=z%2===0,roots=Array.from({length:29},(_,i)=>i% (2+rnd(5))); // fixed below: partition with nonempty components
  const components=2+rnd(5);for(let i=0;i<29;i++)roots[i]=i%components;
  for(let i=28;i>0;i--){let j=rnd(i+1);[roots[i],roots[j]]=[roots[j],roots[i]];}
  const pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rnd(i+1);[pi[i],pi[j]]=[pi[j],pi[i]];}
  const rootIndex=Array.from({length:components},(_,i)=>roots.indexOf(i));
  const O=Array.from({length:29},(_,i)=>{if(rootIndex[roots[i]]===i)return[0,0,0];let a=rnd(29),b=rnd(29);return[a,b,plant?mod(pi[i]-pi[rootIndex[roots[i]]]-a*x0-b*y0):rnd(29)];});
  let K=Array.from({length:8},(_,i)=>i===0?[0,0,1]:[rnd(29),rnd(29),rnd(29)]);
  if(plant){ // keep true key primitive
   if(K.slice(0,4).every((a,i)=>dot(a,x0,y0)===dot(K[i+4],x0,y0)))K[4][2]=mod(K[4][2]+1);
  }
  const forms=[];for(let i=0;i<29;i++)for(let j=0;j<i;j++)if(roots[i]===roots[j])forms.push(sub(O[i],O[j]));
  let m=masks(forms);
  for(let x=0;x<29;x++)for(let y=0;y<29;y++){
   let valid=true;const seen=Array(components).fill(0);for(let i=0;i<29;i++){let bit=1<<dot(O[i],x,y),r=roots[i];if(seen[r]&bit){valid=false;break;}seen[r]|=bit;}
   if(valid&&K.slice(0,4).every((a,i)=>dot(a,x,y)===dot(K[i+4],x,y)))valid=false;
   if(K.slice(0,4).every((a,i)=>dot(a,x,y)===dot(K[i+4],x,y)))m[x]&=~(1<<y);
   if(!!(m[x]&(1<<y))!==valid)throw Error("domain oracle");
  }
  if(plant&&!(m[x0]&(1<<y0)))throw Error("lost plant");
  const pts=points(m),vals=pts.map(([x,y])=>{const o=O.map(a=>dot(a,x,y)),k=K.map(a=>dot(a,x,y)),mask=Array(components).fill(0);for(let i=0;i<29;i++)mask[roots[i]]|=1<<o[i];return{o,k,mask};});
  const forb=new Set(forms.map(normal).filter(x=>x!=="!")),groups=new Map();for(const q of forb){const a=q.split(","),b=Number(a.pop()),key=a.join(",");groups.set(key,(groups.get(key)||0)|(1<<b));}const saturated=forb.has("0")||[...groups.values()].includes(FULL);
  stats.cases++;stats.planted+=+plant;stats.keys+=841;stats.live+=pts.length;stats.empty+=+(pts.length===0);stats.oldSaturated+=+saturated;stats.newEmptyOnly+=+(pts.length===0&&!saturated);
  function old([c,p,j]){if(saturated)return false;let sh=sub(add(O[p],K[j]),O[c]);if(roots[c]===roots[p]){let a=normal(sh);return a!=="!"&&!forb.has(a);}for(let u=0;u<29;u++)if(roots[u]===roots[p])for(let v=0;v<29;v++)if(roots[v]===roots[c]&&sub(O[u],O[v]).every((x,i)=>x===sh[i]))return false;return true;}
  function feature([c,p,j],v){let shift=mod(v.o[p]+v.k[j]-v.o[c]);return roots[c]===roots[p]?shift===0:!(rot(v.mask[roots[c]],shift)&v.mask[roots[p]]);}
  function whole(es,v){let r=roots.slice(),o=v.o.slice();for(const[c,p,j]of es){let sh=mod(o[p]+v.k[j]-o[c]),a=r[c],b=r[p];if(a===b){if(sh)return false;continue;}let m=0;for(let i=0;i<29;i++)if(r[i]===b)m|=1<<o[i];for(let i=0;i<29;i++)if(r[i]===a){let t=mod(o[i]+sh);if(m&(1<<t))return false;m|=1<<t;r[i]=b;o[i]=t;}}return true;}
  for(let t=0;t<16;t++){
   let es=Array.from({length:2+rnd(5)},()=>[rnd(29),1+rnd(28),rnd(8)]);
   if(plant&&t===0){let v=vals[pts.findIndex(([x,y])=>x===x0&&y===y0)];es=[];for(let q=0;q<5;q++){let p=1+rnd(28),j=rnd(8),c=pi.indexOf(mod(pi[p]+v.k[j]));es.push([c,p,j]);}}
   let o=es.every(old),n=vals.some(v=>es.every(e=>feature(e,v))),w=vals.some(v=>whole(es,v));
   for(const e of es){stats.featureTests++;stats.oldFeaturePass+=+old(e);stats.newFeaturePass+=+vals.some(v=>feature(e,v));}
   stats.optionTests++;stats.oldOptionPass+=+o;stats.newOptionPass+=+n;stats.wholePass+=+w;stats.mixedKeyOnly+=+(o&&!n);
   if(n&&!o||w&&!n)throw Error("unsafe pruning");if(plant&&t===0&&!w)throw Error("lost planted option");
  }
 }
 return{schema:"lp2-gp29-two-key-coordinate-domain-v1",stats,scope:"Generated affine-component states; no original LP2 candidate or runtime benchmark. Exact key-domain masks and common-key edge support, without residual-component packing."};
}
console.log(JSON.stringify(main(),null,2));
