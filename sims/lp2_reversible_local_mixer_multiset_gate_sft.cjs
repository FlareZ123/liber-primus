'use strict';
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
function experiment(gp,raw){
 const mod=x=>(x%29+29)%29,N=12956,lengths=gp.pages.filter(p=>p.page<56).map(p=>p.indices.length),C=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 if(C.length!==N)throw Error("length");
 const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;continue}if(w.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);a.push(t[1]);i+=t[0].length}}return a}
 const docs=raw.map(encode);
 function partitions(lens,b,off){let o=0,blocks=[];for(const l of lens){for(let i=off;i+b<=l;i+=b)blocks.push(Array.from({length:b},(_,j)=>o+i+j));o+=l}return blocks}
 function profile(c,blocks){let pairs=0,adj=0,forced=0;const types={};for(const B of blocks){let h=new Uint8Array(29);for(let j=0;j<B.length;j++){let x=c[B[j]];pairs+=h[x]++;if(j&&x===c[B[j-1]])adj++}const v=Array.from(h).filter(x=>x>0).sort((a,b)=>b-a),m=v[0],type=v.join(",");forced+=Math.max(0,2*m-B.length-1);types[type]=(types[type]||0)+1}return{blocks:blocks.length,pairs,adj,forced,types}}
 function distribution(type){const counts=type.split(",").map(Number),n=counts.reduce((a,b)=>a+b,0),h=Array(n).fill(0);function rec(j,prev,adj){if(j===n){h[adj]++;return}for(let x=0;x<counts.length;x++)if(counts[x]){counts[x]--;rec(j+1,x,adj+(prev===x));counts[x]++}}rec(0,-1,0);const total=h.reduce((a,b)=>a+b,0);return h.map(x=>x/total)}
 function tail(p){let d=new Float64Array(p.adj+1);d[0]=1;let mean=0;for(const [type,n] of Object.entries(p.types)){const a=distribution(type);mean+=n*a.reduce((s,v,i)=>s+v*i,0);if(a[0]===1)continue;for(let t=0;t<n;t++){let e=new Float64Array(d.length);for(let i=0;i<d.length;i++)if(d[i])for(let j=0;j<a.length&&i+j<d.length;j++)e[i+j]+=d[i]*a[j];d=e}}return{mean,p:d.reduce((a,b)=>a+b,0)}}
 function cost(p,blocks,q,hold,reset){const phase=new Int16Array(p.length);let pos=0,j=0;for(const l of lengths){if(reset)j=0;for(let i=0;i<l;i++,pos++){phase[pos]=hold&&p[pos]===0?-1:j%q;if(phase[pos]>=0)j++}}
 let constant=0;const U=Array.from({length:q},()=>new Int32Array(29)),E=Array.from({length:q},()=>new Int32Array(29));
 for(const [a,b] of blocks){const x=phase[a],y=phase[b];if(x<0&&y<0)constant++;else if(x<0)U[y][mod(-p[b])]++;else if(y<0)U[x][mod(-p[a])]++;else{if(y!==(x+1)%q)throw Error("clock");E[x][mod(p[a]-p[b])]++}}
 let simple=constant;for(let i=0;i<q;i++)simple+=Math.min(...U[i])+Math.min(...E[i]);
 let best=Infinity;for(let k0=0;k0<29;k0++){let d=new Int32Array(29).fill(1000000);d[k0]=U[0][k0];for(let i=1;i<q;i++){let n=new Int32Array(29).fill(1000000);for(let y=0;y<29;y++){let m=1000000;for(let x=0;x<29;x++){const v=d[x]+E[i-1][(y-x+29)%29];if(v<m)m=v}n[y]=m+U[i][y]}d=n}for(let x=0;x<29;x++)best=Math.min(best,d[x]+E[q-1][(k0-x+29)%29]+constant)}
 return{simple,exact:best};
 }
 const frames=[];for(const mode of ["continuous","page"])for(let b=2;b<=4;b++)for(let off=0;off<b;off++){const blocks=partitions(mode==="continuous"?[N]:lengths,b,off);const original=profile(C,blocks);frames.push({mode,b,off,original,conditional:tail(original),blocks})}
 const out=[];for(const frame of frames.filter(x=>x.b===2)){for(const q of [8,13])for(const hold of [false,true])for(const reset of frame.mode==="continuous"?[false]:[false,true]){const rows=[];for(let d=0;d<docs.length;d++){const p=docs[d],vals=[];for(let a=0;a+N<=p.length;a+=N)vals.push(cost(p.slice(a,a+N),frame.blocks,q,hold,reset).exact);rows.push({doc:d,n:vals.length,min:Math.min(...vals),max:Math.max(...vals),passes:vals.filter(x=>x<=frame.original.pairs).length,values:vals})}out.push({mode:frame.mode,off:frame.off,q,hold,reset,original:frame.original.pairs,rows})}}
 function encrypt(p,k,hold){let j=0;return p.map(x=>hold&&x===0?0:mod(x+k[j++%k.length]))}
 // Plaintext-F hold is not uniquely decodable on visible zero; use exact sender trace for the control.
 function mix(c,blocks,key){let out=c.slice();for(let i=0;i<blocks.length;i++){const b=blocks[i],s=b.reduce((a,j)=>a+c[j],0);if(mod(s+key[i%key.length])<14){const a=b[0],z=b[1];[out[a],out[z]]=[out[z],out[a]]}}return out}
 const key=[23,10,1,10,9,10,16,26],controls=[];
 for(let j=0;j<3;j++){let p=docs[j].slice(0,N);for(const hold of [false,true]){let c=encrypt(p,key,hold);for(const frame of frames.filter(x=>x.mode==="continuous"&&x.off===0)){const m=mix(c,frame.blocks,key),back=mix(m,frame.blocks,key);if(back.some((x,i)=>x!==c[i]))throw Error("mixer roundtrip");const a=profile(c,frame.blocks),b=profile(m,frame.blocks);if(a.pairs!==b.pairs||JSON.stringify(Object.entries(a.types).sort())!==JSON.stringify(Object.entries(b.types).sort()))throw Error("invariant");if(frame.b===2&&cost(p,frame.blocks,8,hold,false).exact>a.pairs)throw Error("bound");controls.push({doc:j,hold,b:frame.b,before:a.adj,after:b.adj,pairs:a.pairs,fullBefore:c.slice(1).filter((x,i)=>x===c[i]).length,fullAfter:m.slice(1).filter((x,i)=>x===m[i]).length,roundtrip:back.length,conditionalBefore:tail(a),conditionalAfter:tail(b)})}}}
 return{frames:frames.map(({blocks,...x})=>x),out,controls,docLengths:docs.map(x=>x.length)}
}
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),f.slice(1)),null,2));
