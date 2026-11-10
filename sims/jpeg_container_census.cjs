'use strict';

/**
 * Exact JPEG marker-stream census of original Liber Primus scans 00-74.
 * Unlike a naive FF D9 search, this walks segment lengths and un-stuffs
 * entropy-coded FF 00 bytes. Requires only Node.js built-ins.
 * Run: node sims/jpeg_container_census.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');

const ROOT=path.resolve(__dirname,'..','resources','liber-primus');

/** @param {Buffer} bytes @returns {{end:number,markers:Array<{id:number,offset:number,payload:Buffer}>}} */
function parseJPEG(bytes){
  assert.equal(bytes.readUInt16BE(0),0xffd8,'Expected SOI');
  /** @type {Array<{id:number,offset:number,payload:Buffer}>} */
  const markers=[];
  let pos=2,entropy=false;
  while(pos<bytes.length){
    if(entropy){
      const at=bytes.indexOf(0xff,pos);
      assert.ok(at>=0&&at+1<bytes.length,'Unterminated scan');
      const id=bytes[at+1];
      if(id===0||id===0xff){pos=at+2;continue;}
      if(id>=0xd0&&id<=0xd7){
        markers.push({id,offset:at,payload:Buffer.alloc(0)});
        pos=at+2;continue;
      }
      pos=at;entropy=false;continue;
    }
    assert.equal(bytes[pos],0xff,'JPEG marker expected at '+pos);
    const offset=pos;
    while(bytes[pos]===0xff)pos++;
    const id=bytes[pos++];
    if(id===0xd9){
      markers.push({id,offset,payload:Buffer.alloc(0)});
      return {end:pos,markers};
    }
    if(id===0xd8||id===0x01||(id>=0xd0&&id<=0xd7)){
      markers.push({id,offset,payload:Buffer.alloc(0)});
      continue;
    }
    assert.ok(pos+2<=bytes.length,'Truncated marker at '+offset);
    const len=bytes.readUInt16BE(pos);
    assert.ok(len>=2&&pos+len<=bytes.length,'Invalid marker length at '+offset);
    markers.push({id,offset,payload:bytes.subarray(pos+2,pos+len)});
    pos+=len;
    if(id===0xda)entropy=true;
  }
  throw new Error('No EOI found');
}

/** @param {Buffer} bytes @returns {string} */
function sha256(bytes){
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

/** @param {Buffer} bytes */
function inspect(bytes){
  const {end,markers}=parseJPEG(bytes);
  const sof=markers.find(x=>x.id===0xc0||x.id===0xc1||x.id===0xc2);
  assert.ok(sof,'Missing SOF');
  const d=sof.payload;
  const apps=markers.filter(x=>x.id>=0xe0&&x.id<=0xef);
  const icc=apps.filter(x=>x.id===0xe2&&x.payload.subarray(0,12)
    .toString('binary')==='ICC_PROFILE\0');
  return {end,components:d[5],width:d.readUInt16BE(3),
    height:d.readUInt16BE(1),
    app:apps.map(x=>({id:x.id,bytes:x.payload.length,sha256:sha256(x.payload)})),
    icc:icc.map(x=>sha256(x.payload)),
    comments:markers.filter(x=>x.id===0xfe).length,
    tailBytes:bytes.length-end};
}

const inputs=new Map();
for(let page=0;page<75;page++){
  const file=path.join(ROOT,String(page).padStart(2,'0')+'.jpg');
  inputs.set(page,fs.readFileSync(file));
}
const summaries=[...inputs].map(([page,bytes])=>({page,bytes:bytes.length,...inspect(bytes)}));
const unusual=summaries.filter(p=>p.tailBytes!==0);
assert.deepEqual(unusual.map(p=>p.page),[5,10]);
assert.equal(unusual[0].end,336353);
assert.equal(unusual[0].tailBytes,336713);
assert.equal(unusual[1].end,754662);
assert.equal(unusual[1].tailBytes,3486295);

const five=inputs.get(5), fiveEnd=unusual[0].end;
assert.ok(five.subarray(fiveEnd+360).equals(Buffer.from(five.subarray(0,fiveEnd)).reverse()));
const ten=inputs.get(10);
let offset=unusual[1].end;
for(const page of [11,12,13]){
  const data=inputs.get(page);
  assert.ok(ten.subarray(offset,offset+data.length).equals(data));
  offset+=data.length;
}
assert.equal(offset,ten.length);

const lp2=summaries.filter(p=>p.page>=17);
const profiles=lp2.flatMap(p=>p.icc);
assert.equal(profiles.length,58);
assert.equal(new Set(profiles).size,1);
assert.ok(lp2.every(p=>p.tailBytes===0&&p.comments===0&&p.width===2400&&p.height===3600));
const gray=lp2.filter(p=>p.components===1).map(p=>p.page);
const rgb=lp2.filter(p=>p.components===3).map(p=>p.page);
assert.equal(gray.length,23);
assert.equal(rgb.length,35);

console.log(JSON.stringify({
  checked:75,firstValidJPEGEndsAtEOF:73,
  embeddedPayloads:unusual.map(p=>({page:p.page,firstJPEGBytes:p.end,tailBytes:p.tailBytes})),
  page05:{middleBytes:360,exactReversedFirstJPEG:true},
  page10:{exactConcatenatedStandalones:[11,12,13]},
  LP2:{scans:58,app2ICCCount:profiles.length,distinctICCHashes:new Set(profiles).size,
    iccSHA256:profiles[0],trailingPayloads:0,JPEGComments:0,
    dimensions:'2400x3600',grayscaleScans:gray,rgbScans:rgb}
},null,2));
