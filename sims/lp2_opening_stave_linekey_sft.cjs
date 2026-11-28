'use strict';
// Run from repository root: node sims/lp2_opening_stave_linekey_sft.cjs
const fs=require('node:fs');
function run(raw,reference){
 const glyph=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"],names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),idx=new Map(glyph.map((c,i)=>[c,i])),mod=x=>(x%29+29)%29,fmt=a=>a.map(i=>names[i]).join(" "),tape=s=>[...s].filter(c=>idx.has(c)).map(c=>idx.get(c)),pages=raw.split("%").map(p=>p.split("/").map(tape).filter(a=>a.length));
 const selected=pages.slice(0,3).flatMap((p,j)=>[8,9,11].filter(i=>i<=p.length).map(i=>({page:j,line:i,gp:p[i-1][0]}))),key=selected.map(o=>o.gp);
 if(pages.slice(0,3).map(p=>p.length).join()!= "12,12,9"||key.length!==8)throw Error("source shape");
 const train=reference.split(/\n### /).filter(s=>!/^5[67]\b/.test(s)&&!/^7[34]\b/.test(s)).slice(0,10).flatMap(s=>s.split("\n").filter(l=>/^[A-Z][A-Z ,.'!?":;—-]+$/.test(l)).map(l=>l.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,""))).join("");
 const byLength=names.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 let tr=[];for(let i=0;i<train.length;){let f=byLength.find(([s])=>train.startsWith(s,i));if(!f)throw Error("unmapped "+train[i]);tr.push(f[1]);i+=f[0].length}
 const uni=new Float64Array(29),bi=new Float64Array(29*29),tri=new Float64Array(29**3);for(let i=0;i<tr.length;i++){uni[tr[i]]++;if(i)bi[tr[i-1]*29+tr[i]]++;if(i>=2)tri[(tr[i-2]*29+tr[i-1])*29+tr[i]]++;}
 const cost=(a,b,c)=>Math.log((a<0?(b<0?uni[c]+.5:bi[b*29+c]+.5):tri[(a*29+b)*29+c]+.5)/(a<0?(b<0?tr.length+14.5:uni[b]+14.5):bi[a*29+b]+14.5));
 function score(p){return p.reduce((s,c,i)=>s+cost(i>=2?p[i-2]:-1,i?p[i-1]:-1,c),0)/p.length}
 function enc(p,sign,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*key[j++%key.length]));}
 function dec(c,sign,hold){
 if(!hold){const p=c.map((x,i)=>mod(x-sign*key[i%key.length]));return {p,score:score(p),count:"1"};}
 let m=new Map([["0,-1,-1",{j:0,a:-1,b:-1,s:0,path:[],count:1n}]]);
 for(let i=0;i<c.length;i++){const x=c[i];let n=new Map();for(const v of m.values()){let opts=[];if(x===0)opts.push([0,v.j]);let y=mod(x-sign*key[v.j]);if(y!==0)opts.push([y,(v.j+1)%key.length]);for(const [y,j] of opts){let k=[j,v.b,y].join(),s=v.s+cost(v.a,v.b,y),old=n.get(k);if(!old)n.set(k,{j,a:v.b,b:y,s,path:[...v.path,y],count:v.count});else{old.count+=v.count;if(s>old.s){old.s=s;old.path=[...v.path,y]}}}}m=n;if(!m.size)return {deadAt:i,cipherGP:x,count:"0"};}
 let best=[...m.values()].sort((a,b)=>b.s-a.s)[0];return {p:best.path,score:best.s/c.length,count:[...m.values()].reduce((s,v)=>s+v.count,0n).toString()};
 }
 const target=pages.slice(3,8).flat(2),control=pages.filter(p=>p.length).at(-1).flat();
 if(target.length!==1145||control.length!==95)throw Error("wrong target/control");
 let trials=[];for(const sign of [1,-1])for(const hold of [false,true]){
 const c=dec(target,sign,hold),plant=enc(control,sign,hold),cp=dec(plant,sign,hold);trials.push({sign,hold,original:c.p?{score:c.score,count:c.count,replay:enc(c.p,sign,hold).join()===target.join(),first:fmt(c.p.slice(0,100)),full:c.p.map(i=>glyph[i]).join("")}:c,plant:{length:control.length,score:cp.score,count:cp.count,exact:cp.p?.join()===control.join(),matches:cp.p?.filter((x,i)=>x===control[i]).length,replay:cp.p?enc(cp.p,sign,hold).join()===plant.join():false}});}
 if(trials.some(t=>!t.plant.exact||!t.plant.replay||(t.original.full&&!t.original.replay)))throw Error("control/replay failed");
 return {selected,key,keySpelling:fmt(key),pageLengths:pages.slice(0,8).map(p=>p.flat().length),targetLength:target.length,trainLength:tr.length,controlLength:control.length,controlFirst:fmt(control.slice(0,20)),nativeScore:score(control),rawScore:score(target),trials};
}
console.log(JSON.stringify(run(fs.readFileSync('resources/liber-primus/lp2-transcription.txt','utf8'),fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt','utf8')),null,2));
