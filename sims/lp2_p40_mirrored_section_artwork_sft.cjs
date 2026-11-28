#!/usr/bin/env node
'use strict';

/*
 * Agent13 — original-scan p40 mirrored-section artwork gate.
 *
 * Windows-only deterministic visual-source test using System.Drawing already
 * available on GitHub's windows-latest runner. It decodes every original JPEG,
 * hashes fixed outer-border pixel crops, and asserts that the p40 border begins
 * an exact 16-page visual section p40..p55 (archive 57.jpg..72.jpg).
 *
 * Usage: node sims/lp2_p40_mirrored_section_artwork_sft.cjs
 */

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');

const root=path.resolve(__dirname,'..');
const imageDir=path.join(root,'resources','liber-primus');
for(let n=0;n<=74;n+=1){
  const p=path.join(imageDir,String(n).padStart(2,'0')+'.jpg');
  assert.ok(fs.existsSync(p),`missing original scan ${p}`);
}

const psPath=path.join(os.tmpdir(),`lp2-p40-art-${process.pid}.ps1`);
const escaped=imageDir.replace(/'/g,"''");
const ps=`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$dir = '${escaped}'

function Get-CropHash([System.Drawing.Bitmap]$bmp, [int]$x, [int]$y, [int]$w, [int]$h) {
  $rect = [System.Drawing.Rectangle]::new($x,$y,$w,$h)
  $crop = $bmp.Clone($rect,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  try {
    $ms = [System.IO.MemoryStream]::new()
    try {
      $crop.Save($ms,[System.Drawing.Imaging.ImageFormat]::Bmp)
      $sha = [System.Security.Cryptography.SHA256]::Create()
      try {
        $bytes = $sha.ComputeHash($ms.ToArray())
        return ([System.BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()
      } finally { $sha.Dispose() }
    } finally { $ms.Dispose() }
  } finally { $crop.Dispose() }
}

$out = @()
for($n=0; $n -le 74; $n++) {
  $name = ('{0:d2}.jpg' -f $n)
  $p = Join-Path $dir $name
  $bmp = [System.Drawing.Bitmap]::new($p)
  try {
    if($bmp.Width -ne 2400 -or $bmp.Height -ne 3600) {
      throw "unexpected dimensions for $($name): $($bmp.Width)x$($bmp.Height)"
    }
    $left  = Get-CropHash $bmp 0 600 380 2400
    $right = Get-CropHash $bmp 2020 600 380 2400
    $center = Get-CropHash $bmp 700 600 1000 2400
    $out += [pscustomobject]@{n=$n;left=$left;right=$right;center=$center}
  } finally { $bmp.Dispose() }
}
$out | ConvertTo-Json -Compress
`;

fs.writeFileSync(psPath,ps,'utf8');
let proc;
try{
  proc=spawnSync('pwsh',['-NoProfile','-File',psPath],{
    cwd:root,encoding:'utf8',maxBuffer:16*1024*1024
  });
}finally{
  try{fs.unlinkSync(psPath);}catch{}
}
if(proc.error) throw proc.error;
if(proc.status!==0){
  throw new Error(`PowerShell visual census failed (${proc.status}):\n${proc.stderr}\n${proc.stdout}`);
}
const rows=JSON.parse(proc.stdout.trim());
assert.equal(rows.length,75);

const target=rows.find(x=>x.n===57);
assert.ok(target);
const sameBoth=rows.filter(x=>x.left===target.left&&x.right===target.right).map(x=>x.n);
const sameLeft=rows.filter(x=>x.left===target.left).map(x=>x.n);
const sameRight=rows.filter(x=>x.right===target.right).map(x=>x.n);
const expected=Array.from({length:16},(_,i)=>57+i);
assert.deepEqual(sameBoth,expected);
assert.deepEqual(sameLeft,expected);
assert.deepEqual(sameRight,expected);

// The border is reused while page bodies change: all 16 center hashes differ.
const centers=new Set(rows.filter(x=>x.n>=57&&x.n<=72).map(x=>x.center));
assert.equal(centers.size,16);

// Charge exact outer-frame runs across all 75 original scans rather than only
// the target. The two final large unsolved runs begin at route nodes p27 and
// p40; p40..p55 is the longest exact outer-frame run in the archive.
const frameKey=row=>row.left+'|'+row.right;
const frameRuns=[];
let runStart=0;
for(let i=1;i<=rows.length;i+=1){
  if(i===rows.length||frameKey(rows[i])!==frameKey(rows[runStart])){
    frameRuns.push({archiveStart:runStart,archiveEnd:i-1,length:i-runStart});
    runStart=i;
  }
}
assert.ok(frameRuns.some(r=>r.archiveStart===44&&r.archiveEnd===56&&r.length===13));
assert.ok(frameRuns.some(r=>r.archiveStart===57&&r.archiveEnd===72&&r.length===16));
assert.equal(Math.max(...frameRuns.map(r=>r.length)),16);
assert.equal(frameRuns.filter(r=>r.length===16).length,1);

// LP2 p0 begins at archive 17.jpg, so archive57..72 == p40..p55.
assert.deepEqual(expected.map(x=>x-17),Array.from({length:16},(_,i)=>40+i));

console.log(JSON.stringify({
  status:'PASS',
  classification:'source-visible operation-switch evidence; not plaintext recovery',
  archiveImages:expected,
  lp2Pages:expected.map(x=>x-17),
  leftCrop:{x:0,y:600,w:380,h:2400,hash:target.left},
  rightCrop:{x:2020,y:600,w:380,h:2400,hash:target.right},
  centerHashesDistinct:centers.size,
  frameRuns:frameRuns.map(r=>({
    ...r,
    lp2Start:r.archiveStart>=17?r.archiveStart-17:null,
    lp2End:r.archiveEnd>=17?r.archiveEnd-17:null,
  })),
  decision:'p27 begins a 13-page exact frame run and p40 begins the unique longest 16-page run p40..p55; p40 is a section transition, not a p40-only STOP marker.',
},null,2));
