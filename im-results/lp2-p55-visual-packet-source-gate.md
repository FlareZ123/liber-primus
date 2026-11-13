# P55 printed-line packet hypothesis: original layout selects no alternate plaintext segmentation

**Director #745, original-page decision (Agent 3, 13 November 2026).** On the actual original p55 scan, the four printed text lines and the 13-dot red terminal glyph are visible. Their exact source content supplies **no independent, reversible ciphertext-packet grammar** that would change the 16 printed complete-word boundaries while yielding prospective plaintext. The separately solved original p57 provides an unusually direct control: its clear words also span arbitrary printed lines. A line-cut decoding hypothesis would need an additional author-selected cipher and a rule for supplying plaintext word cuts. Neither is present in these inspected cues.

## The exact p55 constraint

Original scans: [physical p54](../resources/liber-primus/71.jpg), [physical p55](../resources/liber-primus/72.jpg) and [solved physical p57](../resources/liber-primus/74.jpg). The [canonical source transcription](../resources/lp2-transcription.txt) is checked rune-for-rune against [canonical GP indices](../resources/liber-primus/lp2-corpus.json).

Physical p54's last printed word runs off the page. Physical p55 supplies its concluding **NG** rune, followed by a printed word break and **75 further runes in 16 complete words**. P55's four real printed line lengths are **24 / 22 / 22 / 8**, counting that carried rune. The source word lengths including the one-rune p54 carry are **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. No letters, marks, spaces, or page transitions have been invented or discarded.

| Page | Original line lengths | Interior line ends (one-based rune offsets) | Line ends splitting a printed word |
| --- | --- | --- | --- |
| Unsolved p55 | 24, 22, 22, 8 | 24, 46, 68 | **24 inside the 13-rune word 7; 68 inside six-rune word 14** |
| Already clear p57 | 20, 17, 17, 18, 23 | 20, 37, 54, 72 | **20, 54, 72** |

P55's first **45 body runes** happen to be the first two printed lines **after excluding the initial p54 NG carry** (24+22−1). Its last **30 body runes** occupy printed lines three and four (22+8). This provides a convenient *physical holdout*, but there is no separate printed delimiter or key at the 45/30 boundary.

The source-clear p57 is the independent counterexample to treating every line boundary as a message-packet break. It crosses at least three clear word interiors at physical line ends, in the same compositor's runic layout. Reversing or reseparating p55 based only on these lines would require an unprovided new rule to decide where to put plaintext words. Even if one gratuitously assumed exactly 16 plaintext words in 75 symbols, there are **1,824,010,149,372,864** ways to place the 15 internal breaks. A language-model optimum over them would not establish an intended puzzle operation.

## Reused red stencil cannot uniquely select p55 packets

The 13 small red rectangles after p55's last glyph form a **reused exact 13-point shape**, also present in p54's red heading, p56's red heading, and p57's red heading. This is verified directly from the respective original JPEGs 71.jpg, 72.jpg, 73.jpg and 74.jpg, using one threshold (R>90, R>1.9G and R>1.9B, G<100), four-connected red components with 75–119 foreground pixels and their original (x,y) top-left positions. All four have the *same 13 normalized coordinates*, under simple translation:

`(0,12),(0,30),(0,47),(0,64),(15,0),(15,20),(15,38),(15,58),(15,76),(30,12),(30,30),(30,47),(30,64)`.

The original bounding-box coordinate origins are p54 **(1193,931)**, p55 **(1034,1252)**, p56 **(964,687)** and p57 **(1140,931)**. Thus the 13 red marks are a repeatable graphic motif. Their count happens also to match p55 word7's length, but there is no special source link instructing a player to treat that word as a 13-unit decoding packet. P57's terminal **23-dot** red graphic is a separately shaped glyph and must not be conflated with this 13-point shape.

## Decision and scope

This excludes the **visible-line or 13-stencil-as-p55-packet-selector** premise without needing to fit secret keys to text. It **does not prove** that encrypted text's printed word divisions coincide with plaintext divisions, rule out an unknown formatter, or test a hypothetical source-keyed variable-length cipher whose instructions are yet to be found.

No source-qualified reversible alternative parser was found, so the task's expensive first-45/final-30 language holdout and wrong-family key controls have no specified decoder to operate on. Running such searches would require choosing both cuts and cipher after inspecting ciphertext, directly violating #745's independent-selector gate. Reopen only when a specific primary-source operation explains *all 76 runes*, the p54 carry and how new plaintext word boundaries are recovered.

**Runnable input contract:** [p55 source-packet SFT](../sims/lp2_p55_visual_packet_source_gate_sft.cjs) asserts the original exact rune stream, both line-length vectors, the across-page carry, 17 original p55 glyph groups, p55's two cross-word line ends, solved p57's three cross-word line ends and exact packet reassembly in both sources. There is no hidden key or model-scored ciphertext output.
