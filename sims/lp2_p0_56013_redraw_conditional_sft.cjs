// Exact all-start search of a conditional p0 title under collision redraw.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");

const C0 = [15,8,18,3,6,19,27,0,15,26,18,21,5];
const P0 = [18,13,10,13,8,24,9,26,15,18,18,5,15];
const mod = x => (x % 29 + 29) % 29;
const projections = {
  mod29: x => x % 29,
  scaled29: x => Math.floor(x * 29 / 256)
};

/** @param {Uint8Array} key @param {number[]} c @param {number[]} p @param {number} sign @param {number} dir */
function scan(key, c, p, sign, dir) {
  assert.equal(c.length, p.length);
  assert(c.slice(1).every((v,i) => v !== c[i]));
  const a = c.map((v,i)=>mod(sign*(v-p[i])));
  const reject = c.map((_,i)=>i ? mod(sign*(c[i-1]-p[i])) : -1);
  const n=key.length, hits=[], deepest=Array(c.length+1).fill(0);
  for (let start=0;start<n;start++) {
    if (key[start]!==a[0]) continue;
    let j=start+dir, i=1;
    for (;i<c.length;i++) {
      // All rejects use the same plaintext symbol. No finite skip cap.
      while (j>=0 && j<n && key[j]===reject[i]) j+=dir;
      if (j<0 || j>=n || key[j]!==a[i]) break;
      j+=dir;
    }
    deepest[i]++;
    if (i===c.length) hits.push({start,next:j,consumed:Math.abs(j-start)});
  }
  return {hits, deepest, starts:n};
}

/** Exact reachability with unknown plaintext between fixed crib positions.
 * @param {Uint8Array} key @param {number[]} c @param {Map<number,number>} crib
 */
function continuation(key,c,crib,sign,dir,hit) {
  let states=new Set([hit.next]);
  const stages=[];
  const valid=j=>j>=0&&j<key.length;
  for (let i=C0.length;i<c.length;i++) {
    const next=new Set(), delta=mod(sign*(c[i]-c[i-1]));
    const a=crib.has(i)?mod(sign*(c[i]-crib.get(i))):null;
    for(const j of states) {
      if(!valid(j)) continue;
      if(a===null||key[j]===a) next.add(j+dir);
      let k=j+dir;
      while(valid(k)&&key[k]===key[j]) {
        if(delta===0&&(a===null||key[k]===a)) next.add(k+dir);
        k+=dir;
      }
      if(delta!==0&&valid(k)&&mod(key[k]-key[j])===delta&&(a===null||key[k]===a)) next.add(k+dir);
    }
    states=next;
    if(crib.has(i)) stages.push({i,count:states.size});
    if(!states.size) return {passed:false,firstFailure:i,stages};
  }
  return {passed:true,terminalStates:states.size,stages};
}

function selftest() {
  let tested=0;
  for(const [name,project] of Object.entries(projections)) {
    const representative=Array.from({length:29},(_,i)=>Array.from({length:256},(_,b)=>b).find(b=>project(b)===i));
    for(const sign of [1,-1]) for(const dir of [1,-1]) {
      const path=[];
      for(let i=0;i<C0.length;i++) {
        if(i===3||i===8) path.push(...Array(i===3?5:2).fill(mod(sign*(C0[i-1]-P0[i]))));
        path.push(mod(sign*(C0[i]-P0[i])));
      }
      const bytes=new Uint8Array(4096);
      for(let i=0;i<bytes.length;i++) bytes[i]=(i*109+37)%256;
      const start=dir===1?701:1800;
      path.forEach((v,i)=>bytes[start+i*dir]=representative[v]);
      const key=bytes.map(project);
      const hit=scan(key,C0,P0,sign,dir).hits.find(h=>h.start===start);
      assert(hit, name+" planted offset not found");
      assert.equal(hit.consumed,path.length);
      // Force a known continuation with arbitrary gaps and consecutive identical ciphertext.
      const c=[...C0,5,4,4,19], p=[...P0,3,15,5,8];
      let j=hit.next;
      for(let i=C0.length;i<c.length;i++) {
        for(let k=0;k<2;k++) {key[j]=mod(sign*(c[i-1]-p[i]));j+=dir;}
        key[j]=mod(sign*(c[i]-p[i]));j+=dir;
      }
      const crib=new Map([[13,3],[15,5],[16,8]]);
      assert(continuation(key,c,crib,sign,dir,hit).passed);
      tested++;
    }
  }
  return {tested,forcedRedraws:7,largestRun:5};
}

function main() {
  const test=selftest();
  console.log("PLANTED",JSON.stringify(test));
  if(process.argv.includes("--selftest")) return;
  const path=process.argv[2];
  assert(path,"Usage: node script.cjs historical-pad.bin [report.json]");
  const data=fs.readFileSync(path);
  const sha=crypto.createHash("sha256").update(data).digest("hex");
  assert.equal(data.length,118818811);
  assert.equal(sha,"db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
  const old=Buffer.from("28c07e1b102d4d5c4c1a376e064477e1416fcc94928765","hex");
  const replay=Buffer.from(old.map((v,i)=>v^data[12821+i])).toString();
  assert.equal(replay,"gbyh7znm6c7ezsmr.onion\n");
  const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
  const c=corpus.pages.find(p=>p.page===0).indices;
  assert.deepEqual(c.slice(0,13),C0);
  const crib=new Map();
  [2,18,4,3,24,23].forEach((v,i)=>crib.set(103+i,v));
  [2,18,23,18,1,3,16,18,23].forEach((v,i)=>crib.set(235+i,v));
  const rows=[];
  for(const [name,project] of Object.entries(projections)){
    const key=new Uint8Array(data.length);
    for(let i=0;i<data.length;i++)key[i]=project(data[i]);
    for(const sign of [1,-1]) for(const dir of [1,-1]){
      const result=scan(key,C0,P0,sign,dir);
      result.hits.forEach(h=>h.conditionalHoldout=continuation(key,c.slice(0,244),crib,sign,dir,h));
      const row={name,sign,dir,...result};
      rows.push(row);
      console.log("ROW",JSON.stringify(row));
    }
  }
  const report={sourceSHA256:sha,sourceBytes:data.length,historicalXOR:replay,test,titleCipher:C0,titlePlain:P0,conditionalCribs:[...crib],rows};
  fs.writeFileSync(process.argv[3]||"p0-56013-redraw-conditional.json",JSON.stringify(report,null,2)+"\n");
}
module.exports={scan,continuation,selftest};
if(require.main===module)main();
