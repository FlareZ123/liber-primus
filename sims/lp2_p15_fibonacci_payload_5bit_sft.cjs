const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const run=function run(c,prior,t){
 const ck=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),ids=s=>[...s].map(ch=>c.runes.indexOf(ch)).filter(x=>x>=0);
 let pg=t.split("%").filter(s=>ids(s).length);ck(eq(pg.map(ids),c.pages.filter(p=>p.indices.length).map(p=>p.indices)),"transcription");pg=pg.slice(15,23);let k=0,n=0;while(n<20)if(c.runes.includes(pg[0][k++]))n++;pg[0]=pg[0].slice(k);
 const page=pg.map(ids),line=pg.flatMap(s=>s.split("/").map(ids).filter(a=>a.length)),word=pg.join("").replace(/[\/\n&$]/g,"").split(/[-.]/).map(ids).filter(a=>a.length),a=page.flat();ck(a.length===1883,"length");
 const tails=[""];for(let k=1;k<=4;k++)for(let j=0;j<2**k;j++)tails.push(j.toString(2).padStart(k,"0"));
 const bits=a=>a.map(v=>v.toString(2).padStart(5,"0")).join("");
 function code(n){let f=[1,2];while(f.at(-1)<=n)f.push(f.at(-1)+f.at(-2));f.pop();let b=Array(f.length).fill("0");for(let i=f.length-1;i>=0;i--)if(f[i]<=n){b[i]="1";n-=f[i]}ck(!n,"greedy");return b.join("")+"1"}
 function emit(s){let d=[];for(let i=0;i+5<=s.length;i+=5)d.push(parseInt(s.slice(i,i+5),2));return {digits:d,tail:s.slice(d.length*5)}}
 return prior.results.map(({name,map})=>{
  const w=map.map(code),tr=[{next:[-1,-1],sym:-1}];
  for(let i=0;i<w.length;i++){let s=0;for(let ch of w[i]){ck(tr[s].sym<0,"prefix");let b=+ch;if(tr[s].next[b]<0){tr[s].next[b]=tr.length;tr.push({next:[-1,-1],sym:-1})}s=tr[s].next[b]}ck(tr[s].sym<0&&tr[s].next.every(x=>x<0),"prefix");tr[s].sym=i}
  function parse(s,b){let p=[];for(let ch of b){s=tr[s].next[+ch];if(s<0)return null;if(tr[s].sym>=0){p.push(tr[s].sym);s=0}}return {s,p}}
  const ext=tr.map((_,s)=>tails.flatMap(t=>{let r=parse(s,t);return r&&r.s===0?[{tail:t,p:r.p}]:[]}));
  function reach(a){let dp=Array(a.length+1).fill(0n),f=dp.slice();dp[0]=f[0]=1n;for(let i=0;i<a.length;i++){if(!dp[i]&&!f[i])continue;let s=0;for(let j=i;j<a.length;j++){let r=parse(s,bits([a[j]]));if(!r)break;s=r.s;if(!ext[s].length)continue;dp[j+1]+=dp[i];if(ext[s].some(e=>e.tail==="11"))f[j+1]+=f[i]}}return {anyMax:dp.findLastIndex(x=>x>0n),anyPaths:dp.at(-1).toString(),fixedMax:f.findLastIndex(x=>x>0n),fixedPaths:f.at(-1).toString()}}
  const frames=[["chapter",[a]],["page",page],["line",line],["group",word]].map(([label,fs])=>{let counts=[0,0,0];for(let f of fs){let r=parse(0,bits(f));if(r){if(ext[r.s].length)counts[0]++;if(ext[r.s].some(e=>e.tail==="11"))counts[1]++;if(r.s===0)counts[2]++}}return {label,n:fs.length,any:counts[0],fixed:counts[1],none:counts[2]}});
  let native=c.pages[57].indices,back=Array(native.length+1).fill(-1);back[0]=0;
  for(let i=0;i<native.length;i++)if(back[i]>=0){let s="";for(let j=i;j<native.length;j++){s+=w[native[j]];let e=emit(s);if(e.digits.some(v=>v>28))break;if(e.digits.length&&back[j+1]<0)back[j+1]=i}}
  ck(back.at(-1)>=0,"native");let plant=[];for(let j=native.length;j>0;){let i=back[j],p=native.slice(i,j),e=emit(p.map(v=>w[v]).join(""));ck(eq(parse(0,bits(e.digits)+e.tail),{s:0,p}),"native replay");plant.unshift(e);j=i}
  let pr=reach(plant.flatMap(e=>e.digits));ck(BigInt(pr.anyPaths)>0n,"native inverse");
  let r={name,frames,original:reach(a),native:{runes:native.length,frames:plant.length,encoded:plant.flatMap(e=>e.digits).length}};
  if(name==="ordinal"){let options=Array.from({length:29},(_,d)=>{let p=parse(0,bits([d])),g={};ck(p,"singleton");for(let e of ext[p.s]){let q=p.p.concat(e.p);ck(eq(emit(q.map(v=>w[v]).join("")),{digits:[d],tail:e.tail}),"replay");(g[q.length]??=[]).push({p:q,tail:e.tail})}let best=Object.values(g).sort((a,b)=>b.length-a.length)[0];ck(best.length>=2&&new Set(best.map(x=>x.p.join(","))).size===best.length,"ambiguity");return best});let count=a.reduce((x,d)=>x*BigInt(options[d].length),1n);let w0=a.map(d=>options[d][0]),w1=a.map((d,i)=>options[d][i===0?1:0]);for(let x of [w0,w1])ck(eq(x.flatMap(q=>emit(q.p.map(v=>w[v]).join("")).digits),a),"original replay");ck(w0.flatMap(x=>x.p).length===w1.flatMap(x=>x.p).length&&!eq(w0,w1),"witness");r.ambiguity={options,count:count.toString(),decimalDigits:count.toString().length,plaintextRunes:w0.flatMap(x=>x.p).length,firstDigit:a[0],first:w0[0],second:w1[0]}}
  return r;
 });
};
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("im-results/lp2-p15-fibonacci-payload-base29.json")),read("resources/transcriptions/lp2-image-corrected.txt")),null,2));
