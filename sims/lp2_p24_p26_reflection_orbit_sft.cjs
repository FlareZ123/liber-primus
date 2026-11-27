'use strict';
/** Exact shared physical-line orbit additive receiver. Run separately by mode and F convention. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const specs={
 'resources/liber-primus/lp2-corpus.json':'054f2a0f780b7d46901acbe3d9bf4f0ac1801165',
 'resources/control/gibran_prophet_58585.txt':'df260a07d56bf5998d40a6360b6132c35c252d10',
 'resources/control/shakespeare_first300k.txt':'94c677ad9dd50771c6670e0c4e4dad9052b46d85',
 'resources/external/relikd-solved-gp29-native-v1.json':'1b064ef6d85819b7d96adaff31a82d1ec551598f',
 'resources/control/emerson_essays_2944.txt':'a92be8ba5b3511a003a22ba31523c14397aaa83a'
};
function read(p){const b=fs.readFileSync(path.join(root,p));assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),specs[p]);return b.toString('utf8')}
const corpus=JSON.parse(read(Object.keys(specs)[0])),t=corpus.translit;
const Gtext=read(Object.keys(specs)[1]);
/** @param {string} z @returns {number[]} */
function enc(z){const out=[];for(const w of z.toUpperCase().match(/[A-Z]+/g)||[]){const a=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(let j=0;j<a.length;){if(a.startsWith('ING',j)){out.push(21);j+=3;continue}if(a.startsWith('IO',j)){out.push(27);j+=2;continue}let b=t.findIndex(x=>x.length===2&&a.startsWith(x,j));if(b<0)b=t.indexOf(a[j]);if(b>=0)out.push(b);j+=b<0?1:t[b].length}}return out}
const G=enc(Gtext.split('*** START OF')[1].split('*** END')[0]),S=enc(read(Object.keys(specs)[2])),N=JSON.parse(read(Object.keys(specs)[3])).sections.flatMap(s=>Array.from(s.source_text,c=>corpus.runes.indexOf(c)).filter(x=>x>=0)),E=enc(read(Object.keys(specs)[4]));
assert.deepEqual([G.length,S.length,N.length,E.length],[47662,217106,2979,321327]);
const sum=a=>a.reduce((x,y)=>x+y,0),mod=x=>(x+29)%29,neg=-Infinity;
const u=Array(29).fill(.5),b=Array.from({length:29},()=>Array(29).fill(.5));G.forEach((x,i)=>{u[x]++;if(i)b[G[i-1]][x]++});const U=u.map(x=>Math.log(x/sum(u))),B=b.map(row=>row.map(x=>Math.log(x/sum(row))));
const lens=[[22,24,21,24,23,21,22,23,23,22,22,23],[22,22,24,23,23,23,24,23,21,24,23,21],[20,22,23,22,24,23,24,21,19,24,23,20]];
const mode=process.argv[2]||'fourfold',hold=process.argv[3]==='hold';
assert(['fourfold','halfturn'].includes(mode));
const width=(r,j,L)=>mode==='fourfold'?Math.min(j,L-1-j):r<6?j:L-1-j;
function rows(a,first=0,count=3){let i=0;return lens.slice(first,first+count).flatMap((ls,p)=>ls.map((L,r)=>{const c=a.slice(i,i+=L);assert.equal(c.length,L);return {p:p+first,r,q:Math.min(r,11-r),c,d:c.map((_,j)=>width(r,j,L))}}))}
const original=rows(corpus.pages.slice(24,27).flatMap(p=>p.indices));
function pval(c,k,h){if(h)return 0;const p=mod(c-k);return hold&&p===0?-1:p}
function rowScore(p){return U[p[0]]+p.slice(1).reduce((s,x,i)=>s+B[p[i]][x],0)}
/** @param {ReturnType<typeof rows>} rs */
function fit(rs){const keys=[],masks=[];let objective=0;
 for(let q=0;q<6;q++){const group=rs.filter(x=>x.q===q),W=1+Math.max(...group.flatMap(x=>x.d));let n=0;
 const meta=group.map(x=>({...x,bit:x.c.map(c=>hold&&c===0?n++:-1)}));let best=neg,bestKey,bestMask;
 for(let mask=0;mask<2**n;mask++){const a=Array.from({length:W},()=>new Float64Array(29)),e=Array.from({length:W-1},()=>new Float64Array(841));
  for(const r of meta){const v=r.c.map((c,j)=>Array.from({length:29},(_,k)=>pval(c,k,r.bit[j]>=0&&Math.floor(mask/2**r.bit[j])%2===1)));
   for(let j=0;j<v.length;j++){const d=r.d[j];for(let k=0;k<29;k++)if(v[j][k]<0)a[d][k]=neg;
    if(j===0){for(let k=0;k<29;k++)if(v[j][k]>=0)a[d][k]+=U[v[j][k]];continue}
    const prev=r.d[j-1];assert(Math.abs(prev-d)<=1);
    if(prev===d){for(let k=0;k<29;k++)if(v[j-1][k]>=0&&v[j][k]>=0)a[d][k]+=B[v[j-1][k]][v[j][k]];continue}
    const f=e[Math.min(prev,d)];for(let k=0;k<29;k++)for(let l=0;l<29;l++){const x=v[j-1][k],y=v[j][l];if(x>=0&&y>=0)f[prev<d?k*29+l:l*29+k]+=B[x][y]}
   }
  }
  let dp=Array.from(a[0]),back=[];for(let d=1;d<W;d++){const next=Array(29).fill(neg),prev=Array(29).fill(0);for(let l=0;l<29;l++)for(let k=0;k<29;k++){const z=dp[k]+e[d-1][k*29+l]+a[d][l];if(z>next[l]){next[l]=z;prev[l]=k}}dp=next;back.push(prev)}
  const val=Math.max(...dp);if(val>best){best=val;const k=[dp.indexOf(val)];for(let d=W-1;d>0;d--)k.unshift(back[d-1][k[0]]);bestKey=k;bestMask=mask}
 }
 assert(Number.isFinite(best));keys[q]=bestKey;masks[q]={mask:bestMask,n};objective+=best;
 }
 const decoded=rs.map(r=>{let bit=rs.filter(x=>x.q===r.q&&rs.indexOf(x)<rs.indexOf(r)).reduce((s,x)=>s+x.c.filter(c=>hold&&c===0).length,0);return r.c.map((c,j)=>pval(c,keys[r.q][r.d[j]],hold&&c===0&&Math.floor(masks[r.q].mask/2**bit++)%2===1))});
 assert(Math.abs(sum(decoded.map(rowScore))-objective)<1e-8);
 rs.forEach((r,i)=>r.c.forEach((c,j)=>assert.equal(c,hold&&decoded[i][j]===0?0:mod(decoded[i][j]+keys[r.q][r.d[j]]))));
 return {keys,masks,decoded,score:objective/sum(rs.map(r=>r.c.length))}
}
/** Frozen key; a previously unseen singleton address is relaxed to any plaintext. */
function held(rs,keys){let total=0,decoded=[];for(const r of rs){const candidates=r.c.map((c,j)=>{const k=keys[r.q][r.d[j]];if(k===undefined)return Array.from({length:29},(_,i)=>i);const a=[];if(hold&&c===0)a.push(0);const x=pval(c,k,false);if(x>=0)a.push(x);return a});
 const bad=candidates.findIndex(x=>!x.length);if(bad>=0)return {failure:{page:r.p+24,row:r.r,j:bad,c:r.c[bad],k:keys[r.q][r.d[bad]]}};
 let dp=candidates[0].map(x=>({x,score:U[x],p:[x]}));for(const cs of candidates.slice(1))dp=cs.map(y=>{let best;for(const v of dp){const score=v.score+B[v.x][y];if(!best||score>best.score)best={x:y,score,p:[...v.p,y]}}return best});const best=dp.reduce((x,y)=>x.score>=y.score?x:y);total+=best.score;decoded.push(best.p)}
 return {score:total/sum(rs.map(r=>r.c.length)),decoded}}
