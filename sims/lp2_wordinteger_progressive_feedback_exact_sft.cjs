"use strict";
/** Agent50: cross-word BASE29 progressive feedback exact gate. Run with Node22. */
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
function run(source,corpus,solved){
 const mod=x=>(x%29+29)%29;
 const lookup=new Map(corpus.runes.map((c,i)=>[c,i]));
 const words=[];let a=[],page=0,start=0,end=0;
 const finish=()=>{if(a.length){words.push({digits:a,page:start>=50?start+1:start,end});a=[];}};
 for(const c of source.split("%").slice(0,55).join("%")){if(lookup.has(c)){if(!a.length)start=page;a.push(lookup.get(c));end=page;}else if(c==="%")page++;else if(c!=="/"&&!/\s/u.test(c))finish();}finish();
 const original=words.flatMap(w=>w.digits),canonical=corpus.pages.slice(0,56).flatMap(p=>p.indices);
 if(words.length!==2896||original.length!==12956||original.some((x,i)=>x!==canonical[i])||words.filter(w=>w.page!==(w.end>=50?w.end+1:w.end)).length!==32)throw Error("source mismatch");
 const pool=new Map();for(const s of solved.sections)for(const w of s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]){const v=[...w].map(c=>lookup.get(c));if(v.some(x=>x===undefined))throw Error("native rune");if(!pool.has(v.length))pool.set(v.length,[]);pool.get(v.length).push(v);}
 const singleton=[...new Set(pool.get(1).flat())].sort((a,b)=>a-b);
 const allowedMasks=[];for(let a=1;a<29;a++)for(let e=0;e<29;e++){let mask=0;for(const p of singleton)mask|=1<<mod(a*p+e);allowedMasks.push({a,e,mask});}
 const top4=row=>[...row].sort((a,b)=>b-a).slice(0,4).reduce((s,x)=>s+x,0);
 const maxRows=rows=>rows.reduce((s,r)=>s+top4(r),1);
 const ends=(w,rev)=>w.map(x=>rev?x[0]:x[x.length-1]);
 const clocks=(w,kind)=>{let j=0;return w.map((x,i)=>{const t=kind==="word"?i:j;j+=x.length;return t%29;});};
 /** Exact maximum top-four plaintext endpoint count over all state permutations and drifts. */
 function bound(w,rev,kind){const c=ends(w,rev),t=clocks(w,kind);let best=-1,bestD=-1,stationary=0;
 for(let d=0;d<29;d++){const rows=Array.from({length:29},()=>new Uint16Array(29));for(let i=1;i<c.length;i++)rows[c[i-1]][mod(c[i]-d*t[i])]++;const n=maxRows(rows);if(d===0)stationary=n;if(n>best){best=n;bestD=d;}}return{best,bestD,stationary};}
 /** Exhaustive low-digit inference: factor the search into 841 drift/feedback pairs and 812 affine singleton masks. */
 function infer(w,rev,kind){const c=ends(w,rev),t=clocks(w,kind),anchors=w.map((x,i)=>x.length===1&&i>0?i:-1).filter(x=>x>=0);let minTypes=29,keys=[],best=null;
 for(let b=0;b<29;b++)for(let d=0;d<29;d++){let mask=0;for(const i of anchors)mask|=1<<mod(c[i]-b*c[i-1]-d*t[i]);let count=0;for(let k=mask;k;k&=k-1)count++;if(count<minTypes)minTypes=count;if(count>singleton.length)continue;
 for(const {a,e,mask:m} of allowedMasks)if((mask&~m)===0){keys.push({a,b,d,e});const row=new Uint16Array(29);for(let i=1;i<c.length;i++)row[mod(c[i]-b*c[i-1]-d*t[i])]++;const score=top4(row);if(!best||score>best.score)best={a,b,d,e,score};}}
 return{anchors:anchors.length,minTypes,keyCount:keys.length,best,keys};}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 function draw(w,next){return w.map(x=>{const p=pool.get(x.length);if(!p?.length)throw Error("no native word length "+x.length);return p[next()%p.length];});}
 function controls(w,rev,seed){const next=rng(seed),v=[];for(let k=0;k<500;k++){let hist=new Uint16Array(29);for(const x of ends(draw(w,next),rev))hist[x]++;v.push(top4(hist));}return v;}
 const results=[];for(const [lo,hi] of [[0,55],[16,21],[40,53]]){const w=words.filter(x=>x.page>=lo&&x.page<=hi).map(x=>x.digits);
 for(const rev of [false,true]){const ctrl=controls(w,rev,0x50d8+lo);for(const kind of ["word","rune"]){const bb=bound(w,rev,kind),inf=infer(w,rev,kind);results.push({lo,hi,words:w.length,orientation:rev?"first":"last",clock:kind,...bb,controlMin:Math.min(...ctrl),controlMean:ctrl.reduce((a,b)=>a+b,0)/ctrl.length,controlsAtOrBelow:ctrl.filter(x=>x<=bb.best).length,anchors:inf.anchors,minTypes:inf.minTypes,keyCount:inf.keyCount,bestKey:inf.best});}}}
 const plantResults=[];const w=words.filter(x=>x.page>=40&&x.page<=53).map(x=>x.digits);
 function integer(ds){return ds.reduce((s,x)=>s*29n+BigInt(x),0n);}
 function digits(n,len){const out=[];for(let i=0;i<len;i++){out.unshift(Number(n%29n));n/=29n;}return out;}
 function inv(a,m){let x=1n;while((x*a)%29n!==1n)x++;while((a*x)%m!==1n){let p=29n;while((a*x)%p===1n&&p<m)p*=29n;const step=p/29n;while((a*x)%p!==1n)x+=step;}return x;}
 function encode(plain,t,key){let prev=3301n;return plain.map((p,i)=>{const m=29n**BigInt(p.length),c=(BigInt(key.a)*integer(p)+BigInt(key.b)*prev+BigInt(key.d)*BigInt(t[i])+BigInt(key.e))%m;prev=c;return digits(c,p.length);});}
 function decode(cipher,t,key){let prev=3301n;return cipher.map((ds,i)=>{const c=integer(ds),m=29n**BigInt(ds.length),p=((c-BigInt(key.b)*prev-BigInt(key.d)*BigInt(t[i])-BigInt(key.e))*inv(BigInt(key.a),m)%m+m)%m;prev=c;return digits(p,ds.length);});}
 for(const [j,kind] of ["word","rune","word"].entries()){
 const plain=draw(w,rng(0x50da+j)),t=clocks(plain,kind),key={a:7+j,b:19-j,d:3+5*j,e:11+j};
 const cipher=encode(plain,t,key),decoded=decode(cipher,t,key);
 if(JSON.stringify(decoded)!==JSON.stringify(plain)||JSON.stringify(encode(decoded,t,key))!==JSON.stringify(cipher))throw Error("plant replay");
 const found=infer(cipher,false,kind),bnd=bound(cipher,false,kind);
 const truePresent=found.keys.some(x=>Object.keys(key).every(k=>x[k]===key[k]));
 if(!truePresent||bnd.best<top4(ends(plain,false).reduce((h,x)=>(h[x]++,h),new Uint16Array(29))))throw Error("plant rejection");
 const exact=found.keys.filter(x=>x.b===key.b&&x.d===key.d).length;
 let prediction=null;if(found.keyCount===1){
 // This full-width prediction is conditional on the planted 0..28 coefficients and mod-29 clock, not on arbitrary coefficient lifts.
 const recovered=decode(cipher,t,found.keys[0]);let total=0,correct=0;
 for(let i=1;i<plain.length;i++)if(plain[i].length>1){total+=plain[i].length;correct+=plain[i].filter((x,k)=>x===recovered[i][k]).length;}
 if(total!==correct)throw Error("held-out nonsingleton prediction");prediction={total,correct};}
 plantResults.push({kind,key,replay:decoded.flat().length,anchorCount:found.anchors,keys:found.keyCount,correctDriverKeys:exact,correctKeyPresent:true,bestKey:found.best,bound:bnd.best,prediction});}
 return{singletons:singleton,sourceWords:words.length,sourceRunes:original.length,results,plants:plantResults};
}
const out = run(read("resources/liber-primus/lp2-transcription.txt"), JSON.parse(read("resources/liber-primus/lp2-corpus.json")), JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")));
console.log(JSON.stringify(out, null, 2));
