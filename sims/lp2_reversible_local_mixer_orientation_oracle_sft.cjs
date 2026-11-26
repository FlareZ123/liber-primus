'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(gp,raw){
 const mod=x=>(x%29+29)%29,N=12956,lengths=gp.pages.filter(p=>p.page<56).map(p=>p.indices.length),C=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices),tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);a.push(t[1]);i+=t[0].length}}return a}
 function encrypt(p,k,sign,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+sign*k[j++%k.length]))}
 const keys=["DIUINITY","FIRFUMFERENFE"].map(s=>({s,k:encode(s)}));if(keys[0].k.length!==8||keys[1].k.length!==13)throw Error("key");
 const docs=raw.map(encode);
 function blocks(lens,b){let o=0,B=[];for(const l of lens){for(let i=0;i+b<=l;i+=b)B.push(Array.from({length:b},(_,j)=>o+i+j));o+=l}return B}
 function adj(a){return a.slice(1).reduce((s,x,i)=>s+(x===a[i]),0)}
 const cache=new Map();
 function entry(v){const vals=Array.from(new Set(v)).sort((a,b)=>a-b),d=v.map(x=>vals.indexOf(x)),counts=vals.map((_,i)=>d.filter(x=>x===i).length),shape=counts.join("");let info=cache.get(shape);if(!info){const codes=[],costs={};function rec(a){if(a.length===v.length){const code=a.reduce((s,x)=>4*s+x,0);codes.push(code);costs[code]=adj(a);return}for(let x=0;x<counts.length;x++)if(counts[x]){counts[x]--;rec([...a,x]);counts[x]++}}rec([]);info={codes,costs,out:codes.slice().sort((a,b)=>costs[a]-costs[b]||a-b)};cache.set(shape,info)}return{shape,code:d.reduce((s,x)=>4*s+x,0),sum:mod(v.reduce((s,x)=>s+x,0)),vals,info}}
 const modes=["shape","sum","phase","sum_phase"];
 function run(c,B,q,mode,verify){const cut=Math.floor(B.length*2/3),g=new Map(),items=[];for(let i=0;i<B.length;i++){const v=B[i].map(j=>c[j]),e=entry(v);if(e.info.codes.length===1||e.info.out.every(x=>e.info.costs[x]===0)){items.push(null);continue}const id=e.shape+(mode==="sum"||mode==="sum_phase"?`/${e.sum}`:"")+(mode==="phase"||mode==="sum_phase"?`/${i%q}`:"");let group=g.get(id);if(!group){group={info:e.info,train:{},all:{},test:{}};g.set(id,group)}group.all[e.code]=(group.all[e.code]||0)+1;const h=i<cut?group.train:group.test;h[e.code]=(h[e.code]||0)+1;items.push({id,e})}
 let oracle=0,train=0,test=0,original=0,testOriginal=0;const maps=new Map();
 for(const [id,x] of g){const {info}=x;const a=info.codes.slice().sort((a,b)=>(x.all[b]||0)-(x.all[a]||0)||a-b);for(let i=0;i<a.length;i++)oracle+=(x.all[a[i]]||0)*info.costs[info.out[i]];const t=info.codes.slice().sort((a,b)=>(x.train[b]||0)-(x.train[a]||0)||a-b);let m={};if(Object.keys(x.train).length===0){for(const code of info.codes)m[code]=code}else{for(let i=0;i<t.length;i++)m[t[i]]=info.out[i]}maps.set(id,m);for(const code of info.codes){train+=(x.train[code]||0)*info.costs[m[code]];test+=(x.test[code]||0)*info.costs[m[code]];original+=(x.all[code]||0)*info.costs[code];testOriginal+=(x.test[code]||0)*info.costs[code]}}
 // All-equal blocks have constant positive adjacency, unlike all-distinct blocks.
 for(let i=0;i<B.length;i++)if(items[i]===null){const v=B[i].map(j=>c[j]),z=adj(v);oracle+=z;original+=z;if(i<cut)train+=z;else{test+=z;testOriginal+=z}}
 if(verify){let mixed=c.slice(),recovered=c.slice();function decodeRank(code,vals,b){let a=Array(b);for(let i=b-1;i>=0;i--){a[i]=vals[code%4];code=Math.floor(code/4)}return a}
 for(let i=0;i<B.length;i++)if(items[i]){const {id,e}=items[i],m=maps.get(id);const v=decodeRank(m[e.code],e.vals,B[i].length);B[i].forEach((j,t)=>mixed[j]=v[t]);const z=entry(v);if(z.shape!==e.shape||z.sum!==e.sum)throw Error("invariant");const back=Number(Object.keys(m).find(k=>m[k]===z.code));const rec=decodeRank(back,z.vals,B[i].length);B[i].forEach((j,t)=>recovered[j]=rec[t])}
 if(recovered.some((x,i)=>x!==c[i]))throw Error("roundtrip");if(B.reduce((s,b)=>s+adj(b.map(j=>mixed[j])),0)!==train+test)throw Error("actual score")}
 return{oracle,train,test,original,testOriginal,groups:g.size,verified:verify};
 }
 const out=[];
 for(const frame of ["continuous","page"])for(const b of [3,4]){const B=blocks(frame==="continuous"?[N]:lengths,b),cut=Math.floor(B.length*2/3),target=B.reduce((s,a)=>s+adj(a.map(i=>C[i])),0),heldTarget=B.slice(cut).reduce((s,a)=>s+adj(a.map(i=>C[i])),0);for(let d=0;d<docs.length;d++)for(let i=0;i+N<=docs[d].length;i+=N){const p=docs[d].slice(i,i+N);for(const key of keys)for(const sign of [-1,1])for(const hold of [false,true]){const c=encrypt(p,key.k,sign,hold);for(const mode of modes){const x=run(c,B,key.k.length,mode,d===0&&i===0&&key.k.length===8&&sign===1&&hold);out.push({frame,b,d,i,key:key.s,sign,hold,mode,target,heldTarget,...x})}}}}
 return out;
}
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),f.slice(1)),null,2));
