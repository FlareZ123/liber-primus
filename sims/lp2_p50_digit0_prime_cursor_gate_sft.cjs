'use strict';
/** Director #1509: literal-leading-zero p50 hold mask on a p56-style phi-prime cursor. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const src=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-grid-256.json'),'utf8'));
const txt=fs.readFileSync(path.join(root,'resources','liber-primus','lp2-transcription.txt'),'utf8');
const lp1=fs.readFileSync(path.join(root,'resources','liber-primus','lp1-plaintext-reference.txt'),'utf8');
const cipher=src.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const tokens=grid.pages.flatMap(p=>p.tokens); assert.equal(tokens.length,256);
const mask=Uint8Array.from(tokens,t=>Number(t[0]==='0')); assert.equal([...mask].reduce((a,b)=>a+b,0),60);
const pageStart=[];let acc=0;for(const p of src.pages){pageStart[p.page]=acc;if(p.page<=55)acc+=p.indices.length;}
const trainHi=pageStart[3],holdHi=pageStart[8];assert.equal(trainHi,729);assert.equal(holdHi-trainHi,1145);
const runeMap=new Map(src.runes.map((r,i)=>[r,i])),words=[];let parsed=[],ws=-1;
for(const ch of txt){if(parsed.length>=cipher.length)break;if(runeMap.has(ch)){if(ws<0)ws=parsed.length;parsed.push(runeMap.get(ch));}else if(ch!=='/'&&ch!=='%'&&!/\s/.test(ch)&&ws>=0){words.push([ws,parsed.length]);ws=-1;}}
if(ws>=0)words.push([ws,parsed.length]);assert.deepEqual(parsed,cipher);
const trainWords=words.filter(([a,b])=>a>=0&&b<=trainHi);assert.equal(trainWords.length,158);const lens=trainWords.map(([a,b])=>b-a);
const gp=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpWord(w){const s=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');const out=[];for(let i=0;i<s.length;){const h=gp.find(t=>s.startsWith(t.s,i));if(!h)return null;out.push(h.i);i+=h.s.length;}return out;}
const training=lp1.split('### 56')[0].split('\n').filter(x=>!x.trim().startsWith('#')&&!x.includes('[')).flatMap(x=>x.toUpperCase().match(/[A-Z]+/g)||[]).map(gpWord).filter(Boolean);
const byLen=Array.from({length:30},()=>[]);for(const w of training)byLen[w.length].push(w);for(const n of new Set(lens))assert.ok(byLen[n].length);
const counts=Array.from({length:30},()=>Array(29).fill(.2));for(const w of training){let prev=29;for(const p of w){counts[prev][p]++;prev=p;}}
const logp=counts.map(r=>{const s=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/s));});
function score(plain){let v=0,n=0;for(const [a,b] of trainWords){let prev=29;for(let i=a;i<b;i++){v+=logp[prev][plain[i]];prev=plain[i];n++;}}return v/n;}
function primes(n){const out=[];for(let x=2;out.length<n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}if(ok)out.push(x);}return out;}
const qs=primes(3500),key=qs.map(p=>(p-1)%29),adv=new Int32Array(holdHi+1);for(let i=0;i<holdHi;i++)adv[i+1]=adv[i]+(mask[i&255]?0:1);assert.equal(adv[trainHi],560);assert.equal(adv[holdHi],1438);
function decode(start,hi=trainHi){return Array.from({length:hi},(_,i)=>(cipher[i]-key[start+adv[i]]+29)%29);}
// Authentic p56 regression.
const p56c=src.pages.find(p=>p.page===56).indices,expected='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56p=expected.split(' ').flatMap(w=>{const r=gpWord(w);assert.ok(r);return r;});let pk=0;const p56d=p56c.map((c,i)=>i===56?0:(c-key[pk++]+29)%29);assert.deepEqual(p56d,p56p);
// Deterministic native plant under the exact mask clock.
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
const rr=rng(0x1509C1CA),plantWords=lens.map(n=>byLen[n][Math.floor(rr()*byLen[n].length)]),plant=plantWords.flat();assert.equal(plant.length,729);
const pc=plant.map((p,i)=>(p+key[adv[i]])%29),pd=pc.map((c,i)=>(c-key[adv[i]]+29)%29);assert.deepEqual(pd,plant);
const threshold=-2.3902192881828106,rows=[];for(let start=0;start<=463;start++){const p=decode(start);const hist=Array(29).fill(0);for(const x of p)hist[x]++;rows.push({start,prime:qs[start],score:score(p),ioc:hist.reduce((v,n)=>v+n*(n-1),0)/(729*728)});}rows.sort((a,b)=>b.score-a.score);
assert.equal(rows.filter(x=>x.score>=threshold).length,0);assert.equal(rows[0].start,238);assert.equal(rows[0].prime,1499);assert.ok(Math.abs(rows[0].score-(-4.3192689479683395))<1e-12);
console.log(JSON.stringify({threshold,survivors:0,best:rows[0],holdoutInspected:false,p56Exact:true,plantExact:true},null,2));
