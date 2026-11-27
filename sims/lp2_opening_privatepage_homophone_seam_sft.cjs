/** Exact disjoint histogram partition and contiguous private-page donor seams. */
const fs=require('node:fs');const crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const pins=["054f2a0f780b7d46901acbe3d9bf4f0ac1801165","df260a07d56bf5998d40a6360b6132c35c252d10","a92be8ba5b3511a003a22ba31523c14397aaa83a","94c677ad9dd50771c6670e0c4e4dad9052b46d85","1b064ef6d85819b7d96adaff31a82d1ec551598f"];
const data=paths.map((p,i)=>{const s=fs.readFileSync(p);const h=crypto.createHash('sha1').update('blob '+s.length+'\0').update(s).digest('hex');if(h!==pins[i])throw Error('pin mismatch '+p);return s.toString('utf8');});
function experiment(data,controlsOnly=false){
 const c=JSON.parse(data[0]),m=new Map(c.translit.map((x,i)=>[x,i]));
 function encode(s,reg){if(reg==="AZ")return [...s.toUpperCase().replace(/[^A-Z]/g,"")].map(x=>x.charCodeAt(0)-65);const cmp=reg==="GP29"?["ING","TH","NG","EO","OE","AE","IA","EA"]:["ING","TH","NG","AE","IA","EA"],a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const t=cmp.find(x=>w.startsWith(x,j))||w[j],v=m.get(t==="ING"?"NG":t);if(v===undefined)throw Error(t);a.push(v);j+=t.length;}}return a;}
 function count(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h;}
 function subset(b,n){const ok=new Uint8Array(n+1);ok[0]=1;for(const x of b)if(x>0)for(let i=n;i>=x;i--)ok[i]|=ok[i-x];return ok;}
 function exact(b,t){
  const a=b.filter(x=>x>0).sort((a,b)=>a-b),z=t.filter(x=>x>0).sort((a,b)=>a-b),s=[],q=[];
  if(a.length<z.length||a.reduce((u,v)=>u+v,0)!==z.reduce((u,v)=>u+v,0))return false;
  let i=0,j=0;while(i<a.length&&j<z.length){if(a[i]===z[j]){i++;j++;}else if(a[i]<z[j])s.push(a[i++]);else q.push(z[j++]);}
  s.push(...a.slice(i));q.push(...z.slice(j));
  if(s.length<2*q.length)return false;
  if(!q.length)return s.length===0;
  const memo=new Set();
  function go(i,b){
   if(i===q.length)return b.length===0;
   const t=q[i],k=q.length-i;
   if(b.length<2*k||b[0]+b[1]>t||b[b.length-1]>q[q.length-1])return false;
   if(k===1)return true;
   const key=i+"|"+b.join(",");if(memo.has(key))return false;
   let smallSum=0,cut=0;for(;cut<b.length&&b[cut]<t;cut++)smallSum+=b[cut];if(smallSum<t)return false;
   const picks=[];
   function choose(start,left){
    if(left===0){const set=new Set(picks);return go(i+1,b.filter((_,j)=>!set.has(j)));}
    if(b.length-picks.length<=2*(k-1))return false;
    for(let j=start;j<cut&&b[j]<=left;j++){
     if(j>start&&b[j]===b[j-1])continue;
     picks.push(j);if(choose(j+1,left-b[j]))return true;picks.pop();
    }return false;
   }
   if(choose(0,t))return true;memo.add(key);return false;
  }
  return go(0,s);
 }
 function brute(b,t){const z=t.filter(x=>x>0).slice();function go(i){if(i===b.length)return z.every(x=>x===0);for(let j=0;j<z.length;j++)if(z[j]>=b[i]){z[j]-=b[i];const ok=go(i+1);z[j]+=b[i];if(ok)return true;}return false;}return go(0);}
 let seed=3301;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
 for(let i=0;i<2000;i++){const b=Array.from({length:1+rand(9)},()=>1+rand(9)),t=Array.from({length:1+rand(6)},()=>0);for(const x of b)t[rand(t.length)]+=x;if(i%2&&t.length>1&&t[0]){t[0]--;t[1]++;}if(exact(b,t)!==brute(b,t))throw Error("exact oracle "+JSON.stringify({b,t}));}
 const p=c.pages.slice(0,3).map(x=>x.indices),refs=[];for(let i=1;i<=3;i++)for(const reg of ["AZ","GP27","GP29"])refs.push({donor:["gibran","emerson","shakespeare"][i-1],reg,a:encode(data[i],reg)});
 const native=JSON.parse(data[4]),ix=new Map(native.runes.map((x,i)=>[x,i]));for(const [i,s] of native.sections.entries())refs.push({donor:"solved"+i,reg:"nativeGP",a:[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x))});
 function prepare(h){return Array.from({length:h[0]+1},(_,d)=>{const b=h.slice();b[0]-=d;const n=b.reduce((a,x)=>a+x,0);return {d,b,n,s:subset(b,n),cache:new Map()};});}
 const p1=prepare(count(p[1])),p2=prepare(count(p[2]));
 function test(q,t){for(const x of t)if(!q.s[x])return false;const key=t.filter(x=>x>0).sort((a,b)=>a-b).join(",");let v=q.cache.get(key);if(v===undefined){v=exact(q.b,t);q.cache.set(key,v);}return v;}
 function at(a,start,options){
  const max=options[0].n,t=count(a.slice(start,start+max)),out=[];
  for(const q of options){if(start+q.n<=a.length&&test(q,t))out.push(q.d);const pos=start+q.n-1;if(pos<a.length)t[a[pos]]--;}
  return out;
 }
 const plants=[];
 for(const {donor,reg,a} of refs.slice(0,9)){
  const start=123,ns=[249,266,201],ds=[5,7,3],opts=[];let pos=start;
  for(let j=0;j<3;j++){
   const plain=a.slice(pos,pos+ns[j]-ds[j]);pos+=plain.length;
   const labels=[...new Set(plain)],syms=Array.from({length:29},(_,i)=>i);
   for(let k=28;k>0;k--){const z=rand(k+1);[syms[k],syms[z]]=[syms[z],syms[k]];}
   const chart=new Map(labels.map((x,k)=>[x,[syms[k]]]));
   for(let k=labels.length;k<29;k++)chart.get(labels[rand(labels.length)]).push(syms[k]);
   const cipher=plain.map(x=>{const v=chart.get(x);return v[rand(v.length)];}).concat(Array(ds[j]).fill(0));
   opts.push(prepare(count(cipher)));
  }
  let paths=0;for(const d0 of at(a,start,opts[0]))for(const d1 of at(a,start+ns[0]-d0,opts[1]))for(const d2 of at(a,start+ns[0]-d0+ns[1]-d1,opts[2]))if(d0===ds[0]&&d1===ds[1]&&d2===ds[2])paths++;
  if(paths!==1)throw Error("planted seam lost "+donor+" "+reg);
  plants.push({donor,reg,start,ds,paths});
 }
 if(controlsOnly)return {plants,oracleCases:2000};
 const rows=[];
 for(const full of [true,false]){
 const h=count(full?p[0]:p[0].slice(13)),opts=prepare(h);
 for(const {donor,reg,a} of refs){
  let windows=0,subsetPass=0,exactP0=0,exactP01=0,exactP012=0;const examples=[];
  for(const q of opts){if(a.length<q.n)continue;const t=new Int32Array(29);for(let j=0;j<q.n;j++)t[a[j]]++;let bad=0;for(const x of t)bad+=!q.s[x];
   for(let i=0;;i++){
    windows++;if(!bad){subsetPass++;if(test(q,[...t])){exactP0++;for(const d1 of at(a,i+q.n,p1)){exactP01++;for(const d2 of at(a,i+q.n+p1[d1].n,p2)){exactP012++;if(examples.length<5)examples.push({start:i,d0:q.d,d1,d2});}}}}
    if(i+q.n>=a.length)break;const k=a[i],l=a[i+q.n];if(k!==l){bad+=(!q.s[t[k]-1])-(!q.s[t[k]]);t[k]--;bad+=(!q.s[t[l]+1])-(!q.s[t[l]]);t[l]++;}
   }
  }
  rows.push({scope:full?"full":"black",donor,reg,windows,subsetPass,exactP0,exactP01,exactP012,examples});
 }
 }
 const summary=["full","black"].map(scope=>({scope,...Object.fromEntries(["windows","subsetPass","exactP0","exactP01","exactP012"].map(k=>[k,rows.filter(x=>x.scope===scope).reduce((a,x)=>a+x[k],0)]))}));
 return {summary,rows,oracleCases:2000,plants};
}
const out=experiment(data);const expected=[{scope:'full',windows:27641955,subsetPass:22924,exactP0:234,exactP01:0,exactP012:0},{scope:'black',windows:25801433,subsetPass:153792,exactP0:369,exactP01:0,exactP012:0}];if(JSON.stringify(out.summary)!==JSON.stringify(expected))throw Error('unexpected totals '+JSON.stringify(out.summary));console.log(JSON.stringify(out,null,2));
