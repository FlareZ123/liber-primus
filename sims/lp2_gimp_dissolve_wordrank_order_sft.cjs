"use strict";
const fs=require("node:fs"),path=require("node:path");
const inputs=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),runes=new Set(gp.runes),ts=gp.translit.slice().sort((a,b)=>b.length-a.length),sizes=[158,255,383,437,224,326,378,669,66],N=2896,L=12;
 const check=(b,m)=>{if(!b)throw Error(m)};
 const id=w=>w.join(",");
 const source=[];let n=0,total=0;for(const c of raw[1]){if(runes.has(c)){n++;total++;if(total===12956){source.push(n);break}}else if(/[-.&]/.test(c)&&n){source.push(n);n=0}}check(source.length===N&&source.reduce((a,b)=>a+b,0)===12956,"source");
 function native(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return(s.slice(a?a.index+a[0].length:0,b?b.index:s.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let n=0;for(let i=0;i<w.length;){const t=w.startsWith("ING",i)?"ING":w.startsWith("IO",i)?"IO":ts.find(t=>w.startsWith(t,i));check(t,"token");n++;i+=t.length}return n})}
 const donors=raw.slice(2).map(native);
 class MT{constructor(seed){this.i=624;this.s=new Uint32Array(624);this.s[0]=seed>>>0;for(let i=1;i<624;i++){const t=this.s[i-1];this.s[i]=(Math.imul(1812433253,t^(t>>>30))+i)>>>0}}next(){if(this.i>=624){for(let i=0;i<624;i++){const t=(this.s[i]&0x80000000)|(this.s[(i+1)%624]&0x7fffffff);this.s[i]=this.s[(i+397)%624]^(t>>>1)^((t&1)?0x9908b0df:0)}this.i=0}let t=this.s[this.i++];t^=t>>>11;t^=(t<<7)&0x9d2c5680;t^=(t<<15)&0xefc60000;t^=t>>>18;return t>>>0}}
 const seed=314159265,ref=[3721122731,618219707,807213306,3144837749,3447982176,3230631767,755972506,1398685501,3196876378,1337812403,909895126,1889049173],m=new MT(seed);check(id(ref.map(()=>m.next()))===id(ref),"GLib");
 const mt=new MT(seed),table=Array.from({length:4096},()=>mt.next());
 function perm(scope){if(scope==="global")return Array.from({length:N},(_,i)=>i).sort((a,b)=>table[a]-table[b]||a-b);let start=0;const out=[];for(const size of sizes){out.push(...Array.from({length:size},(_,i)=>i).sort((a,b)=>table[a]-table[b]||a-b).map(i=>i+start));start+=size}return out}
 const inv=p=>{const a=[];for(let i=0;i<p.length;i++)a[p[i]]=i;return a},apply=(a,p)=>p.map(i=>a[i]);
 const cat=x=>Math.min(L,x)-1, joint=Array.from({length:L},()=>Array(L).fill(.5)),row=Array(L).fill(L*.5),col=Array(L).fill(L*.5);
 for(const d of donors){const t=d.slice(0,Math.floor(d.length*.7));for(let i=1;i<t.length;i++){const a=cat(t[i-1]),b=cat(t[i]);joint[a][b]++;row[a]++;col[b]++}}
 const den=col.reduce((a,b)=>a+b,0),weights=joint.map((r,a)=>r.map((v,b)=>Math.log(v/row[a]/(col[b]/den))));
 function score(a){let s=0;for(let i=1;i<a.length;i++)s+=weights[cat(a[i-1])][cat(a[i])];return s/(a.length-1)}
 function stats(a){return {min:Math.min(...a),max:Math.max(...a),mean:a.reduce((x,y)=>x+y,0)/a.length,n:a.length}}
 let xr=33014409;function rnd(){xr^=xr<<13;xr^=xr>>>17;xr^=xr<<5;return xr>>>0}function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rnd()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const windows=[];for(let k=0;k<donors.length;k++){const d=donors[k],a=Math.floor(d.length*.7),span=d.length-N-a;check(span>=0,"donor");for(let j=0;j<32;j++){const s=a+Math.floor(span*j/31);windows.push({k,s,W:d.slice(s,s+N)})}}
 const sourceScores={printed:score(source)},candidates=[],control=[];
 for(const scope of ["global","chapter-reset"]){const p=perm(scope),q=inv(p);check(new Set(p).size===N,"perm");for(const [direction,dec,enc] of [["rank",p,q],["inverse-rank",q,p]]){const decoded=apply(source,dec);check(id(apply(decoded,enc))===id(source),"replay");let restored=[],scrambled=[];for(const w of windows){const c=apply(w.W,enc),z=apply(c,dec);check(id(z)===id(w.W),"plant");restored.push(score(z));scrambled.push(score(c))}const whole=score(decoded),a=score(decoded.slice(0,N/2)),b=score(decoded.slice(N/2));candidates.push({scope,direction,whole,firstHalf:a,secondHalf:b});control.push({scope,direction,restored:stats(restored),scrambled:stats(scrambled),plantRecoveries:windows.length,restoredAboveScrambled:restored.filter((x,i)=>x>scrambled[i]).length})}}
 const nullScores=Array.from({length:1000},()=>score(shuffle(source)));const nativeScores=windows.map(w=>score(w.W));
 return {sourceScores,candidates,control,native:stats(nativeScores),null:stats(nullScores),candidateNullTail:candidates.map(c=>({scope:c.scope,direction:c.direction,p:(1+nullScores.filter(x=>x>=c.whole).length)/1001})),donorLengths:donors.map(d=>d.length)}
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
