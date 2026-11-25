// Conditional exact known-plaintext test for fresh-plaintext collision repair.
const fs=require("node:fs");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const C0=[15,8,18,3,6,19,27,0,15,26,18,21,5];
const P0=[18,13,10,13,8,24,9,26,15,18,18,5,15];
const mod=x=>(x%29+29)%29;
const maps={mod29:x=>x%29,scaled29:x=>Math.floor(x*29/256)};

/** @param {Uint8Array} key @param {number[]} c @param {number[]} p @param {number} sign @param {number} dir @param {"hold"|"spend"} mode */
function scan(key,c,p,sign,dir,mode) {
  assert.equal(c.length,p.length);
  assert(c.slice(1).every((v,i)=>v!==c[i]));
  const a=c.map((v,i)=>mod(sign*(v-p[i])));
  const r=c.map((_,i)=>i?mod(sign*(c[i-1]-p[i])):-1);
  const n=key.length, hits=[], deepest=Array(c.length+1).fill(0);
  for(let start=0;start<n;start++){
    if(key[start]!==a[0])continue;
    let j=start+dir,i=1,repairs=0;
    for(;i<c.length;i++){
      if(j<0||j>=n)break;
      if(key[j]===a[i])j+=dir;
      else if(key[j]===r[i]){repairs++;if(mode==="spend")j+=dir;}
      else break;
    }
    deepest[i]++;
    if(i===c.length)hits.push({start,next:j,repairs});
  }
  return {hits,deepest,starts:n};
}

/** Reachability of conditional downstream cribs, with unobserved P free.
 * Repair kernel is uniform-other with nonzero support on every other symbol.
 * @param {Uint8Array} key @param {number[]} c @param {Map<number,number>} crib
 */
function continuation(key,c,crib,sign,dir,mode,hit){
  let states=new Set([hit.next]);
  const stages=[];
  for(let i=C0.length;i<c.length;i++){
    const next=new Set();
    const fixed=crib.has(i);
    const a=fixed?mod(sign*(c[i]-crib.get(i))):null;
    const r=fixed?mod(sign*(c[i-1]-crib.get(i))):null;
    for(const j of states){
      if(j<0||j>=key.length)continue;
      if(!fixed||key[j]===a)next.add(j+dir);
      if(c[i]!==c[i-1]&&(!fixed||key[j]===r))next.add(mode==="hold"?j:j+dir);
    }
    states=next;
    if(fixed)stages.push({i,count:states.size});
    if(!states.size)return {passed:false,firstFailure:i,stages};
  }
  return {passed:true,terminalStates:states.size,stages};
}

/** Generate native controls from forward repair rather than imposing a key path. */
function selftest(){
  let tested=0;
  for(const [name,project] of Object.entries(maps))for(const sign of [1,-1])for(const dir of [1,-1])for(const mode of ["hold","spend"]){
    const bytes=new Uint8Array(4096);
    for(let i=0;i<bytes.length;i++)bytes[i]=(i*109+37)%256;
    const key=bytes.map(project),start=dir===1?701:1800;
    const plain=[...P0,3,15,5,8,6,14];
    const c=[];let j=start,repaired=0;
    // Construct a short input with forced collisions, then use the true forward rule.
    // A held cursor can collide on the following symbol; no conflicting key writes.
    for(let i=0;i<plain.length;i++){
      const p=plain[i];
      if(i===3||i===8)key[j]=mod(sign*(c[i-1]-p));
      let u=mod(p+sign*key[j]);
      if(i&&u===c[i-1]){
        u=mod(u+1);repaired++;if(mode==="spend")j+=dir;
      }else j+=dir;
      c.push(u);
    }
    const hit=scan(key,c.slice(0,13),plain.slice(0,13),sign,dir,mode).hits.find(h=>h.start===start);
    assert(hit,name+" "+mode+" failed");
    assert(repaired>=2);
    const crib=new Map([[13,plain[13]],[15,plain[15]],[18,plain[18]]]);
    const cont=continuation(key,c,crib,sign,dir,mode,hit);
    assert(cont.passed);
    tested++;
  }
  return {tested};
}
function main(){
  const test=selftest();console.log("PLANTED",JSON.stringify(test));
  if(process.argv.includes("--selftest"))return;
  const data=fs.readFileSync(process.argv[2]);
  const sha=crypto.createHash("sha256").update(data).digest("hex");
  assert.equal(data.length,118818811);
  assert.equal(sha,"db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
  const old=Buffer.from("28c07e1b102d4d5c4c1a376e064477e1416fcc94928765","hex");
  assert.equal(Buffer.from(old.map((v,i)=>v^data[12821+i])).toString(),"gbyh7znm6c7ezsmr.onion\n");
  const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
  const c=corpus.pages.find(p=>p.page===0).indices;
  assert.deepEqual(c.slice(0,13),C0);
  const crib=new Map();
  [2,18,4,3,24,23].forEach((v,i)=>crib.set(103+i,v));
  [2,18,23,18,1,3,16,18,23].forEach((v,i)=>crib.set(235+i,v));
  const rows=[];
  for(const [name,project] of Object.entries(maps)){
    const key=Uint8Array.from(data,project);
    for(const sign of [1,-1])for(const dir of [1,-1])for(const mode of ["hold","spend"]){
      const result=scan(key,C0,P0,sign,dir,mode);
      result.hits.forEach(h=>h.conditionalHoldout=continuation(key,c.slice(0,244),crib,sign,dir,mode,h));
      const row={name,sign,dir,mode,...result};rows.push(row);console.log("ROW",JSON.stringify(row));
    }
  }
  fs.writeFileSync(process.argv[3]||"p0-56013-repair-conditional.json",JSON.stringify({sourceSHA256:sha,sourceBytes:data.length,test,titleCipher:C0,titlePlain:P0,conditionalCribs:[...crib],rows},null,2)+"\n");
}
module.exports={scan,continuation,selftest};
if(require.main===module)main();
