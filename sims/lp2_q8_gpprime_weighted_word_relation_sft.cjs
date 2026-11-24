"use strict";
/** Exact q8 GP-prime weighted cursor with arbitrary secret additive key. No phase or weight sweeps. */
const fs=require("node:fs"),path=require("node:path");
function experiment(inputs){
const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])],mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},idx=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((r,i)=>[r,i])),q=8,maskQ=255,all=(1<<29)-1,bit=x=>1<<x,rot=(x,k)=>{k=(k%q+q)%q;return ((x<<k)|(x>>>(q-k)))&maskQ},pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
function* bits(x){while(x){const b=x&-x;yield 31-Math.clz32(b);x^=b;}}
const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>idx.get(x)));
const original=parse(trans).slice(0,2896);check(String(original.flat())===String(gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"source mismatch");
const solved=native.sections.map(s=>({name:s.name,words:parse(s.source_text)}));
const dict=Array.from({length:40},()=>new Map());function add(w){if(w.length&&w.length<40)dict[w.length].set(String(w),w);}
function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return;}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v]);}}walk(0,[]);}
for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1]);}
for(const s of ["A","I","O"])variants(s);for(const s of solved)for(const w of s.words)add(w);
function encode(words,key){let phase=0;return words.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+key[phase]);phase=(phase+gp.prime[p])%q;return c;}));}
function build(ws){return ws.map(c=>{const rows=[];for(const p of (dict[c.length]||new Map()).values()){let ph=0,ok=true,used=0;const req=Array(q).fill(-1);for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){ok=false;break;}continue;}const v=mod(c[i]-p[i]);if(req[ph]>=0&&req[ph]!==v){ok=false;break;}req[ph]=v;used|=bit(ph);ph=(ph+gp.prime[p[i]])%q;}if(ok)rows.push({p,req:req.flatMap((v,i)=>v<0?[]:[[i,v]]),advance:ph,used});}return rows;});}
function solve(ws,limit=3000,fixed=null){const rows=build(ws),initialRows=rows.reduce((n,w)=>n+w.length,0);let nodes=0,passes=0,visits=0,cap=false;const found=new Map();
 const fresh=()=>({keys:fixed?fixed.map(bit):Array(q).fill(all),ph:[1,...Array(ws.length).fill(maskQ)],masks:rows.map(w=>new Uint8Array(w.length).fill(maskQ))});
 const clone=s=>({keys:s.keys.slice(),ph:s.ph.slice(),masks:s.masks.map(a=>a.slice())});
 function propagate(s){let changed=true;while(changed){changed=false;passes++;for(let dir=0;dir<2;dir++)for(let wi=0;wi<rows.length;wi++){const w=dir?rows.length-1-wi:wi,rr=rows[w],masks=s.masks[w],support=Array(29).fill(0),startBy=Array(29).fill(0);for(let ph=0;ph<q;ph++)for(const v of bits(s.keys[ph]))startBy[v]|=bit(ph);let ins=0,outs=0,free=0;
 for(let j=0;j<rr.length;j++){if(!masks[j])continue;visits++;const r=rr[j];let m=masks[j]&s.ph[w]&rot(s.ph[w+1],-r.advance);for(const [i,v] of r.req){m&=rot(startBy[v],-i);if(!m)break;}if(m!==masks[j]){masks[j]=m;changed=true;}if(!m)continue;ins|=m;outs|=rot(m,r.advance);if(free!==maskQ){let always=maskQ;for(const ph of bits(m))always&=rot(r.used,ph);free|=maskQ^always;for(const [i,v] of r.req)support[v]|=rot(m,i);}}
 if(!ins)return false;if(ins!==s.ph[w]){s.ph[w]=ins;changed=true;}if(outs!==s.ph[w+1]){s.ph[w+1]=outs;changed=true;}for(let ph=0;ph<q;ph++){if(free&bit(ph))continue;let m=0;for(const v of bits(s.keys[ph]))if(support[v]&bit(ph))m|=bit(v);if(!m)return false;if(m!==s.keys[ph]){s.keys[ph]=m;changed=true;}}
 }}return true;}
 function witness(s){const key=s.keys.map(v=>31-Math.clz32(v));let states=new Map([[0,{prev:null,p:null,n:1}]]);for(let w=0;w<rows.length;w++){const next=new Map();for(let j=0;j<rows[w].length;j++){const r=rows[w][j];for(const ph of bits(s.masks[w][j])){const prev=states.get(ph);if(!prev)continue;const end=(ph+r.advance)%q,old=next.get(end);if(old)old.n=Math.min(2,old.n+prev.n);else next.set(end,{prev,p:r.p,n:prev.n});}}states=next;}if(!states.size)return;let h=states.values().next().value;const p=[];while(h.p){p.unshift(h.p);h=h.prev;}check(String(encode(p,key).flat())===String(ws.flat()),"replay");found.set(String(key),{key,p,paths:Math.min(2,[...states.values()].reduce((n,x)=>n+x.n,0))});}
 function dfs(s){if(found.size>=2||cap)return;if(++nodes>limit){cap=true;return;}if(!propagate(s))return;let best=null;for(let i=0;i<q;i++){const n=pop(s.keys[i]);if(n>1&&(!best||n<best.n))best={type:"keys",i,n};}if(!best){witness(s);return;}for(let i=1;i<s.ph.length;i++){const n=pop(s.ph[i]);if(n>1&&n<best.n)best={type:"ph",i,n};}for(const v of bits(s[best.type][best.i])){const t=clone(s);t[best.type][best.i]=bit(v);dfs(t);if(found.size>=2||cap)return;}}
 dfs(fresh());return {keys:[...found.values()],nodes,passes,visits,cap,initialRows};}
