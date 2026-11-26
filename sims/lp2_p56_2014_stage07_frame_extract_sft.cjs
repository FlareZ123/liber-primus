"use strict";
/*
 * Reproduce the source-directed Stage07 extract_frames step and test the
 * appended 9133 clue as an MPEG-frame count/index.
 * Source archive: krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469
 * Stage07 README calls extract_frames.c with --no-info; the upstream
 * mpg123 example extracts valid MPEG frames and can omit the Xing/Info frame.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const ARCHIVE="krisyotam/cicada3301",COMMIT="76d3ee8c762f60025822c8c05edbf31351636469";
const TARGET="36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const SOURCE={"path":"archives/cijhho/assets/2014/stage07/index.mp3","size":6651873,"blob":"09fe068192b76a3697c47ec1d604b527703db798"};
const BITRATES={
 "1-1":[0,32,64,96,128,160,192,224,256,288,320,352,384,416,448,0],
 "1-2":[0,32,48,56,64,80,96,112,128,160,192,224,256,320,384,0],
 "1-3":[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0],
 "2-1":[0,32,48,56,64,80,96,112,128,144,160,176,192,224,256,0],
 "2-2":[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0],
 "2-3":[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
};
const SR=[44100,48000,32000];
function id3End(b){
 if(b.length>=10&&b.toString("ascii",0,3)==="ID3"){
  const n=((b[6]&127)<<21)|((b[7]&127)<<14)|((b[8]&127)<<7)|(b[9]&127);
  return 10+n+((b[5]&0x10)?10:0);
 }
 return 0;
}
function headerAt(b,o){
 if(o+4>b.length||b[o]!==255||(b[o+1]&0xe0)!==0xe0)return null;
 const v=(b[o+1]>>3)&3,lb=(b[o+1]>>1)&3,protection=b[o+1]&1;
 if(v===1||lb===0)return null;
 const layer=4-lb,bi=(b[o+2]>>4)&15,si=(b[o+2]>>2)&3,pad=(b[o+2]>>1)&1;
 if(bi===0||bi===15||si===3)return null;
 const version=v===3?1:(v===2?2:2.5);
 const table=BITRATES[(version===1?"1":"2")+"-"+layer];
 const kbps=table[bi],samplerate=SR[si]/(version===1?1:(version===2?2:4));
 let length;
 if(layer===1)length=Math.floor(12*kbps*1000/samplerate+pad)*4;
 else if(layer===3&&version!==1)length=Math.floor(72*kbps*1000/samplerate)+pad;
 else length=Math.floor(144*kbps*1000/samplerate)+pad;
 const mono=((b[o+3]>>6)&3)===3;
 let isInfo=false;
 if(layer===3){
  const side=(version===1?(mono?17:32):(mono?9:17));
  const marker=o+4+(protection?0:2)+side;
  const m=b.toString("ascii",marker,marker+4);
  isInfo=m==="Xing"||m==="Info";
 }
 return {offset:o,version,layer,kbps,samplerate,length,mono,isInfo};
}
function parseFrames(b){
 const start=id3End(b),frames=[];let o=start,resync=0;
 while(o+4<=b.length){
  let h=headerAt(b,o);
  if(!h||o+h.length>b.length){
   let next=o+1;while(next+4<=b.length&&!headerAt(b,next))next++;
   if(next+4>b.length)break;
   o=next;resync++;h=headerAt(b,o);
   if(!h||o+h.length>b.length)break;
  }
  frames.push({...h,bytes:b.subarray(o,o+h.length)});
  o+=h.length;
 }
 return {start,frames,resync,trailing:b.length-o};
}
function sha(name,b){return crypto.createHash(name).update(b).digest("hex");}
async function main(){
 const url="https://raw.githubusercontent.com/"+ARCHIVE+"/"+COMMIT+"/"+SOURCE.path.split("/").map(encodeURIComponent).join("/");
 const response=await fetch(url,{headers:{"User-Agent":"liber-primus-stage07-frame-sft"}});
 if(!response.ok)throw new Error("MP3 fetch HTTP "+response.status);
 const mp3=Buffer.from(await response.arrayBuffer());
 assert.equal(mp3.length,SOURCE.size,"MP3 size");
 const git=sha("sha1",Buffer.concat([Buffer.from("blob "+mp3.length+"\0"),mp3]));
 assert.equal(git,SOURCE.blob,"MP3 Git blob SHA-1");
 const parsed=parseFrames(mp3);
 const all=Buffer.concat(parsed.frames.map(x=>x.bytes));
 const noInfo=Buffer.concat(parsed.frames.filter(x=>!x.isInfo).map(x=>x.bytes));
 const infoFrames=parsed.frames.filter(x=>x.isInfo);
 const nth=parsed.frames[9132]||null;
 const candidates=[
  {label:"raw-index-mp3",bytes:mp3},
  {label:"valid-mpeg-frame-stream",bytes:all},
  {label:"valid-mpeg-frame-stream-with-info-removed",bytes:noInfo}
 ];
 if(nth)candidates.push({label:"9133rd-mpeg-frame-one-indexed",bytes:nth.bytes});
 const results=candidates.map(x=>({label:x.label,bytes:x.bytes.length,sha512:sha("sha512",x.bytes),blake2b512:sha("blake2b512",x.bytes)})).map(x=>({...x,matches:{sha512:x.sha512===TARGET,blake2b512:x.blake2b512===TARGET}}));
 const summary={
  source:{repository:ARCHIVE,commit:COMMIT,path:SOURCE.path,size:mp3.length,gitBlobSHA1:git},
  target:TARGET,
  extraction:"MPEG frame-header parser mirroring mpg123 extract_frames: strips ID3/non-frame bytes; reports both all valid frames and the README's requested Info/Xing-frame omission",
  id3End:parsed.start,frameCount:parsed.frames.length,infoFrameCount:infoFrames.length,frameCountWithoutInfo:parsed.frames.length-infoFrames.length,
  resyncCount:parsed.resync,trailingBytes:parsed.trailing,
  frame9133:nth?{offset:nth.offset,length:nth.length,version:nth.version,layer:nth.layer,bitrateKbps:nth.kbps,sampleRate:nth.samplerate,infoFrame:nth.isInfo}:null,
  frameCountEquals9133:parsed.frames.length===9133,
  frameCountWithoutInfoEquals9133:parsed.frames.length-infoFrames.length===9133,
  candidates:results,
  matches:results.filter(x=>x.matches.sha512||x.matches.blake2b512).length
 };
 console.log(JSON.stringify(summary,null,2));
}
main().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});
