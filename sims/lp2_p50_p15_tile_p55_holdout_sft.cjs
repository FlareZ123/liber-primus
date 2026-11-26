#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const assert=(x,m)=>{if(!x)throw new Error(m);};
const c=json('resources/liber-primus/lp2-corpus.json');
const g=json('resources/liber-primus/lp2-grid-256.json');
const s=json('resources/external/relikd-solved-gp29-native-v1.json');
const ri=new Map(c.runes.map((r,i)=>[r,i])), gp0=a=>a.reduce((x,y)=>x+y,0);
const lines=read('resources/transcriptions/liber_primus_master.txt').split(/\r?\n/);
const first=lines.findIndex(x=>/[\u16A0-\u16FF]/u.test(x)),src=lines.slice(first),pages=[[]];
for(const line of src){if(line.trim()==='%')pages.push([]);else pages[pages.length-1].push(line);}
function pageIndex(p){const target=c.pages.find(x=>x.page===p).indices;return pages.findIndex(ls=>{const a=[...ls.join('').replace(/[\/\s]/g,'')].filter(ch=>ri.has(ch)).map(ch=>ri.get(ch));return a.length===target.length&&a.every((v,i)=>v===target[i]);});}
function wordsOn(p){
 const wanted=pageIndex(p);assert(wanted>=0,'page alignment '+p);
 const out=[];let page=0,w=[],start=null,finish=()=>{if(w.length&&start===wanted)out.push(w);w=[];start=null;};
 for(const line of src){if(line.trim()==='%'){page++;continue;}for(const ch of line){if('-.&$§'.includes(ch))finish();else if(ri.has(ch)){if(!w.length)start=page;w.push(ri.get(ch));}}}
 finish();return out;
}
function sectionWords(name){const x=s.sections.find(y=>y.name===name);assert(x,'section '+name);return (x.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(ch=>ri.get(ch))).filter(a=>a.length&&a.every(Number.isInteger));}
const p55=wordsOn(55),p54=wordsOn(54),p56=sectionWords('p56_an_end');
const lens=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3],inputs=[61,32,33,83,74,11,168,97,42,30,97,82,24,81,35,45];
assert(JSON.stringify(p55.map(w=>w.length))===JSON.stringify(lens),'p55 lengths');
assert(JSON.stringify(p55.map(gp0))===JSON.stringify(inputs),'p55 GP0');
const counts=g.pages.map(p=>p.tokens.length),tokens=g.pages.flatMap(p=>p.tokens);
assert(JSON.stringify(counts)===JSON.stringify([80,104,72])&&tokens.length===256,'table token extraction');
const a59=g.alphabet.replace('f',''),val=t=>{const x=a59.indexOf(t[0]),y=a59.indexOf(t[1]);assert(x>=0&&y>=0,'bad token');return x*59+y;};
const core=Array.from({length:28},(_,r)=>Array.from({length:4},(_,col)=>(r+2)*8+col+2));
const path15=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12],order=[];
for(let b=0;b<7;b++)for(const q of path15)order.push(core[b*4+(q>>2)][q%4]);
assert(order.length===112&&new Set(order).size===112,'core order');
const vals=order.map(i=>val(tokens[i])),ptr=x=>x>=0&&x<112?vals[x]:null;
assert(ptr(94)===67&&ptr(42)===83,'p57 fixed links');
const names=['0_warning','0_welcome','0_wisdom','0_loss_of_divinity','0_koan_1','jpg107-167','jpg229'],dict=new Set();
for(const name of names)for(const w of sectionWords(name))dict.add(gp0(w));
const K=vals.filter(x=>dict.has(x)).length,outs=inputs.map(ptr);
const inDomain=inputs.filter(x=>ptr(x)!==null),unique=[...new Set(inDomain)];
const hits=outs.filter(x=>x!==null&&dict.has(x)).length,uniqueHits=unique.filter(x=>dict.has(ptr(x))).length;
assert(dict.size===113&&K===59&&inDomain.length===15&&unique.length===14&&hits===9&&uniqueHits===8,'holdout counts');
function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let z=1n;for(let i=1;i<=k;i++)z=z*BigInt(n-k+i)/BigInt(i);return z;}
function tail(N,K,n,t){let z=0n;for(let x=Math.max(0,t);x<=Math.min(n,K);x++)z+=choose(K,x)*choose(N-K,n-x);return z;}
function ratio(n,d){const scale=1000000000000000n;return Number(n*scale/d)/Number(scale);}
const uniqueP=ratio(tail(112,K,14,8),choose(112,14));
const dup=unique.find(x=>inDomain.filter(a=>a===x).length===2),dupHit=dict.has(ptr(dup));
const weightedN=BigInt(K)*tail(111,K-1,13,hits-2)+BigInt(112-K)*tail(111,K,13,hits);
const weightedP=ratio(weightedN,112n*choose(111,13));
const control=ws=>{const ad=[...new Set(ws.map(gp0).filter(x=>x>=0&&x<112))];return {uniqueInDomain:ad.length,matches:ad.filter(x=>dict.has(ptr(x))).length};};
console.log(JSON.stringify({
 tableTokenCounts:counts,coreShape:[28,4],coreCells:order.length,p55PageIndex:pageIndex(55),
 p57Checks:[ptr(94),ptr(42)],dictionary:{lp1WordSums:dict.size,coreCellsMatching:K},
 p55:{wordLengths:lens,inputGP0:inputs,outputBase59:outs,inDomainOccurrences:15,uniqueAddresses:14,occurrenceMatches:hits,uniqueMatches},
 controls:{p54:control(p54),p56:control(p56)},
 null:{expectedUnique:14*K/112,uniqueP,expectedOccurrences:15*K/112,weightedP,duplicateAddress:dup,duplicateIsHit:dupHit}
},null,2));
