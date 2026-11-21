'use strict';

/**
 * Static audit only. Download a version-pinned 2026 automatic LP2 27x27
 * decoder ZIP, assert its Git blob identity and inspect code with Python's
 * zipfile, without executing ANY external script. No repository writes.
 * Windows11 Node22 CommonJS, Python standard library.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const repo='2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption';
const upstream='1b72bdc80d0a9d9727104ad2fe277cbb77523701';
const url='https://raw.githubusercontent.com/'+repo+'/'+upstream+'/liber_primus_decoder.zip';
const expectedGitBlob='05a2091f4ec3c98e0352ab344cccb0cb0b015767';
/**
 * Python ZIP inspection via standard library, no import/execute of ZIP code.
 * @param {string} file
 * @param {string | null} name
 * @returns {string}
 */
function zipPython(file,name){
 const program=name===null
  ? 'import zipfile,sys,json;z=zipfile.ZipFile(sys.argv[1]);print(json.dumps([{"name":i.filename,"size":i.file_size,"compressed":i.compress_size} for i in z.infolist()]))'
  : 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);sys.stdout.buffer.write(z.read(sys.argv[2]))';
 const args=['-c',program,file];
 if(name!==null)args.push(name);
 return execFileSync('python',args,{encoding:'utf8',maxBuffer:8*1024*1024});
}
(async()=>{
 const request=await fetch(url);
 assert.equal(request.status,200,'immutable upstream ZIP');
 const data=Buffer.from(await request.arrayBuffer());
 assert.ok(data.length>300000&&data.length<2000000);
 const blob=crypto.createHash('sha1')
  .update(Buffer.from('blob '+data.length+'\x00'))
  .update(data).digest('hex');
 assert.equal(blob,expectedGitBlob,'immutable Git blob identity');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-ext27-'));
 const target=path.join(temp,'decoder.zip');
 try{
  fs.writeFileSync(target,data);
  const entries=JSON.parse(zipPython(target,null));
  const names=entries.filter(z=>!z.name.endsWith('/')).map(x=>x.name);
  const pythonFiles=names.filter(x=>/\.py$/i.test(x));
  console.log('PINNED-DECODER '+JSON.stringify({upstream,url,bytes:data.length,blob,entries,pythonFiles}));
  for(const name of pythonFiles){
   const source=zipPython(target,name);
   const sha256=crypto.createHash('sha256').update(source).digest('hex');
   console.log('PYTHON-SOURCE '+JSON.stringify({name,bytes:Buffer.byteLength(source,'utf8'),
    sha256,code:source.slice(0,28000)}));
  }
  for(const name of names.filter(x=>/(matrix\.txt|readme|config|dictionary)/i.test(x))){
   const raw=zipPython(target,name);
   console.log('SUPPORTING '+JSON.stringify({name,chars:raw.length,
    sha256:crypto.createHash('sha256').update(raw).digest('hex'),head:raw.slice(0,1800)}));
  }
 }finally{
  fs.rmSync(temp,{force:true,recursive:true});
 }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
