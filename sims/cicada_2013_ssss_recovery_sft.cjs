'use strict';
// 2013 public Cicada SSSS reconstruction. Source: pinned osresearch/ssss v0.5, ssss.c.
// Secondary share transcriptions and primary artifacts are indexed in resources/external/2013-ssss-primary-source-index.md.
const shares = {
  "2": "41cc481a51fe77f91600f593c1db2ce9babd2626ea6e",
  "3": "7678a5f6b72042d839151b34b02ffe161cf997fed484",
  "5": "fcd82965b6632ea25d80edc3e58baafb4b2938895cbd",
  "7": "f3adb3aacb0b4336fa28178bc1e5edce940c16ce5caa",
  "8": "b970e507dbc4ac115a273126f62671654c480fce32e5",
  "9": "82a98a7fe06014f783b752506cf6cd1fabaa3d8b3750",
  "10": "1668a611ba9fccddee2a0d8fd7e05df4d01c6d42a26d"
};
function run(shares){
const N=176n,P=(1n<<N)|(1n<<11n)|(1n<<3n)|(1n<<2n)|1n,mask=0xffffffffn,delta=0x9e3779b9n,ids=Object.keys(shares).map(Number);
function mul(a,b){let z=0n;while(b){if(b&1n)z^=a;b>>=1n;a<<=1n;if(a>>N)a^=P;}return z;}
function pow(a,n){let v=1n;while(n){if(n&1n)v=mul(v,a);a=mul(a,a);n>>=1n;}return v;}
function interpolate(sub,at){let z=0n;for(const i of sub){let num=1n,den=1n;for(const j of sub){if(i!==j){num=mul(num,BigInt(at^j));den=mul(den,BigInt(i^j));}}const y=BigInt("0x"+shares[i])^pow(BigInt(i),5n);z^=mul(y,mul(num,pow(den,(1n<<N)-2n)));}return z^pow(BigInt(at),5n);}
function diffusion(x,decode){const v=[];for(let i=0;i<11;i++){const w=Number((x>>BigInt(16*i))&65535n);v.push(w>>8,w&255);}const mix=u=>((((u<<4n)&mask)^(u>>5n))+u)&mask;
for(let k=0;k<440;k++){const idx=decode?878-2*k:2*k;const pos=Array.from({length:8},(_,j)=>(idx+j)%22);let a=0n,b=0n;for(let j=0;j<4;j++){a=(a<<8n)|BigInt(v[pos[j]]);b=(b<<8n)|BigInt(v[pos[j+4]]);}let s=decode?(32n*delta)&mask:0n;for(let j=0;j<32;j++){if(decode){b=(b-(mix(a)^s))&mask;s=(s-delta)&mask;a=(a-(mix(b)^s))&mask;}else{a=(a+(mix(b)^s))&mask;s=(s+delta)&mask;b=(b+(mix(a)^s))&mask;}}for(let j=0;j<4;j++){v[pos[j]]=Number((a>>BigInt(24-8*j))&255n);v[pos[j+4]]=Number((b>>BigInt(24-8*j))&255n);}}
let z=0n;for(let i=0;i<11;i++)z|=BigInt(v[2*i]*256+v[2*i+1])<<BigInt(16*i);return z;}
const expected="p7amjopgric7dfdi.onion",raw=BigInt("0x"+Array.from(expected,c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join("")),constant=diffusion(raw,false);
function assert(ok,msg){if(!ok)throw Error(msg);}
assert(diffusion(constant,true)===raw,"diffusion roundtrip");
let subsets=0,holdouts=0;
for(let omitted1=0;omitted1<ids.length;omitted1++)for(let omitted2=omitted1+1;omitted2<ids.length;omitted2++){const sub=ids.filter((_,i)=>i!==omitted1&&i!==omitted2);const y=interpolate(sub,0);assert(y===constant&&diffusion(y,true)===raw,"secret "+sub);for(const j of [ids[omitted1],ids[omitted2]]){assert(interpolate(sub,j)===BigInt("0x"+shares[j]),"held share "+j);holdouts++;}subsets++;}
const hex=x=>x.toString(16).padStart(44,"0");
return {subsets,holdouts,constant:hex(constant),decoded:expected,predictions:Object.fromEntries([1,4,6].map(j=>[j,hex(interpolate([2,3,5,7,9],j))]))};}
console.log(JSON.stringify(run(shares), null, 2));
