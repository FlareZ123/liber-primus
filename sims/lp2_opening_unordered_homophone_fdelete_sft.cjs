#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const hashes=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","df260a07d56bf5998d40a6360b6132c35c252d10","a92be8ba5b3511a003a22ba31523c14397aaa83a","94c677ad9dd50771c6670e0c4e4dad9052b46d85","1b064ef6d85819b7d96adaff31a82d1ec551598f"];
const expected=[["all729",729,34,64310540,0],["black716",716,33,62477771,0],["p0",262,14,27641955,22924],["p0black",249,13,25801433,153792],["p1",266,13,25798339,1300924],["p2",201,7,14748356,3319525]];
const data=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
for(let i=0;i<paths.length;i++){const b=Buffer.from(data[i]);const sha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(sha!==hashes[i])throw Error('input blob mismatch '+paths[i]);}
const c=JSON.parse(data[0]),m=new Map(c.translit.map((x,i)=>[x,i]));
function encode(s,reg){
 if(reg==='AZ')return [...s.toUpperCase().replace(/[^A-Z]/g,'')].map(x=>x.charCodeAt(0)-65);
 const cmp=reg==='GP29'?['ING','TH','NG','EO','OE','AE','IA','EA']:['ING','TH','NG','AE','IA','EA'],a=[];
 for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  for(let j=0;j<w.length;){const t=cmp.find(x=>w.startsWith(x,j))||w[j],v=m.get(t==='ING'?'NG':t);if(v===undefined)throw Error(t);a.push(v);j+=t.length;}
 }return a;
}
function count(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h;}
function subset(h,n){const s=new Uint8Array(n+1);s[0]=1;for(const v of h)if(v)for(let j=n;j>=v;j--)s[j]|=s[j-v];return s;}
function scan(a,h,d){
 const b=h.slice();b[0]-=d;const n=b.reduce((x,y)=>x+y,0);
 if(a.length<n)return {windows:0,passes:0,first:-1};
 const s=subset(b,n),x=new Int32Array(29);let bad=0,passes=0,first=-1;
 for(let j=0;j<n;j++)x[a[j]]++;for(let j=0;j<29;j++)bad+=!s[x[j]];
 for(let i=0;;i++){
  if(!bad){passes++;if(first<0)first=i;}if(i+n>=a.length)break;
  const k=a[i],l=a[i+n];if(k!==l){bad+=(!s[x[k]-1])-(!s[x[k]]);x[k]--;bad+=(!s[x[l]+1])-(!s[x[l]]);x[l]++;}
 }return {windows:a.length-n+1,passes,first};
}
const p=c.pages.slice(0,3).map(x=>x.indices);if(p.flat().length!==729||p[0].length!==262||p[1].length!==266||p[2].length!==201)throw Error('original dimensions');
const scopes=[['all729',p.flat()],['black716',[...p[0].slice(13),...p[1],...p[2]]],['p0',p[0]],['p0black',p[0].slice(13)],['p1',p[1]],['p2',p[2]]];
const refs=[];for(let i=1;i<=3;i++)for(const reg of ['AZ','GP27','GP29'])refs.push({donor:['gibran','emerson','shakespeare'][i-1],reg,a:encode(data[i],reg)});
const native=JSON.parse(data[4]),ix=new Map(native.runes.map((x,i)=>[x,i]));
for(const [i,s] of native.sections.entries())refs.push({donor:'solved'+i,reg:'nativeGP',a:[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x))});
const rows=[];for(const {donor,reg,a} of refs)for(const [name,v] of scopes){
 const h=count(v);let windows=0,passes=0,first=[];
 for(let d=0;d<=h[0];d++){const q=scan(a,h,d);windows+=q.windows;passes+=q.passes;if(q.passes)first.push({d,...q});}
 rows.push({donor,reg,name,n:v.length,F:h[0],length:a.length,windows,passes,first});
}
let seed=3301;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let i=0;i<500;i++){
 const h=Array.from({length:1+rand(10)},()=>1+rand(8)),n=h.reduce((a,b)=>a+b,0),s=subset(h,n),oracle=new Uint8Array(n+1);
 for(let mask=0;mask<(1<<h.length);mask++){let t=0;for(let j=0;j<h.length;j++)if(mask>>j&1)t+=h[j];oracle[t]=1;}
 if(s.some((v,j)=>v!==oracle[j]))throw Error('subset oracle');
}
const plants=[];for(const {donor,reg,a:full} of refs.filter(x=>x.reg==='GP27'||x.reg==='AZ')){
 const a=full.slice(41,290),active=[...new Set(a)],labels=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=rand(i+1);[labels[i],labels[j]]=[labels[j],labels[i]];}
 const hm=new Map(active.map((x,i)=>[x,[labels[i]]]));
 for(let i=active.length;i<29;i++)hm.get(active[rand(active.length)]).push(labels[i]);
 const h=count([...a.map(x=>{const g=hm.get(x);return g[rand(g.length)];}),...Array(7).fill(0)]),q=scan(a,h,7);
 if(q.passes!==1)throw Error('homophone plant');
 plants.push({donor,reg,offset:41,deletion:7,activePlain:active.length,activeCipher:h.filter(x=>x>0).length,result:q});
}
const summary=scopes.map(([name,v])=>[name,v.length,count(v)[0],rows.filter(x=>x.name===name).reduce((a,x)=>a+x.windows,0),rows.filter(x=>x.name===name).reduce((a,x)=>a+x.passes,0)]);
if(JSON.stringify(summary)!==JSON.stringify(expected))throw Error('summary mismatch');
console.log(JSON.stringify({inputBlobs:Object.fromEntries(paths.map((p,i)=>[p,hashes[i]])),summary,rows,plants,oracleCases:500,sourceCounts:scopes.map(([name,v])=>({name,h:count(v)}))},null,2));
