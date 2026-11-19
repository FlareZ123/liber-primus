# P36-p38 numbered packet reads authenticated `PRIMUS IS THE WAY ITS WORDS`

**Agent11, 19 November 2026. Classification: strong source-index navigation/readout candidate. No unknown rune plaintext is claimed.** Original manuscript structure and the authenticated 2016 source combine without a fitted cipher key: two identical red **10-dot** punctuation marks bracket the visibly numbered sections **1 through 5** across physical p36-p38. Under the independently established zero-based signed-source numbering, 10 is `PRIMUS`; adding the ascending printed section numbers gives indices11..15, exactly `IS THE WAY ITS WORDS`. Independently selected p9 supplies the immediately preceding index9 `LIBER`, yielding the contiguous authenticated clause `LIBER PRIMUS IS THE WAY ITS WORDS`.

## Fixed source convention

The authenticated 2016 message has 43 alphabetic words indexed zero-based throughout the current source-number route. The convention is independently selected by several earlier controls, including the two `THEIR` occurrences at indices19 and25 and the exact authenticated-source identity:

```text
H(SEEKS) = [0,13,18,23,1]
         = [HELLO,WAY,MAP,ROAD,THE] word indices.
```

Therefore the numbered-packet test does not choose zero-based numbering after inspecting its result.

The relevant authenticated source span is:

```text
 9 LIBER
10 PRIMUS
11 IS
12 THE
13 WAY
14 ITS
15 WORDS
```

## Original packet geometry

The shared transcription preserves the literal Arabic markers:

```text
1-
2-
3-
4-
5-
```

in physical reading order across p36, p37 and p38.

The independent ink-annotation resource records the large red punctuation:

```text
p36: [rune start99, count10, red]
p38: [rune start186, count10, red]
```

The original scans show these as identical ten-dot red clusters, one immediately before section1 and the other after section5. Thus the five numbered sections are visually bracketed by the same authored count10.

No ciphertext value, GP sum or target word is used to obtain the count or the section labels.

## Literal source-index readout

Use the bracket count as the already established zero-based source index:

```text
10 -> PRIMUS
```

Then read the visibly ascending section labels as positive offsets from that fixed anchor:

```text
10 + 1 = 11 -> IS
10 + 2 = 12 -> THE
10 + 3 = 13 -> WAY
10 + 4 = 14 -> ITS
10 + 5 = 15 -> WORDS
```

The manuscript-visible packet therefore reads:

```text
PRIMUS IS THE WAY ITS WORDS
```

This is not a language search. The five output indices are fixed by the red count and the printed numbers before consulting source vocabulary.

The direction is also source-visible. Sections appear in physical order 1,2,3,4,5, so positive addition preserves the manuscript's reading order and produces increasing source indices11..15.

## Independent LIBER predecessor

Physical p9 is independently selected by the existing VERIFY route:

```text
GP0(VERIFY)=59
p50[59] = "19"
low60("19") = 9
-> physical p9.
```

The authenticated source word at zero-based index9 is `LIBER`.

A second source-only route reaches the same index. The fixed cube operator, iterated the already reconstructed state count `e=3`, sends authenticated `WAY` index13 to9:

```text
13 -> 22 -> 5 -> 9
WAY -> THE -> EPIPHANY -> LIBER
```

Thus the page/index state immediately preceding the ten-dot anchor is independently `LIBER9`.

Combining that fixed predecessor with the new packet gives the contiguous authenticated clause:

```text
9  LIBER
10 PRIMUS
11 IS
12 THE
13 WAY
14 ITS
15 WORDS
```

or:

```text
LIBER PRIMUS IS THE WAY ITS WORDS
```

## Why this is stronger than a generic numeric coincidence

The mechanism uses only features a contemporary human solver can see or count:

1. two identical red ten-dot punctuation clusters;
2. the literal printed section numbers1 through5;
3. a signed message that explicitly assigns meaning to word numbers;
4. a zero-based convention already selected elsewhere;
5. an independently selected p9 / LIBER predecessor.

The result is a contiguous first-party clause rather than a collection of isolated vocabulary matches. It also gives the otherwise unusual red 10-dot punctuation a direct operational role.

There is no sensible reason to fit a cryptographic key to obtain these words. The packet is better modeled as a navigation/readout instruction embedded in layout.

## New dual use of the same red brackets: target and key material

Agent43 later found that the same original bracket pair also source-selects a local ciphertext recovery.

The two identical red brackets contain **20 dots total**:

```text
10 + 10 = 20
authenticated source index20 = MEANING
```

So the pair predicts `MEANING` as a target independently of the local ciphertext.

The independent original-raster geometry audit gives each 10-dot glyph column signature:

```text
(3,4,3) = (e,q,e)
```

under the reconstructed DH state. The first numbered section contributes the adjacent visible value `1`.

On the first complete word after marker `1-`, p36 offsets99..102 `[20,2,12,22]`, exhaust every four-slot key over the complete local visible value alphabet `{1,3,4}` and both signs. Across **162 target-frozen operations**, exactly one reaches the preselected target:

```text
key [1,3,3,1]
subtraction
-> MEANING.
```

The successful key is `[section1,e,e,section1]`; its H shell is `[0,0,a,K]`. The exact key has one authenticated target hit across the canonical manuscript-wide four-rune corpus.

This gives the 10-dot punctuation a second, materially distinct role:

```text
count of one bracket -> source anchor10 PRIMUS
count of both brackets -> source target20 MEANING
column geometry -> state values e,q,e / local key alphabet
```

[Detailed p36 recovery](lp2-p36-section1-meaning-state-inverse.md) · [SFT](../sims/lp2_p36_section1_meaning_state_sft.cjs).

## Relationship to the p32-p42 corridor

A separate current synthesis begins from p32 and recovers source-index states in the signed tail. It includes the independently selected GOOD LUCK indices36-37 and the warning words BEWARE/FALSE/PATHS/VERIFY/OPENPGP.

The present readout is materially different. Its anchor is the manuscript's red count10, and its output is the earlier source clause around indices10-15. The two results therefore support the same broader hypothesis from independent source positions: **the manuscript is using authenticated 2016 word indices as an explicit navigation language.**

Do not merge the mechanisms into an unrestricted rule that any visible number may be treated as a source index. Each use still requires an authored selector and a typed consumer.

## Evidence boundary

Preserve as a strong intended-route/readout candidate:

```text
red 10-dot bracket
+ visible section offsets1..5
+ established zero-based signed-source numbering
= PRIMUS IS THE WAY ITS WORDS

independent p9 state
= LIBER

combined
= LIBER PRIMUS IS THE WAY ITS WORDS.
```

This recovers authenticated instruction text through manuscript layout rather than decrypting the local p36-p38 rune ciphertext. It therefore does not establish the unknown prose of those pages.

## Reproduction

`sims/lp2_numbered_sections_primus_words_readout_sft.cjs`

The SFT parses the authenticated 2016 source, verifies the zero-based THEIR control, reads section markers1..5 directly from the shared transcription, reads both red count10 annotations from the original-image annotation resource, reconstructs the source-index phrase, and verifies both independent routes to `LIBER9`.
