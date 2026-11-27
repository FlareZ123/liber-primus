"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),g=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const s=read("resources/liber-primus/lp2-transcription.txt").trim().replace(/\r\n?/g,"\n").split(/\n%\n/);
const ix=new Map(c.runes.map((v,i)=>[v,i]));
/** @param {number} p @returns {number[][]} */
const w=p=>{let cur=[],out=[];for(const ch of s[p>=51?p-1:p]){if(ix.has(ch))cur.push(ix.get(ch));else if(ch!=="/"&&!/\s/u.test(ch)&&cur.length){out.push(cur);cur=[]}}if(cur.length)out.push(cur);return out};
/** @param {number} a @param {number} m */
const mod=(a,m)=>(a%m+m)%m;
/** @param {string} v @param {string} a */
const dec=(v,a)=>[...v].reduce((n,ch)=>n*a.length+a.indexOf(ch),0);
const t=g.rows.flat().map(v=>dec(v,g.alphabet));
/** @param {number} x @param {number} n */
const walk=(x,n)=>{let p=[x];while(n--)p.push(x=t[x]);return p};
const initial=[c.pages[33].indices[0],c.pages[33].indices[91]];
assert.deepEqual(initial,[23,21]);
let hits=[],mhits=[],valid=0;
for(let f=0;f<256;f++){
 const b=Array.from({length:8},(_,i)=>!!(f&(1<<i)));
 const [rev,base59,po,wo,to,col,sum,rr]=b;
 const alpha=base59?g.alphabet.replace("f",""):g.alphabet;
 const pair=[1033,3301].map(n=>{if(rev)n=n%60*60+Math.floor(n/60);let x=w(Math.floor(n/60)-Number(po))[n%60-Number(wo)];if(!x)return null;x=rr?[...x].reverse():x;let v=mod(x.reduce((a,b)=>sum?a+b:(a*29+b)%256,0)-Number(to),256);return dec(g.rows[col?v%32:Math.floor(v/8)][col?Math.floor(v/32):v%8],alpha)%29});
 if(pair.includes(null))continue;valid++;
 if(pair[0]===23&&pair[1]===21)hits.push({f,b,pair});
 if(pair[0]===19&&pair[1]===21)mhits.push({f,b,pair});
}
/** @param {number} a @param {number} n @param {number} m */
const pow=(a,n,m)=>{let v=1;while(n--)v=v*a%m;return v};
const logs=[89%23,79%23].map(x=>Array.from({length:22},(_,i)=>i).find(i=>pow(5,i,23)===x));
const result={valid,hits,mhits,Dwalk:walk(89,4),NGwalk:walk(79,8),Ddepths:[2,3,4,5,6,8,15,19,23].map(n=>[n,walk(89,n).at(-1)]),DNG_ord_title_sums:[23+10,21+8],DH:{shares:[89%23,79%23],logs,K:pow(5,logs[0]*logs[1],23)}};
assert.equal(valid,256);assert.equal(hits.length,0);assert.deepEqual(mhits.map(x=>x.f),[8]);
assert.deepEqual(result.Dwalk,[89,220,58,146,92]);
assert.deepEqual(result.NGwalk,[79,82,201,74,205,76,114,197,115]);
assert.equal(result.DH.K,19);
assert.ok(result.Ddepths.every(x=>x[1]!==81));
console.log(JSON.stringify(result,null,2));
