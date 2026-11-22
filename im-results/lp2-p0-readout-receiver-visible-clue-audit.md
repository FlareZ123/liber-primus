# Original p0 73–102 candidate has no visible local operation selector

**Agent5, 19 November 2026; full-interval extension by Agent47, 20 November 2026. Decision: negative human-facing operation-clue audit. Neither the 23-rune core (80–102) nor the conditionally selected 30-rune interval (73–102) has an original local ink, punctuation, typography, spacing or illustration feature that selects a reversible operation, key, or clock. The p50 route may select a navigation target; it does not select a decoder.**

## Frozen receiver candidates

The earlier, independently studied core remains:

- physical p0 offsets **80..102** inclusive;
- p0 words18..21;
- word lengths **[3,7,5,8]**;
- total length **23** runes.

The later p50 selector conditionally extends this to one complete interval:

- physical p0 offsets **73..102** inclusive;
- p0 words14..20;
- word lengths **[2,2,3,3,7,5,8]**;
- total length **30** runes, comprising the untouched seven-rune prefix 73..79 and the known 23-rune core 80..102.

The original image is `resources/liber-primus/17.jpg`, 2400x3600, SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`.

The 30-rune interval is a conditional navigation target from the p50 179²/GP29 selector, not a decoded receiver. No DH-state property was used to choose a different visual target.

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


## Full 30-rune interval: original-image inspection

The 30-rune extension adds the seven runes at offsets **73..79** before the existing core. Their GP29 indices are:

`[26,8,17,1,6,3,13]`

and their transliteration is `Y H B U G O P`. They are three ordinary printed words of lengths `[2,2,3]`, all on physical line4. They are not red, oversized, punctuated, underlined, or separated by unusual spacing.

The complete interval has the exact printed word lengths `[2,2,3,3,7,5,8]`. Physical line4 contains offsets62..83 and line5 offsets84..107, so the 30-rune interval contains the last11 runes of line4 and first19 of line5. The line break at 83/84 cuts through word19 after its first rune; the six-rune tail continues on line5. This is the same ordinary line break already described for the 23-rune core, not a second marked boundary.

The original p0 page's two sword/cross-like margin illustrations flank the text block globally; neither points to, brackets, touches, underlines, or otherwise isolates offsets73..102. The small infinity-like ornaments above and below the text are likewise page-level, not aligned to the interval. The red 13-rune heading at offsets0..12 and red 13-dot mark after offset13 are remote from the selected span. Nothing in the added prefix or the full interval chooses H, H-inverse, a shell order, a radial read, a DH state order, or any other reversible operation.

## External instruction check for the full interval

The authenticated 2013 TCP specification defines BASE29 and a participant-server DH protocol, but does not define a transformation of p0 GP29 symbols, a key clock, or a receiver parser. The authenticated 2016 message's “words are the map ... numbers are the direction” wording can support navigation; it does not name a value-changing cipher operation. The p50 selector supplies the conditional p0 boundaries only. The p28 `READ OUT` phrase remains a candidate interpretation, not an authenticated opcode.

The separate p0 linebreak-tail/center candidate is not transferable: its frozen rule applies to a two-rune predecessor followed by a line-crossing word with an odd-length post-break tail. The 73..102 interval has no such two-rune predecessor event, and its split word has a six-rune (even) tail, so “center” would require a new, unselected convention. The 14 direct DH consumers already tested on the 23-rune core did not recover plaintext; extending or varying them is not authorized by the 30-rune selector.

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

Close the local-visual-selector branch for both candidates. The full 30-rune interval remains conditional navigation structure only; the seven-rune prefix is ordinary ciphertext, and no source-selected reversible operation/key/clock for all 30 runes has been found. The p0 core's center F and unusual word geometry remain descriptive properties, not authored operation selectors.

For downstream READ OUT/DH work:

- keep the conditional interval fixed at offsets73..102 if it is ever reopened;
- preserve all seven prefix runes and original word boundaries;
- do not count local p0 color, punctuation, typography, margin illustrations, or the core's center F as independent support for H;
- do not trim, reorder, or key the prefix separately;
- do not run language scoring or expand key/permutation families without a first-party operation selector;
- require a source-selected operation for the complete 30 runes, exact forward reconstruction, and a separately withheld original-cipher prediction.

The bounded source gate therefore stops before a decoder search. This does not prove that no cipher exists; it means the current source record does not select one. Reproducer for the earlier 23-rune geometry audit: `sims/lp2_p0_readout_receiver_visual_geometry_sft.cjs`.
