'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const load = name => Buffer.from(fs.readFileSync(path.join(root, 'resources', 'historical', name), 'utf8'), 'base64');
const gitBlob = b => crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
const png = load('cicada2013-twitter-decoded.png.b64');
const mirror = load('cicada2013-twitter-outt-mirror.png.b64');
assert.equal(gitBlob(png), 'fd1052f8ae704cad8dcf005759182f39631fb187');
assert.equal(gitBlob(mirror), '78fa894efeaa05e00e25d2388f3aa30f6c5f44b1');
assert.equal(png.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
let width, height, depth, type, interlace, end;
const data = [];
for (let i=8; i<png.length;) {
  const n=png.readUInt32BE(i), name=png.toString('ascii',i+4,i+8);
  const b=png.subarray(i+8,i+8+n);
  if(name==='IHDR') {
    width=b.readUInt32BE(0); height=b.readUInt32BE(4);
    depth=b[8]; type=b[9]; interlace=b[12];
  }
  if(name==='IDAT') data.push(b);
  i+=n+12;
  if(name==='IEND') {end=i; break;}
}
assert.deepEqual([width,height,depth,type,interlace,end],[521,523,8,4,0,15330]);
const raw=zlib.inflateSync(Buffer.concat(data));
const stride=width*2, rowBytes=stride+1;
assert.equal(raw.length,height*rowBytes);
const filterCounts=Array(5).fill(0);
const grayCounts=Array(256).fill(0), alphaCounts=Array(256).fill(0);
const pixel=Buffer.alloc(width*height);
const reconstructed=Buffer.alloc(height*stride);
let prior=Buffer.alloc(stride);
const paeth=(a,b,c)=>{
  const p=a+b-c, da=Math.abs(p-a), db=Math.abs(p-b), dc=Math.abs(p-c);
  return da<=db&&da<=dc?a:db<=dc?b:c;
};
const predictor=(t,a,b,c)=>[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][t];
for(let y=0;y<height;y++){
  const t=raw[y*rowBytes]; assert(t<5); filterCounts[t]++;
  const row=reconstructed.subarray(y*stride,(y+1)*stride);
  for(let x=0;x<stride;x++){
    const a=x>=2?row[x-2]:0,b=prior[x],c=x>=2?prior[x-2]:0;
    const k=predictor(t,a,b,c);
    row[x]=(raw[y*rowBytes+x+1]+k)&255;
    assert.equal((row[x]-k)&255,raw[y*rowBytes+x+1]);
  }
  for(let x=0;x<width;x++){
    const g=row[x*2], a=row[x*2+1];
    grayCounts[g]++; alphaCounts[a]++; pixel[y*width+x]=g;
  }
  prior=row;
}
assert.deepEqual(filterCounts,[0,81,392,0,50]);
assert.deepEqual(grayCounts.slice(0,8),[253959,2826,1533,1454,1396,1533,7176,2606]);
assert.equal(grayCounts.slice(8).reduce((a,b)=>a+b,0),0);
assert.equal(alphaCounts[255],width*height);
const graySum=grayCounts.reduce((s,n,i)=>s+n*i,0);
assert.equal(graySum,84801);
const planes=[];
for(let bit=0;bit<3;bit++){
  let count=0,minX=width,minY=height,maxX=-1,maxY=-1;
  for(let i=0;i<pixel.length;i++)if((pixel[i]>>bit)&1){
    const x=i%width,y=Math.floor(i/width);
    count++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  }
  planes.push({bit,count,bbox:[minX,minY,maxX,maxY]});
}
assert.deepEqual(planes.map(p=>p.count),[8419,12769,12711]);
assert(png.equals(mirror.subarray(0,png.length)));
const tail=mirror.subarray(png.length), tailB64=tail.toString('base64'), motif='33010';
let match=0;while(match<tailB64.length&&tailB64[match]===motif[match%5])match++;
assert.equal(tail.length,13592);
assert.equal(match,18106);
assert.equal(tailB64.slice(match),'EB8E/cYf0kdRPiNaI=');
console.log(JSON.stringify({width,height,depth,type,interlace,filterCounts,grayCounts:grayCounts.slice(0,8),graySum,grayMean:graySum/(width*height),alpha:255,planes,mirrorTailBytes:tail.length,base64PaddingMatch:match,unclassifiedSuffix:tailB64.slice(match)},null,2));

// Independently archived profile copy shared by the 2013 and 2014 paths.
// This is an RGB8, non-interlaced image with Sub on every row.
const profile=load('cicada2013-2014-twitter-profile.png.b64');
assert.equal(gitBlob(profile),'0c1f977b134d4779b10ac26ffbd84c029d3163d7');
assert.equal(profile.readUInt32BE(16),400);
assert.equal(profile.readUInt32BE(20),400);
assert.deepEqual([...profile.subarray(24,29)],[8,2,0,0,0]);
const pdat=[];
for(let i=8;i<profile.length;){
  const n=profile.readUInt32BE(i),type=profile.toString('ascii',i+4,i+8);
  if(type==='IDAT')pdat.push(profile.subarray(i+8,i+8+n));
  i+=n+12;
}
const pr=zlib.inflateSync(Buffer.concat(pdat)), w=400,h=400,ps=w*3;
assert.equal(pr.length,h*(ps+1));
const pp=Buffer.alloc(w*h), hist=Array(256).fill(0);
for(let y=0;y<h;y++){
  assert.equal(pr[y*(ps+1)],1);
  const row=Buffer.alloc(ps);
  for(let x=0;x<ps;x++)row[x]=(pr[y*(ps+1)+x+1]+(x>=3?row[x-3]:0))&255;
  for(let x=0;x<w;x++){
    assert.equal(row[3*x],row[3*x+1]); assert.equal(row[3*x],row[3*x+2]);
    pp[y*w+x]=row[3*x]; hist[row[3*x]]++;
  }
}
assert.deepEqual(hist.slice(0,8),[149060,1943,1819,1625,1509,2200,1841,3]);
assert.equal(hist.slice(8).reduce((a,b)=>a+b,0),0);
const at=(x,y)=>pixel[Math.max(0,Math.min(height-1,y))*width+Math.max(0,Math.min(width-1,x))];
let sums=Array(6).fill(0);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sx=(x+.5)*width/w-.5,sy=(y+.5)*height/h-.5;
  const ix=Math.floor(sx),iy=Math.floor(sy),u=sx-ix,v=sy-iy;
  const a=at(ix,iy)*(1-u)*(1-v)+at(ix+1,iy)*u*(1-v)+at(ix,iy+1)*(1-u)*v+at(ix+1,iy+1)*u*v;
  const b=pp[y*w+x];
  sums[0]+=a;sums[1]+=b;sums[2]+=a*a;sums[3]+=b*b;sums[4]+=a*b;sums[5]+=(b-a)**2;
}
const n=w*h,cor=(sums[4]-sums[0]*sums[1]/n)/Math.sqrt((sums[2]-sums[0]**2/n)*(sums[3]-sums[1]**2/n)),rmse=Math.sqrt(sums[5]/n);
assert(Math.abs(cor-0.9336772008445936)<1e-10);
assert(Math.abs(rmse-0.46690029889990703)<1e-10);
console.log(JSON.stringify({profile:{w,h,filterCounts:[0,400,0,0,0],grayHistogram:hist.slice(0,8),correlation:cor,rmse}},null,2));
