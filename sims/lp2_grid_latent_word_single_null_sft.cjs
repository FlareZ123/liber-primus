"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const run=require("./lp2_grid_latent_word_single_null_core.cjs"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const result=run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),true,JSON.parse(read("resources/liber-primus/lp2-grid-256.json")));
assert.equal(result.model.gate,true);assert.deepEqual(result.controls.map(c=>c.correct),[513,776,748,316,513,776,742,317,513,775,743,317]);console.log(JSON.stringify(result));
