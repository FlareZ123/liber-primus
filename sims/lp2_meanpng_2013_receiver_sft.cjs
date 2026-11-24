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
