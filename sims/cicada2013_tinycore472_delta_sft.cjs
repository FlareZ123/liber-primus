"use strict";
// Read-only historical distribution delta: never boot or execute archive content.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const os=require("node:os");
const {createHash}=require("node:crypto");
const {gunzipSync,inflateRawSync}=require("node:zlib");
const hash=(b,alg="sha256")=>createHash(alg).update(b).digest("hex");
const originalUrl="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/3301-contents/boot/3301.img";
const originalSha="3fcbb8abaf9d876985e8122e94f60b306a06401ec95b743d52da2e2324a37f42";
const archiveUrl="https://archive.org/download/tiny-core-4.x/TinyCore%204.x.zip";
const report={scope:"Byte-level comparison of the original ISO-derived initramfs against the exact 4.7.2 baseline; no original code executed.",attempts:[]};
const cap=32*1024*1024;
/** @param {string} url @param {Record<string,string>} [headers] @param {number} [limit] */
async function get(url,headers={},limit=cap){
  const r=await fetch(url,{headers,signal:AbortSignal.timeout(25000)});
  if(!r.ok){await r.body?.cancel();throw Error("HTTP "+r.status)}
  if(Number(r.headers.get("content-length"))>limit){await r.body?.cancel();throw Error("response exceeds cap")}
  const chunks=[];let total=0;
  for await(const chunk of r.body){total+=chunk.length;if(total>limit)throw Error("response exceeds cap");chunks.push(Buffer.from(chunk))}
  return {data:Buffer.concat(chunks),headers:r.headers,status:r.status,url:r.url};
}
/** @param {Buffer} gz */
function cpio(gz){
  const b=gunzipSync(gz,{maxOutputLength:64*1024*1024}),align=n=>(n+3)&~3;
  let at=0;const entries=new Map(),links=new Map(),types={};let trailer=false;
  while(at+110<=b.length){
    const magic=b.toString("ascii",at,at+6);
    assert.ok(magic==="070701"||magic==="070702","newc magic at "+at);
    const h=Array.from({length:13},(_,i)=>Number.parseInt(b.toString("ascii",at+6+8*i,at+14+8*i),16));
    assert.ok(h.every(Number.isFinite));
    const [ino,mode,uid,gid,nlink,mtime,size,major,minor,,,namesize]=h;
    const name=b.toString("utf8",at+110,at+110+namesize-1).replace(/^\.\//,"");
    assert.equal(b[at+110+namesize-1],0);
    at=align(at+110+namesize);
    assert.ok(at+size<=b.length,"cpio extent");
    const data=b.subarray(at,at+size);at=align(at+size);
    if(name==="TRAILER!!!"){trailer=true;break}
    const kind=mode&0xf000;
    types[kind]=(types[kind]||0)+1;
    if(kind!==0x8000&&kind!==0xa000)continue;
    assert.ok(!entries.has(name),"duplicate path "+name);
    const entry={name,kind,mode,uid,gid,mtime,data};
    entries.set(name,entry);
    if(kind===0x8000&&nlink>1){
      const key=[major,minor,ino].join(":");
      if(!links.has(key))links.set(key,[]);
      links.get(key).push(entry);
    }
  }
  assert.ok(trailer,"missing cpio trailer");
  for(const group of links.values()){
    const payload=group.find(e=>e.data.length);
    if(payload)for(const e of group)if(!e.data.length)e.data=payload.data;
  }
  entries.types=types;
  return entries;
}
/** @param {Buffer} b */
function isoCore(b){
  const sec=2048,pvd=b.subarray(16*sec,17*sec);
  let vd=pvd;
  for(let i=16;vd[0]!==1&&i<32;i++)vd=b.subarray(i*sec,(i+1)*sec);
  assert.equal(vd.toString("ascii",1,6),"CD001");
  assert.equal(vd[0],1);
  const visited=new Set();
  function walk(lba,len,prefix){
    assert.ok(lba*sec+len<=b.length);
    if(visited.has(lba))return null;visited.add(lba);
    const data=b.subarray(lba*sec,lba*sec+len);
    for(let p=0;p<data.length;){
      const n=data[p];if(!n){p=(Math.floor(p/sec)+1)*sec;continue}
      assert.ok(n>=34&&p+n<=data.length);
      const name=data.toString("ascii",p+33,p+33+data[p+32]).replace(/;\d+$/,"").toUpperCase();
      const next=data.readUInt32LE(p+2),size=data.readUInt32LE(p+10),dir=data[p+25]&2;p+=n;
      if(name==="\0"||name==="\x01")continue;
      if(dir){const result=walk(next,size,prefix+name+"/");if(result)return result}
      else if(name==="CORE.GZ"||name==="TINYCORE.GZ"){assert.ok(next*sec+size<=b.length);return {member:prefix+name,data:b.subarray(next*sec,next*sec+size)}}
    }return null;
  }
  const found=walk(vd.readUInt32LE(158),vd.readUInt32LE(166),"");
  assert.ok(found,"No core.gz ISO member");return found;
}
/** Obtain a bounded byte range and require actual HTTP 206. */
async function range(start,end){
  const spec=start===null?"bytes=-"+end:"bytes="+start+"-"+end;
  const r=await get(archiveUrl,{Range:spec,"Accept-Encoding":"identity"},cap);
  assert.equal(r.status,206,"archive must support Range");
  return r;
}
const num64=(b,at)=>{const n=Number(b.readBigUInt64LE(at));assert.ok(Number.isSafeInteger(n));return n};
async function archiveMember(){
  const tail=await range(null,131072),b=tail.data;
  const match=/bytes (\d+)-(\d+)\/(\d+)/.exec(tail.headers.get("content-range")||"");
  assert.ok(match,"missing Content-Range");const origin=Number(match[1]);
  let end=-1;
  for(let p=b.length-22;p>=0;p--)if(b.readUInt32LE(p)===0x06054b50&&p+22+b.readUInt16LE(p+20)===b.length){end=p;break}
  assert.ok(end>=0,"ZIP end record");
  let size=b.readUInt32LE(end+12),offset=b.readUInt32LE(end+16);
  if(size===0xffffffff||offset===0xffffffff){
    assert.equal(b.readUInt32LE(end-20),0x07064b50);
    const zoff=num64(b,end-12);
    const z=(zoff>=origin&&zoff+56<=origin+b.length)?b.subarray(zoff-origin,zoff-origin+56):(await range(zoff,zoff+55)).data;
    assert.equal(z.readUInt32LE(0),0x06064b50);
    size=num64(z,40);offset=num64(z,48);
  }
  assert.ok(size>0&&size<=cap,"central directory cap");
  const d=(await range(offset,offset+size-1)).data;
  const candidates=[];
  for(let p=0;p+46<=d.length;){
    assert.equal(d.readUInt32LE(p),0x02014b50,"central entry");
    const method=d.readUInt16LE(p+10),n=d.readUInt16LE(p+28),x=d.readUInt16LE(p+30),comment=d.readUInt16LE(p+32);
    let compressed=d.readUInt32LE(p+20),uncompressed=d.readUInt32LE(p+24),local=d.readUInt32LE(p+42);
    const name=d.toString("utf8",p+46,p+46+n),extra=d.subarray(p+46+n,p+46+n+x);
    if([compressed,uncompressed,local].includes(0xffffffff)){
      for(let q=0;q+4<=extra.length;){
        const id=extra.readUInt16LE(q),len=extra.readUInt16LE(q+2);q+=4;
        if(id===1){
          let z=q;
          if(uncompressed===0xffffffff){uncompressed=num64(extra,z);z+=8}
          if(compressed===0xffffffff){compressed=num64(extra,z);z+=8}
          if(local===0xffffffff)local=num64(extra,z);
          break;
        }q+=len;
      }
    }
    if(/(?:^|\/)4\.7\.2(?:\/|$)/i.test(name)||/4\.7\.2\.iso$/i.test(name)){
      if(/(?:^|\/)(?:core|tinycore)\.gz$/i.test(name)||/(?:^|\/)(?:core|tinycore)-4\.7\.2\.iso$/i.test(name))candidates.push({name,method,compressed,uncompressed,local});
    }
    p+=46+n+x+comment;
  }
  report.archiveCandidates=candidates.map(({name,compressed,uncompressed})=>({name,compressed,uncompressed}));
  candidates.sort((a,b)=>a.uncompressed-b.uncompressed);
  for(const e of candidates){
    if(e.compressed>cap||e.uncompressed>cap)continue;
    try{
      const h=(await range(e.local,e.local+29)).data;
      assert.equal(h.readUInt32LE(0),0x04034b50);
      const start=e.local+30+h.readUInt16LE(26)+h.readUInt16LE(28);
      const compressed=(await range(start,start+e.compressed-1)).data;
      const data=e.method===0?compressed:e.method===8?inflateRawSync(compressed,{maxOutputLength:cap}):null;
      assert.ok(data&&data.length===e.uncompressed);
      return {url:archiveUrl,archiveMember:e.name,data};
    }catch(e){report.attempts.push({archiveMember:true,error:String(e)})}
  }
  throw Error("No accessible exact 4.7.2 core image in archived mirror");
}
function baselineData(source){
  const {data}=source;
  const result=data[0]===0x1f&&data[1]===0x8b?{member:null,data}:isoCore(data);
  const entries=cpio(result.data);
  assert.equal(entries.get("usr/share/doc/tc/release.txt")?.data.toString(),"4.7.2\n","exact release");
  return {entries,member:result.member,sha256:hash(result.data)};
}
async function baseline(){
  const candidates=[
    "https://oldtc.antihttps.com/4.x/x86/archive/4.7.2/distribution_files/core.gz",
    "https://oldtc.antihttps.com/4.x/x86/archive/4.7.2/Core-4.7.2.iso",
    "https://oldtc.antihttps.com/4.x/x86/release/Core-4.7.2.iso",
    "https://mirror.cpsc.ucalgary.ca/mirror/tinycorelinux/4.x/x86/archive/4.7.2/distribution_files/core.gz",
    "https://mirror.cpsc.ucalgary.ca/mirror/tinycorelinux/4.x/x86/archive/4.7.2/Core-4.7.2.iso",
    "https://distro.ibiblio.org/tinycorelinux/4.x/x86/archive/4.7.2/Core-4.7.2.iso"
  ];
  // The archive is an explicitly indexed historical mirror, not a search of arbitrary sites.
  for(const url of candidates){
    try{const r=await get(url);const found=baselineData(r);return {source:{url:r.url,sha256:hash(r.data)},...found}}
    catch(e){report.attempts.push({url,error:String(e)})}
  }
  const source=await archiveMember();
  return {source:{url:source.url,archiveMember:source.archiveMember,sha256:hash(source.data)},...baselineData(source)};
}
/** @param {Map<string,any>} orig @param {Map<string,any>} base */
function delta(orig,base){
  const added=[],removed=[],changed=[],metadata=[],same=[];
  for(const [name,e] of orig){
    const b=base.get(name);
    if(!b)added.push({name,bytes:e.data.length,kind:e.kind,sha256:hash(e.data)});
    else if(e.kind!==b.kind||!e.data.equals(b.data))changed.push({name,originalBytes:e.data.length,baselineBytes:b.data.length,originalSha256:hash(e.data),baselineSha256:hash(b.data)});
    else{same.push(name);if(e.mode!==b.mode||e.uid!==b.uid||e.gid!==b.gid)metadata.push({name,original:[e.mode,e.uid,e.gid],baseline:[b.mode,b.uid,b.gid]})}
  }
  for(const [name,e] of base)if(!orig.has(name))removed.push({name,bytes:e.data.length,sha256:hash(e.data)});
  return {originalCount:orig.size,baselineCount:base.size,same:same.length,added,removed,changed,metadata};
}
async function main(){
  const original=(await get(originalUrl)).data;
  assert.equal(original.length,5494774);assert.equal(hash(original),originalSha);
  const orig=cpio(original);
  assert.equal(orig.get("usr/share/doc/tc/release.txt")?.data.toString(),"4.7.2\n");
  report.original={url:originalUrl,sha256:originalSha,release:"4.7.2",files:[...orig.values()].filter(e=>e.kind===0x8000).length,symlinks:[...orig.values()].filter(e=>e.kind===0xa000).length};
  report.original.cpioTypes=orig.types;
  assert.equal(orig.size,903,"regular files + symlinks (125 /dev special entries excluded)");
  assert.equal((orig.types[0x2000]||0)+(orig.types[0x6000]||0)+(orig.types[0x1000]||0),125,"special entries");
  const b=await baseline();
  report.baseline={...b.source,member:b.member,coreSha256:b.sha256,release:"4.7.2"};
  report.delta=delta(orig,b.entries);

  const passwdFields = (entries) => entries.get("etc/passwd").data.toString("utf8").trimEnd()
    .split(/\r?\n/).map(line => line.split(":"));
  const rootAccount = (entries) => {
    const row = passwdFields(entries).find(fields => fields[0] === "root");
    assert.ok(row && row.length >= 7, "root passwd row");
    return { uid: row[2], gid: row[3], home: row[5], shell: row[6] };
  };
  const oRoot = rootAccount(orig), bRoot = rootAccount(b.entries);
  report.semanticDelta = {
    rootAccount: { baseline: bRoot, original: oRoot },
    tcConfigSuperuserGuard: {
      baseline: 'if [ -n "$SUPERUSER" ]; then ... fi',
      original: '#if [ -n "$SUPERUSER" ]; then ... #fi',
      consequence: "touch /etc/sysconfig/superuser is unconditional",
    },
  };
  assert.deepEqual(
    {uid:oRoot.uid,gid:oRoot.gid,home:oRoot.home},
    {uid:bRoot.uid,gid:bRoot.gid,home:bRoot.home},
    "root account identity/home unexpectedly changed"
  );
  assert.equal(bRoot.shell, "/bin/sh");
  assert.equal(oRoot.shell, "/usr/local/bin/cicada");

  // Compare only public puzzle/OS code and configs; output hashes for all files.
  // Keep exact text diffs of small changed scripts, excluding account credential files.
  report.changedText=report.delta.changed.filter(e=>!/(?:^|\/)(?:shadow|gshadow|passwd)$/.test(e.name)).flatMap(e=>{
    const a=orig.get(e.name).data,bv=b.entries.get(e.name).data;
    if(a.length>20000||bv.length>20000||a.includes(0)||bv.includes(0))return [];
    return [{name:e.name,original:a.toString("utf8"),baseline:bv.toString("utf8")}];
  });
  report.status="compared";
}
main().catch(e=>{report.status="blocked";report.error=String(e)}).finally(()=>{
  const dest=path.join(process.env.RUNNER_TEMP||os.tmpdir(),"source-test-output.json");
  fs.writeFileSync(dest,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,original:report.original,baseline:report.baseline,delta:report.delta&&{same:report.delta.same,added:report.delta.added.length,changed:report.delta.changed.length,removed:report.delta.removed.length,metadata:report.delta.metadata.length},error:report.error,attempts:report.attempts},null,2));
});
