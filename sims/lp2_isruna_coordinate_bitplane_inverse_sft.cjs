'use strict';
const fs=require('node:fs'),path=require('node:path');

function run(corpus){
 const T=corpus.translit,original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),opening=original.slice(13,729);
 if(original.length!==12956||opening.length!==716)throw Error("source");
 const boards=[],first=[T.slice(0,8),T.slice(8,16),T.slice(16,24)];
 function add(name,rows){let loc=Array(29);rows.forEach((row,r)=>row.forEach((s,c)=>{loc[T.indexOf(s)]=[r,c]}));if(loc.filter(Boolean).length!==29)throw Error("chart");boards.push({name,loc})}
 for(let j=0;j<5;j++){let late=["A","AE","Y","EA"];late.splice(j,0,"IA");add("Salzburg+Ior slot "+(j+1),[...first,late])}
 add("Domitian 8+8+8+9 (GP projection)",[first[0],first[1],["T","B","E","M","L","NG","D","OE"],["A","AE","Y","EA","IA"]]);
 function perms(n){let a=Array.from({length:n},(_,i)=>i),out=[];function rec(k){if(k===n){out.push(a.slice());return}for(let i=k;i<n;i++){[a[k],a[i]]=[a[i],a[k]];rec(k+1);[a[k],a[i]]=[a[i],a[k]]}}rec(0);return out}
 const P=[perms(4),perms(8)];
 function bytes(d,bits,p,off){let out=[],v=0,n=0;for(let x of d)for(let k=bits-1;k>=0;k--){if(off){off--;continue}v=(v<<1)|((p[x]>>k)&1);if(++n===8){out.push(v);v=0;n=0}}return{out,tailBits:n,tailValue:v}}
 function fit(d,bits){const K=1<<bits;let min=null,zero=0,variants=0;for(let rev=0;rev<2;rev++){let a=rev?d.slice().reverse():d;for(let off=0;off<8;off++){let n=Math.floor((a.length*bits-off)/8),h=Array.from({length:K},()=>Array(bits).fill(0));for(let i=0;i<n;i++){let k=off+8*i;h[a[(k/bits)|0]][bits-1-k%bits]++}let cost=h.map(row=>Array.from({length:K},(_,v)=>row.reduce((s,x,k)=>s+x*((v>>k)&1),0)));for(let p of P[bits-2]){let x=0;for(let j=0;j<K;j++)x+=cost[j][p[j]];if(!x)zero++;variants++;if(!min||x*min.n<min.high*n)min={high:x,n,rev,off,p:p.slice()}}}}let a=bytes(min.rev?d.slice().reverse():d,bits,min.p,min.off).out;if(a.length!==min.n||a.filter(x=>x>=128).length!==min.high)throw Error("assignment");return{variants,zero,min}}
 function validUtf8(a){let i=0;while(i<a.length){let x=a[i++];if(x<128)continue;let n,lo=128,hi=191;if(x>=194&&x<=223)n=1;else if(x>=224&&x<=239){n=2;if(x===224)lo=160;if(x===237)hi=159}else if(x>=240&&x<=244){n=3;if(x===240)lo=144;if(x===244)hi=143}else return false;if(i+n>a.length||a[i]<lo||a[i]>hi)return false;i++;for(let j=1;j<n;j++,i++)if(a[i]<128||a[i]>191)return false}return true}
 const magic=[[31,139],[66,90,104],[80,75,3,4],[137,80,78,71,13,10,26,10],[255,216,255],[37,80,68,70],[127,69,76,70],[45,45,45,45,45,66,69,71,73,78]];
 let rows=[],literal=[];
 for(let b of boards)for(let dim=0;dim<2;dim++){let bits=dim+2,p=Array.from({length:1<<bits},(_,i)=>i);rows.push({chart:b.name,dimension:dim,...fit(opening.map(x=>b.loc[x][dim]),bits)});for(let [scope,tape] of [["opening",opening],["all",original]])for(let rev=0;rev<2;rev++){let d=tape.map(x=>b.loc[x][dim]);let x=bytes(rev?d.reverse():d,bits,p,0);literal.push({chart:b.name,scope,dimension:dim,rev,length:x.out.length,tailBits:x.tailBits,tailValue:x.tailValue,high:x.out.filter(y=>y>=128).length,printable:x.out.filter(y=>y===9||y===10||y===13||y>=32&&y<=126).length,utf8:validUtf8(x.out),magic:magic.filter(s=>s.every((v,i)=>x.out[i]===v)),prefix:x.out.slice(0,24)})}}
 const phrase=Array.from("PRIMES ARE SACRED",x=>x.charCodeAt(0)),controls=[];
 for(let bits of [2,3]){let str=phrase.map(x=>x.toString(2).padStart(8,"0")).join(""),pad=(bits-str.length%bits)%bits;str+="0".repeat(pad);let p=Array.from({length:1<<bits},(_,i)=>(1<<bits)-1-i),d=[];for(let i=0;i<str.length;i+=bits)d.push(p[parseInt(str.slice(i,i+bits),2)]);let q=bytes(d,bits,p,0).out,r=fit(d,bits);if(q.length!==phrase.length||q.some((x,i)=>x!==phrase[i])||!r.zero)throw Error("control");controls.push({bits,exact:q.length,zeroAssignments:r.zero})}
 return{rows,literal,controls}
}

console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
