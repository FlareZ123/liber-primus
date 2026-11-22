# 56×13 first-chapter key schedule: direct additive gate

**Status:** rejected as a simple additive page-key consumer; the numerical alignment remains an observation, not an established cipher instruction.

## Motivation

The first three LP2 pages contain 262, 266 and 201 runes, totaling **729**. LP2 has **56** unknown pages. Two visible 13-mark features are salient: the 13-rune red heading on p0 and the 13-dot terminal red marker on p2. Thus

\[
729 - 1 = 728 = 56 \times 13.
\]

Separately, a dated 2015 solver discussion proposes a first-chapter operation: insert a fictitious preceding F, apply consecutive prime shifts, then take modular differences. That operation is documented and reproduced in the existing [prime-delta report](lp2-2015-prime-delta-40-doublet-source-inversion.md), but it is a community solver's hypothesis, not an authenticated Cicada instruction.

A plausible, bounded human-solve hypothesis is that the first chapter supplies a 56×13 key schedule, with one initial seed/sentinel. The p0 red heading and p2 13-dot marker make the 13-symbol width visible, while the 56 unsolved pages supply the row count. For the prime-delta tape, dropping the first difference is specifically justified by the fictitious preceding F; for the raw and prime-shifted tapes, dropping the first symbol is only the minimal alignment needed to test the same 728-value schedule.

## Exact construction

1. Concatenate original LP2 p0–p2: 262 + 266 + 201 = 729 GP29 rune indices.
2. Build three bounded, source-motivated 729-symbol tapes:
   - **raw:** the original GP29 values;
   - **prime-shifted:** each actual rune minus its successive prime modulo 29, using the p56-style prime sequence;
   - **prime-delta:** the 2015 operation, with a fictitious preceding F shifted by 2, actual runes shifted by 3, 5, 7, …, and modular differences between successive shifted values.
3. Drop the first value from each tape, leaving exactly 728 = 56×13 values. For prime-delta, the dropped value is the initial difference from fictitious F to the first real rune.
4. Reshape each tape in either row-major or column-major order as 56×13. Assign one 13-symbol row/column to each LP2 page in canonical page order.
5. Repeat that page's 13-symbol key across the page as a simple additive GP29 key. Test both signs and, separately, the known-p56-style literal-F/no-clock-advance bypass.

This is a finite test of the simplest direct consumer. It does not add arbitrary offsets, nonlinear transforms, page permutations, or extra cipher layers.

## Results

The canonical original corpus and the repository's source-calibrated GP29 four-gram scorer were used. The English control trains on the first 150,000 Shakespeare characters and scores the held-out final 150,000; page boundaries are respected when scoring LP2.

| Tape | Best layout / operation / F bypass | IoC | GP29 4-gram log-probability / rune |
|---|---|---:|---:|
| Raw | Column-major / subtract / no | 0.03450334 | −14.09356489 |
| Prime-shifted | Row-major / subtract / no | 0.03446595 | −14.09886554 |
| Prime-delta | Row-major / add / no | 0.03447907 | **−14.08768232** |

The best-IoC variants are also near random:

| Tape | Best-IoC layout / operation / F bypass | IoC | GP29 4-gram log-probability / rune |
|---|---|---:|---:|
| Raw | Row-major / subtract / yes | 0.03580592 | −14.10934214 |
| Prime-shifted | Column-major / subtract / yes | 0.03582159 | −14.10896235 |
| Prime-delta | Column-major / add / yes | **0.03593374** | −14.10266465 |

Controls:

- Raw original ciphertext: IoC **0.03447840**, GP29 4-gram log-probability **−14.09549363** per rune.
- Held-out native-English control: **−10.88032887** per rune.
- Random-alphabet IoC baseline: \(1/29 \approx 0.03448276\).

The best four-gram candidate improves on raw ciphertext by only 0.00781 nats/rune, while remaining about 3.21 nats/rune below held-out native English. The best-IoC candidate is still near the random-alphabet baseline and has a worse four-gram score than raw ciphertext. There is no plaintext signal across the 24 fixed variants.

## Decision

Reject **only** the direct interpretation “the 728 values are a 56×13 matrix of repeating additive GP29 page keys,” across the raw, prime-shifted and prime-delta tapes, row/column orientation, both signs, and the tested literal-F bypass.

Do not treat the exact arithmetic \(729-1=56\times13\) as proof of a key schedule. This test does not exclude every possible use of the 728 values, but no more consumers should be explored without an independent source instruction selecting them. The underlying prime-delta operation remains a possible first-chapter intermediate, not a decryption.

## Reproduction

From the repository root:

~~~bash
node sims/lp2_firstchapter_56x13_key_schedule_sft.cjs
~~~

The script reads only the canonical resources/liber-primus/lp2-corpus.json and the existing resources/control/shakespeare_first300k.txt; it has no external dependencies. It asserts the 729-rune chapter, 40 derived adjacent equalities and 728-symbol tapes before scoring all 24 fixed variants.
