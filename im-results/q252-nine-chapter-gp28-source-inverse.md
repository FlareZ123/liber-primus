# Q252 nine-chapter GP28 no-repeat inverse: one complete original-input exclusion

**Status:** bounded negative original-cipher test, Agent 28, 12 November 2026. No new LP2 plaintext, authentic key or destination. This report retires **one frozen source-shaped combined mechanism**, rather than a family of changed phases or substitutions.

## Plausible original solve path and assumptions

The original numerical grid on physical pp49–51 has 256 two-character cells in 32×8 rows. Under the conventional but **unverified** base60 alphabet, their ordinal residues mod29 form a 256-coefficient polynomial. The independently visible 2013 BASE29(3301) numeral `3QO` supplies digits `[3,26,24]`; the original p39 red triple supplies GP ordinals `[27,5,15]`. Under the previously documented descending-polynomial orientation **reversing both triples**, their GF29 product is `F=[12,17,11,21,23]`. Dividing the 256 residues by this exact factor leaves zero remainder and **252 quotient symbols**.

The original book has nine visually/typographically identified unsolved chapters. The equality **252=9×28** suggests one 28-position key per chapter. Independently, the original 12,956-rune ciphertext has only **86** immediate equal-rune transitions, motivating a GP28 transport that excludes the preceding ciphertext symbol, with a special escape for the 29th symbol. This combines several source observations, yet the manuscript does **not** instruct a player to perform GF29 polynomial division, split the quotient in 28s, or apply a predecessor-exclusion cipher. Treat the following as an exploratory *complete reversible construction*, never a demonstrated authorial codec.

## Fully frozen decoder and original result

The physical chapter intervals are `[0–2],[3–7],[8–14],[15–22],[23–26],[27–32],[33–39],[40–53],[54–55]`, with corresponding rune lengths **[729,1145,1729,1903,1021,1433,1680,3008,308]**. For chapter `j=0..8`, take the `j`th 28-entry block of descending source quotient `Q`; set `k_i=Q[28j+(i−1 mod28)] mod28`. Preserve the first source rune unchanged as leader. For each subsequent GP29 ciphertext index `c_i`, with previous `c_(i−1)`:

- `d_i=(c_i−c_(i−1)) mod29`;
- if `d_i=0`, decode to GP index **28 (EA)**, a reserved escape;
- otherwise decode `p_i=(d_i−1−k_i) mod28`, in original GP ordinal order **0..27**.

The forward rule is exact: `c_i=c_(i−1)` for plaintext GP28; otherwise `c_i=(c_(i−1)+1+(p_i+k_i mod28)) mod29`. Key position starts at zero immediately after each chapter leader; keep original page/runic positions and chapter boundaries. There are **no fitted phases, signs, punctuation relabelings, local word resets, or hidden key variables**.

The original readout's GP index of coincidence is **0.03530657** over all **12,956** symbols, versus **0.03447840** for the original ciphertext and **0.06270997** for the native solved p57 text. All nine chapter readouts individually lie between **0.03506942 and 0.03595753**. The output begins `S NG AE R TH I I G NG L L N D H F H AE A B L TH O G A E C W X E G G B...`, with no coherent native-GP prose. Exactly **86** source doublets map to **86** EA escape characters. The candidate fails to recover native GP text; do not reinterpret the random-looking output as meaningful plaintext or rescan 28-way permutations.

The complete inverse and forward replay reproduce **12,956/12,956** original source symbols exactly, which validates reversibility but offers no support for correct keys. A separate **12,956-rune** native-GP solved-p57-derived positive plant, with periodic explicit EA escape symbols, also recovers **12,956/12,956** symbols and reencrypts bit-for-bit. Decoding this same plant with the *next* chapter's 28-element quotient key instead changes **12,594/12,956** symbols. The source polynomial remainder is exactly four zeros. These controls demonstrate that the implementation can recover natural GP when the hypothesis is true, and that the chosen Q is operational in the cipher, while the original result remains random-like.


## Key-independent extension: 252 arbitrary secret chapter/phase codebooks

A stronger test eliminates dependence on the exact quotient-key values. Preserve the nine originally printed chapter boundaries, the predecessor-difference readout, the 86 original zero-step exception symbols and the chapter-local 28-position clock. Now give **each of nine chapters and each of its 28 phases a different arbitrary secret permutation of all 28 non-EA symbols**. These **252 independently unknown codebooks** could contain any of 28! bijections each.

Within-chapter/within-phase equal-rank collisions are invariant under every such bijection. The **12,861 original eligible nonzero cipher steps**, partitioned into the 252 source-prescribed bins, give **29,136 equal outcomes among 815,506 ordered pairs**, invariant IoC **0.03572751151**. The same exact original mask and 9×28 phase bins in five fixed Shakespeare native-GP controls yield **0.05859920–0.06182419**; five fixed Gibran controls give **0.05951642–0.06189777**. We use original GP greedy transliteration and the explicit 28-way register convention **EA → IA**; no other letters are folded. The control samples contain **47,788–50,478** equal outcomes for the same 815,506 ordered pairs.

A seeded native-GP positive plant assigns **252 distinct independent 28-symbol permutations**, preserves every original zero-step exception and decodes **12,947 of 12,947** original nonleader symbols exactly (12,861 other positions plus 86 exceptions). The planted cipher retains its same-bin collision invariant. Decoding the plant with deliberately shifted chapter key maps changes more than 11,500 eligible runes. This rules out an implementation artifact and establishes that the test would expose strong native GP-English symbol concentration under the modeled secret substitutions.

**Expanded decision:** the complete **nine-chapter × 28-phase stationary 28-symbol bijection** family is incompatible with these fixed native GP-English controls, regardless of the unknown per-phase key values. The result is conditional on the original source chapters, the frozen clock, the fixed 86 exceptions and the tested native register. It does not constrain a non-GP plaintext register, an evolving key, reversible insertion/deletion or dynamically varying codebooks. No unknown LP2 plaintext or authentic key was recovered. Reproduce with [the independent all-secret SFT](../sims/q252_nine_chapter_gp28_allsecret_sft.cjs), alongside the frozen Q252-key SFT above.

## Decision and scope

This complete source-shaped **Q252 / nine-chapter periodic GP28 cyclic-rank** consumer is rejected as a direct native-GP plaintext recovery. Its fixed source key and reversible treatment of rare doublets were fully exercised on all unresolved rune-bearing pages. The negative does not exclude unselected no-repeat encoders, other plaintext registers, nonperiodic key schedules, source-keyed maps acting on word boundaries, or a different correct historical interpretation of the numerical grid. A successor would need an *independent original instruction selecting a different register/clock*, rather than merely changing this failed model's key convention.

**Exact self-contained CommonJS reproduction:** [`sims/q252_nine_chapter_gp28_sft.cjs`](../sims/q252_nine_chapter_gp28_sft.cjs), reading [original LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [conventional grid encoding](../resources/liber-primus/base60-grid.json). The historical factor/quotient premise and its other excluded direct consumers are documented in [p50/p39/p3 field remainder](p50-p39-p3-field-remainder.md). Execute the SFT from the repository root with `node sims/q252_nine_chapter_gp28_sft.cjs`.
