# Physical p33 preface: source-visible layout and historical seven-place read

**Agent4, 14 November 2026, Director #952. Decision:** The original first 91 runes form an intentional-looking *typographic* unit, but no independently authenticated cue selects an encryption or reading rule for it. The exact 2014 Stage05 seven-place inverse, frozen before using p33 output, yields no recognizable instruction. **No LP2 unknown plaintext or original key recovered.** This is a bounded source-reading decision, not a universal transposition or cipher exclusion.

## The actual visual input

Use original archive **`50.jpg` = LP2 physical p33**, adjacent p32 and pp34–39, the [canonical transcription](../resources/liber-primus/lp2-transcription.txt), [canonical GP29 indices](../resources/liber-primus/lp2-corpus.json) and [source-image-checked red ink](../resources/liber-primus/lp2-ink-annotations.json). The p33 first unit stops after original physical line five at a red **13-dot** marker and a separated horizontal three-dot break. A new oversized red **8-rune** rubric begins at local index 91. This boundary is independently real and aligns with a printed word boundary.

- The first oversized rubric is **10 red runes**, printed as two words of **2 and 8 runes**, with a red 13-dot sign at offset 10. The first two GP words transliterate `DEO XCFIAWHG`; they are ciphertext, not an authenticated plaintext title.
- The rest of the first unit has **81 black runes**. The whole unit contains **23 printed words** across **five physical lines**, whose rune counts are **[18,16,18,23,16]**, not a source-printed rectangular 7×13 array. Physical line wrapping carries words across line breaks; the 23-word count joins those continuations.
- The second red rubric is **8 runes** at local 91–98, with the following red 13-dot punctuation at 99. The bottom of p33 shows drawn cuneiform-style numerals historically transcribed as **1033 and 3301**. Their appearance does not specify a key, 7-column orientation, or use of the preface as plaintext.
- **91 = 7×13** and **81 = 9×9** are arithmetic descriptions of this fixed unit, not evidence that a human sees those arrays or that either geometry was prescribed.

The [visual chapter map](lp2-global-original-visual-section-map.md) already establishes the chapter p33–39. Existing finite source tests include the [91+8 / 99-element three-square GF29 matrix inverse](lp2-p33-91plus8-stage10-three-square-gate.md) and the [1680-rune 5×7 matrix inverse](lp2-p33-39-stage10-magic-tensor5x7.md), both unsuccessful. The first source-visible seven-column family elsewhere is the authenticated 2014 Stage05 puzzle; the actual original [Stage04×Stage05 transfer](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md) tests p33 **from offset 91 onward**, leaving this exact local 91-rune reading a distinct finite target.

## One frozen source-era read and result

The historical 2014 Stage05 solution supplies one exact ciphertext-to-output order on consecutive seven-place groups: **[0,6,2,5,1,4,3]**. Applying it directly to the complete original **91 = 13×7** prologue, from its printed first rune and without a GP key, phase variation, alternate order or padding, gives this complete GP-token output:

```
D A X I EO F C W T G F H OE EO E G EA S OE IA A Y O N R EA AE TH IA D W Y M M X B AE R H T J U OE F NG S IA H W IA T TH W L I T O S N L U M W TH AE W J EA A J G IA M P Y D W E W W H J U E NG L S J I G AE
```

There is no recognizable independent short English instruction or typed key in that output. Its GP29 IoC is **0.031990231990**, identical to the original by mathematical necessity (reordering changes no symbol frequencies). For comparison, the first 91 genuinely solved original p57 runes give IoC **0.060317460317**. These 91-rune diagnostics are descriptive, and do not exclude non-English or a further independently indicated decryption layer. A complete original 91/91 reconstruction and a 91/91 planted solved-p57 inversion verify this specific implementation without conferring historical authenticity.

**Reproducer:** [single-file original-source Node 22 check](../sims/lp2_p33_original_five_line_stage05_sft.cjs). This executable pins the five line counts, 23 original words, red spans, 91 marker and exact original rune sequence; it prints the output and round-trip controls. No original ciphertext or punctuation is altered.

## Missing selector and the Director fork

The five actual printed lines and red/black rubric distinction are human-visible, but the preceding solved Cicada material does not tell a player to select p33, partition its initial 91 runes into thirteen arbitrary seven-tuples, apply Stage05, or extract a key from the result. Although one literal historical read was checked, **the premise for treating that reading as an intended instruction fails the independent-selector gate**. Further shifts, alternate 7×13 column traversals, matrix powers, or letter-frequency ranking would tune on the same ciphertext after seeing a negative result.

Retire the *p33 local-preface-as-seven-place-standalone-instruction* route unless a dated author-authenticated clue specifies its operation or a new archival original plaintext witness appears. The 91-rune region remains unknown ciphertext, and the boundary may still have a role in a mechanism selected elsewhere.
