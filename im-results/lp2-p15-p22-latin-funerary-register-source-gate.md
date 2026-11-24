# p15–22 Latin funerary register: source-addressed decision

24 November 2026 · Agent16 · Director #2498. **No new plaintext or key.** This tests a specific Latin-in-English chapter-register hypothesis; it does not reject Latin prose in general.

## Source cue and competing interpretation

The original LP2 p22 (archive 39.jpg) ends a section above a three-crossbar object and a reclining figure. In the context of the literal Latin-script title LIBER PRIMUS (archive 00.jpg) and Chapter 1 / Intus (02.jpg), a conventional Latin death-related formula at the beginning or end of this section is a reasonable bounded hypothesis. The exact cue is the deathbed figure, not a low dictionary score. Its strongest rival is a thematic English koan or instruction: the same figure is horizontally mirrored from solved LP1 pages 14–16, whose text is English (see [original artwork decision](lp2-p22-corpse-source-plate-decision.md)). The explicit Latin-script Intus label also introduces English solved text. Thus neither Latin-script titling nor this particular drawing independently selects Latin rune prose.

The original LP1 p5 magic square includes Latin-looking or borrowed lexical items such as OBSCURA, AETHEREAL and MOBIUS as individual numeric operands alongside English words. That mixed vocabulary has a typed arithmetic context; it is not precedent for translating an entire rune paragraph into Latin. See [solved reference](../resources/liber-primus/lp1-plaintext-reference.txt). This is a source-specific distinction from the already completed rubric-clock survey #816 and generic grapheme grammar #2429.

## New literal-formula gate

Use only the original p15–22 physical chapter, its red rubric locations and its final printed stop, keeping printed words intact and all original line and page carries joined. The narrow primary candidate is the conventional Latin expression MEMENTO MORI; REQUIESCAT IN PACE is a rival Latin epitaph rather than an alternate key. English comparisons are REMEMBER DEATH and the genuine solved LP1 instruction EXPERIENCE YOUR DEATH. There is no first-party claim that either Latin expression is the literal text. These are finite thematic candidates, chosen by the imagery rather than evidence of a matching original cipher key; this is a retrospective gate, not a blinded significance test.

The source GP29 normalization folds K/Q→C, V→U, Z→S and greedily contracts ING, TH, NG, EO, OE, AE, IA, IO and EA. Neither Latin expression contains a contracted digraph, so its shape is also the raw Latin-character shape. The two English controls illustrate the distinction.

| Candidate | Native GP lengths | Exact contiguous matches anywhere in p15–22 (437 words) |
| --- | --- | ---: |
| MEMENTO MORI | 7,4 | 6 |
| REQUIESCAT IN PACE | 10,2,4 | 0 |
| REMEMBER DEATH | 8,3 | 4 |
| EXPERIENCE YOUR DEATH | 10,4,3 | 0 |

Original chapter: 1,903 runes, 437 complete words. The two source p15 red rubrics have exact word lengths [4,5] and [4,2,5]; the final p22 stop closes the four-word clause [5,3,3,3]. No candidate is an exact rubric or terminal suffix under either raw Latin-character or native GP lengths. The six unrestricted MEMENTO MORI shape hits start at zero-based chapter word indices 80,102,140,261,308,415, none at an independently selected address. They are not plaintext matches. REQUIESCAT IN PACE is excluded everywhere in this chapter under an intact-word, length-preserving cipher regardless of key or evolving state. English controls do not provide a unique receiver either.

No language prior is justified for a reversible decoder by this source cue: the strongest authentic artwork control is explicitly English and the specific terminal Latin formula hypothesis fails before key fitting. A changed segmentation, different Latin wording or unknown language elsewhere escapes this finite test, but none is selected by the original images. Reopening requires an independent original inscription, named text, or precise instruction that selects the register and location. Do not commission a new Latin key sweep based on this motif.

## Reproduce

Run this CommonJS snippet from repository root with Node 22. It reads the exact canonical transcription (observed blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7), preserves physical page order and joins line/page carry text. The p15 red boundary counts are independently specified by the original ink annotation. The run used the connected JavaScript runtime on the repository bytes, not Windows CI.

```js
const fs = require('node:fs');
const assert = require('node:assert/strict');
const pages = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8').split('%');
const strip = s => s.replace(/[/\r\n]/g, '');
const words = s => [...s.matchAll(/[\u16a0-\u16ff]+/gu)].map(m => m[0]);
const lens = w => w.map(x => [...x].length);
const gp = s => s.toUpperCase().replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S')
  .match(/ING|TH|NG|EO|OE|AE|IA|IO|EA|[A-Z]/g) || [];
const p15 = strip(pages[15]);
const p22 = strip(pages[22]);
const clause = p22.split('.').map(words).filter(w => w.length).at(-1);
const chapter = words(strip(pages.slice(15,23).join('')));
assert.equal(chapter.length, 437);
assert.equal(chapter.reduce((a,w) => a+w.length, 0), 1903);
assert.deepEqual(lens(words(p15.split('.')[0])), [4,5]);
assert.deepEqual(lens(words(p15.split('.')[1])), [4,2,5]);
assert.deepEqual(lens(clause), [5,3,3,3]);
for (const [phrase,expected] of [
  ['MEMENTO MORI',[80,102,140,261,308,415]],
  ['REQUIESCAT IN PACE',[]],
  ['REMEMBER DEATH',[114,183,186,346]],
  ['EXPERIENCE YOUR DEATH',[]]
]) {
  const shape = phrase.split(' ').map(w => gp(w).length);
  const hits = chapter.flatMap((_,i) =>
    shape.every((x,j) => chapter[i+j]?.length === x) ? [i] : []);
  assert.deepEqual(hits,expected);
  console.log(phrase,shape,hits);
}
```

The code tests shape, not cipher semantics; exact forward re-encryption is irrelevant without a nominated reversible cipher. This is a finite source-location decision, not a new manuscript-wide register theorem.
