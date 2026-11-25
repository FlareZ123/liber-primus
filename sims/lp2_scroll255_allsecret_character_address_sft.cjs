'use strict';
// Read-only Windows Node 22 SFT. Exact integer-product maximum, no fitted alphabet.
const fs=require('node:fs'), path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(gp,t,grid,native){
 const check=(condition,label)=>{if(!condition)throw Error(label)};
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 check(same(gp.runes,native.runes),"native chart");
 const words=[];let pending=[];const m=new Map(gp.runes.map((x,i)=>[x,i]));
 for(const part of t.split("%").slice(3,8))for(const ch of part){if(m.has(ch))pending.push(m.get(ch));else if("-.".includes(ch)&&pending.length){words.push(pending);pending=[]}}
 if(pending.length)words.push(pending);
 const c=gp.pages[8].indices;
 check(words.length===255&&c.length===255&&words.flat().length===1145&&same(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices)),"source alignment");
 const taps=words.slice(-5).map(w=>w.reduce((v,x)=>v*x%29,1));
 check(same(taps,[11,26,8,15,2]),"red source taps");
 const digits=grid.alphabet.replace("f",""),bytes=grid.pages.flatMap(p=>p.tokens).map(t=>59*digits.indexOf(t[0])+digits.indexOf(t[1]));
 check(bytes.length===256&&bytes.every(v=>v>=0&&v<=251),"radix59");
 let s=[taps[4]%4,0,0,0];function mul(a,b){let v=0;for(let k=0;k<2;k++){if((b>>>k)&1)v^=a;a<<=1;if(a&4)a^=7}return v}
 const addresses=[];const h=c.map(v=>{const a=s.reduce((x,y)=>4*x+y,0);addresses.push(a);const out=(v+bytes[a])%29;const z=s.reduce((x,y,j)=>x^mul(y,taps[j]%4),0);s=[...s.slice(1),z];return out});
 check(new Set(addresses).size===255&&!addresses.includes(0),"primitive orbit");
 check(same([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[h[i],h[j]]),[[20,20],[8,8],[2,2],[9,9]]),"conditional correction");
 check(c.every((v,i)=>(h[i]-bytes[addresses[i]]+290)%29===v),"correction replay");
 const src=native.sections.map(s=>({name:s.name,a:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const at=(w,k)=>w[k<0?w.length+k:k];
 /** @param {number[][]} w @param {number[]} seq @param {string} mode */
 function groups(w,seq,mode){const g=new Map();w.forEach((a,i)=>{const key=mode==="length"?`${seq[i]}/${a.length}`:mode==="free"?`${i}`:`${seq[i]}`;if(!g.has(key))g.set(key,[]);g.get(key).push(i)});
 return [...g].map(([key,idx])=>{const min=Math.min(...idx.map(i=>w[i].length));const domain=Array.from({length:min*(mode==="signed"?2:1)},(_,i)=>i<min?i:-1-(i-min));return {key,idx,domain}})}
 /** @param {number[]} tape @param {bigint[]} weights */
 function product(tape,weights){return tape.reduce((v,x)=>v*weights[x],1n)}
 function logscore(tape,weights,den){return tape.reduce((v,x)=>v+Math.log(Number(weights[x])/den),0)/tape.length}
 function optimum(w,g,weights,den){const tape=Array(w.length),key={};let p=1n;for(const {key:k,idx,domain} of g){let best=-1n,choice;for(const d of domain){const v=product(idx.map(i=>at(w[i],d)),weights);if(v>best){best=v;choice=d}}p*=best;key[k]=choice;for(const i of idx)tape[i]=at(w[i],choice)}check(p===product(tape,weights),"factorized optimum");return {p,key,tape,score:logscore(tape,weights,den)}}
 const out={source:{words:words.length,runes:words.flat().length,p8:c.length},controls:[]};
 for(const [index,x] of src.entries()){if(x.a.length<255)continue;
 const counts=Array(29).fill(0);let n=0;for(const y of src)if(y.name!==x.name)for(const v of y.a){counts[v]++;n++}
 const weights=counts.map(v=>BigInt(5*v+1)),den=5*n+29;
 let min=null,minAt=-1;for(let j=0;j+255<=x.a.length;j++){const p=product(x.a.slice(j,j+255),weights);if(min===null||p<min){min=p;minAt=j}}
 const target=x.a.slice(0,255),minScore=logscore(x.a.slice(minAt,minAt+255),weights,den);
 const record={name:x.name,windows:x.a.length-254,minWindowStart:minAt,minScore,results:[]};
 for(const [label,seq] of [["raw",c],["corrected",h]])for(const mode of ["front","signed","length","free"]){
 const g=groups(words,seq,mode),b=optimum(words,g,weights,den);
 const plant=words.map(w=>[...w]),secret={};for(const [j,{key,idx,domain}] of g.entries()){const d=domain[(j*11+index*7+3)%domain.length];secret[key]=d;for(const i of idx)plant[i][d<0?plant[i].length+d:d]=target[i]}
 const recovered=Array(255);for(const {key,idx} of g)for(const i of idx)recovered[i]=at(plant[i],secret[key]);
 check(same(recovered,target),"planted exact address readback");
 const p=optimum(plant,g,weights,den);
 check(p.p>=product(target,weights)&&p.p>=min,"positive envelope");
 if(mode!=="free")check(b.p<min,"all-key original exclusion");
 record.results.push({label,mode,groups:g.length,keyCount:g.reduce((v,x)=>v*BigInt(x.domain.length),1n).toString(),upper:b.score,strictlyBelowEveryControlWindow:b.p<min,bestKey:b.key,bestOutput:b.tape.map(v=>gp.translit[v]).join(" "),plantScore:p.score,plantExactReadback:255});
 }
 out.controls.push(record);
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/liber-primus/lp2-grid-256.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
