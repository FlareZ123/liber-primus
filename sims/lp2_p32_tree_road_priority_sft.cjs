"use strict";
/** Frozen p55 edited-tree road-priority route on p32 core and p33 body; Node 22. */
const fs=require("node:fs"),path=require("node:path");
function run(corpus, gcText, stockText, ref) {
  /** @param {string} text @param {number} h @param {number} w */
  function raster(text,h,w){
    const a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let b=[],v=0,n=0;for(const c of text.replace(/\s/g,"")){if(c==="=")break;let z=a.indexOf(c);if(z<0)throw Error("base64");v=v*64+z;n+=6;if(n>=8){n-=8;b.push(v>>n);v&=(1<<n)-1}}
    const out=new Uint8Array(h*w);let k=0,shift=0,num=0,bit=0;
    for(const x of b){num|=(x&127)<<shift;if(x&128){shift+=7;continue}if(bit)out.fill(1,k,k+num);k+=num;num=shift=0;bit^=1}
    if(k!==out.length)throw Error("mask size "+k);
    for(let i=w;i<out.length;i++)out[i]^=out[i-w];return out;
  }
  /** @param {Uint8Array|Float64Array} a @param {number} w @param {number} h @param {number} x @param {number} y */
  function sample(a,w,h,x,y){const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j;if(i<0||j<0||i>=w-1||j>=h-1)return 0;const t=j*w+i;return (a[t]*(1-u)+a[t+1]*u)*(1-v)+(a[t+w]*(1-u)+a[t+w+1]*u)*v}
  const gc=raster(gcText,192,199),stock0=raster(stockText,210,160);
  const stock=Float64Array.from(stock0,(_,i)=>stock0[Math.floor(i/160)*160+159-i%160]);
  const mapped=Float64Array.from(stock,(_,i)=>sample(gc,199,192,(i%160+6.269179940310348)/.8434580498835607,(Math.floor(i/160)-45.459292324694964)/.8444254856468015));
  const p32=corpus.pages[32].indices, p33=corpus.pages[33].indices.slice(10,91), prime=corpus.prime;
  const cumulative=x=>[0,...x.map((_,i)=>x.slice(0,i+1).reduce((s,t)=>s+t,0))];
  const x=cumulative(p32.slice(0,11).map(i=>prime[i])),y=cumulative(Array.from({length:11},(_,i)=>prime[p32[i*11]]));
  if(x[11]!==563||y[11]!==569||p33.length!==81)throw Error("source dimensions");
  const K=Array.from({length:81},(_,i)=>p32[(Math.floor(i/9)+1)*11+i%9+1]);
  const root=8*9+3;
  if(corpus.translit[K[root]]!=="N"||corpus.translit[K[root-9]]!=="M"||!["NG","ING"].includes(corpus.translit[K[root-18]]))throw Error("root sequence");
  const fits=[[201.25,256.25,1.05,1.05],[200.25,255.25,1.05,1.05]];
  /** @param {Float64Array} mask @param {number[]} fit */
  function tileCounts(mask,fit){const [cx,cy,sx,sy]=fit;const out=[];for(let r=1;r<=9;r++)for(let c=1;c<=9;c++){let count=0;for(let j=y[r];j<y[r+1];j++)for(let i=x[c];i<x[c+1];i++)if(sample(mask,160,210,(i-cx)/sx,(j-cy)/sy)>=.5)count++;out.push(count)}return out}
  /** Dijkstra lexicographic path: first background tile entries, then distance, then compass steps. @param {boolean[]} active @param {boolean} eastFirst */
  function route(active,eastFirst){const moves=eastFirst?[[-1,0],[0,1],[0,-1],[1,0]]:[[-1,0],[0,-1],[0,1],[1,0]],best=Array(81).fill(null),done=new Set(),out=[];
    best[root]=[0,0,""];
    const cmp=(a,b)=>a[0]-b[0]||a[1]-b[1]||(a[2]<b[2]?-1:a[2]>b[2]?1:0);
    while(out.length<81){let u=-1;for(let i=0;i<81;i++)if(!done.has(i)&&best[i]&&(u<0||cmp(best[i],best[u])<0))u=i;if(u<0)throw Error("disconnected");
      done.add(u);out.push(u);const row=Math.floor(u/9),col=u%9;
      for(let j=0;j<4;j++){const rr=row+moves[j][0],cc=col+moves[j][1];if(rr<0||rr>=9||cc<0||cc>=9)continue;const v=rr*9+cc;if(done.has(v))continue;const q=[best[u][0]+Number(!active[v]),best[u][1]+1,best[u][2]+j];if(!best[v]||cmp(q,best[v])<0)best[v]=q}
    }return out;
  }
  const masks={},routes=[];
  for(const [name,mask] of [["edited",mapped],["stock",stock]]){
    const cs=fits.map(f=>tileCounts(mask,f));masks[name]=cs;
    for(let j=0;j<2;j++)for(const e of [false,true])routes.push({name:`${name}-${j}-${e?"E":"W"}`,q:route(cs[j].map(n=>n>0),e)});
  }
  const edits=routes.filter(a=>a.name.startsWith("edited"));
  const mod=x=>(x%29+29)%29,alphabet=corpus.translit,render=a=>a.map(i=>alphabet[i]).join(" ");
  // Native source text only; exclude sections for solved LP2 p56/p57 and editorial lines.
  const native=ref.split(/^### /m).slice(1).filter(s=>!/^(56|57|73|74)\b/.test(s)).map(s=>s.split("\n").slice(1).filter(l=>!/^\s*\[|^\s*#|^\s*\(continued/i.test(l)).join("\n")).join("\n");
  const dict=Object.fromEntries(alphabet.map((s,i)=>[s.toUpperCase(),i]));dict.ING=dict.NG??dict.ING;dict.IO=dict.IA??dict.IO;
  const tokens=Object.keys(dict).filter(k=>dict[k]!==undefined).sort((a,b)=>b.length-a.length);
  function tokenize(t){const out=[];for(let word of t.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){const s=tokens.find(k=>word.startsWith(k,i));if(!s){i++;continue}out.push(dict[s]);i+=s.length}}return out}
  const train=tokenize(native),one=new Float64Array(29),two=new Float64Array(29**2),three=new Float64Array(29**3);
  for(let i=0;i<train.length;i++){one[train[i]]++;if(i>0)two[train[i-1]*29+train[i]]++;if(i>1)three[(train[i-2]*29+train[i-1])*29+train[i]]++}
  const prob=(a,b,c)=>{const u=(one[c]+.5)/(train.length+14.5);const p=(two[b*29+c]+8*u)/(one[b]+8);return (three[(a*29+b)*29+c]+8*p)/(two[a*29+b]+8)};
  function score(seq,lo=2,hi=seq.length){let s=0;for(let i=Math.max(2,lo);i<hi;i++)s+=Math.log(prob(seq[i-2],seq[i-1],seq[i]));return s/(hi-Math.max(2,lo))}
  const recipes=[];for(const {name,q} of routes)for(const mode of ["key","receiver"])for(const basis of ["ordinal","prime"])for(const sign of [-1,1]){
    const key=K.map(v=>basis==="prime"?prime[v]%29:v);recipes.push({name,mode,basis,sign,q,key});
  }
  function decipher(c,a){return a.mode==="key"?c.map((v,i)=>mod(v-a.sign*a.key[a.q[i]])):a.q.map((v,i)=>mod(c[v]-a.sign*a.key[i]));}
  function encipher(p,a){if(a.mode==="key")return p.map((v,i)=>mod(v+a.sign*a.key[a.q[i]]));const out=Array(81);for(let i=0;i<81;i++)out[a.q[i]]=mod(p[i]+a.sign*a.key[i]);return out;}
  function test(c,subset){return subset.map(a=>{const p=decipher(c,a);if(encipher(p,a).some((v,i)=>v!==c[i]))throw Error("replay");return {name:a.name,mode:a.mode,basis:a.basis,sign:a.sign,fit:score(p,2,54),hold:score(p,54),total:score(p),p,render:render(p)}}).sort((a,b)=>b.fit-a.fit)}
  const p57=corpus.pages[57].indices.slice(0,81);let primes=[];for(let n=2;primes.length<100;n++){if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n)}
  let k=0;const p56=corpus.pages[56].indices.map((v,i)=>i===56?0:mod(v-primes[k++]+1)).slice(0,81);
  const plants=[p57,p56].map((p,i)=>{const a=recipes.find(x=>x.name===`edited-${i}-${i?"E":"W"}`&&x.mode===(i?"receiver":"key")&&x.basis===(i?"prime":"ordinal")&&x.sign===1);const c=encipher(p,a),z=test(c,recipes);return {truth:{name:a.name,mode:a.mode,basis:a.basis,sign:a.sign},native:render(p),nativeScore:score(p),top:z[0],accuracy:z[0].p.filter((v,j)=>v===p[j]).length,truthRank:1+z.findIndex(x=>x.p.every((v,j)=>v===p[j]))}});
  const result=test(p33,recipes);
  return {train:train.length,root,maskCounts:masks,routeData:routes.map(a=>({name:a.name,q:a.q,head:render(a.q.slice(0,12).map(i=>K[i]))})),sameMask:masks.edited[0].map((n,i)=>(n>0)===(masks.edited[1][i]>0)).filter(Boolean).length,plants,originalBestEdited:result.filter(x=>x.name.startsWith("edited"))[0],originalBestStock:result.filter(x=>x.name.startsWith("stock"))[0],originalTotalBest:result.slice().sort((a,b)=>b.total-a.total)[0],all:result.map(({p,render,...v})=>v),rawScore:score(p33)};
}
const root=path.resolve(__dirname,"..");
const [corpus,gc,stock,ref]=["resources/liber-primus/lp2-corpus.json","im-results/lp2-p55-contour-inverse-mask.b64","im-results/lp2-tree-common-stock-mask.b64","resources/liber-primus/lp1-plaintext-reference.txt"].map(p=>fs.readFileSync(path.join(root,p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(corpus),gc,stock,ref),null,2));
