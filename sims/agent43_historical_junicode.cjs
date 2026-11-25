/**
 * Agent43 historical Junicode outline comparison, no native font dependency.
 * CJS: require this file and call scan(base64, originalMasksA, originalMasksB).
 * Original masks: 40x40, packed as x,y;base36_row[:repeat],... | ...
 * Outlines are rasterized with scanline nonzero winding at pixel centers.
 */
function scan(content, maskA, maskB){
  const enc=content.replace(/\s/g,""),alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",raw=new Uint8Array(Math.floor(enc.length*3/4));let k=0,acc=0,bits=0;
  for(const c of enc){let n=alphabet.indexOf(c);if(n<0)continue;acc=(acc<<6)|n;bits+=6;if(bits>=8){bits-=8;raw[k++]=(acc>>bits)&255}}
  const d=new DataView(raw.buffer),U=i=>d.getUint16(i),S=i=>d.getInt16(i),L=i=>d.getUint32(i),t={};
  for(let i=0;i<U(4);i++){let p=12+16*i;t[String.fromCharCode(...raw.slice(p,p+4))]=L(p+8)}
  const cmap=t.cmap,sub=Array.from({length:U(cmap+2)},(_,i)=>cmap+L(cmap+8+8*i)).find(i=>U(i)===4);
  function glyph(c){let n=U(sub+6)/2,e=sub+14,s=e+2*n+2,de=s+2*n,ro=de+2*n;for(let j=0;j<n;j++)if(c<=U(e+2*j)&&c>=U(s+2*j)){let q=U(ro+2*j),v=q?U(ro+2*j+q+2*(c-U(s+2*j))):c;return v?(v+S(de+2*j))&65535:0}return 0}
  const loc=g=>S(t.head+50)?L(t.loca+4*g):2*U(t.loca+2*g);
  let gs=[],composites=[],seen=new Set();
  for(let c=0x16a0;c<=0x16ff;c++){let g=glyph(c);if(!g||seen.has(g)||loc(g)===loc(g+1))continue;seen.add(g);let p=t.glyf+loc(g),n=S(p);if(n<0){composites.push(c);continue}if(!n)continue;
    let x0=S(p+2),y0=S(p+4),x1=S(p+6),y1=S(p+8),ends=Array.from({length:n},(_,i)=>U(p+10+2*i)),N=ends[n-1]+1,q=p+10+2*n;q+=2+U(q);let f=[];
    while(f.length<N){let v=raw[q++],r=v&8?raw[q++]+1:1;while(r--)f.push(v)}
    let X=[],Y=[],x=0,y=0;for(let v of f){x+=v&2?(v&16?1:-1)*raw[q++]:v&16?0:(q+=2,S(q-2));X.push(x)}
    for(let v of f){y+=v&4?(v&32?1:-1)*raw[q++]:v&32?0:(q+=2,S(q-2));Y.push(y)}
    let lines=[],a=0;
    for(let end of ends){let pts=[];for(let i=a;i<=end;i++)pts.push([X[i],Y[i],f[i]&1]);a=end+1;let out=[];
      for(let i=0;i<pts.length;i++){let A=pts[i],B=pts[(i+1)%pts.length];out.push(A);if(!A[2]&&!B[2])out.push([(A[0]+B[0])/2,(A[1]+B[1])/2,1])}
      while(!out[0][2])out.push(out.shift());out.push(out[0]);let prev=out[0];
      for(let i=1;i<out.length;i++){let b=out[i];if(b[2]){lines.push([prev[0],prev[1],b[0],b[1]]);prev=b}else{let e=out[++i],start=out[i-2];for(let j=1;j<=8;j++){let u=j/8,v=1-u,m=[v*v*start[0]+2*u*v*b[0]+u*u*e[0],v*v*start[1]+2*u*v*b[1]+u*u*e[1]];lines.push([prev[0],prev[1],...m]);prev=m}}}
    }
    gs.push({c,g,x0,y0,w:x1-x0,h:y1-y0,lines})
  }
  function decode(s){return s.split("|").map(s=>{let [xy,rs]=s.split(";"),[x,y]=xy.split(",").map(Number),a=new Uint32Array(80);for(let z of rs.split(",")){let [b,n]=z.split(":"),v=parseInt(b,36);for(let i=0;i<+(n||1);i++,y++){a[2*y]=v<<x;a[2*y+1]=x?v>>>(32-x):0}}return a})}
  const A=decode(maskA),B=decode(maskB);
  function raster(g,sy,sx,jitter=0){let h=g.h*sy,w=g.w*sx;if(h>40||w>40||h<15||w<1)return null;let a=new Uint32Array(80),x0=(40-w)/2+jitter,y0=(40-h)/2-jitter;
    for(let j=0;j<40;j++){let yy=g.y0+g.h-(j+.5-y0)/sy;if(yy<g.y0||yy>g.y0+g.h)continue;let hits=[];
      for(let [ax,ay,bx,by] of g.lines){if((ay<=yy&&by>yy)||(by<=yy&&ay>yy))hits.push([ax+(bx-ax)*(yy-ay)/(by-ay),by>ay?1:-1])}
      hits.sort((a,b)=>a[0]-b[0]);let n=0,prev=0;for(let [x,v] of hits){if(n){let l=Math.max(0,Math.ceil(x0+(prev-g.x0)*sx-.5)),r=Math.min(39,Math.ceil(x0+(x-g.x0)*sx-.5)-1);for(let i=l;i<=r;i++)a[j*2+(i>>>5)]|=1<<(i&31)}n+=v;prev=x}
    }
    return a
  }
  function pop(v){v-=v>>>1&0x55555555;v=(v&0x33333333)+(v>>>2&0x33333333);return ((v+(v>>>4)&0x0f0f0f0f)*0x01010101)>>>24}
  function dist(a,b){let s=0,t=0;for(let i=0;i<80;i++){s+=pop(a[i]&b[i]);t+=pop(a[i])+pop(b[i])}return t?1-2*s/t:0}
  function hung(a){let n=a.length,m=a[0].length,u=new Float64Array(n+1),v=new Float64Array(m+1),p=new Int32Array(m+1),way=new Int32Array(m+1);
    for(let i=1;i<=n;i++){p[0]=i;let j0=0,min=new Float64Array(m+1).fill(Infinity),used=new Uint8Array(m+1);
      do{used[j0]=1;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=m;j++)if(!used[j]){let cur=a[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}
      for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]);
      do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)
    }
    let ids=new Array(n);for(let j=1;j<=m;j++)if(p[j])ids[p[j]-1]=j-1;return {mean:ids.reduce((s,j,i)=>s+a[i][j],0)/n,ids}
  }
  if(gs.length<29)return {glyphs:gs.length,composites,status:"insufficient glyphs"};
  let H=gs.map(g=>g.h).sort((a,b)=>a-b)[Math.floor(gs.length/2)];
  function search(obs,sy0=null,sx0=null){let best=null;
    function test(sy,sx){let C=gs.map((g,i)=>[i,raster(g,sy,sx)]).filter(x=>x[1]);if(C.length<29)return;let M=obs.map(a=>C.map(b=>dist(a,b[1]))),z=hung(M);if(!best||z.mean<best.mean)best={mean:z.mean,sy,sx,ids:z.ids.map(i=>C[i][0]),max:Math.max(...z.ids.map((j,i)=>M[i][j]))}}
    if(sy0===null){for(let fac of [.8,.9,1,1.1,1.2])for(let ratio of [.5,.7,.9,1.1,1.3])test(30/H*fac,30/H*fac*ratio);if(!best)return null;sy0=best.sy;sx0=best.sx}
    for(let a of [-.08,-.04,0,.04,.08])for(let b of [-.12,-.06,0,.06,.12])test(sy0*(1+a),sx0*(1+b));
    return best
  }
  let z=search(A);if(!z)return {glyphs:gs.length,composites,status:"no assignment"};
  let held=z.ids.map((j,i)=>dist(B[i],raster(gs[j],z.sy,z.sx)));
  let sy=z.sy*1.017,sx=z.sx*.983;
  // Independently shifted pixel-center raster of the 29 selected slots.
  let C=z.ids.map(j=>raster(gs[j],sy,sx,.25));
  let ct=search(C,sy,sx),control={mean:ct.mean,max:ct.max,exact:ct.ids.filter((j,i)=>j===z.ids[i]).length,plantSy:sy,plantSx:sx,fitSy:ct.sy,fitSx:ct.sx};
  let pairs=z.ids.map((j,i)=>({slot:gs[j].c,gid:gs[j].g,train:dist(A[i],raster(gs[j],z.sy,z.sx)),holdout:held[i]}));
  return {glyphs:gs.length,composites,medianH:H,train:z.mean,trainMax:z.max,sy:z.sy,sx:z.sx,holdout:held.reduce((a,b)=>a+b,0)/29,holdoutMax:Math.max(...held),control,pairs}
}
if(typeof module!=="undefined")module.exports={scan};

