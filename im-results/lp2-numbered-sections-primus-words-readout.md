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

## Signed-source five-word Vigenère transfer: an original 553-rune negative (Agent26, 22 November 2026)

A distinct, **retrospective** first-opcode candidate uses the pre-existing original-image packet and the separately preserved 2016 signed message. The two ten-dot red brackets flank the original 1–5 labelled units. The previously derived zero-based signed-source lookup reads source indices 10..15 as `PRIMUS IS THE WAY ITS WORDS`; the five numbered starts separately select `IS / THE / WAY / ITS / WORDS`. This **supplies genuine printed source words with no ciphertext-tuned keyword**. Its strongest objection is historical: the signed source was released in **2016**, two years after LP2, and neither source explicitly says to apply these words as Vigenère keys to the five paragraphs.

Test the historically attested **2014 LP1 keyed GP29 Vigenère operation**, with both arithmetic directions, each selected source word as a separate cyclic key on its corresponding *complete* GP29 numbered paragraph (139/91/98/96/129 runes, no artificial page breaks), plus the 21-GP-rune contiguous `PRIMUSISTHEWAYITSWORDS` key on all 553 runes. Each key has the historically demonstrated plaintext-`F` transparency: a plaintext F emits ciphertext F and **does not consume** a key; the exact decoder enumerates **all** legal ambiguous ciphertext-F key-clock phases, rather than assuming a fixed skip pattern. The 12 frozen source-key inverses are all mathematically impossible on their full original input under this historical F rule, with first impossible original positions as follows:

| Source-selected key | Original runes | F-transparent first impossible rune (zero based) with P=C−K | P=C+K |
| --- | ---: | ---: | ---: |
| `IS` (item1) | 139 | 37 | 11 |
| `THE` (item2, canonical GP `TH-E`) | 91 | 41 | 36 |
| `WAY` (item3) | 98 | 3 | 64 |
| `ITS` (item4, includes p37→p38 carry) | 96 | 2 | 6 |
| `WORDS` (item5) | 129 | 38 | 5 |
| `PRIMUSISTHEWAYITSWORDS` (all five) | 553 | 17 | 21 |

The *unskipped* alternate Vigenère outputs for each of 12 tested cases are also nonprose, with all five individual-rune IoCs in **0.03158–0.03956**, and the whole-553 source-key IoCs **0.03482** and **0.03473**. All unskipped transforms exactly reencrypt every original input rune; authentic solved-p57 GP plants are additionally encrypted using the true F bypass for each exact original unit/key and retain at least one full legal inverse after entire decryption. The original impossible result cannot be dismissed as a mishandled ciphertext F. Earlier published material also excludes generic five-stage state lengths and static substitution; this test specifically excludes the **five red-label/2016 signed-word** historical Vigenère first opcode.

**Decision:** retain the previously printed bracket→signed-word *navigation candidate* as a retrospective reading clue only. Its five recovered vocabulary words do **not** decrypt the five local paragraphs as Vigenère keys under the authentic historical F rule, so they are neither source-authenticated first cipher instructions nor recovered local plaintext. An actual p36-first opcode still requires a pre-2014 author-visible instruction selecting a key grammar, or a later independently authenticated typed decoding process. Do not rescue these 12 failed models with fitted phases or new hidden keys.

[One-file Windows Node22 SFT](../sims/lp2_five_numbered_signed2016_wordkey_sft.cjs) · [successful original-source run](https://github.com/FlareZ123/liber-primus/actions/runs/45016311624).

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
