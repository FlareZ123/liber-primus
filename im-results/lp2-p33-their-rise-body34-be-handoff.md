# P33 THEIR RISE has a literal body-count consumer: 81 -> 115 selects p34 BE

**Agent17, 19 November 2026. Classification: source-constrained layout-to-page/index bridge.** P33's two red headings already decode to `THEIR RISE`. The corresponding black text bodies were already independently typed by the DH state as 5 versus 6 lines, 21 versus 28 canonical words, and 81 versus 115 runes. Reading **RISE** literally as lower minus upper gives:

```text
lines:  6 - 5   =  1
words: 28 - 21  =  7
runes: 115 - 81 = 34
```

All three are valid zero-based positions in the authenticated 43-word 2016 message. Indices 1 and 7 are both `THE`; index34 is `BE`. The rune-scale rise therefore selects signed index34 and physical p34 before any p34 ciphertext is consumed. P34 already has a separate exact source-predicted BE receiver, creating a direct human-scale p33 -> p34 handoff without another cipher family.

## Fixed p33 objects

The existing p33 layout audit established:

```text
upper title lengths [K,A] = [2,8]
lower title lengths [e,g] = [3,5]
```

The solved-p56 cardinal serializer and fixed H orientation give:

```text
upper -> THEIR
lower -> RISE
```

The same audit independently records:

```text
upper body:
  5 lines  = g
  21 words = p-K
  81 runes = e^q

lower body:
  6 lines   = a
  28 words  = p+g
  115 runes = p*g
```

These counts predate the body-rise interpretation.

## Literal body rise

Use one operation only:

```text
RISE = lower count - upper count.
```

Then:

```text
[6-5, 28-21, 115-81]
= [1,7,34].
```

The authenticated source register gives:

```text
1  -> THE
7  -> THE
34 -> BE
```

The first two natural scales independently land on the same source token. The highest-resolution scale provides the actionable handoff:

A later source-only audit adds an exact semantic checksum on the rune-scale rise: canonical `THEIR=[2,18,10,4]` has `GP0(THEIR)=34`. Thus the hidden instruction's noun and its authored body rise independently name the same authenticated destination:

```text
THEIR -> GP0 34 -> source/page34 BE
body rune RISE -> 115-81 = 34 -> source/page34 BE.
```

This uses no p34 ciphertext and was recognized after the body-rise result, so treat it as cross-channel corroboration rather than the original selector.

```text
their rune rise = 34
-> signed word34 = BE
-> physical p34.
```

No p50 radix, language search, ciphertext value, key guess or arbitrary modulus is needed.

## Charged two-heading family

Charge the source-visible family of pages with exactly two canonical red spans, the first at rune0 and the second at a printed-line boundary. Define the two sections by those heading starts, remove the red headings from word/rune counts, and compute lower minus upper at the line, canonical-word and rune scales.

Only three pages qualify:

```text
p3:
  lines  [6,5]    rise -1
  words  [19,21]  rise +2
  runes  [103,95] rise -8

p15:
  lines  [1,7]    rise +6
  words  [0,32]   rise +32
  runes  [0,139]  rise +139

p33:
  lines  [5,6]    rise +1
  words  [21,28]  rise +7
  runes  [81,115] rise +34
```

P33 is the only member whose three literal rises all lie inside the authenticated 43-word source register. It is also the only member whose line- and word-scale rises label the same authenticated word, `THE`.

This is a finite structural control, not an authorship probability. It was charged after the p33 counts and p34 target were known.

## Existing p34 BE inverse remains unchanged

The new contribution is target/page selection. Authenticated source word34 is:

```text
BE = [17,18]
GP0(BE)=35.
```

The existing THEIR-RISE source rule uses:

```text
34 BE -> 40 PATHS
GP0(PATHS)-GP0(BE) = 19 = B.
```

For a same-state two-rune receiver:

```text
H(key)=[B,0]=[19,0]
key=H^-1([19,0])=[24,5].
```

That predicts:

```text
BE [17,18] + [24,5]
= [12,23].
```

P34 contains two GP0=35 two-rune receivers:

```text
offsets4..5     [12,23]  <- exact prediction
offsets249..250 [28,7]   <- miss
```

The route is therefore:

```text
p33 THEIR RISE
-> literal body rune rise 115-81 = 34
-> signed/physical p34 = BE
-> existing source-derived exact key
-> p34 offsets4..5
-> BE candidate.
```

The p34 key rule was recognized after BE had already been studied, so BE remains a strong local plaintext candidate. The improvement is a direct upstream page/target selector independent of p34 ciphertext.

## Relation to the other p33 RISE consumer

P33 supports two typed consumers without changing operands:

```text
title cardinals [3,5]:
  5-3 = 2
  -> p33 + 2 = p35
  -> FOUND route.

heading-owned body runes [81,115]:
  115-81 = 34
  -> p34 / signed BE
  -> BE route.
```

The first is a relative page displacement from the RISE title cardinals. The second is an absolute source/page index from **their** body-count rise. Keeping those operand types explicit avoids an arithmetic menu.

## Decision

Promote the count-only handoff:

```text
THEIR RISE
-> lower body - upper body
-> rune rise34
-> p34 / signed BE.
```

Preserve `1,7 -> THE,THE` as cross-scale corroboration. Do not treat those labels as extra plaintext or expand count-difference searches to unrelated pages.

P33's body contents remain encrypted. This result consumes only authored layout counts and supplies navigation/index information.

## Reproduction

```text
node sims/lp2_p33_their_rise_body34_be_handoff_sft.cjs
```

The SFT reconstructs the two-heading family, canonical body counts, authenticated source labels, the unique in-register three-scale p33 rise, and the unchanged p34 BE receiver prediction.
