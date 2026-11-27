"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(data,width=256){
 const gp=JSON.parse(data[0]),mp=new Map(gp.runes.map((r,i)=>[r,i])),tr=new Map(gp.translit.map((r,i)=>[r,i]));
 const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,i)=>Array.from({length:29},(_,j)=>j).find(j=>i*j%29===1)||0);
 const parse=s=>(s.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(x=>mp.get(x)));
 const solved=JSON.parse(data[3]).sections.map(x=>parse(x.source_text));
 const ds=Array.from({length:40},()=>new Map());
 const add=(a,f)=>{if(a.length&&a.length<40&&a.every(Number.isInteger)){const k=a.join(",");ds[a.length].set(k,Math.max(ds[a.length].get(k)||0,f))}};
 function word(w,f){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");function go(i,a){if(i===w.length){add(a,f);return}for(let n=1;n<=3&&i+n<=w.length;n++){const s=w.slice(i,i+n);const v=tr.get(s==="ING"?"NG":s==="IO"?"IA":s);if(v!==undefined)go(i+n,[...a,v])}}go(0,[])}
 for(const line of data[2].split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(line);if(m)word(m[1],+m[2])}
 for(const w of solved.flat())add(w,1);
 for(const s of ["A","I","O"])word(s,1);
 const nodes=[],cache=new Map();
 function node(){const id=nodes.length;nodes.push({mass:0,ch:new Int32Array(29).fill(-1),log:new Float64Array(29)});return id}
 function trie(len,skip,free=false){const key=[len,skip,free].join(":");if(cache.has(key))return cache.get(key);const root=node();
 function ins(a,w){let id=root;nodes[id].mass+=w;for(const v of a){let n=nodes[id].ch[v];if(n<0){n=node();nodes[id].ch[v]=n}id=n;nodes[id].mass+=w}}
 if(free){for(let i=0;i<29;i++)ins([i],1)}else for(const [k,f] of ds[len])ins(k.split(",").map(Number).slice(skip),Math.sqrt(f));
 function finish(id){const z=nodes[id];for(let i=0;i<29;i++)if(z.ch[i]>=0){z.log[i]=Math.log(nodes[z.ch[i]].mass/z.mass);finish(z.ch[i])}}finish(root);cache.set(key,root);return root}
 function tape(words,freeFirst=false){let skip=words.flat().length-76;if(skip<0)throw Error("short");let seg=[];for(let j=0;j<words.length;j++){let w=words[j];if(skip>=w.length){skip-=w.length;continue}const root=trie(w.length,skip,freeFirst&&j===0&&w.length===1);seg.push({root,w:w.slice(skip),skip,len:w.length});skip=0}const plain=seg.flatMap(x=>x.w),roots=[],next=[];for(const s of seg)for(let i=0;i<s.w.length;i++){roots.push(s.root);next.push(i===s.w.length-1?1:0)}return {plain,roots,next,segments:seg.map(x=>({len:x.len,skip:x.skip,remaining:x.w.length}))}}
 function choices(c){let distinct=c.findIndex(x=>x!==c[0]),out=[];if(distinct<0){for(let p=0;p<29;p++)out.push([p,p,p]);return out}for(let a=1;a<29;a++)for(let b=0;b<29;b++)out.push(c.map(v=>mod((v-b)*inv[a])));return out}
 function solve(t,c,truth){let states=[{n:t.map(x=>x.roots[0]),score:0,prev:null,p:null}],steps=[],truthScore=0,truthN=t.map(x=>x.roots[0]),truthAlive=true;
 for(let j=0;j<76;j++){const opts=choices(c.map(x=>x[j])),map=new Map();let expansions=0;
 if(truth){for(let q=0;q<3;q++){const z=nodes[truthN[q]],v=truth[q][j];if(z.ch[v]<0)throw Error("truth trie");truthScore+=z.log[v];truthN[q]=t[q].next[j]?(t[q].roots[j+1]??-1):z.ch[v]}}
 for(const st of states){const n=st.n.map(x=>nodes[x]);for(const p of opts){const x=n[0].ch[p[0]],y=n[1].ch[p[1]],z=n[2].ch[p[2]];if(x<0||y<0||z<0)continue;expansions++;
 const ns=[x,y,z].map((v,k)=>t[k].next[j]?(t[k].roots[j+1]??-1):v),score=st.score+n[0].log[p[0]]+n[1].log[p[1]]+n[2].log[p[2]],key=ns.join(",");
 if(!map.has(key)||map.get(key).score<score)map.set(key,{n:ns,score,prev:st,p});
 }}
 states=[...map.values()].sort((a,b)=>b.score-a.score).slice(0,width);
 if(truth&&truthAlive){const s=states.find(x=>x.n.join(",")===truthN.join(",")&&Math.abs(x.score-truthScore)<1e-8);if(!s)truthAlive=false}
 steps.push({j,expansions,unique:map.size,kept:states.length,truthAlive});if(!states.length)return {complete:false,steps,truthScore:truth?truthScore:null};
 }
 const best=states[0],p=[[],[],[]];for(let x=best;x.p;x=x.prev)x.p.forEach((v,k)=>p[k].push(v));p.forEach(a=>a.reverse());
 let key=[],identifiable=0;for(let j=0;j<76;j++){let q=p.map(x=>x[j]),v=c.map(x=>x[j]),i=q.findIndex(x=>x!==q[0]);let a=i<0?1:mod((v[i]-v[0])*inv[mod(q[i]-q[0])]),b=mod(v[0]-a*q[0]);if(!a||q.some((x,k)=>mod(a*x+b)!==v[k]))throw Error("replay");if(i>=0)identifiable++;key.push([a,b])}
 const render=(a,t)=>a.map((v,j)=>gp.translit[v]+(t.next[j]?" ":"")).join("").trim();
 return {complete:true,score:best.score,truthScore:truth?truthScore:null,recovery:truth?p.map((a,k)=>a.filter((v,j)=>v===truth[k][j]).length):null,plaintext:p.map((a,k)=>render(a,t[k])),key,identifiable,steps};
 }
 const controls=[];for(const [ix,ids] of [[0,[1,4,8]],[1,[0,2,5]]]){const t=ids.map(i=>tape(solved[i])),truth=t.map(x=>x.plain);const k=Array.from({length:76},(_,j)=>[1+(7*j*j+11*j+3+ix*9)%28,(13*j*j+5*j+17+ix*7)%29]);const c=truth.map(a=>a.map((v,j)=>mod(v*k[j][0]+k[j][1])));const r=solve(t,c,truth);controls.push({ids,segments:t.map(x=>x.segments),...r,exactKeys:r.complete?r.key.filter((v,j)=>v[0]===k[j][0]&&v[1]===k[j][1]).length:0})}
 const pass=controls.every(r=>r.complete&&r.recovery.every(n=>n>=54));
 let original=null;if(pass){const t=[32,53,55].map(p=>{const w=parse(data[1].split("%")[p<50?p:p-1].replace(/[\s/%]/g,""));if(String(w.flat())!==String(gp.pages[p].indices))throw Error("source");return tape(w,p===55)});original={segments:t.map(x=>x.segments),...solve(t,t.map(x=>x.plain),null)}}
 return {width,dict:ds.reduce((n,m)=>n+m.size,0),controls,pass,original};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),Number(process.argv[2]||256)),null,2));
module.exports={run,files};
