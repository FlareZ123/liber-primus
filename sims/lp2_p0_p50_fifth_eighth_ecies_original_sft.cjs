'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createECDH,createHash,createHmac,createCipheriv,createDecipheriv,timingSafeEqual}=require('node:crypto');
const sha512=b=>createHash('sha512').update(b).digest();
const mac=(k,b)=>createHmac('sha256',k).update(b).digest();
const match=(a,b)=>a.length===b.length&&timingSafeEqual(a,b);
/** @param {Buffer} key @param {Buffer} peer @param {Buffer} body */
function candidates(key,peer,body){
 assert.equal(key.length,32);assert.equal(peer.length,32);assert.equal(body.length,192);
 const e=createECDH('secp256k1');e.setPrivateKey(key);
 const shared=e.computeSecret(Buffer.concat([Buffer.from([2]),peer]));
 assert.deepEqual(shared,e.computeSecret(Buffer.concat([Buffer.from([3]),peer])));
 const data=body.subarray(0,-32),tag=body.subarray(-32),out=[];
 const h=sha512(shared),k=h.subarray(0,32),mk=h.subarray(32);
 const iv=data.subarray(0,16),ct=data.subarray(16);
 const observed=mac(mk,data),ok=match(observed,tag);
 let plaintext=null;if(ok){const d=createDecipheriv('aes-256-cbc',k,iv);plaintext=Buffer.concat([d.update(ct),d.final()]).toString('hex');}
 out.push({type:'explicit-IV/CBC/HMAC',valid:ok,calculated:observed.toString('hex'),plaintext});
 for(const peerSign of [2,3])for(const sharedSign of [2,3]){
  const point=Buffer.concat([Buffer.from([sharedSign]),shared]),h=sha512(point);
  const header=Buffer.concat([Buffer.from('BIE1'),Buffer.from([peerSign]),peer]);
  const expected=mac(h.subarray(32),Buffer.concat([header,data])),ok=match(expected,tag);
  let plaintext=null;if(ok){const d=createDecipheriv('aes-128-cbc',h.subarray(16,32),h.subarray(0,16));plaintext=Buffer.concat([d.update(data),d.final()]).toString('hex');}
  out.push({type:'BIE1',peerSign,sharedSign,valid:ok,calculated:expected.toString('hex'),plaintext});
 }
 return {shared:shared.toString('hex'),tag:tag.toString('hex'),out};
}
/** @param {Buffer[]} cols */
function experiment(cols){
 assert.equal(cols.length,8);assert.ok(cols.every(c=>c.length===32));
 const d=cols[4],x=cols[7],body=Buffer.concat(cols.filter((_,i)=>i!==4&&i!==7));
 assert.equal(d.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
 const recipient=Buffer.alloc(32);recipient[31]=1;const sender=createECDH('secp256k1'),sd=Buffer.alloc(32);sd[31]=2;sender.setPrivateKey(sd);
 const recv=createECDH('secp256k1');recv.setPrivateKey(recipient);
 const peer=sender.getPublicKey(undefined,'compressed');const x2=peer.subarray(1),shared=sender.computeSecret(recv.getPublicKey(undefined,'compressed'));
 const plain=Buffer.from('The primes are sacred. The totient function is sacred. All things should be encrypted.');
 const payload=Buffer.alloc(143,32);plain.copy(payload);const h=sha512(shared),iv=Buffer.alloc(16,7);
 let c=createCipheriv('aes-256-cbc',h.subarray(0,32),iv);let enc=Buffer.concat([iv,c.update(payload),c.final()]);let ctl=Buffer.concat([enc,mac(h.subarray(32),enc)]);
 const a=candidates(recipient,x2,ctl);assert.equal(a.out[0].plaintext,payload.toString('hex'));
 const payloadB=Buffer.alloc(159,32);plain.copy(payloadB);const bh=sha512(peer);c=createCipheriv('aes-128-cbc',bh.subarray(16,32),bh.subarray(0,16));enc=Buffer.concat([c.update(payloadB),c.final()]);ctl=Buffer.concat([enc,mac(bh.subarray(32),Buffer.concat([Buffer.from('BIE1'),peer,enc]))]);
 const b=candidates(recipient,x2,ctl);assert.ok(b.out.some(r=>r.type==='BIE1'&&r.plaintext===payloadB.toString('hex')));ctl[0]^=1;assert.equal(candidates(recipient,x2,ctl).out.filter(r=>r.valid).length,0);
 return {control:'Both authenticated formats exact; modified message rejected',original:candidates(d,x,body)};
}
const grid=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/base60-grid.json'),'utf8'));
assert.equal(grid.alphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const rows=grid.rows.map(r=>r.map(t=>grid.alphabet.indexOf(t[0])*60+grid.alphabet.indexOf(t[1])));
assert.deepEqual(rows,grid.byte_rows);assert.equal(rows.length,32);assert.ok(rows.every(r=>r.length===8&&r.every(v=>v>=0&&v<256)));
const cols=Array.from({length:8},(_,i)=>Buffer.from(rows.map(r=>r[i])));
const result=experiment(cols);assert.equal(result.original.shared,'f8c3ab1cdada2863ce948d1dd348bb035d8b23d843fc6deac299a2786de86cca');
assert.equal(result.original.out.filter(r=>r.valid).length,0);
console.log(JSON.stringify(result,null,2));