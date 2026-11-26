"use strict";
/** Agent46: exact all-secret key lookup with native plaintext-F hold. Node.js 22, no dependencies. */
function fholdExperiment(input){
 const [gp,g,lex,native]=[JSON.parse(input[0]),JSON.parse(input[1]),input[2],input[3]],alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map()),mod=x=>(x%29+29)%29,check=(x,m)=>{if(!x)throw Error(m)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){if(w.length<32)dict[w.length].set(w.join(","),w);return}for(const n of [1,2,3]){const t=s.slice(i,i+n);if(t.length!==n)continue;const v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(l);if(z)variants(z[1])}for(const w of native.match(/[A-Z]+/g)||[])variants(w);
 const lens=[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];let pos=0;const pw=lens.map(n=>{const x=gp.pages[57].indices.slice(pos,pos+n);pos+=n;return x});check(pos===95,"p57 length");
 const cw=g.p55.groups.slice(1).map(s=>[...s].map(x=>"0123456789abcdefghijklmnopqrs".indexOf(x)));check(cw.flat().length===75&&cw.flat().join(",")===gp.pages[55].indices.slice(1).join(","),"p55 source");
 function domains(cw,key,held){
  const allowed=Array(29).fill(0x1fffffff);let pos=0,clock=0;
  const rows=cw.map(w=>w.map(c=>{if(held.has(pos++)){check(c===0,"illegal hold");return -1}const k=key[clock++];allowed[k]&=~(1<<c);return k}));
  const ds=cw.map((w,wi)=>{const row=rows[wi],d=[];for(const p of dict[w.length].values()){const m=new Map();let ok=true;for(let h=0;h<w.length;h++){const k=row[h];if(k===-1){if(p[h]!==0){ok=false;break}continue}if(p[h]===0){ok=false;break}const v=mod(w[h]-p[h]);if(!(allowed[k]&(1<<v))||(m.has(k)&&m.get(k)!==v)){ok=false;break}m.set(k,v)}if(ok)d.push([...m])}return d});return{ds,allowed,rows,clock};
 }
 function solve(ds,budget,cap=300000){
  let nodes=0,capped=false;const a=Array(29).fill(-1),compatible=d=>d.every(([x,y])=>a[x]<0||a[x]===y);
  function dfs(todo,left,skips){if(++nodes>cap){capped=true;return null}if(todo.length===0)return{a:a.slice(),skips};let best=-1,bd=null,empty=[];for(const i of todo){const d=ds[i].filter(compatible);if(!d.length)empty.push(i);else if(bd===null||d.length<bd.length){best=i;bd=d}}if(empty.length){if(empty.length>left)return null;const e=new Set(empty);return dfs(todo.filter(i=>!e.has(i)),left-empty.length,[...skips,...empty])}const rest=todo.filter(i=>i!==best);for(const d of bd){const changed=[];for(const [x,y] of d)if(a[x]<0){a[x]=y;changed.push(x)}const z=dfs(rest,left,skips);for(const x of changed)a[x]=-1;if(z||capped)return z}if(left>0)return dfs(rest,left-1,[...skips,best]);return null}
  const witness=dfs(ds.map((_,i)=>i),budget,[]);return{budget,nodes,status:witness?"SAT":capped?"UNKNOWN":"UNSAT",witness};
 }
 function encode(p,key,a){let clock=0;return p.map(w=>w.map(x=>x===0?0:mod(x+a[key[clock++]])))}
 function decode(cw,key,d,w){const a=w.a.map((x,k)=>{if(x>=0)return x;const m=d.allowed[k];for(let v=0;v<29;v++)if(m&(1<<v))return v;throw Error("empty allowed")});const p=cw.map((word,i)=>word.map((c,j)=>d.rows[i][j]===-1?0:mod(c-a[d.rows[i][j]])));check(encode(p,key,a).flat().join(",")===cw.flat().join(","),"forward F replay");return{a,p}}
 function allMasks(c){const z=c.flat().map((x,i)=>x===0?i:-1).filter(i=>i>=0);check(z.length<12,"mask size");return Array.from({length:2**z.length},(_,m)=>z.filter((_,i)=>m&(1<<i)))}
 let rng=0x46f557;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0}
 const out={forms:dict.reduce((s,x)=>s+x.size,0),original:[],controls:[]};
 for(const side of ["first","last"]){const key=pw.flatMap(w=>side==="first"?w.slice(1):w.slice(0,-1));
  for(const held of allMasks(cw)){const d=domains(cw,key,new Set(held));const tests=[];for(let b=0;b<=6;b++){const t=solve(d.ds,b);if(t.witness){const {a,p}=decode(cw,key,d,t.witness);const oov=p.map((w,i)=>dict[w.length].has(w.join(","))?-1:i).filter(i=>i>=0);check(oov.length<=b,"F OOV witness");t.witness={a,skips:t.witness.skips,oov,plain:p.map(w=>w.map(x=>gp.translit[x]).join(""))}}tests.push(t);if(t.status!=="UNSAT")break}
  out.original.push({side,held,clock:d.clock,domains:d.ds.map(x=>x.length),tests});}
  // Independent dictionary-register controls, source length template, random lookup. Both a true F hold and ciphertext F produced by a non-F should be allowed.
  const plain=cw.map(w=>{const d=[...dict[w.length].values()];return d[rand()%d.length]});const a=Array.from({length:29},()=>rand()%29);const plant=encode(plain,key,a),held=plain.flat().map((x,i)=>x===0?i:-1).filter(i=>i>=0);
  const d=domains(plant,key,new Set(held));check(d.ds.every(dom=>dom.some(x=>x.every(([k,v])=>a[k]===v))),"true F mask/key lost");let solutions=[];for(const h of allMasks(plant)){const v=domains(plant,key,new Set(h)),t=solve(v.ds,0);if(t.status==="SAT"){const {p}=decode(plant,key,v,t.witness);solutions.push({held:h,exactRunes:p.flat().filter((x,i)=>x===plain.flat()[i]).length,nodes:t.nodes})}else if(t.status==="UNKNOWN")solutions.push({held:h,status:t.status,nodes:t.nodes})}
  check(solutions.some(s=>s.held.join(",")===held.join(",")),"blind F control not retained");out.controls.push({side,trueHeld:held,visibleZero:plant.flat().filter(x=>x===0).length,solutions});
 }return out;
}
module.exports=fholdExperiment;
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt"];console.log(JSON.stringify(fholdExperiment(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2));}
