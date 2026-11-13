# The solved AN END heading completes the speculative 81² → 80² bookend geometry: a source-known five-rune stencil inverse

**Evidence classification (Agent 22, 13 November 2026):** new executed original-input known-plaintext inverse and held-out terminal test, both **negative**. No previously unsolved LP2 plaintext, author-selected key, cipher or destination recovered. [Passing manual original-source SFT run 43369713939](https://github.com/FlareZ123/liber-primus/actions/runs/43369713939), [complete CommonJS source](../sims/lp2_bookend_p56_fivecrib_stencil_sft.cjs).

## What the source contributes before a key is fitted

The 12,956 unknown original LP2 runes end in the complete repeated two-word ciphertext `DJU BEI`. Its other occurrence ends at global rune position 6,560 (zero-based). Thus the original stream has a direct, retrospective block split after **6,561 = 81²** runes, with **6,395** unknown runes remaining. Independently, the immediately subsequent physical p56 has a solved five-rune plaintext heading **AN END**, with actual GP29 indices **[24,9,18,9,23]**, original p56 ciphertext **[25,11,22,15,4]** and known prime-totient shifts **[1,2,4,6,10]**. Appending *exactly those five original encrypted glyphs* to the 6,395 unknown symbols yields **6,400 = 80²** cells. Earlier 81/80-square work treated the five missing cells as unknown or inserted the separate five pp36–38 printed paragraph numbers inside the grid; the five authentic **solved** terminal symbols make a different, exact potential key-identification test.

A possible human interpretation is that the 81×81 earlier array supplies a one-cell-border source for a corresponding 80×80 stencil, and the already solved p56 opening supplies five known plaintext/ciphertext equations. Neither the p27/p55 `DJU BEI` echo nor original Cicada instructions establish that such a 2D map is intended. Physical page boundaries, chapter boundaries, punctuation and word breaks are ignored *only in this explicitly stated model*. In particular p56 independently uses prime-totient encryption, which is a serious objection to treating the p55→p56 seam as a single cipher stream.

## Frozen mathematically invertible tests

Let `S` be the first 6,561 original GP29 indices, arranged as an 81×81 row-major matrix. Let `T` be the following 6,395 ciphertext indices followed by the first five original p56 ciphertext symbols, arranged as 80×80 row-major cells. At each output position, take the 2×2 adjoining source corner `(s00,s10,s01,s11)`, allowing all eight orientations (two reflections and transpose), with **no source-symbol alteration, page-specific key or fitted phase**.

**Direct mixed Möbius stencil.** The solved LP1's explicit `MOBIUS` clue motivates the simplest 2D finite difference `D=s00−s10−s01+s11 (mod29)`. Evaluate `P=T±D` for each of eight orientations on the 6,395 unknown outputs. This tests 16 complete reversible maps with no fitted coefficients.

**Five-known-rune affine stencil.** A somewhat broader five-parameter alternative has `K=a·s00+b·s10+c·s01+d·s11+e (mod29)`. The known five p56 plaintext values permit **exactly five linear equations for these five unknown coefficients** with either `C=P+K` or `C=K−P`; solve each orientation by Gaussian elimination over GF(29), using only the five known p56 symbols. Freeze the resulting coefficients and invert the **entire 6,395-symbol untouched unknown T prefix**. Two of the 16 attempted systems are singular; 14 have a unique source-determined coefficient vector. Exact recovery of the known five-runic p56 heading is guaranteed algebraically, so it is an input constraint rather than a successful withheld test.

**Independent ciphertext-only six-symbol prediction.** Without using known plaintext, fit that same five-parameter 2×2 stencil on the first five original `DJU BEI` tail symbols in T (positions 6,389–6,393), then predict **six truly withheld** contiguous original symbols: the final `I` of the repeated phrase plus the first five p56 ciphertext runes. Test each orientation with no refit.

## Exact original-input outcomes

| Test | Count | Best source result | Genuine GP prose control |
| --- | ---: | --- | --- |
| 2D Möbius ± difference | 16 reversible inverses | Best GP29 IoC **0.03454920** (orientation 2, positive difference) | 34 independent contiguous 6,395-rune Shakespeare source windows: minimum **0.05810500** |
| Five-known-rune affine reconstruction | 14 full-rank of 16 cases | Best GP29 IoC **0.03456920**, orientation 6, `C=K−P`, coefficients **[3,22,22,0,21]** | All **14** independent GP-source planted known-heading inverses recovered **6,400/6,400** symbols each; the planted 6,395-rune authentic GP body has IoC **0.06071094** |
| Terminal ciphertext-only six-symbol prediction | 8 unique affine fits | **0 or 1 of 6** withheld original ciphertext symbols correct per orientation | Exact solve on five preceding symbols; heldout prediction is not a re-encryption tautology |

The absolute best original IoC over the first two families is below every source-native Shakespeare 6,395-rune window by **more than 0.0235**, a gap far beyond rounding. Decoded prefixes in every orientation are nonlinguistic. The ciphertext-only bridge has no convincing withheld predictive power (a perfect deterministic stencil would need all six original symbols to agree). A simple five-equation secret-affine-parameter explanation of the putative square link is therefore rejected for native GP-English and these original arrangements. The freely specified five coefficients do **not** rescue the link when the only allowed information for fitting is the independently solved heading.

## Decision and reproducibility

Do **not** promote the numerical identities `6561+6395+5=81²+80²` to an authenticated square-cipher instruction; 6561 is selected retrospectively from the unusual duplicated phrase, and the transition crosses different established cipher states. Do **not** rerun this same geometry with more affine key fits, synthetic stencil families or arbitrary missing cells in response to the observed negative. A future return would require a distinct original instruction selecting a genuinely different, fully specified operation, plus an unknown-cipher prediction.

Reproduce locally with `node sims/lp2_bookend_p56_fivecrib_stencil_sft.cjs` on Node.js 22; the SFT asserts source lengths, exact bookend, solved p56 heading and totient shifts, preserves all 6,395 unknown glyphs, tests both cipher signs and all eight orientations, verifies each recovered key on planted source-GP plaintext, and emits complete original-case coefficients and ciphertext-only six-rune predictions. The [successful GitHub Actions run 43369713939](https://github.com/FlareZ123/liber-primus/actions/runs/43369713939) executed this exact checked-in code. No probabilistic run-specific claims are used.

**Relationship to prior work:** This is a distinct known-plaintext completion of the already documented source-square hypothesis in [the repeated-wordpair investigation](lp2-repeated-wordpair-structure.md) and [the prior five-*ordinal* insertion test](../sims/lp2_bookend_80grid_five_ordinals_sft.cjs). It does not overturn the existing negative Fourier/separable-pad and general stencil invariants.
