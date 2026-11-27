/** npm install jpeg-js@0.4.4; node sims/lp2_tree_signed2016_held_root_sft.cjs
 * Source-independent LP2 reconstruction -> held signed-2016 root prediction.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const jpeg = require("jpeg-js");
const ROOT = path.resolve(__dirname,"..");
function read(p){return fs.readFileSync(path.join(ROOT,p))}
function raster(p,h,w,hash){
 const b=Buffer.from(read(p).toString(),"base64");let n=0,shift=0,v=0,k=0;
 const a=new Uint8Array(h*w);
 for(const x of b){n|=(x&127)<<shift;if(x&128){shift+=7;continue}if(v)a.fill(1,k,k+n);k+=n;n=0;shift=0;v^=1}
 if(k!==h*w)throw Error("size "+k);
 for(let i=w;i<a.length;i++)a[i]^=a[i-w];
 if(crypto.createHash("sha256").update(a).digest("hex")!==hash)throw Error("mask hash mismatch");
 return Float64Array.from(a)
}
function sample(a,w,h,x,y){
 const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;
 if(i<0||j<0||i>=w-1||j>=h-1)return 0;
 const t=j*w+i;
 return (a[t]*(1-u)+a[t+1]*u)*(1-v)+(a[t+w]*(1-u)+a[t+w+1]*u)*v;
}
const stock0=raster("im-results/lp2-tree-common-stock-mask.b64",210,160,"a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993");
const stock=Float64Array.from(stock0,(_,i)=>stock0[Math.floor(i/160)*160+159-i%160]);
const gc=raster("im-results/lp2-p55-contour-inverse-mask.b64",192,199,"ae6cb034b8f55fc24ffcd7389fdfa93ea368c7a8309abb7e23bdfe8a1668080b");
const mapped=Float64Array.from(stock,(_,i)=>sample(gc,199,192,(i%160+6.269179940310348)/.8434580498835607,(Math.floor(i/160)-45.459292324694964)/.8444254856468015));
const root=Float64Array.from(stock,(v,i)=>i>=162*160?mapped[i]:v);
const bytes=read("resources/historical/cicada2016-4gq25.jpg");
if(crypto.createHash("sha256").update(bytes).digest("hex")!=="a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe")throw Error("signed source hash mismatch");
const im=jpeg.decode(bytes,{useTArray:true,formatAsRGBA:false,maxResolutionInMP:5});
const g=Float64Array.from({length:im.width*im.height},(_,i)=>(im.data[3*i]+im.data[3*i+1]+im.data[3*i+2])/3);
const regions={left:[],right:[],root:[]};
for(let y=290;y<485;y+=2)for(let x=188;x<384;x+=2){
 let sum=0,bad=false;
 for(let dy=-2;dy<4;dy++)for(let dx=-2;dx<4;dx++)if(g[(y+dy)*im.width+x+dx]>40)bad=true;
 if(bad)continue;
 for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)sum+=g[(y+dy)*im.width+x+dx];
 const k=y<420?(x<284?"left":"right"):y>=430?"root":null;
 if(k)regions[k].push([x+.5,y+.5,sum/4]);
}
function blur(a,s){
 if(s===0)return a;
 const w=160,h=210,r=Math.ceil(4*s),k=Array.from({length:2*r+1},(_,i)=>Math.exp(-((i-r)**2)/(2*s*s)));
 const norm=k.reduce((a,b)=>a+b);for(let i=0;i<k.length;i++)k[i]/=norm;
 const t=new Float64Array(a.length),b=new Float64Array(a.length);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let z=0;for(let j=-r;j<=r;j++)if(x+j>=0&&x+j<w)z+=k[j+r]*a[y*w+x+j];t[y*w+x]=z}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let z=0;for(let j=-r;j<=r;j++)if(y+j>=0&&y+j<h)z+=k[j+r]*t[(y+j)*w+x];b[y*w+x]=z}
 return b;
}
const sigmas=[0,.5,1,1.5,2,2.5,3,4,5];
const arrays={stock:sigmas.map(s=>blur(stock,s)),root:sigmas.map(s=>blur(root,s)),full:sigmas.map(s=>blur(mapped,s))};
function stats(a,v,pts){
 const [cx,cy,sx,sy]=v,sx1=1/sx,sy1=1/sy;
 let s=0,t=0,ss=0,tt=0,st=0,n=pts.length;
 for(const [x,y,z] of pts){const p=sample(a,160,210,(x-cx)*sx1,(y-cy)*sy1);s+=p;t+=z;ss+=p*p;tt+=z*z;st+=p*z}
 const cov=st-s*t/n,vp=ss-s*s/n,vt=tt-t*t/n;
 return {r:cov/Math.sqrt(Math.max(1e-12,vp*vt)),gain:cov/Math.max(1e-12,vp),bias:t/n-cov/Math.max(1e-12,vp)*s/n,s,t,ss,tt,st,n};
}
function mse(a,v,pts,g,b){
 const q=stats(a,v,pts);
 return (q.tt+g*g*q.ss+q.n*b*b-2*g*q.st-2*b*q.t+2*g*b*q.s)/q.n;
}
function fit(pts){
 let best={r:-2};
 for(let i=0;i<sigmas.length;i++)for(let sx=.85;sx<=1.15;sx+=.05)for(let sy=.85;sy<=1.15;sy+=.05)for(let x=194;x<=212;x+=6)for(let y=248;y<=272;y+=8){
  const v=[x,y,sx,sy],q=stats(arrays.stock[i],v,pts);if(q.r>best.r)best={...q,v,i};
 }
 for(const step of [2,1,.5,.25]){
  let changed=true;
  while(changed){
   changed=false;
   for(let k=0;k<4;k++)for(const d of [-1,1]){
    const v=best.v.slice();v[k]+=d*step*(k<2?1:.025);
    if(v[2]<.7||v[2]>1.3||v[3]<.7||v[3]>1.3)continue;
    const q=stats(arrays.stock[best.i],v,pts);
    if(q.r>best.r+1e-8){best={...q,v,i:best.i};changed=true}
   }
   for(let i=0;i<sigmas.length;i++){
    const q=stats(arrays.stock[i],best.v,pts);
    if(q.r>best.r+1e-8){best={...q,v:best.v,i};changed=true}
   }
  }
 }
 return best;
}
for(const name of ["left","right"]){
 const f=fit(regions[name]);
 const result={train:name,v:f.v,sigma:sigmas[f.i],trainR:f.r,counts:Object.fromEntries(Object.entries(regions).map(([k,a])=>[k,a.length])),comparisons:{}};
 for(const [k,a] of Object.entries(arrays)){
  const b=stats(a[f.i],f.v,regions[name]);
  result.comparisons[k]={gain:b.gain,bias:b.bias,regions:Object.fromEntries(Object.entries(regions).map(([n,pts])=>[n,{r:stats(a[f.i],f.v,pts).r,mse:mse(a[f.i],f.v,pts,b.gain,b.bias)}]))};
 }
 console.log(JSON.stringify(result));
}
