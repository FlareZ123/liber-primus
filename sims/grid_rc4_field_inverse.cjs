"use strict";
/**
 * Source-constrained RC4 stream inverse over original 32x8 byte grid.
 * Compare GP29 additive pads and the reversible exponent-step rank28 map.
 * 8 table serializations (literal or SHA256 digest) x 4 RC4 drops x
 * global/page-reset x 2 projections x 2 signs x 2 alphabets = 256 configurations.
 * Independent planted English GP control and exact source-key roundtrip.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {encodeGP}=require("./exponent_feedback_lookup_attack.cjs");
const root=path.join(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const english=encodeGP(fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const lens=pages.map(x=>x.length),original=pages.flat();
const cut=lens.slice(0,28).reduce((a,b)=>a+b,0);
const N=original.length;
const modulo=(x,m)=>(x%m+m)%m;
const pow=[],lg=new Int8Array(29).fill(-1);
for(let i=0,v=1;i<28;i++){pow[i]=v;lg[v]=i;v=v*15%29;}
/** @param {number[]} key */
function rc4(key){
  const s=Uint8Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++){
    j=(j+s[i]+key[i%key.length])&255;
    const temp=s[i];s[i]=s[j];s[j]=temp;
  }
  let i=0;j=0;
  return ()=>{
    i=(i+1)&255;j=(j+s[i])&255;
    const temp=s[i];s[i]=s[j];s[j]=temp;
    return s[(s[i]+s[j])&255];
  };
}
function sources(){
  const row=grid.byte_rows.flat(),column=[];
  for(let j=0;j<8;j++)for(const r of grid.byte_rows)column.push(r[j]);
  const ans=[];
  for(const [shape,arr] of [["row",row],["column",column]])
    for(const [dir,bytes] of [["forward",arr],["reverse",[...arr].reverse()]]){
      ans.push({id:shape+"-"+dir+"-literal",bytes});
      ans.push({id:shape+"-"+dir+"-sha256",
        bytes:[...crypto.createHash("sha256").update(Buffer.from(bytes)).digest()]});
    }
  return ans;
}
/** @param {number[]} key @param {number} drop @param {boolean} reset */
function stream(key,drop,reset){
  const result=[];
  let next=rc4(key);
  for(let p=0;p<pages.length;p++){
    if(reset||p===0){next=rc4(key);for(let d=0;d<drop;d++)next();}
    for(let j=0;j<lens[p];j++)result.push(next());
  }
  return result;
}
/**
 * @param {number[]} cipher @param {number[]} key
 * @param {"additive"|"step"} family
 * @param {"low"|"high"} projection @param {number} sign
 */
function inverse(cipher,key,family,projection,sign){
  const out=[];
  let p=0;
  for(const len of lens)for(let i=0;i<len;i++,p++){
    const pad=projection==="low"?key[p]:key[p]>>>3;
    if(family==="additive")out.push(modulo(cipher[p]-sign*pad,29));
    else if(i===0)out.push(cipher[p]);
    else{
      const delta=modulo(cipher[p]-cipher[p-1],29);
      out.push(delta===0?28:modulo(lg[delta]-sign*pad,28));
    }
  }
  return out;
}
/** @param {number[]} plain @param {number[]} key */
function encodeStep(plain,key){
  const out=[];
  let p=0;
  for(const len of lens)for(let i=0;i<len;i++,p++)
    out.push(i===0?plain[p]:
      plain[p]===28?out[p-1]:
      (out[p-1]+pow[modulo(plain[p]+key[p],28)])%29);
  return out;
}
/** @param {number[]} a @param {number} begin @param {number} end */
function ioc(a,begin,end){
  const count=end-begin,h=new Uint32Array(29);
  for(let i=begin;i<end;i++)h[a[i]]++;
  let s=0;for(const v of h)s+=v*(v-1);
  return s/(count*(count-1));
}
function main(){
  const inputs=sources(),drops=[0,256,768,3072],configs=[];
  for(const input of inputs)for(const drop of drops)for(const reset of [false,true]){
    const bytes=stream(input.bytes,drop,reset);
    for(const family of ["additive","step"])
      for(const projection of ["low","high"])
        for(const sign of [-1,1]){
          const plain=inverse(original,bytes,family,projection,sign);
          configs.push({source:input.id,drop,reset,family,projection,sign,
            train:ioc(plain,0,cut),hold:ioc(plain,cut,N)});
        }
  }
  configs.sort((a,b)=>b.train-a.train);
  const key=stream(inputs[0].bytes,768,true);
  const plant=Array.from({length:N},(_,i)=>english[i%english.length]);
  const cipher=encodeStep(plant,key);
  const checks=[];
  for(const option of configs){
    const input=inputs.find(x=>x.id===option.source);
    const decoded=inverse(cipher,stream(input.bytes,option.drop,option.reset),
      option.family,option.projection,option.sign);
    checks.push({...option,plantTrain:ioc(decoded,0,cut),
      plantHold:ioc(decoded,cut,N),
      matches:decoded.reduce((s,x,i)=>s+Number(x===plant[i]),0)});
  }
  checks.sort((a,b)=>b.plantTrain-a.plantTrain);
  const target=checks.find(o=>o.source===inputs[0].id&&
    o.drop===768&&o.reset===true&&o.family==="step"&&
    o.projection==="low"&&o.sign===1);
  console.log(JSON.stringify({total:N,cut,tested:configs.length,
    sourceSerializations:inputs.map(x=>x.id),
    originalTopByTrain:configs.slice(0,8),
    positiveTopByTrain:checks.slice(0,5),
    exactPlantRecovery:target.matches,plantCipherCount:cipher.length},null,2));
  if(target.matches!==N||checks[0].matches!==N)
    throw new Error("original-source RC4 control failed to recover its key");
}
if(require.main===module)main();
module.exports={rc4,sources,stream,inverse,encodeStep};
