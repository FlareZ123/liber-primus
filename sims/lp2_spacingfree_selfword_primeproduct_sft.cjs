"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const experiment=require("./lp2_spacingfree_selfword_primeproduct_core.cjs"),root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),true);
assert.equal(result.gate,true);assert.deepEqual(result.controls.map(c=>c.truthRunes),[515,772,755,319]);assert.deepEqual(result.original.map(c=>c.maxKnownRunes),[300,678]);console.log(JSON.stringify(result,null,2));
