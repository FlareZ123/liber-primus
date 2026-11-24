"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(raw){
const d=JSON.parse(raw[0]),grid=JSON.parse(raw[1]).byte_rows.flat(),native=JSON.parse(raw[2]),N=29,ids=Array.from({length:N},(_,i)=>i),gp=new Map(d.runes.map((r,i)=>[r,i])),alpha=new Map(d.translit.map((r,i)=>[r,i]));
const check=(b,m)=>{if(!b)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const words=s=>(s.replace(/[\/%\r\n'’]/g,"").match(new RegExp("["+d.runes.join("")+"]+","gu"))||[]).map(w=>[...w].map(r=>gp.get(r)));
const clock=i=>grid[(i+255)%256]&1,sw=(a,i,j)=>{[a[i],a[j]]=[a[j],a[i]]};
check(grid.length===256,"grid length");
function recover(c,offset,hold){
let states=[];for(const a of ids)for(const b of ids)if(a!==b&&(!hold||a&&b))states.push(a*N+b);
let burn=0;
for(;burn<c.length&&states.length!==1;burn++){const v=c[burn];if(hold&&!v)continue;const k=clock(offset+burn),next=new Set();for(const s of states){let a=Math.floor(s/N),b=s%N;next.add(k?(a===v?b:a)*N+v:v*N+(b===v?a:b))}states=[...next]}
check(states.length===1,"synchronization");const [a,b]=[Math.floor(states[0]/N),states[0]%N],init=[a,b,...ids.filter(v=>v!==a&&v!==b&&(!hold||v!==0))];if(hold)init.push(0);
let x=init.slice(),out=[];for(let i=burn;i<c.length;i++){const v=c[i],r=hold&&!v?28:x.indexOf(v);out.push(r);if(!hold||v)sw(x,r,clock(offset+i))}
x=init.slice();const replay=out.map((r,j)=>{if(hold&&r===28)return 0;const v=x[r];sw(x,r,clock(offset+burn+j));return v});
check(same(replay,c.slice(burn)),"suffix replay");return {burn,init,out};
}
const signature=w=>{const m=new Map();return w.map(v=>{if(!m.has(v))m.set(v,m.size);return m.get(v)}).join(",")};
const dict=new Map();function add(w){if(w.length)dict.set(w.join(","),w)}function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
for(const l of raw[3].split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}for(const s of ["A","I","O"])variants(s);for(const s of native.sections)for(const w of words(s.source_text))add(w);
const patterns=new Map();for(const w of dict.values()){const k=signature(w);if(!patterns.has(k))patterns.set(k,[]);patterns.get(k).push(w)}
const full=(1<<29)-1,bit=i=>1<<i,pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
function solve(ws,hold){const used=new Set(ws.flat());let nodes=0,capped=false;const rows=ws.map(w=>patterns.get(signature(w))||[]);const domains=ids.map(()=>full);if(hold)domains[28]=1;
function dfs(dom,rs){if(++nodes>50000){capped=true;return null}let changed=true;while(changed){changed=false;for(let j=0;j<ws.length;j++){const w=ws[j],r=rs[j].filter(p=>p.every((v,i)=>dom[w[i]]&bit(v)));if(!r.length)return null;if(r.length!==rs[j].length){rs[j]=r;changed=true}const supports=new Map();for(const p of r)for(let i=0;i<w.length;i++)supports.set(w[i],(supports.get(w[i])||0)|bit(p[i]));for(const [k,s] of supports){const v=dom[k]&s;if(!v)return null;if(v!==dom[k]){dom[k]=v;changed=true}}}for(const i of ids)if(pop(dom[i])===1)for(const j of ids)if(i!==j&&(dom[j]&dom[i])){dom[j]&=~dom[i];if(!dom[j])return null;changed=true}}
let m=Array(N).fill(-1);function aug(i,seen){for(const j of ids)if((dom[i]&bit(j))&&!seen[j]){seen[j]=true;if(m[j]<0||aug(m[j],seen)){m[j]=i;return true}}return false}for(const i of ids)if(!aug(i,Array(N).fill(false)))return null;
let i=-1;for(const j of used)if(pop(dom[j])>1&&(i<0||pop(dom[j])<pop(dom[i])))i=j;if(i<0){const ans=Array(N);m.forEach((v,k)=>ans[v]=k);return ans}
for(const j of ids)if(dom[i]&bit(j)){const d=dom.slice();d[i]=bit(j);const r=dfs(d,rs.slice());if(r)return r;if(capped)return null}return null}
const key=dfs(domains,rows);return {key,nodes,capped,missing:rows.filter(r=>!r.length).length}}
let seed=0x610924;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function perm(){const a=ids.slice();for(let i=N-1;i>0;i--)sw(a,i,rnd()%(i+1));return a}
function plant(p,hold){const a=perm(),map=perm();if(hold){sw(a,a.indexOf(0),28);sw(map,map.indexOf(0),28)}return p.map((v,i)=>{if(hold&&!v)return 0;const r=map.indexOf(v),c=a[r];sw(a,r,clock(i));return c})}
function sliceWords(ws,out,burn){let i=0,rows=[];for(const w of ws){if(i>=burn)rows.push({p:w,c:out.slice(i-burn,i-burn+w.length)});i+=w.length}return rows}
const controls=[];for(const name of ["0_welcome","jpg107-167","0_loss_of_divinity"]){const ws=words(native.sections.find(s=>s.name===name).source_text),p=ws.flat();for(const hold of [false,true]){const c=plant(p,hold),r=recover(c,0,hold),rows=sliceWords(ws,r.out,r.burn),n=Math.floor(rows.length*2/3),s=solve(rows.slice(0,n).map(w=>w.c),hold),tail=rows.slice(n),known=new Set(rows.slice(0,n).flatMap(w=>w.c)),test=tail.flatMap(w=>w.c),truth=tail.flatMap(w=>w.p),pred=s.key?test.map(v=>s.key[v]):[],consistent=new Map();for(let i=0;i<r.out.length;i++){let k=r.out[i],v=p[r.burn+i];check(!consistent.has(k)||consistent.get(k)===v,"plant equivalence");consistent.set(k,v)}
controls.push({name,hold,burn:r.burn,n:truth.length,correct:pred.filter((v,i)=>v===truth[i]).length,covered:test.filter(v=>known.has(v)).length,coveredCorrect:pred.filter((v,i)=>known.has(test[i])&&v===truth[i]).length,keyFound:!!s.key,nodes:s.nodes,capped:s.capped})}}
const all=d.pages.filter(p=>p.page<56).flatMap(p=>p.indices),ow=words(raw[4].split("%").slice(0,55).join(""));check(same(all,ow.flat()),"source align");
const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],ranges=[[0,all.length],...cuts.slice(0,-1).map((a,i)=>[a,cuts[i+1]])],original=[];
for(const [a,b] of ranges){const c=all.slice(a,b),witness=[0,0];for(let i=1;i<c.length;i++)if(c[i]&&c[i]===c[i-1])witness[clock(a+i-1)]++;check(new Set(c.filter(Boolean)).size===28&&witness.every(Boolean),"F pivot exclusion");const modes=[];for(const hold of [false,true]){const r=recover(c,a,hold),h=ids.map(v=>r.out.filter(x=>x===v).length);modes.push({hold,burn:r.burn,init:r.init.slice(0,2),max:Math.max(...h)+r.burn})}original.push({a,b,witness,modes})}
for(const hold of [false,true]){const r=recover(all,0,hold),rows=sliceWords(ow,r.out,r.burn),train=rows.filter((_,i)=>i<150),s=solve(train.map(w=>w.c),hold);original[0].modes[Number(hold)].lexical={missing:s.missing,keyFound:!!s.key,nodes:s.nodes,capped:s.capped}}
return {dictionary:dict.size,controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/base60-grid.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
