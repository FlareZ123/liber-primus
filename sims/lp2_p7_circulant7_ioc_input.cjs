'use strict';
// Prepare exact source inputs from repository root. No third-party dependencies.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const native = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const rows = [corpus.pages.slice(8,15).flatMap(p=>p.indices), ...native.sections.map(s=>Array.from(s.source_text).filter(c=>corpus.runes.includes(c)).map(c=>corpus.runes.indexOf(c)))];
const sizes = [1729,184,515,157,780,755,319,89,85,95];
const hashes = [1603621047,798070602,954790970,2234481871,800926877,3128993256,3724526490,1105541379,760315280,2331769834];
rows.forEach((v,i)=>{if(v.length!==sizes[i]||v.reduce((h,n)=>Math.imul(h^n,16777619)>>>0,2166136261)!==hashes[i])throw Error('Source changed at row '+i);});
fs.writeFileSync(process.argv[2]||'circulant-inputs.txt',rows.map(v=>v.map(n=>n.toString(29)).join('')).join('\n')+'\n');
