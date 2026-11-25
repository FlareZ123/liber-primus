"use strict";
// Agent16: exact all-secret 5-bit printable ASCII capacity gate.
// Run from the repository with node sims/lp2_fivebit_allsecret_ascii_assignment_sft.cjs
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function run(corpus,ink){
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const marks=new Map(ink.pages.map(p=>[p.page,p.large_punctuation||[]])), codes={10:29,13:30,23:31};
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  function source(lo,hi,withMarks){
    const a=[];
    for(let page=lo;page<=hi;page++){
      const p=corpus.pages[page],m=withMarks?(marks.get(page)||[]):[];let j=0;
      check(p.page===page && p.indices.length===p.runic_count,"page shape");
      for(let i=0;i<=p.indices.length;i++){
        while(j<m.length&&m[j][0]===i){check(codes[m[j][1]]!==undefined,"mark code");a.push(codes[m[j++][1]]);}
        if(i<p.indices.length)a.push(p.indices[i]);
      }
      check(j===m.length,"mark order");
    }
    return a;
  }
  // Hungarian minimum cost injective assignment of n observed symbols to 32 codewords.
  function assignment(cost){
    const n=cost.length,m=32,u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const min=Array(m+1).fill(Infinity),used=Array(m+1).fill(false);
      do{
        used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;
        for(let j=1;j<=m;j++)if(!used[j]){
          const cur=cost[i0-1][j-1]-u[i0]-v[j];
          if(cur<min[j]){min[j]=cur;way[j]=j0;}
          if(min[j]<d){d=min[j];j1=j;}
        }
        for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=d;v[j]-=d;}else min[j]-=d;
        j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
    }
    const map=Array(n).fill(-1);
    for(let j=1;j<=m;j++)if(p[j])map[p[j]-1]=j-1;
    const score=map.reduce((s,c,i)=>s+cost[i][c],0);
    check(score===-v[0]&&new Set(map).size===n,"assignment certificate");
    // Verify dual feasibility, so optimum is certified even on original input.
    for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)check(u[i]+v[j]<=cost[i-1][j-1],"dual feasibility");
    return {score,map};
  }
  const bit=(code,j)=>(code>>(4-j))&1;
  function alignment(a,width,phase){
    const types=[...new Set(a)].sort((a,b)=>a-b),row=new Map(types.map((v,i)=>[v,i]));
    const counts=types.map(()=>Array(5).fill(0));let chars=0,checked=0;
    for(let b=phase;b+width<=a.length*5;b+=width){
      chars++;const i=Math.floor(b/5),j=b%5;
      if(width===7&&j===4)continue; // cross-codeword pair: relax, never charge
      counts[row.get(a[i])][j]++;checked++;
    }
    const costs=counts.map(c=>Array.from({length:32},(_,code)=>c.reduce((sum,n,j)=>sum+n*(width===8?bit(code,j):j<4?Number(!(bit(code,j)||bit(code,j+1))):0),0)));
    const x=assignment(costs);
    const actual=new Map(types.map((t,i)=>[t,x.map[i]]));
    let violations=0;
    for(let b=phase;b+width<=a.length*5;b+=width){
      const i=Math.floor(b/5),j=b%5,c=actual.get(a[i]);
      if(width===8)violations+=bit(c,j);
      else if(j<4)violations+=Number(!(bit(c,j)||bit(c,j+1)));
    }
    check(violations===x.score,"cost witness");
    return {phase,chars,checked,lower:x.score};
  }
  function best(a,width){
    if(!a.length)return null;
    let out=[];
    for(const [direction,t] of [["forward",a],["reverse",a.slice().reverse()]])
      for(let phase=0;phase<width;phase++)out.push({direction,...alignment(t,width,phase)});
    out.sort((a,b)=>a.lower-b.lower||a.chars-b.chars);
    return {...out[0],zeroAlignments:out.filter(x=>x.lower===0).length};
  }
  function summary(a){return {symbols:a.length,types:new Set(a).size,ascii8:best(a,8),ascii7:best(a,7)}}
  // Positive controls: reserialize actual clear p57 GP transliteration as ASCII,
  // using a fixed nonidentity secret five-bit permutation.
  let plain=corpus.pages[57].indices.map(x=>corpus.translit[x]).join("");
  plain=plain.slice(0,plain.length-plain.length%5);
  const control=[];
  for(const width of [8,7]){
    const bits=[...plain].flatMap(c=>Array.from({length:width},(_,i)=>(c.charCodeAt(0)>>(width-1-i))&1));
    const a=[];for(let i=0;i<bits.length;i+=5){let x=0;for(let j=0;j<5;j++)x=2*x+bits[i+j];a.push((13*x+7)%32);}
    const back=a.flatMap(x=>Array.from({length:5},(_,j)=>bit((5*(x-7)+320)%32,j)));
    check(back.every((b,i)=>b===bits[i]),"known secret inverse");
    const z=alignment(a,width,0);check(z.lower===0,"valid plant rejected");control.push({width,chars:plain.length,types:new Set(a).size,lower:z.lower});
  }
  // Hungarian positive optimality check against brute force for small assignment matrices.
  for(let q=0;q<4;q++){
    const c=Array.from({length:3},(_,i)=>Array.from({length:32},(_,j)=>(i*7+j*11+q*13+i*j)%19));
    let b=Infinity;for(let i=0;i<32;i++)for(let j=0;j<32;j++)if(j!==i)for(let k=0;k<32;k++)if(k!==i&&k!==j)b=Math.min(b,c[0][i]+c[1][j]+c[2][k]);
    check(assignment(c).score===b,"brute-force assignment check");
  }
  const result={controls:control,registers:[]};
  for(const withMarks of [false,true]){
    const whole=summary(source(0,55,withMarks));
    const ch=chapters.map(([lo,hi])=>({pages:`${lo}-${hi}`,...summary(source(lo,hi,withMarks))}));
    const pages=Array.from({length:56},(_,p)=>({page:p,...summary(source(p,p,withMarks))})).filter(x=>x.symbols);
    result.registers.push({withMarks,whole,chapters:ch,pageSummary:{total:pages.length,excluded8:pages.filter(x=>x.ascii8.lower>0).length,excluded7:pages.filter(x=>x.ascii7.lower>0).length,surviving8:pages.filter(x=>!x.ascii8.lower).map(x=>x.page),surviving7:pages.filter(x=>!x.ascii7.lower).map(x=>x.page)},pages});
  }
  // Three previously frozen red256 event tapes.
  const redEvents={A:[],B:[],C:[]};
  for(const p of corpus.pages){
    const ip=ink.pages.find(x=>x.page===p.page),red=new Set();
    for(const s of ip?.red_spans||[])for(let j=s.start;j<s.start+s.length;j++)red.add(j);
    const m=marks.get(p.page)||[];let k=0;
    for(let i=0;i<=p.indices.length;i++){
      while(k<m.length&&m[k][0]===i){
        const x=m[k++],c=codes[x[1]];
        if(x[1]===13)redEvents.A.push(c);
        if((x[1]===13||x[1]===23)&&x[2]==="red")redEvents.B.push(c);
        if(p.page<56)redEvents.C.push(c);
      }
      if(i<p.indices.length&&red.has(i))for(const a of Object.values(redEvents))a.push(p.indices[i]);
    }
  }
  result.red256=Object.entries(redEvents).map(([key,a])=>{check(a.length===256,"red256 event count");return {key,...summary(a)}});
  return result;
}
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-ink-annotations.json")),null,2));
