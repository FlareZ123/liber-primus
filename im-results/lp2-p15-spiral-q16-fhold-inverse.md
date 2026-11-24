# Fixed p15 square-spiral transposition plus period-16 latent-F additive inverse

**Agent 11, 24 November 2026.** No original unknown plaintext or key recovered. A finite constructive search rules down an explicit composed source-shaped operation rather than every transposition or period-16 key.

## Source hypothesis and missing selector

The [solved p15 numeric spiral](../results/lp2-p15-fibonacci-prime-spiral.md) fixes a concrete 4×4 traversal beginning at red 3299. The original physical p33–39 cuneiform chapter is 1,680 runes = 105×16. The earlier [unpermuted p15 prime-totient period-16 gate](../sims/lp2_p15_prime_totient_period16_cuneiform_ftransparent_gate.cjs) rejects all 32 phase/sign combinations with the authentic p56 plaintext-F hold. The separate p33 historical fourteen-column study uses a different route. Neither source establishes that p15's spiral is applied to the p33 rune text, but it gives an executable fixed geometric operation without searching arbitrary permutations.

The exact spiral visits zero-based row-major positions `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`. Test each of its two reciprocal block permutations on the entire original chapter, applied *after* additive encryption. The inverse restores the encrypted tape prior to literal-F handling. No padding, phase scan of the block route, page resets, or permutation fitting. The independent inverse permutation reconstructs the original 1,680 runes. The known source key is `[1,2,4,6,12,22,13,20,3,1,27,16,1,11,11,15]` (selected prime-minus-one residues in spiral order). Ciphertext F may be an encrypted non-F, whereas literal plaintext F emits F without consuming a key shift.

## Exact source-key reachability

| Original receiver | Phase/sign pairs | Full legal inverses | Longest legal prefix (runes) |
|---|---:|---:|---:|
| Printed (prior baseline) | 32 | 0 | 113 |
| Read each 4×4 block in spiral order | 32 | 0 | 172 |
| Write each 4×4 block in spiral order | 32 | 0 | 118 |

The 64 newly routed combinations are mathematically impossible under the fixed key and exact latent clock. No language score or fixed F mask is used. If the transposition precedes encryption instead, this same fixed source key still has zero legal histories, because its reachability is on the original printed ciphertext (the baseline row). Unknown-key, pre-encryption transposition is not tested by the constructive search below.

## Constructive arbitrary-key transfer

Reuse the already calibrated soft-phase EM, finite hardening and fixed-key trigram refinement from [the primitive-period solver](../sims/lp2_latent_f_soft_phase_primitive_gate_sft.cjs), with fixed q=16 and 12 deterministic starts. Use native solved-source trigram model; the two independent literary controls are 1,680-rune slices starting at native rune 5000 of pinned Gibran and Shakespeare, with arbitrary planted q16 keys, one each reciprocal route. A fresh independent-pad null is Gibran starting at rune 9000. The known-key source check does not select the parameters of the unknown-key run.

Fit first 1,120 unspiraled ciphertext runes, split 728/190/202 (train/development/internal holdout). The soft and hardened holdout likelihood must each exceed the uniform-shift baseline by at least 0.1 nats/rune. If the soft gate fails, hardening is skipped since it cannot affect acceptance. For an accepted key, decode the untouched 560-rune outer continuation under the frozen key and report forward likelihood plus exact forward replay. The route itself is fixed before examining ciphertext. Controls use precisely the same inference procedure; the language model contains only earlier solved source, not the literary plant text or unknown LP2.

| Run | Exact effective key | Outer heldout native runes | Outer log-likelihood gain (nats/rune) |
|---|---|---:|---:|
| Gibran, first route | 16/16 | 558/560 | +0.3836233857 |
| Shakespeare, reciprocal route | 16/16 | 555/560 | +0.3791684262 |
| Independent pad | rejected | not decoded | internal gain −0.0292743117 |

Both independent plants pass the declared ≥98% outer decoding criterion and exact replay. The original scores:

| Original inverse route | Internal soft holdout gain | Mean phase confidence | Accepted hard key |
|---|---:|---:|---|
| Read spiral | −0.0208704151 | 0.2941757929 | none (soft gate failed) |
| Write spiral | −0.0003620862 | 0.27643649696 | none (soft gate failed) |

Neither reaches the 0.1 gain requirement; **the remaining 560 original runes were not scored or used for key fitting**. This is a finite-budget predictive failure, not an all-key proof. The two native controls demonstrate useful key recovery but cannot establish universal reliability. The independent-pad null is only one control. A preliminary all-key chunk-domain DFS was stopped at 10,000,001 visits on each orientation; the explored branches admit nonidentity keys, so no all-key feasibility exclusion follows and its partial counts are not used as evidence. No source-selected route or plaintext was identified.

## Reproduction and decision

[Executed Node/CommonJS SFT](../sims/lp2_p15_spiral_q16_fhold_inverse_sft.cjs) · [Complete actual output](lp2-p15-spiral-q16-fhold-inverse-output.json). Run from repository root with Node.js 22. Actual computations executed on fetched canonical inputs in connected V8, no Windows CI execution claimed. The initial control-only execution was repeated by the final complete run to capture a single reproducible output; the final code skips hardening on logically pre-rejected soft candidates. The exact fixed-key test repeats the published baseline only as a narrow comparison; its two new transposition receivers are independent of the earlier fourteen-column operation.

Retire the specified post-encryption p15 square spiral + fixed Fibonacci-prime key route exactly, and the bounded blind q16 transfer as tested. Do not reopen using phase, orientation, or restart tuning without a genuinely independent selector. Unknown-key pre-encryption transposition, altered clocks, and other mechanisms remain outside the finite predictive result; none is established by this work. All 56 unknown physical pages remain unsolved.
