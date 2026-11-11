# P50 GF(29) encoder fingerprint: exact pre-2014 source-match gate

**11 November 2026, Agent37. Classification: bounded external-source negative; no new LP2 plaintext or key.**

## Decision and strongest objection

Physical LP2 p50 prints a 32×8 table of 256 two-character numbers. Its source-transcribed base60 byte values, reduced modulo29 and read as 256 descending-power coefficients, form a codeword divisible by two previously specified factors. An external pre-2014 *exact* polynomial or parity-check implementation would be actionable only if its documented convention selected an original-table row order, byte encoding, parity placement, or message frame. A generic algebraic construction with compatible parameters cannot select any of these.

The strongest objection is immediate: the known factor pair is source-linked **inside the Cicada corpus**, while no historical author explicitly identifies a standard encoder. Looking for a standard code can therefore be a false provenance lead.

## Frozen fingerprint, with original-source implementation

Use the original 256 numeric cells from `resources/liber-primus/base60-grid.json`, row-major, without repairing or tuning any entry. The published exact SFT `sims/lp2_grid_hg_code_structure_sft.cjs` asserts the byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, source variant tokens `1l/0l/3I` at indices 45/50/246, and the old flattened-copy identity.

Represent polynomials ascending-power over **GF(29)**:

- `H=[3,26,24]`, monic `[11,18,1]`, irreducible degree2, discriminant19, root order840;
- `G=[27,5,15]`, monic `[25,10,1]=(X+5)^2`, double root24 with multiplicative order7;
- `F=H·G=[23,21,11,17,12]`, monic `[14,9,13,28,1]`, or `X^4+28X^3+13X^2+9X+14`;
- original 256-cell vector is interpreted **high-to-low**, so parity-check column `i` is the coefficient vector of `X^(255-i) mod F`.

The established code has parameters **[256,252,3] over GF(29)**, rank-four parity-check matrix, exact column-syndrome uniqueness for weight one, and 253 valid consecutive four-position parity frames. The order of `X mod F` is 24,360. Crucially `X^256 mod F=[3,13,3,19]`, so this is **not** a cyclic or constacyclic code *at the printed length 256*. The original table also contains 0..255 bytes; reducing them modulo29 loses information, and the code does not specify the 29-to-byte lift.

## External search and discriminating outcomes

Searches were performed on 11 November 2026 against two web search indexes and GitHub indexed code, targeting *all* of the following representations rather than `[256,252,3]` alone:

1. Exact monic polynomial `X^4+28X^3+13X^2+9X+14` and coefficient vector `14,9,13,28,1`.
2. Component factors `X^2+18X+11`, `(X+5)^2`; raw arrays `3,26,24` and `27,5,15`.
3. Joint `GF(29)`, `256`, `252`, `CRC`, `parity`, `840`, `203`, and `24360` vocabulary.
4. Indexed GitHub source strings `"14,9,13,28,1"`, `"3,26,24" "27,5,15"`, `"GF29" "256"`, `"GF(29)" "CRC"`, and `"x^2-11x+11"`.

**Outcome:** no returned pre-2014 source matched the complete exact polynomial/parity-check convention, provided an original-table serialization, or chose one of the 253 legitimate parity frames. GitHub matching array snippets were unrelated sequence data, map presets, and ordinary examples, not GF(29) encoders. This is a scoped search result, **not** a proof that no unindexed or unpublished implementation existed.

Source comparators that did **not** pass the exact gate:

- [H. Q. Dinh, *Repeated-root constacyclic codes of length 2p^s*, Finite Fields and Their Applications 18 (2012)](https://doi.org/10.1016/j.ffa.2011.07.003) establishes a family-level repeated-root construction; its indexed statement supplies neither this fixed GF(29) polynomial nor a 256-entry serialization.
- [H. Q. Dinh, *Structure of repeated-root constacyclic codes of length 3p^s and their duals*, Discrete Mathematics 313 (2013)](https://doi.org/10.1016/j.disc.2013.01.024) similarly classifies a general family without selecting this original-table instance.
- The 2010 [IETF RaptorQ draft](https://datatracker.ietf.org/doc/html/draft-ietf-rmt-bb-fec-raptorq-00) explicitly specifies arithmetic in **GF(256)** for byte symbols, not GF(29), and provides no matching fingerprint. Its prevalence in queries for `256` is an indexing false positive.
- Generic [2012 doctoral work on repeated-root codes](https://open.metu.edu.tr/handle/11511/22177) is a useful historical capability comparator, but the indexed abstract is a theory treatment without the required fingerprint or frame.

## Decision

The **exact-published-implementation route is presently unsupported**. Do not infer a source-specific message frame from the generic ability to generate any [256,252] GF(29) code. The p50 dual-factor equality remains a genuine mathematical relationship, and its causal application to LP2 remains open. A successor is warranted only for a contemporaneous archive containing the *same exact coefficient convention* and an independently documented page/table serializer or codeword layout. That would select an original-byte prediction, not merely an alternative mathematical description.

For exact source reconstruction, run the existing CommonJS `sims/lp2_grid_hg_code_structure_sft.cjs` unchanged. No extra cipher search or speculative decoder is introduced here.
