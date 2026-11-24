'use strict';
/** Original p0 27-column causal stencil, exact all-secret lexical recovery. */
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw){
const corpus=JSON.parse(raw[0]),native=JSON.parse(raw[2]),runes=corpus.runes,mod=x=>((x%29)+29)%29,assert=(c,m)=>{if(!c)throw Error(m)},inv=x=>{for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error("singular")};
const tok=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
const parse=t=>t.split(new RegExp("[^"+runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(c=>runes.indexOf(c)));
function latin(t){return (t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const v=tok.find(v=>w.startsWith(v.s,i));assert(v,"unmapped "+w);out.push(v.i);i+=v.s.length}}return out})}
const sig=w=>String.fromCharCode(...w);
const wordlist=raw[3].split(/\r?\n/).map(x=>x.match(/^([a-z]+)\s+[1-9]\d*$/i)?.[1]).filter(Boolean);
const dict=new Set(latin(wordlist.join(" ")).map(sig)),two=new Set([...dict].filter(x=>x.length===2)),one=[24,10,3];
function spans(ws){let pos=0;return ws.map(w=>{const s=pos;pos+=w.length;return [s,pos]})}
const get=(x,i)=>i>=0?x[i]:0;
const row=(c,i)=>[c[i],get(c,i-1),get(c,i-27),get(c,i-28),1];
const dot=(r,k)=>mod(r.reduce((s,x,j)=>s+x*k[j],0));
const decode=(c,k)=>c.map((_,i)=>dot(row(c,i),k));
function encode(p,k){let c=[],a=inv(k[0]);for(let i=0;i<p.length;i++)c.push(mod(a*(p[i]-k[1]*get(c,i-1)-k[2]*get(c,i-27)-k[3]*get(c,i-28)-k[4])));return c}
function rref(rows,n){let a=rows.map(r=>r.slice()),rank=0;for(let col=0;col<n;col++){let j=a.findIndex((r,i)=>i>=rank&&r[col]!==0);if(j<0)continue;[a[rank],a[j]]=[a[j],a[rank]];const d=inv(a[rank][col]);a[rank]=a[rank].map(v=>mod(v*d));for(let i=0;i<a.length;i++)if(i!==rank){const f=a[i][col];a[i]=a[i].map((v,j)=>mod(v-f*a[rank][j]))}rank++}return {a,rank}}
function score(p,ss,lo,hi){let hit=0,total=0,oneBad=0,twoBad=0,twoN=0,oneN=0;for(const [s,e] of ss){if(s<lo||e>hi)continue;let n=e-s;if(n===1){oneN++;if(!one.includes(p[s]))oneBad++}else if(n===2){twoN++;if(!two.has(sig(p.slice(s,e))))twoBad++}if(n>=2){total+=n;if(dict.has(sig(p.slice(s,e))))hit+=n}}return {hit,total,coverage:hit/total,oneBad,oneN,twoBad,twoN}}
function recover(c,ss,cut){const single=ss.filter(([s,e])=>e<=cut&&e-s===1).map(([s])=>s);let rows=[],selected=[];for(const i of single){const z=row(c,i);if(rref([...rows,z],5).rank>rows.length){rows.push(z);selected.push(i)}if(rows.length===5)break}
const n=rows.length;if(n<5)return {rank:n,selected,skipped:true};
const mat=rref(rows.map((r,i)=>[...r,...Array.from({length:5},(_,j)=>i===j?1:0)]),5).a.map(r=>r.slice(5));
let total=0,invertible=0,singleOK=0,twoOK=0,best=null,ties=0;const keys=[];
function visit(v){if(v.length<5){for(const x of one)visit([...v,x]);return}total++;const k=mat.map(r=>dot(r,v));if(k[0]===0)return;invertible++;if(single.some(i=>!one.includes(dot(row(c,i),k))))return;singleOK++;const p=decode(c.slice(0,cut),k),sc=score(p,ss,0,cut);if(sc.twoBad===0){twoOK++;keys.push(k)}if(!best||sc.hit>best.hit){best={k,...sc};ties=1}else if(sc.hit===best.hit)ties++}
visit([]);return {selected,rank:n,total,invertible,singleOK,twoOK,best,ties,keys}}
const orig=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),words=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,""));assert(words.flat().join(",")===orig.join(",")&&orig.length===12956&&words.length===2896,"canonical source");
const ss=spans(words),keys=[[7,3,12,17,21],[19,6,4,23,10]];
const donors=native.sections.filter(s=>["0_koan_1","jpg107-167"].includes(s.name)).map(s=>({name:s.name,words:parse(s.source_text),native:true}));
for(let i=4;i<6;i++){const all=latin(raw[i]);let n=0,ws=[];for(const w of all){if(n+w.length>2409)break;ws.push(w);n+=w.length}donors.push({name:["Gibran","Shakespeare"][i-4],words:ws,native:false})}
const plants=[];for(const donor of donors){const p=donor.words.flat(),sp=spans(donor.words),cut=donor.native?Math.floor(p.length*.7):729;for(const key of keys){const c=encode(p,key),r=recover(c,sp,cut);if(r.skipped||!r.best){plants.push({name:donor.name,n:p.length,cut,rank:r.rank,skipped:r.skipped||false,noBest:!r.best});continue}const q=decode(c,r.best.k);assert(encode(q,r.best.k).join(",")===c.join(","),"plant roundtrip");plants.push({name:donor.name,n:p.length,cut,rank:r.rank,key,chosen:r.best.k,ties:r.ties,train:r.best.coverage,holdout:score(q,sp,cut,p.length),exact:q.filter((v,i)=>v===p[i]).length})}}
const res=recover(orig,ss,729);let bestOriginal=null,heldout=null,originalExactTwoHoldout=null;
if(res.best){const p=decode(orig,res.best.k);assert(encode(p,res.best.k).join(",")===orig.join(","),"original roundtrip");bestOriginal={...res.best,preview:p.slice(0,90).map(i=>corpus.translit[i]).join(" ")};heldout=score(p,ss,7960,9640)}
if(res.keys)originalExactTwoHoldout=res.keys.filter(k=>{const p=decode(orig,k),s=score(p,ss,7960,9640);return s.oneBad===0&&s.twoBad===0}).length;
return {lexicon:dict.size,twoRuneTypes:two.size,plants,original:{selected:res.selected,rank:res.rank,total:res.total,invertible:res.invertible,singleOK:res.singleOK,twoOK:res.twoOK,bestOriginal,ties:res.ties,heldout,originalExactTwoHoldout}};
}
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
