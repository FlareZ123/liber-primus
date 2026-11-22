'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const shakespeare=fs.readFileSync(path.join(root,'resources/control/shakespeare_first300k.txt'),'utf8');
const M=29,pages=corpus.pages.filter(p=>p.page>=33&&p.page<=39).map(p=>p.indices);
const vis=[pages[0].slice(91),...pages.slice(1)],order=[0,6,2,5,1,4,3],rank=order.map((_,i)=>order.indexOf(i));
assert.equal(pages.length,7);assert.equal(pages.flat().length,1680);assert.equal(vis.flat().length,1589);
function dec(a,o){const cols=new Array(7);let z=0;for(const i of o){const n=Math.floor(a.length/7)+Number(i<a.length%7);cols[i]=a.slice(z,z+n);z+=n;}const out=[];for(let r=0;r<Math.ceil(a.length/7);r++)for(let c=0;c<7;c++)if(r<cols[c].length)out.push(cols[c][r]);return out;}
function enc(a,o){const cols=Array.from({length:7},()=>[]);a.forEach((v,i)=>cols[i%7].push(v));return o.flatMap(i=>cols[i]);}
function inter(rows,o){const out=[],n=Math.max(...rows.map(x=>x.length));for(let r=0;r<n;r++)for(const c of o)if(r<rows[c].length)out.push(rows[c][r]);return out;}
const di={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28},le={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
function gp(t){const s=t.toUpperCase().replace(/[^A-Z]/g,''),out=[];for(let i=0;i<s.length;i++){const d=di[s.slice(i,i+2)];if(d!==undefined){out.push(d);i++;}else out.push(le[s[i]]);}return out;}
const ref=gp(shakespeare),train=ref.slice(0,160000),u=new Float64Array(M),biC=new Float64Array(M*M),trC=new Float64Array(M*M*M);
for(let i=0;i<train.length;i++){u[train[i]]++;if(i)biC[train[i-1]*M+train[i]]++;if(i>1)trC[(train[i-2]*M+train[i-1])*M+train[i]]++;}
const ul=new Float64Array(M),bl=new Float64Array(M*M),tl=new Float64Array(M*M*M);
for(let x=0;x<M;x++)ul[x]=Math.log((u[x]+1)/(train.length+M));
for(let a=0;a<M;a++)for(let x=0;x<M;x++)bl[a*M+x]=Math.log((biC[a*M+x]+12*Math.exp(ul[x]))/(u[a]+12));
for(let a=0;a<M;a++)for(let q=0;q<M;q++)for(let x=0;x<M;x++){const j=(a*M+q)*M+x;tl[j]=Math.log((trC[j]+9*Math.exp(bl[q*M+x]))/(biC[a*M+q]+9));}
function score(a){let z=ul[a[0]]+bl[a[0]*M+a[1]];for(let i=2;i<a.length;i++)z+=tl[(a[i-2]*M+a[i-1])*M+a[i]];return z/a.length;}
function cand(ps,vs){const f=ps.flat(),v=vs.flat();return [['whole_column',dec(f,order)],['whole_rank',dec(f,rank)],['illustrated_column',dec(v,order)],['illustrated_rank',dec(v,rank)],['perpage_column',ps.flatMap(p=>dec(p,order))],['perpage_rank',ps.flatMap(p=>dec(p,rank))],['interleave_column',inter(vs,order)],['interleave_rank',inter(vs,rank)]];}
const render=a=>a.slice(0,140).map(i=>corpus.translit[i]).join('');
const original=cand(pages,vis).map(([name,a])=>({name,runes:a.length,score:score(a),preview:render(a)})).sort((a,b)=>b.score-a.score);
let seed=0x1736254;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}function rot(a,k){k%=a.length;return a.slice(k).concat(a.slice(0,k));}
const nullMax=[];for(let t=0;t<2000;t++){const p=pages.map(a=>rot(a,rnd()%a.length)),v=vis.map(a=>rot(a,rnd()%a.length));nullMax.push(Math.max(...cand(p,v).map(([,a])=>score(a))));}
const obs=original[0].score,ge=nullMax.filter(x=>x>=obs).length;nullMax.sort((a,b)=>a-b);
const plain=ref.slice(175000,176680),crypt=enc(plain,order),recovered=dec(crypt,order);assert.deepEqual(recovered,plain);
const result={classification:'bounded historical seven-column transfer negative; no plaintext recovered',historicalKey:'1736254',original,familywiseMatchedNull:{seed:'0x1736254',trials:2000,observedMax:obs,nullAtLeastObserved:ge,plusOneP:(ge+1)/2001,median:nullMax[1000],percentile95:nullMax[1900],maximum:nullMax[1999]},trueKeyPlant:{runes:plain.length,plaintextScore:score(plain),transposedScore:score(crypt),recoveredScore:score(recovered),exactRecovery:true}};
assert.equal(original[0].name,'perpage_rank');assert.ok(Math.abs(obs+6.125819971911548)<1e-12);assert.equal(ge,596);assert.ok(Math.abs(result.trueKeyPlant.recoveredScore+2.441917214538632)<1e-12);
console.log(JSON.stringify(result,null,2));