function fitCut(ws,n){let len=0,cut=0;while(len<n&&cut<ws.length)len+=ws[cut++].length;return {cut,len};}
const summary=r=>({keys:r.keys.map(x=>({key:x.key,paths:x.paths})),nodes:r.nodes,passes:r.passes,visits:r.visits,cap:r.cap,initialRows:r.initialRows});
const plants=[];for(const [name,key] of [["0_welcome",[3,10,1,18,9,10,16,28]],["jpg107-167",[7,21,2,19,5,13,11,8]]]){const p=solved.find(x=>x.name===name).words,c=encode(p,key),{cut,len}=fitCut(c,205),res=solve(c.slice(0,cut),3000);const correct=res.keys.length===1&&!res.cap&&String(res.keys[0].key)===String(key);let holdout=null,paths=null;if(correct){const full=solve(c,3000,key);holdout=full.keys[0]?.p.flat().slice(len).filter((x,i)=>x===p.flat()[len+i]).length??null;paths=full.keys[0]?.paths??null;}plants.push({name,key,fit:len,holdoutLength:c.flat().length-len,correct,holdout,paths,result:summary(res)});}
const target=original.slice(-66);check(target.flat().length===308,"terminal mismatch");const {cut,len}=fitCut(target,205),res=solve(target.slice(0,cut),3000);let full=null;if(res.keys.length===1&&!res.cap){const z=solve(target,3000,res.keys[0].key);full=summary(z);if(z.keys.length===1)full.readout=z.keys[0].p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ");}
function model(exclude){const m=new Float64Array(900*29).fill(.1);for(const s of solved){if(s.name===exclude)continue;let a=29,b=29;for(const p of s.words.flat()){m[(a*30+b)*29+p]++;a=b;b=p;}}for(let i=0;i<m.length;i+=29){let n=0;for(let p=0;p<29;p++)n+=m[i+p];for(let p=0;p<29;p++)m[i+p]=Math.log(m[i+p]/n);}return m;}
const pow=Array.from({length:q},(_,i)=>30**i),width=10000;
function spacingBeam(tape,cut,exclude,truth=null,gold=null){const lm=model(exclude),sc=(a,b,p)=>lm[(a*30+b)*29+p];let states=new Map([[899,0]]),peak=1;
 for(let i=0;i<cut;i++){const c=tape[i],next=new Map();for(const [id,s] of states){const key=Math.floor(id/7200),ph=Math.floor((id%7200)/900),a=Math.floor((id%900)/30),b=id%30,d=Math.floor(key/pow[ph])%30;
 function emit(p,k,j){const nid=k*7200+j*900+b*30+p,v=s+sc(a,b,p);if(!next.has(nid)||next.get(nid)<v)next.set(nid,v);}
 if(c===0)emit(0,key,ph);
 if(d){const p=mod(c-(d-1));if(p!==0)emit(p,key,(ph+gp.prime[p])%q);}
 else for(let p=1;p<29;p++){const shift=mod(c-p),k=key+(shift+1)*pow[ph];emit(p,k,(ph+gp.prime[p])%q);}
 }peak=Math.max(peak,next.size);states=next.size>width?new Map([...next].sort((a,b)=>b[1]-a[1]).slice(0,width)):next;if(!states.size)break;}
 const candidates=new Map();for(const [id,score] of states){const packed=Math.floor(id/7200);const key=pow.map(x=>Math.floor(packed/x)%30-1);if(key.some(v=>v<0))continue;const sig=String(key);if(!candidates.has(sig)||candidates.get(sig).score<score)candidates.set(sig,{key,score});}
 const ranked=[...candidates.values()].sort((a,b)=>b.score-a.score);
 if(!ranked.length)return {count:0,peak};
 const best=ranked[0],key=best.key;
 // Retain the full fixed-key prefix state ensemble. The key is selected before suffix.
 let dp=new Map([[899,{score:0,node:null}]]);for(const c of tape){const next=new Map();for(const [id,r] of dp){const ph=Math.floor(id/900),a=Math.floor((id%900)/30),b=id%30;
 function emit(p,j){const nid=j*900+b*30+p,v=r.score+sc(a,b,p);if(!next.has(nid)||next.get(nid).score<v)next.set(nid,{score:v,node:{p,prev:r.node}});}
 if(c===0)emit(0,ph);const p=mod(c-key[ph]);if(p!==0)emit(p,(ph+gp.prime[p])%q);
 }dp=next;if(!dp.size)break;}
 let out=null;for(const v of dp.values())if(!out||v.score>out.score)out=v;
 const plain=[];if(out){for(let n=out.node;n;n=n.prev)plain.push(n.p);plain.reverse();check(String(encode([plain],key).flat())===String(tape),"beam fixed-key replay");}
 return {count:ranked.length,peak,selected:key,truthRank:truth?ranked.findIndex(x=>String(x.key)===String(truth))+1:null,prefixNats:best.score/cut,fullNats:out?out.score/tape.length:null,replay:!!out,holdout:tape.length-cut,exact:gold&&out?plain.slice(cut).filter((x,i)=>x===gold[cut+i]).length:null,readout:out?plain.map(v=>gp.translit[v]).join(""):null};
}
const sf=[];for(const p of plants){const plain=solved.find(s=>s.name===p.name).words.flat(),c=encode([plain],p.key).flat();sf.push({name:p.name,...spacingBeam(c,p.fit,p.name,p.key,plain)});}
const origSF=spacingBeam(target.flat(),len,null);
return {vocab:dict.reduce((n,m)=>n+m.size,0),plants,target:{fit:len,holdout:308-len,result:summary(res),full},spacingFree:{width,plants:sf,original:origSF}};
}
console.log(JSON.stringify(experiment(["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
