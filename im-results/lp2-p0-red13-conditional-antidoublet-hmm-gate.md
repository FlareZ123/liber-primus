# LP2 p0 conditional 13-key anti-doublet redraw: exact source-crib failure

**Agent8, 22 November 2026. Classification: finite, source-conditional original-cipher negative. No previously unknown LP2 plaintext, authentic key, cipher operation, or final destination recovered.**

## Intended route and unsupported premise

Original LP2 physical p0 (archive scan `17.jpg`) prints a red 8+5-rune opening and a visibly separate body. The signed 2016 Cicada text contains the words `EPIPHANY` and `SEEKS`; their 13 source-native GP symbols supply a *conditional* literal title crib. The exact additive GP29 key forced by this crib against the original first 13 cipher runes is

`[26,24,8,19,27,24,18,3,0,8,0,16,19]`.

Earlier [direct period-13 reuse](../sims/lp2_p0_red13_fullpage_cyclic_key_sft.cjs) fails on p0's untouched 249-rune black body. The genuinely distinct hypothesis here is a **conditional extra key-clock advance**: before emitting a cipher symbol, if it would duplicate the preceding emitted cipher symbol, reject that key position with probability 80% and emit once using the *next* key position. Otherwise emit the candidate directly. The first 13 red source symbols use the fixed crib key, and the 249 remaining original source symbols begin at phase0 of that same key. The visible 13-token red heading motivates period13; the **redraw rule and its probability are not selected by original authors**, so the result tests a specified cipher alternative, rather than a recovered mechanism.

## Exact fully specified source-positive encoder and inverse likelihood

The native GP29 text control honors solved source orthography `ING→ᛝ` and `IO→ᛡ`; the trained symbol frequencies come from the original repository's Gibran control with additive 0.5 smoothing. All `29` rune classes are retained. With `q` the hidden 13-key phase, `c_{i-1}` the previous printed original ciphertext and `p_i` a GP29 plaintext value, the encoder first proposes `c'=(p_i+K_q) mod29`.

If `c'≠c_{i-1}`, it emits `c'` and advances phase once. If equality holds, it emits `c'` with probability `β=0.2` and advances once, or rejects `K_q`, emits `(p_i+K_{q+1}) mod29` and advances twice. The second proposal is emitted even if it repeats; no unbounded skips or fitted per-rune decisions are permitted.

The 13-state forward algorithm sums **all** hidden one-advance/two-advance paths on each exact original ciphertext rune, with no inferred resets, secret-key fitting, or added payload content. Let `f(p)` denote the Gibran source-native GP unigram probabilities. A normal transition `q→q+1` has emission weight `f((c-K_q) mod29)`, reduced by `β` when `c=c_{i-1}`. An extra-advance transition `q→q+2` exists only when `c=(c_{i-1}+K_{q+1}-K_q) mod29`, with weight `(1-β) f((c_{i-1}-K_q) mod29)`. Per-position normalization yields the exact negative log likelihood of the 249 untouched body symbols, conditional on the 13 fixed red title positions.

## Original outcome and 90 genuinely readable controls

**Original p0 body:** negative log likelihood **3.9900689993030616 nats per rune** for β0.2. The full p0 source has **262 original runes and two source adjacent doublets**. No original ciphertext symbols were changed. Freezing the same key and source frequency model while varying β yields 3.9935741502540334 at β0.05; 4.003051555108622 at β0.5; and 4.310588681522012 at β1.0 (never redraw).

For a falsifiable positive control, sample **45** nonoverlapping source-native 249-rune Gibran passages and **45** Shakespeare passages, graft each after the exact same 13 red-title ciphertext runes, and encrypt with the *same* forced source-crib key, no tuning. Use deterministic LCG seed3301, the original 13-rune clock origin, and the specified duplicate-redraw policy. Every original-reading English plant is **exactly re-encrypted** from its saved hidden phase/skip path and decoded by the complete forward likelihood algorithm. The 90 positive controls have negative log likelihood **2.9012850933126173–3.088383380911182**, with median **2.9778507516716**. Their best-to-worst source range misses the original by at least **0.9016856183918796 nats per rune**. Gibran and Shakespeare controls both have adequate native GP spellings and genuine English letter rates; this difference is much larger than the observed variation between their original-length plants. The argument conditions on this named source corpus and exact model; it is not a universal probability statement about all conceivable GP plaintext registers.

**Decision:** this reproducible anti-doublet key-skip consumer is strongly inconsistent with the original p0 under the 2016 `EPIPHANY SEEKS` crib and a 13-symbol periodic additive key. Retire the original full-page direct period13 and this repeat-redraw variant rather than fitting more red-title exceptions. Other, independently sourced keys, clocks, ciphers, hidden-state mechanisms or non-English registers are untouched. The red title remains undeciphered.

**Reproduce:** [standalone Node22/CommonJS source-original SFT](../sims/lp2_p0_red13_conditional_antidoublet_hmm_sft.cjs), [Windows Actions PASS 44974269341](https://github.com/FlareZ123/liber-primus/actions/runs/44974269341). The script prints the frozen key, all β sensitivity values, 90 planted control summary statistics, and asserts a complete positive source-path replay, exact original corpus length, doublet count and its outcome.
