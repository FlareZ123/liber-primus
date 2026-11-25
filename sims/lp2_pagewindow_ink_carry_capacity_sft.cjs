"use strict";
/** Exact original-source page-window private carry capacity. Run from repository root: node sims/lp2_pagewindow_ink_carry_capacity_sft.cjs */
function audit(tx,c,ink){
  const choose=(n,k)=>{let x=1n;for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-i+1)/BigInt(i);return x};
  const multi=counts=>{let n=counts.reduce((a,b)=>a+b,0),x=1n;for(const k of counts){x*=choose(n,k);n-=k}return x};
  const sum=a=>a.reduce((x,y)=>x+y,0),log=x=>{let s=x.toString(2),b=Math.min(53,s.length);return s.length-b+Math.log2(parseInt(s.slice(0,b),2))};
  const state=(u,v)=>{let n=(u+v-1n)/v;return n<=1n?0:(n-1n).toString(2).length};
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
  const pages=tx.split("%").slice(0,55).map((s,i)=>{
    const p=i<50?i:i+1,a=c.pages.find(x=>x.page===p).indices,b=s.match(/[\u16a0-\u16ff]/gu);
    assert(b.length===a.length&&b.every((x,j)=>x===c.runes[a[j]]),"rune mismatch "+p);
    const h={};for(const g of s.split(/[\u16a0-\u16ff]/gu).slice(1,-1).map(g=>[...g].filter(x=>".-&$§".includes(x)).join("")).filter(Boolean))h[g]=(h[g]??0)+1;
    const d=ink.pages.find(x=>x.page===p)??{},red=sum((d.red_spans??[]).map(x=>x.length)),spans=(d.red_spans??[]).length,marks=(d.large_punctuation??[]).length,n=a.length,k=a.slice(1).filter((x,j)=>x===a[j]).length;
    // Allow each mark anywhere, including collisions, with arbitrary one of four identities.
    const redCap=spans?choose(n-red+spans,spans)*choose(red-1,spans-1):1n;
    const markCap=choose(n+marks,marks)*4n**BigInt(marks);
    const tickCap=[4,21,35,41].includes(p)?BigInt(n+1):1n;
    const fine=[true,false].reduce((v,dot)=>v*multi(Object.entries(h).filter(([x])=>x.includes(".")===dot).map(([,v])=>v)),1n);
    const all=multi(Object.values(h));
    const codeExact=29n*choose(n-1,k)*28n**BigInt(n-1-k);
    const codeAtMost=29n*Array.from({length:k+1},(_,j)=>choose(n-1,j)*28n**BigInt(n-1-j)).reduce((x,y)=>x+y,0n);
    return {p,n,k,red,spans,marks,redCap,markCap,tickCap,fine,all,codeExact,codeAtMost};
  });
  assert(sum(pages.map(x=>x.n))===12956&&sum(pages.map(x=>x.k))===86&&sum(pages.map(x=>x.red))===213&&sum(pages.map(x=>x.spans))===16&&sum(pages.map(x=>x.marks))===31,"source census");
  // For a fixed entering state and key, all interval plaintexts must produce distinct (output, outgoing state) pairs.
  function maxWindow(rows,A,mode,quota,lineBits){
    let best={u:1n,v:1n,p0:null,p1:null,n:0,k:0};
    for(let i=0;i<rows.length;i++){
      let u=1n,v=1n,n=0,k=0;
      for(let j=i;j<rows.length;j++){
        const p=rows[j];n+=p.n;k+=p.k;u*=BigInt(A)**BigInt(p.n);
        v*=p[quota]*p.redCap*p.markCap*p.tickCap*p[mode];
        if(u*best.v>best.u*v){best={u,v,p0:rows[i].p,p1:p.p,n,k}}
      }
    }
    const v=best.v*(2n**BigInt(lineBits));
    return {first:best.p0,last:best.p1,runes:best.n,repeats:best.k,deficit:Math.max(0,log(best.u)-log(v)),minCarryBits:state(best.u,v),rawDeficit:log(best.u)-log(best.v)};
  }
  const results=[];
  for(const A of [27,28,29])for(const mode of ["fine","all"])for(const quota of ["codeAtMost","codeExact"]){
    results.push({alphabet:A,mode,quota,full:maxWindow(pages,A,mode,quota,0),all55LineBits:maxWindow(pages,A,mode,quota,55),beforeTable:maxWindow(pages.filter(x=>x.p<50),A,mode,quota,55),afterTable:maxWindow(pages.filter(x=>x.p>50),A,mode,quota,55)});
  }
  // Exhaustive toy validation: for ternary digits, count pages whose repeated transitions are <= / exactly k.
  let toy=0;for(let n=1;n<=6;n++)for(let k=0;k<n;k++){let exact=0,atMost=0;for(let x=0;x<3**n;x++){let q=x,r=-1,e=0;for(let j=0;j<n;j++){const a=q%3;q=Math.floor(q/3);if(a===r)e++;r=a}if(e===k)exact++;if(e<=k)atMost++}assert(BigInt(exact)===3n*choose(n-1,k)*2n**BigInt(n-1-k),"toy exact");assert(BigInt(atMost)===3n*Array.from({length:k+1},(_,j)=>choose(n-1,j)*2n**BigInt(n-1-j)).reduce((a,b)=>a+b,0n),"toy quota");toy++}
  // Toy capacity max over windows compared with direct finite integer ratios.
  const test=[{p:0,n:1,k:0,codeAtMost:1n,redCap:1n,markCap:1n,tickCap:1n,fine:1n},{p:1,n:1,k:0,codeAtMost:3n,redCap:1n,markCap:1n,tickCap:1n,fine:1n},{p:2,n:2,k:0,codeAtMost:1n,redCap:1n,markCap:1n,tickCap:1n,fine:1n}];
  assert(maxWindow(test,2,"fine","codeAtMost",0).minCarryBits===3,"toy local state");
  return {source:{pages:pages.length,runes:12956,repeats:86,red:213,spans:16,marks:31,ticks:4},toyCount:toy,results};
}
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
console.log(JSON.stringify(audit(read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"))),null,2));