function scan(a,ls,threshold){const starts=[0];for(const l of ls.flat())starts.push(starts.at(-1)+l);const n=starts.pop(),pref=[0];for(let i=1;i<a.length;i++)pref.push(pref.at(-1)+B[a[i-1]][a[i]]);let min=Infinity,survivors=[];
 for(let k=0;k<=a.length-n;k++){let v=pref[k+n-1]-pref[k]+U[a[k]];for(const d of starts.slice(1))v+=U[a[k+d]]-B[a[k+d-1]][a[k+d]];v/=n;min=Math.min(min,v);if(v<=threshold+1e-10)survivors.push({start:k,score:v})}return {count:a.length-n+1,min,survivors}}
function conflict(a){const map=new Map();for(const [i,r] of rows(a).entries()){const c=original[i].c;for(let j=0;j<c.length;j++){const p=r.c[j];if(hold&&p===0){if(c[j]!==0)return {page:r.p+24,row:r.r,j,reason:'literal F mismatch'};continue}const id=r.q+':'+r.d[j],k=mod(c[j]-p);if(map.has(id)&&map.get(id)!==k)return {page:r.p+24,row:r.r,j,orbit:id,existing:map.get(id),needed:k};map.set(id,k)}}return null}
const trained=fit(original.slice(0,24)),prediction=held(original.slice(24),trained.keys),all=mode==='halfturn'?fit(original):null,threshold=(all||trained).score,ls=all?lens:lens.slice(0,2);
const reference=Object.fromEntries([['Shakespeare',S],['native',N],['Emerson',E]].map(([name,a])=>{const s=scan(a,ls,threshold);if(all)s.survivors.forEach(x=>x.conflict=conflict(a.slice(x.start,x.start+808)));return [name,s]}));
console.log(JSON.stringify({mode,hold,trained,prediction,all,reference},null,2));
