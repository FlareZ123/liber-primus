"use strict";
const fs=require("node:fs");const path=require("node:path");
function run(gp,source,train){
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ",letters=[".-","-...","-.-.","-..",".","..-.","--.","....","..",".---","-.-",".-..","--","-.","---",".--.","--.-",".-.","...","-","..-","...-",".--","-..-","-.--","--.."];
 const book=[];for(const a of ".-x")for(const b of ".-x")for(const c of ".-x")if(a+b+c!=="xxx")book.push(a+b+c);
 const idx=new Map(book.map((s,i)=>[s,i])), FULL=(1<<26)-1, pc=x=>{let n=0;while(x){x&=x-1;n++}return n},val=x=>31-Math.clz32(x&-x);
 const assert=(a,m)=>{if(!a)throw Error(m)};
 let rng=3301;function next(n){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n}
 function morse(txt){return (txt.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>[...w].map(c=>letters[c.charCodeAt(0)-65]).join("x")).join("xx")}
 function solver(tape,digits,nodeCap,witnessCap,scoreFn){
  const morseMap=new Map(letters.map((x,i)=>[x,alphabet[i]]));
  if(digits)["-----",".----","..---","...--","....-",".....","-....","--...","---..","----."].forEach((x,i)=>morseMap.set(x,String(i)));
  function legal(s){
   if(s.includes("xxx")||new RegExp("[.-]{"+(digits?6:5)+"}").test(s))return false;
   let a=s.split(/x+/);for(let i=1;i<a.length-1;i++)if(!morseMap.has(a[i]))return false;
   return true
  }
  const types=[...new Set(tape)].sort((a,b)=>a-b),ind=new Map(types.map((v,i)=>[v,i])),n=types.length,t=tape.map(x=>ind.get(x));
  if(n>26)return {impossible:"alphabet"};
  const allTriples=new Map(),allPairs=new Map();
  for(let i=0;i+2<t.length;i++){let a=t.slice(i,i+3);allTriples.set(a.join(","),a)}
  for(let i=0;i+1<t.length;i++){let a=t.slice(i,i+2);allPairs.set(a.join(","),a)}
  const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  const tri=perms.map(()=>new Uint32Array(676));
  for(let a=0;a<26;a++)for(let b=0;b<26;b++)if(a!==b)for(let c=0;c<26;c++)if(a!==c&&b!==c&&legal(book[a]+book[b]+book[c])){let z=[a,b,c];for(let k=0;k<6;k++){let [u,v,w]=perms[k];tri[k][z[u]*26+z[v]]|=1<<z[w]}}
  let constraints=[],adj=Array.from({length:n},()=>[]),base=Array(n).fill(FULL);
  function add(vars,kind,support){let k=constraints.length;constraints.push({vars,kind,support});for(let v of vars)adj[v].push(k)}
  function localConstraint(seq){
   let vars=[...new Set(seq)],pos=seq.map(x=>vars.indexOf(x));
   if(vars.length===1){let m=0;for(let a=0;a<26;a++)if(legal(book[a].repeat(seq.length)))m|=1<<a;base[vars[0]]&=m;return}
   if(vars.length===2){
    let ab=new Uint32Array(26),ba=new Uint32Array(26);
    for(let a=0;a<26;a++)for(let b=0;b<26;b++)if(a!==b&&legal(pos.map(i=>book[i===0?a:b]).join(""))){ab[a]|=1<<b;ba[b]|=1<<a}
    add(vars,2,[ab,ba]);return
   }
   add(vars,3,tri)
  }
  for(let a of allPairs.values())localConstraint(a);
  for(let a of allTriples.values())localConstraint(a);
  function propagate(dom){
   let queue=constraints.map((_,i)=>i),inq=new Uint8Array(constraints.length).fill(1),qi=0,used=0;
   function set(v,m){if(!m)return false;if(m===dom[v])return true;dom[v]=m;for(let j of adj[v])if(!inq[j]){inq[j]=1;queue.push(j)}return true}
   function singles(){
    let u=0;for(let m of dom){if(!m)return false;if((m&(m-1))===0){if(u&m)return false;u|=m}}
    if(u===used)return true;used=u;
    for(let i=0;i<n;i++)if(dom[i]&(dom[i]-1))if(!set(i,dom[i]&~u))return false;
    // Newly forced singleton masks need their own all-different pass.
    let k=0;for(let m of dom)if((m&(m-1))===0)k|=m;
    return k===used||singles()
   }
   if(!singles())return false;
   while(qi<queue.length){let c=constraints[queue[qi++]];inq[queue[qi-1]]=0;let v=c.vars;
    if(c.kind===2){let a=dom[v[0]],b=dom[v[1]],keepA=0,keepB=0;for(let x=a;x;x&=x-1){let k=val(x),m=c.support[0][k]&b;if(m){keepA|=1<<k;keepB|=m}}if(!set(v[0],keepA)||!set(v[1],keepB))return false}
    else{
     let k=0,min=Infinity;for(let j=0;j<6;j++){let p=perms[j],cost=pc(dom[v[p[0]]])*pc(dom[v[p[1]]]);if(cost<min){min=cost;k=j}}
     let [u,w,z]=perms[k],a=dom[v[u]],b=dom[v[w]],e=dom[v[z]],ka=0,kb=0,ke=0,sup=c.support[k];
     for(let x=a;x;x&=x-1){let ax=val(x);for(let y=b;y;y&=y-1){let by=val(y),m=sup[ax*26+by]&e;if(m){ka|=1<<ax;kb|=1<<by;ke|=m}}}
     if(!set(v[u],ka)||!set(v[w],kb)||!set(v[z],ke))return false
    }
    if(!singles())return false;
   }
   // Exact all-different feasibility (no false pruning).
   let match=Array(26).fill(-1);
   function aug(i,seen){for(let m=dom[i]&~seen[0];m;m&=m-1){let j=val(m);if(seen[0]&(1<<j))continue;seen[0]|=1<<j;if(match[j]<0||aug(match[j],seen)){match[j]=i;return true}}return false}
   for(let i=0;i<n;i++)if(!aug(i,[0]))return false;
   return true;
  }
  let nodes=0,witnesses=0,cap=false,first=null,best=null;
  function decode(s){
   let parts=s.split(/(x+)/),out="";
   for(let i=0;i<parts.length;i++){let p=parts[i];if(!p)continue;if(p[0]==="x"){if(p.length===2)out+=" ";continue}
    let c=morseMap.get(p);if(!c){if(i===0||i===parts.length-1)continue;throw Error("invalid interior")}
    out+=c
   }return out.trim()
  }
  function dfs(dom){
   if(nodes>=nodeCap||witnesses>=witnessCap){cap=true;return}nodes++;
   if(!propagate(dom))return;
   let v=-1,small=27;
   for(let i=0;i<n;i++){let k=pc(dom[i]);if(k>1&&(k<small||(k===small&&v>=0&&adj[i].length>adj[v].length))){small=k;v=i}}
   if(v<0){let key=dom.map(val),s=t.map(i=>book[key[i]]).join("");assert(legal(s),"invalid witness");let plain=decode(s),score=scoreFn(plain);let w={key:types.map((x,i)=>[x,book[key[i]]]),plain,score};if(!first)first=w;if(!best||score>best.score)best=w;witnesses++;return}
   for(let b=dom[v];b&&!cap;b&=b-1){let a=dom.slice();a[v]=b&-b;dfs(a)}
  }
  const root=base.slice();let rootOk=propagate(root);if(rootOk)dfs(root);
  return {n,tapeLength:t.length,digits,rootOk,rootDomains:root.map(pc),constraints:constraints.length,nodes,witnesses,cap,first,best};
 }
 // Word-free native English character trigram.
 const text=train.toUpperCase().replace(/[^A-Z]+/g," ").trim();const counts=new Float64Array(27**3).fill(.25),tot=new Float64Array(27**2).fill(27*.25);
 const char=c=>c===" "?26:c.charCodeAt(0)-65;
 for(let i=2;i<text.length;i++){let a=char(text[i-2]),b=char(text[i-1]),c=char(text[i]);counts[(a*27+b)*27+c]++;tot[a*27+b]++}
 function score(p){p=p.replace(/[0-9]/g," ");let s=0;for(let i=2;i<p.length;i++){let a=char(p[i-2]),b=char(p[i-1]),c=char(p[i]);s+=Math.log(counts[(a*27+b)*27+c]/tot[a*27+b])}return s/Math.max(1,p.length-2)}
 const original=gp.pages.find(x=>x.page===55).indices;assert(original.length===76,"source length");
 let trits=morse(source),plantCodes=null,plantAt=-1;
 for(let i=0;i+228<=trits.length;i++){let a=Array.from({length:76},(_,j)=>trits.slice(i+3*j,i+3*j+3));if(new Set(a).size===25){plantCodes=a;plantAt=i;break}}
 assert(plantCodes,"no 25-type plant");const perm=Array.from({length:26},(_,i)=>i);for(let i=25;i>0;i--){let j=next(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}
 const plant=plantCodes.map(s=>perm[idx.get(s)]);const trueKey=perm.map((v,i)=>[v,book[i]]);
 let out={plantAt,plantTrits:plantCodes.join(""),trueKey,original:solver(original,false,120000,10000,score),plant:solver(plant,false,120000,10000,score)};
 if(!out.original.witnesses&&!out.original.cap)out.originalDigits=solver(original,true,120000,10000,score);
 return out
}
const f=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));console.log(JSON.stringify(run(JSON.parse(f[0]),f[1],f[2]),null,2));
