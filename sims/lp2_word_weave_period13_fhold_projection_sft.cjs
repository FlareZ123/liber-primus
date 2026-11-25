"use strict";
// Fixed outside-in printed-word weaving before or after authentic GP29 period-eight F-hold Vigenere.
// Node 22 CommonJS; no dependencies. Exact zero-free long-anchor key classes.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const co=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw=read("resources/liber-primus/lp2-transcription.txt");
const src=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const lex=read("resources/control/english_wordfreq_textblob.txt");
const Q=13,mod=x=>(x%29+29)%29,g=new Map(co.runes.map((v,i)=>[v,i]));
const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(c=>g.get(c)));
const str=a=>String.fromCharCode(...a.map(x=>65+x)),arr=s=>[...s].map(c=>c.charCodeAt(0)-65);
const render=a=>a.map(x=>co.translit[x]).join("");
/** @param {number} n @returns {number[]} */
function order(n){return Array.from({length:n},(_,i)=>i%2?n-1-(i>>1):i>>1)}
const weave=a=>order(a.length).map(j=>a[j]);
function unweave(a){let out=Array(a.length);order(a.length).forEach((j,i)=>out[j]=a[i]);return out}
function canonical(k){let s=str(k),b=s;for(let j=1;j<Q;j++){let t=s.slice(j)+s.slice(0,j);if(t<b)b=t}return b}
/** Frozen GP lexical spelling convention, same as existing collision-redraw SFT. */
function enc(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let o=[];for(let i=0;i<w.length;){let j=co.translit.indexOf(w.slice(i,i+2));if(j>=0){o.push(j);i+=2}else{j=co.translit.indexOf(w[i++]);if(j<0)return [];o.push(j)}}return o}
function model(exclude){let words=new Map,byLength=new Map,bi=new Map,tri=new Map;function add(w,f){if(!w.length)return;let s=str(w);words.set(s,(words.get(s)||0)+f);if(!w.includes(0)&&w.length>=10){if(!byLength.has(w.length))byLength.set(w.length,new Map);byLength.get(w.length).set(s,w)}}for(const l of lex.split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)add(enc(m[1]),+m[2])}for(const s of src.sections)if(s.name!==exclude)for(const w of parse(s.source_text)){add(w,1);let a=[29,29,...w,29];for(let i=2;i<a.length;i++){let k=a[i-2]*30+a[i-1],t=k*30+a[i];bi.set(k,(bi.get(k)||0)+1);tri.set(t,(tri.get(t)||0)+1)}}return {words,byLength,bi,tri}}
/** A zero-free cipher word cannot contain a transparent F in either layer order.
 * An anchor of length >=13 fixes all key digits, up to rotation.
 */
