"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const c=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const ink=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const parts=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8").split(/^\s*%\s*$/m);
const ri=new Map(c.runes.map((r,i)=>[r,i])),m=x=>((x%29)+29)%29,H=(a,b)=>[m(a-b),m(a+b)];
function part(p){if(p===50)return"";return parts[p<=49?p:p-1]||"";}
function words(p){const out=[];let cur=[],off=0,start=0;const f=()=>{if(cur.length){out.push({start,end:off,len:cur.length});cur=[];}};for(const ch of Array.from(part(p))){if(ri.has(ch)){if(!cur.length)start=off;cur.push(ri.get(ch));off++;}else if(ch==="-"||ch===".")f();}f();return out;}
function redLens(p,s){const sp=ink.pages.find(x=>x.page===p).red_spans.find(x=>x.start===s);return words(p).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length).map(w=>w.len);}
const L6=redLens(6,71),L23=redLens(23,0),state={q:4,e:3,g:5,K:2,a:6,A:8};
assert.deepEqual(L6,[state.q,m(state.q-state.e),state.q,state.K]);
const h6=[...H(L6[0],L6[1]),...H(L6[2],L6[3])];
assert.deepEqual(h6,[state.e,state.g,state.K,state.a]);
assert.deepEqual(L23,[state.K,state.a,state.e,state.g]);
assert.deepEqual(L23,[h6[2],h6[3],h6[0],h6[1]]);
const h23=[...H(L23[0],L23[1]),...H(L23[2],L23[3])];
assert.deepEqual(h23,[m(-state.q),state.A,m(-state.K),state.A]);
assert.equal(state.K+state.a,state.A);assert.equal(state.e+state.g,state.A);
const card=[L23[0],L23[1],h23[0],h23[1],L23[2],L23[3],h23[2],h23[3]];
assert.deepEqual(card,[state.K,state.a,m(-state.q),state.A,state.e,state.g,m(-state.K),state.A]);
const primes=[];for(let n=2;primes.length<40;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break;}if(ok)primes.push(n);}
const T=n=>m(primes[n-1]-1),text=card.map(n=>c.translit[T(n)]).join("");
assert.equal(text,"THEONERISE");assert.equal(state.g-state.e,state.K);assert.equal(23+state.K,25);
console.log(JSON.stringify({p6:L6,p6H:h6,p23:L23,p23H:h23,stateCardinals:card,text,riseEqualsK:true,destination:25},null,2));
