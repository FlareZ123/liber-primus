"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function solve(corpus,ink){
  const markCodes={10:29,13:30,23:31}, E={A:[],B:[],C:[]};
  for(const p of corpus.pages){
    const ip=ink.pages.find(x=>x.page===p.page),red=new Set(),marks=ip?.large_punctuation||[];let k=0;
    for(const s of ip?.red_spans||[])for(let j=s.start;j<s.start+s.length;j++)red.add(j);
    for(let i=0;i<=p.indices.length;i++){
      while(k<marks.length&&marks[k][0]===i){const m=marks[k++],c=markCodes[m[1]];
        if(m[1]===13)E.A.push(c);
        if((m[1]===13||m[1]===23)&&m[2]==="red")E.B.push(c);
        if(p.page<56)E.C.push(c);
      }
      if(i<p.indices.length&&red.has(i))for(const a of Object.values(E))a.push(p.indices[i]);
    }
  }
  E.terminal=corpus.pages.slice(54,56).flatMap(p=>p.indices);
  const check=(x,m)=>{if(!x)throw Error(m)};
  const all=0xffffffff>>>0;
  const pop=x=>{let n=0;for(x>>>=0;x;x=(x&(x-1))>>>0)n++;return n};
  const values=x=>{const a=[];for(let j=0;j<32;j++)if((x>>>j)&1)a.push(j);return a};
  const bitset=v=>(1<<v)>>>0;
  const filter=(m,want)=>{let d=0;for(let c=0;c<32;c++)if(want?(c&m)!==0:(c&m)!==m)d=(d|bitset(c))>>>0;return d};
  function run(a,phase){
    const types=[...new Set(a)].sort((a,b)=>a-b),row=new Map(types.map((v,i)=>[v,i])),n=types.length,clauses=[];
    const mk=(start,len,want)=>{
      const terms=new Map();
      for(let b=start;b<start+len;b++){const i=row.get(a[Math.floor(b/5)]),mask=1<<(4-b%5);terms.set(i,(terms.get(i)||0)|mask)}
      clauses.push([...terms].map(([i,m])=>({i,d:filter(m,want)})));
    };
    for(let b=phase;b+7<=a.length*5;b+=7){mk(b,2,true);mk(b,7,false)}
    function matching(d){
      const m=Array(32).fill(-1);
      function visit(i,seen){for(const c of values(d[i]))if(!seen[c]){seen[c]=true;if(m[c]<0||visit(m[c],seen)){m[c]=i;return true}}return false}
      for(const i of Array.from({length:n},(_,i)=>i).sort((a,b)=>pop(d[a])-pop(d[b])))if(!visit(i,Array(32).fill(false)))return false;
      return true;
    }
    function prop(d){
      let changed=true;
      while(changed){
        changed=false;let used=0;
        for(const x of d){if(!x)return false;if(pop(x)===1){if(used&x)return false;used=(used|x)>>>0}}
        for(let i=0;i<n;i++)if(pop(d[i])>1){let q=(d[i]&~used)>>>0;if(!q)return false;if(q!==d[i]){d[i]=q;changed=true}}
        for(const clause of clauses){
          let sat=false,possible=[];
          for(const {i,d:m} of clause){const c=(d[i]&m)>>>0;if(c===d[i]){sat=true;break}if(c)possible.push({i,c})}
          if(sat)continue;
          if(!possible.length)return false;
          if(possible.length===1){const {i,c}=possible[0];if(c!==d[i]){d[i]=c;changed=true}}
        }
      }
      return matching(d);
    }
    let nodes=0,cap=30000,hitCap=false,solutions=[];
    function dfs(d){
      if(nodes++>=cap){hitCap=true;return}
      if(!prop(d))return;
      let best=-1,k=33;
      for(let i=0;i<n;i++){let q=pop(d[i]);if(q>1&&q<k){best=i;k=q}}
      if(best<0){
        const code=d.map(x=>values(x)[0]),map=new Map(types.map((x,i)=>[x,code[i]]));
        let out="";
        for(let b=phase;b+7<=a.length*5;b+=7){let x=0;for(let j=b;j<b+7;j++)x=2*x+((map.get(a[Math.floor(j/5)])>>(4-j%5))&1);check(x>=32&&x<=126,"printable witness");out+=String.fromCharCode(x)}
        solutions.push({codebook:Object.fromEntries(map),out});return;
      }
      for(const c of values(d[best])){let q=d.slice();q[best]=bitset(c);dfs(q);if(solutions.length>=2||hitCap)return}
    }
    const initial=Array(n).fill(all);let initialFeasible=prop(initial);
    if(initialFeasible)dfs(initial.slice());
    return {phase,n,initialFeasible,domainSizes:initialFeasible?initial.map(pop):null,nodes,hitCap,solutions};
  }
  let result={};
  for(const [name,a] of Object.entries(E)){
    const records=[];
    for(const [direction,t] of [["forward",a],["reverse",a.slice().reverse()]])for(let phase=0;phase<7;phase++)records.push({direction,...run(t,phase)});
    result[name]=records;
  }
  const phrase=corpus.pages[57].indices.map(x=>corpus.translit[x]).join("").slice(0,100);
  const bits=[...phrase].flatMap(c=>Array.from({length:7},(_,i)=>(c.charCodeAt(0)>>(6-i))&1));
  const p=[];for(let i=0;i<bits.length;i+=5){let x=0;for(let j=0;j<5;j++)x=2*x+bits[i+j];p.push((13*x+7)%32)}
  let control=run(p,0);check(control.initialFeasible && (control.solutions.length||control.hitCap),"plant excluded");
  return {result,control};
}
console.log(JSON.stringify(solve(read("resources/liber-primus/lp2-corpus.json"),read("resources/liber-primus/lp2-ink-annotations.json")),null,2));
