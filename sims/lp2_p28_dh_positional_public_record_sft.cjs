"use strict";
const fs = require("node:fs");
const path = require("node:path");

function experiment(corpus,transcription) {
  const eq=(condition,msg)=>{if(!condition)throw Error(msg)};
  const decode=(digits)=>digits.reduce((a,d)=>a*29n+BigInt(d),0n);
  const encode=(value)=>{let n=BigInt(value),out=[];do{out.unshift(Number(n%29n));n/=29n}while(n);return out};
  const prime=(n)=>{if(n<2n)return false;if(n%2n===0n)return n===2n;for(let d=3n;d*d<=n;d+=2n)if(n%d===0n)return false;return true};
  const pow=(a,e,p)=>{let out=1n;for(;e>0n;e>>=1n,a=a*a%p)if(e&1n)out=out*a%p;return out};
  const accepts=(v)=>v.length===4&&prime(v[0])&&v.slice(1).every(x=>x>0n&&x<v[0]);
  eq(encode(3301).map(n=>"0123456789ABCDEFGHIJKLMNOPQRS"[n]).join("")==="3QO","signed BASE29 example");
  const controls=[
    {label:"signed worked example",v:[23,5,8,19],secret:6,shared:2},
    {label:"held participant log DH 5",v:[5,3,2,3],secret:3,shared:2},
    {label:"held participant log DH 3301",v:[3301,2757,1264,2800],secret:331,shared:1067}
  ];
  const checked=controls.map(({label,v,secret,shared})=>{
    const digits=v.map(encode),decoded=digits.map(decode);
    eq(decoded.every((d,i)=>d===BigInt(v[i])),label+" exact transport");
    eq(accepts(decoded),label+" domain");
    eq(pow(decoded[1],BigInt(secret),decoded[0])===decoded[2],label+" public share");
    eq(pow(decoded[3],BigInt(secret),decoded[0])===BigInt(shared),label+" shared");
    const bad=[decoded[0],decoded[0],decoded[2],decoded[3]];
    eq(!accepts(bad),label+" malformed range");
    eq(!accepts([decoded[0]*2n,...decoded.slice(1)]),label+" malformed modulus");
    return {label,encoded:digits,decoded:v,shared,negativeControls:2};
  });
  const pages=transcription.split(/^\s*%\s*$/m);
  const lines=pages[28].trim().split("/").filter(x=>x.trim());
  const line=lines[5].trim();
  const groups=line.match(/[\u16A0-\u16FF]+/gu);
  const digits=groups.map(g=>[...g].map(r=>corpus.runes.indexOf(r)));
  eq(digits.length===5&&digits[0].join(",")==="23,8","literal DH field");
  const before=lines.slice(0,5).flatMap(l=>[...l].map(r=>corpus.runes.indexOf(r)).filter(v=>v>=0)).length;
  eq(before===117&&digits.flat().join(",")===corpus.pages.find(p=>p.page===28).indices.slice(before,before+23).join(","),"independent rune-tape agreement");
  const fields=digits.slice(1);
  const pUpper=29n**BigInt(fields[0].length)-1n;
  const gLower=29n**BigInt(fields[1].length-2);
  eq(fields[1][0]!==fields[1][1],"distinct first generator digits");
  eq(fields[1].at(-1)!==fields[1].at(-2),"distinct last generator digits");
  eq(gLower>pUpper,"all-bijection contradiction");
  const forward=fields.map(decode), reverse=fields.map(d=>decode([...d].reverse()));
  eq(!accepts(forward)&&!accepts(reverse),"canonical negative");
  return {controls:checked,original:{line,offset:before,digits,forward:forward.map(String),reverse:reverse.map(String),modulusUpper:String(pUpper),generatorLower:String(gLower),gOverP:true,scope:"ordered p,g,A,B; any stationary bijective GP29 digit alphabet; global forward or global reverse within each fragment"}};
}

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/transcriptions/lp2-image-corrected.txt"),"utf8");
console.log(JSON.stringify(experiment(corpus,transcription),null,2));
