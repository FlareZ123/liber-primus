"use strict";
function run(inputs){
 const gp=JSON.parse(inputs[0]),tr=inputs[1],mod=x=>(x+29)%29,tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),R=new Map(gp.runes.map((r,i)=>[r,i])),T=534,INF=1e9;
 function words(s){return(s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);out.push(t.i);i+=t.s.length}}return out})}
 function body(s,a,b){let i=s.indexOf(a),j=s.indexOf(b,i);if(i<0||j<i)throw Error("source boundaries");return s.slice(i,j)}
 let ds=[words(body(inputs[2],"Almustafa, the{7} chosen","End of the Project Gutenberg EBook of The Prophet")),words(inputs[3]),words(body(inputs[4],"THERE is one mind","*** END OF THIS PROJECT GUTENBERG EBOOK"))],train=ds.map(w=>w.slice(0,Math.floor(w.length*.65)));
 const dict=new Map();function add(w){if(!dict.has(w.length))dict.set(w.length,new Map());dict.get(w.length).set(w.join(","),w)}
 for(let l of inputs[5].split(/\r?\n/)){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)add(words(m[1])[0])}for(let w of train.flat())add(w);
 function fromPage(){let by=new Map();for(let s of tr.split("%").map(x=>x.trim()).filter(Boolean)){let c=[...s].filter(x=>R.has(x)).map(x=>R.get(x)),p=gp.pages.find(x=>String(x.indices)===String(c));if(!p)throw Error("page mismatch");by.set(p.page,s)}function section(a,b,start,end){let s=[];for(let p=a;p<=b;p++)if(by.has(p))s.push(by.get(p));let w=s.join("").replace(/\/\s*/g,"").split(/[^ᚠ-ᛡ]+/).filter(Boolean).map(x=>[...x].map(r=>R.get(r))),flat=w.flat(),expect=gp.pages.slice(a,b+1).flatMap(p=>p.indices);if(String(flat)!==String(expect))throw Error("section");let pos=0,ret=[];for(let x of w){let lo=pos,hi=pos+x.length;if(lo>=start&&hi<=end)ret.push(x);pos=hi}if(String(ret.flat())!==String(expect.slice(start,end)))throw Error("marker not word boundary");return ret}
  let endB=gp.pages.slice(38,50).flatMap(p=>p.indices).length,endC=gp.pages.slice(51,54).flatMap(p=>p.indices).length;return[section(36,38,99,238+228+186),section(38,49,186,endB),section(51,53,0,endC)]
 }
 function solve(W,budget=null){
  let nodes=[],ids=W.map((ws,j)=>{let s=0,o=[];for(let word of ws){if(s>=T)break;let e=Math.min(T,s+word.length),cands=new Map();for(let w of dict.get(word.length)?.values()||[]){let k=w.slice(0,e-s).map((p,i)=>mod(word[i]-p));cands.set(k.join(","),k)}let n={id:nodes.length,side:j,s,e,keys:[...cands.values(),null],nbr:[]};nodes.push(n);o.push(n.id);s=e}if(s!==T)throw Error("short");return o});
  let overlaps=[];for(let i=0,j=0;i<ids[0].length&&j<ids[1].length;){let a=nodes[ids[0][i]],b=nodes[ids[1][j]],s=Math.max(a.s,b.s),e=Math.min(a.e,b.e);if(e<=s)throw Error("overlap");a.nbr.push(b.id);b.nbr.push(a.id);overlaps.push({a:a.id,b:b.id,s,e});if(a.e<=b.e)i++;if(b.e<=a.e)j++}
  let comp=[],compId=new Int32Array(nodes.length).fill(-1),M=new Map();
  function local(u,exclude){let n=nodes[u],z=new Int32Array(n.keys.length);z[z.length-1]=1;for(let v of n.nbr)if(v!==exclude){let m=msg(v,u);for(let i=0;i<z.length;i++)z[i]+=m[i]}return z}
  function msg(u,v){let code=u+","+v;if(M.has(code))return M.get(code);let a=nodes[u],b=nodes[v],s=Math.max(a.s,b.s),e=Math.min(a.e,b.e),z=local(u,v),wild=z[z.length-1],min=wild,map=new Map();for(let i=0;i<a.keys.length-1;i++){let sig=a.keys[i].slice(s-a.s,e-a.s).join(",");map.set(sig,Math.min(map.get(sig)??INF,z[i]));min=Math.min(min,z[i])}let m=new Int32Array(b.keys.length);for(let i=0;i<b.keys.length-1;i++){let sig=b.keys[i].slice(s-b.s,e-b.s).join(",");m[i]=Math.min(wild,map.get(sig)??INF)}m[m.length-1]=min;M.set(code,m);return m}
  function flood(u,id){compId[u]=id;for(let v of nodes[u].nbr)if(compId[v]<0)flood(v,id)}
  for(let n of nodes)if(compId[n.id]<0){let id=comp.length;flood(n.id,id);let z=local(n.id,-1),min=Math.min(...z);comp.push({root:n.id,min})}
  let min=comp.reduce((a,b)=>a+b.min,0),marg=nodes.map(n=>Array.from(local(n.id,-1),x=>x+min-comp[compId[n.id]].min));
  if(budget===null)budget=min;let masks=new Uint32Array(T);
  if(min<=budget){for(let n of nodes)for(let i=0;i<n.keys.length-1;i++)if(marg[n.id][i]<=budget)for(let p=n.s;p<n.e;p++)masks[p]|=1<<n.keys[i][p-n.s];
   for(let {a,b,s,e} of overlaps){let u=local(a,b),v=local(b,a),cost=u[u.length-1]+v[v.length-1]+min-comp[compId[a]].min;if(cost<=budget)for(let i=s;i<e;i++)masks[i]=2**29-1}}
  let sets=Array.from(masks,x=>Array.from({length:29},(_,i)=>i).filter(i=>x&(1<<i))),forced=sets.map(s=>s.length===1?s[0]:-1);
  if(min<=budget&&sets.some(s=>!s.length))throw Error("missing marginal");
  return{T,min,budget,nodes:nodes.length,edges:overlaps.length,components:comp.length,perComponentMin:comp.map(x=>x.min),feasible:min<=budget,forced,allowedCounts:sets.map(x=>x.length),sets}
 }
 let seed=3157101;function rand(m){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%m}
 function plant(kind,trial){let P=ds.map((w,j)=>w.slice(Math.floor(w.length*.72)+trial*173+j*47,Math.floor(w.length*.72)+trial*173+j*47+300));let K=Array.from({length:3},()=>Array.from({length:2000},()=>rand(29)));if(kind==="shared")K[1]=K[2]=K[0];if(kind==="independent")K[2]=K[0];if(kind==="near"){K[1]=K[0].slice(0,350).concat(K[1].slice(350));K[2]=K[0]}let C=P.map((w,j)=>{let k=0;return w.map(x=>x.map(p=>mod(p+K[j][k++])))});
  let oov=P.slice(0,2).map(w=>{let s=0,n=0;for(let x of w){if(s>=T)break;if(!dict.get(x.length)?.has(x.join(",")))n++;s+=x.length}return n});return{kind,trial,P,C,K,oov}}
 const plants=[plant("shared",0),plant("shared",1),plant("independent",2),plant("near",3)],budget=Math.max(...plants.slice(0,2).map(x=>x.oov[0]+x.oov[1]))+2;
 function test(p){let r=solve(p.C.slice(0,2),budget),f=r.forced,truth=p.K[0].slice(0,T),forced=f.filter(x=>x>=0).length,correct=f.filter((x,i)=>x===truth[i]).length,truthCompatible=r.sets.every((x,i)=>x.includes(truth[i]));return {kind:p.kind,trial:p.trial,oov:p.oov,min:r.min,components:r.components,budget,feasible:r.feasible,forced,correct,truthCompatible,heldExact:correct===forced,heldText:p.C[2].flat().slice(0,T).map((c,i)=>f[i]>=0?gp.translit[mod(c-f[i])]:"?").join(""),allowedCounts:r.allowedCounts}}
 let controls=plants.map(test),passed=controls.slice(0,2).every(x=>x.feasible&&x.truthCompatible&&x.heldExact)&&controls.slice(2).every(x=>!x.feasible),original=null;
 if(passed){let W=fromPage(),r=solve(W.slice(0,2),budget);original={...r,forcedCount:r.forced.filter(x=>x>=0).length,heldText:W[2].flat().slice(0,T).map((c,i)=>r.forced[i]>=0?gp.translit[mod(c-r.forced[i])]:"?").join("")}}
 return {T,budget,dictionaryWords:[...dict.values()].reduce((a,b)=>a+b.size,0),controls,passed,original}
}
module.exports=run;
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"))),null,2))}