const maskA="15,5;3n,cj,6b,37,1n,1r,v,cv,6f,6b,37,1r,v,f,7:2,3:14|13,5;1,3:2,7,f,v,1r,3f,37,6b,cj,oz,1hf,2yr,5xf,5j7,b2b:2,9hf:12|15,5;3:5,7,f,v:2,1r,37,6b,cj,df,6r,37,1r,v,f,7:2,3:9|15,5;1:2,3,7,3z,db,73,6z,37,2r,7,5r,db,73,6z,37,2r,3:13|15,5;1:2,3,7,f,v,1r,1n,37,6b,cj,6b,37,1n,1r,r,1n:2,1f:3,37,2r:2,6b:2,5f:2,cj:2|13,5;3:19,r,1r,3j,73,dj,qv,oz,1dv,2rn,5j7,b2b|14,5;2rr,16u:2,1e6,1e4,lo,po:2,bc,e0:2,6o:4,2o,6o:3,e0:2,bc,po:2,lo:2,1e6:2,16u,2rr|15,5;1:2,3,7,f,v,1r,1n,37,6b,cj,6b,37,3f,1r,v,f,7,3:12|14,5;16v:4,173,17j,18f:2,19z,1d3,1jb,1hj,1hr,1en,18f,1a7,19z,1d3,1jb,1hj,1dz:2,16v:8|15,5;1k:10,1m,1r,1q,1o,1k,3c:2,6w,e0,54,1k:10|19,5;3:30|14,5;2o:10,6o,e0,sc,1ku,31r:2,1ku,sc,e0,6o,2o:10|14,5;g,1c,34:2,6o,ds,s0,1gw,hc,34:12,3a,3j,3i,3g,3c,34,2o:2|13,5;1,3:2,4qv,bv3,5jz,2tb,1ff,s3,rn,cj,3n,3:6,5f,cj,rn,1kj,1ff,2tb,5jz,b2n,4qv,3,1:2|11,5;2nif,18y6,mu4,bso,6b4,34w:2,1j4,ow:22|15,5;3:8,77:2,ar,cj,df,dv,e3,cf,bj,b3,av,ar:2,ap,ao:8|13,5;1s,68,ds,s0,1ko,1ks,2y6,5pj,1ra,68:21|15,5;1:2,3,7,f,v,1r,37,6r,6b,df,6b,37,1r,v,1r,37,6b,cj,6b,6r,3f,1r,v,f,7,3,1:2|13,5;6bl:2,9hf,b2f,bv3,c9r,chr,b23,a9f,9ur,9mr,9hf:19|13,5;6bl:2,9hf,b2f,bv3,c9r,chr,awv,a9j,9uv:2,a9j,ayn,chr,c9r,bv3,b2f,9hj:13|15,5;1:2,3,7,f,v,1r,1n,37,6b,cj,3n,3:18|13,5;1ky,5jb,2ry:2,1ek,qg,ds:2,68,ds,s8,qg,1ek,2ry,5jb:2,2ry,1ek,qg,s8,ds,68,ds:2,qg,1ek,2ry:2,5jb,1ky|14,5;1s,68,6o,e0,qk,1em,2ry,1e6,1i4,s8,e0,6o:2,ds,e0,c8,pk,po:2,lo,1e6:3,172,16u,2rr:5|13,5;b2b:5,b2f,bv3,c9b,c9r,chn,bub,bfn:2,bub:2,chr,c9r,bv3,b2f:2,b2b:10|15,5;1:2,3,7,3z,db,e7,73,6v,2v,1z,f,v,1r,3j,3b,6f,5j,7:12|15,5;1:2,3,7,f,v,1r,3f,37,6b,cn,3z,v:2,1n,37,6b,cj,5f,3:11|13,5;1:2,3,7,f,v,1r,1n,37,6b,cj,qr,1hf,2yr,2rn,5j7,b2b:2,9hf:12|13,5;b7r,b7q,5ou:2,2j0,2xo:2,1ko:2,s0:3,dc:2,cg:2,dc:2,s0:3,1ko:2,2xo:2,2j0,5ou:2,b7q,b7r|8,5;18zr6,4dh53,27026,2cyzg,16u64,mh2w,b1tc,52ow,1k5c,5j4:21";
const maskB="15,5;3n,cj,6b,37,3f,1r,v,cv,dj,6b,37,1r,v,f:2,7,3:14|13,5;1:2,3,7,f,v,1r,3j,3b,6f,cn,qv,1hj,2yv,5xj,5jb,b2f:2,9hj:12|15,5;3:5,7,f,v:2,1r,37,6b,cj,6b,6r,37,1r,v,f,7:2,3:9|15,5;1:2,3,7,3z,db,73,6z,37,2v,7,5r,db,73,6z,37,2r,3:13|15,5;1:2,3,7,f,v,1r,1n,37,6b,df,6b,37,1n,1r,r,1n:2,1f:2,37:2,2r:2,6b:2,5f:2,cj:2|13,5;3:19,r,1r,3j,73,dj,qv,oz,1dv,2rn,5j7,b2b|14,5;16v,1dz,li:2,pa,p8,b0,d8:2,60,6w:2,6o,34:5,6w:2,60,d4,d8,b0:2,pa,lq,li,1dy,1dz|15,5;1:2,3,7,f,v,1r,1n,37,6b,cj,6b,37,3f,1r,v,f,7:2,3:11|14,5;16r:3,16v,173,17j:2,18b,19v,1cz,1j7,1jb,1hr,1en,18f,18b,19v,1cz,1j7:2,1hf,1dv,16r:8|15,5;1k:10,1m,1r,1q,1o,1k,3c:2,6w,e0,54,1k:10|19,5;3:30|14,5;2o:10,6o,e0,sc,1ku,31r:2,1ku,sc,e0,6o,2o:10|14,5;g,1c,34:2,6o,ds,s0,1gw,og,34:12,3a,3b,3i,3g,3c,34:2,2o|13,5;1:2,3,4qv,b2n,5jz,2tb,1h7,s3,df,cj,3n,3:6,5f,df,s3,1gz,2tb,5jz,bv3,b2f,3:2,1|11,5;2nif,18y6,mu4,bso,6b4,35c,34w,1j4,ow:22|15,5;7:8,7b:2,av,cn,dj,dz:2,cf,bj,b3,av:2,ar,ap,ao:8|13,5;1s,68,ds,s0,s8,1ks,2y6,5pj,1ra,68:21|15,5;1:2,3,7,f,v,1r,1n,37,6b,df,6b,37,1r:3,1n,37,6b,cj,6b,37,1r,v:2,f,7,3,1:2|13,5;6bl:2,9hf,b2f,bv3,c9r,chr,cjf,bub,bfn,b7n,b2b:19|13,5;6bl:2,9hf,b2f,bv3,c9r,chr,awr,a9f,9ur:2,a9f,b23,chr,c9r,bv3,b2f:2,9hf:12|15,5;1:2,3,7,f,v,1r,3f,37,6b,cj,3n,3:18|13,5;1ky,5jb,2ry:2,1ek,qg,ds:2,68,ds,s8,qg,1ek,2ry,5jb:2,2ry,1ek,qg,s8,ds,68,ds:2,qg,1ek,2ry:2,5jb,1ky|14,5;1s,2o,6o,e0,po,1em,2z3,1e6,1i4,s8,e0,6o:3,e0,c8,bc,po:2,lo,1e6:3,16u,16v:2,2rr:3,2rn|13,5;9hj:5,b2f,bv3,c9r:2,chr,a9j,9uv:2,a9j,b1z,chr,c9r,bv3,b2f:2,9hj:10|15,5;1:2,3,7,3z,db,73,6z,37,2r,7,f,v,1r,1n,37,6b,5f,3:12|15,5;1,3:2,7,f,v,1r,3f,37,6b,cn,3z,v:2,1n,37,6b,cj,5f,3:11|13,5;1:2,3,7,f,v,1r:2,37,6b,df,qr,1hf,2yr,2rn,5j7,b2b:14|13,5;b7r,4w7,5om,5ou,2j0,2xo:2,1ko:2,s0:3,dc:2,68,5c,dc:2,s0:3,1ko:2,2xo:2,2j0,5ou,5om,4w7,b7r|8,5;18zr6,4dh53,27026,140t8,16u64,mh2w,b1tc,52ow,1k8w,5j4:21";
if(typeof module!=="undefined")module.exports={scan,maskA,maskB};
if(typeof require!=="undefined"&&typeof module!=="undefined"&&require.main===module){const fs=require("fs");for(const p of process.argv.slice(2))console.log(JSON.stringify({file:p,...scan(fs.readFileSync(p).toString("base64"),maskA,maskB)}));}
