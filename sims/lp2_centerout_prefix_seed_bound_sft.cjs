'use strict';
// Agent48: exact center-out prefix collision/seed-state lower bound; read-only CommonJS.
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const inputs=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
function run(inputs){
 const gp=JSON.parse(inputs[0]),rmap=new Map(gp.runes.map((r,i)=>[r,i]));
 const raw=inputs[1].split('%').slice(0,55).join('%');
 const words=[];let w=[],start=0,offset=0;
 const finish=()=>{if(w.length)words.push({w,start});w=[]};
 for(const ch of raw){if(rmap.has(ch)){if(!w.length)start=offset;w.push(rmap.get(ch));offset++;}else if(ch!=='%'&&ch!=='/'&&!/\s/u.test(ch))finish();}finish();
 const orig=gp.pages.filter(x=>x.page<=55).flatMap(x=>x.indices);
 if(words.length!==2896||offset!==12956||words.flatMap(x=>x.w).some((x,i)=>x!==orig[i]))throw Error("source mismatch");
 const trans=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gpWord(text){const s=text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S'),o=[];for(let i=0;i<s.length;){if(s.startsWith('ING',i)){o.push(21);i+=3;continue;}if(s.startsWith('IO',i)){o.push(27);i+=2;continue;}const h=trans.find(k=>s.startsWith(k.s,i));if(h){o.push(h.i);i+=h.s.length;}else i++;}return o;}
 function pools(s){const by=new Map();for(const t of s.match(/[A-Za-z]+/g)||[]){let w=gpWord(t);if(!w.length)continue;if(!by.has(w.length))by.set(w.length,[]);by.get(w.length).push(w);}return by;}
 const cuts=[729,1874,3612,5506,6527,7960,9640,12648,12956];
 const contexts=[{width:1,min:3},{width:2,min:4},{width:3,min:5},{width:4,min:6}];
 function grouped(book,{width,min}){let m=new Map(),n=0;for(const {w,start} of book){if(w.length<min||w.length%2!==width%2)continue;const k=cuts.findIndex(x=>start<x)+':'+w.length,at=(w.length-width)/2,p=w.slice(at,at+width).join(',');if(!m.has(k))m.set(k,new Map());const h=m.get(k);h.set(p,(h.get(p)||0)+1);n++;}return {m,n};}
 // Smallest collisions if n copies of a single plaintext prefix can be split across at most S distinct seed states.
 const lower=(n,S)=>{const q=Math.floor(n/S),r=n%S;return (S-r)*q*(q-1)/2+r*q*(q+1)/2;};
 function collision(g,S=1){let sum=0;for(const h of g.m.values())for(const n of h.values())sum+=lower(n,S);return sum;}
 function stateBound(plain,cipher){for(let S=1;S<=plain.n;S++){let ok=true;for(const [k,h] of plain.m){let e=0;for(const n of h.values())e+=lower(n,S);let cap=0;for(const n of cipher.m.get(k).values())cap+=lower(n,1);if(e>cap){ok=false;break;}}if(ok)return S;}throw Error("state bound");}
 // Necessary-condition positive: a stationary injective prefix relabeling preserves E and any seeded deterministic construction obeys lower.
 // Construct a separate arbitrary affine translation per context and seed (not a model of LP2).
 function control(book,c,S){let m=new Map(),n=0;for(const {w,start} of book){if(w.length<c.min||w.length%2!==c.width%2)continue;const ch=cuts.findIndex(x=>start<x),k=ch+':'+w.length,at=(w.length-c.width)/2,seed=(n*17+start)%S,p=w.slice(at,at+c.width).map((x,i)=>(x+ch*7+w.length*5+seed*11+i*3)%29).join(',');if(!m.has(k))m.set(k,new Map());let h=m.get(k);h.set(p,(h.get(p)||0)+1);n++;}return {m,n};}
 const og=contexts.map(c=>grouped(words,c));
 let state=0x48c3a01;const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 function match(by){return words.map(({w,start})=>{let p=by.get(w.length);if(!p||!p.length)throw Error("missing length");return {w:p[Math.floor(random()*p.length)],start};});}
 const donors=inputs.slice(2).map(pools);
 const res=donors.map(by=>{let out=contexts.map(()=>({min:Infinity,max:0,atOrBelow:0,minState:Infinity,maxState:0,states:{}}));for(let n=0;n<128;n++){const book=match(by);for(let i=0;i<contexts.length;i++){let plain=grouped(book,contexts[i]),e=collision(plain),s=stateBound(plain,og[i]),r=out[i];r.min=Math.min(r.min,e);r.max=Math.max(r.max,e);r.atOrBelow+=e<=collision(og[i]);r.minState=Math.min(r.minState,s);r.maxState=Math.max(r.maxState,s);r.states[s]=(r.states[s]||0)+1;if(n<3)for(let S of [1,2,5,13]){let cipher=control(book,contexts[i],S);if(stateBound(plain,cipher)>S)throw Error("invalid bound");if(S===1&&collision(plain)!==collision(cipher))throw Error("bijection E");}}}return out;});
 return {seed:"0x48c3a01",samplesPerDonor:128,contexts:contexts.map((c,i)=>({...c,eligibleWords:og[i].n,contextCount:og[i].m.size,originalCollisions:collision(og[i]),gibran:res[0][i],emerson:res[1][i]})),positiveChecks:2*3*4*4};
}
console.log(JSON.stringify(run(inputs),null,2));
