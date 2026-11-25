'use strict';
// Read-only Node 22 SFT. Exact substitution-invariant collision upper certificate.
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(gp,t,grid,native){
 const check=(x,msg)=>{if(!x)throw Error(msg)}, same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const words=[];let pending=[];const m=new Map(gp.runes.map((x,i)=>[x,i]));
 for(const part of t.split("%").slice(3,8))for(const ch of part){if(m.has(ch))pending.push(m.get(ch));else if("-.".includes(ch)&&pending.length){words.push(pending);pending=[]}}
 if(pending.length)words.push(pending);
 const c=gp.pages[8].indices;check(words.length===255&&c.length===255&&same(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices)),"source alignment");
 const taps=words.slice(-5).map(w=>w.reduce((v,x)=>v*x%29,1));check(same(taps,[11,26,8,15,2]),"red source taps");
 const digits=grid.alphabet.replace("f",""),bytes=grid.pages.flatMap(p=>p.tokens).map(t=>59*digits.indexOf(t[0])+digits.indexOf(t[1]));check(bytes.length===256&&bytes.every(v=>v>=0&&v<=251),"radix59");let s=[taps[4]%4,0,0,0];function mul(a,b){let v=0;for(let k=0;k<2;k++){if((b>>>k)&1)v^=a;a<<=1;if(a&4)a^=7}return v}
 const addresses=[];const h=c.map(v=>{const a=s.reduce((x,y)=>4*x+y,0),out=(v+bytes[a])%29,z=s.reduce((x,y,j)=>x^mul(y,taps[j]%4),0);addresses.push(a);s=[...s.slice(1),z];return out});
 check(new Set(addresses).size===255&&!addresses.includes(0),"orbit");check(same([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[h[i],h[j]]),[[20,20],[8,8],[2,2],[9,9]]),"corrected registration");
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),score=a=>dot(a,a)-a.reduce((s,x)=>s+x,0);
 const hist=a=>{const h=Array(29).fill(0);a.forEach(x=>h[x]++);return h};
 const controls=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)})).filter(x=>x.a.length>=255).map(x=>{let min=Infinity,max=0;for(let i=0;i+255<=x.a.length;i++){const q=score(hist(x.a.slice(i,i+255)));min=Math.min(min,q);max=Math.max(max,q)}return {name:x.name,windows:x.a.length-254,min,max,target:x.a.slice(0,255)}});
 const threshold=Math.min(...controls.map(x=>x.min));
 /** @param {number[][]} w @param {number[]} seq @param {string} mode */
 function group(w,seq,mode){const g=new Map();w.forEach((a,i)=>{const key=mode==="length"?`${seq[i]}/${a.length}`:seq[i];if(!g.has(key))g.set(key,[]);g.get(key).push(i)});return [...g].map(([key,idx])=>{const min=Math.min(...idx.map(i=>w[i].length));const domain=Array.from({length:min*(mode==="signed"?2:1)},(_,i)=>i<min?i:-1-(i-min));return {key,idx,domain,opts:domain.map(d=>hist(idx.map(i=>w[i][d<0?w[i].length+d:d])))}})}
 /** Exact upper-bound certificate for collision numerator. */
 function certificate(groups,target,maxNodes=1000000){
 const g=groups.map(x=>x.opts),n=g.length,domains=g.map(o=>o.map((_,i)=>i));
 const pair=g.map((o,i)=>o.map(a=>g.map((p,j)=>i===j?null:p.map(b=>dot(a,b)))));
 function bound(){let b=0;for(let i=0;i<n;i++){let v=-Infinity;for(const a of domains[i]){let s=score(g[i][a]);for(let j=0;j<n;j++){if(i===j)continue;let mx=-Infinity;for(const q of domains[j])mx=Math.max(mx,pair[i][a][j][q]);s+=mx}v=Math.max(v,s)}b+=v}return b}
 let nodes=0,leaves=0,maxPruned=-1,depthMax=0,firstWitness=null,aborted=false,root=bound();
 function dfs(depth,b){nodes++;depthMax=Math.max(depthMax,depth);if(b<target){leaves++;maxPruned=Math.max(maxPruned,b);return true}if(nodes>=maxNodes){aborted=true;return false}
 let best=-1,children=null,bestWorst=Infinity;for(let i=0;i<n;i++){if(domains[i].length<=1)continue;const old=domains[i],ch=[];for(const q of old){domains[i]=[q];ch.push([q,bound()])}domains[i]=old;const worst=Math.max(...ch.map(x=>x[1]));if(worst<bestWorst){bestWorst=worst;best=i;children=ch}}
 if(best===-1){firstWitness={score:b,addresses:groups.map((x,i)=>[x.key,x.domain[domains[i][0]]])};return false}
 const old=domains[best];for(const [q,cb] of children.sort((a,b)=>b[1]-a[1])){domains[best]=[q];if(!dfs(depth+1,cb)){domains[best]=old;return false}}domains[best]=old;return true}
 const proved=dfs(0,root);return {root,proved,nodes,leaves,maxPruned,depthMax,aborted,firstWitness,keyCount:groups.reduce((v,x)=>v*BigInt(x.domain.length),1n).toString()}
 }
 const out={threshold,controls:controls.map(({target,...x})=>x),tests:[],lengthWitnesses:[],plants:[]};
 for(const [label,seq] of [["raw",c],["corrected",h]])for(const mode of ["front","signed"]){const g=group(words,seq,mode),res=certificate(g,threshold);check(res.proved&&!res.aborted,"original exact exclusion");out.tests.push({label,mode,...res});
 for(const [p,control] of controls.entries()){const w=words.map(a=>a.slice()),secret=[];for(const [i,a] of g.entries()){const d=a.domain[(i*11+p*7+3)%a.domain.length];secret.push(d);for(const j of a.idx)w[j][d<0?w[j].length+d:d]=(control.target[j]*11+7)%29}const planted=group(w,seq,mode),all=Array(29).fill(0);planted.forEach((a,i)=>a.opts[a.domain.indexOf(secret[i])].forEach((x,j)=>all[j]+=x));check(score(all)===score(hist(control.target))&&score(all)>=threshold,"relabelled native positive");out.plants.push({label,mode,control:control.name,score:score(all),relabel:"(11*x+7)%29"})}}
 for(const [label,seq] of [["raw",c],["corrected",h]]){const g=group(words,seq,"length"),all=Array(29).fill(0),ix=g.map(a=>0);g.forEach(a=>a.opts[0].forEach((x,i)=>all[i]+=x));for(let pass=0;pass<40;pass++){let changes=0;g.forEach((a,j)=>{a.opts[ix[j]].forEach((x,i)=>all[i]-=x);let bi=ix[j],b=score(all.map((x,i)=>x+a.opts[bi][i]));a.opts.forEach((o,k)=>{const q=score(all.map((x,i)=>x+o[i]));if(q>b){bi=k;b=q}});if(bi!==ix[j])changes++;ix[j]=bi;a.opts[bi].forEach((x,i)=>all[i]+=x)});if(!changes)break}check(score(all)>=threshold,"length witness");out.lengthWitnesses.push({label,score:score(all),key:g.map((a,j)=>[a.key,a.domain[ix[j]]]),histogram:all})}
 const synthetic=Array.from({length:5},(_,i)=>({key:i,domain:[0,1],opts:[hist([i,i+1]),hist([i,i])]}));let max=0;for(let bits=0;bits<32;bits++){const a=Array(29).fill(0);synthetic.forEach((x,i)=>x.opts[(bits>>i)&1].forEach((v,j)=>a[j]+=v));max=Math.max(max,score(a))}
 const pos=certificate(synthetic,max),neg=certificate(synthetic,max+1);check(!pos.proved&&pos.firstWitness.score===max&&neg.proved,"exact brute force fixture");
 out.smallFixture={max,pos,neg};return out
}
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/liber-primus/lp2-grid-256.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