function unusedFullAnchors(ws,m,mode){let map=new Map,detail=[];for(let i=0;i<ws.length;i++){let c=ws[i];if(c.length<Q||c.includes(0))continue;let d=m.byLength.get(c.length)||new Map,keys=new Set;for(const p of d.values()){let a=mode==="before"?weave(p):p,b=mode==="after"?unweave(c):c,k=Array(Q).fill(-1),ok=true;for(let j=0;j<a.length;j++){let v=mod(b[j]-a[j]);if(k[j%Q]>=0&&k[j%Q]!==v){ok=false;break}k[j%Q]=v}if(ok)keys.add(canonical(k))}for(const key of keys)map.set(key,(map.get(key)||0)+1);detail.push({word:i,length:c.length,classes:keys.size})}let list=[...map].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));return {detail,list,max:list[0]?.[1]||0}}
/** Exact F-hold forward encryption with persistent consuming phase. */
function encrypt(ws,k,mode,start=0){let j=start;let out=ws.map(w=>{let a=mode==="before"?weave(w):w;let b=a.map(p=>{if(p===0)return 0;let c=mod(p+k[j]);j=(j+1)%Q;return c});return mode==="after"?weave(b):b});return {out,end:j}}
function score(w,m){let a=[29,29,...w,29],s=0;for(let i=2;i<a.length;i++){let k=a[i-2]*30+a[i-1],t=k*30+a[i];s+=Math.log(((m.tri.get(t)||0)+0.25)/((m.bi.get(k)||0)+7.5))}let f=m.words.get(str(w))||0;return s+(f?2*w.length+0.1*Math.log1p(f):0)}
/** Exact word-local Viterbi: no beam, all latent F holds and all key phases. */
function decode(ws,k,mode,m,start=null){let st=Array.from({length:Q},(_,j)=>start===null||start===j?{score:0,start:j,end:j,prev:null,w:null}:null);for(const c of ws){let nx=Array(Q).fill(null),a=mode==="after"?unweave(c):c;for(const v of st){if(!v)continue;let p=[];function go(i,j){if(i===a.length){let w=mode==="before"?unweave(p):p.slice(),s=v.score+score(w,m);if(!nx[j]||s>nx[j].score)nx[j]={score:s,start:v.start,end:j,prev:v,w};return}if(a[i]===0){p.push(0);go(i+1,j);p.pop()}let u=mod(a[i]-k[j]);if(u!==0){p.push(u);go(i+1,(j+1)%Q);p.pop()}}go(0,v.end)}st=nx;if(!st.some(Boolean))return null}let best=st.filter(Boolean).sort((a,b)=>b.score-a.score)[0],out=[];for(let v=best;v.prev;v=v.prev)out.push(v.w);out.reverse();return {score:best.score,start:best.start,end:best.end,out}}
function candidate(train,hold,m,mode,list){let best=null;for(const [key,support] of list){let k=arr(key),fit=decode(train,k,mode,m);if(fit&&(!best||fit.score>best.fit.score))best={key,k,support,fit}}if(!best)return null;let h=decode(hold,best.k,mode,m,best.fit.end);assert.deepEqual(encrypt(best.fit.out,best.k,mode,best.fit.start).out,train);if(h)assert.deepEqual(encrypt(h.out,best.k,mode,h.start).out,hold);return {...best,h}}
function summary(x,m,truth){if(!x)return null;let a=x.out.flat(),t=truth?.flat();return {runes:a.length,scorePerRune:x.score/a.length,lexical:x.out.filter(w=>m.words.has(str(w))).length,words:x.out.length,correct:t?a.filter((v,i)=>v===t[i]).length:null,preview:x.out.slice(0,16).map(render).join(" ")}}

