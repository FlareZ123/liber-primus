'use strict';
const fs=require('node:fs');
function experiment(corpus,transcription){
const assert=(x,m)=>{if(!x)throw Error(m)},mod=(x,p)=>((x%p)+p)%p;
let map=new Map(corpus.runes.map((r,i)=>[r,i])),C=[],gap=[],buf="";
for(let ch of transcription.split("%").slice(0,55).join("%")){if(map.has(ch)){if(C.length)gap.push(buf);C.push(map.get(ch));buf=""}else buf+=ch}gap.push(buf);
let official=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(C.length===12956&&C.every((v,i)=>v===official[i]),"canonical rune tape");
let split=corpus.pages.filter(p=>p.page<40).reduce((n,p)=>n+p.indices.length,0),isAnchor=gap.map((g,i)=>i===C.length-1||/[.&$§]/u.test(g)),Y=gap.map((g,i)=>isAnchor[i]||/-/u.test(g)?1:0);
assert(Y.reduce((a,b)=>a+b,0)===2896,"canonical groups");
let V=C.map(x=>corpus.prime[x]);
const prepare=(y)=>{let age=0,since=0,sites=[],hist=Array(16).fill(0),eligible1=0;for(let i=0;i<C.length;i++){age++;since++;if(i>=4&&since>=5&&!isAnchor[i]&&age<14){sites.push({i,age,y:y[i]});if(y[i]&&age===1)eligible1++;}if(y[i]){hist[age]=(hist[age]||0)+1;age=0}if(isAnchor[i])since=0;}return {sites,hist,eligible1}};
const hash=(p,a)=>{let a5=1;for(let k=0;k<5;k++)a5=a5*a%p;let H=new Int32Array(C.length),h=0;for(let i=0;i<C.length;i++){h=mod(a*h+V[i]-(i>=5?a5*V[i-5]:0),p);H[i]=h}return H};
const stats=(p,H,sites,withAge)=>{let n=p*(withAge?14:1),z=new Uint16Array(n),o=new Uint16Array(n),train=0,all=0;for(let s of sites){let k=H[s.i]+(withAge?(s.age-1)*p:0),a=s.y?o:z,b=s.y?z:o;if(a[k]<b[k]){all++;if(s.i<split)train++;}a[k]++;}return {train,all}};
const held=(p,H,sites,withAge)=>{let n=p*(withAge?14:1),z=new Uint16Array(n),o=new Uint16Array(n),tr=[0,0],tes=[0,0],seen=[0,0],right=[0,0],ambiguous=0;for(let s of sites){let k=H[s.i]+(withAge?(s.age-1)*p:0);if(s.i<split){(s.y?o:z)[k]++;tr[s.y]++}else{tes[s.y]++;if(o[k]+z[k]){seen[s.y]++;if(o[k]===z[k])ambiguous++;let pred=o[k]>z[k]?1:0;right[s.y]+=pred===s.y}}}return {train:tr,holdout:tes,seen,right,ambiguous}};
const scan=(p,sites)=>{let raw=[],summary={};for(let a=1;a<p;a++){let H=hash(p,a);let s0=stats(p,H,sites,false),s1=stats(p,H,sites,true);raw.push([a,s0.train,s0.all,s1.train,s1.all])}for(let [name,idx,age] of [["fixed",1,false],["agePrivate",3,true]]){let sorted=raw.slice().sort((a,b)=>a[idx]-b[idx]||a[0]-b[0]),best=sorted[0],minFull=Math.min(...raw.map(x=>x[idx+1]));summary[name]={trainZero:raw.filter(x=>x[idx]===0).length,fullZero:raw.filter(x=>x[idx+1]===0).length,minimumTrainErrors:best[idx],minimumFullErrors:minFull,bestTrainingMultiplier:best[0],bestTrainingTies:sorted.filter(x=>x[idx]===best[idx]).length,bestTrainingFullErrors:best[idx+1],heldout:held(p,hash(p,best[0]),sites,age)}}return {p,summary,raw}};
let actual=prepare(Y),base=[1033,3301].map(p=>scan(p,actual.sites));
const plant=(p,a,agePrivate)=>{let H=hash(p,a),y=[],age=0,since=0;for(let i=0;i<C.length;i++){age++;since++;let hit=isAnchor[i]||age===14||(i>=4&&since>=5&&mod(H[i]+(agePrivate?11*age:0),5)===0);y.push(hit?1:0);if(hit)age=0;if(isAnchor[i])since=0;}let q=prepare(y),out=scan(p,q.sites);let row=out.raw.find(x=>x[0]===a),idx=agePrivate?3:1;assert(row[idx]===0&&row[idx+1]===0,"true control key contradicts");return {p,a,agePrivate,groups:y.reduce((a,b)=>a+b,0),eligible:q.sites.length,summary:out.summary,actualKeyHeldout:held(p,H,q.sites,agePrivate)}};
return {source:{runes:C.length,groups:Y.reduce((a,b)=>a+b,0),anchors:isAnchor.filter(Boolean).length,split,eligible:actual.sites.length,eligibleBoundaries:actual.sites.filter(s=>s.y).length,eligibleSingletonBoundaries:actual.eligible1,lengthHistogram:actual.hist},original:base,controls:[plant(1033,761,false),plant(3301,1033,true)]};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt"];
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),fs.readFileSync(paths[1],'utf8')),null,2));
