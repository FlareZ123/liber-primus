# Original p0 READ OUT receiver has no visible local operation selector

**Agent5, 19 November 2026. Director #1712. Decision: negative human-facing operation-clue audit. The frozen p0 offsets80..102 have distinctive transcription geometry, but the original JPEG shows no local ink, punctuation, typography, spacing or illustration feature that selects H, radial reading, shell direction or DH state order.**

## Frozen receiver

The receiver was fixed before this audit:

- physical p0;
- offsets **80..102** inclusive;
- p0 words18..21;
- word lengths **[3,7,5,8]**;
- total length **23** runes.

The original image is `resources/liber-primus/17.jpg`, 2400x3600, SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`.

No DH-state property was used to choose a different visual target.

## What the original page visibly does

The canonical physical line map is:

- line4: offsets62..83, 22 runes;
- line5: offsets84..107, 24 runes.

The receiver therefore consists of the final four runes of line4 followed by the first19 runes of line5.

Its second word spans offsets83..89. The first rune of that word is the final rune on line4, while its remaining six runes continue at the start of line5. Thus the receiver crosses exactly one physical line break **inside word19 after its first rune**.

The exact interval center is offset91, rune **F**.

On the original JPEG:

- every receiver rune is ordinary black ink;
- no receiver rune is oversized or specially colored;
- there is no large 10/13/23-dot punctuation in or adjacent to the span;
- the only p0 red runes are offsets0..12, far above the receiver;
- the only p0 large punctuation is the red 13-dot mark after offset13;
- internal separators in the receiver are ordinary printed word dividers;
- the line4/5 break uses the same line spacing and typography as neighboring body lines;
- the right-side illustration is nearby in the page margin, but it does not touch, bracket, point to, underline or otherwise isolate offsets80..102;
- no local mark distinguishes the center F at offset91.

The visually relevant fact is therefore ordinary body text with one word carried across the line break.

## Matched transcription-geometry controls

Across the 55 rune-bearing unknown pages, there are **117** contiguous four-complete-word windows spanning exactly23 runes.

For the target:

`page0 word18, offsets80..102, lengths [3,7,5,8], center F, one line break, word2 split after1 rune`.

Controls:

- **105/117** matched windows cross exactly one physical line break, so one break is ordinary.
- **5/117** have the same specific pattern in which the second word crosses a line break after its first rune.
- **4/117** have center rune F.
- the exact length vector `[3,7,5,8]` occurs **1/117**, at the target.
- combining center F with the same second-word-after-one-rune break pattern also leaves the target alone.

The four page0 23-rune/four-word windows are:

| first word | offsets | lengths | center | physical break |
|---:|---|---|---|---|
| 5 | 20..42 | [3,11,5,4] | I | none |
| 6 | 23..45 | [11,5,4,3] | N | one break between words |
| 18 | 80..102 | [3,7,5,8] | F | inside word2 after rune1 |
| 51 | 221..243 | [7,7,2,7] | H | inside word4 after rune2 |

The target is geometrically distinctive, but these properties were inspected after the receiver existed. More importantly, they do not specify an operation. A center F does not choose wordwise shells over a whole-span radial read; a line break does not choose H over Hinv; the word lengths do not choose orientation or DH labels.

## Why this does not source-select the current H packet

The current H/DH description needs several choices:

1. pair outer runes within each complete printed word;
2. use the ordered map `H(x,y)=(x-y,x+y) mod29`;
3. preserve odd-word centers;
4. serialize transformed words in printed order;
5. interpret selected values as an ordered DH state.

Nothing local in the original p0 image distinguishes those choices from nearby alternatives.

In particular, the receiver's only physical discontinuity cuts **through** word19. A human using visual line geometry alone would naturally see two line fragments, while the H packet requires rejoining that split word before pairing its outer runes. The visible line break therefore does not itself explain the wordwise shell rule.

The source-visible motivation for shells, if the route is genuine, must come from an external clue such as solved p57's circumference language or another authenticated instruction. It is not encoded locally in p0 typography.

## Decision

Close the local-visual-selector branch.

The original p0 receiver does have a compact and unusual transcription shape, and the exact center F can remain a descriptive property. Neither should be promoted as an authored operation selector without a prospective consequence.

For downstream READ OUT/DH work:

- keep offsets80..102 fixed;
- do not count local p0 color, punctuation, typography or illustration as independent support for H;
- require the extraction operation to be justified by an external authenticated clue or to survive the full extraction-family audit.

Reproducer: `sims/lp2_p0_readout_receiver_visual_geometry_sft.cjs`.
