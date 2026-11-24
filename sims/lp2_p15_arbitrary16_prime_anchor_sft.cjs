'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(A,t,lex,B){
const assert=(x,m)=>{if(!x)throw Error(m)};
const words=s=>s.match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(c=>A.runes.indexOf(c)));
const original=words(t.replace(/[\s/%]/g,"")),start=A.pages.slice(0,15).flatMap(p=>p.indices).length+20, raw=A.pages.slice(15,23).flatMap((p,i)=>i===0?p.indices.slice(20):p.indices);
assert(original.flat().slice(start,start+raw.length).every((v,i)=>v===raw[i]),"original alignment");
const donorNames=["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"],donorWords=B.sections.filter(s=>donorNames.includes(s.name)).flatMap(s=>words(s.source_text));
const plain=donorWords.flat().slice(0,raw.length);
const dict=Array.from({length:17},()=>new Map());
function add(w,name){if(w.length<=16)dict[w.length].set(w.join(","),{w,name})}
const tok=A.translit.map((s,i)=>[s,i]).concat([["ING",21],["IO",27],["K",5],["V",1],["Z",15],["Q",5]]);
for(const l of lex.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+\d+/i);if(!m)continue;const name=m[1],s=name.toUpperCase().replace(/QU/g,"CW");function walk(i,w){if(i===s.length){add(w,name);return}if(w.length===16)return;for(const [k,v] of tok)if(s.startsWith(k,i))walk(i+k.length,w.concat(v))}walk(0,[])}
for(const s of B.sections.filter(s=>!donorNames.includes(s.name)))for(const w of words(s.source_text))add(w,w.map(v=>A.translit[v]).join(""));
const K=[];for(let n=2;K.length<6000;n++){let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}if(prime)K.push((n-1)%29)}
const enc=(w,j)=>w.map(v=>v===0?0:(v+K[j++])%29);
const perm=[5,10,8,12,13,0,4,9,11,15,1,7,2,14,3,6],plant=enc(plain,0);
const cipher=plant.slice();for(let k=0;k+16<=plant.length;k+=16)for(let j=0;j<16;j++)cipher[k+perm[j]]=plant[k+j];
function anchors(ws,offset){let i=-offset;return ws.map(w=>{const q={i,w};i+=w.length;return q}).filter(x=>x.i>=0&&x.i+x.w.length<=928).sort((a,b)=>b.w.length-a.w.length).slice(0,12)}
function scan(c,aa,truth){return aa.map(({i,w})=>{let hmax=c.slice(0,Math.min(c.length,Math.ceil((i+1)/16)*16)).filter(v=>v===0).length;hmax=Math.min(i,hmax);let count=0,sol=new Set(),correct=false,wordCount=0;for(const {w:p,name} of dict[w.length].values()){let found=false;for(let h=0;h<=hmax;h++){const e=enc(p,i-h),m=e.map((v,j)=>{const b=Math.floor((i+j)/16)*16;let mask=0;for(let z=0;z<16;z++)if(c[b+z]===v)mask|=1<<z;return [((i+j)%16),mask]});if(m.some(x=>!x[1]))continue;m.sort((a,b)=>a[1].toString(2).replace(/0/g,"").length-b[1].toString(2).replace(/0/g,"").length);const map=Array(16).fill(-1);function dfs(j,used){if(j===m.length){count++;found=true;if(truth&&map.every((v,k)=>v<0||v===perm[k])&&p.every((v,k)=>v===w[k]))correct=true;sol.add(map.join(","));return}let bits=m[j][1]&~used;while(bits){const bit=bits&-bits;bits^=bit;map[m[j][0]]=31-Math.clz32(bit);dfs(j+1,used|bit);map[m[j][0]]=-1}}dfs(0,0)}if(found)wordCount++}return {i,len:w.length,hmax,dict:dict[w.length].size,wordCount,assignments:sol.size,paths:count,truthInDict:truth?dict[w.length].has(w.join(",")):null,correct:truth?correct:null}})}
const orig=scan(raw,anchors(original,start),false),control=scan(cipher,anchors(donorWords,0),true);
return {orig,control,dict:dict.map(x=>x.size)};
}
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
