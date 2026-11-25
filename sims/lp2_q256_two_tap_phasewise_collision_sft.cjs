'use strict';
const fs=require('node:fs'),path=require('node:path');const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function encode(gp,s){const out=[];const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function phaseExperiment(orig,docs,q=256){
const n=orig.length,rows=[];
for(const lag of [[1,2],[5,6]]){
const m=lag[1],groups=Array.from({length:q},()=>[]);for(let i=m;i<n;i++)groups[i%q].push([orig[i],orig[i-lag[0]],orig[i-lag[1]]]);
const caps=[],topCaps=[];for(let t=0;t<q;t++){const g=groups[t],h=new Uint16Array(29);let best=0,top=Array(8).fill(0);for(let a=0;a<29;a++)for(let b=0;b<29;b++){h.fill(0);for(const [c,x,y] of g)h[(c-a*x-b*y+1624)%29]++;let s=0;for(const v of h)s+=v*(v-1);best=Math.max(best,s);const sorted=Array.from(h).sort((a,b)=>b-a);let p=0;for(let k=0;k<top.length;k++){p+=sorted[k];top[k]=Math.max(top[k],p)}}
const full=Math.floor((n+q-1-t)/q),free=full-g.length;
caps.push(best+full*(full-1)-g.length*(g.length-1));topCaps.push(top.map(v=>v+free))}
const totalCap=caps.reduce((a,b)=>a+b,0);
const controls=docs.map(d=>{const h=Array.from({length:q},()=>new Uint32Array(29)),phasePairs=new Int32Array(q);let sum=0,aggregate=0,pass=0,least=q,leastExcess=Infinity,example=null;function assess(start){if(sum>totalCap)return;aggregate++;let violations=0,excess=0;for(let t=0;t<q;t++){const j=(start+t)%q,v=phasePairs[j]-caps[t];if(v>0){violations++;excess+=v;continue}const sorted=Array.from(h[j]).sort((a,b)=>b-a);let p=0;for(let k=0;k<8;k++){p+=sorted[k];if(p>topCaps[t][k]){violations++;excess+=p-topCaps[t][k];break}}}if(violations<least){least=violations;leastExcess=excess;example=start}if(violations===0)pass++}
for(let i=0;i<n;i++){const t=i%q,k=2*h[t][d[i]]++;sum+=k;phasePairs[t]+=k}assess(0);for(let j=n;j<d.length;j++){let t=(j-n)%q,k=2*--h[t][d[j-n]];sum-=k;phasePairs[t]-=k;t=j%q;k=2*h[t][d[j]]++;sum+=k;phasePairs[t]+=k;assess(j-n+1)}
return {windows:d.length-n+1,aggregate,pass,leastViolations:aggregate?least:null,leastExcess:aggregate?leastExcess:null,example}});
rows.push({q,lag,caps,topCaps,totalCap,controls});}
return rows}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));const docs=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>encode(gp,read(p)));const orig=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);console.log(JSON.stringify(phaseExperiment(orig,docs),null,2));
