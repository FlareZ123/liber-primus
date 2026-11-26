# Nonlinear plaintext-driven Fibonacci-prime phase inverse

## Decision

Zero original fit candidates by the sixth of ten native singleton sites in p16–18. Both independently keyed native controls recover their exact initial phase and configuration and all 944 withheld runes. The specified nonlinear phase family fails conditional on the A/I/O native singleton grammar; no original plaintext or key.

## Mechanism

Distinct from the fixed phase advance of [the affine orbit inverse](lp2-p15-fibprime-orbit-rank28-affine.md) and the two-state modulo28 feedback recurrence. Reconstruct all 16 original p15 numeric cells exactly, extend the Fibonacci recurrence modulo 3301 (period 1650), and define D[t] as either signed or absolute distance of the (F[t]+1)-th prime from 3301. This extension and the receiver are hypothesized, not independently selected by the source.

Use the same rank28 predecessor exclusion receiver: first rune public, equal ciphertext pair denotes fixed e, nonrepeat ciphertext rank is cyclic difference minus one, GF29 log15, or sorted rank excluding preceding ciphertext. For nonrepeat, subtract +/- D[t] modulo28 and unrank excluding e. Instead of t'=t+1, advance the phase modulo1650 by either the decoded rune's one-based ordinal or its canonical GP prime weight. Equal pair either holds or advances by the same escape rune's stride. This state update is nonlinear in the received stream and can be inverted sequentially without a latent clock. Every initial phase, 29 escape symbols, 3 rank transports, 2 signs, 2 distance maps, 2 advance laws, 2 escape conventions: 2,296,800 parameter tuples. No unknown affine offsets or adaptive retuning. Precompute deterministic transition table by rank and current phase; eliminate candidates at each fit singleton. Rank survivors with training-only smoothed trigram log-likelihood trained on Shakespeare; freeze configuration for p19–22.

## Executed results

| Dataset | Fit singletons | Candidates | Frozen holdout | Key |
|---|---:|---:|---:|---|
| Original p16–22 | 10 | 0 | none | none |
| Gibran, offset1400 | 15 | 1,118 | 944/944 | exact |
| Emerson, offset12400 | 10 | 63 | 944/944 | exact |

Original stage counts: 248,342; 36,410; 2,709; 80; 9; **0**. Fit 800 runes; holdout 944. Both controls reuse previously recorded donor windows, with new independent phase and receiver configuration. Exact forward replay for selected controls. Original held set not used for candidate elimination. This experiment does not exclude different strides, independent offsets, altered segmentation, or other source-key interpretations; do not expand this unsupported family merely to accumulate negatives.

## Reproduction

- [SFT](../sims/lp2_p15_fibprime_plainstride_rank28_sft.cjs)
- [Original](lp2-p15-fibprime-plainstride-original.json)
- [Gibran](lp2-p15-fibprime-plainstride-control-gibran.json)
- [Emerson](lp2-p15-fibprime-plainstride-control-emerson.json)

Executed the three core runs separately in V8; Node wrapper not separately run. Invoke the CommonJS SFT with argument `original`, `3`, or `4` for bounded runs.
