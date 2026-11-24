"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function experiment(co,src,q=8){
const mod=x=>(x+29)%29,g=new Map(co.runes.map((r,i)=>[r,i])),native=src.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>g.has(x)).map(x=>g.get(x))}));const str=a=>a.map(x=>co.runes[x]).join("");
const canon=k=>{let s=k.join(","),a=[];for(let i=0;i<q;i++)a.push(k.slice(i).concat(k.slice(0,i)).join(","));return a.sort()[0]};
const repeats=new Map;
for(const {name,p} of native.filter(s=>!s.name.startsWith("p5")))for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){if(i&&p[i-1]===p[j-1])continue;let n=0;while(j+n<p.length&&p[i+n]===p[j+n])n++;if(n>=20){let phrase=p.slice(i,i+n),k=str(phrase);if(!repeats.has(k))repeats.set(k,{name,p:phrase,first:i,second:j});}}
const cribs=[...repeats.values()];
function scan(c,crib,limit=c.length){const p=crib.p,L=p.length,k=new Int16Array(q);let hits=[],nodes=0;
for(let start=0;start+L<=limit;start++){k.fill(-1);const out=new Map;
function go(i,j){nodes++;if(i===L){let key=Array.from(k);out.set(key.join(",")+":"+j,{start,end:start+L,key,endPhase:j});return}
let x=c[start+i],v=mod(x-p[i]),old=k[j];
if(old===-1||old===v){k[j]=v;go(i+1,(j+1)%q);k[j]=old}
if(start+i===0)return;
let u=mod(c[start+i-1]-p[i]),j2=(j+1)%q,old2=k[j2];if((old===-1||old===u)&&(old2===-1||old2===v)){k[j]=u;k[j2]=v;go(i+1,(j+2)%q);k[j]=old;k[j2]=old2}
}
go(0,0);hits.push(...out.values());}
return {hits,nodes};}
function encrypt(p,k){let c=[],j=0;for(let i=0;i<p.length;i++){let x=(p[i]+k[j])%29;j=(j+1)%q;if(i&&x===c[i-1]&&i%5!==0){x=(p[i]+k[j])%29;j=(j+1)%q}c.push(x)}return c}
function model(exclude){let t=new Map,b=new Map;for(const s of native)if(s.name!==exclude){for(let i=2;i<s.p.length;i++){let x=s.p[i-2]*29+s.p[i-1],y=x*29+s.p[i];b.set(x,(b.get(x)||0)+1);t.set(y,(t.get(y)||0)+1)}}return (a,b1,z)=>{let x=a*29+b1;return Math.log(((t.get(x*29+z)||0)+.2)/((b.get(x)||0)+5.8))}}
function decode(c,start,end,h,crib,score){let states=new Map([[`${h.endPhase},${crib.p.at(-2)},${crib.p.at(-1)}`,{j:h.endPhase,a:crib.p.at(-2),b:crib.p.at(-1),s:0,p:[],redraw:[]}]]);
for(let i=start;i<end;i++){let next=new Map;for(const v of states.values()){let j=v.j,key=h.key;
for(let skip=0;skip<=1;skip++){let z=mod(c[i]-key[(j+skip)%q]);if(skip&&(z+key[j])%29!==c[i-1])continue;let nj=(j+1+skip)%q,s=v.s+score(v.a,v.b,z),id=`${nj},${v.b},${z}`;if(!next.has(id)||next.get(id).s<s)next.set(id,{j:nj,a:v.b,b:z,s,p:v.p.concat(z),redraw:v.redraw.concat(skip)})}}
states=next;}
let best=[...states.values()].sort((a,b)=>b.s-a.s)[0];let j=h.endPhase;for(let i=0;i<best.p.length;i++){let x=(best.p[i]+h.key[j])%29;j=(j+1)%q;if(best.redraw[i]){if(x!==c[start+i-1])throw Error("bad redraw");x=(best.p[i]+h.key[j])%29;j=(j+1)%q}if(x!==c[start+i])throw Error("bad replay")}return best}
let controls=[];
for(const [name,keys] of (q===8?[["0_koan_1",[[17,8,3,27,11,24,6,1],[9,23,14,2,12,6,28,17]]],["0_loss_of_divinity",[[3,8,12,4,15,22,19,0]]]]:[["0_koan_1",[[17,8,3,27,11,24,6,1,5,13,9,4,22],[9,23,14,2,12,6,28,17,8,16,3,25,11]]],["0_loss_of_divinity",[[3,8,12,4,15,22,19,0,7,14,23,5,26]]]])){let p=native.find(x=>x.name===name).p,crib=cribs.find(x=>x.name===name);for(const k of keys){let c=encrypt(p,k),r=scan(c,crib,crib.first+crib.p.length),matches=r.hits.filter(h=>h.start===crib.first&&canon(h.key)===canon(k));if(!matches.length)throw Error("failed planted key");let keysFound=new Set(r.hits.map(x=>canon(x.key)));let end=crib.first+crib.p.length,stop=Math.min(end+150,p.length);let choices=r.hits.map(h=>({h,d:decode(c,h.end,Math.min(h.end+150,p.length),h,crib,model(name))})).sort((a,b)=>b.d.s-a.d.s);let best=choices[0];controls.push({name,key:k,candidates:keysFound.size,paths:r.hits.length,start:best.h.start,trueStart:crib.first,keyCorrect:canon(best.h.key)===canon(k),n:best.d.p.length,correct:best.d.p.filter((v,i)=>v===p[best.h.end+i]).length,score:best.d.s/best.d.p.length,heldoutStart:best.h.end});}}
let c=co.pages.slice(0,56).flatMap(p=>p.indices);if(c.length!==12956)throw Error("original length");
let original=[];for(const crib of cribs){let r=scan(c,crib);original.push({name:crib.name,first:crib.first,second:crib.second,length:crib.p.length,crib:str(crib.p),nodes:r.nodes,starts:c.length-crib.p.length+1,hits:r.hits.map(h=>{let d=decode(c,h.end,Math.min(c.length,h.end+150),h,crib,model(null));return {...h,n:d.p.length,score:d.s/d.p.length,preview:str(d.p.slice(0,75))}})});}
return {controls,original,originalRunes:c.length,scope:`LP1 maximal repeated substrings of at least 20 runes; q${q} optional collision-only one-redraw, all offsets, no printed spaces`};
}
const q=Number(process.argv[2]||8);
if(![8,13].includes(q))throw Error("period must be 8 or 13");
console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"),q),null,2));
