'use strict';
// Agent3 #2742, frozen chart-length prime cursor and literal-F hold.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];

function run(f) {
 const C=JSON.parse(f[0].content),S=JSON.parse(f[1].content);
 const mod=x=>((x%29)+29)%29, len=C.translit.map(x=>x.length);
 const primes=[];for(let x=2;primes.length<5000;x++){let prime=true;for(const p of primes){if(p*p>x)break;if(x%p===0){prime=false;break}}if(prime)primes.push(x)}
 const shift=primes.map(x=>(x-1)%29);
 const gp=new Map(C.runes.map((x,i)=>[x,i]));
 const sections=new Map(S.sections.map(x=>[x.name,[...x.source_text].filter(s=>gp.has(s)).map(s=>gp.get(s))]));
 const ordered=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encodeText(t){const out=[];for(const word of t.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){if(word.startsWith('ING',i)){out.push(21);i+=3;continue}if(word.startsWith('IO',i)){out.push(27);i+=2;continue}const q=ordered.find(x=>word.startsWith(x.s,i));if(!q)throw Error('unmapped '+word.slice(i));out.push(q.i);i+=q.s.length}}return out}
 const train=[encodeText(f[2].content),encodeText(f[3].content),...[...sections].filter(([k])=>!['0_welcome','0_koan_1','0_loss_of_divinity'].includes(k)).map(([,v])=>v)];
 const uni=new Float64Array(29),bi=new Float64Array(30*29),tri=new Float64Array(900*29),btotal=new Float64Array(30),ttotal=new Float64Array(900);
 for(const a of train){let h=899;for(const p of a){const q=h%30;uni[p]++;bi[q*29+p]++;btotal[q]++;tri[h*29+p]++;ttotal[h]++;h=q*30+p}}
 const sum=uni.reduce((a,b)=>a+b,0);const log=new Float64Array(900*29);for(let h=0;h<900;h++)for(let p=0;p<29;p++){const q=h%30,u=(uni[p]+.5)/(sum+14.5),b=(bi[q*29+p]+10*u)/(btotal[q]+10),t=(tri[h*29+p]+4*b)/(ttotal[h]+4);log[h*29+p]=Math.log(t)}
 function enc(P,t,expanded=true){const out=[];for(const p of P){if(p===0)out.push(0);else{out.push(mod(p+shift[t]));t+=expanded?len[p]:1}}return {out,t}}
 function count(c,lo,hi,expanded=true){const n=c.length,M=hi+2*n+3;let a=Array(M).fill(1n);for(let i=n-1;i>=0;i--){const b=Array(M).fill(0n),v=c[i];for(let t=lo;t<=hi+2*i;t++){const p=mod(v-shift[t]);b[t]=(v===0?a[t]:0n)+(p===0?0n:a[t+(expanded?len[p]:1)])}a=b}let total=0n,origins=0;for(let t=lo;t<=hi;t++){if(a[t])origins++;total+=a[t]}return {origins,paths:total.toString()}}
 function best(c,lo,hi,h=899,expanded=true){let states=new Map();for(let t=lo;t<=hi;t++)states.set(t*900+h,{score:0,t,h,origin:t,prev:null,p:-1});let maxStates=states.size;for(const v of c){const next=new Map();function add(node,p,t){const hh=(node.h%30)*30+p,key=t*900+hh,score=node.score+log[node.h*29+p],old=next.get(key);if(!old||score>old.score)next.set(key,{score,t,h:hh,origin:node.origin,prev:node,p})}for(const node of states.values()){const p=mod(v-shift[node.t]);if(v===0)add(node,0,node.t);if(p!==0)add(node,p,node.t+(expanded?len[p]:1))}states=next;maxStates=Math.max(maxStates,states.size);if(!states.size)return null}let winner=null;for(const node of states.values())if(!winner||node.score>winner.score)winner=node;const p=[];for(let x=winner;x.prev;x=x.prev)p.push(x.p);p.reverse();return {p,origin:winner.origin,end:winner.t,h:winner.h,score:winner.score/c.length,maxStates,terminalStates:states.size}}
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 function evaluate(c){const fit=c.slice(0,223),hold=c.slice(223),prefixCount=count(fit,0,3301),fullCount=count(c,0,3301),a=best(fit,0,3301);if(!a)return {prefixCount,fullCount,fit:null,hold:null};if(!same(enc(a.p,a.origin).out,fit))throw Error('fit replay');const holdCount=count(hold,a.end,a.end),b=best(hold,a.end,a.end,a.h);if(b&&!same(enc(b.p,a.end).out,hold))throw Error('hold replay');return {prefixCount,fullCount,holdCount,fit:a,hold:b}}
 const cases=[['0_welcome',0,17],['0_koan_1',0,777],['0_koan_1',350,2014],['0_loss_of_divinity',0,3301]];
 const controls=cases.map(([name,off,origin])=>{const P=sections.get(name).slice(off,off+299);if(P.length!==299)throw Error('short plant');const c=enc(P,origin).out,e=evaluate(c),a=e.fit,b=e.hold;return {name,off,origin,actualCursor:enc(P.slice(0,223),origin).t,prefixExact:a?a.p.filter((x,i)=>x===P[i]).length:0,holdExact:b?b.p.filter((x,i)=>x===P[i+223]).length:0,...e}});
 const p56=sections.get('p56_an_end'),c56=C.pages.find(x=>x.page===56).indices;const ordinary56=enc(p56,0,false),expanded56=enc(p56,0,true);if(!same(ordinary56.out,c56))throw Error('authentic p56 ordinary replay mismatch');
 const c54=C.pages.find(x=>x.page===54).indices.slice(9),c55=C.pages.find(x=>x.page===55).indices;if(c54.length!==223||c55.length!==76)throw Error('target frame');
 const original=evaluate(c54.concat(c55));
 let seed=3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function shuffle(v){const a=v.slice();for(let i=a.length-1;i>0;i--){const j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const nulls=Array.from({length:12},()=>evaluate(shuffle(c54).concat(shuffle(c55))));
 const ordinaryControls=cases.map(([name,off,origin])=>{const P=sections.get(name).slice(off,off+299),e=evaluate(enc(P,origin,false).out);return {name,off,origin,fitExact:e.fit?e.fit.p.filter((x,i)=>x===P[i]).length:0,holdExact:e.hold?e.hold.p.filter((x,i)=>x===P[i+223]).length:0,...e}});
 return {inputs:f.map(({path,sha})=>({path,sha})),trainingLengths:train.map(x=>x.length),chartLengths:len,p56:{ordinaryReplay:85,ordinaryCursor:ordinary56.t,expandedReplay:expanded56.out.filter((x,i)=>x===c56[i]).length,expandedCursor:expanded56.t,expandedAllOriginCount:count(c56,0,3301)},controls,ordinaryControls,original,nulls};
}

const f=paths.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,content:b.toString('utf8'),sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')}});
console.log(JSON.stringify(run(f),null,2));
