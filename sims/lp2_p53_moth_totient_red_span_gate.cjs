"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),mod=n=>((n%29)+29)%29;
const phi=n=>{let r=n,m=n;for(let p=2;p*p<=m;p++)if(m%p===0){while(m%p===0)m/=p;r=r/p*(p-1);}if(m>1)r=r/m*(m-1);return r;};
const blocks=read("resources/cicada2014-openpuff-magic-squares.txt").trim().split(/\r?\n[ \t]*\r?\n/u);
const square=blocks[2].trim().split(/\r?\n/u).map(x=>x.trim().split(/\s+/u).map(Number)).flat();
const key=square.map(x=>phi(x)%29);
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),annotations=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const page=corpus.pages.find(p=>p.page===53).indices,red=page.slice(128,179),trans=corpus.translit,ann=annotations.pages.find(p=>p.page===53);
assert.equal(square.length,25);assert.equal(key.length,25);assert.deepEqual(ann.red_spans.map(s=>[s.start,s.length]),[[128,51]]);
assert.equal(page.length,179);assert.equal(red.length,51);assert.deepEqual(red.map((v,i)=>v===0?i:-1).filter(i=>i>=0),[38]);
function quad(){const m=new Map();let total=0;for(const line of read("resources/control/duko_round27_english_quadgrams.txt").trim().split(/\r?\n/u)){const a=/^([A-Z]{4})\s+(\d+)$/u.exec(line.trim());if(a){m.set(a[1],+a[2]);total+=+a[2];}}return{m,total};}
const q=quad();
function score(a){const s=a.map(x=>trans[x]).join("").replace(/[^A-Z]/gu,"");let z=0,n=0;for(let i=0;i+4<=s.length;i++){z+=Math.log((q.m.get(s.slice(i,i+4))||0.01)/q.total);n++;}return{letters:s.length,mean:z/n,sample:s.slice(0,220)};}
function apply(a,k,sign,phase,skipLocal=null){let j=0,o=[];for(let i=0;i<a.length;i++){if(i===skipLocal){assert.equal(a[i],0);o.push(0);continue;}o.push(mod(a[i]+sign*k[(phase+j)%k.length]));j++;}return o;}
function best(a,k,phase,skip){return[-1,1].map(sign=>({sign,...score(apply(a,k,sign,phase,skip))})).sort((x,y)=>y.mean-x.mean)[0];}
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function shuffle(a,r){let b=a.slice();for(let i=b.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function nullTest(phase,seed){const obs=best(red,key,phase,38),r=rng(seed),v=[];for(let i=0;i<5000;i++){const k=shuffle(key,r);v.push(Math.max(score(apply(red,k,-1,phase,38)).mean,score(apply(red,k,1,phase,38)).mean));}const mean=v.reduce((a,b)=>a+b,0)/5000,s=v.slice().sort((a,b)=>a-b),ge=v.filter(x=>x>=obs.mean).length;return{observed:obs.mean,sign:obs.sign,mean,q95:s[4749],ge,p:(ge+1)/5001};}
const rawRed=score(red),rawPage=score(page),phase0=best(red,key,0,38),phase3=best(red,key,3,38);
const full={};for(const sign of[-1,1])full[sign]=score(apply(page,key,sign,0));
const noSkip={};for(const sign of[-1,1])noSkip[sign]=score(apply(red,key,sign,3));
const p57=corpus.pages.find(p=>p.page===57).indices,plant=p57.slice(0,50);plant.splice(38,0,0);
assert.equal(plant.length,51);assert.deepEqual(apply(apply(plant,key,1,3,38),key,-1,3,38),plant);
console.log(JSON.stringify({key,source:{p53PageLength:179,redStart:128,redLength:51,FLocal:38,pageClockPhase:3,processedSteps:50},raw:{red:rawRed,page:rawPage},phase0,phase3,noSkipPhase3:noSkip,nulls:{phase0:nullTest(0,0x53f126),phase3:nullTest(3,0x53f125)},fullPageDirectKeyNoSkip:full,solvedP57PlantRoundTrip:true},null,2));
