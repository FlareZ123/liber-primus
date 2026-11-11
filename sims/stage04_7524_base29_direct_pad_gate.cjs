#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {parseLP2Words,physicalLP2Page}=require('./lp2_word_pages.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),text=p=>read(p).toString('utf8');
const gitSha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const object=read('resources/external/derived/2014-stage04/04-outguess.bin'),wrong=read('resources/external/derived/2014-stage04/03-outguess.asc');
const cb=read('resources/liber-primus/lp2-corpus.json'),tb=read('resources/liber-primus/lp2-transcription.txt'),corpus=JSON.parse(cb.toString('utf8'));
assert.equal(object.length,7524);assert.equal(gitSha(object),'d738b052bf0548e2f431e231af7ef1514becb4ad');
assert.equal(crypto.createHash('sha256').update(object).digest('hex'),'35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db');
assert.equal(wrong.length,31809);assert.equal(gitSha(wrong),'2a355d1bf14d37041384f09d8700e2ee274a13e6');
assert.equal(gitSha(cb),'054f2a0f780b7d46901acbe3d9bf4f0ac1801165');assert.equal(gitSha(tb),'43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7');
const pages=Array.from({length:56},(_,i)=>corpus.pages.find(p=>p.page===i)).filter(p=>p&&p.indices.length),cipher=pages.flatMap(p=>p.indices),physical=pages.map(p=>p.page);
assert.equal(pages.length,55);assert.equal(cipher.length,12956);
const parsed=parseLP2Words(tb.toString('utf8'));assert.equal(parsed.runeCount,12956);assert.equal(parsed.words.length,2896);
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));assert.deepEqual(parsed.words.flatMap(w=>[...w.runes].map(r=>ri.get(r))),cipher);
assert.deepEqual(Array.from({length:55},(_,i)=>physicalLP2Page(i)),physical);
let off=0;const words=parsed.words.map(w=>{const x={...w,start:off,end:off+w.length};off+=w.length;return x;});assert.equal(off,12956);
const pageBounds=[];off=0;for(const p of pages){pageBounds.push({physical_page:p.page,start:off,end:off+p.indices.length,rune_count:p.indices.length});off+=p.indices.length;}
const wordBounds=words.map(w=>({start:w.start,end:w.end,start_page:physicalLP2Page(w.startPage),end_page:physicalLP2Page(w.endPage),length:w.length}));
const base29=b=>b.flatMap(x=>[Math.floor(x/29),x%29]),key=base29(object),wrongKey=base29(wrong);assert.equal(key.length,15048);
const mod=x=>((x%29)+29)%29,dec=(c,s,k)=>c.map((x,i)=>mod(x+s*k[i])),enc=(p,s,k)=>p.map((x,i)=>mod(x-s*k[i]));
const tokens=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
function gpWord(raw){const w=raw.toUpperCase().replace(/[VKZQ]/g,c=>({V:'U',K:'C',Z:'S',Q:'C'})[c]),o=[];for(let i=0;i<w.length;){const t=tokens.find(x=>w.startsWith(x.token,i));if(!t)return null;o.push(t.index);i+=t.token.length;}return o;}
function gpWords(s){const o=[];for(const raw of s.match(/[A-Za-z]+/g)||[]){const w=gpWord(raw);if(w)o.push(w);}return o;}
const native={Gibran:gpWords(text('resources/control/gibran_prophet_58585.txt')),Shakespeare:gpWords(text('resources/control/shakespeare_first300k.txt')),Emerson:gpWords(text('resources/control/emerson_essays_2944.txt'))};
function model(ws){const u=Array(29).fill(0),b=Array.from({length:29},()=>Array(29).fill(0)),bt=Array(29).fill(0),t=new Map();let n=0;for(const w of ws){for(const x of w){u[x]++;n++;}for(let i=1;i<w.length;i++){b[w[i-1]][w[i]]++;bt[w[i-1]]++;}for(let i=2;i<w.length;i++){const k=w[i-2]*29+w[i-1];if(!t.has(k))t.set(k,{c:Array(29).fill(0),n:0});const q=t.get(k);q.c[w[i]]++;q.n++;}}return{u,n,b,bt,t};}
function score(ws,m){let u=0,b=0,t=0,nu=0,nb=0,nt=0;for(const w of ws){for(const x of w){u+=Math.log((m.u[x]+.5)/(m.n+14.5));nu++;}for(let i=1;i<w.length;i++){b+=Math.log((m.b[w[i-1]][w[i]]+.5)/(m.bt[w[i-1]]+14.5));nb++;}for(let i=2;i<w.length;i++){const q=m.t.get(w[i-2]*29+w[i-1]);t+=Math.log(((q?.c[w[i]]||0)+.5)/((q?.n||0)+14.5));nt++;}}return{unigram_mean:u/nu,bigram_mean:b/nb,trigram_mean:t/nt};}
const split={},models={};for(const[n,ws]of Object.entries(native)){const k=Math.floor(ws.length*.8);split[n]={train:ws.slice(0,k),holdout:ws.slice(k)};models[n]=model(split[n].train);}
const lengths=words.map(w=>w.length),wordArrays=p=>words.map(w=>p.slice(w.start,w.end)),candidates=[-1,1].map(s=>{const p=dec(cipher,s,key);assert.deepEqual(enc(p,s,key),cipher);return{sign:s,plain:p,words:wordArrays(p)};});
const pool=new Map();for(const x of Object.values(split))for(const w of x.holdout){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w);}assert.deepEqual([...new Set(lengths)].filter(n=>!pool.has(n)),[]);
let seed=0x03802014;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/0x100000000;}
const control={};for(const n of Object.keys(models))control[n]={unigram:[],bigram:[],trigram:[]};
for(let i=0;i<200;i++){const ws=lengths.map(n=>{const a=pool.get(n);return a[Math.floor(rand()*a.length)];});for(const[n,m]of Object.entries(models)){const q=score(ws,m);control[n].unigram.push(q.unigram_mean);control[n].bigram.push(q.bigram_mean);control[n].trigram.push(q.trigram_mean);}}
function summary(a){const s=a.slice().sort((x,y)=>x-y),mean=a.reduce((x,y)=>x+y,0)/a.length;return{min:s[0],median:s[100],mean,max:s[199]};}
function pLow(x,a){return(1+a.filter(y=>y<=x).length)/201;}
const controls={count:200,exact_word_length_profile:true,models:{}};
for(const[n,c]of Object.entries(control))controls.models[n]={unigram:summary(c.unigram),bigram:summary(c.bigram),trigram:summary(c.trigram)};
const matched={};for(const c of candidates){const name=c.sign===-1?'P=C-K':'P=C+K';matched[name]={};for(const[n,m]of Object.entries(models)){const q=score(c.words,m),v=control[n];matched[name][n]={scores:q,lower_tail_p:{unigram:pLow(q.unigram_mean,v.unigram),bigram:pLow(q.bigram_mean,v.bigram),trigram:pLow(q.trigram_mean,v.trigram)}};}}
const shuffled=object.slice();let sh=0x33012014;function sr(){sh^=sh<<13;sh^=sh>>>17;sh^=sh<<5;return(sh>>>0)/0x100000000;}for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(sr()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
const nulls={};for(const[n,k]of[['wrong_source_page03',wrongKey],['shuffled_page04',base29(shuffled)]]){nulls[n]={};for(const s of[-1,1]){const p=dec(cipher,s,k);assert.deepEqual(enc(p,s,k),cipher);nulls[n][s===-1?'P=C-K':'P=C+K']=Object.fromEntries(Object.entries(models).map(([name,m])=>[name,score(wordArrays(p),m)]));}}
const plant=native.Gibran.flat().slice(0,12956);for(const s of[-1,1])assert.deepEqual(dec(enc(plant,s,key),s,key),plant);
const out={ciphertext:{runes:12956,words:2896,physical_pages:physical},page_boundaries:pageBounds,word_boundaries:wordBounds,key_digits:key.length,unused_tail_digits:key.length-cipher.length,candidates:candidates.map(c=>({operation:c.sign===-1?'P=C-K':'P=C+K',gp_indices:c.plain,pages:pageBounds.map(p=>({physical_page:p.physical_page,start:p.start,end:p.end,text:c.plain.slice(p.start,p.end).map(i=>corpus.translit[i]).join('')}))})),matched_native_controls:controls,matched_candidate_scores:matched,wrong_source_and_shuffled_null:nulls,positive_control:{native_gibran_12956_runes_exact_both_signs:true},source_sha256:crypto.createHash('sha256').update(object).digest('hex')};
console.log(JSON.stringify(out,null,2));
