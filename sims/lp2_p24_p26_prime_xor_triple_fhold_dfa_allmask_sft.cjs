"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
/** Exact unweighted factor-language support of three tracks under forced Fehu holds. */
function solve(corpus,dict,training,donorA,donorB){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109],index=new Map(code.map((p,i)=>[p,i])),partner=Array.from({length:128},(_,d)=>code.map(x=>index.get(x^d)??-1));
 const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const enc=word=>{let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),out=[];for(let i=0;i<w.length;){const q=tokens.find(([t])=>w.startsWith(t,i));if(!q)return null;out.push(q[1]);i+=q[0].length;}return out};
 const forms=new Set();function add(w){const a=enc(w);if(a?.length)forms.add(String.fromCharCode(...a.map(x=>65+x)));}
 for(const row of dict.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(row);if(m)add(m[1]);}
 for(const w of training.match(/[a-z]+/gi)||[])add(w);
 const kept=new Set();
 for(const w of [...forms].sort((a,b)=>a.length-b.length||a.localeCompare(b))){const dp=new Uint8Array(w.length+1);dp[0]=1;for(let i=0;i<w.length;i++)if(dp[i])for(let j=i+1;j<=w.length;j++)if(kept.has(w.slice(i,j)))dp[j]=1;if(!dp[w.length])kept.add(w);}
 // If a word is a concatenation of retained words, removing it preserves
 // the Kleene closure and hence all factors, including partial starts/ends.
 const nodes=[{ch:new Map(),end:false},{ch:new Map(),end:false}];
 function insert(root,w){let n=root;for(const c of w){const x=c.charCodeAt(0)-65;if(!nodes[n].ch.has(x)){nodes[n].ch.set(x,nodes.length);nodes.push({ch:new Map(),end:false});}n=nodes[n].ch.get(x);}nodes[n].end=true;}
 for(const w of kept){insert(0,w);for(let i=0;i<w.length;i++)insert(1,w.slice(i));}
 const ds=[],id=new Map(),B=65536;
 function intern(ns){const a=[...new Set(ns)].sort((a,b)=>a-b);if(!a.length)return -1;const k=a.join(",");if(id.has(k))return id.get(k);const n=ds.length;if(n>=B)throw Error("DFA index overflow");id.set(k,n);ds.push({ns:a,tr:new Int32Array(29).fill(-2)});return n;}
 intern([0,1]);
 function trans(n,x){if(n<0)return -1;const s=ds[n];if(s.tr[x]!==-2)return s.tr[x];const a=[];for(const i of s.ns){const j=nodes[i].ch.get(x);if(j!==undefined){a.push(j);if(nodes[j].end)a.push(0);}}return s.tr[x]=intern(a);}
 const legal=Array.from({length:128},(_,d)=>Array.from({length:128},(_,e)=>{const a=[];for(let x=1;x<29;x++){const y=partner[d][x],z=partner[e][x];if(y>0&&z>0)a.push([x,y,z]);}return a;}));
 function prepare(tracks,L=240){const pos=[0,0,0],rows=[];for(let t=0;t<L;t++){const h=pos.map((p,i)=>{let n=0;while(tracks[i][p+n]===0)n++;if(p+n>=tracks[i].length)throw Error("short track");return n;});const c=pos.map((p,i)=>code[tracks[i][p+h[i]]]);rows.push({h,d:c[0]^c[1],e:c[0]^c[2]});for(let i=0;i<3;i++)pos[i]+=h[i]+1;}return rows;}
 function test(rows,a,b){let states=[0],peak=1;for(let t=0;t<rows.length;t++){const {h,d,e}=rows[t],opts=legal[d^a][e^b],next=new Set();for(const k of states){let z=k%B,q=Math.floor(k/B),y=q%B,x=Math.floor(q/B);const ns=[x,y,z];for(let j=0;j<3;j++)for(let i=0;i<h[j];i++)ns[j]=trans(ns[j],0);if(ns.some(v=>v<0))continue;for(const [i,j,l] of opts){const u=trans(ns[0],i),v=trans(ns[1],j),w=trans(ns[2],l);if(u<0||v<0||w<0)continue;next.add((u*B+v)*B+w);}}peak=Math.max(peak,next.size);if(!next.size)return {status:"dead",at:t+1,peak};states=[...next];}return {status:"live",at:rows.length,peak,final:states.length};}
 const originals=[];for(const off of [[0,0,0],[3,2,1]]){const rows=prepare(off.map((p,i)=>corpus.pages[24+i].indices.slice(p,p+264))),results=[];for(let a=0;a<128;a+=2)for(let b=0;b<128;b+=2){if(rows.some(r=>!legal[r.d^a][r.e^b].length))continue;results.push({a,b,...test(rows,a,b)});}originals.push({off,results});}
 const encode=t=>(t.match(/[a-z]+/gi)||[]).flatMap(w=>enc(w)||[]),aa=encode(donorA),bb=encode(donorB),controls=[];
 const masks=[[102,58],[118,68],[34,32],[114,56]];
 for(let i=0;i<4;i++){const P=[aa.slice(28000+i*1000,28000+i*1000+264),bb.slice(40000+i*1500,40000+i*1500+264),bb.slice(90000+i*1700,90000+i*1700+264)],rows=prepare(P);const [a,b]=masks[i];const shifted=rows.map(r=>({...r,d:r.d^a,e:r.e^b}));const r=test(shifted,a,b);if(r.status!=="live")throw Error("plant lost");controls.push({a,b,...r});}
 return {forms:forms.size,irreducible:kept.size,singletons:[...forms].filter(w=>w.length===1).sort(),trieNodes:nodes.length,dfaStates:ds.length,controls,originals};
}
if(require.main===module)console.log(JSON.stringify(solve(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
module.exports={solve};
