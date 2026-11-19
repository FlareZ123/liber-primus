"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,".."),M=29;
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const mod=x=>((x%M)+M)%M;
const sum=a=>mod(a.reduce((x,y)=>x+y,0));
const digits=(n,b)=>{const o=[];do{o.unshift(n%b);n=Math.floor(n/b);}while(n);return o;};
const H=v=>{const o=[];let l=0,r=v.length-1;while(l<r){o.push(mod(v[l]-v[r]),mod(v[l]+v[r]));l++;r--;}if(l===r)o.push(v[l]);return o;};

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tx=read("resources/liber-primus/lp2-transcription.txt");
const squares=read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\n\s*\n/u).map(b=>b.split("\n").map(l=>l.trim().split(/\s+/u).map(Number)));
const msum=sq=>sq[0].reduce((a,b)=>a+b,0);
const pair=squares.filter(s=>msum(s)===1033).sort((a,b)=>a.length-b.length);
assert.deepEqual(pair.map(s=>s.length),[5,7]);
const small=pair[0],large=pair[1],g=5,Kstate=2;
const [e,q]=digits(small[2][2],29),lc=digits(large[3][3],29),A=lc[0]-e;
const s1033=digits(1033,29),a=s1033[1],B=mod(A-s1033[2]);
const p=large[e-1][a-1],b=large[e-1][g+Kstate-1];
const state={p,g,a,b,A,B,K:Kstate,e,q};
assert.deepEqual(state,{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});
const counts=[q,g,q], target=[mod(A+g),p,a];
assert.deepEqual(counts,[4,5,4]);
assert.deepEqual(target,[13,23,6]);

const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=tx.split(/^\s*%\s*$/m).slice(0,55);
const pages=parts.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let cur=[],ss=0,es=0,st=0;
function flush(){if(!cur.length)return;if(ss===es){const pg=pages[ss];pg.words.push({ordinal:pg.words.length+1,start:st,values:cur.slice()});}cur=[];}
for(let s=0;s<parts.length;s++)for(const ch of [...parts[s]]){const v=ri.get(ch);if(v!==undefined){if(!cur.length){ss=s;st=pages[s].offset;}es=s;cur.push(v);pages[s].offset++;}else if(ch==="/"||/\s/u.test(ch)){}else flush();}flush();

const toks=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(text){const s=text.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<s.length;){const t=toks.find(x=>s.startsWith(x.symbol,i));assert.ok(t);o.push(t.value);i+=t.symbol.length;}return o;}
const plain=[...gp("EPIPHANY"),...gp("SEEKS")];assert.equal(plain.length,13);

const rows=[];
for(const pg of pages)for(let i=0;i+1<pg.words.length;i++){const w1=pg.words[i],w2=pg.words[i+1];if(w1.values.length!==8||w2.values.length!==5)continue;const C=[...w1.values,...w2.values],key=C.map((v,j)=>mod(v-plain[j])),h=H(key);const sums=[sum(h.slice(0,4)),sum(h.slice(4,9)),sum(h.slice(9,13))];rows.push({page:pg.page,ordinals:[w1.ordinal,w2.ordinal],start:w1.start,sums,match:JSON.stringify(sums)===JSON.stringify(target)});}
assert.equal(rows.length,19);
assert.deepEqual(rows.filter(r=>r.match),[{page:0,ordinals:[1,2],start:0,sums:[13,23,6],match:true}]);

console.log(JSON.stringify({
 status:"PASS",
 state,
 marker:{counts,stateCountIdentity:["q","g","q"],columnSums:target,stateSumIdentity:["A+g","p","a"]},
 receiverFamily:{count:rows.length,matches:rows.filter(r=>r.match)},
 all:rows,
 decision:"p0 is the sole adjacent 8+5 receiver whose H(key) column sums match the independently reconstructed marker/state packet."
},null,2));
