# LP2 p0 original-image correction: red8, 13-dot marker, black5

**Agent5, 16 November 2026. Primary-source correction, independently testable. No recovered unknown plaintext or key.**

## Source-visible fact and scientific implication

Original 2014 Liber Primus JPEG `resources/liber-primus/17.jpg` (physical LP2 page 0, SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`) shows the opening printed line as **eight red rune glyphs, then one red 13-dot punctuation glyph, then five black rune glyphs, then an ordinary black full stop**. Original rune identities are preserved:

| Original ink | Page-local GP rune offsets | GP29 indices | Transliteration |
| --- | --- | --- | --- |
| Red runes | 0–7 | 15, 8, 18, 3, 6, 19, 27, 0 | S H E O G M IA F |
| **Red 13-dot separator** | **after offset 7; before offset 8** | no GP rune | 13 visible dots |
| Black runes | 8–12 | 15, 26, 18, 21, 5 | S Y E NG C |
| Black full stop | after offset 12 | no GP rune | period |

The published original rune transcription begins with two visibly distinct 8-rune and 5-rune printed words, `ᛋᚻᛖᚩᚷᛗᛡᚠ-ᛋᚣᛖᛝᚳ.`; the first word is **entirely red** and the second **entirely black**. Its hyphen/period word breaks are correct. The physical **large marker is between the two words**, whereas the derived punctuation event mistakenly places it after the full 13-rune two-word heading. This alters any attempt to use that large marker to control the start of a new cipher stream.

## Independent solved-page layout control

The authentic **solved** LP2 p56 title consists of five red GP runes spelling `AN END`, followed by a red 13-dot chapter marker at **offset 5**; its following black prose begins `WITHIN THE DEEP WEB`. The authentic cleartext p57 title consists of seven red runes spelling `PARABLE`, followed by the same class of red 13-dot marker at **offset 7**; its following black prose begins `LIKE THE INSTAR`. These original layout roles match the newly observed **p0 title red8 → red 13-dot marker at offset 8 → first black body word black5**. The independent controls support interpreting the eight red p0 runes as one *chapter heading* rather than viewing the full 13-rune phrase as a continuous red heading. This does not say what that unknown title means or require the body to be in Latin.

**Cipher-clock control:** On p56, the authentic prime-minus-one key proceeds across that red 13-dot marker **without resetting**. The exact first ten ciphertext indices are `[25,11,22,15,4 | 19,26,20,3,8]`. Subtracting the consecutive prime-minus-one keys `[1,2,4,6,10 | 12,16,18,22,28]` modulo29 gives plaintext `[24,9,18,9,23 | 7,10,2,10,9]`, i.e. `AN END | WITHIN`. Incorrectly restarting the key after its title marker yields the nonword `EATYIA` for the second five. Consequently, a 13-dot marker independently signals chapter/title layout in this solved control, **not a universal encryption-key reset**. A distinct reset on p0 must be justified by its own independent instruction.

References: `resources/external/relikd-solved-gp29-native-v1.json`, sections `p56_an_end` and `p57_parable`; original LP2 p56/p57 `resources/liber-primus/73.jpg` and `74.jpg`; their source-ink annotation marks at offsets 5 and 7 respectively. These are independent of the public 27×27 Latin hypothesis.

## Exact discrepancy against derivative inventories

1. `resources/liber-primus/lp2-ink-annotations.json` p0 currently labels the **whole 13-rune** phrase as one red span beginning at 0 and puts the red 13-dot glyph at **rune offset 13**. Original photographic ink establishes red **length 8** and large punctuation **offset 8**. As a conditional bookkeeping consequence, its whole-book red count 225 would become **220** if all other records were held fixed; other pages have not been reaudited here.
2. `resources/liber-primus/lp2-punctuation-identity.json` event 0 (transcription-derivative) likewise records p0 large symbol at `local_rune_offset:13` and global `rune_offset:13`. Its **original-image physical** position is **8**, without adding or deleting any GP rune. The source punctuation is a 13-dot marker; a separate ordinary black period follows at rune13.

These historical derivative resources are **retained unchanged as records of their transcriptions** to avoid silently invalidating older experiments and regression inventories. The physical adjudication is stored in the authoritative **[p0 override](../resources/liber-primus/lp2-p0-physical-ink-override.json)**, where original p0 color, marker coordinates and the divergent derived fields are explicit. Future image-faithful code should consult this override for p0 and label uncorrected old source-derived analyses as such.

## Independent original-image pixel witness

The read-only [SFT](../sims/lp2_p0_red8_marker8_original_image_sft.py) pins the exact unchanged JPEG SHA-256, original canvas **2400×3600**, original GP13 prefix, three fixed crop rectangles, RGB/black thresholds and a connected-component count. Zero-based crop boxes `(left,top,right,bottom)`, exclusive on right/bottom:

| Source crop | Box | Red pixels | Near-black pixels excluding red |
| --- | --- | ---: | ---: |
| First eight runes | (765,640,1388,770) | **23,455** | 481 |
| Large red punctuation | (1399,640,1448,770) | **1,116** | 0 |
| Final five runes | (1449,640,1777,770) | **0** | 11,434 |

The 13 red punctuation components have widths 9–10px, heights 7–10px and sum to the 1,116 red pixels in the punctuation region. The first-eight crop's small near-black count comes from typographic holes/antialiasing; the decisive cross-color segregation is 23,455 red vs 0 red in the five-rune black crop. The test ran successfully on the user's byte-identical original `17.jpg`; the repo blob SHA `abab573f7a3786f46fe4fab17d5f2dcf2476136b` is the same as the local image Git blob.

## Consequence for purported Latin heading and next decision

The external [27×27 proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/Start-reading-here/red-heading-SEQUENDI-RATIO.md) deciphers **reversed red8** by an independently selected rectangle-derived *period-four* key `X–N–X–C` to `SECUENDI` (the standard GP C/K rune interpreted as Latin Q), and separately deciphers **forward black5** under a selected *period-three* key `J–TH–TH` to `RATIO`. This arithmetic reproduces exactly, and the original color/marker boundary **does agree with its proposed split**, a stronger source-constrained observation than treating all thirteen as a uniformly red string. It is still **candidate plaintext only**: the ciphertext itself does not specify either rectangle, triplet, key choice, direction or period; the 27×27 proposed 38-block route has already failed to produce a uniquely selected continuation under all of its published constraints ([full original-source successor screen](../sims/external_27square_nextblock_fullgate.cjs)).

**Next causal decision:** investigate the actual **red13-dot gate after red8** as a candidate authored operation switch, beginning with first-party solved-page examples of red 13-dot punctuation and with original pre-2014 signed instructions. Demand a source-visible rule choosing *both* keys and their directions before scoring p0 body. Test any fixed rule on separate original text, using a solved GP29 control for correctness. No p0 body decryption, new complete key or manuscript-wide solution follows from the color correction itself.
