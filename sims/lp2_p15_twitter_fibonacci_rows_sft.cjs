'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
function experiment(A,tweets,b64Text,chart,nativeReference,ordering='spiral-rows'){
 const check=(b,msg)=>{if(!b)throw Error(msg);};const m29=x=>((x%29)+29)%29,m28=x=>((x%28)+28)%28;
 const F=[0,1,2];while(F.length<16)F.push(F.at(-1)+F.at(-2));
 let primes=[];for(let p=2;primes.length<988;p++){if(primes.every(q=>q*q>p||p%q))primes.push(p);}
 const grid=F.map(f=>Math.abs(3301-primes[f]));check(grid.join()==="3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516","p15 spiral");
 const rows=tweets.trim().split(/\r?\n/).map(line=>{const x=line.match(/^([0-9a-f]+):\s*([0-9a-f]+)$/i);check(x,"tweet row syntax");return {offset:parseInt(x[1],16),bytes:x[2].match(/../g).map(h=>parseInt(h,16))};}).sort((x,y)=>x.offset-y.offset);
 check(rows.length===988 && rows.every((r,i)=>r.offset===65*i && r.bytes.length===(i===987?12:65)),"tweet record shape");
 const T=rows.flatMap(x=>x.bytes),B=Array.from(b64Text,c=>c.charCodeAt(0)),G=Array.from(chart);
 check(T.length===64167&&B.length===T.length&&G.length===T.length,"source lengths");
 check(B.slice(0,8).map(x=>String.fromCharCode(x)).join("")==="iVBORw0K"&&G.slice(0,3).join()==="255,216,255","source format");
 const xor=(x,y)=>x.map((v,i)=>v^y[i]);
 const sources={twitter:T,b64:B,gematria:G,mask:xor(T,B),audio:xor(T,G),data:xor(B,G)};
 const physical=[3258,3222,3152,3038,3278,3299,3298,2838,3288,3294,3296,2472,4516,1206,708,1820];
 const rowOrder=ordering.startsWith("physical")?physical.map(v=>F[grid.indexOf(v)]):F;
 check(rowOrder.length===16&&new Set(rowOrder).size===16&&rowOrder.every(v=>F.includes(v)),"row permutation");
 check(["spiral-rows","spiral-columns","physical-rows","physical-columns"].includes(ordering),"ordering");
 const positions=ordering.endsWith("-rows")?rowOrder.flatMap(f=>Array.from({length:rows[f].bytes.length},(_,j)=>rows[f].offset+j)):Array.from({length:65},(_,j)=>rowOrder.filter(f=>j<rows[f].bytes.length).map(f=>rows[f].offset+j)).flat();
 check(positions.length===987&&new Set(positions).size===987,"selected rows");
 const keys=Object.fromEntries(Object.entries(sources).map(([k,v])=>[k,positions.map(p=>v[p])]));
 const text=nativeReference.split(/^### (\d+)\s*$/m);let train=[],nativeHeld=[];
 const tok=A.translit.map((s,i)=>[s,i]).sort((x,y)=>y[0].length-x[0].length);
 function enc(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w){const x=tok.find(([v])=>w.startsWith(v));check(x,`native spelling ${w}`);out.push(x[1]);w=w.slice(x[0].length);}}return out;}
 for(let j=1;j<text.length;j+=2){const page=+text[j];if(page>=56)continue;const lines=text[j+1].split(/\r?\n/).filter(l=>l.trim()&&!/^\s*[\[(#]/.test(l)&&!/\d{5,}/.test(l));const x=enc(lines.join("\n"));(page<14?train:nativeHeld).push(x);}
 const cnt1=new Float64Array(29),cnt2=new Float64Array(841),cnt3=new Float64Array(24389),base2=new Float64Array(29),base3=new Float64Array(841);let total=0;
 for(const s of train)for(let i=0;i<s.length;i++){const c=s[i];cnt1[c]++;total++;if(i){const p=s[i-1];cnt2[p*29+c]++;base2[p]++;if(i>1){const pair=s[i-2]*29+p;cnt3[pair*29+c]++;base3[pair]++;}}}
 const log1=Array.from(cnt1,v=>Math.log(29*(v+.5)/(total+14.5))),log2=new Float64Array(841),log3=new Float64Array(24389);
 for(let p=0;p<29;p++)for(let c=0;c<29;c++){const u=(cnt1[c]+.5)/(total+14.5),bi=(cnt2[p*29+c]+4*u)/(base2[p]+4);log2[p*29+c]=Math.log(29*bi);for(let a=0;a<29;a++){const pair=a*29+p;log3[pair*29+c]=Math.log(29*(cnt3[pair*29+c]+6*bi)/(base3[pair]+6));}}
 function score(s){if(!s.length)return null;let v=log1[s[0]];if(s.length>1)v+=log2[s[0]*29+s[1]];for(let i=2;i<s.length;i++)v+=log3[(s[i-2]*29+s[i-1])*29+s[i]];return v/s.length;}
 function direct(c,k,sign,delta=false){return c.map((v,i)=>m29(v-(delta&&i?c[i-1]:0)-sign*k[i%k.length]));}
 function forwardDirect(p,k,sign,delta=false){let out=[],last=0;for(let i=0;i<p.length;i++){const c=m29(p[i]+sign*k[i%k.length]+(delta?last:0));out.push(c);last=c;}return out;}
 function fhold(p,k,sign){let j=0;return p.map(v=>v===0?0:m29(v+sign*k[(j++)%k.length]));}
 function fReach(c,k,sign){let states=new Set([0]);for(let i=0;i<c.length;i++){let next=new Set();for(const j of states){if(c[i]===0)next.add(j);if(m29(c[i]-sign*k[j%k.length])!==0)next.add(j+1);}if(!next.size)return {prefix:i,endStates:0};states=next;}return {prefix:c.length,endStates:states.size};}
 const powers=[1];while(powers.length<28)powers.push(m29(powers.at(-1)*15));check(new Set(powers).size===28,"primitive root");const logs=[];powers.forEach((p,i)=>logs[p]=i);
 function rankDecode(c,k,sign,rank,escape,hold){let out=[],j=0;for(let i=1;i<c.length;i++){const p=c[i-1],v=c[i],d=m29(v-p);if(!d){out.push(escape);if(!hold)j++;continue;}const r=rank==="cycle"?d-1:rank==="log15"?logs[d]:v-(v>p?1:0);const x=m28(r-sign*k[j++%k.length]);out.push(x+(x>=escape?1:0));}return out;}
 function rankEncode(p,iv,k,sign,rank,escape,hold){let c=[iv],j=0;for(const v of p){const prev=c.at(-1);if(v===escape){c.push(prev);if(!hold)j++;continue;}const x=v-(v>escape?1:0),r=m28(x+sign*k[j++%k.length]);c.push(rank==="cycle"?m29(prev+r+1):rank==="log15"?m29(prev+powers[r]):r+(r>=prev?1:0));}return c;}
 const offsets=[{name:"p15-lower-rubric",page:15,skip:9},{name:"p15-black-body",page:15,skip:20},{name:"p16-start",page:16,skip:0}];const p40offset=A.pages.slice(0,40).reduce((s,p)=>s+p.indices.length,0),p54offset=A.pages.slice(0,54).reduce((s,p)=>s+p.indices.length,0);
 const tapes=offsets.map(o=>{const start=A.pages.slice(0,o.page).reduce((s,p)=>s+p.indices.length,0)+o.skip;return {...o,start,c:A.pages.slice(o.page,56).flatMap(p=>p.indices).slice(o.skip),h:p40offset-start,hEnd:p54offset-start};});
 const fitN=987;
 const held=nativeHeld.flat(), p57=A.pages[57].indices;
 check(held.length>200 && p57.length===95,"native held");
 const out={selection:{ordering,rowOrder,F,grid,offsets:F.map(f=>rows[f].offset),lengths:F.map(f=>rows[f].bytes.length),selectedBytes:positions.length,sourceBytes:T.length,operands:Object.keys(keys)},native:{trainRunes:total,heldRunes:held.length,heldScore:score(held),p57Score:score(p57)},direct:[],fhold:[],xor:[],rank:[],controls:{direct:0,fhold:0,rank:0},best:{}};
 const rankModes=["cycle","log15","sorted"];
 function excerpt(p){return p.slice(0,100).map(x=>A.translit[x]).join(" ");}
 const bestRank={};let rankTrials=0,rankPositive=0,maxRank=-Infinity;
 for(const [source,k] of Object.entries(keys)){
  for(const sign of [-1,1])for(const delta of [false,true]){const c=forwardDirect(held,k,sign,delta);check(direct(c,k,sign,delta).join()===held.join(),"direct control");out.controls.direct++;}
  for(const sign of [-1,1]){const c=fhold(held,k,sign);check(fReach(c,k,sign).prefix===held.length,"F hold control");out.controls.fhold++;}
  for(const rank of rankModes)for(const hold of [false,true])for(const sign of [-1,1]){const escape=source==="b64"?28:21;const c=rankEncode(held,17,k,sign,rank,escape,hold);check(rankDecode(c,k,sign,rank,escape,hold).join()===held.join(),"rank control");out.controls.rank++;}
  for(const o of tapes){
   for(const sign of [-1,1]){
    for(const delta of [false,true]){const p=direct(o.c,k,sign,delta);check(forwardDirect(p,k,sign,delta).join()===o.c.join(),"original direct replay");out.direct.push({source,origin:o.name,sign,delta,fit:score(p.slice(0,fitN)),hold:score(p.slice(o.h,o.hEnd)),excerpt:excerpt(p)});}
    const f=fReach(o.c,k,sign);out.fhold.push({source,origin:o.name,sign,...f,n:o.c.length});
   }
   const x=o.c.slice(0,fitN).map((v,i)=>v^k[i%k.length]);out.xor.push({source,origin:o.name,illegal:x.filter(v=>v>=29).length,n:x.length});
   for(const rank of rankModes)for(const hold of [false,true])for(const sign of [-1,1])for(let escape=0;escape<29;escape++){
    const p=rankDecode(o.c.slice(0,fitN+1),k,sign,rank,escape,hold);const fit=score(p);rankTrials++;rankPositive+=fit>0;maxRank=Math.max(maxRank,fit);
    const key=source+"|"+o.name;if(!bestRank[key]||fit>bestRank[key].fit)bestRank[key]={source,origin:o.name,rank,holdRepeat:hold,sign,escape,fit};
   }
  }
 }
 for(const v of Object.values(bestRank)){const o=tapes.find(x=>x.name===v.origin),k=keys[v.source],p=rankDecode(o.c,k,v.sign,v.rank,v.escape,v.holdRepeat);check(rankEncode(p,o.c[0],k,v.sign,v.rank,v.escape,v.holdRepeat).join()===o.c.join(),"original rank replay");v.hold=score(p.slice(o.h-1,o.hEnd-1));v.excerpt=excerpt(p);out.rank.push(v);}
 out.rankTrials=rankTrials;out.rankPositive=rankPositive;out.maxRank=maxRank;
 out.best.direct=out.direct.reduce((a,b)=>b.fit>a.fit?b:a);out.best.rank=out.rank.reduce((a,b)=>b.fit>a.fit?b:a);
 out.best.fhold=out.fhold.reduce((a,b)=>b.prefix>a.prefix?b:a);out.best.xor=out.xor.reduce((a,b)=>b.illegal<a.illegal?b:a);
 out.selectedHex=Object.fromEntries(Object.entries(keys).map(([k,v])=>[k,v.map(b=>b.toString(16).padStart(2,"0")).join("")]));
 return out;
}

// Usage: node sims/lp2_p15_twitter_fibonacci_rows_sft.cjs <historical-directory>
// Historical directory must contain tweets/full.txt, b64.txt, gematria.jpg from pinned archive commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3.
const h = process.argv[2]; if (!h) throw Error('Supply historical 2013/003-twitter directory');
const read = p => fs.readFileSync(p);
const gitblob = b => crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');
const sourceFiles = [path.join(h,'tweets/full.txt'),path.join(h,'b64.txt'),path.join(h,'gematria.jpg')];
const raw = sourceFiles.map(read);
const expected = ["b3164929b090ffee06490e8ca86f495aa1db50c7","3cf34e331497e7e85c6707c22d07e500397cc794","65ded13617196f0fd5d210855a75452ff2e7a340"];
raw.forEach((b,i)=>assert.equal(gitblob(b),expected[i],sourceFiles[i]));
const A = read('resources/liber-primus/lp2-corpus.json'), N = read('resources/liber-primus/lp1-plaintext-reference.txt');
assert.equal(gitblob(A),"054f2a0f780b7d46901acbe3d9bf4f0ac1801165"); assert.equal(gitblob(N),"8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d");
console.log(JSON.stringify(experiment(JSON.parse(A),raw[0].toString('utf8'),raw[1].toString('utf8'),raw[2],N.toString('utf8'),process.argv[3]||'spiral-rows'),null,2));