// Exact q13 projection join of zero-free printed groups of length >=10.
// Pair compatibility permits arbitrary relative key phase; incomplete unions remain edges.
function partials(ws,m,mode){let out=[];for(let i=0;i<ws.length;i++){let c=ws[i];if(c.length<10||c.includes(0))continue;let d=m.byLength.get(c.length)||new Map,ks=new Set;for(const p of d.values()){let a=mode==="before"?weave(p):p,b=mode==="after"?unweave(c):c,k=Array(Math.min(Q,a.length)).fill(-1),ok=true;for(let j=0;j<a.length;j++){let v=mod(b[j]-a[j]);if(k[j%Q]>=0&&k[j%Q]!==v){ok=false;break}k[j%Q]=v}if(ok)ks.add(str(k))}out.push({word:i,length:c.length,L:Math.min(c.length,Q),ks:[...ks]})}return out}
function pair(a,b,full){let hit=false,joins=0,complete=0;for(let r=0;r<Q;r++){let ai=[],bi=[],used=new Set;for(let j=0;j<a.L;j++){used.add(j);let z=(j-r+Q)%Q;if(z<b.L){ai.push(j);bi.push(z)}}for(let j=0;j<b.L;j++)used.add((j+r)%Q);let cov=used.size===Q,idx=new Map;for(const k of a.ks){let sig=ai.map(z=>k[z]).join("");if(!idx.has(sig))idx.set(sig,[]);idx.get(sig).push(k)}for(const k of b.ks){let sig=bi.map(z=>k[z]).join(""),matches=idx.get(sig);if(!matches)continue;hit=true;joins+=matches.length;if(cov){complete+=matches.length;for(const m of matches){let v=Array(Q).fill(-1);for(let j=0;j<a.L;j++)v[j]=m.charCodeAt(j)-65;for(let j=0;j<b.L;j++)v[(j+r)%Q]=k.charCodeAt(j)-65;assert(!v.includes(-1));full.add(canonical(v))}}}}return {hit,joins,complete}}
function scan13(ws,m,mode){let a=partials(ws,m,mode),full=new Set,edges=Array(a.length).fill(0),pairs=0,joins=0,complete=0;for(let i=0;i<a.length;i++){if(a[i].L===Q)for(const k of a[i].ks)full.add(canonical(arr(k)));for(let j=i+1;j<a.length;j++){let z=pair(a[i],a[j],full);if(z.hit){pairs++;edges[i]|=1<<j;edges[j]|=1<<i}joins+=z.joins;complete+=z.complete}}
let clique=0;function search(mask,n){if(n>clique)clique=n;while(mask){let b=mask&-mask,i=31-Math.clz32(b);mask^=b;search(mask&edges[i],n+1)}}assert(a.length<31);search((1<<a.length)-1,0);
let candidates=[...full].map(k=>{let r=[];for(let i=0;i<Q;i++)r.push(k.slice(i)+k.slice(0,i));let support=a.filter(x=>{let p=new Set(x.ks);return r.some(y=>p.has(y.slice(0,x.L)))}).length;return [k,support]}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
return {anchors:a.map(({ks,...v})=>({...v,partials:ks.length})),pairs,joins,complete,clique,candidates}}
function choose13(train,hold,m,mode,z){let list=z.candidates.filter(x=>x[1]>=2);if(!list.length)return null;return candidate(train,hold,m,mode,list)}
let controls=[];
for(const [name,k] of [["0_welcome",[17,8,3,27,11,24,6,1,15,2,22,12,4]],["0_loss_of_divinity",[9,23,14,2,12,6,28,17,4,3,21,18,1]]]){let w=parse(src.sections.find(s=>s.name===name).source_text),m=model(name);for(const mode of ["before","after"]){let c=encrypt(w,k,mode).out,cut=Math.floor(w.length*0.8),train=c.slice(0,cut),hold=c.slice(cut),z=scan13(train,m,mode),b=choose13(train,hold,m,mode,z);controls.push({name,mode,cut,anchors:z.anchors,pairs:z.pairs,complete:z.complete,candidates:z.candidates.length,supported:z.candidates.filter(x=>x[1]>=2).length,keyRecovered:b?.key===canonical(k),fit:b?summary(b.fit,m,w.slice(0,cut)):null,hold:b?summary(b.h,m,w.slice(cut)):null})}}
assert.equal(controls.filter(x=>x.keyRecovered).length,3);
for(const c of controls.filter(x=>x.keyRecovered)){assert.equal(c.fit.correct,c.fit.runes);assert.equal(c.hold.correct,c.hold.runes)}
const pg=raw.split("%");pg.splice(50,0,"");for(let i=0;i<58;i++)assert.deepEqual(parse(pg[i]).flat(),co.pages[i].indices);const tape=parse(pg.slice(0,56).join("%"));assert.equal(tape.length,2896);assert.equal(tape.flat().length,12956);
let off=0,items=tape.map(a=>{let x={a,off};off+=a.length;return x});
const pages=[0,3,8,15,23,27,33,40,54,56],cuts=pages.map(n=>co.pages.slice(0,n).reduce((s,p)=>s+p.indices.length,0)),m=model(null),original=[];
for(let i=0;i<9;i++){let w=items.filter(x=>x.off>=cuts[i]&&x.off+x.a.length<=cuts[i+1]).map(x=>x.a),cut=Math.floor(w.length*0.8);for(const mode of ["before","after"]){let z=scan13(w,m,mode),f=scan13(w.slice(0,cut),m,mode),b=choose13(w.slice(0,cut),w.slice(cut),m,mode,f);original.push({pages:[pages[i],pages[i+1]-1],mode,anchors:z.anchors.length,pairs:z.pairs,joins:z.joins,complete:z.complete,clique:z.clique,forcedOOV:z.anchors.length-z.clique,fullKeyClasses:z.candidates.length,fitCandidates:f.candidates.filter(x=>x[1]>=2).length,fitCandidateKeys:f.candidates.filter(x=>x[1]>=2).map(x=>arr(x[0])),key:b?.k||null,fit:b?summary(b.fit,m):null,hold:b?summary(b.h,m):null})}}
console.log(JSON.stringify({lexiconSize:m.words.size,controls,original},null,2));
