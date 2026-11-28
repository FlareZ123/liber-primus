# Filling the GP chart hole with a word separator does not rescue literal rectangular Playfair

**Agent20, 28 November 2026. Classification: source-native reversible architecture gate on original p0–55. No unknown plaintext or key recovered.**

## Decision

The original Gematria Primus chart has a literal **15×2** geometry: 15 runes in the left table, 14 in the right, leaving exactly one lower-right cell empty.

The prior rectangular-Playfair audit correctly proved that conventional Playfair is not closed on the bare 29-rune board: legal rune pairs can emit the missing cell.

There is one unusually simple source-visible way to repair that obstruction without cycle walking or an invented rune:

> put the manuscript's printed **word separator** in the sole empty chart cell.

That gives a complete 30-symbol rectangle and makes conventional rectangular Playfair exactly reversible.

I froze that completion before inspecting its output:

- chart order exactly as printed: indices0–14 left, 15–28 right;
- separator symbol = lower-right cell, ordinal29;
- every one of the **2,896 complete original p0–55 printed words** contributes its terminating separator;
- line wraps and physical-page carries do not add separators;
- pair continuously from the first p0 rune;
- conventional Playfair inverse: same row shifts left, same column shifts up, rectangle pairs exchange columns;
- equal pairs use the same shared-row-priority extension as the prior domain audit;
- no keyword, board permutation, alternate phase, reset, punctuation split, or cycle-walk repair.

The exact source tape is therefore:

```text
12,956 runes + 2,896 separators = 15,852 symbols
```

which is already even and needs no padding.

The literal inverse fails decisively.

## Original output

After one exact inverse:

```text
input separators:  2,896
output separators:   548
output words:         535
```

The separator density collapses. The decoded stream contains long uninterrupted GP runs, including a maximum word length far beyond ordinary prose.

Using the repository's source-calibrated English→GP encoder and the independent 29,157-word TextBlob-derived lexicon:

```text
decoded words of GP length >=4: 493
exact native-GP dictionary hits: 0

decoded words of GP length >=5: 472
exact native-GP dictionary hits: 0
```

So this source-visible completion produces neither a plausible word-boundary register nor any long native-GP lexical recovery.

The result does not depend on a language score to establish reversibility: every pair is transformed by the exact conventional rectangle inverse and the full tape has a deterministic forward reconstruction.

## Why the separator completion was worth testing

The prior [rectangular Playfair domain obstruction](lp2-rectangular-playfair-domain-obstruction.md) left one mathematically obvious escape hatch open. Its board is a full 30-cell permutation with one forbidden state. LP2 itself already supplies visible separators between the 29-rune groups.

Using that separator as the missing cell has four attractive properties before seeing plaintext:

1. it fills **exactly one** source-visible hole with **exactly one** source-visible non-rune state;
2. it turns the literal 15×2 chart into a closed finite domain without cycle walking;
3. it permits spaces to move under the cipher, escaping intact-word no-go theorems;
4. it is a manual operation a 2014 solver could execute directly from the published chart.

Those properties justify this one frozen test. The negative output removes the cleanest separator-based repair of #3291's domain defect.

## Positive control

The reproducer takes 300 native Shakespeare words, source-encodes them into GP29, appends the same separator symbol after every word, encrypts with the completed 30-cell Playfair board, and applies the exact inverse.

The full **1,534-symbol** planted tape is recovered exactly.

The encrypted positive has only two separator symbols left, which is an important calibration: this Playfair geometry naturally moves the separator state aggressively. Therefore the original output's low separator count is not an implementation error; it is the expected behavior of this architecture.

## Scope

This rejects only the literal, key-free source completion:

```text
published 15×2 GP chart
+ separator in the sole hole
+ continuous conventional Playfair pairing
+ source-start phase
```

It does **not** exclude:

- a separately selected keyword/board permutation;
- a different first-party symbol assigned to the hole;
- a source-selected pair reset or alternate stream framing;
- a changing-state rectangular cipher;
- non-Playfair coordinate fractionation on the 30-symbol board.

Those require an independent clue. Do not rescue this negative by scanning keywords, pair phases, reset schedules, or hole assignments.

## Reproduction

Run:

```text
node sims/lp2_gp30_separator_playfair_sft.cjs
```

The SFT asserts the exact original 2,896-word / 12,956-rune tape, reconstructs the 15,852-symbol separator-completed stream, applies the conventional inverse, checks the 548-separator / 535-word output and zero long native-GP dictionary hits, then verifies an exact forward/inverse native-English positive.
