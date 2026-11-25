'use strict';
/** Local intact-row reuse, distinct from full-table constant-mask/stride scans.
 * @typedef {{name:string, bytes:Buffer}} Tape
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const {Readable}=require('node:stream');
const {pipeline}=require('node:stream/promises');
const os=require('node:os');
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-grid-256.json'),'utf8'));
const tokens=grid.pages.flatMap(p=>p.tokens);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(tokens.length,256);
const a60=grid.alphabet,a59=a60.replace('f','');
const values=a=>Buffer.from(tokens.map(t=>a.indexOf(t[0])*a.length+a.indexOf(t[1])));
assert.equal(sha(values(a60)),'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.ok(tokens.every(t=>[...t].every(c=>a59.includes(c))));
/** @type {Tape[]} */
const tapes=[];
for(const [radix,a] of [[60,a60],[59,a59]]){
 const b=values(a);
 for(const axis of ['row','col'])for(const snake of [false,true])for(const rev of [false,true]){
  const order=Array.from({length:256},(_,i)=>{
   if(axis==='row'){const r=Math.floor(i/8),c=i%8;return 8*r+(snake&&r%2?7-c:c);}
   const c=Math.floor(i/32),r=i%32;return 8*(snake&&c%2?31-r:r)+c;
  });
  if(rev)order.reverse();
  tapes.push({name:[radix,axis,snake?'snake':'straight',rev?'reverse':'forward'].join('-'),bytes:Buffer.from(order.map(i=>b[i]))});
 }
}
const needles=new Map();
for(const t of tapes)for(let i=0;i<=248;i+=8){
 const k=t.bytes.subarray(i,i+8).toString('hex');
 if(!needles.has(k))needles.set(k,[]);
 needles.get(k).push({t,i});
}
/** @param {Buffer} source */
function scan(source){
 const hits=[];
 for(const [k,origins] of needles){
  const needle=Buffer.from(k,'hex');
  for(let p=source.indexOf(needle);p>=0;p=source.indexOf(needle,p+1)){
   for(const {t,i} of origins){
    let f=8,b=0;
    while(i+f<256&&p+f<source.length&&t.bytes[i+f]===source[p+f])f++;
    while(i>b&&p>b&&t.bytes[i-b-1]===source[p-b-1])b++;
    hits.push({tape:t.name,tableOffset:i,isoOffset:p,forward:f,backward:b,withheldNext24:f>=32});
   }
  }
 }
 return hits;
}
const plant=Buffer.concat([Buffer.alloc(37,0xa6),tapes[0].bytes.subarray(0,32),Buffer.alloc(43,0x57)]);
const planted=scan(plant);
assert.ok(planted.some(h=>h.tape===tapes[0].name&&h.tableOffset===0&&h.isoOffset===37&&h.withheldNext24));
console.log(JSON.stringify({control:'PASS',tapes:tapes.length,distinctNeedles:needles.size,plant:planted.find(h=>h.tape===tapes[0].name&&h.tableOffset===0&&h.isoOffset===37)}));
async function main(){
 if(process.argv.includes('--self-test'))return;
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-iso-anchor-'));
 try{
  const file=process.env.CICADA_ISO_PATH||path.join(tmp,'3301.iso');
  if(!process.env.CICADA_ISO_PATH){
   const resp=await fetch('https://connortumbleson.com/uploads/2024/01/3301.iso',{signal:AbortSignal.timeout(180000)});
   assert.ok(resp.ok,'ISO HTTP '+resp.status);
   await pipeline(Readable.fromWeb(resp.body),fs.createWriteStream(file));
  }
  const source=fs.readFileSync(file);
  assert.equal(source.length,136398848);
  assert.equal(sha(source),'784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f');
  const hits=scan(source);
  console.log(JSON.stringify({sourceBytes:source.length,sourceSHA256:sha(source),anchorWidth:8,tapes:tapes.length,distinctNeedles:needles.size,originalHits:hits},null,2));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
