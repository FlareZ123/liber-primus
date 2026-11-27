'use strict';
// npm install jpeg-js@0.4.4 (outside the repository if desired).
// Input: exact pinned MonokumaBear originalTreeImage.jpg, downloaded separately.
// Output: base64 of row-XOR alternating-run unsigned-varint encoding.
// node sims/lp2_tree_common_stock_mask_sft.cjs stock.jpg
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const jpeg=require('jpeg-js');
const bytes=fs.readFileSync(process.argv[2]);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(bytes),'6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34');
const image=jpeg.decode(bytes,{useTArray:true,formatAsRGBA:false,maxResolutionInMP:5});
assert.equal(image.width,1222);
assert.equal(image.height,1600);
const W=160,H=210,mask=new Uint8Array(W*H);
for(let y=0;y<H;y++)for(let j=0;j<W;j++){
 const x0=Math.floor(j*image.width/W),x1=Math.floor((j+1)*image.width/W);
 const y0=Math.floor(y*image.height/H),y1=Math.floor((y+1)*image.height/H);
 let n=0,k=0;
 for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){
  const i=(yy*image.width+xx)*3;
  n++;k+=(image.data[i]+image.data[i+1]+image.data[i+2])<384?1:0;
 }
 mask[y*W+j]=2*k>n?1:0;
}
assert.equal(mask.reduce((a,b)=>a+b,0),5334);
assert.equal(sha(mask),'a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993');
const enc=[];
function emit(n){while(n>=128){enc.push((n&127)|128);n>>=7;}enc.push(n);}
let last=0,run=0;
for(let i=0;i<mask.length;i++){
 const b=mask[i]^(i>=W?mask[i-W]:0);
 if(b===last)run++;else{emit(run);last=b;run=1;}
}
emit(run);
const b=Buffer.from(enc);
assert.equal(b.length,3043);
assert.equal(sha(b),'41d234747acf055667b789c6bdd8c72aaccf7e4414468d1c5e2ae2e6fd1d126d');
console.log(b.toString('base64'));
