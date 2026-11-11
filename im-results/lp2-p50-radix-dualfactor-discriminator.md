# Original p49–51 radix interpretation: cross-source H/G discrimination

**11 November 2026 · Agent20 · intermediate original-input result.** The literal printed table does not contain a base legend. This is an **independent arithmetic reproduction of an already-published radix discriminator**, not a newly discovered constraint: the earlier [terminal quartic gate](terminal-grid-circumference-knownplain-gate.md#source-locked-polynomial-and-code-interpretations) explicitly compared the same original base60 and f-omitting base59 readings using the joint H/G polynomial, finding zero syndrome only under base60. The present script supplies a small separate, factor-by-factor executable demonstration. It provides **no additional source clue, plaintext, cipher key or historical-author instruction**.

## Fixed source inputs and test

- The *same* 256 original table tokens, printed row-major across physical pp49–51 in `resources/liber-primus/base60-grid.json`; no rune, token, orientation or position is changed. Original image-adjudicated readings and canonical base-60 SHA-256 remain `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- The two exact, previously source-linked GF29 quadratics, with *ascending-power* coefficient order already fixed by the pre-existing red-triad convention: `H2013(X)=3+26X+24X²` (the signed 2013 `BASE29 3301→3QO` example) and `G39(X)=27+5X+15X²` (physical p39's red triad). These are coprime. P3's red `13+23X+2X²` is a *separate nonfactor control*.
- Only two previously disputed positional alphabets are compared: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` (60 digits) and the identical string omitting lowercase `f` (59 digits). Interpret every original two-character token as `radix*digit1+digit2`, then the 256 resulting bytes as descending-power GF29 polynomial coefficients, exactly as in the established dual-factor report. No variant fitting.

| Original source reading | First table byte (mod29) | Remainder mod H2013 (ascending) | Remainder mod G39 (ascending) | P3 nonfactor control |
| --- | --- | --- | --- | --- |
| Conventional radix60 | 203 (0) | **[0,0]** | **[0,0]** | [18,26] |
| Lowercase-f-omitting radix59 | 200 (26) | **[20,17]** | **[22,12]** | [22,10] |

Both readings remain valid 0–255 byte sequences, each with 161 distinct values, but **220/256 bytes differ**. The base60 reading uniquely gives the established joint four-residue zero syndrome among these two natural source interpretations. It also produces a leading zero GF29 slot, whereas radix59 has a nonzero leading slot; the degree-254 factor decomposition and resulting 238-degree residual are therefore conditional on radix60.

The two quadratics already have an independent source rationale, and the same base60 joint syndrome was independently useful for adjudicating archival 2014 table-copy errors. The comparison therefore materially narrows the numeric interpretation *if the dual-factor construction is author-intended*. This same discriminator was previously recorded in the terminal quartic gate, so its independent reproduction is useful as a compact regression only; it must not be counted as new cryptanalytic progress beyond that report. Issue #310's radix-only comparison remains compatible with this conditional H/G preference.

## Strength and limits

This is an exact **consistency discriminator**, with one deliberately altered-byte sensitivity control. It is **not** an unconditional proof that Cicada selected radix60. The association between old BASE29 digits, original red triads and polynomial divisibility was discovered retrospectively; the 2013 message itself does not prescribe polynomial division, coefficient orientation or application to the 2014/2016 LP2 table. The original table supplies no independent decimal known-value anchor. A finite zero syndrome is not a sufficient plaintext/key witness. Do not reuse a naive (29^{-4}) probability as a calibrated global discovery p-value in a heavily explored hypothesis space.

**Decision:** for hypotheses requiring *both* H2013 and G39 as original-table factors, **use the radix60 byte stream**; the radix59 stream falsifies that very premise at the source level. For unrelated hypotheses, preserve the radix ambiguity until a source instruction or independent decoder proves one map. No ciphertext inverse is commissioned merely because a factorization holds.

## Reproduce and related evidence

Run `node sims/lp2_p50_radix_dualfactor_discriminator_sft.cjs` against the committed original-cell source; the script asserts the original source-byte SHA, both remainders, the source P3 control and a one-byte corruption control. Existing work: `im-results/2013-base29-gf29-grid-factor.md` (source H/G and 2014 error correction), `im-results/cicada2014-sexagesimal-upstream-transcription.md` (§5 original numeral ambiguity), closed Director Issue [#310](https://github.com/FlareZ123/liber-primus/issues/310). This conditional result does not revise the manuscript's unsolved status.
