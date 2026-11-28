"use strict";
/** SFT: p25 MEANING20 -> finite p40 PATHS key serializer. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json");
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const m=x=>((x%29)+29)%29,H=(a,b)=>[m(a-b),m(a+b)];
const state={K:2,a:6,e:3,g:5,q:4,A:8,p:23};
const U=[3,10,16,3,8,20];
assert.deepEqual(U,[state.e,state.K*state.g,m(state.K-15),state.e,state.A,state.q*state.g]);
const x=U[5];assert.equal(U.slice(0,state.g).reduce((a,b)=>a+b,0),40);assert.equal(x,20);
const outer=H(U[0],U[5]);assert.deepEqual(outer,[12,23]);assert.deepEqual(outer,[state.a*state.K,state.p]);
const p23Pairs=[[state.K,state.a],[state.e,state.g]];
const receiver=corpus.pages.find(p=>p.page===40).indices.slice(71,75);
assert.deepEqual(receiver,[4,15,14,21]);
// Arity gate: repeat x r times, then H-coordinate and right field s.
const eligible=p23Pairs.filter(([r])=>r+2===receiver.length);
assert.deepEqual(eligible,[[state.K,state.a]]);
const [r,s]=eligible[0],keys=outer.map(y=>[...Array(r).fill(x),y,s]);
assert.deepEqual(keys,[[20,20,12,6],[20,20,23,6]]);
const body=signed.split("-----BEGIN PGP SIGNATURE-----")[0].slice(signed.indexOf("Hello."));
const words=(body.match(/\b[A-Za-z]+\b/g)||[]).map(w=>w.toUpperCase());
assert.equal(words[20],"MEANING");assert.equal(words[40],"PATHS");
const tokens=[["ING",21],["NG",21],["TH",2],["EO",12],["OE",22],["AE",25],["IA",27],["IO",27],["EA",28],["QU",5],["Q",5],["K",5],["V",1],["Z",15],...corpus.translit.filter(x=>x.length===1).map(x=>[x,corpus.translit.indexOf(x)])].sort((a,b)=>b[0].length-a[0].length);
function encode(w){const out=[];for(let i=0;i<w.length;){const t=tokens.find(x=>w.startsWith(x[0],i));assert.ok(t,w+"@"+i);out.push(t[1]);i+=t[0].length;}return out;}
const targets=[...new Map(words.map((w,i)=>[w,{i,w,r:encode(w)}])).values()].filter(x=>x.r.length===4);
const local=[];
for(const key of keys)for(const sign of [1,-1]){const P=receiver.map((v,i)=>m(v-sign*key[i]));const hits=targets.filter(t=>t.r.every((v,i)=>v===P[i])).map(t=>[t.i,t.w]);local.push({key,sign,P,hits});}
assert.deepEqual(local.filter(x=>x.hits.length),[{key:[20,20,12,6],sign:1,P:[13,24,2,15],hits:[[40,"PATHS"]]}]);
const events=[];
for(const pg of corpus.pages.filter(p=>p.page<=55))for(let pos=0;pos+4<=pg.indices.length;pos++){const C=pg.indices.slice(pos,pos+4);for(const key of keys)for(const sign of [1,-1]){const P=C.map((v,i)=>m(v-sign*key[i]));for(const t of targets)if(t.r.every((v,i)=>v===P[i]))events.push({page:pg.page,pos,key,sign,target:t.w,index:t.i});}}
assert.deepEqual(events,[{page:40,pos:71,key:[20,20,12,6],sign:1,target:"PATHS",index:40}]);
console.log(JSON.stringify({p25:{cube:U,cut:state.g,outputs:[40,20],labels:[words[40],words[20]],meaningState:"qg"},p23:{pairs:p23Pairs,eligible},outerH:outer,keys,local,manuscriptWideEvents:events,classification:"retrospective finite upstream key serializer; no blind plaintext claim"},null,2));
