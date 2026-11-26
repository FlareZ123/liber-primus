"use strict";
/** Agent46: exact all-secret additive key-lookup test for the source-fixed p57 edge75 -> p55 body. Node.js 22, no dependencies. */
function experiment(input){
 const [gp,g,lex,native]=[JSON.parse(input[0]),JSON.parse(input[1]),input[2],input[3]], alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map()), mod=x=>(x%29+29)%29, check=(x,m)=>{if(!x)throw Error(m)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){if(w.length<32)dict[w.length].set(w.join(","),w);return}for(const n of [1,2,3]){const t=s.slice(i,i+n);if(t.length!==n)continue;const v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(l);if(z)variants(z[1])}
 for(const w of native.match(/[A-Z]+/g)||[])variants(w);
 const lens=[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];let pos=0;const pw=lens.map(n=>{const x=gp.pages[57].indices.slice(pos,pos+n);pos+=n;return x});check(pos===95,"p57 length");
 const cw=g.p55.groups.slice(1).map(s=>[...s].map(x=>"0123456789abcdefghijklmnopqrs".indexOf(x)));check(cw.flat().length===75&&cw.flat().join(",")===gp.pages[55].indices.slice(1).join(","),"p55 source");
 function domains(cw,key){let i=0;return cw.map(w=>{const k=key.slice(i,i+w.length);i+=w.length;const d=[];for(const p of dict[w.length].values()){const m=new Map();let ok=true;for(let h=0;h<w.length;h++){const v=mod(w[h]-p[h]);if(m.has(k[h])&&m.get(k[h])!==v){ok=false;break}m.set(k[h],v)}if(ok)d.push([...m])}return d})}
 function solve(ds,budget,cap=300000){
  let nodes=0, capped=false;const a=Array(29).fill(-1), compatible=d=>d.every(([x,y])=>a[x]<0||a[x]===y);
  function dfs(todo,left,skips){if(++nodes>cap){capped=true;return null}if(todo.length===0)return{a:a.slice(),skips};let best=-1,bd=null,empty=[];for(const i of todo){const d=ds[i].filter(compatible);if(!d.length)empty.push(i);else if(bd===null||d.length<bd.length){best=i;bd=d}}if(empty.length){if(empty.length>left)return null;const e=new Set(empty);return dfs(todo.filter(i=>!e.has(i)),left-empty.length,[...skips,...empty])}const rest=todo.filter(i=>i!==best);for(const d of bd){const changed=[];for(const [x,y] of d)if(a[x]<0){a[x]=y;changed.push(x)}const z=dfs(rest,left,skips);for(const x of changed)a[x]=-1;if(z||capped)return z}if(left>0)return dfs(rest,left-1,[...skips,best]);return null}
  const witness=dfs(ds.map((_,i)=>i),budget,[]);return{budget,nodes,status:witness?"SAT":capped?"UNKNOWN":"UNSAT",witness};
 }
 function decode(cw,key,a){let i=0;const p=cw.map(w=>w.map(c=>mod(c-(a[key[i++]]<0?0:a[key[i-1]]))));i=0;check(p.map(w=>w.map(x=>mod(x+(a[key[i++]]<0?0:a[key[i-1]])))).flat().join(",")===cw.flat().join(","),"forward replay");return p}
 let rng=0x46f557;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0}
 const out={forms:dict.reduce((s,x)=>s+x.size,0),original:[],controls:[]};
 for(const side of ["first","last"]){const key=pw.flatMap(w=>side==="first"?w.slice(1):w.slice(0,-1));const ds=domains(cw,key);const tests=[];for(let b=0;b<=8;b++){const t=solve(ds,b);if(t.witness){const p=decode(cw,key,t.witness.a);t.witness.plain=p.map(w=>w.map(x=>gp.translit[x]).join(""));t.witness.oov=p.map((w,i)=>dict[w.length].has(w.join(","))?-1:i).filter(i=>i>=0);check(t.witness.oov.length<=b,"OOV witness")}tests.push(t);if(t.status!=="UNSAT")break}out.original.push({side,distinct:new Set(key).size,domains:ds.map(x=>x.length),tests});
  const plain=cw.map(w=>{const d=[...dict[w.length].values()];return d[rand()%d.length]});const k=Array.from({length:29},()=>rand()%29);let i=0;const plant=plain.map(w=>w.map(p=>mod(p+k[key[i++]])));const pd=domains(plant,key);check(pd.every(d=>d.some(x=>x.every(([a,b])=>k[a]===b))),"planted key lost");const t=solve(pd,0);check(t.status==="SAT","plant did not solve");const decoded=decode(plant,key,t.witness.a);check(decoded.every(w=>dict[w.length].has(w.join(","))),"witness lexical");
  out.controls.push({side,domains:pd.map(x=>x.length),nodes:t.nodes,exactRunes:decoded.flat().filter((x,i)=>x===plain.flat()[i]).length,total:75});
 }return out;
}
module.exports=experiment;
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));}
