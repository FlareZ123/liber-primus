'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),M=29,mod=x=>((x%M)+M)%M;
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const pages=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').split(/\n%\s*\n/);
const reference=fs.readFileSync(path.join(root,'resources/liber-primus/lp1-plaintext-reference.txt'),'utf8');
const page=n=>corpus.pages.find(p=>p.page===n).indices,p7=page(7),p8=page(8),p57=page(57);
assert.equal(p7.length,208);assert.equal(p8.length,255);assert.equal(p57.length,95);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
function wordsOn(n){const pg=ink.pages.find(p=>p.page===n),out=[];let offset=0,start=0,run=[];function flush(){if(!run.length)return;const s=(pg.red_spans||[]).find(x=>start>=x.start&&start+run.length<=x.start+x.length);if(s)out.push({page:n,start,spanStart:s.start,indices:run,text:run.map(i=>corpus.translit[i]).join(''),product:run.reduce((v,i)=>mod(v*i),1)});run=[];}for(const ch of pages[n]){const i=runeIndex.get(ch);if(i!==undefined){if(!run.length)start=offset;run.push(i);offset++;}else if(ch==='-'||ch==='.')flush();}flush();return out;}
const words=Array.from({length:56},(_,n)=>wordsOn(n)).flat();assert.equal(words.length,50);
const five=[];for(const pg of ink.pages)if(pg.page<=55)for(const s of pg.red_spans||[]){const ws=words.filter(w=>w.page===pg.page&&w.spanStart===s.start&&w.start>=s.start&&w.start+w.indices.length<=s.start+s.length);if(ws.length===5)five.push({page:pg.page,start:s.start,products:ws.map(w=>w.product)});}
assert.deepEqual(five,[{page:7,start:194,products:[11,26,8,15,2]}]);
const w7=words.filter(w=>w.page===7),w8=words.filter(w=>w.page===8);
const p7Products=w7.map(w=>w.product),p8Products=w8.map(w=>w.product);
assert.deepEqual(p7Products,[11,26,8,15,2]);assert.deepEqual(p8Products,[4,3]);
assert.deepEqual(w7.map(w=>w.indices),[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]]);
assert.deepEqual(w8.map(w=>w.indices),[[14,10,14,19],[1,14,19,5,2,13,3,17]]);
const rm={I:1,U:5,X:10,L:50,C:100,D:500,M:1000};
function rv(s){let v=0;for(let i=0;i<s.length;i++){if(rm[s[i]]===undefined)return null;const a=rm[s[i]],b=rm[s[i+1]]||0;v+=a<b?-a:a;}return v;}
function rc(n){if(n<1||n>28)return null;let s='';for(const [v,t] of [[10,'X'],[9,'IX'],[5,'U'],[4,'IV'],[1,'I']])while(n>=v){s+=t;n-=v;}return s;}
const roman=[];for(const w of words)for(let k=3;k<w.text.length;k++){const a=w.text.slice(0,k),b=w.text.slice(k),n=rv(a);if(n!==null&&n>=1&&n<=28&&rc(n)===a&&b.length===1&&w.indices[k]===n)roman.push({page:w.page,start:w.start,word:w.text,roman:a,value:n});}
assert.deepEqual(roman,[{page:8,start:0,word:'XIXM',roman:'XIX',value:19}]);
const y=w8[1].indices[0],firstBlack=p8[12],secret=p7Products[4],points=[[0,secret],[p8Products[1],y],[p8Products[0],y],[roman[0].value,y],[firstBlack,y]];
assert.deepEqual(points,[[0,2],[3,1],[4,1],[19,1],[27,1]]);
const trim=a=>{while(a.length>1&&a[a.length-1]===0)a.pop();return a.length?a:[0];};
const add=(a,b)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>mod((a[i]||0)+(b[i]||0))));
const sub=(a,b)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>mod((a[i]||0)-(b[i]||0))));
const mul=(a,b)=>{const o=Array(a.length+b.length-1).fill(0);for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)o[i+j]=mod(o[i+j]+a[i]*b[j]);return trim(o);};
const inv=a=>{for(let i=1;i<M;i++)if(mod(i*a)===1)return i;throw Error('noninvertible');};
const evalP=(a,x)=>{let v=0,p=1;for(const c of a){v=mod(v+c*p);p=mod(p*x);}return v;};
function interpolate(ps){let out=[0];for(let i=0;i<ps.length;i++){const [x,y]=ps[i];let b=[1],d=1;for(let j=0;j<ps.length;j++)if(j!==i){b=mul(b,[mod(-ps[j][0]),1]);d=mod(d*(x-ps[j][0]));}out=add(out,b.map(v=>mod(v*y*inv(d))));}return out;}
const fcoef=interpolate(points);assert.deepEqual(fcoef,[2,15,8,26,11]);assert.deepEqual(fcoef.slice().reverse(),p7Products);
const f=x=>evalP(fcoef,mod(x)),roots=Array.from({length:29},(_,x)=>x).filter(x=>f(x)===1);assert.deepEqual(roots,[3,4,19,27]);
const q=fcoef.slice();q[0]=mod(q[0]-1);let prod=[1];for(const r of roots)prod=mul(prod,[mod(-r),1]);assert.deepEqual(prod.map(v=>mod(11*v)),q);
assert.equal(f(0),2);assert.equal(p8.length-12,243);
const alpha=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function toGP(w){const s=w.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA'),o=[];for(let i=0;i<s.length;){const m=alpha.find(e=>s.startsWith(e.s,i));if(!m)return null;o.push(m.i);i+=m.s.length;}return o;}
const training=[];for(const p of reference.split(/\n\s*\n/)){const seq=[];for(const w of p.split('\n').filter(l=>!l.trim().startsWith('#')&&!l.trim().startsWith('[')).join(' ').match(/[A-Za-z]+/g)||[]){const v=toGP(w);if(v)seq.push(...v);}if(seq.length>=3)training.push(seq);}assert.ok(training.length);
const tri=new Map();let total=0;for(const s of training)for(let i=2;i<s.length;i++){const k=s.slice(i-2,i+1).join(',');tri.set(k,(tri.get(k)||0)+1);total++;}
const den=total+0.1*29**3;
function score(s){let v=0;for(let i=2;i<s.length;i++)v+=Math.log(((tri.get(s.slice(i-2,i+1).join(','))||0)+0.1)/den);return v/(s.length-2);}
function ioc(s){const c=Array(29).fill(0);for(const v of s)c[v]++;return c.reduce((a,v)=>a+v*(v-1),0)/(s.length*(s.length-1));}
const native=[];for(const s of training)for(let i=0;i+243<=s.length;i++)native.push(score(s.slice(i,i+243)));assert.ok(native.length);
const minNative=Math.min(...native),sorted=native.slice().sort((a,b)=>a-b),medianNative=sorted[Math.floor(sorted.length/2)];
const body=p8.slice(12),plant=Array.from({length:243},(_,i)=>p57[i%95]);
function record(name,out,ok){const sc=score(out);assert.equal(out.length,243);assert.equal(ok,true,name+' positive plant');assert.ok(sc<minNative);return {name,ioc:ioc(out),trigram:sc,first60:out.slice(0,60).map(i=>corpus.translit[i]).join('')};}
const results=[];
for(const start of [0,12]){const key=Array.from({length:243},(_,i)=>f(start+i));for(const sign of [-1,1]){const out=body.map((c,i)=>mod(c-sign*key[i])),enc=plant.map((p,i)=>mod(p+sign*key[i])),dec=enc.map((c,i)=>mod(c-sign*key[i]));results.push(record('poly-pad-'+start+'-'+sign,out,dec.every((v,i)=>v===plant[i])));}}
const pow=(a,n)=>{let v=1;for(let i=0;i<n;i++)v=mod(v*a);return v;};
const sumKey=Array.from({length:243},(_,n)=>roots.reduce((s,r)=>mod(s+pow(r,n)),0));for(let i=0;i+28<243;i++)assert.equal(sumKey[i],sumKey[i+28]);
for(const sign of [-1,1]){const out=body.map((c,i)=>mod(c-sign*sumKey[i])),enc=plant.map((p,i)=>mod(p+sign*sumKey[i])),dec=enc.map((c,i)=>mod(c-sign*sumKey[i]));results.push(record('power-sum-'+sign,out,dec.every((v,i)=>v===plant[i])));}
const rec=[19,4,3,27];while(rec.length<243){const n=rec.length;rec.push(mod(-5*rec[n-1]-6*rec[n-2]-4*rec[n-3]-8*rec[n-4]));}for(let i=0;i+28<243;i++)assert.equal(rec[i],rec[i+28]);
for(const sign of [-1,1]){const out=body.map((c,i)=>mod(c-sign*rec[i])),enc=plant.map((p,i)=>mod(p+sign*rec[i])),dec=enc.map((c,i)=>mod(c-sign*rec[i]));results.push(record('root-recurrence-'+sign,out,dec.every((v,i)=>v===plant[i])));}
function div(a,b){let r=trim(a.slice()),z=Array(Math.max(1,a.length-b.length+1)).fill(0),li=inv(b[b.length-1]);while(r.length>=b.length&&!(r.length===1&&r[0]===0)){const d=r.length-b.length,c=mod(r[r.length-1]*li);z[d]=c;for(let j=0;j<b.length;j++)r[d+j]=mod(r[d+j]-c*b[j]);r=trim(r);}return {q:trim(z),r:trim(r)};}
const ring=Array(244).fill(0);ring[0]=28;ring[243]=1;let r0=ring.slice(),r1=q.slice(),s0=[0],s1=[1];
while(!(r1.length===1&&r1[0]===0)){const d=div(r0,r1),nr=d.r,ns=sub(s0,mul(d.q,s1));r0=r1;r1=nr;s0=s1;s1=ns;}
assert.equal(r0.length,1);const gcd=r0[0],iq=div(s0.map(v=>mod(v*inv(gcd))),ring).r;
function cyclic(a,s){const o=Array(243).fill(0);for(let j=0;j<a.length;j++)for(let i=0;i<243;i++)o[(i+j)%243]=mod(o[(i+j)%243]+a[j]*s[i]);return o;}
const check=cyclic(q,iq.concat(Array(243-iq.length).fill(0)));assert.equal(check[0],1);assert.ok(check.slice(1).every(v=>v===0));
const e1=cyclic(q,plant),d1=cyclic(iq,e1);assert.deepEqual(d1,plant);results.push(record('cyclic-Q-inverse',cyclic(iq,body),d1.every((v,i)=>v===plant[i])));
const e2=cyclic(iq,plant),d2=cyclic(q,e2);assert.deepEqual(d2,plant);results.push(record('cyclic-Q',cyclic(q,body),d2.every((v,i)=>v===plant[i])));
function matrixInv(A){const n=A.length,W=A.map((r,i)=>r.map(mod).concat(Array.from({length:n},(_,j)=>Number(i===j))));for(let c=0;c<n;c++){const k=W.findIndex((r,i)=>i>=c&&r[c]!==0);if(k<0)throw Error('singular');[W[c],W[k]]=[W[k],W[c]];const u=inv(W[c][c]);W[c]=W[c].map(v=>mod(v*u));for(let r=0;r<n;r++)if(r!==c){const f=W[r][c];for(let j=0;j<2*n;j++)W[r][j]=mod(W[r][j]-f*W[c][j]);}}return W.map(r=>r.slice(n));}
const vand=xs=>xs.map(x=>Array.from({length:xs.length},(_,j)=>pow(x,j))),mv=(A,v)=>A.map(r=>mod(r.reduce((s,a,j)=>s+a*v[j],0)));
const order=[19,4,3,27],v4=vand(order),iv4=matrixInv(v4),v3=vand(order.slice(0,3)),iv3=matrixInv(v3);
function blocks(s,A4,A3){const o=[];for(let i=0;i<240;i+=4)o.push(...mv(A4,s.slice(i,i+4)));o.push(...mv(A3,s.slice(240,243)));return o;}
const b1=blocks(body,iv4,iv3),en1=blocks(plant,v4,v3),de1=blocks(en1,iv4,iv3);assert.deepEqual(de1,plant);results.push(record('vandermonde-inverse',b1,de1.every((v,i)=>v===plant[i])));
const b2=blocks(body,v4,v3),en2=blocks(plant,iv4,iv3),de2=blocks(en2,v4,v3);assert.deepEqual(de2,plant);results.push(record('vandermonde-forward',b2,de2.every((v,i)=>v===plant[i])));
assert.equal(results.length,12);
console.log(JSON.stringify({fiveWordSpans,p7Products,p8Products,romanHits,points,polynomialAscending:polynomial,rootsForOne:roots,native243WindowCount:native.length,native243Min:minNative,native243Median:medianNative,cyclicGcd:gcd,receivers:results},null,2));
