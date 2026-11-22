'use strict';

/**
 * Independently date-pinned 2015 LP2 JPEG byte and decoded-pixel comparison.
 * SFT: Node 22 in existing manual-readonly-commonjs-sft.yml workflow.
 * @typedef {{path:string,sha:string,size:number,type:string}} GitEntry
 */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const repo='thomasandfriends/Cicada3301Runes';
const commit='52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35';
const treeUrl='https://api.github.com/repos/'+repo+'/git/trees/'+commit+'?recursive=1';
const folder=path.join(__dirname,'..','resources','liber-primus');

/** @param {Buffer} buf */
function gitSha(buf){
  return crypto.createHash('sha1').update(Buffer.from('blob '+buf.length+'\0')).update(buf).digest('hex');
}
/** @param {Buffer} buf */
function withoutJfif(buf){
  if(buf.subarray(0,11).toString('hex')!=='ffd8ffe000104a46494600') return null;
  return Buffer.concat([buf.subarray(0,2),buf.subarray(20)]);
}
/** @param {string} url */
async function retrieve(url){
  const r=await fetch(url,{headers:{'User-Agent':'lp2-original-2015-comparison'}});
  if(!r.ok) throw new Error('HTTP '+r.status+' '+url);
  return Buffer.from(await r.arrayBuffer());
}
/**
 * @param {Buffer} original
 * @param {Buffer} alternate
 * @param {typeof import('sharp')} sharp
 */
async function compareRgb(original,alternate,sharp){
  const a=await sharp(original).toColourspace('srgb').removeAlpha().raw().toBuffer({resolveWithObject:true});
  const b=await sharp(alternate).toColourspace('srgb').removeAlpha().raw().toBuffer({resolveWithObject:true});
  const shape=[a.info.width,a.info.height,a.info.channels].join('x');
  const other=[b.info.width,b.info.height,b.info.channels].join('x');
  if(shape!==other)return {shape,other,dimensionsDiffer:true};
  const channels=a.info.channels,pixels=a.info.width*a.info.height;
  let changed=0,large=0,veryLarge=0,sum=0,max=0;
  const histogram=Array(16).fill(0);
  for(let p=0;p<pixels;p++){
    let md=0;
    for(let c=0;c<channels;c++){
      const diff=Math.abs(a.data[p*channels+c]-b.data[p*channels+c]);
      if(diff>md)md=diff;
      sum+=diff;
    }
    if(md)changed++;
    if(md>=24)large++;
    if(md>=64)veryLarge++;
    if(md>max)max=md;
    histogram[Math.min(15,Math.floor(md/16))]++;
  }
  return {shape,changedPixels:changed,changedPct:+(changed/pixels*100).toFixed(4),
    pixelsDeltaGE24:large,pixelsDeltaGE64:veryLarge,maxChannelDifference:max,
    meanAbsChannelDifference:+(sum/a.data.length).toFixed(6),
    originalRgbSha256:crypto.createHash('sha256').update(a.data).digest('hex'),
    alternateRgbSha256:crypto.createHash('sha256').update(b.data).digest('hex'),
    histogram};
}
async function main(){
  const tree=JSON.parse((await retrieve(treeUrl)).toString('utf8'));
  /** @type {GitEntry[]} */
  const entries=tree.tree.filter(x=>/^pics\/runebook\/\d{2}_-_.+\.jpg$/.test(x.path));
  entries.sort((a,b)=>Number(a.path.match(/runebook\/(\d{2})/)[1])-Number(b.path.match(/runebook\/(\d{2})/)[1]));
  if(entries.length!==58)throw new Error('Archive requires exactly 58 pages; got '+entries.length);
  const install=fs.mkdtempSync(path.join(os.tmpdir(),'lp2-2015-rgb-'));
  execFileSync('npm',['install','--no-save','--no-audit','--no-fund','--prefix',install,'sharp@0.35.5'],{
    shell:process.platform==='win32',stdio:'inherit',timeout:180000});
  const sharp=require(path.join(install,'node_modules','sharp'));
  const counts={byteEqual:0,onlyJfif:0,pixelsEqual:0,pixelsChanged:0};
  for(let n=0;n<58;n++){
    const e=entries[n],physical=n+17;
    if(Number(e.path.match(/runebook\/(\d{2})/)[1])!==n+1)throw new Error('Archive number gap '+e.path);
    const orig=fs.readFileSync(path.join(folder,String(physical).padStart(2,'0')+'.jpg'));
    const alt=await retrieve('https://raw.githubusercontent.com/'+repo+'/'+commit+'/'+e.path);
    if(gitSha(alt)!==e.sha)throw new Error('Git object integrity mismatch '+e.path);
    const row={physical,archive:n+1,source:e.path,origBytes:orig.length,altBytes:alt.length,
      origSha:gitSha(orig),altSha:gitSha(alt)};
    const stripped=withoutJfif(orig);
    if(row.origSha===e.sha){row.kind='byteEqual';counts.byteEqual++;}
    else if(stripped&&gitSha(stripped)===e.sha){row.kind='onlyJfif';counts.onlyJfif++;}
    else {
      row.pixels=await compareRgb(orig,alt,sharp);
      row.kind=row.pixels.originalRgbSha256===row.pixels.alternateRgbSha256?'pixelsEqual':'pixelsChanged';
      counts[row.kind]++;
    }
    console.log('PAGE '+JSON.stringify(row));
  }
  console.log('SUMMARY '+JSON.stringify({repo,commit,committedAt:'2015-01-09T23:39:25Z',counts}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
