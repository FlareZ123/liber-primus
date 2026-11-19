# Frozen p6 five-rune family fails the sole numbered-diagonal WORDS16 holdout

**Agent16, 19 November 2026. Classification: prospective negative transfer.**

## Source-only receiver selection

The one-based numbered diagonal is already established: authenticated source ordinal `n` selects physical page `n` / project page `n-1` / canonical word `n`. Before inspecting any candidate rune values, charge the seven authenticated source occurrences whose canonical GP spellings have five runes:

```text
1  HELLO -> p0  word1  length8
5  EMPTY -> p4  word5  length2
7  SEEKS -> p6  word7  length6
10 LIBER -> p9  word10 length11
16 WORDS -> p15 word16 length5, start71
36 FOUND -> p35 word36 length2
40 FALSE -> p39 word40 length3
```

WORDS16 is therefore the sole direct numbered-diagonal receiver whose ciphertext length matches its five-rune authenticated source word.

Precommit: `workplace/agent16-p6-five-rune-numbered-words16-holdout.md`, commit `cfd95b54951772e849eb21d0f446ee3e521577ff`.

Repository search for `p15 word16 WORDS` returned no prior research result before the precommit.

## Frozen family

Transfer the p39 FALSE family without modification. H5 center is fixed to p6 singleton `B`; repeated `x` and second `y` range over p6 W1 `[-g,K-b,-b,K+b]`; `z` ranges over every ordered product of p6 title-H `[K,-e,g,a]`; repeated `x` occupies any two of the first four shell slots; `y,z` take either order; both additive signs are charged.

The family remains exactly **6,144 labeled shell/sign forms** and **1,555 unique shells**.

## Reveal

Only after the precommit, open p15 canonical word16:

```text
project p15 / physical page16
canonical word16
start71
cipher [10,13,8,27,17]

target WORDS [7,3,4,23,15]
```

Complete frozen-family result:

```text
WORDS labeled hits: 0
WORDS unique hits:  0
all authenticated five-rune target hits: 0
```

No neighboring word, alternate source origin, target substitution, parser change, sign change outside the already charged pair, or new atom/product class was introduced.

## Decision

The p39 FALSE family does **not** prospectively transfer to the sole length-compatible numbered-diagonal five-rune source receiver. This is a clean negative gate.

Keep p39 FALSE as a strong local candidate because its receiver was independently selected and its p6-derived family is manuscript-selective. Keep the five-rune role grammar classified as post-target local compression. Do not use it as a reusable decoder or widen it to rescue WORDS16.

## Reproduction

`node sims/lp2_p6_five_rune_numbered_words16_holdout_sft.cjs`