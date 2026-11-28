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

// Exact LP2 frame-run state tape. Take every non-singleton exact outer-frame
// run in printed LP2 order; this criterion is fixed by the pixel census alone.
const lp2Runs=frameRuns
  .map(r=>({
    lp2Start:r.archiveStart-17,
    lp2End:r.archiveEnd-17,
    length:r.length,
  }))
  .filter(r=>r.lp2End>=0);
const nonSingleton=lp2Runs.filter(r=>r.length>1);
assert.deepEqual(nonSingleton,[
  {lp2Start:1,lp2End:2,length:2},
  {lp2Start:4,lp2End:7,length:4},
  {lp2Start:15,lp2End:21,length:7},
  {lp2Start:27,lp2End:39,length:13},
  {lp2Start:40,lp2End:55,length:16},
  {lp2Start:56,lp2End:57,length:2},
]);
const runLengths=nonSingleton.map(r=>r.length);
assert.deepEqual(runLengths,[2,4,7,13,16,2]);

const mod29=x=>((x%29)+29)%29;
const cyclicDiffs=runLengths.map((x,i)=>mod29(runLengths[(i+1)%runLengths.length]-x));
assert.deepEqual(cyclicDiffs,[2,3,6,3,15,0]);

// Fixed primitive state vocabulary already established independently by the
// DH/state work. F=0 is admitted only for the cyclic closure.
const cycleState={K:2,e:3,a:6,b:15,F:0};
const cycleValues=new Set(Object.values(cycleState));
assert.ok(cyclicDiffs.every(x=>cycleValues.has(x)));
assert.deepEqual(
  cyclicDiffs.map(x=>Object.entries(cycleState).find(([,v])=>v===x)?.[0]),
  ['K','e','a','e','b','F']
);

// Reverse printed page order does not close in the same fixed vocabulary.
const reversed=runLengths.slice().reverse();
const reverseDiffs=reversed.map((x,i)=>mod29(reversed[(i+1)%reversed.length]-x));
assert.ok(!reverseDiffs.every(x=>cycleValues.has(x)));

// Bounded permutation charge: among all distinct permutations of the observed
// multiset, only the six rotations of this one cyclic order have every cyclic
// edge difference inside the fixed {K,e,a,b,F} state vocabulary. Equivalently
// there is exactly one qualifying cyclic arrangement among 60 distinct cycles.
const permSet=new Set();
function permute(a,l=0){
  if(l===a.length){
    permSet.add(a.join(','));
    return;
  }
  for(let i=l;i<a.length;i+=1){
    [a[l],a[i]]=[a[i],a[l]];
    permute(a,l+1);
    [a[l],a[i]]=[a[i],a[l]];
  }
}
permute(runLengths.slice());
assert.equal(permSet.size,360);
const qualifying=[];
for(const encoded of permSet){
  const seq=encoded.split(',').map(Number);
  const diffs=seq.map((x,i)=>mod29(seq[(i+1)%seq.length]-x));
  if(diffs.every(x=>cycleValues.has(x))) qualifying.push({seq,diffs});
}
assert.equal(qualifying.length,6);
const canonicalCycle=seq=>{
  const rotations=seq.map((_,i)=>seq.slice(i).concat(seq.slice(0,i)).join(','));
  return rotations.sort()[0];
};
const qualifyingCycles=new Set(qualifying.map(x=>canonicalCycle(x.seq)));
assert.equal(qualifyingCycles.size,1);
assert.ok(qualifyingCycles.has(canonicalCycle(runLengths)));

console.log(JSON.stringify({
  status:'PASS',
  classification:'source-visible operation-switch evidence; not plaintext recovery',
  archiveImages:expected,
  lp2Pages:expected.map(x=>x-17),
  leftCrop:{x:0,y:600,w:380,h:2400,hash:target.left},
  rightCrop:{x:2020,y:600,w:380,h:2400,hash:target.right},
  centerHashesDistinct:centers.size,
  frameStateTape:{
    nonSingleton,
    runLengths,
    cyclicDiffs,
    labels:['K','e','a','e','b','F'],
    reverseDiffs,
    distinctPermutations:permSet.size,
    qualifyingLinearRepresentations:qualifying.length,
    qualifyingCyclicOrders:qualifyingCycles.size,
  },
  frameRuns:frameRuns.map(r=>({
    ...r,
    lp2Start:r.archiveStart>=17?r.archiveStart-17:null,
    lp2End:r.archiveEnd>=17?r.archiveEnd-17:null,
  })),
  decision:'The six non-singleton LP2 frame runs are 2,4,7,13,16,2; their printed cyclic differences are [K,e,a,e,b,F], the unique qualifying cyclic order of this run-length multiset under the fixed primitive state vocabulary. P40 begins the final 16-page section, not a p40-only STOP marker.',
},null,2));
