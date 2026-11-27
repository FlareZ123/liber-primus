'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,native){
const Q=29,N=Q**4,M=[[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]],mod=x=>(x%29+29)%29;
const source=corpus.pages.filter(p=>p.page>=16&&p.page<=22).flatMap(p=>p.indices);
if(JSON.stringify(native.runes)!==JSON.stringify(corpus.runes))throw Error("alphabet mismatch");
const rune=new Map(native.runes.map((r,i)=>[r,i])), sections=native.sections.map(s=>Array.from(s.source_text).filter(ch=>rune.has(ch)).map(ch=>rune.get(ch)));
if(source.length!==1744||sections.map(x=>x.length).join()!=="184,515,157,780,755,319,89,85,95")throw Error("unexpected inputs");
const next=new Int32Array(N),low=new Uint8Array(N);for(let v=0;v<N;v++){let d=[v%29,Math.floor(v/29)%29,Math.floor(v/841)%29,Math.floor(v/24389)];low[v]=d[0];let y=M.map(row=>mod(row.reduce((a,x,i)=>a+x*d[i],0)));next[v]=y[0]+29*y[1]+841*y[2]+24389*y[3]}
const step=(v,c)=>{let w=next[v],s=low[w]+c;return w+c-(s>=29?29:0)};
const count=new Float64Array(29).fill(.5);sections.forEach((s,i)=>{if(i!==3&&i!==4)s.forEach(p=>count[p]++)});const total=count.reduce((a,b)=>a+b,0),score=Array.from(count,x=>Math.round(1000*Math.log(x/total)));
function plant(p,key,hold){let v=key,states=[v],c=[];for(let x of p){let y=hold&&x===0?0:mod(x+low[v]);c.push(y);if(!(hold&&x===0))v=step(v,y);states.push(v)}return {c,states}}
function ordinary(c){let best=-Infinity,iv=-1,ties=0;for(let root=0;root<N;root++){let v=root,s=0;for(let i=0;i<267;i++){let x=c[i]-low[v];if(x<0)x+=29;s+=score[x];v=step(v,c[i])}if(s>best){best=s;iv=root;ties=1}else if(s===best)ties++}let p=[],v=iv;for(let x of c){p.push(mod(x-low[v]));v=step(v,x)}let held=p.slice(267),heldScore=held.reduce((a,x)=>a+score[x],0),freq=Array(29).fill(0);held.forEach(x=>freq[x]++);return {iv,ties,fitNLL:-best/267000,heldNLL:-heldScore/(1000*held.length),heldIoC:freq.reduce((a,x)=>a+x*(x-1),0)/(held.length*(held.length-1)),p}}
function holdReach(c,known){let active=new Int32Array(N),buf=new Int32Array(N),stamp=new Int32Array(N);for(let i=0;i<N;i++)active[i]=i;let len=N,stats=[],truthRetained=true,firstEmpty=null;for(let i=0;i<c.length;i++){let x=c[i],m=0,epoch=i+1;for(let j=0;j<len;j++){let v=active[j];if(x===0&&stamp[v]!==epoch){stamp[v]=epoch;buf[m++]=v}if(x!==low[v]){let w=step(v,x);if(stamp[w]!==epoch){stamp[w]=epoch;buf[m++]=w}}}if(known&&stamp[known[i+1]]!==epoch)truthRetained=false;[active,buf]=[buf,active];len=m;if((i+1)%100===0||i===266||i===c.length-1||!len)stats.push([i+1,len]);if(!len){firstEmpty=i+1;break}}return {terminalStates:len,firstEmpty,truthRetained:known?truthRetained:null,stats}}
let controls=[];for(let [j,iv] of [[3,3+5*29+7*841+11*24389],[4,19+2*29+23*841+14*24389]]){let p=sections[j],a=plant(p,iv,false),b=ordinary(a.c),h=plant(p,iv,true),hr=holdReach(h.c,h.states);let acc=b.p.reduce((s,x,i)=>s+(x===p[i]),0),heldCorrect=b.p.slice(267).filter((x,i)=>x===p[i+267]).length;delete b.p;controls.push({section:j,length:p.length,actualIV:iv,ordinary:b,correctRunes:acc,heldCorrect,hold:hr})}
let o=ordinary(source),preview=o.p.slice(267,347).map(i=>corpus.translit[i]).join(" ");delete o.p;return {sourceLength:source.length,matrix:M,controls,original:{ordinary:o,heldPreview:preview,hold:holdReach(source,null)}}
}
const root=path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const n=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
console.log(JSON.stringify(experiment(c,n),null,2));
