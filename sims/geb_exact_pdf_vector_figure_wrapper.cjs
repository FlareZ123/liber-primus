'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const script='sims/geb_exact_pdf_dialogue_vector_only_sft.py';
assert(fs.existsSync(script));
const run=cp.spawnSync('python',[script],{encoding:'utf8',timeout:720000,maxBuffer:50*1024*1024});
if(run.stdout)console.log(run.stdout.slice(-60000));
if(run.stderr)console.error(run.stderr.slice(-5000));
if(run.error)throw run.error;
assert.strictEqual(run.status,0,'Python source-gated vector scanner failed');
const p='geb_vector_selected_dialogues_output.json';
const result=JSON.parse(fs.readFileSync(p,'utf8'));
assert.strictEqual(result.selected_dialogues,14);
assert(result.selected_physical_pages>=100);
const tempfile=process.env.RUNNER_TEMP;
if(tempfile)fs.copyFileSync(p,path.join(tempfile,'source-test-output.json'));
console.log('EXACT_GEB_VECTOR_GATE='+JSON.stringify({
 source_sha256:result.source_sha256,physical_pages:result.selected_physical_pages,
 raw_drawings:result.raw_drawings,eligible:result.substantive_drawings,
 selected_pages:result.pages_with_2d_multiop_drawings,
 per_dialogue:result.per_dialogue
}));
