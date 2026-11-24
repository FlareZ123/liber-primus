"use strict";
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),cp=require("node:child_process"),assert=require("node:assert/strict");
const {experiment}=require("./lp2_p0_red8_red5_unknown_layer_sft.cjs");
const root=path.resolve(__dirname,"..","resources");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const base=experiment(read("liber-primus/lp2-corpus.json"),read("liber-primus/lp2-transcription.txt"),read("control/english_wordfreq_textblob.txt"),()=>{});
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-85-slide-"));
const keystr=k=>k.map(x=>x.toString(29)).join("");
const mod=x=>(x+29)%29;
const exe=path.join(temp,process.platform==="win32"?"slide.exe":"slide");
function run(cmd,args){const x=cp.spawnSync(cmd,args,{encoding:"utf8",maxBuffer:64*1024*1024});if(x.error)throw x.error;if(x.status!==0)throw Error(cmd+" failed: "+x.stderr);return x}
const trie=[new Map()],terminal=new Set();
for(const w of base.dict){if(w.length===1&&w[0]!==10&&w[0]!==24)continue;let t=0;for(const p of w){if(!trie[t].has(p)){trie[t].set(p,trie.length);trie.push(new Map())}t=trie[t].get(p)}terminal.add(t)}
function transitions(x,a,b,k,l,step){if(x===0){step(0,a,b);const p=mod(-k[a]);if(p)step(p,(a+1)%8,b)}const q=mod(x-l[b]);if(q){const p=mod(q-k[a]);if(p)step(p,(a+1)%8,(b+1)%5)}}
function segment(C,{offset,b:b0,k,l,p:w}){
 let s=new Set(Array.from({length:40},(_,j)=>j));
 for(let i=0;i<C.length;i++){const t=new Set(),force=i>=offset&&i<offset+w.length?w[i-offset]:-1;for(const id of s){const node=Math.floor(id/40),ph=id%40,a=Math.floor(ph/5),b=ph%5;if(i===offset&&(a!==0||b!==b0))continue;transitions(C[i],a,b,k,l,(p,aa,bb)=>{if(force>=0&&p!==force)return;const n=trie[node].get(p);if(n===undefined)return;const state=aa*5+bb;t.add(n*40+state);if(terminal.has(n))t.add(state)})}s=t;if(!s.size)return {prefixFailure:i+1,complete:false}}
 return {prefixFailure:null,complete:[...s].some(x=>x<40)};
}
function witness(C,{offset,b:b0,k,l,p:w}){
 let s=new Map(Array.from({length:40},(_,j)=>[j,{start:j,prev:null,p:-1}]));
 for(let i=0;i<C.length;i++){const t=new Map(),force=i>=offset&&i<offset+w.length?w[i-offset]:-1;for(const [id,node] of s){const a=Math.floor(id/5),b=id%5;if(i===offset&&(a!==0||b!==b0))continue;transitions(C[i],a,b,k,l,(p,aa,bb)=>{if(force>=0&&p!==force)return;const state=aa*5+bb;if(!t.has(state))t.set(state,{start:node.start,prev:node,p})})}s=t;assert(s.size)}
 let node=s.values().next().value,plain=[],a=Math.floor(node.start/5),b=node.start%5;while(node.prev){plain.push(node.p);node=node.prev}plain.reverse();
 const replay=plain.map(p=>{if(!p)return 0;const q=mod(p+k[a]);a=(a+1)%8;if(!q)return 0;const x=mod(q+l[b]);b=(b+1)%5;return x});assert.deepEqual(replay,C);return plain;
}
function scan(words,outer,len){
 const body=path.join(temp,"body.txt"),keys=path.join(temp,"keys.txt"),dict=path.join(temp,"dict.txt");
 fs.writeFileSync(body,words.map(keystr).join(" "));fs.writeFileSync(keys,outer.map(k=>k.join(" ")).join("\n")+"\n");fs.writeFileSync(dict,base.dict.map(keystr).join("\n")+"\n");
 const x=run(exe,[body,keys,dict,String(len)]),parse=s=>Array.from(s,x=>parseInt(x,29)),rows=x.stdout.trim().split("\n").filter(Boolean).map(line=>{const [tag,off,b,k,l,p,native]=line.trim().split(/\s+/);assert.equal(tag,"SURVIVOR");return {offset:Number(off),b:Number(b),k:parse(k),l:parse(l),p:parse(p),native:Number(native)}});
 console.log(x.stderr.trim());return {rows,diagnostic:x.stderr};
}
try{
 run(process.env.CXX||"g++",["-O3","-std=c++17",path.join(__dirname,"lp2_p0_red8_red5_sliding_anchor.cpp"),"-o",exe]);
 const counts=[];
 for(const L of [10,11,12,13,14]){const res=scan(base.body,base.outer,L);counts.push(res.rows.length);for(const s of res.rows){const C=base.body.flat(),seg=segment(C,s),p=witness(C,s);assert(!seg.complete);assert(!s.native);console.log(JSON.stringify({...s,k:keystr(s.k),l:keystr(s.l),p:keystr(s.p),seg,witnessPrefix:keystr(p.slice(0,48))}))}}
 assert.deepEqual(counts,[595,14,1,0,0]);
 for(const [k,l] of [[[15,8,18,3,6,19,27,0],[15,26,18,21,5]],[[4,19,2,0,28,13,8,1],[0,0,3,12,19]],[[23,4,11,7,17,22,0,9],[5,12,13,17,26]]]){
  let a=0,b=0,idx=0,expected,bb;const offset=base.ctrl.slice(0,13).flat().length;
  const enc=base.ctrl.map(w=>w.map(p=>{if(idx++===offset){expected=k.slice(a).concat(k.slice(0,a));bb=b}if(!p)return 0;const q=mod(p+k[a]);a=(a+1)%8;if(!q)return 0;const x=mod(q+l[b]);b=(b+1)%5;return x}));
  const res=scan(enc,[l],14),s=res.rows.find(s=>s.offset===offset&&s.b===bb&&String(s.k)===String(expected)&&String(s.p)===String(base.ctrl[13]));assert(s);assert(segment(enc.flat(),s).complete);witness(enc.flat(),s);console.log("PASS planted p57 key and free segmentation");
 }
}finally{fs.rmSync(temp,{recursive:true,force:true})}
