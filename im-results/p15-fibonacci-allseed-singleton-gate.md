# Fibonacci-state GP29 direct pad: source-visible p15 chapter, all hidden seeds

**Decision (12 November 2026, Agent30):** A direct symbolwise GP29 Fibonacci-recurrence pad, initialized with *any* two secret GP29 values at the start of the source-visible p15–22 chapter, cannot recover ordinary A/I singleton words from the original ciphertext. The exact original source yields **at most five of 18 one-rune words** with either subtraction or addition, for all **1,682** sign/seed combinations. This is a bounded source-motivated exclusion, not a recovered plaintext or original key.

## Original clue and one frozen inverse

The authentic p15 [4×4 prime-index spiral](../results/lp2-p15-fibonacci-prime-spiral.md) uses distinct Fibonacci indices to construct sixteen displayed values. A natural, inexpensive conjecture is that the visible Fibonacci idea cues a *running* recurrence applied to its surrounding text. This is weaker than a full decoder: the original artwork specifies no cipher alphabet, operator or key-stream handoff, and the distinct Fibonacci series' first three values do not themselves form an ordinary seed-two Fibonacci recurrence. The competing interpretation is that the grid's complete operation ends at the printed 16 numbers.

The limited candidate analyzed here uses the original 29-rune GP index alphabet, preserves all printed word boundaries, and applies a direct pad

```text
k[0] = a
k[1] = b
k[i] = (k[i-1] + k[i-2]) mod 29
P[i] = (C[i] ± k[i]) mod 29
```

Both seeds `a,b` are completely unknown in `0..28`; no key or starting phase is borrowed from the source. Both arithmetic directions are tested. Let the recurrence begin at original physical p15 rune-local0, which is global unknown-rune offset **3,603**. The chapter runs through physical p22, global end **5,506**, a total of **1,903 original runes**. Starting the recurrence at p15's second red heading (local9) instead only changes the two arbitrary seeds: advancing a Fibonacci pair is invertible over GF29, so all possible starting phases are already included for this continuous chapter.

Under the ordinary GP-English register used by the solved LP2 pages, a one-rune word can be **A** (index24) or **I** (index10). An optional generous **O** (index3) check relaxes that criterion. The condition is necessary for a direct same-word-length translation to standard English, while archaic or non-English singletons remain possible.

## Exhaustive original-input result

| Scope | Original GP rune positions | One-rune words | Maximum A/I under all seeds and both signs | Maximum A/I/O |
| --- | ---: | ---: | ---: | ---: |
| Source-visible pp15–22 chapter | 3,603–5,505 | **18** | **5/18** | **6/18** |
| Whole 55-page original ciphertext, one continuous recurrence | 0–12,955 | **83** | **15/83** | 19/83 |

The best pp15–22 seed `a=3,b=7` with subtraction makes five of the 18 singleton words A or I. **No one of the 29×29×2 = 1,682** seed/sign choices satisfies the mandatory 18/18 A/I constraint. Even allowing O, all configurations fail at least 12 of 18. A continuous whole-book recurrence, a less well-supported use of the p15 clue, likewise fails the 83 singleton positions.

A fully reversible **1,903-rune planted ciphertext** with key `a=3,b=7` was created from a GP29 source register whose 18 corresponding singleton positions were set to A/I. It decrypts and re-encodes all 1,903 symbols exactly. The blind all-seed singleton test then finds 18/18 for exactly two equivalent seed/sign configurations, `(3,7, subtraction)` and `(26,22, addition)`, demonstrating that the necessary-condition detector can distinguish a genuine planted recurrence even under hidden seeds.

## Decision for plaintext recovery

Reject this specific simplest direct Fibonacci keystream under original preserved word boundaries and the GP A/I singleton grammar. No further tuning of its two seeds, signs, p15 body phase or page0 offset can repair the original chapter's 18-word constraint. The result does **not** exclude Fibonacci-*indexed primes*, nonlinear transformations, state resets inside the chapter, changed word segmentation, non-English prose, or other key schedules. No unknown LP2 plaintext or key was recovered; future work should require an independent original source specifying a novel operation rather than more arbitrary phase searches.

**Reproducer:** [single-file CommonJS all-seed SFT](../sims/p15_fibonacci_allseed_singletons_sft.cjs), reading canonical [rune corpus](../resources/liber-primus/lp2-corpus.json) and [exact printed-word parser](../sims/lp2_word_pages.cjs). The source values, original singleton offsets, exhaustive seed result and positive-plant recovery are all asserted.
