# 2013 “THE KEY IS ALL AROUND YOU” as a 19-rune p55 key

**Status:** fixed source-derived periodic-key and columnar-transposition tests are negative. The 19×4 length match is real; it does not yield p55 plaintext under the obvious operations.

## Source basis

The original 2013 OS message contains **“THE KEY IS ALL AROUND YOU.”** The original 2013 Twitter-stage `gematria.jpg` is a lookup table of Elder Futhark rune / English-letter / prime values. Reading the phrase through that table gives:

- GP29 symbols: `TH E C E Y I S A L L A R O U N D Y O U` (19 symbols; K aliases C).
- Prime values: `5,67,13,67,103,31,53,97,73,73,97,11,7,3,29,89,103,7,3`.
- Prime sum: **931**, whose signed BASE29 conversion is **133**.
- p55 has **76 runes = 4×19**.

The length match makes the literal phrase a much more constrained candidate key than an arbitrary word list. It does not by itself specify whether the phrase is a repeating additive key or a transposition key.

## Frozen tests

All tests use the untouched p55 rune sequence and the known p56-style mod29 additive rule. No phase, reset, F skip, reverse, or fitted parameter.

1. **GP29 ordinal periodic key:** repeat the 19 GP29 indices four times; decrypt with (P_i=(C_i-K_i)\bmod29).
2. **Prime periodic key:** repeat the original prime values reduced mod29; same subtractive operation.
3. **Prime-totient periodic key:** repeat ((p_i-1)\bmod29), matching the prime-totient convention already established on p56.
4. **Columnar transposition:** reshape p55 into a 4×19 matrix; use the 19 prime values to order columns ascending, stable left-to-right on ties; decrypt by placing ciphertext chunks into those columns and reading rows.

The columnar interpretation is weaker visually: the original p55 glyph coordinates give printed line counts **24, 22, 22, 8**, not four lines of19. The 4×19 reshape is selected only by the total length.

## Results

Raw p55 IoC is **0.03789474**.

| Fixed operation | Subtractive/decryption IoC | Additive control IoC | Outcome |
|---|---:|---:|---|
| GP29 ordinal periodic key | **0.03368421** | 0.03894737 | nonlinguistic |
| Prime values mod29 | **0.03368421** | 0.02982456 | nonlinguistic |
| Prime totients mod29 | **0.03368421** | 0.02982456 | nonlinguistic |
| Stable prime-ranked columnar transposition | **0.03789474** | n/a | nonlinguistic |

The reproducer prints the exact key strings and all outputs. None forms a recognizable plaintext or directive.

## Decision

Reject the literal phrase as a direct repeating mod29 key in its GP29, prime, or prime-totient representation, and reject the simplest 19-column transposition. The **19×4 correspondence remains a real source-conditioned structural observation**, but it is not a decoder. Do not vary the phase, reverse the key, or tune a transposition order without a new source instruction.

## Reproduction

Run from the repository root:

`node sims/lp2_2013_all_around_19_rune_p55_key_sft.cjs`

Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-p55-source-glyph-coordinates.json`, and `resources/historical/cicada2013-os-original-message.txt`. The prime-value list is transcribed from the original 2013 Twitter-stage `gematria.jpg` table.
