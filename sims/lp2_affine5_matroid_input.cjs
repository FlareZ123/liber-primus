const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const d=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const a=process.argv[2]==='p3'?[3,7,0]:process.argv[2]==='p23'?[23,26,16]:null;if(!a)throw Error('Choose p3 or p23');
const raw=c.pages.slice(a[0],a[1]+1).flatMap(x=>x.indices).slice(a[2]);
const lines=[raw,...d.sections.map(s=>Array.from(s.source_text).filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x)))];
process.stdout.write(lines.map(v=>v.map(x=>x.toString(29)).join('')).join('\n')+'\n');
