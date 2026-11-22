"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),tx=read("resources/liber-primus/lp2-transcription.txt"),solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const ri=new Map(corpus.runes.map((r,i)=>[r,i])),toks=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length),mod=x=>((x%29)+29)%29;
function H(v){const o=[];for(let l=0,r=v.length-1;l<r;l++,r--)o.push(mod(v[l]-v[r]),mod(v[l]+v[r]));if(v.length%2)o.push(v[(v.length-1)/2]);return o;}
const hsum=v=>mod(H(v).reduce((a,b)=>a+b,0));
function gp(w){const n=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<n.length;){if(n.startsWith("ING",i)){o.push(21);i+=3;continue;}if(n.startsWith("IO",i)){o.push(27);i+=2;continue;}const t=toks.find(x=>n.startsWith(x.symbol,i));assert.ok(t);o.push(t.value);i+=t.symbol.length;}return o;}
function runeWords(src){const out=[];let cur=[];for(const ch of [...src]){const v=ri.get(ch);if(v!==undefined)cur.push(v);else if(cur.length){out.push(cur);cur=[];}}if(cur.length)out.push(cur);return out;}
const pool=new Map();for(const sec of solved.sections)for(const v of runeWords(sec.source_text))pool.set(v.join(","),{label:v.map(x=>corpus.translit[x]).join(""),values:v});
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n"),source=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map(w=>w.toUpperCase());
for(const w of source){const v=gp(w);pool.set(v.join(","),{label:w,values:v});}
const seven=[...pool.values()].filter(x=>x.values.length===7);assert.equal(pool.size,293);assert.equal(seven.length,36);
const cipher=[15,22,16,22,21,1,4],plain=gp("DEVOTED"),key=cipher.map((x,i)=>mod(x-plain[i])),signature=[hsum(key),hsum(key.slice(0,2)),14,hsum(key.slice(2))];
assert.deepEqual(plain,[23,18,1,3,16,18,23]);assert.deepEqual(key,[21,4,15,19,5,12,10]);assert.deepEqual(signature,[12,13,14,15]);assert.deepEqual(signature.map(i=>source[i]),["THE","WAY","ITS","WORDS"]);
const one=[];for(const sign of [1,-1])for(const cand of seven){const k=cipher.map((x,i)=>mod(sign===1?x-cand.values[i]:cand.values[i]-x)),s=[hsum(k),hsum(k.slice(0,2)),14,hsum(k.slice(2))],d=s[1]-s[0];if((d===1||d===-1)&&s.every((x,i)=>i===0||x-s[i-1]===d))one.push({sign:sign===1?"C-P":"P-C",label:cand.label,key:k,signature:s});}
assert.deepEqual(one,[{sign:"C-P",label:"DEVOTED",key,signature:[12,13,14,15]}]);
const parts=tx.split(/^\s*%\s*$/m).slice(0,55),receivers=[];
for(let seg=0;seg<parts.length;seg++){const page=seg>=50?seg+1:seg;let off=0,cur=[],start=0,breaks=[];const flush=()=>{if(cur.length===7)receivers.push({page,start,values:cur.slice(),breaks:breaks.slice()});cur=[];breaks=[];};for(const ch of [...parts[seg]]){const v=ri.get(ch);if(v!==undefined){if(!cur.length)start=off;cur.push(v);off++;}else if(ch==="/"){if(cur.length)breaks.push(cur.length);}else if(!/\s/u.test(ch))flush();}flush();}
const split2=receivers.filter(r=>r.breaks.length===1&&r.breaks[0]===2);assert.equal(split2.length,15);
const hits=[];for(const r of split2)for(const sign of [1,-1])for(const cand of seven){const k=r.values.map((x,i)=>mod(sign===1?x-cand.values[i]:cand.values[i]-x)),s=[hsum(k),hsum(k.slice(0,2)),14,hsum(k.slice(2))],d=s[1]-s[0];if((d===1||d===-1)&&s.every((x,i)=>i===0||x-s[i-1]===d))hits.push({page:r.page,start:r.start,sign:sign===1?"C-P":"P-C",label:cand.label,key:k,signature:s});}
assert.deepEqual(hits,[{page:0,start:237,sign:"C-P",label:"DEVOTED",key,signature:[12,13,14,15]}]);
console.log(JSON.stringify({status:"PASS",recovery:{cipher,plaintext:"DEVOTED",plain,key,keyTyping:["p-K","q","b","B","g","b-e","A+K"],signature,words:["THE","WAY","ITS","WORDS"]},controls:{vectors:pool.size,seven:seven.length,fixedCases:72,split2:split2.length,transferCases:1080,hits}},null,2));
