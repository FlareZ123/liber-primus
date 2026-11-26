'use strict';
const fs=require('node:fs');
const path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function solve(inputs) {
const [corpusText,transcription,dict,lp1]=inputs;
const corpus=JSON.parse(corpusText), raw=transcription.replace(/\r/g,"").split("%"), ri=new Map(corpus.runes.map((x,i)=>[x,i])), tr=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const mod=x=>(x%29+29)%29, char=x=>String.fromCharCode(65+x), code=a=>a.map(char).join(""), decode=s=>Array.from(s,x=>x.charCodeAt(0)-65);
const check=(v,msg)=>{if(!v)throw Error(msg)};
function encode(input,old=false){let s=input.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");if(old)s=s.replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<s.length;){const x=tr.find(t=>s.startsWith(t.s,i));if(!x)return null;a.push(x.i);i+=x.s.length}return a}
const dicts=new Map();for(const line of dict.split(/\r?\n/)){const m=/^([a-z]+)\s+\d+$/.exec(line);if(!m)continue;for(const old of [false,true]){const w=encode(m[1],old);if(!w)continue;if(!dicts.has(w.length))dicts.set(w.length,new Set());dicts.get(w.length).add(code(w));}}
const byLen=new Map([...dicts].map(([l,s])=>[l,[...s].map(decode)]));
function pageWords(p){let out=[],a=[],off=0,start=0;const flush=()=>{if(a.length)out.push({start,end:off,a});a=[];};for(const ch of raw[p]){const v=ri.get(ch);if(v!==undefined){if(!a.length)start=off;a.push(v);off++}else if(ch!=="/"&&!/\s/u.test(ch))flush()}flush();check(code(out.flatMap(w=>w.a))===code(corpus.pages[p].indices),"page mismatch "+p);return out;}
const line6start=Array.from(raw[28].split("/").slice(0,5).join("")).filter(x=>ri.has(x)).length, line6len=Array.from(raw[28].split("/")[5]).filter(x=>ri.has(x)).length;
check(line6len===23,"line6");const p27=pageWords(27),p28=pageWords(28),p29=pageWords(29);check(p27[19].start===79&&p29[29].start===108,"coordinates");
const pages=[p27.filter(w=>w.start>=19&&w.end<234&&w.start!==79),p28.filter(w=>w.start>0&&w.end<269&&(w.end<=line6start||w.start>=line6start+line6len)),p29.filter(w=>w.start>0&&w.end<277&&w.start!==108)];
const multiset=[2,2,5,14,15,22,25], keys=[];
function perm(prefix,rest){if(!rest.length){keys.push([0,...prefix]);return}for(let i=0;i<rest.length;i++){if(i&&rest[i]===rest[i-1])continue;perm([...prefix,rest[i]],rest.filter((_,j)=>i!==j));}}
perm([],multiset);check(keys.length===2520,"necklace count");
const keyIndex=new Map();for(let j=0;j<keys.length;j++)for(let ph=0;ph<8;ph++){let s="";for(let n=0;n<8;n++){s+=char(keys[j][(ph+n)%8]);if(!keyIndex.has(s))keyIndex.set(s,new Set());keyIndex.get(s).add(j);}}
const allIds=keys.map((_,i)=>i);
function difference(c,p,sign,hold){const d=[];for(let i=0;i<c.length;i++){if(hold&&p[i]===0){if(c[i]!==0)return null;continue;}d.push(mod(sign*(c[i]-p[i])));}for(let i=8;i<d.length;i++)if(d[i]!==d[i%8])return null;return code(d.slice(0,8));}
function wordSupport(c,sign,hold){const ids=new Set();for(const p of byLen.get(c.length)||[]){const d=difference(c,p,sign,hold);if(d===null)continue;for(const j of d===""?allIds:keyIndex.get(d)||[])ids.add(j);}return ids;}
function evaluate(words,sign,hold){const score=new Uint16Array(keys.length);const supported=words.map(w=>wordSupport(w.a,sign,hold));for(const ids of supported)for(const id of ids)score[id]++;return {score,supported};}
function candidates(c,key,sign,hold){let out=[];for(const p of byLen.get(c.length)||[]){const d=difference(c,p,sign,hold);if(d===null)continue;if(d===""||Array.from({length:8},(_,ph)=>code(Array.from({length:d.length},(_,i)=>key[(ph+i)%8]))).includes(d))out.push(code(p));}return out;}
const render=s=>decode(s).map(x=>corpus.translit[x]).join("");
const results=[];
for(const sign of [1,-1])for(const hold of [false,true]){
  const ev=pages.map(w=>evaluate(w,sign,hold)), best=Math.max(...ev[1].score), top=allIds.filter(i=>ev[1].score[i]===best), first=top[0];const max=ev.map(e=>Math.max(...e.score)), minOov=max.map((x,i)=>pages[i].length-x);
  const ranked=allIds.slice().sort((a,b)=>ev[1].score[b]-ev[1].score[a]||a-b);
  const candidateWords=pages.map((ws,j)=>ws.map((w,i)=>ev[j].supported[i].has(first)?{offset:w.start,options:candidates(w.a,keys[first],sign,hold).slice(0,6).map(render)}:null).filter(Boolean));
  results.push({sign,hold,max,minOov,fitBest:best,fitTies:top.length,fitBestKey:keys[first],fitTopP29Range:[Math.min(...top.map(i=>ev[2].score[i])),Math.max(...top.map(i=>ev[2].score[i]))],fitTopP27Range:[Math.min(...top.map(i=>ev[0].score[i])),Math.max(...top.map(i=>ev[0].score[i]))],bestJoint:Math.max(...allIds.map(i=>ev.reduce((s,e)=>s+e.score[i],0))),keysWithin5pct:allIds.filter(i=>ev.every((e,j)=>e.score[i]>=pages[j].length-Math.floor(pages[j].length*.05))).length,firstKeyCandidateWords:candidateWords});
}
const words=lp1.split(/\r?\n/).filter(x=>/^[A-Z0-9 ,.;'"!?-]+$/.test(x)).join(" ").match(/[A-Z]+/g).map(s=>encode(s)).filter(w=>w&&dicts.get(w.length)?.has(code(w)));
function encrypt(p,key,phase,sign,hold){let j=phase;return p.map(x=>{if(hold&&x===0)return 0;const c=mod(x+sign*key[j%8]);j++;return c;});}
const controls=[];
for(let t=0;t<4;t++){const sign=t%2? -1:1,hold=t>=2,keyId=[413,1709,2011,731][t], key=keys[keyId];let state=12345+t;function rnd(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state}
const plain=words.slice(t*60,t*60+100), ct=plain.map(p=>({a:encrypt(p,key,rnd()%8,sign,hold)})), fit=evaluate(ct.slice(0,60),sign,hold), max=Math.max(...fit.score), ties=allIds.filter(i=>fit.score[i]===max), chosen=ties[0], withheld=ct.slice(60), truths=withheld.map((w,i)=>candidates(w.a,keys[chosen],sign,hold).includes(code(plain[60+i])));
controls.push({sign,hold,planted:key,selected:keys[chosen],fit:max,fitWords:60,ties:ties.length,heldoutTruth:truths.filter(Boolean).length,heldoutWords:withheld.length,heldoutUnique:withheld.filter((w,i)=>candidates(w.a,keys[chosen],sign,hold).length===1&&truths[i]).length});}
return {scope:"exact cyclic-order inference for candidate DH pad multiset, intact complete printed groups, independent phase, ordinary or literal plaintext F hold",dictionaryCount:[...dicts.values()].reduce((s,d)=>s+d.size,0),keys:keys.length,source:{p28Line6:[line6start,line6start+line6len],groupCounts:pages.map(w=>w.length),excluded:"p27 heading, fitted core word, terminal fragment; p28 line6 and page endpoint groups; p29 fitted word30 and page endpoint groups"},results,controls};
}
const input=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(solve(input),null,2));
