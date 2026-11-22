# Source-derived p50 line/word state gate

**Classification:** bounded negative; no plaintext recovered and no cipher mechanism established.

## Question

The original p50 table's phase-zero low60 mask is associated with adjacent equal-rune events. A plausible missing state is that the mask is locally shifted by a source-visible unit's number. The source clues motivating this test are:

- p49's instruction that primes and the totient function are sacred;
- the signed 2016 message's instruction that words are a map and their numbers give direction;
- the original 32×8 p50 base60 table, whose 256 cells contain exactly 60 values with leading base60 digit zero.

The discriminating question was whether a line- or word-derived prime/totient number predicts the original doublet locations better than the global phase-zero mask.

## Inputs and exact model

The SFT uses the image-corrected LP2 transcription, the canonical GP29 prime-weight corpus, and the original base60 table. It verifies that decoding the 256 base60 cells reproduces `lp2-grid-256.json`.

The unsolved corpus contains 55 rune-bearing pages (p0–p49 and p51–p55), 594 printed lines, 2,896 words, and 12,956 runes. There are 12,901 within-page adjacent-rune opportunities and 86 equal-adjacent events. Line-wrap pairs are assigned to the line containing their first rune; page-boundary pairs are excluded. Word groups preserve cross-page word carries, but page-boundary pairs remain excluded.

For a line or word with rune-prime sum (S=sum p_i) and length (L), the candidate local states are:

- prime-sum offset: (Smod256);
- totient-sum offset: (sumarphi(p_i)=S-Lmod256), since every GP rune weight is prime;
- table-output offset: the p50 byte at the corresponding prime/totient-sum address;
- word-seeded table walk: initialize from the word's GP0 sum, prime sum, or totient sum, then update (s_{j+1}=T[s_j]) once per rune and classify the state as low60 when (s_{j+1}<60).

For each candidate, the proposed mask at an opportunity beginning at global rune position (i) is (T[(i+	ext{offset})mod256]<60), with both directions tested where an offset is used.

## Conditional test

The null preserves the observed number of equal-adjacent events in every printed line or every word, then chooses that many positions uniformly without replacement among the opportunities in that same group. This asks whether the candidate mask predicts *where* the events occur, rather than merely benefiting from line/word event-count clustering.

Each Monte Carlo result uses 50,000 simulations and a fixed xorshift32 seed. Reported p-values are one-sided upper tails, because the hypothesis is that the proposed low60 mask permits or predicts repeat events.

## Results

The unshifted phase-zero mask remains the positive control: it selects 3,025 of 12,901 opportunities and contains 33 of the 86 events. Its conditional upper-tail p-value is 0.00082 under both line-count and word-count conditioning.

| Candidate state | Grouping | Mask hits / events | Conditional upper-tail p |
|---|---:|---:|---:|
| Global phase zero | printed lines | 33 / 86 | 0.00082 |
| Global phase zero | words | 33 / 86 | 0.00082 |
| Prime-sum, plus | line | 27 / 86 | 0.03462 |
| Prime-sum, minus | line | 25 / 86 | 0.20282 |
| Totient-sum, plus | line | 23 / 86 | 0.33577 |
| Totient-sum, minus | line | 22 / 86 | 0.43145 |
| Prime-sum, plus | word | 18 / 86 | 0.70691 |
| Prime-sum, minus | word | 23 / 86 | 0.49731 |
| Totient-sum, plus | word | 23 / 86 | 0.37631 |
| Totient-sum, minus | word | 20 / 86 | 0.54815 |
| Table-output prime offset, plus | word | 24 / 86 | 0.05142 |
| Table-output prime offset, minus | word | 26 / 86 | 0.20782 |
| Table-output totient offset, plus | word | 18 / 86 | 0.53533 |
| Table-output totient offset, minus | word | 24 / 86 | 0.48423 |
| Word-seeded table walk, GP0 sum | word | 12 / 86 | 0.92108 |
| Word-seeded table walk, prime sum | word | 23 / 86 | 0.19222 |
| Word-seeded table walk, totient sum | word | 19 / 86 | 0.35097 |

There are 15 source-derived candidate variants. Only the line prime-sum plus direction is nominally below 0.05; its Bonferroni-adjusted minimum is approximately 0.519. The word table-output prime-plus variant is just above 0.05. Neither provides evidence for a reusable second state.

## Decision

Reject this specific family of line-/word-local prime/totient phase offsets and word-seeded p50 walks as the missing state for the doublet pattern. Do not tune additional signs, shifts, or groupings to rescue it. The global phase-zero association remains an empirical constraint, not an identified encryption rule or key.

The next useful step must introduce an independently selected source operation or authentic key material and produce a reversible plaintext test; further mask fitting alone does not advance the decryption.

## Reproduction

Run:

```bash
node sims/agent43_p50_line_word_state_gate_sft.cjs
```

The script checks all corpus/table counts, reproduces the conditional randomizations, and asserts the key decision points.