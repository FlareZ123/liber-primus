"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(corpus,solved,donor){
 const mod=x=>(x%29+29)%29,sum=a=>a.reduce((s,x)=>s+x,0),eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),check=(x,m)=>{if(!x)throw Error(m)};
 const obj=corpus.pages[25].indices.slice(144,150);
 check(eq(obj,[18,3,20,10,11,16]),"object");
 const t=obj.map((x,i)=>Number(BigInt(x)**BigInt(i?27:3)%29n)),key=t.slice(0,5),L=sum(key),R=t[5];
 check(eq(t,[3,10,16,3,8,20])&&L===40&&R===20,"producer");
 const ri=new Map(corpus.runes.map((r,i)=>[r,i])),tokens=corpus.translit.map((v,i)=>[v,i]).sort((a,b)=>b[0].length-a[0].length);
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){if(w.startsWith("ING")){out.push(21);w=w.slice(3);continue}if(w.startsWith("IO")){out.push(27);w=w.slice(2);continue}const t=tokens.find(t=>w.startsWith(t[0]));check(t,"unmapped "+w);out.push(t[1]);w=w.slice(t[0].length)}}return out}
 const body=donor.split("*** START OF")[1]?.split("*** END OF")[0]||donor, d=gp(body),counts=Array.from({length:29},()=>Array(29).fill(.5));
 for(let i=1;i<d.length;i++)counts[d[i-1]][d[i]]++;
 const log=counts.map(row=>row.map(x=>Math.log(x/sum(row)))),native=solved.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>ri.has(x)).map(x=>ri.get(x))}));
 function score(p){let s=0;for(let i=1;i<p.length;i++)s+=log[p[i-1]][p[i]];return s/(p.length-1)}
 function encode(p,k,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+k[(j++)%k.length]))}
 function decode(c,k,hold){let states=new Map([["0,-1",{phase:0,last:-1,s:0,p:[],n:1n}]]);for(let i=0;i<c.length;i++){let next=new Map;for(const z of states.values()){const offer=(p,phase)=>{const s=z.s+(z.last<0?0:log[z.last][p]),id=`${phase},${p}`,old=next.get(id),n=(old?.n||0n)+z.n;if(!old||old.s<s)next.set(id,{phase,last:p,s,p:[...z.p,p],n});else old.n=n};if(hold&&c[i]===0)offer(0,z.phase);const p=mod(c[i]-k[z.phase]);if(!hold||p!==0)offer(p,(z.phase+1)%k.length)}states=next;if(!states.size)return {failAt:i,pathCount:"0",p:null,score:null}}const best=[...states.values()].sort((a,b)=>b.s-a.s)[0];check(eq(encode(best.p,k,hold),c),"replay");return {failAt:null,pathCount:[...states.values()].reduce((s,z)=>s+z.n,0n).toString(),p:best.p,score:score(best.p)}}
 function floor(n){const scores=[];for(const s of native)for(let i=0;i+n<=s.p.length;i++)scores.push(score(s.p.slice(i,i+n)));return {n,windows:scores.length,min:scores.length?Math.min(...scores):null,median:scores.length?scores.sort((a,b)=>a-b)[Math.floor(scores.length/2)]:null}}
 const rows=[],controls=[];
 for(const [page,offset] of [[L,R],[R,L]]){const first=corpus.pages[page].indices.slice(offset),second=corpus.pages[page+1].indices,c=[...first,...second],floors=[floor(first.length),floor(second.length),floor(c.length)];
 for(const sign of [1,-1])for(const hold of [false,true]){const k=key.map(x=>mod(sign*x)),z=decode(c,k,hold);rows.push({page,offset,sign,hold,key:k,firstLength:first.length,secondLength:second.length,floors,...z,firstScore:z.p?score(z.p.slice(0,first.length)):null,secondScore:z.p?score(z.p.slice(first.length)):null,render:z.p?.slice(0,70).map(x=>corpus.translit[x]).join(" ")||null});
 for(const s of native.filter(s=>s.p.length>=c.length)){const p=s.p.slice(0,c.length),ct=encode(p,k,hold),q=decode(ct,k,hold);check(q.p&&q.score+1e-10>=score(p),"control");controls.push({page,offset,sign,hold,source:s.name,n:p.length,correct:q.p.filter((x,i)=>x===p[i]).length,pathCount:q.pathCount,score:q.score,trueScore:score(p)})}
 }}
 return {object:obj,transformed:t,key,coordinates:[L,R],trainingRunes:d.length,rows,controls,nativeLengths:native.map(s=>[s.name,s.p.length])};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const a=inputs.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),JSON.parse(a[1]),a[2]),null,2));
