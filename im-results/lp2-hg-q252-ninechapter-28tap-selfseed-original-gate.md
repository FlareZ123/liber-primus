# The original p50 H·G quotient as nine self-seeded 28-tap keystreams

**Agent 43, 15 November 2026. Classification: bounded original-input decipherment failure.** This experiment implements a reproducible lossless inverse on all 12,956 unknown LP2 runes using an independently visible polynomial factorization. It obtains **no unknown LP2 plaintext, recovered historical key, or destination**. The source does not actually instruct the proposed feedback recurrence.

## The proposed human solve path and its weak link

The original LP2 pp49–51 grid holds 256 printed base60-encoded numeric cells. A documented 2013 Cicada BASE29 example contributes a degree-two GF29 polynomial, and the three red runes on original p39 contribute a second degree-two polynomial. Their product, in descending-degree coefficient order, is **[12, 17, 11, 21, 23]** and divides the table's 256 GF29 residues exactly. This exact factorization is independently recorded in [the full-grid report](lp2-grid-complete-gf29-factorization.md). Division retaining the printed leading zero gives **252 quotient slots**. Separately, the manuscript visibly marks **nine chapters**, suggesting a 9×28 layout. The 28 count is the number of *nonzero* GF29 elements. The quotient's leading zero is physically present in the 256-cell table, but preserving it is a proposed convention and matters to this layout.

Previous tests rejected repeating 28-symbol quotient rows as ordinary additive pads and as predecessor-excluded-rank keys ([nine-chapter quotient inversion](lp2-grid-q252-ninechapters-rank28-key-gate.md)). A materially different way to use a 28-item row as a *full source-derived secret* is to treat it as both the coefficients and initial state of a **28-tap feedback register**, extending it over the matching chapter. An ordinary solver could implement this recurrence if instructed to use feedback, but **no source annotation selects LFSR feedback, a 28-tap polynomial, this exact coefficient order, or the zero-state convention**. This is an exploratory algebraic consumer rather than an authenticated authorial operation.

## Exact model and full original results

Use untouched base60 byte order (SHA256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**), reduce bytes modulo 29, perform long division by H·G to recover the exact 252 formal quotient residues, and partition into nine consecutive blocks q[0..27]. Chapter rune lengths are frozen from the original red title boundaries as **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]**. Reset the key state at each chapter beginning. For one row, set its first 28 key symbols equal to the row. Then continue via

\[
 k_i=\sum_{t=1}^{28} a_{t-1} k_{i-t}\pmod {29},\qquad i\ge 28,
\]

where a is either the source-order row or its complete reverse. For all original rune positions, including literal F, decode **P_i = C_i + s k_i (mod 29)** with s = ±1. This explicitly rejects inserting an unselected ciphertext filter or F bypass. The additive transform is a full GP29 bijection for every position and exact re-encryption holds in all four variants. The source's 55 rune-bearing p0–55 pages concatenate to 12,956 runes; runeless p50 retains its numerical bytes as key source.

| Frozen quotient-row model | Full 12,956-rune GP29 plaintext candidate IoC |
| --- | ---: |
| Source-order taps, subtract | **0.03447233274418** |
| Source-order taps, add | **0.03445537662193** |
| Reversed taps, subtract | **0.03449761798059** |
| Reversed taps, add | **0.03450667395593** |

Unmodified ciphertext IoC is **0.03447839786451** and flat uniform GP29 expectation is **0.03448275862069**. All nine chapter-specific outputs under all four variants remain in a similar flat range, rather than showing a sustained native plaintext register. The highest short-chapter result, 0.0363383 on terminal 308 runes, contains incoherent GP transliteration. None of the four source-exact inverses yields recognizable contiguous language, and **no unknown plaintext can be promoted**. The script preserves and prints the complete chapter-level IoC and first 40 runes for each option.

To establish that the arithmetic is reversible and the program can recover a known original GP string, repeat the **95 genuinely solved LP2 p57 plaintext runes** until the source's 12,956-rune length, encrypt with each exact source quotient keystream, and recover every planted rune (**12,956/12,956**) for all four settings. This proves correct implementation of the stated synthetic plant, not recovery of the real ciphertext or an authentic source key.

## Independent source-grid recurrence prediction

A separate, key-independent check asks whether the 252 original quotient values themselves were placed in nine 28-coefficient rows **as successive states** of the already documented historical four-state H·G recurrence. For each column in rows 4–8, freeze the recurrence

\[
Q_{r,j}=15Q_{r-4,j}+20Q_{r-3,j}+16Q_{r-2,j}+Q_{r-1,j}\pmod {29}.
\]

Only **6/140** original comparisons agree, near the **140/29≈4.8276** coincidences expected for independent uniform residues. This is no indication of the hypothesized source-grid row transition and is unrelated to the 28-tap inverse's full-roundtrip correctness.

## Research decision

The quotient's source factorization and 9×28 coefficient count remain exact. **Reject the self-seeded 28-tap additive consumer** under original chapter starts, both natural coefficient orientations and both cipher signs as a native-GP plaintext decoder. It is a new bounded consumer relative to the prior period-28 and four-state tests but does not yield a genuine solution. An independent historical instruction or data-dependent transformation is still required to select a more credible operation. Neither a different arbitrary feedback rule nor a large secret seed search is justified by this negative.

**Reproducer:** [single-file CommonJS Node 22 source-original decoder, factor assertion, known-native plant, and four candidate readouts](../sims/lp2_hg_quotient_9x28_selfseed_sft.cjs). The input corpus and numeric table are [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json) and [lp2-grid-256.json](../resources/liber-primus/lp2-grid-256.json). All original source values and outputs were independently computed against the live repository file contents before recording the result.
