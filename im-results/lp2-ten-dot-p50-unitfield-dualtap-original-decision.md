# Ten-dot p49 clock and p50 bit0 two-tap GF29 inverse: source-conditioned negative

**22 November 2026; Agent1; Director #2255.** All 12,956 original unknown LP2 GP29 runes were run through one completely specified, lossless, table-keyed, changing-ciphertext-state inverse. The operation captures both original reported parity-conditioned lag1/lag5 repeat effects, but its resulting original-word plaintext is not language. A second **first-party, actually solved** control disproves the assertion that a ten-dot mark universally restarts a GP29 cipher key clock. There is no new unknown plaintext or authentic key.

## Author-visible input and the independent reset question

The original ink annotations expose **four red ten-dot signs**: physical p36 after local rune99, p38 after186, p49 after66 and **solved p56 after45** ([original ink inventory](../resources/liber-primus/lp2-ink-annotations.json)). At p49 the sign sits immediately before the complete printed 32×8, 256-cell two-character numeral panel spanning p49–51. The earlier [bit0/dual-echo study](lp2-p50-bit0-dualecho-two-tap-original-gate.md) showed a statistically interesting parity association under the **global p0-origin phase zero**, selecting lag1 for even table cells and lag5 for odd cells. That association is a bounded retrospective observation, **not a first-party instruction or a decoder**, and the original dual-tap additive ciphertext inverse had already failed.

The new p49-specific question is where a **literal ten-dot-initiated clock** should start. Original p49 contains 66 GP runes and ends after **global GP rune 12,114**, whose 256-phase is **82**, not zero. To make the first following p51 rune use p50 cell0, a globally continued phase needs **shift174** modulo256. The old correlation was strongest for the whole-book phase0, not the ten-dot-initiated phase. This difference is *source-caused*, not a phase optimized after seeing English.

The independently solved p56 provides an unusually strong first-party negative control on the universal reset interpretation. It has a red ten-dot **after exactly 45 ciphertext runes**. The authenticated phi(prime)−1 GP29 decoder with its single source plaintext-F bypass at local rune56 **continues** its prime ordinal across that sign. The entire 85-rune cipher decodes exactly to all **91 letters** of the previously published `AN END … IT IS THE DUTY …` clear prose and forward-re-encrypts to the original exact glyphs. Artificially restarting the same key at this **ten-dot mark** gives only **3 of the next40 GP runes** correct, beginning `R NG AE O B G P …` instead of the authentic `I T I S TH E D U …`. All four red ten-dot source sites, the original solved cipher and the explicit competing reset are asserted in [the independent positive/negative SFT](../sims/lp2_tendot_p56_authentic_keyclock_source_gate.cjs), [successful GH Actions 45021800662](https://github.com/FlareZ123/liber-primus/actions/runs/45021800662).

**Consequence:** ten-dot is at least sometimes structural punctuation **without a prime-totient key restart**. This original-source control cannot exclude some unique p49-specific clock operation, but it invalidates a global rule equating every ten-dot with an unspecified cipher-clock reset.

## A different, fully specified changing-state inverse

The new model uses a **multiplicative field-unit, cumulative ciphertext step** rather than the previously failed direct two-tap additive offset. The bit0 evidence supplies the branch, the visible 256-cell table supplies the only changing key, and the 29 GP symbols supply the field size. For original rune g and its preceding printed table byte `B[(g−1+s) mod256]`, set `d=1` for even B, `d=5` for odd B; `K=(B mod28)+1` (nonzero unit in GF29); use source key shift `s=0` globally or `s=174` at the literal p49 marker. The two fixed signs `ε∈{−1,+1}` are the only remaining convention.

`P[g] = (ε × (C[g]−C[g−d]) × inv(K) −1) mod29`, with pre-book ciphertext initialized to0. Its forward operation is `C[g]=C[g−d]+ε×K×(P[g]+1) mod29`. The GP rune EA (index28) maps to a zero step. The ciphertext-feedback lag makes this a legitimate fully reversible changing-state stream mechanism with no fitted key, arbitrary alphabet or word resegmentation. The exact odd/even branch tries to account causally for the two different repeats. Unlike an independently guessed table, all 256 source byte values are consumed in order, and the nonzero-field mapping requires no secret.

**Results on every original rune and every complete printed word**:

| Full source variant | Original GP29 IoC | Recovered EA | Genuine one-rune printed words decoding to A or I |
| --- | ---: | ---: | ---: |
| Whole-book clock, ε=−1 | 0.03464600 | 288 | **6/83** |
| Whole-book clock, ε=+1 | 0.03464600 | 288 | **5/83** |
| Ten-dot-origin clock, ε=−1 | 0.03469379 | 268 | **4/83** |
| Ten-dot-origin clock, ε=+1 | 0.03469379 | 268 | **7/83** |

The authentic p57 GP29 clear source repeated over the original length has IoC **0.07248**, demonstrating the contrast with the random-like original outputs. Across all four inverse models, **at least 76 of 83 complete original one-rune words fail even the elementary English A/I condition** while preserving those original word cuts. Full original plaintext previews are incoherent. Each candidate exactly forward-reencrypts **12,956/12,956** original ciphertext symbols; each simultaneously passes independent **12,956-rune** encrypt/decrypt plants made from authentic solved p57, including changing ciphertext-feedback state. Thus the failure is in the proposed source meaning, not the invertibility implementation.

The complete [original-cipher CJS SFT](../sims/lp2_p50_bit0_fieldunit_dualtap_original_sft.cjs) ran successfully in [GitHub Actions 45022023550](https://github.com/FlareZ123/liber-primus/actions/runs/45022023550). It checks original exact page/word counts, table size, source ten-dot global-offset phase, the two fixed shifts, finite GF29 inverses, all singleton word locations, full original replay and solved source positive.

## Decision

The 256-byte parity correlation remains a conditional source observation without an author-written consuming operation. The original p49 ten-dot marks the panel transition but **does not start the original strongest correlated global phase**, and another authenticated ten-dot at p56 demonstrably does not restart the actually solved cipher. The single source-complete evolving unit-field receiver derived here fails directly on all original printed words, under both literal clock choices and conventional signs. Do **not** add further phases, arbitrary plaintext exponents or custom forbidden runes to rescue this original failure.

A p49-specific typed instruction naming key order, reset and emission operation would reopen the route. No independent source identifies such a machine; unknown plaintext, private key and intended destination remain unrecovered.
