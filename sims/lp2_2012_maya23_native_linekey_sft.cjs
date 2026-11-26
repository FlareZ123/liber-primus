"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const run=function run(corpus,transcription,native){
const key=Array.from("a2e7j6ic78h0j7eiejd0120",x=>parseInt(x,20)), Q=29,S=29,mod=x=>(x%Q+Q)%Q;
const index=new Map(corpus.runes.map((x,i)=>[x,i]));const seq=t=>Array.from(t).filter(x=>index.has(x)).map(x=>index.get(x));
const pages=transcription.trim().split("%").map((raw,i)=>({page:i<50?i:i+1,lines:raw.split("\n").map(seq).filter(x=>x.length)}));
for(const p of pages){const flat=p.lines.flat();if(flat.join(",")!==corpus.pages[p.page].indices.join(","))throw Error("page transcription mismatch "+p.page)}
const unknown=pages.filter(p=>p.page<56);if(unknown.flatMap(p=>p.lines.flat()).length!==12956)throw Error("wrong corpus size");
const sections=native.sections.map(s=>({name:s.name,lines:s.source_text.split("\n").map(seq).filter(x=>x.length)}));
const train=sections.slice(0,7);const controls=sections.slice(7);
const uni=Array(Q).fill(1),bi=Array.from({length:30},()=>Array(Q).fill(0)),tri=Array.from({length:30*30},()=>Array(Q).fill(0));
for(const line of train.flatMap(s=>s.lines)){let a=S,b=S;for(const x of line){uni[x]++;bi[b][x]++;tri[a*30+b][x]++;a=b;b=x;}}
const us=uni.reduce((a,b)=>a+b,0),bs=bi.map(x=>x.reduce((a,b)=>a+b,0)),ts=tri.map(x=>x.reduce((a,b)=>a+b,0));const lp=(a,b,x)=>Math.log((tri[a*30+b][x]+12*(bi[b][x]+12*uni[x]/us)/(bs[b]+12))/(ts[a*30+b]+12));
function encrypt(line,hold){let k=0;return line.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key[k]);k=(k+1)%key.length;return y;})}
function decode(line,hold){let states=new Map([[`0,${S},${S}`,{k:0,a:S,b:S,score:0,path:[]}]]);for(const c of line){const next=new Map();for(const st of states.values()){const add=(x,k)=>{const z={k,a:st.b,b:x,score:st.score+lp(st.a,st.b,x),path:st.path.concat(x)},id=`${z.k},${z.a},${z.b}`;if(!next.has(id)||next.get(id).score<z.score)next.set(id,z)};if(hold&&c===0)add(0,st.k);const x=mod(c-key[st.k]);if(!hold||x!==0)add(x,(st.k+1)%key.length);}
if(!next.size)return null;states=next;}const best=[...states.values()].sort((a,b)=>b.score-a.score)[0];if(encrypt(best.path,hold).join(",")!==line.join(","))throw Error("replay");return best;}
const words=new Set(train.flatMap(s=>s.lines).length?train.flatMap(s=>native.sections.find(x=>x.name===s.name).source_text.split(/[^\p{Script=Runic}]+/u).filter(Boolean).map(x=>seq(x).join(","))):[]);
const aggregate=(lines,hold)=>{let legal=0,n=0,score=0,total=0,firstInvalid=-1;for(let i=0;i<lines.length;i++){const line=lines[i],d=decode(line,hold);total+=line.length;if(!d){if(firstInvalid<0)firstInvalid=i;continue;}legal++;n+=line.length;score+=d.score;}return {lines:lines.length,legal,firstInvalid,totalRunes:total,legalRunes:n,natsPerRune:n?score/n:null}}
const ctControls=controls.map(s=>({name:s.name,results:[false,true].map(hold=>{let n=0,correct=0,score=0;for(const line of s.lines){const c=encrypt(line,hold),d=decode(c,hold);if(!d)throw Error("control path missing");correct+=d.path.filter((x,i)=>x===line[i]).length;n+=line.length;score+=d.score;}return {hold,n,correct,natsPerRune:score/n};})}));
const result=[false,true].map(hold=>({hold,all:aggregate(unknown.flatMap(p=>p.lines),hold),p0:aggregate(unknown[0].lines,hold),perPage:unknown.map(p=>({page:p.page,...aggregate(p.lines,hold)})),completePages:unknown.filter(p=>p.lines.every(l=>decode(l,hold))).length}));
return {key,source:"2012/003-subreddit historical 23-character numeric key, 0 phase at each physical line, subtract mod29",trainingSections:train.map(s=>s.name),controls:ctControls,result};
};
const result=run(JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8")),fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8"),JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8")));
console.log(JSON.stringify(result,null,2));
