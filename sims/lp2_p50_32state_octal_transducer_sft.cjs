'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function machine(rows,radix,stateHigh){
 const full="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx", alphabet=radix===59?full.replace("f",""):full;
 assert(alphabet.length===radix && rows.length===32);
 return rows.map(row=>{assert(row.length===8);return row.map(token=>{const a=alphabet.indexOf(token[0]),b=alphabet.indexOf(token[1]),v=a*radix+b;assert(token.length===2&&a>=0&&b>=0&&v<256);return stateHigh?{next:v>>3,out:v&7}:{next:v&31,out:v>>5}})});
}

function run(m,start,digits){let state=start;const output=[],states=[state];for(const d of digits){const e=m[state][d];state=e.next;output.push(e.out);states.push(state)}return {output,state,states}}

function reachable(m,start){const q=[start],seen=new Set(q);for(const s of q)for(const e of m[s])if(!seen.has(e.next)){seen.add(e.next);q.push(e.next)}return q.sort((a,b)=>a-b)}

function shortestCollision(m,start){
 const key=(a,b,d)=>`${a},${b},${Number(d)}`,q=[{a:start,b:start,different:false,left:[],right:[]}],seen=new Set([key(start,start,false)]);
 for(const v of q){
  if(v.a===v.b&&v.different){const l=run(m,start,v.left),r=run(m,start,v.right);assert(!equal(v.left,v.right)&&equal(l.output,r.output)&&l.state===r.state);return {start,left:v.left,right:v.right,output:l.output,end:l.state,leftStates:l.states,rightStates:r.states}}
  for(let x=0;x<m[v.a].length;x++)for(let y=0;y<m[v.b].length;y++){const p=m[v.a][x],t=m[v.b][y];if(p.out!==t.out)continue;const d=v.different||x!==y,k=key(p.next,t.next,d);if(seen.has(k))continue;seen.add(k);q.push({a:p.next,b:t.next,different:d,left:[...v.left,x],right:[...v.right,y]})}
 }
 return null;
}

function gp(x){return [(x>>10)&31,(x>>5)&31,x&31]}

function oct(x){return [12,9,6,3,0].map(s=>(x>>s)&7)}

function pack(digits){return digits.reduce((a,b)=>(a<<3)|b,0)}

function alignedCollision(m,start){
 const seen=new Map();let inputValid=0,outputValid=0,excess=0,maxFiber=0,witness=null;
 for(let x=0;x<32768;x++){
  if(gp(x).some(d=>d>=29))continue;
  inputValid++;
  const digits=oct(x),r=run(m,start,digits),output=pack(r.output);
  if(gp(output).some(d=>d>=29))continue;
  outputValid++;const key=(r.state<<15)|output,prior=seen.get(key);
  if(!prior){seen.set(key,{first:x,count:1});maxFiber=Math.max(maxFiber,1);continue}
  excess++;prior.count++;maxFiber=Math.max(maxFiber,prior.count);
  if(!witness){const left=oct(prior.first),l=run(m,start,left);assert(prior.first!==x&&equal(l.output,r.output)&&l.state===r.state);witness={start,left,right:digits,output:r.output,end:r.state,leftGP:gp(prior.first),rightGP:gp(x),outputGP:gp(output),leftStates:l.states,rightStates:r.states}}
 }
 assert(inputValid===29**3&&excess===outputValid-seen.size);
 return {start,inputValid,outputValid,distinct:seen.size,excess,maxFiber,witness};
}

function analyze(rows){
 const delay=Array.from({length:2},(_,s)=>Array.from({length:2},(_,d)=>({next:d,out:s})));
 const lossy=Array.from({length:2},()=>Array.from({length:2},()=>({next:0,out:0})));
 for(let s=0;s<2;s++){assert(shortestCollision(delay,s)===null);assert(shortestCollision(lossy,s).left.length===1)}
 const models=[];
 for(const radix of [59,60])for(const stateHigh of [true,false]){
  const m=machine(rows,radix,stateHigh),reach=m.map((_,s)=>reachable(m,s)),collisions=m.map((_,s)=>shortestCollision(m,s)),aligned=m.map((_,s)=>alignedCollision(m,s)),lengthHistogram={};
  for(const w of collisions){const k=w?w.left.length:"none";lengthHistogram[k]=(lengthHistogram[k]||0)+1}
  models.push({radix,stateField:stateHigh?"high5":"low5",reachableCounts:reach.map(x=>x.length),lengthHistogram,collisions,aligned});
 }
 return {controls:{delayedInjective:true,immediatelyLossy:true},models};
}

if(require.main===module){
 const root=path.join(__dirname,'../resources/liber-primus');
 const rows=JSON.parse(fs.readFileSync(path.join(root,'base60-grid.json'),'utf8')).rows;
 const other=JSON.parse(fs.readFileSync(path.join(root,'lp2-grid-256.json'),'utf8')).pages.flatMap(p=>p.tokens);
 assert(equal(rows.flat(),other));
 console.log(JSON.stringify(analyze(rows),null,2));
}
module.exports={analyze,machine,run,shortestCollision,alignedCollision};
