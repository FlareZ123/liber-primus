'use strict';
const fs=require('node:fs'), path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function experiment(gp,gibran,lp1){
 const mod=x=>(x%29+29)%29;
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const check=(v,m)=>{if(!v)throw Error(m)};
 function enc(a){let out=[],copies=0,overlaps=0;for(let i=0;i<a.length;){let best=0,dist=0;for(let d=1;d<=Math.min(i,841);d++){let n=0;while(n<31&&i+n<a.length&&a[i+n]===a[i+n-d])n++;if(n>best){best=n;dist=d}if(best===31)break}if(best>=3){let z=dist-1;out.push(1,Math.floor(z/29),z%29,best-3);i+=best;copies++;if(best>dist)overlaps++}else out.push(0,a[i++]);}return {out,copies,overlaps}}
 function dec(a,canonical=true){let p=[];for(let i=0;i<a.length;){const flag=a[i++];if(flag===0){if(i>=a.length)throw Error("truncated literal");p.push(a[i++]);}else if(flag===1){if(i+3>a.length)throw Error("truncated reference");const d=1+29*a[i]+a[i+1],l=3+a[i+2];i+=3;if(d>p.length)throw Error("distance exceeds decoded prefix");for(let j=0;j<l;j++)p.push(p[p.length-d]);}else throw Error("bad flag");}if(canonical&&!eq(enc(p).out,a))throw Error("noncanonical");return p}
 function crypt(a,k,sign=1,hold=false){let j=0;return a.map(v=>hold&&v===0?0:mod(v+sign*k[j++%k.length]))}
 // Exact for the relaxed flag-only grammar; branch only at a newly assigned phase.
 function gate(c,q){let count=0,furthest=0,nodes=0,partialKeys=[],k=Array(q).fill(-1);function walk(i){nodes++;while(i<c.length){furthest=Math.max(furthest,i);const p=i%q;if(k[p]<0){for(const flag of i===0?[0]:[0,1]){const w=flag?4:2;if(i+w>c.length)continue;k[p]=mod(c[i]-flag);walk(i+w);k[p]=-1;}return}const f=mod(c[i]-k[p]);if((f!==0&&f!==1)||(i===0&&f!==0))return;const w=f?4:2;if(i+w>c.length)return;i+=w;}if(i===c.length){count++;furthest=i;partialKeys.push(k.slice())}}if(c.length%2===0&&c.length>0)walk(0);return{count,furthest,nodes,partialKeys}}
 function permGate(c,q){let k=Array.from({length:q},()=>[-1,-1]),nodes=0,furthest=0,count=0;function rec(i){nodes++;while(i<c.length){furthest=Math.max(i,furthest);let p=i%q,v=c[i],assigned=k[p].indexOf(v);if(assigned>=0){let w=assigned?4:2;if(i+w>c.length)return;i+=w;continue}for(const t of i===0?[0]:[0,1]){if(k[p][t]!==-1)continue;let w=t?4:2;if(i+w>c.length)continue;k[p][t]=v;rec(i+w);k[p][t]=-1;}return}if(i===c.length){count++;furthest=i}}if(c.length>0&&c.length%2===0)rec(0);return{count,nodes,furthest}}
 const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function gpText(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);a.push(t[1]);i+=t[0].length}}return a}
 let seed=3030;function rand(){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return Math.floor(seed/4294967296*29)}
 const example=[2,3,2,3,2,3,2,3,2],exampleCode=[0,2,0,3,1,0,1,4];
 check(eq(enc(example).out,exampleCode)&&eq(dec(exampleCode),example),"overlap example");
 for(const a of [[1,0,0,0],[0],[2,1],[0,2,1,0,1,0]]){let failed=false;try{dec(a)}catch{failed=true}check(failed,"malformed control")}
 const p57=gp.pages.find(x=>x.page===57).indices;
 const p1=gpText(lp1.replace(/^#.*$/gm,""));const g=gpText(gibran);
 const source=[{name:"native p57",a:p57},{name:"LP1 editor transliteration",a:p1},{name:"Gibran GP-normalized",a:g}];
 let controls=[],nulls=[];
 for(const {name,a} of source){for(const n of name==="native p57"?[95]:[95,308,729,1680,3008])for(let j=0;j<(name==="native p57"?1:4);j++){const p=a.slice(n*j,n*(j+1));if(p.length!==n)continue;const e=enc(p);check(eq(dec(e.out),p),"native decode");for(const q of [8,13]){const key=Array.from({length:q},rand),c=crypt(e.out,key);const gateResult=gate(c,q);check(gateResult.partialKeys.some(k=>k.every((v,i)=>v===-1||v===key[i])),"blind gate lost hidden key");check(eq(dec(crypt(c,key,-1)),p)&&eq(crypt(enc(dec(crypt(c,key,-1))).out,key),c),"full replay");let full=0,exact=0;for(const k of gateResult.partialKeys){if(k.includes(-1))continue;full++;try{if(eq(dec(crypt(c,k,-1)),p))exact++}catch{}}const pg=permGate(c,q),hg=heldGate(crypt(e.out,key,1,true));check(pg.count>0,"relaxed periodic permutation gate rejected plant");check(hg.possible,"held prefix gate rejected plant");controls.push({permutationPaths:pg.count,heldPrefixGate:hg.possible,name,n,j,q,encoded:e.out.length,copies:e.copies,overlaps:e.overlaps,flagPaths:gateResult.count,fullKeys:full,exactKeys:exact,heldFirst:crypt(e.out,key,1,true)[0]===0});for(let t=0;t<2;t++){const z=Array.from({length:c.length},rand),u=gate(z,q);nulls.push({n:z.length,q,count:u.count,furthest:u.furthest,permutationCount:permGate(z,q).count});}}}}
 function heldGate(a){if(a.length%2!==0)return {possible:false,reason:"odd length"};if(a[0]!==0)return {possible:false,reason:"first literal flag must be visible F"};if(a.length>=6&&a[2]!==0&&(a[3]!==0||a[4]!==0))return {possible:false,reason:"first copy forced after one literal, distance must be 1; both distance digits must be visible F",prefix:a.slice(0,6)};return {possible:true,reason:"necessary prefix tests only"}}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
 const original=ranges.map(([lo,hi])=>{const a=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);return {range:[lo,hi],n:a.length,first:a[0],heldGate:heldGate(a),ordinary:[8,13].map(q=>({q,...gate(a,q)})),arbitraryPhasePermutations:[8,13].map(q=>({q,...permGate(a,q)}))}});
 check(original.at(-1).n===12956,"source length");check(original.every(z=>z.ordinary.every(v=>v.count===0)&&z.arbitraryPhasePermutations.every(v=>v.count===0)&&!z.heldGate.possible),"unexpected original survivor");
 return{example:{plain:example,code:exampleCode},controls,nulls,original,seedInitial:3030}
}
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),f[1],f[2]),null,2));
