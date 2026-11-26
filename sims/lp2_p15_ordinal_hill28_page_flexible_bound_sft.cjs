// Agent3: fully page-private source-matrix framing relaxation.
const fs=require('node:fs');
function flexible(corpus,texts) {
 const mod=(a,n)=>((a%n)+n)%n, A=[[14,22,7,0],[9,1,2,6],[6,4,3,5],[8,23,14,10]],B=[[12,1,4,17],[8,0,14,7],[19,18,0,20],[7,16,1,18]],T=m=>m[0].map((_,i)=>m.map(r=>r[i])),mat=(m,v)=>m.map(r=>mod(r.reduce((s,x,i)=>s+x*v[i],0),28));
 let pow=[1];for(let i=1;i<28;i++)pow.push(pow[i-1]*15%29);let log=Array(29);pow.forEach((v,i)=>log[v]=i);
 const sort=a=>a.slice().sort((a,b)=>b-a),prefix=a=>{let n=0;return a.map(x=>n+=x)},sum=a=>a.reduce((s,x)=>s+x,0);
 function gp(s){const map=new Map(corpus.translit.map((x,i)=>[x,i])),out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(w.length){const d=w.slice(0,2);if(d.length===2&&map.has(d)){out.push(map.get(d));w=w.slice(2)}else{if(map.has(w[0]))out.push(map.get(w[0]));w=w.slice(1)}}}return out}
 function env(c,m,t,phase){let r=[],esc=0;for(let i=1;i<c.length;i++){let d=mod(c[i]-c[i-1],29);if(d)r.push(t==="log"?log[d]:d-1);else esc++}
  let v=r.slice();for(let i=phase;i+4<=r.length;i+=4)v.splice(i,4,...mat(m,r.slice(i,i+4)));
  let h=Array.from({length:4},()=>Array(28).fill(0));v.forEach((x,i)=>h[mod(i-phase,4)][x]++);
  let s=h.map(sort),h2=sort([...Array.from({length:28},(_,i)=>sum(s.map(row=>row[i]))),esc]);if(sum(h2)!==c.length-1)throw Error("length");return prefix(h2);
 }
 const pages=corpus.pages.filter(p=>p.page>=16&&p.page<=22);
 const groups=pages.map(p=>{let options=[];for(const [name,m] of [["A",A],["AT",T(A)],["B",B],["BT",T(B)]])for(const t of ["cyclic","log"])for(let phase=0;phase<4;phase++)options.push({name,t,phase,upper:env(p.indices,m,t,phase)});return {page:p.page,options,upper:Array.from({length:29},(_,i)=>Math.max(...options.map(x=>x.upper[i])))}});
 const upper=Array.from({length:29},(_,i)=>sum(groups.map(g=>g.upper[i]))),N=upper[28],windows=[];
 for(const [source,s] of texts.map(gp).entries())for(let start=0;start+N<=s.length;start+=Math.floor(N/4)){let h=Array(29).fill(0);s.slice(start,start+N).forEach(x=>h[x]++);let pr=prefix(sort(h)),d=pr.map((v,i)=>v-upper[i]);windows.push({source,start,top1:pr[0],maxDeficit:Math.max(...d),at:1+d.indexOf(Math.max(...d))})}
 return {N,upper,groups,windows,minMaxDeficit:Math.min(...windows.map(x=>x.maxDeficit)),maxMaxDeficit:Math.max(...windows.map(x=>x.maxDeficit)),passes:windows.filter(x=>x.maxDeficit<=0).length};
}
const names=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const read=p=>fs.readFileSync(p,'utf8');const lines=s=>s.split(/\r?\n/).slice(149,450).join('\n');
console.log(JSON.stringify(flexible(JSON.parse(read(names[0])),names.slice(1).map(p=>lines(read(p)))),null,2));
