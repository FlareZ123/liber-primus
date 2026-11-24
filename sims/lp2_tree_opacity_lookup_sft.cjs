'use strict';
// Read the actual JSON from the sibling Python SFT, not arbitrary regrids.
// node sims/lp2_tree_opacity_lookup_sft.cjs <tree-opacity-output.json>
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function experiment(j,tr,lexText,keys){
 const idx=new Map(j.runes.map((r,i)=>[r,i])),tokens=j.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length)}return p}
 const lex=new Map,seen=new Set;
 function add(p){if(!p||seen.has(p.join(",")))return;seen.add(p.join(","));if(!lex.has(p.length))lex.set(p.length,[]);lex.get(p.length).push(p)}
 for(const l of lexText.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m)add(gp(m[1]))}
 function words(s){return s.replace(/[\s/]/g,"").split(/[-.&$§]+/).filter(Boolean).map(w=>[...w].map(c=>idx.get(c)))}
 const w32=words(tr.split("%")[32]),w57=words(tr.split("%").at(-1));
 assert.deepEqual(w32.flat(),j.pages[32].indices);assert.deepEqual(w57.flat(),j.pages[57].indices);
 assert.equal(w32[0].length,1);assert.equal(w32.length,22);
 const base=seen.size;w57.forEach(add);
 const mod=x=>(x%29+29)%29;
 function records(ws,k,skip){let off=0;return ws.map((w,i)=>{let cl=k.slice(off,off+w.length);off+=w.length;let cand=[];if(i>=skip)for(const p of lex.get(w.length)||[]){let map=new Map,ok=true;for(let q=0;q<w.length;q++){let v=mod(w[q]-p[q]);if(map.has(cl[q])&&map.get(cl[q])!==v){ok=false;break}map.set(cl[q],v)}if(ok)cand.push({p,m:[...map]})}return {i,cl,w,cand}}).slice(skip)}
 function solve(rows,max=2){let nodes=0,solutions=[],capped=false;function dfs(todo,map,words){if(nodes++>300000){capped=true;return}if(!todo.length){solutions.push({map:[...map],words});return}let best=null,bc=null;for(const r of todo){let c=r.cand.filter(x=>x.m.every(([k,v])=>!map.has(k)||map.get(k)===v));if(!c.length)return;if(!bc||c.length<bc.length){best=r;bc=c;if(c.length===1)break}}for(const x of bc){let n=new Map(map);for(const [k,v]of x.m)n.set(k,v);dfs(todo.filter(r=>r!==best),n,[...words,[best.i,x.p]]);if(solutions.length>=max||capped)return}}dfs(rows,new Map,[]);return {nodes,capped,solutions}}
 function enc(ws,k,f){let i=0;return ws.map(w=>w.map(p=>mod(p+f[k[i++]])))}
 let result={base,augmented:seen.size,controls:[]};
 for(const [name,k] of Object.entries(keys)){
  assert.equal(k.length,121);
  let rows=records(w32,k,1);let o=solve(rows);
  let f=Array.from({length:29},(_,i)=>(i*17+7)%29);let planted=enc(w57,k,f);let rr=records(planted,k,0);let fit=solve(rr,3);
  const trueRetained=rr.every(r=>r.cand.some(c=>c.p.join()===w57[r.i].join()&&c.m.every(([q,v])=>v===f[q])));
  assert(trueRetained);
  const control={name,trueRetained,fitNodes:fit.nodes,capped:fit.capped,solutions:fit.solutions.length,exactPlantFound:fit.solutions.some(x=>x.map.every(([q,v])=>v===f[q])),usedClasses:new Set(k.slice(0,95)).size};
  result.controls.push(control);
  result[name]={classes:new Set(k).size,individual:rows.map(r=>[r.i,r.cand.length]),firstWord:rows[0].cand.map(c=>({p:c.p,m:c.m})),nodes:o.nodes,capped:o.capped,solutions:o.solutions.map(x=>({map:x.map,words:x.words.sort((a,b)=>a[0]-b[0]).map(([i,p])=>[i,p.map(v=>j.translit[v]).join("")])}))};
 }
 return result;
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"];
const keys=Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(process.argv[2],"utf8")).keys).map(([n,v])=>[n,v.key]));
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),read(paths[2]),keys),null,2));
