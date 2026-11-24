"use strict";
/**
 * Exact finite-lexicon recovery of C_j-C_(j-1)=G(P_j)-H(P_(j-1)) mod29.
 * Weighted DSU with rollback and all-different G within components.
 * Root partitions permit deterministic parallel search. A completed negative
 * is conservative: disconnected-component all-different feasibility is relaxed.
 * Each candidate is tested jointly against all previous equations.
 */
const MASK=(1<<29)-1;
const mod=n=>(n%29+29)%29;
function fresh() {
  return {p:Int8Array.from({length:58},(_,i)=>i),d:new Int8Array(58),
    size:new Int8Array(58).fill(1),bits:Int32Array.from({length:58},(_,i)=>i<29?1:0),hist:[]};
}
function find(s,x) {
  let d=0;
  while(s.p[x]!==x){d+=s.d[x];x=s.p[x]}
  return (x<<5)|(d%29);
}
function rotate(b,k){return k?((b<<k)|(b>>>(29-k)))&MASK:b}
function add(s,x,y,d) {
  const fu=find(s,x),fv=find(s,y);
  let a=fu>>5,b=fv>>5,k=(d-(fu&31)+(fv&31)+29)%29;
  if(a===b)return k===0;
  if(s.size[a]>s.size[b]){const q=a;a=b;b=q;k=(29-k)%29}
  const shifted=rotate(s.bits[a],k);
  if(shifted&s.bits[b])return false;
  s.hist.push(a,b,s.bits[b]);
  s.p[a]=b;s.d[a]=k;s.size[b]+=s.size[a];s.bits[b]|=shifted;
  return true;
}
function rollback(s,n) {
  while(s.hist.length>n){
    const bits=s.hist.pop(),b=s.hist.pop(),a=s.hist.pop();
    s.bits[b]=bits;s.size[b]-=s.size[a];s.p[a]=a;s.d[a]=0;
  }
}
function insert(s,edges) {
  for(let i=0;i<edges.length;i+=3)if(!add(s,edges[i],edges[i+1],edges[i+2]))return false;
  return true;
}
/**
 * @param {Array<{C:number[],index:number}>} rows
 * @param {Array<Array<{p:number[],original:string}>>} byLength
 */
function prepare(rows,byLength) {
  return rows.map(r=>({...r,cands:(byLength[r.C.length]||[]).map(w=>{
    const edges=[];
    for(let i=1;i<r.C.length;i++)edges.push(w.p[i],29+w.p[i-1],mod(r.C[i]-r.C[i-1]));
    return {edges,word:w.original,p:w.p};
  }).filter(c=>insert(fresh(),c.edges))}))
    .sort((a,b)=>a.cands.length-b.cands.length||b.C.length-a.C.length);
}
/**
 * @param {ReturnType<typeof prepare>} rows
 * @param {{start?:number,end?:number,timeMs?:number,maxSolutions?:number}} [opts]
 */
function solve(rows,opts={}) {
  if(!rows.length)throw Error("empty constraint set");
  const start=opts.start??0,end=Math.min(opts.end??rows[0].cands.length,rows[0].cands.length);
  const timeMs=opts.timeMs??Infinity,maxSolutions=opts.maxSolutions??1;
  const begun=Date.now(),s=fresh(),tests=Array(rows.length).fill(0),survive=Array(rows.length).fill(0),solutions=[];
  let timedOut=false,completed=start;
  const chosen=[];
  const options=rows.map(r=>r.cands.map((_,i)=>i));
  function expired(){if(Date.now()-begun>=timeMs){timedOut=true;return true}return false}
  function dfs(depth,optsHere) {
    if(depth===rows.length){
      solutions.push(chosen.map((i,j)=>({index:rows[j].index,word:rows[j].cands[i].word,p:rows[j].cands[i].p})));
      return solutions.length>=maxSolutions;
    }
    const len=s.hist.length;
    for(const idx of optsHere[depth]){
      tests[depth]++;
      if(insert(s,rows[depth].cands[idx].edges)){
        survive[depth]++;chosen[depth]=idx;
        const next=optsHere.slice();let ok=true;
        for(let j=depth+1;j<rows.length;j++){
          const choices=[],mark=s.hist.length;
          for(const ci of optsHere[j]){
            if(insert(s,rows[j].cands[ci].edges))choices.push(ci);
            rollback(s,mark);
          }
          if(!choices.length){ok=false;break}
          next[j]=choices;
        }
        if(ok&&dfs(depth+1,next))return true;
      }
      rollback(s,len);
      if(expired())return true;
    }
    return false;
  }
  for(let idx=start;idx<end;idx++){
    options[0]=[idx];
    if(dfs(0,options))break;
    completed=idx+1;
  }
  return {start,end,completed,timedOut,solutions,tests,survive,elapsedMs:Date.now()-begun,
    rows:rows.map(r=>[r.index,r.C.length,r.cands.length])};
}
module.exports={prepare,solve};
