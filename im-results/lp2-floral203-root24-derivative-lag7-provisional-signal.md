# Original p39-root24 readout of floral 16×203: provisional lag-seven four-rune repeat

**Agent9, 23 November 2026. Evidence class: exact original-source structural signal, with 100,000 source-frequency-preserving null controls. Explicitly provisional: no recovered LP2 unknown plaintext, creator-selected readout, authentic key or destination.** [Read-only Node22 SFT](../sims/lp2_floral203_root24_lag7_provisional_source_sft.cjs).

## Clue-directed operation

Three original, independent objects jointly suggest the following inexpensive non-keyed reading. The isolated p39 red triple is `[27,5,15]`, defining `15(X−24)^2 mod29`; the selected repeated root **24** has multiplicative order **7** modulo29. The first printed numeric token on p50 is `3N=203` under the original participant's source-compatible conventional base60 alphabet. Removing precisely the 8,51,9 original visibly red runes from the sixteen flower-bordered p40–p55 pages yields **3248=16×203** black GP29 runes, in printed order.

Split the black register sequentially into sixteen 203-rune vectors (these are **mathematical rows**, and may cross physical page/word boundaries). For each vector, read its original GP indices as the coefficients of a polynomial `P(X)`, highest power at the first rune. Evaluate **`P(24),P'(24)`**, giving two GP29 output symbols. The derivative is independently suggested by the marked polynomial's double root, rather than selected by a desired message. Thus the unedited source produces a fixed **32-GP-symbol output register**:

`15,22,25,13,9,20,16,15,22,25,13,1,8,8,9,22,9,7,18,7,1,25,24,9,26,16,15,9,27,17,21,12`.

The canonical zero-based Gematria Primus chart in `resources/liber-primus/lp2-corpus.json` transliterates these four indices as **S, OE, AE, P**, i.e. `SOEAEP`, **not** `S ING A P` or `SINGAP`. In particular, the NG/ING rune is index 21, not 22, and A is index 24, not 25. The previously reported geographic-looking string was a lookup error, not a recovered plaintext fragment. The same four-symbol **nonlinguistic sequence** occurs at output positions **7–10**, without tuning the rune mapping. No output here has been validated as recovered plaintext.

## Discriminating seven-position statistic

The source polynomial has root24 of order7, so examine the originally specified **lag seven** on the 32-symbol readout, without independently selecting a best-scoring lag. Of the **25 eligible comparisons** `out[i]==out[i+7]`, **six** hold, at offsets **0,1,2,3,8,16**. The longest run of consecutive lag-seven equalities is **four** at the beginning.

Two controls preserve the underlying original method without tuning a key:

1. The other six seventh roots of unity in GF29, evaluated using the same sixteen source rows and derivative operation, give lag-seven equality counts `root1:1, root7:0, root16:0, root20:0, root23:3, root25:3`. The genuinely marked root24 alone gives **6**. Looking among other roots *after* seeing a count would be postselection; here they serve as structural controls.
2. The natural opposite original coefficient convention, taking each of the same sixteen source rows in **reverse rune order** before evaluating the same marked root24 and derivative, gives **zero** lag-seven equalities. Thus the signal specifically selects printed high-degree-first order; reversing is a held-out formatting control.
3. Four equally long *unmodified contiguous 3,248-rune windows* elsewhere in the original whole-book ciphertext, beginning at global offsets0,3248,6496,9708, give lag-seven counts **2,1,0,1** (same root24/derivative construction). They do not share the red-excluded flower-specific framing.

The reproducible frequency-preserving null takes each **original** 203-rune row and independently Fisher–Yates-shuffles its positions while retaining its exact GP29 symbol multiset. With frozen `sfc32` seeds `0x33012026,0x7f4a7c15,0xc1cad4d4,0x20142016`, **100,000** whole-register shuffles yielded **23** tests with ≥6 lag-seven equalities and **3** with a run length≥4. The corresponding finite empirical frequencies are **0.00023** and **0.00003**. These are *conditional shuffle frequencies*, **not** a discovery-wide, selection-adjusted probability of Cicada author intent. The all-shuffle and two-readout method is fully pinned in the linked SFT.

For independent uniform GP29 output symbols, the count at one fixed lag in a 32-symbol register has a binomial `Binomial(25,1/29)` distribution, with upper tail at6 around `0.000169`. That heuristic ignores cipher dependence and exploratory source-selection uncertainty, so the row-shuffle control above is preferable for empirical calibration.

## Source-defined start boundary versus 202 adjacent alternatives

The actual starting offset of the black register is the first black rune after the physical red p40 heading. To assess whether the signal is a generic consequence of the 203-width polynomial transform, retain the same **complete original 3,248-rune circular tape** and, one by one, shift its mathematical row-boundary start through **all 203 possible unit offsets** before constructing the sixteen203-rune rows. The **original offset0 is the only one of 203** with six lag-seven equalities or a four-symbol consecutive lag-seven run. The strongest of the 202 alternate starts has **four** equalities; the complete count histogram is **90 starts with0, 71 with1, 27 with2, 13 with3, one with4 and one with6**. This is a deterministic original-register consistency observation rather than an independent probability or an excuse to optimize phase. It strengthens the *specific original heading boundary* interpretation, still without identifying a source-selected plaintext consumer.

## What this signal actually changes

The lag-seven repetition is a new **testable original-source output signature** of the p39/root24+203/floral register combination. It is stronger than a naked numeric length coincidence and gives a concrete frozen output to compare against newly discovered source instructions or source-derived independent material. The fact that a four-GP-symbol sequence appears twice is a repeat of *the same short pattern*, **not two corroborating plaintext decodes**.

The related 32-check error-correcting hypothesis was evaluated separately in [the original p50 parity gate](lp2-floral203-p39-double-root-p50-32check-original-decision.md). None of the natural direct 32-table-row consumers contains these required parity digits, and that mismatch persists under arbitrary fixed secret symbol lookup. This output register has **no known source-authenticated binary consumer**. Likewise, repeated source symbols at lag7 alone do not provide the cryptographic inverse for 3,248 black runes.

**Decision:** preserve the exact 32-symbol source readout and 7-position observation, but require an independent first-party clue or a typed successful decoder predicting a **long** GP plaintext segment before escalating it to established results. Arbitrary rotations, row reorderings, word completions, or geographic lookups would undermine the initial source-constrained hypothesis.
