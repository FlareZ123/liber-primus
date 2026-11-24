// node sims/lp2_p15_recursive_prime_index_permutation_sft.cjs
const fs=require('node:fs'),path=require('node:path');
function study(j){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const mod=x=>(x%29+29)%29,ps=[];
 for(let k=2;ps.length<2000;k++)if(ps.every(p=>p*p>k||k%p!==0))ps.push(k);
 const fib=[0,1,2];while(fib.at(-1)<ps.length-1)fib.push(fib.at(-1)+fib.at(-2));
 const ranks=fib.filter(x=>x<ps.length).map(x=>ps[x]);
 const grid=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 assert(grid.every((x,i)=>x===Math.abs(3301-ranks[i])),'grid');
 const ic=a=>{const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
 function order(n){let rem=Array.from({length:n},(_,i)=>i),out=[];
 while(rem.length>1){const pick=new Set(ranks.filter(x=>x<=rem.length).map(x=>x-1));if(!pick.size)break;
 const next=[];rem.forEach((x,i)=>pick.has(i)?out.push(x):next.push(x));rem=next;}
 out.push(...rem);assert(out.length===n&&new Set(out).size===n,'permutation');return out;}
 const gather=(a,o)=>o.map(i=>a[i]);
 function scatter(a,o){const x=Array(a.length);o.forEach((p,i)=>x[p]=a[i]);return x;}
 const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),key=ps.map(p=>mod(p-1));
 function enc(a){let t=0;return a.map(p=>p===0?0:mod(p+key[t++]));}
 function feasible(c){let states=new Set([0]);for(let i=0;i<c.length;i++){const next=new Set();
 for(const t of states){if(c[i]===0)next.add(t);if(mod(c[i]-key[t])!==0)next.add(t+1);}
 if(!next.size)return {firstContradiction:i,states:0};states=next;}
 return {firstContradiction:null,states:states.size,clockMin:Math.min(...states),clockMax:Math.max(...states)};}
 const p57=j.pages[57].indices,p56=feasible(j.pages[56].indices),results=[];
 assert(p56.states>0&&p56.clockMin<=84&&p56.clockMax>=84,'authentic p56');
 for(const [name,c] of [['p15-body',j.pages[15].indices.slice(20)],['p16-22',j.pages.slice(16,23).flatMap(x=>x.indices)]]){
 const e=enc(Array.from({length:c.length},(_,i)=>p57[i%p57.length]));
 for(const [mode,o] of [['identity',Array.from({length:c.length},(_,i)=>i)],['prime-at-Fibonacci-rank',order(c.length)]])
 for(const dir of mode==='identity'?['gather']:['gather','scatter']){
 const transform=dir==='gather'?gather:scatter,invert=dir==='gather'?scatter:gather;
 const recovered=invert(transform(e,o),o);assert(eq(recovered,e)&&feasible(recovered).states>0,'plant');
 const input=invert(c,o);assert(eq(transform(input,o),c),'original replay');
 const raw=input.map((x,i)=>mod(x-key[i]));
 results.push({name,n:c.length,mode,encoding:dir,feasibility:feasible(input),rawClockIoC:ic(raw),rawPrefix:raw.slice(0,48).map(x=>j.translit[x]).join(' '),plantClock:feasible(recovered),permPrefix:o.slice(0,20)});
 }}
 return {sourceGrid:grid,primeRanks:ranks.slice(0,16),authenticP56:p56,clearP57IoC:ic(p57),results};
}
if(require.main===module)console.log(JSON.stringify(study(JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
module.exports=study;
