# LP2 AN INSTRUCTION repeated-heading recovery gate

**Decision for [#2502](https://github.com/FlareZ123/liber-primus/issues/2502): no eligible source-selected crib.** The independently known title has 2+10 native GP runes and no unknown rubric matches those lengths. Therefore the stipulated known-plaintext key inference has no source-fixed input. No ciphertext key fitting was performed, and no new plaintext is claimed.

## Source controls and masked census

The three genuine LP1 AN INSTRUCTION headings are archive09,13,16, with shifted reflection on archive09 and identity on the other two. See [the matched heading controls](lp2-clear-island-solved-boundary-gate.md). The printed title is `ᚪᚾ / ᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ`, 2+10, not ordinary Latin character counts. Formatting alone does not select its decoding law.

Using `resources/liber-primus/lp2-transcription.txt` (blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7) and `lp2-ink-annotations.json`, split on %, restore runeless p50, count runes only, then mask rune identities. Every annotated span length agrees with the physical page's rune count. The following are the complete unknown-page red spans, preserving word divisions:

| Physical page | Rune offset | Span pattern |
|---|---:|---|
| 0 | 0 | 8+5 |
| 3 | 0 | 2+11+3 |
| 3 | 119 | 3 |
| 6 | 71 | 4+1+4+2 |
| 7 | 194 | 2+4 . 3+2+3 |
| 8 | 0 | 4+8 |
| 15 | 0 | 4+5 |
| 15 | 9 | 4+2+5 |
| 23 | 0 | 2+6+3+5 |
| 27 | 0 | 3+12+4 |
| 33 | 0 | 2+8 |
| 33 | 91 | 3+5 |
| 39 | 119 | 3 |
| 40 | 0 | 3+5 |
| 53 | 128 | 51-rune red passage, twelve complete words, first word wraps after its initial rune (see lp2-page53-red-verse.md) |
| 54 | 0 | 1+8 |

The sole twelve-rune red span, p8, is 4+8 in the canonical transcription. Original archive25.jpg inspected directly: a red enlarged initial and red small glyphs form two differently sized words ending at an ordinary red separator; black body begins on the same line. There is a tree illustration rather than a separate instruction rubric with large punctuation. No independent semantic cue supplies AN INSTRUCTION, and the observed layout rejects the stipulated 2+10 alignment. The source annotation preview exposed p8 rune values before screening, so this is a layout eligibility test, not a claim of a blinded plaintext experiment.

Also screen every physical page start and every post-large-mark text start for the exact initial pattern 2+10. Neither set contains a candidate in p0–55. This rejects the title crib under the stipulated intact-word, source-marked heading interpretation; it does not reject altered segmentation or a different title.

## Reproduction

From repository root, run the following JS with Node:

```js
const fs = require('node:fs');
const dir = 'resources/liber-primus/';
const pages = fs.readFileSync(dir+'lp2-transcription.txt','utf8')
  .split('%').map(s=>s.trim()).filter(Boolean);
pages.splice(50,0,'');
const annotations = JSON.parse(fs.readFileSync(dir+'lp2-ink-annotations.json','utf8'));
const rune = /[\u16a0-\u16ea]/g;
for (const p of annotations.pages.filter(p=>p.page<56)) {
  const s=pages[p.page];
  const positions=[...s.matchAll(rune)].map(m=>m.index);
  if (positions.length!==p.rune_count) throw Error('page count '+p.page);
  for(const {start,length} of p.red_spans||[]) {
    console.log(p.page,start,length,s.slice(positions[start],positions[start+length-1]+1).replace(rune,'x'));
  }
}
const pattern = /^xx-xxxxxxxxxx(?:[^x]|$)/;
for(const [p,s] of pages.slice(0,56).entries()) {
  const mask=s.replace(rune,'x');
  if(pattern.test(mask)) console.log('page start',p);
  for(const section of mask.split('&').slice(1))
    if(pattern.test(section.trim().replace(/^[%$\s]+/,''))) console.log('post mark',p);
}
```

The equivalent code was executed against the repository source in connected V8. Reopen only if new first-party evidence fixes a different segmentation or genuinely specific repeated title. The known matched titles are real controls; they do not themselves supply an LP2 crib.
