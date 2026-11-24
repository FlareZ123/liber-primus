"use strict";
// Node 22 standalone exact anchor key recovery and frozen-phase continuation.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const raw=read("resources/liber-primus/lp2-transcription.txt"),
  co=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),
  src=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),
  lex=read("resources/control/english_wordfreq_textblob.txt");
const g=new Map(co.runes.map((r,i)=>[r,i])),q=8;
const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(c=>g.get(c)));
const enc=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let o=[];for(let i=0;i<w.length;){let j=co.translit.indexOf(w.slice(i,i+2));if(j>=0){o.push(j);i+=2}else{j=co.translit.indexOf(w[i++]);if(j<0)return [];o.push(j)}}return o};
const str=a=>String.fromCharCode(...a.map(x=>65+x)),arr=s=>[...s].map(x=>x.charCodeAt(0)-65),canonical=a=>{let s=str(a),r=s;for(let i=1;i<q;i++){let b=s.slice(i)+s.slice(0,i);if(b<r)r=b}return r};
function dict(exclude){const d=new Map,counts=new Map,tri=new Map,bi=new Map;function add(w,f){if(!w.length)return;let a=d.get(w.length);if(!a)d.set(w.length,a=new Map);a.set(str(w),w);counts.set(str(w),(counts.get(str(w))||0)+f)};for(const l of lex.split("\n")){const m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)add(enc(m[1]),+m[2])}for(const s of src.sections)if(s.name!==exclude)for(const w of parse(s.source_text)){add(w,1);let a=[29,29,...w,29];for(let i=2;i<a.length;i++){let k=a[i-2]*30+a[i-1],t=k*30+a[i];bi.set(k,(bi.get(k)||0)+1);tri.set(t,(tri.get(t)||0)+1)}}return {d,counts,tri,bi}}
// All 0/1 legal redraw schedules for a proposed long plaintext word.
function recover(c,prev,p,kset){let k=Array(q).fill(-1);let paths=0;function bind(j,v,fn){if(k[j]>=0){if(k[j]===v)fn();return}k[j]=v;fn();k[j]=-1}
function go(i,j){if(i===c.length){paths++;assert(!k.includes(-1));kset.add(canonical(k));return}
let v=(c[i]-p[i]+29)%29;bind(j,v,()=>go(i+1,(j+1)%q));let prior=i?c[i-1]:prev;if(prior!==null){let u=(prior-p[i]+29)%29;bind(j,u,()=>bind((j+1)%q,v,()=>go(i+1,(j+2)%q)))}}go(0,0);return paths}
function scan(words,d){let counts=new Map,off=0,prev=null,anchors=[];for(let i=0;i<words.length;i++){let w=words[i];if(w.length>=10){let set=new Set,paths=0,ds=d.get(w.length)||new Map;for(const p of ds.values())paths+=recover(w,prev,p,set);for(const k of set)counts.set(k,(counts.get(k)||0)+1);anchors.push({i,off,n:w.length,words:ds.size,keys:set.size,paths})}off+=w.length;prev=w.at(-1)}return {anchors,keys:[...counts].sort((a,b)=>b[1]-a[1])}}
// Exact word-local DP: each state is an outgoing key phase, not a beam.
function fit(words,key,model,initial=null,prev=null){let states=Array.from({length:q},(_,j)=>initial===null||j===initial?{s:0,j,init:j,words:[],skips:[],hits:0,long:0}:null);
function wordScore(p){let x=str(p),hit=model.counts.get(x)||0,a=[29,29,...p,29],s=0;for(let i=2;i<a.length;i++){let k=a[i-2]*30+a[i-1],t=k*30+a[i];s+=Math.log((0.25+(model.tri.get(t)||0))/(7.5+(model.bi.get(k)||0)))}return {s:s+(hit?2*p.length+0.1*Math.log1p(hit):0),hit:!!hit}}
for(const w of words){let next=Array(q).fill(null);for(const st of states){if(!st)continue;let p=[],sk=[];function go(i,j){if(i===w.length){let sc=wordScore(p),s=st.s+sc.s;if(!next[j]||s>next[j].s)next[j]={s,j,init:st.init,words:st.words.concat([p.slice()]),skips:st.skips.concat([sk.slice()]),hits:st.hits+Number(sc.hit),long:st.long+Number(sc.hit&&p.length>=5)};return}let v=(w[i]-key[j]+29)%29;p.push(v);sk.push(0);go(i+1,(j+1)%q);p.pop();sk.pop();let prior=i?w[i-1]:prev,k2=key[(j+1)%q];let u=(w[i]-k2+29)%29;if(prior!==null&&(u+key[j])%29===prior){p.push(u);sk.push(1);go(i+1,(j+2)%q);p.pop();sk.pop()}}go(0,st.j)}states=next;prev=w.at(-1)}return states.filter(Boolean).sort((a,b)=>b.s-a.s)[0]}
function replay(words,path,key,prior=null){let j=path.init,prev=prior;for(let i=0;i<words.length;i++)for(let z=0;z<words[i].length;z++){let p=path.words[i][z],c=(p+key[j])%29;j=(j+1)%q;if(path.skips[i][z]){assert.equal(c,prev);c=(p+key[j])%29;j=(j+1)%q}assert.equal(c,words[i][z]);prev=c}assert.equal(j,path.j)}
function trainAndHold(train,hold,d,keys){let best=keys.map(([k,support])=>({key:k,support,path:fit(train,arr(k),d)})).sort((a,b)=>b.path.s-a.path.s)[0];let p=best.path,h=fit(hold,arr(best.key),d,p.j,train.at(-1).at(-1));replay(train,p,arr(best.key));replay(hold,h,arr(best.key),train.at(-1).at(-1));return {best,p,h}}
const output=(p,truth)=>({score:p.s,init:p.init,end:p.j,hits:p.hits,long:p.long,skips:p.skips.flat().reduce((a,b)=>a+b,0),correct:truth?p.words.flat().filter((x,i)=>x===truth.flat()[i]).length:null,n:p.words.flat().length,preview:p.words.slice(0,14).map(w=>w.map(x=>co.translit[x]).join("")).join(" ")});
let controls=[];
for(const [n,key] of [["0_welcome",[17,8,3,27,11,24,6,1]],["0_koan_1",[9,23,14,2,12,6,28,17]],["0_loss_of_divinity",[3,8,12,4,15,22,19,0]]]){const s=src.sections.find(s=>s.name===n);const ws=parse(s.source_text),d=dict(n);let j=0,prev=null,i=0;const c=ws.map(w=>w.map(p=>{let x=(p+key[j])%29;j=(j+1)%q;if(x===prev&&i%5!==0){x=(p+key[j])%29;j=(j+1)%q}prev=x;i++;return x}));const ai=ws.map((w,i)=>w.length>=10?i:-1).filter(i=>i>=0);const cut=ai[1]+1,train=c.slice(0,cut),hold=c.slice(cut),rr=scan(train,d.d),cand=rr.keys.filter(x=>x[1]>=2);assert.equal(cand.length,1);const {best,p,h}=trainAndHold(train,hold,d,cand);assert.equal(best.key,canonical(key));assert.deepEqual(p.words,ws.slice(0,cut));assert.deepEqual(h.words,ws.slice(cut));controls.push({control:n,cut,keys:cand.length,correctKey:true,train:output(p,ws.slice(0,cut)),hold:output(h,ws.slice(cut))})}
const pages=raw.split("%");pages.splice(50,0,"");assert.equal(pages.length,58);for(let i=0;i<58;i++)assert.deepEqual(parse(pages[i]).flat(),co.pages[i].indices);
const d=dict(null),cuts=[0,3,8,15,23,27,33,40,54,56];
const train=parse(pages.slice(0,3).join("%")),hold=parse(pages.slice(3,8).join("%")),rr=scan(train,d.d);
assert.equal(train.length,158);assert.equal(rr.keys.length,14);assert(rr.keys.every(x=>x[1]===1));
const {best,p,h}=trainAndHold(train,hold,d,rr.keys);
assert.deepEqual(arr(best.key),[0,11,22,27,21,12,5,22]);assert.equal(p.long,1);assert.equal(h.long,0);
let opening={anchors:rr.anchors,keys:rr.keys.length,bestKey:arr(best.key),support:best.support,train:output(p),hold:output(h),holdLongTotal:hold.filter(w=>w.length>=5).length,trainLongTotal:train.filter(w=>w.length>=5).length};
let chapters=[];
for(let i=0;i<9;i++){let a=cuts[i],b=cuts[i+1],w=parse(pages.slice(a,b).join("%")),cut=Math.floor(w.length/2),train=w.slice(0,cut),hold=w.slice(cut),r=scan(train,d.d);let summary={a,b:b-1,words:w.length,anchors:r.anchors.length,keys:r.keys.length,shared:r.keys.filter(x=>x[1]>=2).length,trainRunes:train.flat().length,holdRunes:hold.flat().length,holdLongTotal:hold.filter(w=>w.length>=5).length};assert.equal(summary.shared,0);if(r.keys.length){let {best,p,h}=trainAndHold(train,hold,d,r.keys);assert.equal(h.long,0);Object.assign(summary,{bestKey:arr(best.key),bestSupport:best.support,trainLong:p.long,holdLong:h.long,trainScore:p.s,holdScore:h.s,preview:h.words.slice(0,12).map(w=>w.map(x=>co.translit[x]).join("")).join(" ")})}chapters.push(summary)}
assert.deepEqual(chapters.map(c=>c.keys),[0,4,6,9,11,26,10,42,2]);
console.log(JSON.stringify({controls,opening,chapters},null,2));
