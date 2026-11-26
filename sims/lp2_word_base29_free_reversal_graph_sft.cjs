"use strict";
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const run=function(raw){
const gp=JSON.parse(raw[0]),ix=new Map(gp.runes.map((r,i)=>[r,i])),words=[];let page=0,w=[],start=0;const finish=()=>{if(w.length){words.push({w,page:start>=50?start+1:start,end:page>=50?page+1:page});w=[];}};
for(const c of raw[1].split('%').slice(0,55).join('%')){if(ix.has(c)){if(!w.length)start=page;w.push(ix.get(c));}else if(c==='%')page++;else if(c==='/'||/\s/u.test(c))continue;else finish();}finish();
if(words.length!==2896||words.flatMap(x=>x.w).join()!==gp.pages.slice(0,56).flatMap(p=>p.indices).join())throw Error("parse");
const chapters=[2,7,14,22,26,32,39,53,55];const tokens=gp.translit.map((s,i)=>[s,i]).concat([["ING",21],["IO",27]]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];while(s){const t=tokens.find(x=>s.startsWith(x[0]));if(!t)throw Error(s);a.push(t[1]);s=s.slice(t[0].length);}return a;}
const donors=raw.slice(2).map(t=>{const by=new Map();for(const s of t.toUpperCase().match(/[A-Z]+/g)){const v=encode(s);if(!by.has(v.length))by.set(v.length,[]);by.get(v.length).push(v);}return words.map((x,i)=>({...x,w:by.get(x.w.length)[i%by.get(x.w.length).length]}));});
function maxcover(ws){const d=new Int32Array(29),e=Array.from({length:29},()=>new Int32Array(29));for(const {w} of ws){const a=w[0],b=w.at(-1);d[a]++;if(a!==b){d[b]++;e[a][b]++;e[b][a]++;}}let best=0;for(let a=0;a<26;a++)for(let b=a+1;b<27;b++)for(let c=b+1;c<28;c++)for(let z=c+1;z<29;z++)best=Math.max(best,d[a]+d[b]+d[c]+d[z]-e[a][b]-e[a][c]-e[a][z]-e[b][c]-e[b][z]-e[c][z]);return best;}
function top4(ws){const d=new Int32Array(29);for(const {w} of ws)d[w.at(-1)]++;return [...d].sort((a,b)=>b-a).slice(0,4).reduce((a,b)=>a+b,0);}
function split(ws,key){const m=new Map();for(const x of ws){const k=key(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x);}return m;}
const keys={global:x=>0,chapter:x=>chapters.findIndex(p=>x.page<=p),width:x=>x.w.length,chapterWidth:x=>`${chapters.findIndex(p=>x.page<=p)}:${x.w.length}`,page:x=>x.page,pageWidth:x=>`${x.page}:${x.w.length}`};
const out={native:donors.map(top4),scopes:{}};for(const [name,key] of Object.entries(keys)){const groups=split(words,key),bounds=new Map([...groups].map(([k,ws])=>[k,maxcover(ws)]));out.scopes[name]={bound:[...bounds.values()].reduce((a,b)=>a+b,0),groups:groups.size,native:donors.map(ds=>{const dg=split(ds,key);const violations=[...dg].map(([k,ws])=>({k,need:top4(ws),bound:bounds.get(k),n:ws.length})).filter(x=>x.need>x.bound);return {violations:violations.length,excess:violations.reduce((a,x)=>a+x.need-x.bound,0)}})};}
const pack=w=>w.reduce((n,x)=>n*29n+BigInt(x),0n);
function unpack(n,L){const w=[];for(let i=0;i<L;i++){w.unshift(Number(n%29n));n/=29n;}return w;}
function inv(a,m){let x=0n,y=1n,b=m;while(a){const q=b/a;[b,a]=[a,b%a];[x,y]=[y,x-q*y];}if(b!==1n)throw Error("not unit");return (x%m+m)%m;}
out.controls=donors.map((ds,j)=>{const key=keys.chapterWidth;const cs=ds.map((x,i)=>{const L=x.w.length,ch=chapters.findIndex(p=>x.page<=p),m=29n**BigInt(L),a=BigInt(1+(ch*7+L*11+j*3)%28),b=BigInt(19+ch*59+L*31+j*43)%m,rev=((i*17+j*7+L*3)%13)<6;let c=unpack((a*pack(x.w)+b)%m,L);if(rev)c.reverse();const cc=rev?[...c].reverse():c;const p=unpack(((pack(cc)-b+m)*inv(a,m))%m,L);if(p.join()!==x.w.join())throw Error("roundtrip");return {...x,w:c};});const cb=split(cs,key),pb=split(ds,key);for(const [k,ws] of cb)if(maxcover(ws)<top4(pb.get(k)))throw Error("false rejection");return {roundtripRunes:cs.reduce((n,x)=>n+x.w.length,0),bound:[...cb.values()].reduce((n,ws)=>n+maxcover(ws),0),native:top4(ds)};});
return out;
};
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
