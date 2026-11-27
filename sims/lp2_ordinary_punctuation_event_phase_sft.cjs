'use strict';
// Agent31 #3168. Exact known-control phase identification; no unknown LP2 fitted.
function analyze(a,b,c){
const n=JSON.parse(b),corp=JSON.parse(c),rune=n.runes,mod=(x,q=29)=>(x%q+q)%q;
const assert=(x,m)=>{if(!x)throw Error(m)};
const ord=s=>[...s].filter(x=>rune.includes(x)).map(x=>rune.indexOf(x));
const factorial=n=>{let v=1;for(let i=2;i<=n;i++)v*=i;return v};
const sec=[{name:"WELCOME",c:a.split("%").slice(1,3).join("%"),p:n.sections[1].source_text,key:[23,10,1,10,9,10,16,26]},{name:"KOAN2",c:a.split("%").slice(12,14).join("%"),p:n.sections[5].source_text,key:[..."FIRFUMFERENFE"].map(x=>corp.translit.indexOf(x))}];
function run(s){
const C=ord(s.c),P=ord(s.p),q=s.key.length;assert(C.length===P.length,"length");let j=0,residual=[],clock=[0];const hold=[];
for(let i=0;i<C.length;i++){if(C[i]===0&&P[i]===0){residual.push(null);hold.push(i)}else{const v=mod(C[i]-P[i]);assert(v===s.key[j%q],`mismatch ${s.name} ${i}`);residual.push(v);j++}clock.push(j)}
let E=[],at=0;for(const x of s.p){if(rune.includes(x))at++;else if("⁘⁚⁜\"'".includes(x))E.push({type:x,at});}
const groups=new Map;for(const e of E){if(!groups.has(e.at))groups.set(e.at,[]);groups.get(e.at).push(e.type)}
const cuts=[...new Set([0,...groups.keys(),C.length])].sort((a,b)=>a-b);
function phases(lo,hi){const r=residual.slice(lo,hi).filter(x=>x!==null);return [...Array(q).keys()].filter(k=>r.every((v,t)=>v===s.key[(k+t)%q]));}
let events=[];for(let i=1;i<cuts.length-1;i++){const lo=cuts[i-1],at=cuts[i],hi=cuts[i+1],before=phases(lo,at).map(x=>mod(x+clock[at]-clock[lo],q)),after=phases(at,hi);assert(before.includes(clock[at]%q)&&after.includes(clock[at]%q),"true state absent");events.push({at,types:groups.get(at),before,after,left:[lo,at],right:[at,hi],isolated:groups.get(at).length===1});}
const stats={};for(const type of ["⁘","⁚","⁜","\"","'"]){const rows=events.filter(x=>x.isolated&&x.types[0]===type&&x.before.length===1&&x.after.length===1);assert(rows.every(x=>x.before[0]===x.after[0]),"nontrivial phase");
const phases=[...new Set(rows.map(x=>x.before[0]))].sort((a,b)=>a-b);
function maps(rs){let out=[];for(let a=0;a<q;a++)for(let b=0;b<q;b++)if(rs.every(x=>mod(a*x.before[0]+b,q)===x.after[0]))out.push([a,b]);return out}
const full=maps(rows);let fit=null;outer:for(let i=0;i<rows.length;i++)for(let k=i+1;k<rows.length;k++){const m=maps([rows[i],rows[k]]);if(m.length===1){const withheld=rows.filter((_,l)=>l!==i&&l!==k);fit={at:[rows[i].at,rows[k].at],map:m[0],holdout:withheld.map(x=>x.at),holdoutPass:withheld.filter(x=>mod(m[0][0]*x.before[0]+m[0][1],q)===x.after[0]).length};break outer}}
stats[type]={n:rows.length,phases,affineMaps:full,permutationCount:factorial(q-phases.length),fit,rows:rows.map(x=>x.at)};
}
return {name:s.name,q,count:C.length,clock:j,hold,events,stats};
}
const controls=sec.map(run);
const C=corp.pages.find(x=>x.page===56).indices,P=ord(n.sections[7].source_text),F=56;
assert(C.length===85&&P.length===85&&C[F]===0&&P[F]===0,"p56 length/F");
let primes=[];for(let i=2;primes.length<3400;i++)if(primes.every(p=>i%p))primes.push(i);
const R=C.map((x,i)=>mod(x-P[i]));assert(R.every((v,i)=>i===F?v===0:v===mod(primes[i-(i>F?1:0)]-1)),"p56 replay");
function matches(lo,hi){const hits=[];for(let start=0;start<=3301;start++)if(R.slice(lo,hi).every((v,i)=>v===mod(primes[start+i]-1)))hits.push(start);return hits}
const before=matches(0,19),fit=matches(19,32),whole=matches(19,45),holdout=fit.map(start=>({start,matched:R.slice(32,45).filter((v,i)=>v===mod(primes[start+13+i]-1)).length}));
assert(JSON.stringify(before)==="[0]"&&JSON.stringify(whole)==="[19]","p56 phase ambiguity");
const clear=corp.pages.find(x=>x.page===57).indices,P57=ord(n.sections[8].source_text);assert(clear.length===95&&JSON.stringify(clear)===JSON.stringify(P57),"p57 identity");
return {controls,p56:{count:85,hold:[56],commaOffset:19,before,fit,whole,holdout,residual:R.slice(19,45),testedStarts:[0,3301]},p57:{count:95,identity:true},decision:"No nontrivial ordinary-punctuation phase rule independently validated; no unknown LP2 key/state coordinates inferred."};
}
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const files=["resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-corpus.json"];console.log(JSON.stringify(analyze(...files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));}
module.exports={analyze};
