'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const URL='https://raw.githubusercontent.com/Dukotah/cicada3301/master/corpus/A-primary-artifacts/2014/signed_interconnectedness_decoded.bin';
function sha(b){return crypto.createHash('sha256').update(b).digest('hex');}
function eoiOffset(b,start){
  if(b[start]!==0xff||b[start+1]!==0xd8)return -1;
  let i=start+2, n=b.length;
  while(i<n){
    if(b[i]!==0xff){const j=b.indexOf(0xff,i);if(j<0)return -1;i=j;}
    while(i<n&&b[i]===0xff)i++;
    if(i>=n)return -1;
    const m=b[i++];
    if(m===0xd9)return i;
    if(m===0xd8||m===0x01||(m>=0xd0&&m<=0xd7))continue;
    if(i+2>n)return -1;
    const len=b.readUInt16BE(i);
    if(len<2||i+len>n)return -1;
    i+=len;
    if(m===0xda){
      while(i<n){
        const j=b.indexOf(0xff,i);if(j<0)return -1;i=j+1;
        while(i<n&&b[i]===0xff)i++;
        if(i>=n)return -1;
        const c=b[i];
        if(c===0x00||(c>=0xd0&&c<=0xd7)){i++;continue;}
        i=j;break;
      }
    }
  }
  return -1;
}
function dimensions(b){
  let i=2;
  while(i+4<b.length){
    if(b[i]!==0xff){i++;continue;}
    while(b[i]===0xff)i++;
    const m=b[i++];
    if(m===0xd9||m===0xda)return null;
    if(m===0xd8||m===0x01||(m>=0xd0&&m<=0xd7))continue;
    if(i+2>b.length)return null;
    const len=b.readUInt16BE(i);if(len<2||i+len>b.length)return null;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m)){
      return {width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3),sof:'0x'+m.toString(16)};
    }
    i+=len;
  }
  return null;
}
(async()=>{
  const res=await fetch(URL);if(!res.ok)throw new Error('HTTP '+res.status);
  const audio=Buffer.from(await res.arrayBuffer());
  const offsets=[];let p=0;
  while((p=audio.indexOf(Buffer.from([0xff,0xd8,0xff]),p))>=0){offsets.push(p);p+=3;}
  const outDir=path.join(process.cwd(),'artifacts','interconnectedness-jpegs');
  fs.mkdirSync(outDir,{recursive:true});
  const manifest={source:URL,source_length:audio.length,source_sha256:sha(audio),images:[]};
  for(let k=0;k<offsets.length;k++){
    const start=offsets[k],end=eoiOffset(audio,start);
    if(end<0){manifest.images.push({index:k+1,start,eoi:null,error:'no EOI'});continue;}
    const image=audio.subarray(start,end);
    const name='image-'+String(k+1).padStart(2,'0')+'-offset-'+start+'.jpg';
    fs.writeFileSync(path.join(outDir,name),image);
    manifest.images.push({index:k+1,name,start,end,size:image.length,sha256:sha(image),dimensions:dimensions(image),nextJpegOffset:offsets[k+1]??null});
  }
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify(manifest,null,2));
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
