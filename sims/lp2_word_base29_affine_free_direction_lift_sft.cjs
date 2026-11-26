'use strict';
const fs=require('node:fs'),path=require('node:path');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((r,i)=>[r,i])),assert=(v,m)=>{if(!v)throw Error(m)};
 const words=[];let page=0,w=[],start=0;const finish=()=>{if(w.length){words.push({w,page:start>=50?start+1:start,end:page>=50?page+1:page});w=[];}};
 for(const c of raw[1].split('%').slice(0,55).join('%')){if(ix.has(c)){if(!w.length)start=page;w.push(ix.get(c));}else if(c==='%')page++;else if(c==='/'||/\s/u.test(c))continue;else finish();}
 finish();assert(words.length===2896&&words.flatMap(x=>x.w).join()===gp.pages.slice(0,56).flatMap(p=>p.indices).join(),'canonical parse');
 const C=words.filter(x=>x.page>=54).slice(2).map(x=>x.w);
 assert(C.length===64&&C.flat().length===299&&C.flat().join()===gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join(),'terminal body');
 const tok=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length), D=new Map();
 function add(a){if(a.length<1||a.length>14)return;const k=a.join(',');if(!D.has(a.length))D.set(a.length,new Map());D.get(a.length).set(k,a);}
 for(const line of raw[2].split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/i);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(const alt of [false,true]){const a=[];let j=0;while(j<s.length){const t=alt&&s.startsWith('ING',j)?{t:'ING',i:21}:alt&&s.startsWith('IO',j)?{t:'IO',i:27}:tok.find(t=>s.startsWith(t.t,j));assert(t,'unmapped '+s);a.push(t.i);j+=t.t.length;}add(a);}}
 for(const sec of gold.sections)for(const s of sec.source_text.split(/[^\u16a0-\u16ff]+/u)){if(s&&[...s].every(c=>ix.has(c)))add([...s].map(c=>ix.get(c)));}
 const N=5,pow=Array.from({length:N+1},(_,i)=>29**i),pack=a=>a.reduce((v,x)=>29*v+x,0);
 const tables=[false,true].map(both=>Array.from({length:N+1},(_,d)=>{const t=new Map();if(!d)return t;for(const [L,ws] of D){const k=Math.min(L,d),m=pow[k],s=new Set();for(const w of ws.values()){s.add(pack(w.slice(-k)));if(both)s.add(pack([...w].reverse().slice(-k)));}let a=s;if(m<=25000){a=new Uint8Array(m);for(const v of s)a[v]=1;}t.set(L,{a,size:s.size,m});}return t;}));
 function rows(C,d,both){return C.map(w=>{const t=tables[+both][d].get(w.length),k=Math.min(d,w.length);assert(t,'missing length');return {...t,x:pack(w.slice(-k)),y:pack([...w].reverse().slice(-k)),dense:t.a instanceof Uint8Array};}).sort((a,b)=>a.size/a.m-b.size/b.m);}
 function ok(q,A,B){const x=(A*q.x+B)%q.m,y=(A*q.y+B)%q.m;return q.dense?(q.a[x]||q.a[y]):(q.a.has(x)||q.a.has(y));}
 function lift(C,truth,both,maxOOV=3){let prev=[[0,0]],st=[];for(let d=1;d<=N;d++){const step=pow[d-1],m=pow[d],rr=rows(C,d,both);let next=[],visited=0,maxCov=0;
 for(const [aa,bb] of prev)for(let i=0;i<29;i++){const A=aa+step*i;if(A%29===0)continue;for(let j=0;j<29;j++){const B=bb+step*j;let bad=0;visited++;for(const q of rr){if(!ok(q,A,B)&&++bad>maxOOV)break;}if(bad<=maxOOV){next.push([A,B]);maxCov=Math.max(maxCov,C.length-bad);}}}
 st.push({d,visited,survivors:next.length,bestCoverage:next.length?maxCov:null,truthRetained:truth?next.some(([a,b])=>a===truth[0]%m&&b===truth[1]%m):null});prev=next;if(!prev.length||prev.length>300000)break;}return {st,preview:prev.slice(0,5)};}
 function oracle(C,both){const rr=rows(C,2,both);let best=0,count=0,key=null,visited=0;for(let A=1;A<841;A++){if(A%29===0)continue;for(let B=0;B<841;B++){visited++;let score=0;for(const q of rr)if(ok(q,A,B))score++;if(score>best){best=score;count=1;key=[A,B];}else if(score===best)count++;}}return {best,count,key,visited,forcedOOV:C.length-best};}
 const original=[false,true].map(both=>({both,...lift(C,null,both),oracle:oracle(C,both)}));
 let seed=330145;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 const bm=(a,m)=>(a%m+m)%m;function inv(a,m){let x=0n,y=1n,r=m,s=a;while(s){const q=r/s;[r,s]=[s,r-q*s];[x,y]=[y,x-q*y];}assert(r===1n,'inverse');return bm(x,m);}
 const bigpack=a=>a.reduce((v,x)=>v*29n+BigInt(x),0n);function unpack(n,L){let a=Array(L);for(let i=L-1;i>=0;i--){a[i]=Number(n%29n);n/=29n;}return a;}
 function decode(c,A,B,both){const m=29n**BigInt(c.length),out=new Map();for(const revC of [false,true]){const cc=revC?[...c].reverse():c;const ordered=unpack(bm(BigInt(A)*bigpack(cc)+BigInt(B),m),c.length);for(const revP of both?[false,true]:[false]){const p=revP?[...ordered].reverse():ordered;const k=p.join(',');if(D.get(c.length).has(k))out.set(k,p);}}return [...out.values()];}
 const controls=[];
 for(const both of [false,true])for(let t=0;t<2;t++){let A=rand()%pow[N],B=rand()%pow[N];if(A%29===0)A++;const plain=C.map(w=>{const a=[...D.get(w.length).values()];return a[rand()%a.length];});const cipher=plain.map(w=>{const m=29n**BigInt(w.length),revP=both&&(rand()>>>31)!==0,p=revP?[...w].reverse():w,c=unpack(bm(inv(BigInt(A),m)*(bigpack(p)-BigInt(B)),m),w.length),revC=(rand()>>>31)!==0;if(revC)c.reverse();return c;});
 const result=lift(cipher,[A,B],both),last=result.st.at(-1);assert(last.truthRetained,'lost key');const best=result.preview[0];let retained=0,unique=0,retainedRunes=0,uniqueRunes=0;const found=last.d===N&&last.survivors===1&&best[0]===A&&best[1]===B;if(found)for(let i=0;i<plain.length;i++){const p=plain[i],cand=decode(cipher[i],...best,both);assert(cand.some(a=>a.join()===p.join()),'control true word absent');retained++;retainedRunes+=p.length;if(cand.length===1){unique++;uniqueRunes+=p.length;}}controls.push({both,A,B,fullRunes:plain.flat().length,...result,found,retained,unique,retainedRunes,uniqueRunes});}
 return {lexicon:[...D.values()].reduce((n,s)=>n+s.size,0),source:{words:C.length,runes:C.flat().length},original,controls};
}
console.log(JSON.stringify(experiment(inputs.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
