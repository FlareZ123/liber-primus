"use strict";
/** SFT: p6 adjacent-H length schedule -> p23 red rubric. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json"),ink=J("resources/liber-primus/lp2-ink-annotations.json");
const segs=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8").split("%"),runes=new Set(corpus.runes);
const m=x=>((x%29)+29)%29,H=v=>[m(v[0]-v[1]),m(v[0]+v[1]),m(v[2]-v[3]),m(v[2]+v[3])];
function segment(p){return p===50?"":segs[p<50?p:p-1]||"";}
function words(p){const pg=corpus.pages.find(x=>x.page===p),out=[];let o=0,s=0,on=false;for(const ch of Array.from(segment(p))){if(runes.has(ch)){if(!on){s=o;on=true;}o++;}else if("-.$&§".includes(ch)&&on){out.push({start:s,end:o,len:o-s});on=false;}}if(on)out.push({start:s,end:o,len:o-s});assert.equal(o,pg.runic_count,`p${p}`);return out;}
const all=new Map(corpus.pages.map(p=>[p.page,words(p.page)]));
function red(p,start){const ip=ink.pages.find(x=>x.page===p),sp=ip.red_spans.find(x=>x.start===start);return all.get(p).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);}
const p6=red(6,71).map(w=>w.len),p23=red(23,0).map(w=>w.len);
assert.deepEqual(p6,[4,1,4,2]);assert.deepEqual(p23,[2,6,3,5]);
const h6=H(p6);assert.deepEqual(h6,[3,5,2,6]); // [e,g,K,a]
assert.deepEqual([h6[2],h6[3],h6[0],h6[1]],p23); // pair swap
const exactFour=[];
for(const ip of ink.pages)for(const sp of ip.red_spans||[]){const ws=all.get(ip.page).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);if(ws.length===4)exactFour.push([ip.page,sp.start,ws.map(w=>w.len)]);}
assert.deepEqual(exactFour,[[6,71,[4,1,4,2]],[23,0,[2,6,3,5]]]);
const wins=[];for(const [page,ws] of all)for(let i=0;i+4<=ws.length;i++){const q=ws.slice(i,i+4),L=q.map(w=>w.len);wins.push({page,start:q[0].start,L,H:H(L)});}
assert.equal(wins.length,2802);
const family=[];for(const swap of [false,true])for(const r0 of [false,true])for(const r1 of [false,true]){let a=[h6[0],h6[1]],b=[h6[2],h6[3]];if(r0)a.reverse();if(r1)b.reverse();family.push((swap?[b,a]:[a,b]).flat());}
const uniq=[...new Map(family.map(v=>[v.join(","),v])).values()],eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
assert.equal(uniq.length,8);
assert.deepEqual(wins.filter(w=>eq(w.H,h6)).map(w=>[w.page,w.start]),[[6,71]]);
assert.deepEqual(wins.filter(w=>uniq.some(v=>eq(w.H,v))).map(w=>[w.page,w.start]),[[6,71]]);
assert.deepEqual(wins.filter(w=>eq(w.L,p23)).map(w=>[w.page,w.start]),[[23,0]]);
assert.equal(wins.filter(w=>uniq.some(v=>eq(w.L,v))).length,10);
console.log(JSON.stringify({p6Lengths:p6,p6H:h6,state:["e","g","K","a"],p23Lengths:p23,relation:"pairSwap(p6H)=p23 lengths",conventions:8,census:{windows:2802,hFamilyHits:[[6,71]],exactP23Hits:[[23,0]],rawFamilyHits:10}},null,2));
