# Source-fixed GP29 → English base27: complete-section original-input inverse

**Decision (14 November 2026, Agent27): bounded direct-radix negative.** No unknown LP2 plaintext, historical key, downstream operation or destination was recovered. The original positional integer is reversible, but its English-plus-space output on the actual cipher does not resemble a message.

## Human-observable premise and exactly frozen operator

An early printed LP2 p0 token begins with GP letters commonly transliterated `NEWBASOE`, while the first visual chapter p0–2 contains **729=27²** original runes. This is suggestive only: the manuscript does not tell us to replace radix 29 with 27 or to use an English alphabet with a space. A different earlier [source-based positional-radix experiment](lp2-newbase-delta28-positional-base-gate.md) tested base59/base60 with a different register, so those failures do not themselves answer the direct 27-symbol question.

Treat every GP rune index as a digit in 0–28, in original physical order and **most-significant digit first**. Interpret each frozen section as a single base29 integer; express that integer in base27 without a key, added leading zeros, alphabet permutation or chosen offset. Two predeclared 27-symbol output alphabets are:

1. `ABCDEFGHIJKLMNOPQRSTUVWXYZ ` (space last).
2. ` ABCDEFGHIJKLMNOPQRSTUVWXYZ` (space first).

This operation preserves the integer and has an exact inverse if original input width is recorded. It is a concrete way to test a plain-English message with spaces as radix digits, rather than guessing transpositions or a following cipher. Entire visual sections, the p54–55 ending, and the continuous manuscript are source-defined clocks.

## Original ciphertext outcomes

The [exact original-input CommonJS SFT](../sims/lp2_newbase27_plaintext_direct_sft.cjs) uses the unmodified [LP2 GP29 indices](../resources/liber-primus/lp2-corpus.json). It checks all 56 unsolved physical pages, including runeless p50, contain **12,956** symbols. The following computations were independently executed on those indices (all counts exclude any invented leading space).

| Input grouping | Runes → base27 chars | Space-last: spaces / “THE” / “AND” | Space-first: spaces / “THE” / “AND” |
| --- | ---: | ---: | ---: |
| p0–2, first visual section | 729 → 745 | 30 / 0 / 0 | 33 / 0 / 0 |
| p3–7, independent visual section | 1,145 → 1,170 | 43 / 0 / 0 | 51 / 0 / 0 |
| p54–55, terminal section | 308 → 315 | 14 / 0 / 0 | 10 / 0 / 0 |
| All original unsolved p0–55 | 12,956 → 13,237 | 491 / 1 / 1 | 520 / 2 / 1 |

First section, space-last (first 80 output chars):

```text
HNVVLCAMCPILUBTDYUUDQ GFLOVEE MQNBVLPRHFADHVQHSDWWAJIXPECLTQQTBIKXMFDAEUFZKSZF
```

First section, space-first (first 80 output chars):

```text
GMUUKB LBOHKTASCXTTCPZFEKNUDDZLPMAUKOQGE CGUPGRCVV IHWODBKSPPSAHJWLEC DTEYJRY
```

Under this literal numeric conversion, spaces occupy **30/745 = 4.03%** or **33/745 = 4.43%** of the first output, close to the **1/27 = 3.70%** expectation for evenly distributed base27 digits. By contrast, the original authentic solved p57 clear-GP *PARABLE* consists of 95 runes in 20 printed words, giving **19/(95+19) = 16.67%** between-word spaces under a one-space serialization. That control is not a claim about the unknown LP2 language, but it shows the stark lack of ordinary word boundaries in the direct decoded output.

## Invertibility and control

The same implementation embeds `THE BEGINNING OF WISDOM IS TO KNOW THAT THE WORLD HAS MANY PATHS AND ONLY ONE TRUTH` under each frozen base27 alphabet, converts it into GP29 digits, and converts it back to base27 without loss. The synthetic text contains 83 base27 characters and occupies 82 GP29 digits for the space-first variant. Both positive round trips are exact, confirming the arithmetic. This is an implementation control, not evidence that any unknown page uses the proposed operation.

## Scope and decision

The direct GP29 positional value → base27 A–Z+space reading is **rejected as ordinary plaintext under both frozen alphabets** on two independent complete early chapters, the ending and the bookwide stream. This does not exclude independently specified character permutations, framing, compression, secret encryption or another binary representation; introducing any of those solely to make the output look meaningful would erase the distinguishing power of this test. The visible `NEWBASOE` substring and 729=27² do not select an additional operation. Reopen only if an original clue supplies an unambiguous decoder with a new original-cipher prediction.

**Reproducer:** [`sims/lp2_newbase27_plaintext_direct_sft.cjs`](../sims/lp2_newbase27_plaintext_direct_sft.cjs), CommonJS Node22, no dependencies or file writes.
